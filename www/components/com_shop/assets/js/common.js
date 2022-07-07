/*
(function(){
	$extend(TPH,{
		loadScript:function(url,onLoad,onError,doc,useCDN){
			var doc = $pick(doc,document);
			if (!$defined(doc.$scripts)) {
				doc.$scripts = new Array();
			}
			var link = url.toURI();
			if (!$defined(window.cordova)) {
				var servers = $pick(TPH.$servers,{});
				if ($defined(servers.cdn) && $pick(useCDN,true)) {
					var cdn = servers.cdn.toURI();
					link.set('scheme',cdn.get('scheme'));
					link.set('host',cdn.get('host'));
					link.set('port',null);
				} else if ($defined(TPH.$remote)) {
					var remote = TPH.$remote.toURI();
					link.set('scheme',remote.get('scheme'));
					link.set('host',remote.get('host'));
					link.set('port',null);
				}	
			}
			
			
			Shop.localize(link.toString(),function(url){
				//console.log('Script Localize ',link.toString(),url);
				//console.log('Load Script',link.get('file'));
				if (!doc.$scripts.contains(url)) {
					if (!$defined(window.cordova)) {
						var excluded = ['leaflet.js','lz-string.js','libphonenumber.js','progressbar.js','howler.js','hammer.js','ckeditor.js'];
						if (!excluded.contains(link.get('file'))) {
							var storage = TPH.localStorage.getInstance('assets');
							if (!storage.has(url)) {
								new Request({
									url:url,
									method:'get',
									onComplete:function(content){
										storage.set(url,content);
										var el = doc.createElement('script');
										el.type = 'text/javascript';
										el.src = URL.createObjectURL(new Blob([content],{type:'text/javascript'}));
										el.onload = function(){	
											doc.$scripts.push(url);
											$pick(onLoad,$empty)();
										};
										doc.head.appendChild(el);
									}
								}).send();
							} else {
								var content = storage.get(url);
								var el = doc.createElement('script');
								el.type = 'text/javascript';
								el.src = URL.createObjectURL(new Blob([content],{type:'text/javascript'}));
								el.onload = function(){	
									doc.$scripts.push(url);
									$pick(onLoad,$empty)();
								};
								doc.head.appendChild(el);
							}	
						} else {
							new Asset.javascript(url,{
								type:'text/javascript',
								onLoad:function(){	
									doc.$scripts.push(url);
									$pick(onLoad,$empty)();
								},
								//onError:onError,
								document:doc
							});
						}
					} else {
						new Asset.javascript(url,{
							type:'text/javascript',
							onLoad:function(){	
								doc.$scripts.push(url);
								if ($type(onLoad)=='function') {
									onLoad();	
								}
							},
							//onError:onError,
							document:doc
						});	
					}									
				} else if ($type(onLoad)=='function') {
					onLoad();	
				}
			});
		},
		loadStylesheet:function(url,onLoad,onError,doc,useCDN){
			var doc = $pick(doc,document);
			if (!$defined(doc.$stylesheets)) {
				doc.$stylesheets = new Array();
			}
			var link = url.toURI();
			if (!$defined(window.cordova)) {
				var servers = $pick(TPH.$servers,{});
				if ($defined(servers.cdn) && $pick(useCDN,true)) {
					var cdn = servers.cdn.toURI();
					link.set('scheme',cdn.get('scheme'));
					link.set('host',cdn.get('host'));
					link.set('port',null);
				} else if ($defined(TPH.$remote)) {
					var remote = TPH.$remote.toURI();
					link.set('scheme',remote.get('scheme'));
					link.set('host',remote.get('host'));
					link.set('port',null);
				}
			}
			
			//link.set('port',null);
			Shop.localize(link.toString(),function(url){
				//console.log('Stylesheet Localize ',link.toString(),url);
				if (!doc.$stylesheets.contains(url)) {
					if (!$defined(window.cordova)) {
						var excluded = ['leaflet.css'];
						if (!excluded.contains(link.get('file'))) {
							var storage = TPH.localStorage.getInstance('assets');
							if (!storage.has(url)) {
								new Request({
									url:url,
									method:'get',
									onComplete:function(content){
										storage.set(url,content);
										var el = doc.createElement('link');
										el.type = 'text/css';
										el.rel = 'stylesheet';
										el.href = URL.createObjectURL(new Blob([content],{type:'text/css'}));
										el.onload = function(){	
											doc.$stylesheets.push(url);
											$pick(onLoad,$empty)();
										};
										doc.head.appendChild(el);
									}
								}).send();
							} else {
								var content = storage.get(url);
								var el = doc.createElement('link');
								el.type = 'text/css';
								el.rel = 'stylesheet';
								el.href = URL.createObjectURL(new Blob([content],{type:'text/css'}));
								el.onload = function(){	
									doc.$stylesheets.push(url);
									$pick(onLoad,$empty)();
								};
								doc.head.appendChild(el);
							}	
						} else {
							new Asset.css(url,{
								type:'text/css',
								onLoad:function(){
									doc.$stylesheets.push(url);
									if ($type(onLoad)=='function') {
										onLoad();	
									}
								},
								//onError:onError,
								document:doc
							});
						}
					} else {
						new Asset.css(url,{
							onLoad:function(){
								type:'text/css',
								doc.$stylesheets.push(url);
								if ($type(onLoad)=='function') {
									onLoad();	
								}
							},
							//onError:onError,
							document:doc
						});
					}
				} else if ($type(onLoad)=='function') {
					onLoad();	
				}	
			});							
		}
	});
})();
*/
if ($defined(window.cordova) && !window.$mobileInitialized) {
	console.log('Initialize Mobile Native Functions');
	
	window.addEvent('domready',function(){
		document.id(window.document.body).addClass('mobile');	
	});	
	
	if ($defined(window.StatusBar)) {
		console.log('Disabling WebView Overlay of Statusbar');
		//StatusBar.overlaysWebView(false);
	}
	window.$mobileInitialized = true;
}
Date.prototype.getWeekNumber = function(){
  	var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  	var dayNum = d.getUTCDay() || 7;
  	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  	var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  	return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};
var Shop = {
	isMobileDevice:function() {
	    return $defined(window.cordova); //(typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
	},
	setScreenOrientation:function(orientation){
		if (Shop.isMobileDevice()) {
			if ($defined(window.screen)) {
				if ($defined(window.screen.orientation)) {
					if ($defined(orientation)) {
						window.screen.orientation.lock(orientation);
					} else {
						window.screen.orientation.unlock();
					}
				}
			}
		}
	},
	getScreenOrientation:function(){
		if (Shop.isMobileDevice()) {
			if ($defined(window.screen)) {
				return window.screen.orientation;
			}
		}
	},
	$members:new Array(),
	getMember:function(mid,onReady){
		if (!$defined(Shop.$members[mid])) {
			var params = {
				option:'com_shop',
				controller:'members',
				task:'load',
				load:'item',
				id:mid,
				format:'json'
			};
			params[TPH.$token]=1;
			var session = TPH.$session;
			if ($defined(session)) {
				params.session=session;
			} 
			new TPH.Json({
				data:params,
				onComplete:function(result){
					Shop.$members[mid]=result;
					if ($type(onReady)=='function') {
						onReady(result);
					}
				}
			}).request();
		} else if ($type(onReady)=='function') {
			onReady(Shop.$members[mid]);
		}
	},
	getLocalPath:function(url){
		var localDirectory = '/';
		//var localUrl = url;
		if ($defined(window.App)) {
			if ($defined(window.App.FileSystem)) {
				var host = url.toURI().set('directory','').set('file','').set('query','').set('fragment','').toString();
				var path = url.replace(host,localDirectory);
				//console.log('Get Local Path',url,host,path);
				return path;
			}
		}
		return url;
		
	},
	getFileSystem:function(){
		if (!$defined(Shop.$hasFileSystem)) {
			Shop.$hasFileSystem = false;
		}
		if (!$defined(Shop.$fileSystem)) {
			/*
			if ($defined(window.device)) {
				switch(device.platform){
					case 'iOS':
						Shop.$hasFileSystem = false;
						break;
				}
			}
			*/
			if (Shop.$hasFileSystem) {
				if ($defined(window.App)) {
					if ($defined(window.App.$instance)) {
						if ($defined(window.App.$instance.getFileSystem)) {
							Shop.$fileSystem = window.App.$instance.getFileSystem();
							Shop.$hasFileSystem = true;
						}
					}
				}	
			}
				
		}
		return Shop.$hasFileSystem?Shop.$fileSystem:null;
	},
	localize:function(url,onLocalize){
		var fileSystem = Shop.getFileSystem();
		if ($defined(fileSystem)) {
			var link = url.toURI();
			if (!$defined(window.cordova)) {
				var servers = $pick(TPH.$servers,{});
				//TPH.alert('System Message',Json.encode(servers));
				if ($defined(servers.cdn)) {
					var cdn = servers.cdn.toURI();
					link.set('scheme',cdn.get('scheme'));
					link.set('host',cdn.get('host'));
					link.set('port',null);
				} else if ($defined(TPH.$remote)) {
					var remote = TPH.$remote.toURI();
					link.set('scheme',remote.get('scheme'));
					link.set('host',remote.get('host'));
					link.set('port',null);
				}	
			}
			
			
			if (!$defined(Shop.$localizer)) {
				Shop.$localizer = new App.Localizer(fileSystem); 
			}
			var path = this.getLocalPath(url);
			//console.log('Localize URL : ',url);
			//console.log('Local Path : ',path);
			fileSystem.getEntry(path,function(entry){
				if ($type(onLocalize)=='function') {
					onLocalize(entry.toURL());
				}
			}.bind(this),function(e){
				if ($type(onLocalize)=='function') {
					onLocalize(link.toString());
				}
				Shop.$localizer.add({
					source:link.toString(),
					target:path
				}).download();
			}.bind(this));
			return;
		}
		if ($type(onLocalize)=='function') {
			onLocalize(url);
		}
	},
	localizeList:function(list,onLocalize){
		var fileSystem = Shop.getFileSystem();
		if ($defined(fileSystem)) {
			var items = new Array();
			list.each(function(item){
				var url = item.data[item.key];
				items.push({
					data:item.data,
					key:item.key,
					source:url,
					target:Shop.getLocalPath(url)
				});	
			}.bind(this));
			
			new App.Localizer(fileSystem,{
				onExist:function(item,fileEntry){
					item.data[item.key] = fileEntry.toURL();
				}.bind(this),
				onSave:function(item,fileEntry){
					item.data[item.key] = fileEntry.toURL();
				}.bind(this),
				onDownloadComplete:onLocalize
			}).setItems(items).download();
			return;
		}
		if ($type(onLocalize)=='function') {
			onLocalize();
		}
	},
	Fonts:new Class({
		Implements:[Events,Options],
		options:{
			template:"@font-face {\n"
					+"font-family:{name};\n"
					+"font-style:normal;\n"
					+"src: url('{link}');\n"
					+"}"
		},
		initialize:function(options){
			this.setOptions(options);
			this.$items = new Array();
		},
		add:function(fontData){
			Shop.localize(fontData.link,function(link){
				fontData.link = link;
				var font = this.get(fontData.name);
				if (!$defined(font)) {
					this.$items.push(fontData);
					fontData.el = new Element('style',{type:'text/css'}).inject(window.document.head).set('html',this.options.template.substitute(fontData));
					this.fireEvent('onInsertFont',[fontData,this]);
				} else {
					$extend(font,fontData);
					font.el.set('text',this.options.template.substitute(font));
					this.fireEvent('onUpdateFont',[font,this]);
				}
			}.bind(this));
		},
		remove:function(fontName){
			var count = this.$items.length;
			for(var i=0;i<count;i++) {
				if (this.$items[i].name==fontName) {
					var font = this.$items[i];
					font.el.destroy();
					this.$items.erase(font);
					this.fireEvent('onRemoveFont',[fontName,this]);
					return i;
				}
			}
			return this;
		},
		get:function(fontName){
			var count = this.$items.length;
			for(var i=0;i<count;i++) {
				if (this.$items[i].name==fontName) {
					return this.$items[i];
				}
			}
		},
		has:function(fontName){
			var font = this.get(fontName);
			return $defined(font);
		}
	})
};
Shop.Headbar = new Class({
	Extends:TPH.Modules,
	initialize:function(container,options){
		this.mainContainer = container.getFirst();
		this.parent(container.getElement('.headBar'),options);
	},
	setStyles:function(styles){
		this.mainContainer.removeProperty('style').setStyles(styles);
	},
    clear:function(){
        var excluded = ['title','registry','member'];
        this.$index.each(function(name){
            //console.log(name);
            if (!excluded.contains(name)) {
                //console.log('Removing Module',name);
                this.remove(name);    
            }
        }.bind(this));
        return this;
    }
});
Shop.Headbar.Module = new Class({
	Extends:TPH.Module,
	isTemplateReady:function(appName){
		console.log('IS READY',this.appName);
		return true;
	},
	renderContent:function(container){
		
	},
	render:function(container){
		if (this.isTemplateReady()) {
			this.parent(container);
			this.renderContent(container);	
		} else {
			console.log('Waiting for Templates to be ready');
			this.render.delay(500,this,[container]);
		}
	}
});
Shop.Implementors = {
	CachedRequests:new Class({
		Implements:[
			TPH.Implementors.ActiveRequest,
			TPH.Implementors.ServerRequest
		],
		options:{
			cacheFolder:'requests'
		},
		clearActiveCache:function(onDelete,onError){
			//console.log('Deleting Active Cache');
			var fileSystem = Shop.getFileSystem();
			if ($defined(fileSystem)) {
				var localDirectory = '/'+[this.options.cacheFolder,$pick(localDirectory,'active')].join('/');			
				fileSystem.getEntry(localDirectory,function(dirEntry){
					//console.log('Active Cache Found',dirEntry);
					fileSystem.deleteDirectory(dirEntry,onDelete,onError);	
				}.bind(this),onError);	
			} else if ($type(onDelete)){
				onDelete();
			}
		},
		deleteActiveCache:function(name,onDelete,onError,localDirectory){
			var fileSystem = Shop.getFileSystem();
			if ($defined(fileSystem)) {
				//console.log('Deleting Active Cache',name);
				var localDirectory = '/'+[this.options.cacheFolder,$pick(localDirectory,'active')].join('/');
				var directory = [localDirectory,name].join('/')+'/';
				fileSystem.getEntry(directory,function(dirEntry){
					//console.log('Active Cache Found',dirEntry);
					fileSystem.deleteDirectory(dirEntry,onDelete,onError);	
				}.bind(this),onError);
			} else if ($type(onDelete)=='function'){
				onDelete();
			}
		},
		cacheActiveRequest:function(name,params,options,localDirectory){	
			var fileSystem = Shop.getFileSystem();
			if ($defined(fileSystem)) {
				var localDirectory = '/'+[this.options.cacheFolder,$pick(localDirectory,'active')].join('/');
				var directory = [localDirectory,name].join('/')+'/';
				var file = TPH.MD5(Json.encode(params))+'.'+($pick(options,{})['format'] || 'json');
				var path = [localDirectory,name,file].join('/');
				fileSystem.getEntry(path,function(entry){
					if ($defined(options)) {
						if ($type(options.onComplete)=='function') {
							fileSystem.readFile(entry,function(content){
								options.onComplete(Json.decode(content),true);
							}.bind(this));
						}
					}
				}.bind(this),function(e){
					this.activeRequest(name,params,$merge($pick(options,{}),{
						onComplete:function(result){
							fileSystem.getDirectory(fileSystem.getBaseEntry(),directory,true,function(dirEntry){
								fileSystem.createFile(dirEntry,{
									name:file,
									content:[Json.encode(result)],
									type:'application/json'
								},function(fileEntry){
									//console.log('CacheRequests-Active : '+name+' : Successfully saved : '+path);
									//console.log(fileEntry.toURL());
								}.bind(this),function(e){
									console.log(e);
								}.bind(this));	
							}.bind(this));
							
							if ($type(options.onComplete)=='function') {
								options.onComplete(result);
							}
						}.bind(this)
					}));
				}.bind(this));
				return;
			}		
			this.activeRequest(name,params,options);
		}
	}),
	AppDataConditions:new Class({
		applyAppDataConditions:function(el){
			el.getElements('.isLoggedIn').each(function(el){
				if (!$defined(TPH.$member)) {
					el.destroy();
				}
			});
			el.getElements('.isNotLoggedIn').each(function(el){
				if ($defined(TPH.$member)) {
					el.destroy();
				}
			});
			el.getElements('.isAppInstalled').each(function(el){
                var apps = el.get('data-app').split(','),
                    logic = $pick(el.get('data-logic'),'or'),
                    isInstalled = false;
                apps.each(function(app){
                    switch(logic){
                        case 'or':
                            isInstalled = isInstalled || Shop.instance.registry.has(app);                    
                            break;
                        case 'and':
                            isInstalled = isInstalled && Shop.instance.registry.has(app);                    
                            break;    
                    }
                });
                if (!isInstalled) {
                    el.destroy();
                } 
			}.bind(this));
			el.getElements('.isAppNotInstalled').each(function(el){
				 var apps = el.get('data-app').split(','),
                    logic = $pick(el.get('data-logic'),'or'),
                    isInstalled = false;
                apps.each(function(app){
                    switch(logic){
                        case 'or':
                            isInstalled = isInstalled || Shop.instance.registry.has(app);                    
                            break;
                        case 'and':
                            isInstalled = isInstalled && Shop.instance.registry.has(app);                    
                            break;    
                    }
                });
                if (isInstalled) {
                    el.destroy();
                } 
			}.bind(this));
		}
	}),
	AppAccess:new Class({
		applyAppAccess:function(el,access){
			el.getElements('.isLoggedIn').each(function(el){
				if (!$defined(TPH.$member)) {
					el.destroy();
				}
			});
			el.getElements('.isNotLoggedIn').each(function(el){
				if ($defined(TPH.$member)) {
					el.destroy();
				}
			});
			el.getElements('.hasAccess').each(function(el){ 
				if (!access.contains(el.get('data-access')) || !$defined(TPH.$member)) {
					el.destroy();
				}
			}.bind(this));
			el.getElements('.isAppInstalled').each(function(el){
                var apps = el.get('data-app').split(','),
                    logic = $pick(el.get('data-logic'),'or'),
                    isInstalled = false;
                apps.each(function(app){
                    switch(logic){
                        case 'or':
                            isInstalled = isInstalled || Shop.instance.registry.has(app);                    
                            break;
                        case 'and':
                            isInstalled = isInstalled && Shop.instance.registry.has(app);                    
                            break;    
                    }
                });
                if (!isInstalled) {
                    el.destroy();
                } 
			}.bind(this));
			el.getElements('.isAppNotInstalled').each(function(el){
				 var apps = el.get('data-app').split(','),
                    logic = $pick(el.get('data-logic'),'or'),
                    isInstalled = false;
                apps.each(function(app){
                    switch(logic){
                        case 'or':
                            isInstalled = isInstalled || Shop.instance.registry.has(app);                    
                            break;
                        case 'and':
                            isInstalled = isInstalled && Shop.instance.registry.has(app);                    
                            break;    
                    }
                });
                if (isInstalled) {
                    el.destroy();
                } 
			}.bind(this));
		}
	}),
	AppOperatorsBranch:new Class({
		_initOperatorsbranch:function(options){
			$extend(options,{
				autoDetails:false,
				onBeforeRequest:function(params){
					$extend(params.filter,{
						includeOperators:true,
						operatorApp:this.getName().toLowerCase()
					});
					this.requestOperatorBranches(params);
				}.bind(this),
				onListItem:function(item,el){
					var operatorList = el.getElement('.operatorList');
					if ($defined(operatorList)) {
						item.operators.each(function(item){
							var oel = new Element('li').inject(operatorList);
							this.applyTemplateData(oel,this.getTechnicals().templates['operatorsbranch.operator'],item);
						}.bind(this));	
					} 
					el.addEvent('click',function(){
						this.getComponent('operatorsbranch').setCurrentData(item);
						this.getComponent('operators').emptyItems().run();
					}.bind(this));
				}.bind(this),
				onAfterSaveData:function(data){
					console.log('AppOperatorBranch-onSave');
					if (this.containers.currentContainer=='operators') {
						var header = this.containers.getContainer('operators').getElement('.branchHeader');
						this.setBranchHeader(header);	
					}
				}.bind(this)
			});
		},
		requestOperatorBranches:$empty
	}),
	AppOperators:new Class({
		_initOperators:function(options){
			$extend(options,{
				autoDetails:false,
				onSave:function(data,component){
					//console.log('AppOperator-onSave');
					Shop.instance.getNotifier().publish('AppOperator-onSave',data);
				}.bind(this),	
				onBeforeDelete:function(params,component){
					this.beforeDeleteOperator(params);
				}.bind(this),
				onDelete:function(data,component,result){
					console.log('AppOperator-onDelete');
					Shop.instance.getNotifier().publish('AppOperator-onDelete',data);
					var component = this.getComponent('operatorsbranch');
					component.saveData(result.branch);
					var header = this.containers.getContainer('operators').getElement('.branchHeader');
					this.setBranchHeader(header);
				}.bind(this),
				onBeforeRequest:function(params){
					$extend(params.filter,{
						bid:this.getComponent('operatorsbranch').getCurrentData().id,
						app:this.getName().toLowerCase()
					});
				}.bind(this),
				onListItem:function(item,el){
					this.scanActions(el);
				}.bind(this),
				onAfterSaveData:function(data){
					var header = this.containers.getContainer('operators').getElement('.branchHeader');
					this.setBranchHeader(header);
				}.bind(this),
				onDeleteData:function(data){
					var header = this.containers.getContainer('operators').getElement('.branchHeader');
					this.setBranchHeader(header);
				}.bind(this)
			});
		},
		beforeDeleteOperator:$empty,
		removeOperator:function(id){
			var component = this.getComponent('operators');
			component.setCurrentData(component.getData(id));
			component.deleteCurrentData();	
		},
		addOperator:function(){
			var currentBranch = this.getComponent('operatorsbranch').getCurrentData();
			
			TPH.getWindow('__ShopAppSalesordersOperatorForm__',{
				caption:'Select Member to Add as Operator',
				size:{
					width:400,
					height:'auto'
				},
				onClose:function(win){
					this.$memberSelect.destroy();
					win.content.empty();
				}.bind(this)
			}).open(function(win){
				this.$memberSelect = new Shop.App.MemberSelect(win.content,{
					request:{
						filter:{
							aid:this.options.account.id,
							status:'active'
						}
					},
					templates:{
						content:this.getTechnicals().templates['member.select']
					},
					onBeforeLoad:function(){
						win.startSpin();
					},
					onLoad:function(){
						win.stopSpin();
					},
					onLoadFailure:function(){
						win.stopSpin();
					},
					onSelect:function(operator){
						win.startSpin();
						var component = this.getComponent('operators');
						var currentBranch = this.getComponent('operatorsbranch').getCurrentData();
						component.saveRoutine({
							aid:currentBranch.aid,
							bid:currentBranch.id,
							mid:operator.mid,
							app:this.getName().toLowerCase()
						},function(result){
							this.getComponent('operatorsbranch').saveData(result.branch);							
							component.fireEvent('onSave',[component.getData(result.data[component.options.viewKey]),component]);
							win.stopSpin();
							win.close();
						}.bind(this),function(){
							win.stopSpin();
						}.bind(this));
					}.bind(this)
				});
				win.toTop().toCenter(true);
			}.bind(this),true);
		},
		setBranchHeader:function(header){
			var currentBranch = this.getComponent('operatorsbranch').getCurrentData();
			this.applyTemplateData(header,this.getTechnicals().templates['operatorsbranch.header'],currentBranch);
			this.containers.scanActions(header);
			this.scanActions(header);
			$fullHeight(this.containers.getContainer('operators'));
		}
	}),
	NotificationHandler:new Class({
		handleNotification:function(message){}
	}),
	PreferredBranch:new Class({
		Implements:[TPH.Implementors.ActiveRequest],
		setPreferredBranch:function(bid){
			if (!$defined(TPH.$guest)) return;
			var storage = TPH.localStorage.getInstance('db');
			var branches = storage.has('preferredBranch')?storage.get('preferredBranch'):{};
			branches[TPH.$mid] = bid;
			storage.set('preferredBranch',branches);
			return this;
		},
		getPreferredBranch:function(){
			if (!$defined(TPH.$guest)) return;
			var storage = TPH.localStorage.getInstance('db');
			var branches = storage.has('preferredBranch')?storage.get('preferredBranch'):{};
			var branch = branches[TPH.$mid];
			return branch;
		},
		clearPreferredBranch:function(){
			this.setPreferredBranch(null);
			return this;
		}
	}),
	LiveTimer:new Class({
		options:{
			liveTimerDelay:100
		},
		stopLiveTimer:function(){
			if (this.$liveTimerStarted) {
				console.log('TIMER STOPPED',this.$liveTimer);
				clearTimeout(this.$liveTimer);
				this.$liveTimer = null;
				this.$liveTimerStarted = false;	
			} else {
				console.log('TIMER NOT YET STARTED');
			}
			
			return this;
		},
		liveTimerLogic:function(){
			
		},
		runLiveTimer:function(){
			if (this.$liveTimerStarted) {
				console.log('TIMER STILL RUNNING',this.$liveTimer);
				return;
			}
			console.log('TIMER STARTED');
			this.$liveTimerStarted = true;
			this.liveTimerLoop();
		},
		liveTimerLoop:function(){
			this.liveTimerLogic(); 
			if (this.$liveTimerStarted) {
				this.$liveTimer = this.liveTimerLoop.delay(this.options.liveTimerDelay,this);	
			}
		}
	}),
	LocationSetup:new Class({
		initLocationSetup:function(container,fieldPrefix){
			this.$streetInput = container.getElement('.streetInput');
			this.$addressDisplay = container.getElement('.addressDisplay');
			this.$fieldElements = {};
			var fields = 'building,street,town,city,zipcode,state,country'.split(',');
			fields.each(function(field){
				var el = container.getElement('[name="'+($defined(fieldPrefix)?fieldPrefix+'['+field+']':field)+'"]');
				if ($defined(el)) {
					switch(field){
						case 'building':
						case 'street':
							el.addEvent('keyup',function(){
								this.updateLocationAddress();
							}.bind(this));
							break;
					}
					this.$fieldElements[field] = el;
				}
			}.bind(this));
			this.handleStreetInput();
			this.updateLocationAddress();
			return new TPH.Map.Setup(container,{
				name:'Location',
				lat:$defined(fieldPrefix)?fieldPrefix+'[lat]':'lat',
				lng:$defined(fieldPrefix)?fieldPrefix+'[lng]':'lng',
				onSetCoordinates:function(lat,lng,instance){
					//console.log(lat,lng,$type(lat));
					this.fireEvent('onBeforeGetLocationData',[lat,lng,this]);
					this.$reverse = new TPH.Map.Geocode.Reverse(lat,lng,{
						onNoData:function(result,instance){
							TPH.alert('System Message','Unable to retrieve address information of given location');
							this.fireEvent('onGetLocationDataFaillure',[result,this]);
						}.bind(this),
						onComplete:function(results,instance,data){
							var result = results[0];
							for(name in this.$fieldElements) {
								var el = this.$fieldElements[name];
								var value = result[name];
								switch(name){
									case 'building':
										value = result.housenumber;
										break;
									case 'country':
										switch(el.get('tag')){
											case 'select':
												el.getChildren().each(function(option){
													if (option.get('html')==value) {
														value = option.get('value');
													}
												});
												break;
											case 'input':
												switch(el.get('type')){
													default:
														value = Shop.instance.getCountryByName(value);
														break;
												}
												break;
										}
										break;
								}
								el.set('value',value);
							};
							
							this.handleStreetInput();				
							this.updateLocationAddress();
							//console.log(data);
							this.fireEvent('onGetLocationData',[lat,lng,results,this]);
						}.bind(this)
					});
				}.bind(this)
			});
		},
		handleStreetInput:function(){
			if ($defined(this.$streetInput)) {
				var street = this.$fieldElements.street.get('value');
				this.$streetInput.setStyle('display',street.length?'none':'');
			}
			return this;
		},
		updateLocationAddress:function(){
			var fields = 'building,street,town,city,zipcode,state,country'.split(','),
				address = [];
			fields.each(function(field){
				var el = this.$fieldElements[field];
				if ($defined(el)) {
					var value = el.get('value');
					if (value.length) {
						switch(field){
							case 'country':
								var country = Shop.instance.getCountry(value);
								value = $defined(country)?country.name:value;
								break;
						}
						address.push(value);
					}	
				}
			}.bind(this));
			this.$addressDisplay.set('html',address.join(', '));
		}
	})
};

