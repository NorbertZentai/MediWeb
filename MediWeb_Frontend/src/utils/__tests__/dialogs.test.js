import { Platform, Alert } from 'react-native';
import { showAlert, showConfirm } from '../dialogs';

describe('utils/dialogs', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  describe('web (Platform.OS === "web")', () => {
    beforeEach(() => {
      Platform.OS = 'web';
      window.alert = jest.fn();
      window.confirm = jest.fn();
    });

    it('showAlert uses window.alert with the title and message', () => {
      showAlert('Cím', 'Üzenet');
      expect(window.alert).toHaveBeenCalledWith('Cím\n\nÜzenet');
    });

    it('showConfirm uses window.confirm and runs onConfirm only when it returns true', () => {
      const onConfirm = jest.fn();
      window.confirm.mockReturnValueOnce(false);
      showConfirm('Törlés', 'Biztos?', { onConfirm });
      expect(window.confirm).toHaveBeenCalledWith('Törlés\n\nBiztos?');
      expect(onConfirm).not.toHaveBeenCalled();

      window.confirm.mockReturnValueOnce(true);
      showConfirm('Törlés', 'Biztos?', { onConfirm });
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('native (Platform.OS !== "web")', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
      jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    it('showAlert calls Alert.alert with the title and message', () => {
      showAlert('Cím', 'Üzenet');
      expect(Alert.alert).toHaveBeenCalledWith('Cím', 'Üzenet');
    });

    it('showConfirm calls Alert.alert with a cancel button labelled "Mégse" and the destructive style', () => {
      const onConfirm = jest.fn();
      showConfirm('Fiók törlése', 'Biztos?', { confirmText: 'Törlés', destructive: true, onConfirm });

      expect(Alert.alert).toHaveBeenCalledWith('Fiók törlése', 'Biztos?', [
        { text: 'Mégse', style: 'cancel' },
        { text: 'Törlés', style: 'destructive', onPress: onConfirm },
      ]);
    });

    it('defaults the confirm button to non-destructive style', () => {
      const onConfirm = jest.fn();
      showConfirm('Cím', 'Üzenet', { onConfirm });

      expect(Alert.alert).toHaveBeenCalledWith('Cím', 'Üzenet', [
        { text: 'Mégse', style: 'cancel' },
        { text: 'OK', style: 'default', onPress: onConfirm },
      ]);
    });
  });
});
