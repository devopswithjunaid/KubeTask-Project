import { useState, useEffect } from 'react';
import {
  IconButton,
  Typography,
  CircularProgress,
  Box,
  Checkbox,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Tooltip,
  Alert,
  Fade,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Schedule as ScheduleIcon,
  Done as DoneIcon,
  DeleteSweep as DeleteSweepIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getTasks, deleteTask, updateTask } from '../services/taskService';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TaskListProps {
  refreshTrigger?: number;
}

export function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getTasks();
      setTasks(data);
      setSelectedTasks(new Set()); // Clear selection when refreshing
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelection = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.size === 0) return;
    
    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedTasks).map(taskId => deleteTask(taskId))
      );
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting tasks:', err);
      setError('Failed to delete some tasks');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsCompleted = async (taskId: number) => {
    try {
      await updateTask(taskId, { status: 'completed' });
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleMarkAsPending = async (taskId: number) => {
    try {
      await updateTask(taskId, { status: 'pending' });
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'in_progress':
        return <RadioButtonUncheckedIcon color="info" />;
      default:
        return <RadioButtonUncheckedIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading tasks...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6">Error</Typography>
        {error}
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={fetchTasks} 
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No tasks found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Create your first task to get started!
        </Typography>
      </Paper>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');

  return (
    <Box>
      {/* Task Statistics */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Task Overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${tasks.length}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Pending: ${pendingTasks.length}`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                label={`Completed: ${completedTasks.length}`} 
                color="success" 
                variant="outlined" 
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchTasks}
                variant="outlined"
                size="small"
              >
                Refresh
              </Button>
              <Button
                startIcon={<Checkbox checked={selectedTasks.size === tasks.length} />}
                onClick={handleSelectAll}
                variant="outlined"
                size="small"
              >
                {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedTasks.size > 0 && (
                <Button
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleDeleteSelected}
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={actionLoading}
                >
                  Delete Selected ({selectedTasks.size})
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Task List */}
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Fade in={true} timeout={300}>
              <Card 
                elevation={selectedTasks.has(task.id) ? 4 : 1}
                sx={{ 
                  border: selectedTasks.has(task.id) ? '2px solid #1976d2' : 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 3,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleTaskSelection(task.id)}
                      color="primary"
                    />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getStatusIcon(task.status)}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            opacity: task.status === 'completed' ? 0.7 : 1
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip 
                          label={task.status} 
                          color={getStatusColor(task.status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      {task.description && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ mb: 2 }}
                        >
                          {task.description}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="textSecondary">
                        Created: {formatDate(task.created_at)}
                        {task.updated_at !== task.created_at && (
                          <> • Updated: {formatDate(task.updated_at)}</>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {task.status !== 'completed' ? (
                      <Tooltip title="Mark as completed">
                        <IconButton
                          color="success"
                          onClick={() => handleMarkAsCompleted(task.id)}
                          size="small"
                        >
                          <DoneIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Mark as pending">
                        <IconButton
                          color="warning"
                          onClick={() => handleMarkAsPending(task.id)}
                          size="small"
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  
                  <Tooltip title="Delete task">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSelected()}
                      size="small"
                      disabled={!selectedTasks.has(task.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
