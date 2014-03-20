/**
 * LAYER
 * Contains base functions for adding and manipulating layers
 */

GisMap.Layer = {

	/**
	 * createNew Creates a new Layer
	 * @param {Object} layerName Name of the Layer in the server
	 * @param {Object} extendfn Function that extends the function
	 */
	createNew : function(layerName, extendfn) {

		extendfn();

	},
	
	/**
	 * loadBasemap loads and places a basemap
 	 * @param {Object} type The layer
 	 * @param {Object} opts Options
	 */
	loadBasemap : function(type, opts) {
		if (type == null)
			throw new Error("BAD BASEMAP TYPE");
			
		if(GisMap.Map.basemap)
			GisMap.Map.map.removeLayer(GisMap.Map.basemap);

		var newBaseMap = new ol.layer.Tile({
			source: new type(opts)
		});
		
		newBaseMap.LAYER_TYPE = "BASEMAP";
		
		GisMap.Map.addLayer(newBaseMap);
		GisMap.Map.basemap = newBaseMap;
	},
	
	createNewLayer : function(layerType, layerOptions, cb){
		if(layerType == null)
			throw new Error("BAD LAYER");
		
		console.log("TYPE: " + layerType);
		
		var newLayer = new ol.layer.Tile({
			source: new layerOptions.source((
				{
					preload: Infinity,
					url:layerOptions.url,
					params: layerOptions.params,
					serverType: layerOptions.serverType
				}
			))
		})
		
		
		newLayer.LAYER_TYPE = layerType;
		
		GisMap.Map.addLayer(newLayer, cb);
		
		
	}
	
	
}


function LayerOptions(opts){
	this.name = opts.name;
	this.source = opts.source;
	this.url = opts.url;
	this.params = opts.params;
	this.serverType = opts.serverType;
}
