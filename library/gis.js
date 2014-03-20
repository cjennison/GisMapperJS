GisMap.GIS = {

	calculateLocation : function(locationString, cb) {
		console.log(locationString);
		if (locationString.length < 2){
			alert("Your string must be greater than 2 characters");
			return;
		}
	
		console.log(locationString);

		geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'address' : locationString
		}, function(results, status) {
			console.log(results);
			if (status == google.maps.GeocoderStatus.OK) {
				var cc;
				var projWGS84 = GisMap.Core.Application.incoming_projection;
				var proj900913 = GisMap.Core.Application.projections

				if (results[0].geometry.bounds != undefined) {

					var coords = {
						list0 : {
							num0 : null,
							num1 : null
						},
						list1 : {
							num0 : null,
							num1 : null
						}
					};
					var numvars = 0;
					for (var key in results[0].geometry.bounds) {
						var obj = results[0].geometry.bounds[key];
						var numcoords = 0;
						for (var prop in obj) {

							if (obj.hasOwnProperty(prop)) {

								coords["list" + numvars]["num" + numcoords] = obj[prop];
								numcoords++;
							}

						}

						numvars++;

					}
					cc = coords;

					
				} else {

					var coords = {
						list0 : {
							num0 : null,
							num1 : null
						},
						list1 : {
							num0 : null,
							num1 : null
						}
					};
					var numvars = 0;
					for (var key in results[0].geometry.viewport) {
						var obj = results[0].geometry.viewport[key];
						var numcoords = 0;
						for (var prop in obj) {

							if (obj.hasOwnProperty(prop)) {

								coords["list" + numvars]["num" + numcoords] = obj[prop];
								numcoords++;
							}

						}

						numvars++;

					}
					cc = coords;
				
				}
				
				var extent = {
					point1:ol.proj.transform([cc.list1.num0,cc.list0.num0], GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection),				
					point2:ol.proj.transform([cc.list1.num1,cc.list0.num1], GisMap.Core.Application.incoming_projection, GisMap.Core.Application.projection),				
					
				}
				
				console.log(extent);

			
				
				
				
				if(cb)
					cb(extent);

			//	map.zoomToExtent(bound, true);
				//map.panTo(lonlat_search)
			} else {
				alert("FAILED");
			}

		})
	}
}
