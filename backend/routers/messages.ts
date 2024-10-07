import * as express from 'express';
import Message from '../models/Message';

const messagesRouter = express.Router();

messagesRouter.get('/', async (_req, res, next) => {
  try {
    const messages = await Message.find().sort({createdAt: -1});
    res.send(messages);
  } catch (e) {
    return next(e);
  }
});

export default messagesRouter;