TPH.DataSet.Field = new Class({
	Implements:[Options,Events],
	options:{
		attributes:{}
	},
	initialize:function(options){
		this.setOptions(options);
		this.data = new Hash();
		this.buildElements().buildAttributes().buildEvents();
		this.fireEvent('onCreate',[this]);
	},
	buildElements:function(){
		this.input = new Element(this.getName());
		return this;
	},
	buildAttributes:function(){
		if ($defined(this.options.attributes)) {
			$H(this.options.attributes).each(function(value,key){
				this.input.set(key,value);
			}.bind(this));
		}
		return this;
	},
	buildEvents:function(){
		if ($defined(this.options.events)) {
			this.input.addEvents(this.options.events);
		}
		return this;
	},
	store:function(key,data){
		this.data.set(key,data);
		return this;
	},
	retrieve:function(key){
		return this.data.get(key);
	},
	injectInside:function(container){
		this.input.injectInside(container);
		this.fireEvent('onInjectInside',[this,container]);
		return this;
	},
	getName:function(){
		var i = $H(TPH.DataSet.Fields);
		var name = i.keyOf(this.constructor);
		return $defined(name)?name:'input';
	},
	getValue:function(){
		return this.input.get('value')
	},
	setValue:function(value){
		this.input.set('value',value);
		return this;
	}
});

$extend(TPH.DataSet.Field,{
	createField : function(fieldType,options){
		var fieldType = fieldType.toLowerCase();
		var instance = $defined(TPH.DataSet.Fields[fieldType])?TPH.DataSet.Fields[fieldType]:TPH.DataSet.Field; 
		return new instance(options); 
	}
});

TPH.DataSet.Fields = {
	'text':new Class({
		Extends:TPH.DataSet.Field,
		options:{
			attributes:{
				type:'text'
			}
		},
		getName:function(){
			return 'input';
		}
	}),
	'textarea':new Class({
		Extends:TPH.DataSet.Field
	}),
	'select':new Class({
		Extends:TPH.DataSet.Field,
		buildElements:function(){
			this.parent();
			if ($defined(this.options.options)){
				this.options.options.each(function(option){
					if ($defined(option.label)) {
						var group = new Element('optgroup',{'label':option.label}).injectInside(this.input);
						option.options.each(function(groupOption){
							new Element('option',{'value':groupOption.value}).set('html',groupOption.text).injectInside(group);
						})
					} else {
						new Element('option',{'value':option.value}).set('html',option.text).injectInside(this.input);
					}
					
				}.bind(this));
			}
			return this;
		}
	}),
	'radio':new Class({
		Extends:TPH.DataSet.Field,
		buildElements:function(options){
			this.parent(options);
			this.input = new Element('ul',{'class':'fieldList'});
			this.fields = new Array();
			if ($defined(this.options.options)){
				this.options.options.each(function(option){			
					var input = this.buildOption(option);
					var label = this.buildLabel(option);
					new Element('li').injectInside(this.input).adopt(input).adopt(label);
					this.fields.push({input:input,label:label});
				}.bind(this));
			}
			return this;
		},
		buildAttributes:function(){
			if ($defined(this.options.attributes['class'])) {
				this.input.addClass(this.options.attributes['class']);
			} 
			return this; 
		},
		buildEvents:function(){ return this; },
		buildOption:function(option){
			var params = {
				type:this.getName(),
				name:this.getOptionName(option),
				id:this.getOptionID(option),
				value:$defined(option.value)?option.value:''
			};
			var input = new Element('input').store('field',this);
			for(param in params){
				input.set(param,params[param]);
			}
			if ($defined(this.options.events)) input.addEvents(this.options.events)
			return input; 
		},
		buildLabel:function(option){
			return new Element('label',{'for':this.getOptionID(option)}).set('html',option.text);
		},
		getOptionName:function(option){
			return $defined(this.options.attributes.name)?this.options.attributes.name:'';
		},
		getOptionID:function(option){
			return ($defined(this.options.attributes.id)?this.options.attributes.id+'_':'')+TPH.stringURLSafe(option.value);
		},
		getValue:function(){
			var value = this.fields.map(function(e){ 
				if (e.input.checked) return e.input.value; 
			}).clean()[0];
			return $defined(value)?value:'';
		},
		setValue:function(value){
			var value = $type(value)=='array'?value:[value];		
			this.fields.each(function(o){
				o.input.checked = value.contains(o.input.value); 
			});
		}
	})
}

$extend(TPH.DataSet.Fields,{
	'checkbox':new Class({
		Extends:TPH.DataSet.Fields.radio,
		getOptionName:function(option){
			return this.parent()+'[]';
		},
		getValue:function(){
			return this.fields.map(function(e){ 
				if (e.input.checked) return e.input.value; 
			}).clean();
		}
	})
});
