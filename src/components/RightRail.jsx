import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

export default function RightRail() {
  const { user } = useAuth();
  const { allUsers } = useSocial();
  const people = allUsers.filter((u) => u.id !== user.id).slice(0, 5);

  return (
    <aside className="rail">
      <section className="rail-card">
        <h2>Who to follow</h2>
        {people.length === 0 && <p className="muted pad">No suggestions right now.</p>}
        {people.map((u) => (
          <div className="person" key={u.id}>
            <Link to={`/user/${u.id}`}><Avatar user={u} /></Link>
            <Link to={`/user/${u.id}`} className="person-text">
              <strong>{u.username}</strong>
              <span>@{u.username}</span>
            </Link>
            <FollowButton username={u.username} />
          </div>
        ))}
      </section>
    </aside>
  );
}
