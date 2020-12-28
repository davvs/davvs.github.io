var Search = (function () {
    $("#searchButton").disabled = true;
    function search() {
        $("#searchButtonStatus").html("Söker... ");
        var doneCount = 0;
        var expectedDoneCount = 0;
        var checkDone = (whatDone) => {
            doneCount ++;
            $("#searchButtonStatus").html($("#searchButtonStatus").html() + whatDone + "... " )
            if (doneCount==expectedDoneCount) {
                Markup.printToHtml();
                let newPost = document.getElementById("nowPost");
                if (newPost == undefined) {
                    console.warn("No post to scroll to");
                } else {
                    document.getElementById("nowPost").scrollIntoView();
                }
                $("#searchButton").disabled = false;
                $("#searchButtonStatus").html($("#searchButtonStatus").html() + " Allt Klart!")
            }
        };
        if ($("#searchByDate").prop("checked")) {
            expectedDoneCount = 0;

            expectedDoneCount ++;
            collectGithubByDateFormButton(()=>checkDone("Hämtat samlat data!"));

            expectedDoneCount ++;
            collectWebButton(()=>checkDone("Hämtat färskt data!"));
        } else {
            var fromStation = $("#fromStation").val();
            var toStation = $("#toStation").val();
        
            now = new Date();
            nowMin = now.getTime() / (60 *1000);
            timeMax = getTimeMax();
            timeMin = getTimeMin();

            fromDateTime = (nowMin - timeMax) * (60*1000);
            fromDate = new Date();
            fromDate.setTime(fromDateTime);

            toDateTime = (nowMin - timeMin) * (60*1000);
            toDate = new Date();
            toDate.setTime(toDateTime);
            console.log("dates from " + fromDate);
            console.log("dates to " + toDate);
            expectedDoneCount = 0;

            expectedDoneCount ++;
            collectGithubRange(fromDate, toDate, fromStation, toStation, ()=>checkDone("Hämtat gamalt data!"));

            //expectedDoneCount ++;
            //collectWebButton(()=>checkDone("Hämtat nytt data!"));
        }
        
    }

    function showDebug() {
        console.log("Showing debug");
        $("#searchDebugButtons").css("display", "block");
    }

    function getTimeMin() {
        var timeIn = $("#taTimeIn").val();
        let searchNow = $("#searchNow").prop("checked");
        if (searchNow && timeIn != undefined) {
            tin = timeIn.split(":");
            return -(parseInt(tin[0]) * 60 + parseInt(tin[1]));
        }
        return undefined;
    }

    function getTimeMax() {
        var timeAgo = $("#taTimeAgo").val();
        let searchNow = $("#searchNow").prop("checked");
        if (searchNow && timeAgo != undefined) {
            tago = timeAgo.split(":");   
            return parseInt(tago[0]) * 60 + parseInt(tago[1]);
        }
        return undefined;
    }

    function endDateChanged() {
        try {
            let startVal = $("#taFilterStartDate").val();
            let endVal = $("#taFilterEndDate").val();
            if (new Date(endVal) < new Date(startVal)) {
                $("#taFilterStartDate").val(endVal);
            }
        } catch (e) {
            console.log("End date or start date is invalid ");
        }
    }
    
    function startDateChanged() {
        try {
            let startVal = $("#taFilterStartDate").val();
            let endVal = $("#taFilterEndDate").val();
            if (new Date(endVal) < new Date(startVal)) {
                $("#taFilterEndDate").val(startVal);
            }
        } catch (e) {
            console.log("End date or start date is invalid ");
        }
    }

    return {
        search: search,
        showDebug: showDebug,
        getTimeMax: getTimeMax,
        getTimeMin: getTimeMin,
        startDateChanged: startDateChanged,
        endDateChanged: endDateChanged,
    };
})();

$(function() {
    $("#searchButton").bind("click", Search.search);
    $("#debugSearch").bind("click", Search.showDebug);
    $("#taFilterStartDate").bind("change", Search.startDateChanged);
    $("#taFilterEndDate").bind("change", Search.endDateChanged);
    
});
