import { useCallback, useState, useEffect } from "react";
import { getMedicationDetails } from "features/medication/medication.api";
import { getReviewsForMedication } from "features/review/review.api";
import { getProfilesForUser, fetchCurrentUser, getFavorites, removeFromFavorites } from "features/profile/profile.api";

export function useMedicationService(medicationId) {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const result = await getMedicationDetails(medicationId);
      setData(result);
    } catch (e) {
      console.error("Hiba a részletek betöltésekor:", e);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = 1000 - elapsed;
      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    }
  }, [medicationId]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await getReviewsForMedication(medicationId);
      setReviews(res.reviews || []);
      setAverageRating(res.averageRating || 0);
      setRatingDistribution(res.ratingDistribution || {});
    } catch (e) {
      console.error("Hiba a review-k betöltésekor:", e);
    }
  }, [medicationId]);

  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      const fav = favorites.find(
        (f) => f.medicationId === parseInt(medicationId)
      );
      setIsFavorite(!!fav);
      setFavoriteId(fav?.id || null);
    } catch (e) {
      console.error("Hiba a kedvencek betöltésekor:", e);
    }
  }, [medicationId]);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await getProfilesForUser();
      setProfiles(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Nem sikerült betölteni a profilokat:", e);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
    fetchReviews();
    fetchCurrentUser()
      .then(async (user) => {
        setCurrentUser(user);
        await fetchFavorites();
        await fetchProfiles();
      })
      .catch((e) => {
        console.error("Nem sikerült betölteni a felhasználót:", e);
      });
  }, [fetchDetails, fetchReviews, fetchFavorites, fetchProfiles]);

  return {
    data,
    reviews,
    averageRating,
    ratingDistribution,
    currentUser,
    isFavorite,
    favoriteId,
    profiles,
    loading,
    setIsFavorite,
    setFavoriteId,
    fetchReviews,
    fetchFavorites,
  };
}