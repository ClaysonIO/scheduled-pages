import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface PopupPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onTest: () => void;
  permissionStatus: 'default' | 'granted' | 'denied';
}

export default function PopupPermissionDialog({
  open,
  onClose,
  onTest,
  permissionStatus
}: PopupPermissionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Allow Popups</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This application needs permission to open popups in order to display scheduled pages.
          Please allow popups for this site in your browser settings.
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          After allowing popups, click the button below to test if popups are now enabled.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Dismiss</Button>
        <Button 
          onClick={() => {
            onTest();
            if (permissionStatus === 'granted') {
              onClose();
            }
          }} 
          color="primary" 
          variant="contained"
        >
          Test Popups
        </Button>
      </DialogActions>
    </Dialog>
  );
}
