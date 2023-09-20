const http = require("http");

function waitForApp(callback) {
  const options = {
    host: "localhost",
    port: 6969,
    path: "/api/ping",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      callback();
    } else {
      setTimeout(() => waitForApp(callback), 1000);
    }
  });

  req.on("error", () => {
    setTimeout(() => waitForApp(callback), 1000);
  });

  req.end();
}

waitForApp(() => {
  console.log("App is ready!");
  process.exit(0);
});
