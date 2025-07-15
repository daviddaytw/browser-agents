'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TaskExecution {
  execution: {
    id: string;
    taskId: string;
    status: 'created' | 'running' | 'finished' | 'stopped' | 'paused';
    output?: string;
    liveUrl?: string;
    createdAt: string;
    finishedAt?: string;
  };
  task: {
    id: string;
    name: string;
    description: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'created':
      return 'default';
    case 'running':
      return 'primary';
    case 'finished':
      return 'success';
    case 'stopped':
      return 'error';
    case 'paused':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return <CircularProgress size={16} />;
    case 'finished':
      return <span>✓</span>;
    case 'stopped':
      return <span>✕</span>;
    case 'paused':
      return <span>⏸</span>;
    default:
      return <span>○</span>;
  }
};

export default function ExecutionsPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/executions');
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    
    // Set up polling for live updates
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleControlExecution = async (executionId: string, action: 'stop' | 'pause' | 'resume') => {
    try {
      const response = await fetch(`/api/executions/${executionId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchExecutions(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action}ping execution:`, error);
    }
  };

  const handleDeleteExecution = async (executionId: string) => {
    if (!confirm('Are you sure you want to delete this execution?')) return;

    try {
      const response = await fetch(`/api/executions/${executionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExecutions();
      }
    } catch (error) {
      console.error('Error deleting execution:', error);
    }
  };

  const handleSyncExecution = async (executionId: string) => {
    try {
      await fetch(`/api/executions/${executionId}/sync`, {
        method: 'POST',
      });
      fetchExecutions(); // Refresh after sync
    } catch (error) {
      console.error('Error syncing execution:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => router.push('/tasks')}
        >
          Create New Task
        </Button>
      </Box>

      {executions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No executions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Execute a task to see its progress and results here
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/tasks')}
            >
              Go to Tasks
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Output</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map(({ execution, task }) => {
                const duration = execution.finishedAt
                  ? Math.round((new Date(execution.finishedAt).getTime() - new Date(execution.createdAt).getTime()) / 1000)
                  : Math.round((Date.now() - new Date(execution.createdAt).getTime()) / 1000);

                return (
                  <TableRow key={execution.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {task?.name || 'Unknown Task'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {task?.description || 'No description'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(execution.status)}
                        label={execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                        color={getStatusColor(execution.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(execution.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {execution.output ? execution.output.substring(0, 50) + '...' : 'No output yet'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/executions/${execution.id}`)}
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        {execution.status === 'running' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleControlExecution(execution.id, 'pause')}
                              title="Pause"
                            >
                              <PauseIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleControlExecution(execution.id, 'stop')}
                              title="Stop"
                            >
                              <StopIcon />
                            </IconButton>
                          </>
                        )}
                        
                        {execution.status === 'paused' && (
                          <IconButton
                            size="small"
                            onClick={() => handleControlExecution(execution.id, 'resume')}
                            title="Resume"
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        )}
                        
                        {['finished', 'stopped'].includes(execution.status) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteExecution(execution.id)}
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        
                        <Button
                          size="small"
                          onClick={() => handleSyncExecution(execution.id)}
                          title="Sync with browser-pod"
                        >
                          Sync
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
}
