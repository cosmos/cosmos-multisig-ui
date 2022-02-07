// supports building on netlify more info here: https://github.com/netlify/netlify-lambda/issues/179

import nodeExternals from "webpack-node-externals";

export default {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [nodeExternals()];
    }
    return config;
  },
};
