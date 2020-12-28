var Tapreview = (function () {
    function printLocations(locations) {
        if (locations === undefined) {
            return "N/A";
        }
		flsum = "";
        for(i = 0; i < locations.length; i++) {
			locData = locations[i];
            flsum += Stations.lookupStationName(locData["LocationName"]);
            if (i < locations.length -1) {
               flsum += ", ";
            }
		}
		return flsum;
	}

	function setup() {
		console.log("setting up");
		let params = window.location.search.substr(1);
		let paramsArr = params.split("&");
		paramMarkup=[];
		let activityType;
		let locSig;
		let day;
        let activityId;
		let trainId;
		for (p in paramsArr) {
			//paramMarkup.push(["param:" + p, paramsArr[p]]);
			ps = paramsArr[p].split("=");
			key=ps[0];
			value=ps[1];
			switch(key) {
				case "activityType":
					activityType=value;
					break;
				case "locSig":
					locSig=value;
					break;
				case "day":
					day=value;
					break;
				case "activityId":
					activityId=value;
					break;
				case "trainId":
					trainId=value;
					break;
				default:

			}
		}

		//day="2019-12-30";


		taPreview=$("#taPreview")
		//taPreview.html("<tr><td>" + paramMarkup.join("</td></tr><tr><td>") + "</td></tr>");

		rVal = "abc" + Math.round(new Date().getTime() / (10*60*1000)); // Browser request cache for 1 hour

		getZAllFromGithub(day, activityType, locSig, rVal, (statusCode, allTasList, errorMessage) => {
			if (statusCode == 200) {
				consumeTas(allTasList);
			} else {
				console.warn("Failed to get tas from  " + day + " " + activityType + " " + locSig);
				return;
			}
			let stationDayResult = {};
			let stationWithAnkomstArr = `${locSig}_${activityType}`;
			stationDayResult[`${stationWithAnkomstArr}`] = {statusCode:statusCode, tasList:allTasList, errorMessage:errorMessage};

			let found = false
            for(let i = 0; i < allTasList.length; i++) {
				ta=allTasList[i];
				if(ta["ActivityId"] == activityId) {
					console.log("HIT: " + ta["ActivityId"]);
					printTa(ta);
					found=true;
					break;
				}		
			}
			if (!found) {
				taPreview.html(taPreview.html() + "<p/>Unable to find ta")
			}
		});
	}

	function printTa(ta) {
		console.log(ta);
		let rows=[];

		rows.push(["EstimatedTimeAtLocation", ta["EstimatedTimeAtLocation"]]);
		rows.push(["AdvertisedTimeAtLocation", ta["AdvertisedTimeAtLocation"]]);
		rows.push(["AdvertisedTrainIdent", ta["AdvertisedTrainIdent"]]);
		rows.push(["Canceled", ta["Canceled"]]);

		rows.push(["EstimatedTimeIsPreliminary", ta["EstimatedTimeIsPreliminary"]]);
		rows.push(["InformationOwner", ta["InformationOwner"]]);
		rows.push(["LocationSignature", Stations.lookupStationName(ta["LocationSignature"])]);
		rows.push(["MobileWebLink", ta["MobileWebLink"]]);
		rows.push(["ModifiedTime", ta["ModifiedTime"]]);
		rows.push(["NewEquipment", ta["NewEquipment"]]);
		rows.push(["PlannedEstimatedTimeAtLocationIsValid", ta["PlannedEstimatedTimeAtLocationIsValid"]]);
		rows.push(["ScheduledDepartureDateTime", ta["ScheduledDepartureDateTime"]]);
		rows.push(["TechnicalTrainIdent", ta["TechnicalTrainIdent"]]);
		rows.push(["TrackAtLocation", ta["TrackAtLocation"]]);
		rows.push(["TypeOfTraffic", ta["TypeOfTraffic"]]);
		rows.push(["WebLink", ta["WebLink"]])

		rows.push(["Deviation", joinPossibleNullArray(ta["Deviation"])]);
		rows.push(["OtherInformation", joinPossibleNullArray(ta["OtherInformation"])]);
		rows.push(["ProductInformation", joinPossibleNullArray(ta["ProductInformation"])]);
		rows.push(["TrainComposition", joinPossibleNullArray(ta["TrainComposition"])]);

		rows.push(["FromLocation", printLocations(ta["FromLocation"])]);
		rows.push(["ViaToLocation", printLocations(ta["ViaToLocation"])]);
		rows.push(["ToLocation", printLocations(ta["ToLocation"])]);

		t="";
		for(let r = 0; r < rows.length; r++) {
			let cols = rows[r];
			t += "<tr><td>" + cols.join("</td><td>") + "</td></tr>";
		}
		taPreview.html(taPreview.html() + t);
	}

    function joinPossibleNullArray(arr) {
        if (arr !== undefined) {
            return arr.join(", ");
        }
        return "N/A";
    }

	return {
		setup: setup,
	};

})();

$(function () {
	Tapreview.setup();
})
