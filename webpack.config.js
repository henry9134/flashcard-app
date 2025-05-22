const { withExpo } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  return withExpo(env, {
    projectRoot: __dirname,
  });
};
