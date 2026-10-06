import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { postTweet } from "../api";
import { extractErrorMessage } from "../api/client";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await postTweet({ content: content.trim(), files });
      setContent("");
      setFiles([]);
      onPosted?.();
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="composer">
      <Avatar user={user} size={44} />
      <div className="composer-body">
        <textarea
          placeholder="What is happening?"
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {previews.length > 0 && (
          <div className={`media media-${Math.min(previews.length, 4)}`}>
            {previews.map((src, i) => (
              <div className="media-item" key={src}>
                <img src={src} alt="" />
                <button className="media-remove" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
        <div className="composer-bar">
          <button className="icon-btn accent" title="Add images" onClick={() => fileInput.current.click()}>
            <Icon name="image" />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])].slice(0, 4))}
          />
          <button className="btn btn-primary" disabled={busy || !content.trim()} onClick={submit}>
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
