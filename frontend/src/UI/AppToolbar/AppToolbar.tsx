import {AppBar, Button, Grid, styled, Toolbar, Typography} from '@mui/material';
import {Link, NavLink} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {selectUser} from '../../features/users/usersSlice';
import {logout} from '../../features/users/usersThunks';

const StyledLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    color: 'inherit',
  }
});

const AppToolbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AppBar position="sticky" sx={{mb: 2, pt: 1, pb: 1}}>
      <Toolbar>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
              <StyledLink to="/">Chat</StyledLink>
            </Typography>
          </Grid>
          {user ? (
            <Grid item>
              <Typography>
              Welcome, {user.username}!
              </Typography>
              <Button onClick={handleLogout} sx={{
                backgroundColor: '#ffffff',
                border: '2px solid #3f51b5',
                borderRadius: '10px',
                padding: '8px',
                margin: '5px 0',
                '&:hover': {
                  backgroundColor: '#a7b2df',
                },
              }}>
                Logout
              </Button>
            </Grid>
            ) : (
            <Grid item>
              <Button component={NavLink} to="/register" color="inherit">
                Sign up
              </Button>
              <Button component={NavLink} to="/login" color="inherit">
                Sign in
              </Button>
            </Grid>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;