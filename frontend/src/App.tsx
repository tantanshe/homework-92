import './App.css';
import AppToolbar from './UI/AppToolbar/AppToolbar';
import {useAppSelector} from './app/hooks';
import {selectUser} from './features/users/usersSlice';
import {Navigate, Route, Routes} from 'react-router-dom';
import Login from './features/users/Login';
import Register from './features/users/Register';
import Chat from './components/ Chat';
import {Container, Typography} from '@mui/material';

function App() {
  const user = useAppSelector(selectUser);

  return (
    <>
      <header>
        <AppToolbar/>
      </header>
      <Container maxWidth="lg" component="main">
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/chat" element={user ? <Chat/> : <Navigate to="/login"/>}/>
          <Route path="/" element={<Navigate to="/login"/>}/>
          <Route path="*" element={<Typography variant="h1">Not found</Typography>}/>
        </Routes>
      </Container>
    </>
  );
}

export default App;
