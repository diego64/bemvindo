import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Proibição explícita de `any` (reforça o strictTypeChecked)
      '@typescript-eslint/no-explicit-any': 'error',

      // Imports: sempre usar `import type` quando possível
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Proibir imports relativos de diretórios pai — usar alias @/
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Proibido importar de diretórios pai. Use o alias absoluto @/',
            },
          ],
        },
      ],

      // Interfaces sem prefixo I
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      // Retorno explícito em funções de módulo (não aplicado a expressões simples)
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js', 'commitlint.config.js'],
  },
)
