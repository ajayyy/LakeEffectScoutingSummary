var electron = require('electron');

function showData() {
    //show a quick summary of all the data for this robot
    var currentRobotNumber = document.getElementById('robotNumber').value;

    var labels = electron.remote.getGlobal('labels');
    var robots = electron.remote.getGlobal('robots');

    showOverall(currentRobotNumber, labels, robots);

    showAuto(currentRobotNumber, labels, robots);

    //show robot photo
    document.getElementById('robot').src = "photos/" + currentRobotNumber + ".JPG";
}

function showOverall(currentRobotNumber, labels, robots) {
    let fullSummary = "";

    fullSummary += getActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Rocket Cargo");

    fullSummary += "<br/>";

    fullSummary += getActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Cargo Ship Cargo");

    fullSummary += "<br/>";

    fullSummary += getActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Rocket Hatch");

    fullSummary += "<br/>";

    fullSummary += getActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Cargo Ship Hatch");

    fullSummary += "<br/>";

    fullSummary += "Death Rate: " + getColumnAverage(currentRobotNumber, labels, robots, "died") + "%";

    document.getElementById('overallSummary').innerHTML = fullSummary;
}

//find average data point of this column
function getColumnAverage(currentRobotNumber, labels, robots, searchTerm) {
    //find average of this column
    let column = getColumnIndex(labels, searchTerm);
    let items = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    if (robots[currentRobot].data[matchNum][column] === "true") {
                        items.push(1);
                    } else if (robots[currentRobot].data[matchNum][column] === "false") {
                        items.push(0);
                    } else {
                        items.push(robots[currentRobot].data[matchNum][column]);
                    }
                }
            }
        }
    }
    let average = getAverageItem(items);

    return (average * 100).toFixed(2);
}

//returns a summary message for this action
//used to batch find the different action's stats
function getActionSummary(currentRobotNumber, labels, robots, searchTerm) {
    let fullSummary = "";

    //miss and hit to include the successes and failures
    let hitIndex = getColumnIndex(labels, searchTerm.toLowerCase() + " hit");
    let missIndex = getColumnIndex(labels, searchTerm.toLowerCase() + " miss");

    //all the data points for this robot
    let hitItems = [];
    let missItems = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    hitItems.push(robots[currentRobot].data[matchNum][hitIndex]);
                    missItems.push(robots[currentRobot].data[matchNum][missIndex]);
                }
            }
        }
    }
    //find average
    let hitAverage = getAverageItem(hitItems);
    let missAverage = getAverageItem(missItems);

    fullSummary += searchTerm + " Average " + hitAverage.toFixed(2) + " : " + missAverage.toFixed(2) + "<br/>";

    //find max
    let hitMaxItems = getMaxItems(hitItems);

    //TODO: find minimum misses in the matches of the maximum (their best performance)
    let missMaxItems = getMaxItems(missItems);

    fullSummary += searchTerm + " Max " + hitMaxItems[0] + " : " + missMaxItems[0] + "<br/>";

    //return resulted summary
    return fullSummary;
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

function toggleBox(id) {
    if (document.getElementById(id).style.display === "none") {
        //enable it
        document.getElementById(id).style.display = "block";
    } else {
        //disable it
        document.getElementById(id).style.display = "none";
    }
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

function getMinItems(items) {
    //there might be multiple items that are the maximum
    let allMinItems = [-1];
    for (let i = 0; i < items.length; i++) {
        if (items[i] < allMinItems[0] || allMinItems[0] == -1) {
            if (items[i] == allMinItems[0]) {
                //already exists, multiple maximum items
                allMinItems.push(items[i]);
            } else {
                //set this as the maximum
                allMinItems = [items[i]];
            }
        }
    }

    return allMinItems;
}

function getAverageItem(items) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        sum += parseInt(items[i]);
    }

    //convert sum to average
    return sum / items.length;
}