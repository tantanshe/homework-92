import mongoose, {HydratedDocument} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {UserFields} from '../types';

const Schema = mongoose.Schema;

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema<UserFields>({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function (value: string): Promise<boolean> {
        if (!(this as HydratedDocument<UserFields>).isModified('username')) {
          return true;
        }
        const user = await User.findOne({username: value});
        return !user;
      },
      message: 'This user is already registered',
    }
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: false,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);
export default User;
