'use strict';
//SP108E Adapter for ioBroker
//REV 0.0.1
const adaptername = "sp108e"

const utils = require('@iobroker/adapter-core');
var adapter  = utils.Adapter (adaptername);

var LOG_ALL = false;						//Flag to activate full logging

//SP108E CONNECTION values
var IPADR  = "192.168.85.144";	//SP108E IP address
var PORT = 8186;				//SP108E port of TCP server
var TIMING = 1000;				//Request timing for addtional added ports and analog inputs


// OBJECT ID of TIMED DATA REQUEST
var OBJID_REQUEST; 

// SP108E TCP Connection
var net = require ('net');
var client = new net.Socket();

	// Handler
	// client.on ('data',CBclientRECEIVE);
	client.on ('error',CBclientERROR);
	client.on ('close',CBclientCLOSED);
	client.on ('ready',CBclientCONNECT);
var APPLICATIONstopp = false;		//FLAG that shows that a reconnect process is runnig, after an error has occured.

//FLAG, true when connection established and free of error
var IS_ONLINE  = false;

//*************************************  ADAPTER STARTS with ioBroker *******************************************
adapter.on ('ready',function (){
	var i;
    //Move the ioBroker Adapter configuration to the container values 
	IPADR = adapter.config.ipaddress;
	PORT = adapter.config.port;
	TIMING = adapter.config.requesttiming; 
	adapter.log.info ("SP108E " + IPADR + " Port:" + PORT );
});


//************************************* ADAPTER CLOSED BY ioBroker *****************************************
adapter.on ('unload',function (callback){
	APPLICATIONstopp = true
	IS_ONLINE = false;
	adapter.log.info ('SP108E: Close connection, cancel service');
	client.close;
	callback;
	});


//************************************* Adapter STATE has CHANGED ******************************************	
adapter.on ('stateChange',function (id,obj){
	if (!IS_ONLINE){return;}								
	if (obj==null) {
		adapter.log.info ('Object: '+ id + ' terminated by user');
		return;
	}
		
});


//************************************* TCP CONNECT /ERROR / CLOSED ****************************************
function CONNECT_CLIENT () {
	IS_ONLINE = false;
	adapter.log.info("Connecting SP108E controller " + IPADR + " "+ PORT);
	client.connect (PORT,IPADR);
}

//CLIENT SUCCESSFUL CONNECTED (CALLBACK from CONNECT_CLIENT)
function CBclientCONNECT () {
	//adapter.setState ('info.connection',true,true);
	adapter.log.info ('SP108E connection established');
	IS_ONLINE = true;
}

//CLIENT ERROR HANDLER AND CONNECTION RESTART
function CBclientERROR(Error) {
	IS_ONLINE = false;											//Flag Connection not longer online
	adapter.log.error ("Error SP108E connection: " + Error);	
	client.close;												//Close the connection
}
function CBclientCLOSED() {
	adapter.log.warn ("SP108E connection closed");
	if (APPLICATIONstopp ==false) {
		var RCTASK = setTimeout (CONNECT_CLIENT,30000);			//within 30 Sec.
		adapter.log.info ("Trying to reconnect in 30sec.");
	}
		
}


