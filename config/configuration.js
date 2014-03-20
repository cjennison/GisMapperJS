GisMap = {};
LOADPERCENTAGE = 0;
var dd;
(function(){

	//Loads the core library of files
	var libraryList = [
		"core",
		"layer",
		"map",
		"interface",
		"external",
		"tasks",
		"gis"
	]

	//GisMapper Library Files
	$.getScript("./library/util.js", function(e){
		GisMap.Util.MAX_FILES = libraryList.length;
		for(var file in libraryList){
			
			var load = GisMap.Util.loadFile(libraryList[file], function(complete){
				if(complete)
					loadUserConfiguration();
			})
		}
	});
	

})();

function loadUserConfiguration(){
	$.getJSON("./config/user_config.json", function(e){
		//Determine the Application in use
		var application = GisMap.Util.parseURL().app.toUpperCase();
		setUpApplication(application, e);
		
	});
	
}

function setUpApplication(application, data){
	var apps = data.APPLICATIONS;
	for(var app in apps){
		GisMap.Core.Applications.push(apps[app]);
		if(apps[app].title == application){
			GisMap.Core.initialize(apps[app]);
		}
	}
}
