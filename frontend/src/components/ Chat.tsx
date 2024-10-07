import React, {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';
import {selectUser} from '../features/users/usersSlice';

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
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
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
    <div>
      <div>
        <h3>Online users</h3>
        <ul>
          {participants.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Chat</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.username}:</strong> {msg.message}
            </li>
          ))}
        </ul>
      </div>
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chat;
