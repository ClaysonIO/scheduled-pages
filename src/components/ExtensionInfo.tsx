import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, Link } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';

/**
 * Component that displays information about the Chrome extension
 * and provides a way to install it
 */
const ExtensionInfo: React.FC = () => {
  const [extensionInstalled, setExtensionInstalled] = useState<boolean>(false);
  
  // Check if the extension is installed
  useEffect(() => {
    // Set up a message listener to detect the extension
    const messageListener = (event: MessageEvent) => {
      // Only accept messages from the same origin
      if (event.origin !== window.location.origin) {
        return;
      }
      
      const message = event.data;
      
      // Check if the message is from our extension
      if (message && message.source === 'scheduled-pages-extension') {
        setExtensionInstalled(true);
      }
    };
    
    // Add the message listener
    window.addEventListener('message', messageListener);
    
    // Send a message to check if the extension is installed
    window.postMessage({
      source: 'scheduled-pages-app',
      type: 'CHECK_EXTENSION'
    }, window.location.origin);
    
    // Clean up the message listener
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <ExtensionIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6">Chrome Extension</Typography>
      </Box>
      
      {extensionInstalled ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          The Scheduled Pages extension is installed! Your schedules will run even when this page is closed.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Install the Chrome extension to automatically open pages on schedule, even when this page is closed.
        </Alert>
      )}
      
      <Typography variant="body1" paragraph>
        The Scheduled Pages Chrome extension allows your scheduled pages to open automatically, even when this website is closed.
        All your schedules are synced with the extension, so you can manage everything from this website.
      </Typography>
      
      {!extensionInstalled && (
        <Box>
          <Typography variant="body2" paragraph>
            To install the extension:
          </Typography>
          
          <ol>
            <li>
              <Typography variant="body2">
                Download the extension from the <Link href="/extension.zip" download>download link</Link>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Unzip the downloaded file
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Open Chrome and go to <code>chrome://extensions</code>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Enable "Developer mode" in the top right corner
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Click "Load unpacked" and select the unzipped folder
              </Typography>
            </li>
          </ol>
          
          <Button
            variant="contained"
            color="primary"
            href="/extension.zip"
            download
            startIcon={<ExtensionIcon />}
            sx={{ mt: 2 }}
          >
            Download Extension
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ExtensionInfo;
