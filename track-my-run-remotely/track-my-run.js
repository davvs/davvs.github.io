// const firebase = require("firebase");
// // Required for side-effects
// require("firebase/firestore");
//
//
//

$( document ).ready(function() {
    var db;
    var raceStarted=0;
    var raceStopped=null;
    var connectedRunners = [];

    var userNames = {};
    var userDataSets = {};

    var userPts = [];
    var groupedPoints = {};

    var timeUpdater;
    var dataPointsGroupTimeS = $("#dataPointsGroupTimeS").val();
    var day;
    var speedunit;

    function SaveUserPts() {
        localStorage.setItem("userPts", JSON.stringify(userPts));
    }

    function updatePointData() {
        //let ptSection = $("#ptSection");
        let ptSection = document.getElementById("ptSection");
        ptSection.classList.remove("hidden");

        let ptUsersTag = $("#ptUsers");
        let tBodyTag = $("#ptData > tbody");
        let tGpDataTag = $("#gpData > tbody");

        let ptUsers = "";
        for(userId in userPts) {
            ptUsers += "<li>" + userId + "</li>"
        }
        ptUsersTag.html(ptUsers);

        let tbody = "";
        let rows = ["groupIndex", "ts", "val", "ptId"];
        for(let rid in rows) {
            attrib = rows[rid];
            tbody += "<tr><th>" + attrib + "</th>";
            for(userId in userPts) {
                let pts = userPts[userId][day];
                for(pid in pts) {
                    let p = pts[pid];
                    if (attrib === "ts") {
                        tbody += "<td>" + p.ts + "</td>";
                    } else if (attrib === "groupIndex") {
                        tbody += "<td>" + getGroupIndex(p.ts) + "</td>";
                    } else if (attrib === "val") {
                        tbody += "<td>" + getValOfPoint(p) + "</td>";
                    } else if (attrib === "ptId") {
                        tbody += "<td>" + p.id + "</td>";
                    }
            }
            }
            tbody += "</tr>";
        }
        tBodyTag.html(tbody);

        let grows = ["group", "fromTs", "totVal", "count", "points"];
        let groupData = "";
        for (gr in grows) {
            row=grows[gr];
            groupData += "<tr><th>" + row + "</th>";
            for(gid in groupedPoints) {
                group = groupedPoints[gid];
                gstr = "<td>";
                if (row == "group") {
                    gstr += gid;
                } else if (row == "fromTs") {
                    gstr += group.fromTs;
                } else {
                    for (uid in group.users) {
                        groupUser = group.users[uid];
                        if (row == "totVal") {
                            gstr += groupUser.totVal;
                        } else if (row == "count") {
                            gstr += groupUser.count;
                        } else if (row == "points") {
                            pkeys = Object.keys(groupUser.points);
                            const keysCommaSep = pkeys.join("</li><li>");
                            gstr += "<li>" + keysCommaSep + "</li>";
                        } else {
                            gstr += "unhandled grows-val";
                        }
                    }
                }
                gstr += "</td>";
                groupData += gstr;
            }
            groupData += "</tr>";
        }

        tGpDataTag.html(groupData);
    }

    function getUserName(userId) {
        if (userId in userNames) {
            return userNames[userId];
        }
        return "Unknown name " + userId;
    }

    function getPace(p) {
        if (p.spdMps === null) {
            return 0;
        }
        if (p.spdMps < 2) {
            return 0;
        }
        return 1000 / (p.spdMps * 60);
    }

    function setDateToToday() {
        const now = new Date(Date.now());
        d = now.toLocaleDateString("SE-sv");
        $("#day").val(d);
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function getTs(ts) {
        const date = new Date(ts);
        return date.toLocaleDateString("SE-sv") + " " + date.toLocaleTimeString("SE-sv");
    }

    function getReadableTsHHmm(p) {
        const date = new Date(p.ts);
        return date.toLocaleTimeString("SE-sv");
        return dt;
    }

    function getReadableTs(p) {
        const dt = getTs(p.ts);
        return dt;
    }


    function getGroupIndex(ts) {
        return Math.floor(ts / dataPointsGroupTimeS);
    }

    function addData(userId, ptId, day, ts, spdMps) {
        let p = registerDataPoint(userId, ptId, day, ts, spdMps, 0, 0, 0, 0, 0 ,0);
        addDataPointToGroup(userId, p, spdMps);
        window.myLine.update();
        SaveUserPts();
    }

    function registerDataPoint(userId, ptId, day, ts, spdMps, spdMpsAcc, alt, lng, lat, accHorizontal) {
        let pts = userPts[userId][day];

        p = {};
        p.id = ptId;
        p.webUpdatedTs = Date.now();
        p.ts = ts;
        p.spdMps = spdMps;
        p.spdMpsAcc = spdMpsAcc;
        p.alt = alt;
        p.lng = lng;
        p.lat = lat;
        p.accHorizontal = accHorizontal;

        pts.push(p)
        return p;
    }

    function getUserDataSet(userId) {
        const dataSetIndex = userDataSets[userId];
        return config.data.datasets[dataSetIndex];
    }

    function addUserIfMissing(userId) {
        if (!(userId in userDataSets)) {
            var colorName = graph.colorNames[config.data.datasets.length % graph.colorNames.length];
            var newColor = window.chartColors[colorName];
            let label;
            if (speedunit == "mps") {
                label = getUserName(userId) + " speed (m/s)";
            } else if (speedunit == "minpkm") {
                label = getUserName(userId) + " pace (min/km)";
            } else if (speedunit == "kmph") {
                label = getUserName(userId) + " speed (km/h)";
            } else if (speedunit == "alt") {
                label = getUserName(userId) + " altitude";
            } else if (speedunit == "totdist") {
                label = getUserName(userId) + " total distance";
            }

            var spdDataset = {
                label: label + userId,
                backgroundColor: newColor,
                borderColor: newColor,
                data: [],
                fill: false
            };
            userDataSets[userId] = config.data.datasets.length;
            config.data.datasets.push(spdDataset);
        }
    }

    function addAllUsersToGroup(group) {
        group.users = {};
        for(userId in userDataSets) {
            group.users[userId] = {};
            group.users[userId].totVal = 0;
            group.users[userId].count = 0;
            group.users[userId].points = {}

            dataSet = getUserDataSet(userId);
            dataSet.data.push(0);
        }
    }

    function addGroupIfNew(tsGroupIdx, pushBack) {
        if (!(tsGroupIdx in groupedPoints)) {
            groupedPoints[tsGroupIdx] = {};
            let group = groupedPoints[tsGroupIdx];
            group.fromTs = tsGroupIdx * dataPointsGroupTimeS;
            addAllUsersToGroup(group);
            let labels = config.data.labels;
            if (pushBack) {
                labels.push(tsGroupIdx);
            } else {
                labels.unshift(tsGroupIdx);
            }
        }
    }

    function addDataPointToGroup(userId, p, pVal) {
        const tsGroupIdx = getGroupIndex(p.ts);

        addUserIfMissing(userId);

        dataSet = getUserDataSet(userId);

        let labels = config.data.labels;
        let lastLabel;
        if (labels.length == 0) {
            addGroupIfNew(tsGroupIdx, true);
        } else {
            const lastLabel = labels[labels.length - 1];
            const firstLabel = labels[0];

            let iterateFrom;
            let step;
            if (tsGroupIdx >= firstLabel && tsGroupIdx <= lastLabel) {
            } else {
                if (tsGroupIdx < firstLabel) {
                    iterateFrom = firstLabel - 1;
                    step = -1;
                } else if (tsGroupIdx > lastLabel) {
                    iterateFrom = lastLabel + 1;
                    step = 1;
                } else {
                    throw "Invalid label, borken code!";
                }

                let failsafe = 10000; //group steps --> 10s periods
                for (let nextGroup = iterateFrom; nextGroup != tsGroupIdx + step; nextGroup += step) {
                    failsafe --;
                    if (failsafe <= 0) {
                        throw 'failsafe mechanism! ' + lastLabel + " to " + tsGroupIdx;
                    }
                    addGroupIfNew(nextGroup, step == 1);
                }
            }

        }


        let group = groupedPoints[tsGroupIdx];
        if (p.id in group.users[userId].points) {
            //console.log("point " + p.id + " already exists. skipping" )
            return;
        }
        group.users[userId].count ++;
        group.users[userId].totVal += pVal;
        group.users[userId].points[p.id] = {};

        const v = group.users[userId].totVal / group.users[userId].count;

        const fLabel = labels[0];
        const lLabel = labels[labels.length - 1];
        groupIdx = getGroupIndex(p.ts);
        console.log("GroupIndex " + groupIdx + "labels goes from " + fLabel + " to " + lLabel);
        console.log(group);
        const di = lLabel - fLabel;
        const labelIdx = groupIdx - fLabel;
        dataSet.data[labelIdx] = v;


    }

    function getValOfPoint(p) {
        if (speedunit == "mps") {
            return p.spdMps;
        } else if (speedunit == "minpkm") {
            return getPace(p);
        } else if (speedunit == "kmph") {
            return p.spdMps * 3.6;
        } else if (speedunit == "alt") {
            return p.alt;
        } else if (speedunit == "totdist") {
            return 0;
        }
        return 0;
    }

    function updateGraph() {
        groupedPoints = {};
        userDataSets = {};
        dataPointsGroupTimeS = $("#dataPointsGroupTimeS").val();
        speedunit = $("#speedunit").val();

        config.data.labels = [];
        config.data.datasets = [];

        for(userId in userPts) {
            pts = userPts[userId][day];

            config = window.myLine.config;

            totDist = 0;
            for (pid in pts) {
                p = pts[pid];
                if (!IsPointOnCorrectDay(p, day)) {
                    continue;
                }

                if (!IsTsWithinRaceInterval(p.ts)) {
                    continue;
                }

                pVal = getValOfPoint(p);

                addDataPointToGroup(userId, p, pVal);
            }
        }
        window.myLine.update();
        //updatePointData();
    }

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    graph.onLoad();
    const dayField = $("#day");

    $("#updatePtData").click(updatePointData);

    $("#addData").click(() => {
       const spdMps = Samples.utils.rand(0.0, 2.0);
       const userId="on5jbrvtbF6WHrBmQ4kw";
       const low = config.data.labels[0];
       const high = config.data.labels[config.data.labels.length - 1];
       const di = high - low;
       let groupIdx = Samples.utils.rand(low, high + 1);
       const ts = Math.round(groupIdx * dataPointsGroupTimeS);
       const dt = new Date(ts);
       const day = dt.toLocaleDateString("SE-sv");
       const ptId = uuidv4();

       console.log("from " + low + " to " + high + " got val:" + ts + ". Group:" + getGroupIndex(ts));
       //return;
       addData(userId, ptId, day, ts, spdMps);
    });
    const selectedDay = localStorage.getItem("selected-day");
    if (selectedDay != null) {
        dayField.val(selectedDay);
    } else {
        setDateToToday();
    }

    const userNamesStr = localStorage.getItem("usernames");
    if (userNamesStr != null) {
        userNames = JSON.parse(userNamesStr);
    }

    dayField.change(function() {
        newVal = dayField.val();
        localStorage.setItem("selected-day", newVal);
    });

    $("#updateToday").click(setDateToToday);

    db = firebase.firestore();
    raceStarted=0;
    raceStopped=null;
    connectedRunners = [];
    userPts = {};
    day = dayField.val();

    uptsString = localStorage.getItem("userPts");
    if (uptsString != null) {
        userPts = JSON.parse(uptsString);
    }

    updateGraph();
    $("#updateGraph").click(updateGraph);

    const zeroPad = (num, places) => String(num).padStart(places, '0')

    function updateUserData(userId, speedField, distField, debugField, debug) {
            debugField.html("");
            pts = userPts[userId][day];
            if (pts.length <= 1) {
                speedField.html("Speed: N/A");
                distField.html("Tot distance: 0km");
                return;
            }
            oldestPoint = pts[0];
            newestPoint = pts[pts.length - 1];

            let timeTaken = (newestPoint.ts - oldestPoint.ts);
            let timeTakenS = Math.trunc(timeTaken / 1000);
            let timeTakenMins = Math.trunc(timeTakenS / 60);
            let timeTakenSecs = timeTakenS - timeTakenMins*60;

            debugField.append(oldestPoint.ts + " to " + newestPoint.ts + ". " + day + " goes from " + getReadableTsHHmm(oldestPoint) + " to " + getReadableTsHHmm(newestPoint) + ". "
                     + timeTakenMins + ":" + zeroPad(timeTakenSecs,2) + " elapsed. " + pts.length + " gps data points");
            let t;
            if (debug) {
                debugField.append("<table><tr><td>lo</td><td>ojoj</td></tr></table>");
                t="<table><tbody>";
            }
            let totDist=0;
            for(i = 0; i < pts.length; i++) {
                let p = pts[i];
                let dist = 0;
                if (i > 0) {
                    let lastP = pts[i-1];
                    dist = getDistanceFromLatLonInKm(p.lat, p.lng, lastP.lat, lastP.lng)
                    totDist += dist;
                }
                let pace = (getPace(p));
                const date = getTs(p.webUpdatedTs);
                if (debug) {
                    t += "<tr>"
                        + "<td>WebUpdatedTs</td>"
                        + "<td>" + date + "</td>"
                        + "<td>Ts</td>"
                        + "<td>" + getReadableTs(p) + "</td>"
                        + "<td>dist</td><td>" + dist + "</td>"
                        + "<td>speed</td><td>" + p.spdMps.toFixed(3) + "</td>"
                        + "<td>Pace</td><td>" + pace  + "</td>"
                        + "<td>Lng</td><td>" + p.lng  + "</td>"
                        + "<td>Lat</td><td>" + p.lat  + "</td>"
                        + "</tr>";
                }
            }

            if (debug) {
                t += "</tbody></table>";
                debugField.append(t);
            }
            p = pts[0];
            speedField.html("Last noted : Speed: " + p.spdMps.toFixed(3) + "m/s (acc:" + p.spdMpsAcc + ") Pace:" + getPace(p).toFixed(2));
            distField.html("Tot distance: " + totDist.toFixed(2) + "km (gps points:" + pts.length + ")");

    }

    function addUser(initialUserId) {
        $("#userIds").append(
            "<div class='userId'>" +
                '<div>runner link can be unique id from the track-my-run-remotely app, or the pacer url (or strava url)</div>' +
                '<input type="text" placeholder="runner link" class="userIdText"></input>' +
                '<input type="button" value="connect" class="connect"></input>' +
                '<input type="button" value="remove" class="remove"></input>' +
                '<div class="userName">userName</div>' +
                '<div class="speed">speed ??</div>' +
                '<div class="distance">distance ??</div>' +
                '<div class="debug">debug</div>' +
                '<input type="button" value="Update" class="update"></input>' +
            "</div>");
        const userDiv=$("#userIds").find("div.userId").last();
        const txtField=userDiv.find(".userIdText"); //Textfield
        const displayName=userDiv.find(".userName"); //Span
        const updateButton=userDiv.find(".update");

        updateButton.click(() => {
            const userId=txtField.val().trim();
            const speedField=userDiv.find(".speed");
            const distField=userDiv.find(".distance");
            const debugField=userDiv.find(".debug");
            updateUserData(userId, speedField, distField, debugField);
        });
        userDiv.find(".connect").click(() => {
            const userId=txtField.val().trim();
            userDiv.find(".remove").click(() => {
                for(r in connectedRunners) {
                    if (connectedRunners[r] == userId) {
                        connectedRunners.splice(r, 1)
                    }
                }
                localStorage.setItem("connectedRunners", JSON.stringify(connectedRunners));
                userDiv.remove();
            });
            const dbUser = db.collection("users").doc(userId);

            dbUser.get().then(function(doc) {
                    displayName.html("");
                    if (doc.exists) {
                        const username = doc.data().username
                        userNames[userId] = username;
                        localStorage.setItem("usernames", JSON.stringify(userNames));
                        displayName.html("Name: " + username);
                        trackUser(userId, userDiv);
                        let found = false;
                        for(r in connectedRunners) {
                            runner=connectedRunners[r];
                            if (runner==userId) {
                                found = true;
                            }
                        }
                        if (!found) {
                            connectedRunners.push(userId);
                            localStorage.setItem("connectedRunners", JSON.stringify(connectedRunners));
                        }
                    } else {
                        displayName.html("Invalid user");
                    }
                }).catch(function(error) {
                    console.error("Error getting document:", error);
                });
        }); //Connect button


        if (initialUserId !== undefined) {
            txtField.val(initialUserId);
            // autoconnect
            // userDiv.find(".connect").click();
        }
    }

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }


    function IsPointOnCorrectDay(point, day) {
        var date = new Date(p.ts);
        d = date.toLocaleDateString("SE-sv");
        return d == day;
    }

    function IsTsWithinRaceInterval(ts) {
        return (raceStarted <= ts && (raceStopped == null || raceStopped > ts));
    }

    function trackUser(userId, userDiv) {

        const speedField=userDiv.find(".speed");
        const distField=userDiv.find(".distance");
        const debugField=userDiv.find(".debug");

        const debug = ("#debug").checked;

        var points = db.collection("users").doc(userId).collection("dates").doc(day).collection("points");
        points.onSnapshot((querySnapshot) => {
            if (!(userId in userPts)) {
                userPts[userId] = {};
            }
            userPts[userId][day] = [];
            let pts = userPts[userId][day];
            //$("#points").html("");

            queryPts = 0;
            querySnapshot.forEach((doc) => {
                queryPts++;
                p = registerDataPoint(userId, doc.id, day, doc.get("ts"), doc.get("spd-mps"),
                    doc.get("spd-mps-acc"), doc.get("alt"), doc.get("lng"), doc.get("lat"),
                    doc.get("accHorizontal"));

                pVal = getValOfPoint(p)
                addDataPointToGroup(userId, p, pVal);
                window.myLine.update();
                SaveUserPts();
            });

            pts.sort(function(a,b){
                return a.ts - b.ts;
            });

            SaveUserPts();

            updateUserData(userId, speedField, distField, debugField);
        });
    }

    function updateRaceStatus() {
        r = "";
        if (raceStarted > 0) {
            r += "Race started at " + getTs(raceStarted);

            if (raceStopped !== null) {
                r += " and finished at " + getTs(raceStopped);
            }
        } else if (raceStopped !== null) {
            r += "Race will finish at " + getTs(raceStopped);
        } else {
            r = "Warming up";
        }
        $("#raceStatus").html(r);
    }

    function GetTimeInputOrNow(id) {
        const potentialTimeStr = $(id).val();
        if (potentialTimeStr !== "") {
            ret = Date.parse(day + " " + potentialTimeStr);
        } else {
            ret = Date.now();
            d=new Date(ret);
            $(id).val(d.toLocaleTimeString("SE-sv"));
        }
        return ret;
    }

    $("#clearRace").click(() => {
        raceStarted = 0;
        raceStopped = null;
        updateRaceStatus();
        updateGraph();
        $("#raceElapsed").html("");
    });

    $("#startRace").click(() => {
        raceStarted = GetTimeInputOrNow("#startTime");

        updateRaceStatus();
        timeUpdater = window.setInterval(() => {
            const now = Date.now();
            let timeTaken = (now - raceStarted);
            let timeTakenS = Math.trunc(timeTaken / 1000);
            let timeTakenMins = Math.trunc(timeTakenS / 60);
            let timeTakenSecs = timeTakenS - timeTakenMins*60;

            $("#raceElapsed").html("Elapsed : " + timeTakenMins + ":" + timeTakenSecs); 
        }, 1000);
        updateGraph();
    });

    $("#stopRace").click(() => {
        raceStopped = GetTimeInputOrNow("#endTime");
        clearInterval(timeUpdater);
        updateRaceStatus();
        updateGraph();
    });

    runnersjson = localStorage.getItem("connectedRunners")
    if (runnersjson == null || runnersjson=="") {
        connectedRunners = [];
        localStorage.setItem("connectedRunners", JSON.stringify(connectedRunners));
        addUser();
    } else {
        connectedRunners=JSON.parse(runnersjson);
        for(r in connectedRunners) {
            userId=connectedRunners[r];
            addUser(userId);
        }
        if (connectedRunners.length == 0) {
            addUser();
        }
    }
    $("#addUser").click(() => { addUser(); })

});

