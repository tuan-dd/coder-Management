const { State, Position } = require('../models/User');

const yup = require('yup');
const createUserSchema = yup.object().shape({
   _id: yup.string().max(0, 'not have id'),
   name: yup.string().min(1).max(20).required(),
   email: yup.string().email().required(),
   password: yup.string().min(6).max(15).required(),
   position: yup.string().oneOf(Position).notRequired(),
   levelOn: yup.string().email().required(),
});

const updateStatusSchema = yup
   .object()
   .shape({
      state: yup.string().oneOf(State).notRequired(),
      position: yup
         .string()
         .when('state', (state, field) =>
            state == 'resigned'
               ? field.max(0, 'The state already have the resign value')
               : field.oneOf(Position),
         )
         .notRequired(),
      emailLevelOn: yup
         .string()
         .email()
         .when(['position'], {
            is: (position) => position === 'Senior',
            then: (field) => field.max(0, 'Not input value'),
            otherwise: (field) => field.required(),
         }),
   })
   .noUnknown('Can not enter a disallowed value ');

const updateMyProgressSchema = yup
   .object()
   .shape({
      task: yup.string().required(),
      progress: yup.number().min(0).max(100).required('Input number'),
   })
   .noUnknown('Can not enter a disallowed value ');

const getUsersSchema = yup.object().shape({
   email: yup.string().email().notRequired(),
   name: yup.string().notRequired(),
   position: yup.string().oneOf(Position).notRequired(),
   state: yup.string().oneOf(State).notRequired(),
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
   createUserSchema,
   updateMyProgressSchema,
   updateStatusSchema,
   getUsersSchema,
};
