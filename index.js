/*jshint esversion: 6 */

var electron = require('electron');

function init() {
    //start with the prematch summary hidden
    toggleBox("preMatchSummaryContainer");
}

function loadData() {
    //show a quick summary of all the data for this robot
    var currentRobotNumber = document.getElementById('robotNumber').value;

    //set loading indicators
    document.getElementById('overallSummary').innerHTML = "Loading...";
    document.getElementById('autoSummary').innerHTML = "Loading...";
    document.getElementById('preMatchSummary').innerHTML = "Loading...";
    document.getElementById('commentsSummary').innerHTML = "Loading...";

    //start the processing
    electron.ipcRenderer.send("createOverallSummary", currentRobotNumber);
    electron.ipcRenderer.send("createAutoSummary", currentRobotNumber);
    electron.ipcRenderer.send("createPreMatchSummary", currentRobotNumber);
    electron.ipcRenderer.send("createCommentsSummary", currentRobotNumber);
    electron.ipcRenderer.send("getLastUpdated");

    //show robot photo
    document.getElementById('robot').src = "photos/" + currentRobotNumber + ".JPG";
}

electron.ipcRenderer.on('showOverallSummary', function (event, result) {
    document.getElementById('overallSummary').innerHTML = result;
});

electron.ipcRenderer.on('showAutoSummary', function (event, result) {
    document.getElementById('autoSummary').innerHTML = result;
});

electron.ipcRenderer.on('showPreMatchSummary', function (event, result) {
    document.getElementById('preMatchSummary').innerHTML = result;
});

electron.ipcRenderer.on('showCommentsSummary', function (event, result) {
    document.getElementById('commentsSummary').innerHTML = result;
});

electron.ipcRenderer.on('showLastUpdated', function (event, result) {
    document.getElementById('lastUpdated').innerHTML = "Last Updated Match " + result;
});

function toggleBox(id) {
    if (document.getElementById(id).style.display === "none") {
        //enable it
        document.getElementById(id).style.display = "block";
    } else {
        //disable it
        document.getElementById(id).style.display = "none";
    }
}

function inputKeyPress(event) {
    //check if an enter is pressed
    if (event.key === "Enter") {
        loadData();
    }
}