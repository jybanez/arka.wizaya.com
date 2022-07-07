var EditCombo = new Class({
	Implements:[Options,Events],
	options:{
		classes:{
			combo:'editCombo',
			handler:'comboHandler',
			createNew:'comboCreateNew'
		},
		createNew:true,
		createNewText:'+Create New',
		defaultValue:'',
		defaultText:'',
		textName:'',
		script:'.',
		template:'<span class="comboHandler" rel="{id}">{name}</span>',
		params:{},
		attribs:{
			width:'100%'
		}
	},
	focused : false,
	initialize:function(el,options){
		this.setOptions(options);
		
		this.value = $(el).setStyle('display','none');
		this.element = new Element('input',{'type':'text','name':this.options.textName,'class':this.options.classes.combo})
								.injectAfter(this.value)
								.set('value',this.options.defaultText)
								.setStyles(this.options.attribs);
		this.selections = new Element('ul',{'class':'editComboSelections'}).injectInside(window.document.body).setStyle('display','none');
		this.element.addEvents({
			'click':function(e){
				new Event(e).stop();
				this.showSelections();
			}.bind(this),
			'keyup':function(e){
				this.loadSelection();
				this.value.set('value',0);
			}.bind(this),
			'focus':function(e){
				if (this.element.get('value').trim().length>0) {
					this.showSelections();
					this.focused = true;
				}
			}.bind(this),
			'blue':function(e){
				this.focused = false;
			}.bind(this)
		});
		window.addEvents({
			'click':function(){
				this.hideSelections();
			}.bind(this),
			'scroll':function(){
				this.hideSelections();
			}.bind(this)
		});
	},
	loadSelection:function(){
		if ($defined(this.request)) {
			if (this.request.running) {
				this.request.cancel();
			}
		}
		var value = this.element.get('value').trim();
		if (value.length==0) {
			this.hideSelections();
		} else {
			var data = $merge(this.options.params,{data:{term:value}});
			var onComplete = function(html){
				this.list = null;
				this.resetSelection(html);
			}.bind(this);
			this.request = new Ajax(this.options.script,{data:data,onComplete:onComplete});
			this.request.request();
		}
		
	},
	resetSelection:function(html){
		try {
			var data = Json.evaluate(html);
		} catch(e) {};
		if ($defined(data)){
			if ($defined(data.status) && $defined(data.list)) {
				this.selections.empty();
				if (data.status) {
					this.list = data.list;
					data.list.each(function(item){
						this.createItem(item);
					}.bind(this),this);
					
				} else {
					
				}
				if (this.options.createNew) {
					var container = new Element('li').injectInside(this.selections);
					new Element('div',{'class':this.options.classes.createNew})
						.set('html',this.options.createNewText)
						.injectInside(container)
						.addEvent('click',function(e){
							new Event(e).stop();
							this.fireEvent('onCreateNew');
						}.bind(this));
				}
				this.showSelections();
			} else {
				this.fireEvent('onInvalidDataFormat',[html]);
			}
		} else {
			this.fireEvent('onInvalidDataFormat',[html]);
		}
	},
	createItem:function(data){
		var item = new Element('li').injectInside(this.selections).store('data',data);
		item.set('html',this.options.template.substitute(data));
		this.fireEvent('onCreateItem',[item,data]);
		this.initializeItem(item);
	},
	initializeItem:function(item){
		var handler = item.getElement('.'+this.options.classes.handler);
		if ($defined(handler) && !item.retrieve('disabled')) {
			handler.addEvent('click',function(e){
				new Event(e).stop();
				var value = e.target.get('rel');
				this.value.set('value',value);
				this.element.set('value',e.target.get('html'));
				this.fireEvent('onSelect',[item.retrieve('data')]);
				this.hideSelections();
			}.bind(this));
		} 
		
	},
	resetPosition:function(){
		var wCoords = window.getCoordinates();
		var coords = this.element.getCoordinates();
		this.selections.setStyles({
			'left':coords.left+this.element.getStyle('border-width').toInt(),
			'top':coords.bottom-1,
			'min-width':coords.width,
			'max-height':wCoords.bottom.toInt()-coords.bottom.toInt()-20
		});
	},
	hideSelections:function(){
		this.selections.setStyle('display','none');
	},
	showSelections:function(){
		if (!$defined(this.list)) return;
		this.selections.setStyle('display','');
		this.resetPosition();
	},
	getValue:function(){
		return this.value.get('value');
	},
	getText:function(){
		return this.element.get('value');
	},
	hasFocus:function(){
		return this.focused;
	},
	destroy:function(){
		this.selections.remove();
		this.element.remove();
		delete(this);
	}
});
