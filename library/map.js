GisMap.Map = {

	map : null,
	basemap : null,
	basemaps : [], //All basemaps
	//All layers with a configuration greater than 0
	layers : [],
	
	
	

	uniqueLayers : [],

	//Function for returning the current screen image
	imageSave : null,

	/**
	 * init Initializes the map with information from user config
	 * @param {Object} cb Callback function
	 */
	init : function(cb) {

		this.uniqueLayers = GisMap.Core.Application.UNIQUE_LAYERS;
		console.log(GisMap.Core.Application);
		this.map = new ol.Map({
			target : 'map',
			view : new ol.View2D({
				center : ol.proj.transform(GisMap.Core.Application.LOAD_COORDINATES, GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection),
				zoom : GisMap.Core.Application.LOAD_ZOOM,
				//projection: 'EPSG:4326',
			}),
			renderer : 'canvas'
		});

		this.map.once('postcompose', function(event) {
			GisMap.Map.imageSave = function() {
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
		if (this.uniqueLayers.indexOf(GisMap.Core.Application.LAYER_CONFIGURATIONS[layer.LAYER_TYPE]) != -1) {
			for (var l in this.layers) {
				if (this.layers[l].LAYER_TYPE == layer.LAYER_TYPE) {
					this.map.removeLayer(this.layers[l]);
					this.layers.splice(l, 1);
				}
			}
		}

		//If the map is not a basemap
		if (GisMap.Core.Application.LAYER_CONFIGURATIONS[layer.LAYER_TYPE] != 0) {
			this.layers.push(layer);
		} 

		this.map.addLayer(layer);
		
		
		

		if (cb)
			cb(layer);

	},
	
	/**\
	 * Adds an already created basemap to the map 
	 */
	addBasemap:function(layer, cb){
		if(this.basemap){
			this.map.removeLayer(this.basemap);
		}
		layer.LAYER_TYPE = "BASEMAP";
		this.map.addLayer(layer);
		
		var collect = this.map.getLayers();
		var thisLayer = collect.removeAt(collect.a.length-1);
		collect.insertAt(0, thisLayer);
	
		this.basemap = layer;
	},

	/**
	 * ChangeOpacityOfType sets the opacity of a type of layer
	 * @param {Object} layerType
	 * @param {Object} opacity
	 */
	changeOpacityOfType : function(layerType, opacity) {
		for (var l in this.layers) {
			if (this.layers[l].LAYER_TYPE == layerType) {
				this.layers[l].setOpacity(opacity);
			}
		}
	},

	/**
	 * toggles a layer's visibility throught its type
	 * @param {Object} layerType
	 * @param {Object} state
	 */
	toggleLayerByType : function(layerType, state) {
		for (var l in this.layers) {
			if (this.layers[l].LAYER_TYPE = layerType) {
				if (this.layers[l].e.visible == null)
					throw new Error("Visible Property Not Found")
				this.layers[l].e.visible = state;
				GisMap.Map.map.render();
			}
		}
	},

	/**
	 * Sets basemap opacity
	 */
	setBasemapOpacity : function(state) {
		this.basemap.e.visible = state;
		GisMap.Map.map.render();
	},

	addZoomSlider : function() {
		this.map.addControl(new ol.control.ZoomSlider())
	},
	
	/**
	 * flies to an extent
	 * @param {Array} extent An array of points dictating an extent [point0.lon, point1.lat, point2.lon, point2.lat] 
	 */
	flyToPoint : function(extent) {
		var duration = 2000;
		var start = +new Date();
		var pan = ol.animation.pan({
			duration : duration,
			source : /** @type {ol.Coordinate} */(GisMap.Map.map.getView().getCenter()),
			start : start
		});
		var bounce = ol.animation.bounce({
			duration : duration,
			resolution : 4 * GisMap.Map.map.getView().getResolution(),
			start : start
		});
		GisMap.Map.map.beforeRender(pan, bounce);
		GisMap.Map.map.getView().fitExtent([extent.point1[0],extent.point1[1],extent.point2[0],extent.point2[1]], GisMap.Map.map.getSize())
	},
	
	
	spawnPopup:function(coordinate){
		var popup = $("<div class='popup'></div>");
		popup.append('<div id="options-close" class="btn btn-danger" onclick="ToolBar.hideThis(this)"><span class="glyphicon glyphicon-remove"></span></div>')
		var overlay = new ol.Overlay({
			element: popup
		})
		
		$(parent).parent().css("pointer-events", "none");
		$(popup).draggable();
		
		GisMap.Map.map.addOverlay(overlay);
		
		overlay.setPosition(coordinate);
		
		return popup;
	},
	
	addFullScreen:function(){
		GisMap.Map.map.addControl(new ol.control.FullScreen());
	}
	
	
	
	
	
	
}
