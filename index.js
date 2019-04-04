var electron = require('electron');

function loadData() {
    //show a quick summary of all the data for this robot
    var currentRobotNumber = document.getElementById('robotNumber').value;

    //start the processing
    electron.ipcRenderer.send("createOverallSummary", currentRobotNumber);

    electron.ipcRenderer.send("createAutoSummary", currentRobotNumber);

    //show robot photo
    document.getElementById('robot').src = "photos/" + currentRobotNumber + ".JPG";
}

electron.ipcRenderer.on('showOverallSummary', function (event, result) {
    document.getElementById('overallSummary').innerHTML = result;
});

electron.ipcRenderer.on('showAutoSummary', function (event, result) {
    document.getElementById('autoSummary').innerHTML = result;
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