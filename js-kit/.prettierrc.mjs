export default {
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  overrides: [
    {
      files: "*.html",
      options: {
        parser: "html",
      },
    },
    {
      files: "*.css",
      options: {
        parser: "css",
      },
    },
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^[^@src].*\\.css$",
    "^@src/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
