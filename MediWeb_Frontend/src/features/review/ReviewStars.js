import React from "react";
import { View, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { MIN_TOUCH_TARGET } from "styles/theme";

export default function ReviewStars({ value = 0, onChange, interactive = false, theme, styles }) {
  if (interactive) {
    return (
      <View style={{ flexDirection: "row" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} csillag`}
            accessibilityState={{ selected: n <= value }}
            onPress={() => onChange?.(n)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            style={{
              minWidth: MIN_TOUCH_TARGET,
              minHeight: MIN_TOUCH_TARGET,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome
              name={n <= value ? "star" : "star-o"}
              size={30}
              color={theme?.colors?.warning || "#FFD700"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Értékelés: ${rounded} az 5-ből`}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {renderStars(value, styles, theme)}
      </View>
    </View>
  );
}

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