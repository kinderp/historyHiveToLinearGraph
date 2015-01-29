/*jshint browser:true*/
/*global MashupPlatform*/

(function () {
	
	"use strict";
	var observed_prop, poiType, poiID;

    var changeObs = function changeObs(sensorPOI) {
        var sensorId, from, to, sensorParsed, numberOfDays, today;
        var entityDataPOI;

        /*
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
		*/
        sensorParsed = JSON.parse(sensorPOI);
        entityDataPOI = sensorParsed.poi.data;
        poiID = sensorParsed.poi.id;
        
        //se l'entità cliccata sulla mappa è un observations
        if(entityDataPOI.type == "observations"){
        	poiType = "observations";
        	
        	//controllo qual'è l'observed_property dell'observations sulla base della presenza dell'attributo Service1/2/3
        	if(entityDataPOI.Service1)
        		observed_prop = "pm10";
        	else if(entityDataPOI.Service2)
        		observed_prop = "temperature";
        	else if(entityDataPOI.Service3)
        		observed_prop = "pressure";
        }
        
        //se l'entità cliccata sulla mappa è un taxi
        else if(entityDataPOI.type == "Taxi"){
        	poiType = "Taxi";
        }
        	
        /*
        // Change to the new Sensor
        var requestParams = {
            "method": "GET",
            //"supportsAccessControl": true,
            "onSuccess": processHistoricData.bind(this, sensorId),
            "onFailure": onFailure.bind(this, sensorId)
        };
        */
        var requestParams = {
                "method": "GET",
                //"supportsAccessControl": true,
                "onSuccess": processHistoricData.bind(this),
                "onFailure": onFailure.bind(this)
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
        
        /*
        if (sensorId.match('Taxi1')){
        	 MashupPlatform.http.makeRequest(url + "/taxi/" + sensorId, requestParams);
        }
        */
        
        if(poiType.match('Taxi')){
        	loadMsg = "It's not possible to graph data of a taxi!\nClick on an observation on the map";
            MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(loadMsg));
        	
        }
        else if(poiType.match('observations')){
        	MashupPlatform.http.makeRequest(url + "/observations?id=" + poiID +"&type=observations", requestParams);
        }
    };
    
    
    var onFailure = function onFailure(/*sensorId*/) {
        // Use demo data if the request fails

        var parsedResponse = {
            'responseText': null
        };

        var failMsg = 'Error: Hive server unreacheable!';
        MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(failMsg));
    };

    
    var processHistoricData = function processHistoricData(/*sensorId*/response) {
        var i, parsedResponse, data, id, lampObservationId, config;

        // First element is the older.
        
        //if (typeof response.responseText != 'object') {
          //  parsedResponse = JSON.parse(response.responseText);
        //} else {
            var parsedResponseText = response.responseText;
            parsedResponse = JSON.parse(response.responseText);

            /*
            var data2 = parsedResponse.date;
            var temp2 = parsedResponse.temperature;
            var pres2 = parsedResponse.pressure;
            var pm102 = parsedResponse.pm10;
            
            var elem2 = JSON.parse(parsedResponse[2]);
            var date3 = elem2.date;
            var temp3 = elem2.temperature;
            var pres3 = elem2.pressure;
            var pm103 = elem2.pm10;
            */
            
            
        //}

        id = 69;

        //if (sensorId.match('Taxi1')) {
        if (poiType.match('observations')) {
            // Axis config
        	if(observed_prop == "temperature"){
        	config = {
                'axisConfig': [
                    {
                        axisId: 0,
                        label: observed_prop,
                        color: '#00A8F0',
                        max: 300,
                        min: -300,
                        //ticks: [-300, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300]
                        ticks : null
                    }
                ],
                'title': poiID,
                'leyend': {
                    position: 'ne'
                },
        		'oneData': true
        		//'colors':'#00A8F0'
            };
            MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(config));

            data = [];
            for (i = parsedResponse.length - 1; i > 0; i -= 1) {
                // History-Mod internal id
                //lampObservationId = parsedResponse[i].id;
            	var elem = JSON.parse(parsedResponse[i]);
                data.push({
                    'id': 0,
                    'value': [elem.date, elem.value],
                    'label': observed_prop,
                    'axis': 1,
                    'color':'#00A8F0'
                });
            }
        }
        	else if(observed_prop == "pressure"){
                config = {
                    'axisConfig': [
                        {
                            axisId: 0,
                            label: observed_prop,
                            color: '#93a600',
                            max: 300,
                            min: 0,
                            //ticks: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300]
                            ticks : null
                        }
                    ],
                    'title': poiID,
                    'leyend': {
                        position: 'ne'
                    },
                    'oneData': true
                    //'colors':'#93a600'
                    
                };
                MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(config));

                data = [];
                for (i = parsedResponse.length - 1; i > 0; i -= 1) {
                    // History-Mod internal id
                    //lampObservationId = parsedResponse[i].id;
                	var elem = JSON.parse(parsedResponse[i]);
                    data.push({
                        'id': 0,
                        'value': [elem.date, elem.value],
                        'label': observed_prop,
                        'axis': 1,
                        'color':'#93a600'
                    });
                }
        	}
        	else if(observed_prop == "pm10"){
                config = {
                    'axisConfig': [
                        {
                            axisId: 0,
                            label: observed_prop,
                            color: '#CB4B4B',
                            max: 100000,
                            min: 0,
                            //ticks: [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000]
                            ticks : null
                        }
                    ],
                    'title': poiID,
                    'leyend': {
                        position: 'ne'
                    },
                    'oneData': true
                    //'colors': '#CB4B4B'
                };
                
                MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(config));

                data = [];
                for (i = parsedResponse.length - 1; i > 0; i -= 1) {
                    // History-Mod internal id
                    //lampObservationId = parsedResponse[i].id;
                	var elem = JSON.parse(parsedResponse[i]);
                    data.push({
                        'id': 0,
                        'value': [elem.date, elem.value],
                        'label': observed_prop,
                        'axis': 1,
                        'color': '#CB4B4B'
                    });
                }
        	}
        	
        	/*
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
            */
            MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify(data));
            MashupPlatform.wiring.pushEvent("OutputStatus", JSON.stringify('END'));

        // AMMS
        } 
        

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
