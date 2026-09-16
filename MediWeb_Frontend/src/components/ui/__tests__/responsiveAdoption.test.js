import fs from 'fs';
import path from 'path';

// Screens that the issue requires to wrap their page content in
// ResponsiveContainer (see acceptance criteria of issue #75).
const ADOPTED_SCREENS = [
  'src/features/home/HomeScreen.js',
  'src/features/favorites/FavoritesScreen.js',
  'src/features/medication/MedicationScreen.js',
  'src/features/profile/ProfileScreen.js',
  'src/features/profile/AccountScreen.js',
  'src/features/search/SearchScreen.js',
];

// Style files that must no longer hard-code the page-container width rules
// once ResponsiveContainer takes over layout duties. AccountScreen keeps its
// styles inline, so it has no dedicated style file to check separately.
const STYLE_FILES = [
  'src/features/home/HomeScreen.style.js',
  'src/features/favorites/FavoritesScreen.style.js',
  'src/features/medication/MedicationScreen.style.js',
  'src/features/profile/ProfileScreen.style.js',
  'src/features/search/SearchScreen.style.js',
];

const root = path.resolve(__dirname, '../../../..');

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

// A line "mentions layout" when it references one of the width/maxWidth/
// padding style keys that ResponsiveContainer is supposed to own.
function linesMentioningLayout(source) {
  return source
    .split('\n')
    .filter((line) => /width|maxWidth|padding/i.test(line));
}

describe('ResponsiveContainer adoption on the main screens', () => {
  it.each(ADOPTED_SCREENS)('%s imports ResponsiveContainer', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toMatch(/ResponsiveContainer/);
    expect(source).toMatch(
      /import\s+ResponsiveContainer\s+from\s+['"].*ResponsiveContainer['"]/
    );
  });

  it.each(ADOPTED_SCREENS)(
    '%s has no Platform.OS layout branch left',
    (relativePath) => {
      const source = readSource(relativePath);
      const offendingLines = linesMentioningLayout(source).filter((line) =>
        /Platform\.OS/.test(line)
      );

      expect(offendingLines).toEqual([]);
    }
  );

  it.each(STYLE_FILES)(
    '%s no longer hard-codes the page-container max width',
    (relativePath) => {
      const source = readSource(relativePath);

      expect(source).not.toMatch(/maxWidth:\s*(1000|1400)/);
      expect(source).not.toMatch(/alignSelf:\s*['"]center['"]/);
    }
  );

  it('SearchScreen no longer derives desktop layout from Platform.OS === "web"', () => {
    const source = readSource('src/features/search/SearchScreen.js');

    expect(source).not.toMatch(/Platform\.OS\s*===\s*['"]web['"]/);
  });
});
