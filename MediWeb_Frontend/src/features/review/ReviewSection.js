import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import CustomDropdown from "components/CustomDropdown";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";
import { renderStars } from "./ReviewStars";
import { createStyles } from "./ReviewSection.style";
import { useTheme } from "contexts/ThemeContext";
import ReportModal from "./ReportModal";
import { reportReview } from "./review.api";

export default function ReviewSection({
  reviews = [],
  averageRating = 0,
  ratingDistribution = {},
  onSubmit,
  updateReview,
  submitting,
  isLoggedIn,
  userId,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [rating, setRating] = useState(0);
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const ownReview = reviews.find((rev) => rev.userId === userId);

  useEffect(() => {
    if (ownReview) {
      setRating(ownReview.rating);
      setPositive(ownReview.positive);
      setNegative(ownReview.negative);
    }
  }, [ownReview]);

  const totalRatings = useMemo(
    () => Object.values(ratingDistribution).reduce((a, b) => a + b, 0),
    [ratingDistribution]
  );

  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => {
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
  }), [reviews, sortOption]);

  const filteredReviews = useMemo(
    () => sortedReviews.filter((rev) => rev.userId !== userId),
    [sortedReviews, userId]
  );

  const handleSubmit = () => {
    const payload = { rating, positive, negative, userId };
    if (ownReview) {
      updateReview(payload);
    } else {
      onSubmit(payload);
    }
  };

  const handleOpenReport = (review) => {
    setReportTarget(review);
    setReportModalVisible(true);
  };

  const handleReport = async (reason, comment) => {
    if (!reportTarget) return;
    await reportReview(reportTarget.reviewId || reportTarget.id, reason, comment);
    Alert.alert('Köszönjük!', 'A bejelentést sikeresen rögzítettük. Csapatunk hamarosan felülvizsgálja.');
  };

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>Értékelések és vélemények</Text>

      {/* Átlagértékelés és megoszlás */}
      <View style={styles.ratingContainer}>
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          {renderStars(averageRating, styles, theme)}
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
                  color={theme.colors.warning}
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
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.reviewTextarea}
            multiline
          />

          <Text style={styles.reviewFormLabel}>Negatív vélemény:</Text>
          <TextInput
            value={negative}
            onChangeText={setNegative}
            placeholder="Mi nem tetszett?"
            placeholderTextColor={theme.colors.textTertiary}
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
              <ActivityIndicator color={theme.colors.white} />
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
            <CustomDropdown
              options={[
                { label: "Legújabb", value: "latest" },
                { label: "Legrégebbi", value: "oldest" },
                { label: "Legmagasabb értékelés", value: "highest" },
                { label: "Legalacsonyabb értékelés", value: "lowest" },
              ]}
              selectedValue={sortOption}
              onValueChange={(value) => setSortOption(value)}
              placeholder="Rendezés"
            />
          </View>
        </View>

        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={styles.starRow}>{renderStars(rev.rating, styles, theme)}</View>
                  <Text style={styles.reviewMeta}>
                    Beküldte: {rev.author} –{" "}
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {isLoggedIn && rev.userId !== userId && (
                  <TouchableOpacity
                    onPress={() => handleOpenReport(rev)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: theme.colors.backgroundElevated,
                    }}
                    activeOpacity={0.6}
                  >
                    <FontAwesome5 name="flag" size={13} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.reviewText}>👍 {rev.positive}</Text>
              <Text style={styles.reviewText}>👎 {rev.negative}</Text>
            </View>
          ))
        ) : ownReview ? (
          <View style={styles.noReviewsBox}>
            <FontAwesome name="user-circle" size={28} color={theme.colors.textSecondary} style={{ marginBottom: 6 }} />
            <Text style={styles.noReviewsTitle}>Csak a te értékelésed érkezett eddig</Text>
            <Text style={styles.noReviewsSubtitle}>
              Jelenleg még senki más nem írt véleményt ehhez a gyógyszerhez.
            </Text>
          </View>
        ) : (
          <View style={styles.noReviewsBox}>
            <FontAwesome name="comment-o" size={28} color={theme.colors.textTertiary} style={{ marginBottom: 6 }} />
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

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReport}
        reviewAuthor={reportTarget?.author}
      />
    </View>
  );
}