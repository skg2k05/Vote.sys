const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const next = require('next');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');
const voter = require('./routes/voter');
const company = require('./routes/company');
const candidate = require('./routes/candidate');
const upload = require('./routes/upload');
const exp = express();

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

exp.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
exp.use(bodyParser.json({ limit: '10mb' }));

exp.use('/company', company);

exp.use('/voter', voter);

exp.use('/candidate', candidate);

exp.use('/upload', upload);

const app = next({
	dev: process.env.NODE_ENV !== 'production',
});

const routes = require('./routes');
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
	exp.use(handler).listen(3000, function () {
		console.log('Node server listening on port 3000');
	});
});
