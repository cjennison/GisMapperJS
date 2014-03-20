var NALCC_MODELS = {
	
	
	/**
	 * Basin Delineation, takes in a lat and lon position and delineates a catchment upstream
 	 * @param {Object} lat Latitude
	 * @param {Object} lon Longitude
	 * @param {Object} username (Optional) A username for use from within NALCC Applications
	 * @param {fn} cb Any callback
	 * @return {Object} The basin ID object. Use the sponsors directions for usage
	 */
	BASIN_DELINEATION:function(lat, lon, username, cb){
		NALCC_MODELS.copyright();
		if(lat == null || lon == undefined){
			new Error("LATITUDE OR LONGITUDE ARE UNDEFINED");
		}
		
		if(username == null)
			username = "testuser1";
			
		$.post("http://felek.cns.umass.edu:8888/remote-delineation-nologin", {
			username:username,
			lat:lat,
			lng:lon
		}, function(r){
			if(cb)
				cb(r)
				
			return r;
		})
		
	},
	
	
	OCCUPANCY_MODEL:function(id, cb){
		NALCC_MODELS.copyright();
		
		var dir = Math.round(Math.random()*10000000000);
		
		var data = $.post("http://felek.cns.umass.edu:8888/mapmodels/Occupancy", 
		//Body
		{
			catchmentID:id,
			writeDIR:dir
		},
		//Callback
		function(res){
			console.log(res);
			if(cb)
				cb(res);
		}	
	)
		
	},
	
	
	copyright:function(){
		console.log("If this message is not present, the model being used is invalid or being used without permission.");
		console.log("This Model is property of the United States Geological Survey and the North Atlantic Land Conservation Cooperative.");
		console.log("Copyright 2014, Silvio Conte Anadromous Fish Research Center.")
		console.log("This Application has been given permission to use this model. If you have not been given permission, please remove this script immediately.")
	}
}
