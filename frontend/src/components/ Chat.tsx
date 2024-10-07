import React, {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';
import {selectUser} from '../features/users/usersSlice';
import {Box, Button, Grid, List, ListItem, Paper, TextField, Typography} from '@mui/material';

type Message = {
  username: string;
  message: string;
};

type User = {
  id: string;
  username: string;
  token: string;
};

interface IncomingMessage {
  username: string;
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = user.token;

    ws.current = new WebSocket('ws://localhost:8000/chat');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.current?.send(JSON.stringify({type: 'LOGIN', payload: token}));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'MESSAGE') {
        const newMessage = {
          username: data.payload.username,
          message: data.payload.text,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else if (data.type === 'USER_JOIN') {
        setParticipants((prevParticipants) => [...prevParticipants, data.payload]);
      } else if (data.type === 'USER_LEAVE') {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((user) => user.id !== data.payload.id)
        );
      } else if (data.type === 'INITIAL_MESSAGES') {
        const formattedMessages = (data.payload as IncomingMessage[]).map((msg) => ({
          username: msg.username,
          message: msg.text,
        }));
        setMessages(formattedMessages);
      } else if (data.type === 'USER_LIST') {
        setParticipants(data.payload);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => {
        ws.current = new WebSocket('ws://localhost:8000/chat');
      }, 3000);
    };

    return () => {
      ws.current?.close();
    };
  }, [navigate, user]);

  const handleSendMessage = () => {
    if (message.trim()) {
      ws.current?.send(JSON.stringify({type: 'MESSAGE', payload: message}));
      setMessage('');
    }
  };

  return (
    <Box sx={{flexGrow: 1, p: 2, display: 'flex'}}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper sx={{padding: 2, height: '70%', overflow: 'auto'}}>
            <Typography variant="h6">Online Users</Typography>
            <List>
              {participants.map((user) => (
                <ListItem key={user.id}>{user.username}</ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper sx={{padding: 2, height: '70%', display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h6">Chat</Typography>
            <Box sx={{flexGrow: 1, overflow: 'auto'}}>
              <List>
                {messages.map((msg, index) => (
                  <ListItem key={index}>
                    <strong>{msg.username}:</strong> {msg.message}
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{display: 'flex', marginTop: 2}}>
              <TextField
                variant="outlined"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
              />
              <Button onClick={handleSendMessage} variant="contained" sx={{marginLeft: 1}}>
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};


export default Chat;
