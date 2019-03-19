const { app, BrowserWindow } = require('electron');
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

function createWindow () {
  // Create the browser window.
  window = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  window.loadFile('index.html');

  // Emitted when the window is closed.
  window.on('closed', () => {
    window = null;
  });
  
  loadData();
}

function loadData() {
  fs.readdir('./data', function(err, items) {
    if (err) throw err;

    //list that holds all the data for the robots
    var robots = [];
    //the labels at the top of each file, only pulled once
    var labels = null;

    //iterate through all files
    for (let i = 0; i < items.length; i++) {
      fs.readFile('./data/' + items[i], "utf8", function(error, data) {
        if (error) throw error;
        if (data === "") {
          //file is empty
          return;
        }

        //parse through the data
        if (labels === null) {
          labels = data.split("\n")[0].split(",");
          global.labels = labels;
        }

        let robot = new Robot();
        robot.robotNumber = items[i].replace(".csv", "");

        let lines = data.split("\n");
        
        let robotData = [];

        for (let s = 0; s < lines.length; s++) {
          robotData.push(lines[s].split(","));
        }

        robot.data = robotData;

        //add to the full list of robots
        robots.push(robot);
      });
    }

    //send this variable over to the client side
    global.robots = robots;
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
  constructor(robotNumber, data) {
      this.robotNumber = robotNumber;
      this.data = data;
  }
}