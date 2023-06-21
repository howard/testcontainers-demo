import request from 'supertest';

import {setUpRedisTestcontainer, tearDownRedisTestcontainer} from './helpers.js';
import app from '../src/app.js';
import cache from '../src/cache.js';

describe('API with real Redis', () => {
    let redisContainer;

    beforeAll(async () => {
        redisContainer = await setUpRedisTestcontainer();
    });

    afterAll(async () => {
        await tearDownRedisTestcontainer(redisContainer);
    });

    afterEach(async () => {
        await cache.clear();
    });

    it('fetches non-existing term with count zero', async () => {
        const response = await request(app).get('/myTerm').expect(200);
        expect(response.body.count).toBe(0);
    });

    it('increments term counter', async () => {
        await request(app).post('/myTerm').expect(204);

        const firstResponse = await request(app).get('/myTerm').expect(200);
        expect(firstResponse.body.count).toBe(1);

        await request(app).post('/myTerm').expect(204);

        const secondResponse = await request(app).get('/myTerm').expect(200);
        expect(secondResponse.body.count).toBe(2);
    });

    it('deletes term counter', async () => {
        await request(app).post('/myTerm').expect(204);
        await request(app).delete('/myTerm').expect(204);
        expect((await request(app).get('/myTerm')).body.count).toBe(0);
    });

    it('deletes missing term counter', async () => {
        await request(app).delete('/myTerm').expect(204);
        expect((await request(app).get('/myTerm')).body.count).toBe(0);
    });

    it('clears all counters', async () => {
        await request(app).post('/myTerm').expect(204);
        await request(app).post('/otherTerm').expect(204);
        await request(app).delete('/').expect(204);
        expect((await request(app).get('/')).body.length).toBe(0);
    });

    it('fetches all counters', async () => {
        expect((await request(app).get('/')).body).toEqual([]);

        await request(app).post('/myTerm').expect(204);
        await request(app).post('/otherTerm').expect(204);
        await request(app).post('/otherTerm').expect(204);

        expect((await request(app).get('/')).body).toEqual([
            {term: 'otherTerm', count: 2},
            {term: 'myTerm', count: 1}
        ]);
    });

    it('rejects terms longer than 10 characters', async () => {
        await request(app).get('/0123456789a').expect(404);
        await request(app).post('/0123456789a').expect(404);
    });
});