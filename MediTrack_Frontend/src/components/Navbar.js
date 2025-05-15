import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Főoldal" },
    { to: "/search", label: "Keresés" },
    { to: "/favorites", label: "Kedvencek" },
    { to: "/statistics", label: "Statisztikák" },
  ];

  if (user) {
    navLinks.push({ to: "/user", label: "Profil" });
  } else {
    navLinks.push({ to: "/login", label: "Bejelentkezés" });
    navLinks.push({ to: "/register", label: "Regisztráció" });
  }

  return (
    <View style={styles.navbar}>
      {/* Logo */}
      <Text style={styles.logo}>MediTrack Web</Text>

      {/* Hamburger ikon mobilon */}
      <TouchableOpacity
        style={styles.hamburger}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <FontAwesome5 name="bars" size={24} color="black" />
      </TouchableOpacity>

      {/* Menü (desktopon mindig látszik, mobilon csak ha nyitva) */}
      <View style={[styles.menu, menuOpen && styles.menuOpen]}>
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}

        {user && (
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
              setMenuOpen(false);
            }}
            className={`nav-link logout`}
          >
            Kijelentkezés
          </Link>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    height: theme.dimensions.navbarHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: theme.colors.white,
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    position: "relative",
  },
  logo: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.colors.textDark,
    marginLeft: 10,
  },
  hamburger: {
    display: "none",
  },
  menu: {
    flexDirection: "row",
    margin: 0,
    padding: 0,
  },
  menuOpen: {
    flexDirection: "column",
    position: "absolute",
    top: theme.dimensions.navbarHeight,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    width: 200,
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    zIndex: 100,
  },
});
