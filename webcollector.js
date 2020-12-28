

if (typeof process !== 'undefined' && process.release.name === 'node') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

// var request = require('request');
//var firebaseWriter = require('./firebaseWriter.js')
// module.exports = {
//     collect,
// }

apiKey='N/A'
url='https://api.trafikinfo.trafikverket.se/v1.2/data.json';

var database;

class TrainInfo {
    constructor() {
        this.tas = {};
    }
}

var allDates = {};
var totTas = 0;

$(function() {
    console.log( "ready!" );

    var today = new Date();
    var dd = ("" + today.getDate()).padStart(2, "0");
    var mm = ("" + (today.getMonth()+1)).padStart(2, "0");
    var yyyy = today.getFullYear();
    $("#taFilterStartDate").val(`${yyyy}-${mm}-${dd}`);
    $("#taFilterEndDate").val(`${yyyy}-${mm}-${dd}`);
    $("#collectGithub").bind('click', () => { collectGithubByDateButton(() => {}); });
    // Need new apiKey for this:
    // $("#collectWeb").bind('click', () => { collectWebButton(() => {}); });


    $("#printHtml").bind("click", Markup.printToHtml);

});

// getGithubTas("2018-03-19", "Ankomst", "Cst", (allTas) => {
//     console.log("Number of tas:" + allTas.length);
// });


function collectWebButton(doneCallback) {
    $("#collectWebStatus").text("Working...");
    var fromStation = $("#fromStation").val();
    var toStation = $("#toStation").val();
    Stations.bumpRecent(toStation);
    Stations.bumpRecent(fromStation);
	console.log("Collecting from %o to %o", fromStation, toStation);

    var confRuns = [
        { "stationCode": fromStation, "isAnkomst": false },
        { "stationCode": toStation, "isAnkomst": true },
//        { "stationCode": fromStation, "isAnkomst": true },
//        { "stationCode": toStation, "isAnkomst": false },
    ];

	collectWeb(confRuns, (collectedTot, taReqGroups) => {
        var totCount = 0;
        // console.log("Collected webs");
        // console.log(taReqGroups);
        var summaryStns = "";
        var sep = "";
        for (var stationCode in taReqGroups) {
            // console.log("in taReqGroup:" + stationCode);
            let c = taReqGroups[stationCode].length;
            totCount += c;
            // console.log(taReqGroups[stationCode]);
            summaryStns += sep + stationCode + ":" + c;
            sep = ", "
        }

        $("#collectWebStatus").text("Collected " + totCount + " from " + collectedTot + " stations: " + summaryStns);
        updatesTaSummary();
        doneCallback();
    });
}

function updatesTaSummary() {
    let numberOfDays = 0;
    let totNumberOfTrains = 0;
    let totNumberOfTas = 0;
    for (d in allDates){
        numberOfDays ++;
        date = allDates[d];
        let numberOfTrains = 0;
        let dayNumberOfTas = 0;
        for (ti in date) {
            numberOfTrains ++;
            totNumberOfTrains ++;
            let trainInfo = date[ti];
            let trainNumberOfTas = 0;
            for (taid in trainInfo.tas) {
                ta = trainInfo.tas[taid];
                totNumberOfTas ++;
                trainNumberOfTas ++;
                dayNumberOfTas ++;
                // console.log(ta);
            }
            // console.log("new train with " + trainNumberOfTas + " tas");
        }
        console.log("new day:" + d + " with " + numberOfTrains + " trains and " + dayNumberOfTas + " tas");
    }
    totTas = totNumberOfTas;

    $("#taSummary").text(totNumberOfTas + " train annoucements in " + totNumberOfTrains + " trains over " + numberOfDays + " days");
}


function collectWeb(confRuns, onFinish) {
    var collected = 0;
    var taReqGroups = {};
    var done;
    for (let cid in confRuns) {
        let isAnkomst = confRuns[cid]["isAnkomst"];
        let ankomstAvgang = (isAnkomst ? "Ankomst" : "Avgång");
        let stationCode = confRuns[cid]["stationCode"];
        console.log("will check " + stationCode + " " + ankomstAvgang);
        done = false;
        getTas(isAnkomst, stationCode, (tas) => {
            collected ++;
            taReqGroups[ankomstAvgang + "_" + stationCode] = tas;
            // console.log(taReqGroups);
            // console.log("Collected " + tas.length + " from " + stationCode + ankomstAvgang);
            if (collected == confRuns.length) {
                // console.log("All " + collected + " done!");
                // console.log(taReqGroups);
                onFinish(collected, taReqGroups);
            }
        });
    }
}

