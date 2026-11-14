// Regenerates tests/golden/missions.json: `npm run golden:update`.
// Run only after an approved model change (ADR), then review the git diff.
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
try {
  const { golden } = await server.ssrLoadModule('/scripts/golden-data.ts');
  writeFileSync(
    new URL('../tests/golden/missions.json', import.meta.url),
    JSON.stringify(golden, null, 1) + '\n',
  );
  console.log('Updated tests/golden/missions.json');
} finally {
  await server.close();
}
