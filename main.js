// const {app, BrowserWindow, BrowserView, Menu, MenuItem} = require('electron');
const {app, BrowserWindow, Menu, MenuItem} = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
    const win = new BrowserWindow({
        width: 960,
        height: 600,

        // frame: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // const view = new BrowserView()
    // win.setBrowserView(view)
    // view.setBounds({ x: 0, y: 0, width: 300, height: 600 })
    // view.webContents.loadURL('https://www.spotify.com/br/home/')

    // win.on('resize', () => {
    //     view.setBounds({x: 0, y: 0, width: 300, height: win.getBounds().height})
    // })

    win.loadFile('index.html');
}

// app.commandLine.appendSwitch('widevine-cdm-path', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\92.0.4515.131\\WidevineCdm\\_platform_specific\\win_x64\\widevinecdm.dll')
// app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2209.0')

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