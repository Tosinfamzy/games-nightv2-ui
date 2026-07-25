//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    // Not part of the app tsconfig project (type-aware linting errors on them)
    // and not app source: build output, tool reports, config files, and the
    // Playwright e2e specs (linted/run by Playwright's own tooling).
    ignores: [
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      '**/*.config.{js,ts}',
      'e2e/**',
    ],
  },
  ...tanstackConfig,
  {
    settings: {
      // msw's CJS entry does `require('until-async')`, but until-async is
      // ESM-only, so eslint-plugin-import-x crashes (ERR_REQUIRE_ESM) when it
      // tries to analyze msw's exports. We consume msw only via ESM at runtime,
      // so tell import-x not to parse it.
      'import-x/ignore': ['msw'],
    },
    rules: {
      // Noisy under type-aware linting against imperfect API types, and its
      // autofix strips genuine runtime guards. Not worth churning 100+ sites.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Its autofix removes casts that are actually required (e.g. HTMLElement
      // -> HTMLInputElement to read `.value` in tests), breaking the build.
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
]
