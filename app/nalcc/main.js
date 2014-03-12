
var RULES,
	LAYERS;



//This application should at most only contain methods that formulate the interface of your map.
//To avoid clutter, use additional files and load them in.
//Examples: static variables, special application functions, etc
function STARTAPPLICATION() {

	//REQUIRED - Instantiate Map here before all application commands
	GisMap.Map.init();
	
	GisMap.Tasks.push(function(cb){
		GisMap.External.loadJSON("./app/nalcc/data/rules.json", function(d){RULES = d; cb()});
	})
	
	GisMap.Tasks.push(function(cb){
		GisMap.External.loadJSON("./app/nalcc/data/layers.json", function(d){LAYERS = d;console.log(d); cb()});
	})
	
	
	
	
	//Add a basemap
	/*
	 GisMap.Layer.loadBasemap(ol.source.MapQuest, {
	 layer : 'sat'
	 })
	 */

	GisMap.Layer.loadBasemap(ol.source.Stamen, {
		layer : 'toner'
	})

	//Make a Panel for your buttons, maybe a tool bar on the right side?
	var tool_panel = GisMap.UI.spawnPanel({
		class 		    : 'tools' //All of your styling should be done in CSS or in the callback
	}, function(obj){
		//Additional things to do with this panel
		
		//Make it a list!
		$(obj.div).append("<ul></ul>");
		
		
		//Here is where you may want to add buttons
		var optionsButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm", 				//class of th ebutton
			text	:"<span class='glyphicon glyphicon-pencil'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			event	:function(){console.log("Options")} //click function
		}, null)
		
		//And another
		var searchButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm", 				//class of th ebutton
			text	:"<span class='glyphicon glyphicon-globe'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			event	:function(e){console.log("Search")} //click function
		}, null);
		
		var delinButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm delin-btn", 		//class of th ebutton
			text	:"<span class='glyphicon glyphicon-question-sign'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			event	:function(e){console.log("Delineation")} //click function
		}, null);
		
		var pabButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm btn-success pan-btn cursorBtn", 	//class of th ebutton
			text	:"<span class='glyphicon glyphicon-fullscreen'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			event	:function(e){console.log("Panner")} //click function
		}, null);
		
		var imgButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm img-btn ", 	//class of th ebutton
			text	:"<span class='glyphicon glyphicon-floppy-disk'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			event	:function(e){
				  $(".downloader").parent().attr("href", GisMap.Map.imageSave());
				  GisMap.Map.map.render();
				  $(".downloader").addClass("active");
			} //click function
		}, null);
		
		var download = $("<a href='#' target='_blank'><div class='downloader'>Click to download your file!</div></a>");
		$(download).on('click', function(){
			$(".downloader").removeClass("active");
		})
		$("body").append(download);
		
	});
	
	//Building some dropdowns
	buildPanelDropdowns();
	
	/*
	//A WMS Layer!
	var nLay = new LayerOptions({
		name:"Agricultural",
		source: ol.source.TileWMS,
		url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
		params: {
			'LAYERS' : 'Streams:Agricultural', 'TILED':true},
		serverType:"geoserver"
	});
	
	GisMap.Layer.createNewLayer("LOCAL", nLay);
	
	//Push a task to the task manager
	GisMap.Tasks.push(function(cb){
		
		GisMap.UI.createJSONLegend(null, RULES, "Agricultural", {draggable:true}, null);
		cb();
		
		//Alter the closing legend button to do additional work
		$("#legend-close").attr('onclick', "GisMap.UI.hideLegend(true,disableLegend())");
	})
	
	*/
	
	GisMap.Tasks.push(function(cb){
		buildLayerPanel();
		cb();
	})
	
	GisMap.Tasks.push(function(cb){
		GisMap.UI.addLatLon("body", "LatLonBox");
		cb();
	});
	
	GisMap.Tasks.push(function(cb){
		GisMap.UI.addScale("body", "ScaleBox");
		cb();
	})
	
	
}

//This is a legend disabled via the button
function disableLegend(){
	$(".legend_toggle").prop("checked",false);
	LayerControl.legend_toggled = false;
}

function buildPanelDropdowns(){
	
	var BasinCharacteristics = GisMap.UI.spawnDropdown(GisMap.UI.containers[0], '<li role="presentation"><a role="menuitem"tabindex="-1" href="#"  onmousedown="AppLayer.generateLayer(this)" data-layer="Agricultural" data-id="CATCHMENT" data-type="LOCAL">Percent Agricultural</a></li><li role="presentation"><a role="menuitem"tabindex="-1" href="#"  onmousedown="AppLayer.generateLayer(this)" data-layer="Forest" data-type="LOCAL">Percent Forested</a></li>', {
		name: "basin",
		label:"Basin Characteristics"
	});
	
	var StreamEnvironment = GisMap.UI.spawnDropdown(GisMap.UI.containers[0], '<li role="presentation"><a role="menuitem"tabindex="-1" href="#"  onmousedown="createLayer(this)" >Topography &amp; Physical Characteristics</a></li>', {
		name: "environment",
		label:"Stream Environment"
	})
	
	var Fish = GisMap.UI.spawnDropdown(GisMap.UI.containers[0], '<li role="presentation"><a role="menuitem"tabindex="-1" href="#"  onmousedown="createLayer(this)">Topography &amp; Physical Characteristics</a></li>', {
		name: "fish",
		label:"Fish"
	})
	
	
}

function buildLayerPanel(){
	var layer_panel = GisMap.UI.spawnPanel({
		class:'layer-options'
	}, function(ret){
		
		GisMap.UI.appendElement(ret.div, "<h3 style='margin: -9px;font-weight: 400;'>Layer Control</h3>");
		LayerControl.init(ret.div);
		
		
	})
	
}








