process.env.NODE_ENV = process.env.NODE_ENV || "development";
import config from "./config.json";

function loadEnvVars(envVarsObject) {
  if (envVarsObject) {
    Object.keys(envVarsObject).forEach(key => {
      process.env[key] = envVarsObject[key];
    });
  }
}

// load globally defined ENV vars
loadEnvVars(config[""]);

// load defined ENV vars of current NODE_ENV
loadEnvVars(config[process.env.NODE_ENV]);
