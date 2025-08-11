import React, { useContext, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "./Navbar.styles";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Főoldal" },
    { to: "/search", label: "Keresés" },
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

  return (
    <div style={styles.navbar}>
      <NavLink to="/" style={styles.logo} onClick={() => handleNav("/")}>
        MediWeb Web
      </NavLink>

      <div style={styles.menu}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.activeLink : {}),
            })}
            onClick={() => handleNav(to)}
          >
            {label}
          </NavLink>
        ))}

        {!user ? (
          <>
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {}),
              })}
              onClick={() => handleNav("/login")}
            >
              Bejelentkezés
            </NavLink>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {}),
              })}
              onClick={() => handleNav("/register")}
            >
              Regisztráció
            </NavLink>
          </>
        ) : (
          <button
            onClick={handleLogout}
            style={{ ...styles.navLink, ...styles.logoutLink }}
          >
            Kijelentkezés
          </button>
        )}
      </div>

      <button style={styles.hamburger} onClick={() => setMenuOpen((prev) => !prev)}>
        <FontAwesome5 name="bars" size={20} />
      </button>
    </div>
  );
}