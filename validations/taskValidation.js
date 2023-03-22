const yup = require('yup');
const { Status } = require('../models/Task.js');

const createTaskSchema = yup
   .object()
   .shape({
      _id: yup.string().min(0, 'not have id'),
      task: yup.string().required(),
      description: yup.string().required(),
      appointedUser: yup.string().email().required(),
   })
   .noUnknown('Can not enter a disallowed value ');

const updateStatusTaskSchema = yup.object().shape({
   status: yup.string().oneOf(Status).required(),
});

const appointTaskSchema = yup.object().shape({
   task: yup.string().required(),
});

const getTaskSchema = yup.object().shape({
   task: yup.string().notRequired(),
   status: yup.string().oneOf(Status).required(),
   appointedUser: yup.string().email().notRequired(),
   progress: yup.number().integer().max(100).notRequired(),
   createdAt_gte: yup.date().min('2023-03-14').notRequired(),
   createdAt_lte: yup.date().max(new Date()).notRequired(),
   createdAt: yup
      .date()
      .when(['createdAt_gte', 'createdAt_lte'], {
         is: (createdAt_gte, createdAt_lte) => createdAt_gte || createdAt_lte,
         then: (field) =>
            field.max(
               0,
               'Cant input the value because you had value createdAt_gte or createdAt_lte ',
            ),
      })
      .notRequired(),
   page: yup.number().integer().negative().min(1).notRequired(),
});

module.exports = {
   createTaskSchema,
   updateStatusTaskSchema,
   getTaskSchema,
   appointTaskSchema,
};
