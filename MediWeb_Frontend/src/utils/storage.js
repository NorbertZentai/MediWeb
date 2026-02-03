import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const storage = {
    setItem: async (key, value) => {
        try {
            if (isWeb) {
                localStorage.setItem(key, value);
            } else {
                await AsyncStorage.setItem(key, value);
            }
        } catch (e) {
            console.error('Error saving data', e);
        }
    },
    getItem: async (key) => {
        try {
            if (isWeb) {
                return localStorage.getItem(key);
            } else {
                return await AsyncStorage.getItem(key);
            }
        } catch (e) {
            console.error('Error reading data', e);
            return null;
        }
    },
    removeItem: async (key) => {
        try {
            if (isWeb) {
                localStorage.removeItem(key);
            } else {
                await AsyncStorage.removeItem(key);
            }
        } catch (e) {
            console.error('Error removing data', e);
        }
    },
    clear: async () => {
        try {
            if (isWeb) {
                localStorage.clear();
            } else {
                await AsyncStorage.clear();
            }
        } catch (e) {
            console.error('Error clearing data', e);
        }
    }
};

export default storage;
