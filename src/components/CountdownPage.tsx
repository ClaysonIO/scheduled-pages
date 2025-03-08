import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { scheduler } from '../services/scheduler';
import { Schedule } from '../db';
import { formatDateTime, getTimeRemaining } from '../utils/cron';
import { usePopupPermission } from '../hooks/usePopupPermission';
import PopupPermissionDialog from './PopupPermissionDialog';

export default function CountdownPage() {
  const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [randomUrl, setRandomUrl] = useState<string>('');
  const { 
    popupPermissionDialogOpen, 
    setPopupPermissionDialogOpen, 
    popupPermissionStatus, 
    requestPopupPermission 
  } = usePopupPermission();
  
  // Listen for changes to the next schedule
  useEffect(() => {
    const handleNextScheduleChange = (schedule: Schedule | null) => {
      setNextSchedule(schedule);
      
      if (schedule && schedule.urls && schedule.urls.length > 0) {
        // Select a random URL from the schedule
        const randomIndex = Math.floor(Math.random() * schedule.urls.length);
        setRandomUrl(schedule.urls[randomIndex]);
      } else {
        setRandomUrl('');
      }
    };
    
    // Get the initial next schedule
    handleNextScheduleChange(scheduler.getNextSchedule());
    
    // Add listener for changes
    scheduler.addListener(handleNextScheduleChange);
    
    // Clean up listener
    return () => {
      scheduler.removeListener(handleNextScheduleChange);
    };
  }, []);
  
  // Update countdown timer
  useEffect(() => {
    if (!nextSchedule || !nextSchedule.nextRun) {
      setTimeRemaining({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      });
      return;
    }
    
    const updateTimer = () => {
      const remaining = getTimeRemaining(nextSchedule.nextRun!);
      setTimeRemaining(remaining);
    };
    
    // Update immediately
    updateTimer();
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    // Clean up timer
    return () => {
      clearInterval(timerId);
    };
  }, [nextSchedule]);
  
  return (
    <Box>
      <Button
        component={Link}
        to="/"
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Schedules
      </Button>
        
        {!nextSchedule ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">
              No scheduled pages found
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Create a schedule to see the countdown timer.
            </Typography>
            <Button
              component={Link}
              to="/new"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Create Schedule
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Next scheduled page: {nextSchedule.label}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Scheduled for: {formatDateTime(nextSchedule.nextRun!)}
            </Typography>
            
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={3}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h4">{timeRemaining.days}</Typography>
                    <Typography variant="body2">Days</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h4">{timeRemaining.hours}</Typography>
                    <Typography variant="body2">Hours</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h4">{timeRemaining.minutes}</Typography>
                    <Typography variant="body2">Minutes</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h4">{timeRemaining.seconds}</Typography>
                    <Typography variant="body2">Seconds</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              URL that will open:
            </Typography>
            <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  wordBreak: 'break-all',
                  fontFamily: 'monospace'
                }}
              >
                {randomUrl}
              </Typography>
            </Paper>
            
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Note: A random URL will be selected from the list when the schedule runs.
            </Typography>
          </Paper>
        )}
      
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
