const nodeExternals = require("webpack-node-externals");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [nodeExternals()];
    }
    return config;
  },
};