function getTas(isAnkomst, stationCode, onFinish) {
    //body=getAllStations()
    var postBody;
    // fromTimeDiff = "$DateAdd(-5:00:00)";
    fromTimeDiff = "$DateAdd(-06:00:00)";
    toTimeDiff = "$DateAdd(06:00:00)";

    if (isAnkomst) {    
        postBody=getAnkomstBody(stationCode, fromTimeDiff, toTimeDiff);
        console.log("ankomst " + stationCode);
    } else {
        postBody=getAvgangBody(stationCode, fromTimeDiff, toTimeDiff);
        console.log("avgang " + stationCode);
    }

    httpRequestAsync("POST", 'https://api.trafikinfo.trafikverket.se/v1.2/data.json',
        function (data) {
			json = JSON.parse(data);
			tas = json.RESPONSE.RESULT[0].TrainAnnouncement;
			consumeTas(tas);
            onFinish(tas);
    	}, function (statusCode, data) {
            console.error("Request failed code:" + statusCode + "\n" + data);
        },
        postBody
    );

}

function collectGithubByDateFormButton(onFinished) {
    var fromStation = $("#fromStation").val();
    var toStation = $("#toStation").val();
	console.log("Collecting from %o to %o", fromStation, toStation);

    let startDateStr = $("#taFilterStartDate").val();
    let endDateStr = $("#taFilterEndDate").val();
    if (startDateStr == null) {
        console.log("No start date specified!");
        return;
    }
    if (endDateStr === null || endDateStr === "") {
        console.log("No end date specified, setting end date to start date");
        endDateStr = startDateStr;
    }
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);

    console.log("From " + startDateStr + " to " + endDateStr);
    collectGithubRange(startDate, endDate, fromStation, toStation, onFinished);
}

function collectGithubRange(startDate, endDate, fromStation, toStation, onFinished) {
    
    var confRuns = [
        { "stationCode": fromStation, "isAnkomst": false },
        { "stationCode": toStation, "isAnkomst": true },
    ];

    var dateCount = 1;
    var firedOff = 0;
    var finished = 0;
    for (let date = startDate; date <= endDate && dateCount <= 10; date.setDate(date.getDate() + 1), dateCount ++) {
        dateStr = date.getFullYear() + "-" + ("" + (date.getMonth() + 1)).padStart(2, "0") + "-" + (("" + date.getDate()).padStart(2, "0"));
        console.log("iterating date: " + dateStr);

        if (date == "") {
            $("#collectGithubStatus").text("No date selected");
            return;
        }
        $("#collectGithubStatus").text("Working...");

        firedOff ++;
        console.log("Fire off date " + finished + "/" + firedOff);
        var sumText = "";
        checkFinished = function (summary) {
            finished ++;
            console.log("Finished " + finished + "/" + firedOff + " with " + summary);
            if (firedOff <= finished) {
                console.log("All " + firedOff + " reqs are finished");
                sumText += summary;
                $("#collectGithubStatus").text(sumText);
                updatesTaSummary();
            }
            if (firedOff == finished) {
                onFinished();
            }
        }
        rVal = "abc" + Math.round(new Date().getTime() / (10*60*1000)); // Browser request cache for 1 hour
        collectGithubZall(confRuns, dateStr, rVal, (result) => {
            console.log("Collect github finishes " + dateStr);
            let summary = "";
            let separator = "";
            for (let day in result) {
                let dayResult = result[day];
                for (let Station_AnkomstAvgang in dayResult) {
                    let resultTuple = dayResult[Station_AnkomstAvgang];
                    if (resultTuple.statusCode == 200) {
                        let taList = resultTuple.tasList;
                        summary += separator + day + ":" + Station_AnkomstAvgang + ": " + taList.length;
                    } else {
                        summary += separator + `<p class="alert alert-warning">${day}: ERROR:${resultTuple.statusCode}</p>`;
                    }
                    
                    separator = ", ";
                }
            }
            checkFinished(summary);
        });
    }
}

function collectGithubZall(confRuns, date, rVal, onFinish) {
    var collected = 0;

    var result = {};
    for (let cid in confRuns) {
        let isAnkomst = confRuns[cid]["isAnkomst"];
        let stationCode = confRuns[cid]["stationCode"];
        let AnkomstAvgang = isAnkomst ? "Ankomst" : "Avgang";
        Stations.bumpRecent(stationCode);
        //console.log("will check " + stationCode + " " + AnkomstAvgang);

        getZAllFromGithub(date, AnkomstAvgang, stationCode, rVal, (statusCode, allTasList, errorMessage) => {
            if (statusCode == 200) {
                consumeTas(allTasList);
            } else {
                console.warn("Failed to get tas from  " + date + " " + AnkomstAvgang + " " + stationCode);
            }
            let stationDayResult = {};
            let stationWithAnkomstArr = `${stationCode}_${AnkomstAvgang}`;
            stationDayResult[`${stationWithAnkomstArr}`] = {statusCode:statusCode, tasList:allTasList, errorMessage:errorMessage};
            collected ++;
            result[`${date}_${stationWithAnkomstArr}`] = stationDayResult;
            //console.log("getZAllFromGithub on finish collect progress " + collected + "/" + confRuns.length);

            if (collected == confRuns.length) {
                console.log("Collect DONE, calling onFinish from collectGithub");
                onFinish(result);
            }
        });
    }
}

