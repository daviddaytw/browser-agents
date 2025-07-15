'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  name: string;
  description: string;
  llmModel?: string;
  useAdblock: boolean;
  useProxy: boolean;
  proxyCountryCode: string;
  highlightElements: boolean;
  browserViewportWidth: number;
  browserViewportHeight: number;
  maxAgentSteps: number;
  enablePublicShare: boolean;
}

export default function ExecuteTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    secrets: {} as Record<string, string>,
    includedFileNames: [] as string[],
    saveBrowserData: false,
  });
  const [secretsText, setSecretsText] = useState('');

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      } else {
        setError('Task not found');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const handleExecute = async () => {
    if (!task) return;

    setExecuting(true);
    setError(null);

    try {
      // Parse secrets from JSON text
      let secrets = {};
      if (secretsText.trim()) {
        try {
          secrets = JSON.parse(secretsText);
        } catch (e) {
          setError('Invalid JSON format for secrets');
          setExecuting(false);
          return;
        }
      }

      const response = await fetch(`/api/tasks/${params.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secrets,
          includedFileNames: formData.includedFileNames,
          saveBrowserData: formData.saveBrowserData,
        }),
      });

      if (response.ok) {
        const execution = await response.json();
        // Redirect to execution details page
        router.push(`/executions/${execution.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to execute task');
      }
    } catch (error) {
      console.error('Error executing task:', error);
      setError('Failed to execute task');
    } finally {
      setExecuting(false);
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

  if (error && !task) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!task) {
    return (
      <PageContainer>
        <Alert severity="error">Task not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/tasks')}
          sx={{ mb: 2 }}
        >
          Back to Tasks
        </Button>
        <Typography variant="h4" gutterBottom>
          Execute Task: {task.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {task.description}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Task Configuration
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                LLM Model
              </Typography>
              <Typography variant="body1">
                {task.llmModel || 'Default'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Viewport Size
              </Typography>
              <Typography variant="body1">
                {task.browserViewportWidth} × {task.browserViewportHeight}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Max Steps
              </Typography>
              <Typography variant="body1">
                {task.maxAgentSteps}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Proxy Country
              </Typography>
              <Typography variant="body1">
                {task.proxyCountryCode}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {task.useAdblock && (
              <Typography variant="body2" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                Adblock Enabled
              </Typography>
            )}
            {task.useProxy && (
              <Typography variant="body2" sx={{ px: 1, py: 0.5, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 1 }}>
                Proxy Enabled
              </Typography>
            )}
            {task.highlightElements && (
              <Typography variant="body2" sx={{ px: 1, py: 0.5, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
                Element Highlighting
              </Typography>
            )}
            {task.enablePublicShare && (
              <Typography variant="body2" sx={{ px: 1, py: 0.5, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                Public Share Enabled
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Execution Parameters
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Secrets (JSON format)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Provide any secrets or credentials needed for the task in JSON format.
              Example: {`{"username": "user@example.com", "password": "secret"}`}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={secretsText}
              onChange={(e) => setSecretsText(e.target.value)}
              placeholder={`{"username": "user@example.com", "password": "secret"}`}
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.saveBrowserData}
                  onChange={(e) => setFormData({ ...formData, saveBrowserData: e.target.checked })}
                />
              }
              label="Save Browser Data (cookies, session)"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/tasks')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={executing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              onClick={handleExecute}
              disabled={executing}
            >
              {executing ? 'Starting Execution...' : 'Execute Task'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
