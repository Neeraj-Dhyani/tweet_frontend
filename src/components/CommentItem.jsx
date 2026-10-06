import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { deleteComment, deleteReply, editComment, getRepliesByComment, replyToComment } from "../api";
import { extractErrorMessage } from "../api/client";
import { commentUserId, replyUserId, timeAgo } from "../utils";
import Avatar from "./Avatar";

function Who({ id }) {
  const { cache } = useSocial();
  const u = cache[String(id)];
  return (
    <Link to={`/user/${id}`} className="name">{u?.username || `User ${id}`}</Link>
  );
}

export default function CommentItem({ comment, onChanged }) {
  const { user } = useAuth();
  const { cache, ensure } = useSocial();
  const uid = commentUserId(comment);
  const mine = String(uid) === String(user.id);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.message);
  const [replies, setReplies] = useState(null);
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");

  const run = async (fn) => {
    setError("");
    try { await fn(); } catch (e) { setError(extractErrorMessage(e)); }
  };

  async function loadReplies() {
    const list = await getRepliesByComment(comment.id);
    setReplies(list);
    ensure(list.map(replyUserId));
  }

  const toggle = () => run(async () => {
    if (!open && replies === null) await loadReplies();
    setOpen(!open);
  });

  const sendReply = () => run(async () => {
    await replyToComment(comment.id, replyText.trim());
    setReplyText("");
    await loadReplies();
  });

  return (
    <div className="comment">
      <Avatar user={cache[String(uid)]} size={36} />
      <div className="tweet-main">
        <header className="tweet-head">
          <Who id={uid} />
          <span className="muted">· {timeAgo(comment.created_at)}</span>
        </header>

        {editing ? (
          <div className="inline-edit">
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn btn-primary btn-sm" onClick={() => run(async () => {
              await editComment(comment.id, text.trim());
              setEditing(false);
              onChanged();
            })}>Save</button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <p className="tweet-text">{comment.message}</p>
        )}

        <div className="comment-actions">
          <button className="link-btn" onClick={toggle}>{open ? "Hide replies" : "Replies"}</button>
          {mine && !editing && <button className="link-btn" onClick={() => setEditing(true)}>Edit</button>}
          {mine && (
            <button className="link-btn danger" onClick={() => run(async () => {
              if (!window.confirm("Delete this comment?")) return;
              await deleteComment(comment.id);
              onChanged();
            })}>Delete</button>
          )}
        </div>
        {error && <div className="error-text">{error}</div>}

        {open && (
          <div className="replies">
            {(replies || []).length === 0 && <p className="muted">No replies yet.</p>}
            {(replies || []).map((r) => (
              <div className="reply" key={r.id}>
                <Avatar user={cache[String(replyUserId(r))]} size={28} />
                <div className="tweet-main">
                  <header className="tweet-head">
                    <Who id={replyUserId(r)} />
                    <span className="muted">· {timeAgo(r.created_at)}</span>
                  </header>
                  <p className="tweet-text">{r.message}</p>
                  {String(replyUserId(r)) === String(user.id) && (
                    <button className="link-btn danger" onClick={() => run(async () => {
                      await deleteReply(r.id);
                      await loadReplies();
                    })}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            <div className="inline-edit">
              <input placeholder="Write a reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              <button className="btn btn-primary btn-sm" disabled={!replyText.trim()} onClick={sendReply}>Reply</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
