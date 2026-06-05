import React, { useState } from 'react';
import { 
  ReceiptText, 
  Plus, 
  Trash2, 
  Printer, 
  Building, 
  Check, 
  Coins, 
  User, 
  Calendar, 
  Hash,
  Download,
  ShieldAlert
} from 'lucide-react';
import { Room, Tenant, PaymentReceipt } from '../types';

interface PaymentReceiptCreatorProps {
  rooms: Room[];
  tenants: Tenant[];
  receipts: PaymentReceipt[];
  onAddReceipt: (receipt: PaymentReceipt) => void;
  onDeleteReceipt: (id: string) => void;
  onLogIncomeTransaction: (amount: number, tenantName: string, roomNum: string, date: string, method: string) => void;
}

export default function PaymentReceiptCreator({
  rooms,
  tenants,
  receipts,
  onAddReceipt,
  onDeleteReceipt,
  onLogIncomeTransaction
}: PaymentReceiptCreatorProps) {
  
  // Selection or Custom input Toggle: 'register' vs 'custom'
  const [targetType, setTargetType] = useState<'roster' | 'manual'>('roster');
  
  // Form Inputs
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [manualTenantName, setManualTenantName] = useState('');
  const [manualRoomNumber, setManualRoomNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'e_wallet'>('bank_transfer');
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [adminSignatory, setAdminSignatory] = useState('Rini (Admin)');

  // Selected Active Receipt for layout print showcase
  const [activeReceiptToShow, setActiveReceiptToShow] = useState<PaymentReceipt | null>(receipts[0] || null);
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  // Auto-fill form when tenant selected
  const handleTenantSelectChange = (id: string) => {
    setSelectedTenantId(id);
    if (!id) return;

    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    const room = rooms.find(r => r.id === tenant.roomId);
    if (!room) return;

    setAmount(room.price.toString());
    setPeriodStart(tenant.rentStart);
    setPeriodEnd(tenant.rentUntil);
    setNotes(`Monthly rental payout for room ${room.number}`);
  };

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();

    let tenantName = '';
    let roomNum = '';
    let finalAmount = Number(amount);

    if (targetType === 'roster') {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (!tenant) return;
      tenantName = tenant.name;
      const room = rooms.find(r => r.id === tenant.roomId);
      roomNum = room ? room.number : 'N/A';
    } else {
      if (!manualTenantName || !manualRoomNumber) return;
      tenantName = manualTenantName;
      roomNum = manualRoomNumber;
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;

    // Generate Invoice ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = date.replace(/-/g, '');
    const receiptNumber = `MK-REC-${dateFormatted}-${randomSuffix}`;

    const newReceipt: PaymentReceipt = {
      id: `rec_${Date.now()}`,
      receiptNumber,
      tenantName,
      roomNumber: roomNum,
      amount: finalAmount,
      date,
      paymentMethod,
      rentPeriodStart: periodStart,
      rentPeriodEnd: periodEnd,
      notes: notes || "Rent paid details",
      adminName: adminSignatory
    };

    // 1. Save Receipt to list array
    onAddReceipt(newReceipt);

    // 2. Auto sync and log this amount into income transactions ledger!
    const paymentMethodLabel = paymentMethod === 'bank_transfer' ? 'Bank Transfer' : paymentMethod === 'e_wallet' ? 'E-Wallet' : 'Cash';
    onLogIncomeTransaction(finalAmount, tenantName, roomNum, date, paymentMethodLabel);

    // Set preview
    setActiveReceiptToShow(newReceipt);

    // Reset Inputs
    setSelectedTenantId('');
    setManualTenantName('');
    setManualRoomNumber('');
    setAmount('');
    setNotes('');

    // Trigger Success Indicator animation
    setShowSavedSuccess(true);
    setTimeout(() => setShowSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getMethodLabel = (method: 'bank_transfer' | 'cash' | 'e_wallet') => {
    switch(method) {
      case 'bank_transfer': return 'Bank Transfer (E-Banking)';
      case 'cash': return 'Cash Outright';
      case 'e_wallet': return 'E-Wallet (GoPay/OVO/Shopee)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-soft-850">Payment Receipts Hub</h2>
          <p className="text-sm text-soft-500 mt-1">
            Generate invoice receipts, print official payouts, and auto-sync records to your financial control ledger instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* receipt parameters entry forms panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit space-y-4">
          <h3 className="text-base font-display font-bold text-soft-800 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-forest-600" /> Draft New Receipt
          </h3>

          {/* Form input selection targets: from system roster vs manual entry */}
          <div className="flex p-0.5 bg-soft-100 border border-soft-200 rounded-lg text-xs font-semibold">
            <button
              onClick={() => { setTargetType('roster'); setSelectedTenantId(''); }}
              className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${
                targetType === 'roster' ? 'bg-white text-soft-900 shadow-xs' : 'text-soft-500'
              }`}
            >
              Select Registered Tenant
            </button>
            <button
              onClick={() => { setTargetType('manual'); setSelectedTenantId(''); }}
              className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${
                targetType === 'manual' ? 'bg-white text-soft-900 shadow-xs' : 'text-soft-500'
              }`}
            >
              Manual Custom Entry
            </button>
          </div>

          <form onSubmit={handleCreateReceipt} className="space-y-4">
            {targetType === 'roster' ? (
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Select Tenant</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantSelectChange(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(t => {
                    const r = rooms.find(room => room.id === t.roomId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} (Room {r ? r.number : "N/A"})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold text-[10px]">Tenant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andi Santoso"
                    value={manualTenantName}
                    onChange={(e) => setManualTenantName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold text-[10px]">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104"
                    value={manualRoomNumber}
                    onChange={(e) => setManualRoomNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Amount Received</label>
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
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Outright</option>
                  <option value="e_wallet">E-Wallet (OVO/GoPay)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Rent start period</label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Rent end period</label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Receipt Issue date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Authorized Signatory</label>
                <input
                  type="text"
                  required
                  value={adminSignatory}
                  onChange={(e) => setAdminSignatory(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Custom Notes / Memo</label>
              <input
                type="text"
                placeholder="e.g. Paid in full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              />
            </div>

            {showSavedSuccess ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                <Check className="w-4 h-4" /> Receipt registered & ledger synchronized!
              </span>
            ) : null}

            <button
              type="submit"
              className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create & Log Receipt
            </button>
          </form>
        </div>

        {/* receipt high-fidelity display and printed cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 p-1.5 bg-soft-100 border border-soft-200 rounded-xl overflow-x-auto max-w-full">
            {receipts.length === 0 ? (
              <span className="text-xs text-soft-450 p-2 font-light">No historical receipts tracked yet. Use the form to generate one.</span>
            ) : (
              receipts.map(rc => (
                <button
                  key={rc.id}
                  onClick={() => setActiveReceiptToShow(rc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all font-mono cursor-pointer ${
                    activeReceiptToShow?.id === rc.id
                      ? 'bg-forest-300 text-white shadow-xs'
                      : 'bg-white text-soft-600 hover:bg-soft-150 border border-soft-200'
                  }`}
                >
                  No: {rc.roomNumber} - {rc.tenantName.split(' ')[0]}
                </button>
              ))
            )}
          </div>

          {activeReceiptToShow ? (
            /* PRINTABLE CONTAINER CARD */
            <div className="bg-white rounded-2xl border border-soft-200 shadow-md overflow-hidden flex flex-col justify-between">
              {/* Receipt Body Canvas */}
              <div id="mudakost-receipt-printable-area" className="p-8 space-y-6 relative bg-white">
                
                {/* Paid Seal Stamp CSS Watermark Circle */}
                <div className="absolute right-12 top-28 w-28 h-28 border-4 border-dashed border-emerald-600/35 rounded-full flex flex-col items-center justify-center rotate-12 pointer-events-none select-none">
                  <span className="text-[10px] font-black tracking-widest text-emerald-600/35">MUDAKOST</span>
                  <span className="text-sm font-black text-emerald-600/40">PAID</span>
                  <span className="text-[9px] font-medium text-emerald-600/30">OFFICIAL SEAL</span>
                </div>

                {/* Header branding */}
                <div className="flex items-start justify-between border-b-2 border-forest-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-300 flex items-center justify-center text-white">
                      <Building className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-soft-905">MudaKost Group</h4>
                      <p className="text-[10px] text-soft-500 leading-tight">Boarding & Micro-Living Hub<br/>Jakarta, Indonesia • inquiries@mudakost.com</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h1 className="font-display font-black text-xl text-forest-750 uppercase tracking-tight">RECEIPT OF PAYMENT</h1>
                    <span className="text-xs text-soft-450 mt-1 font-mono block">Serial: {activeReceiptToShow.receiptNumber}</span>
                  </div>
                </div>

                {/* General transaction info ledger */}
                <div className="grid grid-cols-2 gap-6 text-xs pt-2">
                  <div className="space-y-1.5">
                    <span className="text-soft-450 block font-semibold text-[10px] uppercase">Received From:</span>
                    <p className="font-bold text-soft-900 text-sm">{activeReceiptToShow.tenantName}</p>
                    <p className="text-soft-500">Boarding Resident Room <strong className="font-mono text-soft-800">{activeReceiptToShow.roomNumber}</strong></p>
                  </div>

                  <div className="text-right space-y-1.5">
                    <div>
                      <span className="text-soft-450 block font-semibold text-[10px] uppercase">Payment Date:</span>
                      <strong className="font-mono text-soft-700">{activeReceiptToShow.date}</strong>
                    </div>
                    <div>
                      <span className="text-soft-450 block font-semibold text-[10px] uppercase">Cleared Via:</span>
                      <strong className="text-forest-700">{getMethodLabel(activeReceiptToShow.paymentMethod)}</strong>
                    </div>
                  </div>
                </div>

                {/* Ledger rent calculations itemization table */}
                <div className="border border-soft-200 rounded-xl overflow-hidden mt-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-soft-50 border-b border-soft-200">
                      <tr>
                        <th className="px-4 py-2.5 font-bold text-soft-500">LIQUID CHARGE DETAIL</th>
                        <th className="px-4 py-2.5 font-bold text-soft-500 text-center">RENT PERIOD</th>
                        <th className="px-4 py-2.5 font-bold text-soft-500 text-right">TOTAL (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-soft-100">
                      <tr>
                        <td className="px-4 py-3">
                          <strong className="text-soft-850 block font-bold">Room rental premium fee</strong>
                          <span className="text-[10px] text-soft-450">Room {activeReceiptToShow.roomNumber} monthly subscription</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-soft-650 text-[11px]">
                          {activeReceiptToShow.rentPeriodStart} to {activeReceiptToShow.rentPeriodEnd}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-soft-850">
                          IDR {activeReceiptToShow.amount.toLocaleString()}
                        </td>
                      </tr>
                      {/* Additional entries placeholder for detail alignment */}
                      <tr>
                        <td className="px-4 py-2.5 col-span-2">
                          <span className="text-soft-450">Extra Services (Electricity, WiFi connection premium, rubbish clearance)</span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-[10px] text-soft-400">Included</td>
                        <td className="px-4 py-2.5 text-right font-mono text-soft-500">IDR 0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom summaries */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-dashed border-soft-200">
                  <div className="space-y-1">
                    <span className="text-soft-450 text-[10px] font-semibold uppercase block">Memo Remarks</span>
                    <p className="text-xs italic text-soft-600 bg-soft-50 px-3 py-1.5 rounded-md border border-soft-150">
                      "{activeReceiptToShow.notes || "None specified."}"
                    </p>
                  </div>

                  <div className="w-full sm:w-56 bg-forest-50/50 p-4 rounded-xl border border-forest-200 text-right space-y-1 shrink-0">
                    <span className="text-[10px] font-bold text-forest-800 uppercase tracking-widest block">GRAND TOTAL CLEARANCE</span>
                    <strong className="text-xl font-bold font-mono text-forest-900 block">IDR {activeReceiptToShow.amount.toLocaleString()}</strong>
                    <span className="text-[9px] text-emerald-700 font-semibold block uppercase">Payment Status: Approved ✓</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 pt-10 text-xs text-center border-t border-soft-100">
                  <div className="flex flex-col justify-between h-20">
                    <span className="text-soft-450 uppercase text-[9px] font-semibold tracking-wider block">Authorized Administrator signature</span>
                    <p className="font-bold text-soft-900">{activeReceiptToShow.adminName}</p>
                  </div>

                  <div className="flex flex-col justify-between h-20">
                    <span className="text-soft-450 uppercase text-[9px] font-semibold tracking-wider block">Renter / Resident signature</span>
                    <p className="font-bold text-soft-900">{activeReceiptToShow.tenantName}</p>
                  </div>
                </div>
              </div>

              {/* print button controls */}
              <div className="p-4 bg-soft-100 border-t border-soft-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[11px] text-soft-500">
                  Authorized receipt registered. Suitable for standard printing scales.
                </span>
                
                <div className="flex items-center gap-2">
                  {/* Delete this receipt */}
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this recorded payment receipt? This will keep other transaction ledgers intact.")) {
                        onDeleteReceipt(activeReceiptToShow.id);
                        setActiveReceiptToShow(receipts.find(r => r.id !== activeReceiptToShow.id) || null);
                      }
                    }}
                    className="p-2 hover:bg-rose-50 text-soft-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    title="Delete receipt record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 bg-forest-300 hover:bg-forest-400 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" /> Print / PDF Receipt
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-soft-200 text-soft-450 font-light">
              Create a payment receipt using the left side-sheet draft console to view high-fidelity printable outputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
