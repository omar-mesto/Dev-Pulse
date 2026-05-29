import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@stylistic/arrow-parens': 'off',
    '@stylistic/brace-style': 'off',
    '@stylistic/indent': 'off',
    '@stylistic/indent-binary-ops': 'off',
    '@stylistic/member-delimiter-style': 'off',
    '@stylistic/operator-linebreak': 'off',
    '@stylistic/quote-props': 'off',
    '@tanstack/query/infinite-query-property-order': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      { ts: 'never', vue: 'always' },
    ],
    'newline-before-return': 'error',
    'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        ignores: ['swiper-container', 'swiper-slide', 'vue-dropzone'],
        registeredComponentsOnly: false,
      },
    ],
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': [
      'error',
      {
        shallowOnly: false,
      },
    ],
    'vue/no-v-html': 'off',
    'vue/padding-line-between-blocks': ['error', 'always'],
  },
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.vue', '.ts', 'js'],
        map: [['@@', './']],
      },
    },
  },
})