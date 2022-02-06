// supports building on netlify more info here: https://github.com/netlify/netlify-lambda/issues/179

const nodeExternals = require("webpack-node-externals");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [nodeExternals()];
    }
    return config;
  },
};
