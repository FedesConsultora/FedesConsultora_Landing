import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Apps Script no usa módulos: todos los .js comparten el mismo scope global y
  // además exponen globals de Google (DriveApp, PropertiesService, etc.).
  // Su sintaxis se valida por separado con `npm run cms:check` antes del deploy.
  globalIgnores(['dist', 'apps-script']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Hay deuda histórica de imports/variables sin uso y algunos patrones de
      // efectos anteriores a las reglas nuevas de React 19. Los mantenemos
      // visibles como warnings sin bloquear releases ajenos a esa deuda.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-irregular-whitespace': 'warn',
      'no-constant-binary-expression': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    files: ['vite.config.js', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
])
