import * as express from 'express';
import User from '../models/User';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import {randomUUID} from 'crypto';

const usersRouter = express.Router();

usersRouter.post('/', async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      token: randomUUID(),
    });

    await user.save();
    res.send(user);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

usersRouter.post('/sessions', async (req, res, next) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (!user) {
      return res.status(400).send({error: 'Username not found'});
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).send({error: 'Password is wrong'});
    }

    user.token = randomUUID();
    await user.save();

    return res.send(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.delete('/sessions', async (req, res, next) => {
  try {
    const headerValue = req.get('Authorization');

    if (!headerValue) return res.status(204).send();

    const [_bearer, token] = headerValue.split(' ');

    if (!token) return res.status(204).send();

    const user = await User.findOne({token});

    if (!user) return res.status(204).send();

    user.token = randomUUID();
    await user.save();

    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
});

export default usersRouter;
