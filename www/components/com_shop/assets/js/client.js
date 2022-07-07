Shop.Client = new Class({
	Extends:Shop.Platform,
	options:{
		platform:'client'
	}
});

Shop.Client.Plugin = new Class({
	Extends:TPH.ToolForm,
	Implements:[TPH.Implementors.ToolListFilters],
	initialize:function(options){
		this.prepFilters();
		this.addEvents({
			onBeforeLoadList:function(params){
				if ($defined(this.filterForm)) {
					params.filter = this.filterForm.toQueryString().parseQueryString();	
				}	
			}.bind(this)
		});
		this.parent(options);
	}
});

Shop.Client.Plugins = {
	
};


