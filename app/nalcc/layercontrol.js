LayerControl = {
	
	container:null,
	
	currentLayer:"No Layer Selected",
	previousLayer:[],
	opacity:true,
	local_upstream_radio:false,
	t_flowlines:false,
	t_outline:false,
	t_basemap:true,
	t_legend:false,
	t_tutorial:false,
	t_loader:false,
	
	layerHistory:[],
	layerHistoryDiv:null,
	
	legend_toggled:false,
	basemap_toggled:true,
	
	outline:null,
	flowline:null,
	
	localLayer:null,
	upstreamLayer:null,
	
	
	init:function(container){
		this.container = container;
		
		var layername = $("<div id='layer-label'><input type='checkbox' checked='true' toggled='true' style='margin:5px'></input><span>" + this.currentLayer + "</span></div>");
		$(this.container).append(layername);
		$(layername).find(":checkbox").change(function(){
			LayerControl.toggleCurrentLayer(this);
		});
		
		this.layerHistoryDiv = GisMap.UI.spawnDropdown(this.container, '', {
			name: "historic_views",
			label:"Previously Viewed"
		});
		
		
		GisMap.UI.createSlider(this.container, "Opacity", {spanclass:'l-opac'}, function(el){
			
			 $(el).find("#slider").slider({
	            range: "min",
	            value: 100,
	            min: 1,
	            max: 100,
	            slide: function (event, ui) {
	                $(el).find(".l-opac").html(": " + ui.value + "%");
	                GisMap.Map.changeOpacityOfType("LOCAL", ui.value/100)
	            }
	        });
		});
		
		
		var local_upstream = $("<div class='upstream-local sub-container' data-group='LOCAL'></div>");
		var local_r = $("<p class='l-u-radio'><input type='radio' name='basin' value='local' onclick='LayerControl.changeLayer(this)' checked='checked'></input>Local</p>");
		var upstream_r = $("<p class='l-u-radio'><input type='radio' name='basin' onclick='LayerControl.changeLayer(this)' value='upstream'></input>Upstream</p>");
		
		
		
		
		$(local_upstream).append(local_r);
		$(local_upstream).append(upstream_r);
		
		
		
		
		GisMap.UI.createUIGroup(this.container,[local_upstream, "<div class='other sub-container' data-group='OTHER'></div>"], "Layer", null);
		
		
		var legend_ul = $("<ul style='list-style-type:none; text-align:left;margin-left: -40px;'></ul>")
		
		
		var flow_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(flow_li);
		GisMap.UI.createCheckBoxWithLabel(flow_li, "Show Flowlines", "flow_toggle", "LayerControl.toggleFlowline");
		
		var outline_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(outline_li);
		
		var outline_list = this.buildOutlineList();
		GisMap.UI.createCheckBoxWithLabel(outline_li, "", "outline_toggle", "LayerControl.toggleOutline");
		GisMap.UI.spawnDropdown(legend_ul, outline_list, {
			name: "outline_dropdown",
			label:"Outline: Huc 4 Grey"
		});
		
		var basemaplist = this.buildBasemapList();

		var base_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(base_li);
		GisMap.UI.createCheckBoxWithLabel(base_li, "", "basemap_toggle", "LayerControl.toggleBasemap", true);
		GisMap.UI.spawnDropdown(legend_ul, basemaplist, {
			name: "basemap_dropdown",
			label:"Basemap: Stamen Toner"
		});
		
		
		var legend_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(legend_li);
		$(this.container).append(legend_ul);
		GisMap.UI.createCheckBoxWithLabel(legend_li, "Legend", "legend_toggle", "LayerControl.toggleLegend");
		
		$(".legend_toggle").prop("disabled", !this.t_legend);
		
		
		
		this.loadInitialLayers();
		
		
	},
	
	changeLayer:function(el){
		
		var val = $(el).val();
		console.log(val);
		if(val == "upstream"){
			this.localLayer.e.visible = false;
			this.upstreamLayer.e.visible = true;
		} else {
			this.localLayer.e.visible = true;
			this.upstreamLayer.e.visible = false;
		}
		
		GisMap.Map.map.render();
		
		
	},
	
	loadInitialLayers:function(){
		
		var oLay = new LayerOptions({
			name:'Huc 4 Grey',
			source:ol.source.TileWMS,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params:{
				'LAYERS' : 'Streams:' + 'OutlineHUC4_Website_Version_Grey', 'TILED':true},
			serverType:"geoserver"
		})
		GisMap.Layer.createNewLayer("OUTLINE", oLay, function(layer){
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(2, thisLayer);
			layer.e.visible = false;
			GisMap.Map.map.render();
			LayerControl.outline = layer;
				
			var fLay = new LayerOptions({
				name:'Flowline',
				source:ol.source.TileWMS,
				url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
				params:{
					'LAYERS' : 'Streams:' + 'NENY_NHDFlowlines', 'TILED':true},
				serverType:"geoserver"
			})
			GisMap.Layer.createNewLayer("FLOWLINE", fLay, function(layer){
					var collect = GisMap.Map.map.getLayers();
					var thisLayer = collect.removeAt(collect.a.length-1);
					collect.insertAt(3, thisLayer);
					layer.e.visible = false;
					layer.e.opacity = .6;
					GisMap.Map.map.render();
					LayerControl.flowline = layer;
			});
		});
		
		
	},
	
	//Creates the basemaplist
	buildBasemapList:function(){
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
			
		for(var b in basemaps){
		}
		
		return li;
	},
	
	
	buildOutlineList:function(){
		var outlines = LAYERS.OUTLINES;
		var li = "";
		var cat;
		for(var o in outlines){
			var out = outlines[o];
			var newCat = out.Category;
			if(cat == null){
				cat = out.Category;
				li += '<li class="dropdown-submenu"><a tabindex="-1" href="#">' + cat + '</a><ul class="dropdown-menu">';
			} else {
				if(cat != newCat){
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
	
	toggleOutline:function(){
		if(this.outline == null)
			return;
			
		//Outline is false
		if(this.t_outline == false){
			this.outline.e.visible = true;
			this.t_outline = true;
			GisMap.Map.map.render();
			return;
		}
		
		this.outline.e.visible = false;
		this.t_outline = false;
		GisMap.Map.map.render();
	},
	
	
	toggleFlowline:function(){
		if(this.flowline == null)
			return;
			
		console.log("TTT")
			
		//Outline is false
		if(this.t_flowlines == false){
			this.flowline.e.visible = true;
			this.t_flowlines = true;
			GisMap.Map.map.render();
			return;
		}
		
		this.flowline.e.visible = false;
		this.t_flowlines = false;
		GisMap.Map.map.render();
	},
	
	
	/**
	 * places a basemap from a dropdown element 
	 * @param {Object} el
	 */
	placeBasemap:function(el){
		var src = $(el).attr("data-source");
		var lay = $(el).attr("data-layer");
		
		console.log(src);
		GisMap.Layer.loadBasemap(ol.source[src],{
			layer: lay
		});
		
		$("#basemap_dropdown .btn_label").html("Basemap: " + $(el).html());
		
	},
	
	placeOutline:function(el){
		if(this.outline){
			GisMap.Map.map.removeLayer(this.outline);
		}
		
		var layer = $(el).attr("data-layer");
		var label = $(el).attr("data-label");
		var type = $(el).attr("data-type");
		var ftype = $(el).attr("data-featuretype");
		
		var oLay = new LayerOptions({
			name:label,
			source:ol.source.TileWMS,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params:{
				'LAYERS' : 'Streams:' + layer, 'TILED':true},
			serverType:"geoserver"
		})
		
		GisMap.Layer.createNewLayer(type, oLay, function(layer){
				var collect = GisMap.Map.map.getLayers();
				var thisLayer = collect.removeAt(collect.a.length-1);
				collect.insertAt(2, thisLayer);
				layer.e.visible = LayerControl.t_outline;
				LayerControl.outline = layer;
		});
		
		$("#outline_dropdown .btn_label").html("Outline: " + $(el).html());
		
		
	},
	
	
	/**
	 * updates the layer controls after adding a new layer 
 	* @param {Object} opts
	 */
	updateInterface:function(opts){
		console.log(opts);
		this.t_legend = opts.t_legend;
		$(".legend_toggle").prop("disabled", !this.t_legend);
		

		this.currentLayer = opts.layerLabel;
		$("#layer-label").find("span").html(this.currentLayer);

		this.layerHistory.push({
			layerName:opts.layerName,
			layerType:opts.layerType,
			layerLabel:opts.layerLabel
		});
		
		if(this.layerHistory.length > 6)
			this.layerHistory.splice(this.layerHistory.length-1, 1);
			
			
		switch (opts.layerID){
			case "Catchments":
				GisMap.UI.toggleUIGroup("Layer", "LOCAL");
				break;
				
			default:
				break;
		}
		
		
		
		GisMap.UI.updateDropdown($(this.layerHistoryDiv.div).find("ul"), this.buildHistoryList());
		
	},
	
	
	buildHistoryList:function(){
		var li = "";
		for(var h in this.layerHistory){
			li += "<li role='presentation'>"
			li += "<a role='menuitem' tabindex='-1' href='#' onmousedown='AppLayer.generateLayer(this)' "
			li += "data-layer='" + this.layerHistory[h].layerName + "' data-type='" + this.layerHistory[h].layerType + "'>" + this.layerHistory[h].layerLabel + "</a></li>"
		};
		
		return li;
	},
	
	
	
	//Toggle the current layer
	toggleCurrentLayer:function(el){
		if($(el).attr("toggled") == "true"){
			$(el).attr("toggled", "false");
			GisMap.Map.toggleLayerByType("LOCAL", false);
			return;
		}
		$(el).attr("toggled", "true");
		GisMap.Map.toggleLayerByType("LOCAL", true);
	},
	
	//toggle legend
	toggleLegend:function(){
		if(this.legend_toggled == true){
			GisMap.UI.hideLegend();
			this.legend_toggled = false;
		} else {
			GisMap.UI.showLegend(true);
			this.legend_toggled = true;
		}
		
		
	},
	
	//toggle current basemap
	toggleBasemap:function(){
		if(this.basemap_toggled == true){
			GisMap.Map.setBasemapOpacity(false);
			this.basemap_toggled = false;
		} else {
			GisMap.Map.setBasemapOpacity(true);
			this.basemap_toggled = true;
		}
	}
	
	
	
	
}
