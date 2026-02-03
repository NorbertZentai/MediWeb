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
          <FontAwesome5 name="pen" size={14} color="#6B7280" />
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
              <FontAwesome5 name={item.icon} size={18} color="#2E7D32" />
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
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
                      color={i < review.rating ? "#F59E0B" : "#E2E8F0"}
                      solid
                    />
                  ))}
                </View>
                <TouchableOpacity>
                  <FontAwesome5 name="pen" size={12} color="#64748B" />
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
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 70 : 60, // Extra padding for status bar
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
    borderWidth: 3,
    borderColor: "#ECFDF5",
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextWrapper: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  menuDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  emptyState: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 16,
  },
  horizontalCard: {
    width: 140,
    height: 100,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewMedication: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
});