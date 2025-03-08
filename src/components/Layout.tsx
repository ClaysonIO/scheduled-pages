import { ReactNode, useState, useContext } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  GitHub as GitHubIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Home as HomeIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { ThemeModeContext } from '../context/ThemeContext';

// Import logo directly
import logoSvg from '../assets/logo.svg';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { toggleThemeMode, mode } = useContext(ThemeModeContext);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Schedules', path: '/', icon: <HomeIcon fontSize="small" /> },
    { name: 'Countdown', path: '/countdown', icon: <TimerIcon fontSize="small" /> },
  ];

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Box 
          component="img"
          src={logoSvg}
          alt="Scheduled Pages Logo"
          sx={{ 
            height: 32, 
            width: 32, 
            mr: 1.5 
          }}
        />
        <Typography variant="h6" component="div">
          Scheduled Pages
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={2}
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, #1a237e, #283593)' 
            : 'linear-gradient(to right, #3f51b5, #5c6bc0)'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box 
            component="img"
            src={logoSvg}
            alt="Scheduled Pages Logo"
            sx={{ 
              height: 40, 
              width: 40, 
              mr: 2 
            }}
          />
          
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Scheduled Pages
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 400,
                    borderBottom: isActive(item.path) ? '2px solid white' : 'none',
                    borderRadius: 0,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', ml: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle theme"
              onClick={toggleThemeMode}
              sx={{ mr: 1 }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="github repository"
              component="a"
              href="https://github.com/claysonio/scheduled-pages"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Scheduled Pages
        </Typography>
      </Box>
    </Box>
  );
}
