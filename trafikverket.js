

if (typeof process !== 'undefined' && process.release.name === 'node') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

// var request = require('request');
//var firebaseWriter = require('./firebaseWriter.js')
// module.exports = {
//     collect,
// }

apiKey='49b2742268a94e2ea7e164374ce1775a'
// Trafikverket web: key='88d47d970fae4cbd88411e142672143b'
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
    $("#collectGithub").bind('click', collectGithubButton);
    $("#collectWeb").bind('click', collectWebButton);


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
        if (doneCallback !== undefined) {
            doneCallback();
        }
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
    fromTimeDiff = "$DateAdd(-04:00:00)";
    toTimeDiff = "$DateAdd(04:00:01)";

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

function collectGithubButton(doneCallback) {
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
        var sumText = "";
        checkFinished = function (sum) {
            finished ++;
            if (firedOff <= finished) {
                console.log("All " + firedOff + " reqs are finished");
                sumText += sumText;
                $("#collectGithubStatus").text(sumText);
                //$("#collectGithubStatus").append("Colected " + totTaCount + " Train Annoucements from " + stationCount + " stations. " + summary);
                updatesTaSummary();
                if (doneCallback !== undefined) {
                    doneCallback();
                }
            }
        }
        collectGithub(confRuns, dateStr, (result) => {

            let summary = "";
            let separator = "";
            let totTaCount = 0;
            let stationCount = 0;
            for (let day in result) {
                let dayResult = result[day];
                for (let Station_AnkomstAvgang in dayResult) {
                    let resultTuple = dayResult[Station_AnkomstAvgang];
                    if (resultTuple.statusCode == 200) {
                        let taList = resultTuple.tasList;
                        summary += separator + day + ":" + Station_AnkomstAvgang + ": " + taList.length;
                        totTaCount += taList.length;
                        stationCount ++;
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

function collectGithub(confRuns, date, onFinish) {
    var collected = 0;

    var result = {};
    for (let cid in confRuns) {
        let isAnkomst = confRuns[cid]["isAnkomst"];
        let stationCode = confRuns[cid]["stationCode"];
        let AnkomstAvgang = isAnkomst ? "Ankomst" : "Avgang";
        console.log("will check " + stationCode + " " + AnkomstAvgang);
        getAllFromGithub(date, AnkomstAvgang, stationCode, (statusCode, allTasList, errorMessage) => {
            if (statusCode == 200) {
                consumeTas(allTasList);
            } else {

            }
            let stationDayResult = {};
            let stationWithAnkomstArr = `${stationCode}_${AnkomstAvgang}`;
            stationDayResult[`${stationWithAnkomstArr}`] = {statusCode:statusCode, tasList:allTasList, errorMessage:errorMessage};
            collected ++;
            result[`${date}_${stationWithAnkomstArr}`] = stationDayResult;
            console.log("Got some data from " + date)
            if (collected == confRuns.length) {
                onFinish(result);
            }
        }, (statusCode, data) => {

        });
    }
}

function getAllFromGithub(date, AnkomstAvgang, station, finishCallback) {
    let url=`https://davvs.github.io/tas/${date}/${AnkomstAvgang}_${station}/all`;
    console.log(url);

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
        } else {
            // console.log("Working..." + xmlHttp.readyState);
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
