/*jshint esversion: 6 */

//export the functions
module.exports = {
    getOverallData: getOverallData,
    getAutoSummary: getAutoSummary,
    getPreMatchSummary: getPreMatchSummary,
    getCommentsSummary: getCommentsSummary,
    getDataForLabel: getDataForLabel
}

//the specifics that can be added to the searches (used by getActionSummary)
const cargoShipExtras = ['Side'];
const rocketHatchExtras = ['Far', 'Close', 'Level 1', 'Level 2', 'Level 3'];
//cargo has no far and close, only levels on the rocket
const rocketCargoExtras = ['Level 1', 'Level 2', 'Level 3'];

function getOverallData(currentRobotNumber, labels, robots) {
    let fullSummary = "";

    fullSummary += getComplexActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Rocket Cargo");

    fullSummary += "<br/>";

    fullSummary += getComplexActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Cargo Ship Cargo");

    fullSummary += "<br/>";

    fullSummary += getComplexActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Rocket Hatch");

    fullSummary += "<br/>";

    fullSummary += getComplexActionSummary(currentRobotNumber, labels, robots, "TeleOp Full Cargo Ship Hatch");

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

    return fullSummary;
}

function getAutoSummary(currentRobotNumber, labels, robots) {
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

    return autoSummary;
}

function getPreMatchSummary(currentRobotNumber, labels, robots) {
    let fullSummary = "";

    //show if they start with cargo or hatch
    let startingWithCargoRateItems = getColumnItems(currentRobotNumber, labels, robots, "starting objects cargo");
    fullSummary += "Starting With Cargo: " + getRateOfItems(startingWithCargoRateItems) + " | " + getParsedAverageItem(startingWithCargoRateItems) + "%";
    fullSummary += "<br/>";
    let startingWithHatchRateItems = getColumnItems(currentRobotNumber, labels, robots, "starting objects hatch");
    fullSummary += "Starting With Hatch: " + getRateOfItems(startingWithHatchRateItems) + " | " + getParsedAverageItem(startingWithHatchRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    //starting platform
    let level1StartRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "auto start platform", "level 1 (hab)");
    fullSummary += "Starting On Level 1 (HAB): " + getRateOfItems(level1StartRateItems) + " | " + getParsedAverageItem(level1StartRateItems) + "%";
    fullSummary += "<br/>";
    let level2StartRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "auto start platform", "level 2");
    fullSummary += "Starting On Level 2: " + getRateOfItems(level2StartRateItems) + " | " + getParsedAverageItem(level2StartRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    //starting position
    let rightStartRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "auto start location", "right");
    fullSummary += "Starting On The Right: " + getRateOfItems(rightStartRateItems) + " | " + getParsedAverageItem(rightStartRateItems) + "%";
    fullSummary += "<br/>";
    let centerStartRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "auto start location", "center");
    fullSummary += "Starting In The Center: " + getRateOfItems(centerStartRateItems) + " | " + getParsedAverageItem(centerStartRateItems) + "%";
    fullSummary += "<br/>";
    let leftStartRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "auto start location", "left");
    fullSummary += "Starting On The Left: " + getRateOfItems(leftStartRateItems) + " | " + getParsedAverageItem(leftStartRateItems) + "%";

    return fullSummary;
}

function getCommentsSummary(currentRobotNumber, labels, robots) {
    //will always be 0
    let matchNumColumn = 0;
    let commentColumn = getColumnIndex(labels, 'qualitative comments');
    let nameColumn = getColumnIndex(labels, 'scout name');

    let fullSummary = "";

    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //only if there is a comment
                //second check is in case it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum][commentColumn] != "" && robots[currentRobot].data[matchNum].length > 1) {
                    let parsedComment = robots[currentRobot].data[matchNum][commentColumn];

                    //replace all placeholder values with their real values
                    parsedComment = parsedComment.replaceAll("||", "|").replaceAll("|n", "<br/>").replaceAll("|q", '"').replaceAll(";", ":")
                        .replaceAll("|ob", "{").replaceAll("|cb", "}").replaceAll("|c", ",");
                    
                    fullSummary += "<p>" + parsedComment;
                    fullSummary += "<span class='extraInfo'> <br/>";
                    fullSummary += "Match " + robots[currentRobot].data[matchNum][matchNumColumn] + " By " + robots[currentRobot].data[matchNum][nameColumn];
                    fullSummary += "<br/> </div class='extraInfo'> </p>";
                }
            }
        }
    }

    return fullSummary;
}

