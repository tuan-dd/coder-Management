const { AppError } = require('../helpers/utils');
const jwt = require('jsonwebtoken');
const validation = (schema) => async (req, res, next) => {
   const body = req.body;
   const query = req.query;
   try {
      if (Object.keys(body).length)
         await schema.validate(body, { stripUnknown: true });
      if (Object.keys(query).length)
         await schema.validate(query, { stripUnknown: true });
      // if (!Object.keys(body).length && !Object.keys(query).length) {
      //    throw new AppError(400, 'Bad Request', 'declined access');
      // }
      next();
   } catch (error) {
      next(error);
   }
};

const validateUser = (position) => async (req, res, next) => {
   const authorizationHeader = req.headers['authorization'];
   const token = authorizationHeader?.split('Bearer ')[1];
   try {
      if (!token) {
         throw new AppError(401, 'Invalid access', 'declined access');
      }
      jwt.verify(token, process.env.BACKEND_USER_SECRET_KEY, (err, data) => {
         if (err) {
            throw new AppError(401, 'Invalid access', 'declined access');
         }
         req.user = {
            email: data.email,
            position: data.position,
         };
         // if (!position) {
         //    console.log('set position');
         //    throw new AppError(403, 'Unauthorized', 'Not Acceptable');
         // }
         if (!position) {
            return next();
         }
         if (position === 'both') {
            if (!['Senior', 'Leader'].includes(data.position)) {
               throw new AppError(403, 'Unauthorized', 'Not Acceptable');
            }
         } else if (position !== data.position) {
            throw new AppError(403, 'Unauthorized', 'Not Acceptable');
         }

         return next();
      });
   } catch (error) {
      next(error);
   }
};

module.exports = { validateUser, validation };
