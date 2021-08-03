const {app, BrowserWindow, Menu, MenuItem} = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
    const win = new BrowserWindow({
        width: 960,
        height: 600,

        // frame: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createMainWindow);

// MacOs compatibility
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    };
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    };
});