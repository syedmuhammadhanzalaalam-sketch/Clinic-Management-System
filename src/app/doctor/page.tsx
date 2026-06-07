"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  CalendarCheck, 
  Clock, 
  ClipboardList, 
  User, 
  ArrowUpRight, 
  Activity,
  ChevronRight
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";

export default function DoctorPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const maroon = "#800020";

  useEffect(() => {
    api("/doctor/appointments").then(setAppointments);
  }, []);

  const active = useMemo(() => 
    appointments.filter((item) => ["pending", "confirmed", "in-progress"].includes(item.status)).length, 
    [appointments]
  );
  const completed = useMemo(() => 
    appointments.filter((item) => item.status === "completed").length, 
    [appointments]
  );

  return (
    <AppShell>
      {/* Full-Screen Fluid Wrapper */}
      <div style={{ width: '100%', padding: '20px 40px', maxWidth: '100%' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: maroon, fontSize: '2.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
            Practitioner Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '8px' }}>
            Open appointments, review patient history, and complete visits with AI support.
          </p>
        </div>

        {/* Massive Stat Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '30px', 
          marginBottom: '50px' 
        }}>
          {[
            { label: "Active Visits", value: active, icon: Clock, color: '#eff6ff', iconColor: '#2563eb' },
            { label: "Completed", value: completed, icon: CalendarCheck, color: '#f0fdf4', iconColor: '#16a34a' },
            { label: "Total Load", value: appointments.length, icon: ClipboardList, color: '#fff1f2', iconColor: maroon },
          ].map((stat, idx) => (
            <div key={idx} style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid #eef2f6',
              boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {stat.label}
                </span>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginTop: '10px' }}>
                  {stat.value}
                </div>
              </div>
              <div style={{ backgroundColor: stat.color, padding: '20px', borderRadius: '20px' }}>
                <stat.icon size={40} color={stat.iconColor} />
              </div>
            </div>
          ))}
        </div>

        {/* Professional Appointment Table */}
        <section className="panel" style={{ padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Activity size={28} color={maroon} /> Today's Schedule
            </h2>
            <div style={{ padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table" style={{ width: '100%', fontSize: '1.1rem', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
              <thead>
                <tr style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  <th style={{ padding: '15px 25px' }}>Time & Date</th>
                  <th>Patient Identity</th>
                  <th>Visit Status</th>
                  <th>Primary Reason</th>
                  <th style={{ textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id} style={{ backgroundColor: '#ffffff', transition: 'transform 0.2s' }}>
                    <td style={{ padding: '25px', borderRadius: '16px 0 0 16px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{item.appointment_date}</div>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>{item.start_time} - {item.end_time}</div>
                    </td>
                    <td style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                          <User size={20} color={maroon} />
                        </div>
                        <span style={{ fontWeight: '700' }}>{item.patient_name}</span>
                      </div>
                    </td>
                    <td style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                      <span className={`badge ${item.status}`} style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem', 
                        fontWeight: '800',
                        backgroundColor: item.status === 'completed' ? '#dcfce7' : '#fff7ed',
                        color: item.status === 'completed' ? '#166534' : '#9a3412'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '1rem' }}>
                      {item.reason_for_visit}
                    </td>
                    <td style={{ textAlign: 'right', padding: '25px', borderRadius: '0 16px 16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                      <Link 
                        href={`/doctor/appointments/${item.id}`}
                        style={{ 
                          backgroundColor: maroon, 
                          color: 'white', 
                          padding: '12px 24px', 
                          borderRadius: '12px', 
                          textDecoration: 'none', 
                          fontWeight: '800', 
                          fontSize: '0.95rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(128,0,32,0.15)'
                        }}
                      >
                        Open Visit <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <ClipboardList size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                <p>No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}