var User = {

	name : "Guest",
	id : "testuser1",
	basin_layers:[],

	showUserPanel : function() {
		var panel = GisMap.UI.spawnPanel({
			class : "user-panel"
		}, function(el) {
			//var header = $("<span>User: &nbsp;<b>" + User.name + "</b></span>");
			//$(el.div).append(header);
			$(el.div).append("<form id='form_login' style='display:inline-block; width:70%;'><input type='text' style='display:inline-block; width:50%;' class='form-control' name='username' placeholder='Username'><input type='password' style='display:inline-block; width:50%;' class='form-control' name='password' placeholder='Password'></form>");
			$(el.div).append("<a href='#' id = 'button_login'>Log In</a>");
			$(el.div).append("<span href= '#' id = 'text_username'>Guest</span>");
			$(el.div).append("<a href='#' id = 'button_logout'>Log Out</a>");
			$(el.div).append("<a href='#' id = 'button_register'>Register</a>");
			//$(el.div).append("<a href='#' style='margin-left:10px;color:black;background: rgba(255,255,255,.2);padding: 4px;'>My Account</a>");
			$("#button_logout").hide();
			$("#text_username").hide();
			$('#button_login').attr("onclick", "User.sendLoginData()");
			$('#button_register').attr("onclick", "User.spawnLogInPanel()");
			$('#button_logout').attr("onclick", "User.resetLogin()");
		});

		this.downloadUserBasins();

	},
	
	spawnLogInPanel : function() {
		
		if ($(".login-panel").length > 0){
			return;
		}
		
		this.container = GisMap.UI.spawnPanel({
			class: "login-panel" },
			function(ret){ console.log(ret.div)
				
				$(ret.div).draggable();
				
				$(ret.div).append("<div id='options-close' style='padding: 11px 12px;' class='btn btn-danger' onclick='ToolBar.hideThis(this);'><span class='glyphicon glyphicon-remove'></span></div>");
				
				$(ret.div).append("<h3 style = 'margin: 0 5; text-align: center'>Register</h3>");
				
				$(ret.div).append("<form id='form_register'><input type='text' class='form-control' width=90% name='fullname' placeholder='Full Name'><input type='text' class='form-control' width=90% name='registerusername' placeholder='Username'><input type='email' class='form-control' width=90% name='email' placeholder='Email'><input type='password' class='form-control' width=90% id='registerpassword' placeholder='Password'><input type='password' class='form-control' width=90% name='confirmpassword' placeholder='Confirm Password'></form>");
				
				$(ret.div).append("<a href='#' id='button_completeregistration'>Complete Registration</a>");
				
				$('#button_completeregistration').attr("onclick", "User.sendRegistrationData()");
				
				//$("#pwalert").hide();
				
				$("#registerpassword").hover(function(){
					$(ret.div).append("<div id='pwalert' class='alert alert-warning'><div class='arrow-left'></div>The password must contain at least <strong>6 characters</strong> and at least <strong>one number</strong>.</div>");
				}, function(){
					$("#pwalert").remove();
				});
				
		})
		
		
	},
	
	displayAlert : function() {
		
		$("#pwalert").show();
		
	},
	
	sendLoginData : function() {
		
		var logininfo = $("#form_login").serializeArray();
		
		console.log(logininfo);
		
		$.post('http://felek.cns.umass.edu:8888/map/login-map-user', logininfo, function(d){
			User.setUser(d.data.username);
		});
		
	},
	
	sendRegistrationData : function() {
		
		
		var registrationinfo = $("#form_register").serializeArray();
		
		console.log(registrationinfo);
		
		
		$.post('http://felek.cns.umass.edu:8888/map/register-map-user', registrationinfo, function(d){
			console.log(d);
		});
		
		$(".login-panel").remove();
		
		var password = $("#form_register input[type=password]")[0].value;
		var confirmpass = $("#form_register input[type=password]")[1].value;
		
		console.log(password);
		console.log(confirmpassword);
	},
	
	setUser : function(user) {
		
		
		$(".user-panel").addClass("active");

		$("#form_login").hide();
		$("#button_login").hide();
		$("#button_register").hide();
		$("#button_logout").show();
		$("#text_username").text("Hello, " + user + "!");
		$("#text_username").show();
		
	},
	
	resetLogin : function() {
		
		$(".user-panel").removeClass("active");
		
		$("#form_login").show();
		$("#button_login").show();
		$("#button_register").show();
		$("#button_logout").hide();
		$("#text_username").hide();
		
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
