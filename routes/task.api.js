const express = require('express');
const {
   createTask,
   appointTask,
   updateStatusTask,
   getTasks,
} = require('../controllers/task.controller');
const { validateUser, validation } = require('../middlewares/validation');
const {
   createTaskSchema,
   updateStatusTaskSchema,
   getTaskSchema,
   appointTaskSchema,
} = require('../validations/taskValidation');
const router = express.Router();

/*
@ post tạo nhiệm vụ ( có thể bổ nhiệm thẳng lun leader mới dc tạo )
@ put bổ nhiệm ( chỉ senior mới được thay đổi ai làm)
@ get tìm kiếm nhiệm vụ (nếu nhiệm vụ của ai nó sẽ đưa ra thêm user)
@ put cập nhật tình trạng nhiệm vụ (pending,working,review,done,archive) leader mới làm dc
*/

router.post(
   '/',
   validateUser('Leader'),
   validation(createTaskSchema),
   createTask,
);
router.put(
   '/:userId',
   validateUser('Senior'),
   validation(appointTaskSchema),
   appointTask,
);
router.put(
   '/status/:taskId',
   validateUser('both'), // senior && leader
   validation(updateStatusTaskSchema),
   updateStatusTask,
);
router.get('/', validateUser(), validation(getTaskSchema), getTasks);

module.exports = router;
