import express from 'express';

import cache from './cache.js';

const router = express.Router();
const termPattern = '[0-9a-z]{1,10}';

router.get(`/:term(${termPattern})`, async (req, res) => {
    const term = req.params.term;
    const count = parseInt(await cache.get(term), 10) || 0;

    res.send({term, count});
});

router.post(`/:term(${termPattern})`, async (req, res) => {
    await cache.increment(req.params.term);

    res.status(204).send();
});

router.delete(`/:term(${termPattern})`, async (req, res) => {
    await cache.delete(req.params.term);

    res.status(204).send();
});

router.delete('/', async (req, res) => {
    await cache.clear();

    res.status(204).send();
});

router.get('/', async (req, res) => {
    const terms = (await Promise.all((await cache.keys())
        .map(async (term) => ({term, count: parseInt(await cache.get(term))}))
    )).sort((left, right) => right.count - left.count);

    res.send(terms);
});

export default router;