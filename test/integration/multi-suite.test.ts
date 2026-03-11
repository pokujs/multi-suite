import { mkdir } from 'node:fs/promises';
import { assert, describe, it, poku } from 'poku';
import { multiSuite } from '../../src/index.js';

const OUTER_DIR = 'test/__fixtures__/empty';

const runPlugin = async (
  suites: Parameters<typeof multiSuite>[0]
): Promise<number> => {
  const originalExit = process.exit;
  let exitCode = 0;

  (process as NodeJS.Process).exit = ((code?: number) => {
    exitCode = code === 0 ? 0 : 1;
  }) as typeof process.exit;

  try {
    await poku(OUTER_DIR, {
      noExit: true,
      // quiet: true,
      plugins: [multiSuite(suites)],
    });
  } finally {
    process.exit = originalExit;
  }

  return exitCode;
};

describe('Plugin: multi-suite', async () => {
  await mkdir(OUTER_DIR, { recursive: true });

  await it('accumulated results across all suites', async () => {
    const exitCode = await runPlugin([
      { include: 'test/__fixtures__/accumulated-results/suite-a' },
      { include: 'test/__fixtures__/accumulated-results/suite-b' },
    ]);

    assert.strictEqual(exitCode, 0, 'Exit Code needs to be 0');
  });

  await it('suite B runs even when suite A fails (isolation)', async () => {
    const exitCode = await runPlugin([
      { include: 'test/__fixtures__/isolation/suite-a' },
      { include: 'test/__fixtures__/isolation/suite-b' },
    ]);

    assert.strictEqual(
      exitCode,
      1,
      'Exit code must reflect the failure in suite A'
    );
  });
});
