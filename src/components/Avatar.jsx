export default function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 };

  if (user?.avatar) return <img className="avatar" style={style} src={`${import.meta.env.VITE_API_HOST}/${user.avatar}`} alt="" />;
  return (
    <div className="avatar avatar-fallback" style={style}>
      {(user?.username || "?")[0].toUpperCase()}
    </div>
  );
}
