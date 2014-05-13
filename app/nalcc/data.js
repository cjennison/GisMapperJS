var mousemovefn = function() {
	//console.log("woof");

	var lon = parseFloat($(".lon").html());
	var lat = parseFloat($(".lat").html());

	var coord = ol.proj.transform([lon, lat], "EPSG:4326", "EPSG:900913");
	//	console.log(coord);

	GEOJSON.features[1] = {
		'type' : 'Feature',
		'geometry' : {
			'coordinates' : coord,
			'type' : "Point"
		},

	};

	Data.updateGeoJSON();
	Data.DRAW_COORDS.second = coord;
	//Data.buildBoundingBox();
}
var styleCache = {};

var image = new ol.style.Circle({
	radius : 5,
	fill : null,
	stroke : new ol.style.Stroke({
		color : 'red',
		width : 1
	})
});

var styles = {
	'Point' : [new ol.style.Style({
		image : image
	})],
	'LineString' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'green',
			width : 1
		})
	})],
	'MultiLineString' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'green',
			width : 1
		})
	})],
	'MultiPoint' : [new ol.style.Style({
		image : image
	})],
	'MultiPolygon' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'yellow',
			width : 1
		}),
		fill : new ol.style.Fill({
			color : 'rgba(255, 255, 0, 0.1)'
		})
	})],
	'Polygon' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'blue',
			lineDash : [4],
			width : 3
		}),
		fill : new ol.style.Fill({
			color : 'rgba(0, 0, 255, 0.1)'
		})
	})],
	'GeometryCollection' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'magenta',
			width : 2
		}),
		fill : new ol.style.Fill({
			color : 'magenta'
		}),
		image : new ol.style.Circle({
			radius : 10,
			fill : null,
			stroke : new ol.style.Stroke({
				color : 'magenta'
			})
		})
	})],
	'Circle' : [new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'red',
			width : 2
		}),
		fill : new ol.style.Fill({
			color : 'rgba(255,0,0,0.2)'
		})
	})]
};

var styleFunction = function(feature, resolution) {
	return styles[feature.getGeometry().getType()];
};

//The GeoJSON that holds the wonderful drag box
var GEOJSON = {

	'type' : 'FeatureCollection',
	'crs' : {
		'type' : 'name',
		'properties' : {
			'name' : 'EPSG:900913'
		}
	},
	'features' : []

}

var GEOJSON_BACKUP = GEOJSON;

