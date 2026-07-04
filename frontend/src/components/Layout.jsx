import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/activity", label: "Activity" },
  { to: "/disputes", label: "Disputes" },
];

export default function Layout() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 17l5-5 4 4 8-8" />
              <path d="M16 8h4v4" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">
              Pay<span className="brand-accent">Trace</span>
            </span>
            <span className="brand-sub">Sandbox testing</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label="Toggle color theme"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          >
            <svg
              className="icon-sun"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg
              className="icon-moon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </button>

          <button
            className="avatar-btn"
            type="button"
            aria-label="View profile"
          >
            <img src="/avatar.png" alt="Profile" />
            <span className="avatar-ring" aria-hidden="true"></span>
          </button>
        </div>
      </header>

      <main className="views">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tab${isActive ? " tab--active" : ""}`}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
