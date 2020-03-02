const {
    app,
    BrowserWindow,
    Menu,
    dialog,
} = require('electron');

// electron-json-config - npm package
const config = require('electron-json-config');

const fs = require('fs');
const path = require("path");

function createWindow() {

    // Remove menu bar
    //Menu.setApplicationMenu(null);

    let win = new BrowserWindow({
        width: 800,
        height: 480,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
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

    // If no config exists ask for the music folder at launch
    if (!config.has('music-folder')) {
        showOpen();
    } else {
        // Get tracks inside the music folder
        global.tracks = getAllFiles(config.get('music-folder'));
        console.log("Config location: " + app.getPath('userData'));

        // Load html file into the window
        win.loadFile('src/index.html');
    }

    // Set application title
    win.setTitle('WitherMusic');

    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });

    const menu = Menu.buildFromTemplate([{
            label: 'File',
            submenu: [{
                    label: 'Set music folder',
                    click: function () {
                        showOpen();
                    }
                },
                {
                    label: 'Refresh',
                    role: 'reload'
                },
                {
                    label: 'Quit',
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Options',
            submenu: [{
                label: 'Enable/Disable FFT Visualiser',
                click: function () {
                    win.webContents.send('enableFFT', null);
                }
            }]
        },
        {
            label: 'Debug',
            submenu: [{
                label: 'ToogleDevTools',
                role: 'toggleDevTools'
            }, ]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

function showOpen() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(data => {
        config.set('music-folder', data.filePaths[0]);
        app.quit();
        app.relaunch();
    });
}

app.on('ready', createWindow);