import redis from 'async-redis';

export class CacheProvider {
    constructor(redisHost, redisPort) {
        this.client = redis.createClient(redisPort, redisHost);
    }

    async get(key) {
        return await this.client.get(key);
    }

    async increment(key) {
        return await this.client.incr(key);
    }

    async delete(key) {
        return await this.client.del(key);
    }

    async keys() {
        return await this.client.keys('*');
    }

    async clear() {
        this.client.flushall();
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
        return await this.provider.get(key);
    },
    async increment(key) {
        return await this.provider.increment(key);
    },
    async delete(key) {
        return await this.provider.delete(key);
    },
    async keys() {
        return await this.provider.keys();
    },
    async clear() {
        return await this.provider.clear();
    },
    resetProvider() {
        this._provider.stop();
        this._provider = null;
    }
}