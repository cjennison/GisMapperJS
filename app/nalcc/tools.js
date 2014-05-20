var ToolBar = {
	
	optionsPanel:null,
	searchPanel:null,
	
	WMSLayerLoaded:false,
	
	
	
	toggleCursor:function(el){
		$(".cursorBtn").removeClass("btn-success");
				
		var btnclass = el.class.split(" ");
		btnclass = btnclass[btnclass.length-2];
		$("." + btnclass).addClass("btn-success");
		
		
		if($("." + btnclass).hasClass("delin-btn")){
			AppLayer.cursorState = "delin";
			GisMap.UI.spawnUpdate("Changed to Delineation Mode");
			if(this.WMSLayerLoaded == false){
				AppLayer.createWMSLayer();
				this.WMSLayerLoaded = true;
			}
		} else {
			AppLayer.cursorState = "pan";
			GisMap.UI.spawnUpdate("Changed to Panner Mode");
		}
		
		//var cursorChange =$
		//$("body").append
	},
	
	togglePanner:function(){
		$(".delin-btn").removeClass("btn-success");
		$(".pan-btn").addClass("btn-success");
		AppLayer.cursorState = "pan";
	},
	
	
	toggleOptions:function(){
		$(".options-panel").css('display','block');
		
		$(".options-btn").addClass("btn-success");
	},
	
	hideOptions:function(){
		$(".options-panel").css('display','none');
		$(".options-btn").removeClass("btn-success");
	},
	
	toggleSearch:function(){
		$(".searcher").css("display","block");
		$(".search-btn").addClass("btn-success");
	},
	
	hideSearch:function(){
		$(".searcher").css("display","none");
		$(".search-btn").removeClass("btn-success");
	},
	
	toggleBasins:function(){
		$(".user-basins").css('display', 'block');
		$(".basin-btn").addClass("btn-success");
	},
	
	hideBasins:function(){
		$(".user-basins").css('display', 'none');
		$(".basin-btn").removeClass("btn-success");
	},
	
	makeSearch:function(el){
		var coords = GisMap.GIS.calculateLocation($(el).parent().find('input').val(), function(extent){
			//GisMap.Map.map.setView(view);
			GisMap.Map.flyToPoint(extent);
		})
		
	},
	
	hideThis:function(el){
		$(el).parent().remove();
	}
	
	
	
	
}
