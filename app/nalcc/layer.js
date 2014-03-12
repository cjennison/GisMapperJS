AppLayer = {
	
	
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
		
		GisMap.Layer.createNewLayer(layerType, nLay);
		GisMap.UI.createJSONLegend(null, RULES, layerName, {draggable:true}, function(){
			$(".legend_toggle").prop("checked",true);
			LayerControl.legend_toggled = true;
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
	
	/**
	 * returns the html used for this layer 
	 * @param {Object} layer
	 */
	getLayerControls:function(layer){
		
	}
	
	
	
}
