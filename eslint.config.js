import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // Sim/ and public/sim/ are the standalone 3D page kept exactly as the team wrote it (ADR-015).
  { ignores: ['dist', 'node_modules', '.github', 'Sim', 'public/sim'] },
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
