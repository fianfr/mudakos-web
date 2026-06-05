import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Plus, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  HelpCircle,
  Hash,
  Home,
  UserPlus,
  Building
} from 'lucide-react';
import { Room, Tenant, Complaint, Property } from '../types';

interface UserManagementProps {
  rooms: Room[];
  tenants: Tenant[];
  complaints: Complaint[];
  allRooms: Room[];
  allTenants: Tenant[];
  properties: Property[];
  selectedPropertyId: string;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onDeleteTenant: (id: string) => void;
  onAddComplaint: (complaint: Omit<Complaint, 'id'>) => void;
  onUpdateComplaintStatus: (id: string, status: 'pending' | 'in_progress' | 'solved') => void;
  onAddRoom: (room: Omit<Room, 'id' | 'tenantId'>) => void;
  onDeleteRoom: (id: string) => void;
  onAddProperty: (property: Omit<Property, 'id'>) => void;
  onDeleteProperty: (id: string) => void;
}

export default function UserManagement({
  rooms,
  tenants,
  complaints,
  allRooms,
  allTenants,
  properties,
  selectedPropertyId,
  onAddTenant,
  onDeleteTenant,
  onAddComplaint,
  onUpdateComplaintStatus,
  onAddRoom,
  onDeleteRoom,
  onAddProperty,
  onDeleteProperty
}: UserManagementProps) {
  
  // Section toggle: 'tenants' | 'rooms_config' | 'venues'
  const [activeSubSection, setActiveSubSection] = useState<'tenants' | 'rooms_config' | 'venues'>('tenants');

  // Copied indicator tracker State
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);

  // Active Reminder Modal details state
  const [activeReminderModal, setActiveReminderModal] = useState<Tenant | null>(null);

  // Form States: New Tenant
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantRoomId, setTenantRoomId] = useState('');
  const [rentStart, setRentStart] = useState(new Date().toISOString().split('T')[0]);
  const [rentUntil, setRentUntil] = useState(() => {
    // defaults to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  });

  // Form States: New Room
  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState('1');
  const [roomType, setRoomType] = useState<'standard' | 'deluxe' | 'suite'>('standard');
  const [roomPrice, setRoomPrice] = useState('');
  const [roomFacilities, setRoomFacilities] = useState('');
  const [roomPropertyId, setRoomPropertyId] = useState('');

  // Form States: New Property
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState<'boarding_house' | 'apartment' | 'villa'>('boarding_house');

  useEffect(() => {
    if (selectedPropertyId !== 'all') {
      setRoomPropertyId(selectedPropertyId);
    } else if (properties.length > 0) {
      setRoomPropertyId(properties[0].id);
    }
  }, [selectedPropertyId, properties]);

  // ---------------- HELPER CALCULATIONS ----------------
  // Calculate remaining days for Rent Due dates
  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRentStatusBadge = (days: number) => {
    if (days < 0) {
      return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Overdue ({Math.abs(days)}d)</span>;
    } else if (days <= 7) {
      return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Due soon ({days}d)</span>;
    } else {
      return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Paid ({days}d left)</span>;
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">High</span>;
      case 'medium': return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Medium</span>;
      case 'low': return <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase uppercase">Low</span>;
    }
  };

  const getStatusIcon = (status: 'pending' | 'in_progress' | 'solved') => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-rose-500" title="Pending" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-amber-500" title="In Progress" />;
      case 'solved': return <CheckCircle className="w-4 h-4 text-emerald-500" title="Solved" />;
    }
  };

  // Create message text template for WhatsApp Reminders
  const generateReminderText = (tenant: Tenant) => {
    const room = rooms.find(r => r.id === tenant.roomId);
    const roomNum = room ? room.number : "Unknown";
    const priceStr = room ? room.price.toLocaleString() : "1,500,000";
    const daysLeft = getDaysDiff(tenant.rentUntil);
    const labelDue = daysLeft < 0 ? `telah jatuh tempo kemarin pada ${tenant.rentUntil}` : `akan jatuh tempo pada ${tenant.rentUntil}`;
    
    return `Halo Sdr/i *${tenant.name}*, ini adalah pemberitahuan resmi dari pengelola boarding house *MudaKost*.\n\nMengingatkan kembali bahwa sewa kamar untuk *Kamar No ${roomNum}* sebesar *IDR ${priceStr}* ${labelDue}.\n\nMohon lakukan pelunasan sewa melalui transfer bank terdaftar. Kirimkan bukti bayar melalui chat admin setelah sukses transaksi. Terima kasih atas kerja sama Anda.\n\nSalam,\nAdmin MudaKost`;
  };

  const handleCopyReminder = (tenant: Tenant) => {
    const text = generateReminderText(tenant);
    navigator.clipboard.writeText(text);
    setCopiedTenantId(tenant.id);
    setTimeout(() => setCopiedTenantId(null), 2500);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantPhone || !tenantRoomId) return;

    onAddTenant({
      name: tenantName,
      phone: tenantPhone,
      email: tenantEmail || "not_specified@mudakost.com",
      roomId: tenantRoomId,
      rentStart,
      rentUntil
    });

    // Reset Form
    setTenantName('');
    setTenantPhone('');
    setTenantEmail('');
    setTenantRoomId('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !roomPrice) return;

    const facilitiesArray = roomFacilities 
      ? roomFacilities.split(',').map(f => f.trim()) 
      : ['WiFi', 'Cabinet', 'Single Bed', 'AC'];

    onAddRoom({
      number: roomNumber,
      floor: Number(roomFloor),
      type: roomType,
      price: Number(roomPrice),
      status: 'available',
      facilities: facilitiesArray,
      propertyId: roomPropertyId || (properties[0]?.id || '')
    });

    // Reset Room Form
    setRoomNumber('');
    setRoomFloor('1');
    setRoomType('standard');
    setRoomPrice('');
    setRoomFacilities('');
    alert(`Room ${roomNumber} added safely to your list!`);
  };

  return (
    <div className="space-y-6">
      {/* Header section toggle switches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-soft-850">Tenants & Workspace</h2>
          <p className="text-sm text-soft-500 mt-1">
            Overlook room occupancy, map rent terms, trigger automatic reminders, and configure venues.
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-soft-100 p-1 border border-soft-200">
          <button
            onClick={() => setActiveSubSection('tenants')}
            className={`px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeSubSection === 'tenants'
                // styled with Sage elements
                ? 'bg-white text-forest-800 shadow-xs'
                : 'text-soft-500 hover:text-soft-900'
            }`}
          >
            Occupying Tenants
          </button>

          <button
            onClick={() => setActiveSubSection('rooms_config')}
            className={`px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeSubSection === 'rooms_config'
                ? 'bg-white text-forest-800 shadow-xs'
                : 'text-soft-500 hover:text-soft-900'
            }`}
          >
            Register Rooms
          </button>

          <button
            onClick={() => setActiveSubSection('venues')}
            className={`px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${
              activeSubSection === 'venues'
                ? 'bg-white text-forest-800 shadow-xs'
                : 'text-soft-500 hover:text-soft-900'
            }`}
          >
            Manage Venues
          </button>
        </div>
      </div>

      {activeSubSection === 'tenants' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Tenant Form */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit">
            <h3 className="text-base font-display font-bold text-soft-805 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-forest-600" /> Check-in New Tenant
            </h3>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Richard Hendriks"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">WhatsApp Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +62812345...."
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@host.com"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Assign Room</label>
                <select
                  value={tenantRoomId}
                  onChange={(e) => setTenantRoomId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                >
                  <option value="">-- Choose Empty Room --</option>
                  {rooms
                    .filter(r => r.status === 'available' || r.status === 'maintenance')
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.number} ({room.type.toUpperCase()} - Floor {room.floor}) - IDR {room.price.toLocaleString()}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-soft-450 mt-1">Only available rooms matching status are shown here.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Rent Start Date</label>
                  <input
                    type="date"
                    required
                    value={rentStart}
                    onChange={(e) => setRentStart(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Rent End / Due Date</label>
                  <input
                    type="date"
                    required
                    value={rentUntil}
                    onChange={(e) => setRentUntil(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Tenant
              </button>
            </form>
          </div>

          {/* Tenants List view */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-soft-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-soft-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-forest-600" />
                  <h3 className="text-sm font-display font-bold text-soft-805">Active Tenant Roster</h3>
                </div>
                <span className="text-xs bg-forest-50 text-forest-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {tenants.length} tenants registered
                </span>
              </div>

              <div className="divide-y divide-soft-100 max-h-165 overflow-y-auto">
                {tenants.length === 0 ? (
                  <div className="p-12 text-center text-soft-400 font-light">
                    No tenants checked-in at the moment. Add renters using the form panel on the left.
                  </div>
                ) : (
                  tenants.map((tenant) => {
                    const room = rooms.find(r => r.id === tenant.roomId);
                    const daysRemaining = getDaysDiff(tenant.rentUntil);
                    return (
                      <div key={tenant.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-soft-50/40 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-sm font-bold text-soft-900">{tenant.name}</h4>
                            <span className="text-xs font-bold font-mono bg-soft-100 text-soft-700 px-2.5 py-0.5 rounded">
                              Room {room ? room.number : "N/A"}
                            </span>
                            {getRentStatusBadge(daysRemaining)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-soft-500 pt-1">
                            <span className="font-mono">WhatsApp: {tenant.phone}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Rent Due: <strong className="font-mono text-soft-700">{tenant.rentUntil}</strong></span>
                            {room && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span>Rate: <strong className="font-mono text-forest-700">IDR {room.price.toLocaleString()}/mo</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => setActiveReminderModal(tenant)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-750 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            title="Generate rent notification reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-forest-600" /> Reminder Info
                          </button>

                          <button
                            onClick={() => onDeleteTenant(tenant.id)}
                            className="p-2 hover:bg-rose-50 text-soft-350 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Remove tenant"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* REGISTER ROOMS CONFIG SUBSECTION */}
      {activeSubSection === 'rooms_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Room Form */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit">
            <h3 className="text-base font-display font-bold text-soft-805 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-forest-600" /> Register New Room
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Assign to Venue</label>
                <select
                  value={roomPropertyId}
                  onChange={(e) => setRoomPropertyId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 capitalize font-semibold text-soft-800"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105 or A-10"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Floor Number</label>
                  <select
                    value={roomFloor}
                    onChange={(e) => setRoomFloor(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Room Tier</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 capitalize"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Monthly Price (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1800000"
                  value={roomPrice}
                  onChange={(e) => setRoomPrice(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold">Facilities (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="AC, WiFi, Privat bathroom, Desk"
                  value={roomFacilities}
                  onChange={(e) => setRoomFacilities(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Room Specs
              </button>
            </form>
          </div>

          {/* Rooms roster */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-soft-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-soft-100 flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-soft-805">Property Rooms Inventory</h3>
                <span className="text-xs font-mono bg-soft-100 px-2 py-0.5 rounded text-soft-600">{rooms.length} Rooms total</span>
              </div>

              <div className="divide-y divide-soft-100 max-h-165 overflow-y-auto">
                {rooms.map(room => {
                  const propertyName = properties.find(p => p.id === room.propertyId)?.name || 'MudaKost';
                  return (
                    <div key={room.id} className="p-4 flex items-center justify-between hover:bg-soft-50/30 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-soft-900 font-mono">Room {room.number}</strong>
                          <span className="text-[10px] bg-soft-200 text-soft-700 font-bold px-2 py-0.5 rounded-sm">{propertyName}</span>
                          <span className="text-[10px] bg-soft-100 text-soft-500 px-2 py-0.5 rounded-sm capitalize font-mono">Floor {room.floor}</span>
                        <span className="text-[10px] bg-forest-50 text-forest-800 font-semibold px-2 py-0.5 rounded-sm capitalize">{room.type}</span>
                        
                        {room.status === 'occupied' && (
                          <span className="bg-emerald-55 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-emerald-50">Occupied</span>
                        )}
                        {room.status === 'available' && (
                          <span className="bg-blue-55 border border-blue-200 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-blue-50">Available</span>
                        )}
                        {room.status === 'maintenance' && (
                          <span className="bg-amber-55 border border-amber-200 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-amber-50 font-semibold">Maintenance</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {room.facilities.map((fac, i) => (
                          <span key={i} className="text-[9px] text-soft-500 bg-soft-100 border border-soft-150 px-1.5 py-0.1 rounded-xs">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold font-mono text-soft-800">
                        IDR {room.price.toLocaleString()}/mo
                      </span>
                      
                      <button
                        onClick={() => onDeleteRoom(room.id)}
                        className="p-1 hover:bg-rose-50 text-soft-350 hover:text-rose-500 rounded cursor-pointer transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE VENUES CODE BLOCK */}
      {activeSubSection === 'venues' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Venue Form */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit">
            <h3 className="text-base font-display font-bold text-soft-805 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-forest-600" /> Register New Venue
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!propertyName || !propertyAddress) return;
              onAddProperty({
                name: propertyName,
                address: propertyAddress,
                type: propertyType
              });
              setPropertyName('');
              setPropertyAddress('');
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold text-[10px]">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MudaKost Senayan"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold text-[10px]">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jln. Senayan No. 12, Kebayoran Baru"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase font-semibold text-[10px]">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 capitalize"
                >
                  <option value="boarding_house">Boarding House (Kos)</option>
                  <option value="apartment">Micro Apartment</option>
                  <option value="villa">Rentable Villa / Lodging</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-forest-300 hover:bg-forest-400 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Venue specifications
              </button>
            </form>
          </div>

          {/* Venues roster */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-soft-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-soft-100 flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-soft-805">Active MudaKost Venues</h3>
                <span className="text-xs font-mono bg-soft-100 px-2 py-0.5 rounded text-soft-600">{properties.length} active venue(s)</span>
              </div>

              <div className="divide-y divide-soft-100 max-h-165 overflow-y-auto">
                {properties.map(p => {
                  const propertyRooms = allRooms.filter(r => r.propertyId === p.id);
                  const propertyOccupied = propertyRooms.filter(r => r.status === 'occupied').length;
                  return (
                    <div key={p.id} className="p-5 flex items-center justify-between hover:bg-soft-50/30 transition-all">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-soft-450" />
                          <strong className="text-sm text-soft-900 font-bold">{p.name}</strong>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                            p.type === 'boarding_house' 
                              ? 'bg-amber-100 text-amber-800' 
                              : p.type === 'micro_apartment' 
                                ? 'bg-sky-100 text-sky-800' 
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-soft-500">{p.address}</p>
                        <div className="text-[10px] font-mono text-soft-400">
                          Units count: {propertyRooms.length} • Occupied: {propertyOccupied}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          className="p-1 hover:bg-rose-50 text-soft-350 hover:text-rose-500 rounded cursor-pointer transition-colors"
                          title="Delete Venue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP REMINDER DIALOG MODAL CONTROL */}
      {activeReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-soft-100 bg-forest-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-forest-600" />
                <h3 className="font-display font-bold text-soft-850 text-base">Monthly Rent Reminder Generator</h3>
              </div>
              <button 
                onClick={() => setActiveReminderModal(null)}
                className="text-soft-400 hover:text-soft-650 cursor-pointer font-bold text-lg p-1.5 hover:bg-soft-150 rounded"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50/50 border border-amber-150 rounded-xl flex gap-3 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                <p>
                  Copy the generated text below or trigger the WhatsApp Web redirection shortcut to directly prompt <strong>{activeReminderModal.name}</strong> on their WhatsApp number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-soft-500 uppercase mb-1">WhatsApp Target</label>
                <p className="font-mono text-sm font-semibold text-soft-850 bg-soft-50 px-3 py-2 rounded-lg border border-soft-200">
                  {activeReminderModal.phone}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-soft-500 uppercase mb-1">Pre-filled Message Template</label>
                <div className="relative">
                  <textarea
                    rows={7}
                    readOnly
                    value={generateReminderText(activeReminderModal)}
                    className="w-full text-xs p-4 bg-soft-50 border border-soft-200 rounded-xl font-sans text-soft-750 focus:outline-hidden"
                  />
                  
                  <button
                    onClick={() => handleCopyReminder(activeReminderModal)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-soft-200 hover:bg-soft-100 rounded text-xs font-bold text-soft-700 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedTenantId === activeReminderModal.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-soft-500" /> Copy msg
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-soft-50 border-t border-soft-150 flex flex-col sm:flex-row justify-end items-center gap-3">
              <button
                onClick={() => setActiveReminderModal(null)}
                className="w-full sm:w-auto px-4 py-2 border border-soft-200 text-soft-600 hover:bg-soft-100 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close Dialog
              </button>
              
              <a
                href={`https://wa.me/${activeReminderModal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generateReminderText(activeReminderModal))}`}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
              >
                <ExternalLink className="w-4.5 h-4.5 text-emerald-100" /> WhatsApp Message
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
