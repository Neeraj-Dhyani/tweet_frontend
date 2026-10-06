import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { followUser, getAllUsers, getUserById, unfollowUser } from "../api";

const SocialContext = createContext(null);

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export function SocialProvider({ children }) {
  const { user, token } = useAuth();
  const [cache, setCache] = useState({}); // id -> public user
  const cacheRef = useRef({});
  cacheRef.current = cache;
  const pending = useRef(new Set());
  const [allUsers, setAllUsers] = useState([]);
  const [following, setFollowing] = useState([]); // usernames
  const [supported, setSupported] = useState([]); // tweet ids

  const put = useCallback((list) => {
    setCache((prev) => {
      const next = { ...prev };
      list.forEach((u) => u?.id != null && (next[String(u.id)] = u));
      return next;
    });
  }, []);

  useEffect(() => {
    if (user) put([user]);
  }, [user, put]);

  // Best effort: the full user list powers "Who to follow".
  useEffect(() => {
    if (!token) return;
    getAllUsers().then((l) => { setAllUsers(l); put(l); }).catch(() => {});
  }, [token, put]);

  useEffect(() => {
    if (!user) return;
    setFollowing(read(`wire_following_${user.id}`));
    setSupported(read(`wire_supported_${user.id}`));
  }, [user?.id]); // eslint-disable-line

  // Look up any authors we don't know yet.
  const ensure = useCallback(async (ids) => {
    const missing = [...new Set(ids.filter((x) => x != null).map(String))].filter(
      (id) => !(id in cacheRef.current) && !pending.current.has(id)
    );
    await Promise.all(
      missing.map(async (id) => {
        pending.current.add(id);
        try {
          put([await getUserById(id)]);
        } catch {
          /* leave as "User #id" */
        } finally {
          pending.current.delete(id);
        }
      })
    );
  }, [put]);

  // The API has no "who do I follow" endpoint, so we remember it locally.
  async function toggleFollow(username) {
    const on = following.includes(username);
    if (on) await unfollowUser(username);
    else await followUser(username);
    const next = on ? following.filter((x) => x !== username) : [...following, username];
    setFollowing(next);
    localStorage.setItem(`wire_following_${user.id}`, JSON.stringify(next));
  }

  function markSupported(tweetId, on) {
    const id = String(tweetId);
    const next = on ? [...new Set([...supported, id])] : supported.filter((x) => x !== id);
    setSupported(next);
    localStorage.setItem(`wire_supported_${user.id}`, JSON.stringify(next));
  }

  return (
    <SocialContext.Provider
      value={{ cache, allUsers, ensure, following, toggleFollow, supported, markSupported }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => useContext(SocialContext);
