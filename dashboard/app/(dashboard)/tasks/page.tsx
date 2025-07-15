'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useState, useEffect } from 'react';

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
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  llmModel: string;
  useAdblock: boolean;
  useProxy: boolean;
  proxyCountryCode: string;
  highlightElements: boolean;
  browserViewportWidth: number;
  browserViewportHeight: number;
  maxAgentSteps: number;
  enablePublicShare: boolean;
}

const TaskDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  setFormData 
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Task Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          required
        />
        <TextField
          label="Task Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
          required
        />
        <FormControl fullWidth>
          <InputLabel>LLM Model</InputLabel>
          <Select
            value={formData.llmModel}
            onChange={(e) => setFormData({ ...formData, llmModel: e.target.value })}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="gpt-4o">GPT-4o</MenuItem>
            <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
            <MenuItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</MenuItem>
            <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Viewport Width"
            type="number"
            value={formData.browserViewportWidth}
            onChange={(e) => setFormData({ ...formData, browserViewportWidth: parseInt(e.target.value) })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Viewport Height"
            type="number"
            value={formData.browserViewportHeight}
            onChange={(e) => setFormData({ ...formData, browserViewportHeight: parseInt(e.target.value) })}
            sx={{ flex: 1 }}
          />
        </Box>
        <TextField
          label="Max Agent Steps"
          type="number"
          value={formData.maxAgentSteps}
          onChange={(e) => setFormData({ ...formData, maxAgentSteps: parseInt(e.target.value) })}
        />
        <FormControl fullWidth>
          <InputLabel>Proxy Country</InputLabel>
          <Select
            value={formData.proxyCountryCode}
            onChange={(e) => setFormData({ ...formData, proxyCountryCode: e.target.value })}
          >
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="GB">United Kingdom</MenuItem>
            <MenuItem value="DE">Germany</MenuItem>
            <MenuItem value="FR">France</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.useAdblock}
                onChange={(e) => setFormData({ ...formData, useAdblock: e.target.checked })}
              />
            }
            label="Use Adblock"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.useProxy}
                onChange={(e) => setFormData({ ...formData, useProxy: e.target.checked })}
              />
            }
            label="Use Proxy"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.highlightElements}
                onChange={(e) => setFormData({ ...formData, highlightElements: e.target.checked })}
              />
            }
            label="Highlight Elements"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.enablePublicShare}
                onChange={(e) => setFormData({ ...formData, enablePublicShare: e.target.checked })}
              />
            }
            label="Enable Public Share"
          />
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained">
        {title.includes('Create') ? 'Create' : 'Update'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    llmModel: '',
    useAdblock: true,
    useProxy: true,
    proxyCountryCode: 'US',
    highlightElements: true,
    browserViewportWidth: 1280,
    browserViewportHeight: 960,
    maxAgentSteps: 75,
    enablePublicShare: false,
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          llmModel: '',
          useAdblock: true,
          useProxy: true,
          proxyCountryCode: 'US',
          highlightElements: true,
          browserViewportWidth: 1280,
          browserViewportHeight: 960,
          maxAgentSteps: 75,
          enablePublicShare: false,
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description,
      llmModel: task.llmModel || '',
      useAdblock: task.useAdblock,
      useProxy: task.useProxy,
      proxyCountryCode: task.proxyCountryCode,
      highlightElements: task.highlightElements,
      browserViewportWidth: task.browserViewportWidth,
      browserViewportHeight: task.browserViewportHeight,
      maxAgentSteps: task.maxAgentSteps,
      enablePublicShare: task.enablePublicShare,
    });
    setEditDialogOpen(true);
  };


  if (loading) {
    return (
      <PageContainer>
        <Typography>Loading tasks...</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Task
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: 3 
      }}>
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {task.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {task.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {task.llmModel && (
                  <Chip label={task.llmModel} size="small" />
                )}
                <Chip 
                  label={`${task.browserViewportWidth}x${task.browserViewportHeight}`} 
                  size="small" 
                />
                <Chip 
                  label={`Max ${task.maxAgentSteps} steps`} 
                  size="small" 
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<PlayArrowIcon />}
                href={`/tasks/${task.id}/execute`}
              >
                Execute
              </Button>
              <IconButton size="small" onClick={() => openEditDialog(task)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No task templates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first task template to get started with browser automation
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Task
          </Button>
        </Box>
      )}

      <TaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        title="Create New Task"
        formData={formData}
        setFormData={setFormData}
      />

      <TaskDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditTask}
        title="Edit Task"
        formData={formData}
        setFormData={setFormData}
      />
    </PageContainer>
  );
}
