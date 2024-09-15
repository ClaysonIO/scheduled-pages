document.getElementById('saveBtn').addEventListener('click', saveData);
const cronInput = document.getElementById('cronInput');
const urlInput = document.getElementById('urlInput');

// IndexedDB setup
let db;
const request = indexedDB.open('cronUrlOpenerDB', 1);

request.onerror = function(event) {
    console.error("Database error:", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadData();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('settings', { keyPath: 'id' });
};

// Save data to IndexedDB
function saveData() {
    const cronString = cronInput.value;
    const urls = urlInput.value.split('\n').filter(url => url.trim() !== '');

    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    store.put({ id: 1, cron: cronString, urls: urls });
}

// Load data from IndexedDB
function loadData() {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(1);

    request.onsuccess = function(event) {
        const data = event.target.result;
        if (data) {
            cronInput.value = data.cron;
            urlInput.value = data.urls.join('\n');
        }
    };
}

// Parse cron string to check if it's the right time
function isTime(cronString) {
    const [min, hour, dayOfMonth, month, dayOfWeek] = cronString.split(' ');
    const now = new Date();
    
    const matchesMinute = min === '*' || now.getMinutes() === parseInt(min);
    const matchesHour = hour === '*' || now.getHours() === parseInt(hour);
    const matchesDayOfMonth = dayOfMonth === '*' || now.getDate() === parseInt(dayOfMonth);
    const matchesMonth = month === '*' || now.getMonth() + 1 === parseInt(month);
    const matchesDayOfWeek = dayOfWeek === '*' || now.getDay() === parseInt(dayOfWeek);

    return matchesMinute && matchesHour && matchesDayOfMonth && matchesMonth && matchesDayOfWeek;
}

// Open a random URL
function openRandomUrl() {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(1);

    request.onsuccess = function(event) {
        const data = event.target.result;
        if (data && isTime(data.cron)) {
            const urls = data.urls;
            if (urls.length > 0) {
                const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                window.open(randomUrl, '_blank');
            }
        }
    };
}

// Check every minute
setInterval(openRandomUrl, 60000);