Shop.Implementors.LocationData = new Class({
	Implements:[Shop.Implementors.CachedRequests],
	requestCountryReqions:function(country,onLoad){
		var storage = TPH.localStorage.getInstance('db');
		var id = country.toLowerCase()+'.regions';
		if (!storage.has(id)) {
			var params = {
				option:'com_shop',
				controller:id,
				task:'load',
				load:'items',
				format:'json',
				limit:0
			};
			this.cacheActiveRequest(id,params,{
				onComplete:function(result){
					storage.set(id,result.items);
					if ($type(onLoad)=='function') {
						onLoad(result.items);
					}
				}
			},'platform');
		} else if ($type(onLoad)=='function'){
			onLoad(storage.get(id));
		}	
	},
	requestRegionStates:function(region,onLoad){
		var storage = TPH.localStorage.getInstance('db');
		var id = region.toLowerCase()+'.states';
		if (!storage.has(id)) {
			var params = {
				option:'com_shop',
				controller:id,
				task:'load',
				load:'items',
				format:'json',
				limit:0
			};
			this.cacheActiveRequest(id,params,{
				onComplete:function(result){
					storage.set(id,result.items);
					if ($type(onLoad)=='function') {
						onLoad(result.items);
					}
				}
			},'platform');
		} else if ($type(onLoad)=='function'){
			onLoad(storage.get(id));
		}
	},
	requestStateCities:function(state,onLoad){
		var storage = TPH.localStorage.getInstance('db');
		var id = state.toLowerCase()+'.cities';
		if (!storage.has(id)) {
			var params = {
				option:'com_shop',
				controller:id,
				task:'load',
				load:'items',
				format:'json',
				limit:0
			};
			this.cacheActiveRequest(id,params,{
				onComplete:function(result){
					storage.set(id,result.items);
					if ($type(onLoad)=='function') {
						onLoad(result.items);
					}
				}
			},'platform');
		} else if ($type(onLoad)=='function'){
			onLoad(storage.get(id));
		}
	},
	requestCityTowns:function(city,onLoad){
		var storage = TPH.localStorage.getInstance('db');
		var id = city.toLowerCase()+'.cities';
		if (!storage.has(id)) {
			var params = {
				option:'com_shop',
				controller:id,
				task:'load',
				load:'items',
				format:'json',
				limit:0
			};
			this.cacheActiveRequest(id,params,{
				onComplete:function(result){
					storage.set(id,result.items);
					if ($type(onLoad)=='function') {
						onLoad(result.items);
					}
				}
			},'platform');
		} else if ($type(onLoad)=='function'){
			onLoad(storage.get(id));
		}
	}
});
Shop.Implementors.ProcessQueue = new Class({
	queueProcess:function(id,process){
		if (!$defined(this.$processQueue)) {
			this.$processQueue = new Array();
		}
		this.$processQueue.push({
			id:id,
			process:process
		});
	},
	runProcessQueue:function(){
		if (this.$processQueue.length) {
			var processData = this.$processQueue.shift();
			if ($type(processData.process)=='function') {
				console.log('Running Process '+processData.id);
				processData.process(processData.id);
			} else {
				console.log('Unable to run Process '+processData.id,processData.process);
			}
			console.log('Process Queue',this.$processQueue.length);
			this.runProcessQueue();
		}
	},
	getProcessQueue:function(){
		return $pick(this.$processQueue,[]);
	}
});
Shop.Implementors.DataCodeEditor = new Class({
	Implements:[TPH.Implementors.ActiveRequest],
	options:{
		codeRequest:{
			option:'com_shop',
			controller:'datacodes',
			format:'json'
		}
	},
	$dataCodeOptions:{},
	$dataCodeData:{},
	$dataCodeTemplates:{},
	$dataCodeDisplay:{},
	$codeEditor:{},
	scanDataCode:function(container,templates,data,options){
		var options = $pick(options,{});
		var id = $pick(options.id,'default');
		var selector = $pick(options.selector,'');
		
		this.$dataCodeOptions[id] = options;
		this.$dataCodeData[id] = data;
		this.$dataCodeTemplates[id] = templates;
		if (!$defined(this.$dataCodeDisplay[id])) {
			this.$dataCodeDisplay[id] = {};
		}
		container.getElements('.dataCodeDisplay'+selector).each(function(el){
			var field = el.get('data-field');
			var codeId = $pick(el.get('data-code-id'),id);
			if (!$defined(this.$dataCodeDisplay[codeId][field])) {
				this.$dataCodeDisplay[codeId][field] = new Array();
			}
			this.$dataCodeDisplay[codeId][field].push(el);
		}.bind(this));
		
		container.getElements('.dataCodeAction'+selector).each(function(el){
			var rel = el.get('rel');
			var dataset = el.dataset;
			var codeId = $pick(el.get('data-code-id'),id);
			if ($type(this[rel])=='function') {
				switch(rel){
					case 'viewDataCodeHistory':
						el.addEvent('click',function(){
							this.clearDataCodeHistory(codeId);
							this[rel](dataset,codeId);	
						}.bind(this));
						break;
					default:
						var field = dataset.field;
						if ($defined(this.$dataCodeDisplay[codeId][field])) {
							el.addEvent('click',function(){
								this[rel](dataset,this.$dataCodeDisplay[codeId][field],codeId);	
							}.bind(this));	
						}
				}
									
			}
		}.bind(this));
	},
	updateDataCode:function(dataset,els,codeId){
		TPH.getWindow('__ShopAppDataCodeEditor__',{
			caption:'Data Code Editor',
			size:{
				width:400,
				height:'auto',
				'min-height':200
			},
			onClose:function(win){
				this.$codeEditor[codeId].destroy();
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setCaption($pick(dataset.datacodecaption,'Data Code Editor'));
			this.$codeEditor[codeId] = new Shop.Forms.DataCodeEditor(win.content,{
				template:this.$dataCodeTemplates[codeId].update,
				request:$defined(this.$dataCodeOptions[codeId].request)?$merge(this.options.codeRequest,this.$dataCodeOptions[codeId].request):this.options.codeRequest,
				data:$merge(this.$dataCodeData[codeId],dataset),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(data,instance,result){
					win.stopSpin();
					win.close();
					els.each(function(el){
						el.set('html',data.value);
					}.bind(this));
					$pick(this.$dataCodeOptions[codeId].onSave,$empty)(result);
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				}.bind(this),
				onCancel:function(){
					win.close();
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	editDataCode:function(dataset,els,codeId){
		TPH.getWindow('__ShopAppDataCodeEditor__',{
			caption:'Data Code Editor',
			size:{
				width:400,
				height:'auto',
				'min-height':200
			},
			onClose:function(win){
				this.$codeEditor[codeId].destroy();
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setCaption($pick(dataset.datacodecaption,'Data Code Editor'));
			win.startSpin();
			this.activeRequest('datacode',{
				option:'com_shop',
				controller:'datacodes',
				task:'load',
				load:'item',
				format:'json',
				id:dataset.id
			},{
				onComplete:function(data){
					this.$codeEditor[codeId] = new Shop.Forms.DataCodeEditor(win.content,{
						template:this.$dataCodeTemplates[codeId].edit,
						request:$defined(this.$dataCodeOptions[codeId].request)?$merge(this.options.codeRequest,this.$dataCodeOptions[codeId].request):this.options.codeRequest,
						data:$merge(this.$dataCodeData[codeId],data),
						onBeforeSave:function(){
							win.startSpin();
						},
						onSave:function(data,instance,result){
							win.stopSpin();
							win.close();
							if ($defined(els)) {
								els.each(function(el){
									el.set('html',data.value);
								}.bind(this));	
							}
							$pick(this.$dataCodeOptions[codeId].onSave,$empty)(result);
						}.bind(this),
						onSaveFailure:function(){
							win.stopSpin();
						}.bind(this),
						onCancel:function(){
							win.close();
						}
					});		
					win.stopSpin();
					win.toTop().toCenter(true);
				}.bind(this)
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	$historyTemplate:{},
	$historyTag:{},
	$historyContainer:{},
	$dataCodeHistory:{},
	viewDataCodeHistory:function(dataset,codeId){
		TPH.getWindow('__ShopAppDataCodeHistory__',{
			caption:'Data Code History',
			windowClass:'tphWindow maxHeight',
			size:{
				width:400,
				height:'auto',
				'min-height':'60vh'
			},
			onClose:function(win){
				win.content.empty();
				this.$historyContainer[codeId] = null;
				this.clearDataCodeHistory(codeId);
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setCaption($pick(dataset.datacodecaption,'Data Code History'));
			win.setContent(this.$dataCodeTemplates[codeId].history);
			var container = win.content.getElement('.contentList');
			this.$historyTemplate[codeId] = container.getFirst().get('html');
			this.$historyTag[codeId] = container.getFirst().get('tag');
			this.$historyContainer[codeId] = container; 
			container.empty();
			$fullHeight(win.content);
			win.startSpin();
			this.activeRequest('datacode',{
				option:'com_shop',
				controller:'datacodes',
				task:'load',
				load:'items',
				format:'json',
				filter:dataset
			},{
				onComplete:function(result){
					result.items.each(function(item){
						this.addDataCodeHistory(item,codeId);
					}.bind(this));					
					win.stopSpin();
					//win.toTop().toCenter(true);
				}.bind(this)
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	clearDataCodeHistory:function(codeId){
		if ($defined(this.$dataCodeHistory[codeId])) {
			this.$dataCodeHistory[codeId].empty();	
		}
	},
	addDataCodeHistory:function(item,codeId){
		if (!$defined(this.$dataCodeHistory[codeId])) {
			this.$dataCodeHistory[codeId] = new Array();
		}
		var titem = this.getDataCodeHistory(item.id,codeId);
		if ($defined(titem)) {
			$extend(titem,item);
		} else {
			this.$dataCodeHistory[codeId].push(item);
		}
		this.renderDataCodeHistory(codeId);
	},
	getDataCodeHistory:function(id,codeId){
		for(var i=0;i<this.$dataCodeHistory[codeId].length;i++) {
			var item = this.$dataCodeHistory[codeId][i];
			if (item.id==id) {
				return item;
			}
		}
	},
	renderDataCodeHistory:function(codeId){
		this.$historyContainer[codeId].empty();
		this.$dataCodeHistory[codeId].sortBy('date_applied').each(function(item){
			var el = new Element(this.$historyTag[codeId]).inject(this.$historyContainer[codeId]);
			this.applyTemplateData(el,this.$historyTemplate[codeId],item);
			var editItem = el.getElement('.editItem');
			if ($defined(editItem)) {
				editItem.addEvent('click',function(){
					this.editDataCodeHistory(item,codeId);
				}.bind(this));
			}
			
			var deleteItem = el.getElement('.deleteItem');
			if ($defined(deleteItem)) {
				deleteItem.addEvent('click',function(){
					this.deleteDataCodeHistory(item,el,codeId);
				}.bind(this));
			}
		}.bind(this));
	},
	editDataCodeHistory:function(data,codeId){
		TPH.getWindow('__ShopAppDataCodeEditor__',{
			caption:'Data Code Editor',
			size:{
				width:400,
				height:'auto',
				'min-height':200
			},
			onClose:function(win){
				this.$codeEditor[codeId].destroy();
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setCaption('Edit Code History');
			this.$codeEditor[codeId] = new Shop.Forms.DataCodeEditor(win.content,{
				template:this.$dataCodeTemplates[codeId].edit,
				request:$defined(this.$dataCodeOptions[codeId].request)?$merge(this.options.codeRequest,this.$dataCodeOptions[codeId].request):this.options.codeRequest,
				data:$merge(this.$dataCodeData[codeId],data),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(data,instance,result){
					win.stopSpin();
					win.close();
					this.addDataCodeHistory(data,codeId);
					$pick(this.$dataCodeOptions[codeId].onSave,$empty)(result);					
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				}.bind(this),
				onCancel:function(){
					win.close();
				}
			});		
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	deleteDataCodeHistory:function(data,el,codeId){
		TPH.confirm('System Message','You are about to delete the code <b>[ '+data.value+' ]</b> from history.<br />Are you sure about this?',function(){
			this.activeRequest('deletecode',{
				option:'com_shop',
				controller:'datacodes',
				task:'delete',
				format:'json',
				id:data.id
			},{
				onComplete:function(result){
					if (result.status) {
						el.destroy();
					}
				}.bind(this)
			});
		}.bind(this),$empty,$empty,{
			okText:'Yes, Delete Code',
			okButton:'danger rounded'
		});
	}
});
Shop.List = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.Templates,
		TPH.Implementors.ServerRequest,
		TPH.Implementors.ActiveRequest
	],
	options:{
		listKey:'id',
		listName:'list',
		listSelector:'.itemList',
		listDynamic:false,
		listSortBy:null,
		searchField:'name',
		preloaderLocation:'bottom',
		request:{
			option:'com_shop',
			format:'json'
		},
		templates:{
			item:null
		},
		autoLoad:true
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = container;
		this.createTemplate(this.options.listName,container.getElement(this.options.listSelector)).dynamicTemplate(this.options.listName,this.options.listDynamic);
		var template = this.getTemplate(this.options.listName);
		if ($defined(this.options.templates.item)) {
			template.template = this.options.templates.item;	
		}
		
		this.scroller = new Fx.Scroll(template.parent,{
			link:'chain'
		});
		
		this.$items = new Array();
		this.$rid = 0;
		this.$loader = true;
		
		this.buildContent();
		
		if (this.options.autoLoad) {
			this.load(function(){
				this.init();
			}.bind(this));	
		}
	},
	destroy:function(){
		this.$items.empty();
		this.destroyTemplates();
	},
	buildContent:function(){
		var container = this.container;
		this.scanActions(container);
		
		this.filterForm = container.getElement('form.filterForm');
		if ($defined(this.filterForm)) {
			this.filterForm.addEvent('submit',function(e){
				e.stop();
				this.list();
				return false;
			}.bind(this));
			var term = this.filterForm.getElement('input[name="term"]');
			if ($defined(term)) {
				term.addEvents({
					input:function(){
						this.list();
					}.bind(this),
					keyup:function(e){
						//console.log(e.key);
						switch(e.key){
							case 'enter':
								this.reload();
								break;
							case 'esc':
								this.filterForm.reset();
								this.reload();
								break;
						}	
					}.bind(this)
				});
			}
		}
	},
	init:function(){			
		//this.updateTemplate(this.options.listName);
		this.getTemplate(this.options.listName).parent.addEvent('scroll',function(){
			if (this.$loader) {
				if (this.canLoadNext() && !$defined(this.$preloader)) {
					this.loadNext();
				}	
			}					
		}.bind(this));
	},
	scanActions:function(container){
		container.getElements('.listAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					var params = el.get('data-params');
					var params = $defined(params)?params.split(','):[];
					this[el.get('rel')].apply(this,params);
					//this[el.get('rel')](...params);
				}.bind(this));
				el.removeClass('listAction');	
			}
		}.bind(this));
		return this;
	},
	canLoadNext:function(){
		var scrollSize = this.getTemplate('list').parent.getScrollSize();
		var scroll = this.getTemplate('list').parent.getScroll();
		var height = this.getTemplate('list').parent.getCoordinates().height;
		
		var ret = scrollSize.y == scroll.y+height;
		//console.log(ret);
		return ret;
		//return this.getTemplate(this.options.listName).parent.getScroll().y==0;
	},
	filterSearchCheck:function(data,searchField,term){
		var isValid = !term.length,
			filter = {
				exact:false
			};
		if (!isValid) {
			switch($type(searchField)){
				case 'string':
					$extend(filter,{
						field:searchField
					});
					break;
				case 'object':
					$extend(filter,searchField);
					break;
			}
			if ($defined(filter.field)) {
				var value = $pick(data[filter.field],'').toLowerCase();
				if (value.length) {
					var terms = term.trim().split(' ');
					for(var i=0;i<terms.length;i++) {
						var tterm = terms[i].trim();
						if (tterm.length) {
							var tvalid = filter.exact?value==tterm:value.test(tterm,'i');
							isValid = isValid || tvalid;
							//console.log(value,tterm,tvalid);
						}
					}	
				}	
			}	
		}
		return isValid;
	},
	canListItem:function(item,filter){
		var canList = !$pick(filter.term,'').trim().length;
		if (!canList) {
			var term = $pick(filter.term,'');
			switch($type(this.options.searchField)) {
				case 'string':
					var isValid = this.filterSearchCheck(item,this.options.searchField,term);
					canList = canList || isValid;
					break;
				case 'array':
					var count = this.options.searchField.length;
					for(var i=0;i<count;i++) {
						var searchField = this.options.searchField[i];
						var isValid = this.filterSearchCheck(item,searchField,term);
						canList = canList || isValid;
					}
					break;
			}				
		}
		return canList;
	},
	getItems:function(){
		if (!$defined(this.filterForm)) {
			return this.$items;	
		} else {
			var filter = $defined(this.filterForm)?this.filterForm.toQueryString().parseQueryString():{};
			var items = new Array();
			this.$items.each(function(item){
				if (this.canListItem(item,filter)) {
					items.push(item);
				}
			}.bind(this));
			return items;
		}
	},
	getItem:function(id){
		var items = this.getItems();
		var count = items.length;
		for(var i=0;i<count;i++) {
			if (items[i][this.options.listKey]==id){
				return items[i];
			}
		}
	},
	addItem:function(item){
		var titem = this.getItem(item[this.options.listKey]);
		if ($defined(titem)) {
			$extend(titem,item);
		} else {
			this.$items.push(item);
		}
	},
	removeItem:function(item){
		var titem = this.getItem(item[this.options.listKey]);
		if ($defined(titem)) {
			this.$items.erase(item);
			this.list();
		}
	},
	preload:function(){
		var limitstart = $pick(this.options.limitstart,0);
		if (!limitstart) {
			this.getTemplate(this.options.listName).parent.addClass('ajaxContainer loading');	
		} else {
			if ($defined(this.$preloader)) {
				this.$preloader.remove();
			}
			this.$preloader = new Element('div',{'class':'listPreloader'})
								.set('html','Loading...')
								.inject(this.getTemplate(this.options.listName).parent,this.options.preloaderLocation);
			switch(this.options.preloaderLocation){
				case 'bottom':
					this.scroller.toBottom();
					break;
			}
		}
	},
	postload:function(){
		var limitstart = $pick(this.options.limitstart,0);
		if (!limitstart) {
			this.getTemplate(this.options.listName).parent.removeClass('loading');
		} else {
			this.$preloader.remove();
			this.$preloader = null;
		}
	},
	reload:function(onSuccess){
		if ($defined(this.$paginator)) {
			this.$paginator = null;
			delete this.$paginator;
		}
		this.$items.empty();
		this.setOptions({limitstart:0}).load(onSuccess);
	},
	processResults:function(result){
		result.items.each(function(item){
			this.addItem(item);
		}.bind(this));
	},
	load:function(onSuccess){
		this.preload();
		this.serverRequest($merge(this.options.request,{
			task:$pick(this.options.request.task,'load'),
			load:$pick(this.options.request.load,'items'),
			limitstart:$pick(this.options.limitstart,0),
			filter:$defined(this.filterForm)?this.filterForm.toQueryString().parseQueryString():{}
		}),{
			onComplete:function(result){
				this.postload();
				this.processResults(result);
				this.list();
				this.$paginator = {
					count:result.count,
					limit:result.limit.toInt(),
					limitstart:$pick(result.limitstart,'0').toInt()
				};	
				if ($type(onSuccess)) {
					onSuccess();
				}
			}.bind(this),
			onFailure:function(){
				this.postload();
			}.bind(this),
			onCancel:function(){
				this.postload();
			}.bind(this)
		});
	},
	loadPause:function(){
		this.$loader = false;
		return this;
	},
	loadResume:function(){
		this.$loader = true;
		return this;	
	},
	loadNext:function(onSuccess){
		if (!$defined(this.$paginator)) return;
		var $paginator = this.$paginator;
		if (($paginator.limitstart+$paginator.limit<=$paginator.count) && ($paginator.limit>0)) {
			this.setOptions({
				limitstart:$paginator.limitstart+$paginator.limit
			}).load(onSuccess);
		}
	},
	prepItem:function(item){
		return item;
	},
	renderItem:function(el,item){
		this.fireEvent('onRenderItem',[el,item,this]);
	},
	list:function(){
		this.clearTemplate(this.options.listName).updateTemplate(this.options.listName);
		var items = $defined(this.options.listSortBy)?this.getItems().sortBy(this.options.listSortBy):this.getItems();
		items.each(function(item){
			this.applyTemplate(this.options.listName,this.prepItem(item),function(el,template,item){
				this.renderItem(el,item);	
			}.bind(this));
		}.bind(this));
		this.renderTemplate(this.options.listName);
		return this;
	}
});
Shop.List.Comments = new Class({
	Extends:Shop.List,
	options:{
		listDynamic:false,
		listSortBy:'date_created',
		preloaderLocation:'top',
		request:{
			controller:'comments'
		}
	},
	initialize:function(container,options){
		this.addEvents({
			onAddItem:function(item){
				item.date_created = new Date().parse(item.date_created);	
			}.bind(this)
		});
		
		this.parent(container,options);
		
		this.form = container.getElement('form.commentForm');
		this.form.addEvent('submit',function(e){
			e.stop();
			this.submit();
			return false;
		}.bind(this));
		
		this.comment = document.id(this.form.elements['comment']);
	},
	init:function(){
		this.toBottom(true);
		this.parent();
	},
	canLoadNext:function(){
		return this.getTemplate(this.options.listName).parent.getScroll().y==0;
	},
	addItem:function(item){
		item.date_created = new Date().parse(item.date_created);
		this.parent(item);
	},
	prepItem:function(item){
		return $merge(item,{comment:item.comment.nl2br()});
	},
	submit:function(){
		if (TPH.validateForm(this.form)) {
			var data = this.form.toQueryString().parseQueryString();
			this.comment.set('value','').focus();
			this.activeRequest(++this.$rid,$merge(this.options.request,{
				task:'save',
				data:data
			}),{
				onComplete:function(result){
					if (result.status){
						this.addItem(result.data);
						this.list().toBottom(true);
					}
				}.bind(this)
			});
		}
	},
	toBottom:function(animate){
		this.scroller.toBottom();	
		return this;
	},
	renderItem:function(el,item){
		if (item.self=='1') {
			el.addClass('self');
		} else {
			el.addClass('notme');
		}
		this.parent(el,item);
	}
});

Shop.List.Schedules = new Class({
	Extends:Shop.List,
	options:{
		listSortBy:'schedule',
		request:{
			controller:'schedules'
		}
	},
	newSchedule:function(){
		var data = {};
		this.editItem(data);
	},
	editItem:function(item){
		TPH.getWindow('__ShopListScheduleEdit__',{
			caption:'Schedule Form',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			var form = new Shop.Forms.Basic(win.content,{
				data:item,
				request:{
					option:this.options.request.option,
					controller:this.options.request.controller
				},
				template:this.options.templates.form,
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(result){
					win.stopSpin();
					this.addItem(result);
					this.list();
					
					win.close();	
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				}
			});
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(){
				form.save();
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	deleteItem:function(item){
		TPH.getWindow('__ShopListScheduleDelete__',{
			caption:'Delete Record',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			var form = new Shop.Forms.Delete(win.content,{
				data:item,
				id:item.id,
				request:{
					option:this.options.request.option,
					controller:this.options.request.controller
				},
				template:this.options.templates['delete'],
				onBeforeDelete:function(){
					win.startSpin();
				},
				onDelete:function(){
					this.$items.erase(this.getItem(item.id));
					this.list();
					win.stopSpin();
					win.close();
				}.bind(this),
				onDeleteFailure:function(){
					win.stopSpin();
				}
			});
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.iconButton('Yes, Delete Document','times',{
				'class':'danger rounded'
			}).inject(controlbar).addEvent('click',function(){
				form.submit();
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.List.Media = new Class({
	Extends:Shop.List,
	options:{
		listSortBy:'name',
		request:{
			controller:'media'
		}
	},
	initialize:function(container,options){
		this.parent(container,options);
		this.uploader = new TPH.uploadButton(container.getElement('.fileUpload'),{
			request:this.options.request,
			onRequest:function(params){
				params.id = this.options.request.filter.refid;
			}.bind(this),
			onComplete:function(result){
				if (result.status){
					result.items.each(function(item){
						this.addItem(item);	
					}.bind(this));
					this.list();
				}
			}.bind(this)
		});	
	},
	canLoadNext:function(){
		var scrollSize = this.getTemplate('list').parent.getScrollSize();
		var scroll = this.getTemplate('list').parent.getScroll();
		var height = this.getTemplate('list').parent.getCoordinates().height;
		
		return scrollSize.y == scroll.y+height;
	},
	renderItem:function(el,item){
		new TPH.Dropdown(el);
		el.getElement('.deleteItem').addEvent('click',function(){
			this.deleteItem(item);
		}.bind(this));
		el.getElement('.editItem').addEvent('click',function(){
			this.editItem(item);
		}.bind(this));
	},
	editItem:function(item){
		TPH.getWindow('__ShopMediaEdit__',{
			caption:'Document Form',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			var form = new Shop.Forms.Basic(win.content,{
				data:item,
				request:{
					option:this.options.request.option,
					controller:this.options.request.controller
				},
				template:this.options.templates.form,
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(result){
					win.stopSpin();
					this.addItem(result);
					this.list();
					
					win.close();	
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				}
			});
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(){
				form.save();
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	deleteItem:function(item){
		TPH.getWindow('__ShopMediaDelete__',{
			caption:'Delete Record',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			var form = new Shop.Forms.Delete(win.content,{
				data:item,
				id:item.id,
				request:{
					option:this.options.request.option,
					controller:this.options.request.controller
				},
				template:this.options.templates['delete'],
				onBeforeDelete:function(){
					win.startSpin();
				},
				onDelete:function(){
					this.$items.erase(this.getItem(item.id));
					this.list();
					win.stopSpin();
					win.close();
				}.bind(this),
				onDeleteFailure:function(){
					win.stopSpin();
				}
			});
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.iconButton('Yes, Delete Document','times',{
				'class':'danger rounded'
			}).inject(controlbar).addEvent('click',function(){
				form.submit();
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});
Shop.SoundItem = new Class({
	Implements:[Events,Options],
	options:{
		duration:0
	},
	initialize:function(url,params,options){
		this.setOptions(options);
		var soundURL = url.toURI();
		var servers = $pick(TPH.$servers,{});
		if ($defined(servers.cdn)) {
			var cdn = servers.cdn.toURI();
			soundURL.set('scheme',cdn.get('scheme'));
			soundURL.set('host',cdn.get('host'));
		} else if ($defined(TPH.$remote)) {
			var remote = TPH.$remote.toURI();
			soundURL.set('scheme',remote.get('scheme'));
			soundURL.set('host',remote.get('host'));
		}
		soundURL.set('port','');
		Shop.localize(soundURL.toString(),function(url){
			//console.log('New Sound Item',soundURL.toString(),url);
			this.$instance = new Howl($merge(params,{
				src:url,
				html5:true,
				autoplay:false,
				onplay:function(){
					this.checkTimeLimit();
				}.bind(this),
				onplayerror: function() {
				    this.$instance.once('unlock', function() {
				      this.$instance.play();
				    }.bind(this));
				}.bind(this)
			}));	
		}.bind(this));
	},
	destroy:function(){
		this.$instance.unload();
	},
	play:function(seek){
		//this.$startPlay = this.options.duration?new Date():null;
		this.$timeLimit = this.options.duration?TPH.getDate().increment('second',this.options.duration):null;
		//console.log(this.$timeLimit);
		if ($defined(seek)) {
			this.$instance.seek(seek);
		}
		this.$instance.play();
	},
	pause:function(){
		this.$instance.pause();
	},
	stop:function(){
		this.$instance.stop();
	},
	volume:function(vol){
		return this.$instance.volume(vol);
	},
	checkTimeLimit:function(){
		if (this.$instance.playing()) {
			if ($defined(this.$timeLimit)) {
				var now = TPH.getDate();
				//console.log(this.$timeLimit);
				if (now==this.$timeLimit) {
					this.$instance.stop();
				} else {
					this.checkTimeLimit.delay(500,this);	
				}	
			}
		}		
	},
	isPlaying:function(){
		return this.$instance.playing();
	},
	seek:function(pos){
		return this.$instance.seek(pos);
	},
	duration:function(){
		return this.$instance.duration();
	}
});

Shop.SoundLibrary = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(options){
		this.setOptions(options);
		this.$library = {};
	},
	getSections:function(){
		return Object.keys(this.$library);
	},
	getItems:function(section) {
		return $pick(this.$library[section],{});
	},
	addItem:function(section,id,url,params,options){
		//console.log('Sound Library: Add Item',section,id,url);
		if (!$defined(this.$library[section])){
			this.$library[section] = {};
		}
		if ($defined(this.$library[section][id])) {
			//console.error('Sound Library ['+section+':'+id+'] already exists and will be overwritten');
			this.$library[section][id].unload();
			delete this.$library[section][id];
		}
		this.$library[section][id] = new Shop.SoundItem(url,params,options);
		/*
		this.$library[section][id] = new Howl($merge({
			src:url,
			autoplay:false
		},options));
		*/
		return this;
	},
	removeItem:function(section,id){
		if ($defined(this.$library[section])){
			if ($defined(this.$library[section][id])) {
				this.$library[section][id].unload();
				delete this.$library[section][id];
			}
		}
		return this;
	},
	execute:function(func,section,id,args){
		//console.log('Sound Library execute:',func,section,id,args);
		if ($defined(this.$library[section])){
			if ($defined(this.$library[section][id])) {
				this.$library[section][id][func].apply(this.$library[section][id],args);
				return this.$library[section][id]; 
			}
		}
	},
	play:function(section,id){
		return this.execute('play',section,id);
	},
	pause:function(section,id){
		return this.execute('pause',section,id);
	},
	stop:function(section,id){
		return this.execute('stop',section,id);
	},
	volume:function(section,id,volume){
		return this.execute('volume',section,id,[volume]);
	}
});

Shop.Interface = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(container,options) {
		this.setOptions(options);
		this.$container = container;
		TPH.loadAssets([
        	'RollDate'
        ],function(){
        	this.render.delay(500,this);	
        }.bind(this));
	},
	render:function(){
		this.fireEvent('onReady',[this]);
	},
	setBackground:function(background){
		this.$background = background;
		return this;
	},
	updateBackground:function(){
		
	},
	syncBackground:function(){
		
	},
	requestContainer:function(app){
		
	},
	getViewport:function(){
		return this.$container;
	}
});



Shop.Interface.Metro = new Class({
	Extends:Shop.Interface,
	updateBackground:function(){
        var self = this;
        new Asset.image(self.$background,{
            onload:function(){
                self.$container.setStyles({
                	'background-image':'url('+this.src+')',
                    'background-size':'cover'
                });
            }
        });
	},
	requestContainer:function(app){
		var appContainer = new Shop.Interface.Metro.Container(this.$container,{
			app:app,
			onClose:function(instance){
				//console.log(instance);
				//this.fireEvent('onExit');
				//console.log('App Exit');
				if ($defined(instance.app)) {
                    instance.app.exit();    
                }
			}.bind(this)
		});
		return appContainer; //.$mainContainer;
		//console.log(itemData.options.header,$type(itemData.options.header));
	}
	/*
	,_requestContainer:function(app){
		console.log(app);
		return;
		var params = $merge(this.options.wallItem,app.technicals[this.options.platform].config);
        var appInstance = this.wall.addItem($merge(params,{
                type:'app',
                app:app,
                onMaximize:function(instance){
                    this.wall.grid.container.addClass('hideScrollBars');
                }.bind(this),
                onRestore:function(instance){
                    this.wall.grid.container.removeClass('hideScrollBars');
                }.bind(this),
                onResize:function(instance){
                    $fullHeight.delay(200,this,instance.appContent);
                }.bind(this),
                onClose:function(instance){
                	console.log('App Exit');
                    this.wall.grid.container.removeClass('hideScrollBars');
                    if ($defined(instance.app)) {
                        instance.app.exit();    
                    }
                }.bind(this)
            })
        );
        return appInstance;
	}
	*/
});

Shop.Interface.Metro.Container = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			container:'appContainer',
			content:'appContainer-content'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		
		//console.log(itemData.options.header,$type(itemData.options.header));
		this.content = container;
		this.element = new Element('div',{
			'class':'appContainer active',
			styles:{
				'z-index':this.content.getChildren().length
			}
		}).inject(this.content);
		
		var hasHeader = $pick(this.options.header,true);
		
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
							+'<i class="fa fa-times control active appContainerAction" rel="close"></i>'
						+'</li>'
					+'</ul>';
		this.header = new Element('div',{
			'class':'app-header'
		}).inject(this.element).set('html',template.substitute(this.options.app));
		
		this.headerContainer = this.header.getElement('.headerContainer');
		this.appTitle = this.header.getElement('.appTitle');
		this.scanActions(this.header);
		
		this.itemNavigation = this.header.getElement('.itemNavigation>dd>ul');
		
		this.$menu = new TPH.Dropdown(this.header);	
		
		var contentContainer = new Element('div',{
			'class':'app-content-container'
		}).inject(this.element);
		
		this.appContent = new Element('div',{'class':'app-content'}).inject(contentContainer);
		
		(function(){
			var el = this.content;
			var height = el.getCoordinates().height-el.getStyle('padding-top').toInt()-el.getStyle('padding-bottom').toInt();
			this.appContent.setStyles({
				height:height-this.header.getCoordinates().height-2
			});
		}.delay(500,this));
		
		/*
		window.addEvent('resize',function(){
			$fullHeight(this.appContent);
		}.bind(this));
		*/
	},
	scanActions:function(container){
		container.getElements('.appContainerAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					this[el.get('rel')]();	
				}.bind(this));
				el.removeClass('appContainerAction');	
			}
			
		}.bind(this));
		return this;
	},
	focused:function(){
		return $defined(this.element)?this.element.hasClass('active'):false;
	},
	focus:function(){
		if ($defined(this.element)) {
			if (!this.element.hasClass('active')) {
				this.element.addClass('active');
				this.fireEvent('onFocus',[this]);
			}	
		}
		return this;
	},
	unfocus:function(){
		if ($defined(this.element)) {
			if (this.element.hasClass('active')) {
				this.element.removeClass('active');
				this.fireEvent('onUnfocus',[this]);
			}	
		}
		return this;
	},
	close:function(){
		if ($defined(this.element)) {
			this.element.destroy();	
			this.element = null;
		}
		this.fireEvent('onClose',[this]);
		return this;
	},
	toCenter:function(){
		this.setZ(this.content.getChildren().length);
	},
	setZ:function(z){
		this.setOptions({z:z});
		if ($defined(this.element)) {
			this.element.setStyle('z-index',z);	
		}
	},
	setTitle:function(title){
		this.appTitle.set('html',title);
	}
});

Shop.Interface.Grid = new Class({
	Extends:Shop.Interface,
	options:{
		backgroundScale:1.2,
		wallItem:{
			header:true,
			row:2,
			col:2,
			size:{
				x:4,
				y:6
			},
			resizable:true,
			draggable:true,
			grid:5
		},
		platform:'client',
		grid:{
            hammerTime:true, //false,
            height:'fit',
            rows:20,
            columns:20,
            rowHeight:100,
			colWidth:100,
            classes:{
                container:'grid wall'
            }
        }
	},
	render:function(){
		this.wallContainer = this.$container;
            
        //$fullHeight(this.wallContainer.getParent());
        var coords = this.wallContainer.getCoordinates();
        TPH.loadAssets([
        	'Hammer','RAF',
        	'TPHGrid','TPHScrollbar','TPHSlide','TPHProgress','TPHWall','TPHTable'
        ],function(){
        	this.wall = new TPH.Wall(this.wallContainer,{
	            grid:this.options.grid,
	            onScroll:function(x,y,wall){
	                this.syncBackground(x,y);
	            }.bind(this),
	            onReady:function(wall){
	            	var grid = wall.grid,
	            		cols = grid.options.columns,
	            		rows = grid.options.rows;
            		//console.log(Json.encode(grid.currentScroll));
            		var viewportCoords = grid.viewport.getCoordinates();
            		var cellCoords = grid.getCellCoordinates(Math.ceil(cols/2),Math.ceil(rows/2));
            		//console.log(viewportCoords,cellCoords);
            		var x = (cellCoords.left+cellCoords.width/2)-(viewportCoords.width/2),
            			y = (cellCoords.top+cellCoords.height/2)-(viewportCoords.height/2);
            		grid.scrollTo(x,y);
            		this.syncBackground(x,y);
            		//grid.scrollTo(Math.ceil((coords.left+coords.width)/2),coords.top+Math.ceil(coords.height/2));
	            	//console.log(grid,Math.ceil(cols/2),Math.ceil(rows/2));
	            	this.fireEvent('onReady',[this]);
	            }.bind(this),
	            onPanStart:function(panStart,gridObj){
	            	gridObj.viewport.addClass('focused');
	            }.bind(this),
	            onPanEnd:function(gridObj) {
	            	gridObj.viewport.removeClass('focused');
	            }.bind(this),
	            onCellClick:function(row,col,cellObj,rowObj,gridObj){
	            	gridObj.viewport.toggleClass('focused');
	            }.bind(this),
	            onFocusItem:function(item,instance){
                	instance.grid.viewport.removeClass('focused');
                }.bind(this)
	        });	
        }.bind(this));
	},
	updateBackground:function(){
        if ($defined(this.wall)) {
            var self = this,
                bgScale = this.options.backgroundScale;
            var winSize = window.getCoordinates();
            var scale = winSize[winSize.width>winSize.height?'width':'height']*this.options.backgroundScale;
            /*
            var source = {
                client:$defined(this.account)?this.account.frontend_wallpaper_xlarge:'',
                manager:$defined(this.account)?this.account.backend_wallpaper_xlarge:''
            };
            */
            var file = self.$background; //$pick(source[this.options.platform],$defined(this.account)?this.account.cover_xlarge:'');
            new Asset.image(file,{
                onload:function(){
                    //ratio = this.naturalWidth>this.naturalHeight?this.naturalWidth/winSize.width:this.naturalHeight/winSize.height; 
                    var ratio = scale/this['natural'+(winSize.width>winSize.height?'Width':'Height')];
                    var width = (this.naturalWidth*ratio)+'px',
                        height = (this.naturalHeight*ratio)+'px';
                    self.wallContainer.setStyles({
                        'background-image':'url('+this.src+')',
                        'background-size':[width,height].join(' ')
                    });
                }
            });
            var scroll = this.wall.grid.viewport.getScroll();
            this.syncBackground(scroll.x,scroll.y);
        }
		
	},
	syncBackground:function(x,y){
        if ($defined(this.wall)) {
            var scrollSize = this.wall.grid.viewport.getScrollSize();
            var x = (x/scrollSize.x)*100,
                y = (y/scrollSize.y)*100;
                
            var x = x<=0?0:x,
                y = y<=0?0:y;
                
            this.wallContainer.setStyles({
                'background-position-x':(x>=100?100:x)+'%',
                'background-position-y':(y>=100?100:y)+'%'
            });    
        }
	},
	requestContainer:function(app){
		var config = $defined(app.technicals[this.options.platform])?$pick(app.technicals[this.options.platform].config,{}):{};
		var params = $merge(this.options.wallItem,config);
        var appInstance = this.wall.addItem($merge(params,{
	        	classes:{
	        		container:'wall-item width',
	        	},
                type:'app',
                app:app,
                onCreate:function(instance){
                	this.wall.grid.viewport.addClass('focused');	
        			this.handleContainer(instance); 
                }.bind(this),
                onMaximize:function(instance){
                    this.wall.grid.container.addClass('hideScrollBars');
                    /*
                    var scroll = this.wall.grid.currentScroll,
                    	coords = instance.element.getCoordinates();
                    instance.element.setStyles({
                    	transform:'translate('+scroll.x+'px,'+scroll.y+'px)'
                    });
                    */
                    //var scroll = 
                    //console.log(this.wall.grid);
                    //console.log(instance);
                }.bind(this),
                onRestore:function(instance){
                    this.wall.grid.container.removeClass('hideScrollBars');
                    instance.element.setStyles({
                    	transform:''
                    });
                }.bind(this),
                onBeforeResize:function(){
                	this.$focusState = this.wall.grid.viewport.hasClass('focused');
                	if (!this.$focusState) {
                		this.wall.grid.viewport.addClass('focused');	
                	}
                }.bind(this),
                onBeforeDrag:function(){
                	this.$focusState = this.wall.grid.viewport.hasClass('focused');
                	if (!this.$focusState) {
                		this.wall.grid.viewport.addClass('focused');	
                	}
                }.bind(this),
                onDrag:function(){
                	if (!this.$focusState) {
                		this.wall.grid.viewport.removeClass('focused');	
                	}
                }.bind(this),
                onResizing:function(instance){
                	(function(){
                		this.handleContainer(instance);	
                	}.debounce(this));
                }.bind(this),
                onResize:function(instance){
                	(function(){
                		if (!this.$focusState) {
	                		this.wall.grid.viewport.removeClass('focused');	
	                	}
                		this.handleContainer(instance);
                	}.delay(200,this));
                }.bind(this),
                onClose:function(instance){
                    this.wall.grid.container.removeClass('hideScrollBars');
                    //console.log(instance);
                    if ($defined(instance.app)) {
                        instance.app.exit();    
                    }
                }.bind(this)
            })
        );
        
        return appInstance;
	},
	handleContainer:function(instance){
		var tabletWidth = 1023,
    		mobileWidth = 767;
    	var element = instance.element;
    	var coords = element.getCoordinates();
    	if (coords.width<=mobileWidth) {
    		element.addClass('mobile').removeClass('tablet');
    	} else if (coords.width<=tabletWidth && coords.width>mobileWidth) {
    		element.addClass('tablet').removeClass('mobile');
    	} else {
    		element.removeClass('mobile').removeClass('tablet');
    	}
    	/*
    	var content = instance.content;
		var height = content.getCoordinates().height-content.getStyle('padding-top').toInt()-content.getStyle('padding-bottom').toInt();
		instance.appContent.setStyles({
			height:height-instance.header.getCoordinates().height-2
		});	
		$fullHeight(instance.appContent);
		*/
		if ($defined(instance.app)) {
        	instance.app.fitContent(); //fireEvent('onResize',[instance,this]);	
        }
	}
});

Shop.Platform = new Class({
	Implements:[
		Events,
		Options,
		Shop.Implementors.CachedRequests,
		TPH.Implementors.Templates
	],
	options:{
		platform:null,
		request:{
			option:'com_shop',
			format:'json'
		},
		params:{
			logout:{
				task:'logout'
			},
			apps:{
				controller:'apps',
				task:'load',
				load:'account'
			},
			account:{
				controller:'accounts',
				task:'summary'
			}	
		},
		classes:{
			appIcon:'appIcon'
		},
		sounds:{
			welcome:'media/notification/sounds/SoftBells.mp3',
			alert:'media/notification/sounds/VibrantGameCouriousAlert3Winner.mp3',
			error:'media/notification/sounds/YourTurn.mp3',
			newItem:'media/notification/sounds/QuiteImpressed.mp3',
			updateItem:'media/notification/sounds/Unconvinced.mp3',
			shutter:'media/notification/sounds/shutter.mp3'
		},
		screenWidths:{
			mobile:767
		},
		app:{
			navigation:[{
				navigation:{
					label:'About {name}',
					icon:'fa fa-info-circle',
					onClick:'loadAbout'
				}
			},{
				navigation:'separator'
			},{
				navigation:{
					label:'Exit',
					icon:'fa fa-times',
					onClick:'exit'
				}
			}]	
		}
	},
	sounds:{},
	plugins:{},
	initialize:function(options){
		this.setOptions(options);
		TPH.windowIndex = 1100;
		
        window.document.body.addClass([Browser.platform,Browser.name].join(' '));
		console.log('Launching App...');
		Shop.instance = this;
		Shop.Platforms = {};
		Shop.Platforms[this.options.platform] = this;
		
		var body = document.id(window.document.body);
        
        this.scanActions(body);
        $fullHeight(body);
        ENGINE.showOverlay('Initializing...',{'class':'init'});
        
        console.log('Launch...');
        this.launch();
        console.log('Load Countries');
        this.loadCountries(function(){
            this.start(function(){
            	//console.log(this.account);
            	this.headbar = new Shop.Headbar(body.getElement('.shopHeader')); 
	            this.headbar.add('title',new TPH.Module({
	                properties:{
	                    'class':'align_center vertical_middle appTitle'
	                },
	                onRender:function(instance){
	                	if ($defined(instance.container)){
	                		if ($defined(this.account.preferences)){
	                			if ($defined(this.account.preferences.headbar_text_content)) {
	                				switch(this.account.preferences.headbar_text_content){
		                				case 'none':
		                					var textContent = instance.container.getElement('.headbarText');
		                					if ($defined(textContent)) {
		                						textContent.destroy();
		                					}
		                					break;
	                					case 'custom':
	                						var textContent = instance.container.getElement('.headbarText');
		                					if ($defined(textContent)) {
		                						textContent.set('html',$pick(this.account.preferences.headbar_text,this.account.name));
		                					}
	                						break;
		                			}	
	                			}
	                			if ($defined(this.account.preferences.headbar_logo_content)) {
	                				switch(this.account.preferences.headbar_logo_content){
		                				case 'none':
		                					var logoContent = instance.container.getElement('.headbarLogo');
		                					if ($defined(logoContent)) {
		                						logoContent.destroy();
		                					}
		                					break;
		                			}	
	                			}
	                		}
	                	}
	                }.bind(this)
	            }),'top');
	            
	            this.registry = new Shop.Registry({
	                platform:this.options.platform,
	                requestContainer:function(app){
	                	return this.$interface.requestContainer(app);
	                }.bind(this),
	                onBeforeCreateInstance:function(options){
	                    $extend(options,$merge(this.options.app,{
	                        account:this.account
	                    }));
	                }.bind(this),
	                onCreateInstance:function(appName,instance){
	                    instance.$appContainer.focus();
	                    //console.log(instance);
	                    switch(instance.$appContainer.options.windowstate){
	                        case 'maximize':
	                        	if ($defined(this.wall)) {
	                        		this.wall.grid.container.addClass('hideScrollBars');	
	                        	}
	                            break;
	                        default:
	                            var screenWidth = window.getSize().x;
	                            if (screenWidth<=this.options.screenWidths.mobile) {
	                                instance.toCenter();
	                            }
	                    }
	                    instance.$appContainer.addEvents({
	                    	focus:function(){
	                    		instance.focus.delay(500,instance,[instance]);
	                    	}.bind(this)
	                    });
	                    //console.log('CREATE INSTANCE',instance);
	                    //console.log('FOCUS',instance);
                		//instance.app.fireEvent('onFocus',[instance.app]);
	                }.bind(this),
	                onSelectInstance:function(instance){
	                    //this.$menu.close();
	                }.bind(this),
	                onAppUpdate:function(){
	                    //this.loadApps();
	                }.bind(this)
	            });
	            
	            this.headbar.add('registry',this.registry,'top');     
	            
	            this.fonts = new Shop.Fonts({
	                onLoadFont:function(){
	                    
	                }.bind(this)
	            });
	            if ($defined(this.account.fonts)) {
	            	this.account.fonts.each(function(fontData){
		            	this.fonts.add(fontData);
		            }.bind(this));	
	            }
	            
	            var $interface = $defined(this.account['interface'])?this.account['interface'].length?this.account['interface']:'Metro':'Metro';
            	new Shop.Interface[$interface](body.getElement('.content'),{
	            	platform:this.options.platform,
	            	onReady:function($interface){                    
	            		this.$interface = $interface;
	            		var source = {
			                client:$defined(this.account)?this.account.frontend_wallpaper_xlarge:'',
			                manager:$defined(this.account)?this.account.backend_wallpaper_xlarge:''
			            };
						this.$interface.setBackground($pick(source[this.options.platform],$defined(this.account)?this.account.cover_xlarge:'')).updateBackground();
						
						this.headbar.get('title').setOptions({
		                    template:this.templates.title
		                });
		                this.registry.setOptions({
		                    template:this.templates.registry,
		                    templates:{
		                        social:this.templates.social
		                    },
		                    account:this.account,
		                });
		                
		                this.headbar.render();
						this.headbar.get('title').setOptions({
			                data:this.account
			            }).render();    
			            
			            var appList = this.getStorage().get('apps');
			            console.log('Apps loaded',appList);
			            var autoloaded = $pick(this.account.startup,'0').toInt()?$pick(this.account.startup_list,[]):appList.autoloaded;
			            this.registry.setApps(appList.items,autoloaded,appList.apps);
						
						this.updatePreferences();
		                window.addEvents({
		                    resize:function(){
		                    	//$fullHeight(body);
		                        this.$interface.updateBackground.debounce(this.$interface);
		                    }.bind(this),
		                    onInputError:function(){
		                        this.sound('error');
		                    }.bind(this),
		                    onInvalidSession:function(result,request){
		                    	console.log('On Invalid Session',result);
		                        ENGINE.instance.check(function(){
		                            request.req.options.data[TPH.$token]=1;
		                            var session = TPH.$session;
									if ($defined(session)) {
										request.req.options.session=session;
									} 
		                            request.request();
		                        }.bind(this));
		                    }.bind(this),
		                    onLoadAccount:function(result){
		                        //console.log('onLoadAccount',result);
		                        
		                    }.bind(this),
		                    onLoadApps:function(result){
		                        
		                        
		                    }.bind(this),
		                    onLogin:function(){
		                        console.log('Platform : onLogin');
		                        //this.restart();
		                    }.bind(this),
		                    onLogout:function(){
		                        console.log('Platform : onLogout');
		                        this.deleteActiveCache('account',function(){
		                        	this.deleteActiveCache('apps',function(){
		                        		
		                        	}.bind(this));	
		                        }.bind(this));
		                    }.bind(this),
		                    onUpdateMemberProfile:function(memberData){
		                    	$extend(TPH.$member,memberData);
								if ($defined(TPH.localStorage)){
				            		var storage = TPH.localStorage.getInstance('engine');
				            		if ($defined(storage.has('check'))) {
				            			var checkData = Json.decode(storage.get('check'));
				            			if ($defined(checkData)) {
				            				storage.set('check',Json.encode($merge(checkData,{
				            					$member:$merge(checkData.$member,memberData)
				            				})));
				            			}
				            		}	
				            	}
		                    }.bind(this)
		                });
		                this.$interface.updateBackground();
		                ENGINE.hideOverlay();
		                console.log('RUN UPDATES');    
		                this.runUpdates(function(){
		                	this.registry.autoload();
		                }.bind(this));
		                window.fireEvent('onPlatformReady',[this]);        
	                }.bind(this)
	            }); 
            }.bind(this));
        }.bind(this));            
	},
	launch:function(onLaunch){
		
		if ($type(onLaunch)){
			onLaunch();
		}
	},
	noSleep:function(stayup){
		console.log('No Sleep Called',stayup);
		if (!$defined(this.$stayUp)) {
			this.$stayUp = $pick(stayup,true);
		}
		TPH.loadAsset('NoSleep',function(){
			if (!$defined(this.$noSleep)) {
				this.$noSleep = new NoSleep();
			}
			if (this.$stayUp) {
				this.$noSleep.enable();
				this.backgroundState(true);
				console.log('Stay Up!!!');
			} else {
				this.$noSleep.disable();
				this.backgroundState(false);
				console.log('Can sleep...');
			}
		}.bind(this));
		return this.$stayUp;
	},
	getSoundLibrary:function(){
		if (!$defined(this.$soundLibrary)) {
			this.$soundLibrary = new Shop.SoundLibrary();
		}
		return this.$soundLibrary;
	},
	loadCountries:function(onLoad,onFailure){
		var storage = TPH.localStorage.getInstance('db');
		if (!storage.has('countries')) {
			var params = {
				option:'com_shop',
				controller:'countries',
				task:'load',
				load:'items',
				format:'json',
				filter:{
					loadKey:'code',
					cached:1
				},
				limit:0
			};
			this.cacheActiveRequest('countries',params,{
				onComplete:function(result){
					storage.set('countries',result.items);
					if ($type(onLoad)=='function') {
						onLoad(result.items);
					}
				}
			},'platform');
		} else if ($type(onLoad)=='function'){
			onLoad(storage.get('countries'));
		}
	},
	getCountries:function(){
		if (!$defined(this.$countries)) {
			var storage = TPH.localStorage.getInstance('db');
			this.$countries = new Array();
			var countries = storage.get('countries');
			for(code in countries) {
				this.$countries.push(countries[code]);
			}	
		}
		return this.$countries;
	},
	getCountry:function(code){
		if (code.length){
			var storage = TPH.localStorage.getInstance('db');
			var countries = storage.get('countries'); 
			//console.log(countries);
			return $pick(countries,{})[code];
		}
	},
	getCountryByName:function(name,field){
		var field = $pick(field,'name');
		if (!$defined(name)) return;
		if (!name.length) return;
		var storage = TPH.localStorage.getInstance('db');
		var countries = storage.get('countries');
		for(code in countries) {
			if (countries[code][field]==name) {
				return code;
			}
		}
	},
	getMember:function(){
		return TPH.$member;
	},
	preloadSounds:function(sounds,onLoad){
		TPH.loadAsset('Howl',function(){
			if (sounds.length) {
				var sound = sounds.shift();
				var soundURL = sound.url.toURI();
				
				if (!$defined(window.cordova)) {
					var servers = $pick(TPH.$servers,{});
					if ($defined(servers.cdn)) {
						var cdn = servers.cdn.toURI();
						soundURL.set('scheme',cdn.get('scheme'));
						soundURL.set('host',cdn.get('host'));
						soundURL.set('port','');
					} else if ($defined(TPH.$remote)) {
						var remote = TPH.$remote.toURI();
						soundURL.set('scheme',remote.get('scheme'));
						soundURL.set('host',remote.get('host'));
						soundURL.set('port','');
					}	
				}
				
				//console.log('Preloading Sound',sound,soundURL.toString());
				Shop.localize(soundURL.toString(),function(url){
					//console.log(sound.type,url);
					this.sounds[sound.type] = new Howl({
						src:[url],
						html5:true,
						autoplay: false
					});	
					this.preloadSounds(sounds,onLoad);
				}.bind(this)); 
			} else if ($type(onLoad)=='function') {
				onLoad();
			}
		}.bind(this));			
	},
	sound:function(type,onPlay){
		//console.log('Sound : Play '+type+'...');
		if ($defined(this.options.sounds[type])){
			TPH.loadAsset('Howl',function(){	
				if (!$defined(this.sounds[type])) {
					var soundURL = this.options.sounds[type].toURI();
					var servers = $pick(TPH.$servers,{});
					if ($defined(servers.cdn)) {
						var cdn = servers.cdn.toURI();
						soundURL.set('scheme',cdn.get('scheme'));
						soundURL.set('host',cdn.get('host'));
						soundURL.set('port','');
					} else if ($defined(TPH.$remote)) {
						var remote = TPH.$remote.toURI();
						soundURL.set('scheme',remote.get('scheme'));
						soundURL.set('host',remote.get('host'));
						soundURL.set('port','');
					}
					Shop.localize(soundURL.toString(),function(url){
						this.sounds[type] = new Howl({
							src:[url],
							html5:true,
							autoplay: false
						});
						this.sounds[type].play();	
						if ($type(onPlay)=='function'){
							//onPlay();
						}
					}.bind(this));
				} else {
					//console.log('Check if playing ',type,this.sounds[type].playing());
					this.sounds[type].play();	
					if ($type(onPlay)=='function'){
						//onPlay();
					}
				}
			}.bind(this));
		}	
		return this;
	},
	scanActions:function(container){
		container.getElements('.appAction').each(function(el){
			var f = el.get('rel');
			if ($defined(this[f])) {
				el.addEvent('click',function(e){
					e.stop();
					this[f]();
				}.bind(this));
				el.removeClass('appAction');	
			}
		}.bind(this));
		return this;
	},
    
	getPlatform:function(app){
		return $pick(app.technicals,{})[this.options.platform];
	},
    
	toggleFullscreen:function(){
		var el = document.id(document.body).toggleClass('fullscreen');
		$fullHeight(el);
	},
	exit:function(){
		
	},
	prepDevice:function(){
		this.$voices = new Shop.Voices.getInstance({
			onBeforeSay:function(){
				var soundLibrary = Shop.instance.getSoundLibrary();
				var soundSections = soundLibrary.getSections();
				//console.log('SOUND SECTIONS',soundSections);
				soundSections.each(function(section){
					var items = soundLibrary.getItems(section);
					for(id in items){
						var item = items[id];
						item.volume(0.1);
					}
				}.bind(this));
			}.bind(this),
			onAfterSay:function(){
				var soundLibrary = Shop.instance.getSoundLibrary();
				var soundSections = soundLibrary.getSections();
				//console.log('SOUND SECTIONS',soundSections);
				soundSections.each(function(section){
					var items = soundLibrary.getItems(section);
					for(id in items){
						var item = items[id];
						item.volume(1);
					}
				}.bind(this));
			}.bind(this)
		}); 
		
		this.$gps = Shop.GPS.getInstance({
			account:this.account
		});
		
		if ($defined(window.cordova)) {
			if (window.device.platform === 'iOS') {
				if ($defined(cordova.plugins)) {
					if ($defined(cordova.plugins.iosrtc)) {
						cordova.plugins.iosrtc.registerGlobals();
				
					    // load adapter.js
					    var adapterVersion = 'latest';
					    var script = document.createElement("script");
					    script.type = "text/javascript";
					    script.src = "https://webrtc.github.io/adapter/adapter-" + adapterVersion + ".js";
					    script.async = false;
					    document.getElementsByTagName("head")[0].appendChild(script);	
					}	
				}
			}			
		}
		
		document.addEventListener("backbutton", function() {
			// pass exitApp as callbacks to the switchOff method
			this.registry.goBack();
			//console.log('Back Button',this.registry.$currentApp);
		}.bind(this), false);
	},
	$background:false,
	$backgroundInitialized:false,
	backgroundState:function(state){
		if ($defined(state)) {
			if (this.$background!=state) {
				if ($defined(window.cordova)) {
					if ($defined(cordova.plugins)) {
						if ($defined(cordova.plugins.backgroundMode)) {
							if (!this.$backgroundInitialized) {
								cordova.plugins.backgroundMode.configure({
								    title: Shop.instance.account.name,
								    text: 'App is running in background mode'
								    //icon: 'icon' // this will look for icon.png in platforms/android/res/drawable|mipmap
								    //color: String // hex format like 'F14F4D'
								    //resume: Boolean,
								    //hidden: Boolean,
								    //bigText: Boolean
								});
								cordova.plugins.backgroundMode.on('activate', function() {
									console.log('BackgroundMode: Disabling Optimizations...');
								   	cordova.plugins.backgroundMode.disableWebViewOptimizations(); 
								   	//cordova.plugins.backgroundMode.disableBatteryOptimizations(); 
								});
								cordova.plugins.backgroundMode.on('enable',function(){
									console.log('BackgroundMode: Enabled ...');
								});
							}
							console.log('Setting Background Mode',state);
							this.$background=state;
							
							if (this.$background) {
								cordova.plugins.backgroundMode.enable();
							} else {
								cordova.plugins.backgroundMode.disable();
							}
						}
					}
				}
			}	
		}
		return this.$background;
	},
	isBackground:function(){
		if ($defined(window.cordova)) {
			if ($defined(cordova.plugins)) {
				if ($defined(cordova.plugins.backgroundMode)) {
					return cordova.plugins.backgroundMode.isActive();	
				}
			}
		}
		return false;
	},
	vibrate:function(time){
		console.log('Attempt to Vibrate Device...');
		if ($defined(navigator.vibrate)) {
			console.log('Vibrate Device :'+Json.encode(time));
			navigator.vibrate(time);
		}
		return this;
	},
	focus:function(onFocus,onBackground){
		console.log('Platform focus...');
		if ($defined(window.cordova)) {
			if ($defined(cordova.plugins)) {
				if ($defined(cordova.plugins.backgroundMode) && this.backgroundState()) {
					cordova.plugins.backgroundMode.isScreenOff(function(isOff) {
						console.log('BackgroundMode: Screen is '+(isOff?'Off':'On')+' ...');
						if (isOff) {
							console.log('BackgroundMode: Waking Up Device...');
							cordova.plugins.backgroundMode.wakeUp();
							// Turn screen on and show app even locked
							cordova.plugins.backgroundMode.unlock();	
						}
						
						if (cordova.plugins.backgroundMode.isActive()) {
							console.log('BackgroundMode: Moving app to Foreground...');
							//cordova.plugins.backgroundMode.moveToForeground();
							if ($type(onBackground)=='function') {
								onBackground();
							}							
						}
						
						this.vibrate(3000);
						
						if ($type(onFocus)=='function') {
							(function(){
								onFocus();
							}.delay(500,this));
						}
					}.bind(this));	
				} else {
					if ($type(onFocus)=='function') {
						onFocus();
					}
				}
			} else {
				if ($type(onFocus)=='function') {
					onFocus();
				}
			}
		} else {
			if ($type(onFocus)=='function') {
				onFocus();
			}
		}
		return this;
	},
    restart:function(onRestart){
        console.log('Restarting...');
        this.deleteActiveCache('account',function(){
        	console.log('Account Cache Deleted');
        	this.deleteActiveCache('apps',function(){
        		console.log('Apps Cache Deleted');	
        		this.loadAccount(function(result){    
		            console.log('Account Loaded');
		            this.access = result.access;
		            this.users = result.users;
		            this.templates = result.templates;
		            this.definitions = result.definitions;
		            
		            this.setAccount(result.account);
		            
		            this.loadApps(function(result){
		                var appList = this.getStorage().get('apps');
		                console.log('Apps loaded',appList);
		                var autoloaded = $pick(this.account.startup,'0').toInt()?$pick(this.account.startup_list,[]):appList.autoloaded;
		                this.registry.setApps(appList.items,autoloaded,appList.apps);
		                this.registry.autoload();
		                if ($type(onRestart)=='function') {
		                    onRestart();
		                }
		            }.bind(this),true);
		        }.bind(this),true);
        	}.bind(this));	
        }.bind(this));
    },
	start:function(onStart){
		TPH.loadAssets([
			'MaterializeSocial',
			'TPHTimeselect',
			'TPHComponent',
			'TPHTree',
			'libphonenumber'
		],function(){
			this.loadAccount(function(result){	
	            console.log('Account Loaded');
				this.access = result.access;
	            this.users = result.users;
	            this.templates = result.templates;
	            this.definitions = result.definitions;
	            
	            this.setAccount(result.account);
	            
	            /*
	            if ($defined(result.fonts)) {
	                result.fonts.each(function(fontData){
	                    this.fonts.add(fontData);
	                }.bind(this));    
	            }
	            */
				this.loadApps(function(result){
	                console.log('Apps loaded');
	                window.fireEvent('resize');
	                var sounds = new Array();
	                for(type in this.options.sounds) {
	                	sounds.push({
	                		type:type,
	                		url:this.options.sounds[type]
	                	});
	                }
					this.preloadSounds(sounds,function(){
						this.sound('welcome');
						this.prepDevice();
						this.loadNotifier();
						window.fireEvent('platformReady',[this]);
						if ($type(onStart)=='function') {
							onStart();
						}	
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));		
	},
    getStorage:function(){
        var storage = TPH.localStorage.getInstance('platform.'+this.options.platform);
        if (!storage.has('hash')) {
            storage.set('hash',{});
        }
        return storage;
    },
	setAccount:function(data){
		var storage = this.getStorage();
        this.account = data;
        var urls = new Array();
        ['cover','logo'].each(function(photo){
        	['large','medium','micro','regular','thumb','xlarge'].each(function(size){
        		var fieldName = photo+'_'+size;
        		urls.push({
        			key:fieldName,
        			data:this.account
        		});
        	}.bind(this));
        }.bind(this));
        Shop.localizeList(urls);
        //console.log(urls);
        //console.log(this.account);
        switch(this.account.mode){
             case 'demo':
                if (!$defined(this.$demoElement)) {
                	var body = document.id(window.document.body);
                    this.$demoElement = new Element('div',{'class':'demoContainer'}).inject(body,'top').set('html','<div>DEMO MODE</div>');
                    $fullHeight(body);    
                }
                
                break;
        }
	},
	updatePreferences:function(){
		var preferences = $defined(this.account)?this.account.preferences:null;
		//console.log(preferences);
		if ($defined(preferences)) {
			var body = window.document.body;
			for(key in preferences){
				var value = preferences[key].trim();
				if (value.length) {
					switch(key){
						case 'font-family':
							body.setStyle(key,value);
							break;
						case 'font-size':
							value += 'px';
							body.setStyle(key,value);
							break;
						case 'headbar_background_type':
							switch(value){
								case 'transparent':
									this.headbar.setStyles({
										background:'transparent',
										color:preferences.headbar_text_color
									});
									break;
								case 'image':
									this.headbar.setStyles({
										'background-image':'url('+preferences.headbar_background_image_medium+')',
										'background-position':preferences.headbar_background_position_vertical+' '+preferences.headbar_background_position_horizontal,
										color:preferences.headbar_text_color
									});
									break;
								case 'color':
									this.headbar.setStyles({
										'background-color':preferences.headbar_background_color,
										'background-image':'none',
										color:preferences.headbar_text_color
									});
									break;
							}
							break;
						case 'styles':
							var style = new Element('style',{
								type:'text/css'
							}).inject(window.document.head);
							style.appendText(value);
							break;
					}	
				}
			}
			/*
			(function(){
				window.fireEvent('resize');	
			}.delay(500));
			*/
		}
	},
	loadAccount:function(onLoad,force){
		var storage = this.getStorage();
		var loaded = false;
		//console.log(storage.get('account'));
		console.log('Platform : Loading Account');
		if (storage.has('account') && !force) {
			var accountData = storage.get('account');
			console.log('Platform : Account Data',accountData.account);
			if ($defined(accountData.account)) {					
				if ($type(onLoad)=='function') {
					onLoad(accountData);
				}
				loaded = true;
				console.log('Account Data loaded from Cache');
				
				console.log('Platform : Starting Update Queue');
				this.queueUpdates(function(onUpdate){
                    this.requestAccount(function(result){
                        var hash = storage.get('hash');
                        if (result.status) {
                            if (hash.account!=result.hash) {
                                hash.account = result.hash;
                                storage.set('hash',hash);
                                storage.set('account',result);
                                console.log(hash,'Changes on Account Detected');    
                                window.fireEvent('onLoadAccount',[result,this]);
                            }    
                        }
                        if ($defined(onUpdate)) {
                            onUpdate();
                        }
                    }.bind(this));
                }.bind(this));
                	
			}
		}
		//console.log(loaded);
		if (!loaded){
			ENGINE.showOverlay('Loading Account Details...');
			this.requestAccount(function(result){
                var hash = storage.get('hash');
                hash.account = result.hash;
                storage.set('hash',hash);
                storage.set('account',result);
                ENGINE.hideOverlay();
                if (result.status) {
                    if ($type(onLoad)=='function') {
                        onLoad(result);
                    }    
                }
            }.bind(this),function(){
                ENGINE.hideOverlay();                    
            }.bind(this));
		}		
	},
    requestAccount:function(onLoad,onFail) {
        var params = $merge(this.options.request,this.options.params.account);
        this.cacheActiveRequest('account',params,{
            onComplete:onLoad,
            onFailure:onFail
        });    
    },
    updateAppData:function(appData){
    	console.log('Platform Update App Data',appData);
    	var storage = this.getStorage();
    	if (storage.has('apps')) {
    		var appList = storage.get('apps');
    		if (appList.apps.contains(appData.app)) {
    			for(var i=0;i<appList.items.length;i++) {
    				if (appList.items[i].app==appData.app) {
    					$extend(appList.items[i],appData);
    					break;
    				}
    			}
    			storage.set('apps',appList);
    			this.registry.updateApp(appData);
    		}
    	}
    },
	loadApps:function(onLoad,force){
		var storage = this.getStorage();
		var loaded = false;
		if (storage.has('apps') && !force) {
			var result = storage.get('apps');
            //this.registry.setApps(result.items,result.autoloaded,result.apps);
			if ($type(onLoad)=='function') {
				onLoad(result);
			}
			loaded = true;
			console.log('Apps loaded from Cache');
			
            this.queueUpdates(function(onUpdate){
                this.requestApps(function(result){
                    var hash = storage.get('hash');
                    if (hash.apps!=result.hash) {
                        hash.apps = result.hash;
                        storage.set('hash',hash);
                        storage.set('apps',result);
                        
                        console.log('Changes on Apps Detected');    
                        var templateStorage = TPH.localStorage.getInstance('templates.'+this.options.platform);
                        templateStorage.clear();
                        
                        this.registry.setApps(result.items,result.autoloaded,result.apps);
                        window.fireEvent('onLoadApps',[result,this]);
                    }    
                    if ($defined(onUpdate)) {
                        onUpdate();
                    }
                }.bind(this));
            }.bind(this));
            
		}
		
		if (!loaded) {
			ENGINE.showOverlay('Loading Apps...');
			this.requestApps(function(result){
                var hash = $pick(storage.get('hash'),{});
                hash.apps = result.hash;
                storage.set('hash',hash);
                storage.set('apps',result);
                //this.registry.setApps(result.items,result.autoloaded,result.apps);
                ENGINE.hideOverlay();
                if ($type(onLoad)=='function') {
                    onLoad(result);    
                }
            }.bind(this),function(){
                ENGINE.hideOverlay();
            }.bind(this));
		}
		
	},
    requestApps:function(onLoad,onFail){
        var params = $merge(this.options.request,this.options.params.apps);
            this.cacheActiveRequest('apps',$merge(params,{
                id:this.account.id,
                limitstart:0,
                //limit:0,
                filter:{
                    platform:this.options.platform
                }
            }),{
                onComplete:onLoad,
                onFailure:onFail
            });
    },
	isInstalledOnAccount:function(appName){
		return this.account.apps.contains(appName);
	},
    queueUpdates:function(func){
        if (!$defined(this.$updateQueue)) {
            this.$updateQueue = new Array();
        }    
        this.$updateQueue.push(func);
    },
    runUpdates:function(onComplete){
        if (!$defined(this.$updateQueue)) {
    		if ($type(onComplete)=='function') {
    			onComplete();
    		}
        	return;
        }
        if (this.$updateQueue.length) {
            var func = this.$updateQueue.pop();
            func(function(){
                this.runUpdates.delay(1000,this,[onComplete]);
            }.bind(this));    
        } else {
        	this.$updateQueue.empty();
            this.fireEvent('onFinishUpdates',[this]);
            if ($type(onComplete)=='function') {
    			onComplete();
    		}
            console.log('Updates Complete');
        }
    },
	/*
	loginSignup:function(){
		TPH.getWindow('__PlatformLogin__',{
			caption:'Login/Sign-up',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			new Shop.Platform.Login(win.content,{
				templates:{
					content:this.templates.login_form
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	*/
	logout:function(){
		TPH.getWindow('__PlatformLogout__',{
			caption:'Confirm Logout',
			size:{
				width:400,
				height:'auto'
			},
			closable:false,
			onClose:function(win){
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setContent('<div class="padded"><div class="padded">You are about to logout. Are you sure?</div></div>');
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			TPH.iconButton('Yes, Logout','sign-out',{
				'class':'danger rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.startSpin();
				this.serverRequest($merge(this.options.request,this.options.params.logout),{
					onComplete:function(result){
						if (result.status){
							window.location.reload();
						} else {
							TPH.alert('System Message',result.message);
							win.stopSpin();
						}
					}.bind(this),
					onFailure:function(){
						win.stopSpin();
					}
				});
			}.bind(this));
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	manageProfile:function(){
		TPH.getWindow('__ManagerWindow__',{
			windowClass:'tphWindow full',
			onClose:function(win){
				this.$profile.destroy();
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			win.setCaption('<i class="fa fa-user-circle"></i> Manage Profile');
			
			if (!$defined(this.$profile)) {
				this.$profile = new Shop.Platform.Profile(win.content,{
					data:this.getMember(),
					templates:{
						content:this.templates.profile,
						password:this.templates.password,
						companyListItem:this.templates.company_item,
						companyForm:this.templates.company_form,
						countrySelect:this.templates.country_select,
						branchSelect:this.templates.branch_select
					},
					onBeforeSave:function(){
						win.startSpin();
					},
					onSave:function(result){
						if (result.status) {
							var data = result.data;
							['firstname','lastname','gender','birthdate','nationality','mobile','phone','fax','email','building','street','city','zipcode','state','country'].each(function(field){
								TPH.$member[field] = data[field];
							}.bind(this));	
						}
						win.stopSpin();
					}.bind(this),
					onSaveFailed:function(){
						win.stopSpin();
					}
				});
			} else {
				this.$profile.setOptions({data:this.getMember()}).attach(win.content);
			}
		}.bind(this),true);
	},
	viewQR:function(){
		TPH.getWindow('__ShopAppViewQR__',{
			size:{
				width:310,
				height:'auto'
			},
			caption:'My QR Code',
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent(this.templates.myqrcode);
			var container = win.content.getElement('.qrcode');
			TPH.loadAsset('QRCode',function(){
				var member = this.getMember();
				new QRCode(container,{
					text:"id:{id}\nname:{name}".substitute({
						id:member.id,
						name:member.name
					}),
					width:290,
					height:290
				});	
			}.bind(this));
			win.content.getElement('.qrcode').removeProperty('title');
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	manageDevices:function(){
		TPH.getWindow('__DevicesWindow__',{
			caption:'My Devices',
			windowClass:'tphWindow full',
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			new Shop.Platform.Devices(win.content,{
				template:this.templates.devices,
				templates:{
					printerForm:this.templates.device_printer_form,
					printerList:this.templates.device_printer
				},
				data:TPH
			});
		}.bind(this),true);
	},
	getNotifier:function(){
		return this.$notifier;
	},
	loadNotifier:function(){
		console.log('Loding Notifier for domain '+this.account.domain);
		var integrations = $pick(this.account.integrations,{});
		var ablyKey = $pick(integrations.ablyKey,'').length?integrations.ablyKey:TPH.$ablyKey;
		this.$notifier = new Shop.Realtime.Ably(this.account.domain,{
			apiKey:ablyKey,
			senderId:[this.account.id,TPH.$mid,TPH.$token].join('.'),
			onReceiveMessage:function(message){
				//console.log('Notifier Message Received : '+message.name);
				if ($defined(Shop.instance.registry)) {
					for(appName in Shop.instance.registry.$items) {
						Shop.instance.registry.$items[appName].instances.each(function(instance){
							if ($type(instance.handleNotification)=='function') {
								//console.log('Processing Message for App ',appName);
								instance.handleNotification(message);
							}
						}.bind(this));
					}	
				}
				
				console.log('Notification Scan Plugins');
				for(pluginName in Shop.Plugin.$instances) {
					//console.log(pluginName,Shop.Plugin.$instances[pluginName]);
					var instance = Shop.Plugin.$instances[pluginName];
					if ($type(instance.handleNotification)=='function') {
						//console.log('Processing Message for Plugin',pluginName);
						instance.handleNotification(message);
					}
				}
				
				var data = message.data;
				switch(message.name){
					case 'onChangeAppOnlineStatus':
						console.log('App Online Status Change',data);
						if (data.mid==TPH.$mid) {
							this.updateAppData(data);	
						}
						break;
					case 'Ping-Member':
						console.log(data);
						break;
				}
				
				window.fireEvent('onReceiveRealtimeMessage',[message]);
			}.bind(this)
		});
	},
	pingMember:function(mid){
		this.getNotifier().publish('Ping-Member',[mid]);
	},
	canNotifyLocal:function(){
		if ($defined(window.cordova)) {
			if ($defined(cordova.plugins)) {
				if ($defined(cordova.plugins.notification)) {
					if ($defined(cordova.plugins.notification.local)) {
						return true;
					}
				}
			}
		}
		return false;
	},
	notifyLocal:function(func,data){
		if (this.canNotifyLocal()) {
			if ($type(cordova.plugins.notification.local[func])=='function') {
				switch(func) {
					case 'update':
						break;
				}
				return cordova.plugins.notification.local[func](data);
			}
		}
	}
});
Shop.Platform.Profile = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.ServerRequest,
		TPH.Implementors.TemplateData,
		Shop.Implementors.LocationSetup,
		Shop.Implementors.PreferredBranch
	],
	options:{
		request:{
			option:'com_shop',
			controller:'members',
			task:'save',
			format:'json'
		},
		classes:{
			save:'saveChanges',
			file:'fileUpload'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.attach(container);
	},
	destroy:function(){
		if ($defined(this.$inputs)) {
			this.$inputs.each(function(input){
				input.destroy();
			});
		}
		if ($defined(this.$companyList)) {
			this.$companyList.destroy();
		}
	},
	attach:function(container){
		this.container = container;
		if ($defined(this.$inputs)) {
			this.$inputs.each(function(input){
				input.destroy();
			});
		}
		this.$inputs = this.applyTemplateData(this.container,this.options.templates.content,this.options.data);
		//this.container.set('html',this.options.templates.content.substitute(this.options.data));
		
		this.form = this.container.getElement('form');
		this.form.addEvent('submit',function(e){
			e.stop();
			return false;
		}.bind(this));
		this.containers = new TPH.ContentContainer(this.container,{
			onCreate:function(container,el){
				switch(container){
					case 'personal':
						this.cover = el.getElement('.cover');
						this.photo = el.getElement('.profile.thumb>.profile.thumb');
						
						new TPH.Dropdown(el);
								
						el.getElements('.capture').each(function(el){
							el.addEvent('click',function(){
								this.capturePhoto(el.get('rel'));
							}.bind(this));
						}.bind(this));		
						
						el.getElements('.fileUpload').each(function(el){
							new TPH.FileReader(el,{
								onReadFile:function(fileData,instance){
									var fieldName = instance.el.get('rel');
									var data = {
										id:this.form.elements['id'].value
									};
									switch(fieldName){
										case 'photo':
											data.ext = fileData.ext;
											break;
										case 'cover':
											data.coverext = fileData.ext;
											break;
									}
									data[fieldName+'Data'] = fileData.content;
									this[fieldName].setStyle('background-image','url('+fileData.content+')');
									this.save(data);
								}.bind(this)
							});
						}.bind(this));
						el.getElements('.dateselect').each(function(del){
							var opts = {
								type:'dropdown',
								presets:{
									yearFrom:new Date().decrement('year',100).format('%Y').toInt(),
									yearTo:new Date().format('%Y').toInt()
								}
							};
							new SPDateSelect(del,opts);
						}.bind(this));
						break;
					case 'address':
						this.$locationMap = this.initLocationSetup(el);
						break;
					case 'contact':
						/*
						var containerEl = el.getElement('.mobileContainer'); 
						TPH.createInput('phonenumber',{
							name:'mobile',
							value:containerEl.get('data-value')
						}).inject(containerEl);
						*/
						break;
					case 'companies':
						
						break;
				}
				
			}.bind(this),
			onSelect:function(container,instance){
				$fullHeight(this.container);
				switch(container){
					case 'address':
						this.$locationMap.$map.update();
						break;
					case 'companies':
						this.$companyList = new Shop.Platform.Profile.Company(instance.getContainer(container),{
							templates:{
								item:this.options.templates.companyListItem,
								form:this.options.templates.companyForm,
								countrySelect:this.options.templates.countrySelect
							}
						});	
						break;
				}
				
			}.bind(this)
		});
		this.desktopNavigation = new TPH.ContentNavigation(this.container.getElement('.desktopNavigation'),{
			onSelect:function(el){
				this.containers.select(el.get('rel'));
			}.bind(this)
		});
		this.desktopNavigation.select(this.desktopNavigation.items[0]);
		this.mobileNavigation = new TPH.ContentNavigation(this.container.getElement('.mobileNavigation'),{
			onSelect:function(el){
				this.containers.select(el.get('rel'));
			}.bind(this)
		});
		this.mobileNavigation.select(this.mobileNavigation.items[0]);
			
		$fullHeight(this.container);
		
		this.container.getElements('.'+this.options.classes.save).each(function(el){
			el.addEvent('click',function(){
				this.save();
			}.bind(this));
		}.bind(this));
		
		this.scanActions(this.container);
	},
	scanActions:function(container){
		container.getElements('.appAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					e.stop();
					this[el.get('rel')]();
				}.bind(this));
				el.removeClass('appAction');	
			}
		}.bind(this));
		return this;
	},
	capturePhoto:function(fieldName){
		TPH.getWindow('__ShopCameraCapturePhoto__',{
			caption:'Take a Picture',
			size:{
				width:300,
				height:'auto'
			},
			onClose:function(win){
				this.$capture.destroy();
				win.content.empty(); 
			}.bind(this)
		}).open(function(win){
			win.setContent('<div class="cover"><video width="100%" height="100%" autoplay></video></div>');
			var controlbar = new Element('div',{'class':'controlbar padded'}).inject(win.content);
			this.$capture = new TPH.CameraPhotoCapture(win.content,{
				trigger:TPH.button('Take Picture',{
					'class':'primary rounded block'
				}).inject(controlbar),
				onCapture:function(captureData){
					var data = {
						id:this.form.elements['id'].value
					};
					switch(fieldName){
						case 'photo':
							data.ext = 'png';
							break;
						case 'cover':
							data.coverext = 'png';
							break;
					}
					data[fieldName+'Data'] = captureData;
					this[fieldName].setStyle('background-image','url('+captureData+')');
					this.save(data);
					win.close();
				}.bind(this),
				onError:function(err){
					win.close();
				}.bind(this)
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	save:function(data){
		var data = $pick(data,this.form.toQueryString().parseQueryString());
		if (this.validate(data)) {
			this.fireEvent('onBeforeSave',[data]);
			this.serverRequest($merge(this.options.request,{data:data}),{
				onComplete:function(result){
					if (result.status) {
						window.fireEvent('onUpdateMemberProfile',[result.data]);
						this.fireEvent('onSave',[result,this]);	
					} else {
						if ($defined(result.message)) {
							TPH.alert('System Message',result.message);
						}
						this.fireEvent('onSaveFailed',[result,this]);
					}
				}.bind(this),
				onFailure:function(){
					this.fireEvent('onSaveFailed',[{status:false,message:'Unable to connect to server.'},this]);
				}.bind(this)
			});	
		}
	},
	validate:function(data){
		var fields = ['firstname','lastname','email'],
			valid = true,
			invalids = new Array();
		
		for(field in data) {
			if ($defined(data[field]) && fields.contains(field) && !data[field].length) {
				invalids.push(this.form.elements[field].getParent());
			}	
		}
		
		valid = !invalids.length;
		
		if (!valid) {
			invalids.each(function(el){
				el.flash('#f99','#fff',3,'background-color',100);	
			});
			window.fireEvent('onInputError');
		}
		
		return valid;
	},
	selectBranch:function(){
		TPH.getWindow('__ShopPlatformProfileSelectPreferredBranch__',{
			caption:'Select Preferred Branch',
			windowClass:'tphWindow maxHeight',
			size:{
				width:400,
				height:'auto'
			}
		}).open(function(win){
			win.content.setStyle('min-height',300);
			this.$branchSelect = new Shop.App.BranchSelect(win.content,{
				request:{
					filter:{
						aid:Shop.instance.account.id
					}
				},
				templates:{
					content:this.options.templates.branchSelect
				},
				onBeforeLoad:function(){
					win.startSpin();
				},
				onLoad:function(){
					win.stopSpin();
				},
				onLoadFailure:function(){
					win.stopSpin();
				},
				onSelect:function(item){
					this.setPreferredBranch(item.id);
					TPH.$member.bid = item.id;
					win.startSpin();
					this.activeRequest('branch',{
						option:'com_shop',
						controller:'account.members',
						task:'save',
						format:'json',
						data:{
							aid:Shop.instance.account.id,
							mid:TPH.$mid,
							bid:item.id
						}
					},{
						onComplete:function(result){
							var memberData = result.member;
			            	window.fireEvent('onUpdateMemberProfile',[memberData,this]);
							win.stopSpin();
							win.close();
						}.bind(this),
						onFailure:function(){
							win.stopSpin();
						}
					});
				}.bind(this)
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	changePassword:function(){
		TPH.getWindow('__ProfileChangePassword__',{
			caption:'Change Password',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent(this.options.templates.password);
			
			var form = win.content.getElement('form');
			form.addEvent('submit',function(e){
				e.stop();
				return false;
			}.bind(this));
			
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.button('Submit',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.startSpin();
				var data = form.toQueryString().parseQueryString();
				this.serverRequest({
					option:'com_engine',
					task:'change',
					format:'raw',
					password:data.password,
					data:{
						new1:data.new1,
						new2:data.new2
					}
				},{
					onComplete:function(result){
						win.stopSpin();
						if (result.status){
							TPH.alert('System Message','Password successfully changed');
							win.close();
						} else {
							TPH.alert('System Message',result.message);
						}
					}.bind(this),
					onFailure:function(){
						win.stopSpin();
					}.bind(this)
				});
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'default pretty'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	newCompany:function(){
		if ($defined(this.$companyList)) {
			var member = TPH.$member,
				account = Shop.instance.account;
			var data = {
				type:'company',
				aid:account.id,
				
				company_aid:account.id,
				
				contact_aid:account.id,
				contact_mid:member.id,
				contact_name:member.name,
				contact_firstname:member.firstname,
				contact_lastname:member.lastname,
				
				companycontact_email:member.email,
				companycontact_mobile:member.mobile,
				companycontact_phone:member.phone,
				companycontact_fax:member.fax,
				companycontact_photo:member.photo_medium
			};
			this.$companyList.edit(data);
		}
	},
	testSpeak:function(){
		Shop.instance.$voices.say('Hello');
		//console.log('test');
	}
});

Shop.Platform.Profile.Company = new Class({
	Extends:Shop.List,
	options:{
		request:{
			controller:'customers'
		}
	},
	initialize:function(container,options){
		this.setOptions({
			request:{
				filter:{
					type:'company',
					mid:TPH.$member.id,
					aid:Shop.instance.account.id,
					includeCompanyContacts:1
				}	
			}
		});
		this.parent(container,options);
		//console.log(this.options);
	},
	renderItem:function(el,item){
		el.getElement('.editItem').addEvent('click',function(){
			var member = this.getCompanyContact(TPH.$member.id,item.contacts),
				//data = item,
				data = $merge(item,{
				mid:member.id,
				companycontact_photo:member.photos_medium
			});
			this.edit(data);
		}.bind(this));
		el.getElement('.removeItem').addEvent('click',function(){
			this.removeItem(item);
		}.bind(this));
		this.parent(el,item);
	},
	getCompanyContact:function(mid,items){
		var item = null;
		if ($defined(items)) {
			var count = items.length;
			for(var i=0;i<count;i++){
				item = items[i];
				if (item.mid==mid){
					break;
				}
			}	
		}
		if (!$defined(item)) {
			var member = TPH.$member;
			item = {
				mid:member.id,
				firstname:member.firstname,
				lastname:member.lastname,
				mobile:member.mobile,
				fax:member.fax,
				phone:member.phone,
				email:member.email,
				photos:member.photos
			};
		}
		return item;
	},
	edit:function(data){
		TPH.getWindow('__ShopProfileCompanyForm__',{
			caption:'Company Form',
			windowClass:'tphWindow maxHeight mobile_full',
			contentClass:'tphWindowContent overflow auto',
			size:{
				width:500,
				height:'auto'
			},
			onClose:function(win){
				this.$companyForm.destroy();
				win.content.empty();	
			}.bind(this)
		}).open(function(win){
			this.$companyForm = new Shop.Forms.Customer(win.content,{
				data:data,
				template:this.options.templates.form,
				templates:{
					countrySelect:this.options.templates.countrySelect
				},
				onBuildContent:function(instance){
					$fullHeight(instance.container);
				}.bind(this),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(result){
					win.stopSpin();
					this.addItem(result);
					this.list();
					
					win.close();	
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				},
				onClose:function(){
					win.close();
				},
				onShowSearch:function(){
					win.toCenter(true);
				},
				onHideSearch:function(){
					win.toCenter(true);
				},
				onChangeContainer:function(){
					win.toCenter(true);
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.Registry = new Class({
	Extends:TPH.Module,
	Implements:[
		TPH.Implementors.Templates,
		TPH.Implementors.ListFilters,
		Shop.Implementors.CachedRequests
		//Shop.Implementors.ProcessQueue
		//TPH.Implementors.ServerRequest,
		//TPH.Implementors.ActiveRequest
	],
	options:{
		platform:null,
		properties:{
			'class':'width_50 vertical_middle align_left position relative'
		}
	},
	$activeFilter:true,
	$autoloaded:new Array(),
	$instances:new Array(),
	initialize:function(options){
		this.parent(options);
        this.$items = {};
        this.container = new Element(this.options.tag,this.options.properties);
		Shop.Registry.instance = this;
        console.log('Registry created');
	},
	render:function(container){
        if ($defined(this.options.template)) { 
            this.container.set('html',this.options.template);
        }
        if (!$defined(this.container.getParent()) && $defined(container)) {
            this.container.inject(container);
        }
		if ($defined(this.container)) {
            console.log('Registry render');
			//this.container = new Element(this.options.tag,this.options.properties);	
            
            //this.container.inject(container).set('html',this.options.template);
            this.containers = new TPH.ContentContainer(this.container,{
                selector:'.contentContainer.registry',
                onCreate:function(container,el){
                    switch(container){
                        case 'registry':
                            this.createFilter('apps',el.getElement('form'),function(){
                                this.refresh();
                            }.bind(this));
                            this.createTemplate('appRegistry',el.getElement('.appMenu')).dynamicTemplate('appRegistry',false);
                            
                            var socialContainer = el.getElement('.socialContainer');
                            var hasSocials = false;
                            
                            if ($defined(socialContainer)) {
                                if ($defined(this.options.account.social)){
                                    if (new Hash(this.options.account.social).getLength()) {
                                        var socialList = socialContainer.getElement('.socialList');
                                        for(var key in this.options.account.social){
                                            var social = this.options.account.social[key];
                                            if ($pick(social.link,'').length) {
                                                new Element('div').inject(socialList).set('html',this.options.templates.social.substitute($merge(social,{id:key})));
                                            }
                                        }
                                        hasSocials = true;
                                    }
                                } 
                            }
                            if (!hasSocials) {
                                socialContainer.destroy();
                            }
                            break;
                        case 'instances':
                            this.createTemplate('appHeader',el.getElement('.appHeader')).dynamicTemplate('appHeader',false);;
                            this.createTemplate('appInstances',el.getElement('.appInstances')).dynamicTemplate('appInstances',false);;
                            this.scanActions(el);
                            break;
                    }
                }.bind(this),
                onSelect:function(container,instance){
                    switch(container){
                        case 'registry':
                            this.setCurrent(null);
                            break;
                    }                                             
                }.bind(this)
            });
            //console.log(this.options.platform);
            this.$menu = new TPH.Dropdown(this.container,{
                viewport:Shop.instance.$interface.$container,
                autoClose:false,
                onOpen:function(dd){
                    this.containers.select('registry');                            
                }.bind(this),
                onBeforePosition:function(dd){
                    this.refresh();    
                    dd.getElements('.fullHeight').setStyles({
                        height:'',
                        'max-height':''
                    });
                }.bind(this),
                onPosition:function(dd,instance){
                    if (dd.isOverflow) {
                        $fullHeight(dd);    
                    }
                }.bind(this)
            });
            this.$menu.dropdowns.each(function(item){
                if (item.hasClass('accountApps')) {
                    this.$appMenu = item;
                }
            }.bind(this));
            this.container.getElement('.toggleMenu').addEvent('click',function(){
                this.container.getElement('.appMenu').toggleClass('grid');
                if ($defined(this.$appMenu)) {
                    var dd = this.$appMenu.getElement('dd');
                    this.$menu.position(dd);
                    $fullHeight(dd);
                }
            }.bind(this));
            
            
            //this.containers.select('registry');
            //this.$menu.open();
            if (!this.$preloadChecked) {
                this.checkPreload();
                this.$preloadChecked = true;    
            }
            
            
            window.addEvents({
                resize:function(){
                	this.redraw.throttle(this);
                }.bind(this),
                onChangeOrientation:function(){
                	//console.log('REGISTRY ON CHANGE ORIENTATION');
                	this.redrawApps.throttle(this);
                }.bind(this),
                onChangeDevice:function(){
                	//console.log('REGISTRY ON CHANGE DEVICE');
                	this.redrawApps.throttle(this);
                }.bind(this),
                onAppContainerChange:function(app,instance){
                    switch(this.containers.currentContainer){
                        case 'instances':
                            if (app==this.$currentApp) {
                                this.listInstances(this.$currentApp);
                            }
                            break;
                    }    
                }.bind(this)
            });
		} else {
            console.log('No container for Registry');
            console.trace();
        }
	},
	scanActions:function(container){
		container.getElements('.registryAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					this[el.get('rel')]();
				}.bind(this));
				el.removeClass('registryAction');	
			}
		}.bind(this));
		return this;
	},
    setApps:function(apps,autoloaded,appList){
    	//console.log('SET APPS AUTOLOADED',autoloaded);
        TPH.loadAsset('Progressbar',function(){
            this.canRefresh(false);
            console.log('appList:',appList);
            console.log('exists:',Object.keys(this.$items));
            if (Object.keys(this.$items).length && appList.length) {
                for(appName in this.$items){
                    if (!appList.contains(appName)) {
                        console.log('Removing App',appName);
                        this.removeApp(appName);
                    }
                }
            }
            apps.each(function(app){
            	app.$autoloaded = $pick(autoloaded,[]).contains(app.app);
                this.addApp(app);
            }.bind(this));        
            
            this.canRefresh(true);
            this.refresh();
            window.fireEvent('onSetApps',[this]);
            /*
            this.processPluginQueue(function(){
            	this.runProcessQueue(function(){
            		this.fireEvent('onPluginsLoaded',[this]);
            	}.bind(this));
            	window.fireEvent('onSetApps',[this]);	
            }.bind(this));
            */
        }.bind(this));
    },
    processPluginQueue:function(onComplete){
    	var processQueue = this.getProcessQueue(); 
    	var isComplete = true,
    		queueLength = processQueue.length;
    	console.log('Registry : Process Plugin Queue',processQueue);
    	for(var i=0;i<queueLength;i++) {
    		var processData = processQueue[i];
    		var appData = this.getApp(processData.id);
    		var plugins = $pick(appData.data.technicals.plugins,{}); 
    		console.log('Checking app '+processData.id);
    		if ($defined(plugins.templates)) {
    			var templatesLoaded = $pick(plugins.templatesLoaded,false);
    			console.log('Checking for Completion',processData.id,templatesLoaded);
    			isComplete = isComplete && templatesLoaded;
    		}
    	}
    	if (!isComplete) {
    		this.processPluginQueue.delay(3000,this,[onComplete]);
    	} else if ($type(onComplete)=='function'){
    		onComplete();
    	}
    },
	has:function(appName){
		return $defined(this.$items[appName]);
	},
    /*
	getApps:function(){
		var apps = new Array();
		Object.values(this.$items).sortBy('name').each(function(item){
			apps.push(item.data);
		});
		return apps; 
	},
    */
	addApp:function(app){
		if (!this.has(app.app)) {
            var canAdd = true;
            switch (this.options.platform){
            	case 'client':
	                var options = $pick(app.technicals.options,{memberonly:'0',listed:'1'}),
	                	listed = $pick(options.listed,'1').toInt(),
	                	memberOnly = $pick(options.memberonly,'0').toInt();
	                
	                canAdd = (!memberOnly || (memberOnly && !TPH.$guest)) && listed;
            		break;
            }
			//console.log('ADD APP',app.app,canAdd);
            if (canAdd) {
            	//console.log('Add App',app.app,app);
            	['logo'].each(function(fieldName){
            		//console.log('Registry : Localize App Logo '+app[fieldName]);
            		Shop.localize(app[fieldName],function(url){
            			app[fieldName] = url;
            		});
            	});
            	this.$items[app.app] = {
                    name:app.name,
                    data:app,
                    templatesLoaded:false,
                    assetsLoaded:false,
                    instances:[]
                };	
            } else {
            	app.$autoloaded = false;
            }
        } else {
            //console.log('Update App',app.app);
            $extend(this.$items[app.app],{
                name:app.name,
                data:app,
                templatesLoaded:false,
                assetsLoaded:false,
            });
        }
        if ($defined(app.technicals.plugins)) {
        	var appName = app.app;
        	this.loadAppTemplates(appName,'plugins',function(appName){
				var appInstalled = this.getApp(appName);
                if ($defined(appInstalled)) {
                	var appData = appInstalled.data;
                    if ($defined(appData.technicals.plugins.assets)) {
                    	//this.queueProcess(app.app,function(appName){
                    		//var appData = this.getApp(appName);
			        		this.loadAssets(appData.technicals.plugins.assets);	
			        	//}.bind(this));
                    }	
                }
            }.bind(this));    
        }
        if (app.$autoloaded){
        	this.addAutoloadApp(app.app);
        }
        this.refresh();       
	},
	getStorage:function(namespace){
        var storage = TPH.localStorage.getInstance('templates.'+namespace);
        return storage;
    },
    clearStorage:function(namespace){
    	var storage = TPH.localStorage.getInstance('templates.'+namespace);
    	storage.clear();
    	return this;
    },
	loadAppTemplates:function(appName,namespace,onLoad,container){
		var app = this.getApp(appName),
			hasTemplates = false;
			
		if ($defined(app)) {
			var appData = $pick(app.data.technicals[namespace],{});
			hasTemplates = $defined(appData.templates); 
			if (hasTemplates) {
				appData.templatesLoaded = false;
				var progressOptions = {};
                if ($defined(container)) {
                    var el = new Element('div',{
                        'class':'font small padded'
                    }).inject(container)
                        .adopt(new Element('div').set('html','Getting ready. Please wait...'));
                    $extend(progressOptions,{
                    	container:el,
                        progressBar:new ProgressBar.Line(new Element('div',{'class':''}).inject(el), {
                            strokeWidth: 5,
                            color: '#FCB03C',
                            duration: 500,
                            easing: 'easeIn'
                        })
                    });
                }  
                if ($defined(progressOptions.progressBar)) {
					progressOptions.progressBar.animate(0.1);	
				}
				
				//var storage = this.getStorage(namespace);
				var loaded = false,
					mode = $pick(Shop.instance.account.mode,'demo');

				if (!loaded) {
					//console.log(namespace,Object.keys(appData.templates));
					this.requestAppTemplates(appName,appData,namespace,Object.keys(appData.templates),function(){
						appData.templatesLoaded = true;
						//storage.set(appName,Json.encode(result));
						if ($defined(progressOptions.progressBar)) {
							progressOptions.progressBar.animate(1,function(){
								progressOptions.progressBar.destroy();
								delete(progressOptions.progressBar);
								progressOptions.container.destroy();
								if ($type(onLoad)=='function') {
									onLoad(appName);
								}	
							}.bind(this));	
						} else if ($type(onLoad)=='function') {
							onLoad(appName);
						}
					}.bind(this));
				}
			}
		}
		
		if (!hasTemplates && $type(onLoad)=='function') {
            onLoad(appName);
        }
	},
	requestAppTemplates:function(appName,appData,namespace,templates,onComplete){
		if (templates.length){
			var storeKey = namespace=='plugins'?[namespace,this.options.platform].join('.'):namespace;
			var template = templates.shift();
			var id = [appName,template].join('.');
			//console.log(id);
			var storage = this.getStorage(storeKey);
			if (storage.has(id)) {
				appData.templates[template] = storage.get(id);
				this.requestAppTemplates(appName,appData,namespace,templates,onComplete);
			} else {
				var link = appData.templates[template].toURI();
				var servers = $pick(TPH.$servers,{});
				if ($defined(servers.cdn)) {
					var cdn = servers.cdn.toURI();
					link.set('scheme',cdn.get('scheme'));
					link.set('host',cdn.get('host'));
					link.set('port',null);
				} else if ($defined(TPH.$remote)) {
					var remote = TPH.$remote.toURI();
					link.set('scheme',remote.get('scheme'));
					link.set('host',remote.get('host'));
					link.set('port',null);
				}
				var url = link.toString();
				new Request({
					url:url,
					method:'GET',
					headers:{
						'Cache-Control':'max-stale'
					},
					onSuccess:function(result){
						appData.templates[template] = result;
						storage.set(id,result);
						this.requestAppTemplates(appName,appData,namespace,templates,onComplete);
					}.bind(this)
				}).send();	
			}
		} else if ($type(onComplete)){
			onComplete();
		}
	},
	getApp:function(appName){
		return this.$items[appName];
	},
	updateApp:function(appData,fireEvent){
        var appName = appData.app;
		var app = this.getApp(appName);
		if ($defined(app)) {
			$extend(app.data,appData);
			app.name = appData.name;
			this.refresh();
			this.fireEvent('onAppUpdate',[appName]);
		}
	},
    clearApp:function(appName){
        var app = this.getApp(appName);
        if ($defined(app)) {
            if (app.instances.length) {
                do{
                    var instance = app.instances.pop();
                    if ($defined(instance.$appContainer)) {
                        instance.$appContainer.close();    
                    } else {
                        instance.exit();
                    }    
                }while(app.instances.length);
            }
        }
    },
	removeApp:function(appName){
		var app = this.getApp(appName);
		if ($defined(app)) {
			this.clearApp(appName);
			delete this.$items[appName];
			
			var template = this.getTemplate('appRegistry');
			var count = template.items.length;
			for(var i=0;i<count;i++) {
				var item = template.items[i];
				if (appName==item.data.app) {
					template.items.erase(item);
					break;
				}
			}
			this.refresh();
		}
	},
	_createInstance:function(appName,appContainer,onCreate){
        var app = this.getApp(appName);
        //console.log(app);
        //console.log(this.getApp(appName));
		var container = appContainer.appContent,
			navigation = appContainer.itemNavigation;
			options = {};
			
		if ($defined(this.$preloaded)) {
			if (appName==this.$preloaded.app) {
				var func = this.$preloaded['function'],
					args = this.$preloaded.args;
				$extend(options,{
					onReady:function(instance){
						instance[func].apply(instance[func],args);
						//instance[func](...args);		
					}.bind(this)
				});
				this.$preloaded = null;
			}
		}
		
		this.fireEvent('onBeforeCreateInstance',[options,this]);
		var className = appName.camelCase().ucfirst();
		if ($defined(Shop.App[className])) {
			var appInstance = new Shop.App[className](container,navigation,app.data,$merge(options,{
				platform:this.options.platform,
				onCreate:function(instance){
					instance.$registry = this;
					instance.$appContainer = appContainer;		
				}.bind(this),
				onExit:function(instance){
					//console.log('On Exit');
					this.getInstances(appName).erase(instance);
                    /*
					if ($defined(app.appCount)) {
						var count = this.getInstances(appName).length;
						app.appCount.set('html',count>0?count:'');	
					}
                    */
					if ($defined(instance.$appContainer.element)) {
						instance.$appContainer.close();
					}
					
					this.listInstances(appName);
                    this.refresh();
				}.bind(this),
				onChangeOnlineStatus:function(isOnline,data,instance){
					this.fireEvent('onChangeAppOnlineStatus',[instance.getName().toLowerCase(),isOnline,data,appInstance]);
				}.bind(this)
			}));
			
			appContainer.app = appInstance;
			appContainer.element.addClass(appName);
			
			this.getInstances(appName).push(appInstance);
            /*
			if ($defined(app.appCount)) {
				var count = this.getInstances(appName).length;
				this.$items[app.app].appCount.set('html',count>0?count:'');	
			}
			*/
			this.fireEvent('onCreateInstance',[appName,appInstance,this]);
			this.refresh();
			if (this.containers.currentContainer=='instances') {
				this.listInstances(app);
			}
			
			if ($type(onCreate)=='function') {
				onCreate(appName,appInstance);
			}
			
			
			return appInstance;
		}
		
	},
	createInstance:function(appName,onCreate){
		this.$menu.close();
		var app = this.getApp(appName); //$pick(app,this.currentApp);
        //console.log(app);
		var appContainer = this.options.requestContainer(app.data);
		var container = appContainer.appContent;
        if (!app.templatesLoaded) {
            this.loadAppTemplates(appName,this.options.platform,function(appName){
                var app = this.getApp(appName);
                app.templatesLoaded = true;
                if (!app.assetsLoaded && $defined(app.data.technicals[this.options.platform])) {
                    var assets = app.data.technicals[this.options.platform].assets;
                    if ($defined(assets)) {
                        this.loadAssets(assets,function(){
                            app.assetsLoaded = true;
                            this._createInstance(appName,appContainer,onCreate);
                        }.bind(this));    
                        return;
                    }          
                }  
                this._createInstance(appName,appContainer,onCreate);
            }.bind(this),container);
        } else {
            container.empty();
            this._createInstance(appName,appContainer,onCreate);
        }
		
	},
	listInstances:function(appName){
        var app = this.getApp(appName);
		if (!app.instances.length) {
			this.containers.select('registry');
		} else {
			this.clearTemplate('appHeader').updateTemplate('appHeader').applyTemplate('appHeader',app).renderTemplate('appHeader');
			this.clearTemplate('appInstances');
			app.instances.each(function(instance){
				this.applyTemplate('appInstances',instance.getStatus(),function(el){
					el.addEvent('click',function(e){
						e.stop();
						instance.$appContainer.focus();
						instance.toCenter();
						this.setCurrent(appName);
						this.$menu.close();
						this.fireEvent('onSelectInstance',[instance,app,this]);	
					}.bind(this));
					el.getElement('.deleteInstance').addEvent('click',function(e){
						e.stopPropagation();
						this.$menu.close();
						instance.$appContainer.close();
					}.bind(this));
				}.bind(this));
			}.bind(this));
			this.renderTemplate('appInstances');	
		}
		
		return this;
	},
	getInstances:function(appName){
		return this.getApp(appName).instances; 
	},
    $canRefresh:true,
    canRefresh:function(val){
        this.$canRefresh = $pick(val,this.$canRefresh);
        return this.$canRefresh;
    },
    closeAll:function(){
    	this.canRefresh(false);
        Object.values(this.$items).sortBy('name').each(function(appData){
            var appName = appData.data.app;
            this.getInstances(appName).each(function(instance){
                instance.exit();
            }.bind(this));
        }.bind(this));
        this.canRefresh(true);
        this.refresh();
    },
    onPlatform:function(appName){
    	var appData = this.getApp(appName);
		return $defined(appData.data.technicals[this.options.platform]);
    },
    redraw:function(){
    	var dd = this.$appMenu.getElement('dd');
        this.$menu.position(dd);
        $fullHeight(dd);
        
    	var device = window.UI.device;
    	switch(device){
    		case 'mobile':
    		case 'tablet':
	    		for(appName in this.$items) {
		    		this.$items[appName].instances.each(function(instance){
		    			if (instance.isFocused()) {
		    				instance.fitContent();
		    			}
		    		}.bind(this));
		    	}
    			break;
    	}
    },
    redrawApps:function(){
    	//console.log('REGISTRY REDRAW APPS');
    	for(appName in this.$items) {
    		this.$items[appName].instances.each(function(instance){
    			if (instance.isFocused()) {
    				instance.fitContent().toCenter();
    			}
    		}.bind(this));
    	}
    },
	refresh:function(){
        if (!this.$canRefresh) return;
        console.log('Refreshing Registry');
        //console.trace();
		var templateName = 'appRegistry';
		var filter = this.getFilter('apps');
		this.clearTemplate(templateName).updateTemplate(templateName);
		Object.values(this.$items).sortBy('name').each(function(appData){
            var appName = appData.data.app;
            var appData = this.getApp(appName);
            //console.log('App :'+appName);
			if ($defined(appData.data.technicals[this.options.platform])) {
				var valid = appData.data.name.test(filter.term,'i') || appData.data.$autoloaded;
				switch(this.options.platform){
					case 'client':
						var clientConfig = $pick(appData.data.technicals.client,{config:{disabled:'0'}});
						valid = valid && ($pick(clientConfig.config.disabled,'0')!='1') && ((TPH.$guest && appData.data.privacy=='public') || !TPH.$guest);
						break;
					case 'manager':
						valid = valid && !TPH.$guest;
						break;
				} 
				//console.log('APP REFRESH isValid',appName,valid);
				if (valid) {
					this.applyTemplate(templateName,appData.data,function(el,template,app){
                        var app = appData.data;
						var count = appData.instances.length;
						el.getElement('.appCount').set('html',count>0?count:'');
						el.addEvent('click',function(e){
							if (appData.instances.length>1) {
								this.containers.select('instances');
								this.listInstances(app);
							} else if (appData.instances.length==1){
								this.setCurrent(appName);
                                var instance = appData.instances[0];
                                instance.$appContainer.focus();
                                instance.toCenter();
                                this.$menu.close();
                                this.fireEvent('onSelectInstance',[instance,app,this]);
                            } else {
								this.runApp(appName);
								//this.createInstance(app);	
							}
						}.bind(this));
						if ($defined(this.$preloaded)) {
							if (appName==this.$preloaded.app) {
								this.createInstance(appName);
							}
						}
					}.bind(this));
				} else {
					//console.log('Clear App',appName);
                    //this.clearApp(appName);
                }
			}				
		}.bind(this));
        this.renderTemplate(templateName);
        //console.log(this.$menu.dropdowns);
        //console.log('Apps Refreshed');
	},
	loadAssets:function(assets,onComplete){
		if (assets.length) {
			var asset = assets.shift();
			var url = asset.file.toURI();
			
			var servers = $pick(TPH.$servers,{});
			if ($defined(servers.cdn)) {
				var cdn = servers.cdn.toURI();
				url.set('scheme',cdn.get('scheme'));
				url.set('host',cdn.get('host'));
				url.set('port',null);
			} else if ($defined(TPH.$remote)) {
				var remote = TPH.$remote.toURI();
				url.set('scheme',remote.get('scheme'));
				url.set('host',remote.get('host'));
				url.set('port',null);
			}
			/*
			if ($defined(TPH.$remote)) {
				var remote = TPH.$remote.toURI();
				url.set('host',remote.get('host'));
				url.set('scheme',remote.get('scheme'));
				url.set('port','');
			}
			*/
			var assetLoader = null;
			switch(asset.type){
				case 'js':
					assetLoader = Asset.javascript;
					break;
				case 'css':
					assetLoader = Asset.css;
					break;
			}
			if ($defined(assetLoader)) {
				Shop.localize(url.toString(),function(url){
					new assetLoader(url,{
						onLoad:function(){
							this.loadAssets(assets,onComplete);
						}.bind(this)
					});	
				}.bind(this));
			} else {
				this.loadAssets(assets,onComplete);
			}
		} else {
			if ($type(onComplete)=='function') {
				onComplete();
			}
		}
	},
	checkPreload:function(){
		console.log('check Preload');
		var url = new URI(window.location);
		var fragment = url.get('fragment');
		if ($pick(fragment,'').length) {
			var fragment = fragment.split('?');
			var app = fragment[0],
				params = fragment[1].split('=');
			var func = params[0],
				args = params[1].split('.');
				
			this.$preloaded = {
				app:app,
				'function':func,
				args:args
			};
		}
	},
	runApp:function(appName,onLoad){
		console.log('Registry : Run App',appName);
		if (this.has(appName)) {
			console.log('Registry : App Exists');
			var instances = this.getInstances(appName);
            //console.log(instances);
			if (instances.length){
				console.log('Registry : App Already Running');
				var appInstance = instances[0];
				appInstance.$appContainer.focus();
				appInstance.toCenter();
				this.setCurrent(appName);
				if ($type(onLoad)=='function'){
					onLoad(appName,appInstance,this);
				}
			} else {
				console.log('Registry : Create New Instance');
				this.createInstance(appName,function(appName,appInstance){
					this.setCurrent(appName);
					if ($type(onLoad)=='function'){
						onLoad(appName,appInstance,this);
					}
				}.bind(this));
			}	
		} else {
			console.log('Registry : App Not Installed');
			window.fireEvent('onAppNotInstalled',[appName,this]);
		}
	},
	setCurrent:function(appName){
		this.$currentApp = appName;
	},
	getCurrent:function(){
		return this.$currentApp;
	},
	getCurrentAppInstance:function(appName){
		var current = this.getCurrent();
		if ($defined(current)) {
			var app = this.getApp(current),
				count = app.instances.length,
				items = new Array();
			for(var i=0;i<count;i++) {
				items.push({
					index:i,
					order:app.instances[i].$appContainer.element.getStyle('z-index').toInt()
				});
			}
			return app.instances[items.sortBy('order')[items.length-1].index];	
		}
	},
	goBack:function(){
		var openMenu = this.$menu.getOpen();
		//console.log(Json.encode(openMenu));
		if (openMenu.length) {
			this.$menu.close();
		} else {
			//this.$appMenu.open(this.$menu);
			return;
			if ($defined(this.$currentApp)) {
				var instance = this.getCurrentAppInstance(this.$currentApp);
				var component = instance.currentComponent;
				//console.log(instance,component);
				instance.containers.back();
			}	
		}
	},
	addAutoloadApp:function(appName){
		//console.log('ADD AUTOLOAD',appName,this.$autoloaded);
		this.$autoloaded.include(appName);	
	},
	removeAutoloadApp:function(appName){
		this.$autoloaded.erase(appName);
		//console.log('REMOVE AUTOLOAD',appName,this.$autoloaded);
	},
	hasAutoloadApp:function(appName){
		return this.$autoloaded.contains(appName);
	},
	getAutoloadApps:function(){
		return this.$autoloaded;
	},
	autoload:function(){
		var canAutoload = this.options.platform=='client' && !TPH.$guest;
		if (canAutoload) {
			this.autoloadApps.delay(1000,this,[this.$autoloaded]);	
		}
	},
	autoloadApps:function(apps,onComplete){
		if (apps.length){
			var app = apps.shift();
			if (this.onPlatform(app)) {
				this.runApp(app,function(){
					this.autoloadApps.delay(1000,this,[apps,onComplete]);
				}.bind(this));	
			} else {
				this.autoloadApps(apps,onComplete);
			}
		} else {
			console.log('Finish running autoloaded apps.');
		}
	}
});

Shop.Plugin = new Class({
	Implements:[Events,Options],
	initialize:function(options){
		this.setOptions(options);
		
		this.registry = Shop.Registry.instance;
		this.platform = Shop.instance;	
	},
	getHeadbar:function(){
		return this.platform.headbar;
	},
	getApp:function(){
		if (!$defined(this.$app)) {
			this.$appHandle = this.registry.getApp(this.options.appName);
			this.$app = this.$appHandle.data;
			//console.log('App Handle ',this.$appHandle);
		}
		return this.$app;
	},
	getTemplates:function(){
		return this.getApp().technicals.plugins.templates;
	},
	getTemplate:function(name){
		return this.getTemplates()[name];
	},
	scanActions:function(container){
		container.getElements('.appAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					this[el.get('rel')]();
				}.bind(this));
				el.removeClass('appAction');	
			}
			
		}.bind(this));
		return this;
	},
	handleNotification:function(message){}
});

Shop.Plugin.$instances = {};
Shop.Plugin.Register = function(name,options){
	//console.log('Registering Plugin:',name);
	if ($defined(Shop.Plugin[name])) {
		if (!$defined(Shop.Plugin.$instances[name])) {
			Shop.Plugin.$instances[name] = new Shop.Plugin[name](options); //new Array();
		} else {
			console.warn('Plugin already registered',name);
		}
		//Shop.Plugin.$instances[name].push(new Shop.Plugin[name](options));
	}
}; 
Shop.Plugin.getInstance = function(name){
	var instance = Shop.Plugin.$instances[name];
	if (!$defined(instance)) {
		console.error('Plugin Instance does not exist - '+name);
	}
	return instance;
}; 



Shop.App = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.TemplateData,
		TPH.Implementors.ActiveRequest,
		Shop.Implementors.AppAccess
	],
	options:{
		platform:'',
		libraries:[],
		containers:[],
		navigation:[],
		request:{
			option:'com_shop',
			format:'json'
		}
	},
	$containers:[],
	$components:{},
	$definitions:{},
	initialize:function(container,navigation,app,options){
		this.app = app;
		this.setOptions(options);
		//console.log(this.app.online);
		this.$isOnline = Boolean(this.app.online.toInt());
		this.container = document.id(container);
		
		//console.log(this.app);
		this.navigation = document.id(navigation);
		this.navigation.store('parent',this.navigation.getParent());
		this.$title = this.app.name;
		
		this.fireEvent('onCreate',[this]);
		this.startApp();
	},
	destroy:function(){
		for(componentName in this.$components){
			var component = this.$components[componentName];
			component.destroy();
			delete this.$components[componentName];
		}
		delete this.$components;
		this.container.empty();
		this.navigation.empty();
	},
	startApp:function(){
		if (this.getTechnicals().templatesLoaded) {
			this.initApp(function(){
				if (!this.$appStarted) {
					this.loadContainers(function(){
						this.loadLibraries(function(){
							this.loadContent(function(){
								this.initInterface(); //.toCenter();
								this.fireEvent('onReady',[this]);
							}.bind(this));
						}.bind(this));
					}.bind(this));
					this.$appStarted = true;	
				}	
			}.bind(this));	
		} else {
			console.log(this.getName()+' waiting for templates to load.');
			this.startApp.delay(500,this);
		}
	},
	isOnline:function(status){
		if ($defined(status)){
			this.activeRequest('online',{
				option:'com_shop',
				controller:'app.users',
				task:'save',
				format:'json',
				data:{
					id:this.app.access_id,
					online:status?1:0,
					platform:this.options.platform
				}
			},{
				onComplete:function(result){
					if (result.status) {
						$extend(this.app,result.data);
						this.fireEvent('onChangeAppOnlineStatus',[result.data.online,result.data,this]);	
						Shop.instance.getNotifier().publish(['onChangeAppOnlineStatus'].join('-').clean(),{
							app:result.data.app,
							mid:result.data.mid,
							online:result.data.online,
							platform:result.data.platform
						});
					}
				}.bind(this)
			});
			this.$isOnline = status;
		}
		return this.$isOnline;
	},
	isFocused:function(){
		return this.$appContainer.focused();
	},
    fitContent:function(onFit){
        var appContainer = this.$appContainer;
        var el = appContainer.content;
        //console.log('APP CONTAINER',appContainer);
        //appContainer.fireEvent('onResize',[appContainer]);
        //console.log('FIT CONTENT',el.getCoordinates().height);
        
        appContainer.appContent.setStyles({height:''});
        //console.log('FIT CONTENT',el.getCoordinates().height);
        var height = el.getCoordinates().height-el.getStyle('padding-top').toInt()-el.getStyle('padding-bottom').toInt();
        var header = appContainer.header;
        var headerHeight = header.getStyle('display')!='none'?header.getCoordinates().height-2:0;
        appContainer.appContent.setStyles({
            height:height-headerHeight
        });
        $fullHeight(appContainer.appContent);
        //console.log('FIT CONTENT',el.getCoordinates().height);
        this.redrawContent();
        return this;
    },
    redrawContent:function(){
    	
    },
    focus:function(){
    	var appContainer = this.$appContainer;
    	$fullHeight(appContainer.appContent);
    	this.fireEvent('focus',[this]);
    	return this;
    },
    toCenter:function(){
    	if ($type(this.$appContainer.toCenter)=='function') {
    		switch(window.UI.device) {
    			default:
    				this.$appContainer.toCenter();
    				break;
    		}	
    	}
    	return this;
    },
	sound:function(type){
		Shop.Platforms[this.options.platform].sound(type);
	},
	getStatus:function(){
		return {
			name:$defined(this.$definitions[this.containers.currentContainer])?this.$definitions[this.containers.currentContainer]:$pick(this.$title,this.getName())
		};
	},
	getName:function(){
		var name = Object.keyOf(Shop.App,this.$constructor); 
        return name.toLowerCase();
	},
	initInterface:function(){
		this.$appContainer.focus();
		return this;
	},
	setContainerDefaults:function(container,defaults){
		var defaults = $pick(defaults,{});
		container.getElements('.defaultValue').each(function(el){
			var value = el.get('data-value');
			switch(value){
				case 'today':
					el.set('value',$pick(defaults[value],new Date().format('%Y-%m-%d')));
					break;
			}
		});		
	},
	createContainer:function(container,containment,eventNames,key,sub){
		var eventNames = $pick(eventNames,['onCreateContainer','onCreateSubContainer']);
		this.$containers.push(container.id);
		this.applyAppAccess(containment,this.app.access);
		this.setContainerDefaults(containment);
		var eventName = eventNames.shift();
		this.fireEvent(eventName,[containment,container.id,key,sub,this]);					
		
		var containments = [containment];
		if ($defined(container.children)) {
			for(key in container.children) {
				var events = eventNames.clone();
				var sub = container.children[key];
				var containment = new Element('div',{'class':'contentContainer app fullHeight',rel:sub})
								.inject(this.container)
								.set('html',this.getTechnicals().templates[sub]);
				
				containments.append(this.createContainer({
					id:container.id
				},containment,events,key,sub));
			}
		}
		
		return containments;
	},
	initApp:function(onInit){
		if ($type(onInit)=='function'){
			onInit();
		}
	},
	loadContainers:function(onSuccess){
		var containment = {};
		var date = new Date();
		var today = date.format('%Y-%m-%d'),
			now = date.format('db'),
			week = date.getWeekNumber(),
			month = date.format('%m'),
			year = date.format('%Y');
		if (this.options.containers.length) {
			var rights = new Hash($pick(this.app.rights,{}));
			var navigations = new Array();
			this.options.containers.clone().each(function(container){
				if ($defined(container.id)) {
					if (!rights.has(container.id) || (rights.get(container.id)!='none')) {
						if (!$defined(container.contained)) {
							this.createContainer(container,new Element('div',{'class':'contentContainer app fullHeight',rel:container.id})
										.inject(this.container)
										.set('html',$pick(this.getTechnicals().templates[container.id],'')
											.replaceAll('{now}',now)
											.replaceAll('{today}',today)
											.replaceAll('{thisweek}',week)
											.replaceAll('{thismonth}',month)
											.replaceAll('{thisyear}',year)))
											;
						} else {
							if ($defined(container.contained.container)) {
								if (!$defined(containment[container.contained.container])) {
									containment[container.contained.container] = new Array();
								}
								containment[container.contained.container].push(container);	
							} else {
								console.error('Contained container does not have containment',container);
							}
						}	
					}
				}
				
				if ($defined(container.navigation)) {
					if (!rights.has(container.id) || (rights.get(container.id)!='none')) {
						this.createNavigation(container).inject(this.navigation);
					}
				}
				
			}.bind(this));	
		}
		
		var navigation = new Array({
							navigation:'separator'
						});
		
		switch(this.options.platform){
			case 'manager':
				if ($defined(this.getTechnicals().templates.settings)) {
					navigation.append([
						{
							navigation:'separator'
						},{
							navigation:{
								label:'{name} Settings',
								icon:'fa fa-gears',
								onClick:'loadSettings'
							}
						}
					]);
				}
				break;
		}
		
		if ($defined(this.options.navigation)) {
			navigation.append(this.options.navigation);
		}
		
		//new Element('li',{'class':'separator'}).inject(this.navigation);
		navigation.each(function(container){
			if ($type(container.navigation)=='object') {
				if ($defined(container.navigation.id)) {
					new Element('div',{'class':'contentContainer app fullHeight',rel:container.navigation.id})
						.inject(this.container)
						.set('html',Shop.Platforms[this.options.platform].templates[container.navigation.id]
							.replaceAll('{today}',today)
							.replaceAll('{now}',now)
							.replaceAll('{thisweek}',week)
							.replaceAll('{thismonth}',month)
							.replaceAll('{thisyear}',year));
				}
				container.navigation.label = container.navigation.label.substitute(this.app); 
				this.createNavigation(container).inject(this.navigation);	
			} else {
				this.createNavigation(container).inject(this.navigation);
			}					
		}.bind(this));	
		//console.log(containment);
		this.containers = new TPH.ContentContainer(this.container,{
			selector:'.contentContainer.app',
			onCreate:function(containerName,containerEl,instance){
				//console.log(containment);
				if ($defined(window.cordova)) {
					containerEl.getElements('input[type="date"]').each(function(dateField){
						var startYear = $pick(dateField.get('data-startyear'),new Date().format('%Y'));
						var endYear = $pick(dateField.get('data-endyear'),startYear.toInt()+5);
						//console.log(startYear,endYear);
						new Rolldate({
							el: dateField,
							format: $pick(dateField.get('data-format'),'YYYY-MM-DD'),
							beginYear: startYear,
							endYear: endYear,
							trigger:'click',
							confirm:function(){
								dateField.fireEvent('input');
							}
						});
						dateField.addEvent('click',function(e){
							e.preventDefault();
						});
					}.bind(this));	
				}
			}.bind(this),
			onBeforeSelect:function(container){
				if (this.$containers.contains(container)) {
					var component = this.getComponent(container);
					if ($defined(component)) {
						this.$currentComponent = component;
					}	
				}
				this.fireEvent('onBeforeContainerChange',[this.containers.currentContainer,container,this]);
			}.bind(this),
			onSelect:function(container,instance){
				if (this.$containers.contains(container)) {
					if ($defined(this.$appContainer)) {
						this.$title = this.app.name;
						this.$appContainer.setTitle($defined(this.$definitions[container])?this.$definitions[container]:'');
						this.$appContainer.$menu.close();	
					}	
				}
				$fullHeight(this.container);
				this.fireEvent('onContainerChange',[this.$currentComponent,container,this]);
				window.fireEvent('onAppContainerChange',[this.app.app,this]);
				
			}.bind(this)
		});
		
		for(containerName in containment) {
			containment[containerName].each(function(container){
				containerEl = this.containers.getContainer(container.contained.container);
				if ($defined(containerEl)) {
					var containers = this.createContainer(container,containerEl.getElement(container.contained.selector).set('html',this.getTechnicals().templates[container.id]));
					containers.each(function(containerEl){
						var hasClass = containerEl.hasClass('contentContainer') && containerEl.hasClass('app');
						if (hasClass) {
							var rel = containerEl.get('rel');
							if ($defined(rel)) {
								this.containers.setContainer(rel,containerEl);
								this.containers.index.push(rel);
							}
						}
					}.bind(this));	
				}				
			}.bind(this));
		}
		
		this.getComponents().each(function(component){
			this.getComponent(component).setContainerController(this.containers);
		}.bind(this));
		
		this.containers.select(this.options.containers[0].id);
		
		//TPH.Tools.instance.scanContainer(this.container);
		this.scanActions(this.container);
		$fullHeight.delay(500,this,this.container);
		
		if ($type(onSuccess)=='function') {
			onSuccess();
		}
		return this;
	},
	createNavigation:function(container){
		var row = new Element('li');
		if (container.navigation=='separator') {
			row.addClass('separator');
		} else {
			row.adopt(new Element('i',{'class':container.navigation.icon}))
				.adopt(new Element('span').set('html',container.navigation.label));
			if ($defined(container.navigation)) {
				if ($defined(container.navigation.onClick)){
					row.addEvent('click',function(){
						var func = container.navigation.onClick.split('.');
						if (func.length>1) {
							this.getComponent(func[0])[func[1]]();
						} else {
							this[func[0]]();
						}	
					}.bind(this));
				} else if ($defined(container.navigation.id)) {
					row.addEvent('click',function(e){
						this.containers.select(container.navigation.id);
					}.bind(this));
				}	
			} else if ($defined(container.id)) {
				row.addEvent('click',function(e){
					this.containers.select(container.id);
				}.bind(this));	
			}
			
			this.fireEvent('onCreateNavigation',[row,container.navigation,this]);
		}
		
		return row;
	},
	loadLibraries:function(onSuccess){		
		if ($type(onSuccess)=='function') {
			onSuccess();
		}
		
		return this;
	},
	loadContent:function(onSuccess){
		if ($type(onSuccess)=='function') {
			onSuccess();
		}
		
		return this;
	},
	createComponent:function(name,options){
		/*
		var isNew = !$defined(Shop.App[this.getName()][name]);
		if (isNew) {
			Shop.App[this.getName()][name] = new Array();
		}
		*/
		$extend(options,{
			autoSave:[this.options.platform,this.app.app].join('.'),
			$platform:this.options.platform,
			$name:name
		});
		this.$components[name] = new Shop.Component(this,options);
		this.$components[name].addEvents({
									onUpdateData:function(data,component){
										component.fireEvent('onUpdateComponentData',[name,data,component]);
									}.bind(this),
									onBeforeLoadForm:function(data){
										$extend(data,{
											aid:this.options.account.id
										});
									}.bind(this)
								});
		//						.setItems(Shop.App[this.getName()][name]);
		//this.$components[name].$itemsLoaded = !isNew;
		
		return this.$components[name];
	},
	getComponent:function(name){
		return this.$components[name];
	},
	getComponents:function(){
		return new Hash(this.$components).getKeys();
	},
	scanActions:function(container){
		container.getElements('.appAction').each(function(el){
			var func = el.get('rel').split('.');
			var params = $pick(el.get('data-params'),'').split(',');
			if (func.length>1) {
				var component = this.getComponent(func[0]);
				if ($defined(component)) {
					if ($defined(component[func[1]])) {
						el.addEvent('click',function(e){
							e.stop();
							component[func[1]].apply(component,params);
							/*
							var params = el.get('data-params');
							if ($defined(params)) {
								var params = params.split(',');
									
							} else {
								component[func[1]]();
							}
							*/					
						}.bind(this));
						el.removeClass('appAction');
					}	
				}
			} else if ($defined(this[func[0]])){
				el.addEvent('click',function(e){
					e.stop();
					//console.log(e);
					this[func[0]].apply(this,params);
					/*
					var params = el.get('data-params');
					console.log($type(params),params);
					if ($defined(params)) {
						var params = params.split(',');
						console.log(func[0],params);
						this[func[0]].apply(null,params);
					} else {
						this[func[0]]();
					}
					*/						
				}.bind(this));
				el.removeClass('appAction');	
			}
		}.bind(this));
		return this;
	},
	clear:function(global){
		this.getComponents().each(function(component){
			this.getComponent(component).empty();
		}.bind(this));	
		if ($pick(global,false)) {
			this.$items.empty();
		}
		this.setOptions({limitstart:0});
		return this;	
	},
	exit:function(){
		this.destroy();
		this.fireEvent('onExit',[this]);
	},
	rebuild:function(){
		this.container.empty();
		this.navigation.empty();
		this.loadContainers(function(){
			this.loadLibraries(function(){
				this.loadContent();
			}.bind(this));
		}.bind(this));
	},
	disableNavigation:function(){
		this.navigation.remove();
	},
	enableNavigation:function(){
		this.navigation.inject(this.navigation.retrieve('parent'));
	},
	loadSettings:function(){
		TPH.getWindow('__ManagerWindow__',{
			windowClass:'tphWindow full',
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			var coords = window.getCoordinates();
			win.setCaption('<i class="fa fa-gears"></i> '+this.app.name+' - Settings');
			this.applyTemplateData(win.content,'<div class="fullHeight">'+this.getTechnicals().templates.settings+'</div>',$merge(this.app.installation,{
					id:this.app.installation_id,
					app:this.app.app
				}));
			
			new TPH.Dropdown(win.content);
			
			this.$settingsContainers = new TPH.ContentContainer(win.content,{
				onSelect:function(containerName,instance){
					$fullHeight(instance.getContainer(containerName).getParent());
				}.bind(this)
			});
			this.$settingsNavigation = new TPH.ContentNavigation(win.content,{
				onSelect:function(el){
					this.$settingsContainers.select(el.get('rel'));
				}.bind(this)
			});
			
			if (this.$settingsNavigation.items.length){
				 this.$settingsNavigation.select(this.$settingsNavigation.items[0]);
			}
			this.prepSettings(win.content);
			this.scanActions(win.content);
			
			win.content.getElements('select').each(function(el){
				var raw =  el.get('data-value'),
					multiple = el.get('multiple');
				var value = multiple?raw.split(','):raw;
				if (multiple) {
					var options = el.getElements('option'); 
					value.each(function(val){
						for (var i = 0; i < options.length; i++){
							var option = options[i],
								attr = option.getAttributeNode('value'),
								optionValue = (attr && attr.specified) ? option.value : option.get('text');
							if (optionValue === val) {
								option.selected = true;
							}
						}	
					});
				} else {
					el.set('value',value);	
				}
				
			}.bind(this));
			
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var data = win.content.toQueryString().parseQueryString();
				this.saveSettings({
					id:this.app.installation_id,
					app:this.app.app,
					aid:this.options.account.id,
					params:data
				},function(result){
					$extend(this.app.installation,result.app.installation);
					this.fireEvent('onSaveSettings',[result.app.installation,this]);
					win.close();
				}.bind(this));
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			}.bind(this));
			
			this.fireEvent('onLoadSettings',[win.content,this]);
			
			$fullHeight(win.content);
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	prepSettings:function(container){
		
	},
	saveSettings:function(data,onSuccess){
		var win = TPH.getWindow('__ManagerWindow__');

		win.startSpin();
		this.fireEvent('onBeforeSaveSettings',[data,this]);
		this.activeRequest('settings',$merge(this.options.request,{
			controller:'account.apps',
			task:'save',
			data:data
		}),{
			onComplete:function(result){
				win.stopSpin();
				if ($type(onSuccess)=='function'){
					onSuccess(result);
				}	
			}.bind(this),
			onFailure:function(){
				win.stopSpin();
			}
		});
	},
	loadAbout:function(){
		TPH.getWindow('__AppAbout',{
			caption:'About',
			size:{
				width:600,
				height:'auto'
			},
			closable:false,
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setCaption('About '+this.app.name);
			var template = Shop.Platforms[this.options.platform].templates.about;
			this.applyTemplateData(win.content,template,this.app);
			
			var controlbar = new Element('div',{'class':'controlbar align_center'}).inject(win.content);
			TPH.button('Ok',{
				'class':'default pretty wide'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	getTechnicals:function(platform){
		return this.app.technicals[$pick(platform,this.options.platform)];
	},
	isInstalled:function(appName){
		return this.$registry.has(appName);
	},
	loadApp:function(appName,onLoad){
		this.$registry.runApp(appName,onLoad);
	},
	handleNotification:function(eventName,data){
		
	}
});

Shop.App.Selector = new Class({
	Implements:[
		Events,
		Options,
		TPH.Implementors.Templates,
		TPH.Implementors.ServerRequest
	],
	options:{
		searchKey:'name',
		sortKey:'name',
		sortOrder:'asc',
		request:{
			option:'com_shop',
			format:'json',
			limit:20
		},
		cache:true,
		uid:'id'
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		this.container.set('html',this.getContent());
		this.filterForm = this.container.getElement('form');
		
		if ($defined(this.filterForm)) {
			this.filterForm.addEvent('submit',function(e){
				e.stop();
				this.setOptions({limitstart:0}).load();
				return false;
			}.bind(this));
			
			this.filterForm.getElements('input,select').each(function(el){
				switch(el.get('tag')){
					case 'input':
						switch(el.get('type')){
							case 'checkbox':
							case 'radio':
								el.addEvent('click',function(){
									this.list();
								}.bind(this));
								break;
							case 'date':
								el.addEvents({
									input:function(e){
										this.list();
									}.bind(this)
								});
								break;
							default:
								el.addEvents({
									keyup:function(e){
										switch(e.key){
											case 'esc':
												e.stop();
												e.target.set('value','');
												this.setOptions({limitstart:0}).clearItems().load();
												break;
											case 'enter':
												e.stop();
												this.setOptions({limitstart:0}).clearItems().load();
												break;	
											default:
												this.list();
												break;
										}	
									}.bind(this)
								});
						}
						break;
					case 'select':
						el.addEvent('change',function(){
							this.setOptions({limitstart:0}).clearItems().load();
						}.bind(this));
						break;
				}
			}.bind(this));
		}
		this.buildContent();
		this.createTemplate('list',this.container.getElement('.contentList'));

		this.getTemplate('list').parent.addClass('ajaxContainer');
		this.scanActions(this.container);
		if (!$defined(Shop.App[this.getName()].$items) || !this.options.cache) {
			if (!this.options.cache) {
				this.clearItems();
			}
			this.load();	
		} else {
			this.list();
		}
		
		this.addEvents({
			onScroll:function(template){
				switch(template.name){
					case 'list':
						var scrollSize = template.parent.getScrollSize();
						var height = template.parent.getCoordinates().height;
						
						if (scrollSize.y == template.scroll.y+height) {
							this.loadNext();
						}
				}		
			}.bind(this)
		});
	},
	destroy:function(){
		this.clearTemplates();
	},
	buildContent:function(){
		this.fireEvent('onBuildContent',[this]);
	},
	getContent:function(){
		return this.options.templates.content;
	},
	getName:function(){
        return Object.keyOf(Shop.App,this.$constructor);
	},
	load:function(){
		var filter = $defined(this.filterForm)?this.filterForm.toQueryString().parseQueryString():{
			term:''
		};
		var params = $merge({
			task:'load',
			load:'items',
			limitstart:this.options.limitstart
		},$merge(this.options.request,{
			filter:filter
		}));
		//console.log(params,filter);
		var template = this.getTemplate('list');
		
		this.fireEvent('onBeforeLoad',[params,this]);
		/*
		if ($defined(template)) {
			if ($defined(template.parent)) {
				template.parent.addClass('loading');	
			}	
		}
		*/
		this.serverRequest(params,{
			onComplete:function(result){
				this.fireEvent('onLoad',[result,this]);
				this.setItems(result.items);
				this.list();
				
				this.$paginator = {
					count:result.count,
					limit:result.limit.toInt(),
					limitstart:$pick(result.limitstart,'0').toInt()
				};	
				/*
				if ($defined(template)) {
					if ($defined(template.parent)) {
						template.parent.removeClass('loading');	
					}	
				}
				*/
				//this.loadNext();
			}.bind(this),
			onFailure:function(){
				this.fireEvent('onLoadFailed',[result,this]);
				/*
				if ($defined(template)) {
					if ($defined(template.parent)) {
						template.parent.removeClass('loading');	
					}	
				}
				*/
			}.bind(this)
		});
	},
	loadNext:function(){
		if (!$defined(this.$paginator)) return;
		var $paginator = this.$paginator;
		if (($paginator.limitstart+$paginator.limit<=$paginator.count) && ($paginator.limit>0)) {
			this.setOptions({
				limitstart:$paginator.limitstart+$paginator.limit
			}).load(true);
		} 
	},
	setItems:function(items){
		items.each(function(item){
			this.addItem(item);
		}.bind(this));
	},
	getItems:function(){
		if (!$defined(this.$items)) {
			this.$items = new Array();
		}
		return this.$items;
	},
	getIndex:function(){
		if (!$defined(this.$index)) {
			this.$index = new Array();
		}
		return this.$index;
	},
	addItem:function(item){
		var name = this.getName();
		
		if (!this.getIndex().contains(item[this.options.uid])) {
			this.getItems().push(item);
			this.getIndex().push(item[this.options.uid]);
		} else {
			$extend(this.getItem(item[this.options.uid]),item);
		}
	},
	getItem:function(uid){
		if (this.getIndex().contains(uid)) {
			var items = this.getItems();
			var count = items.length;
			for(var i=0;i<count;i++) {
				if (items[i][this.options.uid]==uid) {
					var name = this.getName();
					return this.$items[i];
				}
			}
		}
	},
	deleteItem:function(uid){
		if (this.getIndex().contains(uid)) {
			//console.log(uid,this.getItems().length);
			var name = this.getName();
			this.$index.erase(uid);
			var count = Shop.App[name].$items.length;
			for(var i=0;i<count;i++) {
				if (this.$items[i][this.options.uid]==uid) {
					this.$items.erase(this.$items[i]);
					//console.log(Shop.App[name].$items.length);
					return this;
				}
			}
		}
		return this;
	},
	clearItems:function(){
		var name = this.getName();
		if ($defined(this.$items)){
			this.$items.empty();
		}
		if ($defined(this.$index)) {
			this.$index.empty();
		}
		
		this.$items = null;
		this.$index = null;
		this.$paginator = null;
		
		this.clearTemplate('list').updateTemplate('list');
		
		return this;
	},
	list:function(onList){
		$fullHeight(this.getTemplate('list').parent.getParent());
		var filter = $defined(this.filterForm)?this.filterForm.toQueryString().parseQueryString():{
			term:''
		};
		
		this.clearTemplate('list').updateTemplate('list');
		var items = this.getItems().sortBy(this.options.sortKey);
		switch(this.options.sortOrder) {
			case 'desc':
				items = items.reverse();
				break;
		}
		items.each(function(item){
			if (this.validate(filter,item)) {
				this.fireEvent('onBeforeRenderItem',[item,this]);
				this.applyTemplate('list',item,function(el,template,item){
					/*
					el.getElements('.styleContent').each(function(el){
						el.setStyle(el.get('data-style'),el.get('data-content'))
							.removeProperties('data-style','data-content')
							.removeClass('styleContent')
							;
					});
					*/
					this.processItemElement(item,el);
					this.fireEvent('onRenderItem',[el,item,this]);
				}.bind(this));	
			}
		}.bind(this));
		this.renderTemplate('list');
		if ($type(onList)=='function') {
			onList();
		}
	},
	processItemElement:function(item,el){
		var selectAction = el.getElement('.selectAction');
		if ($defined(selectAction)) {
			selectAction.addEvent('click',function(e){
				this.fireEvent('onSelect',[item,this,el]);
			}.bind(this));	
		}
	},
	validate:function(filter,item){
		if ($defined(filter.term)) {
			if (filter.term.length){
				var searchKeys = $type(this.options.searchKey)=='array'?this.options.searchKey:[this.options.searchKey],
					hasMatch = false;
				
				searchKeys.each(function(searchKey){
					if ($defined(item[searchKey])) {
						if (item[searchKey].test(filter.term,'i')) {
							hasMatch = true;
						}	
					}
				});
				return hasMatch;
			}	
		}
		return true;
	},
	scanActions:function(container){
		container.getElements('.appAction').each(function(el){
			var func = el.get('rel');
			if ($defined(this[func])) {
				el.addEvent('click',function(e){
					this[func]();
				}.bind(this));
				el.removeClass('appAction');
			}
		}.bind(this));
		return this;
	}
});

Shop.App.AccountAppSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		searchKey:'app_name',
		sortKey:'app_name',
		uid:'app',
		request:{
			controller:'account.apps',
			filter:{
				include:['app.details']
			}
		}
	}
});

Shop.App.BranchEmployeeSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'branch.employees'
		}
	}
});

Shop.App.ContactSelect = new Class({
	Extends:Shop.App.Selector,
    Implements:[TPH.Implementors.TemplateData],
	options:{
		request:{
			controller:'directory.contacts'
		}
	},
	createContact:function(){
		var data = {
			aid:Shop.instance.account.id
		};
		this.fireEvent('onBeforeCreate',[data,this]);
		this.editContact(data);
	},
	editContact:function(data){
		var data = $pick(data,{});
		$extend(data,{aid:this.options.account.id});
		
		TPH.getWindow('__ShopContactForm__',{
			caption:'Contact Form',
			size:{
				width:500,
				height:'auto'
			},
            onClose:function(win){
                this.$fields.each(function(field){
                    field.destroy();
                });
                win.content.empty();
            }.bind(this)
		}).open(function(win){
            this.$fields = this.applyTemplateData(win.content,this.options.templates.form,data);
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			var form = win.content.getElement('form');
			form.elements[0].focus();
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				if (TPH.validateForm(form)) {
					var data = form.toQueryString().parseQueryString();
					win.startSpin();
					var params = $merge(this.options.request,{
						task:'save',
						data:data
					});
					this.fireEvent('onBeforeSaveContact',[params,this]);
					this.serverRequest(params,{
						onComplete:function(result){
							win.stopSpin();
							if (result.status){
								this.addItem(result.data);
								//Shop.App[this.getName()].$items.push(result.data);
								this.list();
								this.fireEvent('onSave',[result.data,this]);
								win.close();
							} else {
								TPH.alert('System Message',result.message);
							}
						}.bind(this),
						onFailure:function(){
							win.stopSpin();
						}
					});
				}
				
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(e){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.CompanyContactSelect = new Class({
	Extends:Shop.App.ContactSelect,
	options:{
		request:{
			controller:'directory.company.contacts'
		}
	}
});

Shop.App.CompanySelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'directory.companies'
		}
	},
	createCompany:function(){
		this.editCompany();
	},
	editCompany:function(data){
		var data = $pick(data,{
			aid:Shop.instance.account.id
		});
		$extend(data,{aid:this.options.account.id});
		
		TPH.getWindow('__ShopCompanyForm__',{
			caption:'Company Form',
			size:{
				width:500,
				height:'auto'
			}
		}).open(function(win){
			win.setContent(this.options.templates.form.substitute(data));
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			var form = win.content.getElement('form');
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var data = form.toQueryString().parseQueryString();
				win.startSpin();
				this.serverRequest($merge(this.options.request,{
					task:'save',
					data:data
				}),{
					onComplete:function(result){
						win.stopSpin();
						if (result.status){
							this.addItem(result.data);
							//Shop.App[this.getName()].$items.push(result.data);
							this.list();
							this.fireEvent('onSave',[result.data,this]);
							win.close();
						} else {
							TPH.alert('System Message',result.message);
						}
					}.bind(this),
					onFailure:function(){
						win.stopSpin();
					}
				});
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(e){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.BankSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'banks'
		}
	},
	createBank:function(){
		this.editBank();
	},
	editBank:function(data){
		var data = $pick(data,{});
		TPH.getWindow('__ShopBankForm__',{
			caption:'Bank Form',
			size:{
				width:500,
				height:'auto'
			}
		}).open(function(win){
			win.setContent(this.options.templates.form.substitute(data));
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			var form = win.content.getElement('form');
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var data = form.toQueryString().parseQueryString();
				win.startSpin();
				this.serverRequest($merge(this.options.request,{
					task:'save',
					data:data
				}),{
					onComplete:function(result){
						win.stopSpin();
						if (result.status){
							Shop.App[this.getName()].$items.push(result.data);
							this.list();
							this.fireEvent('onSave',[result.data,this]);
							win.close();
						} else {
							TPH.alert('System Message',result.message);
						}
					}.bind(this),
					onFailure:function(){
						win.stopSpin();
					}
				});
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(e){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.BankAccountSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'bank.accounts'
		}
	}
});

Shop.App.ProviderPaymentSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'providers',
			filter:{
				type:'payment'
			}
		}
	}
});

Shop.App.ProviderRemittanceSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'providers',
			filter:{
				type:'remittance'
			}
		}
	}
});

Shop.App.BranchSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'account.branches'
		}
	},
	validate:function(filter,item){
		var termValid = this.parent(filter,item),
			codeValid = false;
		if ($defined(filter.term)) {
			if (filter.term.length){
				codeValid = item.code.trim().toLowerCase()==filter.term.trim().toLowerCase() || item.id==filter.term.trim();
			}	
		}
		return termValid || codeValid;
	},
	manageBranches:function(){
		Shop.Registry.instance.runApp('branches',function(appName,appInstance,registry){
			var component = appInstance.getComponent('branches');
			component.run();
			this.clearItems();
		}.bind(this));
		this.fireEvent('onManageBranches',[this]);
	}
});

Shop.App.EventSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'events'
		}
	}
});

Shop.App.PlaceSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'places'
		}
	},
	createPlace:function(){
		this.editPlace({
			aid:this.options.request.filter.aid
		});
	},
	editPlace:function(data){
		var data = $pick(data,{});
		TPH.getWindow('__ShopPlaceForm__',{
			caption:'Place Form',
			size:{
				width:500,
				height:'auto'
			}
		}).open(function(win){
			//win.setContent(this.options.templates.form.substitute(data));
			this.applyTemplateData(win.content.empty(),this.options.templates.form,data);
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			var form = win.content.getElement('form');
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				if (TPH.validateForm(form)) {
					var data = form.toQueryString().parseQueryString();
					win.startSpin();
					this.serverRequest($merge(this.options.request,{
						task:'save',
						data:data
					}),{
						onComplete:function(result){
							win.stopSpin();
							if (result.status){
								Shop.App[this.getName()].$items.push(result.data);
								this.list();
								this.fireEvent('onSave',[result.data,this]);
								win.close();
							} else {
								TPH.alert('System Message',result.message);
							}
						}.bind(this),
						onFailure:function(){
							win.stopSpin();
						}
					});
				}				
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(e){
				win.close();
			}.bind(this));
			
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.OrganizationSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'organizations'
		}
	},
	manageOrganizations:function(){
		Shop.Registry.instance.runApp('organization',function(appName,appInstance,registry){
			var component = appInstance.getComponent('organizations');
			component.run();
			this.clearItems();
		}.bind(this));
		this.fireEvent('onManageOrganizations',[this]);
	}
});

Shop.App.OrganizationElementSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'organization.elements',
			limit:0
		}
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		this.container.set('html',this.options.templates.content);
		this.filterForm = this.container.getElement('form');
		if ($defined(this.filterForm)) {
			this.filterForm.addEvent('submit',function(e){
				e.stop();
				return false;
			});
			
			this.filterForm.getElements('input').each(function(el){
				el.addEvent('input',function(){
					this.list();
				}.bind(this));
			}.bind(this));	
		}
		
		this.scanActions(this.container);
		
		if (!$defined(Shop.App[this.getName()].$items) || !this.options.cache) {
			if (!this.options.cache) {
				this.clearItems();
			}
			this.load();	
		} else {
			this.list();
		}
	},
	destroy:function(){
		this.parent();
		this.$elements.destroy();
	},
	list:function(){
		var list = this.getItems().sortBy('name'); // Shop.App[this.getName()].$items.sortBy('name');
		if (!$defined(this.$elements)){
			this.$elements = new TPH.TreeList(this.container.getElement('.contentList'),{
				template:this.options.templates.item,
				list:list,
				onRenderItem:function(el,template,item){
					var selectAction = el.getElement('.selectAction');
					if ($defined(selectAction)) {
						selectAction.addEvent('click',function(e){
							this.fireEvent('onSelect',[item]);
						}.bind(this));	
					}
					//this.fireEvent('onRenderItem',[el,item]);
				}.bind(this)
			});
		} else {
			this.$elements.setOptions({
				list:list
			}).buildTree();
		}
	}
});

Shop.App.UserSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'account.users'
		}
	}
});

Shop.App.CustomerSelect = new Class({
	Extends:Shop.App.Selector,
	Implements:[TPH.Implementors.TemplateData],
	options:{
		request:{
			controller:'customers'
		},
		formName:'__ShopCustomerForm__',
		formCaption:'Customer Form',
		formType:'',
		modal:{
			name:'__ShopCustomerCompanyForm__',
			caption:'Company Form'
		}
	},
	getParams:function(){
		var params = {
			aid:this.options.account.id,
			type:this.options.formType
		};
		this.fireEvent('onBuildFormData',[params,this]);
		return params;
	},
	createCustomer:function(){
		TPH.getWindow(this.options.modal.name,{
			caption:this.options.modal.caption,
			windowClass:'tphWindow maxHeight mobile_full',
			contentClass:'tphWindowContent overflow auto',
			size:{
				width:500,
				height:'auto'
			},
			onClose:function(win){
				this.$customerForm.destroy();
				win.content.empty();	
			}.bind(this)
		}).open(function(win){
			this.$customerForm = new Shop.Forms.Customer(win.content,{
				data:this.getParams(),
				template:this.options.templates.form,
				templates:{
					countrySelect:this.options.templates.countrySelect
				},
				onBuildContent:function(instance){
					$fullHeight(instance.container);
				}.bind(this),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(data){
					Shop.App[this.getName()].$items.push(data);
					this.list();
					this.fireEvent('onSelect',[data,this]);
					win.stopSpin();
					win.close();
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				},
				onClose:function(){
					win.close();
				},
				onShowSearch:function(){
					win.toCenter(true);
				},
				onHideSearch:function(){
					win.toCenter(true);
				},
				onChangeContainer:function(){
					win.toCenter(true);
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.CustomerCompanySelect = new Class({
	Extends:Shop.App.CustomerSelect,
	options:{
		request:{
			filter:{
				type:'company'
			}
		},
		formName:'__ShopCustomerCompanyForm__',
		formType:'company'	
	}
});
Shop.App.CustomerContactSelect = new Class({
	Extends:Shop.App.CustomerSelect,
	options:{
		request:{
			filter:{
				type:'contact'
			}
		},
		formName:'__ShopCustomerContactForm__',
		formType:'contact'	
	}
});

Shop.App.SupplierSelect = new Class({
	Extends:Shop.App.Selector,
	Implements:[TPH.Implementors.TemplateData],
	options:{
		request:{
			controller:'suppliers'
		},
		formName:'__ShopSupplierForm__',
		formCaption:'Supplier Form',
		formType:'',
		modal:{
			name:'__ShopSupplierCompanyForm__',
			caption:'Supplier Form'
		}
	},
	getParams:function(){
		var params = {
			aid:this.options.account.id,
			type:this.options.formType
		};
		this.fireEvent('onBuildFormData',[params,this]);
		return params;
	},
	getParams:function(){
		var params = {
			aid:this.options.account.id,
			type:this.options.formType
		};
		this.fireEvent('onBuildFormData',[params,this]);
		return params;
	},
	createSupplier:function(){
		TPH.getWindow(this.options.modal.name,{
			caption:this.options.modal.caption,
			windowClass:'tphWindow maxHeight mobile_full',
			contentClass:'tphWindowContent overflow auto',
			size:{
				width:500,
				height:'auto'
			},
			onClose:function(win){
				this.$supplierForm.destroy();
				win.content.empty();	
			}.bind(this)
		}).open(function(win){
			this.$supplierForm = new Shop.Forms.Supplier(win.content,{
				data:this.getParams(),
				template:this.options.templates.form,
				templates:{
					countrySelect:this.options.templates.countrySelect
				},
				onBuildContent:function(instance){
					$fullHeight(instance.container);
				}.bind(this),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(data){
					Shop.App[this.getName()].$items.push(data);
					this.list();
					this.fireEvent('onSelect',[data,this]);
					win.stopSpin();
					win.close();
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				},
				onClose:function(){
					win.close();
				},
				onShowSearch:function(){
					win.toCenter(true);
				},
				onHideSearch:function(){
					win.toCenter(true);
				},
				onChangeContainer:function(){
					win.toCenter(true);
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.SupplierCompanySelect = new Class({
	Extends:Shop.App.SupplierSelect,
	options:{
		request:{
			filter:{
				type:'company'
			}
		},
		formName:'__ShopSupplierCompanyForm__',
		formType:'company'	
	}
});

Shop.App.SupplierContactSelect = new Class({
	Extends:Shop.App.SupplierSelect,
	options:{
		request:{
			filter:{
				type:'contact'
			}
		},
		formName:'__ShopSupplierContactForm__',
		formType:'contact'	
	}
});

Shop.App.MemberSelect = new Class({
	Extends:Shop.App.Selector,
	Implements:[TPH.Implementors.ActiveRequest],
	options:{
		genderSelect:true,
		defaultGender:'any',
		request:{
			controller:'account.members'
		}
	},
	initialize:function(container,options){
		this.addEvents({
			onBuildContent:function(instance){
				
			}.bind(this),
			onBeforeLoad:function(params){
				if (this.options.distanceCheck && $defined(TPH.$gps)) {
					$extend(params.filter,{
						distanceFrom:$pick(this.options.distanceFrom,[TPH.$gps.longitude,TPH.$gps.latitude].join(',')),
						//distanceLimit:this.options.distanceLimit,
						sort:'distance'
					});
				}
			}.bind(this)
		});
		this.parent(container,options);
	},
	buildContent:function(){
		var featureFilters = this.container.getElements('.featureFilter');
		//console.log(featureFilters);
		featureFilters.each(function(el){
			var filterName = el.get('rel');
			//console.log('Member Select Filter',filterName);
			if (this.options[filterName]) {
				switch(filterName){
					case 'distanceCheck':
						var distanceLimit = el.getElement('[name="distanceLimit"]');
						if ($defined(distanceLimit)) {
							var distanceText = this.options.distanceLimit;
							new Element('option',{value:this.options.distanceLimit}).set('html',distanceText.toDistance()).inject(distanceLimit);
						}
						break;
					case 'genderSelect':
						console.log('MEMBER SELECT',this.options);
						this.$genderField = this.container.getElement('[name="gender"]');
						
						if ($defined(this.$genderField)) {
							var genderNavigation = new TPH.ContentNavigation(el,{
								onSelect:function(item){
									var gender = item.get('rel');
									switch(gender){
										case 'female':
										case 'male':
											break;
										default:
											gender = '';
											break;
									}
									this.$genderField.set('value',gender);
									this.setOptions({limitstart:0}).clearItems().load();
								}.bind(this)
							});
							var active = el.getElement('.navigationItem[rel="'+this.options.defaultGender+'"]');
							if ($defined(active)) {
								genderNavigation.select(active);	
							}	
						}
						
						break;
				}
			} else {
				el.destroy();
			}
		}.bind(this));
		this.parent();
	},
	decodeQR:function(data){
		var parts = data.split("\n");
		var ret = {};
		parts.each(function(part){
			var p = part.split(':');
			ret[p[0]]=p[1];	
		});
		return ret;
	},
	scanQR:function(){
		TPH.getWindow('__ShopAppMemberSelectScanQR__',{
			size:{
				width:320,
				height:240
			},
			caption:'Scan Member QR',
			onClose:function(win){
				this.$scanner.destroy();
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			new Element('video',{width:'100%',height:'100%'}).inject(win.content.empty());
			//win.setContent('<video width="100%" height="100%"></video>');
			this.$scanner = new TPH.QRScanner(win.content,{
				onCapture:function(result,instance){
					//try {
						var data = this.decodeQR(result);
						if ($defined(data.id) && $defined(data.name)) {
							//console.log(data.id,data.name);
							this.getMember(data.id,function(member){
								console.log(member);
								//console.log(win);
								//TPH.getWindow('__ShopAppMemberSelectScanQR__').close();
								win.close();
								this.fireEvent('onSelect',[member,this]);
							}.bind(this),function(){
								this.invalidQR('Unable to retrieve info',instance);
							}.bind(this));
						} else {
							this.invalidQR('Invalid QR Format',instance);
						}	
					//} catch(err) {
					//	this.invalidQR('Invalid QR',instance);
					//}
				}.bind(this)
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	getMemberRecord:function(id){
		var items = this.getItems();
		if ($defined(items)) {
			var count = items.length;
			for(var i=0;i<count;i++) {
				if (items[i].mid==id) {
					return items[i];
				}
			}
		}
	},
	getMember:function(id,onSuccess,onFailure){
		var record = this.getMemberRecord(id);
		console.log(record);
		if ($defined(record)) {
			if ($type(onSuccess)=='function') {
				onSuccess(record);
			}
		} else {
			var win = TPH.getWindow('__ShopAppMemberSelectScanQR__');
			win.startSpin();
			this.activeRequest('member',$merge(this.options.request,{
				task:'load',
				load:'member',
				mid:id
			}),{
				onComplete:function(result){
					win.stopSpin();
					if (!$defined(result)) {
						this.addItem(result);
					} 
					if ($type(onSuccess)=='function') {
						onSuccess(result);
					}						
				}.bind(this),
				onFailure:function(){
					win.stopSpin();
					if ($type(onFailure)=='function') {
						onFailure();
					}
				}.bind(this)
			});
		}
	},
	invalidQR:function(message,scanner){
		window.fireEvent('onInputError',[this]);
		TPH.alert('System Message',message,function(){
			scanner.capture();
		}.bind(this));
	},
	validate:function(filter,item){
		var termValid = this.parent(filter,item),
			emailValid = false;
		if ($defined(filter.term)) {
			if (filter.term.length){
				emailValid = $pick(item.email,'').trim().toLowerCase()==filter.term.trim().toLowerCase();
			}	
		}
		return termValid || emailValid;
	}
});

Shop.App.EmployeeSelect = new Class({
	Extends:Shop.App.Selector,
	Implements:[TPH.Implementors.ActiveRequest],
	options:{
		request:{
			controller:'employees'
		}
	}
});

Shop.App.FoldersSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'folders',
			limit:0
		}
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		this.container.set('html',this.options.templates.content);
		this.filterForm = this.container.getElement('form');
		if ($defined(this.filterForm)) {
			this.filterForm.addEvent('submit',function(e){
				e.stop();
				return false;
			});
			
			this.filterForm.getElements('input').each(function(el){
				el.addEvent('input',function(){
					this.list();
				}.bind(this));
			}.bind(this));	
		}
		
		this.scanActions(this.container);
		
		if (!$defined(Shop.App[this.getName()].$items)) {
			this.load();	
		} else {
			this.list();
		}
	},
	list:function(){
		var list = Shop.App[this.getName()].$items.sortBy('name');
		if (!$defined(this.$folders)){
			this.$folders = new TPH.TreeList(this.container.getElement('.contentList'),{
				template:this.options.templates.item,
				list:list,
				onRenderItem:function(el,template,item){
					this.fireEvent('onRenderItem',[el,item]);
				}.bind(this)
			});
		} else {
			this.$folders.setOptions({
				list:list
			}).buildTree();
		}
	}
});

Shop.App.CommoditySelect = new Class({
	Extends:Shop.App.Selector,
	Implements:[
		TPH.Implementors.ActiveRequest
	],
	options:{
		request:{
			controller:'commodities'
		}
	},
	buildContent:function(){
		if ($defined(this.filterForm)) {
			this.$category = this.filterForm.getElement('select[name="cid"]');
			if ($defined(this.$category)) {
				this.$category.removeEvents();
				this.$category.addEvent('change',function(){
					this.clearItems();
					this.setOptions({limitstart:0}).load();
				}.bind(this));
				this.loadCategories();
			}
		}
		this.parent();
	},
	loadCategories:function(){
		if ($defined(Shop.App[this.getName()].$categories)) {
			this.listCategories();
		} else {
			this.activeRequest('catgories',$merge(this.options.request,{
				controller:'category.commodities',
				task:'load',
				load:'items',
				limit:0,
				filter:{
					//loadKey:'id'
				}
			}),{
				onComplete:function(result){
					this.setCategories(result.items);
					this.listCategories();
				}.bind(this)
			});	
		}
			
	},
	listCategories:function(){
		new TPH.TreeSelect(this.$category,{
			list:this.getCategories()
		});
		new Element('option',{value:''}).set('html','- Categories -').inject(this.$category,'top');
		this.$category.set('value','');
	},
	setCategories:function(items){
		Shop.App[this.getName()].$categories = items;
	},
	getCategories:function(){
		return Shop.App[this.getName()].$categories;
	},
	newCommodity:function(){
		TPH.getWindow('__ShopAppCommoditySelectForm__',{
			caption:'New Commodity',
			size:{
				width:400,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}.bind(this)
		}).open(function(win){
			console.log(this.options);
			this.$commodityForm = new Shop.Forms.Basic(win.content,{
				request:{
					controller:'commodities'
				},
				template:this.options.templates.form,
				data:$merge({aid:Shop.instance.account.id},this.options.formDefaults),
				onBuildContent:function(instance){
					var cid = instance.container.getElement('select[name="cid"]');
					if ($defined(cid)) {
						new TPH.TreeSelect(cid,{
							list:this.getCategories()
						});
						new Element('option',{value:''}).set('html','- Categories -').inject(cid,'top');
						cid.set('value',cid.get('data-value'));
					}
				}.bind(this),
				onBeforeSave:function(){
					win.startSpin();
				},
				onSave:function(data){
					this.addItem(data);
					this.fireEvent('onSelect',[data,this]);
					win.stopSpin();
					win.close();
				}.bind(this),
				onSaveFailure:function(){
					win.stopSpin();
				},
				onCancel:function(){
					win.close();
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.FieldSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'fields'
		}
	}
});

Shop.App.BrandSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'brands'
		}
	},
	createBrand:function(){
		TPH.getWindow('__ShopBrandForm__',{
			caption:'Brand',
			size:{
				width:300,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent(this.options.templates.form.substitute({
				aid:this.options.request.filter.aid
			}));
			
			var form = win.content.getElement('form');
			form.addEvent('submit',function(e){
				e.stop();
				return false;
			});
			
			var controlbar = new Element('div',{
				'class':'controlbar align_right'
			}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var form = win.content.getElement('form');
				if (TPH.validateForm(form)) {
					win.startSpin();
					var data = form.toQueryString().parseQueryString();
					this.serverRequest($merge(this.options.request,{
						task:'save',
						data:data
					}),{
						onComplete:function(result){
							win.stopSpin();
							if (result.status){
								this.addItem(result.data);
								//Shop.App[this.getName()].$items.push(result.data);
								this.list();
								this.fireEvent('onSelect',[result.data,this]);
								win.close();
							} else {
								TPH.alert('System Message',result.message);
							}
						}.bind(this),
						onFailure:function(){
							win.stopSpin();	
						}
					});	
				}
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.BrandProjectSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'brand.projects'
		}
	},
	createProject:function(){
		TPH.getWindow('__ShopBrandProjectForm__',{
			caption:'Brand',
			size:{
				width:300,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent(this.options.templates.form.substitute({
				aid:this.options.request.filter.aid
			}));
			
			var form = win.content.getElement('form');
			form.addEvent('submit',function(e){
				e.stop();
				return false;
			});
			
			var controlbar = new Element('div',{
				'class':'controlbar align_right'
			}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var form = win.content.getElement('form');
				if (TPH.validateForm(form)) {
					win.startSpin();
					var data = form.toQueryString().parseQueryString();
					this.serverRequest($merge(this.options.request,{
						task:'save',
						data:data
					}),{
						onComplete:function(result){
							win.stopSpin();
							if (result.status){
								this.addItem(result.data);
								//Shop.App[this.getName()].$items.push(result.data);
								this.list();
								this.fireEvent('onSelect',[result.data,this]);
								win.close();
							} else {
								TPH.alert('System Message',result.message);
							}
						}.bind(this),
						onFailure:function(){
							win.stopSpin();	
						}
					});	
				}
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	}
});

Shop.App.BrandModelSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		cache:false,
		request:{
			controller:'brand.models'
		}
	},
	createModel:function(){
		TPH.getWindow('__ShopBrandModelForm__',{
			caption:'Brand Model',
			size:{
				width:300,
				height:'auto'
			},
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent(this.options.templates.form.substitute({
				bid:this.options.request.filter.bid
			}));
			
			var form = win.content.getElement('form');
			form.addEvent('submit',function(e){
				e.stop();
				return false;
			});

			this.loadTypes(document.id(form.elements['type']),win,function(){
				form.elements['name'].focus();
			}.bind(this));
			
			var controlbar = new Element('div',{
				'class':'controlbar align_right'
			}).inject(win.content);
			
			TPH.iconButton('Save','save',{
				'class':'primary rounded'
			}).inject(controlbar).addEvent('click',function(e){
				var form = win.content.getElement('form');
				if (TPH.validateForm(form)) {
					win.startSpin();
					var data = form.toQueryString().parseQueryString();
					this.serverRequest($merge(this.options.request,{
						task:'save',
						data:data
					}),{
						onComplete:function(result){
							win.stopSpin();
							if (result.status){
								this.addItem(result.data);
								//Shop.App[this.getName()].$items.push(result.data);
								this.list();
								this.fireEvent('onSelect',[result.data,this]);
								win.close();
							} else {
								TPH.alert('System Message',result.message);
							}
						}.bind(this),
						onFailure:function(){
							win.stopSpin();	
						}
					});	
				}
			}.bind(this));
			
			TPH.button('Cancel',{
				'class':'info rounded'
			}).inject(controlbar).addEvent('click',function(){
				win.close();
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	loadTypes:function(fieldEl,win,onComplete){
		win.startSpin();
		this.serverRequest($merge(this.options.request,{
			task:'load',
			load:'types',
			bid:this.options.request.filter.bid
		}),{
			onComplete:function(result){
				win.stopSpin();
				if (result.length) {
					fieldEl.empty();
					result.each(function(item){
						new Element('option',{
							value:item
						}).set('html',item).inject(fieldEl);
					});
					new Element('option',{
						value:'+'
					}).set('html','+ New Type').inject(fieldEl);
				} else {
					new Element('input',{
						type:'text',
						name:fieldEl.get('name')
					}).replaces(fieldEl);
				}
				if ($type(onComplete)=='type') {
					onComplete();
				}
			}.bind(this),
			onFailure:function(){
				win.stopSpin();
			}.bind(this)
		});
	}
});

Shop.App.UnitSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'units'
		}
	}
});

Shop.App.UnitLengthSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'units',
			filter:{
				category:'Length'
			}
		}
	}
});

Shop.App.UnitVolumeSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'units',
			filter:{
				category:'Volume'
			}
		}
	}
});

Shop.App.UnitMassSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'units',
			filter:{
				category:'Mass'
			}
		}
	}
});

Shop.App.SMSSenderSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'sms.senders'
		}
	}
});

Shop.App.WalletSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'wallets'
		}
	}
});
Shop.App.CitySelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		searchKey:['name','state'],
		request:{
			controller:'cities'
		}
	},
	validate:function(filter,item){
		if ($defined(filter.term)) {
			if (filter.term.length){
				var searchKeys = $type(this.options.searchKey)=='array'?this.options.searchKey:[this.options.searchKey],
					hasMatch = false;
				var parts = filter.term.toUpperCase().trim().split(' ');
				parts.each(function(part){
					var part = part.trim();
					if (part.length) {
						searchKeys.each(function(searchKey){
							if ($defined(item[searchKey])) {
								if (item[searchKey].test(part,'i')) {
									hasMatch = true;
								}	
							}
						});		
					}
				});
				
				return hasMatch;
			}	
		}
		return true;
	}
});
Shop.App.TownSelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		request:{
			controller:'towns'
		}
	}
});
Shop.App.CountrySelect = new Class({
	Extends:Shop.App.Selector,
	options:{
		uid:'code',
		request:{
			controller:'countries'
		}
	},
	initialize:function(container,options){
		this.addEvents({
			onBuildContent:function(){
				
			}.bind(this)
		});
		this.parent(container,options);
	},
	load:function(){
		var storage = TPH.localStorage.getInstance('db');
		if (storage.has('countries')){
			if (!$defined(Shop.App[this.getName()].$items)) {
				this.fireEvent('onBeforeLoad',[this]);
				Shop.App[this.getName()].$items = Shop.instance.getCountries();
				this.list();
				this.fireEvent('onLoad',[this]);
			} else {
				this.list();
			}			
		}
	}
});

Shop.Forms = {
	Basic:new Class({
		Implements:[
			Events,Options,
			TPH.Implementors.TemplateData,
			TPH.Implementors.ServerRequest
		],
		options:{
			saveRoutine:true,
            autoFocus:true,
			data:{},
			template:'',
			request:{
				option:'com_shop',
				format:'json'
			},
			requestOptions:{
				
			}
		},
		initialize:function(container,options){
			this.container = container;
			this.setOptions(options);
			
			this.reset();
		},
		reset:function(){
			if ($defined(this.$inputs)) {
				this.$inputs.each(function(input){
					input.destroy();
				});	
			}
			
			this.$inputs = this.applyTemplateData(this.container,this.options.template,this.options.data);
			
			this.form = this.container.getElement('form');
			
			if ($defined(this.form)) {
				this.form.addEvent('submit',function(e){
					e.stop();
					this.save();
					return false;
				}.bind(this));	
			}
			
			this.buildContent();
            if (this.options.autoFocus && $defined(this.form)) {
                var focused = false;
                if ($defined(this.options.focusField)) {
                    var focusField = this.form.getElement('[name="'+this.options.focusField+'"]');
                    if ($defined(focusField)) {
                        focusField.focus();
                        focused = true;
                    }
                }
                if (!focused) {
                    var firstEl = this.form.elements[0];
                    if ($defined(firstEl)) {
                        firstEl.focus();    
                    }    
                }    
            }
			
			
			this.scanActions(this.container);
		},
		destroy:function(){
			this.$inputs.each(function(input){
				input.destroy();
			});
			this.container.empty();
		},
		buildContent:function(){
			this.fireEvent('onBuildContent',[this]);
		},
		scanActions:function(container){
			container.getElements('.appAction').each(function(el){
				if ($defined(this[el.get('rel')])) {
					el.addEvent('click',function(e){
						var params = el.get('data-params');
						var params = $defined(params)?params.split(','):[];
						this[el.get('rel')].apply(this,params);
					}.bind(this));	
					el.removeClass('appAction');
				}
				
			}.bind(this));
			return this;
		},
		save:function(onSave,onFailure){
			if ($defined(this.form)?TPH.validateForm(this.form):true){
				var data = this.getData();
				if (this.validate(data)) {
					if (this.options.saveRoutine) {
						this.saveRoutine(data,onSave,onFailure);	
					} else {
						this.fireEvent('onSave',[data]);
					}						
				}
			}	
		},
		getData:function(){
			return $pick(this.form,this.container).toQueryString().parseQueryString();
		},
		buildSaveData:function(params){
			return params;
		},
		processSavedData:function(data){
			
		},
		getAttachment:function(){
			
		},
		saveRoutine:function(data,onSave,onFailure){
			this.fireEvent('onBeforeSave',[data,this]);
			this.serverRequest(this.buildSaveData($merge(this.options.request,{
				task:$pick(this.options.task,'save'),
				data:data
			})),$merge(this.options.requestOptions,{
				onBuild:function(options,attachments){
					console.log('Build Parameters',options,attachments);
					this.fireEvent('onBuildParameters',[options,attachments]);
				}.bind(this),
				onComplete:function(result){
					if (result.status){
						this.processSavedData(result.data);
						this.fireEvent('onSave',[result.data,this,result]);
						if ($type(onSave)=='function') {
							onSave(result);
						}
					} else {
						if ($defined(result.message)) {
							TPH.alert('System Message',result.message);
						}
						if ($type(onFailure)=='function') {
							onFailure(result);
						}
						this.fireEvent('onSaveFailure',[this]);
					}
				}.bind(this),
				onFailure:function(){
					if ($type(onFailure)=='function') {
						onFailure(result);
					}
					this.fireEvent('onSaveFailure',[this]);
				}.bind(this),
				onBeforeSendAttachments:function(attachments,request){
					//console.log('Before Send Attachments',attachments);
					this.fireEvent('onBeforeSendAttachments',[attachments,request,this]);
				}.bind(this),
				onAttachmentsComplete:function(attachments,request){
					//console.log('Attachments Uploaded',attachments);
					this.fireEvent('onAttachmentsComplete',[attachments,request,this]);
				}.bind(this),
				onBeforeSendAttachment:function(file,total,request){
					//console.log('Before Send Attachment',file);
					this.fireEvent('onBeforeSendAttachment',[file,total,request,this]);
				}.bind(this),
				onAttachmentProgress:function(file,index,total,request){
					//console.log('Attachment Progress',file,index,total,((index/total)*100)+'%');
					this.fireEvent('onAttachmentProgress',[file,index,total,request,this]);
				}.bind(this),
				onAttachmentComplete:function(file,result,request){
					//console.log('Attachment Uploaded',file,result);
					this.fireEvent('onAttachmentComplete',[file,result,request,this]);
				}.bind(this)
			}),this.getAttachment());
		},
		validate:function(data){
			return true;
		},
		cancel:function(){
			this.fireEvent('onCancel',[this]);
		}
	}),
	Delete:new Class({
		Implements:[
			Events,Options,
			TPH.Implementors.ServerRequest,
			TPH.Implementors.TemplateData
		],
		options:{
			request:{
				option:'com_shop',
				task:'delete',
				format:'json'
			}
		},
		initialize:function(container,options){
			this.setOptions(options);
			this.applyTemplateData(container,this.options.template,this.options.data);
		},
		submit:function(){
			this.fireEvent('onBeforeDelete',[this]);
			this.serverRequest($merge(this.options.request,{
				task:'delete',
				id:this.options.id
			}),{
				onComplete:function(result){
					if (result.status){
						this.fireEvent('onDelete',[result.id,this]);
					} else {
						this.fireEvent('onDeleteFailure',[this]);
					}
				}.bind(this),
				onFailure:function(){
					this.fireEvent('onDeleteFailure',[this]);
				}.bind(this)
			});	
		}
	})
};

Shop.Forms.Downloader = new Class({
	Extends:Shop.Forms.Basic,
	Implements:[
		TPH.Implementors.ActiveRequest
	],
	destroy:function(){
		this.$message = null;
		this.$progress = null;
		this.parent();
	},
	buildContent:function(){
		this.$containers = new TPH.ContentContainer(this.container);
		this.$message = this.container.getElement('.messageContainer');
		TPH.loadAsset('Progressbar',function(){
			this.$progress = new ProgressBar.Line(this.container.getElement('.progressContainer'),{
				strokeWidth: 2,
				from: { 
					color: '#ff0000'
				},
	    		to: { 
	    			color: '#00ff00'	    			
				},
				text:{
					style:{
						left:'50%',
						top:'100%',
						transform: {
			                prefix: true,
			                value: 'translate(-50%, 0)'
			            }
					}
				}
			});
			this.fireEvent('onBuildContent',[this]);
			this.start();
		}.bind(this));
	},
	start:function(){
		this.$limitstart = 0;
		this.$rows = new Array();
		this.progress(0,'Downloading. Please wait...',function(){
			this.download();
		}.bind(this));
	},
	buildItem:function(item){
		return item;
	},
	download:function(){
		//console.log(this.options.data);
		var params = $merge(this.options.request,{
			filter:this.options.data,
			limitstart:this.$limitstart
		});
		this.fireEvent('onBeforeRequest',[params,this]);
		this.activeRequest('download',params,{
			onProgress:function(percent,loaded,total){
				console.log(percent,loaded,total);
			}.bind(this),
			onComplete:function(result){
				if (result.count) {
					result.items.each(function(item){
						this.$rows.push(this.buildItem(item));
					}.bind(this));
					
					this.$limitstart = result.limitstart.toInt()+result.limit.toInt();
					var progress = this.$limitstart/result.count;
					if (progress<1) {
						this.progress(progress,'Downloaded '+this.$limitstart+' of '+result.count,function(){
							this.download();
						}.bind(this));
					} else {
						this.progress(1,'Downloaded '+this.$limitstart+' of '+result.count,function(){
							this.$containers.select('complete');
						}.bind(this));
					}
				} else {
					TPH.alert('System Message','There is nothing to download. Request returned no records.',function(){
						this.fireEvent('onCancel',[this]);
					}.bind(this));
				}
			}.bind(this)
		});
	},
	progress:function(progress,message,onProgress){
		if ($defined(message)){
			this.$message.set('html',message);
		}
		this.$progress.animate(progress,{
			duration:500,			
			step:function(state, shape, attachment) {
				shape.setText(TPH.number_format(progress*100,2,'.',',')+'%');
				shape.path.setAttribute('stroke', state.color);
		 	}.bind(this)
		},onProgress);
	},
	cancel:function(){
		switch(this.$containers.currentContainer){
			case 'progress':
				TPH.confirm('System Message','This will cancel the download process. Confirm your action.',function(){
					this.fireEvent('onCancel');
				}.bind(this),function(){
					
				}.bind(this),$empty(),{
					okText:'Cancel Download',
					cancelText:'Close'
				});
				break;
			case 'complete':
				TPH.confirm('System Message','If you have not saved the download, you may need to re-download again.',function(){
					this.fireEvent('onCancel');
				}.bind(this),function(){
					
				}.bind(this));
				break;
		}		
	},
	save:function(){
		if (TPH.validateForm(this.form)) {
			var data = this.form.toQueryString().parseQueryString();
			switch(data.ext){
				case 'pdf':
					TPH.loadAsset('jsPDF',function(){
						TPH.loadAsset('jsPDFAutoTable',function(){
							var header = new Array();
							var body = new Array();
							this.$rows.each(function(row,i){
								var r = new Array();
								for(field in row) {
									if (!i) {
										header.push(field);
									}	
									r.push(row[field]);
								}
								body.push(r);
							});
							var doc = new jsPDF({
								orientation:'l'
							});
							doc.setFontSize(8);
							doc.setProperties({
					            title: data.filename
					        });
							
							doc.autoTable({
							    head: [header],
							    body: body,
							});
							var filename = data.filename+'.'+data.ext;
							doc.save(filename);
							this.fireEvent('onCancel',[this]);	
						}.bind(this));
					}.bind(this));
					break;
				default:
					TPH.loadAsset('XLSX',function(){
						var filename = data.filename+'.'+data.ext;
						var ws_name = data.filename;
						var wb = XLSX.utils.book_new(), 
							ws = XLSX.utils.json_to_sheet(this.$rows);
						
						XLSX.utils.book_append_sheet(wb, ws, ws_name);
						XLSX.writeFile(wb, filename,{
							type:data.ext
						});
						this.fireEvent('onCancel',[this]);	
					}.bind(this));
					break;
			}		
		}
	}
});

Shop.Forms.Downloader.Link = new Class({
	Extends:Shop.Forms.Basic,
	Implements:[
		TPH.Implementors.ActiveRequest
	],
	options:{
		task:'save',
		request:{
			controller:'downloads'
		}
	},
	buildContent:function(){
		this.containers = new TPH.ContentContainer(this.container,{
			onCreate:function(containerName,el){
				switch(containerName){
					case 'link':
						this.$linkContainer = el.getElement('.linkContainer');
						break;
				}
			}.bind(this),
			onBeforeSelect:function(containerName,el,instance){
				switch(containerName){
					case 'process':
						switch(instance.currentContainer){
							case 'entry':
								instance.continueSelect = TPH.validateForm(this.form);
								if (instance.continueSelect) {
									this.save(function(result){
										this.$data = result.data;
										instance.select('link');
									}.bind(this));
								}
								break;
						}
						break;
				}
			}.bind(this),
		});
	},
	buildSaveData:function(data){
		$extend(data.data,{
			map:Json.encode(this.options.fieldMap)
		});
		return data;
	},
	saveRoutine:function(data,onSave,onFailure){
		this.parent(data,function(result){
			this.$data = result.data;
			switch(this.$linkContainer.get('tag')){
				case 'a':
					this.$linkContainer.set('html',result.data.link).set('href',result.data.link);
					break;
				case 'input':
					this.$linkContainer.set('value',result.data.link);
					break;
			}
			
			if ($type(onSave)=='function') {
				onSave(result);
			}
		}.bind(this),onFailure);
	},
	download:function(){
		//console.log('Download ',this.$data.link);
		window.open(this.$data.link,'_system');
	},
	copy:function(){
		//console.log('Copy ',this.$data.link);
		this.$linkContainer.select();
		this.$linkContainer.setSelectionRange(0, 99999); /*For mobile devices*/
		
		  /* Copy the text inside the text field */
		document.execCommand("copy");
		
		  /* Alert the copied text */
		alert("Link Copied.");
	}
});


Shop.Forms.DirectoryEntity = new Class({
	Extends:Shop.Forms.Basic,
	options:{
		
	},
	initialize:function(container,options){
		this.parent(container,options);
		
		new TPH.Mirror(this.container);
		this.form.getElements('.dateselect').each(function(del){
			var opts = {
				type:'dropdown',
				presets:{
					yearFrom:new Date().decrement('year',100).format('%Y').toInt(),
					yearTo:new Date().format('%Y').toInt()
				}
			};
			new SPDateSelect(del,opts);
		}.bind(this));
	},
	destroy:function(){
		if ($defined(this.$companySearcher)) {
			this.$companySearcher.destroy();
		}
		this.parent();
	},
	buildSaveData:function(params){
		return $merge(params,{
			filter:{
				includeCompanyContacts:1,
				mid:TPH.$member.id	
			}
		});
	},
	setValue:function(key,value){
		var field = this.form.elements[key];
		if ($defined(field)) {
			field.set('value',value).fireEvent('input');
		}
		return this;
	},
	setData:function(data){
		var dataFormMap = {
			name:'company[name]',
			building:'company[building]',
			street:'company[street]',
			city:'company[city]',
			zipcode:'company[zipcode]',
			state:'company[state]',
			country:'company[country]',
			mobile:'company[mobile]',
			phone:'company[phone]',
			fax:'company[fax]',
			email:'company[email]',
			website:'company[website]'
		};
		['id','aid','did'].each(function(field){
			this.setValue(field,data[field]);
		}.bind(this));
		['name','building','street','city','zipcode','state','country','mobile','fax','phone','email','website'].each(function(field){
			var formField = $pick(dataFormMap[field],field);
			this.setValue(formField,$pick(data[field],''));
		}.bind(this));
		var contact = this.getCompanyContact(TPH.$member.id,data.contacts);
		['mid','firstname','lastname'].each(function(field){
			this.setValue('contact['+field+']',contact[field]);
		}.bind(this));
		['contact_id','mobile','phone','fax','email','position'].each(function(field){
			this.setValue('companycontact['+field+']',contact[field]);
		}.bind(this));
		this.setValue('company[id]',data.did)
            .setValue('company[aid]',data.aid)
			
			.setValue('contact[aid]',data.aid)
			.setValue('contact[id]',contact.contact_id)
			
			.setValue('companycontact[id]',contact.id)
			.setValue('companycontact[company_id]',contact.company_id || data.did)
			.setValue('companycontact[contact_id]',contact.contact_id)
			
			;
		var photo = this.form.getElement('.contactPhoto');
		if ($defined(photo)) {
			photo.setStyle('background-image','url('+contact.photo+')');	
		}
	},
	getCompanyContact:function(mid,items){
		var item = null;
		if ($defined(items)) {
			var count = items.length;
			for(var i=0;i<count;i++){
				item = items[i];
				if (item.mid==mid){
					break;
				}
			}	
		}
		if (!$defined(item)) {
			var member = TPH.$member;
			item = {
				mid:member.id,
				mobile:member.mobile,
				fax:member.fax,
				phone:member.phone,
				email:member.email,
				firstname:member.firstname,
				lastname:member.lastname,
				photo:member.photos_medium
			};
		}
		return item;
	},
	close:function(){
		this.fireEvent('onClose',[this]);
	}
});

Shop.Forms.Customer = new Class({
	Extends:Shop.Forms.DirectoryEntity,
	options:{
		request:{
			controller:'customers'
		}
	}
});

Shop.Forms.Supplier = new Class({
	Extends:Shop.Forms.DirectoryEntity,
	options:{
		request:{
			controller:'suppliers'
		}
	}
});

Shop.Forms.DataCodeEditor = new Class({
	Extends:Shop.Forms.Basic,
	options:{
		request:{
			controller:'datacodes'
		}
	}
});

Shop.Platform.Devices = new Class({
	Extends:Shop.Forms.Basic,
	Implements:[TPH.Implementors.Templates],
	options:{
		classes:{
			ip:'ipAddress'
		}
	},
	devices:{
		printer:'Printer'
	},
	initialize:function(container,options){
		this.parent(container,options);
		this.$ip = this.options.data.ip;
		
		this.containers = new TPH.ContentContainer(this.container,{
			onCreate:function(containerName,el){
				switch(containerName){
					case 'printer':
						this.createTemplate('printer',el.getElement('.printerList'));
						this.getTemplate('printer').template = this.options.templates.printerList;
						break;
				}
				
				el.getElements('.dateselect').each(function(del){
					var opts = {
						type:'dropdown',
						presets:{
							yearFrom:new Date().decrement('year',100).format('%Y').toInt(),
                            yearTo:new Date().format('%Y').toInt()
						}
					};
					new SPDateSelect(del,opts);
				}.bind(this));
			}.bind(this),
			onSelect:function(container){
				$fullHeight(this.container);
			}.bind(this)
		});
        this.navigation = new TPH.ContentNavigation(this.container,{
			onSelect:function(el){
				this.containers.select(el.get('rel'));
			}.bind(this)
		});
		this.navigation.select(this.navigation.items[0]);		
		$fullHeight(this.container);
		
        var storage = TPH.localStorage.getInstance('devices');
		this.listDevices('printer');
	},
	saveRoutine:function(data){
		console.log(data);
	},
	createDevice:function(device){
		this.deviceForm(device);
	},
    listDevices:function(device){
		var storage = TPH.localStorage.getInstance('devices');
        this.clearTemplate(device);
		var items = storage.get(device);
		if ($defined(items)) {
			for(id in items){
				var item = items[id];
				this.applyTemplate(device,item,function(el,template,item){
					this.scanActions(el);
				}.bind(this));
			}	
		}
	},
	getDevice:function(device,id){
		var storage = TPH.localStorage.getInstance('devices');
		var items = storage.get(device);
		if ($defined(items)) {
			return items[id];
		}
	},
	deleteDevice:function(device,id){
		var storage = TPH.localStorage.getInstance('devices');
		var items = storage.get(device);
		if ($defined(items)) {
			if ($defined(items[id])){
				delete items[id];
				storage.set(device,items);
				this.listDevices(device);
			}
		}
	},
	editDevice:function(device,id){
		var driver = this.getDevice(device,id);
		if ($defined(driver)) {
			this.deviceForm(device,driver);
		}
	},
	deviceForm:function(device,data){
		TPH.getWindow('__DeviceForm__',{
			caption:this.devices[device]+' Device',
			size:{
				width:400,
				height:'auto'
			}
		}).open(function(win){
			new Shop.Platform.Devices[device.ucfirst()](win.content,{
				template:this.options.templates.printerForm,
				data:$pick(data,{}),
				onSave:function(driver){
                    var storage = TPH.localStorage.getInstance('devices');
					if (!storage.has(device)) {
						storage.set(device,{});
					}
					var drivers = storage.get(device);
					drivers[driver.id] = driver;
					storage.set(device,drivers);
					this.listDevices(device);
					win.close();
				}.bind(this),
				onCancel:function(){
					win.close();
				}
			});
			win.toTop().toCenter(true);
		}.bind(this),true);
	},
	test:function(device,id){
		console.log(device,id);
		var driver = this.getDevice(device,id);
		console.log(driver);
		if ($defined(driver)) {
			TPH.getDriver(driver,{
				onConnectFailure:function(data){
					console.log(data);
					TPH.alert('System Message','Unable to connect to printer.');
				}.bind(this),
				onPrintError:function(retcode){
					console.log(retcode);
				}.bind(this),
				onReceive:function(res){
					console.log(res);
					TPH.alert('System Message','Successfully sent message to printer');
				}.bind(this)
			},function(instance){
				console.log('Driver Instance Loaded',driver);
				instance.test();
			}.bind(this));
		}
	}
});

Shop.Platform.Devices.Printer = new Class({
	Extends:Shop.Forms.Basic,
	options:{
		
	},
	initialize:function(container,options){
		this.addEvents({
			onBuildContent:function(instance){
				this.$model = this.form.elements['model'];
				this.$driver = instance.form.elements['driver'];
				if ($defined(this.$driver)) {
					new Element('option',{value:''}).set('html','Select Driver').inject(this.$driver);
					for(id in TPH.Drivers.printer){
						var driver = TPH.Drivers.printer[id];
						new Element('option',{value:id}).set('html',driver.name).inject(this.$driver);
					}
					this.$driver.set('value',this.$driver.get('data-value'));
					this.$driver.addEvent('change',function(){
						this.loadDriverModels();
					}.bind(this));
					this.loadDriverModels();
				}	
			}.bind(this)
		});
		this.parent(container,options);
		
	},
	loadDriverModels:function(){
		var driver = this.$driver.get('value');
		this.$model.empty();
		if (driver.length) {
			TPH.getDriver({
				device:'printer',
				driver:driver
			},{},function(instance){
				if ($defined(instance.models)) {
					for(id in instance.models) {
                        new Element('option',{value:id}).set('html',instance.models[id].name).inject(this.$model);
					}
				}
			}.bind(this));	
		} else {
			this.$model.adopt(new Element('option',{value:''}).set('html','- No Driver Selected -'));
		}
	},
	saveRoutine:function(data){
		if (!$defined(data.id)) {
            data.id = TPH.MD5([data.name,data.driver,data.ip,data.port].join('.'));    
		}
		this.fireEvent('onSave',[data,this]);
	},
	cancel:function(){
		this.fireEvent('onCancel',[this]);
	}
});

Shop.Tools = {
	PreferredBranch:Shop.Implementors.PreferredBranch,
	BrancheRequest:new Class({
		Implements:[TPH.Implementors.ActiveRequest],
		requestBranch:function(bid,onLoad,onFailure){
			if (!$defined(Shop.Tools.BrancheRequest.$branches)) {
				Shop.Tools.BrancheRequest.$branches = {};
			}
			if (!$defined(Shop.Tools.BrancheRequest.$branches[bid])) {
				this.activeRequest('branch',{
					option:'com_shop',
					controller:'account.branches',
					task:'load',
					load:'item',
					id:bid,
					format:'json'
				},{
					onComplete:function(data){
						Shop.Tools.BrancheRequest.$branches[bid] = data;
						if ($type(onLoad)=='function') {
							onLoad(Shop.Tools.BrancheRequest.$branches[bid]);
						}
					}.bind(this),
					onFailure:onFailure
				});	
			} else {
				if ($type(onLoad)=='function') {
					onLoad(Shop.Tools.BrancheRequest.$branches[bid]);
				}
			}
		}
	}),
	MemberInvite:new Class({
		Implements:[
			Events,
			Options,
			TPH.Implementors.ServerRequest,
			TPH.Implementors.Templates
		],
		options:{
			request:{
				option:'com_shop',
				format:'json'
			}	
		},
		initialize:function(container,options){
			this.setOptions(options);
			this.form = new Element('form')
							.inject(container.empty())
							.set('html',this.options.templates.content);
			this.form.addEvent('submit',function(e){
				e.stop();
				return false;
			});
			
            this.form.getElement('input[name="email"]').addEvent('keypress',function(e){
				if (e.key=='enter') {
					this.checkEmail();
				}
			}.bind(this));
			
            this.containers = new TPH.ContentContainer(this.form,{
				onCreate:function(container,el){
					switch(container){
						case 'member.old':
							this.createTemplate('member',el.getElement('.content'))
								.dynamicTemplate('member',false)
								;
							break;
					}
				}.bind(this),
				onSelect:function(container,instance){
					var input = instance.getContainer(container).getElement('input');
					if ($defined(input)) {
						input.focus();
					}
				}.bind(this)
			});
			this.containers.select('email.entry');
			this.scanActions(this.form);
			
			new TPH.Mirror(this.form);
		},
		scanActions:function(container){
			container.getElements('.appAction').each(function(el){
				if ($defined(this[el.get('rel')])) {
					el.addEvent('click',function(e){
						this[el.get('rel')]();
					}.bind(this));
					el.removeClass('appAction');	
				}
			}.bind(this));
			return this;
		},
		exit:function(){
			this.fireEvent('onExit',[this]);
		},
		checkEmail:function(){
			var data = this.form.toQueryString().parseQueryString();
			if (!data.email.isEmail()) {
				TPH.alert('System Message','Invalid Email Address. Please try again.',function(){
					var el = document.id(this.form.elements['email']);
					el.getParent().flash('#f99','#fff',3,'background-color',100);
					el.focus();
					window.fireEvent('onInputError');
				}.bind(this));
				return;
			}
			this.fireEvent('onBeforeCheck',[data,this]);
			this.serverRequest($merge(this.options.request,{
				controller:'members',
				task:'load',
				load:'email',
				email:data.email
			}),{
				onComplete:function(result){
					this.containers.select(result.status?'member.old':'member.new');
					if (result.status) {
                        this.clearTemplate('member').updateTemplate('member');
						this.applyTemplate('member',result.data).renderTemplate('member');
					}
					this.fireEvent('onCheck',[result,this]);
				}.bind(this),
				onFailure:function(){
					this.fireEvent('onCheckFailure',[this]);
				}.bind(this)
			});
		},
		sendInvite:function(){
			var raw = this.form.toQueryString().parseQueryString();
			
			var data = {
				aid:this.options.account.id,
				title:'Your invitation to join '+this.options.account.name
			};
			
			switch(this.containers.currentContainer){
				case 'member.old':
					$extend(data,raw.old);
					break;
				case 'member.new':
					$extend(data,raw.new);
					break;
			}
			
			if ($defined(data.manage)) {
				if ($type(data.manage)=='string') {
					data.manage = [data.manage];
				}
			}
			this.fireEvent('onBeforeInvite',[data,this]);
			this.serverRequest($merge(this.options.request,{
				controller:'account.invitations',
				task:'save',
				data:data
			}),{
				onComplete:function(result){
					if (result.status){
						this.fireEvent('onInvite',[result.data,this]); 
					} else {
						TPH.alert('System Message',result.message);
						this.fireEvent('onInviteFailure',[result,this]);	
					}
				}.bind(this),
				onFailure:function(){
					this.fireEvent('onInviteFailure',[{status:false,code:'network'},this]);
				}.bind(this)
			});
		}
	}),
	InputSearch:new Class({
		Implements:[
			Events,Options,
			TPH.Implementors.Templates,
			TPH.Implementors.ServerRequest
		],
		options:{
			caption:'Search Results',
			request:{
				option:'com_shop',
				task:'load',
				load:'items',
				format:'json'
			}
		},
		initialize:function(input,options){
			this.$input = input;
			this.$input.addEvents({
				input:function(){
					this.search.debounce(this);
				}.bind(this),
				keyup:function(e){
					switch(e.key){
						case 'esc':
							this.$input.set('value','');
							this.search();
							break;
					}
				}.bind(this)
			});
			this.setOptions(options);
			this.$container = this.options.container;
			this.createTemplate('list',this.options.list);
			this.getTemplate('list').template = this.options.template;
			
			this.$caption = this.$container.getElement('.search.caption');
			this.setCaption(this.options.caption);
		},
		destroy:function(){
			this.clearTemplates();
		},
		setCaption:function(caption){
			if ($defined(this.$caption)){
				this.$caption.set('html',caption);
			}
			return this;
		},
		search:function(){
			this.clearTemplate('list');
			var value = this.$input.get('value');
			
			if (value.length) {
				this.show();
				var template = this.getTemplate('list');
				template.parent.addClass('loading');
				this.serverRequest($merge(this.options.request,{
					filter:{
						aid:Shop.instance.account.id,
						term:value	
					}
				}),{
					onComplete:function(result){
						this.fireEvent('onSearch',[result,this]);
						template.parent.removeClass('loading');
						if (result.count) {
							result.items.each(function(item){
								this.applyTemplate('list',item,function(el,template,item){
									this.fireEvent('onRenderSearchItem',[el,item,this]);
									this.scanSelectAction(el,item,function(item,el){
										this.fireEvent('onSelectItem',[item,el]);
									}.bind(this));
								}.bind(this));
							}.bind(this));	
						} else {
							this.hide();
						}
						this.renderTemplate('list');
					}.bind(this),
					onFailure:function(){
						template.parent.removeClass('loading');
					}.bind(this)
				});	
			} else {
				this.hide();
			}
			
		},
		scanSelectAction:function(el,item,onSelect){
			el.getElements('.selectAction').each(function(el){
				el.addEvent('click',function(){
					if ($type(onSelect)=='function') {
						onSelect(item,el);
					}
				}.bind(this));
			}.bind(this));
		},
		show:function(){
			this.$container.addClass('visible');
			$fullHeight(this.$container.getParent());
			this.fireEvent('onShow',[this]);
		},
		hide:function(){
			this.$container.removeClass('visible');
			this.fireEvent('onHide',[this]);
		}
	})
};

Shop.Tools.InputSearch.Customers = new Class({
	Extends:Shop.Tools.InputSearch,
	options:{
		caption:'Search for Existing Records',
		request:{
			controller:'customers'
		}
	}
});

Shop.Tools.ListItems = new Class({
	Implements:[Events,Options,TPH.Implementors.TemplateData],
	options:{
		key:'id',
		itemTag:'li'
	},
	initialize:function(el,container,options){
		this.$el = el;
		this.$container = container;
		this.setOptions(options);
		this.$items = new Hash();
	},
	destroy:function(){
		this.clear();
	},
	addItem:function(data){
		var key = data[this.options.key];
		var el = new Element(this.options.itemTag).inject(this.$container);
		this.applyTemplateData(el,this.options.templates.item,data);
		var removeItem = el.getElement('.removeItem');
		if ($defined(removeItem)) {
			removeItem.addEvent('click',function(){
				this.removeItem(key);
			}.bind(this));
		}
		this.$items.set(key,{
			el:el,
			data:data
		});
		
		this.fireEvent('onAdd',[el,key,data,this]);
		this.update();
		return this;
	},
	removeItem:function(key){
		if (this.$items.has(key)) {
			this.$items.get(key).el.destroy();
			this.$items.erase(key);
			this.fireEvent('onRemove',[key,this]);
			this.update();
		}
		return this;
	},
	clear:function(){
		this.$items.each(function(item){
			item.el.destroy();
		});
		this.$items.empty();
		this.update();
		this.fireEvent('onClear',[this]);
		return this;
	},
	update:function(){
		this.$el.set('value',this.$items.getKeys().join(','));
		this.fireEvent('onUpdate',[this]);
		return this;;
	}
});

Shop.Tools.Rating = new Class({
	Implements:[Events,Options],
	options:{
		term:'Rating',
		min:1,
		max:5
	},
	initialize:function(container,input,options){
		this.container = document.id(container);
		this.input = input;
		
		this.setOptions(options);
		
		this.render();
	},
	render:function(){
		this.container.empty();
		
		var select = new Element('select').inject(container);
		new Element('option',{value:''}).set('html','-').inject(select);
		for(var i=this.options.min;i<=this.options.max;i++) {
			var opt = new Element('option',{value:i}).set('html',i+' '+this.options.term).inject(select);
		}
		select.set('value',this.getRating());
		select.addEvent('change',function(){
			this.setRating(select.get(value));
		}.bind(this));
		return this;
	},
	setRating:function(rating){
		this.input.set('value',rating);
		return this;
	},
	getRating:function(){
		return this.input.get('value');
	}
});

Shop.Tools.Rating.Star = new Class({
	Extends:Shop.Tools.Rating,
	options:{
		term:'Star'
	},
	render:function(){
		this.container.empty();
		for(var i=this.options.min;i<=this.options.max;i++) {
			var el = new Element('i',{'class':'fa fa-star',rel:i}).inject(this.container);
			el.addEvent('click',function(e){
				this.setRating(e.target.get('rel'));
			}.bind(this));
		}
		this.setRating(this.getRating());
	},
	setRating:function(rating){
		var r = $type(rating)=='number'?rating:rating.toInt();
		this.container.getElements('i.fa').each(function(el){
			var val = el.get('rel').toInt();
			//console.log(val,3);
			if (val<=r) {
				el.removeClass('fa-star-o').addClass('fa-star');
			} else {
				el.removeClass('fa-star').addClass('fa-star-o');
			}
		}.bind(this));
		return this.parent(rating);
	}
});



Shop.Module = new Class({
	Implements:[
		Events,
		Options,
		TPH.Implementors.TemplateData
	],
	options:{},
	initialize:function(container,definition,options){
		this.$definition = definition;
		this.$container = container;
		this.setOptions(options);
	},
	editor:function(){
		this.applyTemplateData(this.$container,this.$definition.form,this.options.data);
		$fullHeight(this.$container.getParent());
		this.scanActions(this.$container);
		return this;
	},
	getData:function(){
		
	},
	scanActions:function(container){
		container.getElements('.moduleAction').each(function(el){
			if ($defined(this[el.get('rel')])) {
				el.addEvent('click',function(e){
					this[el.get('rel')]();
				}.bind(this));
				el.removeClass('moduleAction');	
			}
		}.bind(this));
		return this;
	},
	startSpin:function(){
		if ($type(this.options.startSpin)=='function') {
			this.options.startSpin();
		}
	},
	stopSpin:function(){
		if ($type(this.options.stopSpin)=='function') {
			this.options.stopSpin();
		}
	}
});

Shop.Module.Helper = new Class({
	loadModules:function(onLoad){
		if (!$defined(Shop.Module.Types)) {
			this.activeRequest('modules',$merge(this.options.request,{
				task:'load',
				load:'modules'
			}),{
				onComplete:function(result){
					Shop.Module.Types = result;
					if ($type(onLoad)=='function') {
						onLoad(Shop.Module.Types);
					}
				}.bind(this)
			});
		} else {
			if ($type(onLoad)=='function') {
				onLoad(Shop.Module.Types);
			}
		}
	},
	getModule:function(id){
		var count = Shop.Module.Types.length;
		for(var i=0;i<count;i++){
			if (Shop.Module.Types[i].id==id) {
				return Shop.Module.Types[i];
			}
		}
	},
});

Shop.Module.load = function(name,onLoad,onError){
	TPH.loadScript(Shop.Module.getAssetURL(name),onLoad,onError);
};
Shop.Module.getAssetURL = function(name){
	return '/components/com_shop/assets/js/modules/'+name+'.js';
};

Shop.Modules = {};


Shop.GPS = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.ServerRequest
	],
	options:{
		request:{
			option:'com_shop',
			controller:'gps',
			task:'updateList',
			format:'json'
		},
		recordDelay:30000,
		precision:5,
		distance:5,
		gps:{
			maximumAge:3000, 
			timeout:500,
			enableHighAccuracy:true
		}
		// https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
	},
	lastCoords:{
		latitude:null,
		longitude:null
	},
	initialize:function(options){
		this.setOptions(options);
		var storage = TPH.localStorage.getInstance('location');
		if (!$defined(TPH.$gps)) {
			if ($defined(TPH.$mid)) {
				if (!storage.has(TPH.$mid)) {
					storage.set(TPH.$mid,{});
				}
				TPH.$gps = storage.get(TPH.$mid);	
			} 
		}
		this.getPermission(function(permission){
			switch(permission.state) {
    			case 'granted':
    				this.start();
    				break;
    		}
		}.bind(this)); 		
		this.recordPositions();
	},
	getPermission:function(onPermission,onNoPermission){
		if ($defined(navigator.permissions)) {
			this.$permissions = true;
			navigator.permissions.query({name:'geolocation'})
				.then(function(permissionStatus) {
					console.log('geolocation permission state is ', permissionStatus.state);
					if ($type(onPermission)=='function') {
						onPermission(permissionStatus,this);
					}
		  		}.bind(this));	
		} else {
			console.log('GPS PERMISSION NOT AVAILABLE');
			if ($type(onNoPermission)=='function') {
				onPermission(this);
			}
		}		
		return this;
	},
	/*
	request:function(options){
		var options = $pick(options,{});
		console.log('Requesting Location Service');
		console.log('GPS check permissions');
		if ($defined(navigator.permissions)) {
			this.$permissions = true;
			navigator.permissions.query({name:'geolocation'})
				.then(function(permissionStatus) {
		    		console.log('geolocation permission state is ', permissionStatus.state);
					switch(permissionStatus.state){
						case 'granted':
							if ($type(options.onGranted)=='function') {
								options.onGranted(permissionStatus,this);
							}
							break;
						case 'prompt':
							if ($type(options.onPrompt)=='function') {
								options.onPrompt(permissionStatus,this);
							}
							break;
						case 'denied':
							if ($type(options.onDenied)=='function') {
								options.onDenied(permissionStatus,this);
							}
							break;
					}
		    		permissionStatus.onchange = function() {
			      		console.log('geolocation permission state has changed to ', permissionStatus.state);
			      		
			      		switch(permissionStatus.state){
							case 'granted':
								if ($type(options.onGranted)=='function') {
									options.onGranted(permissionStatus,this);
								}
								break;
							case 'prompt':
								if ($type(options.onPrompt)=='function') {
									options.onPrompt(permissionStatus,this);
								}
								break;
							case 'denied':
								if ($type(options.onDenied)=='function') {
									options.onDenied(permissionStatus,this);
								}
								break;
						}
						
			      		//this.require(options);
			    	}.bind(this);
			    	
		  		}.bind(this));	
		}
	},
	*/
	/*
	require:function(options){
		var options = $pick(options,{});
		console.log('GPS check permissions');
		if ($defined(navigator.permissions)) {
			this.$permissions = true;
			navigator.permissions.query({name:'geolocation'})
				.then(function(permissionStatus) {
					switch(permissionStatus.state){
						case 'granted':
							if (!this.$watched){
								this.startMonitoring();
							}
							if ($type(options.onGranted)=='function') {
								options.onGranted(permissionStatus,this);
							}
							break;
						case 'prompt':
							if ($type(options.onPrompt)=='function') {
								options.onPrompt(permissionStatus,this);
							}
							break;
						case 'denied':
							if ($type(options.onDenied)=='function') {
								options.onDenied(permissionStatus,this);
							}
							break;
					}
		    		console.log('geolocation permission state is ', permissionStatus.state);
		
		    		permissionStatus.onchange = function() {
			      		console.log('geolocation permission state has changed to ', permissionStatus.state);
			      		this.require(options);
			    	}.bind(this);
		  		}.bind(this));	
		} else {
			console.log('GPS permissions api not available');
			this.getGPSPosition(function(position){
				this.handlePosition(position);
				this.watchGPSPosition(function(position){
					this.handlePosition(position);
				}.bind(this));
				if ($type(options.onGranted)=='function') {
					options.onGranted({state:'granted'},this);					
				}
				//this.require.delay(3000,this,[options]);
			}.bind(this),function(err,instance){
				if ($type(options.onDenied)=='function') {
					options.onDenied({state:'denied'},this);
				}
				//this.require.delay(3000,this,[options]);
			}.bind(this));	
			
		}
	},
	*/
	start:function(onStart,onFail){
		console.log('GPS Start Monitoring');
		if ($defined(navigator.geolocation)) {
			if ($defined(this.$watchId)) {
				console.log('GPS WATCH ACTIVE');	
			} else {
				TPH.$gpsError = null;
				this.$watchId = navigator.geolocation.watchPosition(function(position){
					if ($defined(position.coords.latitude) && $defined(position.coords.longitude)) {
						var coords = $merge(position.coords,{
							latitude:position.coords.latitude.round(this.options.precision),
							longitude:position.coords.longitude.round(this.options.precision)
						});
						this.setCurrentPosition.debounce(this,500,[coords]);	
					}
					if ($type(onStart)=='function') {
						onStart();
					} else {
						this.fireEvent('onPosition',[position,this]);
					}
				}.bind(this),function(err){
					TPH.$gpsError = err;
					//console.log('GPS watchPosition Error : '+TPH.$gpsError.code+', '+TPH.$gpsError.message);
					
					if ($type(onFail)=='function') {
						onFail();
					} else {
						this.fireEvent('onError',[err,this]);
					}
				}.bind(this),this.options.gps);
				console.log('GPS WATCH STARTED WITH ID ',this.$watchId);
			}
		} else {
			console.log('Geolocation Service Not Available');
			/*
			if (!$defined(TPH.$gps)) {
				this.getGPSPosition(function(position){
					this.handlePosition(position);
					this.watchGPSPosition(function(position){
						this.handlePosition.debounce(this,500,[position]);
					}.bind(this));
				}.bind(this));
			} else {
				this.watchGPSPosition(function(position){
					this.handlePosition.debounce(this,500,[position]);	
				}.bind(this));
			}
			*/
		}
		return this;
	},
	stop:function(){
		if ($defined(this.$watchId)) {
			console.log('GPS WATCH STOPPED');
			navigator.geolocation.clearWatch(this.$watchId);
			this.$watchId = null;
		}
		return this;
	},
	restart:function(onStart,onFail){
		return this.stop().start(onStart,onFail);
	},
	check:function(onCheck,onError){
		if ($defined(navigator.geolocation.getCurrentPosition)) {
			TPH.$gpsError = null;
			navigator.geolocation.getCurrentPosition(function(position) {
				//this.$permitted = true;
				if ($type(onCheck)=='function') {
					onCheck(position,this);
				}
			}.bind(this),function(err){
				TPH.$gpsError = err;
				
				//this.$permitted = false;
				//this.$watched = false;
				//console.log('GPS getCurrentPosition Error : '+TPH.$gpsError.code+', '+TPH.$gpsError.message);
				
				if ($type(onError)=='function') {
					onError(TPH.$gpsError,this);
				}
			}.bind(this),this.options.gps);
		} else {
			TPH.$gpsError = {
				code:-1,
				message:'No GPS available on device.'
			}; 
			if ($type(onError)=='function') {
				onError(TPH.$gpsError,this);
			}
		}
	},
	/*
	getGPSPosition:function(onPosition,onError){
		console.log('GPS getCurrentPosition');
		if ($defined(navigator.geolocation.getCurrentPosition)) {
			navigator.geolocation.getCurrentPosition(function(position) {
				//this.$permitted = true;
				if ($type(onPosition)=='function') {
					onPosition(position);
				}
			}.bind(this),function(err){
				TPH.$gpsError = err;
				
				//this.$permitted = false;
				//this.$watched = false;
				//console.log('GPS getCurrentPosition Error : '+TPH.$gpsError.code+', '+TPH.$gpsError.message);
				
				if ($type(onError)=='function') {
					onError(TPH.$gpsError,this);
				}
				this.fireEvent('onError',[err,this]);
			}.bind(this),this.options.gps);
		} else {
			TPH.$gpsError = {
				code:-1,
				message:'No GPS available on device.'
			}; 
			if ($type(onError)=='function') {
				onError(TPH.$gpsError,this);
			}
			console.log('GPS getCurrentPosition not available');
		}
	},
	watchGPSPosition:function(onPosition){
		if (this.$watched) {
			console.log('GPS already watched.');
			return;
		}
		console.log('GPS watchPosition');
		if ($defined(navigator.geolocation.watchPosition)) {
			this.$watched = true;
			navigator.geolocation.watchPosition(function(position){
				if ($type(onPosition)=='function') {
					onPosition(position);
				}
			}.bind(this),function(err){
				TPH.$gpsError = err;
				this.$permitted = false;
				this.$watched = false;
				console.log('GPS watchPosition Error : '+TPH.$gpsError.code+', '+TPH.$gpsError.message);
				this.fireEvent('onError',[err,this]);
			}.bind(this),this.options.gps);	
		} else {
			console.log('GPS watchPosition not available');
		}
	},
	*/
	getError:function(){
		return TPH.$gpsError;
	},
	/*
	handlePosition:function(position){		
		//console.log('GPS Watched : '+position.coords.latitude+', '+position.coords.longitude);
		if ($defined(position.coords.latitude) && $defined(position.coords.longitude)) {
			var coords = $merge(position.coords,{
				latitude:position.coords.latitude.round(this.options.precision),
				longitude:position.coords.longitude.round(this.options.precision)
			});
			this.setCurrentPosition.debounce(this,500,[coords]);	
		}
	},
	*/
	setCurrentPosition:function(coords){
		//console.log(arguments);
		//console.log('GPS Set Current: '+[coords.latitude,coords.longitude].join(', '));
		if ($defined(TPH.$mid)) {
			var mid = TPH.$mid.toInt();
			if (mid) {
				var storage = TPH.localStorage.getInstance('location');
				var lastCoords = storage.get(TPH.$mid);
				var canStore = true;	
				//console.log('GPS Updated: '+[coords.latitude,coords.longitude,distance].join(', '));
				//console.log(lastCoords,coords);
				if ($defined(lastCoords)) {
					if ($defined(lastCoords.latitude) && $defined(lastCoords.longitude)) {
						canStore = false;
						if ((lastCoords.latitude!=coords.latitude) || 
							(lastCoords.longitude!=coords.longitude)) {
							var distance = this.getDistance(lastCoords,coords).abs().round(2);
							console.log('GPS Changed by '+distance+' Meters');
							canStore = distance>this.options.distance;
						}	
					}	
				}
				
				if (canStore) {
					console.log('GPS Updated: '+[coords.latitude,coords.longitude].join(', '));
					TPH.$gps = $merge(coords,{
						aid:this.options.account.id,
						mid:mid,
						ip:TPH.$ip,
						timestamp:TPH.getDate().format('db'),
						session_id:TPH.$session
					});
					storage.set(TPH.$mid,TPH.$gps);
					this.storePosition(TPH.$gps);
					this.fireEvent('onChange',[coords,this]);
					
					var notifier = Shop.instance.getNotifier();
					if ($defined(notifier)) {
						notifier.publish('Members-locations',TPH.$gps);	
					}
					TPH.$gpsError = null;
					delete TPH.$gpsError;
				}
			}	
		}
	},
	getCurrentPosition:function(){
		return TPH.$gps;
	},
	getStorage:function(){
		var storage = TPH.localStorage.getInstance('gps');
		if (!storage.has(TPH.$mid)) {
			storage.set(TPH.$mid,new Array());
		}
		return storage.get(TPH.$mid);
	},
	storeData:function(data){
		var storage = TPH.localStorage.getInstance('gps');
		storage.set(TPH.$mid,data);
	},
	storePosition:function(position,bottom){
		var positions = this.getStorage();
		var bottom = $pick(bottom,true);
		if (bottom) {
			positions.push(position);	
		} else {
			positions.unshift(position);
		}
		this.storeData(positions);		
	},
	recordPositions:function(){
		if ($defined(this.$recordPosition)) {
			clearTimeout(this.$recordPosition);
		}
		
		var positions = this.getStorage();
		if (!positions.length) {
			this.recordPositions.delay(this.options.recordDelay,this);
		} else {
			var fields = 'id,aid,mid,ip,accuracy,altitude,altitudeAccuracy,heading,latitude,longitude,speed,timestamp,date_created,session_id';
			var tpositions = positions.clone();
			positions.empty();
			this.storeData(positions);
			this.serverRequest($merge(this.options.request,{
				fields:fields,
				data:Json.encode(tpositions)
			}),{
				notices:{
					noConnection:false
				},
				onComplete:function(result){
					this.$recordPosition = this.recordPositions.delay(this.options.recordDelay,this);
					this.storeData(positions);
				}.bind(this),
				onFailure:function(){
					tpositions.each(function(position){
						this.storePosition(position,false);
					}.bind(this));
					this.$recordPosition = this.recordPositions.delay(this.options.recordDelay,this);
				}.bind(this)
			});
		}
	},
	getDistance:function (latlng1, latlng2) {
		// console.log(latlng1,latlng2);
		// Mean Earth Radius, as recommended for use by
		// the International Union of Geodesy and Geophysics,
		// see http://rosettacode.org/wiki/Haversine_formula
		var R = 6371000;
		var rad = Math.PI / 180,
		    lat1 = latlng1.latitude * rad,
		    lat2 = latlng2.latitude * rad,
		    sinDLat = Math.sin((latlng2.latitude - latlng1.latitude) * rad / 2),
		    sinDLon = Math.sin((latlng2.longitude - latlng1.longitude) * rad / 2),
		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}
});

Shop.GPS.Position = new Class({
	initialize:function(lat,lng){
		this.lat = lat;
		this.lng = lng;
	},
	distanceTo:function(position){
		var R = 6371000;
		var rad = Math.PI / 180,
		    lat1 = this.lat * rad,
		    lat2 = position.lat * rad,
		    sinDLat = Math.sin((position.lat - this.lat) * rad / 2),
		    sinDLon = Math.sin((position.lng - this.lng) * rad / 2),
		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}
});

Shop.GPS.getInstance = function(options){
	if (!$defined(Shop.GPS.$instance)) {
		Shop.GPS.$instance = new Shop.GPS(options);
		Shop.GPS.$instance.addEvents({
			onChange:function(){
				window.fireEvent('onChangeLocation',[TPH.$gps]);
			}.bind(this)
		});
	}
	return Shop.GPS.$instance;
};
Shop.GPS.Require = function(permission){
	console.log('GPS Require ',Json.encode(permission));
	switch(permission.state){
		case 'denied':
		case 'prompt':
			TPH.getWindow('__ShopGPSPrompt__',{
				caption:'System Message',
				windowClass:'tphWindow full requireGPS',
				size:{
					width:400,
					height:'auto'
				},
				onClose:function(win){
					win.content.empty();	
				},
				closable:false
			}).open(function(win){
				win.setContent('<div>Please enable location service of your device.</div>');
				win.toTop().toCenter(true);
			},true);
			break;
		case 'granted':
			if (TPH.hasWindow('__ShopGPSPrompt__')) {
				var win = TPH.getWindow('__ShopGPSPrompt__');
				win.close();	
			}
			break;
	}
};

Shop.Voices = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(options){
		this.setOptions(options);
		this.$status = !$defined(window.cordova);
		this.$canSpeak = this.$status;
		this.ifEnabled(function(){
			if ($defined(window.speechSynthesis.addEventListener)) {
				window.speechSynthesis.addEventListener('voiceschanged',function(){
					console.log('Voices : Voices changed!');
					this.$voices = window.speechSynthesis.getVoices();
			    	console.log('Voices : Loaded '+this.$voices.length+' voices.');
			   	}.bind(this));	
			} else if ($type(window.speechSynthesis.getVoices)=='function'){
				this.$voices = window.speechSynthesis.getVoices();	
				//console.log(this.$voices);
				console.log('Voices : Loaded '+this.getVoices().length+' voices.');
			}
		}.bind(this));
	},
	ifEnabled:function(routine,routineIfNot){
		if ($defined(window.speechSynthesis)) {
			if ($type(routine)=='function') {
				return routine();
			}
		}
		if ($type(routineIfNot)=='function') {
			return routineIfNot();
		}
	},
	status:function(status){
		if ($defined(status)) {
			if (this.$canSpeak!=status) {
				if ($defined(this.$voices)) {
					if (status) {
						this.ifEnabled(function(){
							if ($defined(navigator.notification) && !this.$canSpeak) {
								navigator.notification.confirm('Your app is requesting permission to speak.',function(button){
									switch(button){
										case 1:
											this.$canSpeak = true;
											this.say('Thank you!');
											
											break;
									}
								}.bind(this),'System Message',['Allow','Deny']);	
							}
						}.bind(this));	
					} else {
						this.$canSpeak = false;
					}
				} else {
					this.status.delay(500,this,[status]);
				}
			}	
		}
		
		return this.$canSpeak;			
	},
	getVoices:function(){
		return $pick(this.$voices,[]);
	},
	getVoice:function(uri){
		var items = this.getVoices();
		var count = items.length;
		for(var i=0;i<count;i++) {
			if (items[i].voiceURI==uri) {
				return items[i]; 
			}
		}
	},
	say:function(text,voiceUri,onEnd,onFail){
		//console.log(text,voiceUri);
		if (!this.$canSpeak) return;
		this._text = $pick(text,'');
		this._voiceUri = $pick(voiceUri,'');
		
		this.ifEnabled(function(){
			//console.log(this._text,this._voiceUri);
			if (this._text.length) {
				this.fireEvent('onBeforeSay',[this._text,this]);
				var utterance = new SpeechSynthesisUtterance(this._text);
				if (this._voiceUri.length) {
					var voiceData = this.getVoice(this._voiceUri);
					if ($defined(voiceData)) {
						utterance.voice = voiceData;	
					}	
				} 
				utterance.onend = function(){
					this.fireEvent('onAfterSay',[this]);
					if ($type(onEnd)=='function') {
						onEnd(this);	
					}
				}.bind(this);
		      	speechSynthesis.speak(utterance);
			} else {
				if ($type(onFail)=='function') {
					onFail();
				}
			}
		}.bind(this),onFail);
	}
});

Shop.Voices.getInstance = function(options){
	if (!$defined(Shop.Voices.$instance)) {
		Shop.Voices.$instance = new Shop.Voices(options);
	}
	return Shop.Voices.$instance;
};

Shop.Realtime = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(channelName,options){
		this.channelName = channelName;
		this.setOptions(options);
		this.prepare(this.subscribe.bind(this));
	},
	prepare:function(){
		
	},
	subscribe:function(){
		
	},
	publish:function(message){
		
	}
});

Shop.Realtime.Ably = new Class({
	Extends:Shop.Realtime,
	prepare:function(onPrep){
		new Asset.javascript('https://cdn.ably.io/lib/ably.min-1.js',{
			onload:function(){
				if (!$defined(Shop.Realtime.Ably.$instances)) {
					Shop.Realtime.Ably.$instances = new Hash(); 
				}
				if (!Shop.Realtime.Ably.$instances.has(this.options.apiKey)) {
					Shop.Realtime.Ably.$instances.set(this.options.apiKey,new Ably.Realtime(this.options.apiKey));
				}
				this.$index = new Array();
				this.$realtime = Shop.Realtime.Ably.$instances.get(this.options.apiKey);
				this.$channel = this.$realtime.channels.get(this.channelName);
				if ($type(onPrep)) {
					onPrep();
				}
				this.fireEvent('onReady',[this]);
			}.bind(this),
			onerror:function(){
				console.error('Unable to load notifier library: Ably');
			}.bind(this)
		});
		//console.log(this.$channel);
	},
	subscribe:function(){
		this.$channel.subscribe(function(msg) {
			var data = msg.data,
				name = msg.name;
				//console.log(msg);
			if ($defined(data)) {
				switch(msg.clientId){
					case 'server':
						//name = name.base64_decode();
						//data = String.fromCharCode.apply(null, new Uint16Array(data)).base64_decode();
						break;
					default:	
						name = LZString.decompressFromUTF16(name);
						data = Json.decode(LZString.decompressFromUTF16(data));
						break;
				}
				
				$extend(msg,{
					name:name,
					data:data.message,
					senderId:data.senderId,
					self:this.$index.contains(data.hash)
				});
				//console.log('Realtime Message from '+data.senderId);
				//if (!this.$index.contains(data.hash)) {
					console.log('onReceiveMessage',msg);
					this.fireEvent('onReceiveMessage',[msg,this]);	
				//}	
			} else {
				console.log('Unable to get message data',msg);
			} 
		}.bind(this));
	},
	publish:function(action,message){
		if ($defined(this.$channel)) {
			var hash = TPH.MD5([this.options.senderId,new Date().format('db')].join('.'));
			var data = Json.encode({
				senderId:this.options.senderId,
				message:message,
				hash:hash
			});
			this.$index.push(hash);
			this.$channel.publish(LZString.compressToUTF16(action),LZString.compressToUTF16(data));	
		}
	}
});

window.addEvents({
	buildAjax:function(options){
			
	}
});
