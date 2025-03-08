import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import cronstrue from 'cronstrue';

interface CronExpressionPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CronExpressionPicker({ value, onChange, error }: CronExpressionPickerProps) {
  // Parse the initial cron expression
  const [minute, setMinute] = useState<string>('0');
  const [hour, setHour] = useState<string>('0');
  const [day, setDay] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');
  const [humanReadable, setHumanReadable] = useState<string>('');
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customExpression, setCustomExpression] = useState<string>(value);
  const [recurrenceType, setRecurrenceType] = useState<string>('daily');
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize the component with the provided cron expression
  useEffect(() => {
    if (!initialized) {
      try {
        const parts = value.trim().split(/\s+/);
        if (parts.length === 5) {
          setMinute(parts[0]);
          setHour(parts[1]);
          setDay(parts[2]);
          setMonth(parts[3]);
          setDayOfWeek(parts[4]);
          
          // Try to determine the recurrence type based on the cron expression
          if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
            setRecurrenceType('daily');
            setCustomMode(false);
          } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '1-5') {
            setRecurrenceType('weekdays');
            setCustomMode(false);
          } else if (parts[2] === '*' && parts[3] === '*' && parts[4] === '0,6') {
            setRecurrenceType('weekends');
            setCustomMode(false);
          } else if (parts[2] === '*' && parts[3] === '*' && (parts[4] === '0' || parts[4] === '1' || parts[4] === '2' || parts[4] === '3' || parts[4] === '4' || parts[4] === '5' || parts[4] === '6')) {
            setRecurrenceType('weekly');
            setCustomMode(false);
          } else if (parts[2] !== '*' && parts[3] === '*' && parts[4] === '*') {
            setRecurrenceType('monthly');
            setCustomMode(false);
          } else if (parts[2] !== '*' && parts[3] !== '*' && parts[4] === '*') {
            setRecurrenceType('yearly');
            setCustomMode(false);
          } else {
            setRecurrenceType('custom');
            setCustomMode(true);
            setCustomExpression(value);
          }
        } else {
          // Invalid cron expression format, default to custom
          setRecurrenceType('custom');
          setCustomMode(true);
          setCustomExpression(value);
        }
        
        // Update human-readable description
        updateHumanReadable(value);
      } catch (error) {
        // If there's any error, default to custom mode
        setRecurrenceType('custom');
        setCustomMode(true);
        setCustomExpression(value);
      }
      
      setInitialized(true);
    }
  }, [value, initialized]);

  // Update the human-readable description
  const updateHumanReadable = (cronExpression: string) => {
    try {
      if (cronExpression && cronExpression.trim()) {
        setHumanReadable(cronstrue.toString(cronExpression));
      } else {
        setHumanReadable('');
      }
    } catch (error) {
      setHumanReadable('Invalid cron expression');
    }
  };

  // Handle custom expression changes
  const handleCustomExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    setCustomExpression(newExpression);
    onChange(newExpression);
    updateHumanReadable(newExpression);
  };

  // Handle recurrence type changes
  const handleRecurrenceTypeChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value;
    setRecurrenceType(type);

    let newMinute = '0';
    let newHour = '0';
    let newDay = '*';
    let newMonth = '*';
    let newDayOfWeek = '*';

    switch (type) {
      case 'daily':
        // Keep defaults
        break;
      case 'weekdays':
        newDayOfWeek = '1-5';
        break;
      case 'weekends':
        newDayOfWeek = '0,6';
        break;
      case 'weekly':
        newDayOfWeek = '0';
        break;
      case 'monthly':
        newDay = '1';
        break;
      case 'yearly':
        newDay = '1';
        newMonth = '1';
        break;
      case 'custom':
        setCustomMode(true);
        setCustomExpression(value || '* * * * *');
        return;
    }

    setMinute(newMinute);
    setHour(newHour);
    setDay(newDay);
    setMonth(newMonth);
    setDayOfWeek(newDayOfWeek);
    setCustomMode(false);

    const newExpression = `${newMinute} ${newHour} ${newDay} ${newMonth} ${newDayOfWeek}`;
    onChange(newExpression);
    updateHumanReadable(newExpression);
  };

  // Handle field changes
  const handleFieldChange = (field: 'minute' | 'hour' | 'day' | 'month' | 'dayOfWeek', value: string) => {
    switch (field) {
      case 'minute':
        setMinute(value);
        break;
      case 'hour':
        setHour(value);
        break;
      case 'day':
        setDay(value);
        break;
      case 'month':
        setMonth(value);
        break;
      case 'dayOfWeek':
        setDayOfWeek(value);
        break;
    }

    // Update the cron expression
    const newExpression = field === 'minute' ? `${value} ${hour} ${day} ${month} ${dayOfWeek}` :
                          field === 'hour' ? `${minute} ${value} ${day} ${month} ${dayOfWeek}` :
                          field === 'day' ? `${minute} ${hour} ${value} ${month} ${dayOfWeek}` :
                          field === 'month' ? `${minute} ${hour} ${day} ${value} ${dayOfWeek}` :
                          `${minute} ${hour} ${day} ${month} ${value}`;
    
    onChange(newExpression);
    updateHumanReadable(newExpression);
  };

  // Generate options for hours and minutes
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  
  // Generate options for days of month
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Day of week options
  const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="recurrence-type-label">Recurrence Type</InputLabel>
        <Select
          labelId="recurrence-type-label"
          value={recurrenceType}
          label="Recurrence Type"
          onChange={handleRecurrenceTypeChange}
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekdays">Weekdays</MenuItem>
          <MenuItem value="weekends">Weekends</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>

      {customMode ? (
        <TextField
          label="Custom Cron Expression"
          fullWidth
          value={customExpression}
          onChange={handleCustomExpressionChange}
          error={!!error}
          helperText={error || 'Format: minute hour day month dayOfWeek (e.g., "30 12 * * 1-5" for weekdays at 12:30 PM)'}
          sx={{ mb: 2 }}
        />
      ) : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {recurrenceType !== 'daily' && recurrenceType !== 'weekdays' && recurrenceType !== 'weekends' && (
            <>
              {recurrenceType === 'weekly' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                    <Select
                      labelId="day-of-week-label"
                      value={dayOfWeek}
                      label="Day of Week"
                      onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
                    >
                      {dayOfWeekOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {recurrenceType === 'monthly' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="day-label">Day of Month</InputLabel>
                    <Select
                      labelId="day-label"
                      value={day}
                      label="Day of Month"
                      onChange={(e) => handleFieldChange('day', e.target.value)}
                    >
                      {dayOptions.map((d) => (
                        <MenuItem key={d} value={d.toString()}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {recurrenceType === 'yearly' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="month-label">Month</InputLabel>
                      <Select
                        labelId="month-label"
                        value={month}
                        label="Month"
                        onChange={(e) => handleFieldChange('month', e.target.value)}
                      >
                        {monthOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="day-label">Day of Month</InputLabel>
                      <Select
                        labelId="day-label"
                        value={day}
                        label="Day of Month"
                        onChange={(e) => handleFieldChange('day', e.target.value)}
                      >
                        {dayOptions.map((d) => (
                          <MenuItem key={d} value={d.toString()}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="hour-label">Hour</InputLabel>
              <Select
                labelId="hour-label"
                value={hour}
                label="Hour"
                onChange={(e) => handleFieldChange('hour', e.target.value)}
              >
                {hourOptions.map((h) => (
                  <MenuItem key={h} value={h.toString()}>
                    {h.toString().padStart(2, '0')}:00
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="minute-label">Minute</InputLabel>
              <Select
                labelId="minute-label"
                value={minute}
                label="Minute"
                onChange={(e) => handleFieldChange('minute', e.target.value)}
              >
                {minuteOptions.map((m) => (
                  <MenuItem key={m} value={m.toString()}>
                    {m.toString().padStart(2, '0')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Human-Readable Schedule:
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {humanReadable}
        </Typography>
        
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Cron Expression:
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            minute hour day month dayOfWeek
          </Typography>
        </Box>
      </Box>

      {error && (
        <FormHelperText error>{error}</FormHelperText>
      )}
    </Box>
  );
}
