/*jshint esversion: 6 */

//export the functions
module.exports = {
    getOverallData: getOverallData,
    getAutoSummary: getAutoSummary,
    getPreMatchSummary: getPreMatchSummary,
    getCommentsSummary: getCommentsSummary,
    getDataForLabel: getDataForLabel,
    generateAllStats: generateAllStats
}

//the specifics that can be added to the searches (used by getActionSummary)
const cargoShipExtras = ['Side'];
const rocketHatchExtras = ['Far', 'Close', 'Level 1', 'Level 2', 'Level 3'];
//cargo has no far and close, only levels on the rocket
const rocketCargoExtras = ['Level 1', 'Level 2', 'Level 3'];

//what labels have a complex action summary
var actionSummaryLabels = [];
actionSummaryLabels.push("TeleOp Outer Shots");
actionSummaryLabels.push("TeleOp Inner Shots");
actionSummaryLabels.push("TeleOp Low Shots");
actionSummaryLabels.push("TeleOp Missed Shots");

//pre generate all of the extra action labels
var extraActionSummaryLabels = [];
for (let i = 0; i < actionSummaryLabels.length; i++) {
    let extras = [];
    if (actionSummaryLabels[i].includes("Cargo Ship")) {
        extras = cargoShipExtras;
    } else if (actionSummaryLabels[i].includes("Rocket") && actionSummaryLabels[i].includes("Hatch")) {
        extras = rocketHatchExtras;
    } else if (actionSummaryLabels[i].includes("Rocket") && actionSummaryLabels[i].includes("Cargo")) {
        extras = rocketCargoExtras;
    }

    //add all these to a list, then add the list to the larger one
    let currentExtraActionSummaryLabels = [];

    //go through the extra terms and get the extra summaries if any
    for (let s = 0; s < extras.length; s++ ) {
        currentExtraActionSummaryLabels.push(actionSummaryLabels[i].replace("Full", extras[s]));
    }

    //done, add it to the full list
    extraActionSummaryLabels.push(currentExtraActionSummaryLabels);
}

//ordered list of every robot number
//this will contain a sorted list for each stat
var averageSortedRobotsByStat = [];
//same list but for extra data
var extraAverageSortedRobotsByStat = [];
//for maximums
var maxSortedRobotsByStat = [];
//same list but for extra data
var extraMaxSortedRobotsByStat = [];

