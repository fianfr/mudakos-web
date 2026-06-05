import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { Room, Tenant, Complaint } from '../types';

interface ComplaintsControlProps {
  rooms: Room[];
  tenants: Tenant[];
  complaints: Complaint[];
  onAddComplaint: (complaint: Omit<Complaint, 'id'>) => void;
  onUpdateComplaintStatus: (id: string, status: 'pending' | 'in_progress' | 'solved') => void;
}

export default function ComplaintsControl({
  rooms,
  tenants,
  complaints,
  onAddComplaint,
  onUpdateComplaintStatus,
}: ComplaintsControlProps) {
  // Form States: New Complaint
  const [complaintTenantId, setComplaintTenantId] = useState('');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">High</span>;
      case 'medium': return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Medium</span>;
      case 'low': return <span className="bg-forest-100 text-forest-850 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Low</span>;
    }
  };

  const getStatusIcon = (status: 'pending' | 'in_progress' | 'solved') => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-rose-500 animate-pulse" title="Pending" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} title="In Progress" />;
      case 'solved': return <CheckCircle className="w-4 h-4 text-emerald-500" title="Solved" />;
    }
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTenantId || !complaintTitle || !complaintDesc) return;
    
    const tenant = tenants.find(t => t.id === complaintTenantId);
    if (!tenant) return;
    
    const room = rooms.find(r => r.id === tenant.roomId);
    const roomNumber = room ? room.number : "N/A";

    onAddComplaint({
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber,
      title: complaintTitle,
      description: complaintDesc,
      status: 'pending',
      priority: complaintPriority,
      date: new Date().toISOString().split('T')[0]
    });

    // Reset Form
    setComplaintTenantId('');
    setComplaintTitle('');
    setComplaintDesc('');
    setComplaintPriority('medium');
    alert('Tenant complaint reported and logged successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header and overview info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-soft-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-forest-600" /> Maintenance & Grievances Ledger
          </h2>
          <p className="text-xs text-soft-500 mt-1">
            Track and handle tenant service requests, issues, and repair jobs in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File a Grievance Form */}
        <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit">
          <h3 className="text-sm font-display font-bold text-soft-805 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-forest-600" /> Log New Renter Issue
          </h3>

          <form onSubmit={handleCreateComplaint} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-soft-500 mb-1.5 uppercase font-mono tracking-wider">Reporting Occupant</label>
              <select
                value={complaintTenantId}
                onChange={(e) => setComplaintTenantId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              >
                <option value="">-- Choose reporting roommate/tenant --</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} (Room {rooms.find(r => r.id === tenant.roomId)?.number || "N/A"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-soft-500 mb-1.5 uppercase font-mono tracking-wider">Subject Title / Summary</label>
              <input
                type="text"
                required
                placeholder="e.g. Broken wall outlet"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-soft-500 mb-1.5 uppercase font-mono tracking-wider">Urgency Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setComplaintPriority(prio)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer text-center capitalize border transition-all ${
                      complaintPriority === prio
                        ? prio === 'high' 
                          ? 'bg-rose-500 text-white border-rose-500' 
                          : prio === 'medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-forest-500 text-white border-forest-500'
                        : 'bg-white border-soft-200 text-soft-500 hover:bg-soft-50'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-soft-500 mb-1.5 uppercase font-mono tracking-wider">Trouble Description</label>
              <textarea
                placeholder="Detail the issue (e.g. water leakage on ceiling, broken door handle, WiFi connection unstable...)"
                required
                rows={4}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-soft-900 hover:bg-soft-850 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              Log Issue to Ledger
            </button>
          </form>
        </div>

        {/* Complaints ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-soft-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-soft-100 flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-soft-805">Active Complaints Ledger</h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Active: {complaints.filter(c => c.status !== 'solved').length}
                </span>
                <span className="text-soft-400">|</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Resolved: {complaints.filter(c => c.status === 'solved').length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-soft-100 max-h-165 overflow-y-auto">
              {complaints.length === 0 ? (
                <div className="p-12 text-center text-soft-400 font-light text-xs">
                  Hooray! No tenant complaints or issues logged currently.
                </div>
              ) : (
                [...complaints].reverse().map((complaint) => (
                  <div key={complaint.id} className="p-5 space-y-3 hover:bg-soft-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(complaint.status)}
                          <h4 className="text-sm font-bold text-soft-900 capitalize">{complaint.title}</h4>
                          <span className="text-[10px] bg-soft-200 text-soft-700 font-bold px-2 py-0.5 rounded font-mono">
                            Room {complaint.roomNumber}
                          </span>
                        </div>
                        
                        <p className="text-xs text-soft-450 mt-1.5">
                          Reported by <strong className="text-soft-700">{complaint.tenantName}</strong> on <span className="font-mono">{complaint.date}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPriorityBadge(complaint.priority)}
                      </div>
                    </div>

                    <p className="text-xs text-soft-650 leading-relaxed bg-soft-50 p-3.5 rounded-lg border border-soft-150">
                      {complaint.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-soft-150">
                      <span className="text-[10px] text-soft-450 font-medium font-mono uppercase tracking-wide">Update resolution status:</span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateComplaintStatus(complaint.id, 'pending')}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                            complaint.status === 'pending'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-soft-100 hover:bg-soft-200 text-soft-600'
                          }`}
                        >
                          Pending
                        </button>

                        <button
                          onClick={() => onUpdateComplaintStatus(complaint.id, 'in_progress')}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                            complaint.status === 'in_progress'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-soft-100 hover:bg-soft-200 text-soft-600'
                          }`}
                        >
                          In Progress
                        </button>

                        <button
                          onClick={() => onUpdateComplaintStatus(complaint.id, 'solved')}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                            complaint.status === 'solved'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-soft-100 hover:bg-soft-200 text-soft-600'
                          }`}
                        >
                          Solved
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
