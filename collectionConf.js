function getConf() {
    var stations = new Set([
        "Kn",
        "Cst",
        "Suc",
        "U",
        "Mr",
        "Sci",
        "Et",
        "Sgs",
        "G",
        "Ep",
    ]);
    return stations;
}

var CollectionConf = (function () {
    return {
        getConf: getConf
    };
})();

if (typeof module !== 'undefined') {
    module.exports = {
        getConf,
    }
}

