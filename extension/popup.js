// Popup script for the Scheduled Pages extension
// This script handles the popup UI logic

// Constants
const STORAGE_KEY = 'schedules';

// Initialize the popup
document.addEventListener('DOMContentLoaded', initialize);

// Initialize the popup
async function initialize() {
  try {
    // Get the schedules from storage
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const schedules = data[STORAGE_KEY] || [];
    
    // Update the UI with the schedules
    updateSchedulesUI(schedules);
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Update the UI with the schedules
function updateSchedulesUI(schedules) {
  const nextScheduleContainer = document.getElementById('next-schedule-container');
  
  if (!schedules || schedules.length === 0) {
    nextScheduleContainer.innerHTML = '<div class="no-schedules">No schedules found</div>';
    return;
  }
  
  // Find the next schedule to run
  const now = new Date();
  const schedulesWithNextRun = schedules.filter(
    schedule => schedule.nextRun !== undefined
  );
  
  if (schedulesWithNextRun.length === 0) {
    nextScheduleContainer.innerHTML = '<div class="no-schedules">No upcoming schedules</div>';
    return;
  }
  
  // Sort by next run time
  schedulesWithNextRun.sort(
    (a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
  );
  
  // Get the next schedule
  const nextSchedule = schedulesWithNextRun[0];
  
  // Format the next run time
  const nextRunTime = new Date(nextSchedule.nextRun);
  const formattedTime = formatDateTime(nextRunTime);
  
  // Create the schedule item
  const scheduleItem = document.createElement('div');
  scheduleItem.className = 'schedule-item';
  scheduleItem.innerHTML = `
    <div class="schedule-label">${nextSchedule.label}</div>
    <div class="schedule-time">${formattedTime}</div>
  `;
  
  // Update the UI
  nextScheduleContainer.innerHTML = '';
  nextScheduleContainer.appendChild(scheduleItem);
}

// Format a date as a readable string
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
