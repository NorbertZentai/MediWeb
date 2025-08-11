import React from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "./ReviewSection.style";

export const renderStars = (value) => {
  const fullStars = Math.floor(value);
  const halfStar = value % 1 >= 0.5;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FontAwesome key={i} name="star" size={20} color="#fbc02d" />);
    } else if (i === fullStars + 1 && halfStar) {
      stars.push(<FontAwesome key={i} name="star-half-full" size={20} color="#fbc02d" />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={20} color="#ccc" />);
    }
  }

  return <View style={styles.starRow}>{stars}</View>;
};