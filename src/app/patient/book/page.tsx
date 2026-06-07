"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Clock, User, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const maroon = "#800020";

  useEffect(() => {
    api("/doctors").then((items) => {
      setDoctors(items);
      if (items.length > 0) setDoctorId(String(items[0].id));
    });
  }, []);

  async function loadSlots() {
    if (!doctorId || !date) {
      setMessage("Please select a doctor and date first.");
      return;
    }
    setLoadingSlots(true);
    setMessage("");
    try {
      const data = await api(`/doctors/${doctorId}/slots?appointment_date=${date}`);
      setSlots(data);
      if (data.length > 0) setStartTime(data[0]);
      if (!data.length) setMessage("No open slots for this date.");
    } catch (err) {
      setMessage("Error loading availability.");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await api("/patient/appointments", {
      method: "POST",
      body: JSON.stringify({ 
        doctor_id: Number(doctorId), 
        appointment_date: date, 
        start_time: startTime, 
        reason_for_visit: reason 
      }),
    });
    router.push("/patient");
  }

  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === doctorId);

  return (
    <AppShell>
      <div style={{ width: '100%', padding: '20px 60px', maxWidth: '100%' }}>
        
        {/* Professional Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: maroon, fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
            Book Your Visit
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '8px' }}>
            Select a specialist and reserve your preferred time slot instantly.
          </p>
        </div>

        <div className="grid grid-2" style={{ gap: '40px', alignItems: 'start' }}>
          
          {/* STEP 1: DOCTOR & DATE SELECTION */}
          <section className="panel" style={{ padding: '40px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={24} color={maroon} /> Select Specialist
            </h2>
            
            <div className="form">
              <div className="field">
                <label style={{ fontWeight: '700' }}>Choose Doctor</label>
                <select 
                  value={doctorId} 
                  onChange={(e) => { setDoctorId(e.target.value); setSlots([]); }}
                  style={{ padding: '15px', fontSize: '1.1rem', borderRadius: '12px' }}
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialties.join(", ")}</option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div style={{ 
                  backgroundColor: '#f8fafc', padding: '25px', borderRadius: '20px', 
                  border: '1px solid #e2e8f0', margin: '25px 0', display: 'flex', gap: '20px', alignItems: 'center' 
                }}>
                  <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Stethoscope size={30} color={maroon} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.2rem', color: '#1e293b' }}>{selectedDoctor.qualification}</strong>
                    <div style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>
                      Experience: {selectedDoctor.experience_years} Years • <strong>Fee: Rs. {selectedDoctor.consultation_fee}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="field">
                <label style={{ fontWeight: '700' }}>Preferred Date</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => { setDate(e.target.value); setSlots([]); }} 
                    style={{ padding: '15px', fontSize: '1.1rem', borderRadius: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={loadSlots} 
                disabled={loadingSlots}
                style={{ 
                  backgroundColor: '#f1f5f9', color: maroon, border: `2px solid ${maroon}`, 
                  fontWeight: '800', width: '100%', padding: '15px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px'
                }}
              >
                {loadingSlots ? "Searching..." : <><Search size={20} /> View Available Slots</>}
              </button>
              
              {message && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                  <Info size={18} /> {message}
                </div>
              )}
            </div>
          </section>

          {/* STEP 2: SLOT SELECTION & REASON */}
          <section className="panel" style={{ padding: '40px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', opacity: slots.length ? 1 : 0.5, pointerEvents: slots.length ? 'auto' : 'none', transition: 'all 0.3s' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={24} color={maroon} /> Select Time & Confirm
            </h2>
            
            <form onSubmit={submit} className="form">
              <label style={{ fontWeight: '700', marginBottom: '15px', display: 'block' }}>Available Time Slots</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: '12px', 
                marginBottom: '30px' 
              }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setStartTime(slot)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px solid',
                      borderColor: startTime === slot ? maroon : '#e2e8f0',
                      backgroundColor: startTime === slot ? maroon : 'white',
                      color: startTime === slot ? 'white' : '#1e293b',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="field">
                <label style={{ fontWeight: '700' }}>Reason for Consultation</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  required 
                  placeholder="E.g. Persistent fever, follow-up, etc."
                  style={{ padding: '15px', borderRadius: '12px', minHeight: '120px' }}
                />
              </div>

              <button 
                disabled={!startTime}
                style={{ 
                  backgroundColor: maroon, color: 'white', padding: '20px', 
                  borderRadius: '16px', fontWeight: '900', fontSize: '1.2rem',
                  width: '100%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: '0 10px 20px rgba(128,0,32,0.15)'
                }}
              >
                <CheckCircle2 size={24} /> Confirm Appointment
              </button>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// Helper icon component for the preview card
function Stethoscope({ size, color }: { size: number, color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}