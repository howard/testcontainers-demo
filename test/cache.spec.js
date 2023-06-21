import cache from '../src/cache.js';
import {setUpRedisTestcontainer, tearDownRedisTestcontainer} from "./helpers.js";

describe('cache', () => {
    let redisContainer;

    beforeAll(async () => {
        redisContainer = await setUpRedisTestcontainer();
    }, 10 * 1000); // Increase timeout so Redis has enough time to start, which might require downloading the image.

    afterAll(async () => {
        await tearDownRedisTestcontainer(redisContainer);
    });

    afterEach(async () => {
        await cache.clear();
    });

    it('should increment Redis entries', async () => {
        expect(await cache.get('foo')).toBe(null);

        await cache.increment('foo');
        expect(await cache.get('foo')).toBe('1');
    });

    it('should delete existing Redis entries', async () => {
        await cache.increment('bar');
        expect(await cache.get('bar')).toBe('1');

        await cache.delete('bar');
        expect(await cache.get('bar')).toBe(null);
    });

    it('should delete missing Redis entries without fuss', async () => {
        expect(await cache.get('whatever')).toBe(null);

        await cache.delete('whatever');
        expect(await cache.get('whatever')).toBe(null);
    });

    it('should list all Redis entries', async () => {
        await cache.increment('listall');
        await cache.increment('more');

        expect((await cache.keys()).sort()).toEqual(['listall', 'more']);
    });
});