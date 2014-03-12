GisMap.Util = {
	loadFile:function(file, cb){
		require(["../library/" + file], function(util) {
		    GisMap.Util.LOADED_FILES++;
		    cb(GisMap.Util.LOADED_FILES == GisMap.Util.MAX_FILES);
		});
	},
	
	loadApplicationFile:function(file, dir, cb){
		require(["../app/" + dir + "/" + file], function(util) {
		    GisMap.Util.LOADED_APP_FILES++;
		    cb(GisMap.Util.LOADED_APP_FILES == GisMap.Util.MAX_APP_FILES);
		});
	},
	
	loadPartnerFile:function(file, cb){
		require([file], function(util) {
		    GisMap.Util.LOADED_APP_FILES++;
		    cb(GisMap.Util.LOADED_APP_FILES == GisMap.Util.MAX_APP_FILES);
		});
	},
	
	
	parseURL:function(){
	  var query = location.search.substr(1);
	  var data = query.split("&");
	  var result = {};
	  for(var i=0; i<data.length; i++) {
	    var item = data[i].split("=");
	    result[item[0]] = item[1];
	  }
	  return result;
	}
}


//** STATIC **//
GisMap.Util.LOADED_FILES = 0;
GisMap.Util.MAX_FILES = 0;

GisMap.Util.MAX_APP_FILES = 0;
GisMap.Util.LOADED_APP_FILES = 0;//** STATIC **//