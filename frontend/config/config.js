import config from "./config.json";
import packageJSON from "../package.json";

window.config = {};
function loadEnvVars(envVarsObject) {
  if (envVarsObject) {
    Object.keys(envVarsObject).forEach(key => {
      window.config[key] = envVarsObject[key];
    });
  }
}

loadEnvVars(packageJSON);

// load globally defined ENV vars
loadEnvVars(config[""]);

// load defined ENV vars of current NODE_ENV
const env = process.env.NODE_ENV || "development";
loadEnvVars({
  ...config[env],
  NODE_ENV: env
});
