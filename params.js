var Params = (function () {
    function updateUrl() {
        let param = [];
        let trainIdFilter = $("#taFilterTrainId").val();
        if (trainIdFilter != "") { param.push("tid=" + trainIdFilter); }

        let showOnlyLateTrains = $("#taOnlyLateTrains").is(":checked");
        if (showOnlyLateTrains != "") { param.push("l"); }

        let fromLocation = $("#fromStation").val();
        param.push("f=" + fromLocation);

        let toLocation = $("#toStation").val();
        param.push("t=" + toLocation);
        
        let startTime = $("#taFilterStartTime").val();
        let endTime = $("#taFilterEndTime").val();
        if (startTime != "" && endTime != "") {
            param.push("st=" + startTime);
            param.push("et=" + endTime);
        }

        if ($("#searchNow").prop("checked")) {
            param.push("tp=n");
            let taTimeAgo = $("#taTimeAgo").val();
            param.push("tago=" + taTimeAgo);
            let taTimeIn = $("#taTimeIn").val();
            param.push("tin=" + taTimeIn);
        } else if ($("#searchByDate").prop("checked")) {
            param.push("tp=d");
            let startDateFilter = $("#taFilterStartDate").val();
            param.push("sd=" + startDateFilter);
            let endDateFilter = $("#taFilterEndDate").val();
            param.push("ed=" + endDateFilter);
    
        }
        history.pushState({
            id: 'homepage'
        }, 'Home | My App', "?" + param.join("&"));
    }

    function setFieldsFromParams() {
        let params = window.location.search.substr(1);
        let paramsArr = params.split("&");

        let tSet=false;
        for (p in paramsArr) {
            let parr = paramsArr[p].split("=");
            let k = parr[0];
            let v = parr[1];

            switch(k) {
                case "tago": $("#taTimeAgo").val(v);
                break;
                case "tin": $("#taTimeIn").val(v);
                break;
                case "st": $("#taFilterStartTime").val(v);
                break;
                case "et": $("#taFilterStartTime").val(v);
                break;
                case "tid": $("#taFilterTrainId").val(v);
                break;
                case "sd": $("#taFilterStartDate").val(v);
                break;
                case "ed": $("#taFilterEndDate").val(v);
                break;
                case "l": $("#taOnlyLateTrains").prop('checked', true);;
                break;
                case "f": $("#fromStation").val(v);
                break;
                case "tp":
                tSet = true;
                if (v === "n") {
                    console.log("tp is n");
                    $("#searchNow").prop("checked", true);
                    $("#searchByDate").prop("checked", false);
                } else if (v === "d") {
                    console.log("tp is d");
                    $("#searchNow").prop("checked", false);
                    $("#searchByDate").prop("checked", true);
                }
                break;
                case "t": $("#toStation").val(v);
                break;
            }
        }
        if (!tSet) {
            console.log("tp is nothing");
            $("#searchNow").prop("checked", true);
            $("#searchByDate").prop("checked", false);
        }


        //console.log("Checking auto searching ");
        //console.log(params);
        if (params.length > 1) {
            //console.log("OK->Auto searching ");
            Search.search();
        }


    }

    return {
        updateUrl: updateUrl,
        setFieldsFromParams: setFieldsFromParams,
    };
})();

$(() => {
    Params.setFieldsFromParams();
});