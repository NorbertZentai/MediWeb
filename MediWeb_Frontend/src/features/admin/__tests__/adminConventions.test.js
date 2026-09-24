import fs from 'fs';
import path from 'path';

// Issue #76 acceptance criteria:
// - No file under src/features/admin/ exceeds 400 lines.
// - No `Platform.OS === 'web'` width/maxWidth branch remains (ResponsiveContainer
//   now owns page-content width). Test-only source files are excluded from both
//   checks so this file cannot accidentally match itself.
const ADMIN_ROOT = path.resolve(__dirname, '..');

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

const sourceFiles = listSourceFiles(ADMIN_ROOT);

describe('src/features/admin conventions (issue #76)', () => {
    it('found at least the expected admin source files', () => {
        // Sanity check so a future refactor that removes/renames all files
        // doesn't silently turn this suite into a no-op.
        expect(sourceFiles.length).toBeGreaterThanOrEqual(8);
    });

    it.each(sourceFiles.map((f) => [path.relative(ADMIN_ROOT, f), f]))(
        '%s has at most 400 lines',
        (_relative, file) => {
            const lineCount = fs.readFileSync(file, 'utf8').split('\n').length;
            expect(lineCount).toBeLessThanOrEqual(400);
        }
    );

    it.each(sourceFiles.map((f) => [path.relative(ADMIN_ROOT, f), f]))(
        '%s has no Platform.OS width/maxWidth branch',
        (_relative, file) => {
            const lines = fs.readFileSync(file, 'utf8').split('\n');
            const offending = lines.filter(
                (line) => /Platform\.OS/.test(line) && /width|maxWidth/i.test(line)
            );
            expect(offending).toEqual([]);
        }
    );

    it('AdminScreen.style.js contains no Platform.OS (issue #100)', () => {
        const source = fs.readFileSync(path.join(ADMIN_ROOT, 'AdminScreen.style.js'), 'utf8');
        expect(source).not.toMatch(/Platform\.OS/);
    });

    it.each(sourceFiles.map((f) => [path.relative(ADMIN_ROOT, f), f]))(
        '%s has no hardcoded #fff colour (use theme.colors.white)',
        (_relative, file) => {
            expect(fs.readFileSync(file, 'utf8')).not.toMatch(/#fff/i);
        }
    );
});
