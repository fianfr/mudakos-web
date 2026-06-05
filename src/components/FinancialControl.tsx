import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Plus, 
  Trash2, 
  PlusCircle, 
  Calculator,
  Grid,
  CheckCircle,
  PiggyBank
} from 'lucide-react';
import { Room, Transaction, WageConfig, Property } from '../types';

interface FinancialControlProps {
  rooms: Room[];
  transactions: Transaction[];
  properties: Property[];
  selectedPropertyId: string;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  wageConfig: WageConfig;
  onUpdateWageConfig: (config: WageConfig) => void;
}

export default function FinancialControl({ 
  rooms, 
  transactions, 
  properties,
  selectedPropertyId,
  onAddTransaction, 
  onDeleteTransaction,
  wageConfig,
  onUpdateWageConfig 
}: FinancialControlProps) {
  
  // Tab within financial control: 'ledger' or 'payroll'
  const [subTab, setSubTab] = useState<'ledger' | 'payroll'>('ledger');
  
  // Transaction Form States
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Room Rent');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [txPropertyId, setTxPropertyId] = useState('');

  useEffect(() => {
    if (selectedPropertyId !== 'all') {
      setTxPropertyId(selectedPropertyId);
    } else if (properties.length > 0) {
      setTxPropertyId(properties[0].id);
    }
  }, [selectedPropertyId, properties]);
  
  // Wage Calculation values
  const activeRoomsCount = rooms.filter(r => r.status === 'occupied').length;
  const calculatedWage = wageConfig.baseSalary + (wageConfig.bonusPerRoom * activeRoomsCount);
  
  // Wage Config Inputs
  const [baseInput, setBaseInput] = useState(wageConfig.baseSalary);
  const [bonusInput, setBonusInput] = useState(wageConfig.bonusPerRoom);
  const [showWageSavedMsg, setShowWageSavedMsg] = useState(false);

  // Financial Summations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWagesPaid = transactions
    .filter(t => t.type === 'wage')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense - totalWagesPaid;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    onAddTransaction({
      type,
      category,
      amount: Number(amount),
      date,
      description,
      propertyId: txPropertyId || (properties[0]?.id || '')
    });

    // Reset Form
    setAmount('');
    setDescription('');
    if (type === 'income') {
      setCategory('Room Rent');
    } else {
      setCategory('Utilities');
    }
  };

  const saveWageConfiguration = () => {
    onUpdateWageConfig({
      baseSalary: Number(baseInput),
      bonusPerRoom: Number(bonusInput)
    });
    setShowWageSavedMsg(true);
    setTimeout(() => setShowWageSavedMsg(false), 3000);
  };

  const handlePayoutAdmin = () => {
    onAddTransaction({
      type: 'wage',
      category: 'Admin Wage',
      amount: calculatedWage,
      date: new Date().toISOString().split('T')[0],
      description: `Payroll: Admin basic salary (IDR ${wageConfig.baseSalary.toLocaleString()}) + bonus commission for ${activeRoomsCount} active rooms`,
      propertyId: selectedPropertyId !== 'all' ? selectedPropertyId : (properties[0]?.id || '')
    });
    alert('Admin wages has been successfully computed and logged to your expense ledger!');
  };

  // Simple SVG chart values generator
  const maxAmountForChart = Math.max(totalIncome, totalExpense || 1, 10000000);
  const incomeHeight = (totalIncome / maxAmountForChart) * 120;
  const expenseHeight = (totalExpense / maxAmountForChart) * 120;
  const wageHeight = (totalWagesPaid / maxAmountForChart) * 120;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-soft-850">Financial Control</h2>
          <p className="text-sm text-soft-500 mt-1">
            Analyze, report, and monitor asset cashflow and property admin payroll.
          </p>
        </div>
        
        {/* Toggle navigation for sub-sections */}
        <div className="inline-flex rounded-lg bg-soft-105 p-1 border border-soft-200 bg-soft-100">
          <button
            onClick={() => setSubTab('ledger')}
            className={`px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
              subTab === 'ledger'
                ? 'bg-white text-soft-900 shadow-xs'
                : 'text-soft-500 hover:text-soft-900'
            }`}
          >
            Transaction Ledger
          </button>
          <button
            onClick={() => setSubTab('payroll')}
            className={`px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
              subTab === 'payroll'
                ? 'bg-white text-soft-900 shadow-xs'
                : 'text-soft-500 hover:text-soft-900'
            }`}
          >
            Admin Wages Calculator
          </button>
        </div>
      </div>

      {/* Grid of Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-soft-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-soft-500 uppercase tracking-wider">Total Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold font-mono text-soft-900">
              IDR {totalIncome.toLocaleString()}
            </h3>
            <p className="text-xs text-soft-450 mt-1">From rents & other yields</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-soft-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-soft-500 uppercase tracking-wider">Property Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold font-mono text-soft-900 font-medium">
              IDR {totalExpense.toLocaleString()}
            </h3>
            <p className="text-xs text-soft-450 mt-1">Utilities, repairs & booster ads</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-soft-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-soft-500 uppercase tracking-wider">Admin Wages Paid</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold font-mono text-soft-900">
              IDR {totalWagesPaid.toLocaleString()}
            </h3>
            <p className="text-xs text-soft-450 mt-1">Property assistant salaries</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-xs ${
          netBalance >= 0 
            ? 'bg-forest-50/50 border-forest-200 text-forest-900' 
            : 'bg-rose-50/40 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Profit margin</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              netBalance >= 0 ? 'bg-forest-100 text-forest-700' : 'bg-rose-150 text-rose-600'
            }`}>
              <PiggyBank className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl font-bold font-mono ${
              netBalance >= 0 ? 'text-forest-800' : 'text-rose-700'
            }`}>
              IDR {netBalance.toLocaleString()}
            </h3>
            <p className="text-xs opacity-75 mt-1">Healthy cash balance surplus</p>
          </div>
        </div>
      </div>

      {subTab === 'ledger' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Transaction form */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs">
            <h3 className="text-base font-display font-bold text-soft-800 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-forest-600" /> Log New Transaction
            </h3>
            
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Assign to Venue</label>
                <select
                  value={txPropertyId}
                  onChange={(e) => setTxPropertyId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 capitalize font-semibold text-soft-808"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategory('Room Rent'); }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer text-center border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white border-soft-200 text-soft-500'
                    }`}
                  >
                    Income (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategory('Utilities'); }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer text-center border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-white border-soft-200 text-soft-500'
                    }`}
                  >
                    Expense (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                >
                  {type === 'income' ? (
                    <>
                      <option value="Room Rent">Room Rent</option>
                      <option value="Deposit">Security Deposit</option>
                      <option value="Other Income">Other Revenue</option>
                    </>
                  ) : (
                    <>
                      <option value="Utilities">Utilities (WiFi, Electric, Water)</option>
                      <option value="Repairs">Renovation & Repairs</option>
                      <option value="Marketing">Marketing / Premium Listing</option>
                      <option value="Office">Office Inventory & cleaning</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Amount (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Description Note</label>
                <textarea
                  placeholder="e.g. Paid by Room 104 occupant"
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Record
              </button>
            </form>
          </div>

          {/* Ledger Table Log and SVG Graph */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cash Flow proportions SVG */}
            <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs">
              <h4 className="text-sm font-display font-bold text-soft-805 mb-4">Proportional Cashflow Breakdown</h4>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* SVG Column Bars */}
                <div className="flex-1 flex items-end justify-center gap-12 h-36 border-b border-soft-200 px-4 pb-1">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-emerald-600 font-mono">IDR {totalIncome.toLocaleString()}</span>
                    <div 
                      className="w-14 bg-emerald-300 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${Math.max(8, incomeHeight)}px` }}
                    />
                    <span className="text-xs font-medium text-emerald-700 mt-1">Income</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-rose-500 font-mono">IDR {totalExpense.toLocaleString()}</span>
                    <div 
                      className="w-14 bg-rose-300 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${Math.max(8, expenseHeight)}px` }}
                    />
                    <span className="text-xs font-medium text-rose-700 mt-1">Expenses</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-amber-600 font-mono">IDR {totalWagesPaid.toLocaleString()}</span>
                    <div 
                      className="w-14 bg-amber-400 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${Math.max(8, wageHeight)}px` }}
                    />
                    <span className="text-xs font-medium text-amber-700 mt-1">Wages</span>
                  </div>
                </div>
                
                {/* Text guide */}
                <div className="w-full md:w-56 text-xs text-soft-500 space-y-2">
                  <p className="leading-relaxed">
                    This visualization illustrates your income generation scale against costs and wages outlays.
                  </p>
                  <div className="h-0.5 bg-soft-100 my-2" />
                  <div className="flex justify-between">
                    <span>Active Rooms:</span>
                    <span className="font-bold text-soft-800">{activeRoomsCount} of {rooms.length} rooms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Profit margin:</span>
                    <span className="font-bold text-forest-700">
                      {totalIncome > 0 ? `${Math.round((netBalance / totalIncome) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* List log ledger */}
            <div className="bg-white rounded-2xl border border-soft-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-soft-100 flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-soft-800">Master Transaction History</h3>
                <span className="text-xs bg-soft-100 text-soft-650 px-2 py-0.5 rounded-full font-mono">{transactions.length} entries</span>
              </div>
              
              <div className="divide-y divide-soft-100 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-soft-400">
                    No transactions recorded file yet.
                  </div>
                ) : (
                  [...transactions].reverse().map((tx) => {
                    const txPropertyName = properties.find(p => p.id === tx.propertyId)?.name || 'General';
                    return (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-soft-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                            tx.type === 'income' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : tx.type === 'expense' 
                                ? 'bg-rose-50 text-rose-700' 
                                : 'bg-amber-50 text-amber-700'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-soft-850">{tx.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-soft-200 text-soft-700 px-2 py-0.5 rounded font-bold">{txPropertyName}</span>
                              <span className="text-[10px] bg-soft-100 text-soft-600 px-2 py-0.5 rounded font-semibold uppercase">{tx.category}</span>
                              <span className="text-[10px] text-soft-400 font-mono">{tx.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold font-mono ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-soft-800'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'} IDR {tx.amount.toLocaleString()}
                          </span>
                          
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 hover:bg-rose-50 rounded text-soft-350 hover:text-rose-500 cursor-pointer transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Admin wages payroll screen */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* dynamic wage calculator explanation config */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-soft-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-forest-600" /> Admin Payroll Strategy
              </h3>
              <p className="text-xs text-soft-500 mt-2 leading-relaxed">
                MudaKost encourages the <strong>Base salary + Incentives commission</strong> structure to motivate boarding house administrators. Administrators receive a fixed base, supplemented by bonuses contingent on room occupancy heights.
              </p>
            </div>

            <div className="p-4 bg-soft-50 rounded-xl border border-soft-150 space-y-4">
              <h4 className="text-xs font-semibold text-soft-800 uppercase tracking-wider">Payroll Multipliers Configuration</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-soft-500 mb-1">BASE SALARY (IDR / MONTH)</label>
                  <input
                    type="number"
                    value={baseInput}
                    onChange={(e) => setBaseInput(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-soft-500 mb-1">COMMISSION BONUS (IDR / OCCUPIED ROOM)</label>
                  <input
                    type="number"
                    value={bonusInput}
                    onChange={(e) => setBonusInput(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {showWageSavedMsg ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Multipliers saved successfully!
                  </span>
                ) : (
                  <span />
                )}
                
                <button
                  type="button"
                  onClick={saveWageConfiguration}
                  className="bg-soft-800 hover:bg-soft-905 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors cursor-pointer text-center bg-soft-900"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* live computations of payroll details */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-display font-bold text-soft-800 mb-2">Live Wage Computation</h3>
              <p className="text-xs text-soft-450">Calculated based on today's room occupational status.</p>
              
              <div className="h-0.5 bg-soft-100 my-4" />

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-soft-500">Base Salary:</span>
                  <span className="font-bold text-soft-850 font-mono">IDR {wageConfig.baseSalary.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-soft-500">Commission Bonus Multiplier:</span>
                  <span className="font-bold text-soft-850 font-mono">IDR {wageConfig.bonusPerRoom.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-soft-500">Total Occupied Rooms (Commissionable):</span>
                  <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded font-mono">
                    {activeRoomsCount} Rooms
                  </span>
                </div>

                <div className="h-px bg-dashed border-t border-soft-200 my-2" />

                <div className="flex justify-between items-center py-2 bg-soft-100/50 p-4 rounded-xl">
                  <span className="font-bold text-soft-900 uppercase tracking-wider text-[11px]">Total computed wage</span>
                  <span className="text-lg font-bold text-forest-800 font-mono">IDR {calculatedWage.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-soft-100">
              <button
                type="button"
                onClick={handlePayoutAdmin}
                className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-3 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Process & Log Admin Wage
              </button>
              <p className="text-[10px] text-center text-soft-400 mt-2">
                Clicking will record an official 'wage' expense transaction of IDR {calculatedWage.toLocaleString()} to safety.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
