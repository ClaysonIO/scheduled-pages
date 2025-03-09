# Scheduled Pages Chrome Extension

This Chrome extension works with the Scheduled Pages web application to automatically open pages on a schedule, even when the main application is closed.

## Features

- Runs in the background even when the main application is closed
- Opens pages based on schedules defined in the main application
- Shows the next scheduled page in the popup
- Syncs schedules with the main application

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `extension` folder
4. The extension should now be installed and active

## Usage

1. Visit [https://scheduled-pages.clayson.io](https://scheduled-pages.clayson.io) to set up your schedules
2. The extension will automatically sync with the main application
3. Pages will open automatically based on your schedules, even when the main application is closed
4. Click the extension icon in the toolbar to see the next scheduled page

## How It Works

The extension consists of three main components:

1. **Background Service Worker**: Runs in the background and checks for schedules to run
2. **Content Script**: Communicates with the main application to sync schedules
3. **Popup UI**: Shows the current status and next scheduled page

When you create or update schedules in the main application, they are automatically synced to the extension. The extension then runs in the background and opens pages based on the schedules, even when the main application is closed.

## Development

To modify the extension:

1. Edit the files in the `extension` folder
2. Reload the extension in Chrome by clicking the refresh icon on the extension card in `chrome://extensions/`
3. Test your changes

## License

This extension is licensed under the same license as the main application.
