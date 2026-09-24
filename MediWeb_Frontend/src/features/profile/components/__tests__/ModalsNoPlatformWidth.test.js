import fs from 'fs';
import path from 'path';

// Issue #101: modal sizing comes from useResponsiveLayout().isMobile, never from the platform.
const FEATURES = path.join(__dirname, '..', '..', '..');
const FILES = [
  'profile/components/profiles/AddProfileModal.js',
  'profile/components/profiles/EditProfileModal.js',
  'profile/components/profiles/EditMedicationModal.js',
  'settings/components/TermsModal.js',
  'settings/components/PrivacyPolicyModal.js',
  'review/ReportModal.js',
];
const OVERLAY_STYLE_FILE = 'profile/components/ProfilesTab.style.js';

const read = (file) => fs.readFileSync(path.join(FEATURES, file), 'utf8');

describe('modal sizing does not depend on the platform (#101)', () => {
  FILES.forEach((file) => {
    it(`${file} has no web platform check`, () => {
      expect(read(file)).not.toMatch(/Platform\.OS\s*===\s*['"]web['"]/);
    });

    it(`${file} does not read the window size directly`, () => {
      expect(read(file)).not.toMatch(/Dimensions\.get|useWindowDimensions/);
    });
  });

  it('ReportModal has no isWeb variable', () => {
    expect(read('review/ReportModal.js')).not.toMatch(/isWeb/);
  });

  it('ProfilesTab.style.js overlays use the theme token, not an rgba literal', () => {
    expect(read(OVERLAY_STYLE_FILE)).not.toMatch(/rgba\(/);
  });
});
