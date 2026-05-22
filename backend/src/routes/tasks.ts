import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getTasks, getTask, createTask, updateTask, deleteTask, addComment, addAttachment, getAttachment, getTaskStats } from '../controllers/tasksController';

const router = Router();
router.use(authMiddleware);

router.get('/stats',                      getTaskStats);
router.get('/',                           getTasks);
router.get('/:id',                        getTask);
router.post('/',                          createTask);
router.patch('/:id',                      updateTask);
router.delete('/:id',                     deleteTask);
router.post('/:id/comments',              addComment);
router.post('/:id/attachments',           addAttachment);
router.get('/:id/attachments/:attachId',  getAttachment);

export default router;
