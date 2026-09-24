const fs = require('fs');
const path = require('path');

// Epic M3 static guards: responsive breakpoints, accessible pressables and the removed template theme.

const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'coverage', '__tests__']);
const SCANNED_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const ROOT = path.resolve(__dirname, '..', '..');
const HOOK_PATH = path.join(ROOT, 'src', 'hooks', 'useResponsiveLayout.js');
const TEST_UTILS_DIR = path.join(ROOT, 'src', 'test-utils');

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath === TEST_UTILS_DIR) continue;
      collectFiles(fullPath, files);
    } else if (entry.isFile() && SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function scan(dirs) {
  return dirs.flatMap((dir) => collectFiles(path.join(ROOT, dir)));
}

const rel = (file) => path.relative(ROOT, file);

describe('M3 guard A: shared breakpoints', () => {
  const files = scan(['src', 'app']).filter((file) => file !== HOOK_PATH);

  it('scans a meaningful number of files', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  it('no line combines a web Platform.OS check with width/maxWidth/padding', () => {
    const platformCheck = /Platform\.OS\s*[!=]==\s*['"]web['"]/;
    const layoutWord = /width|maxWidth|padding/i;
    const offenders = [];
    for (const file of files) {
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (platformCheck.test(line) && layoutWord.test(line)) {
            offenders.push(`${rel(file)}:${index + 1}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  it('breakpoint literals appear only in useResponsiveLayout.js', () => {
    const literals = /\b(768|1024)\b/;
    const offenders = files
      .filter((file) => literals.test(fs.readFileSync(file, 'utf8')))
      .map(rel);
    expect(offenders).toEqual([]);
    expect(literals.test(fs.readFileSync(HOOK_PATH, 'utf8'))).toBe(true);
  });
});

describe('M3 guard B: accessible pressables', () => {
  const files = scan(['src/features', 'src/components', 'app']);

  it('scans a meaningful number of files', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  it('every file has at least as many accessibilityRole/accessible={false} as pressable tags', () => {
    const pressableTag = /<(TouchableOpacity|Pressable|TouchableHighlight)\b/g;
    const a11yMarker = /accessibilityRole=|accessible=\{false\}/g;
    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const pressables = (content.match(pressableTag) || []).length;
      const markers = (content.match(a11yMarker) || []).length;
      if (pressables > markers) {
        offenders.push(`${rel(file)}: ${pressables} pressables vs ${markers} role/accessible markers`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('M3 guard C: no template theme imports', () => {
  const files = scan(['src', 'app', 'components', 'hooks', 'constants']);
  // Built by concatenation so this file never contains the forbidden identifiers itself.
  const forbiddenModules = ['components/' + 'Themed', 'hooks/use' + 'ThemeColor', 'constants/' + 'Colors'];

  it('scans a meaningful number of files', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  it('no source file imports the template theme modules', () => {
    const importPattern = /(?:from\s+|require\(\s*|import\(\s*|import\s+)['"]([^'"]+)['"]/g;
    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(importPattern)) {
        if (forbiddenModules.some((mod) => match[1].includes(mod))) {
          offenders.push(`${rel(file)}: imports "${match[1]}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('M3 guard E: no window width reads in layout code', () => {
  const files = scan(['src/features', 'src/components', 'app']);
  // Built by concatenation so this file never contains the forbidden identifier itself.
  const needle = 'inner' + 'Width';

  it('scans a meaningful number of files', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  it('no file under src/features, src/components or app reads window width directly', () => {
    const offenders = files
      .filter((file) => fs.readFileSync(file, 'utf8').includes(needle))
      .map(rel);
    expect(offenders).toEqual([]);
  });
});

describe('M3 guard D: labelled text inputs', () => {
  const files = scan(['src/features', 'src/components', 'app']);
  const collect = () => {
    const found = [];
    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(/<TextInput\b/g)) {
        found.push(file);
        const rest = content.slice(match.index);
        const end = rest.indexOf('/>');
        const tag = end === -1 ? rest : rest.slice(0, end);
        if (!tag.includes('accessibilityLabel=')) {
          const line = content.slice(0, match.index).split('\n').length;
          offenders.push(`${rel(file)}:${line}`);
        }
      }
    }
    return { found, offenders };
  };

  it('finds a meaningful number of TextInput occurrences', () => {
    expect(collect().found.length).toBeGreaterThanOrEqual(10);
  });

  it('every TextInput has an accessibilityLabel', () => {
    expect(collect().offenders).toEqual([]);
  });
});
