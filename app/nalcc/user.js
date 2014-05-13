var User = {

	name : "Guest",
	id : "testuser1",
	basin_layers:[],

	showUserPanel : function() {
		var panel = GisMap.UI.spawnPanel({
			class : "user-panel"
		}, function(el) {
			var header = $("<span>User: &nbsp;<b>" + User.name + "</b></span>");
			$(el.div).append(header);

			$(el.div).append("<a href='#' style='margin-left:10px;color:black;background: rgba(255,255,255,.2);padding: 4px;'>Sign Out</a>");
			$(el.div).append("<a href='#' style='margin-left:10px;color:black;background: rgba(255,255,255,.2);padding: 4px;'>My Account</a>");
		});

		this.downloadUserBasins();

	},

	downloadUserBasins : function() {
		var href = "http://felek.cns.umass.edu:8888/" + this.id + "/basin/aliaslist.json";

		var userBasins = GisMap.UI.spawnPanel({
			class : "user-basins"
		}, function(el) {
			$(el.div).append("<h3 style='text-align:center' >My Basins</h3>");
			$(el.div).append("<div id='mybasins-close' class='btn btn-danger' onclick='ToolBar.hideBasins()'><span class='glyphicon glyphicon-remove'></span></div>");
		});

		var ul = $("<ul class='basin-list'></ul>");

		$.getJSON(href, function(data) {
			for (var b in data.list) {
				var basin = data.list[b];
				var li = $("<li><input type='checkbox' style='margin-right:5px;float:left;' checked='false' onclick='User.triggerBasin(this, " + basin.basin_id + ")'>" + basin.basin_alias + " [ " + basin.basin_id + "]</li>");
				$(li).find("input").prop("checked", false);
				$(ul).append(li);
				User.loadCatchments(basin.basin_id);
			}
		})

		$(userBasins.div).append(ul);

		$(userBasins.div).draggable({
			containment : 'parent'
		});

		$(".user-basins").resizable({
			containment : 'parent',
			maxHeight : 550,
			maxWidth : 350,
			minHeight : 150,
			minWidth : 200
		});
		
		setInterval(function(){
			$(".user-basins ul").css('height', (parseFloat($(".user-basins").css('height')) - 70) + "px");
			$(".user-basins ul").css('width', (parseFloat($(".user-basins").css('width')) + 10) + "px");
		},10)
	},
	
	loadCatchments:function(id){
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
			vectorLayer.setVisible(false);		
			vectorLayer.IDENTIFICATION = id;
			GisMap.Map.map.addLayer(vectorLayer);
			User.basin_layers.push(vectorLayer);
		},1000)
		
		
		//var layersCollection = GisMap.Map.map.getLayers();
		//console.log(layersCollection);
		
		
	},
	
	triggerBasin:function(el,id){
		//console.log(id);
		////console.log($(el).prop('checked'));
		
		for(var b in User.basin_layers){
			//console.log(User.basin_layers[b].IDENTIFICATION);
			if(User.basin_layers[b].IDENTIFICATION == id){
				User.basin_layers[b].setVisible ( $(el).prop('checked') );
				GisMap.Map.map.render();
				break;
			}
		}
	}
}
