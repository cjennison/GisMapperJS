
GisMap.UI.createPanelDropdown = function(master_list, sub_lists, opts, cb){
	var div = $("<div class='dropdownpanel' targ=''></div>");
	if(opts.class)
		$(div).addClass(opts.class)
	
	//$(div).append("<h2>" + opts.title + "</h2>");
	
	//Loop through master list
	$(div).append("<div class='master-label'><div class='layer-icon'></div><span>DATA LAYERS<span></div>")
	var master = $("<ul class='master-ul'></ul>");
	for(var m in master_list){
		$(master).append(master_list[m]);		
	}
	
	$(div).append(master);
	
	$(div).append('<div class="seperator"></div>');
	
	for(var entry in sub_lists){
		var sub = $("<ul class='sub-list' data-link='" + sub_lists[entry].link + "'></ul>");
		
		//console.log(sub_lists[entry])
		
		
		for(var l in sub_lists[entry].list){
			var list = sub_lists[entry].list[l];
			$(sub).append(list);
			
		}
		
		
		$(div).append(sub);
	}
	
	$("body").append(div);
	
	
	$(div).find('.master-list-item').on('mouseover', function(){
		//console.log(this);
		var link = $(this).attr('data-link');
		$(".sub-list").removeClass("active");
		
		$(div).find(".sub-list[data-link='" + link +  "']").addClass("active");
	})

	$(div).bind('mouseout', function(){
		var timer = setTimeout(function(){
			$(div).removeClass("active");
		},3000)
		
		$(div).bind('mouseover', function(){
			clearInterval(timer);
			
		})
		
		
	})
	
	$(".sub-list li").bind('click',function(e){
				$(div).removeClass("active");
				console.log("C")
			})
			
	
	
	
	//Additional Description Panel
	var description_panel = $("<div class='desc-panel'></div>");
	$(description_panel).append("<div class='desc-label'><span>INFORMATION<span></div>")
	$(description_panel).append("<h3 class='header'>Mouse over a layer for more information.</h3");
	$(description_panel).append("<button class='btn btn-default downloaddata-btn'><span class='glyphicon glyphicon-save'></span>&nbsp;Download Data</button>")
	$(div).append(description_panel);
	
	
	$(".sub-list li").bind('mouseover',function(e){
		$(div).find(".header").html($(this).html());
		$(div).attr("targ", $(this).attr("data-layer"));
		$(div).find(".downloaddata-btn").css('display','block')
	});
	
	
	
	
	
	return div;
	
}


GisMap.UI.resetRadioButtons = function(){
	$(".upstream-local").find("p input[value='local']").prop("checked", true);
	$(".upstream-local").find("p input[value='upstream']").prop("checked", false);

}
