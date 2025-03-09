// Background service worker for the Scheduled Pages extension
// This script runs in the background even when the main application is closed

// Constants
const ALARM_NAME = 'check-schedules';
const CHECK_INTERVAL = 10; // Check every 10 seconds
const STORAGE_KEY = 'schedules';
const APP_URL = 'https://scheduled-pages.clayson.io';

// Initialize the extension
async function initialize() {
  console.log('Scheduled Pages extension initialized');
  
  // Set up the alarm to check schedules regularly
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: CHECK_INTERVAL / 60 // Convert seconds to minutes
  });
  
  // Listen for alarm events
  chrome.alarms.onAlarm.addListener(handleAlarm);
  
  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Handle alarm events
async function handleAlarm(alarm) {
  if (alarm.name === ALARM_NAME) {
    await checkSchedules();
  }
}

// Check for schedules that need to be run
async function checkSchedules() {
  try {
    // Get the schedules from storage
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const schedules = data[STORAGE_KEY] || [];
    
    if (schedules.length === 0) {
      return; // No schedules to check
    }
    
    const now = new Date();
    
    // Find schedules that need to be run
    const schedulesToRun = schedules.filter(schedule => {
      return schedule.nextRun && new Date(schedule.nextRun) <= now;
    });
    
    // Run the schedules
    for (const schedule of schedulesToRun) {
      await runSchedule(schedule);
    }
    
    // Update the schedules in storage
    await chrome.storage.local.set({ [STORAGE_KEY]: schedules });
  } catch (error) {
    console.error('Error checking schedules:', error);
  }
}

// Run a schedule
async function runSchedule(schedule) {
  try {
    if (!schedule.urls || schedule.urls.length === 0) {
      console.warn(`Schedule ${schedule.id} has no URLs to open`);
      return;
    }
    
    // Get a random URL from the list
    const url = getRandomUrl(schedule.urls);
    
    // Open the URL in a new tab
    await chrome.tabs.create({ url });
    
    // Update the last run time and next run time (using local time)
    schedule.lastRun = new Date().toString();
    schedule.nextRun = getNextRunTime(schedule.cronExpression);
    
    console.log(`Opened URL: ${url} for schedule: ${schedule.label}`);
  } catch (error) {
    console.error(`Error running schedule ${schedule.id}:`, error);
  }
}

// Get a random URL from an array of URLs
function getRandomUrl(urls) {
  if (!urls || urls.length === 0) {
    throw new Error('No URLs provided');
  }
  
  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
}

// Parse a cron expression and return the next run time (in local time)
function getNextRunTime(cronExpression) {
  try {
    // Simple cron parser implementation
    // This is a basic implementation and doesn't handle all cron features
    // Format: minute hour day month dayOfWeek
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression format');
    }
    
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    // Start with the current time
    const nextRun = new Date(now);
    
    // Reset seconds and milliseconds
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    
    // Set the next minute
    if (minute === '*') {
      // Every minute - use the next minute
      nextRun.setMinutes(now.getMinutes() + 1);
    } else if (minute.startsWith('*/')) {
      // Every n minutes
      const interval = parseInt(minute.substring(2), 10);
      const currentMinute = now.getMinutes();
      const nextMinute = currentMinute + (interval - (currentMinute % interval));
      
      if (nextMinute > 59) {
        // Roll over to the next hour
        nextRun.setMinutes(nextMinute % 60);
        nextRun.setHours(now.getHours() + 1);
      } else {
        nextRun.setMinutes(nextMinute);
      }
    } else {
      // Specific minute
      const minuteValue = parseInt(minute, 10);
      
      if (minuteValue <= now.getMinutes()) {
        // If the minute has already passed, move to the next hour
        nextRun.setMinutes(minuteValue);
        nextRun.setHours(now.getHours() + 1);
      } else {
        nextRun.setMinutes(minuteValue);
      }
    }
    
    // For simplicity, we'll just add 1 day if the time has already passed
    if (nextRun <= now) {
      nextRun.setDate(now.getDate() + 1);
    }
    
    // Store as a string that preserves local time information
    // Format: YYYY-MM-DDTHH:MM:SS.sssZ[timezone offset]
    return nextRun.toString();
  } catch (error) {
    console.error('Error parsing cron expression:', error);
    throw new Error(`Invalid cron expression: ${error.message}`);
  }
}

// Handle messages from the content script
function handleMessage(message, sender, sendResponse) {
  if (message.type === 'SYNC_SCHEDULES') {
    // Sync schedules from the main application
    chrome.storage.local.set({ [STORAGE_KEY]: message.schedules }, () => {
      sendResponse({ success: true });
    });
    return true; // Indicates that the response is asynchronous
  }
}

// Initialize the extension
initialize();
