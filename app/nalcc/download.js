var Downloader = {

	SIZE : "ALL",
	LAYERS : "ALL",
	alive : false,

	container : null,
	extent_container : null,
	layer_container : null,

	extent_selector : null,
	layer_selector : null,

	BOUNDING_BOX : [],
	dragboxcontrol : null,
	catchments_url : null,
	SELECTED_LAYER : null,

	enabled_click : false,
	CLICKING : false,
	
	layer_selection_panel:null,


	//Starts the Downloader Window
	init : function() {
		//If the downloader is alive, do nothing.
		if (this.alive)
			return;

		this.alive = true;
		this.container = GisMap.UI.spawnPanel({
			class : "download-panel"
		});
		$(".download-panel").append("<h2>Download Data</h2>");
		$('.download-panel').draggable({
			containment : "parent"
		})

		//First Sector is the Bounding Box Selection Area
		$(".download-panel").append("<div class='extent-input'><span>Select Catchments</span></div>");
		this.extent_selector = $(".download-panel").find(".extent-input");
		$(this.extent_selector).append('<div class="btn-group">' + ' <button type="button" onclick="Downloader.setExtent(this);" data="ALL" class="btn btn-default active">All</button>' + '<button type="button" onclick="Downloader.setExtent(this)" data="SUBSET" class="btn btn-default">Subset</button>' + '<button type="button" onclick="Downloader.setExtent(this)" data="SINGLE" class="btn btn-default">Singular</button>' + '</div>');

		//Second Sector is the layers to be used
		$(".download-panel").append("<div class='layer-input'><span>Select Layers</span><br /></div>");
		this.layer_selector = $(".download-panel").find(".layer-input");
		$(this.layer_selector).append('<div class="btn-group">' + ' <button type="button" onclick="Downloader.setLayer(this);" data="ALL" class="btn btn-default active">All</button>' + '<button type="button" onclick="Downloader.setLayer(this)" data="SUBSET" class="btn btn-default">Subset</button>' + '</div>');

		$(".download-panel").append("<button class='btn btn-large btn-primary' disabled>Download</button>")
	},

	setExtent : function(el) {
		$(".extent-input").find(".btn").removeClass("active");
		$(el).addClass("active");

		this.SIZE = $(el).attr("data");
		if (this.SIZE == "SUBSET" || this.SIZE == "SINGLE")
			this.spawnSelectorPanel();
		else {
			this.removeSelector();
		}
	},
	setLayer : function(el) {
		$(".layer-input").find(".btn").removeClass("active");
		$(el).addClass("active");

		this.LAYERS = $(el).attr("data");
		if (this.LAYERS == "SUBSET")
			this.spawnLayerPanel();
		else {
			this.removeLayer();
		}
	},

	spawnSelectorPanel : function() {
		console.log('spawning;');
		if (this.extent_container != null) {
			this.setSelectorPanel();
			return;
		}

		this.extent_container = $("<div class='selector-panel'></div>");
		this.setSelectorPanel();

		$(".download-panel").append(this.extent_container);
	},

	setSelectorPanel : function() {
		this.extent_container.empty();
		this.BOUNDING_BOX = [];
		$(this.extent_container).append("<span>Select Extent:</span>");

		//Subset
		if (this.SIZE == "SUBSET") {
			console.log("SSS");
			this.extent_container.append("<button class='btn btn-primary btnselector' data='Hold down Shift and Click-Drag the Mouse to create a Bounding Box.'  onclick='Downloader.startDraw(this);'>Select Bounding Box</button>");
			this.extent_container.append("<div class='alert alert-danger'>Warning: No Bounding Box Selected</div>")
		} else if (this.SIZE == "SINGLE") {
			console.log("CCC");
			this.extent_container.append("<button class='btn btn-primary btnselector' data='Click anywhere on the map to select a catchment' onclick='Downloader.startClick(this);'>Select Catchment</button>");
			this.extent_container.append("<div class='alert alert-danger'>Warning: No Catchment Selected</div>")
		}

	},

	startDraw : function(btn) {
		this.BOUNDING_BOX = [];
		$(".selector-panel").find('.alert').html("Hold Click and Drag to Draw a Bounding Box.");
		$(".selector-panel").find('.alert').removeClass("alert-danger");
		$(".selector-panel").find('.alert').addClass("alert-warning");

		$(btn).html("Confirm Bounding Box");
		$(btn).removeClass("btn-primary");
		$(btn).addClass("btn-success");

		// Get DragBox Control;
		this.dragboxcontrol = new ol.interaction.DragBox({
			condition : ol.events.condition.always,
			style : new ol.style.Style({
				stroke : new ol.style.Stroke({
					color : [0, 0, 255, 1]
				})
			})
		});

		GisMap.Map.map.addInteraction(this.dragboxcontrol);

		$(btn).attr('onclick', 'Downloader.exitDraw(this)');
	},

	startClick : function(btn) {
		this.BOUNDING_BOX = [];
		this.CLICKING = true;
		$(".selector-panel").find('.alert').html("Click to Select a Catchment.");
		$(".selector-panel").find('.alert').removeClass("alert-danger");
		$(".selector-panel").find('.alert').addClass("alert-warning");

		$(btn).html("Confirm Catchment");
		$(btn).removeClass("btn-primary");
		$(btn).addClass("btn-success");

		if (this.enabled_click == false) {
			GisMap.Map.map.on('singleclick', function(evt) {
				Downloader.getClick(evt)
			});
			this.enabled_click = true;
		}

		$(btn).attr('onclick', 'Downloader.exitClick(this)');
	},

	getClick : function(evt) {
		if (!this.CLICKING)
			return;

		console.log(evt);

		this.BOUNDING_BOX = [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0] + 0.0000001, evt.coordinate[1] + 0.0000001];
		this.showBoundedCatchments();
	},

	exitClick : function(btn) {
		this.CLICKING = false;
		if (this.BOUNDING_BOX.length == 0) {
			$(".selector-panel").find('.alert').removeClass("alert-warning");
			$(".selector-panel").find('.alert').addClass("alert-danger");
			$(".selector-panel").find('.alert').html("Warning: Catchment Selected");
		} else {
			$(".selector-panel").find('.alert').removeClass("alert-warning");
			$(".selector-panel").find('.alert').addClass("alert-success");
			$(".selector-panel").find('.alert').html("A valid catchment was selected!");

		}

		$(btn).html("Select Catchment");
		$(btn).addClass("btn-primary");
		$(btn).removeClass("btn-success");

		$(btn).attr('onclick', 'Downloader.startClick(this)');
	},

	exitDraw : function(btn) {
		if (this.dragboxcontrol.getGeometry() != undefined)
			this.BOUNDING_BOX = this.dragboxcontrol.getGeometry().getExtent();

		//TODO: Check if the user selected a valid box
		if (this.BOUNDING_BOX.length == 0) {
			$(".selector-panel").find('.alert').removeClass("alert-warning");
			$(".selector-panel").find('.alert').addClass("alert-danger");
			$(".selector-panel").find('.alert').html("Warning: No Bounding Box Selected");
		} else {
			$(".selector-panel").find('.alert').removeClass("alert-warning");
			$(".selector-panel").find('.alert').addClass("alert-success");
			$(".selector-panel").find('.alert').html("A valid bounding box was selected!");
			this.showBoundedCatchments();
		}

		GisMap.Map.map.removeInteraction(this.dragboxcontrol);

		$(btn).html("Select Bounding Box");
		$(btn).addClass("btn-primary");
		$(btn).removeClass("btn-success");

		$(btn).attr('onclick', 'Downloader.startDraw(this)');
	},

	showBoundedCatchments : function() {
		if (this.SELECTED_LAYER)
			GisMap.Map.map.removeLayer(this.SELECTED_LAYER);

		this.SELECTED_LAYER = null;

		console.log('http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANHD_Local&outputformat=json&bbox=' + this.BOUNDING_BOX);
		catchments_url = 'http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANHD_Local&outputformat=json&bbox=' + this.BOUNDING_BOX;
		$.getJSON(catchments_url, function(d) {
			console.log(d);
			var vectorSource = new ol.source.GeoJSON(
			/** @type {olx.source.GeoJSONOptions} */( {
				object : d

			}
			));

			Downloader.SELECTED_LAYER = new ol.layer.Vector({
				source : vectorSource,
				style : function(feature, resolution) {
					var text = resolution < 5000 ? feature.get('name') : '';
					if (!styleCache[text]) {
						styleCache[text] = [new ol.style.Style({
							fill : new ol.style.Fill({
								color : 'rgba(255, 255, 255, 0.1)'
							}),
							stroke : new ol.style.Stroke({
								color : '#319FD3',
								width : 5
							}),
							text : new ol.style.Text({
								font : '12px Calibri,sans-serif',
								text : text,
								fill : new ol.style.Fill({
									color : '#000'
								}),
								stroke : new ol.style.Stroke({
									color : '#fff',
									width : 3
								})
							}),
							zIndex : 999
						})];
					}
					return styleCache[text];
				}
			});

			GisMap.Map.map.addLayer(Downloader.SELECTED_LAYER)

		});
	},

	removeSelector : function() {
		if (this.extent_container == null)
			return;
		this.extent_container = null;
		$(".selector-panel").remove();
	},

	removeLayer : function() {
		if (this.layer_container == null)
			return;
		this.layer_container = null
		$(".layer-panel").remove();
	},

	spawnLayerPanel : function() {
		if (this.layer_container != null) {
			this.setLayerPanel();
			return;
		}

		this.layer_container = $("<div class='layer-panel'></div>");
		this.setLayerPanel();

		$(".download-panel").append(this.layer_container);
	},

	setLayerPanel : function() {
		$(this.layer_container).empty();

		this.layer_container.append("<span>Select Layers:</span><br>");
		this.layer_container.append("<button class='btn btn-primary btnselector'  onclick='Downloader.startLayerSelector();'>Select Layers</button>");
		this.layer_container.append("<div class='alert alert-danger'>Warning: No Layers Selected</div>");
	},
	
	
	
	startLayerSelector:function(){
		
	}
	
	
	
	
}
