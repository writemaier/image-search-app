module.exports = {
  rewrites() {
    return [
      {
        source: "/images/:key",
        destination: "/api/images/:key",
      },
    ];
  },
};
