import express from 'express';
import expressWs from 'express-ws';
import cors, {CorsOptions} from 'cors';
import {WebSocket} from 'ws';
import usersRouter from './routers/users';
import Message from './models/Message';
import messagesRouter from './routers/messages';
import User from './models/User';
import mongoose from 'mongoose';
import {randomUUID} from 'crypto';

export interface IncomingMessage {
  type: string;
  payload: string;
}

const app = express();

expressWs(app);
const port = 8000;

const whitelist = ['http://localhost:8000', 'http://localhost:5173'];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

const connectedClients: { ws: WebSocket; username: string; id: string; }[] = [];

const router = express.Router();

const usersList = () => {
  const userList = connectedClients.map((client) => ({
    id: client.id,
    username: client.username,
  }));

  connectedClients.forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: 'USER_LIST',
        payload: userList,
      })
    );
  });
};

router.ws('/chat', (ws, req) => {
  let authenticatedUser: string | null;

  ws.on('message', async (message: string) => {
    try {
      const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

      if (decodedMessage.type === 'LOGIN') {
        console.log('Received LOGIN request with token:', decodedMessage.payload);

        const user = await User.findOne({token: decodedMessage.payload});
        if (!user) {
          console.log('User not found for token:', decodedMessage.payload);
          ws.send(JSON.stringify({error: 'Invalid token'}));
          ws.close();
          return;
        }

        authenticatedUser = user.username;

        connectedClients.push({ws, username: authenticatedUser, id: randomUUID()});
        console.log('Client connected: ', authenticatedUser);
        usersList();

        const lastMessages = await Message.find().sort({createdAt: 1}).limit(30);
        ws.send(
          JSON.stringify({type: 'INITIAL_MESSAGES', payload: lastMessages})
        );

      } else if (decodedMessage.type === 'USER_LEAVE' && authenticatedUser) {
        const index = connectedClients.findIndex(client => client.username === authenticatedUser);
        if (index !== -1) {
          connectedClients.splice(index, 1);
          usersList();
        }
      } else if (decodedMessage.type === 'MESSAGE' && authenticatedUser) {
        const newMessage = new Message({
          username: authenticatedUser,
          text: decodedMessage.payload,
        });
        await newMessage.save();

        connectedClients.forEach((client) => {
          client.ws.send(
            JSON.stringify({
              type: 'MESSAGE',
              payload: {
                username: authenticatedUser,
                text: decodedMessage.payload,
              },
            })
          );
        });
      }
    } catch (error) {
      ws.send(JSON.stringify({error: 'Invalid message format'}));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected!');

    const index = connectedClients.findIndex((client) => client.ws === ws);
    if (index !== -1) {
      const disconnectedUser = connectedClients[index];
      connectedClients.splice(index, 1);
      connectedClients.forEach((client) => {
        client.ws.send(
          JSON.stringify({
            type: 'USER_LEAVE',
            payload: {id: disconnectedUser.id},
          })
        );
      });
    }

    usersList();
  });
});

const run = async () => {
  await mongoose.connect('mongodb://localhost/chat');

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

run().catch(console.error);

app.use(router);

app.listen(8000, () => {
  console.log('WebSocket server is listening on ws://localhost:8000/chat');
});