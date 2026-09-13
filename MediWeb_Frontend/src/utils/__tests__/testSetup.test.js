import storage from 'utils/storage';

describe('jest.setup.js mockok', () => {
  it('az expo-router useRouter mockolt objektumot ad vissza', () => {
    const { useRouter } = require('expo-router');
    const router = useRouter();

    expect(jest.isMockFunction(router.push)).toBe(true);
  });

  it('az expo-notifications mockolt függvényeket ad vissza', () => {
    const Notifications = require('expo-notifications');

    expect(jest.isMockFunction(Notifications.getPermissionsAsync)).toBe(true);
    expect(jest.isMockFunction(Notifications.requestPermissionsAsync)).toBe(true);
    expect(jest.isMockFunction(Notifications.scheduleNotificationAsync)).toBe(true);
    expect(jest.isMockFunction(Notifications.getExpoPushTokenAsync)).toBe(true);
  });

  it('az AsyncStorage mockon keresztül a storage set/get nem dob hibát', async () => {
    await expect(storage.setItem('teszt-kulcs', 'teszt-ertek')).resolves.not.toThrow();
    await expect(storage.getItem('teszt-kulcs')).resolves.toBe('teszt-ertek');
  });
});