var Data = {

	popup : null,
	ID : null,
	COORD : null,
	DELINEATED_ID : null,
	WORKING : false,
	EXTENT : null,

	DOWNLOAD : {
		base : "",
		format : "csv",
		features : 50,
		order : [],
		bound : ""
	},

	CATCHMENT_LAYER : null,
	BASIN_LAYER : null,
	VECTOR_LAYER : null,
	DRAW_CONTROL : null,
	MOUSE_CONTROL : null,
	DRAWING : false,
	TRACKING : false,
	HIGHLIGHT_LAYER : null,
	SELECTED_LAYER:null,
	MAP_HAS_EVENT : false,

	DRAW_COORDS : {
		first : [],
		second : []
	},

	//Creates a popup from the WMS request
	createCatchmentPopup : function(coordinate) {

		console.log("COORDINATES:");
		console.log(coordinate);

		if (Data.popup) {
			$(Data.popup).remove();

		}

		this.WORKING = true;

		Data.popup = GisMap.Map.spawnPopup(coordinate);
		Data.popup.append("<h4>Loading Information..</h4>");
		Data.popup.append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>');

		Data.COORD = ol.proj.transform(coordinate, GisMap.Core.Application.projection, GisMap.Core.Application.incoming_projection);

	},

	populatePopup : function(data) {
		console.log(data);

		/*
		 var catchment = $.getJSON("http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANENY_NHDCatchments_LocalStats_2&featureID=" + data.features[0].id + "&propertyName=&maxfeatures=50&outputformat=json", function(data){
		 console.log(data);
		 })
		 */

		this.EXTENT = this.calculateExtent(data.features[0].geometry.coordinates[0][0]);

		var vectorSource = new ol.source.GeoJSON(
		/** @type {olx.source.GeoJSONOptions} */( {
			object : data
		}));
		var styleCache = {};

		if (this.CATCHMENT_LAYER != null)
			GisMap.Map.map.removeLayer(this.CATCHMENT_LAYER);

		this.CATCHMENT_LAYER = new ol.layer.Vector({
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
							width : 1
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
		setTimeout(function() {
			GisMap.Map.map.addLayer(Data.CATCHMENT_LAYER);

		}, 1000)

		console.log(vectorSource);

		//"NENY_NHDCatchments_LocalStats_2.44806"
		//Extract Panel
		var tempPanel = $(Data.popup).clone();
		$(Data.popup).remove();
		$("body").append(tempPanel);
		$(tempPanel).draggable({
			containment : 'parent'
		})
		Data.popup = tempPanel;
		$(Data.popup).css("top", "20%");
		$(Data.popup).css("left", "65%");

		$(Data.popup).find("h4").html(data.features[0].properties.FEATUREID);

		$(Data.popup).append("<button class='datamaximize btn btn-primary' onclick='Data.initFullData()'> <span class='glyphicon glyphicon-fullscreen'></span></button>")
		$(Data.popup).append("<button class='zoomtoextent btn btn-default' onclick='Data.zoomToExtent()'>Zoom</button>");

		Data.ID = data.features[0].properties.FEATUREID;

		$(Data.popup).find(".progress").remove();

		$(Data.popup).css("height", "325px");

		////////////// Characteristics
		var chars = $("<div class='basin-chars-toggle pop-tab' data-tab='chars'><button class='btn btn-default btn-success tabbtn' data-tab='chars' onclick='Data.toggleTab(this);'>Characteristics</button></div>");
		$(chars).append("<div class='basin-chars sub-panel' style='display:block'></div>");

		var table = $("<table class='table table-striped'></table>");
		$(table).append("<tr><th>Label</th><th>Value</th></tr>");
		for (var prop in data.features[0].properties) {
			var property = data.features[0].properties[prop];

			var format = INFO_FORMAT[prop];
			if (format.remove == false) {
				var tr = $("<tr></tr>");
				$(tr).append("<td>" + format.copy + "</td>");
				$(tr).append("<td>" + property + "</td>");
			}
			$(table).append(tr);

		}

		$(chars).find(".sub-panel").append(table);

		////////////// Models
		var mod = $("<div class='basin-mod-toggle pop-tab' data-tab='models'><button class='btn btn-default tabbtn' data-tab='models' onclick='Data.toggleTab(this);'>Models</button></div>");
		$(mod).append("<div class='basin-mod sub-panel' style='display:none'></div>");

		var occu = $("<span><b>Brook Trout Occupancy:</b></br> </span><button class='btn btn-primary occupancy-btn' onclick='Data.organizeOcc()'>Generate Response Surface</button><div class='occu-container'></div>")
		$(mod).find('.sub-panel').append(occu);

		////////////// Application
		var app = $("<div class='basin-app-toggle pop-tab' data-tab='apps'><button class='btn btn-default tabbtn' data-tab='apps' onclick='Data.toggleTab(this);'>Applications</button></div>");
		$(app).append("<div class='basin-app sub-panel' style='display:none'></div>");

		var delineation = $("<span><b>Delineation:</b></br> </span><button class='btn btn-primary main-delineator' onclick='Data.organizeDelin()'>Basin Delineation</button><div class='delin-container'></div>")

		$(app).find(".sub-panel").append(delineation);

		var support_system = $("<hr><span><b>Scenario Tester:</b></br> </span><button class='btn btn-primary support-system' onclick='Data.organizeSystemSupport()'>Scenario Tester</button><div class='system-container'>You must delineate before testing this basin.</div>")
		$(app).find(".sub-panel").append(support_system);

		$(Data.popup).append(chars);
		$(Data.popup).append(mod);
		$(Data.popup).append(app);
		$(".support-system").prop("disabled", true);

		$(Data.popup).resizable({
			maxHeight : 637,
			maxWidth : 503,
			minHeight : 150,
			minWidth : 319
		});
		setInterval(function() {
			var w = $(".popup").css("width");
			var h = $(".popup").css("height");
			$(".sub-panel").css("width", ((parseFloat(w) - 10)));
			$(".sub-panel").css("height", ((parseFloat(h) - 80)));
		}, 10)
	},

	organizeOcc : function() {
		NALCC_MODELS.OCCUPANCY_MODEL(Data.ID, function(res) {
			$(Data.popup).find(".occu-container .progress").css("width", "0%");
			setTimeout(function() {
				$(Data.popup).find(".occu-container .progress").remove();
			}, 800)
			$(Data.popup).find(".occu-container").append("<img style='width: 100%;' src='http://felek.cns.umass.edu:8888" + res + "surface.png'>");

		})

		$(Data.popup).find(".occu-container").append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Running Model..</span></div></div>');
		$(".occupancy-btn").prop('disabled', true);

	},

	organizeDelin : function() {
		NALCC_MODELS.BASIN_DELINEATION(Data.COORD[1], Data.COORD[0], User.id, function(r) {
			//Now we have the basin ID
			Data.DELINEATED_ID = r.basinID;
			Data.placeDelineatedBasin(r.basinID);
			$(Data.popup).find(".delin-container .progress").css("width", "0%");
			setTimeout(function() {
				$(Data.popup).find(".delin-container .progress").remove();
				$(Data.popup).find(".delin-container").prepend("Delineation Successful.");
			}, 800)

			$(".support-system").prop('disabled', false);
			$(".system-container").remove();

		})
		$(Data.popup).find(".delin-container").append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Delineating..</span></div></div>');

		$(".main-delineator").prop("disabled", true);

	},

	placeDelineatedBasin : function(id) {
		var styleCache = {};
		if (this.BASIN_LAYER != null)
			GisMap.Map.map.removeLayer(this.BASIN_LAYER);

		this.BASIN_LAYER = new ol.layer.Vector({
			source : new ol.source.GeoJSON({
				projection : 'EPSG:3857',
				url : "http://felek.cns.umass.edu:8888/" + id + "/catchment.geojson"
			}),
			style : function(feature, resolution) {
				var text = resolution < 5000 ? feature.get('name') : '';
				if (!styleCache[text]) {
					styleCache[text] = [new ol.style.Style({
						fill : new ol.style.Fill({
							color : 'rgba(255, 255, 255, 0.1)'
						}),
						stroke : new ol.style.Stroke({
							color : '#319FD3',
							width : 1
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

		//TODO: This is really bad.. dont do this.. fix it please
		setTimeout(function() {
			Data.BASIN_LAYER.IDENTIFICATION = id;
			GisMap.Map.map.addLayer(Data.BASIN_LAYER);
			GisMap.Map.map.render();
		}, 1000);

		$.getJSON("http://felek.cns.umass.edu:8888/" + id + "/catchment.geojson", function(d) {
			console.log(d);
			Data.EXTENT = Data.calculateExtent(d.features[0].geometry.coordinates[0], true);
		})
	},

	organizeSystemSupport : function() {
		window.open('http://felek.cns.umass.edu:8888/remote-login-completed?user=' + User.id + '&basin_id=' + Data.DELINEATED_ID, '_blank');
	},

	toggleTab : function(el) {
		$(".pop-tab .tabbtn").removeClass("btn-success");
		$(el).addClass("btn-success");

		var tab = $(el).attr("data-tab");
		$(".sub-panel").css('display', "none");
		$("[data-tab=" + tab + "]").find(".sub-panel").css("display", "block");

	},

	downloadData : function(id) {
		if ($(".download-panel").length > 0) {
			$(".download-panel").remove();
			Data.DOWNLOAD.format = "csv";
			Data.DOWNLOAD.features = 50;
		}
		
		$(".dropdownpanel").removeClass("active");

		console.log(id);
		var link = "";
		var base = "";
		switch (id) {

			case "Catchments":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANENY_NHDCatchments_LocalStats_2&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANENY_NHDCatchments_LocalStats_2";
				break;

			case "BrookTrout":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ACurrent&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ACurrent";
				break;

			case "CTPreds":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3AFall_Slope&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3AFall_Slope";
				break;

			case "MeanFlow":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3Aflow_pred_hw_01_2014&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3Aflow_pred_hw_01_2014";
				break;

			case "Stemp":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANumber_of_Observations&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANumber_of_Observations";
				break;

			case "Fobs":
				link = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANumber_Observations&maxfeatures=50&outputformat=csv";
				base = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANumber_Observations";
				break;

			default:
				break;
		}

		Data.DOWNLOAD.base = base;

		var downloadPanel = GisMap.UI.spawnPanel({
			class : "download-panel"
		}, function(ret) {
			console.log(ret.div);
			$(ret.div).draggable({
				containment : 'parent'
			})
			$(ret.div).append("<h3 style='font-weight:400;margin-left: 20px;margin-top: 9px;'>Download Data</h3>");
			$(ret.div).append("<div id='options-close' class='btn btn-danger' onclick='ToolBar.hideThis(this)'><span class='glyphicon glyphicon-remove'></span></div>");

			var downloadForm = $("<div class='downloadForm'></div>");
			$(downloadForm).append("Format: <select class='form-control format-select'><option value='csv' selected>CSV</option><option value='SHAPE-ZIP'>ShapeFile</option><option value='json'>GeoJSON</option><option value='application%2Fjson'>JSON</option></select> <br />")
			$(downloadForm).append('Max Features: <div id="slider" class="numFeaturesSlider"></div><span class="num_features">: 50</span>')
			$(downloadForm).append('<button class="btn btn-default" onclick="Data.startDraw(this);" style="position:relative; top:60px;">Draw Bounding Box</button>')
			$(downloadForm).append('<br /><span class="BBoxConfirm">Warning: No Bounding Box Selected</div>');
			$(ret.div).append(downloadForm);

			$(".format-select").change(function(e) {
				console.log(e);
				Data.DOWNLOAD.format = $(".format-select :selected").val()
				Data.updateDownloadLink(base);
			})

			$(".numFeaturesSlider").slider({
				range : "min",
				value : 50,
				min : 1,
				max : 1000,
				slide : function(event, ui) {
					$(".num_features").html(": " + ui.value);
					Data.DOWNLOAD.features = ui.value;
					Data.updateDownloadLink(base);
				}
			});

			$(ret.div).append("<a class='dnld-lnk' href=' " + link + "'><button class='btn btn-primary'>Download</button></a>")
		});

	},

	startDraw : function(el) {
		console.log("DRAW");
		Data.DRAWING = true;
		Data.DOWNLOAD.bound = "";
		var source = new ol.source.Vector();

		this.VECTOR_LAYER = new ol.layer.Vector({
			source : source,
			style : new ol.style.Style({
				fill : new ol.style.Fill({
					color : 'rgba(255, 255, 255, 0.2)'
				}),
				stroke : new ol.style.Stroke({
					color : '#ffcc33',
					width : 2
				}),
				image : new ol.style.Circle({
					radius : 7,
					fill : new ol.style.Fill({
						color : '#ffcc33'
					})
				})
			})

		});

		GisMap.UI.spawnUpdate("Entered Drawing Mode");
		GisMap.Map.map.addLayer(this.VECTOR_LAYER);

		//Reset GeoJSON
		GEOJSON = GEOJSON_BACKUP;

		if (Data.MAP_HAS_EVENT == false) {

			Data.MAP_HAS_EVENT = true;
			GisMap.Map.map.on('singleclick', function(evt) {
				Data.drawOnClick(evt);
			})
		}

		ToolBar.togglePanner();

		//

		//this.DRAW_CONTROL = new ol.interaction.DragBox({
		//	source: source,
		//});

		$(el).addClass("btn-danger");
		$(el).html("Exit Drawing Mode");
		$(el).attr("onclick", "Data.exitDrawingMode(this)");

	},

	drawOnClick : function(evt) {
		console.log(" -----------------------------NEW---------------------------------- ");
		if (Data.DRAWING == false)
			return;

		if (Data.TRACKING == false) {
			console.log("TRACKING WAS FALSE");

			//Create a Point
			GEOJSON.features[0] = {
				'type' : 'Feature',
				'geometry' : {
					'coordinates' : [evt.coordinate[0], evt.coordinate[1]],
					'type' : "Point"
				},

			};
			console.log(evt.coordinate);
			Data.DRAW_COORDS.first = evt.coordinate;

			$("#map").on('mousemove', mousemovefn);
			Data.TRACKING = true;
			Data.updateGeoJSON();
			return;
		} else {
			GEOJSON.features[1] = {
				'type' : 'Feature',
				'geometry' : {
					'coordinates' : [evt.coordinate[0], evt.coordinate[1]],
					'type' : "Point"
				},

			};
			Data.updateGeoJSON();
			Data.DRAW_COORDS.second = evt.coordinate;
			$("#map").off('mousemove', mousemovefn);
			Data.TRACKING = false;
			console.log(evt.coordinate);
			Data.buildBoundingBox();
			Data.updateDownloadLink(Data.DOWNLOAD.base);
		}

		console.log(" -----------------------------END---------------------------------- ");

	},

	updateGeoJSON : function() {

		if (Data.HIGHLIGHT_LAYER != null)
			GisMap.Map.map.removeLayer(Data.HIGHLIGHT_LAYER);
		var vectorSource = new ol.source.GeoJSON(
		/** @type {olx.source.GeoJSONOptions} */( {
			object : GEOJSON

		}
		));
		//console.log("SICCESS")
		Data.HIGHLIGHT_LAYER = new ol.layer.Vector({
			source : vectorSource,
			style : new ol.style.Style({
				fill : new ol.style.Fill({
					color : 'rgba(255, 255, 255, 0.2)'
				}),
				stroke : new ol.style.Stroke({
					color : '#ffcc33',
					width : 2
				}),
				image : new ol.style.Circle({
					radius : 7,
					fill : new ol.style.Fill({
						color : '#ffcc33'
					})
				})
			})
		});

		GisMap.Map.map.addLayer(Data.HIGHLIGHT_LAYER);
		//console.log(vectorSource);

	},

	buildBoundingBox : function() {
		console.log(Data.DRAW_COORDS);

		//Order: MinX, Max Y, Max X, MinY
		var order = [];
		if (Data.DRAW_COORDS.first[0] < Data.DRAW_COORDS.second[0]) {
			order[0] = Data.DRAW_COORDS.first[0];
			order[2] = Data.DRAW_COORDS.second[0];
		} else {
			order[2] = Data.DRAW_COORDS.first[0];
			order[0] = Data.DRAW_COORDS.second[0];
		}

		if (Data.DRAW_COORDS.first[1] > Data.DRAW_COORDS.second[1]) {
			order[3] = Data.DRAW_COORDS.first[1];
			order[1] = Data.DRAW_COORDS.second[1];
		} else {
			order[3] = Data.DRAW_COORDS.second[1];
			order[1] = Data.DRAW_COORDS.first[1];
		}

		console.log(order);

		//DRAW RECTANGLE
		var polygon = {
			'type' : 'Feature',
			'geometry' : {
				'type' : 'Polygon',
				'coordinates' : [[[order[0], order[1]], [order[0], order[3]], [order[2], order[3]], [order[2], order[1]]]]
			}
		};

		GEOJSON.features[2] = polygon;
		this.updateGeoJSON();
		

		Data.DOWNLOAD.bound = "&bbox=" + order[0] + "," + order[1] + "," + order[2] + "," + order[3];// + "&srsName=EPSG:900913"; TODO: REPLACE
		Data.DOWNLOAD.order = order;

		var url = "http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANENY_NHDCatchments_LocalStats_2&bbox=" + order[0] + "," + order[1] + "," + order[2] + "," + order[3] + "&srsName=EPSG:900913&outputformat=json";
		console.log(url);

		$('.BBoxConfirm').html("Bounding Box Selected");
		//http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANENY_NHDCatchments_LocalStats_2&bbox=-8265274.338399348,5025227.281815308,-8196786.76105583,5120620.693115208&srsName=EPSG:900913&outputformat=json

	},

	exitDrawingMode : function(el) {
		//GisMap.Map.map.removeInteraction(this.DRAW_CONTROL);
		if (this.HIGHLIGHT_LAYER)
			GisMap.Map.map.removeLayer(this.HIGHLIGHT_LAYER);

		$(el).removeClass("btn-danger");
		$(el).html("Draw Bounding Box");
		$(el).attr("onclick", "Data.startDraw(this)");
		Data.DRAWING = false;
		Data.TRACKING = false;
		$("#map").off('mousemove', mousemovefn);
		
		
		console.log()
		
		if(GEOJSON.features.length > 0){
			GEOJSON = GEOJSON_BACKUP;
			Data.showBBoxCatchments();
			GEOJSON.features = [];
		} else {
			console.log("WARNING: NO BBOX SELECTED");
		}
		

		this.DRAW_COORDS.first = this.DRAW_COORDS.second = [];
		//GisMap.Map.map.off('singleclick', function(evt){
		//	Data.drawOnClick(evt);

		//})
	},

	//Gets a Map of Catchments from a Bounding Box
	showBBoxCatchments : function() {
		$.getJSON('http://felek.cns.umass.edu:8080/geoserver/Streams/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Streams%3ANHD_Local&maxfeatures=' + Data.DOWNLOAD.features + '&outputformat=json' + Data.DOWNLOAD.bound, function(d) {
			console.log(d);
			if(Data.SELECTED_LAYER) GisMap.Map.map.removeLayer(Data.SELECTED_LAYER);
			var vectorSource = new ol.source.GeoJSON(
			/** @type {olx.source.GeoJSONOptions} */( {
					object : d
	
				}
			));

			Data.SELECTED_LAYER = new ol.layer.Vector({
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
								width : 1
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
			
			GisMap.Map.map.addLayer(Data.SELECTED_LAYER)

		});
		
	},

	updateDownloadLink : function(base) {
		var link = base + "&maxfeatures=" + Data.DOWNLOAD.features + Data.DOWNLOAD.bound + "&outputformat=" + Data.DOWNLOAD.format;

		console.log(link)

		$(".dnld-lnk").attr("href", link);
	},

	calculateExtent : function(points, transform) {
		console.log(points);

		var minx = points[0][0], maxx = points[1][0];
		miny = points[0][1];
		maxy = points[1][1];

		var LON = 0;
		var LAT = 1;

		for (var p in points) {
			var c = points[p];
			if (c[LON] < minx) {
				//New Lon is less than the min
				minx = c[LON];
			}

			if (c[LON] > maxx) {
				//new lon is greater than the max
				maxx = c[LON];
			}

			if (c[LAT] < miny) {
				//New Lon is less than the min
				miny = c[LAT];
			}

			if (c[LAT] > maxy) {
				//new lon is greater than the max
				maxy = c[LAT];
			}

		}

		var ext = {
			minLon : minx,
			maxLon : maxx,
			minLat : miny,
			maxLat : maxy
		}
		//ol.proj.transform([cc.list1.num0,cc.list0.num0], GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection),
		var extent = {
			point1 : [ext.minLon, ext.minLat],
			point2 : [ext.maxLon, ext.maxLat],
		}

		if (transform) {
			var extent = {
				point1 : ol.proj.transform([ext.minLon, ext.minLat], GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection),
				point2 : ol.proj.transform([ext.maxLon, ext.maxLat], GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection)
			}
		}
		console.log(extent);

		return extent;

	},

	zoomToExtent : function() {
		GisMap.Map.map.getView().fitExtent([this.EXTENT.point1[0], this.EXTENT.point1[1], this.EXTENT.point2[0], this.EXTENT.point2[1]], GisMap.Map.map.getSize())

		//GisMap.Map.flyToPoint(this.EXTENT);
	},

	initFullData : function() {
		var datawindow = $("<div class='shadowbox'><div class='datawindow'></div></div>");
		$(datawindow).append(Data.popup);

		this.toggleFullScreen();

		$("body").append(datawindow);
	},

	toggleFullScreen : function() {
		var maxbtn = $(Data.popup).find(".datamaximize");
		$(maxbtn).find("span").removeClass("glyphicon-fullscreen");
		$(maxbtn).find("span").addClass("glyphicon-minus");

		$(maxbtn).attr("onclick", "Data.toggleSmallScreen();")

		$(Data.popup).css("opacity", "1");
		$(Data.popup).css("width", "500px");
		$(Data.popup).css("left", "35%");
		$(Data.popup).css("top", "17%");
		$(Data.popup).css("height", "80%");
		$(Data.popup).resizable('disable');
		$(Data.popup).draggable('disable');

		$(Data.popup).find("#options-close").attr("onclick", "ToolBar.hideThis(this); Data.hideShadow();");
	},

	toggleSmallScreen : function() {
		var maxbtn = $(Data.popup).find(".datamaximize");
		$(maxbtn).find("span").removeClass("glyphicon-minus");
		$(maxbtn).find("span").addClass("glyphicon-fullscreen");

		$(Data.popup).css("width", "319px");
		$(Data.popup).css("height", "325px");

		$(maxbtn).attr("onclick", "Data.initFullData();")

		$('body').append(Data.popup);
		$(Data.popup).resizable('enable');
		$(Data.popup).draggable('enable')
		$(".shadowbox").remove();
		$(Data.popup).find("#options-close").attr("onclick", "ToolBar.hideThis(this);");
	},

	hideShadow : function() {
		$(".shadowbox").remove();
	}
}
