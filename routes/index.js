const express = require('express');

const { AppError, sendResponse } = require('../helpers/utils');
const router = express.Router();

/* GET home page. */

router.get('/', function (req, res, next) {
   const { err } = req.params;
   try {
      if (err === 'err') {
         throw new AppError(404, 'success ERROR', 'Welcome');
      }
      return sendResponse({
         res,
         data: 'oke',
         message: 'Welcome to Coder Management',
      });
   } catch (error) {
      next(error);
   }
});

const authRouter = require('./auth.api');
const taskRouter = require('./task.api');
const userRouter = require('./user.api');

router.use('/auth', authRouter);
router.use('/task', taskRouter);
router.use('/user', userRouter);

module.exports = router;
