import "./config/config";

import path from "path";

import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import {
  Server as HTTPServer
} from "http";

import {
  tokenVerifyRoute
} from "./middleware/tokenVerify";
import * as routes from "./utils/routes";

// connecting redis & mongoose
import "./utils/redis";
import "./db/mongoose";

console.log(process.env.NODE_ENV);

// create the express app
const app = express();

// allow cors request, as extensions are hosted on twitch
app.use(cors());

// protect app from well-known web vulnerabilities
app.use(helmet());

// use body-parser middleware
app.use(bodyParser.json());

// create HTTP(S) server
const server = HTTPServer(app);

// serve static files
app.use("/static", express.static(path.join(__dirname, "./static")));

// home route to send basic data like api version
app.get("/", (req, res) => {
  res.send({
    version: process.env.npm_package_version,
    name: "TopClip Backend"
  });
});

// TopClip Routes
app.get("/config", tokenVerifyRoute, routes.handleGetConfig);
app.post("/config", tokenVerifyRoute, routes.handlePostConfig);
app.get("/clip", tokenVerifyRoute, routes.handleGetTopClip);
app.post("/click/:slug", tokenVerifyRoute, routes.handlePostClick);
app.get("/clicks", tokenVerifyRoute, routes.handleGetClicks);

// Optional fallthrough error handler
// eslint-disable-next-line
app.use((err, req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  console.error(err.toString());
  res.statusCode = 500;
  //res.end(res.sentry + "\n");
  res.end(err.message);
});

// start listening for http connections
const port = process.env.PORT;
server.listen(port || 8080, function () {
  console.log("Listening on ", this.address());
});

module.exports = {
  app,
  server
};