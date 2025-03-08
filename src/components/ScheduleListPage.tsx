import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Timer as TimerIcon } from '@mui/icons-material';
import { Schedule } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { formatDateTime } from '../utils/cron';
import cronstrue from 'cronstrue';
import { usePopupPermission } from '../hooks/usePopupPermission';
import PopupPermissionDialog from './PopupPermissionDialog';

export default function ScheduleListPage() {
  const schedules = useLiveQuery(() => db.schedules.toArray());
  const { 
    popupPermissionDialogOpen, 
    setPopupPermissionDialogOpen, 
    popupPermissionStatus, 
    requestPopupPermission 
  } = usePopupPermission();
  
  if (!schedules) {
    return <div>Loading...</div>;
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          component={Link} 
          to="/new" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          sx={{ px: 3 }}
        >
          Add New Schedule
        </Button>
        
        <Button 
          component={Link} 
          to="/countdown" 
          variant="outlined"
          startIcon={<TimerIcon />}
        >
          View Countdown
        </Button>
      </Box>
        
      {schedules.length === 0 ? (
        <Typography variant="body1">
          No schedules found. Create a new schedule to get started.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>URLs</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.label}</TableCell>
                  <TableCell>
                    <Tooltip title={schedule.cronExpression} placement="top">
                      <span>
                        {(() => {
                          try {
                            return cronstrue.toString(schedule.cronExpression);
                          } catch (error) {
                            return schedule.cronExpression;
                          }
                        })()}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{schedule.urls.length} URLs</TableCell>
                  <TableCell>
                    {schedule.nextRun 
                      ? formatDateTime(schedule.nextRun) 
                      : 'Not scheduled'}
                  </TableCell>
                  <TableCell>
                    {schedule.lastRun 
                      ? formatDateTime(schedule.lastRun) 
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/edit/${schedule.id}`} 
                      size="small"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
