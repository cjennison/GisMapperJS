GisMap.External = {
	
	/**
	 * loadJSON loads a JSON object externally into a given callback function 
	 * @param {Object} url
	 */
	loadJSON:function(url, cb){
		if(url == null)
			throw new Error("URL was Null");
			
		$.getJSON(url, function(d){
			cb(d);
		});
	}
	
	
	
	
	
}
