LayerControl = {
	
	container:null,
	
	currentLayer:"No Layer Selected",
	previousLayer:[],
	opacity:true,
	local_upstream_radio:false,
	t_flowlines:true,
	t_outline:false,
	t_basemap:true,
	t_legend:false,
	t_tutorial:false,
	t_loader:false,
	
	layerHistory:[],
	layerHistoryDiv:null,
	
	legend_toggled:false,
	basemap_toggled:true,
	
	
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
		var local_r = $("<p class='l-u-radio'><input type='radio' name='basin' value='local' checked='checked'></input>Local</p>");
		var upstream_r = $("<p class='l-u-radio'><input type='radio' name='basin' value='upstream'></input>Upstream</p>");
		
		$(local_upstream).append(local_r);
		$(local_upstream).append(upstream_r);
		
		GisMap.UI.createUIGroup(this.container,[local_upstream, "<div class='other sub-container' data-group='OTHER'></div>"], "Layer", null);
		
		
		var legend_ul = $("<ul style='list-style-type:none; text-align:left;margin-left: -40px;'></ul>")
		
		
		var flow_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(flow_li);
		GisMap.UI.createCheckBoxWithLabel(flow_li, "Show Flowlines", "flow_toggle", "LayerControl.toggleLegend");
		
		var outline_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(outline_li);
		
		
		var basemaplist = this.buildBasemapList();
		GisMap.UI.createCheckBoxWithLabel(outline_li, "", "outline_toggle", "LayerControl.toggleLegend");
		GisMap.UI.spawnDropdown(legend_ul, "", {
			name: "outline_dropdown",
			label:"Outline: Huc 4"
		});
		
		var outline_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(outline_li);
		GisMap.UI.createCheckBoxWithLabel(outline_li, "", "basemap_toggle", "LayerControl.toggleBasemap", true);
		GisMap.UI.spawnDropdown(legend_ul, basemaplist, {
			name: "basemap_dropdown",
			label:"Basemap: Stamen Toner"
		});
		
		
		var legend_li = $("<li style='margin-top: 5px;'></li>")
		$(legend_ul).append(legend_li);
		$(this.container).append(legend_ul);
		GisMap.UI.createCheckBoxWithLabel(legend_li, "Legend", "legend_toggle", "LayerControl.toggleLegend");
		
		$(".legend_toggle").prop("disabled", !this.t_legend);
		
	},
	
	//Creates the basemaplist
	buildBasemapList:function(){
		var basemaps = LAYERS.BASEMAPS;
		var li = "";
		for(var b in basemaps){
			li += "<li role='presentation'><a role='menuitem' tabindex='-1' href='#' onmousedown='LayerControl.placeBasemap(this)' data-source='" + basemaps[b].source + "' data-layer='" + basemaps[b].layer + "' >" + basemaps[b].label + "</a></li>";
		}
		
		console.log(li);
		return li;
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
	
	
	/**
	 * updates the layer controls after adding a new layer 
 	* @param {Object} opts
	 */
	updateInterface:function(opts){
		
		this.t_legend = opts.t_legend;
		$(".legend_toggle").prop("disabled", !this.t_legend);
		

		this.currentLayer = opts.layerName;
		$("#layer-label").find("span").html(this.currentLayer);

		this.layerHistory.push({
			layerName:opts.layerName,
			layerType:opts.layerType,
			layerLabel:opts.layerLabel
		});
		
		if(this.layerHistory.length > 6)
			this.layerHistory.splice(this.layerHistory.length-1, 1);
			
			
		switch (opts.layerID){
			case "CATCHMENT":
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
