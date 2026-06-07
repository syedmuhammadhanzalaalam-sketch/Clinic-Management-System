"use client";

import {
  CalendarDays, LayoutDashboard, LogOut, Stethoscope,
  UserPlus, User, ChevronDown, Shield, HeartPulse
} from "lucide-react";
import { clearSession, getStoredUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Nav() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function logout() {
    clearSession();
    setUser(null);
    router.push("/login");
  }

  const roleColor: Record<string, string> = {
    admin: "#f59e0b",
    doctor: "#34d399",
    patient: "#60a5fa",
  };

  const roleIcon: Record<string, JSX.Element> = {
    admin: <Shield size={12} />,
    doctor: <HeartPulse size={12} />,
    patient: <User size={12} />,
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "linear-gradient(135deg, #4a0011 0%, #800020 50%, #6b001a 100%)",
      boxShadow: "0 4px 24px rgba(128,0,32,0.4)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        maxWidth: "100%", margin: "0",
        padding: "0 32px", height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* LEFT: Brand */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Stethoscope size={20} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "800", fontSize: "1.2rem", letterSpacing: "-0.3px", lineHeight: 1 }}>
              ClinicMS
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Management System
            </div>
          </div>
        </a>

        {/* CENTER: Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {user?.role === "admin" && (
            <NavLink href="/admin" icon={<LayoutDashboard size={15} />} label="Control Center" />
          )}
          {user?.role === "doctor" && (
            <NavLink href="/doctor" icon={<CalendarDays size={15} />} label="Appointments" />
          )}
          {user?.role === "patient" && (
            <>
              <NavLink href="/patient" icon={<LayoutDashboard size={15} />} label="My Portal" />
              <NavLink href="/patient/book" icon={<CalendarDays size={15} />} label="Book Appointment" />
            </>
          )}
        </div>

        {/* RIGHT: User Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", padding: "8px 16px",
                  cursor: "pointer", color: "white",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: "32px", height: "32px", borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "800", fontSize: "0.9rem", color: "white",
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "white", lineHeight: 1.2 }}>
                    {user.name}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "0.7rem", color: roleColor[user.role] ?? "#fff",
                    fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    {roleIcon[user.role]} {user.role}
                  </div>
                </div>
                <ChevronDown size={14} color="rgba(255,255,255,0.6)"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}
                />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "white", borderRadius: "16px", minWidth: "200px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  border: "1px solid #f1f5f9", overflow: "hidden", zIndex: 200,
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.95rem" }}>{user.name}</div>
                    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{user.email}</div>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "12px 16px", borderRadius: "10px", border: "none",
                        background: "transparent", cursor: "pointer", color: "#dc2626",
                        fontWeight: "600", fontSize: "0.9rem",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <a href="/register" style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white", textDecoration: "none",
                fontSize: "0.9rem", fontWeight: "600",
              }}>
                <UserPlus size={15} /> Register
              </a>
              <a href="/login" style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "10px",
                background: "white", color: "#800020",
                textDecoration: "none", fontSize: "0.9rem", fontWeight: "700",
              }}>
                Login
              </a>
            </div>
          )}
        </div>
      </div>

      {dropdownOpen && (
        <div onClick={() => setDropdownOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      )}
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: JSX.Element; label: string }) {
  return (
    <a href={href} style={{
      display: "flex", alignItems: "center", gap: "7px",
      padding: "8px 16px", borderRadius: "10px",
      color: "rgba(255,255,255,0.75)", textDecoration: "none",
      fontSize: "0.9rem", fontWeight: "600",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
      }}
    >
      {icon} {label}
    </a>
  );
}
