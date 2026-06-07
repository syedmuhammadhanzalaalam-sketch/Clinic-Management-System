"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Nav } from "@/components/Nav";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api("/auth/register-patient", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess("Account created. Redirecting to login...");
      setTimeout(() => router.push("/login"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="shell">
      <Nav />
      <main className="container">
        <div className="toolbar">
          <div className="page-title">
            <h1>Create Patient Account</h1>
            <span className="muted">Register once, then book appointments and upload reports from your portal.</span>
          </div>
        </div>
        <section className="panel">
          <form className="form" onSubmit={submit}>
            <div className="grid grid-3">
              <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></div>
              <div className="field"><label>Password</label><input type="password" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} required /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div className="field"><label>Date of birth</label><input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} required /></div>
              <div className="field">
                <label>Gender</label>
                <select value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field"><label>Blood group</label><input value={form.blood_group} onChange={(e) => update("blood_group", e.target.value)} /></div>
              <div className="field"><label>Emergency contact name</label><input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} /></div>
              <div className="field"><label>Emergency contact phone</label><input value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} /></div>
            </div>
            <div className="field"><label>Address</label><textarea value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button><UserPlus size={16} /> Create Account</button>
              <Link className="button secondary" href="/login">Back to Login</Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
