import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightRail from "./RightRail";

export default function Layout() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main"><Outlet /></main>
      <RightRail />
    </div>
  );
}
