import { promisify } from "util";
import redis from "redis";

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);
const delAsync = promisify(client.del).bind(client);
const incrAsync = promisify(client.incr).bind(client);

const setObject = async (key, object) => {
  try {
    return await setAsync(key, JSON.stringify(object));
  } catch (err) {
    return false;
  }
};

const getObject = async key => {
  try {
    const stringifiedObject = await getAsync(key);
    return JSON.parse(stringifiedObject);
  } catch (err) {
    return undefined;
  }
};

export default {
  set: setAsync,
  get: getAsync,
  delete: delAsync,
  setObject,
  getObject,
  incr: incrAsync
};
