const mongoose = require('mongoose');

const Status = ['pending', 'working', 'review', 'done', 'archive'];

const taskSchema = new mongoose.Schema(
   {
      task: { type: String, unique: true, required: true },
      description: { type: String, required: true },
      status: {
         type: String,
         enum: Status,
         default: 'pending',
         required: true,
      },
      progress: { type: Number, min: 0, max: 100, default: 0, required: true },
      appointedUser: {
         type: mongoose.SchemaTypes.String,
         ref: 'User',
         required: true,
      },
      // createdBy: { type: mongoose.SchemaTypes.String, ref: 'User' },
   },
   {
      timestamps: true,
   },
);

taskSchema.post('save', (error, res, next) => {
   if (error.name === 'MongoServerError' && error.code === 11000) {
      const error = new Error('There was a duplicate task');
      error.statusCode = 409;
      next(error);
   } else {
      next();
   }
});
const Task = mongoose.model('Task', taskSchema);

module.exports = { Task, Status };
