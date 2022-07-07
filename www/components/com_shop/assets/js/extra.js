window.addEvent('onLoadAsset',function(library){
	switch(library){
		case 'TPHComponent':
			TPH.Component.implement({
				getName:function(){
					return this.options.$name;
				},
				exit:function(){
					
				},
				getCurrentTemplate:function(){
					if ($defined(this.$currentTemplate)) {
						return this.getTemplate(this.$currentTemplate);
					}
				},
				startSpin:function(){
					//console.log(this.$currentTemplate);
					//console.log(this.containers.currentContainer);
					
					//var template = this.getTemplate(this.containers.currentContainer);
					if ($defined(this.app.container)) {
						if (!$defined(this.$spinner)) {
							this.$spinner = new Element('div',{'class':'app-spinner'});
							this.$spinner.addEvents({
								mousewheel:function(e){
									e.stop();
								}.bind(this)
							});
						}
						var canSpin = false;  
						if ($defined(this.containers)) {
							if ([this.options.templates.details,this.options.templates.form].contains(this.containers.currentContainer)) {
								this.$spinner.inject(this.containers.getContainer(this.containers.currentContainer));
								canSpin = true;
							}	
						}
						if (!canSpin) {
							var template = this.getCurrentTemplate();
							if ($defined(template)) {
								this.$spinner.inject(template.parent,'after');	
							} else {
								this.$spinner.inject(this.app.container.getParent());
							}	
						}
						
						this.$spinner.addClass.delay(100,this.$spinner,'loading');
						/*
						this.$spinner.setStyles({
							display:'',
							visibility:''
						}).addClass.delay(100,this.$spinner,'loading');
						*/	
						//console.log(this.$spinner);
					}	
				},
				stopSpin:function(){
					if ($defined(this.$spinner)) {
						this.$spinner.removeClass('loading').remove.delay(300,this.$spinner);
						/*
						this.$spinner.setStyles({
							display:'none',
							visibility:'hidden'
						}).removeClass('loading');
						*/	
					}
				}
			});
			Shop.Component = new Class({
				Extends:TPH.Component,
				Implements:[
					Shop.Implementors.AppAccess
				],
				applyDataConditions:function(el,data){
					this.applyAppAccess(el,this.app.app.access);
			        if ($defined(Shop.instance)) {
			            if ($defined(Shop.instance.account)) {
			                this.parent(el,Shop.instance.account,'.accountSettingsOption');
			            }
			        }
					if ($defined(this.app)) {
						if ($defined(this.app.app)) {	
							this.parent(el,this.app.app.installation,'.appSettingsOption');
						}
					} 
					return this.parent(el,data);
				}
			});
			break;
		case 'TPHWall':
			TPH.Wall.Items.App = function(itemData){
				//console.log(itemData.options.header,$type(itemData.options.header));
				var mainContainer = new Element('div',{
					styles:{
						position:'relative',
						width:'100%',
						height:'100%'
					}
				});
				var hasHeader = $pick(itemData.options.header,true);
				
				var headerTemplate = ''; 
				if (hasHeader) {
					headerTemplate = '<div>'
										+'<div class="font bold padded_left">{name}</div>'
										+'<div class="font small padded_left appTitle"></div>'
									+'</div>';
				}
				var template = '<ul class="fieldList">'
								+'<li>'
									+'<div class="profile thumb logo small">'
										+'<dl class="dropDown itemNavigation">'
											+'<dt>'
												+'<div class="profile thumb logo small" style="background-image:url({logo})"></div>'
											+'</dt>'
											+'<dd>'
												+'<ul class=""></ul>'
											+'</dd>'
										+'</dl>'							
									+'</div>'
									+'<div class="headerContainer">'
										+headerTemplate
									+'</div>'
									+'<i class="fa fa-window-maximize control active wallItemAction" rel="toggleMaximize"></i>'
									+'<i class="fa fa-times control active wallItemAction" rel="close"></i>'
								+'</li>'
							+'</ul>';
				itemData.header = new Element('div',{
					'class':'app-header cursor pointer'
				}).inject(mainContainer).set('html',template.substitute(itemData.options.app));
				
				itemData.headerContainer = itemData.header.getElement('.headerContainer');
				itemData.appTitle = itemData.header.getElement('.appTitle');
				itemData.scanActions(itemData.header).setOptions({dragHandle:itemData.header});
				
				itemData.itemNavigation = itemData.header.getElement('.itemNavigation>dd>ul');
				itemData.$menu = new TPH.Dropdown(itemData.header);	
				
				var contentContainer = new Element('div',{
					'class':'app-content-container'
				}).inject(mainContainer);
				
				itemData.appContent = new Element('div',{'class':'app-content'}).inject(contentContainer);
				itemData.appContent.addEvents({
					mousewheel:function(e){
						if (itemData.wall.selections.contains(itemData)) {
							e.stopPropagation();	
						}else {
							e.preventDefault();
						}
					}.bind(this)
				});
				
				itemData.appContent.addEventListener('scroll', function(e) {
				    if (itemData.wall.selections.contains(itemData)) {
						e.stopPropagation();	
					} else {
						e.preventDefault();
					}
				    return false;
				}.bind(this));
				
				(function(){
					var el = itemData.content;
					var height = el.getCoordinates().height-el.getStyle('padding-top').toInt()-el.getStyle('padding-bottom').toInt();
					itemData.appContent.setStyles({
						height:height-itemData.header.getCoordinates().height-2
					});
				}.delay(500,this));
				
				/*
				itemData.addEvents({
					onResize:function(instance){
						var el = itemData.content;
						var height = el.getCoordinates().height-el.getStyle('padding-top').toInt()-el.getStyle('padding-bottom').toInt();
						itemData.appContent.setStyles({
							height:height-itemData.header.getCoordinates().height-2
						});	
						$fullHeight(itemData.appContent);
						if ($defined(itemData.app)) {
							itemData.app.fireEvent('onResize',[instance,this]);	
						}
					}
				});		
				*/
				return mainContainer;
			};
			
			TPH.Wall.Item.implement({
				setTitle:function(title){
					this.appTitle.set('html',title);
				}
			});
			break;
	}
});

