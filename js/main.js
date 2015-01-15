/*jshint browser:true*/
/*global MashupPlatform*/

(function () {
	
	"use strict";

    var changeObs = function changeObs(sensorPOI) {
        var sensorId, from, to, sensorParsed, numberOfDays, today;

        // get the sensorId
        if (sensorPOI != 'Taxi1') {
            sensorParsed = JSON.parse(sensorPOI);
            sensorId = sensorParsed.poi.data.id;
        } else {
            // only for test
            //var ids = ['OUTSMART.RG_LAS_LLAMAS_01', 'OUTSMART.NODE_3509', 'OUTSMART.AMMS_06E1E5B2100009549'];
        	//sensorId = ids[test];
        	var ids = ['Taxi1'];
        	sensorId = 'Taxi1';
            
        }

        // Change to the new Sensor
        var requestParams = {
            "method": "GET",
            //"supportsAccessControl": true,
            "onSuccess": processHistoricData.bind(this, sensorId),
            "onFailure": onFailure.bind(this, sensorId)
        };

        // Send loading msg by OutputStatus endpoint
        var loadMsg = 'loading ' + sensorId;
        MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(loadMsg));

        numberOfDays = parseInt(MashupPlatform.prefs.get("number_of_days"), 10);
        if (typeof numberOfDays != 'number') {
            numberOfDays = 3;
        }
        today = new Date();
        from = today.getTime() - (numberOfDays /* days */ * 24 /* hours */ * 60 /* mins */ * 60 /* segs */ * 1000 /* miliseconds */);
        to = today.getTime();

        var url = MashupPlatform.prefs.get('historymod_hiveserver');
        /*
        if (sensorId.match(/^OUTSMART.NODE_/)) {
            MashupPlatform.http.makeRequest(url + "/lamps/between/" + sensorId + '/' + from + '/' + to, requestParams);
        } else if (sensorId.match(/^OUTSMART.AMMS_/)) {
            MashupPlatform.http.makeRequest(url + "/amms/between/" + sensorId + '/' + from + '/' + to, requestParams);
        } else if (sensorId.match(/^OUTSMART.RG_/)) {
            MashupPlatform.http.makeRequest(url + "/regulators/between/" + sensorId + '/' + from + '/' + to, requestParams);
        }
        */
        if (sensorId.match('Taxi1')){
        	 MashupPlatform.http.makeRequest(url + "/taxi/" + sensorId, requestParams);
        }
    };
    
    
    var onFailure = function onFailure(sensorId) {
        // Use demo data if the request fails

        var parsedResponse = {
            'responseText': null
        };

        var failMsg = 'Error: Hive server unreacheable!';
        MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(failMsg));
    };

    
    var processHistoricData = function processHistoricData(sensorId, response) {
        var i, parsedResponse, data, id, lampObservationId, config;

        // First element is the older.
        
        //if (typeof response.responseText != 'object') {
          //  parsedResponse = JSON.parse(response.responseText);
        //} else {
            var parsedResponseText = response.responseText;
            parsedResponse = JSON.parse(response.responseText);

            var data2 = parsedResponse.date;
            var temp2 = parsedResponse.temperature;
            var pres2 = parsedResponse.pressure;
            var pm102 = parsedResponse.pm10;
            
            var elem2 = JSON.parse(parsedResponse[2]);
            var date3 = elem2.date;
            var temp3 = elem2.temperature;
            var pres3 = elem2.pressure;
            var pm103 = elem2.pm10;
            
            
        //}

        id = 69;

        if (sensorId.match('Taxi1')) {
            // Axis config
            config = {
                'axisConfig': [
                    {
                        axisId: 0,
                        label: 'Temperature',
                        color: '#00A8F0',
                        max: 300,
                        min: -300,
                        ticks: [-300, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300]
                    },
                    {
                        axisId: 1,
                        label: 'Pressure',
                        color: '#93a600',
                        max: 300,
                        min: 0,
                        ticks: [0, 50, 100, 150, 200, 250, 300]
                    },
                    {
                        axisId: 2,
                        label: 'PM10',
                        color: '#CB4B4B',
                        max: 100000,
                        min: 0,
                        ticks: [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000]
                    }
                ],
                'title': sensorId,
                'leyend': {
                    position: 'ne'
                }
            };
            MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(config));

            data = [];
            for (i = parsedResponse.length - 1; i > 0; i -= 1) {
                // History-Mod internal id
                //lampObservationId = parsedResponse[i].id;
            	var elem = JSON.parse(parsedResponse[i]);
                data.push({
                    'id': 0,
                    'value': [elem.date, elem.temperature],
                    'label': 'Temperature',
                    'axis': 1
                });
                data.push({
                    'id': 1,
                    'value': [elem.date, elem.pressure],
                    'label': 'Pressure',
                    'axis': 2
                });
                data.push({
                    'id': 2,
                    'value': [elem.date, elem.pm10],
                    'label': 'PM10',
                    'axis': 3
                });
            }
        // AMMS
        } 
        
        MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(data));
        MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify('END'));
    };
    
    // input callback
    var handlerSensorIdInput = function handlerSensorIdInput(sensorId) {
        if (sensorId) {
            changeObs.call(this, sensorId);
        }
    };
	
	MashupPlatform.wiring.registerCallback("ObservationIdInput", handlerSensorIdInput.bind(this));
	
	//handlerSensorIdInput('Taxi1');

})();
