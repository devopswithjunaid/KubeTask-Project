import { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface ConnectionStatus {
  backend: 'success' | 'error' | 'testing' | 'idle';
  database: 'success' | 'error' | 'testing' | 'idle';
  api: 'success' | 'error' | 'testing' | 'idle';
}

interface TestResult {
  status: string;
  message: string;
  details?: any;
  responseTime?: number;
}

export function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backend: 'idle',
    database: 'idle',
    api: 'idle'
  });
  const [testResults, setTestResults] = useState<{
    backend?: TestResult;
    database?: TestResult;
    api?: TestResult;
  }>({});
  const [expanded, setExpanded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const testBackendConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, backend: 'testing' }));
    const startTime = Date.now();
    
    try {
      console.log('Testing backend connection to:', API_URL);
      
      const response = await axios.get(`${API_URL}/health`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log('Backend connection test response:', response.data);
      
      setConnectionStatus(prev => ({ ...prev, backend: 'success' }));
      setTestResults(prev => ({
        ...prev,
        backend: {
          status: 'success',
          message: `Backend is healthy! Status: ${response.data.status}`,
          details: response.data,
          responseTime
        }
      }));
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('Backend connection test failed:', error);
      
      let message = 'Backend connection failed';
      if (error.code === 'ERR_NAME_NOT_RESOLVED') {
        message = 'Cannot resolve hostname. Check if backend is running.';
      } else if (error.code === 'ECONNREFUSED') {
        message = 'Connection refused. Backend server is not running.';
      } else if (error.code === 'TIMEOUT_ERROR') {
        message = 'Connection timeout. Backend is not responding.';
      } else {
        message = error.message || 'Unknown error occurred';
      }
      
      setConnectionStatus(prev => ({ ...prev, backend: 'error' }));
      setTestResults(prev => ({
        ...prev,
        backend: {
          status: 'error',
          message,
          details: error.response?.data || error.message,
          responseTime
        }
      }));
    }
  };

  const testDatabaseConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, database: 'testing' }));
    const startTime = Date.now();
    
    try {
      console.log('Testing database connection...');
      
      // Test database by trying to fetch tasks
      const response = await axios.get(`${API_URL}/api/v1/tasks`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log('Database connection test response:', response.data);
      
      setConnectionStatus(prev => ({ ...prev, database: 'success' }));
      setTestResults(prev => ({
        ...prev,
        database: {
          status: 'success',
          message: `Database is connected! Found ${response.data.length} tasks`,
          details: {
            taskCount: response.data.length,
            sampleData: response.data.slice(0, 2) // Show first 2 tasks as sample
          },
          responseTime
        }
      }));
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('Database connection test failed:', error);
      
      let message = 'Database connection failed';
      if (error.response?.status === 500) {
        message = 'Database server error. Check database configuration.';
      } else if (error.response?.status === 404) {
        message = 'API endpoint not found. Check backend configuration.';
      } else {
        message = error.message || 'Unknown database error occurred';
      }
      
      setConnectionStatus(prev => ({ ...prev, database: 'error' }));
      setTestResults(prev => ({
        ...prev,
        database: {
          status: 'error',
          message,
          details: error.response?.data || error.message,
          responseTime
        }
      }));
    }
  };

  const testApiEndpoints = async () => {
    setConnectionStatus(prev => ({ ...prev, api: 'testing' }));
    const startTime = Date.now();
    
    try {
      console.log('Testing API endpoints...');
      
      // Test multiple endpoints
      const endpoints = [
        { name: 'Health Check', url: `${API_URL}/health` },
        { name: 'API Test', url: `${API_URL}/api/v1/test` },
        { name: 'Tasks List', url: `${API_URL}/api/v1/tasks` }
      ];
      
      const results = await Promise.allSettled(
        endpoints.map(endpoint => 
          axios.get(endpoint.url, { timeout: 5000 })
            .then(response => ({ ...endpoint, status: 'success', data: response.data }))
            .catch(error => ({ ...endpoint, status: 'error', error: error.message }))
        )
      );
      
      const responseTime = Date.now() - startTime;
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 'success'
      ).length;
      
      console.log('API endpoints test results:', results);
      
      if (successCount === endpoints.length) {
        setConnectionStatus(prev => ({ ...prev, api: 'success' }));
        setTestResults(prev => ({
          ...prev,
          api: {
            status: 'success',
            message: `All ${endpoints.length} API endpoints are working!`,
            details: results.map(result => 
              result.status === 'fulfilled' ? result.value : null
            ).filter(Boolean),
            responseTime
          }
        }));
      } else {
        setConnectionStatus(prev => ({ ...prev, api: 'error' }));
        setTestResults(prev => ({
          ...prev,
          api: {
            status: 'error',
            message: `${successCount}/${endpoints.length} API endpoints working`,
            details: results.map(result => 
              result.status === 'fulfilled' ? result.value : { error: result.reason }
            ),
            responseTime
          }
        }));
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('API endpoints test failed:', error);
      
      setConnectionStatus(prev => ({ ...prev, api: 'error' }));
      setTestResults(prev => ({
        ...prev,
        api: {
          status: 'error',
          message: 'API endpoints test failed',
          details: error.message,
          responseTime
        }
      }));
    }
  };

  const runAllTests = async () => {
    await testBackendConnection();
    await testDatabaseConnection();
    await testApiEndpoints();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'testing':
        return <CircularProgress size={20} />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'testing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 3 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Typography variant="h6">
              System Connection Test
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto', mr: 2 }}>
              <Chip 
                icon={getStatusIcon(connectionStatus.backend)}
                label="Backend" 
                color={getStatusColor(connectionStatus.backend) as any}
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={getStatusIcon(connectionStatus.database)}
                label="Database" 
                color={getStatusColor(connectionStatus.database) as any}
                size="small"
                variant="outlined"
              />
              <Chip 
                icon={getStatusIcon(connectionStatus.api)}
                label="API" 
                color={getStatusColor(connectionStatus.api) as any}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Test the connection between frontend, backend, database, and API endpoints.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<RefreshIcon />}
                  onClick={runAllTests}
                  disabled={Object.values(connectionStatus).some(status => status === 'testing')}
                >
                  Test All Connections
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ApiIcon />}
                  onClick={testBackendConnection}
                  disabled={connectionStatus.backend === 'testing'}
                >
                  Test Backend
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<StorageIcon />}
                  onClick={testDatabaseConnection}
                  disabled={connectionStatus.database === 'testing'}
                >
                  Test Database
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SpeedIcon />}
                  onClick={testApiEndpoints}
                  disabled={connectionStatus.api === 'testing'}
                >
                  Test API Endpoints
                </Button>
              </Box>
            </Grid>

            {/* Test Results */}
            {Object.entries(testResults).map(([key, result]) => (
              <Grid item xs={12} key={key}>
                <Alert 
                  severity={result.status === 'success' ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1)} Test Result
                  </Typography>
                  <Typography variant="body2">
                    {result.message}
                    {result.responseTime && (
                      <Chip 
                        label={`${result.responseTime}ms`} 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  {result.details && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.1)', 
                        p: 1, 
                        borderRadius: 1,
                        display: 'block',
                        fontSize: '0.75rem',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(result.details, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>API URL:</strong> {API_URL}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>Environment:</strong> {import.meta.env.NODE_ENV || 'development'}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>Note:</strong> Browser uses localhost, containers use service names
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
