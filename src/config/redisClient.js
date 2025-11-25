const redis = require("redis");
const constant = require("../config/constant")

const client = redis.createClient({
  url: constant.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
  console.log("Redis Connected...");
})();

module.exports = client;
