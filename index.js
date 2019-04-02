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

    let deathRateItems = getColumnItems(currentRobotNumber, labels, robots, "died");
    fullSummary += "Death Rate: " + getRateOfItems(deathRateItems) + " | " + getParsedAverageItem(deathRateItems) + "%";
    fullSummary += "<br/>";
    let defenseRateItems = getColumnItems(currentRobotNumber, labels, robots, "defense");
    fullSummary += "Defense Rate: " + getRateOfItems(defenseRateItems) + " | " + getParsedAverageItem(defenseRateItems) + "%";
    fullSummary += "<br/>";
    let tippedRateItems = getColumnItems(currentRobotNumber, labels, robots, "tipped");
    fullSummary += "Tipped Rate: " + getRateOfItems(tippedRateItems) + " | " + getParsedAverageItem(tippedRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    let level2ClimbSuccessRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 2", "climbed");
    fullSummary += "Level 2 Successful Climb Rate: " + getRateOfItems(level2ClimbSuccessRateItems) + " | " + getParsedAverageItem(level2ClimbSuccessRateItems) + "%";
    fullSummary += "<br/>";
    let level2ClimbFailRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 2", "attempted climb");
    fullSummary += "Level 2 Climb Fail Rate (in the matches that they attempted): " + getRateOfItems(level2ClimbFailRateItems) + " | " + getParsedAverageItem(level2ClimbFailRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";
    
    let level3ClimbSuccessRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 3", "climbed");
    fullSummary += "Level 3 Successful Climb Rate: " + getRateOfItems(level3ClimbSuccessRateItems) + " | " + getParsedAverageItem(level3ClimbSuccessRateItems) + "%";
    fullSummary += "<br/>";
    let level3ClimbFailRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 3", "attempted climb");
    fullSummary += "Level 3 Climb Fail Rate (in the matches that they attempted): " + getRateOfItems(level3ClimbFailRateItems) + " | " + getParsedAverageItem(level3ClimbFailRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    //show average drive rating
    fullSummary += "Drive Rating: " + getParsedAverageRatingItem(getColumnItems(currentRobotNumber, labels, robots, "drive rating"));
    fullSummary += "<br/>";
    fullSummary += "Intake Rating: " + getParsedAverageRatingItem(getColumnItems(currentRobotNumber, labels, robots, "intake rating"));
    fullSummary += "<br/>";
    fullSummary += "Defense Rating: " + getParsedAverageRatingItem(getColumnItems(currentRobotNumber, labels, robots, "defence rating"));
    fullSummary += "<br/>";
    
    document.getElementById('overallSummary').innerHTML = fullSummary;
}

//find the amount of times a certain string has been saved in a column in a percentage
//Ex. number of successful level 2 climb
//only if the first search term AND the second are true (in the current column and the next column)
//Ex. First column: "level 2", second column: "success"
function getColumnTextItems(currentRobotNumber, labels, robots, collumnTerm, rowSearch, nextColumnSearch) {
    //find average of this column
    let column = getColumnIndex(labels, collumnTerm);
    let items = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    if (robots[currentRobot].data[matchNum][column].toLowerCase() === rowSearch &&
                            robots[currentRobot].data[matchNum][column + 1].toLowerCase() === nextColumnSearch) {
                        items.push(1);
                    } else {
                        items.push(0);
                    }
                }
            }
        }
    }

    return items;
}

//find data points of this column
function getColumnItems(currentRobotNumber, labels, robots, searchTerm) {
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

    return items;
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
        sum += parseFloat(items[i]);
    }

    //convert sum to average
    return sum / items.length;
}

//like the average function but ignores numbers that are zero
//specifically for averaging ratings
function getAverageRatingItem(items) {
    let sum = 0;
    //amount of items that are zero and should be ignored
    let numItemsToIgnore = 0;
    for (let i = 0; i < items.length; i++) {
        if (parseFloat(items[i]) === 0) {
            numItemsToIgnore++;
        } else {
            sum += parseFloat(items[i]);
        }
    }

    //convert sum to average
    let average = sum / (items.length - numItemsToIgnore);
    if (numItemsToIgnore == items.length) {
        return "N/A";
    } else {
        return average;
    }
}

//nice looking string average
function getParsedAverageRatingItem(items) {
    let average = getAverageRatingItem(items);
    if ((typeof average) == "number") {
        return average.toFixed(2);
    } else {
        return average;
    }
}

//nice looking string percent average
function getParsedAverageItem(items) {
    return (getAverageItem(items) * 100).toFixed(2);
}

//gets how many times 1 is in items
function getRateOfItems(items) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i] === "1" || items[i] === 1) {
            sum ++;
        }
    }

    //convert sum to average
    return sum + "/" + items.length;
}

function inputKeyPress(event) {
    //check if an enter is pressed
    if (event.key === "Enter") {
        showData();
    }
}