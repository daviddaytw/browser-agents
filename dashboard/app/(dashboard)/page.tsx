'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Task as TaskIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalTasks: number;
  totalExecutions: number;
  runningExecutions: number;
  recentTasks: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
  }>;
  recentExecutions: Array<{
    execution: {
      id: string;
      status: string;
      createdAt: string;
      output?: string;
    };
    task: {
      name: string;
    };
  }>;
}

const HomePage = React.memo(function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [tasksResponse, executionsResponse] = await Promise.all([
        fetch('/api/tasks?limit=5'),
        fetch('/api/executions?limit=5'),
      ]);

      if (tasksResponse.ok && executionsResponse.ok) {
        const tasksData = await tasksResponse.json();
        const executionsData = await executionsResponse.json();

        setStats({
          totalTasks: tasksData.total,
          totalExecutions: executionsData.total,
          runningExecutions: executionsData.executions.filter(
            (e: any) => e.execution.status === 'running'
          ).length,
          recentTasks: tasksData.tasks,
          recentExecutions: executionsData.executions,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
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
  }, []);

  const handleCreateTask = useCallback(() => {
    router.push('/tasks');
  }, [router]);

  const handleManageTasks = useCallback(() => {
    router.push('/tasks');
  }, [router]);

  const handleViewExecutions = useCallback(() => {
    router.push('/executions');
  }, [router]);

  const handleTaskClick = useCallback((taskId: string) => {
    router.push(`/tasks/${taskId}/execute`);
  }, [router]);

  const handleExecutionClick = useCallback((executionId: string) => {
    router.push(`/executions/${executionId}`);
  }, [router]);

  // Memoize style objects to prevent re-renders
  const statsGridStyle = useMemo(() => ({ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: 3,
    mb: 4 
  }), []);

  const mainGridStyle = useMemo(() => ({ 
    display: 'grid', 
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
    gap: 3 
  }), []);

  const taskItemStyle = useMemo(() => ({
    p: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    cursor: 'pointer',
    '&:hover': { bgcolor: 'action.hover' },
  }), []);

  const quickActionsStyle = useMemo(() => ({ 
    mt: 4, 
    textAlign: 'center' 
  }), []);

  const buttonsContainerStyle = useMemo(() => ({ 
    display: 'flex', 
    gap: 2, 
    justifyContent: 'center', 
    flexWrap: 'wrap' 
  }), []);

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
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your browser automation tasks and monitor executions
      </Typography>

      {/* Stats Cards */}
      <Box sx={statsGridStyle}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TaskIcon color="primary" />
              <Box>
                <Typography variant="h4">{stats?.totalTasks || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Task Templates
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PlayArrowIcon color="secondary" />
              <Box>
                <Typography variant="h4">{stats?.totalExecutions || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Executions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Box>
                <Typography variant="h4">{stats?.runningExecutions || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Running Now
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={mainGridStyle}>
        {/* Recent Tasks */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Task Templates</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
              >
                Create Task
              </Button>
            </Box>
            
            {stats?.recentTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No tasks created yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats?.recentTasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={taskItemStyle}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {task.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {task.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Executions</Typography>
              <Button
                size="small"
                onClick={handleViewExecutions}
              >
                View All
              </Button>
            </Box>
            
            {stats?.recentExecutions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No executions yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats?.recentExecutions.map(({ execution, task }) => (
                  <Box
                    key={execution.id}
                    sx={taskItemStyle}
                    onClick={() => handleExecutionClick(execution.id)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {task.name}
                      </Typography>
                      <Chip
                        label={execution.status}
                        color={getStatusColor(execution.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {execution.output ? execution.output.substring(0, 60) + '...' : 'No output yet'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Started {new Date(execution.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={quickActionsStyle}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={buttonsContainerStyle}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
          >
            Create New Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<TaskIcon />}
            onClick={handleManageTasks}
          >
            Manage Tasks
          </Button>
          <Button
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={handleViewExecutions}
          >
            View Executions
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
});

export default HomePage;
