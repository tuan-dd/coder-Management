const { sendResponse, AppError } = require('../helpers/utils');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');

const authController = {
   login: async function (req, res, next) {
      const body = req.body;
      const user = { email: body.email, password: body.password };
      try {
         const getUserDb = await userService.findOption({
            email: user.email,
            state: 'working',
         });

         if (!getUserDb) {
            throw new AppError(404, 'user not exist', 'Not Found');
         }

         const validPassword = await authService.validatePassword(
            getUserDb.password,
            user.password,
         );

         if (!validPassword) {
            throw new AppError(401, 'Password not match', 'Unauthorized');
         }

         const accessToken = await authService.generateToken(getUserDb);
         console.log('RUN');
         sendResponse({
            res,
            data: { result: 'oke', accessToken },
            message: 'login  successful',
         });
      } catch (error) {
         next(error);
      }
   },

   updateInfo: async function (req, res, next) {
      const user = req.user;
      const body = req.body;
      const newUpdate = {
         name: body.name,
         password: body.password,
         newPassword: body.newPassword,
      };

      try {
         const getUserDb = await userService.findOption({
            email: user.email,
            state: 'working',
         });

         if (!getUserDb) {
            throw new AppError(404, 'user not exist', 'Not Found');
         }

         if (newUpdate.newPassword) {
            const validPassword = await authService.validatePassword(
               getUserDb.password,
               newUpdate.password,
            ); // check kiểm tra password củ trùng với password

            if (!validPassword) {
               throw new AppError(401, 'Password not match', 'Unauthorized');
            }
            newUpdate.password = await authService.generatePassword(
               newUpdate.newPassword,
            );
         }

         const result = await userService.updateUser({
            newUpdate,
            email: user.email,
         });

         sendResponse({
            res,
            data: result,
            message: 'login  successful',
         });
      } catch (error) {
         next(error);
      }
   },
};

module.exports = authController;
