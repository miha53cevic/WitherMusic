const { app, BrowserWindow, Menu } = require('electron');

function createWindow() {
    
    // Remove menu bar
    //Menu.setApplicationMenu(null);

    let win = new BrowserWindow({
        width: 800,
        height: 480,
        webPrefrences: {
            nodeIntegration: true
        }
    });

    // Set application title
    win.setTitle('WitherMusic');

    // Load html file into the window
    win.loadFile('index.html');
}

app.on('ready', createWindow);