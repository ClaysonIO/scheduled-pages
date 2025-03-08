import Dexie, { Table } from 'dexie';

// Define the Schedule interface
export interface Schedule {
  id?: number;
  label: string;
  cronExpression: string;
  urls: string[];
  lastRun?: Date;
  nextRun?: Date;
}

// Define the database
class ScheduleDatabase extends Dexie {
  schedules!: Table<Schedule, number>;

  constructor() {
    super('ScheduleDatabase');
    this.version(1).stores({
      schedules: '++id, label, cronExpression'
    });
  }
}

// Create and export a database instance
export const db = new ScheduleDatabase();

// Helper function to export all schedules
export async function getAllSchedules(): Promise<Schedule[]> {
  return await db.schedules.toArray();
}

// Helper function to get a schedule by id
export async function getScheduleById(id: number): Promise<Schedule | undefined> {
  return await db.schedules.get(id);
}

// Helper function to add or update a schedule
export async function saveSchedule(schedule: Schedule): Promise<number> {
  return await db.schedules.put(schedule);
}

// Helper function to delete a schedule
export async function deleteSchedule(id: number): Promise<void> {
  await db.schedules.delete(id);
}
