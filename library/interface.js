GisMap.UI = {

	containers : [],
	legend : null,
	legend_enabled : true,

	uigroups : [],

	/**
	 * spawnButton Spawns a button to a container
	 * @param {Object} container
	 * @param {Object} opts {text: text of the button, event: event to call on click}
	 * @param {Object} cb Callback function
	 * @return Self
	 */
	spawnButton : function(container, opts, cb) {
		var btn = $("<button  class='" + opts.class + "'></button>");
		$(btn).html(opts.text);
		$(btn).click(function(e){
			opts.event(e);
		});
		
		if(opts.tooltip){
			$(btn).attr("data-toggle", "tooltip");
			$(btn).attr("data-placement", opts.tooltip.placement);
			$(btn).attr("title", opts.tooltip.text);
			$(btn).tooltip();
		}
		

		if (opts.list) {
			var li = $("<li></li>");
			$(li).append(btn);

			$(container).find("ul").append(li);
		} else
			$(container).append(btn);

		if(cb){
			cb(btn);
		}

		return {
			div : btn
		}
	},

	/**
	 * spawnPanel Spawns a panel.
	 * @param {Object} opts [Background Color, Draggable, Resizable]
	 * @param {Object} cb Callback function
	 * @return a ret object of the panel
	 * 	 */
	spawnPanel : function(opts, cb) {
		var ret = {};

		var div = $("<div class='" + opts.class + "'></div>");
		$("body").append(div);

		ret.div = div;

		if (cb)
			cb(ret);

		this.containers.push(div);

		return ret;

	},

	/**
	 * spawnDropdown spawns a dropdown list with a list
	 * @param {Object} list An html formatted list of the dropdown elements
	 * @param {Object} opts - name: ID/name of the dropdown, label: Button label
	 */
	spawnDropdown : function(container, list, opts) {
		if (container == null)
			throw new Error("No container");

		if (list == null)
			throw new Error("No List Provided");

		var dropdownGroup = $("<div class='dropdown' id='" + opts.name + "'>");
		var dropdownToggle = $("<button class='btn btn-default dropdown-toggle' type='button' data-toggle='dropdown' id='dropdownMenu1'><span class='btn_label'>" + opts.label + "</span>&nbsp;<span class='caret'></span></div>");

		$(dropdownGroup).append(dropdownToggle);

		var dropdownMenu = $("<ul class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu1'></ul>");
		$(dropdownMenu).append(list);
		$(dropdownGroup).append(dropdownMenu);

		$(container).append(dropdownGroup);

		return {
			div : dropdownGroup
		}
	},

	/**
	 * createJSONLegend Creates a legend using the JSON formatting
	 * Note: requires that you have loaded an external JSON rule sheet. use GisMap.External and GisMap.Task
	 * @param {Object} container
	 * @param {Object} rules
	 * @param {Object} cb
	 */
	createJSONLegend : function(container, rules, key, opts, cb) {
		if (rules == null)
			throw new Error("createJSONLegend: No rules have been specified. Did you finish loading them?")

		if ($(".legend").length == 0) {
			$("body").append("<div class='legend'><h3>Legend</h3><h4 class='l-label'></h4><h6 class='l-sublabel'></h6></div>")
		}

		$(".legend").append("<div id='legend-close' class='btn btn-danger' onclick='GisMap.UI.hideLegend()'><span class='glyphicon glyphicon-remove'></span></div>");

		//Clear the current legend
		$(".legend ul").remove();

		legend = $(".legend");
		var ul = $("<ul></ul>");

		$(".l-label").html(rules[key].property_label);
		$(".l-sublabel").html(rules[key].property_sublabel);

		for (var i = 0; i < rules[key].rules.length; i++) {
			var r = rules[key].rules[i];
			var li = $("<li></li>");
			$(li).html("<div class='sample-color' style='background-color:" + r.fill + "'></div>" + r.label);
			$(ul).append(li);
		}

		$(legend).append(ul);

		if (opts.draggable == true) {
			$(legend).draggable({
				containment : 'parent'
			})
		}

		if (cb)
			cb()

	},

	/**
	 * hideLegend hides the legend
	 * @param {Object} styled Whether or not to phase in or out the legend
	 * @param {Object} cb callback
	 */
	hideLegend : function(styled, cb) {
		if (styled == false) {
			$(legend).css("display", "none");
			if (cb)
				cb();
			return;
		}

		$(legend).css("opacity", "0");
		GisMap.Tasks.push(function(n_callback) {
			setTimeout(function() {
				$(legend).css("display", "none");
				n_callback();
				if (cb)
					cb();
			}, 300)
		});

	},

	/**
	 * showLegend show the legend
	 * @param {Object} styled Whether or not to phase in or out the legend
	 * @param {Object} cb callback
	 */
	showLegend : function(styled, cb) {
		$(legend).css("display", "block");
		if (styled == false) {
			if (cb)
				cb();
			return;
		}

		GisMap.Tasks.push(function(n_callback) {
			$(legend).css("opacity", "100");
			setTimeout(function() {
				n_callback();
				if (cb)
					cb();
			}, 10)
		});

	},

	/**
	 * appendElement quickly appends element to given container
	 * @param {Object} container
	 * @param {Object} el
	 */
	appendElement : function(container, el) {
		$(container).append(el);
	},

	/**
	 * Updates a dropdown with a new list
	 * @param {Object} dropdown
	 * @param {Object} list
	 */
	updateDropdown : function(dropdown, list) {
		$(dropdown).empty();
		$(dropdown).append(list);
		$(dropdown).html(list);
	},

	/**
	 * Creates an opacity slider inside of a container for a target
	 * @param {Object} container
	 */
	createSlider : function(container, label, opts, cb) {
		var html = '<p class="slider-label" style="margin-top: 27px;">' + label + '</p>' + '<div id="slider"></div><span class="' + opts.spanclass + '">: 100%</span>';

		var div = $("<div class='slider-container'></div>");
		$(div).html(html);

		$(container).append(div);

		if (cb)
			cb(div);

		return {
			div : div
		}

	},

	createCheckBoxWithLabel : function(container, label, Cclass, onclk, checked) {
		//$(container).append("<input type='checkbox' class='" + Cclass + "' onclick='"onclk"()'>" + label);
		$(container).append("<input type='checkbox' class='" + Cclass + "' onclick='" + onclk + "()' style='margin-right:10px;'>" + label)
		if (checked)
			$(container).find("." + Cclass).prop("checked", true);
	},

	//returns all containers
	getContainers : function() {
		return elements;
	},

	/**
	 * creates a set of ui_panels that can be enabled/disabled
	 * @param {Object} group an array of divs
	 */
	createUIGroup : function(container, groupD, name, first) {

		var group = [];
		var groupDiv = $("<div class='" + name + "-container' ></div>");
		for (var g in groupD) {
			group.push(groupD[g])
			$(groupD[g]).css("display", "none");
			$(groupDiv).append(groupD[g]);

		}
		$(container).append(groupDiv)
		this.uigroups.push({
			gr : group,
			n : name
		});

		if (first)
			this.toggleUIGroup(name, first);
	},

	/**
	 * toggles a UI group display
	 * @param {Object} name Name of the UI Group
	 * @param {Object} toggle Toggle group
	 */
	toggleUIGroup : function(name, toggle) {
		var g = $("." + name + "-container");
		if (g.length == 0)
			throw new Error("Group does not exist: " + name);

		$(g).find(".sub-container").css("display", "none");
		var t = $(g).find("div[data-group='" + toggle + "']");
		if (t.length == 0)
			throw new Error("Sub Group does not exist: " + toggle);

		$(t).css("display", "block");

	},
	
	/**
	 * spawns a geolocator panel. Call GisMap.GIS.calculateLocation with the string from the input. 
	 */
	spawnGeoLocator:function(container, Sclass, cb){
		var search = $("<div class='" + Sclass + "'> <span class='glyphicon glyphicon-globe'></span> </div>");
		$(search).append("<input class='search_query' type='text' style='width:65%' placeholder='1 Migratory Way, Turners Falls MA'></input>")
		
		$(container).append(search);
		
		if(cb)
			cb(search);
		
		return search;
		
	},
	

	/**
	 * adds a lat/lon panel
	 * @param {Object} container
	 * @param {Object} declared_class
	 */
	addLatLon : function(container, declared_class) {
		var latlonbox = $("<div class='" + declared_class + "'>Latitude:<span class='lat'>0</span><br />Longitude:<span class='lon'>0</span></div>")
		$(container).append(latlonbox);
		
		var mousePositionControl = new ol.control.MousePosition({
			 coordinateFormat: ol.coordinate.createStringXY(4),
  			 projection: 'EPSG:4326',
  			  className: 'custom-mouse-position',
			  target: document.getElementById('mouse-position'),
			  undefinedHTML: '&nbsp;'
		})
		
		GisMap.Map.map.addControl(mousePositionControl);

		//TODO: need better way to catch coordinates..
		setInterval(function(){
			var string = $(".custom-mouse-position").html();
			string = string.split(",");
			if(string.length == 1) return;
			$(latlonbox).find(".lat").html(string[1]);
			$(latlonbox).find(".lon").html(string[0]);
			
			
			
			
		},10)

	},

	//TODO: implement
	addScale : function(container, declared_class) {
		var scaleLine = new ol.control.ScaleLine();
		
		GisMap.Map.map.addControl(scaleLine);
		
	}
}
