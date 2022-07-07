(function(){
	if (!$defined(window['TPH'])) {
		window.TPH = {};
	}
	Element.implement({
		getInstance:function(){
			return this.$instance;
		},
		toHTML:function(){
			return this.outerHTML;
		},
		toJson:function(){
			return this.$instance.toJson();
		}
	});
	TPH.Element = new Class({
		Implements:[Options],
		initialize:function(params,options){
			this.setOptions(options);
			this.params = {};
			for(key in params){
				var value = params[key];
				switch(key){
					case 'children':
						value.each(function(child){
							this.addChild(new TPH.Element(child));
						}.bind(this));
						break;
					default:
						this.params[key] = value;
				}
			}
		},
		destroy:function(){
			if ($defined(this.$parent)) {
				this.$parent.removeChild(this);
			}
			if ($defined(this.$children)) {
				this.$children.each(function(child){
					child.destroy();
				});
			}
			if ($defined(this.$element)) {
				this.$element.destroy();
			}
		},
		setElement:function(el){
			this.$element = el;
			return this;
		},
		getElement:function(){
			return this.$element;
		},
		setProperties:function(properties){
			this.params.properties = properties;
			if ($defined(this.$element)) {
				this.$element.setProperties(properties);
			}
			return this;
		},
		setStyles:function(styles){
			this.params.styles = styles;
			if ($defined(this.$element)) {
				this.$element.setStyles(styles);
			}
			return this;
		},
		addChild:function(child){
			if (!$defined(this.$children)) {
				this.$children = new Array();
			}
			this.$children.push(child);
			return this;
		},
		removeChild:function(child){
			if ($defined(this.$children)) {
				child.$element.remove();
				this.$children.erase(child);	
			}
			return this;
		},
		getChildren:function(){
			return this.$children;
		},
		render:function(container){
			if (!$defined(this.$element)) {
				var params = {};
				var tag = 'div',
					events = null;
				for (key in this.params){
					var value = this.params[key];
					switch(key){
						case 'tag':
							tag = value;
							break;
						case 'id':
							params[key]=value;
							break;
						case 'data':
							for(dfield in value){
								params['data-'+dfield] = value[dfield];
							}
							break;
						case 'properties':
							$extend(params,value);
							break;
						case 'styles':
							$extend(params,{styles:value});
							break;
						case 'events':
							events = {};
							for(eventName in value) {
								var ev = value[eventName];
								switch($type(ev)) {
									case 'object':
										if ($defined(ev.arguments)) {
											events[eventName] = new Function(ev.arguments,ev.body);	
										} else {
											events[eventName] = new Function(ev.body);
										}
										break;
									case 'function':
										events[eventName] = ev;
										break;
								}								
							}
							break;
					}
				}
				this.$element = new Element(tag,params);
				this.$element.$instance = this;
				if ($defined(this.params.content)) {
					this.$element.set('text',this.params.content);
				}
				if ($defined(events)) {
					this.$element.addEvents(events);
				}
			}
			this.$element.inject(container);
			this.$parent = $defined(container.$instance)?container.$instance:null;
			if ($defined(this.$children)) {
				this.$children.each(function(child){
					child.render(this.$element);
				}.bind(this));
			}
			return this;
		},
		toObject:function(){
			var params = {};
			for(key in this.params){
				var value = this.params[key];
				switch(key){
					case 'events':
						params.events = {};
						for(eventName in value) {
							var ev = value[eventName];
							switch($type(ev)) {
								case 'object':
									params.events[eventName] = ev;
									break;
								case 'function':
									console.log(ev);
									break;
							}								
						}
						break;
					default:
						params[key] = value;
				}
			}
			if ($defined(this.$children)) {
				params.children = new Array();
				this.$children.each(function(child){
					params.children.push(child.toObject());
				});
			}
			return params;
		},
		toJson:function(){
			return Json.encode(this.toObject());
		}
	});
	
	TPH.HTML = new Class({
		Implements:[Options],
		options:{
			
		},
		initialize:function(container,options){
			this.container = container;
			this.setOptions(options);
			this.$elements = new Array();  
		},
		destroy:function(){
			this.clear();
		},
		clear:function(){
			this.$elements.each(function(el){
				el.destroy();	
			});
			this.$elements.empty();
		},
		addElement:function(data){
			var el = new TPH.Element(data);
			this.$elements.push(el);
			return this;
		},
		removeElement:function(el){
			this.$elements.erase(el);
			el.destroy();
			return this;
		},
		getElements:function(){
			return this.$elements;
		},
		load:function(list){
			list.each(function(data){
				this.addElement(data);
			}.bind(this));
			return this;
		},
		render:function(){
			this.container.empty();
			this.getElements().each(function(el){
				el.render(this.container);
			}.bind(this));
		}
	});
}());
