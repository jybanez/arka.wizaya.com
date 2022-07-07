TPH.HTMLBuilder = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(container,options){
		this.$container = container;
		this.setOptions(options);
		TPH.loadAsset('Editorjs',function(){
			this.$editor = new EditorJS({
				holder:this.$container
			});
			this.fireEvent('onReady',[this]);
		}.bind(this));
	}
});
