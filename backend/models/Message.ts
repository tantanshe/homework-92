import mongoose, {Schema} from 'mongoose';
import {IMessage} from '../types';

const MessageSchema = new Schema<IMessage>({
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;
