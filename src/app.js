import express from 'express';

import api from './api.js';

const app = express();
app.use('/', api);

export default app;