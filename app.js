require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const { AppError, sendResponse } = require('./helpers/utils');

const app = express();

const allowlist = ['http://localhost:5000/', 'http://localhost:3000'];
app.use(cors({ origin: allowlist }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose
   .connect(process.env.DB)
   .then(() => console.log('connect successful'))
   .catch(() => console.log('connect fails'));

app.use('/', indexRouter);

app.use((req, res, next) => {
   const err = new AppError(500, 'not found', 'Bad Request');

   next(err);
});

app.use((err, req, res, next) => {
   console.log('ERROR', err);
   // if (err instanceof AppError) {
   //    //
   // }

   sendResponse({
      res,
      status: err.statusCode ? err.statusCode : 500,
      success: false,
      data: null,
      errors: { message: err.message },
      message: err.isOperational ? err.errorType : 'Internal Server Error',
   });
});

module.exports = app;
