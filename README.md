# Scheduled Pages

A web application that automatically opens web pages at scheduled times using cron expressions.

## Features

- **Schedule Web Pages**: Create schedules using cron expressions to automatically open web pages at specific times
- **Multiple URLs**: Add multiple URLs to each schedule - a random one will be opened when the schedule runs
- **Countdown Timer**: View a countdown to the next scheduled page opening
- **Local Storage**: All schedules are stored locally in your browser using IndexedDB
- **No Server Required**: Runs entirely in the browser with no backend server needed

## Use Cases

- Set up daily reminders by scheduling important websites to open at specific times
- Create a rotating schedule of educational resources
- Automatically open meeting links at scheduled times
- Set up a digital signage system that rotates through different web pages

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to the local development URL (typically http://localhost:5173)

## Creating a Schedule

1. Click "Add New Schedule" on the main page
2. Enter a label for your schedule
3. Enter a cron expression (e.g., "30 12 * * 1-5" for weekdays at 12:30 PM)
4. Add one or more URLs to be opened
5. Click "Save" to create the schedule

## Cron Expression Format

The application uses the standard cron format with five fields:

```
minute hour day month dayOfWeek
```

Examples:
- `30 12 * * 1-5`: Weekdays at 12:30 PM
- `0 9 * * *`: Every day at 9:00 AM
- `*/15 * * * *`: Every 15 minutes
- `0 */2 * * *`: Every 2 hours

## Technical Details

- Built with React, TypeScript, and Vite
- Uses Material-UI for the user interface
- Stores data locally using Dexie.js (IndexedDB wrapper)
- Implements a custom cron parser for scheduling

## Browser Permissions

This application requires permission to open popup windows. You may need to allow popups for the site in your browser settings.
