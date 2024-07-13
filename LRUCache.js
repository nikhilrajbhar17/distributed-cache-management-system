class LRUCache {
    constructor(capacity) {
      this.capacity = capacity;
      this.cache = new Map();
    }
  
    get(key) {
      if (!this.cache.has(key)) {
        return -1; // Return -1 if key does not exist
      }
      const value = this.cache.get(key);
      this.cache.delete(key); // Delete and re-insert to update its position
      this.cache.set(key, value);
      return value;
    }
  
    set(key, value) {
      if (this.cache.has(key)) {
        this.cache.delete(key); // Delete existing key to update it
      } else if (this.cache.size >= this.capacity) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey); // Evict the least recently used item
      }
      this.cache.set(key, value); // Add new item to the end of the Map
    }
  
    invalidate(key) {
      this.cache.delete(key); // Remove key from cache
    }
  }
  
  module.exports = LRUCache;
  