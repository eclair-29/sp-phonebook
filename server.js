/* eslint-disable no-console */
const Hapi = require("hapi");
const routes = require("./src/api");

// Initialize hapi server
const init = async () => {
  // Server config
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: "localhost"
  });

  // Route handlers
  await server.route(routes);

  // Start server
  await server.start();
  console.log("Server running on", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();
