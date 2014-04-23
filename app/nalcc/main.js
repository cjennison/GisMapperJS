
var RULES,
	LAYERS,
	INFO_FORMAT;



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
	
	GisMap.Tasks.push(function(cb){
		GisMap.External.loadJSON("./app/nalcc/data/informationformat.json", function(d){INFO_FORMAT = d;console.log(d); cb()});
	})
	
	
	
	
	
	//Add a basemap
	/*
	 GisMap.Layer.loadBasemap(ol.source.MapQuest, {
	 layer : 'sat'
	 })
	 */

	GisMap.Layer.loadBasemap(ol.source.OSM, {
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
			class	:"btn btn-default btn-sm options-btn", 				//class of th ebutton
			text	:"<span class='glyphicon glyphicon-wrench'></span>", 	//text for the button
			list	:true, 								//if the button is part of a list
			tooltip : {
				placement:"left",
				text:"Options"
			},
			event	:function(){ToolBar.toggleOptions()} //click function
		}, null)
		
		//And another
		var searchButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm search-btn", 				//class of th ebutton
			text	:"<span class='glyphicon glyphicon-globe'></span>", 	//text for the button
			list	:true, 		
			tooltip : {
				placement:"left",
				text:"Search"
			},						//if the button is part of a list
			event	:function(e){ToolBar.toggleSearch()} //click function
		}, null);
		
		var delinButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm delin-btn cursorBtn", 		//class of th ebutton
			text	:"<span class='glyphicon glyphicon-question-sign'></span>", 	//text for the button
			list	:true, 	
			tooltip : {
				placement:"left",
				text:"Delineation"
			},							//if the button is part of a list
			event	:function(e){ToolBar.toggleCursor(this)} //click function
		}, null);
		
		var pabButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm btn-success pan-btn cursorBtn", 	//class of th ebutton
			text	:"<span class='glyphicon glyphicon-fullscreen'></span>", 	//text for the button
			list	:true, 	
			tooltip : {
				placement:"left",
				text:"Pan"
			},							//if the button is part of a list
			event	:function(e){ToolBar.toggleCursor(this)} //click function
		}, function(e){
			$(e).parent().css("margin-top","-1px");
		});
		
		var imgButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm img-btn ", 	//class of th ebutton
			text	:"<span class='glyphicon glyphicon-floppy-disk'></span>", 	//text for the button
			list	:true, 		
			tooltip : {
				placement:"left",
				text:"Save Map"
			},						//if the button is part of a list
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
		
		var basinsButton = GisMap.UI.spawnButton(obj.div, {
			class	:"btn btn-default btn-sm img-btn basin-btn", 	//class of th ebutton
			text	:"<span class='glyphicon glyphicon-home'></span>", 	//text for the button
			list	:true, 		
			tooltip : {
				placement:"left",
				text:"My Basins"
			},						//if the button is part of a list
			event	:function(e){
				 ToolBar.toggleBasins();
			} //click function
		}, null);
		
		
	});
	
	//Building some dropdowns
	GisMap.Tasks.push(function(cb){
		buildPanelDropdowns();
		cb();
	})
	
	
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
	});
	
	
	//Create an Options Panel
	ToolBar.optionsPanel = GisMap.UI.spawnPanel({class:"options-panel"}, function(ret){
		console.log(ret.div);
		$(ret.div).draggable({containment:'parent'})
		$(ret.div).append("<h3 style='font-weight:400;margin-left: 20px;margin-top: 9px;'>Options</h3>");
		$(ret.div).append("<div id='options-close' class='btn btn-danger' onclick='ToolBar.hideOptions()'><span class='glyphicon glyphicon-remove'></span></div>");
		$(ret.div).append("There are no options available.")
	});
	
	//Create a Geo Searcher
	ToolBar.searchPanel = GisMap.UI.spawnGeoLocator("body", "searcher", function(el){
		$(el).draggable({containment:'parent'});
		$(el).find("input").css('height','31px');
		$(el).append("<div id='search-location' style='margin-left: 6px;' class='btn btn-primary' onclick='ToolBar.makeSearch(this)'>Search</div>");
		$(".searcher").find("input").keyup(function(event){
			if(event.keyCode == 13){
				$("#search-location").click();
			}
		});
		$(el).append("<div id='options-close' style='padding: 11px 12px;' class='btn btn-danger' onclick='ToolBar.hideSearch()'><span class='glyphicon glyphicon-remove'></span></div>");
	});
	
	GisMap.Tasks.push(function(cb){
		User.showUserPanel();
		cb();
	});
	/*
	GisMap.Tasks.push(function(cb){
		GisMap.Map.addFullScreen();
		cb();
	});
	*/	
	
	
	
	GisMap.Tasks.push(function(cb){
		if(localStorage.beenHereBefore != "true"){
			//localStorage.setItem("beenHereBefore", 'true'); //TODO: REMOVE WHEN READY
			console.log("So you are new here?");
			//spawnWelcomePage();
			
		}
		
		
		
		cb();
	});
	
}


function spawnWelcomePage(){
	var welcome = $("<div class='jumbotron welcome'><h1>Welcome!</h1><h6>To the NALCC/DECSC Web Mapping Application.</h6><p>This is a paragraph that contains things that I would imagine are somewhat helpful to understanding what the silly application is. Perhaps if one read this paragraph that would be able to decipher the uses of the application, or perhaps view a tutorial. Now that would be something, wouldn't it?'</div>");
	
	//$(welcome)
	
	
	$("body").append(welcome);
	
}

//This is a legend disabled via the button
function disableLegend(){
	$(".legend_toggle").prop("checked",false);
	LayerControl.legend_toggled = false;
}

