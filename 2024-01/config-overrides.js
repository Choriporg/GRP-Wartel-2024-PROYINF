const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false
    }
  })
);
