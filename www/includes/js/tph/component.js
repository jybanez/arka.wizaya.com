TPH.Component = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.Templates,
		TPH.Implementors.ListFilters,
		TPH.Implementors.ServerRequest
	],
	options:{
		viewKey:'id',
		item:'item',
		controller:'',
		tasks:{
			save:'save',
			'delete':'delete',
			load:'load'
		},
		load:'items',
		templates:{
			list:'',
			details:'',
			form:''
		},
		templateDynamics:{
			list:true,
			details:false,
			form:false
		},
		limitstart:0,
		addPosition:'bottom',
		sorted:false,
		sortKey:'name',
		autoDetails:true,
		live:false,
		liveDelay:10000,
		listItemFunction:null,
		formatForView:function(data){
			return data;
		},
		$default:{},
		canAutoSave:true,
		viewForceLoad:false
	},
	initialize:function(app,options){
		this.app = app;
		this.setOptions(options);
		this.$items = new Array();
		this.$itemsLoaded = false;
		this.$mode = 'list';
        
        if ($defined(TPH.localStorage) && $defined(this.options.autoSave)) {
        	var storageName = ['autosave',this.options.autoSave].join('.');
        	this.$storage = TPH.localStorage.getInstance(storageName);
        	console.log('COMPONENT Storage loaded',storageName);
        }
        window.addEvent('unload',function(){
           if (this.options.live) {
               this.stopLiveUpdate();
           } 
        }.bind(this)); 
        this.fireEvent('onCreate',[this]);
	},
	destroy:function(){
		if (this.options.live){
			this.stopLiveUpdate();
			delete this.$liveUpdate;
			delete this.$liveUpdateRequest;
		}
		
		if ($defined(this.$request)) {
			this.stopServerRequest();
			delete this.$request;	
		}
		
		this.$items.empty();
		delete this.$currentData;
		
		if ($defined(this.$templates)) {
			for(templateName in this.$templates){
				var template = this.$templates[templateName];
				template.container.empty();
				template.items.empty();
                template.parent.empty();
			}
			delete this.$templates;	
		}		
	},
	getMode:function(){
		return this.$mode;
	},
	setContainerController:function(containers){
		this.containers = containers;
		return this;
	},
	addContainer:function(type,id,container,fullHeight){
		this.options.templates[type]=id;
		console.log('Add Container',type,id,this.options.templateDynamics[type]);
		this.createTemplate(id,container,fullHeight,$pick(this.options.templateDynamics[type],true));
        this.fireEvent('onAddContainer',[id,container,this]);
		return this;
	},
	filterUpdateFunction:function(){
		if ($type(this.options.filterUpdateFunction)=='function') {
			this.options.filterUpdateFunction(this);
		} else {
			this.$items.empty();
			this.$paginator = null;
			this.clearTemplate(this.options.templates.list).updateTemplate(this.options.templates.list);
			this.setOptions({limitstart:0}).load(true);	
		}
	},
	setListFilter:function(id,filter){
		this.createFilter(id,filter,function(){
			this.filterUpdateFunction();
		}.bind(this));
		this.fireEvent('onCreateFilter',[id,filter,this]);
		return this;
	},
    getItems:function(){
        return this.$items;    
    },
	setItems:function(items){
		this.$items = items;
		return this;
	},
	emptyItems:function(){
		this.$items.empty();
		this.$itemsLoaded = false;
		this.$paginator = null;
		this.setOptions({limitstart:0});
		this.clearTemplates();
		return this;
	},
	run:function(onLoad){
		this.fireEvent('onBeforeRun',[this]);
		this.$doListItems = false;
		if ($defined(this.containers)) {
			var container = this.containers.select(this.options.templates.list);
		}
			
		this.$doListItems = true;
		if (!this.$itemsLoaded) {
			this.$items.empty();
			var template = this.getTemplate(this.options.templates.list);
			if ($defined(template)) {
				this.clearTemplate(this.options.templates.list);
				this.updateTemplate(this.options.templates.list);
			}
			this.setOptions({limitstart:0}).load(true,onLoad);	
		} else {			
			this.$doListItems = true;
			this.list(true,onLoad);
		}			
		this.fireEvent('onRun',[this]);
		return this;
	},
	create:function(onLoad){
		this.$currentData = $pick(this.options.$default,null);
		this.edit(null,false,onLoad);
	},
	editCurrentData:function(){
		this.edit(this.$currentData[this.options.viewKey]);
	},
	getCurrentData:function(){
		return this.$currentData;
	},
	setCurrentData:function(data){
		this.$currentData = data;
		return this;
	},
	saveData:function(item,position){
		this.fireEvent('onBeforeSaveData',[item,this]);
		if (!this.hasData(item[this.options.viewKey])) {
			this.addData(item,position);	
		} else {
			this.updateData(item,position);
		}
		this.fireEvent('onAfterSaveData',[item,this]);
		return this;
	},
	addData:function(item,position){
		var position = $pick(position,this.options.addPosition);
		this.fireEvent('onBeforeAddData',[item,this]);
		switch(position){
			case 'top':
				this.$items.unshift(item);
				break;
			default:
				this.$items.push(item);
				break;
		}
		if (this.$doListItems) {
			this.list();
		}
		return this;
	},
	updateData:function(item){
		this.fireEvent('onBeforeUpdateData',[item,this]);
		$extend(this.getData(item[this.options.viewKey],false),item);
		if ($defined(this.$currentData)) {
			if (this.$currentData[this.options.viewKey]==item[this.options.viewKey]) {
				this.$currentData = this.getData(item[this.options.viewKey],false);
			}	
		}
		if (this.$doListItems) {
			this.list();
		}
		return this;
	},
	deleteData:function(id){
		var data = this.getData(id,false);
		this.$items.erase(data);
		this.fireEvent('onDeleteData',[data,this]);
		if (this.$doListItems) {
			if (this.containers.currentContainer!=this.options.templates.list) {
				this.containers.select(this.options.templates.list);	
			}
			this.list();
		}
		return this;
	},
	hasData:function(id){
		var data = this.getData(id,false);
		return $defined(data);
	},
	getData:function(id,useDefault){
		var items = this.$items,
			len = items.length;
		
		for(var i=0;i<len;i++){
			if (id==this.$items[i][this.options.viewKey]) {
				return this.$items[i];
			}
		}
		if ($pick(useDefault,true)) {
			if ($defined(this.options.$default)) {
				return $merge(this.options.$default,{});
			}
		};
		return null;
	},
	loadData:function(id,onLoad,onFailure,position){
		var params = $merge(this.options.request,{
			controller:this.options.controller,
			task:this.options.tasks.load,
			load:this.options.item
		});
		params[this.options.viewKey]=id;
		this.startSpin();
		this.serverRequest(params,{
			onComplete:function(result){
                //console.log(result);
                this.saveData(result,position);        
				if ($type(onLoad)=='function') {
					onLoad(result);
				}
				this.stopSpin();
			}.bind(this),
			onFailure:function(){
				if ($type(onFailure)=='function') {
					onFailure();
				}
				this.stopSpin();
			}.bind(this)
		});
	},
	getStorage:function(){
		return this.$storage;
	},
	getAutoSaved:function(){
		var storage = this.getStorage();
		if ($defined(storage)) {
			var name = this.getName();
			return storage.get(name);	
		}
	},
	hasAutoSaved:function(){
		var storage = this.getStorage();
		if ($defined(storage)) {
			var name = this.getName();
			return storage.has(name);	
		}
		return false;
	},
	clearAutoSave:function(){
		var storage = this.getStorage();
		if ($defined(storage)) {
			storage.clear();
		}
		return this;
	},
	autoSave:function(data){
		if (!this.options.canAutoSave) return;
		var storage = this.getStorage();
		if ($defined(storage)) {
			if (!$defined(data)) {
				var template = this.getTemplate(this.options.templates.form);
				var form = template.container.getElement('form');
				data = $pick(form,template.container).toQueryString().parseQueryString();
			}
			var name = this.getName();
			storage.set(name,data);	
			//console.log('AUTOSAVED',data);
		} 		
		
		return true;
	},
	edit:function(id,forceLoad,onLoad){
		this.$mode = 'edit';
		var templateName = this.options.templates.form;		
		this.$currentTemplate = templateName;
		if ($defined(id)) {
			var forceLoad = $pick(forceLoad,false);
			var data = this.getData(id,false);
			
			if (!$defined(data) && forceLoad) {
				this.loadData(id,function(){
					this.edit(id);
				}.bind(this));
				return;
			}	
		} else {
			var data = $merge(this.options.$default,{});
			 
		}
		var autoSaved = this.getAutoSaved();
		if ($defined(autoSaved)) { 
			var isValidAutoSave = $pick(autoSaved.id,'')==$pick(data.id,'');
			
			if (isValidAutoSave) {
				$extend(data,$merge(autoSaved,{
					id:data.id
				}));	
			}
		}
		this.fireEvent('onBeforeLoadForm',[data,this]);
		this.setCurrentData(data);
		
		var container = this.containers.select(templateName);
		var template = this.clearTemplate(templateName)
			.applyTemplate(templateName,this.$currentData,function(container,template){				
				this.fireEvent('onLoadForm',[container,template,this]);	
				$fullHeight(template.parent);
				container.getElements('input,textarea,select').each(function(el,i){
					if (!i) {
						el.focus();
					}
					//if (isNew) {
						switch(el.get('tag')){
							case 'input':
								switch(el.get('type')){
									case 'radio':
									case 'checkbox':
										el.addEvent('click',function(){
											this.autoSave();
										}.bind(this));
										break;
									default:
										el.addEvent('input',function(){
											this.autoSave();
										}.bind(this));
										break;
								}
								break;
							case 'textarea':
								el.addEvent('input',function(){
									this.autoSave();
								}.bind(this));
								break;
							case 'select':
								el.addEvent('change',function(){
									this.autoSave();
								}.bind(this));
								break;
						}
					//}
					
				}.bind(this));
                if ($type(onLoad)=='function') {
                    onLoad();
                }
			}.bind(this))
			.renderTemplate(templateName);
			
		$fullHeight(container.getParent());
	},
	viewCurrentData:function(){
		this.view(this.$currentData[this.options.viewKey]);
		return this;
	},
	loadView:function(templateKey,data){
		var templateName = this.options.templates[templateKey];
		var container = this.containers.select(templateName);
		
		var template = this.clearTemplate(templateName)
			.applyTemplate(templateName,this.options.formatForView(data),function(container,template){
				$fullHeight(container.getParent());	
			}.bind(this))
			.renderTemplate(templateName);
			
		$fullHeight(container.getParent());
		return template;
	},
	view:function(id,forceLoad,onView){
		//console.log(this);
		this.$mode = 'view';
		var templateName= this.options.templates.details;	
		this.$currentTemplate = templateName;	
		var forceLoad = $defined(forceLoad)?forceLoad:this.options.viewForceLoad;
        //console.log('Force Load',forceLoad);
        if (forceLoad) {
            this.loadData(id,function(){
                this.view(id,false,onView);
            }.bind(this));    
        } else {
            var data = $defined(id)?this.getData(id,false):$merge(this.options.$default,{});
            if ($defined(data)) {
                this.fireEvent('onBeforeLoadDetails',[data,this]);
                this.setCurrentData(data);
                this.containers.select(templateName);
                this.updateViewContent();
                
                if ($type(onView)=='function') {
                    onView();
                }    
            }    
        }
	},
	updateViewContent:function(){
		var data = this.getCurrentData();
		var templateName= this.options.templates.details;
		var container = this.containers.getContainer(templateName);
        $fullHeight(container.getParent());
        
        this.clearTemplate(templateName).updateTemplate(templateName);
        this.applyTemplate(templateName,this.options.formatForView(data),function(container,template){
            this.fireEvent('onLoadDetails',[template.parent,template,this]);    
            $fullHeight(template.parent);
        }.bind(this))
        .renderTemplate(templateName);
	},
	validate:function(data){
		var validate = this.options.validate;
		return $type(validate)=='function'?validate(data,this):true;
	},
	getFormData:function(){
		var template = this.getTemplate(this.options.templates.form);
		var form = template.container.getElement('form');
		return $pick(form,template.container).toQueryString().parseQueryString();
	},
	save:function(){
		var template = this.getTemplate(this.options.templates.form);
		var form = template.container.getElement('form');
		if ($defined(form)?TPH.validateForm(form):true) {
			var data = $pick(form,template.container).toQueryString().parseQueryString();
			this.fireEvent('onBeforeValidate',[data,this]);
			if (this.validate(data)) {
				this.startSpin();
				this.fireEvent('onBeforeSave',[data,this]);
				this.stopLiveUpdate();
				this.clearAutoSave();
				this.saveRoutine(data,function(result){
					this.containers.back();
					if (this.options.autoDetails) {
						this.view(result.data[this.options.viewKey]);	
					} 
					this.fireEvent('onSave',[this.getData(result.data[this.options.viewKey]),this]);
                    this.fireEvent('onSaveResult',[result,this]);
					window.fireEvent('onUpdateData',[result.data,this]);
					this.stopSpin();
				}.bind(this),function(){
					this.fireEvent('onSaveFailure',[data,this]);
					this.stopSpin();
				}.bind(this));
			}
		}
	},
	saveRoutine:function(data,onSave,onFail){
		var params = $merge(this.options.request,{
			controller:this.options.controller,
			task:this.options.tasks.save,
			data:data
		});
		this.fireEvent('onBuildSaveData',[params,this]);
		this.serverRequest(params,{
			onComplete:function(result){
				if (result.status){
					//this.containers.select(this.options.templates.main);
					//console.log('MAIN:',this.options.templates.main);
					this.saveData(result.data);							
					if ($type(onSave)=='function') {
						onSave(result);
					}	
				} else {
					TPH.alert('System Message',result.message,function(){
						if ($type(onFail)=='function') {
							onFail();
						}
					});
				}
				if (this.options.live){
					this.liveUpdate();
				}
			}.bind(this),
			onFailure:function(){
				if (this.options.live){
					this.liveUpdate();
				}
				if ($type(onFail)=='function') {
					onFail();
				}
			}.bind(this)
		});
	},
	load:function(force,onLoad){
		var templateName = this.options.templates.list;
		this.$currentTemplate = templateName;
		var params = $merge(this.options.request,{
			controller:this.options.controller,
			task:this.options.tasks.load,
			load:this.options.load,
			filter:$merge(this.getFilter(this.options.templates.list),{
				aid:this.options.account.id
			}),
			limitstart:this.options.limitstart
		});
		this.fireEvent('onBeforeLoadRequest',[params,this]);
		var force = $defined(this.$overrideForceLoad)?this.$overrideForceLoad:$pick(force,false);
		if (!this.$itemsLoaded || force) {
			this.stopLiveUpdate();
			this.fireEvent('onBeforeRequest',[params,this]);
			this.startSpin();
			this.serverRequest(params,{
				onComplete:function(result){
					this.$doListItems = false;
					if ($defined(result.items)) {
						if ($type(this.options.loadResultFunction)=='function'){
							this.options.loadResultFunction(result,this);
						} else {
							result.items.each(function(item){
								this.saveData(item,'bottom');
							}.bind(this));
							this.$paginator = {
								count:result.count,
								limit:result.limit.toInt(),
								limitstart:$pick(result.limitstart,'0').toInt()
							};	
						}							
					} else if ($type(this.options.loadResultFunction)=='function'){
						this.options.loadResultFunction(result,this);
					} 
					this.$doListItems = true;
					this.$itemsLoaded = true;
					
					this.fireEvent('onLoadRequest',[result,this]);
					if (this.options.live){
						this.liveUpdate();
					}
					this.stopSpin();
					if ($type(onLoad)=='function') {
						onLoad(this);
					}
						
					this.list.delay(200,this,[true,function(){
						
					}.bind(this)]);
				}.bind(this),
				onFailure:function(){
					this.stopSpin();
				}.bind(this)
			});
		} else {
			/*
			var template = this.getTemplate(this.options.templates.list);
			if ($defined(template)) {
				this.updateTemplate(this.options.templates.list);	
			}
			this.list.delay(500,this,[true]);
			*/
			this.list(false,onLoad);
		}
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
	list:function(clear,onLoad){
		if (!this.$doListItems) return;		
		this.$mode = 'list';
		var templateName = this.options.templates.list;
		this.$currentTemplate = templateName;
		if ($type(this.options.listFunction)=='function') {
			this.options.listFunction(clear,this);
		} else {
			var $items = $defined(this.options.prepareList)?this.options.prepareList(this.$items,this):this.$items;
			if (this.options.sorted){
				//console.log('Sorted');
				$items = $items.sortBy(this.options.sortKey);
				if (this.options.addPosition=='top') {
					//console.log('Reversed');
					$items = $items.reverse();
				}
			}
			
			if ($pick(clear,true)) {
				this.clearTemplate(templateName);	
			}
			this.updateTemplate(templateName);
			//console.log(this.options.templates.details,this.options.autoDetails);
			this.fireEvent('onStartList',[this]);
			$items.each(function(item){
				this.fireEvent('onBeforeListItem',[item,this]);
				this.applyTemplate(templateName,item,function(el){
					if ($defined(this.options.listItemFunction)) {
                        this.options.listItemFunction(el,item,this);
                   	} else {
                   		if ($defined(this.options.templates.details) && this.options.autoDetails) {
	                        el.addEvent('click',function(e){
	                            this.view(item[this.options.viewKey]);
	                        }.bind(this));                     
						} else if ($defined(this.options.templates.form) && this.options.autoEdit) {
							el.addEvent('click',function(e){
	                            this.edit(item[this.options.viewKey]);
	                        }.bind(this));
						}	
                   	} 
					
					this.fireEvent('onListItem',[item,el,this]);
				}.bind(this),function(el){
					this.fireEvent('onListItemRestore',[item,el,this]);
				}.bind(this));			
			}.bind(this));
			var template = this.renderTemplate(templateName);
			this.fireEvent('onLoadList',[template,this]);
			$fullHeight(template.parent);	
		}
		if ($type(onLoad)=='function'){
			onLoad(this);
		}
		return this;
	},
	updateDataDisplay:function(data){
		var templateItem = this.getTemplateItem(this.options.templates.list,data.id);
        if ($defined(templateItem.el)){
            this.updateTemplateElement(this.getTemplate(this.options.templates.list),templateItem.el,data);
            this.fireEvent('onListItem',[data,templateItem.el,this]);
        }
        if ($defined(this.containers)) {
        	if (this.containers.currentContainer==this.options.templates.details) {
	        	this.view(data.id);
	        }	
        }
	},
	stopLiveUpdate:function(permanent){
		if (permanent) {
			this.setOptions({live:false});
		}
		if ($defined(this.$liveUpdate)) {
			clearTimeout(this.$liveUpdate);	
		}
		this.$liveUpdate = null;
		if ($defined(this.$liveUpdateRequest)) {
			this.$liveUpdateRequest.cancel();
		}
		this.$liveUpdateRequest = null;
		return this;
	},
	processLiveUpdateResult:function(result){
		var hasUpdate = false;
		if ($defined(result.items)) {
			result.items.each(function(item){
				var data = this.getData(item.id,false);
				if ($defined(data)) { 
					if (data._hash!=item._hash) {
						//console.log('hasUpdate',item);
						hasUpdate = true;
						$extend(data,item);
						this.updateDataDisplay(data);
                        
						this.fireEvent('onLiveItemUpdate',[data,this]);
					}	
				} else { 
					//console.log('newItem',item);
					this.fireEvent('onLiveNewItem',[item,this]);
					this.$doListItems = false;
					this.saveData(item,'top');
					this.$doListItems = true;
					this.fireEvent('onBeforeListItem',[item,this]);
					this.applyTemplate(this.options.templates.list,item,function(el){
						if ($defined(this.options.listItemFunction)) {
	                        this.options.listItemFunction(el,item,this);
	                   	} else {
	                   		if ($defined(this.options.templates.details) && this.options.autoDetails) {
		                        el.addEvent('click',function(e){
		                            this.view(item[this.options.viewKey]);
		                        }.bind(this));                     
							} else if ($defined(this.options.templates.form) && this.options.autoEdit) {
								el.addEvent('click',function(e){
		                            this.edit(item[this.options.viewKey]);
		                        }.bind(this));
							}	
	                   	} 
						
						this.fireEvent('onListItem',[item,el,this]);
					}.bind(this));
						
				}					 
			}.bind(this));
		}
		var $paginator = {
			count:result.count,
			limit:result.limit.toInt(),
			limitstart:$pick(result.limitstart,'0').toInt()
		};
		if (($paginator.limitstart+$paginator.limit<=$paginator.count) && $paginator.limitstart<this.$paginator.limitstart && !hasUpdate) {
			this.$liveUpdate = this.liveUpdate.delay(this.options.liveDelay,this,[$paginator.limitstart+$paginator.limit]);
		} else {
			this.fireEvent('onAfterLiveRequest',[this]);
			this.$liveUpdate = this.liveUpdate.delay(this.options.liveDelay,this);
		}
	},
	liveUpdate:function(limitstart){
		this.stopLiveUpdate();		
		if (!this.options.live) return;
		var params = $merge(this.options.request,{
			controller:this.options.controller,
			task:this.options.tasks.load,
			load:this.options.load,
			filter:$merge(this.getFilter(this.options.templates.list),{
				aid:this.options.account.id
			}),
			limitstart:$pick(limitstart,0)
		});
		this.fireEvent('onBeforeRequest',[params,this]);
		params[TPH.$token]=1;
		this.$liveUpdateRequest = new TPH.Json({
			notices:{
				noConnection:false
			},
			data:params,
			onComplete:function(result){
				if ($type(this.options.processLiveUpdateResult)=='function') {
					this.options.processLiveUpdateResult(result,this);
				} else {
					this.processLiveUpdateResult(result);	
				}
			}.bind(this),
			onFailure:function(){
				this.$liveUpdate = this.liveUpdate.delay(this.options.liveDelay,this,limitstart);
			}.bind(this)
		}).request();
		return this;
	},
	deleteCurrentData:function(onDelete){
		TPH.getWindow('__ComponentDeleteData__',{
			caption:'Confirm Record Deletion',
			size:{
				width:400,
				height:'auto'
			},
			closable:false,
			onClose:function(win){
				win.content.empty();
			}
		}).open(function(win){
			win.setContent('<dl class="definitions"><dt>You are about to delete this record from the system and cannot be undone.</dt><dd>Please confirm your action.</dd></dl>');
			var controlbar = new Element('div',{'class':'controlbar align_right'}).inject(win.content);
			TPH.button('Yes, Delete Record',{
				'class':'danger rounded'
			}).inject(controlbar).addEvent('click',function(){
				this.stopLiveUpdate();
				var params = $merge(this.options.request,{
					controller:this.options.controller,
					task:this.options.tasks['delete']
				});
				params[this.options.viewKey]=this.$currentData[this.options.viewKey];
				win.startSpin();
				this.fireEvent('onBeforeDelete',[params,this]);
				this.serverRequest(params,{
					onComplete:function(result){
						win.stopSpin();
						if (result.status) {
							var delData = this.$currentData[this.options.viewKey];
							this.deleteData(delData);
							this.fireEvent('onDelete',[this.$currentData,this,result]);
							if ($type(onDelete)=='function') {
								onDelete();
							}
							this.$currentData = null;
							win.close();
						} else {
							TPH.alert('System Message',result.message);
						}
						if (this.options.live){
							this.liveUpdate();
						}
					}.bind(this),
					onFailure:function(){
						win.stopSpin();
						if (this.options.live){
							this.liveUpdate();
						}
					}.bind(this)
				});
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