import React, { useContext, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { AuthContext } from "contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";
import { createStyles } from "./Navbar.style";
import { useTheme } from "contexts/ThemeContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        <FontAwesome5 name="pills" size={20} color={theme.colors.white} />
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
              color={isActive(to) ? theme.colors.primary : theme.colors.textSecondary}
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
            <FontAwesome5 name="sign-out-alt" size={14} color={theme.colors.error} style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Kijelentkezés</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}