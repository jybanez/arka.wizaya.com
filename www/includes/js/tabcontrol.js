var TPHTabControl = new Class({
	Implements:[Options,Events],
	options:{
		classes:{
			controls:'tabControl',
			pages:'tabPages',
			active:'active'
		}
	},
	initialize:function(control,options){
		this.setOptions(options);
		this.control = $(control);
		this.pages = $(this.control.get('rel'));
		this.controls = new Hash();
		this.control.getChildren().each(function(pageControl){
			this.controls.set(pageControl.get('rel'),pageControl);
			pageControl.addEvent('click',function(e){
				new Event(e).stop();				
				this.openPage(pageControl);
			}.bind(this));
			
			if (pageControl.hasClass(this.options.classes.active)) {
				this.currentControl = pageControl;
			}
		}.bind(this));
		this.openPage(this.currentControl);
	},
	openPage:function(control) {
		var page = this.pages.getElementById(control.get('rel'));
		if ($defined(page)) {
			if ($defined(this.currentPage)) {
				this.currentPage.removeClass(this.options.classes.active);
			}
			this.currentPage = page;
			this.currentPage.addClass(this.options.classes.active);
			
			this.currentControl.removeClass(this.options.classes.active);
			this.currentControl = control;
			this.currentControl.addClass(this.options.classes.active);
		}
	},
	getControl:function(control){
		return this.controls.get(control);
	},
	getPage:function(control){
		var control = this.getControl(control);
		return this.pages.getElementById(control.get('rel'));
	}
});
