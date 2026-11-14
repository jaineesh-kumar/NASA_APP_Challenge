// Regenerates the golden files: `npm run golden:update`.
// Run only after an approved model change (ADR), then review the git diff.
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
try {
  const { golden, replayGolden } = await server.ssrLoadModule('/scripts/golden-data.ts');
  const write = (name, data) =>
    writeFileSync(
      new URL(`../tests/golden/${name}`, import.meta.url),
      JSON.stringify(data, null, 1) + '\n',
    );
  write('missions.json', golden);
  write('replay.json', replayGolden);
  console.log('Updated tests/golden/missions.json and tests/golden/replay.json');
} finally {
  await server.close();
}
