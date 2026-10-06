import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import Avatar from "./Avatar";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = [
    { to: "/", label: "Home", icon: "home", end: true },
    { to: `/user/${user.id}`, label: "Profile", icon: "user" },
    { to: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="sidebar">
      <Link to="/" className="logo" aria-label="Home">W</Link>
      <nav>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className="nav-item">
            <Icon name={i.icon} size={26} />
            <span>{i.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="me">
        <Avatar user={user} size={40} />
        <div className="me-text">
          <strong>{user.username}</strong>
          <span>@{user.username}</span>
        </div>
        <button
          className="icon-btn"
          title="Log out"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
