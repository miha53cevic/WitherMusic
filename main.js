const { app, BrowserWindow, Menu } = require('electron');

const fs = require('fs');
const path = require("path")

function createWindow() {

    // Remove menu bar
    //Menu.setApplicationMenu(null);

    let win = new BrowserWindow({
        width: 800,
        height: 480,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Get tracks from current folder/music/*
    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });

        return arrayOfFiles;
    };

    global.tracks = getAllFiles('C:/Users/Mihael/Music/');

    // Set application title
    win.setTitle('WitherMusic');

    // Load html file into the window
    win.loadFile('index.html');

    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

app.on('ready', createWindow);