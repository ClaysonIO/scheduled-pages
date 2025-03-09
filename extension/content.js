// Content script for the Scheduled Pages extension
// This script runs on the scheduled-pages.clayson.io domain and communicates with the main application

// Constants
const SYNC_INTERVAL = 5000; // Sync every 5 seconds

// Initialize the content script
function initialize() {
  console.log('Scheduled Pages content script initialized');
  
  // Set up a message listener for the main application
  window.addEventListener('message', handleWindowMessage);
  
  // Set up an interval to sync schedules
  setInterval(requestSchedules, SYNC_INTERVAL);
  
  // Inject a script to communicate with the main application
  injectCommunicationScript();
}

// Handle messages from the main application
function handleWindowMessage(event) {
  // Only accept messages from the same origin
  if (event.origin !== window.location.origin) {
    return;
  }
  
  const message = event.data;
  
  // Check if the message is from our injected script
  if (message && message.source === 'scheduled-pages-app') {
    if (message.type === 'SCHEDULES_DATA') {
      // Send the schedules to the background service worker
      chrome.runtime.sendMessage({
        type: 'SYNC_SCHEDULES',
        schedules: message.schedules
      }, response => {
        console.log('Synced schedules with extension:', response);
      });
    } else if (message.type === 'CHECK_EXTENSION') {
      // Respond to the check extension message
      window.postMessage({
        source: 'scheduled-pages-extension',
        type: 'EXTENSION_INSTALLED'
      }, window.location.origin);
    }
  }
}

// Request schedules from the main application
function requestSchedules() {
  window.postMessage({
    source: 'scheduled-pages-extension',
    type: 'REQUEST_SCHEDULES'
  }, window.location.origin);
}

// Inject a script to communicate with the main application
function injectCommunicationScript() {
  const script = document.createElement('script');
  script.textContent = `
    // Communication script for the Scheduled Pages extension
    // This script runs in the context of the main application
    
    (function() {
      // Set up a message listener for the extension
      window.addEventListener('message', function(event) {
        // Only accept messages from the same origin
        if (event.origin !== window.location.origin) {
          return;
        }
        
        const message = event.data;
        
        // Check if the message is from our content script
        if (message && message.source === 'scheduled-pages-extension') {
          if (message.type === 'REQUEST_SCHEDULES') {
            // Get the schedules from the database
            if (window.db && window.db.schedules) {
              window.db.schedules.toArray().then(function(schedules) {
                // Send the schedules to the content script
                window.postMessage({
                  source: 'scheduled-pages-app',
                  type: 'SCHEDULES_DATA',
                  schedules: schedules
                }, window.location.origin);
              });
            }
          }
        } else if (message && message.source === 'scheduled-pages-app') {
          if (message.type === 'CHECK_EXTENSION') {
            // Respond to the check extension message
            window.postMessage({
              source: 'scheduled-pages-extension',
              type: 'EXTENSION_INSTALLED'
            }, window.location.origin);
          }
        }
      });
      
      // Notify the extension when schedules change
      if (window.db && window.db.schedules) {
        window.db.schedules.hook('creating', function(primKey, obj) {
          notifySchedulesChanged();
        });
        
        window.db.schedules.hook('updating', function(modifications, primKey, obj) {
          notifySchedulesChanged();
        });
        
        window.db.schedules.hook('deleting', function(primKey) {
          notifySchedulesChanged();
        });
      }
      
      // Notify the extension that schedules have changed
      function notifySchedulesChanged() {
        if (window.db && window.db.schedules) {
          window.db.schedules.toArray().then(function(schedules) {
            window.postMessage({
              source: 'scheduled-pages-app',
              type: 'SCHEDULES_DATA',
              schedules: schedules
            }, window.location.origin);
          });
        }
      }
      
      console.log('Scheduled Pages communication script initialized');
    })();
  `;
  
  document.head.appendChild(script);
  script.remove();
}

// Initialize the content script
initialize();
