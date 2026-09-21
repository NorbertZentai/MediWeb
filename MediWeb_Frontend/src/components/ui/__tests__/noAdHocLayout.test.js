import fs from 'fs';
import path from 'path';

// Files named by issue #88 that must no longer derive layout sizing from
// module-scope Dimensions.get(...), a literal 768 breakpoint, or a
// Platform.OS === 'web' width/padding branch. All sizing must instead come
// from useWindowDimensions()/useResponsiveLayout() at render time.
const NO_DIMENSIONS_FILES = [
  'src/components/ui/DatePickerModal.js',
  'src/features/search/FilterModal.js',
];

const NO_LITERAL_768_FILES = ['src/features/medication/MedicationScreen.js'];

const NO_PLATFORM_WEB_LAYOUT_FILES = [
  'src/components/CustomDropdown.style.js',
  'src/features/auth/VerifyEmailScreen.style.js',
];

const root = path.resolve(__dirname, '../../../..');

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

// A line "mentions layout" when it references one of the width/maxWidth/
// padding style keys that useResponsiveLayout/useWindowDimensions is
// supposed to own.
function linesMentioningLayout(source) {
  return source
    .split('\n')
    .filter((line) => /width|maxWidth|padding/i.test(line));
}

describe('No ad-hoc layout sizing left (issue #88)', () => {
  it.each(NO_DIMENSIONS_FILES)(
    '%s no longer calls Dimensions.get(',
    (relativePath) => {
      const source = readSource(relativePath);

      expect(source).not.toMatch(/Dimensions\.get\(/);
    }
  );

  it.each(NO_DIMENSIONS_FILES)(
    '%s no longer references the Dimensions module at all',
    (relativePath) => {
      const source = readSource(relativePath);

      expect(source).not.toMatch(/\bDimensions\b/);
    }
  );

  it.each(NO_LITERAL_768_FILES)(
    '%s contains no literal 768 breakpoint',
    (relativePath) => {
      const source = readSource(relativePath);

      expect(source).not.toMatch(/\b768\b/);
    }
  );

  it.each(NO_PLATFORM_WEB_LAYOUT_FILES)(
    "%s has no Platform.OS === 'web' width/maxWidth/padding branch",
    (relativePath) => {
      const source = readSource(relativePath);
      const offendingLines = linesMentioningLayout(source).filter((line) =>
        /Platform\.OS\s*===\s*['"]web['"]/.test(line)
      );

      expect(offendingLines).toEqual([]);
    }
  );
});
