const path = require("path");
const { create } = require("babel-test");

const { fixtures } = create({
  plugins: [require.resolve("babel-plugin-macros")]
});

fixtures("goober.macro", path.join(__dirname, "__fixtures__"));
