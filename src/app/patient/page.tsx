"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  CalendarCheck, 
  CalendarPlus, 
  FileText, 
  Upload, 
  Clock, 
  User, 
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { api, API_URL } from "@/lib/api";

export default function PatientPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const maroon = "#800020";

  useEffect(() => {
    setMounted(true);
    api("/patient/dashboard").then(setDashboard);
  }, []);

  const upcoming = useMemo(() => {
    const items = dashboard?.appointments || [];
    return items.filter((item: any) => ["pending", "confirmed"].includes(item.status)).length;
  }, [dashboard]);

  if (!mounted) return null;

  return (
    <AppShell>
      {/* 100% Width Fluid Container */}
      <div style={{ width: '100%', padding: '20px 40px', maxWidth: '100%' }}>
        
        {/* Professional Header with Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px' 
        }}>
          <div>
            <h1 style={{ color: maroon, fontSize: '2.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
              Patient Portal
            </h1>
            <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '8px' }}>
              Book visits, review appointment history, and manage lab reports.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: 15 }}>
            <Link href="/patient/book" style={{ 
              backgroundColor: maroon, color: 'white', padding: '14px 28px', borderRadius: '12px', 
              textDecoration: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 4px 12px rgba(128,0,32,0.2)'
            }}>
              <CalendarPlus size={20} /> Book Appointment
            </Link>
            <Link href="/patient/upload" style={{ 
              backgroundColor: '#f1f5f9', color: '#475569', padding: '14px 28px', borderRadius: '12px', 
              textDecoration: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <Upload size={20} /> Upload Report
            </Link>
          </div>
        </div>

        {/* Scaled-Up Stat Cards */}
        <div className="grid grid-3" style={{ gap: '30px', marginBottom: '50px' }}>
          <StatCard label="Upcoming Visits" value={upcoming} icon={Clock} />
          <StatCard label="Total Appointments" value={dashboard?.appointments?.length ?? "-"} icon={CalendarPlus} />
          <StatCard label="Lab Reports" value={dashboard?.reports?.length ?? "-"} icon={FileText} />
        </div>

        <div className="grid grid-2" style={{ gap: '30px' }}>
          
          {/* APPOINTMENT TIMELINE - Professional Table Layout */}
          <section className="panel" style={{ padding: '35px', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardList size={24} color={maroon} /> Appointment Timeline
            </h2>
            <div className="table-wrap">
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
              <thead>
  <tr style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
    <th style={{ padding: '10px 20px', textAlign: 'left' }}>Date & Time</th>
    <th style={{ padding: '10px 20px', textAlign: 'left' }}>Consultant</th>
    <th style={{ padding: '10px 20px', textAlign: 'left' }}>Status</th>
  </tr>
</thead>
                <tbody>
                  {dashboard?.appointments?.map((item: any) => (
                    <tr key={item.id} style={{ backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '16px 20px', borderRadius: '12px 0 0 12px', textAlign: 'left', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{item.appointment_date}</div>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>{item.start_time} - {item.end_time}</div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'left', verticalAlign: 'middle', fontWeight: '700' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color={maroon} />
                        {item.doctor_name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', borderRadius: '0 12px 12px 0', textAlign: 'left', verticalAlign: 'middle' }}>
                      <span style={{
                        padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900',
                        backgroundColor: item.status === 'completed' ? '#dcfce7' : item.status === 'confirmed' ? '#eff6ff' : '#fff7ed',
                        color: item.status === 'completed' ? '#166534' : item.status === 'confirmed' ? '#1e40af' : '#9a3412',
                        textTransform: 'uppercase' as const,
                        display: 'inline-block'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
              {!dashboard?.appointments?.length && <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>No appointments yet.</p>}
            </div>
          </section>

          {/* LAB REPORTS - Modern List Design */}
          <section className="panel" style={{ padding: '35px', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color={maroon} /> Clinical Lab Reports
            </h2>
            <div className="list" style={{ display: 'grid', gap: '15px' }}>
              {dashboard?.reports?.map((report: any) => (
                <div key={report.id} style={{ 
                  padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#fff1f2', padding: '12px', borderRadius: '12px' }}>
                      <FileText size={20} color={maroon} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{report.report_name}</strong>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>{report.report_type || "Diagnostic Report"} • {report.uploaded_at}</div>
                    </div>
                  </div>
                  <a className="button" href={`${API_URL}${report.file_url}`} target="_blank" style={{ 
                    padding: '8px 16px', backgroundColor: 'transparent', color: maroon, border: `1px solid ${maroon}`,
                    fontSize: '0.85rem', fontWeight: '800', borderRadius: '8px', textDecoration: 'none'
                  }}>
                    View Results <ArrowRight size={14} style={{ marginLeft: '5px' }} />
                  </a>
                </div>
              ))}
              {!dashboard?.reports?.length && (
                <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                  <Upload size={40} style={{ marginBottom: '10px' }} />
                  <p className="muted">No lab reports uploaded yet.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}