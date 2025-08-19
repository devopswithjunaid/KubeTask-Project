import { useState } from 'react';
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Fab,
  useScrollTrigger,
  Slide,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ConnectionTest } from './components/ConnectionTest';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Scroll to top component
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Slide appear={false} direction="up" in={trigger}>
      <Fab
        onClick={handleClick}
        color="primary"
        size="small"
        aria-label="scroll back to top"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Slide>
  );
}

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <AssignmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            KubeTask
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Task Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        pt: 3,
        pb: 8 
      }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 3, 
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to KubeTask
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Manage your tasks efficiently with this Kubernetes-powered application
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              Create, organize, and track your tasks with a modern, responsive interface
            </Typography>
          </Paper>
          
          {/* Connection Test Component */}
          <ConnectionTest />
          
          {/* Task Form */}
          <TaskForm onTaskCreated={handleTaskCreated} />
          
          {/* Task List */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon color="primary" />
              Your Tasks
            </Typography>
            <TaskList refreshTrigger={refreshTrigger} />
          </Box>
          
          {/* Footer */}
          <Paper 
            elevation={1} 
            sx={{ 
              mt: 6, 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'background.paper'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              KubeTask v1.0.0 - Built with React, Material-UI, FastAPI, and PostgreSQL
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
              Deployed with Docker and Kubernetes for scalability and reliability
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <ScrollTop />
    </ThemeProvider>
  );
}

export default App;
