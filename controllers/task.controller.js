const { sendResponse, AppError } = require('../helpers/utils');
const { Task, Status } = require('../models/Task');
// const { Status } = require('../models/Task');
const taskService = require('../services/task.service');
const userService = require('../services/user.service');

const taskController = {
   createTask: async function (req, res, next) {
      const body = req.body;
      const newTask = {
         task: body.task,
         description: body.description,
         appointedUser: body.appointedUser,
      };
      try {
         const taskDb = taskService.findTask({ task: newTask.task });

         if (taskDb.task)
            throw new AppError(
               409,
               'Duplicate resource',
               ' Task already exists',
            );

         const getUserDb = await userService.findOption({
            email: newTask.appointedUser,
            position: 'Senior',
            state: 'working',
         }); // Leader bổ nhiệm cho Senior

         if (!getUserDb)
            throw new AppError(
               409,
               'Not found',
               'Not found user or only appointee Senior ',
            );

         const result = await taskService.createTask(newTask);

         sendResponse({ res, data: result, message: 'create task successful' });
      } catch (error) {
         next(error);
      }
   },

   appointTask: async function (req, res, next) {
      const task = req.body.task;
      const seniorUser = req.user;
      const userID = req.params.userId;
      try {
         const inferior = await userService.seniorGetUser(
            seniorUser.email,
            'inferior',
            { _id: userID },
         ); // tìm kiếm user  có phải inferior của k

         if (!inferior.inferior.length) {
            throw new AppError(
               409,
               'Unauthorized',
               'You can not appoint their ',
            );
         } // kiểm tra user có phải cấp dưới k
         if (!Object.keys(inferior).length) {
            throw new AppError(404, 'not found', ' not found Senior');
         } // kiểm tra Senior

         const userJuniorEmail = inferior.inferior[0].email;
         const isUserWorking = await taskService.findAppointedUser(
            {
               appointedUser: userJuniorEmail,
               status: 'working',
            },
            0,
         );

         if (isUserWorking) {
            throw new AppError(
               409,
               'Unauthorized',
               'You can not appoint user who is working ',
            );
         }
         const newUpdate = await taskService.appointedTask(
            { task },
            userJuniorEmail,
         );

         sendResponse({
            res,
            data: newUpdate,
            message: 'create task successful',
         });
      } catch (error) {
         next(error);
      }
   },

   updateStatusTask: async function (req, res, next) {
      const statusReq = req.body.status;
      const user = req.user;
      const taskId = req.params.taskId;
      const statusOfSenior = ['working', 'review', 'pending'];
      const disallowedChange = ['archive', 'done'];
      const allowChange = Status.filter((i) => !disallowedChange.includes(i));
      try {
         if (
            user.position === 'Senior' &&
            !statusOfSenior.includes(statusReq)
         ) {
            throw new AppError(
               409,
               'Unauthorized',
               'You only can update limit status  ',
            );
         }

         const taskDB = await taskService.findTask({ _id: taskId });

         if (!taskDB) throw new AppError(404, 'Not found', 'Not found task');

         if (taskDB.status === statusReq) return oke();
         // khi status giống nhau khỏi phải vô db lấy dữ liệu tìm kiếm

         if (user.position === 'Senior') {
            const isInferior = await userService.seniorGetUser(
               user.email,
               'inferior , -_id',
               { email: taskDB.appointedUser },
            );

            if (!isInferior.inferior.length) {
               throw new AppError(
                  409,
                  'Unauthorized',
                  'You can not appoint user who is not your inferior',
               );
            }
         }

         if (
            disallowedChange.includes(taskDB.status) &&
            allowChange.includes(statusReq)
         )
            throw new AppError(
               409,
               'Unauthorized',
               'You can not change task when it "done" or "archive"',
            );

         if (taskDB.status === 'archive' && statusReq === 'done')
            throw new AppError(
               409,
               'Unauthorized',
               'You can not change task when it "archive" to "done"',
            );

         const progressEqualZero = ['working', 'pending'];

         if (progressEqualZero.includes(statusReq)) {
            const result = await taskService.updateTask(
               { _id: taskId },
               { status: statusReq, progress: 0 },
            );

            return oke(result);
         } else {
            const result = await taskService.updateTask(
               { _id: taskId },
               { status: statusReq, progress: 100 },
            );
            return oke(result);
         }

         function oke(value = 'oke') {
            return sendResponse({
               res,
               data: value,
               message: 'Update Status successful',
            });
         }
      } catch (error) {
         next(error);
      }
   },
   getTasks: async function (req, res, next) {
      const user = req.user;
      const filter = {
         task: req.body.task,
         status: req.body.status,
         appointedUser: req.body.appointedUser,
         progress: req.body.progress,
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
         }; // chuyển các thông số createdAt_lte để mongo db hiểu

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
            result = await taskService.leaderGetTask(filter);
         }

         if (user.position === 'Senior') {
            let inferior = await userService.seniorGetUser(
               user.email,
               'inferior -_id',
            );
            inferior = inferior.inferior.map((i) => i.email);

            inferior.push(user.email);

            result = await taskService.seniorGetTask(inferior, filter, page);
         }

         if (user.position === 'Junior') {
            console.log(user.email);
            result = await taskService.juniorGetTask(user.email, filter, page);
         }

         sendResponse({ res, data: result, message: 'get task successful' });
      } catch (error) {
         next(error);
      }
   },
};

module.exports = taskController;
