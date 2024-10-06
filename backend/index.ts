import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';
import usersRouter from './routers/users';

export interface IncomingMessage {
  type: string;
  payload: string;
}

const app = express();

expressWs(app);
const port = 8000;
app.use(cors());
app.use('/users', usersRouter);


const router = express.Router();

const connectedClients: WebSocket[] = [];

router.ws('/chat', (ws, req) => {
  connectedClients.push(ws);
  console.log('client connected, total clients: ', connectedClients.length);
  let username = 'Anonymous';
  ws.on('message', (message: string) => {
    try {
      const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;
      if (decodedMessage.type === 'SET_USERNAME') {
        username = decodedMessage.payload;
      } else if (decodedMessage.type === 'SET_MESSAGE') {
        connectedClients.forEach((client) => {
          client.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            payload: {
              username,
              text: decodedMessage.payload,
            }
          }));
        });
      }
    } catch (error) {
      ws.send(JSON.stringify({error: 'Invalid message'}));
    }
  });

  ws.on('close', () => {
    console.log('client disconnected!');
    const index = connectedClients.indexOf(ws);
    connectedClients.splice(index, 1);
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});