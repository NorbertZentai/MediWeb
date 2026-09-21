import fs from 'fs';
import path from 'path';

// Issue #77 acceptance criteria:
// - SettingsScreen.js is at most 200 lines.
// - SettingsTab.js is at most 250 lines.
// - No file under src/features/settings/ or src/features/profile/components/settings/
//   exceeds 300 lines.
// - Neither settings file defines a local showAlert/showConfirm copy — both
//   must import the shared src/utils/dialogs.js instead.
const SETTINGS_SCREEN_ROOT = path.resolve(__dirname, '..');
const SETTINGS_SCREEN_FILE = path.join(SETTINGS_SCREEN_ROOT, 'SettingsScreen.js');
const SETTINGS_TAB_FILE = path.resolve(
    SETTINGS_SCREEN_ROOT,
    '..',
    'profile',
    'components',
    'SettingsTab.js'
);
const PROFILE_SETTINGS_ROOT = path.resolve(
    SETTINGS_SCREEN_ROOT,
    '..',
    'profile',
    'components',
    'settings'
);

function listSourceFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        if (entry.name === '__tests__') return [];
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listSourceFiles(full);
        if (entry.isFile() && entry.name.endsWith('.js')) return [full];
        return [];
    });
}

function lineCount(file) {
    return fs.readFileSync(file, 'utf8').split('\n').length;
}

const settingsSourceFiles = listSourceFiles(SETTINGS_SCREEN_ROOT);
const profileSettingsSourceFiles = listSourceFiles(PROFILE_SETTINGS_ROOT);
const allSourceFiles = [...settingsSourceFiles, ...profileSettingsSourceFiles];

describe('src/features/settings and profile/components/settings conventions (issue #77)', () => {
    it('found at least the expected source files in both directories', () => {
        expect(settingsSourceFiles.length).toBeGreaterThanOrEqual(6);
        expect(profileSettingsSourceFiles.length).toBeGreaterThanOrEqual(6);
    });

    it('SettingsScreen.js has at most 200 lines', () => {
        expect(lineCount(SETTINGS_SCREEN_FILE)).toBeLessThanOrEqual(200);
    });

    it('SettingsTab.js has at most 250 lines', () => {
        expect(lineCount(SETTINGS_TAB_FILE)).toBeLessThanOrEqual(250);
    });

    it.each(allSourceFiles.map((f) => [path.relative(path.resolve(SETTINGS_SCREEN_ROOT, '..'), f), f]))(
        '%s has at most 300 lines',
        (_relative, file) => {
            expect(lineCount(file)).toBeLessThanOrEqual(300);
        }
    );

    it.each(
        [SETTINGS_SCREEN_FILE, SETTINGS_TAB_FILE].map((f) => [path.basename(f), f])
    )('%s declares no local showAlert/showConfirm copy', (_name, file) => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).not.toMatch(/(const|function)\s+show(Alert|Confirm)\b/);
    });
});
