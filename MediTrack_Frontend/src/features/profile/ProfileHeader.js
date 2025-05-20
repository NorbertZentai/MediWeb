import React from "react";
import { View, Text, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "./ProfileScreen.style";

export default function ProfileHeader() {
  return (
    <View style={styles.header}>
      <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.profileImage} />
      <View style={styles.userInfo}>
        {[
          { label: "Név", value: "test" },
          { label: "Email", value: "test@test.hu" },
          { label: "Szerep", value: "USER" },
        ].map((info, idx) => (
          <View key={idx} style={styles.userInfoRow}>
            <Text style={styles.label}>{info.label}:</Text>
            <Text style={styles.value}>{info.value}</Text>
            <FontAwesome5 name="edit" size={14} style={styles.editIcon} />
          </View>
        ))}
      </View>
    </View>
  );
}