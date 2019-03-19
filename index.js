var electron = require('electron');

function showData() {
    //show a quick summary of all the data for this robot\

    var currentRobotNumber = document.getElementById('robotNumber').value;

    var labels = electron.remote.getGlobal('labels');
    var robots = electron.remote.getGlobal('robots');

    //find all the auto collumns
    var autoColumns = [];
    //start at index 5 to avoid auto start position
    for (let i = 5; i < labels.length; i++) {
        if (labels[i].toLowerCase().includes("auto") && !labels[i].toLowerCase().includes("full")) {
            autoColumns.push(i);
        }
    }

    let autoSummary = "";

    for (let i = 0; i < robots.length; i++) {
        if (robots[i].robotNumber === currentRobotNumber) {
            //s = 1 skipping the labels
            for (let s = 1; s < robots[i].data.length; s++) {
                //was there a data point added for this match
                let addedSomething = false;

                for (let autoColumn = 0; autoColumn < autoColumns.length; autoColumn++) {
                    if (robots[i].data[s][autoColumns[autoColumn]] > 0) {
                        let amountOfTimes = robots[i].data[s][autoColumns[autoColumn]];
                        let amountOfTimesText = "";
                        if (amountOfTimes > 1) {
                            amountOfTimesText = amountOfTimes + " times";
                        } else {
                            amountOfTimesText = "once";
                        }

                        autoSummary += labels[autoColumns[autoColumn]] + " " + amountOfTimesText + " in match " + robots[i].data[s][0] + "<br/>";
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