var Stations = (function () {

    const ALL_STATIONS_KEY = "allStations";
    const RECENT_STATIONS = "recentStations";
    var sortedStations = [];
    var stationLookup = {};
    var recentStations;

    function lookupStationName(locationSignature) {
        let n = stationLookup[locationSignature];
        return (n == undefined) ? (locationSignature + "??") : n;
    }

    function bumpRecent(LocSig) {
        recentStations = recentStations.filter(station => station !== LocSig);
        recentStations.push(LocSig);
        localStorage.setItem(RECENT_STATIONS, JSON.stringify(recentStations));
        // for(r in recentStations) {
        //     console.log("Recent " + r + ":" + recentStations[r]);
        // }
    }

    function clearCache() {
        Markup.clearCache();
        localStorage.removeItem(ALL_STATIONS_KEY);
        localStorage.removeItem(RECENT_STATIONS);
        console.log("Cleared stations cache");
    }

    function setupStations(allStations) {
        let s = "";
        let tot = 0;
        
        for (a in allStations) {
            let station = allStations[a];
            locSig = station["LocationSignature"];
            advName = station["AdvertisedLocationName"]
            stationLookup[locSig] = advName;
        }
        
        filteredStations = allStations.filter(st => st["Advertised"]);
        sortedStations = filteredStations.sort(function(a,b) {
            let aRecentVal = recentStations.findIndex(element => element === a["LocationSignature"]);
            let bRecentVal = recentStations.findIndex(element => element === b["LocationSignature"]);

            if (aRecentVal !== bRecentVal) {
                return bRecentVal - aRecentVal;
            }
            return a["AdvertisedLocationName"].toLowerCase().localeCompare(b["AdvertisedLocationName"].toLowerCase());
        });

        let collectStations = CollectionConf.getConf();
        for (let a = 0; a < sortedStations.length; a++) {
            station = sortedStations[a];
            special = "";
            if (collectStations.has(station["LocationSignature"])) {
                special = " (Extended)";
            }
            s += "<option value=" + station["LocationSignature"] + ">" + station["AdvertisedLocationName"] + special + "</option>";
            tot ++;
        }
        //console.log("Totalt stations shown " + tot);

        $("#toStation").html(s);
        $("#fromStation").html(s);

        var to = document.getElementById("toStation");
        if (to !== null) {
            to.selectedIndex ++;
        }
        

        //console.log("set html of #tostations");
    }

    function setup() {
        //console.log("setting up stations");
        let allStations;
        allStations = JSON.parse(localStorage.getItem(ALL_STATIONS_KEY));
        recentStations = JSON.parse(localStorage.getItem(RECENT_STATIONS));
        if (recentStations === null) {
            recentStations = ["M", "G", "U", "Cst"];

        }
        if (allStations === null) {
            $.get( "allstations.json", function( data ) {
                allStations = data["RESPONSE"]["RESULT"][0]["TrainStation"];
                localStorage.setItem(ALL_STATIONS_KEY, JSON.stringify(allStations))
                // console.log( "Saved all stations!")
                // console.log(allStations);
                
                setupStations(allStations);
            });
        } else {
            // console.log("Already have allstations!")
            // console.log(allStations);
            setupStations(allStations);
        }
    }

    function swap() {
        var to = document.getElementById("toStation");
        var fr = document.getElementById("fromStation");
        //let toSel = to.options[to.selectedIndex].value;
        let tmp = fr.selectedIndex;
        fr.selectedIndex = to.selectedIndex;
        to.selectedIndex = tmp;
        // fr.selectedIndex ++;
    }

    /* ========== Explort public methods ============*/
    return {
        bumpRecent: bumpRecent,
        clearCache: clearCache,
        swap: swap,
        setup: setup,
        lookupStationName: lookupStationName,
    };

})();

$(function() {
    Stations.setup();
    $("#swapToFrom").bind('click', Stations.swap);
    $("#clearStationsCache").bind('click', Stations.clearCache);
});


