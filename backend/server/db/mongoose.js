import mongoose from "mongoose";
import { getUri } from "./config";

// tell mongoose to use promises instead of callbacks
mongoose.Promise = global.Promise;

// connect to our mongoDB instance
const env = process.env.NODE_ENV || "development";
mongoose.connect(getUri({ dbName: `topclip_ext_${env}` }));

// register any general mongoDB callbacks
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

module.exports = {
  mongoose
};
