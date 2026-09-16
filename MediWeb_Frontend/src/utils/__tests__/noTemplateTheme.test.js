const fs = require('fs');
const path = require('path');

// Directories that must never be scanned: dependencies, VCS internals and build output.
const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'coverage']);
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js']);
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SELF_PATH = path.resolve(__filename);

// Plain literals (not built by concatenation) so this test's own source never self-matches.
const FORBIDDEN_IDENTIFIERS = [
  'ThemedText',
  'ThemedView',
  'useThemeColor',
  '@/hooks/useColorScheme',
  'IconSymbol',
  'TabBarBackground',
];

function collectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (entry.isFile() && SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('template téma rendszer eltávolítva', () => {
  it('egyetlen tracked .ts/.tsx/.js fájl sem hivatkozik a törölt template komponensekre', () => {
    const files = collectFiles(REPO_ROOT).filter((file) => path.resolve(file) !== SELF_PATH);
    expect(files.length).toBeGreaterThan(0);

    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const identifier of FORBIDDEN_IDENTIFIERS) {
        if (content.includes(identifier)) {
          offenders.push(`${path.relative(REPO_ROOT, file)}: contains "${identifier}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
