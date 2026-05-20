import { useCallback, useState, useEffect } from "react";
import { Platform } from "react-native";
import { getMedicationDetails } from "features/medication/medication.api";
import { getReviewsForMedication } from "features/review/review.api";
import { getProfilesForUser, fetchCurrentUser, getFavorites, removeFromFavorites } from "features/profile/profile.api";
import { loadMedication } from "utils/medicationCache";
import storage from "utils/storage";

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
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const result = await getMedicationDetails(medicationId);
      setData(result);
      setIsOffline(false);
      setError(null);
    } catch (e) {
      console.error("Hiba a részletek betöltésekor:", e.message || e);

      // Offline fallback: bejelentkezett native felhasználóknál próbáljuk a cache-t
      if (Platform.OS !== 'web') {
        try {
          const token = await storage.getItem('authToken');
          if (token) {
            const cached = await loadMedication(medicationId);
            if (cached) {
              setData(cached);
              setIsOffline(true);
              setError(null);
              return;
            }
          }
        } catch (_) {}
      }

      // Check if it's a 503 Service Unavailable error (timeout)
      if (e.response?.status === 503) {
        setError({
          type: 'timeout',
          message: e.response?.data?.message || 'Az OGYEI szerver nem elérhető. Kérjük, próbálja újra később.'
        });
      } else if (e.response?.status >= 500) {
        setError({
          type: 'server',
          message: 'Szerverhiba történt. Kérjük, próbálja újra később.'
        });
      } else {
        setError({
          type: 'unknown',
          message: 'Nem sikerült betölteni a gyógyszer adatait.'
        });
      }
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
      console.error("Hiba a review-k betöltésekor:", e.message || e);
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
      console.error("Hiba a kedvencek betöltésekor:", e.message || e);
    }
  }, [medicationId]);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await getProfilesForUser();
      setProfiles(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Nem sikerült betölteni a profilokat:", e.message || e);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
    fetchReviews();
    fetchCurrentUser()
      .then(async (user) => {
        setCurrentUser(user);
        if (user) {
          await fetchFavorites();
          await fetchProfiles();
        }
      })
      .catch((e) => {
        console.error("Nem sikerült betölteni a felhasználót:", e.message || e);
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
    error,
    isOffline,
    setIsFavorite,
    setFavoriteId,
    fetchReviews,
    fetchFavorites,
    fetchDetails,
  };
}