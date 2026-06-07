"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  LockKeyhole, 
  Mail, 
  ShieldCheck, 
  Stethoscope, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  BadgeCheck, 
  Globe, 
  Shield 
} from "lucide-react";
import { api, setSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(data.token, data.user);
      router.push(`/${data.user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const blackMaroon = "#3d000f";
  const classicMaroon = "#800020";

  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw", 
      display: "flex", 
      overflow: "hidden", 
      fontFamily: "Inter, system-ui, sans-serif",
      margin: 0,
      padding: 0
    }}>
      
      {/* LEFT: Branding Hero Section (50% Equal Split) */}
      <section style={{ 
        flex: "0 0 50%", // Adjusted to exactly 50%
        background: `linear-gradient(135deg, ${blackMaroon} 0%, ${classicMaroon} 100%)`, 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        padding: "0 6%",
        position: "relative",
        color: "white"
      }}>
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          opacity: 0.05, 
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", 
          backgroundSize: "40px 40px" 
        }}></div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
            <div style={{ background: "white", padding: "10px", borderRadius: "12px" }}>
              <Stethoscope size={32} color={blackMaroon} />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-1px", margin: 0 }}>
              ClinicMS <span style={{ fontWeight: "300", opacity: 0.7 }}>PRO</span>
            </h1>
          </div>

          <h2 style={{ fontSize: "3.8rem", fontWeight: "900", lineHeight: "1.1", letterSpacing: "-2px", marginBottom: "25px", margin: 0 }}>
            Modernize your <br/> 
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Clinical Workflow.</span>
          </h2>

          <p style={{ fontSize: "1.2rem", lineHeight: "1.6", opacity: 0.8, maxWidth: "480px", marginBottom: "40px", fontWeight: "300" }}>
            Securely manage appointments, records, and diagnostics with enterprise-grade encryption.
          </p>

          <div style={{ display: "flex", gap: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={18} color="#4ade80" />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", opacity: 0.9 }}>HIPAA Compliant</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe size={18} color="#60a5fa" />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", opacity: 0.9 }}>Global Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: Professional Login Form (50% Equal Split) */}
      <section style={{ 
        flex: "0 0 50%", // Adjusted to exactly 50%
        backgroundColor: "#FFFFFF", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "60px" 
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ width: "40px", height: "4px", backgroundColor: classicMaroon, marginBottom: "16px" }}></div>
            <h3 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#111", letterSpacing: "-1px", marginBottom: "8px", margin: 0 }}>Sign In</h3>
            <p style={{ color: "#666", fontSize: "1rem", margin: "8px 0 0 0" }}>Enter your professional credentials.</p>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: "800", color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>Professional Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "0", top: "14px", color: "#222" }} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "14px 0 14px 35px", 
                    border: "none", 
                    borderBottom: "2px solid #EEE", 
                    outline: "none", 
                    fontSize: "1.05rem",
                    backgroundColor: "transparent" 
                  }}
                  placeholder="name@clinic.test"
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: "800", color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>Security Password</label>
                <a href="#" style={{ fontSize: "0.8rem", fontWeight: "700", color: classicMaroon, textDecoration: "none" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <LockKeyhole size={18} style={{ position: "absolute", left: "0", top: "14px", color: "#222" }} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "14px 40px 14px 35px", 
                    border: "none", 
                    borderBottom: "2px solid #EEE", 
                    outline: "none", 
                    fontSize: "1.05rem",
                    backgroundColor: "transparent"
                  }}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0", top: "14px", background: "none", border: "none", cursor: "pointer", color: "#999" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: "12px", 
                backgroundColor: "#FFF5F5", 
                color: "#C53030", 
                borderRadius: "8px", 
                fontSize: "0.85rem", 
                fontWeight: "600", 
                border: "1px solid #FEB2B2",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <Activity size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              style={{ 
                backgroundColor: blackMaroon, 
                color: "white", 
                padding: "18px", 
                borderRadius: "12px", 
                border: "none", 
                fontWeight: "800", 
                fontSize: "1rem", 
                cursor: isLoading ? "not-allowed" : "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "12px", 
                boxShadow: `0 12px 24px rgba(61, 0, 15, 0.2)`,
                opacity: isLoading ? 0.8 : 1
              }}
            >
              {isLoading ? "Verifying..." : <><ShieldCheck size={22} /> Access Dashboard <ChevronRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: "50px", textAlign: "left" }}>
            <p style={{ fontSize: "0.95rem", color: "#666" }}>
              New member? 
              <Link href="/register" style={{ color: classicMaroon, fontWeight: "800", textDecoration: "none", marginLeft: "6px" }}>
                Create Portal Account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}