// Requires raf.js
TPH.Slide = new Class({
	Implements:[Events,Options],
	options:{
		factor:10,
		deceleration:.90
	},
	initialize:function(el,options){
		this.setElement(el);
		this.setOptions(options);
		window.addEvent('unload',function(){
			this.cancel();
		}.bind(this));
	},
	setElement:function(el){
		this.el=el;
		return this;
	},
	setVelocity:function(v){
		this.$velocity = v;
		return this;
	},
	setDelta:function(d){
		this.$delta = d;
		return this;
	},
	start:function(start){
		var size = this.el.getSize(),
			scrollSize = this.el.getScrollSize();
		this.bounds = scrollSize;
		this.limit = {
			x:scrollSize.x-size.x,
			y:scrollSize.y-size.y
		};
		this.$target = start;
		this.$animator = requestAnimationFrame(function(){
			this.animate();
		}.bind(this));
	},
	animate:function(){
		this.cancel();
		this.$velocity = {
			x:Math.abs(this.$velocity.x*this.options.deceleration),
			y:Math.abs(this.$velocity.y*this.options.deceleration)
		};
		if (this.$velocity.x>.01 || this.$velocity.y>.01) {
			this.$target = {
				x:this.$target.x-(this.$delta.x*this.$velocity.x),
				y:this.$target.y-(this.$delta.y*this.$velocity.y)
			};
			var x = this.$target.x<0?0:(this.$target.x<this.limit.x?this.$target.x:this.limit.x),
				y = this.$target.y<0?0:(this.$target.y<this.limit.y?this.$target.y:this.limit.y);
				
			this.el.scrollTo(x,y);
			this.$animator = requestAnimationFrame(function(){
				this.animate();
			}.bind(this));
		}
	},
	cancel:function(){
		cancelAnimationFrame(this.$animator);
		return this;
	}
});