function getOverallData(currentRobotNumber, labels, robots) {
    let fullSummary = "";

    for (let i = 0; i < actionSummaryLabels.length; i++) {
        fullSummary += getActionSummary(currentRobotNumber, labels, robots, actionSummaryLabels, averageSortedRobotsByStat, maxSortedRobotsByStat, i);

        fullSummary += "<br/>";
    }

    let deathRateItems = getColumnItems(currentRobotNumber, labels, robots, "died");
    fullSummary += "Death Rate: " + getRateOfItems(deathRateItems) + " | " + getParsedAverageItem(deathRateItems) + "%";
    fullSummary += "<br/>";
    let defenseRateItems = getColumnItems(currentRobotNumber, labels, robots, "defense");
    fullSummary += "Defense Rate: " + getRateOfItems(defenseRateItems) + " | " + getParsedAverageItem(defenseRateItems) + "%";
    fullSummary += "<br/>";
    let tippedRateItems = getColumnItems(currentRobotNumber, labels, robots, "tipped");
    fullSummary += "Tipped Rate: " + getRateOfItems(tippedRateItems) + " | " + getParsedAverageItem(tippedRateItems) + "%";
    fullSummary += "<br/>";

    // let level2ClimbSuccessRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 2", "climbed");
    // fullSummary += "Level 2 Successful Climb Rate: " + getRateOfItems(level2ClimbSuccessRateItems) + " | " + getParsedAverageItem(level2ClimbSuccessRateItems) + "%";
    // fullSummary += "<br/>";
    // let level2ClimbFailRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "level 2", "attempted climb");
    // fullSummary += "Level 2 Climb Fail Rate (in the matches that they attempted): " + getRateOfItems(level2ClimbFailRateItems) + " | " + getParsedAverageItem(level2ClimbFailRateItems) + "%";
    // fullSummary += "<br/>";

    fullSummary += "<br/>";

    let climbSuccessRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "climbed");
    fullSummary += "Successful Climb Rate: " + getRateOfItems(climbSuccessRateItems) + " | " + getParsedAverageItem(climbSuccessRateItems) + "%";
    fullSummary += "<br/>";
    let climbFailRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "attempted climb");
    fullSummary += "Climb Fail Rate (in the matches that they attempted): " + getRateOfItems(climbFailRateItems) + " | " + getParsedAverageItem(climbFailRateItems) + "%";
    fullSummary += "<br/>";
    let carriedRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "got carried");
    fullSummary += "Carried By Robot Rate: " + getRateOfItems(carriedRateItems) + " | " + getParsedAverageItem(carriedRateItems) + "%";
    fullSummary += "<br/>";
    let parkedRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb", "parked");
    fullSummary += "Park Rate: " + getRateOfItems(parkedRateItems) + " | " + getParsedAverageItem(parkedRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    let edgeClimbRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb type", "edge");
    fullSummary += "Edge Climb Rate: " + getRateOfItems(edgeClimbRateItems) + " | " + getParsedAverageItem(edgeClimbRateItems) + "%";
    fullSummary += "<br/>";
    let middleClimbRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb type", "middle");
    fullSummary += "Middle Climb Rate: " + getRateOfItems(middleClimbRateItems) + " | " + getParsedAverageItem(middleClimbRateItems) + "%";
    fullSummary += "<br/>";
    let centerClimbRateItems = getColumnTextItems(currentRobotNumber, labels, robots, "endgame climb type", "center");
    fullSummary += "Center Climb Rate: " + getRateOfItems(centerClimbRateItems) + " | " + getParsedAverageItem(centerClimbRateItems) + "%";
    fullSummary += "<br/>";

    fullSummary += "<br/>";

    let carriedRobotRateItems = getColumnItems(currentRobotNumber, labels, robots, "robots carried");
    let carriedRobotMaxText = getMaxItemsText(labels, robots, carriedRobotRateItems);
    fullSummary += "Carried Another Robot Rate: " + getRateOfItems(carriedRobotRateItems) + " | " + getPercentageRateOfItems(carriedRobotRateItems) + "%" + 
            " | " + carriedRobotMaxText;
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
    //start at index 4 to avoid auto start position
    for (let i = 4; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes("auto")) {
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

//calls the generateStats for normal data and extra data
function generateAllStats(labels, robots) {
    generateStats(labels, robots, actionSummaryLabels, averageSortedRobotsByStat, true);
    generateStats(labels, robots, actionSummaryLabels, maxSortedRobotsByStat, false);

    // //each section of extra data is another array inside the main array
    // for (let i = 0; i < extraActionSummaryLabels.length; i++) {
    //     let averageSortedRobots = [];
    //     let maxSortedRobots = [];

    //     generateStats(labels, robots, extraActionSummaryLabels[i], averageSortedRobots, true);
    //     generateStats(labels, robots, extraActionSummaryLabels[i], maxSortedRobots, false);

    //     extraAverageSortedRobotsByStat.push(averageSortedRobots);
    //     extraMaxSortedRobotsByStat.push(maxSortedRobots);
    // }
}

//will generate the placement statistics for each robot
//Ex. sorted list of top hatch robots, sorted list of top cargo bots
//sortByAverage: true if sorting by average, false if sorting by max
function generateStats(labels, robots, actionSummaryLabels, sortedRobotsByStat, sortByAverage) {
    //the list of statistics to look at
    let statistics = [];
    for (let i = 0; i < actionSummaryLabels.length; i++) {
        statistics.push(actionSummaryLabels[i]);
    }

    for (let i = 0; i < statistics.length; i++) {
        let columnIndex = getColumnIndex(labels, statistics[i]);

        let sortedRobots = [];
        let robotsLeft = Array.from(robots);
        while (robotsLeft.length > 0) {
            //robots performing the best this round
            let bestRobots = [];
            let highestPerformance = -1;

            for (let robotNumber = 0; robotNumber < robotsLeft.length; robotNumber++) {
                let dataPoints = [];
                for (let dataPoint = 1; dataPoint < robotsLeft[robotNumber].data.length; dataPoint++) {
                    //not just an empty line
                    if (robotsLeft[robotNumber].data[dataPoint].length > 1) {
                        dataPoints.push(robotsLeft[robotNumber].data[dataPoint][columnIndex]);
                    }
                }
                let performance = 0;
                if (sortByAverage) {
                    performance = getAverageItem(dataPoints);
                } else {
                    //sort by max otherwise
                    performance = getMaxItems(dataPoints)[0][0];
                }
                let robotIndex = robots.indexOf(robotsLeft[robotNumber]);

                //if it's more, set it to be this robot
                //if it's the same, add this robot to the list (it's a tie)
                if (performance > highestPerformance) {
                    bestRobots = [robotIndex];
                    highestPerformance = performance;
                } else if (performance === highestPerformance) {
                    bestRobots.push(robotIndex);
                }
            }

            //these are the best robots, add them to the list together as they are tied
            sortedRobots.push(bestRobots);

            //remove these robots from robots left
            for (let q = 0; q < bestRobots.length; q++) {
                robotsLeft.splice(robotsLeft.indexOf(robots[bestRobots[q]]), 1);
            }
        }
        sortedRobotsByStat[i] = sortedRobots;
    }
}

function getPositionInSortedList(robots, sortedRobotsByStat, robotNumber, statIndex) {
    let position = 0;

    //find robot index from robot number
    let robotIndex = 0;
    for (let i = 0; i < robots.length; i++) {
        if (robots[i].robotNumber === robotNumber) {
            robotIndex = i;
        }
    }

    for (let i = 0; i < sortedRobotsByStat[statIndex].length; i++) {
        if (!sortedRobotsByStat[statIndex][i].includes(robotIndex)) {
            position += sortedRobotsByStat[statIndex][i].length;
        } else {
            //the robot has been found
            break;
        }
    }

    return position;
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
function getComplexActionSummary(currentRobotNumber, labels, robots, searchTermIndex) {
    let searchTerm = actionSummaryLabels[searchTermIndex];

    let mainSummary = getActionSummary(currentRobotNumber, labels, robots, actionSummaryLabels, averageSortedRobotsByStat, maxSortedRobotsByStat, searchTermIndex);

    //load the more detailed summary, and put it in a hidden box
    let extraSummary = "";

    //go through the extra terms and get the extra summaries if any
    for (let i = 0; i < extraActionSummaryLabels[searchTermIndex].length; i++ ) {
        let extraSearchTerm = extraActionSummaryLabels[searchTermIndex][i];

        extraSummary += "<span class='clickable' onclick=\"extraSummaryClick('" + extraSearchTerm + "')\" >";
        extraSummary += getActionSummary(currentRobotNumber, labels, robots, extraActionSummaryLabels[searchTermIndex], extraAverageSortedRobotsByStat[searchTermIndex], extraMaxSortedRobotsByStat[searchTermIndex], i);
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
function getActionSummary(currentRobotNumber, labels, robots, actionSummaryLabels, averageSortedRobotsByStat, maxSortedRobotsByStat, searchTermIndex) {
    let searchTerm = actionSummaryLabels[searchTermIndex];

    let fullSummary = "";

    //miss and hit to include the successes and failures
    let hitIndex = getColumnIndex(labels, searchTerm.toLowerCase());

    //all the data points for this robot
    let hitItems = [];
    for (let currentRobot = 0; currentRobot < robots.length; currentRobot++) {
        if (robots[currentRobot].robotNumber === currentRobotNumber) {
            //all the matches for this robot
            //starts at 1 to skip the labels
            for (let matchNum = 1; matchNum < robots[currentRobot].data.length; matchNum++) {
                //otherwise it's just a line break at the end of the file
                if (robots[currentRobot].data[matchNum].length > 1) {
                    hitItems.push(robots[currentRobot].data[matchNum][hitIndex]);
                }
            }
        }
    }
    //find average
    let hitAverage = getAverageItem(hitItems);

    fullSummary += searchTerm + " Average " + hitAverage.toFixed(2);

    //add on if they are top for average
    let averageStanding = getPositionInSortedList(robots, averageSortedRobotsByStat, currentRobotNumber, searchTermIndex);
    fullSummary += " | Top " + averageStanding + "<br/>";

    // Get text about maximums and the matches they happened in
    let matchNumbersOfMaximums = getMaxItemsText(labels, robots, hitItems);

    fullSummary += searchTerm + matchNumbersOfMaximums;

    //add on if they are top for max
    let maxStanding = getPositionInSortedList(robots, maxSortedRobotsByStat, currentRobotNumber, searchTermIndex);
    fullSummary += " | Top " + maxStanding + "<br/>";

    //return resulted summary
    return fullSummary;
}

function getColumnIndex(labels, search) {
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes(search.toLowerCase())) {
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

/**
 * Formatted string of what match numbers this max happened in
 * 
 * @param {Array<string>} labels 
 * @param {Array<string>} robots 
 * @param {Array<any>} items 
 * @returns {string}
 */
function getMaxItemsText(labels, robots, items) {
    //get match number index to show what match this happened in
    let matchNumColumn = getColumnIndex(labels, "match");

    let maxItems = getMaxItems(items);

    //string of what match numbers this max happened in
    let matchNumbersOfMaximums = "";
    for (let i = 0; i < maxItems.length; i++) {
        matchNumbersOfMaximums += robots[matchNumColumn].data[maxItems[i][1] + 1][matchNumColumn];

        if (i != maxItems.length - 1) {
            //if it is not the last index
            matchNumbersOfMaximums += ", ";
        }
    }

    if (maxItems[0][0] === "0") {
        //there is no maximum, so it doesn't matter
        //it would just list every match
        matchNumbersOfMaximums = "N/A";
    }

    return " Max " + maxItems[0][0] + " in match " + matchNumbersOfMaximums;
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
        if (!isNaN(items[i])) {
            sum += parseFloat(items[i]);
        } else if (items[i].toLowerCase() === "true") {
            sum += 1;
        }
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
        if (items[i] === "1" || items[i] >= 1) {
            sum++;
        }
    }

    //convert sum to average
    return sum + "/" + items.length;
}

//gets how many times 1 is in items in a percentage
function getPercentageRateOfItems(items) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i] === "1" || items[i] >= 1) {
            sum++;
        }
    }

    //convert sum to average
    return ((sum/items.length) * 100).toFixed(2);
}