var Markup = (function () {
    class TrainIdentSum {
        constructor() {
            this.closestTime = false;
            this.canceled = false;
            this.isCompensationEligable = false;
            this.tasList = [];
            this.trainIdent = 0;
            this.fromLocation = "";
            this.toLocation = "";
            this.depAdvTime = 0;
            this.arrAdvTime = 0;
            this.lateInfo = "";
            this.stationTable = "";
            this.depTa = {};
        }
    }
    
    const SHOW_DETAILS = "showDetails";
    var showDetails = false;

    function clearCache() {
        localStorage.removeItem(SHOW_DETAILS);
    }

    function updateDetailsButton() {
        console.log("updating text");
        if (showDetails) {
            $("#toggleDetails").text("Hide details");
        } else {
            $("#toggleDetails").text("Show details");
        }
    }
    function toggleDetails() {
        console.log("toggle details was:(" + showDetails + ") should be (" + (!showDetails) + ")");
        setShowDetails(!showDetails);
        console.log("toggle details is now:" + showDetails);
        updateDetailsButton();
    }

    function setup() {
        showDetails = JSON.parse(localStorage.getItem(SHOW_DETAILS));
        if (showDetails === undefined) {
            showDetails = false;
        }
        updateDetailsButton();

    };

    function setShowDetails(show) {
        showDetails = show;
        localStorage.setItem(SHOW_DETAILS, JSON.stringify(showDetails));
    }

    function expandDetails(divId) {
        let div = $("#" + divId);
        console.log("Toggling " + divId + " current:" + div.css("display"));
        if (div.css("display") === "none" || div.css("display") == undefined) {
            console.log("Setting to block");
            div.css("display", "block");
        } else {
            console.log("Setting to none");
            div.css("display", "none");
        }
    }

    function sumarizeTrainIdent(ti, trainIdent, fromLocation, toLocation, stations, dateStr) {
        tiSum = new TrainIdentSum();
        tiSum.dateStr = dateStr;
        tiSum.trainIdent = trainIdent;
        tiSum.fromLocation = fromLocation;
        tiSum.toLocation = toLocation;
        var stationRows = "";
        tas = ti.tas; //<-- list
        //console.log(tas);
        let fromAdvTal="";
        let toAdvTal="";
        let stationsLeft = stations.slice();
        tiSum.tasList = [];
        for (var taid in tas) {
            tiSum.tasList.push(tas[taid]);
        }
        tiSum.tasList.sort((a,b) => {
            let diff = new Date(a["AdvertisedTimeAtLocation"]) - new Date(b["AdvertisedTimeAtLocation"]);
            return diff;
        });
        var canceled = null;

        for (var i = 0; i < tiSum.tasList.length; i++) {
            ta = tiSum.tasList[i];

            //tiSum.trainIdent = ta["AdvertisedTrainIdent"];

            let advertisedTimeAtLocation = ta["AdvertisedTimeAtLocation"].replace(/^.*T/, "");
            let advTime = ta["ActivityType"] + " " + advertisedTimeAtLocation;
            let locSig = ta["LocationSignature"];
            let day = ta["AdvertisedTimeAtLocation"].replace(/T.*$/, "");
            let activityId = ta["ActivityId"];
            let activityType = ta["ActivityType"];
            let trainId = ta["AdvertisedTrainIdent"];
            for (fli in ta["FromLocation"]) {
                fl = ta["FromLocation"][fli];
                locName = fl["LocationName"];
                order = fl["Order"];
                priority = fl["Priority"];
                // console.log("From loc " + locName + " priority:" + priority + " order:" + order);
                //fromLoc+=locName + ",";
                //fromLoc=locName;
            };
            for (fli in ta["ToLocation"]) {
                fl = ta["ToLocation"][fli];
                locName = fl["LocationName"];
                order = fl["Order"];
                priority = fl["Priority"];
                // console.log("To loc " + locName + " priority:" + priority + " order:" + order);
                //toLoc+=locName + ",";
                //toLoc=locName;
            };

            
            timeAtLocation=undefined;
            estimatedTimeAtLocation=undefined;
            // ta["EstimatedTimeAtLocation"] = "" + ta["TimeAtLocation"];
            // delete ta["TimeAtLocation"];
            if ("TimeAtLocation" in ta) {
                timeAtLocation = ta["TimeAtLocation"];
                timeAtLocation = timeAtLocation.replace(/^.*T/, "");
            }
            //console.log(ta);
            if ("EstimatedTimeAtLocation" in ta) {
                estimatedTimeAtLocation = ta["EstimatedTimeAtLocation"];
                estimatedTimeAtLocation = estimatedTimeAtLocation.replace(/^.*T/, "");
            }
            if ("Canceled" in ta) {
                // console.log("Canceled: (" + ta["Canceled"] + ")");
                tiSum.canceled = ta["Canceled"];
                // console.log("Canceled truth:" + (canceled ? "YES" : "NO"));
            }
            trackAtLocation = "N/A";
            if ("TrackAtLocation" in ta) {
                trackAtLocation = ta["TrackAtLocation"];
            }

            information = "";
            if ("OtherInformation" in ta) {
                information = ta["OtherInformation"].join(". ");
            }
            // console.log("locSig " + locSig + " from:" + fromStation + " to " + toStation);
            if (locSig === tiSum.fromLocation && ta["ActivityType"] === "Avgang") {
                // console.log("Found from station!");
                tiSum.depAdvTime = advertisedTimeAtLocation;
                tiSum.depTa = ta;
                if (timeAtLocation === undefined) {
                    depTimeAtLocation="N/A";
                } else {
                    depTimeAtLocation = timeAtLocation;
                }
                fromAdvTal = new Date(ta["AdvertisedTimeAtLocation"]);
                TestAndRemoveStation(stationsLeft, locSig);
            }
            if (locSig === tiSum.toLocation && ta["ActivityType"] === "Ankomst") {
                // console.log("Found to station!");
                tiSum.arrAdvTime = advertisedTimeAtLocation;

                if (timeAtLocation === undefined) {
                    if (estimatedTimeAtLocation === undefined) {
                        arrTimeAtLocation="N/A";
                    } else {
                        arrTimeAtLocation=estimatedTimeAtLocation;
                    }
                } else {
                    arrTimeAtLocation = timeAtLocation;
                }
                    
                toAdvTal = new Date(ta["AdvertisedTimeAtLocation"]);
                TestAndRemoveStation(stationsLeft, locSig);
            }
            if (tiSum.canceled != null && tiSum.canceled === true) {
                timeOrCanceled = "Inställt";
            } else {
                if (timeAtLocation === undefined) {
                    if (estimatedTimeAtLocation === undefined) {
                        timeOrCanceled = "N/A";
                    } else {
                        timeOrCanceled = "Estimated: " + estimatedTimeAtLocation;
                    }
                } else {
                    timeOrCanceled = timeAtLocation;
                }
            }
            stationRows += printStationRow(locSig, advTime, timeOrCanceled, trackAtLocation, information, day, activityType, trainId, activityId);
        }
        if (stationsLeft.length > 0) {
            // console.log("Ignoring from and to stations are not included " + ta["AdvertisedTimeAtLocation"] + "," + ta["FromLocation"][0]["LocationName"] + " -> " +  ta["ToLocation"][0]["LocationName"])
            // console.log(stationsLeft);  
            return undefined;
        }

        // console.log("Dates of things:");
        // console.log(fromAdvTal);
        // console.log(toAdvTal);
        if (toAdvTal < fromAdvTal) {
            // console.log("toAdertisedTimeAtLocation is before fromAdvertisedTimeAtLocation " + ta["AdvertisedTimeAtLocation"] + "," + ta["FromLocation"][0]["LocationName"] + " -> " +  ta["ToLocation"][0]["LocationName"])
            return undefined;
        }
        // console.log("correct order!")
        //

        tiSum.isLate = false;
        tiSum.isCompensationEligable = false;
        tiSum.stationTable = printStationTable(stationRows);
        tiSum.lateInfo = "";
        if (tiSum.canceled) {
            tiSum.lateInfo="<strong>Inställt</strong>";
        } else if ("TimeAtLocation" in ta) {
            // console.log("arrTimeAtLocation:" + arrTimeAtLocation);
            // console.log("arrAdvTime:" + arrAdvTime);
            arrTalDt = new Date(ta["TimeAtLocation"]);
            advDt = new Date(ta["AdvertisedTimeAtLocation"]);
            let msDiff = arrTalDt - advDt;
            let minutesDiff = msDiff / 1000 / 60;
            tiSum.lateInfo=`Anlände:${timeAtLocation} `
            if (minutesDiff >= 1) {
                tiSum.lateInfo += ` <strong>${minutesDiff}min försenad</strong>`;
                tiSum.isLate = true;
            }
            if (minutesDiff >= 20) {
                tiSum.isCompensationEligable = true;
            }
        } else if ("EstimatedTimeAtLocation" in ta) {
            // console.log("arrTimeAtLocation:" + arrTimeAtLocation);
            // console.log("arrAdvTime:" + arrAdvTime);
            arrTalDt = new Date(ta["EstimatedTimeAtLocation"]);
            advDt = new Date(ta["AdvertisedTimeAtLocation"]);
            let msDiff = arrTalDt - advDt;
            let minutesDiff = msDiff / 1000 / 60;
            tiSum.lateInfo=`Beräknad ankomst: ${estimatedTimeAtLocation} `
            if (minutesDiff >= 1) {
                tiSum.lateInfo += ` <strong>${minutesDiff}min försend</strong>`;
                tiSum.isLate = true;
            }
            if (minutesDiff >= 20) {
                tiSum.isCompensationEligable = true;
            }
        } else {
            if ("TimeAtLocation" in tiSum.depTa) {
                depTime = new Date(tiSum.depTa["TimeAtLocation"]);
                advDepTime = new Date(tiSum.depTa["AdvertisedTimeAtLocation"]);
                let msDiff = depTime - advDepTime;
                let minutesDiff = msDiff / 1000 / 60;
                
                if (minutesDiff > 0) {
                    tiSum.lateInfo = "Avgick " + minutesDiff + " minuter för sent";    
                } else if (minutesDiff < 0) {
                    tiSum.lateInfo = "Avgick " + (-minutesDiff) + " minuter för tidigt";    
                } else {
                    tiSum.lateInfo = "Avgick i tid";    
                }
                
            }
        }
        return tiSum;
    }


    function testIsWithinTime() {
        //Inside
        if (!isWithinTime("15:00", "14:00", "16:00")) console.error("Test fail");
        if (!isWithinTime("15:33", "15:00", "16:00")) console.error( "Test fail");
        if (!isWithinTime("15:00", "15:00", "16:00")) console.error( "Test fail");

        if (isWithinTime("15:00", "16:00", "16:00")) console.error( "Test fail");
        if (isWithinTime("14:00", "15:00", "16:00")) console.error( "Test fail");
        if (isWithinTime("15:00", "15:01", "16:00")) console.error( "Test fail");
        if (isWithinTime("16:01", "14:00", "16:00")) console.error( "Test fail");

        //Before
        if (!isWithinTime("23:00", "22:00", "03:00")) console.error( "Test fail");
        if (!isWithinTime("01:00", "22:00", "03:00")) console.error( "Test fail");
        if (!isWithinTime("09:23", "23:00", "10:00")) console.error( "Test fail");
        if (!isWithinTime("22:59", "22:59", "00:00")) console.error( "Test fail");
        if (!isWithinTime("00:00", "23:59", "00:00")) console.error( "Test fail");

        if (isWithinTime("20:00", "22:00", "03:00")) console.error( "Test fail");
        if (isWithinTime("23:00", "23:01", "10:00")) console.error( "Test fail");
        if (isWithinTime("22:58", "22:59", "00:00")) console.error( "Test fail");
        if (isWithinTime("00:01", "23:59", "00:00")) console.error( "Test fail");

        if (!isWithinTime("05:23", "05:23", "05:23")) console.error( "Test fail");
    }

    //Args are string on the format HH:mm
    function isWithinTime(advTime, startTime, endTime) {
        ah = parseInt(advTime.replace(/:.*/,""));
        am = parseInt(advTime.replace(/.*:/,""));
        sh = parseInt(startTime.replace(/:.*/,""));
        sm = parseInt(startTime.replace(/.*:/,""));
        eh = parseInt(endTime.replace(/:.*/,""));
        em = parseInt(endTime.replace(/.*:/,""));

        a = ah*60 + am;
        s = sh*60 + sm;
        e = eh*60 + em;

        if (s <= e) {
            invertAnswer = false;
        } else {
            //Start time is after end time
            invertAnswer = true;
            let tmp = e;
            e = s;
            s = tmp;
        }

        if (a == s || a == e) {
            return true;
        }
        let insideTest = a >= s && a <= e;
        return invertAnswer ? !insideTest : insideTest;
    }

    function printToHtml() {
        $("#printHtmlStatus").text("Printing html");
        var trainIdFilter = $("#taFilterTrainId").val();
        let searchNow = $("#searchNow").prop("checked");
        let searchByDate = $("#searchByDate").prop("checked");
        var startDateFilter;
        var endDateFilter;
        if (searchByDate) {
            startDateFilter = $("#taFilterStartDate").val();
            endDateFilter = $("#taFilterEndDate").val();
        } else if (searchNow) {
            // var today = new Date();
            // var dd = ("" + today.getDate()).padStart(2, "0");
            // var mm = ("" + (today.getMonth()+1)).padStart(2, "0");
            // var yyyy = today.getFullYear();
            // startDateFilter = `${yyyy}-${mm}-${dd}`;
            // endDateFilter = startDateFilter;
            startDateFilter = "";
            endDateFilter = "";
        
        }
        var startTime = $("#taFilterStartTime").val();
        var endTime = $("#taFilterEndTime").val();
        var timeAgeMin = Search.getTimeMin();
        var timeAgeMax = Search.getTimeMax();

        //console.log("Printintg to html start:" + startTime + " to " + endTime);
        var useStationFilter = $("#taUseStationFilter").is(":checked");
        var showOnlyLateTrains = $("#taOnlyLateTrains").is(":checked");

        console.log("Train id filter:" + trainIdFilter);
        console.log("Using station filter:" + useStationFilter);
        if (trainIdFilter == "") trainIdFilter = null;
        if (startDateFilter == "") {
            startDateFilter = null;
        } else {
            startDateFilter = new Date(startDateFilter);
        }
        if (endDateFilter == "") {
            endDateFilter = null;
        } else {
            endDateFilter = new Date(endDateFilter);
        }

        console.log(trainIdFilter == null ? "No id filter" : "Id filter on " + trainIdFilter);
        console.log(startDateFilter == null ? "No start date filter" : "Start date filter on " + startDateFilter);
        if (endDateFilter == null && startDateFilter != null) {
            endDateFilter = startDateFilter;
        }
        console.log(endDateFilter == null ? "No end date filter" : "End date filter on " + endDateFilter);
    
        var fromLocation = $("#fromStation").val();
        var toLocation = $("#toStation").val();
        Params.updateUrl();

        var stations;
        if (useStationFilter) {
            stations=[fromLocation, toLocation];
        } else {
            stations = [];
        }

        let now = new Date();
        trainRowsArr = [];
        let totTasShown = 0;
        for (dateStr in allDates) {
            // console.log("d is " + dateStr);
            date = new Date(dateStr);
            trainIdents = allDates[dateStr];
            if (startDateFilter != null) {
                // console.log("Start date filter:");
                // console.log(startDateFilter);
                // console.log("End date filter:");
                // console.log(endDateFilter);
                var inside = (date <= endDateFilter && date >= startDateFilter);
                // console.log(inside ? "Inside" : "Outside");
                if (!inside) {
                    // console.log("Skipping due to filter date " + d);
                    continue;
                }
            }
            for (trainIdent in trainIdents) {
                if (trainIdFilter != null && trainIdent !== trainIdFilter) {
                    // console.log("Skipping due to filter trainId " + trainIdent);
                    continue;
                }
        
                tiSum = sumarizeTrainIdent(trainIdents[trainIdent], trainIdent, fromLocation, toLocation, stations, dateStr);
                if (tiSum === undefined) {
                    continue;
                }

                if (showOnlyLateTrains) {
                    if (!tiSum.canceled && !tiSum.isCompensationEligable) {
                        continue;
                    }
                }

                if (timeAgeMax != undefined && timeAgeMin != undefined) {
                    ds = tiSum.dateStr.split("-");
                    dadv = tiSum.depAdvTime.split(":");
                    depTime = new Date(ds[0], ds[1]-1, ds[2], dadv[0], dadv[1], dadv[2]);
                    dateDiffM = (now.getTime() - depTime.getTime()) / (60*1000);

                    //console.log("dateDiffM:" + dateDiffM + " ageMin:" + timeAgeMin + " ageMax:" + timeAgeMax);
                    if (dateDiffM < timeAgeMin || dateDiffM > timeAgeMax) {
                        continue;
                    }
                    //tiSum.dateStr = tiSum.dateStr + "(Now:" + dateDiffM + ")";
    
                }

                if (startTime != "" && endTime != "") {
                    let advTal = tiSum.depTa["AdvertisedTimeAtLocation"];
                    let advTime = advTal.replace(/.*T/, "").replace(/:\d\d$/, "");
                    console.log("Advertised tal:" + advTime);
                    console.log("Start time is " + startTime);
                    console.log("End time is " + endTime);
                    if (!isWithinTime(advTime, startTime, endTime)) {
                        continue;
                    }
                }

                totTasShown += tiSum.tasList.length;

                trainRowsArr.push({
                    depTa: tiSum.depTa,
                    trainRow:printTrainRow(tiSum.dateStr, tiSum.trainIdent, tiSum.fromLocation, tiSum.toLocation, `${tiSum.depAdvTime} - ${tiSum.arrAdvTime}`, `${tiSum.lateInfo}`, tiSum.stationTable)
                });
            }
        }

        trainRows = "";
        console.log("len:" + trainRowsArr.length);

        trainRowsArr.sort(function(trainRow1, trainRow2){
            depTa1 = trainRow1.depTa;
            depTa2 = trainRow2.depTa;
            ta1Date = new Date(depTa1["AdvertisedTimeAtLocation"])
            ta2Date = new Date(depTa2["AdvertisedTimeAtLocation"])
            return ta1Date - ta2Date;
        }); 

        let min = undefined;
        let ct = new Date().getTime();
        let record = undefined;
        for (var t = 0; t < trainRowsArr.length; t++) {
            trainRowEl = trainRowsArr[t];
            let at = new Date(trainRowEl.depTa["AdvertisedTimeAtLocation"]).getTime();
            let timeDiff = ct - at;
            if (min == undefined || ((timeDiff >= 0 && min < 0) || (min < 0 && timeDiff < 0 && timeDiff > min) || (timeDiff <= min && min >= 0 && timeDiff >= 0))) {
                min = timeDiff;
                record = trainRowEl;
            }
            trainRowEl.timeDiff = timeDiff;
            
        }
        if (record != undefined) {
            //console.log("Setting closest record!", record.timeDiff);
            record.closestTime = true;
        }

        let lastDate = undefined;
        for (var t = 0; t < trainRowsArr.length; t++) {
            trainRowEl = trainRowsArr[t];
            let depTa = trainRowEl.depTa;
            let taDay = depTa["AdvertisedTimeAtLocation"].replace(/T.*$/, "");
            let taDate = new Date(taDay);
            let day;
            switch (taDate.getDay()) {
                case 0: day = "Söndag"; break;
                case 1: day = "Måndag"; break;
                case 2: day = "Tisdag"; break;
                case 3: day = "Onsdag"; break;
                case 4: day = "Torsdag"; break;
                case 5: day = "Fredag"; break;
                case 6: day = "Lördag"; break;
            }
            if (lastDate === undefined || lastDate != taDay){
                lastDate = taDay;
                trainRows += "<tr><th colspan=7><h3>" + taDay + ", " + day + "</h3></th></tr>";
            }
            trainRowEl = trainRowsArr[t];
            trainRows += "<tr " + (trainRowEl.closestTime ? "id='nowPost'" : "")+ ">" + 
                //"<td>" + trainRowEl.timeDiff + "</td>" +
                trainRowEl.trainRow + "</tr>";
            //trainRows += trainRowEl.trainRow;
        }

    
        // stationRows += printStationRow("Cst", "12:00", "12:10", "5", "All infoz");
        // stationRows += printStationRow("Mä", "13:00", "14:10", "5", "All infoz");
        // var stationTable = printStationTable(stationRows);
    
        // trainRows += printTrainRow("2018-03-02", "820", "Cst", "U", "08:20", stationTable);
        $("#tas").html(trainRows);
        $("#printHtmlStatus").text(`Showing ${totTasShown} of ${totTas} TrainAnnouncements`);
    }
    
    
    
    function printTrainRow(date, trainId, fromStation, toStation, schedDepTime, lateInfo, stationTable) {
        let buttonTag = '<button onclick=\'Markup.expandDetails("' + "details_" + date + "_" + trainId + '")\' >Visa stationer</button>';
        if (showDetails) {
            startTag = '<div id="' + "details_" + date + "_" + trainId + '" style="display: block;">';
        } else {
            startTag = '<div id="' + "details_" + date + "_" + trainId + '" style="display: none;">';
        }
        return "<th scope=\"row\">" + date + "</th>" +
              "<td>" + trainId + "</td>" +
              "<td>" + Stations.lookupStationName(fromStation) + "</td>" +
              "<td>" + Stations.lookupStationName(toStation) + "</td>" +
              "<td>" + schedDepTime + "</td>" +
              "<td>" + lateInfo + "</td>" +
              "<td>" + buttonTag + "</td>" +
            "</tr>" +
            "<tr>" +
                "<td style='padding:1px' colspan=7>" + startTag + stationTable + "</div></td>";
            //"</tr>"
            
            
    }
    
    function printStationTable(stationRows) {
        return `
            <table class="table table-striped stationInfo">
                <thead class="thead-light">
                    <tr>
                        <th scope="col">StationName</th>
                        <th scope="col">Tidtabellstid</th>
                        <th scope="col">Faktisk tid</th>
                        <th scope="col">Track</th>
                        <th scope="col">Information</th>
                        <th scope="col">Train announcement json</th>
                    </tr>
                </thead>
                <tbody>` + stationRows + `
                </tbody>
            </table>
        `;
    }
    
    function printStationRow(locSig, advertisedTimeAtLocation, timeAtLocation, track, info, day, activityType, trainId, activityId) {

        return `<tr><th scope="row">` + Stations.lookupStationName(locSig) + `</th>
                <td>` + advertisedTimeAtLocation + `</td>
                <td>` + timeAtLocation+ `</td>
                <td>` + track + `</td>
                <td>` + info + `</td>
                <td><a target="_blank" href="tas/${day}/${activityType}_${locSig}/tas/train${trainId}_${activityId}">Open base ta-file</a><br/>
                <a target="_blank" href="showTaData.html?day=${day}&activityType=${activityType}&locSig=${locSig}&trainId=${trainId}&activityId=${activityId}">Show ta-data</a></td>
                <tr>`;
    }
    
    function TestAndRemoveStation(stationsLeft, locSig) {
        stationLeftIdx = stationsLeft.indexOf(locSig);
        // console.log("Testing for removal: " + locSig );
        // console.log("Stations needed to be found:" + stationsLeft.join(","))
        if (stationLeftIdx > -1) {
            let removed = stationsLeft[stationLeftIdx];
            stationsLeft.splice(stationLeftIdx, 1);
            // console.log("Removed found station " + removed + ". Now remains:" + stationsLeft.join(","))
    
        }
    }

    function activateSearchByDate() {
        $("#searchNow").prop("checked", false);
        $("#searchByDate").prop("checked", true);
    }
    /* ========== Explort public methods ============*/

    setup();
    testIsWithinTime();
    return {
        printToHtml: printToHtml,
        toggleDetails: toggleDetails,
        clearCache: clearCache,
        expandDetails: expandDetails,
        activateSearchByDate: activateSearchByDate,
    };

})();

$(function () {
    $("#taFilterStartDate").bind("focus", Markup.activateSearchByDate);
    $("#taFilterEndDate").bind("focus", Markup.activateSearchByDate);
    $("#toggleDetails").bind("click", Markup.toggleDetails);
    ml="mailto:" +
        ["asdavvs.se".substr(2),"g" + "hotmail".substr(3)].join("@")
        $("#contkt").attr("href", ml + ".com");
})