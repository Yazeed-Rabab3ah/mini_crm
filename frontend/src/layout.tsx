import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  StickyNote,
  SquareMousePointer,
} from "lucide-react";
import { getCurrentUserIdFromToken, logout } from "./api/auth";
import { getContact } from "./api/contacts";
import { useRole } from "./contexts/RoleContext";

const id = getCurrentUserIdFromToken();
console.log(id);

async function getUserName() {
  if (!id) return "User";
  const data = await getContact(id);
  return data.username;
}
async function handleSignOut() {
  await logout();
  window.location.replace("/");
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState<string>("U");
  const {isEmployee} = useRole();
  
  const navItems = [
    { to: "/", label: "Home", icon: <Home size={20} /> },
    { to: "/contacts", label: "Contacts", icon: <User size={20} /> },
    { to: `/tasks/my-tasks`, label: "Tasks", icon: <StickyNote size={20} /> },
    ...(!isEmployee ? [{ to: `/assign-task`, label: "Assign Task", icon: <SquareMousePointer size={20} /> }] : []),
  ];
  

  useEffect(() => {
    getUserName().then(setUsername);
  }, []);

  return (
    <div
      className="flex h-screen w-full"
      style={{
        backgroundColor: "#F3F4FF",
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      <aside
        className="flex flex-col h-full border-r shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? "88px" : "224px",
          backgroundColor: "#F3F4FF",
          borderColor: "#e0e1f0",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-5 border-b"
          style={{ borderColor: "#e0e1f0" }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="w-9 h-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: "#0B1122" }}
              >
                CRM
            </div>
            

            
              <span
                className="font-semibold text-sm whitespace-nowrap"
                style={{ color: "#0B1122" }}
              >
                EXOS Corporation
              </span>
          </div>
            )}

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="  rounded transition"
            type="button"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} className="ml-4.5 " color="#0B1122" />
            ) : (
              <PanelLeftClose size={20} color="#0B1122" />
            )}
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4">
          {!collapsed && (
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 px-2"
              style={{ color: "#9899b0" }}
            >
              Main
            </p>
          )}

          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive: isActiveLink }) =>
                    `w-full flex items-center ${
                      collapsed ? "justify-center" : "gap-2.5"
                    } px-2 py-2 rounded text-sm transition-all duration-150 ${
                      isActiveLink ? "font-semibold" : "font-normal"
                    }`
                  }
                  style={({ isActive: isActiveLink }) => ({
                    backgroundColor: isActiveLink ? "#e2e3f5" : "transparent",
                    color: isActiveLink ? "#0B1122" : "#4b4c6b",
                  })}
                  title={collapsed ? item.label : ""}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="shrink-0"
                        style={{ color: isActive ? "#0B1122" : "#7879a0" }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Unique profile item */}
        <div className="px-3 pb-3">
          <NavLink
            to={`/profile/${id}`}
            className={() =>
              `flex items-center rounded-2xl transition-all duration-200 ${
                collapsed ? "justify-center p-2" : "gap-3 px-3 py-3"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#E7E9FF" : "#FFFFFF",
              border: `1px solid ${isActive ? "#C9CDFD" : "#E6E8F5"}`,
              boxShadow: "0 4px 14px rgba(11,17,34,0.04)",
            })}
            title={collapsed ? "Profile" : ""}
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    backgroundColor: isActive ? "#0B1122" : "#DDE1FF",
                    color: isActive ? "#FFFFFF" : "#3D467A",
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>

                {!collapsed && (
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#0B1122" }}
                    >
                      {username}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "#8A8DA8" }}
                    >
                      View profile
                    </p>
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-5">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : "gap-2.5"
            } px-2 py-2 rounded text-sm transition-all duration-150 hover:bg-red-50`}
            style={{ color: "#e05555" }}
            title={collapsed ? "Sign Out" : ""}
            type="button"
          >
            <LogOut size={20} />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}