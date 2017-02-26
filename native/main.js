const electron = require('electron');
const { spawn } = require('child_process');
const sensingModule = require('../sensor/SensingModule/build/Release/SensingModule');
const api = require('../server/mirrorapi.js');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let sensorListener;

function switchScreen(state) {
  var script = state ? 'on' : 'off';
  script = './lifecycle/screen' + script + '.sh';
  const sh = spawn('sh', [ script ]);

  sh.stdout.on('data', (data) => {
    console.log(`lifecycle: ${data}`);
  });

  sh.stderr.on('data', (data) => {
    console.log(`lifecycle: ${data}`);
  });

  sh.on('close', (code) => {
    console.log(`lifecycle process exited with code ${code}`);
  });

}

function createWindow () {

  var size = { width : 1080, height : 600 };

  if(process.env.MODE === 'PRODUCTION') {

    size = electron.screen.getPrimaryDisplay().workAreaSize;
  }

  //show: false,
  mainWindow = new BrowserWindow({
    resizable: false,
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame : false,
    show : false,
    backgroundColor : '#000000',
    kiosk : true,
    titleBarStyle : 'hidden'
  });

  mainWindow.once('ready-to-show', () => { mainWindow.show(); });

  // start up the sensing module
  sensorListener = new sensingModule.SensorListener(0, function(state) {
    console.log((new Date()).toISOString() + ' : ' + state);

    if(state === 1)
    {
      switchScreen(true);
    }
    else if(state === 0)
    {
      switchScreen(false);
    }

    // if(mainWindow && state === 1)
    // {
    //     mainWindow.reload();
    // }

  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: __dirname + '/../web/index.html',
    protocol: 'file:',
    slashes: true
  }));

  if(process.env.MODE === 'PRODUCTION') {
      // mainWindow.setFullScreen(true);
      mainWindow.webContents.closeDevTools();
  }
  else {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})
