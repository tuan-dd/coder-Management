const { Task } = require('../models/Task');

const taskService = {
   findTask: async function (filter) {
      const task = await Task.findOne(filter).exec();
      return task;
   },
   createTask: async function (task) {
      const newTask = await Task.create(task);
      return newTask;
   },

   appointedTask: async function (filter, email) {
      // const isAllow = await taskService.findStatusAllow(task);
      // status ('pending','working')

      // if (!isAllow) return false;

      const newUpdate = await Task.findOneAndUpdate(
         filter,
         { appointedUser: email, status: 'working' },
         {
            new: true,
         },
      ).exec();
      return newUpdate;
   },

   findAppointedUser: async function (option, id = 0) {
      const result = await Task.aggregate([
         { $match: option }, /// query
         { $group: { _id: '$status', data: { $addToSet: '$task' } } }, // select
         { $project: { _id: id, data: 1 } }, // show in result
      ]).exec();
      if (!result.length) {
         return false;
      }
      return result;
   },
   updateMyProgress: async function (task, progress) {
      // const isAllow = await this.findStatusAllow(task);

      // if (!isAllow) return false;

      const newUpdate = await Task.findOneAndUpdate(
         { task },
         { progress },
         { new: true },
      )
         .lean()
         .exec();

      return newUpdate;
   },

   findStatusAllow: async function (task) {
      const taskDb = await Task.findOne({ task }).select('status').exec();

      const isStatus = ['pending', 'working'];

      if (!isStatus.includes(taskDb.status)) {
         return false;
      }
      return true;
   },
   updateManyTask: async function (filter, newUpdate) {
      const result = await Task.updateMany(filter, newUpdate, { new: true });
      return result;
   },

   updateTask: async function (filter, newUpdate) {
      const result = await Task.findOneAndUpdate(filter, newUpdate, {
         new: true,
      });
      return result;
   },
   leaderGetTask: async (filter, page) => {
      const result = await Task.find(filter)
         .skip((page - 1) * 10)
         .limit(10)
         .exec();

      return result;
   },
   seniorGetTask: async (email, filter, page) => {
      const result = await Task.find({
         ...filter,
         appointedUser: { $in: email },
      })
         .skip((page - 1) * 10)
         .limit(10)
         .exec();
      return result;
   },
   juniorGetTask: async (email, filter, page = 1) => {
      const result = await Task.find({ ...filter, appointedUser: email })
         .skip((page - 1) * 10)
         .limit(10)
         .exec();
      return result;
   },
};

module.exports = taskService;
