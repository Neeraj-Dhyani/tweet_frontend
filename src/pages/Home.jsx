import { useCallback, useEffect, useState } from "react";
import { getAllComments, getAllTweets } from "../api";
import { extractErrorMessage } from "../api/client";
import { useSocial } from "../context/SocialContext";
import { byNewest, commentTweetId, tweetUserId } from "../utils";
import Composer from "../components/Composer";
import TweetCard from "../components/TweetCard";

export default function Home() {
  const { ensure } = useSocial();
  const [tweets, setTweets] = useState(null);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const list = (await getAllTweets()).sort(byNewest);
      setTweets(list);
      ensure(list.map(tweetUserId));
      getAllComments()
        .then((cs) => {
          const m = {};
          cs.forEach((c) => { const k = String(commentTweetId(c)); m[k] = (m[k] || 0) + 1; });
          setCounts(m);
        })
        .catch(() => {});
    } catch (e) {
      setError(extractErrorMessage(e));
      setTweets([]);
    }
  }, [ensure]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <header className="page-head"><h1>Home</h1></header>
      <Composer onPosted={load} />
      {error && (
        <div className="error-box m">
          Couldn't load posts: {error} <button className="link-btn" onClick={load}>Retry</button>
        </div>
      )}
      {tweets === null && <div className="splash">Loading…</div>}
      {tweets?.length === 0 && !error && <div className="empty">No posts yet. Be the first to post.</div>}
      {tweets?.map((t) => (
        <TweetCard key={t.id} tweet={t} commentCount={counts[String(t.id)]}
          onDeleted={(id) => setTweets((l) => l.filter((x) => x.id !== id))} />
      ))}
    </>
  );
}
