"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  BrainCircuit, 
  FileText, 
  HeartPulse, 
  ClipboardList, 
  Stethoscope, 
  Activity, 
  AlertTriangle,
  Clock,
  History,
  Users,
  CheckCircle2,
  X
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api, API_URL } from "@/lib/api";

export default function VisitPage() {
  const params = useParams();
  const appointmentId = Number(params.id);
  
  // UI & Data State
  const [activeTab, setActiveTab] = useState("notes"); 
  const [detail, setDetail] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Consultation Form State
  const [form, setForm] = useState({
    symptoms: "",
    temperature: "",
    blood_pressure: "",
    pulse: "",
    oxygen: "",
    weight: "",
    examination_notes: "",
    diagnosis: "",
    treatment_plan: "",
  });

  const maroon = "#800020";

  useEffect(() => {
    if (appointmentId) {
      api(`/doctor/appointments/${appointmentId}`).then((data) => {
        setDetail(data);
        setAssessment(data.latest_assessment);
        setForm((current) => ({ ...current, symptoms: data.appointment.reason_for_visit || "" }));
      }).catch(() => setError("Failed to retrieve clinical data."));
    }
  }, [appointmentId]);

  const update = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await api("/doctor/visits", {
        method: "POST",
        body: JSON.stringify({
          appointment_id: appointmentId,
          symptoms: form.symptoms,
          vitals: {
            temperature: form.temperature,
            blood_pressure: form.blood_pressure,
            pulse: form.pulse,
            oxygen: form.oxygen,
            weight: form.weight,
          },
          examination_notes: form.examination_notes,
          diagnosis: form.diagnosis,
          treatment_plan: form.treatment_plan,
        }),
      });
      setAssessment(data.assessment);
      setSuccess("Consultation saved. AI support generated.");
      setActiveTab("ai-support");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      {/* Dynamic Styles for Overlap Fix and Blinking Risk */}
      <style>{`
        @keyframes blink-red {
          0% { opacity: 1; background-color: #ef4444; }
          50% { opacity: 0.6; background-color: #7f1d1d; }
          100% { opacity: 1; background-color: #ef4444; }
        }
        .risk-high {
          animation: blink-red 1s infinite ease-in-out;
          color: white !important;
        }
      `}</style>

      <div style={{ width: '100%', padding: '20px 60px', maxWidth: '100%', backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
        
        {/* Patient Identity Bar with Overlap Fix */}
        <div style={{ 
          backgroundColor: 'white', padding: '30px 40px', borderRadius: '24px', border: '1px solid #eef2f6',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', marginBottom: '40px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', gap: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1 }}>
            <div style={{ 
              width: '90px', height: '90px', backgroundColor: '#fdf2f2', borderRadius: '22px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${maroon}15` 
            }}>
              <Users size={45} color={maroon} />
            </div>
            <div>
              <h1 style={{ color: maroon, fontSize: '3.5rem', fontWeight: '900', margin: 0, letterSpacing: '-2px', lineHeight: '0.9' }}>
                {detail?.patient?.name || "Ali Hassan"}
              </h1>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '8px 20px', borderRadius: '100px', fontSize: '1rem', fontWeight: '800' }}>
                  {detail?.patient?.gender || "Male"}
                </span>
                <span style={{ backgroundColor: '#fff1f2', color: maroon, padding: '8px 20px', borderRadius: '100px', fontSize: '1rem', fontWeight: '800', border: `1px solid ${maroon}10` }}>
                  Blood: {detail?.patient?.blood_group || "B+"}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} /> {detail?.appointment?.appointment_date || "2026-05-22"} | {detail?.appointment?.start_time || "15:30"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '220px', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Consultation Status
            </span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 24px', borderRadius: '14px', fontWeight: '900', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
              IN-PROGRESS
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '3px solid #f1f5f9' }}>
          {[
            { id: 'summary', label: 'Patient History', icon: <History size={24}/> },
            { id: 'notes', label: 'Consultation Notes', icon: <ClipboardList size={24}/> },
            { id: 'ai-support', label: 'AI Clinical Support', icon: <BrainCircuit size={24}/> },
          ].map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 50px', border: 'none',
                backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.2rem',
                color: activeTab === tab.id ? maroon : '#94a3b8',
                borderBottom: activeTab === tab.id ? `6px solid ${maroon}` : '6px solid transparent',
                transition: 'all 0.2s', marginBottom: '-3px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ width: '100%' }}>
          
          {/* TAB 1: PATIENT HISTORY */}
          {activeTab === 'summary' && (
            <div className="grid grid-2 animate-in" style={{ gap: '40px' }}>
              <section className="panel" style={{ padding: '40px', borderRadius: '32px' }}>
                <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}><Activity size={28} color={maroon}/> Medical Records</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ backgroundColor: '#fcfcfc', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ color: maroon, marginBottom: '20px', fontSize: '1.2rem' }}>Chronic Conditions</h3>
                    {detail?.history?.map((item: any, i: number) => (
                      <div key={i} style={{ marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{item.condition_name}</strong>
                        <p className="muted" style={{ margin: '5px 0' }}>{item.description}</p>
                      </div>
                    ))}
                    {!detail?.history?.length && <p className="muted">No history found.</p>}
                  </div>
                  <div style={{ backgroundColor: '#fff1f2', padding: '25px', borderRadius: '20px', border: '1px solid #ffe4e6' }}>
                    <h3 style={{ color: maroon, marginBottom: '20px', fontSize: '1.2rem' }}>Active Allergies</h3>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {detail?.allergies?.map((item: any, i: number) => (
                        <span key={i} className={`badge ${item.severity}`} style={{ padding: '10px 25px', fontSize: '1rem', fontWeight: '800' }}>
                          {item.allergy_name}
                        </span>
                      ))}
                      {!detail?.allergies?.length && <p className="muted">No known allergies.</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel" style={{ padding: '40px', borderRadius: '32px' }}>
                <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}><FileText size={28} color={maroon}/> Laboratory Reports</h2>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {detail?.reports?.map((report: any, i: number) => (
                    <div key={i} style={{ padding: '25px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{report.report_name}</div>
                        <div className="muted">Diagnostic Imaging</div>
                      </div>
                      <a className="text-link" style={{ fontWeight: '800' }} href={`${API_URL}${report.file_url}`} target="_blank">View File</a>
                    </div>
                  ))}
                  {!detail?.reports?.length && <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>No reports uploaded.</p>}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: CONSULTATION NOTES */}
          {activeTab === 'notes' && (
            <div className="panel animate-in" style={{ padding: '60px', borderRadius: '32px', maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '40px', fontSize: '2.2rem', fontWeight: '900' }}>Consultation Findings</h2>
              <form onSubmit={submit} className="form">
                <div className="field">
                  <label style={{ fontSize: '1.1rem', fontWeight: '800' }}>Presenting Symptoms</label>
                  <textarea rows={4} style={{ padding: '25px' }} value={form.symptoms} onChange={(e) => update("symptoms", e.target.value)} required />
                </div>
                
                <div className="grid grid-5" style={{ gap: '20px', background: '#f8fafc', padding: '35px', borderRadius: '24px', margin: '30px 0', border: '1px solid #eef2f6' }}>
                  <div className="field"><label>Temp (°C)</label><input value={form.temperature} onChange={(e) => update("temperature", e.target.value)} /></div>
                  <div className="field"><label>BP (mmHg)</label><input value={form.blood_pressure} onChange={(e) => update("blood_pressure", e.target.value)} /></div>
                  <div className="field"><label>Pulse (bpm)</label><input value={form.pulse} onChange={(e) => update("pulse", e.target.value)} /></div>
                  <div className="field"><label>Oxygen (%)</label><input value={form.oxygen} onChange={(e) => update("oxygen", e.target.value)} /></div>
                  <div className="field"><label>Weight (kg)</label><input value={form.weight} onChange={(e) => update("weight", e.target.value)} /></div>
                </div>

                <div className="field"><label style={{ fontWeight: '800' }}>Examination Notes</label><textarea rows={3} value={form.examination_notes} onChange={(e) => update("examination_notes", e.target.value)} /></div>
                <div className="field"><label style={{ fontWeight: '800' }}>Clinical Diagnosis</label><textarea rows={2} value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} /></div>
                <div className="field"><label style={{ fontWeight: '800' }}>Treatment & Prescriptions</label><textarea rows={5} value={form.treatment_plan} onChange={(e) => update("treatment_plan", e.target.value)} /></div>
                
                <button type="submit" disabled={isSaving} style={{ backgroundColor: maroon, padding: '22px', borderRadius: '20px', fontWeight: '900', fontSize: '1.3rem', marginTop: '30px', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                  <BrainCircuit size={28} />
                  {isSaving ? "Analyzing..." : "Save Visit & Generate AI Insights"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AI INSIGHTS */}
          {activeTab === 'ai-support' && (
            <div className="panel animate-in" style={{ padding: '60px', borderRadius: '40px' }}>
              {!assessment ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                  <BrainCircuit size={80} color="#e2e8f0" />
                  <p className="muted" style={{ marginTop: '30px', fontSize: '1.2rem' }}>Finalize consultation notes to initiate AI support.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', borderBottom: '2px solid #f1f5f9', paddingBottom: '30px' }}>
                    <h2 style={{ display: "flex", gap: 15, alignItems: "center", margin: 0, fontSize: '2.5rem' }}>
                      <BrainCircuit size={40} color={maroon} /> Clinical Decision Support
                    </h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
  <span style={{ fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
    Assessment Risk
  </span>
  <div className={assessment.risk_level === 'high' ? 'risk-high' : ''} style={{
    padding: '10px 28px', fontSize: '1.1rem', fontWeight: '900',
    borderRadius: '100px', letterSpacing: '1px', whiteSpace: 'nowrap',
    backgroundColor:
      assessment.risk_level === 'high' ? '#ef4444' :
      assessment.risk_level === 'medium' ? '#f59e0b' : '#22c55e',
    color: 'white',
    boxShadow:
      assessment.risk_level === 'high' ? '0 0 20px rgba(239,68,68,0.7), 0 0 40px rgba(239,68,68,0.4)' :
      assessment.risk_level === 'medium' ? '0 4px 15px rgba(245,158,11,0.4)' : '0 4px 15px rgba(34,197,94,0.4)',
  }}>
    {assessment.risk_level?.toUpperCase()}
  </div>
</div>
                  </div>

                  <div className="grid grid-2" style={{ gap: '60px' }}>
                    <div>
                      <h3 style={{ color: maroon, borderBottom: `2px solid ${maroon}10`, paddingBottom: '15px', marginBottom: '25px', fontSize: '1.5rem' }}>Differential Diagnoses</h3>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {assessment.possible_diagnoses?.map((item: any, i: number) => (
                          <li key={i} style={{ marginBottom: '25px', padding: '25px', backgroundColor: '#fcfcfc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <strong style={{ fontSize: '1.3rem', color: '#1e293b' }}>{item.name}</strong>
                            <p className="muted" style={{ marginTop: '10px', lineHeight: '1.6' }}>{item.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ backgroundColor: '#fff7ed', padding: '40px', borderRadius: '32px', border: '1px solid #ffedd5' }}>
                      <h3 style={{ color: '#9a3412', marginBottom: '25px', fontSize: '1.6rem', fontWeight: '900', display: 'flex', gap: '12px' }}>
                        <AlertTriangle size={28}/> Critical Warnings
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {assessment.warnings?.map((item: string, i: number) => (
                          <li key={i} style={{ 
                            padding: '20px 25px', borderLeft: '8px solid #f97316', backgroundColor: 'white', 
                            borderRadius: '16px', marginBottom: '15px', fontWeight: '700', color: '#7c2d12',
                            fontSize: '1.2rem', lineHeight: '1.5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                          }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}