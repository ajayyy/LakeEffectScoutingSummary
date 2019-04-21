/*jshint esversion: 6 */

const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const summarizer = require("./summarizer");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

//list that holds all the data for the robots
var robots = [];
//the labels at the top of each file, only pulled once
var labels = null;

//last match updated on
var lastUpdated = -1;

//setup replace all function https://stackoverflow.com/a/38015918/1985387
String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.split(search).join(replace);
}

function createWindow() {
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
    fs.readdir('./data', function (err, items) {
        if (err) throw err;

        //iterate through all files
        for (let i = 0; i < items.length; i++) {
            fs.readFile('./data/' + items[i], "utf8", function (error, data) {
                if (error) throw error;
                if (data === "") {
                    //file is empty
                    return;
                }

                //parse through the data
                if (labels === null) {
                    labels = data.split("\n")[0].split(",");
                }

                let robot = new Robot();
                robot.robotNumber = items[i].replace(".csv", "");

                let lines = data.split("\n");

                let robotData = [];

                for (let s = 0; s < lines.length; s++) {
                    robotData.push(lines[s].split(","));

                    //find match number
                    if (s > 0) {
                        //update last updated to be the latest match number scouted
                        if (parseInt(lines[s].split(",")[0]) > lastUpdated) {
                            lastUpdated = parseInt(lines[s].split(",")[0]);
                        }
                    }
                }

                //sort robotData by match number
                //start it with the labels, they should always be at the top
                let robotDataSorted = [robotData[0]];

                //start at 1 to ignore labels at the top of the csv file
                for (let s = 1; s < robotData.length; s++) {
                    for (let q = 1; q < robotData.length; q++) {
                        //skip over if already dealt with
                        if (robotDataSorted.includes(robotData[q])) continue;

                        if (robotDataSorted.length == s) {
                            //start it with a default number
                            robotDataSorted.push([-1]);
                        }

                        if (robotDataSorted[s][0] === -1 || parseInt(robotData[q][0]) < parseInt(robotDataSorted[s][0])) {
                            //this one is the lower one, it should be here (sorting from lowest to highest)
                            robotDataSorted[s] = robotData[q];
                        }
                    }
                }

                robot.data = robotDataSorted;

                //add to the full list of robots
                robots.push(robot);
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

//creates the robot preview data that will be sent to the client
//calls back with the data
ipcMain.on('createOverallSummary', function (event, args) {
    let result = summarizer.getOverallData(args, labels, robots);

    event.sender.send("showOverallSummary", result);
});
ipcMain.on('createAutoSummary', function (event, args) {
    let result = summarizer.getAutoSummary(args, labels, robots);

    event.sender.send("showAutoSummary", result);
});
ipcMain.on('createPreMatchSummary', function (event, args) {
    let result = summarizer.getPreMatchSummary(args, labels, robots);

    event.sender.send("showPreMatchSummary", result);
});
ipcMain.on('createCommentsSummary', function (event, args) {
    let result = summarizer.getCommentsSummary(args, labels, robots);

    event.sender.send("showCommentsSummary", result);
});
ipcMain.on('getLastUpdated', function (event, args) {
    event.sender.send("showLastUpdated", lastUpdated);
});

ipcMain.on('getLabels', function (event, args) {
    event.sender.send("showLabels", labels);

    console.log("as")
    summarizer.generateStats(labels, robots);
});

//gets data under a specific label
ipcMain.on('getDataForLabel', function (event, robotNumber, searchTerm) {
    let data = summarizer.getDataForLabel(robotNumber, labels, robots, searchTerm.toLowerCase());

    event.sender.send("showDataForLabel", searchTerm, data);
});

//Classes
class Robot {
    constructor(robotNumber, data) {
        this.robotNumber = robotNumber;
        this.data = data;
    }
}