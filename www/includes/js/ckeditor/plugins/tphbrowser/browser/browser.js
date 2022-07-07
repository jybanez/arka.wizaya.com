var TPHBrowser = new Class({
	Implements:[Options,Events],
	options:{
		
	},
	initialize:function(plugin,options){
		this.plugin = plugin;
		this.setOptions(options);
	}
});
