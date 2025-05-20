import { StyleSheet } from "react-native";

export const styles = {
  navbar: {
    width: "100%",
    height: 60,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#2E7D32",
    textDecoration: "none",
  },
  menu: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
  },
  navLink: {
    display: "inline-block",
    margin: "0 12px",
    padding: "6px 10px",
    fontSize: 14,
    fontWeight: "500",
    color: "#2E7D32",
    textDecoration: "none",
    borderRadius: 4,
    transition: "background-color 0.2s, color 0.2s",
  },
  activeLink: {
    backgroundColor: "#66BB6A",
    color: "#fff",
    fontWeight: "600",
  },
  logoutLink: {
    color: "#E53935",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 10px",
    margin: "0 12px",
    fontSize: 14,
    fontWeight: "500",
    borderRadius: 4,
  },
  hamburger: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};