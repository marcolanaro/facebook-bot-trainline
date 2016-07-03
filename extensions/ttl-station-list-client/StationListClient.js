exports.stationListClient = function () {
    var Immutable = require("immutable");

    var stationlist = require("./stationlist.json").map(function(station) {
        return Immutable.Record(station)();
    });
    
    var makeMaps = function () {
        return stationlist.reduce(function (previousValue, currentValue) {
            return {
                byCode: previousValue.byCode.set(currentValue.code, currentValue),
                byName: previousValue.byName.set(currentValue.name, currentValue)
            };
        }, {byCode:Immutable.Map(), byName:Immutable.Map()});
    };
    var maps = makeMaps();
    var unknownStation = {
        name: null,
        code: null
    };    

    return {
        getCodeFromName: function (name) {
            return maps.byName.get(name, unknownStation).code;
        },
        getNameFromCode: function (code) {
            return maps.byCode.get(code, unknownStation).name;
        },
        getAllStations: function (options) {
            options = options || {};
            var all = Immutable.Seq(stationlist);
            
            if (typeof options.stationGroups !== 'undefined' && !options.stationGroups) {
                all = all.filter(function(s) {
                    return !/^[0-9]*$/.test(s.code);
                });
            }

            return all;
        },
        getStation: function (code) {
            return maps.byCode.get(code, null);
        }
    };
};