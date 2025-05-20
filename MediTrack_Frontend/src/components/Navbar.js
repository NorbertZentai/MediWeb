import React, { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "./Navbar.styles";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Főoldal" },
    { to: "/search", label: "Keresés" },
    { to: "/statistics", label: "Statisztikák" },
    ...(user ? [{ to: "/user", label: "Profil" }] : []),
  ];

  const handleNav = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    handleNav("/");
  };

  const getLinkStyle = (to, extraStyle = {}) => {
    const isActive = pathname === to;
    return {
      ...styles.navLink,
      ...(isActive ? styles.activeLink : {}),
      ...extraStyle,
    };
  };

  return (
    <div style={styles.navbar}>
      <Link to="/" style={styles.logo} onClick={() => handleNav("/")}>
        MediTrack Web
      </Link>

      <div style={styles.menu}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={getLinkStyle(to)}
            onClick={() => handleNav(to)}
          >
            {label}
          </Link>
        ))}

        {!user ? (
          <>
            <Link
              to="/login"
              style={getLinkStyle("/login")}
              onClick={() => handleNav("/login")}
            >
              Bejelentkezés
            </Link>
            <Link
              to="/register"
              style={getLinkStyle("/register")}
              onClick={() => handleNav("/register")}
            >
              Regisztráció
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            style={getLinkStyle(null, styles.logoutLink)}
          >
            Kijelentkezés
          </button>
        )}
      </div>

      <button style={styles.hamburger} onClick={() => setMenuOpen((o) => !o)}>
        <FontAwesome5 name="bars" size={20} />
      </button>
    </div>
  );
}