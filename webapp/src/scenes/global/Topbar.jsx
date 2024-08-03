import { Box, IconButton, useTheme } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ColorModeContext } from '../../theme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const { isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();

  useEffect(() => {

    if (isAuthenticated) {

      const getUserMetaData = async() => {

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `${process.env.REACT_APP_AUTH0_AUDIENCE}`,
            scope: "read: current_user"
          }
        })

        console.log(accessToken);

      }

      getUserMetaData();

    }

  }, [isAuthenticated])

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? (
            <DarkModeOutlinedIcon fontSize="large" />
          ) : (
            <LightModeOutlinedIcon fontSize="large" />
          )}
        </IconButton>
        <IconButton onClick={isAuthenticated ? () => logout({ returnTo: window.location.origin }) : loginWithRedirect}>
      {isAuthenticated ? <LogoutIcon fontSize="large" /> : <LoginIcon fontSize="large" />}
    </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
