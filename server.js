'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.static('src'))
app.use(express.static('node_modules'))

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
// derp
