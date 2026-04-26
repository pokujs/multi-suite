import { mkdir } from 'node:fs/promises';
import { assert, describe, it, poku } from 'poku';
import type { PokuPlugin } from 'poku/plugins';
import { multiSuite } from '../../src/index.js';

const OUTER_DIR = 'test/__fixtures__/empty';

describe('Plugin: multi-suite forwards per-file hooks to sub-suites', async () => {
  await mkdir(OUTER_DIR, { recursive: true });

  await it('outer runner/onTestProcess fire per sub-suite file; setup/teardown run once', async () => {
    const runnerCalls: string[] = [];
    const onTestProcessCalls: string[] = [];
    let setupCount = 0;
    let teardownCount = 0;

    const probe: PokuPlugin = {
      name: 'probe',
      setup: () => {
        setupCount += 1;
      },
      teardown: () => {
        teardownCount += 1;
      },
      runner: (command, file) => {
        runnerCalls.push(file);
        return command;
      },
      onTestProcess: (_child, file) => {
        onTestProcessCalls.push(file);
      },
    };

    const originalExitCode = process.exitCode;

    await poku(OUTER_DIR, {
      noExit: true,
      quiet: true,
      plugins: [
        probe,
        multiSuite([
          { include: 'test/__fixtures__/forward-plugins/suite-a' },
          { include: 'test/__fixtures__/forward-plugins/suite-b' },
        ]),
      ],
    });

    process.exitCode = originalExitCode;

    assert.strictEqual(setupCount, 1, 'outer setup must run exactly once');
    assert.strictEqual(teardownCount, 1, 'outer teardown must run exactly once');
    assert.strictEqual(
      runnerCalls.length,
      2,
      'runner must fire per sub-suite test file'
    );
    assert.ok(
      runnerCalls.some((f) => f.endsWith('suite-a/a.test.ts')) &&
        runnerCalls.some((f) => f.endsWith('suite-b/a.test.ts')),
      'runner must see both sub-suite files'
    );
    assert.strictEqual(
      onTestProcessCalls.length,
      2,
      'onTestProcess must fire per sub-suite test file'
    );
  });
});
