import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { AuthContext } from "contexts/AuthContext";
import { fetchCurrentUser } from "./profile.api";
import { theme } from "styles/theme";
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
  const [user, setUser] = useState({ name: "", email: "", imageUrl: null });
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser({
          name: userData.name || "Felhasználó",
          email: userData.email || "",
          imageUrl: userData.imageUrl || null,
        });
      } catch (e) {
        console.error("Error loading user:", e);
      }
    };
    loadUser();

    // TODO: Load favorites, recently viewed, and reviews
    setFavorites([]);
    setRecentlyViewed([]);
    setReviews([]);
  }, []);

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
        {favorites.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {favorites.map((item, index) => (
              <View key={index} style={styles.horizontalCard}>
                <Text style={styles.horizontalCardTitle}>{item.name}</Text>
              </View>
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
              <View key={index} style={styles.horizontalCard}>
                <Text style={styles.horizontalCardTitle}>{item.name}</Text>
              </View>
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
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewMedication}>{review.medication}</Text>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <FontAwesome5
                      key={i}
                      name="star"
                      size={12}
                      color={i < review.rating ? theme.colors.warning : theme.colors.border}
                      solid
                    />
                  ))}
                </View>
                <TouchableOpacity>
                  <FontAwesome5 name="pen" size={12} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>Még nem értékeltél gyógyszereket</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.border,
    borderWidth: 3,
    borderColor: theme.colors.primaryMuted,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  menuItemFirst: {
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextWrapper: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  menuDescription: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  sectionAction: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  emptyState: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
  horizontalCard: {
    width: 140,
    height: 100,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm + 4,
    marginRight: theme.spacing.sm + 4,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalCardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  reviewItem: {
    paddingVertical: theme.spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  reviewMedication: {
    flex: 1,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
});