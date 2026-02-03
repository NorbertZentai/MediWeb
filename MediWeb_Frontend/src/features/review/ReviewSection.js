import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import { renderStars } from "./ReviewStars";
import { styles } from "./ReviewSection.style";

export default function ReviewSection({
  reviews,
  averageRating,
  ratingDistribution,
  onSubmit,
  updateReview,
  submitting,
  isLoggedIn,
  userId,
}) {
  const [rating, setRating] = useState(0);
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const ownReview = reviews.find((rev) => rev.userId === userId);

  useEffect(() => {
    if (ownReview) {
      setRating(ownReview.rating);
      setPositive(ownReview.positive);
      setNegative(ownReview.negative);
    }
  }, [ownReview]);

  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

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

  const filteredReviews = sortedReviews.filter((rev) => rev.userId !== userId);

  const handleSubmit = () => {
    const payload = { rating, positive, negative, userId };
    if (ownReview) {
      updateReview(payload);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>Értékelések és vélemények</Text>

      {/* Átlagértékelés és megoszlás */}
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

      {/* Új értékelés űrlap */}
      {isLoggedIn ? (
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
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reviewButtonText}>
                {ownReview ? "Véleményed frissítése" : "Vélemény küldése"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loginNotice}>
          Bejelentkezés után tudsz véleményt írni.
        </Text>
      )}

      {/* Lista korábbi értékelésekről */}
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

        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.starRow}>{renderStars(rev.rating)}</View>
              <Text style={styles.reviewMeta}>
                Beküldte: {rev.author} –{" "}
                {new Date(rev.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.reviewText}>👍 {rev.positive}</Text>
              <Text style={styles.reviewText}>👎 {rev.negative}</Text>
            </View>
          ))
        ) : ownReview ? (
          <View style={styles.noReviewsBox}>
            <FontAwesome name="user-circle" size={28} color="#888" style={{ marginBottom: 6 }} />
            <Text style={styles.noReviewsTitle}>Csak a te értékelésed érkezett eddig</Text>
            <Text style={styles.noReviewsSubtitle}>
              Jelenleg még senki más nem írt véleményt ehhez a gyógyszerhez.
            </Text>
          </View>
        ) : (
          <View style={styles.noReviewsBox}>
            <FontAwesome name="comment-o" size={28} color="#aaa" style={{ marginBottom: 6 }} />
            <Text style={styles.noReviewsTitle}>Nincs még értékelés</Text>
            <Text style={styles.noReviewsSubtitle}>
              Legyél te az első, aki megosztja a tapasztalatait!
            </Text>
            {!isLoggedIn && (
              <Text style={styles.loginPrompt}>
                <Text>Bejelentkezés után tudsz értékelést írni. </Text>
                <Link href="/login" style={styles.loginLink}><Text>Bejelentkezés</Text></Link>
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}