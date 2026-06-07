"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, FileUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default function UploadReportPage() {
  const router = useRouter();
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const maroon = "#800020";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsUploading(true);
    
    try {
      const form = new FormData();
      form.set("report_name", reportName);
      form.set("report_type", reportType);
      form.set("notes", notes);
      if (file) form.set("file", file);
      
      await api("/patient/lab-reports", { method: "POST", body: form });
      router.push("/patient");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <AppShell>
      <div style={{ width: '100%', padding: '40px 60px', maxWidth: '100%', minHeight: '100vh', backgroundColor: '#fcfcfc' }}>
        
        {/* Header - Aligned Left */}
        <div style={{ maxWidth: '900px', margin: '0 auto 40px auto' }}>
          <h1 style={{ color: maroon, fontSize: '3.2rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' }}>
            Upload Lab Report
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '10px' }}>
            Add your diagnostic results to your digital health record for doctor review.
          </p>
        </div>

        {/* Main Panel - Perfectly Aligned */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <section className="panel" style={{ padding: '50px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', backgroundColor: 'white' }}>
            <form className="form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Row 1: Aligned Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%' }}>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Report Name</label>
                  <input 
                    placeholder="e.g. Annual Blood Work"
                    style={{ padding: '16px', borderRadius: '12px', fontSize: '1.1rem', width: '100%', border: '1px solid #e2e8f0' }}
                    value={reportName} 
                    onChange={(e) => setReportName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Report Type</label>
                  <input 
                    placeholder="e.g. CBC, X-Ray, ECG"
                    style={{ padding: '16px', borderRadius: '12px', fontSize: '1.1rem', width: '100%', border: '1px solid #e2e8f0' }}
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)} 
                  />
                </div>
              </div>

              {/* Row 2: Document Zone */}
              <div className="field" style={{ margin: 0 }}>
                <label style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Clinical Document</label>
                <div style={{
                  border: `2px dashed ${file ? maroon : '#cbd5e1'}`,
                  borderRadius: '24px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  backgroundColor: file ? '#fff1f2' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    required 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  {!file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '50%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                        <UploadCloud size={35} color={maroon} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.3rem', color: '#1e293b' }}>Click or drag file to upload</strong>
                        <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1rem' }}>PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      <FileUp size={35} color={maroon} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: maroon, fontSize: '1.2rem' }}>{file.name}</strong>
                        <div style={{ color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</div>
                      </div>
                      <button type="button" onClick={() => setFile(null)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Notes */}
              <div className="field" style={{ margin: 0 }}>
                <label style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Patient Notes (Optional)</label>
                <textarea 
                  placeholder="Add any specific details for your doctor..."
                  style={{ padding: '20px', borderRadius: '16px', minHeight: '150px', fontSize: '1.1rem', width: '100%', border: '1px solid #e2e8f0', resize: 'none' }}
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                />
              </div>

              {error && (
                <div style={{ padding: '15px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              {/* Submit Button - Perfectly Spaced */}
              <button 
                disabled={isUploading || !file}
                style={{ 
                  backgroundColor: maroon, color: 'white', padding: '22px', 
                  borderRadius: '18px', fontWeight: '900', fontSize: '1.3rem',
                  width: '100%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px',
                  boxShadow: '0 10px 30px rgba(128,0,32,0.2)',
                  transition: 'transform 0.1s',
                  marginTop: '10px'
                }}
              >
                {isUploading ? "Uploading..." : <><CheckCircle2 size={24} /> Submit Lab Report</>}
              </button>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}