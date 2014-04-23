LayerControl = {

	container : null,

	currentLayer : "No Layer Selected",
	previousLayer : [],
	opacity : true,
	local_upstream_radio : false,
	t_flowlines : false,
	t_outline : false,
	t_basemap : true,
	t_legend : false,
	t_tutorial : false,
	t_loader : false,

	layerHistory : [],
	layerHistoryDiv : null,

	legend_toggled : false,
	basemap_toggled : true,

	outline : null,
	flowline : null,

	localLayer : null,
	upstreamLayer : null,
	layerBoxes : [],
	dragTarget : null,
	dragDeleteTarget : null,
	toggledBox : null,

	layer_1 : {
		default : null,
		other : null,
		opacity: 100,
	},
	layer_2 : {
		default : null,
		other : null,
		opacity: 100,
	},

	init : function(container) {
		this.container = container;

		this.createLayerBox(container, "active", true, "ONE");
		this.createLayerBox(container, null, false, "TWO");
		
		//We have to create 2 blank shape files to be placed in themap
		var nLay = new LayerOptions({
			name:"BlankShapefil",
			source: ol.source.TileWMS,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params: {
				'LAYERS' : 'Streams:BlankShapefile', 'TILED':true},
			serverType:"geoserver"
		});
		
		GisMap.Layer.createNewLayer("LOCAL_ONE", nLay, function(layer){
			
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(1, thisLayer);
			
			
			
			LayerControl.layer_1.default = layer;
			
			
		});

		GisMap.Layer.createNewLayer("LOCAL_TWO", nLay, function(layer){
			
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(3, thisLayer);

			
			
			LayerControl.layer_2.default = layer;
			
			
		});
		
		GisMap.Layer.createNewLayer("LOCAL_ONE_UPSTREAM", nLay, function(layer){
			
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(2, thisLayer);
								layer.f.visible = false;

			
			
			LayerControl.layer_1.other = layer;
			
			
		});

		GisMap.Layer.createNewLayer("LOCAL_TWO_UPSTREAM", nLay, function(layer){
			
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(4, thisLayer);
								layer.f.visible = false;
			
			
			LayerControl.layer_2.other = layer;
			
			
		});
	
		/*
		var layername = $("<div id='layer-label'><input type='checkbox' checked='true' toggled='true' style='margin:5px'></input><span>" + this.currentLayer + "</span></div>");
		$(this.container).append(layername);
		$(layername).find(":checkbox").change(function() {
			LayerControl.toggleCurrentLayer(this);
		});
		
		*/

		this.layerHistoryDiv = GisMap.UI.spawnDropdown(this.container, '', {
			name : "historic_views",
			label : "Previously Viewed"
		});
		
		

		

		var local_upstream = $("<div class='upstream-local sub-container' data-group='LOCAL'></div>");
		var local_r = $("<p class='l-u-radio'><input type='radio' name='basin' value='local' onclick='LayerControl.changeLayer(this)' checked='checked'></input>Local</p>");
		var upstream_r = $("<p class='l-u-radio'><input type='radio' name='basin' onclick='LayerControl.changeLayer(this)' value='upstream'></input>Upstream</p>");

		$(local_upstream).append(local_r);
		$(local_upstream).append(upstream_r);

		GisMap.UI.createUIGroup(this.container, [local_upstream, "<div class='other sub-container' data-group='OTHER'></div>"], "Layer", null);

		var legend_ul = $("<ul style='list-style-type:none; text-align:left;margin-left: -40px;'></ul>")

		var flow_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(flow_li);
		GisMap.UI.createCheckBoxWithLabel(flow_li, "Show Flowlines", "flow_toggle", "LayerControl.toggleFlowline");

		var outline_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(outline_li);

		var outline_list = this.buildOutlineList();
		GisMap.UI.createCheckBoxWithLabel(outline_li, "", "outline_toggle", "LayerControl.toggleOutline");
		GisMap.UI.spawnDropdown(legend_ul, outline_list, {
			name : "outline_dropdown",
			label : "Outline: Huc 4 Grey"
		});

		var basemaplist = this.buildBasemapList();

		var base_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(base_li);
		GisMap.UI.createCheckBoxWithLabel(base_li, "", "basemap_toggle", "LayerControl.toggleBasemap", true);
		GisMap.UI.spawnDropdown(legend_ul, basemaplist, {
			name : "basemap_dropdown",
			label : "Basemap: OpenStreetMaps"
		});

		var legend_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(legend_li);
		$(this.container).append(legend_ul);
		GisMap.UI.createCheckBoxWithLabel(legend_li, "Legend", "legend_toggle", "LayerControl.toggleLegend");

		$(".legend_toggle").prop("disabled", !this.t_legend);

		this.loadInitialLayers();

	},
	createLayerBox : function(container, addition_classes, toggled, layer) {
		var box = $("<div class='layerbox'></div>");
		if (addition_classes != null) {
			$(box).addClass(addition_classes);

		}

		$(box).on('click', function(e) {
			$(".layerbox").removeClass("active");
			$(this).addClass("active");

			LayerControl.toggledBox = this;
			
			if($(this).find(".box-organs").length > 0){
				GisMap.UI.createJSONLegend(null, RULES, $(this).find(".box-organs").attr("layer-name"), {draggable:true}, function(){
					$(".legend_toggle").prop("checked",true);
					LayerControl.legend_toggled = true;
					
					GisMap.UI.showLegend(true);
					
				});
				$("#legend-close").attr('onclick', "GisMap.UI.hideLegend(true,disableLegend())");
				
			}
			
			
			
			
		})

		$(box).on('dragenter', function(e) {
			$(this).addClass('over');
		})

		$(box).on('dragleave', function(e) {
			$(this).removeClass('over');
		})

		$(box).on('drop', function(e) {
			console.log(LayerControl.dragTarget);
			LayerControl.setLayerBox(this, LayerControl.dragTarget);
			$(this).removeClass('over');
		})

		$(box).on('dragover', function(e) {
			if (e.preventDefault) {
				e.preventDefault();
			}

		})
		
		$(box).attr("BOX-ID", layer);

		$(container).append(box);
		this.layerBoxes.push(box);

		if (toggled) {
			LayerControl.toggledBox = box;
		}
	},

	setLayerBox : function(box, target) {
		if(target == undefined)
			return;
		
		
		var layerName = $(target).attr("data-layer");
		var layerType = $(target).attr("data-type");
		var layerLabel = $(target).html(); 
		var ID		   = $(target).attr("data-id");
		
		var target = {
			layerName:layerName,
			layerType:layerType,
			layerLabel:layerLabel,
			layerID:ID,
		}
		
		console.log(target)
		
		$(box).empty();
		$(box).append("<div class='box-organs' layer-name='" + layerName + "' draggable='true'></div>");
		
		//Label
		$(box).find('.box-organs').append("<h3><span>" + target.layerLabel + "</span></h3>")

		$(box).find('.box-organs').on('dragstart', function(e) {
			LayerControl.dragDeleteTarget = $(this).parent();

		})

		$("#map").on('dragover', function(e) {
			if (e.preventDefault) {
				e.preventDefault();
			}

		})
		
		var op = 0;
		$("#map").on('drop', function(e) {
			console.log(LayerControl.dragDeleteTarget);
			
			var box = $(LayerControl.dragDeleteTarget).attr("box-id");
			console.log(box);
			if(box == "ONE"){
				console.log("BOX ONE")
				 GisMap.Map.map.removeLayer(LayerControl.layer_1.default);
			} else {
				console.log("BOX TWO")
				GisMap.Map.map.removeLayer(LayerControl.layer_2.default);
			}
			
			$(LayerControl.dragDeleteTarget).empty();
			
			$(LayerControl.dragDeleteTarget).css("height", 103);
			

		});
		
		
		if($(box).attr("BOX-ID") == "ONE"){
			op = LayerControl.layer_2.opacity;	
		} else {
			op = LayerControl.layer_1.opacity;	
		}
		
				console.log(" ------------------------------ " + op);

		GisMap.UI.createSlider($(box).find('.box-organs'), "Opacity", {
			spanclass : 'l-opac' + $(box).attr("BOX-ID")
		}, function(el) {

			$(el).find("#slider").slider({
				range : "min",
				value : op,
				min : 1,
				max : 100,
				slide : function(event, ui) {
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + ui.value + "%");
					GisMap.Map.changeOpacityOfType("LOCAL_" + $(box).attr("BOX-ID"), ui.value / 100)
					GisMap.Map.changeOpacityOfType("LOCAL_" + $(box).attr("BOX-ID") + "_UPSTREAM", ui.value / 100)
					if($(box).attr("BOX-ID") == "ONE"){
						var diff = 100 - ui.value;
						LayerControl.layer_1.opacity = ui.value;
						LayerControl.layer_2.opacity = diff;
						GisMap.Map.changeOpacityOfType("LOCAL_TWO", diff/100);
						GisMap.Map.changeOpacityOfType("LOCAL_TWO_UPSTREAM", diff/100);
						$(".layerbox[box-id=TWO] #slider").slider( "option", "value", diff );
						
						$(".l-opacTWO").html(": " + LayerControl.layer_2.opacity + "%");
						console.log($(el).find(".l-opacTWO"));

					} else {
						LayerControl.layer_2.opacity = ui.value;
						var diff = 100 - ui.value;
						LayerControl.layer_1.opacity = diff;
						GisMap.Map.changeOpacityOfType("LOCAL_ONE", diff/100);
						GisMap.Map.changeOpacityOfType("LOCAL_ONE_UPSTREAM", diff/100);
						
						$(".l-opacONE").html(": " + LayerControl.layer_1.opacity + "%");

						$(".layerbox[box-id=ONE] #slider").slider( "option", "value", diff );
					}
				
				}
			});
			
			if($(box).attr("BOX-ID") == "ONE"){
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + 	LayerControl.layer_1.opacity + "%");
			}else{
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + 	LayerControl.layer_2.opacity + "%");
			}
			
			
		});
		GisMap.UI.createJSONLegend(null, RULES, layerName, {draggable:true}, function(){
			$(".legend_toggle").prop("checked",true);
			LayerControl.legend_toggled = true;
			
			GisMap.UI.showLegend(true);
			
		});
		$("#legend-close").attr('onclick', "GisMap.UI.hideLegend(true,disableLegend())");
		
		
		
		if($(box).attr("BOX-ID") == "ONE"){
			
			$("[box-id=ONE]").find("#slider").slider({value:LayerControl.layer_1.opacity});
			
			target.box = "ONE";
			this.createLayerToBox(target);
		} else {
			$("[box-id=TWO]").find("#slider").slider({value:LayerControl.layer_2.opacity});

			target.box = "TWO";
			this.createLayerToBox(target);
		}
		
		var local_upstream = $("<div class='upstream-local sub-container' data-group='LOCAL'></div>");
		var local_r = $("<button class='btn btn-default btn-success' onclick='LayerControl.changeLayer(this)'>Local</button>");
		var upstream_r = $("<button class='btn btn-default' onclick='LayerControl.changeLayer(this)'>Upstream</button>");

		$(local_upstream).append(local_r);
		$(local_upstream).append(upstream_r);

		GisMap.UI.createUIGroup($(box).find(".box-organs"), [local_upstream, "<div class='other sub-container' data-group='OTHER'></div>"], "Layer", null);
		if(target.layerID == "Catchments"){
			$(box).find(".upstream-local").css("display", "block");
		}
		
		$(box).css("height", "auto");

	},
	
	setLayerBox_withobject : function(box, target) {
		console.log(target);
		$(box).empty();
		$(box).append("<div class='box-organs' layer-name='" + target.layerName + "' draggable='true'></div>");
		
		//Label
		$(box).find('.box-organs').append("<h3><span>" + target.layerLabel + "</span></h3>")

		$(box).find('.box-organs').on('dragstart', function(e) {
			LayerControl.dragDeleteTarget = $(this).parent();

		})

		$("#map").on('dragover', function(e) {
			if (e.preventDefault) {
				e.preventDefault();
			}

		})

		$("#map").on('drop', function(e) {
			console.log(LayerControl.dragDeleteTarget);
			
			var box = $(LayerControl.dragDeleteTarget).attr("box-id");
			console.log(box);
			if(box == "ONE"){
				console.log("BOX ONE")
				 GisMap.Map.map.removeLayer(LayerControl.layer_1.default);
			} else {
				console.log("BOX TWO")
				GisMap.Map.map.removeLayer(LayerControl.layer_2.default);
			}
			
			$(LayerControl.dragDeleteTarget).empty();
						$(LayerControl.dragDeleteTarget).css("height", 103);


		});
		
		var op = 0;
		if($(box).attr("BOX-ID") == "ONE"){
			op = LayerControl.layer_2.opacity;	
		} else {
			op = LayerControl.layer_1.opacity;	
		}
		
		console.log(" ------------------------------ " + op);
		
		GisMap.UI.createSlider($(box).find('.box-organs'), "Opacity", {
			spanclass : 'l-opac' + $(box).attr("BOX-ID")
		}, function(el) {

			$(el).find("#slider").slider({
				range : "min",
				value : op,
				min : 1,
				max : 100,
				slide : function(event, ui) {
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + ui.value + "%");
					GisMap.Map.changeOpacityOfType("LOCAL_" + $(box).attr("BOX-ID"), ui.value / 100)
					GisMap.Map.changeOpacityOfType("LOCAL_" + $(box).attr("BOX-ID") + "_UPSTREAM", ui.value / 100)
					if($(box).attr("BOX-ID") == "ONE"){
						var diff = 100 - ui.value;
						LayerControl.layer_1.opacity = ui.value;
						LayerControl.layer_2.opacity = diff;
						GisMap.Map.changeOpacityOfType("LOCAL_TWO", diff/100);
						GisMap.Map.changeOpacityOfType("LOCAL_TWO_UPSTREAM", diff/100);
						$(".layerbox[box-id=TWO] .slider-container span").html(": " + diff + "%");
						$(".layerbox[box-id=TWO] #slider").slider( "option", "value", diff );
						$(el).find(".l-opacTWO").html(": " + LayerControl.layer_2.opacity + "%");

					} else {
						var diff = 100 - ui.value;
						LayerControl.layer_2.opacity = ui.value;
						LayerControl.layer_1.opacity = diff;
						GisMap.Map.changeOpacityOfType("LOCAL_ONE", diff/100);
						GisMap.Map.changeOpacityOfType("LOCAL_ONE_UPSTREAM", diff/100);
						$(".layerbox[box-id=ONE] .slider-container span").html(": " + diff + "%");
						$(".layerbox[box-id=ONE] #slider").slider( "option", "value", diff );
						$(el).find(".l-opacONE").html(": " + LayerControl.layer_1.opacity + "%");
					}
				
				}
			});
			
			if($(box).attr("BOX-ID") == "ONE"){
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + 	LayerControl.layer_1.opacity + "%");
			}else{
					$(el).find(".l-opac" + $(box).attr("BOX-ID")).html(": " + 	LayerControl.layer_2.opacity + "%");
			}
		});
		
		
		if($(box).attr("BOX-ID") == "ONE"){
						$("[box-id=ONE]").find("#slider").slider({value:LayerControl.layer_1.opacity});

			target.box = "ONE";
			this.createLayerToBox(target);
		} else {
						$("[box-id=TWO]").find("#slider").slider({value:LayerControl.layer_2.opacity});

			target.box = "TWO";
			this.createLayerToBox(target);
		}
		
		var local_upstream = $("<div class='upstream-local sub-container' data-group='LOCAL'></div>");
		var local_r = $("<button class='btn btn-default btn-success' onclick='LayerControl.changeLayer(this)'>Local</button>");
		var upstream_r = $("<button class='btn btn-default' onclick='LayerControl.changeLayer(this)'>Upstream</button>");

		$(local_upstream).append(local_r);
		$(local_upstream).append(upstream_r);

		GisMap.UI.createUIGroup($(box).find(".box-organs"), [local_upstream, "<div class='other sub-container' data-group='OTHER'></div>"], "Layer", null);
		if(target.layerID == "Catchments"){
			$(box).find(".upstream-local").css("display", "block");
		}
		
		$(box).css("height", "auto");
	},
	
	
	createLayerToBox:function(opts){
		console.log(opts);
		
		if(opts.box == "ONE"){
			if(LayerControl.layer_1.default){
				GisMap.Map.map.removeLayer(LayerControl.layer_1.default);
			}
			if(LayerControl.layer_1.other){
				GisMap.Map.map.removeLayer(LayerControl.layer_1.other);
			}
		} else {
			if(LayerControl.layer_2.default){
				GisMap.Map.map.removeLayer(LayerControl.layer_2.default);
			}
			if(LayerControl.layer_2.other){
				GisMap.Map.map.removeLayer(LayerControl.layer_2.other);
			}
		}
		
		
		var nLay = new LayerOptions({
			name:opts.layerName,
			source: ol.source.TileWMS,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params: {
				'LAYERS' : 'Streams:' + opts.layerName, 'TILED':true},
			serverType:"geoserver"
		});
		
		GisMap.Layer.createNewLayer("LOCAL_" + opts.box, nLay, function(layer){
			
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			
			
			
			
			if(opts.box == "ONE"){
				LayerControl.layer_1.default = layer;
				collect.insertAt(1, thisLayer);
			} else {
				LayerControl.layer_2.default = layer;
				collect.insertAt(3, thisLayer);

			}
			
			
			if(opts.layerID == "Catchments"){
				var uLay = new LayerOptions({
					name:opts.layerName,
					source: ol.source.TileWMS,
					url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
					params: {
						'LAYERS' : 'Streams:' + opts.layerName + "_Upstream", 'TILED':true},
					serverType:"geoserver"
				});
				GisMap.Layer.createNewLayer("LOCAL_" + opts.box + "_UPSTREAM", uLay, function(layer){
					
					var collect = GisMap.Map.map.getLayers();
					var thisLayer = collect.removeAt(collect.a.length-1);
					layer.f.visible = false;
					
					
					
					if(opts.box == "ONE"){
						LayerControl.layer_1.other = layer;
						collect.insertAt(2, thisLayer);
					} else {
						LayerControl.layer_2.other = layer;
						collect.insertAt(4, thisLayer);
		
					}
				
				});
			}
			
			
		});
		
		
	},

	changeLayer : function(el) {
		console.log(el);
		var parent = $(el).parent();
		var container = $(parent).parent().parent().parent();
		
		$(parent).find("button").removeClass("btn-success");
		$(el).addClass("btn-success")
		
		console.log(container);
		var id = $(container).attr("box-id")
		if(id == "ONE"){
			this.layer_1.default.f.visible = !this.layer_1.default.f.visible;
			this.layer_1.other.f.visible = !this.layer_1.other.f.visible;
		} else {
			this.layer_2.default.f.visible = !this.layer_2.default.f.visible;
			this.layer_2.other.f.visible = !this.layer_2.other.f.visible;
		}
		

		/*
		var val = $(el).val();
		console.log(val);
		if (val == "upstream") {
			this.localLayer.f.visible = false;
			this.upstreamLayer.f.visible = true;
		} else {
			this.localLayer.f.visible = true;
			this.upstreamLayer.f.visible = false;
		}
		*/

		GisMap.Map.map.render();

	},
	loadInitialLayers : function() {

		var oLay = new LayerOptions({
			name : 'Huc 4 Grey',
			source : ol.source.TileWMS,
			url : 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params : {
				'LAYERS' : 'Streams:' + 'OutlineHUC4_Website_Version_Grey',
				'TILED' : true
			},
			serverType : "geoserver"
		})
		GisMap.Layer.createNewLayer("OUTLINE", oLay, function(layer) {
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length - 1);
			collect.insertAt(5, thisLayer);
			layer.f.visible = false;
			GisMap.Map.map.render();
			LayerControl.outline = layer;

			var fLay = new LayerOptions({
				name : 'Flowline',
				source : ol.source.TileWMS,
				url : 'http://felek.cns.umass.edu:8080/geoserver/wms',
				params : {
					'LAYERS' : 'Streams:' + 'NENY_NHDFlowlines',
					'TILED' : true
				},
				serverType : "geoserver"
			})
			GisMap.Layer.createNewLayer("FLOWLINE", fLay, function(layer) {
				var collect = GisMap.Map.map.getLayers();
				var thisLayer = collect.removeAt(collect.a.length - 1);
				collect.insertAt(6, thisLayer);
				layer.f.visible = false;
				layer.f.opacity = .6;
				GisMap.Map.map.render();
				LayerControl.flowline = layer;
			});
		});

	},

	//Creates the basemaplist
	buildBasemapList : function() {
		var basemaps = LAYERS.BASEMAPS;
		var li = "";
		li += '<li class="dropdown-submenu"><a tabindex="-1" href="#">Stamen</a><ul class="dropdown-menu">';
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.stamen(&#39;toner&#39;, this)' >Stamen Toner</a></li>";
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.stamen(&#39;watercolor&#39;, this)' >Stamen Watercolor</a></li>";
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.stamen(&#39;terrain&#39;, this)' >Stamen Terrain</a></li>";
		li += "</ul></li>"
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.basic(this)' >OpenStreetMaps</a></li>";
		li += '<li class="dropdown-submenu"><a tabindex="-1" href="#">Bing</a><ul class="dropdown-menu">';
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.bing(&#39;Road&#39;, this)' >Bing Road</a></li>";
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.bing(&#39;Aerial&#39;, this)' >Bing Aerial</a></li>";
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.bing(&#39;AerialWithLabels&#39;, this)' >Bing AerialWithLabels</a></li>";
		li += "</ul></li>"
		li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='Basemaps.mapquest()' >MapQuest</a></li>";

		for (var b in basemaps) {
		}

		return li;
	},
	buildOutlineList : function() {
		var outlines = LAYERS.OUTLINES;
		var li = "";
		var cat;
		for (var o in outlines) {
			var out = outlines[o];
			var newCat = out.Category;
			if (cat == null) {
				cat = out.Category;
				li += '<li class="dropdown-submenu"><a tabindex="-1" href="#">' + cat + '</a><ul class="dropdown-menu">';
			} else {
				if (cat != newCat) {
					console.log("The category has changed to: " + newCat)
					cat = newCat;
					li += "</ul></li>";
					li += '<li class="dropdown-submenu"><a tabindex="-1" href="#">' + cat + '</a><ul class="dropdown-menu">';
				}
			}

			li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='LayerControl.placeOutline(this)' data-layer='" + out.Layer + "' data-Label='" + out.Label + "' data-Type='" + out.DataType + "' data-FeatureType='" + out.FeatureType + "'>" + out.Label + "</a></li>";
		}
		li += "</ul></li>"

		return li;
	},
	toggleOutline : function() {
		if (this.outline == null)
			return;

		//Outline is false
		if (this.t_outline == false) {
			this.outline.f.visible = true;
			this.t_outline = true;
			GisMap.Map.map.render();
			return;
		}

		this.outline.f.visible = false;
		this.t_outline = false;
		GisMap.Map.map.render();
	},
	toggleFlowline : function() {
		if (this.flowline == null)
			return;

		console.log("TTT")

		//Outline is false
		if (this.t_flowlines == false) {
			this.flowline.f.visible = true;
			this.t_flowlines = true;
			GisMap.Map.map.render();
			return;
		}

		this.flowline.f.visible = false;
		this.t_flowlines = false;
		GisMap.Map.map.render();
	},

	/**
	 * places a basemap from a dropdown element
	 * @param {Object} el
	 */
	placeBasemap : function(el) {
		var src = $(el).attr("data-source");
		var lay = $(el).attr("data-layer");

		console.log(src);
		GisMap.Layer.loadBasemap(ol.source[src], {
			layer : lay
		});

		$("#basemap_dropdown .btn_label").html("Basemap: " + $(el).html());

	},
	placeOutline : function(el) {
		if (this.outline) {
			GisMap.Map.map.removeLayer(this.outline);
		}

		var layer = $(el).attr("data-layer");
		var label = $(el).attr("data-label");
		var type = $(el).attr("data-type");
		var ftype = $(el).attr("data-featuretype");

		var oLay = new LayerOptions({
			name : label,
			source : ol.source.TileWMS,
			url : 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params : {
				'LAYERS' : 'Streams:' + layer,
				'TILED' : true
			},
			serverType : "geoserver"
		})

		GisMap.Layer.createNewLayer(type, oLay, function(layer) {
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length - 1);
			collect.insertAt(2, thisLayer);
			layer.f.visible = LayerControl.t_outline;
			LayerControl.outline = layer;
		});

		$("#outline_dropdown .btn_label").html("Outline: " + $(el).html());

	},

	/**
	 * updates the layer controls after adding a new layer
	 * @param {Object} opts
	 */
	updateInterface : function(opts) {
		console.log(opts);
		this.t_legend = opts.t_legend;
		$(".legend_toggle").prop("disabled", !this.t_legend);

		this.currentLayer = opts.layerLabel;
		$("#layer-label").find("span").html(this.currentLayer);

		this.layerHistory.push({
			layerName : opts.layerName,
			layerType : opts.layerType,
			layerLabel : opts.layerLabel
		});

		if (this.layerHistory.length > 6)
			this.layerHistory.splice(this.layerHistory.length - 1, 1);

		switch (opts.layerID) {
			case "Catchments":
				//TODO: Make this work again
				//GisMap.UI.toggleUIGroup("Layer", "LOCAL");
				break;

			default:
				break;
		}

		GisMap.UI.updateDropdown($(this.layerHistoryDiv.div).find("ul"), this.buildHistoryList());

		//UPDATE LAYER BOX
		this.setLayerBox_withobject(LayerControl.toggledBox, opts);

	},
	buildHistoryList : function() {
		var li = "";
		for (var h in this.layerHistory) {
			li += "<li role='presentation'>"
			li += "<a role='menuitem' tabindex='-1' href='#' onmousedown='AppLayer.generateLayer(this)' "
			li += "data-layer='" + this.layerHistory[h].layerName + "' data-type='" + this.layerHistory[h].layerType + "'>" + this.layerHistory[h].layerLabel + "</a></li>"
		};

		return li;
	},

	//Toggle the current layer
	toggleCurrentLayer : function(el) {
		if ($(el).attr("toggled") == "true") {
			$(el).attr("toggled", "false");
			GisMap.Map.toggleLayerByType("LOCAL", false);
			return;
		}
		$(el).attr("toggled", "true");
		GisMap.Map.toggleLayerByType("LOCAL", true);
	},

	//toggle legend
	toggleLegend : function() {
		if (this.legend_toggled == true) {
			GisMap.UI.hideLegend();
			this.legend_toggled = false;
		} else {
			GisMap.UI.showLegend(true);
			this.legend_toggled = true;
		}

	},

	//toggle current basemap
	toggleBasemap : function() {
		if (this.basemap_toggled == true) {
			GisMap.Map.setBasemapOpacity(false);
			this.basemap_toggled = false;
		} else {
			GisMap.Map.setBasemapOpacity(true);
			this.basemap_toggled = true;
		}
	}
}
