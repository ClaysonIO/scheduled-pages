/**
 * Cron expression utilities using cron-parser and cronstrue
 */
import {CronExpressionParser}  from 'cron-parser';

// Parse a cron expression and return the next run time (in local time)
export function getNextRunTime(cronExpression: string): Date {
  try {
    // Parse the cron expression with local time option
    const interval = CronExpressionParser.parse(cronExpression, {
      currentDate: new Date(), // Use current local time as reference
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone // Use local timezone
    });
    
    // Get the next occurrence (will be in local time)
    return interval.next().toDate();
  } catch (error) {
    console.error('Error parsing cron expression:', error);
    throw new Error(`Invalid cron expression: ${(error as Error).message}`);
  }
}

// Format a date as a readable string
export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Calculate time remaining until a date
export function getTimeRemaining(targetDate: Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = targetDate.getTime() - new Date().getTime();
  
  // Calculate time components
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

// Get a random URL from an array of URLs
export function getRandomUrl(urls: string[]): string {
  if (!urls || urls.length === 0) {
    throw new Error('No URLs provided');
  }
  
  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
}

// Update the next run time for a schedule
export function updateNextRunTime(cronExpression: string): Date {
  return getNextRunTime(cronExpression);
}

// Validate a cron expression
export function validateCronExpression(cronExpression: string): boolean {
  try {
    // Use the same local time options for validation
    CronExpressionParser.parse(cronExpression, {
      currentDate: new Date(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    return true;
  } catch (error) {
    return false;
  }
}
