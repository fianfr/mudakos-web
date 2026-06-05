import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building,
  Users, 
  CircleDollarSign, 
  Wrench, 
  AlertTriangle,
  Flame,
  Home,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Room, Tenant, Transaction, Complaint, PaymentReceipt, WageConfig, Property } from './types';
import Sidebar from './components/Sidebar';
import FinancialControl from './components/FinancialControl';
import UserManagement from './components/UserManagement';
import PaymentReceiptCreator from './components/PaymentReceiptCreator';
import AiConsultant from './components/AiConsultant';
import ComplaintsControl from './components/ComplaintsControl';

import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_TRANSACTIONS,
  INITIAL_WAGE_CONFIG,
  INITIAL_COMPLAINTS,
  INITIAL_RECEIPTS,
  getLocalStorageData,
  setLocalStorageData
} from './utils/mockData';

export default function App() {
  // Navigation active tab State: 'dashboard' | 'financials' | 'users' | 'receipts' | 'ai'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Master State Managers synced to client localStorage for offline endurance
  const [properties, setProperties] = useState<Property[]>(() => getLocalStorageData('properties', INITIAL_PROPERTIES));
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [rooms, setRooms] = useState<Room[]>(() => getLocalStorageData('rooms', INITIAL_ROOMS));
  const [tenants, setTenants] = useState<Tenant[]>(() => getLocalStorageData('tenants', INITIAL_TENANTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getLocalStorageData('transactions', INITIAL_TRANSACTIONS));
  const [wageConfig, setWageConfig] = useState<WageConfig>(() => getLocalStorageData('wage_config', INITIAL_WAGE_CONFIG));
  const [complaints, setComplaints] = useState<Complaint[]>(() => getLocalStorageData('complaints', INITIAL_COMPLAINTS));
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => getLocalStorageData('receipts', INITIAL_RECEIPTS));
  
  // Trial Period tracking state (30 days remains)
  const [trialDays, setTrialDays] = useState<number>(() => {
    const saved = localStorage.getItem('mudakost_trial_days');
    return saved ? Number(saved) : 28; // default to 28 days left of 30
  });

  // Watch states and write updates to localStorage
  useEffect(() => { setLocalStorageData('properties', properties); }, [properties]);
  useEffect(() => { setLocalStorageData('rooms', rooms); }, [rooms]);
  useEffect(() => { setLocalStorageData('tenants', tenants); }, [tenants]);
  useEffect(() => { setLocalStorageData('transactions', transactions); }, [transactions]);
  useEffect(() => { setLocalStorageData('wage_config', wageConfig); }, [wageConfig]);
  useEffect(() => { setLocalStorageData('complaints', complaints); }, [complaints]);
  useEffect(() => { setLocalStorageData('receipts', receipts); }, [receipts]);
  useEffect(() => { localStorage.setItem('mudakost_trial_days', trialDays.toString()); }, [trialDays]);

  // ---------------- STATE HANDLERS ----------------

  const handleAddProperty = (newProperty: Omit<Property, 'id'>) => {
    const id = `prop_${Date.now()}`;
    const p: Property = {
      ...newProperty,
      id
    };
    setProperties(prev => [...prev, p]);
    alert(`Venue "${newProperty.name}" registered successfully! You can now map new rooms directly to it.`);
  };

  const handleDeleteProperty = (id: string) => {
    const hasRooms = rooms.some(r => r.propertyId === id);
    if (hasRooms) {
      alert("Cannot delete this property yet. Please delete or reassign all rooms associated with this venue first.");
      return;
    }
    const propName = properties.find(p => p.id === id)?.name;
    if (confirm(`Confirm deleting property "${propName}"?`)) {
      setProperties(prev => prev.filter(p => p.id !== id));
      if (selectedPropertyId === id) {
        setSelectedPropertyId('all');
      }
    }
  };

  // Trial resets
  const handleResetTrial = () => {
    setTrialDays(30);
    alert('Free trial license restored successfully! You have 30 full days of evaluation.');
  };

  // Rooms logic updates
  const handleAddRoom = (newRoom: Omit<Room, 'id' | 'tenantId'>) => {
    const id = `room_${Date.now()}`;
    const r: Room = {
      ...newRoom,
      id,
      tenantId: null
    };
    setRooms(prev => [...prev, r]);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm("Confirm deleting room specification? If occupied, please check-out the occupying tenant first.")) {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  // Tenants check-in / check-out
  const handleAddTenant = (newTenant: Omit<Tenant, 'id'>) => {
    const id = `tn_${Date.now()}`;
    const t: Tenant = { ...newTenant, id };
    
    setTenants(prev => [...prev, t]);
    
    // Update matching room status to 'occupied'
    setRooms(prev => prev.map(room => {
      if (room.id === newTenant.roomId) {
        return { ...room, status: 'occupied', tenantId: id };
      }
      return room;
    }));

    // Auto-log initial rent collection income transaction
    const room = rooms.find(r => r.id === newTenant.roomId);
    if (room) {
      const initTx: Transaction = {
        id: `tx_init_${Date.now()}`,
        type: 'income',
        category: 'Room Rent',
        amount: room.price,
        date: newTenant.rentStart,
        description: `Check-in: Initial rent logged of ${newTenant.name} at Room ${room.number}`,
        propertyId: room.propertyId
      };
      setTransactions(prev => [...prev, initTx]);
    }
  };

  const handleDeleteTenant = (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    if (confirm(`Check-out tenant "${tenant.name}"? This action frees up Room number ${rooms.find(r => r.id === tenant.roomId)?.number || ""} and resets its state to Available.`)) {
      setTenants(prev => prev.filter(t => t.id !== id));
      
      // Update room to Available
      setRooms(prev => prev.map(room => {
        if (room.id === tenant.roomId) {
          return { ...room, status: 'available', tenantId: null };
        }
        return room;
      }));
    }
  };

  // Financial transactions management
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}`
    };
    setTransactions(prev => [...prev, tx]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Automated log helper when receipts are generated
  const handleLogIncomeFromReceipt = (amount: number, tenantName: string, roomNum: string, date: string, method: string) => {
    const matchedRoom = rooms.find(r => r.number === roomNum);
    const receiptTx: Transaction = {
      id: `tx_rec_${Date.now()}`,
      type: 'income',
      category: 'Room Rent',
      amount,
      date,
      description: `Rent payment Receipt generated successfully for ${tenantName} (Room ${roomNum}) via ${method}`,
      propertyId: matchedRoom ? matchedRoom.propertyId : undefined
    };
    setTransactions(prev => [...prev, receiptTx]);
  };

  // Receipts lists
  const handleAddReceipt = (newRc: PaymentReceipt) => {
    setReceipts(prev => [...prev, newRc]);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(rc => rc.id !== id));
  };

  // Complaints logger & state resolution shifts
  const handleAddComplaint = (newComplaint: Omit<Complaint, 'id'>) => {
    const c: Complaint = {
      ...newComplaint,
      id: `cp_${Date.now()}`
    };
    setComplaints(prev => [...prev, c]);
  };

  const handleUpdateComplaintStatus = (id: string, status: 'pending' | 'in_progress' | 'solved') => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status };
      }
      return c;
    }));
  };

  // ---------------- GENERAL KPI STATISTICS calculations ----------------
  const filteredRooms = selectedPropertyId === 'all'
    ? rooms
    : rooms.filter(r => r.propertyId === selectedPropertyId);

  const filteredTenants = selectedPropertyId === 'all'
    ? tenants
    : tenants.filter(t => {
        const room = rooms.find(r => r.id === t.roomId);
        return room && room.propertyId === selectedPropertyId;
      });

  const filteredTransactions = selectedPropertyId === 'all'
    ? transactions
    : transactions.filter(t => t.propertyId === selectedPropertyId);

  const filteredComplaints = selectedPropertyId === 'all'
    ? complaints
    : complaints.filter(c => {
        const room = rooms.find(r => r.number === c.roomNumber);
        return room && room.propertyId === selectedPropertyId;
      });

  const filteredReceipts = selectedPropertyId === 'all'
    ? receipts
    : receipts.filter(rc => {
        const room = rooms.find(r => r.number === rc.roomNumber);
        return room && room.propertyId === selectedPropertyId;
      });

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueTenantsList = filteredTenants.filter(t => getDaysDiff(t.rentUntil) <= 7);

  const totalIncomeVal = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenseVal = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalWagesVal = filteredTransactions.filter(t => t.type === 'wage').reduce((s, t) => s + t.amount, 0);
  
  const currentFMargin = totalIncomeVal - totalExpenseVal - totalWagesVal;

  const totalRooms = filteredRooms.length;
  const occupiedRooms = filteredRooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = filteredRooms.filter(r => r.status === 'maintenance').length;
  const availableRooms = filteredRooms.filter(r => r.status === 'available').length;
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const openComplaintsCount = filteredComplaints.filter(c => c.status !== 'solved').length;

  return (
    <div className="min-h-screen bg-soft-100 flex text-soft-900 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        trialDays={trialDays} 
        onResetTrial={handleResetTrial} 
      />

      {/* Main Content Dashboard Layout */}
      <main className="flex-1 pl-80 lg:pl-84 pr-6 py-6 md:pr-8 md:py-8 min-h-screen">
        
        {/* Global Property switcher bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-soft-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-soft-400 tracking-wider">Active Workspace</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-soft-850 text-sm">
                  {selectedPropertyId === 'all' ? 'All Managed Venues' : properties.find(p => p.id === selectedPropertyId)?.name}
                </span>
                <span className="text-xs text-soft-400">•</span>
                <span className="text-xs text-soft-600 font-mono">
                  {selectedPropertyId === 'all' ? `${rooms.length} units total` : `${filteredRooms.length} units`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedPropertyId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPropertyId === 'all'
                  ? 'bg-soft-900 text-white shadow-xs'
                  : 'bg-soft-50 hover:bg-soft-100 text-soft-600 border border-soft-200'
              }`}
            >
              All Venues
            </button>
            {properties.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPropertyId === p.id
                    ? 'bg-forest-300 text-white shadow-xs font-semibold'
                    : 'bg-soft-50 hover:bg-soft-100 text-soft-600 border border-soft-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Trial Reminder Warning Strip */}
        {trialDays <= 5 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 animate-pulse">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              MudaKost Free trial license is almost concluding. Register full version safely to prevent data locks.
            </span>
            <button 
              onClick={handleResetTrial}
              className="px-3 py-1 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 transition"
            >
              Extend Trial period
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* OVERVIEW DASHBOARD TAB */}
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard-overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Profile Greeting header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-soft-200 rounded-2xl shadow-xs">
                <div>
                  <h2 className="text-xl font-display font-bold text-soft-850">
                    Selamat Datang, Landlord! 👋
                  </h2>
                  <p className="text-xs text-soft-500 mt-1">
                    Manage MudaKost properties occupancy, finance targets, and complaints. Good tracking drives tenant consistency.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold text-forest-800 bg-forest-50 border border-forest-200 py-2 px-4 rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                  <span>Licensed Agency Evaluation (Active)</span>
                </div>
              </div>

              {/* Grid of Key Performance Indexes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-soft-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-soft-450 tracking-wider">Occupancy level</span>
                    <h3 className="text-lg font-bold text-soft-900 font-mono mt-0.5">{occupancyPercentage}% ({occupiedRooms}/{totalRooms})</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-soft-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-soft-450 tracking-wider">Projected Surplus</span>
                    <h3 className="text-lg font-bold text-soft-900 font-mono mt-0.5">IDR {currentFMargin.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-soft-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-soft-450 tracking-wider">Property Reports</span>
                    <h3 className="text-lg font-bold text-soft-900 font-mono mt-0.5">{openComplaintsCount} Grievances Open</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-soft-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-soft-450 tracking-wider">Renter Reminders</span>
                    <h3 className="text-lg font-bold text-soft-900 font-mono mt-0.5">{overdueTenantsList.length} Due Soon</h3>
                  </div>
                </div>
              </div>

              {/* Grid with Rooms Maps & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Rooms visual blueprint occupancy board */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-soft-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-soft-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-display font-bold text-soft-850">Interactive Room allocations</h3>
                        <p className="text-[11px] text-soft-450">Blueprint status of MudaKost rental units map.</p>
                      </div>
                      
                      <button 
                        onClick={() => setCurrentTab('users')} 
                        className="text-xs text-forest-700 hover:text-forest-800 font-semibold flex items-center cursor-pointer"
                      >
                        Edit Rooms &rarr;
                      </button>
                    </div>

                    {/* Styled rooms block map */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                      {filteredRooms.map((room) => {
                        const tenantName = filteredTenants.find(t => t.id === room.tenantId)?.name || 'Empty Unit';
                        return (
                          <div
                            key={room.id}
                            className={`p-3 rounded-lg flex flex-col justify-between h-22 transition-all shadow-xs cursor-pointer ${
                              room.status === 'occupied'
                                ? 'bg-forest-300 text-white border-transparent hover:bg-forest-400'
                                : room.status === 'maintenance'
                                  ? 'bg-amber-200 text-amber-950 border-transparent hover:bg-amber-300 animate-pulse'
                                  : 'bg-soft-200 text-soft-800 border-transparent hover:bg-soft-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-xs font-bold leading-none">Room {room.number}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm capitalize font-bold ${
                                room.status === 'occupied'
                                  ? 'bg-white/20 text-white'
                                  : room.status === 'maintenance'
                                    ? 'bg-white/30 text-amber-950'
                                    : 'bg-white text-soft-700 border border-soft-200'
                              }`}>{room.type}</span>
                            </div>

                            <div className="text-[10px] truncate pr-1">
                              {room.status === 'occupied' ? (
                                <span className="font-bold text-white block">{tenantName}</span>
                              ) : (
                                <span className={room.status === 'maintenance' ? 'text-amber-900 font-semibold block' : 'text-soft-500 italic block'}>
                                  {room.status === 'maintenance' ? '🔧 Under Repair' : '🔑 Vacant Unit'}
                                </span>
                              )}
                            </div>

                            <div className={`text-[9px] font-mono pt-1 border-t border-dashed flex justify-between ${
                              room.status === 'occupied'
                                ? 'text-forest-100/90 border-white/25'
                                : room.status === 'maintenance'
                                  ? 'text-amber-900/80 border-amber-900/15'
                                  : 'text-soft-550 border-soft-300'
                            }`}>
                              <span>Floor {room.floor}</span>
                              <span className="font-bold">IDR {(room.price / 1000).toLocaleString()}K</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Map Keys indicator info */}
                  <div className="mt-6 pt-4 border-t border-soft-150 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-medium text-soft-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 bg-forest-300 rounded shadow-xs" />
                      Occupied ({occupiedRooms})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 bg-soft-200 rounded shadow-xs" />
                      Vacant Available ({availableRooms})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 bg-amber-200 rounded animate-pulse shadow-xs" />
                      Maintenance / Repair ({maintenanceRooms})
                    </span>
                  </div>
                </div>

                {/* Alerts / Overdues reminder dashboard */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-soft-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-display font-bold text-soft-850 border-b border-soft-100 pb-3 mb-3 flex items-center justify-between">
                      <span>Monthly Rent Reminders</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.2 rounded font-mono">{overdueTenantsList.length} alert(s)</span>
                    </h3>

                    {overdueTenantsList.length === 0 ? (
                      <div className="py-12 text-center text-xs text-soft-400 font-light leading-relaxed">
                        Excellent! No tenants have looming rental collections or payments due this week.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-76 overflow-y-auto">
                        {overdueTenantsList.map(tenant => {
                          const daysLeft = getDaysDiff(tenant.rentUntil);
                          const room = rooms.find(r => r.id === tenant.roomId);
                          return (
                            <div key={tenant.id} className="p-3 bg-soft-50 rounded-lg border border-soft-150 flex items-center justify-between hover:bg-soft-100 transition">
                              <div>
                                <h4 className="text-xs font-bold text-soft-850">{tenant.name}</h4>
                                <div className="text-[10px] text-soft-450 mt-0.5 font-mono">
                                  Room {room?.number || "N/A"} • due {tenant.rentUntil}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {daysLeft < 0 ? (
                                  <span className="text-[9px] bg-rose-50 text-rose-700 font-bold py-0.5 px-1 rounded uppercase">Overdue</span>
                                ) : (
                                  <span className="text-[9px] bg-amber-50 text-amber-700 font-bold py-0.5 px-1 rounded uppercase">{daysLeft}d left</span>
                                )}
                                
                                <button
                                  onClick={() => setCurrentTab('users')}
                                  className="p-1 px-1.5 hover:bg-forest-100 text-forest-700 font-bold text-[10px] rounded animate-pulse transition cursor-pointer"
                                >
                                  Go &rarr;
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-soft-150 text-[11px] text-soft-450 leading-relaxed">
                    Overdue notifications populate based on contract expirations. Tap 'Go' next to any tenant card to generate automatic reminders.
                  </div>
                </div>

              </div>

              {/* Master Snapshot: Complaints Tracker */}
              <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-soft-100 mb-4 bg-white">
                  <div>
                    <h3 className="text-sm font-display font-bold text-soft-850">Recent complaints snapshot</h3>
                    <p className="text-[11px] text-soft-450">Active facility grievances and building maintenance issues.</p>
                  </div>
                  
                  <button 
                    onClick={() => setCurrentTab('complaints')} 
                    className="text-xs text-forest-700 hover:text-forest-800 font-semibold cursor-pointer"
                  >
                    Manage issues &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredComplaints.length === 0 ? (
                    <div className="col-span-3 text-center p-6 text-xs text-soft-400">All facilities are perfect! Check back later.</div>
                  ) : (
                    filteredComplaints.slice(0, 3).map((cp) => (
                      <div key={cp.id} className="p-4 bg-soft-50/50 rounded-xl border border-soft-150 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold py-0.5 px-1.5 rounded uppercase ${
                            cp.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {cp.priority} Priority
                          </span>
                          
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.2 rounded-sm ${
                            cp.status === 'pending' 
                              ? 'text-rose-600 bg-rose-50' 
                              : cp.status === 'in_progress' 
                                ? 'text-amber-600 bg-amber-50 animate-pulse' 
                                : 'text-emerald-600 bg-emerald-50'
                          }`}>
                            {cp.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-soft-850 truncate">Room {cp.roomNumber}: {cp.title}</h4>
                        <p className="text-[11px] text-soft-500 line-clamp-2 leading-relaxed">{cp.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* FINANCIAL TAB MODULE */}
          {currentTab === 'financials' && (
            <motion.div
              key="financials-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <FinancialControl
                rooms={filteredRooms}
                transactions={filteredTransactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                wageConfig={wageConfig}
                onUpdateWageConfig={setWageConfig}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
              />
            </motion.div>
          )}

          {/* USER & COMPLAINTS TAB MODULE */}
          {currentTab === 'users' && (
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <UserManagement
                rooms={filteredRooms}
                tenants={filteredTenants}
                complaints={filteredComplaints}
                allRooms={rooms}
                allTenants={tenants}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onAddTenant={handleAddTenant}
                onDeleteTenant={handleDeleteTenant}
                onAddComplaint={handleAddComplaint}
                onUpdateComplaintStatus={handleUpdateComplaintStatus}
                onAddRoom={handleAddRoom}
                onDeleteRoom={handleDeleteRoom}
                onAddProperty={handleAddProperty}
                onDeleteProperty={handleDeleteProperty}
              />
            </motion.div>
          )}

          {/* COMPLAINTS & REPAIR TAB MODULE */}
          {currentTab === 'complaints' && (
            <motion.div
              key="complaints-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ComplaintsControl
                rooms={filteredRooms}
                tenants={filteredTenants}
                complaints={filteredComplaints}
                onAddComplaint={handleAddComplaint}
                onUpdateComplaintStatus={handleUpdateComplaintStatus}
              />
            </motion.div>
          )}

          {/* PAYMENT RECEIPT GENERATOR MODULE */}
          {currentTab === 'receipts' && (
            <motion.div
              key="receipts-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentReceiptCreator
                rooms={filteredRooms}
                tenants={filteredTenants}
                receipts={filteredReceipts}
                onAddReceipt={handleAddReceipt}
                onDeleteReceipt={handleDeleteReceipt}
                onLogIncomeTransaction={handleLogIncomeFromReceipt}
              />
            </motion.div>
          )}

          {/* AI GEMINI RECOMMENDATIONS MODULE */}
          {currentTab === 'ai' && (
            <motion.div
              key="ai-consultant-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AiConsultant rooms={filteredRooms} complaints={filteredComplaints} properties={properties} selectedPropertyId={selectedPropertyId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
