import {createTheme} from '@mui/material';
import {indigo} from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: '#6573c3',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          margin: '10px 0',
        },
      },
    },
  }
});

export default theme;