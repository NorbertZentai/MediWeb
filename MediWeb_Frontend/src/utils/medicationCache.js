import { Platform } from 'react-native';
import storage from 'utils/storage';

const KEY = (id) => `med_cache_${id}`;
const INDEX_KEY = 'med_cache_index';
const MAX_ITEMS = 50;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 nap

export async function saveMedication(id, data) {
  if (Platform.OS === 'web') return;
  try {
    const entry = JSON.stringify({ data, cachedAt: Date.now() });
    await storage.setItem(KEY(id), entry);

    const raw = await storage.getItem(INDEX_KEY);
    let index = raw ? JSON.parse(raw) : [];
    index = [String(id), ...index.filter((x) => x !== String(id))];
    if (index.length > MAX_ITEMS) {
      const evicted = index.splice(MAX_ITEMS);
      for (const old of evicted) {
        await storage.removeItem(KEY(old));
      }
    }
    await storage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('[MedCache] Write error:', e?.message);
  }
}

export async function loadMedication(id) {
  if (Platform.OS === 'web') return null;
  try {
    const raw = await storage.getItem(KEY(id));
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > TTL_MS) {
      await storage.removeItem(KEY(id));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getCacheInfo() {
  if (Platform.OS === 'web') return { count: 0 };
  try {
    const raw = await storage.getItem(INDEX_KEY);
    const index = raw ? JSON.parse(raw) : [];
    return { count: index.length };
  } catch {
    return { count: 0 };
  }
}

export async function clearCache() {
  if (Platform.OS === 'web') return;
  try {
    const raw = await storage.getItem(INDEX_KEY);
    const index = raw ? JSON.parse(raw) : [];
    for (const id of index) {
      await storage.removeItem(KEY(id));
    }
    await storage.removeItem(INDEX_KEY);
  } catch (e) {
    console.warn('[MedCache] Clear error:', e?.message);
  }
}
