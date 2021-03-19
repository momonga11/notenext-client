module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  setupFiles: ['./tests/unit/setup.js'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(vee-validate/dist/rules)|(codemirror/lib/codemirror.css)|(@toast-ui/editor/dist/))',
  ],
};
