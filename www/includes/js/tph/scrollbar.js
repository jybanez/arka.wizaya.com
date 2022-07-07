TPH.Scrollbar = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			slider:'scrollbar-slider',
			knob:'scrollbar-knob'
		},
		axis:'x'
	},
	initialize:function(container,viewport,options){
		this.container = document.id(container);
		this.viewport = document.id(viewport);
		this.setOptions(options);
		
		var axis = this.options.axis;
		var modes = {
			x:'horizontal',
			y:'vertical'
		};
		
		this.slider = new Element('div',{'class':this.options.classes.slider+' '+modes[this.options.axis]}).inject(this.container);
		this.knob = new Element('div',{'class':this.options.classes.knob}).inject(this.slider);
		
		
		this.slider = new Slider(this.slider,this.knob,{
			wheel:true,
			mode:modes[axis],
			onChange:function(step){
				var axis = this.options.axis;
				var size = this.viewport.getSize()[axis],
					scrollSize = this.viewport.getScrollSize()[axis],
					scroll = this.viewport.getScroll();
					
				var x = axis=='x'?((scrollSize-size)*step).round()/100:scroll.x,
					y = axis=='y'?((scrollSize-size)*step).round()/100:scroll.y;
					
				if (x!=scroll.x || y!=scroll.y) {
					viewport.scrollTo(x,y);
					//this.fireEvent('onScroll',[x,y]);	
				}
			}.bind(this)
		});
		
		this.updateSlider();
		
		window.addEvent('resize',function(){
			this.updateSlider.delay(200,this);
		}.bind(this));
	},
	updateSlider:function(){
		var axis = this.options.axis;
		var size = this.viewport.getSize()[axis],
			scrollSize = this.viewport.getScrollSize()[axis];
		var styles = {
			x:'width',
			y:'height'
		};
		this.knob.setStyle(styles[axis],(size/scrollSize*100).round()+'%');
		this.slider.autosize();
	},
	set:function(offset){
		var axis = this.options.axis;
		var size = this.viewport.getSize()[axis],
			scrollSize = this.viewport.getScrollSize()[axis];
		var step = ((offset*100)/(scrollSize-size)).round();
		if (step!=this.slider.step) {
			this.slider.set(step);	
			return true;
		}
		return false;
	}
});
