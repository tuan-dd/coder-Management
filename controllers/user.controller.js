const { sendResponse, AppError } = require('../helpers/utils');
const bcrypt = require('bcrypt');
const { Position, Users } = require('../models/User');
const userService = require('../services/user.service');
const taskService = require('../services/task.service');

const userController = {
   createUser: async function (req, res, next) {
      const body = req.body;
      let newUser = {
         name: body.name,
         email: body.email,
         password: body.password,
         position: body.position,
      };
      const levelOn = body.levelOn;
      try {
         const getPosition = Position.find((i) => i === newUser.position);

         if (getPosition === 'Leader')
            throw new AppError(403, 'Unauthorized', 'Not Acceptable');

         const getUserDB = await userService.findByEmail(newUser.email);

         if (getUserDB?.email) {
            throw new AppError(
               409,
               'There was a duplicate user',
               'Not Acceptable',
            );
         }
         const result = await userService.createUser(
            newUser,
            levelOn,
            getPosition,
         );

         if (!result) {
            throw new AppError(404, 'not Found', 'Senior not exist');
         }

         sendResponse({
            res,
            data: { oke: 'oke' },
            message: 'create user successful',
         });
      } catch (error) {
         next(error);
      }
   },
   updateUser: async function (req, res, next) {
      const filter = {
         emailLevelOn: req.body.emailLevelOn,
         state: req.body.state,
         position: req.body.position,
      };
      const userId = req.params.userId;
      try {
         const userDB = await userService.findOption({
            _id: userId,
            state: 'working',
         });

         if (!userDB) throw new AppError(404, 'Not Found', 'user not exist');

         if (userDB.position === filter.position) return oke();

         if (!filter.state) {
            if (userDB.position === 'Junior') {
               await userService.updateUser({
                  newUpdate: { position: filter.position },
                  id: userId,
               });

               await userService.updateUser({
                  // thăng chức cần remove sự quản lý của senior củ
                  option: {
                     inferior: {
                        $in: [userId],
                     },
                  },
                  newUpdate: { $pull: { inferior: userId } },
               });

               await userService.updateUser({
                  option: { email: 'leader@leader.com' },
                  newUpdate: { $push: { inferior: userId } },
               }); // cập nhật senior cho leader

               return oke();
            }

            if (userDB.position === 'Senior') {
               userDB.inferior.push(userId);

               const result = await userService.updateUser({
                  option: {
                     email: filter.emailLevelOn,
                     state: 'working',
                     position: 'Senior',
                  },
                  newUpdate: {
                     $addToSet: { inferior: { $each: userDB.inferior } },
                  },
               });
               if (!result) {
                  throw new AppError(404, 'LevelOn not exist', 'Not Found');
               } // cập nhật k dc vì không phi senior hoặc hết làm việc

               await userService.updateUser({
                  id: userId,
                  newUpdate: {
                     position: filter.position,
                     $set: { inferior: [] },
                  },
               }); // cập nhật lại cho inferior === [] junior k có cấp dưới

               // update inferior thêm người bị hạ cấp vô

               await userService.updateUser({
                  option: { email: 'leader@leader.com', inferior: userId },
                  newUpdate: { $addToSet: { 'inferior.$': result._id } },
               }); // cập nhật lại cấp dưới Leader

               await taskService.updateManyTask(
                  {
                     appointedUser: userDB.email,
                     status: { $in: ['pending', 'working'] },
                  },
                  { $set: { appointedUser: filter.emailLevelOn } },
               ); // chuyển giao task  senior hạ cấp cho cấp dưới

               return oke(result);
            }
         }

         if (filter.state === 'resigned') {
            userController.updateState({
               res,
               filter,
               userId,
               userDB,
            });
         }

         function oke(value = 'oke') {
            return sendResponse({
               res,
               data: value,
               message: 'Update State User successful',
            });
         }
      } catch (error) {
         next(error);
      }
   },

   updateState: async function ({ res, userId, userDB, filter }) {
      if (userDB.position === 'Junior') {
         const senior = await userService.updateUser({
            option: {
               inferior: {
                  $in: [userId],
               },
            },
            newUpdate: { $pull: { inferior: userId } },
         }); // xong xóa cấp dưới vì nghỉ việc

         await taskService.appointedTask(
            {
               appointedUser: userDB.email,
               status: 'working',
            },
            senior.email,
         );
         // tìm công việc user nghỉ việc đang làm bổ nhiệm senior

         // if (task) {
         //    await taskService.appointedTask(task[0].data[0], senior.email);
         //    // nếu có bổ nhiệm lại cho senior
         // }
         const result = await userService.updateUser({
            email: userDB.email,
            newUpdate: { state: 'resigned' },
         }); // cập nhật nghỉ việc

         oke(result);
      }
      if (userDB.position === 'Senior') {
         // const { inferior } = await userService.findById(
         //    userId,
         //    'inferior -_id',
         // );
         // kiếm cấp dưới Senior nghỉ việc
         // bổ nhiệm cho Senior khác
         // const tasks = await taskService.findAppointedUser({
         //    appointedUser: filter.emailLevelOn,
         // });

         // const checkSenior = await userService.findByEmail(
         //    filter.emailLevelOn,
         //    '_id position',
         // ); // kiểm tra level on Senior

         // if (checkSenior?.position !== 'Senior' || !checkSenior) {
         //    throw new AppError(404, 'LevelOn not exist', 'Not Found');
         // }

         const SeniorDb = await userService.updateUser({
            option: {
               email: filter.emailLevelOn,
               position: 'Senior',
               state: 'working',
            },
            newUpdate: {
               $addToSet: { inferior: { $each: userDB.inferior } },
            },
         }); // bổ nhiệm cho senior mới

         if (SeniorDb.position) {
            throw new AppError(404, 'LevelOn not exist', 'Not Found');
         }

         await taskService.updateManyTask(
            {
               appointedUser: filter.emailLevelOn,
               status: { $in: ['pending', 'working'] },
            },
            { $set: { appointedUser: filter.emailLevelOn } },
         ); // thu hồi task của senior bổ nhiệm lại cho senior mới

         await userService.updateUser({
            option: { email: 'leader@leader.com' },
            newUpdate: { $pull: { inferior: userId } },
         }); // cập nhật lại cấp dưới Leader

         const result = await userService.updateUser({
            id: userId,
            newUpdate: { state: 'resigned' },
         });
         oke(result);
      }

      function oke(value) {
         return sendResponse({
            res,
            data: value,
            message: 'Update State User successful',
         });
      }
   },

   updateMyProgress: async function (req, res, next) {
      const userJunior = req.user;
      const newUpdate = req.body;
      // junior mới cập nhật đc
      let isNotExist = false;
      try {
         const isUserWorking = await taskService.findAppointedUser({
            appointedUser: userJunior.email,
            status: 'working',
         }); // kiểm tra user đang làm việc k, nếu k là k được cập nhật

         if (
            !isUserWorking.length ||
            isUserWorking[0].data[0] !== newUpdate.task
         ) {
            isNotExist = true;
         }

         if (isNotExist) {
            throw new AppError(
               409,
               'bad request',
               'Task was completed or not exist ',
            );
         }

         const result = await taskService.updateMyProgress(
            newUpdate.task,
            newUpdate.progress,
         );

         sendResponse({
            res,
            data: result,
            message: 'Update Progress successful',
         });
      } catch (error) {
         next(error);
      }
   },
   getUsers: async function (req, res, next) {
      const user = req.user;
      const filter = {
         email: req.body.email,
         name: req.body.name,
         position: req.body.position,
         state: req.body.state,
         createdAt_gte: req.body.createdAt_gte,
         createdAt_lte: req.body.createdAt_lte,
         createdAt: req.body.createdAt || null,
      };
      const page = req.body.page;
      try {
         const isCreatedAt = ['createdAt_gte', 'createdAt_lte', 'createdAt'];
         const convertDate = (key) => {
            key === '$gte'
               ? (filter.createdAt = {
                    ...filter.createdAt,
                    [key]: filter.createdAt_gte,
                 })
               : (filter.createdAt = key === '$lte' && {
                    ...filter.createdAt,
                    [key]: filter.createdAt_lte,
                 });
         };

         Object.keys(filter).forEach((key) => {
            if (!filter[key]) delete filter[key];
            if (isCreatedAt.includes(key) && filter[key]) {
               key === 'createdAt_gte' || key === 'createdAt'
                  ? convertDate('$gte')
                  : convertDate('$lte');
               delete filter[key];
            }
         });
         let result;
         if (user.position === 'Leader') {
            result = await userService.leaderGetUser({ filter, page });
         }

         if (user.position === 'Senior') {
            delete filter.page;
            result = await userService.seniorGetUser(
               user.email,
               'inferior email',
               filter,
            );
         }

         sendResponse({
            res,
            data: result,
            message: 'get user successful',
         });
      } catch (error) {
         next(error);
      }
   },
   getUserId: async function (req, res, next) {
      const user = req.user;
      const userId = req.params.userId;
      try {
         let result;
         if (user.position === 'Senior') {
            result = await userService.seniorGetUser(user.email, 'inferior');

            result = result.inferior.find((i) => i._id.equals(userId));
            // object id nên cần xài equals mới compare dc
         } else {
            // leader thể xem cả người nghỉ việc
            result = await userService.findById(userId, '-password');
         }

         sendResponse({
            res,
            data: result,
            message: 'get user successful',
         });
      } catch (error) {
         next(error);
      }
   },
};

module.exports = userController;
