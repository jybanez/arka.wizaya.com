var AppStore = new Class({
	Implements:[Events,Options],
	options:{
		container:'appStoreContainer',
		list:{
			option:'com_shop',
			controller:'apps',
			task:'load',
			load:'list',
			format:'raw'
		},
		listMethod:'json',
		categories:'appStoreCategoriesContainer',
		classes:{
			item:'recordItem',
			save:'saveButtonClass',
			close:'closeButtonClass'
		},
		params:{
			option:'com_shop',
			controller:'account.apps',
			task:'save',
			format:'raw'
		}
	},
	index:{},
	formTemplates:{},
	initialize:function(container,options){
		this.container = document.id(container);
		this.setOptions(options);
		
		var formTemplates = this.container.getElement('.formTemplates');
		if ($defined(formTemplates)) {
			formTemplates.getChildren().each(function(el){
				this.formTemplates[el.get('name')] = {
					caption:el.get('data-caption'),
					content:el.get('html')
				};
			}.bind(this));
			formTemplates.remove();
		} 
		
		this.containers = new TPH.ContentContainer(this.container,{
			selector:'.contentContainer.apps',
			onCreate:function(container,containerEl){
				switch(container){
					case 'app.store':
						this.categoriesContainer = document.id(this.options.categories);
						this.categoryTag = this.categoriesContainer.getFirst().get('tag');
						this.categoryTemplate = this.categoriesContainer.getFirst().get('html');
						this.categoriesContainer.empty();
						
						this.appsContainer = document.id(this.options.container);
						this.appTag = this.appsContainer.getFirst().get('tag');
						this.appTemplate = this.appsContainer.getFirst().get('html');
						this.appsContainer.empty();
						
						this.loadApps();
						break;
					case 'app.details':
						this.detailsContainer = containerEl;
						this.detailsTemplate = containerEl.get('html');
						containerEl.empty();
						break;
					case 'app.manage':
						this.manageContainer = containerEl;
						this.manageTemplate = containerEl.get('html');
						containerEl.empty();
						break;
				}
			}.bind(this),
			onSelect:function(container,instance){
				$fullHeight(instance.getContainer(container).getParent());
			}.bind(this)
		});
		this.fireEvent('onReady',[this]);
	},
	loadApps:function(){
		if ($defined(this.$request)){
			this.$request.cancel();
		}
		var params = $merge(this.options.list,{
			filter:{
				aid:this.options.getAccount().id
			}
		});
		params[TPH.$token]=1;
		this.$request = new TPH.Json({
			data:params,
			onRequest:function(){
				TPH.getWindow('_storeLoader_',{
					caption:'System Message',
					content:'<div class="padded font large align_center">Loading App store. Please wait...</div>',
					size:{
						width:500,
						height:'auto'
					}
				});
			}.bind(this),
			onComplete:function(data){
				TPH.getWindow('_storeLoader_').close();
				if (!$defined(this.categories)) {
					this.categories = data.categories;
					this.categories.each(function(item){
						new Element(this.categoryTag).inject(this.categoriesContainer).set('html',this.categoryTemplate.substitute(item));
					}.bind(this));
				}
				data.items.each(function(item){
					if (!$defined(this.index[item.id])) {
						var el = new Element(this.appTag).set('html',this.appTemplate.substitute(item)).inject(this.appsContainer);
						el.getElements('.styleContent').each(function(el){
							el.setStyle(el.get('data-style'),el.get('data-content').substitute(item));
						});
						el.addEvent('click',function(e){
							e.stop();
							this.loadApp(item.app);
						}.bind(this));
						this.index[item.app] = {
							data:item,
							el:el
						};
						this.fireEvent('onLoadApp',[item,this]);
					}	
				}.bind(this));
			}.bind(this)
		}).request();
	},
	getApp:function(app){
		return this.index[app].data;
	},
	loadApp:function(app){
		var app = this.index[app].data;
		var isInstalled = this.options.isAppInstalled(app.app);
		var container = this.containers.select('app.'+(isInstalled?'manage':'details')).set('html',this[(isInstalled?'manage':'details')+'Template'].substitute(app));
		container.getElements('.styleContent').each(function(el){
			el.setStyle(el.get('data-style'),el.get('data-content').substitute(app));
		});
		this.containers.scanActions(container);
		
		this.installedContainers = new TPH.ContentContainer(container,{
			selector:'.contentContainer.appInstallation',
			onSelect:function(container,instance){
				$fullHeight(this.container.getParent());
			}.bind(this)
		});
		this.installedContainers.select(isInstalled?'installed':'notInstalled');
		
		
		
		TPH.Tools.instance.scanContainer(container);
		$fullHeight(container.getParent());
		
		container.getElements('.storeAction').each(function(el){
			el.addEvent('click',function(e){
				e.stop();
				this[el.get('rel')](el.get('data-params'));
			}.bind(this));
		}.bind(this));
		
		this.fireEvent('onLoadApp',[app,this]);
	},
	install:function(app){
		this.currentApp = this.index[app].data;
		var params = this.formTemplates['app.install'];
		TPH.getWindow('app.install',{
			size:{
				width:500,
				height:'auto'
			},
			onClose:function(win){
				this.currentApp = null;
			}.bind(this),
			onOpen:function(win){
				win.setCaption(params.caption).setContent(params.content.substitute($merge(this.currentApp,{aid:this.options.getAccount().id})));
				win.content.getElements('.styleContent').each(function(el){
					el.setStyle(el.get('data-style'),el.get('data-content').substitute(this.currentApp));
				});
				win.content.getElements('.'+this.options.classes.save).addEvents({
					click:function(e){
						e.stop();
						var params = $merge(this.options.params,win.content.toQueryString().parseQueryString());
						params[TPH.$token]=1;
						
						if ($defined(this.$request)) {
							this.$request.cancel();
						}
						this.$request = new TPH.Json({
							data:params,
							onRequest:function(){
								win.startSpin();
							}.bind(this),
							onComplete:function(result){
								win.stopSpin();
								if (result.status){
									this.fireEvent('onAccountUpdate',[result.account,this]);
									this.installedContainers.select(this.options.isAppInstalled(this.currentApp.app)?'installed':'notInstalled');
									win.close();
								}
							}.bind(this)
						}).request();
					}.bind(this)
				});
				win.content.getElements('.'+this.options.classes.close).addEvents({
					click:function(e){
						e.stop();
						win.close();
					}.bind(this)
				});
				win.toCenter();
			}.bind(this)
		}).open();
	},
	uninstall:function(app){
		
	},
	about:function(app){
		
	}
});