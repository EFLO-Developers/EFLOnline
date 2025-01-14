const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    common: path.resolve(__dirname, 'common'), // Adjust the path as needed
  };

  return config;
};