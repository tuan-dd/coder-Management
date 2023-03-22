const express = require('express');
const {
   createUser,
   updateMyProgress,
   getUsers,
   getUserId,
   updateUser,
} = require('../controllers/user.controller');
const { validation, validateUser } = require('../middlewares/validation');
const {
   createUserSchema,
   updateStatusSchema,
   getUsersSchema,
   updateMyProgressSchema,
} = require('../validations/userValidation');
const router = express.Router();

/*
@ post tạo user (măc định ví trị nhân viên, công việc là gì) // leader mới tạo được để phân công cho senior
@ get tìm kiếm user (hiện ra nhiệm vụ đang làm (status : hoàn thành bao nhiêu) , nhiệm vụ hoàn thành, điểm tín nhiệm, nhiệm vụ làm lại)
@ put cập nhật vi trị ( thăng chức, rớt chức, sa thải,), nếu sa thải phải xóa bên task user đang nhận cv nầy, chỉ leader mới làm được )
@ cập nhật tình trạng công việc của bạn thân ( chỉ thay đổi progress và khi status task working)
*/
// cap nhập senior se quan ly ai ( chi quan ly junior) chi header lam dc

router.post(
   '/',
   validateUser('Leader'),
   validation(createUserSchema),
   createUser,
);

router.put(
   '/:userId',
   validateUser('Leader'),
   validation(updateStatusSchema),
   updateUser,
);

router.put(
   '/progress/me',
   validateUser('Junior'),
   validation(updateMyProgressSchema),
   updateMyProgress,
);

router.get('/', validateUser('both'), validation(getUsersSchema), getUsers);

router.get(
   '/:userId',
   validateUser('both'),
   validation(getUsersSchema),
   getUserId,
);

module.exports = router;
