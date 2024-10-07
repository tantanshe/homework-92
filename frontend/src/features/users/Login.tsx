import React, {useState} from 'react';
import {Alert, Avatar, Box, Button, CircularProgress, Grid, Link, TextField, Typography} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {LoginMutation} from '../../types';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {selectLoginError, selectLoginLoading} from './usersSlice';
import {login} from './usersThunks';

const Login = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoginLoading)
  const error = useAppSelector(selectLoginError);
  const navigate = useNavigate();

  const [state, setState] = useState<LoginMutation>({
    username: '',
    password: '',
  });

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitFormHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(login(state)).unwrap();
      navigate('/chat');
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) return <CircularProgress/>;

  return (
    <Box sx={{
      mt: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Avatar sx={{
        m: 1,
        bgcolor: 'secondary.main',
      }}>
        <LockOpenIcon/>
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      {error && (
        <Alert severity="error" sx={{mt: 3}}>
          {error.error}
        </Alert>
      )}
      <Box component="form" onSubmit={submitFormHandler} sx={{mt: 3}}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <TextField
              required
              label="Username"
              name="username"
              autoComplete="current-username"
              value={state.username}
              onChange={inputChangeHandler}
            />
          </Grid>
          <Grid item>
            <TextField
              required
              type="password"
              label="Password"
              name="password"
              autoComplete="current-password"
              value={state.password}
              onChange={inputChangeHandler}
            />
          </Grid>
        </Grid>
        <Button type="submit" color="primary" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
          Sign in
        </Button>
        <Link component={RouterLink} to="/register" variant="body2">
          Or sign up
        </Link>
      </Box>
    </Box>
  );
};

export default Login;