import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { deleteTweet, toggleSupport } from "../api";
import { extractErrorMessage } from "../api/client";
import { imagesOf, timeAgo, tweetUserId } from "../utils";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function TweetCard({ tweet, commentCount, detail = false, onDeleted }) {
  const { user } = useAuth();
  const { cache, supported, markSupported } = useSocial();
  const navigate = useNavigate();
  const authorId = tweetUserId(tweet);
  const author = cache[String(authorId)];
  const isMine = String(authorId) === String(user.id);
  const on = supported.includes(String(tweet.id));
  const [count, setCount] = useState(tweet.support ?? 0);
  const [error, setError] = useState("");
  const images = imagesOf(tweet);

  async function support(e) {
    e.stopPropagation();
    setError("");
    const next = !on;
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    markSupported(tweet.id, next);
    try {
      await toggleSupport(tweet.id);
    } catch (err) {
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      markSupported(tweet.id, !next);
      setError(extractErrorMessage(err));
    }
  }

  async function remove(e) {
    e.stopPropagation();
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteTweet(tweet.id);
      onDeleted?.(tweet.id);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <article
      className={`tweet ${detail ? "tweet-detail" : "tweet-click"}`}
      onClick={() => !detail && navigate(`/tweet/${tweet.id}`)}
    >
      <Link to={`/user/${authorId}`} onClick={(e) => e.stopPropagation()}>
        <Avatar user={author} size={44} />
      </Link>
      <div className="tweet-main">
        <header className="tweet-head">
          <Link to={`/user/${authorId}`} onClick={(e) => e.stopPropagation()} className="name">
            {author?.username || `User ${authorId}`}
          </Link>
          <span className="muted">@{author?.username || authorId}</span>
          <span className="muted">· {timeAgo(tweet.created_at)}</span>
        </header>
        <p className="tweet-text">{tweet.content}</p>
        {images.length > 0 && (
          <div className={`media media-${Math.min(images.length, 4)}`}>
            {images.slice(0, 4).map((src) => (
              <div className="media-item" key={src}><img src={`${import.meta.env.VITE_API_HOST}/${src}`} alt="" loading="lazy" /></div>
            ))}
          </div>
        )}
        <footer className="tweet-actions">
          <span className="action action-comment">
            <Icon name="comment" size={18} />
            {commentCount > 0 && <em>{commentCount}</em>}
          </span>
          <button className={`action action-support ${on ? "on" : ""}`} onClick={support} title="Support">
            <Icon name="heart" size={18} filled={on} />
            {count > 0 && <em>{count}</em>}
          </button>
          {isMine && (
            <button className="action action-delete" onClick={remove} title="Delete">
              <Icon name="trash" size={18} />
            </button>
          )}
        </footer>
        {error && <div className="error-text">{error}</div>}
      </div>
    </article>
  );
}
