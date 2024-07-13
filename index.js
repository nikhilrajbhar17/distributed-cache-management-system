const express = require("express");
const Redis = require("ioredis");
const LRUCache = require("./LRUCache");
const app = express();

// Initialize Redis client
const redisClient = new Redis();

// Initialize custom LRU cache with desired capacity
const lruCache = new LRUCache(100);

// Middleware to check cache before processing the request
async function cacheMiddleware(req, res, next) {
  const key = req.originalUrl; // Use the request URL as the cache key

  // Check in LRU cache first
  const lruData = lruCache.get(key);
  if (lruData !== -1) {
    console.log("Serving from LRU Cache");
    return res.send(lruData);
  }

  // Check in Redis if not found in LRU cache
  try {
    const redisData = await redisClient.get(key);
    if (redisData) {
      console.log("Serving from Redis Cache");
      lruCache.set(key, redisData); // Update LRU cache with data from Redis
      return res.send(redisData);
    }
  } catch (error) {
    console.error("Redis error:", error);
  }

  next(); // Proceed to the actual route handler if not found in cache
}

// Route to set data in the cache
app.post("/setData/:key/:value", async (req, res) => {
  const { key, value } = req.params;

  // Set data in both caches
  lruCache.set(key, value);
  try {
    await redisClient.set(key, value, "EX", 3600); // Expire in 1 hour
  } catch (error) {
    console.error("Redis error:", error);
  }

  res.send(`Data set for key: ${key}`);
});

// Route to get data from the cache
app.get("/getData/:key", cacheMiddleware, async (req, res) => {
  const { key } = req.params;

  // Fetch data if not found in caches
  const data = `Data for key: ${key}`;

  // Store fetched data in both caches
  lruCache.set(key, data);
  try {
    await redisClient.set(key, data, "EX", 3600); // Expire in 1 hour
  } catch (error) {
    console.error("Redis error:", error);
  }

  res.send(data);
});

// Route to invalidate data in the cache
app.delete("/invalidateData/:key", async (req, res) => {
  const { key } = req.params;

  // Invalidate data in both caches
  lruCache.invalidate(key);
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error("Redis error:", error);
  }

  res.send(`Data invalidated for key: ${key}`);
});

// Start the server
app.listen(3000, () => {
  console.log("App is running on port 3000");
});
