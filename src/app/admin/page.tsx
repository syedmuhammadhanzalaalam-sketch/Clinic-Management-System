"use client";

import { useEffect, useState } from "react";
import { 
  CalendarDays, 
  DollarSign, 
  Plus, 
  Stethoscope, 
  Users, 
  ClipboardList, 
  UserPlus, 
  Clock,
  CheckCircle2,
  X,
  CreditCard
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  
  // Form States
  const [doctorForm, setDoctorForm] = useState({
    name: "", email: "", phone: "", password: "password",
    license_number: "", qualification: "", bio: "",
    consultation_fee: "2500", experience_years: "5",
    specialty_ids: [] as number[], custom_specialties: [] as string[],
  });
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [availabilityForm, setAvailabilityForm] = useState({
    doctor_id: "", day_of_week: "1", start_time: "09:00",
    end_time: "13:00", slot_duration_minutes: "30",
  });
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const maroon = "#800020";

  function refresh() {
    api("/admin/dashboard").then(setStats);
    api("/admin/finance").then(setFinance);
    api("/doctors").then((items) => {
      setDoctors(items);
      if (items.length > 0) {
        setAvailabilityForm((current) => ({ 
          ...current, 
          doctor_id: current.doctor_id || String(items[0].id) 
        }));
      }
    });
    api("/specialties").then(setSpecialties);
  }

  useEffect(() => { refresh(); }, []);

  // Specialty Logic
  const toggleSpecialty = (id: number) => {
    setDoctorForm(prev => ({
      ...prev,
      specialty_ids: prev.specialty_ids.includes(id)
        ? prev.specialty_ids.filter(sid => sid !== id)
        : [...prev.specialty_ids, id]
    }));
  };

  const addCustomSpecialty = () => {
    const val = customSpecialty.trim();
    if (val && !doctorForm.custom_specialties.includes(val)) {
      setDoctorForm(prev => ({
        ...prev,
        custom_specialties: [...prev.custom_specialties, val]
      }));
      setCustomSpecialty("");
    }
  };

  const removeCustomSpecialty = (name: string) => {
    setDoctorForm(prev => ({
      ...prev,
      custom_specialties: prev.custom_specialties.filter(s => s !== name)
    }));
  };

  // Submission Handlers
  async function createDoctor(event: React.FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await api("/admin/doctors", {
        method: "POST",
        body: JSON.stringify({
          ...doctorForm,
          consultation_fee: Number(doctorForm.consultation_fee),
          experience_years: Number(doctorForm.experience_years),
        }),
      });
      setMessage("Doctor profile created successfully.");
      setDoctorForm({
        name: "", email: "", phone: "", password: "password",
        license_number: "", qualification: "", bio: "",
        consultation_fee: "2500", experience_years: "5",
        specialty_ids: [], custom_specialties: [],
      });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  async function createAvailability(event: React.FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    const days = (availabilityForm.day_of_week as string).split(",").filter(Boolean);
    if (days.length === 0) {
      setError("Please select at least one service day.");
      return;
    }
    try {
      for (const day of days) {
        await api("/admin/availability", {
          method: "POST",
          body: JSON.stringify({
            ...availabilityForm,
            doctor_id: Number(availabilityForm.doctor_id),
            day_of_week: Number(day),
            slot_duration_minutes: Number(availabilityForm.slot_duration_minutes),
          }),
        });
      }
      setMessage(`Schedule set for ${days.length} day(s) successfully.`);
      setAvailabilityForm(prev => ({ ...prev, day_of_week: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule.");
    }
  }

  return (
    <AppShell>
      {/* Full Width Wrapper - Eliminates red-highlighted side margins */}
      <div style={{ width: '100%', padding: '20px 40px', maxWidth: '100%' }}>
        
        {/* Expanded Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: maroon, fontSize: '2.8rem', fontWeight: '800', margin: 0 }}>Clinic Control Center</h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '8px' }}>Comprehensive management of staff, patients, and revenue.</p>
        </div>

        {/* Scaled-Up Stat Cards */}
        <div className="grid grid-4" style={{ marginBottom: '50px', gap: '30px' }}>
          <StatCard label="Doctors" value={stats?.doctors ?? "-"} icon={Stethoscope} />
          <StatCard label="Patients" value={stats?.patients ?? "-"} icon={Users} />
          <StatCard label="Appointments" value={stats?.appointments ?? "-"} icon={CalendarDays} />
          <StatCard label="Revenue" value={`Rs. ${stats?.revenue ?? "-"}`} icon={DollarSign} />
        </div>

        {/* Full-Width Tab Navigation */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '3px solid #f1f5f9' }}>
          {[
            { id: 'overview', label: 'Staff Directory', icon: <ClipboardList size={22}/> },
            { id: 'add-doctor', label: 'Onboard Doctor', icon: <UserPlus size={22}/> },
            { id: 'availability', label: 'Scheduling', icon: <Clock size={22}/> },
            { id: 'payments', label: 'Financials', icon: <CreditCard size={22}/> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(""); setError(""); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 40px', border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem',
                color: activeTab === tab.id ? maroon : '#94a3b8',
                borderBottom: activeTab === tab.id ? `5px solid ${maroon}` : '5px solid transparent',
                transition: 'all 0.2s', marginBottom: '-3px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div style={{ padding: '20px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '12px', marginBottom: '30px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
            <CheckCircle2 size={20}/> {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '12px', marginBottom: '30px', border: '1px solid #fee2e2', fontSize: '1.1rem' }}>
            {error}
          </div>
        )}

        {/* Tab Content Panels - Width expanded to fit screen */}
        <div style={{ width: '100%' }}>
          
          {/* TAB 1: MEDICAL STAFF DIRECTORY */}
          {activeTab === 'overview' && (
            <div className="panel animate-in" style={{ padding: '40px', width: '100%', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '30px', fontSize: '1.8rem', fontWeight: '800' }}>Medical Staff Directory</h2>
              <div className="table-wrap">
                <table className="table" style={{ width: '100%' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr><th style={{ padding: '20px' }}>PRACTITIONER</th><th>SPECIALTIES</th><th>FEE</th></tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '25px 20px' }}>
                          <div style={{fontWeight: '900', fontSize: '1.2rem', color: '#1e293b'}}>{doc.name}</div>
                          <div className="muted" style={{fontSize: '0.95rem'}}>{doc.qualification}</div>
                        </td>
                        <td style={{ padding: '25px 20px' }}>
                          {doc.specialties.map((s: string) => <span key={s} className="chip" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>{s}</span>)}
                        </td>
                        <td style={{ padding: '25px 20px', fontWeight: '900', color: maroon, fontSize: '1.2rem' }}>Rs. {doc.consultation_fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ONBOARD DOCTOR */}
          {activeTab === 'add-doctor' && (
            <div className="panel animate-in" style={{ padding: '50px', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '35px', fontSize: '1.8rem' }}>Onboard New Practitioner</h2>
              <form onSubmit={createDoctor} className="form">
                <div className="grid grid-2" style={{ gap: '30px' }}>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Full Name</label><input style={{padding: '14px'}} value={doctorForm.name} onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Email Address</label><input style={{padding: '14px'}} type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Phone</label><input style={{padding: '14px'}} value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>System Password</label><input style={{padding: '14px'}} type="password" value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>License #</label><input style={{padding: '14px'}} value={doctorForm.license_number} onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Qualification</label><input style={{padding: '14px'}} value={doctorForm.qualification} onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Fee (PKR)</label><input style={{padding: '14px'}} type="number" value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({...doctorForm, consultation_fee: e.target.value})} required /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Experience (Years)</label><input style={{padding: '14px'}} type="number" value={doctorForm.experience_years} onChange={(e) => setDoctorForm({...doctorForm, experience_years: e.target.value})} required /></div>
                </div>
                
                {/* Specialty Picker */}
                <div className="field" style={{marginTop: '35px'}}>
                  <label style={{fontWeight: '800', marginBottom: '20px', display: 'block', fontSize: '1.1rem'}}>Clinical Specialties</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    {specialties.map((s) => (
                      <button key={s.id} type="button" onClick={() => toggleSpecialty(s.id)} className={doctorForm.specialty_ids.includes(s.id) ? "chip selected" : "chip"} style={{ padding: '10px 20px', fontSize: '1rem' }}>
                        {s.name}
                      </button>
                    ))}
                    {doctorForm.custom_specialties.map((s) => (
                      <button key={s} type="button" onClick={() => removeCustomSpecialty(s)} className="chip selected" style={{backgroundColor: '#fff1f2', color: maroon, borderColor: maroon, padding: '10px 20px', fontSize: '1rem'}}>
                        {s} <X size={14} style={{marginLeft: '8px'}}/>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '15px', maxWidth: '700px' }}>
                    <input style={{flex: 1, padding: '14px'}} value={customSpecialty} onChange={(e) => setCustomSpecialty(e.target.value)} placeholder="Other specialty, e.g. Neurologist" />
                    <button type="button" onClick={addCustomSpecialty} style={{backgroundColor: maroon, color: 'white', padding: '0 35px', borderRadius: '12px', fontWeight: '800'}}>
                      <Plus size={20} style={{marginRight: '10px'}}/> Add Other
                    </button>
                  </div>
                </div>

                <button style={{backgroundColor: maroon, color: 'white', padding: '20px 70px', borderRadius: '14px', fontWeight: '900', fontSize: '1.2rem', marginTop: '40px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(128,0,32,0.15)'}}>
                  Create Professional Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SCHEDULING */}
          {activeTab === 'availability' && (
            <div className="panel animate-in" style={{ padding: '50px', borderRadius: '24px', maxWidth: '1000px' }}>
              <h2 style={{ marginBottom: '35px', fontSize: '1.8rem' }}>Practitioner Scheduling</h2>
              <form onSubmit={createAvailability} className="form">
                <div className="field" style={{marginBottom: '25px'}}>
                  <label style={{fontSize: '1rem', fontWeight: '700'}}>Target Practitioner</label>
                  <select value={availabilityForm.doctor_id} onChange={(e) => setAvailabilityForm({...availabilityForm, doctor_id: e.target.value})} style={{width: '100%', padding: '16px', fontSize: '1.1rem'}}>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.qualification})</option>)}
                  </select>
                </div>
                <div className="grid grid-2" style={{ gap: '25px' }}>
                <div className="field">
  <label style={{fontSize: '1rem', fontWeight: '700', display: 'block', marginBottom: '12px'}}>Service Days (select multiple)</label>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
    {[
      { value: "1", label: "Mon" },
      { value: "2", label: "Tue" },
      { value: "3", label: "Wed" },
      { value: "4", label: "Thu" },
      { value: "5", label: "Fri" },
      { value: "6", label: "Sat" },
      { value: "7", label: "Sun" },
    ].map((day) => {
      const selected = (availabilityForm.day_of_week as string).split(",").includes(day.value);
      return (
        <button
          key={day.value}
          type="button"
          onClick={() => {
            const current = (availabilityForm.day_of_week as string).split(",").filter(Boolean);
            const updated = current.includes(day.value)
              ? current.filter((d) => d !== day.value)
              : [...current, day.value];
            setAvailabilityForm({ ...availabilityForm, day_of_week: updated.join(",") });
          }}
          style={{
            padding: '12px 22px',
            borderRadius: '10px',
            border: `2px solid ${selected ? maroon : '#e2e8f0'}`,
            backgroundColor: selected ? maroon : 'white',
            color: selected ? 'white' : '#475569',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {day.label}
        </button>
      );
    })}
  </div>
</div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Slot duration (Mins)</label><input style={{padding: '16px'}} type="number" value={availabilityForm.slot_duration_minutes} onChange={(e) => setAvailabilityForm({...availabilityForm, slot_duration_minutes: e.target.value})} /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>Start time</label><input style={{padding: '16px'}} type="time" value={availabilityForm.start_time} onChange={(e) => setAvailabilityForm({...availabilityForm, start_time: e.target.value})} /></div>
                  <div className="field"><label style={{fontSize: '1rem', fontWeight: '700'}}>End time</label><input style={{padding: '16px'}} type="time" value={availabilityForm.end_time} onChange={(e) => setAvailabilityForm({...availabilityForm, end_time: e.target.value})} /></div>
                </div>
                <button style={{backgroundColor: maroon, color: 'white', padding: '18px 50px', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', marginTop: '30px'}}>Confirm Schedule</button>
              </form>
            </div>
          )}

          {/* TAB 4: FINANCIALS */}
          {activeTab === 'payments' && (
            <div className="panel animate-in" style={{ padding: '50px', borderRadius: '24px', width: '100%' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '40px' }}>Financial Ledger</h2>
              <div className="table-wrap">
                <table className="table" style={{ width: '100%', fontSize: '1.2rem' }}>
                  <thead>
                  <tr style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '1px', backgroundColor: '#f8fafc' }}>
  <th style={{ padding: '25px', textAlign: 'left' }}>TX ID</th>
  <th style={{ padding: '25px', textAlign: 'left' }}>AMOUNT</th>
  <th style={{ padding: '25px', textAlign: 'left' }}>STATUS</th>
  <th style={{ padding: '25px', textAlign: 'left' }}>TIMESTAMP</th>
</tr>
                  </thead>
                  <tbody>
                    {(finance?.payments ?? []).map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '25px', fontFamily: 'monospace', color: '#475569' }}>#TXN-000{p.id}</td>
                        <td style={{ padding: '25px', fontWeight: '900', fontSize: '1.5rem', color: '#1e293b' }}>Rs. {p.amount}</td>
                        <td>
  <select
    value={p.payment_status}
    onChange={async (e) => {
      try {
        await api(`/admin/payments/${p.id}`, {
          method: "PATCH",
          body: JSON.stringify({ payment_status: e.target.value }),
        });
        setMessage("Payment status updated.");
        refresh();
      } catch {
        setError("Failed to update payment.");
      }
    }}
    style={{
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '900',
      border: '2px solid',
      cursor: 'pointer',
      backgroundColor: p.payment_status === 'paid' ? '#dcfce7' : p.payment_status === 'refunded' ? '#fef9c3' : '#fee2e2',
      color: p.payment_status === 'paid' ? '#166534' : p.payment_status === 'refunded' ? '#854d0e' : '#991b1b',
      borderColor: p.payment_status === 'paid' ? '#86efac' : p.payment_status === 'refunded' ? '#fde047' : '#fca5a5',
    }}
  >
    <option value="pending">PENDING</option>
    <option value="paid">PAID</option>
    <option value="refunded">REFUNDED</option>
    <option value="cancelled">CANCELLED</option>
  </select>
</td>
<td style={{ padding: '25px', color: '#94a3b8' }}>
  {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Awaiting Settlement"}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}