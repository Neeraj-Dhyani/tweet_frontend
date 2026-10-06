import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate("/");
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
        <h1>Sign in to Wire</h1>
        {error && <div className="error-box">{error}</div>}
        <input placeholder="Username" required value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Password" type="password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted">Don't have an account? <Link to="/register">Sign up</Link></p>
      </form>
    </div>
  );
}
