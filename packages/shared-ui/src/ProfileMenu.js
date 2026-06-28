import React, { useEffect, useRef, useState } from "react";

const create = React.createElement;

const ProfileMenu = ({
  name,
  onSignOut,
  dark = true,
  onDashboard = null,
  showDashboard = false,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColor = dark ? "#fff" : "#1a3c5e";
  const safeName = name || "User";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const styles = {
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

  const menuItems = [];

  if (showDashboard && onDashboard) {
    menuItems.push(
      create(
        "div",
        {
          key: "dashboard",
          style: styles.menuItem,
          onClick: () => {
            setOpen(false);
            onDashboard();
          },
          onMouseEnter: (event) => (event.currentTarget.style.background = "#f5f7fa"),
          onMouseLeave: (event) => (event.currentTarget.style.background = "#fff"),
        },
        "Dashboard"
      )
    );
  }

  menuItems.push(
    create(
      "div",
      {
        key: "signout",
        style: styles.menuItemDanger,
        onClick: () => {
          setOpen(false);
          onSignOut();
        },
        onMouseEnter: (event) => (event.currentTarget.style.background = "#fff5f5"),
        onMouseLeave: (event) => (event.currentTarget.style.background = "#fff"),
      },
      "Sign Out"
    )
  );

  return create(
    "div",
    { style: styles.wrap, ref: menuRef },
    create(
      "div",
      { style: styles.trigger, onClick: () => setOpen((value) => !value) },
      create("div", { style: styles.avatar }, initials || "👤"),
      create("span", { style: styles.name }, safeName),
      create("span", { style: styles.chevron }, open ? "▲" : "▼")
    ),
    open &&
      create(
        "div",
        { style: styles.menu },
        create("div", { style: styles.menuHeader }, `Signed in as ${safeName}`),
        ...menuItems
      )
  );
};

export default ProfileMenu;
