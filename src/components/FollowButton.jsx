import { useState } from "react";
import { useSocial } from "../context/SocialContext";
import { extractErrorMessage } from "../api/client";

export default function FollowButton({ username }) {
  const { following, toggleFollow } = useSocial();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const on = following.includes(username);

  async function click(e) {
    e.stopPropagation();
    setBusy(true);
    setErr("");
    try {
      await toggleFollow(username);
    } catch (error) {
      setErr(extractErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={on ? "btn btn-outline" : "btn btn-light"}
      disabled={busy}
      onClick={click}
      title={err}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}
