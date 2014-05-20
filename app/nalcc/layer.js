AppLayer = {
	
	
	cursorState:"pan",
	wmsSource:null,
	wmsLayer:null,
	/**
	 * Generates a layer from an element 
 	 * @param {Object} el
	 */
	generateLayer:function(el){
		
		//generate the layer
		var layerName = $(el).attr("data-layer");
		var layerType = $(el).attr("data-type");
		var layerLabel = $(el).html(); 
		var ID		   = $(el).attr("data-id");
				
		
		var nLay = new LayerOptions({
			name:layerName,
			source: ol.source.TileWMS,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			params: {
				'LAYERS' : 'Streams:' + layerName, 'TILED':true},
			serverType:"geoserver"
		});
		
		
		//Local
		
		/* TODO: Turn back on if not done..
		GisMap.Layer.createNewLayer(layerType, nLay, function(layer){
			var collect = GisMap.Map.map.getLayers();
			var thisLayer = collect.removeAt(collect.a.length-1);
			collect.insertAt(1, thisLayer);
			
			LayerControl.localLayer = layer;
			
		});
		
		if(ID == "Catchments"){
			
			
			GisMap.Map.map.removeLayer(LayerControl.upstreamLayer);
			var uLay = new LayerOptions({
				name:layerName,
				source: ol.source.TileWMS,
				url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
				params: {
					'LAYERS' : 'Streams:' + layerName + "_Upstream", 'TILED':true},
				serverType:"geoserver"
			});
			GisMap.Layer.createNewLayer("OTHER", uLay, function(layer){
				layer.e.visible = false;				
				LayerControl.upstreamLayer = layer;
			});
			
			GisMap.UI.resetRadioButtons();
			
			
		}
		
		*/
		
		
		
		GisMap.UI.createJSONLegend(null, RULES, layerName, {draggable:true}, function(){
			$(".legend_toggle").prop("checked",true);
			LayerControl.legend_toggled = true;
			
			GisMap.UI.showLegend(true);
			
		});
		$("#legend-close").attr('onclick', "GisMap.UI.hideLegend(true,disableLegend())");
		
		//update layer controls
		LayerControl.updateInterface({
			layerName:layerName,
			layerType:layerType,
			layerLabel:layerLabel,
			layerID:ID,
			t_legend:true
		})
		
	},
	
	
	//Creates a WMS Layer and sets it's opacity to 0 on return
	createWMSLayer:function(cb){
		
		
		this.wmsSource = new ol.source.TileWMS({
			url:'http://felek.cns.umass.edu:8080/geoserver/wms',
			params: {
				'LAYERS' : 'Streams:NENY_NHDCatchments_LocalStats_2' }
		});
		
		this.wmsLayer = new ol.layer.Tile({
			source: AppLayer.wmsSource
		})
		
		GisMap.Map.map.addLayer(this.wmsLayer);
		this.wmsLayer.setOpacity(0);
		
		var viewProjection = /** @type {ol.proj.Projection} */
   			 (GisMap.Map.map.getView().getProjection());
   			 
   			 
		GisMap.Map.map.on('singleclick', function(evt){
			
			if(AppLayer.cursorState != "delin") return;
			
			Data.createCatchmentPopup(evt.coordinate);
			var viewResolution = /** @type {number} */ (GisMap.Map.map.getView().getResolution());
			  var url = AppLayer.wmsSource.getGetFeatureInfoUrl(
			      evt.coordinate, viewResolution, viewProjection,
			      {'INFO_FORMAT': 'application/json'});
			  if (url) {
			  	 console.log(url)
			  	 $.getJSON(url, function(d){
			  	 	Data.populatePopup(d);
			  	 })
			  } else {
			  	console.log("Uh Oh, something went wrong.");
			  }
		})
		
		if(cb){
			cb();
		}
		
		
	},
	
	/**
	 * returns the html used for this layer 
	 * @param {Object} layer
	 */
	getLayerControls:function(layer){
		
	},
	
	
	
	
	
	
	
	
}
