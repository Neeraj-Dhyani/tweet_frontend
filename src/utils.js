// peewee models that get returned without .dicts() serialize as { __data__: {...} }.
// unwrap() makes both shapes look the same.
export const unwrap = (o) => (o && typeof o === "object" && o.__data__ ? o.__data__ : o);

export const idOf = (v) => (v && typeof v === "object" ? v.id : v);

// Never keep the password hash around in the UI.
export function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = unwrap(u);
  return rest;
}

export const tweetUserId = (t) => idOf(t.user_id ?? t.user);
export const commentTweetId = (c) => idOf(c.tweet_id ?? c.tweet);
export const commentUserId = (c) => idOf(c.user_id ?? c.user);
export const replyCommentId = (r) => idOf(r.Comment_id ?? r.Comment ?? r.comment_id ?? r.comment);
export const replyUserId = (r) => idOf(r.User_id ?? r.User ?? r.user_id ?? r.user);

export function imagesOf(tweet) {
  let v = tweet.image_content;
  if (!v) return [];
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [v];
    }
  }
  if (!Array.isArray(v)) v = [v];
  return v.map((x) => (typeof x === "string" ? x : x?.url)).filter(Boolean);
}

export const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);
export const byOldest = (a, b) => new Date(a.created_at) - new Date(b.created_at);

export function timeAgo(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${Math.max(s, 0)}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
