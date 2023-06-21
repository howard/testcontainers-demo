import request from 'supertest';
import {jest} from '@jest/globals';

import app from '../src/app.js';
import cache from '../src/cache.js';

describe('API with mocked Redis', () => {
    beforeEach(() => {
        cache.provider = {
            get: jest.fn(),
            increment: jest.fn(),
            delete: jest.fn(),
            keys: jest.fn(),
            clear: jest.fn(),
            stop: jest.fn()
        }
    });

    it('fetches non-existing term with count zero', async () => {
        cache.provider.get.mockReturnValue('0');

        const response = await request(app).get('/myTerm').expect(200);

        expect(response.body.count).toBe(0);
        expect(cache.provider.get).toHaveBeenCalledWith('myTerm');
    });

    it('increments term counter', async () => {
        await request(app).post('/myTerm').expect(204);
        expect(cache.provider.increment).toHaveBeenCalledWith('myTerm');

        cache.provider.get.mockReturnValueOnce('1');
        const firstResponse = await request(app).get('/myTerm').expect(200);
        expect(firstResponse.body.count).toBe(1);
        expect(cache.provider.get).toHaveBeenCalledWith('myTerm');

        await request(app).post('/myTerm').expect(204);
        expect(cache.provider.increment).toHaveBeenCalledTimes(2);

        cache.provider.get.mockReturnValueOnce('2');
        const secondResponse = await request(app).get('/myTerm').expect(200);
        expect(secondResponse.body.count).toBe(2);
    });

    it('deletes term counter', async () => {
        await request(app).delete('/myTerm').expect(204);
        expect(cache.provider.delete).toHaveBeenCalledWith('myTerm');
    });

    xit('deletes missing term counter', async () => {
        // This test covers how Redis/its client behaves when trying to delete something that doesn't exist.
        // With mocks, that's not really possible.
    });

    it('clears all counters', async () => {
        await request(app).delete('/').expect(204);
        expect(cache.provider.clear).toHaveBeenCalled();

        // No coverage possible for whether clear actually does the right thing.
    });

    it('fetches all counters', async () => {
        cache.provider.keys.mockReturnValueOnce([]);
        expect((await request(app).get('/')).body).toEqual([]);

        cache.provider.keys.mockReturnValueOnce(['myTerm', 'otherTerm']);
        cache.provider.get.mockImplementation(term => {
            switch (term) {
                case 'myTerm':
                    return '1';
                case 'otherTerm':
                    return '2';
                default:
                    fail('attempted to fetch unexpected term');
            }
        });

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