var Basemaps = {
	
	
	stamen:function(type, el){
		var newLayer = new ol.layer.Tile({
			source: new ol.source.Stamen({
				layer:type
			})
		});
		$("#basemap_dropdown .btn_label").html("Basemap: " + $(el).html());

		GisMap.Map.addBasemap(newLayer);
		
		
	},
	
	
	basic:function(){
		 var newl = new ol.layer.Tile({
	      source: new ol.source.OSM()
	    })
	    
		$("#basemap_dropdown .btn_label").html("Basemap: OpenStreetMaps");
		GisMap.Map.addBasemap(newl);
	},
	
	bing:function(s, el){
		var newlayer = new ol.layer.Tile({
		    preload: Infinity,
		    source: new ol.source.BingMaps({
		      key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
		      imagerySet: s
		    })
		});
		$("#basemap_dropdown .btn_label").html("Basemap: " + $(el).html());
		GisMap.Map.addBasemap(newlayer);
	},
	
	mapquest:function(){
		 var newl = new ol.layer.Tile({
		    style: 'Road',
		    source: new ol.source.MapQuest({layer: 'osm'})
		  })
	    
		$("#basemap_dropdown .btn_label").html("Basemap: MapQuest");
		GisMap.Map.addBasemap(newl);
	}

	
	
	
}
