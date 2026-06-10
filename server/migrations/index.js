// Central registry for all migrations.
// Add new migrations here to ensure they are bundled correctly by esbuild.

module.exports = [
  require("./001-init")
];
