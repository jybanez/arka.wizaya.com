/**
 * Pretty scrolling divs for mootools.
 * 
 * Use:
 * new ScrollBar(el);
 * 
 * @link www.needathinkle.com/tumblr/12258839049
 * @version 2
 * @author Ashley White, www.needathinkle.com
 * @license @license http://creativecommons.org/licenses/by-sa/3.0/
 */
var ScrollBar = new Class({
	Extends: Slider,
	options: {
		onTick: function(pos){
			if (this.options.snap) pos = this.toPosition(this.step);
			else this.knob.setStyle(this.property, pos);
		},
		onChange: function(step) {
			if(step == this.currentStep)
				return;
			step = Math.round(step.toInt().limit(0, this.maxScroll));
			this.set(step);
			this.currentStep = step;
			this.scroller.setStyle(this.property, -step);
		},
		mode: 'vertical',
		minKnobDimensions: 30,
		knobClass: 'scrollKnob',
		barClass: 'scrollBar',
		barWidth: 7,
		autoHide: false,
		wheel: true
	},
	mouseDown: false,
	initialize: function(container, options){
		this.setOptions(options);
		var children = container.getChildren();
		if(!children.length)
			return false;
		var inner = new Element('div',{'class':'scrollContent'}).wraps(children[0]);
		children.each(function(item, i) {
			if(i !== 0)
				inner.grab(item);
		});
		container.setStyles({
			'position':'relative',
			//'float':'left',
			//'width':'100%'
		});
		this.scroller = inner;
		var bar = new Element('div', {
			'class': this.options.barClass,
			'styles': {
				'opacity' : this.options.autoHide ? 0:1
			}
		});
		var knob = new Element('div', {
			'class': this.options.knobClass,
			'styles': {
				'opacity' : this.options.autoHide ? 0:1
			}
		});
		this.axis = this.options.mode == 'vertical'?'y':'x';
		if(this.options.mode == 'vertical') {
			inner.setStyles({
				'width':inner.getSize()['x']-this.options.barWidth,
				'position':'relative'
			});
		} else {
			inner.setStyles({
				'height':inner.getSize()['y'],
				'position':'absolute'
			});		
			container.setStyle('height', inner.getSize()['y']+this.options.barWidth);
		}
		var innerSize = inner.getSize()[this.axis];
		var containerSize = container.getSize()[this.axis];
		if(innerSize < containerSize) 
			return;
		this.maxScroll = innerSize - containerSize;
		var knobDimensions = Math.round(Math.pow(containerSize , 2) / innerSize);
		if(this.options.mode == 'vertical') {
			bar.setStyles({
				'height': containerSize,
				'right':0,
				'top':0
			});
			knob.setStyles({
				'height': knobDimensions < this.options.minKnobDimensions?this.options.minKnobDimensions:knobDimensions
			});
		} else {
			bar.setStyles({
					'width': containerSize,
					'height': this.options.barWidth,
					'bottom':0			
			});
			knob.setStyles({
				'width': knobDimensions < this.options.minKnobDimensions?this.options.minKnobDimensions:knobDimensions,
				'height': this.options.barWidth
			});
		}
		bar.grab(knob).inject(container, 'after');
		this.options.steps = this.maxScroll;
		if(this.options.autoHide) {
			container.getParent().addEvent('mouseover', function() {
				this.mouseOver = true;
				this.knob.fade('in');
				this.element.fade('in');
			}.bind(this));
			container.getParent().addEvent('mouseout', function() {
				this.mouseOver = false;
			}.bind(this));
			window.addEvent('mousemove', function() {
				if(!this.mouseDown && !this.mouseOver) {
					this.knob.fade('out');
					this.element.fade('out');
				}
			}.bind(this));
			knob.addEvent('mousedown', function() {
				this.mouseDown = true;
			}.bind(this));
			window.addEvent('mouseup', function() {
				this.mouseDown = false;
			}.bind(this));
		}
		if(this.options.wheel) {
			container.getParent().addEvent('mousewheel', function(e) {
				this.scrolledElement(e);
			}.bind(this));
		}
		this.parent(bar, knob, this.options);
	},
	scroll: function(pos) {
		this.scroller.tween(this.property, -pos);
	},
	scrolledElement: function(event) {
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(this.step + (mode ? -1 : 1) * 5);
		event.stop();
	}
});