import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function ReviewSection({
  reviews,
  averageRating,
  ratingDistribution,
  onSubmit,
  submitting,
}) {
  const [rating, setRating] = useState(0);
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  const renderStars = (value) => {
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

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortOption) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "latest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>Értékelések és vélemények</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          {renderStars(averageRating)}
          <Text style={styles.totalRatingsText}>{totalRatings} értékelés</Text>
        </View>

        <View style={styles.distributionBox}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0;
            const percent = totalRatings === 0 ? 0 : (count / totalRatings) * 100;
            return (
              <View key={star} style={styles.distributionRow}>
                <Text style={styles.starLabel}>{star}★</Text>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.countLabel}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.reviewForm}>
        <Text style={styles.reviewFormLabel}>Értékelés:</Text>
        <View style={styles.starPicker}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity key={val} onPress={() => setRating(val)}>
              <FontAwesome
                name={val <= rating ? "star" : "star-o"}
                size={30}
                color="#fbc02d"
                style={{ marginHorizontal: 4 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.reviewFormLabel}>Pozitív vélemény:</Text>
        <TextInput
          value={positive}
          onChangeText={setPositive}
          placeholder="Mi tetszett?"
          style={styles.reviewTextarea}
          multiline
        />

        <Text style={styles.reviewFormLabel}>Negatív vélemény:</Text>
        <TextInput
          value={negative}
          onChangeText={setNegative}
          placeholder="Mi nem tetszett?"
          style={styles.reviewTextarea}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.reviewButton,
            (rating === 0 || submitting) && styles.disabledButton,
          ]}
          onPress={() => onSubmit({ rating, positive, negative })}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.reviewButtonText}>Vélemény beküldése</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Véleménylista szekció */}
      <View style={styles.reviewListSection}>
        <View style={styles.filterRow}>
          <Text style={styles.reviewListTitle}>Korábbi értékelések</Text>

          <View style={styles.dropdownWrapper}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={styles.dropdown}
            >
              <option value="latest">Legújabb</option>
              <option value="oldest">Legrégebbi</option>
              <option value="highest">Legmagasabb értékelés</option>
              <option value="lowest">Legalacsonyabb értékelés</option>
            </select>
          </View>
        </View>

        {sortedReviews.length > 0 ? (
          sortedReviews.map((rev, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.starRow}>{renderStars(rev.rating)}</View>
              <Text style={styles.reviewMeta}>
                Beküldte: {rev.author || "Anonim"} –{" "}
                {new Date(rev.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.reviewText}>👍 {rev.positive}</Text>
              <Text style={styles.reviewText}>👎 {rev.negative}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>
            Ehhez a gyógyszerhez még nem érkezett értékelés.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewSection: {
    marginTop: 32,
    padding: 28,
    backgroundColor: "#fefefe",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 32,
    marginBottom: 30,
  },
  ratingSummary: {
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fbc02d",
    marginBottom: 2,
  },
  totalRatingsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  distributionBox: {
    width: "55%",
    justifyContent: "center",
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  starLabel: {
    width: 28,
    fontWeight: "600",
    textAlign: "left",
  },
  barBackground: {
    height: 10,
    backgroundColor: "#ddd",
    flex: 1,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  barFill: {
    height: 10,
    backgroundColor: "#fbc02d",
    borderRadius: 5,
  },
  countLabel: {
    width: 24,
    textAlign: "right",
    fontSize: 13,
    color: "#444",
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 6,
  },
  reviewForm: {
    marginBottom: 24,
  },
  reviewFormLabel: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  starPicker: {
    flexDirection: "row",
    marginBottom: 10,
  },
  reviewTextarea: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  reviewButton: {
    backgroundColor: "#66BB6A",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
  reviewCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  reviewMeta: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  reviewListSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 24,
    marginTop: 24,
  },
  reviewListTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dropdownWrapper: {
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  dropdown: {
    padding: 6,
    fontSize: 14,
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
    outline: "none",
    backgroundColor: "#fff",
  },
  noReviewsText: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 12,
  },
});