import { db, Schedule } from '../db';
import { getNextRunTime, getRandomUrl } from '../utils/cron';

// Interval in milliseconds to check for schedules to run
const CHECK_INTERVAL = 10000; // 10 seconds

class SchedulerService {
  private intervalId: number | null = null;
  private isRunning = false;
  private nextSchedule: Schedule | null = null;
  private listeners: Array<(nextSchedule: Schedule | null) => void> = [];

  // Start the scheduler
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkSchedules();
    
    // Set up interval to check schedules
    this.intervalId = window.setInterval(() => {
      this.checkSchedules();
    }, CHECK_INTERVAL);
  }

  // Stop the scheduler
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Check for schedules that need to be run
  async checkSchedules(): Promise<void> {
    try {
      const now = new Date();
      const schedules = await db.schedules.toArray();
      
      // Update next run time for schedules that don't have one
      for (const schedule of schedules) {
        if (!schedule.nextRun) {
          schedule.nextRun = getNextRunTime(schedule.cronExpression);
          await db.schedules.update(schedule.id!, { nextRun: schedule.nextRun });
        }
      }
      
      // Find schedules that need to be run
      const schedulesToRun = schedules.filter(
        schedule => schedule.nextRun && schedule.nextRun <= now
      );
      
      // Run schedules
      for (const schedule of schedulesToRun) {
        await this.runSchedule(schedule);
      }
      
      // Find the next schedule to run
      this.updateNextSchedule();
    } catch (error) {
      console.error('Error checking schedules:', error);
    }
  }

  // Run a schedule
  async runSchedule(schedule: Schedule): Promise<void> {
    try {
      if (!schedule.urls || schedule.urls.length === 0) {
        console.warn(`Schedule ${schedule.id} has no URLs to open`);
        return;
      }
      
      // Get a random URL from the list
      const url = getRandomUrl(schedule.urls);
      
      // Open the URL in a new tab
      window.open(url, '_blank');
      
      // Update the last run time and next run time
      const lastRun = new Date();
      const nextRun = getNextRunTime(schedule.cronExpression);
      
      // Update the schedule in the database
      await db.schedules.update(schedule.id!, {
        lastRun,
        nextRun
      });
      
      console.log(`Opened URL: ${url} for schedule: ${schedule.label}`);
    } catch (error) {
      console.error(`Error running schedule ${schedule.id}:`, error);
    }
  }

  // Find the next schedule to run
  async updateNextSchedule(): Promise<void> {
    try {
      const schedules = await db.schedules.toArray();
      
      // Filter schedules with a next run time
      const schedulesWithNextRun = schedules.filter(
        schedule => schedule.nextRun !== undefined
      );
      
      if (schedulesWithNextRun.length === 0) {
        this.nextSchedule = null;
        this.notifyListeners();
        return;
      }
      
      // Sort by next run time
      schedulesWithNextRun.sort(
        (a, b) => a.nextRun!.getTime() - b.nextRun!.getTime()
      );
      
      // Get the next schedule
      const nextSchedule = schedulesWithNextRun[0];
      
      // Only notify listeners if the next schedule has changed
      if (
        !this.nextSchedule ||
        this.nextSchedule.id !== nextSchedule.id ||
        this.nextSchedule.nextRun?.getTime() !== nextSchedule.nextRun?.getTime()
      ) {
        this.nextSchedule = nextSchedule;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error updating next schedule:', error);
    }
  }

  // Get the next schedule to run
  getNextSchedule(): Schedule | null {
    return this.nextSchedule;
  }

  // Add a listener for next schedule changes
  addListener(listener: (nextSchedule: Schedule | null) => void): void {
    this.listeners.push(listener);
  }

  // Remove a listener
  removeListener(listener: (nextSchedule: Schedule | null) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify listeners of changes
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.nextSchedule);
    }
  }
}

// Create and export a singleton instance
export const scheduler = new SchedulerService();
