/*jshint esversion: 6 */

var electron = require("electron");

var labels = [];
//the labels shown from this search
var searchLabels = [];

var openCustomDataPoints = [];
var openCustomDataLabels = [];

var currentRobotNumber = null;

function init() {
    //start with the prematch summary hidden
    disableBox("preMatchSummaryContainer");

    //start with the custom summary hidden
    disableBox("customSummaryContainer");

    //get the labels
    electron.ipcRenderer.send("getLabels");
}

function loadData() {
    //show a quick summary of all the data for this robot
    currentRobotNumber = document.getElementById("robotNumber").value;

    //set loading indicators
    document.getElementById("overallSummary").innerHTML = "Loading...";
    document.getElementById("autoSummary").innerHTML = "Loading...";
    document.getElementById("preMatchSummary").innerHTML = "Loading...";
    document.getElementById("commentsSummary").innerHTML = "Loading...";

    //start the processing
    electron.ipcRenderer.send("createOverallSummary", currentRobotNumber);
    electron.ipcRenderer.send("createAutoSummary", currentRobotNumber);
    electron.ipcRenderer.send("createPreMatchSummary", currentRobotNumber);
    electron.ipcRenderer.send("createCommentsSummary", currentRobotNumber);
    electron.ipcRenderer.send("getLastUpdated");

    //show robot photo
    document.getElementById("robot").src = "photos/" + currentRobotNumber + ".JPG";

    //reload custom info
    reloadCustomSummary();
}

electron.ipcRenderer.on("showOverallSummary", function (event, result) {
    document.getElementById("overallSummary").innerHTML = result;
});

electron.ipcRenderer.on("showAutoSummary", function (event, result) {
    document.getElementById("autoSummary").innerHTML = result;
});

electron.ipcRenderer.on("showPreMatchSummary", function (event, result) {
    document.getElementById("preMatchSummary").innerHTML = result;
});

electron.ipcRenderer.on("showCommentsSummary", function (event, result) {
    document.getElementById("commentsSummary").innerHTML = result;
});

electron.ipcRenderer.on("showLastUpdated", function (event, result) {
    document.getElementById("lastUpdated").innerHTML = "Last Updated Match " + result;
});

electron.ipcRenderer.on("showLabels", function (event, result) {
    labels = Array.from(result);

    //remove unneeded labels
    labels.splice(1, 1);
    labels.splice(labels.length - 4, 1);
    labels.splice(labels.length - 2, 1);

    showLabels(labels);
});

electron.ipcRenderer.on("showDataForLabel", function (event, label, result) {
    if (!openCustomDataLabels.includes(label) && !openCustomDataPoints.includes(result)) {
        openCustomDataLabels.push(label);
        openCustomDataPoints.push(result);
    }

    showCustomSummary();
});

//go through the custom summary and get new data from the server
function reloadCustomSummary() {
    //get current labels
    let customLabels = Array.from(openCustomDataLabels);

    //reset data
    openCustomDataLabels = [];
    openCustomDataPoints = [];

    //empty the page by showing nothing
    showCustomSummary();

    //call to get the new data
    for (let i = 0; i < customLabels.length; i++) {
        electron.ipcRenderer.send("getDataForLabel", currentRobotNumber, customLabels[i]);
    }
}

function showCustomSummary() {
    let summary = "<table>";

    //add labels to table
    summary += "<tr>";

    for (let i = 0; i < openCustomDataLabels.length; i++) {
        summary += "<td><u>" + openCustomDataLabels[i] + "</u></td>";
    }

    summary += "</tr>";

    //adds all the custom data points in collumns
    if (openCustomDataPoints.length > 0) {
        for (let i = 0; i < openCustomDataPoints[0].length; i++) {
            summary += "<tr>";
    
            for (let s = 0; s < openCustomDataPoints.length; s++) {
                summary += "<td>" + openCustomDataPoints[s][i] + "</td>";
            }
    
            summary += "</tr>";
        }
    }

    summary += "</table>";

    document.getElementById("customSummary").innerHTML = summary;
}

function showLabels(labels) {
    //set the search labels to the labels that will be used here
    searchLabels = labels;

    let labelsString = "";

    for (let i = 0; i < labels.length; i++) {
        //make each item be in a clickable div
        labelsString += "<div id='" + labels[i] + "' onclick='labelClickedByIndex(" + i + ")' class='clickable'>";
        labelsString += labels[i] + "</div>";
    }

    document.getElementById("customSearch").innerHTML = labelsString;
}

function toggleBox(id) {
    if (document.getElementById(id).style.display === "none") {
        //enable it
        enableBox(id);
    } else {
        //disable it
        disableBox(id);
    }
}

function enableBox(id) {
    document.getElementById(id).removeAttribute("style");
}

function disableBox(id) {
    document.getElementById(id).style.display = "none";
}

function inputKeyPress(event) {
    //check if an enter is pressed
    if (event.key === "Enter") {
        loadData();
    }
}

//when an extra summary info is clicked, bring the user down to the custom summary
function extraSummaryClick(labelName) {
    //open up custom summary if it is not opened
    enableBox("customSummaryContainer");

    //blank it out first to make sure the page gets scrolled down
    window.location.hash = "";
    //move to that section
    window.location.hash = "customLabel";

    //for hit and miss
    selectCustomSummaryLabel(labelName + " Hit");
    selectCustomSummaryLabel(labelName + " Miss");
}

//for the custom summary searching functionality
function customSearchKeyUp(event) {
    //event can be ignored, and instead what's in the box can be used
    let searchTerm = document.getElementById("customSearchBox").value;

    if (searchTerm === "") {
        //just show everything
        showLabels(labels);

        return;
    }

    //this will include all the labels that are part of this search
    let searchedLabels = [];
    
    //search for the lables to add to searchedLabels
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes(searchTerm.toLowerCase())) {
            //add it to the searched labels
            searchedLabels.push(labels[i]);
        }
    }

    showLabels(searchedLabels);
}

//calls the other label clicked function
//takes just an index instead of the label itself
function labelClickedByIndex(index) {
    labelClicked(searchLabels[index]);
}

//for the labels in the custom summary view
//allows the user to view the raw data, but only the ones they select
function labelClicked(label) {
    if (currentRobotNumber === null) {
        //no robot yet
        return;
    }

    if (document.getElementById(label).style.backgroundColor === "black") {
        deselectCustomSummaryLabel(label);
    } else {
        selectCustomSummaryLabel(label);
    }
}

//deselcts the label in the custom summary
//thois is used when searching through the raw data
function deselectCustomSummaryLabel(label) {
    //it is already selected, deselect it
    document.getElementById(label).style.backgroundColor = "white";
    document.getElementById(label).style.color = "black";

    //remove this from the custom data view
    let customDataIndex = getLabelIndex(label);

    openCustomDataLabels.splice(customDataIndex, 1);
    openCustomDataPoints.splice(customDataIndex, 1);

    //update the view
    showCustomSummary();
}

//deselcts the label in the custom summary
//thois is used when searching through the raw data
function selectCustomSummaryLabel(label) {
    document.getElementById(label).style.backgroundColor = "black";
    document.getElementById(label).style.color = "white";

    //get the data for this label
    electron.ipcRenderer.send("getDataForLabel", currentRobotNumber, label);
}

function getLabelIndex(labels, search) {
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes(search)) {
            return i;
        }
    }

    return -1;
}