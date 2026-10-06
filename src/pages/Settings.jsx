import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteAccount, removeAvatar, updateUser, updateUserBio, uploadAvatar } from "../api";
import { extractErrorMessage } from "../api/client";
import Avatar from "../components/Avatar";

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState({ username: user.username || "", email: user.email || "" });
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn, okMessage) {
    setStatus("");
    setError("");
    setBusy(true);
    try {
      await fn();
      if (okMessage) setStatus(okMessage);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head"><h1>Settings</h1></header>
      {status && <div className="ok-box m">{status}</div>}
      {error && <div className="error-box m">{error}</div>}

      <section className="setting">
        <h2>Profile photo</h2>
        <div className="setting-row">
          <Avatar user={user} size={64} />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="setting-row">
          <button className="btn btn-primary" disabled={busy || !file}
            onClick={() => run(async () => { await uploadAvatar(file); setFile(null); await refreshUser(); }, "Photo updated.")}>
            Upload
          </button>
          {user.avatar && (
            <button className="btn btn-outline" disabled={busy}
              onClick={() => run(async () => { await removeAvatar(); await refreshUser(); }, "Photo removed.")}>
              Remove
            </button>
          )}
        </div>
      </section>

      <section className="setting">
        <h2>Account</h2>
        <input value={details.username} placeholder="Username"
          onChange={(e) => setDetails({ ...details, username: e.target.value })} />
        <input value={details.email} type="email" placeholder="Email"
          onChange={(e) => setDetails({ ...details, email: e.target.value })} />
        <button className="btn btn-primary" disabled={busy}
          onClick={() => run(async () => { await updateUser(details); await refreshUser(); }, "Account updated.")}>
          Save
        </button>
      </section>

      <section className="setting">
        <h2>Bio</h2>
        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        <button className="btn btn-primary" disabled={busy}
          onClick={() => run(async () => { await updateUserBio(bio); await refreshUser(); }, "Bio updated.")}>
          Save
        </button>
      </section>

      <section className="setting danger">
        <h2>Delete account</h2>
        <p className="muted">This permanently removes your account and uploads.</p>
        <button className="btn btn-danger" disabled={busy}
          onClick={() => {
            if (!window.confirm("Delete your account? This can't be undone.")) return;
            run(async () => { await deleteAccount(); logout(); navigate("/register"); });
          }}>
          Delete account
        </button>
      </section>
    </>
  );
}
