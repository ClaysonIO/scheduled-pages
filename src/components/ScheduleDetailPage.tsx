import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { Schedule, db, saveSchedule, deleteSchedule } from '../db';
import { getNextRunTime, validateCronExpression } from '../utils/cron';
import { usePopupPermission } from '../hooks/usePopupPermission';
import PopupPermissionDialog from './PopupPermissionDialog';
import CronExpressionPicker from './CronExpressionPicker';

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [schedule, setSchedule] = useState<Schedule>({
    label: '',
    cronExpression: '* * * * *',
    urls: ['']
  });
  
  const [newUrl, setNewUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { 
    popupPermissionDialogOpen, 
    setPopupPermissionDialogOpen, 
    popupPermissionStatus, 
    requestPopupPermission 
  } = usePopupPermission();

  // Load schedule data if editing an existing schedule
  useEffect(() => {
    if (!isNew) {
      const loadSchedule = async () => {
        try {
          const loadedSchedule = await db.schedules.get(Number(id));
          if (loadedSchedule) {
            setSchedule(loadedSchedule);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading schedule:', error);
          navigate('/');
        }
      };
      
      loadSchedule();
    }
  }, [id, isNew, navigate]);
  
  // Handle form field changes
  const handleChange = (field: keyof Schedule) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSchedule({
      ...schedule,
      [field]: event.target.value
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };
  
  // Handle URL changes
  const handleUrlChange = (index: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newUrls = [...schedule.urls];
    newUrls[index] = event.target.value;
    
    setSchedule({
      ...schedule,
      urls: newUrls
    });
  };
  
  // Add a new URL
  const handleAddUrl = () => {
    if (!newUrl) return;
    
    setSchedule({
      ...schedule,
      urls: [...schedule.urls, newUrl]
    });
    
    setNewUrl('');
  };
  
  // Remove a URL
  const handleRemoveUrl = (index: number) => {
    const newUrls = [...schedule.urls];
    newUrls.splice(index, 1);
    
    setSchedule({
      ...schedule,
      urls: newUrls.length > 0 ? newUrls : ['']
    });
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!schedule.label.trim()) {
      newErrors.label = 'Label is required';
    }
    
    if (!schedule.cronExpression.trim()) {
      newErrors.cronExpression = 'Cron expression is required';
    } else if (!validateCronExpression(schedule.cronExpression)) {
      newErrors.cronExpression = 'Invalid cron expression';
    }
    
    if (schedule.urls.length === 0 || (schedule.urls.length === 1 && !schedule.urls[0])) {
      newErrors.urls = 'At least one URL is required';
    } else {
      const invalidUrls = schedule.urls.filter(url => !url.trim());
      if (invalidUrls.length > 0) {
        newErrors.urls = 'All URLs must be valid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save the schedule
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      // Calculate next run time
      const nextRun = getNextRunTime(schedule.cronExpression);
      
      // Save the schedule
      const updatedSchedule = {
        ...schedule,
        nextRun
      };
      
      await saveSchedule(updatedSchedule);
      navigate('/');
    } catch (error) {
      console.error('Error saving schedule:', error);
      setErrors({
        ...errors,
        general: 'Error saving schedule'
      });
    }
  };
  
  // Delete the schedule
  const handleDelete = async () => {
    if (isNew) {
      navigate('/');
      return;
    }
    
    try {
      await deleteSchedule(Number(id));
      navigate('/');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setErrors({
        ...errors,
        general: 'Error deleting schedule'
      });
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {isNew ? 'Create New Schedule' : 'Edit Schedule'}
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Schedules
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Label"
                fullWidth
                value={schedule.label}
                onChange={handleChange('label')}
                error={!!errors.label}
                helperText={errors.label}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule
              </Typography>
              <CronExpressionPicker
                value={schedule.cronExpression}
                onChange={(value) => {
                  setSchedule({
                    ...schedule,
                    cronExpression: value
                  });
                  
                  // Clear error for this field
                  if (errors.cronExpression) {
                    setErrors({
                      ...errors,
                      cronExpression: ''
                    });
                  }
                }}
                error={errors.cronExpression}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                URLs
              </Typography>
              
              {errors.urls && (
                <Typography color="error" variant="body2">
                  {errors.urls}
                </Typography>
              )}
              
              <List>
                {schedule.urls.map((url, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveUrl(index)}
                        disabled={schedule.urls.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <TextField
                      fullWidth
                      label={`URL ${index + 1}`}
                      value={url}
                      onChange={handleUrlChange(index)}
                    />
                  </ListItem>
                ))}
                
                <ListItem>
                  <TextField
                    fullWidth
                    label="New URL"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  <IconButton
                    edge="end"
                    aria-label="add"
                    onClick={handleAddUrl}
                    disabled={!newUrl}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItem>
              </List>
            </Grid>
            
            {errors.general && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">
                  {errors.general}
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Save
                </Button>
                
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  
                  {!isNew && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this schedule? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Popup permission dialog */}
      <PopupPermissionDialog
        open={popupPermissionDialogOpen}
        onClose={() => setPopupPermissionDialogOpen(false)}
        onTest={requestPopupPermission}
        permissionStatus={popupPermissionStatus}
      />
    </Box>
  );
}
