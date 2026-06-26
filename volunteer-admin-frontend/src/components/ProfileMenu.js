import React, { useState, useRef, useEffect } from "react";

const ProfileMenu = ({ name, onSignOut, dark = true, onDashboard = null, showDashboard = false }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColor = dark ? "#fff" : "#1a3c5e";

  const s = {
    wrap: { position: "relative", display: "inline-block" },
    trigger: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      padding: "6px 10px",
      borderRadius: "20px",
      background: dark ? "rgba(255,255,255,0.12)" : "#f1f5f9",
      border: dark ? "1px solid rgba(255,255,255,0.25)" : "1px solid #e2e8f0",
    },
    avatar: {
      width: "26px",
      height: "26px",
      borderRadius: "50%",
      background: dark ? "rgba(255,255,255,0.25)" : "#cbd5e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      fontWeight: "700",
      color: textColor,
      flexShrink: 0,
    },
    name: { color: textColor, fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" },
    chevron: { color: textColor, fontSize: "10px", marginLeft: "2px" },
    menu: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      background: "#fff",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      minWidth: "170px",
      overflow: "hidden",
      zIndex: 1000,
    },
    menuHeader: {
      padding: "10px 14px",
      fontSize: "12px",
      color: "#888",
      borderBottom: "1px solid #eee",
    },
    menuItem: {
      padding: "10px 14px",
      fontSize: "13px",
      color: "#333",
      cursor: "pointer",
      fontWeight: "600",
    },
    menuItemDanger: {
      padding: "10px 14px",
      fontSize: "13px",
      color: "#cc0000",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div style={s.wrap} ref={menuRef}>
      <div style={s.trigger} onClick={() => setOpen((v) => !v)}>
        <div style={s.avatar}>{initials || "👤"}</div>
        <span style={s.name}>{name}</span>
        <span style={s.chevron}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={s.menu}>
          <div style={s.menuHeader}>Signed in as {name}</div>
          {showDashboard && onDashboard && (
            <div
              style={s.menuItem}
              onClick={() => {
                setOpen(false);
                onDashboard();
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Dashboard
            </div>
          )}
          <div
            style={s.menuItemDanger}
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Sign Out
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
