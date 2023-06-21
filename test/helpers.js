import {GenericContainer} from 'testcontainers';
import cache, {CacheProvider} from "../src/cache.js";


export async function setUpRedisTestcontainer() {
    const redisContainer = await new GenericContainer('redis:7')
        .withExposedPorts(6379)
        .start();
    cache.provider = new CacheProvider('localhost', redisContainer.getMappedPort(6379));

    return redisContainer;
}

export async function tearDownRedisTestcontainer(redisContainer) {
    await redisContainer.stop();
    cache.resetProvider();
}