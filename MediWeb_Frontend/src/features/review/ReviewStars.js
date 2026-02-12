import React from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export const renderStars = (value, styles, theme) => {
  const fullStars = Math.floor(value);
  const halfStar = value % 1 >= 0.5;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FontAwesome key={i} name="star" size={20} color={theme?.colors?.warning || "#FFD700"} />);
    } else if (i === fullStars + 1 && halfStar) {
      stars.push(<FontAwesome key={i} name="star-half-full" size={20} color={theme?.colors?.warning || "#FFD700"} />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={20} color={theme?.colors?.borderDark || "#ccc"} />);
    }
  }

  return <View style={styles?.starRow}>{stars}</View>;
};