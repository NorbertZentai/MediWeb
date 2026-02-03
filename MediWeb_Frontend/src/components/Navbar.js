import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { AuthContext } from "contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  const navLinks = [
    { to: "/", label: "Főoldal", icon: "home" },
    { to: "/search", label: "Keresés", icon: "search" },
    ...(user ? [{ to: "/profile", label: "Profil", icon: "user-circle" }] : []),
  ];

  const handleNav = (to) => {
    setMenuOpen(false);
    router.push(to);
  };

  const handleLogout = () => {
    logout();
    handleNav("/");
  };

  const isActive = (path) => {
    if (path === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(path);
  };

  // Logo Component
  const Logo = () => (
    <TouchableOpacity onPress={() => handleNav("/")} style={styles.logoContainer}>
      <View style={styles.logoIconWrapper}>
        <FontAwesome5 name="pills" size={20} color="#fff" />
      </View>
      <Text style={styles.logo}>
        Medi<Text style={styles.logoAccent}>Web</Text>
      </Text>
    </TouchableOpacity>
  );

  // Mobile: Hide navbar since bottom tabs provide navigation
  if (isMobile) {
    return null;
  }

  // Desktop: Normal horizontal menu
  return (
    <View style={styles.navbar}>
      <Logo />

      <View style={styles.menu}>
        {navLinks.map(({ to, label, icon }) => (
          <TouchableOpacity
            key={to}
            onPress={() => handleNav(to)}
            style={[styles.navLink, isActive(to) && styles.activeLink]}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={icon}
              size={14}
              color={isActive(to) ? "#2E7D32" : "#6B7280"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.navLinkText, isActive(to) && styles.activeLinkText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.menuDivider} />

        {!user ? (
          <>
            <TouchableOpacity
              onPress={() => handleNav("/login")}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Bejelentkezés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNav("/register")}
              style={styles.registerButton}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Regisztráció</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="sign-out-alt" size={14} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Kijelentkezés</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Desktop Navbar ---
  navbar: {
    width: "100%",
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  logoAccent: {
    color: "#2E7D32",
    fontWeight: "800",
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeLink: {
    backgroundColor: "#ECFDF5",
  },
  activeLinkText: {
    color: "#2E7D32",
  },
  menuDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2E7D32",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  registerButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    marginLeft: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },

  // --- Mobile Navbar ---
  navbarMobile: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1000,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: "#2E7D32",
    borderRadius: 2,
  },
  hamburgerLineShort: {
    width: 16,
    alignSelf: "flex-end",
  },
  logoIconWrapperSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Mobile Menu Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
  },
  mobileMenu: {
    backgroundColor: "#fff",
    marginTop: 72,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  mobileMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  mobileMenuLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mobileMenuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  mobileNavSection: {
    gap: 4,
  },
  mobileNavLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  mobileNavLinkActive: {
    backgroundColor: "#ECFDF5",
  },
  mobileNavIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  mobileNavIconActive: {
    backgroundColor: "#2E7D32",
  },
  mobileNavLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  mobileNavLinkTextActive: {
    color: "#2E7D32",
  },
  mobileDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  mobileAuthSection: {
    gap: 10,
  },
  mobileLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
  },
  mobileLoginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  mobileRegisterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
  },
  mobileRegisterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  mobileLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  mobileLogoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});