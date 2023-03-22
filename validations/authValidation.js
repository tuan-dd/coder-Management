const yup = require('yup');

const loginSchema = yup.object().shape({
   email: yup.string().email().required(),
   password: yup.string().min(6).max(15).required(),
});

const updateInfoSchema = yup.object().shape({
   name: yup.string().min(1).notRequired(),
   email: yup.string().max(0, 'Not Chance Email'),
   password: yup.string().default('').notRequired(),
   newPassword: yup.string().when('password', (password, field) =>
      password[0]
         ? field
              .notOneOf(
                 [yup.ref('password'), null],
                 'New Password must not same old password ',
              )
              .min(6)
              .max(12)
              .required()
         : field.max(0, 'Not input value because you don`t have old password'),
   ),
});

module.exports = { updateInfoSchema, loginSchema };
