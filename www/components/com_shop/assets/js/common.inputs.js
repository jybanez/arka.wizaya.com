TPH.Input = new Class({
	Implements:[Events,Options],
	options:{
		properties:{}
	},
	initialize:function(options){
		this.setOptions(options);
	},
	destroy:function(){},
	render:function(){},
	display:function(){
		return this.options.value;
	},
	inject:function(container){
		this.inputElement = this.render();
		this.inputElement.inject(container);
		return this;
	},
	remove:function(){
		this.inputElement.remove();
		return this;
	},
	getName:function(){
		return $pick(this.name,Object.keyOf(TPH.Inputs,this.$constructor));
	},
	scanActions:function(container){
		container.getElements('.inputAction').each(function(el){
			var f = el.get('rel');
			if ($defined(this[f])) {
				el.addEvent('click',function(){
					this[f]();
				}.bind(this));
			}
		}.bind(this));
	}
});

TPH.createInput = function(type,options,namespace){
	var type = $pick(type.ucfirst(),'Text');
	var classRef = $defined(namespace)?TPH.Inputs[namespace]:TPH.Inputs;
	if ($defined(classRef[type])) {
		return new classRef[type](options);
	}
};

TPH.Inputs = {
	Text:new Class({
		Extends:TPH.Input,
		render:function(){
			switch(this.options.style){
				case 'textarea':
					return new Element('textarea',$merge(this.options.properties,{name:this.options.name})).set('required',this.options.required).set('html',this.options.value);
					break;
				default:
					return new Element('input',$merge(this.options.properties,{type:'text',name:this.options.name,value:this.options.value})).set('required',this.options.required);
					break;
			} 
		},
		display:function(){
			switch(this.options.style){
				case 'textarea':
					return $pick(this.options.value,'').nl2br();
					break;
				default:
					return this.options.value;
			}
		}
	}),
	Number:new Class({
		Extends:TPH.Input,
		render:function(){
			console.log('INPUT OPTIONS',this.options);
			var input = new Element('input',$merge(this.options.properties,{type:'number',name:this.options.name,value:this.options.value})).set('required',this.options.required);
			if (this.options.min.toInt()) {
				input.set('min',this.options.min.toFloat());
			}
			if (this.options.max.toInt()) {
				input.set('max',this.options.max.toFloat());
			}
			return input; 
		},
		display:function(){
			return this.options.value;
		}
	}),
	Date:new Class({
		Extends:TPH.Input,
		options:{
			format:'%b %d, %Y'
		},
		render:function(){ 
			return new Element('input',$merge(this.options.properties,{type:'date',name:this.options.name,value:this.options.value})).set('required',this.options.required);
		},
		display:function(){
			var date = new Date().parse(this.options.value);
			return date.format(this.options.format);
		}
	}),
	Time:new Class({
		Extends:TPH.Input,
		options:{
			format:'%I:%M %p'
		},
		render:function(){ 
			return new Element('input',$merge(this.options.properties,{type:'time',name:this.options.name,value:this.options.value})).set('required',this.options.required);
		},
		display:function(){
			var date = new Date().parse(this.options.value);
			return date.format(this.options.format);
		}
	}),
	Datetime:new Class({
		Extends:TPH.Input,
		options:{
			format:'%b %d, %Y %I:%M %p'
		},
		render:function(){ 
			var input = new Element('input',$merge(this.options.properties,{type:'hidden',name:this.options.name,value:this.options.value}));
			var value = input.get('value');
			console.log(value,input);
			if (!value.length) {
				input.set('value',new Date().format('db'));
			}
			input.addClass('dateselect timeselect');
			var container = new Element('div').adopt(input);
			new SPTimeSelect(input,{
				type:'dropdown'
			});
			new SPDateSelect(input,{
				type:'dropdown'
			});
			
			return container;
		},
		display:function(){
			var date = new Date().parse(this.options.value);
			return date.format(this.options.format);
		}
	}),
	Selection:new Class({
		Extends:TPH.Input,
		options:{
			multiple:false
		},
		initialize:function(options){
			this.parent(options);
			if ($type(this.options.multiple)=='string') {
				this.options.multiple = this.options.multiple.toInt()?true:false;
			}
		},
		display:function(){
			if (this.options.multiple) {
				var value = $pick(this.options.value,'');
				var values = $type(value)=='array'?value:value.split(',');
				var vals = new Array();
				values.each(function(val){
					vals.push(val);
				});
				return vals.join("<br />");
			} else {
				return this.options.value;
			}
		},
		render:function(){
			if (this.options.multiple) {
				var container = new Element('div',{'class':'optionList '+this.getName().toLowerCase()});
				
				this.options.selections.each(function(option){
					var cb = new Element('input',{type:'checkbox',name:this.options.name,value:option});
					if (this.options.required) {
						cb.addClass('required');	
					}
					if (($type(this.options.value)=='array'?this.options.value:[this.options.value]).contains(option)) {
						cb.set('checked',true);
					}
					new Element('label').inject(container)
						.adopt(new Element('span').adopt(cb).adopt(new Element('span',{'class':'spacer'})))
						.adopt(new Element('span').set('html',option))
						;
				}.bind(this));
				return container;
			} else {
				var container = new Element('select',{name:this.options.name}).set('required',this.options.required);
				new Element('option',{value:''}).set('html','- Select -').inject(container);
				this.options.selections.each(function(option){
					new Element('option',{value:option}).inject(container).set('html',option);
				}.bind(this));
				return container;
			}
		}
	}),
	Radio:new Class({
		Extends:TPH.Input,
		render:function(){
			var container = new Element('div',{'class':'optionList '+this.getName().toLowerCase()});
			if ($defined(this.options.options)) {
				if ($type(this.options.options)!='array') {
					this.options.options = [this.options.options];
				}
				this.options.options.each(function(option){
					var value = $type(option)=='object'?option.value:option;
					var text = $type(option)=='object'?option.text:option;
					var cb = new Element('input',{type:'radio',name:this.options.name,value:value});
					if (this.options.value==value) {
						cb.set('checked',true);
					}
					new Element('label').inject(container)
						.adopt(new Element('span').adopt(cb).adopt(new Element('span',{'class':'spacer'})))
						.adopt(new Element('span').set('html',text))
						;
				}.bind(this));	
			}
			
			return container;
		}
	}),
	Checkbox:new Class({
		Extends:TPH.Input,
		render:function(){
			var container = new Element('div',{'class':'optionList '+this.getName().toLowerCase()});
			if ($defined(this.options.options)) {
				if ($type(this.options.options)!='array') {
					this.options.options = [this.options.options];
				}
				this.options.options.each(function(option){
					var value = $type(option)=='object'?option.value:option;
					var text = $type(option)=='object'?option.text:option;
					var cb = new Element('input',{type:'checkbox',name:this.options.name,value:value});
					if (($type(this.options.value)=='array'?this.options.value:[this.options.value]).contains(value)) {
						cb.set('checked',true);
					}
					new Element('label').inject(container)
						.adopt(new Element('span').adopt(cb).adopt(new Element('span',{'class':'spacer'})))
						.adopt(new Element('span').set('html',text))
						;
				}.bind(this));
			}
			return container;
		},
		display:function(){
			return $pick(this.options.value,[]).join("\n").nl2br();
		}
	}),
	Dropdown:new Class({
		Extends:TPH.Input,
		render:function(){
			var container = new Element('select',{'class':'fullWidth',name:this.options.name}).set('required',this.options.required);
			this.options.options.each(function(option){
				var value = $type(option)=='object'?option.value:option;
				var text = $type(option)=='object'?option.text:option;
				new Element('option',{value:value}).inject(container).set('html',text);
			}.bind(this));
			container.set('value',this.options.value);
			return container;
		}
	}),
	File:new Class({
		Extends:TPH.Input,
		render:function(){
			var container = new Element('div');
			this.uploadContent = new Element('div',{'class':'uploadContent'}).inject(container);
			this.uploadControls = new Element('div',{'class':'uploadControls'}).inject(container);
			var button = new Element('div',{'class':'btn default pretty position relative'}).inject(this.uploadControls);
			var input = new Element('input',{type:'file','class':'fileUpload',rel:'file','data-limit':TPH.$maxUpload})
							.inject(new Element('span').set('html',$pick(this.options.options.label,'<i class="fa fa-upload"></i> Upload File')).inject(button));
			
			this.$uploader = new FileUploader(this.uploadControls,{
				multiple:true,
            	params:this.options.options.params,
            	onReady:function(instance){
            		this.fireEvent('onReady',[instance,this]);
            	}.bind(this),
				onBeforeUpload:function(el,instance){
					instance.progress = new Element('div').inject(this.uploadContent);
				}.bind(this),
				onPreRequest:function(formData,file,el,instance){
					formData.append(TPH.$token,1);
				}.bind(this),
                onComplete:function(result,file,isComplete,el,instance){
                	if (result.status) {
                		this.fireEvent('onUpload',[result,file,instance.progress,this]);
                		//window.fireEvent('onGalleryUploadPhoto',[result.data]);
                		//instance.progress.setStyle('background-image','url('+result.data.photos.xlarge+')');
                	}
                }.bind(this)
            });    
			return container;
		}
	}),
	Country:new Class({
		Extends:TPH.Input,
		render:function(){
			var select = new Element('select',$merge(this.options.properties,{name:this.options.name})).set('required',this.options.required);
			new Element('option',{value:''}).set('html','- Select Country -').inject(select);
			Shop.instance.getCountries().each(function(country){
				new Element('option',{value:country.code}).set('html',country.name).inject(select);
			});
			return select.set('value',this.options.value); 
		},
		display:function(){
			return Shop.instance.getCountry(this.options.value).name;
		}
	}),
	Phonenumber:new Class({
		Extends:TPH.Input,
		options:{
			parts:['country','country_code','number'],
			cells:{
				country:{
					label:'Country Code',
					container:{
						tag:'div',
						properties:{
						}
					}
				},
				area:{
					label:'Area Code',
					container:{
						tag:'div'
					}
				},
				number:{
					label:'Number',
					container:{
						tag:'div'
					}
				},
				country_code:{
					label:'Country',
					container:{
						tag:'div',
						properties:{
							'class':'profile thumb small'
						}
						
					}
				},
				ext:{
					label:'Ext/Local #',
					container:{
						tag:'div'
					}
				}
			}
		},
		destroy:function(){
			if ($defined(this.$countrySelector)) {
				this.$countrySelector.destroy();
			}
		},
		//getName:function(part){
		//	return $defined(this.options.name)?[this.options.name,part].join('_'):part;
		//},
		getDefault:function(){
			var defaultCountry = this.getCountry($pick(this.options.defaults.country,'PH'));
			if (!$defined(defaultCountry)) {
				defaultCountry = {
					code:'PH',
					dial:['63']
				};
			}
			return defaultCountry;
		},
		render:function(){
			//console.log(this.options);
			this.$fields = {};
			this.$mainElement = new Element('ul',{'class':'fieldList fixed'});
			
			this.$mainInput = new Element('input',{type:'hidden',name:this.options.name,value:this.options.value}).inject(this.$mainElement);
			this.$mainInput.addEvent('input',function(){
				this.updateValue();
			}.bind(this));
			var defaultCountry = this.getDefault();
			var container = this.$mainElement,
				number = $pick(this.options.value,''),
				phoneNumber = null,
                isNumber = true;
			//TPH.loadAsset('libphonenumber',function(){
				if (number.length) {
					try {
						phoneNumber = libphonenumber.parsePhoneNumber(number);	
					} catch(e) {
						console.log(e.message,number);	
                        isNumber = false;
					}	
				}
				
				//console.log(defaultCountry);
				//console.log(phoneNumber);
				//console.log(phoneNumber.formatNational());
				var row = new Element('li').inject(container);
				//var raw = this.options.value.split('-');
				var els = {};
				this.options.parts.each(function(part,i){
					var cellData = this.options.cells[part];
					var cell = new Element(cellData.container.tag,cellData.container.properties);
					//var value = raw[i];
					//var fieldName = this.getName(part);
					switch(part){
						case 'country':
							this.$fields[part] = new Element('input',{
								type:'text',
								readonly:true,
								//name:fieldName,
								value:$defined(phoneNumber)?phoneNumber.countryCallingCode:defaultCountry.dial[0]
							}).inject(cell);
							break;
						case 'country_code':
							var country = $defined(phoneNumber)?phoneNumber.country:defaultCountry.code;
							var countryData = this.getCountry(country);
							
							//console.log(country,countryData);
							this.$fields.flag = new Element('div',{
								'class':'cover micro contain',
								styles:{
									'background-image':'url('+($defined(countryData)?countryData.icon:'')+')'
								}	
							}).inject(cell);
							this.$fields[part] = new Element('input',{
								type:'hidden',
								//name:fieldName,
								value:country
							}).inject(cell);
							break;
						case 'number':
							this.$fields[part] = new Element('input',$merge({
								type:'text',
								//name:fieldName,
								value:$defined(phoneNumber)?phoneNumber.nationalNumber:'',
								required:this.options.required
							},this.options.properties)).inject(new Element('div',{'class':'inputSpace grey'})
								.inject(cell))
								.addEvents({
									paste:function(ev){
										var e = ev.event;
										var pastedText = undefined;
									  	if (window.clipboardData && window.clipboardData.getData) { // IE
									    	pastedText = window.clipboardData.getData('Text');
									  	} else if (e.clipboardData && e.clipboardData.getData) {
									    	pastedText = e.clipboardData.getData('text/plain');
									  	}
									  	this.handleInput(pastedText);
									  	return false;
									}.bind(this),
									keyup:function(){
										this.handleInput(this.$fields.number.get('value'));
									}.bind(this)
								});
							break;
					}
					els[part] = cell;
				}.bind(this));	
				this.countrySelectEl = new Element('div',{
					'class':'btn default block'
				}).adopt(new Element('div',{
					'class':'noPadding'
				}).adopt(new Element('ul',{'class':'fieldList fixed'}).adopt(new Element('li').adopt(els.country_code,els.country,new Element('i',{'class':'fa fa-caret-down control'})))))
					.inject(new Element('div',{'class':'width_100'}).inject(row))
					.addEvents({
						click:function(e){
							e.stop();
							this.toggleCountries();	
						}.bind(this)
					});
					;
				row.adopt(els.number);
					
				//if (!$defined(this.$countrySelector)) {
					this.$countrySelector = new TPH.SelectList({
						templates:{
							item:'<div class="profile thumb logo small">'
									+'<div class="cover contain micro styleContent" data-style="background-image" data-content="url({icon})"></div>'
								+'</div>'
								+'<div>'
									+'<div>{name}</div>'
								+'</div>'
						},
						onSelectItem:function(item,el,instance,e){
							this.setCountry(item);
							instance.hide();
							e.stop();
						}.bind(this)
					});
					Shop.instance.getCountries().each(function(country){
						this.$countrySelector.addItem(country);
					}.bind(this));						
				//}
				this.handleInput(this.$fields.number.get('value'));
			//}.bind(this));
			
			return container;
		},
		handleInput:function(input){
			var country = this.$fields.country.get('value'),
				country_code = this.$fields.country_code.get('value');
				
			var inputText = input.replace(/^0/,'+'+country);
			//console.log(country,inputText,input);
			var number = country+inputText;
			var asYouType = new libphonenumber.AsYouType(country_code);
		  	asYouType.input(inputText);
		  	var phoneNumber = asYouType.getNumber();
		  	var actual = inputText;
		  	
		  	if (!$defined(phoneNumber)) {
		  		try{
		  			phoneNumber = libphonenumber.parsePhoneNumber('+'+number);	
		  		} catch(e) {
		  			
		  		}
		  	}
		  	//console.log(phoneNumber,actual); 
		  	if ($defined(phoneNumber)) {
		  		if ($defined(phoneNumber.country)) {
		  			//this.setCountry(this.getCountry(phoneNumber.country));
		  			this.$fields.number.set('value',phoneNumber.nationalNumber);	
		  			actual = phoneNumber.format('E.164');
		  		}
		  	}
		  	//console.log(phoneNumber,actual);
		  	this.$mainInput.set('value',actual);
		},
		setCountry:function(countryData){
			var countryData = $defined(countryData)?countryData:{
				icon:'',
				dial:[],
				code:''
			};
			this.$fields.flag.setStyle('background-image','url('+countryData.icon+')');
			this.$fields.country.set('value',countryData.dial[0]);
			this.$fields.country_code.set('value',countryData.code);
		},
		getCountry:function(code){
			return Shop.instance.getCountry(code);	
		},
		toggleCountries:function(){
			var func = (this.$countrySelector.isVisible()?'hide':'show')+'Countries';
			this[func]();
		},
		showCountries:function(){
			this.$countrySelector.inject(this.$mainElement.getParent()).show();
		},
		hideCountries:function(){
			this.$countrySelector.hide();
		},
		updateValue:function(){
			var number = this.$mainInput.get('value');
			var defaultCountry = this.getDefault();
			var phoneNumber = null;
			if (number.length) {
				try {
					phoneNumber = libphonenumber.parsePhoneNumber(number);	
				} catch(e) {
					var asYouType = new libphonenumber.AsYouType(defaultCountry.code);
					var inputText = '+'+defaultCountry.dial[0]+number;
				  	asYouType.input(inputText);
				  	phoneNumber = asYouType.getNumber();
					//console.log(number,inputText,phoneNumber);	
				}	
			}
			//console.log('Update Value',number,phoneNumber);
			if ($defined(phoneNumber)) {
				var country = $defined(phoneNumber)?phoneNumber.country:defaultCountry.code;
				var countryData = this.getCountry(country);
				
				this.setCountry(countryData);
				this.$fields.number.set('value',phoneNumber.nationalNumber);
				//console.log(countryData);
			}
		}
	}),
	Range:new Class({
		Extends:TPH.Input,
		options:{
			
		},
		render:function(){
			var el = new Element('ul',{
				'class':'fieldList spaced'
			});
			var rowInput = new Element('li').inject(el);
			
			this.$fromInput = new Element('input',{
					type:'number',
					'class':'align_center',
					name:this.options.name+'[from]',
					value:this.options.value.from,
					placeholder:'from'
				}).set('required',this.options.required).inject(new Element('div',{'class':'inputSpace grey'}).inject(new Element('div',{'class':'six'}).inject(rowInput)));
			this.$fromInput.addEvents({
				input:function(){
					this.updateInputs();
				}.bind(this)
			});
			
			this.$toInput = new Element('input',{
					type:'number',
					'class':'align_center',
					name:this.options.name+'[to]',
					value:this.options.value.to,
					placeholder:'to'
				}).set('required',this.options.required).inject(new Element('div',{'class':'inputSpace grey'}).inject(new Element('div',{'class':'six'}).inject(rowInput)));
			this.$toInput.addEvents({
				input:function(){
					this.updateInputs();
				}.bind(this)
			});	 
			return el;
		},
		display:function(){
			
		},
		updateInputs:function(){
			var $from = this.$fromInput.get('value').toInt(),
				$to = this.$toInput.get('value').toInt();
			this.$toInput.set('min',$from);
		}
	})	
};
