import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { extractErrorMessage } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", bio: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await registerUser({ ...form, file });
      navigate("/login");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo logo-lg">W</div>
        <h1>Create your account</h1>
        {error && <div className="error-box">{error}</div>}
        <input placeholder="Username" required value={form.username} onChange={set("username")} />
        <input placeholder="Email" type="email" required value={form.email} onChange={set("email")} />
        <input placeholder="Password" type="password" required value={form.password} onChange={set("password")} />
        <textarea placeholder="Bio (optional)" rows={2} value={form.bio} onChange={set("bio")} />
        <label className="file-label">
          Profile photo (optional)
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating…" : "Sign up"}
        </button>
        <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
