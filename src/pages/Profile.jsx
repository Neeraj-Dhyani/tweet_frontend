import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllComments, getTweetsByUser, getUserById } from "../api";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { byNewest, commentTweetId } from "../utils";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";
import Icon from "../components/Icon";
import TweetCard from "../components/TweetCard";

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { cache } = useSocial();
  const navigate = useNavigate();
  const isMe = String(id) === String(me.id);
  const [profile, setProfile] = useState(isMe ? me : cache[String(id)] || null);
  const [tweets, setTweets] = useState(null);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setTweets(null);
    if (isMe) setProfile(me);
    else getUserById(id).then(setProfile).catch(() => {});
    getTweetsByUser(id)
      .then((l) => setTweets(l.sort(byNewest)))
      .catch((e) => { setError(extractErrorMessage(e)); setTweets([]); });
    getAllComments()
      .then((cs) => {
        const m = {};
        cs.forEach((c) => { const k = String(commentTweetId(c)); m[k] = (m[k] || 0) + 1; });
        setCounts(m);
      })
      .catch(() => {});
  }, [id, isMe, me]);

  const p = profile;

  return (
    <>
      <header className="page-head">
        <button className="icon-btn" onClick={() => navigate(-1)}><Icon name="back" /></button>
        <div>
          <h1>{p?.username || "Profile"}</h1>
          <span className="muted">{tweets ? `${tweets.length} posts` : ""}</span>
        </div>
      </header>
      <div className="banner" />
      <section className="profile-top">
        <div className="profile-row">
          <div className="profile-avatar"><Avatar user={p} size={112} /></div>
          {isMe ? (
            <Link to="/settings" className="btn btn-outline">Edit profile</Link>
          ) : (
            p && <FollowButton username={p.username} />
          )}
        </div>
        <h2>{p?.username}</h2>
        <span className="muted">@{p?.username}</span>
        {p?.bio && <p className="bio">{p.bio}</p>}
      </section>
      <div className="section-title">Posts</div>
      {tweets === null && <div className="splash">Loading…</div>}
      {tweets?.length === 0 && (
        <div className="empty">{error && error !== "This user has no tweet" ? error : "No posts yet."}</div>
      )}
      {tweets?.map((t) => (
        <TweetCard key={t.id} tweet={t} commentCount={counts[String(t.id)]}
          onDeleted={(tid) => setTweets((l) => l.filter((x) => x.id !== tid))} />
      ))}
    </>
  );
}