function getZAllFromGithub(date, AnkomstAvgang, station, rVal, finishCallback) {
    let zipUrl=`tas/${date}/${AnkomstAvgang}_${station}/zall.zip?r=${rVal}`;
    Unzipper.getAndUnzip(zipUrl, (jsonData)=> {
        console.log("Get zip successful");
        let allTasList = JSON.parse(jsonData);
        finishCallback(200, allTasList)
    }, (errorMsg) => {
        console.log("Failed to get zip");
        finishCallback(0, [], errorMsg);
    });
}

function getAllFromGithub(date, AnkomstAvgang, station, finishCallback) {
    let url=`tas/${date}/${AnkomstAvgang}_${station}/all`;
    console.log("Getting tas from " + url);

    httpRequestAsync("GET", url, (body) => {
        let allTasList = JSON.parse(body);
        console.log("Collected " + allTasList.length + " tas from " + url);
        finishCallback(200, allTasList, null);
    }, function (statusCode, data) {
        if (statusCode !== 404) {
            console.error("Request failed code:" + statusCode + "\n" + data);
        } else {
            console.log("No tas found for " + url);
        }
        finishCallback(statusCode, [], data);
    });
}

function httpRequestAsync(GETorPOST, theUrl, callback, errorCallback, postBody = null)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onerror = () => {
        console.log("Error");
    };
    xmlHttp.ontimeout = () => {
        console.log("Timeout");
    };
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status == 200) {
                callback(xmlHttp.responseText);
            } else {
                errorCallback(xmlHttp.status, xmlHttp.responseText);
            }
        }
    };
    xmlHttp.open(GETorPOST, theUrl, true); // true for asynchronous
    if (GETorPOST === "POST") {
        xmlHttp.setRequestHeader('Content-Type', 'text/xml');
    }
    xmlHttp.send(postBody);
}

function consumeTas(tas) {
    console.log("Consuming " + tas.length + " tas!");
	for (var t = 0; t < tas.length; t ++) {
		var ta = tas[t];
		date = ta["AdvertisedTimeAtLocation"].replace(/T.*/, "");
        trainIdent = ta["AdvertisedTrainIdent"];
        //console.log("ta " + trainIdent);
        if (trainIdent === undefined) {
            console.warn("No train ident!");
            console.warn(ta);
            continue;
        }
		actType = ta["ActivityType"];
        if (!(date in allDates)) {
            allDates[date] = {};
        }
        if (!(trainIdent in allDates[date])) {
            allDates[date][trainIdent] = new TrainInfo();
        }
        taKey = ta["ActivityId"];
        allDates[date][trainIdent].tas[taKey] = ta;
	}
}

//function get_requests(stationCode) {
function getAnkomstBody(stationCode, fromTimeDiff, toTimeDiff) {

	return `<REQUEST>
     <LOGIN authenticationkey=\'${apiKey}\'/>
     <QUERY  lastmodified=\'true\' orderby=\'AdvertisedTimeAtLocation\' objecttype=\'TrainAnnouncement\'>
         <FILTER>
             <AND>
                 <EQ name=\'LocationSignature\' value=\'${stationCode}\'/>
                 <EQ name=\'Advertised\' value=\'true\'/>
                 <EQ name=\'ActivityType\' value=\'Ankomst\'/>
				<AND>
					<GT name=\'AdvertisedTimeAtLocation\' value=\'${fromTimeDiff}\'/>
					<LT name=\'AdvertisedTimeAtLocation\' value=\'${toTimeDiff}\'/>
				</AND>
             </AND>
         </FILTER>
     </QUERY>
</REQUEST>`;
}

function getAvgangBody(stationCode, fromTimeDiff, toTimeDiff) {

	return `<REQUEST>
    <LOGIN authenticationkey=\'${apiKey}\'/>
    <QUERY  lastmodified=\'true\' orderby=\'AdvertisedTimeAtLocation\' objecttype=\'TrainAnnouncement\'>
        <FILTER>
            <AND>
                <EQ name=\'LocationSignature\' value=\'${stationCode}\'/>
                <EQ name=\'Advertised\' value=\'true\'/>
                <EQ name=\'ActivityType\' value=\'Avgang\'/>
				<AND>
					<GT name=\'AdvertisedTimeAtLocation\' value=\'${fromTimeDiff}\'/>
					<LT name=\'AdvertisedTimeAtLocation\' value=\'${toTimeDiff}\'/>
				</AND>
            </AND>
        </FILTER>
    </QUERY>
</REQUEST>`;
//				<AND>
//					<GT name=\'AdvertisedTimeAtLocation\' value=\'$DateAdd(-5:00:00)\'/>
//					<LT name=\'AdvertisedTimeAtLocation\' value=\'$DateAdd(5:00:00)\'/>
//				</AND>
}

function getAllStations() {
	return `<REQUEST>
	      <LOGIN authenticationkey="${apiKey}" />
	      <QUERY objecttype="TrainStation">
	            <FILTER />
	      </QUERY>
	</REQUEST>`;
}
