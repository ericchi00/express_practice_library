import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import mongoose from 'mongoose';
import dirname from './dirname.js';

import indexRouter from './routes/index.js';
import catalogRouter from './routes/catalog.js';
import usersRouter from './routes/users.js';

import compression from 'compression';
import helmet from 'helmet';

const app = express();
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('views', path.join(dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(dirname, 'public'), { index: false }));

app.use(helmet());
app.use(compression());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

app.use(function (req, res, next) {
	res
		.status(404)
		.json({ message: "We couldn't find what you were looking for 😞" });
});

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).json(err);
});

export default app;
