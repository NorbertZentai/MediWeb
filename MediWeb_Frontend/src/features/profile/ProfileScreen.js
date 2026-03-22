import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { AuthContext } from "contexts/AuthContext";
import { fetchCurrentUser, getFavorites, getUserReviews } from "./profile.api";
import { getRecentlyViewed } from "utils/recentlyViewed";

import { createStyles } from "./ProfileScreen.style";
import { useTheme } from "contexts/ThemeContext";
import defaultAvatar from "assets/default-avatar.jpg";

const menuItems = [
  { key: "account", label: "Fiók adatok", icon: "user-edit", description: "Név, email, jelszó szerkesztése" },
  { key: "profiles", label: "Profilok", icon: "user-friends", description: "Gyógyszerprofilok kezelése" },
  { key: "intake", label: "Bevitel", icon: "pills", description: "Napi gyógyszerbevitel" },
  { key: "statistics", label: "Statisztikák", icon: "chart-bar", description: "Gyógyszerbevételi adatok" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [user, setUser] = useState({ name: "", email: "", imageUrl: null });
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await fetchCurrentUser();
      setUser({
        name: userData.name || "Felhasználó",
        email: userData.email || "",
        imageUrl: userData.imageUrl || null,
      });

      // Fetch actual data
      const [favs, revs] = await Promise.all([
        getFavorites().catch(() => []),
        getUserReviews().catch(() => []),
      ]);

      setFavorites(favs || []);
      setReviews(revs || []);
      
      // Load recently viewed from local storage
      const recent = await getRecentlyViewed();
      setRecentlyViewed(recent || []);
    } catch (e) {
      console.error("Error loading profile data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );


  const handleMenuPress = (key) => {
    router.push(`/profile/${key}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Card */}
      <View style={styles.userCard}>
        <Image
          source={user.imageUrl ? { uri: user.imageUrl } : defaultAvatar}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleMenuPress("account")}
        >
          <FontAwesome5 name="pen" size={14} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              index === 0 && styles.menuItemFirst,
              index === menuItems.length - 1 && styles.menuItemLast,
            ]}
            onPress={() => handleMenuPress(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrapper}>
              <FontAwesome5 name={item.icon} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Favorites Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kedvenceim ({favorites.length})</Text>
          <TouchableOpacity onPress={() => router.push('/favorites')}>
            <Text style={styles.sectionAction}>Összes</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : favorites.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {favorites.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.horizontalCard}
                onPress={() => router.push(`/medication/${item.medicationId}`)}
              >
                <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                  {item.medicationName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyState}>Még nincsenek kedvenceid</Text>
        )}
      </View>

      {/* Recently Viewed Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Legutóbb megtekintett</Text>
        </View>
        {recentlyViewed.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyViewed.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.horizontalCard}
                onPress={() => router.push(`/medication/${item.medicationId}`)}
              >
                <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                  {item.medicationName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyState}>Még nem tekintettél meg gyógyszereket</Text>
        )}
      </View>

      {/* Reviews Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Értékeléseim ({reviews.length})</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : reviews.length > 0 ? (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colMedication}>
                <Text style={styles.tableHeaderCell}>Gyógyszer</Text>
              </View>
              <View style={styles.colRating}>
                <Text style={styles.tableHeaderCell}>Értékelés</Text>
              </View>
              <View style={styles.colDate}>
                <Text style={styles.tableHeaderCell}>Dátum</Text>
              </View>
              <View style={styles.colReview}>
                <Text style={styles.tableHeaderCell}>Vélemény</Text>
              </View>
            </View>

            {/* Table Rows */}
            {reviews.map((review, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tableRow, index === reviews.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => router.push(`/medication/${review.medicationId}`)}
              >
                <View style={styles.colMedication}>
                  <Text style={styles.tableCell} numberOfLines={2}>{review.medicationName}</Text>
                </View>
                <View style={styles.colRating}>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <FontAwesome5
                        key={i}
                        name="star"
                        size={10}
                        color={i < review.rating ? theme.colors.warning : theme.colors.border}
                        solid
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.colDate}>
                  <Text style={styles.tableCellSub}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('hu-HU') : '-'}
                  </Text>
                </View>
                <View style={styles.colReview}>
                  <Text style={styles.tableCell} numberOfLines={2}>
                    {review.positive || review.negative || '-'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyState}>Még nem értékeltél gyógyszereket</Text>
        )}
      </View>

    </ScrollView>
  );
}
