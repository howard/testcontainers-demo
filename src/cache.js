import redis from 'async-redis';

export class CacheProvider {
    constructor(redisHost, redisPort) {
        this.client = redis.createClient(redisPort, redisHost);
    }

    async get(key) {
        return this.client.get(key);
    }

    async increment(key) {
        return this.client.incr(key);
    }

    async delete(key) {
        return this.client.del(key);
    }

    async keys() {
        return this.client.keys('*');
    }

    async clear() {
        return this.client.flushall();
    }

    async stop() {
        this.client.quit();
    }
}

export default {
    _provider: null,
    get provider() {
        // Use a provider by default that fits production.
        // Could also be omitted to force the user to pick.
        if (!this._provider) {
            this._provider = new CacheProvider('redis', 6379);
        }

        return this._provider;
    },
    set provider(provider) {
        this._provider = provider;
    },
    async get(key) {
        return this.provider.get(key);
    },
    async getInt(key, defaultValue) {
        return parseInt(await this.get(key), 10) || defaultValue;
    },
    async increment(key) {
        return this.provider.increment(key);
    },
    async delete(key) {
        return this.provider.delete(key);
    },
    async keys() {
        return this.provider.keys();
    },
    async clear() {
        return this.provider.clear();
    },
    resetProvider() {
        this._provider.stop();
        this._provider = null;
    }
}