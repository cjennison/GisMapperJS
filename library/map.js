GisMap.Map = {

	map : null,
	basemap:null,
	basemaps : [], //All basemaps
	//All layers with a configuration greater than 0
	layers:[],
	
	uniqueLayers:[],
	
	//Function for returning the current screen image
	imageSave:null,

	/**
	 * init Initializes the map with information from user config
	 * @param {Object} cb Callback function
	 */
	init : function(cb) {
		
		this.uniqueLayers = GisMap.Core.Application.UNIQUE_LAYERS;
		
		this.map = new ol.Map({
			target : 'map',
			view : new ol.View2D({
 				center: ol.proj.transform([-72.82, 42], 'EPSG:4326', 'EPSG:900913'),				
 				zoom : GisMap.Core.Application.LOAD_ZOOM,
 				//projection: 'EPSG:4326',
			}),
			renderer:'canvas'
		});
		
		this.map.once('postcompose', function(event){
			GisMap.Map.imageSave = function(){
				var info = event.context.canvas.toDataURL('image/png');
				return info;
			};
		})

		if (cb)
			cb();
	},
	
	/**
	 * addLayer add a layer to the map
 	 * @param {Object} layer
	 */
	addLayer : function(layer, cb) {
		//Checks and removes unique layers (if any)
		if(this.uniqueLayers.indexOf(GisMap.Core.Application.LAYER_CONFIGURATIONS[layer.LAYER_TYPE]) != -1){
			for(var l in this.layers){
				if(this.layers[l].LAYER_TYPE == layer.LAYER_TYPE){
					this.map.removeLayer(this.layers[l]);
					this.layers.splice(l, 1);
				}
			}
		}
		
		//If the map is not a basemap
		if(GisMap.Core.Application.LAYER_CONFIGURATIONS[layer.LAYER_TYPE] != 0){
			this.layers.push(layer);
		}
		
		this.map.addLayer(layer);
		
		
		if(cb)
			cb();
		
	},
	
	/**
	 * ChangeOpacityOfType sets the opacity of a type of layer
 	 * @param {Object} layerType
 	 * @param {Object} opacity
	 */
	changeOpacityOfType:function(layerType, opacity){
		for(var l in this.layers){
			if(this.layers[l].LAYER_TYPE = layerType){
				this.layers[l].setOpacity(opacity);
			}	
		}
	},
	
	
	/**
	 * toggles a layer's visibility throught its type 
	 * @param {Object} layerType
	 * @param {Object} state
	 */
	toggleLayerByType:function(layerType, state){
		for(var l in this.layers){
			if(this.layers[l].LAYER_TYPE = layerType){
				if(this.layers[l].e.visible == null)
					throw new Error("Visible Property Not Found")
				this.layers[l].e.visible = state;
				GisMap.Map.map.render();
			}	
		}
	},
	
	/**
	 * Sets basemap opacity 
	 */
	setBasemapOpacity:function(state){
		this.basemap.e.visible = state;
		GisMap.Map.map.render();
	},
	
	
	addZoomSlider:function(){
		this.map.addControl(new ol.control.ZoomSlider())
	}
	
	
	
	
}
