const { app, BrowserWindow } = require('electron');
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

//variables for data parsing
//the labels at the top of each file, only pulled once
var labels = null;

function createWindow () {
  // Create the browser window.
  window = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  window.loadFile('index.html');

  // Emitted when the window is closed.
  window.on('closed', () => {
    window = null;
  });

  
}

function loadData() {
  fs.readdir('./data', function(err, items) {
    if (err) throw err;

    //iterate through all files
    for (var i = 0; i < items.length; i++) {
      fs.readFile('./data/' + items[i], function(error, data) {
        if (error) throw error;
        if (data === "") {
          //file is empty
          return;
        }

        //parse through the data
        if (labels === null) {
          labels = data.split("\n")[0].split(",");
        }


      });
    }
  });

}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});

//Classes
class Robot {
  constructor() {
      this.robotNumber = 0;
      this.data = [];
  }
}