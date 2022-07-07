TPH.ProgressBar = new Class({
	Implements:[Events,Options],
	options:{
		progress:0,
		classes:{
			bar:'progressBar',
			progress:'progress'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.bar = new Element('div',{'class':this.options.classes.bar}).inject(document.id(container));
		this.progress = new Element('div',{'class':this.options.classes.progress}).inject(this.bar);
		this.set(this.options.progress);
	},
	set:function(progress){
		this.setOptions({progress:progress});
		this.progress.setStyles({
			width:this.options.progress+'%'
		});
		return this;
	},
	reset:function(){
		this.set(0);
		return this;
	},
	progress:function(){
		return this.options.progress;
	},
	destroy:function(){
		this.progress.remove();
		this.progress = null;
		this.bar.remove();
		this.bar = null;
	}
});
