var Data = {

	popup : null,
	ID : null,
	COORD : null,
	DELINEATED_ID:null,

	//Creates a popup from the WMS request
	createCatchmentPopup : function(coordinate) {
		if (Data.popup) {
			$(Data.popup).remove();

		}

		Data.popup = GisMap.Map.spawnPopup(coordinate);
		Data.popup.append("<h4>Loading Information..</h4>");
		Data.popup.append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>');
		
		Data.COORD = ol.proj.transform(coordinate, GisMap.Core.Application.projection, GisMap.Core.Application.incoming_projection);

	},

	populatePopup : function(data) {
		console.log(data);

		$(Data.popup).find("h4").html(data.features[0].properties.FEATUREID);
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
		
		var occu = $("<span><b>Occupancy:</b></br> </span><button class='btn btn-primary occupancy-btn' onclick='Data.organizeOcc()'>Run Occupancy Model</button><div class='occu-container'></div>")
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
		$(".support-system").prop("disabled", true)
	},
	
	organizeOcc:function(){
		NALCC_MODELS.OCCUPANCY_MODEL(Data.ID, function(res){
			$(Data.popup).find(".occu-container .progress").css("width", "0%");
			setTimeout(function(){
				$(Data.popup).find(".occu-container .progress").remove();
			},800)
			$(Data.popup).find(".occu-container").append("<img style='width: 100%;' src='http://felek.cns.umass.edu:8888" + res + "surface.png'>");
			
		})
		
		$(Data.popup).find(".occu-container").append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Running Model..</span></div></div>');
		$(".occupancy-btn").prop('disabled', true);
		
	},
	
	organizeDelin:function(){
		NALCC_MODELS.BASIN_DELINEATION(Data.COORD[1], Data.COORD[0], User.id, function(r){
			//Now we have the basin ID
			Data.DELINEATED_ID = r.basinID;
			Data.placeDelineatedBasin(r.basinID);
			$(Data.popup).find(".delin-container .progress").css("width", "0%");
			setTimeout(function(){
				$(Data.popup).find(".delin-container .progress").remove();
				$(Data.popup).find(".delin-container").prepend("Delineation Successful.");
			},800)
			
			$(".support-system").prop('disabled', false);
			$(".system-container").remove();
			
		})
		$(Data.popup).find(".delin-container").append('<div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span>Delineating..</span></div></div>');
		
		$(".main-delineator").prop("disabled", true);
		
		
		
	},
	
	placeDelineatedBasin:function(id){
		var styleCache = {};
		var vectorLayer = new ol.layer.Vector({
		  source: new ol.source.GeoJSON({
		    projection: 'EPSG:3857',
		    url: "http://felek.cns.umass.edu:8888/" + id + "/catchment.geojson"
		  }),
		  style: function(feature, resolution) {
		    var text = resolution < 5000 ? feature.get('name') : '';
		    if (!styleCache[text]) {
		      styleCache[text] = [new ol.style.Style({
		        fill: new ol.style.Fill({
		          color: 'rgba(255, 255, 255, 0.1)'
		        }),
		        stroke: new ol.style.Stroke({
		          color: '#319FD3',
		          width: 1
		        }),
		        text: new ol.style.Text({
		          font: '12px Calibri,sans-serif',
		          text: text,
		          fill: new ol.style.Fill({
		            color: '#000'
		          }),
		          stroke: new ol.style.Stroke({
		            color: '#fff',
		            width: 3
		          })
		        }),
		        zIndex:999
		      })];
		    }
		    return styleCache[text];
		  }
		});
		
		//TODO: This is really bad.. dont do this.. fix it please
		setTimeout(function(){
			vectorLayer.IDENTIFICATION = id;
			GisMap.Map.map.addLayer(vectorLayer);
			GisMap.Map.map.render();
		},1000)
	},
	
	organizeSystemSupport:function(){
    	window.open('http://felek.cns.umass.edu:8888/remote-login-completed?user=' + User.id + '&basin_id=' + Data.DELINEATED_ID, '_blank');
	},
	

	toggleTab : function(el) {
		$(".pop-tab .tabbtn").removeClass("btn-success");
		$(el).addClass("btn-success");

		var tab = $(el).attr("data-tab");
		$(".sub-panel").css('display', "none");
		$("[data-tab=" + tab + "]").find(".sub-panel").css("display", "block");

	}
}
