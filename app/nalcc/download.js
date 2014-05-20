var t;

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
	PROPERTIES : [],
	CATCHMENTS : [],
	GEOJSON_CATCHMENTS : null,

	dragboxcontrol : null,
	catchments_url : null,
	SELECTED_LAYER : null,

	enabled_click : false,
	CLICKING : false,
	SELECTING : false,

	layer_selection_panel : null,

	format_select : null,

	downloadbtn : null,

	//Starts the Downloader Window
	init : function() {

		//If the downloader is alive, do nothing.
		if ($(".download-panel").length > 0)
			return;

		console.log("ON")

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
		$(this.extent_selector).append('<div class="btn-group">' + ' <button type="button" onclick="Downloader.setExtent(this);" data="ALL" class="btn btn-default active">All</button>' + '<button type="button" onclick="Downloader.setExtent(this)" data="SUBSET" class="btn btn-default">By Area</button>'/* + '<button type="button" onclick="Downloader.setExtent(this)" data="SINGLE" class="btn btn-default">Singular</button>'*/ + ' <button type="button" onclick="Downloader.setExtent(this);" data="SELECTION" class="btn btn-default">By Catchment</button>' + '</div>');

		//Second Sector is the layers to be used
		$(".download-panel").append("<div class='layer-input'><span>Select Layers</span><br /></div>");
		this.layer_selector = $(".download-panel").find(".layer-input");
		$(this.layer_selector).append('<div class="btn-group">' + ' <button type="button" onclick="Downloader.setLayer(this);" data="ALL" class="btn btn-default active">All</button>' + '<button type="button" onclick="Downloader.setLayer(this)" data="SUBSET" class="btn btn-default">Subset</button>' + '</div>');

		this.format_select = $("<div class='format-input'><span>Format:</span><select class='form-control'><option value='csv'>CSV</option><option value='json'>JSON</option><option value='SHAPE-ZIP'>Shape File</option></select></div> <br />")
		$(".download-panel").append(this.format_select);

		this.downloadbtn = $("<a href='#'><button class='btn btn-large btn-primary' disabled>Download</button></a>");

		$(".download-panel").append(this.downloadbtn);

		$(".download-panel").append("<div id='options-close' style='padding: 11px 12px;' class='btn btn-danger' onclick='ToolBar.hideThis(this); Downloader.active = false;'><span class='glyphicon glyphicon-remove'></span></div>");

	},

	setExtent : function(el) {
		$(".extent-input").find(".btn").removeClass("active");
		$(el).addClass("active");

		this.SIZE = $(el).attr("data");
		if (this.SIZE == "SUBSET" || this.SIZE == "SINGLE" || this.SIZE == "SELECTION")
			this.spawnSelectorPanel();
		else {
			this.removeSelector();
		}
		this.checkDownload();
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
		this.checkDownload();
	},

	spawnSelectorPanel : function() {
		console.log('spawning;');

		ToolBar.togglePanner();

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
		
		if (this.SELECTED_LAYER)
			GisMap.Map.map.removeLayer(this.SELECTED_LAYER);
		
		//Subset
		if (this.SIZE == "SUBSET") {
			console.log("SSS");
			this.extent_container.append("<button class='btn btn-primary btnselector' data='Hold down Shift and Click-Drag the Mouse to create a Bounding Box.'  onclick='Downloader.startDraw(this);'>Select Bounding Box</button>");
			this.extent_container.append("<div class='alert alert-danger'>Warning: No Bounding Box Selected</div>")
		} else if (this.SIZE == "SINGLE") {
			console.log("CCC");
			this.extent_container.append("<button class='btn btn-primary btnselector' data='Click anywhere on the map to select a catchment' onclick='Downloader.startClick(this);'>Select Catchment</button>");
			this.extent_container.append("<div class='alert alert-danger'>Warning: No Catchment Selected</div>")
		} else if (this.SIZE == "SELECTION") {
			this.extent_container.append("<button class='btn btn-primary btnselector'  onclick='Downloader.startSelection(this);'>Select Catchments</button>");
			this.extent_container.append("<div class='alert alert-danger'>Warning: No Catchments Selected</div>")
		}
		this.checkDownload();

	},

	startSelection : function(btn) {
		this.CATCHMENTS = [];
		this.GEOJSON_CATCHMENTS = [];
		this.GEOJSON_CATCHMENTS = null;
		this.BOUNDING_BOX = [];
		$(".selector-panel").find('.alert').html("Click catchments to select and add them to your download.");
		$(".selector-panel").find('.alert').removeClass("alert-danger");
		$(".selector-panel").find('.alert').addClass("alert-warning");

		$(btn).html("Confirm Catchments");
		$(btn).removeClass("btn-primary");
		$(btn).addClass("btn-success");

		this.SELECTING = true;
		this.CLICKING = false;
		if (this.enabled_click == false) {
			GisMap.Map.map.on('singleclick', function(evt) {
				Downloader.getClick(evt)
			});
			this.enabled_click = true;
		}

		if (ToolBar.WMSLayerLoaded == false) {
			AppLayer.createWMSLayer();
			ToolBar.WMSLayerLoaded = true;

		}

		$(btn).attr('onclick', 'Downloader.exitSelection(this)');

	},

	exitSelection : function(btn) {
		this.SELECTING = false;

		$(btn).html("Select Catchments");
		$(btn).addClass("btn-primary");
		$(btn).removeClass("btn-success");

		if (this.CATCHMENTS.length == 0) {
			$(".selector-panel").find('.alert').html("Warning: No Catchments Selected");
			$(".selector-panel").find('.alert').addClass("alert-danger");
			$(".selector-panel").find('.alert').removeClass("alert-warning");
		} else {
			$(".selector-panel").find('.alert').html("Valid Catchments Selected");
			$(".selector-panel").find('.alert').addClass("alert-success");
			$(".selector-panel").find('.alert').removeClass("alert-warning");
		}

		$(btn).attr('onclick', 'Downloader.startSelection(this)');
		this.checkDownload();

	},

	startDraw : function(btn) {
		this.BOUNDING_BOX = [];
		this.CATCHMENTS = [];
		this.SELECTING = false;
		this.CLICKING = false;

		$(".selector-panel").find('.alert').html("Click Drag to Draw an Area.");
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
		this.CATCHMENTS = [];
		this.CLICKING = true;
		this.SELECTING = false;
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
		if (!this.CLICKING && !this.SELECTING)
			return;

		console.log(evt);

		if (this.CLICKING) {
			this.BOUNDING_BOX = [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0] + 0.0000001, evt.coordinate[1] + 0.0000001];
			this.showBoundedCatchments();
		} else if (this.SELECTING) {
			console.log("SELECTING");

			var viewProjection = GisMap.Map.map.getView().getProjection();
			var viewResolution = GisMap.Map.map.getView().getResolution();
			var url = AppLayer.wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {
				'INFO_FORMAT' : 'application/json'
			});

			console.log(url);

			t = $.getJSON(url, function(d) {
				console.log(d);

				Downloader.appendCatchment(d);
			})
		}

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
		this.checkDownload();
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
		this.checkDownload();
	},

	appendCatchment : function(catchment) {
		if (this.SELECTED_LAYER)
			GisMap.Map.map.removeLayer(this.SELECTED_LAYER);
			
		var indx = -1;

		if (this.CATCHMENTS.indexOf(catchment.features[0].properties.FEATUREID) > -1) {
			
			indx = this.CATCHMENTS.indexOf(catchment.features[0].properties.FEATUREID);
			this.CATCHMENTS.splice(1, indx)
			console.log("REMOVED")
			
		} else {
			console.log("ADDED")
			this.CATCHMENTS.push(catchment.features[0].properties.FEATUREID);
		}

		if (this.GEOJSON_CATCHMENTS == null) {
			this.GEOJSON_CATCHMENTS = catchment;
		} else {
			if(indx < 0){
				this.GEOJSON_CATCHMENTS.features.push(catchment.features[0]);
			}
			else{
				this.GEOJSON_CATCHMENTS.features.splice(1, indx);
			}
		}

		var vectorSource = new ol.source.GeoJSON(( {
			object : Downloader.GEOJSON_CATCHMENTS
		}
		));

		this.SELECTED_LAYER = new ol.layer.Vector({
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


		console.log("LOADED")
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
		this.checkDownload();
	},

	startLayerSelector : function() {

		if ($(".layer-select").length > 0)
			return;

		this.layer_selection_panel = GisMap.UI.spawnPanel({
			class : "layer-select"
		}, function(e) {
			$(e.div).append("<div id='options-close' style='padding: 11px 12px;' class='btn btn-danger' onclick='ToolBar.hideThis(this)'><span class='glyphicon glyphicon-remove'></span></div>");
			$(e.div).draggable({
				containment : 'parent'
			});
			$(e.div).append("<h4 style='margin-left:10px'>Select Layers</h4>");
			Downloader.buildLayerSelection(e.div);

		});

	},

	buildLayerSelection : function(div) {
		var con = $("<div class='l-container'></div>");
		$(div).append(con);

		var header = $("<ul class='l-header-list'></ul>");

		//Create Basin Characteristic
		var basin_characteristics = $("<li class='l-header'><input type='checkbox'></input> <span>Basin Characteristics</span>  <span class='headglyph open glyphicon glyphicon-chevron-right'></span></li>");

		//Create Sub Header List
		var ul_subheader = $("<ul class='l-subheader-list'></ul>");
		for (var cat in BASIN_CHARS) {
			var li = $("<li class='l-subheader'><input type='checkbox'></input> " + BASIN_CHARS[cat].link + " <span class='subglyph open glyphicon glyphicon-chevron-right'></span></li>");

			//For each layer in the list, create another list
			var ul_child = $("<ul class='l-child-list'></ul>");
			for (var lay in BASIN_CHARS[cat].list) {
				var l = BASIN_CHARS[cat].list[lay];
				var child_li = $("<li class='l-child' data-layer='" + l.Layer + "'><input type='checkbox'></input> " + l.Label + "</li>");
				$(ul_child).append(child_li);
			}
			$(li).append(ul_child);

			$(ul_subheader).append(li);
		}
		//Append Sub Header
		$(basin_characteristics).append(ul_subheader);

		var stream_environment = $("<li class='l-header'><input type='checkbox'></input> <span>Stream Environment </span><span class='headglyph open glyphicon glyphicon-chevron-right'></span></li>");
		//Create Sub Header List
		ul_subheader = $("<ul class='l-subheader-list'></ul>");
		for (var cat in STREAM_ENV) {
			var li = $("<li class='l-subheader'><input type='checkbox'></input> " + STREAM_ENV[cat].link + " <span class='subglyph open glyphicon glyphicon-chevron-right'></span></li>");

			//For each layer in the list, create another list
			var ul_child = $("<ul class='l-child-list'></ul>");
			for (var lay in STREAM_ENV[cat].list) {
				var l = STREAM_ENV[cat].list[lay];
				var child_li = $("<li class='l-child' data-layer='" + l.Layer + "'><input type='checkbox'></input> " + l.Label + "</li>");
				$(ul_child).append(child_li);
			}
			$(li).append(ul_child);

			$(ul_subheader).append(li);
		}
		//Append Sub Header
		$(stream_environment).append(ul_subheader);

		var fish = $("<li class='l-header'><input type='checkbox'></input> <span>Fish </span><span class='headglyph open glyphicon glyphicon-chevron-right'></span></li>");
		//Create Sub Header List
		ul_subheader = $("<ul class='l-subheader-list'></ul>");
		for (var cat in FISH) {
			var li = $("<li class='l-subheader'><input type='checkbox'></input> " + FISH[cat].link + " <span class='subglyph open glyphicon glyphicon-chevron-right'></span></li>");

			//For each layer in the list, create another list
			var ul_child = $("<ul class='l-child-list'></ul>");
			for (var lay in FISH[cat].list) {
				var l = FISH[cat].list[lay];
				var child_li = $("<li class='l-child' data-layer='" + l.Layer + "'><input type='checkbox'></input> " + l.Label + "</li>");
				$(ul_child).append(child_li);
			}
			$(li).append(ul_child);

			$(ul_subheader).append(li);
		}
		//Append Sub Header
		$(fish).append(ul_subheader);

		$(header).append(basin_characteristics);
		$(header).append("<hr />")
		$(header).append(stream_environment);
		$(header).append("<hr />")
		$(header).append(fish);
		$(header).append("<hr />")

		$(con).append(header);

		$(".l-header").find('span').on('click', function(e) {
			console.log("HEADER")
			console.log(e);

			var par = $(e.target).parent();

			if ($(par).hasClass("closed")) {
				$(par).removeClass("closed");
				$(par).find(".headglyph").addClass("open");
			} else {
				$(par).addClass("closed");
				$(par).find(".headglyph").removeClass("open");
			}
		});

		$(".l-subheader").on('click', function(e) {
			console.log("SUBHEADER")
			console.log(e);
			if ($(e.target).hasClass("closed")) {
				$(e.target).removeClass("closed");
				$(e.target).find(".subglyph").addClass("open");
			} else {
				$(e.target).addClass("closed");
				$(e.target).find(".subglyph").removeClass("open");
			}
		});

		$(con).find("input").on("click", function(e) {
			var par = $(e.target).parent();
			var checked = $(e.target).prop("checked");
			console.log(checked);
			$(par).find("input").prop("checked", checked);

			Downloader.queryCheckedLayers();
			if (checked == true) {
				return;
			}

			//While we are not on the header list, uncheck things
			while ($(par).hasClass("l-header-list") == false) {
				console.log($(par).find("input")[0]);

				console.log($(par).prop("tagName"))

				if ($(par).prop("tagName") == "LI") {
					var inp = $(par).find("input")[0];
					$(inp).prop("checked", false);
				}

				par = $(par).parent();
			}

		})
	},

	queryCheckedLayers : function() {
		var selected_layers = $(".l-child input:checked");
		console.log(selected_layers);

		this.PROPERTIES = [];

		if (selected_layers.length > 0) {
			$(".layer-panel").find(".alert").removeClass("alert-danger");
			$(".layer-panel").find(".alert").addClass("alert-success");
			$(".layer-panel").find(".alert").html("Valid Layers Selected!");
		} else {
			$(".layer-panel").find(".alert").addClass("alert-danger");
			$(".layer-panel").find(".alert").removeClass("alert-success");
			$(".layer-panel").find(".alert").html("Warning: No Layers Selected");
		}

		for (var i = 0; i < selected_layers.length; i++) {
			var layer = $(selected_layers[i]).parent().attr("data-layer");
			this.PROPERTIES.push(RULES[layer].property_name);
		}

		this.checkDownload();
	},

	checkDownload : function() {

		var format = $(this.format_select).find("option:selected").val();
		console.log(format);

		var clear = false;

		var button_url = "#";
		$(this.downloadbtn).attr("href", button_url);
		$(this.downloadbtn).find("button").attr('onclick', '');

		if (this.SIZE == "ALL") {
			if (this.LAYERS == "ALL") {
				//TODO: Enable Button for ALL
				//clear = true;
			}

			if (this.LAYER == "SUBSET") {
				//TODO: Enable Button for All but subset layers
			}
		} else if (this.SIZE == "SUBSET") {
			if (this.LAYERS == "ALL") {
				// Enable for subset but all layers, use GEOSERVER
				button_url = 'http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANHD_Local&outputformat=' + format + '&bbox=' + this.BOUNDING_BOX//+"&propertyName=Herbacious";
				if (this.BOUNDING_BOX.length == 4) {
					clear = true;
					$(this.downloadbtn).attr("href", button_url);
				}
			} else if (this.LAYERS == "SUBSET") {
				//Enable for Subset of Layer and Sizes

				if (this.BOUNDING_BOX.length == 4 && this.PROPERTIES.length > 0) {
					clear = true;
					$(this.downloadbtn).find("button").attr('onclick', 'Downloader.createFile()');
				}
			}
		} else if (this.SIZE == "SINGLE") {
			if (this.LAYERS == "ALL") {
				//SINGLE FOR ALL LAYERS
			} else if (this.LAYERS == "SUBSET") {
				//SINGLE FOR SUBET LAYERS
			}
		} else if (this.SIZE == "SELECTION"){
			if(this.LAYERS == "ALL"){
				
			} else if(this.LAYERS == "SUBSET"){
				if(this.CATCHMENTS.length > 0 && this.PROPERTIES.length > 0){
					clear = true;
					$(this.downloadbtn).find("button").attr('onclick', 'Downloader.createFile()');
				}
				
				
			}
			
			
		}
		console.log(this.downloadbtn);

		if (clear) {
			console.log("BUTTON ENABLED")
			$(this.downloadbtn).find("button").prop("disabled", false);
		} else {
			$(this.downloadbtn).find("button").prop("disabled", true);
		}

	},

	createFile : function() {
		console.log("CREATE FILE");

		var point1 = ol.proj.transform([this.BOUNDING_BOX[0], this.BOUNDING_BOX[1]], "EPSG:900913", "EPSG:4326");
		var point2 = ol.proj.transform([this.BOUNDING_BOX[2], this.BOUNDING_BOX[3]], "EPSG:900913", "EPSG:4326");

		var transformedBB = [point1[0], point1[1], point2[0], point2[1]];
		if(this.BOUNDING_BOX.length == 0) transformedBB = null;
		
		var R_JSON_OBJECT = {
			FORMAT : $(Downloader.format_select).find("option:selected").val(),
			BOUNDING_BOX : transformedBB,
			LAYERS : Downloader.PROPERTIES,
			CATCHMENTS: Downloader.CATCHMENTS
		};

		$.post("http://felek.cns.umass.edu:8888/map/createDataFile", R_JSON_OBJECT, function(d) {

		});

	}
}
