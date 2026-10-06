import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { commentOnTweet, getAllComments, getTweetById } from "../api";
import { extractErrorMessage } from "../api/client";
import { useSocial } from "../context/SocialContext";
import { byOldest, commentTweetId, commentUserId, tweetUserId } from "../utils";
import TweetCard from "../components/TweetCard";
import CommentItem from "../components/CommentItem";
import Icon from "../components/Icon";

export default function TweetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ensure } = useSocial();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const all = await getAllComments();
      const mine = all.filter((c) => String(commentTweetId(c)) === String(id)).sort(byOldest);
      setComments(mine);
      ensure(mine.map(commentUserId));
    } catch { /* keep what we have */ }
  }, [id, ensure]);

  useEffect(() => {
    setTweet(null);
    getTweetById(id)
      .then((t) => { setTweet(t); ensure([tweetUserId(t)]); })
      .catch((e) => setError(extractErrorMessage(e)));
    loadComments();
  }, [id, ensure, loadComments]);

  async function send() {
    setBusy(true);
    setError("");
    try {
      await commentOnTweet(id, text.trim());
      setText("");
      await loadComments();
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <button className="icon-btn" onClick={() => navigate(-1)}><Icon name="back" /></button>
        <h1>Post</h1>
      </header>
      {error && !tweet && <div className="error-box m">{error}</div>}
      {tweet && <TweetCard tweet={tweet} detail commentCount={comments.length} onDeleted={() => navigate("/")} />}
      {tweet && (
        <div className="reply-box">
          <input placeholder="Post your reply" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary" disabled={busy || !text.trim()} onClick={send}>Reply</button>
        </div>
      )}
      {tweet && error && <div className="error-text pad">{error}</div>}
      {comments.map((c) => <CommentItem key={c.id} comment={c} onChanged={loadComments} />)}
    </>
  );
}
