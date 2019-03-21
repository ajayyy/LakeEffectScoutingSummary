var electron = require('electron');

function showData() {
    //show a quick summary of all the data for this robot\

    var currentRobotNumber = document.getElementById('robotNumber').value;

    var labels = electron.remote.getGlobal('labels');
    var robots = electron.remote.getGlobal('robots');

    showOverall(currentRobotNumber, labels, robots);

    showAuto(currentRobotNumber, labels, robots);
}

function showOverall(currentRobotNumber, labels, robots) {
    let fullRocketCargoIndex = getColumnIndex(labels, "teleop full rocket cargo hit");

    //all the data points for this robot
    let fullRocketCargoItems = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    fullRocketCargoItems.push(robots[currentRobot].data[matchNum][fullRocketCargoIndex]);
                }
            }
        }
    }
    //find average
    let fullRocketCargoAverage = getAverageItem(fullRocketCargoItems);

    document.getElementById('overallSummary').innerHTML = "Full Rocket Cargo Average " + fullRocketCargoAverage.toFixed(2);

    //find max
    let fullRocketCargoMax = getMaxItems(fullRocketCargoItems);

    document.getElementById('overallSummary').innerHTML += "Full Rocket Cargo Max " + fullRocketCargoMax[0];

}

function showAuto(currentRobotNumber, labels, robots) {
    //find all the auto collumns
    var autoColumns = [];
    //start at index 5 to avoid auto start position
    for (let i = 5; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes("auto") && !labels[i].toLowerCase().includes("full")) {
            autoColumns.push(i);
        }
    }

    let autoSummary = "";

    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //was there a data point added for this match
                let addedSomething = false;

                for (let autoColumn = 0; autoColumn < autoColumns.length; autoColumn++) {
                    if (robots[currentRobot].data[matchNum][autoColumns[autoColumn]] > 0) {
                        let amountOfTimes = robots[currentRobot].data[matchNum][autoColumns[autoColumn]];
                        let amountOfTimesText = "";
                        if (amountOfTimes > 1) {
                            amountOfTimesText = amountOfTimes + " times";
                        } else {
                            amountOfTimesText = "once";
                        }

                        //the action that just happened
                        let actionHappened = labels[autoColumns[autoColumn]];
                        //remove the word auto, it is unnessesary
                        actionHappened = actionHappened.replace('Auto ', '');

                        autoSummary += actionHappened + " " + amountOfTimesText + " in match " + robots[currentRobot].data[matchNum][0] + "<br/>";
                        addedSomething = true;
                    }
                }

                if (addedSomething) {
                    //add one more enter to spread things out
                    autoSummary += "<br/>";
                }
            }
        }
    }

    document.getElementById('autoSummary').innerHTML = autoSummary;
}

function getColumnIndex(labels, search) {
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes(search)) {
            return i;
        }
    }

    return -1;
}

function getMaxItems(items) {
    //there might be multiple items that are the maximum
    let allMaxItems = [-1];
    for (let i = 0; i < items.length; i++) {
        if (items[i] > allMaxItems[0]) {
            if (items[i] == allMaxItems[0]) {
                //already exists, multiple maximum items
                allMaxItems.push(items[i]);
            } else {
                //set this as the maximum
                allMaxItems = [items[i]];
            }
        }
    }

    return allMaxItems;
}

function getAverageItem(items) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        sum += parseInt(items[i]);
    }

    //convert sum to average
    return sum / items.length;
}