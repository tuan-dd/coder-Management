const express = require('express');
const { login, updateInfo } = require('../controllers/auth.controller');
const { validation, validateUser } = require('../middlewares/validation');
const {
   loginSchema,
   updateInfoSchema,
} = require('../validations/authValidation');

const router = express.Router();

/*
@ login (cung cấp accessToken)
@ cập nhật info me ( chỉ cập nhật thông tin no position)
@ create
*/

// /login should be a POST request
router.post('/login', validation(loginSchema), login);

//
router.put('/me', validateUser(), validation(updateInfoSchema), updateInfo);
// router.put(
//    '/changePass',
//    validateUser,
//    validation(updateInfoSchema),
//    updateInfo,
// );
module.exports = router;
