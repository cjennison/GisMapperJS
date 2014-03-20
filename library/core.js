/**
 * CORE ENGINE FILE
 * Handles Initialization of applications
 */
GisMap.Core = {
    Applications: [],
    Application: null,

    initialize: function (application) {
		
    	GisMap.Tasks.init();
    	
        //Set the document title
        document.title = application.html_title;
        this.Application = application;

        GisMap.Util.MAX_APP_FILES = application.sources.length;
        require(["../app/" + application.dir + "/" + application.main], function () {

            if (application.sources.length == 0) {
                loadPartner();
            } else {
            	for (var file in application.sources) {
	                var load = GisMap.Util.loadApplicationFile(application.sources[file], application.dir, function (complete) {
	                    if (complete)
	                        loadPartner();
	                })
	            }
            }

            

			//Loads the Partner Sources
            function loadPartner() {
            	GisMap.Util.MAX_APP_FILES = application.partner_sources.length;
            	GisMap.Util.LOADED_APP_FILES = 0;
                if (application.partner_sources.length == 0) {
                    GisMap.Core.injectHtml(STARTAPPLICATION);
                    return;
                }
                for (var file in application.partner_sources) {
                    var load = GisMap.Util.loadPartnerFile(application.partner_sources[file], function (complete) {
                        if (complete)
                            GisMap.Core.injectHtml(STARTAPPLICATION);
                            
                           
                    })
                }
            }
        });
        
        if(application.CSSFiles.length > 0){
        	var head = document.getElementsByTagName('head')[0];
        	for(var css in application.CSSFiles){
        	   link = document.createElement('link');
			   link.type = 'text/css';
			   link.rel = 'stylesheet';
			   link.href = "./style/" + application.dir + "/" + application.CSSFiles[css];
			   head.appendChild(link);
        	}
        }



    },
    
    injectHtml:function(cb){
    	
    	//Add map
    	var map = $("<div id='map'></div>");
    	$('body').append(map);
    	
    	//Remove logo
    	$("#gismap-logo").remove();
    	
    	//Add default top bar
    	var panel = $("<div id='panel'><h3 style='font-weight:900;margin-top:5px;' >" + this.Application.titleLabel + "</h3></div>");
    	$('body').append(panel);
    	
    	GisMap.UI.containers.push(panel);
    	
    	//TODO: Set Favicon
    	var link = document.createElement('link');
	    link.type = 'image/x-icon';
	    link.rel = 'shortcut icon';
	    link.href = 'http://www.stackoverflow.com/favicon.ico';
	   // document.getElementsByTagName('head')[0].appendChild(link);
    	
    	cb();
    }

}