function getDataForLabel(currentRobotNumber, labels, robots, searchTerm) {
    return getColumnRawItems(currentRobotNumber, labels, robots, searchTerm);
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

//find the amount of times a certain string has been saved in a column in a percentage
//Ex. percentage of time starting at level 2
//only if the first search term is true
//Ex. First column: "level 2"
function getColumnTextItems(currentRobotNumber, labels, robots, collumnTerm, rowSearch) {
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
                    if (robots[currentRobot].data[matchNum][column].toLowerCase() === rowSearch) {
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
//doesn't convert booleans to 0s and 1s
function getColumnRawItems(currentRobotNumber, labels, robots, searchTerm) {
    let column = getColumnIndex(labels, searchTerm);
    let items = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    items.push(robots[currentRobot].data[matchNum][column]);
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

//uses getActionSummary to get a simple action summary along with more complicated
//summary details when clicked
//returns a string
function getComplexActionSummary(currentRobotNumber, labels, robots, searchTerm) {
    let mainSummary = getActionSummary(currentRobotNumber, labels, robots, searchTerm);

    //load the more detailed summary, and put it in a hidden box
    let extraSummary = "";
    let extras = [];
    if (searchTerm.includes("Cargo Ship")) {
        extras = cargoShipExtras;
    } else if (searchTerm.includes("Rocket") && searchTerm.includes("Hatch")) {
        extras = rocketHatchExtras;
    } else if (searchTerm.includes("Rocket") && searchTerm.includes("Cargo")) {
        extras = rocketCargoExtras;
    }

    //go through the extra terms and get the extra summaries if any
    for (let i = 0; i < extras.length; i++ ) {
        let extraSearchTerm = searchTerm.replace("Full", extras[i]);

        extraSummary += "<span class='clickable' onclick=\"extraSummaryClick('" + extraSearchTerm + "')\" >";
        extraSummary += getActionSummary(currentRobotNumber, labels, robots, extraSearchTerm);
        extraSummary += "</span>";
    }

    let fullSummary = "";

    fullSummary += "<span class='clickable' id='" + searchTerm + "' onclick='toggleBox(\"extraSummary_" + searchTerm + "\")'>";
    fullSummary += mainSummary;
    fullSummary += "</span>";

    //add extra summary info
    //start it disabled by hiding in the style
    fullSummary += "<div class='extraSummary' id='extraSummary_" + searchTerm + "') style='display: none;'>";
    fullSummary += extraSummary;
    fullSummary += "</div>";

    return fullSummary;
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

    //the miss amount in ONLY the matches where the maximum amount of items were places
    let maxMissItems = [];
    for (let i = 0; i < hitMaxItems.length; i++) {
        maxMissItems.push(missItems[hitMaxItems[i][1]]);
    }
    //it will find the minimum misses in the matches where they scored the most (the best performance)
    let missMinItems = getMinItems(maxMissItems);

    //get match number index to show what match this happened in
    let matchNumColumn = getColumnIndex(labels, "match");

    //string of what match numbers this max happened in
    let matchNumbersOfMaximums = "";
    for (let i = 0; i < hitMaxItems.length; i++) {
        matchNumbersOfMaximums += robots[matchNumColumn].data[hitMaxItems[i][1]][matchNumColumn];

        if (i != hitMaxItems.length - 1) {
            //if it is not the last index
            matchNumbersOfMaximums += ", ";
        }
    }

    if (hitMaxItems[0][0] === "0") {
        //there is no maximum, so it doesn't matter
        //it would just list every match
        matchNumbersOfMaximums = "N/A";
    }

    fullSummary += searchTerm + " Max " + hitMaxItems[0][0] + " : " + missMinItems[0] + " in match " + matchNumbersOfMaximums + "<br/>";

    //return resulted summary
    return fullSummary;
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
    //second item is the match index
    let allMaxItems = [[-1, 0]];
    for (let i = 0; i < items.length; i++) {
        if (parseInt(items[i]) >= parseInt(allMaxItems[0][0])) {
            if (items[i] === allMaxItems[0][0]) {
                //already exists, multiple maximum items
                allMaxItems.push([items[i], i]);
            } else {
                //set this as the maximum
                allMaxItems = [[items[i], i]];
            }
        }
    }
 
    return allMaxItems;
}

function getMinItems(items) {
    //there might be multiple items that are the minimum
    let allMinItems = [-1];
    for (let i = 0; i < items.length; i++) {
        if (parseInt(items[i]) <= parseInt(allMinItems[0]) || allMinItems[0] == -1) {
            if (items[i] == allMinItems[0]) {
                //already exists, multiple minimum items
                allMinItems.push(items[i]);
            } else {
                //set this as the minimum
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
            sum++;
        }
    }

    //convert sum to average
    return sum + "/" + items.length;
}