function buildPanelDropdowns(){
	
	
	var basinList = LAYERS.CATEGORIES.BASIN;
	var basinMaster = [];
	for(var l in basinList){
		basinMaster.push("<li class='master-list-item' data-link='" + basinList[l] + "'>" + basinList[l] + " <span class='glyphicon glyphicon-chevron-right'></span></li>")
	}
	
	var basinSubs = [
	{
		link:"Climate",	
		list:[],
	},{
		link:"Land Use",	
		list:[],
	},{
		link:"Geology",	
		list:[],
	},{
		link:"Topography",	
		list:[],
	}];
	
	
	var layers = LAYERS.LAYERS;
	for(var l in layers){
		var lay = layers[l];
		for(var sub in basinSubs){
			if(lay.Category == basinSubs[sub].link){
				//Weed out upstream entries
				var id = lay.Layer.split("_");
				if(id[id.length-1] == "Upstream") break;
				
				var li = "<li draggable='true' data-layer='" + lay.Layer + "' data-type='" + lay.DataType + "' data-id='"+ lay.FeatureType +"'  onclick='AppLayer.generateLayer(this)'>" + lay.Label + "</li>";
				
				basinSubs[sub].list.push(li)
				
				break;
			}
		}
		
	}
	
	
	
	
	
	
	
	
	var streamList = LAYERS.CATEGORIES.STREAM;
	var streamMaster = [];
	for(var l in streamList){
		streamMaster.push("<li class='master-list-item' data-link='" + streamList[l] + "'>" + streamList[l] + " <span class='glyphicon glyphicon-chevron-right'></span></li>")
	}
	
	var streamSubs = [
	{
		link:"Stream Flow",	
		list:[],
	},{
		link:"Stream Temp",	
		list:[],
	}];
	
	
	var layers = LAYERS.LAYERS;
	for(var l in layers){
		var lay = layers[l];
		for(var sub in streamSubs){
			if(lay.Category == streamSubs[sub].link){
				streamSubs[sub].list.push("<li draggable='true' data-layer='" + lay.Layer + "' data-type='" + lay.DataType + "' data-id='"+ lay.FeatureType +"'  onclick='AppLayer.generateLayer(this)'>" + lay.Label + "</li>")
				break;
			}
		}
		
	}
	
	
	var fishList = LAYERS.CATEGORIES.FISH;
	var fishMaster = [];
	for(var l in fishList){
		var label = fishList[l].split("_");
		if(label[1] == "LABEL"){
			fishMaster.push("<li class='master-list-item' style='pointer-events:none;font-size: 14px;color: rgba(0, 0, 0, 0.78);font-weight: 700;'>" + label[0] + "</li>")
		} else {
			fishMaster.push("<li class='master-list-item' data-link='" + fishList[l] + "'>" + fishList[l] + " <span class='glyphicon glyphicon-chevron-right'></span></li>")
		}
		
	}
	
	var fishSubs = [
	{
		link:"Observed",	
		list:[],
	},{
		link:"Future",	
		list:[],
	},{
		link:"Resilience",	
		list:[],
	}
	
	];
	
	var layers = LAYERS.LAYERS;
	for(var l in layers){
		var lay = layers[l];
		for(var sub in fishSubs){
			if(lay.Category == fishSubs[sub].link){
				fishSubs[sub].list.push("<li draggable='true' data-layer='" + lay.Layer + "' data-type='" + lay.DataType + "' data-id='"+ lay.FeatureType +"'  onclick='AppLayer.generateLayer(this)'>" + lay.Label + "</li>")
				break;
			}
		}
		
	}
	
	var btngroup = $("<div class='btn-group mainnav'></div>");
	
	
	var BasinPanel = GisMap.UI.createPanelDropdown(basinMaster, basinSubs, {
		class:"basin-panel",
		title:"Basin Characteristics"
		}, null);
	var StreamPanel = GisMap.UI.createPanelDropdown(streamMaster, streamSubs, {
		class:"stream-panel",
		title:"Stream Environment"
		}, null);
	var FishPanel = GisMap.UI.createPanelDropdown(fishMaster, fishSubs, {
		class:"fish-panel",
		title:"Fish"
		}, null);
	
	
	var basinButton = GisMap.UI.spawnButton(btngroup, {
		class:"basin_button btn btn-default",
		text:"Basin Characteristics",
		event:function(e){
			$(".dropdownpanel").removeClass("active");
			$(".basin-panel").addClass("active");
		}
	});
	
	var StreamButton = GisMap.UI.spawnButton(btngroup, {
		class:"stream_button btn btn-default",
		text:"Stream Environment",
		event:function(e){
			$(".dropdownpanel").removeClass("active");
			$(".stream-panel").addClass("active");
		}
	});
	
	var fishButton = GisMap.UI.spawnButton(btngroup, {
		class:"fish_button btn btn-default",
		text:"Fish",
		event:function(e){
			$(".dropdownpanel").removeClass("active");
			$(".fish-panel").addClass("active");
		}
		
	});
	
	$(GisMap.UI.containers[0]).append(btngroup);
	
	
	
	//Drag Event
	$(".dropdownpanel .sub-list li").on('dragstart', function(e){
		LayerControl.dragTarget = this;
	})
	
	
	
	
	
	/*
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
	*/
	
	
}

function buildLayerPanel(){
	var layer_panel = GisMap.UI.spawnPanel({
		class:'layer-options'
	}, function(ret){
		
		GisMap.UI.appendElement(ret.div, "<h3 style='margin: -9px;font-weight: 400;'>Layer Control</h3>");
		LayerControl.init(ret.div);
		
		
	})
	
}








