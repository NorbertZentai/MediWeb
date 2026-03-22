import storage from './storage';

const RECENTLY_VIEWED_KEY = 'recently_viewed_medications';
const MAX_ITEMS = 10;

/**
 * Adds a medication to the recently viewed list in local storage.
 * @param {Object} medication - The medication object { medicationId, medicationName }
 */
export const addRecentlyViewed = async (medication) => {
  if (!medication || !medication.medicationId) return;

  try {
    const existingData = await storage.getItem(RECENTLY_VIEWED_KEY);
    let list = existingData ? JSON.parse(existingData) : [];

    // Remove if already exists to move to top
    list = list.filter(item => item.medicationId !== medication.medicationId);

    // Add to front
    list.unshift({
      medicationId: medication.medicationId,
      medicationName: medication.medicationName || medication.name,
      timestamp: Date.now()
    });

    // Limit size
    if (list.length > MAX_ITEMS) {
      list = list.slice(0, MAX_ITEMS);
    }

    await storage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error updating recently viewed:', error);
  }
};

/**
 * Gets the list of recently viewed medications.
 * @returns {Promise<Array>}
 */
export const getRecentlyViewed = async () => {
  try {
    const data = await storage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

/**
 * Clears the recently viewed list.
 */
export const clearRecentlyViewed = async () => {
  await storage.removeItem(RECENTLY_VIEWED_KEY);
};
