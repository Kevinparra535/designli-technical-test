// Flat config (ESLint 9) adaptado del .eslintrc.js canonico del autor.
// Conserva las mismas reglas y la idea de grupos de import-sort por tipo de
// archivo, mapeada a la estructura de designli-technical-test (RN + Expo +
// Clean Arch + MVVM):
//
//   - Default: cualquier .ts/.tsx
//   - Screens: `**/*Screen.tsx` (la vista; su ViewModel local va al final)
//   - ViewModels: `**/*ViewModel.ts` (en RN son .ts, no .tsx — no renderean JSX)
//   - DI bootstrap: `src/config/di.ts`
//
// Estructura real de este proyecto (los VM viven junto a su screen en
// ui/screens/<Feature>/; el cliente HTTP vive en data/network/):
//   src/config/      → config.ts, types.ts, di.ts
//   src/domain/      → useCases/ (+ entities/, repositories/, services/ al crecer)
//   src/data/        → network/ (HTTP managers: axios, finnhub, webhook)
//   src/ui/          → navigation/, screens/<Feature>/, components/, styles/, utils/
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const globals = require('globals');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,

  // ── Reglas globales + import-sort default ──────────────────────────────────
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2021,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Estilo
      'arrow-body-style': ['error', 'as-needed'],

      // Off (preservado del .eslintrc canonico — TS / Prettier / preferencias)
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      'no-nested-ternary': 'off',
      'no-restricted-globals': 'off',
      'no-param-reassign': 'off',
      'no-unused-vars': 'off',

      'react/function-component-definition': 'off',
      'react/button-has-type': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.ts'] }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/no-unescaped-entities': 'off',

      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'import/order': 'off',

      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Import sorting (default — cualquier .ts/.tsx)
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. React + dependencias externas (npm packages)
            ['^react', '^@?\\w'],

            // 2. Config del proyecto (DI, TYPES)
            ['^@/config/'],

            // 3. Domain — entities primero (datos puros)
            ['^@/domain/entities/'],

            // 4. Domain — contratos (repositories + services)
            ['^@/domain/(repositories|services)/'],

            // 5. Domain — useCases (la API que el VM consume)
            ['^@/domain/useCases/'],

            // 6. Data — network (HTTP) -> services -> repositories -> models
            ['^@/data/network/'],
            ['^@/data/services/'],
            ['^@/data/repositories/'],
            ['^@/data/models/'],

            // 7. UI — components -> navigation -> screens -> styles/utils
            ['^@/ui/components/'],
            ['^@/ui/navigation/'],
            ['^@/ui/screens/'],
            ['^@/ui/styles/', '^@/ui/utils/'],

            // 8. Cualquier alias que no encajo arriba
            ['^@/'],

            // 9. Relativos (./ y ../)
            ['^\\.\\.'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // ── Screens: `XxxScreen.tsx` (la vista) ───────────────────────────────────
  // El VM relativo del screen va al final, justo antes de los assets locales.
  {
    files: ['**/*Screen.tsx'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^mobx', '^expo', '^@?\\w'],
            ['^@/config/'],
            ['^@/domain/entities/'],
            ['^@/domain/(repositories|services)/'],
            ['^@/domain/useCases/'],
            [
              '^@/data/network/',
              '^@/data/services/',
              '^@/data/repositories/',
              '^@/data/models/',
            ],
            ['^@/ui/components/'],
            ['^@/ui/navigation/'],
            ['^@/ui/styles/', '^@/ui/utils/'],
            ['^@/'],
            // Padre antes que hermano (clasica regla)
            ['^\\.\\.'],
            // El ViewModel local del screen va al final, separado
            ['^\\./.*ViewModel$'],
            ['^\\.'],
          ],
        },
      ],
    },
  },

  // ── ViewModels: `XxxViewModel.ts` ─────────────────────────────────────────
  // No tocan React. inversify + mobx primero; useCases en el medio; UI utils
  // (Logger, otros stores singleton) al final.
  {
    files: ['**/*ViewModel.ts'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^inversify', '^mobx', '^expo', '^@?\\w'],
            ['^@/config/'],
            ['^@/domain/entities/'],
            ['^@/domain/(repositories|services)/'],
            ['^@/domain/useCases/'],
            ['^@/ui/styles/', '^@/ui/utils/'],
            ['^@/ui/'],
            ['^@/'],
            ['^\\.\\.'],
            ['^\\.'],
          ],
        },
      ],
    },
  },

  // ── App entry: `index.ts` — el ORDEN de imports es semantico ──────────────
  // `reflect-metadata` es un polyfill que DEBE ejecutarse antes que cualquier
  // codigo con decoradores. Eximimos la entry del import-sort para que el
  // polyfill quede siempre primero.
  {
    files: ['index.ts'],
    rules: {
      'simple-import-sort/imports': 'off',
    },
  },

  // ── DI bootstrap: `src/config/di.ts` ──────────────────────────────────────
  // Orden ceremonial: inversify -> TYPES -> data (impls) ->
  // domain (contratos) -> useCases -> viewModels/screens. Igual que el canon.
  {
    files: ['**/config/di.ts'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^reflect-metadata', '^inversify', '^@?\\w'],
            ['^@/config/types$'],
            ['^@/data/network/'],
            ['^@/data/services/'],
            ['^@/data/repositories/'],
            ['^@/data/models/'],
            ['^@/domain/(repositories|services)/'],
            ['^@/domain/useCases/'],
            ['^@/ui/navigation/'],
            ['^@/ui/screens/'],
            ['^@/'],
            ['^\\.'],
          ],
        },
      ],
    },
  },

  // ── Ignores ────────────────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'android/',
      'ios/',
      'coverage/',
      'dist/',
    ],
  },
];
