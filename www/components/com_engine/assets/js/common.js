(function(){
	var ENGINE = new Class({
		Implements:[Events,Options],
	    options:{
	        params:{
	            option:'com_engine',
	            task:'check',
	            format:'raw'
	        },
	        plugins:[]
	    },
	    $sessionId:null,
	    initialize:function(options){
	    	console.log('Starting Engine...');
	        this.setOptions(options);
	        ENGINE.instance = this;
	        
	        var sessionId = $pick(TPH.$session,this.getStorage('session'));
	        if ($defined(sessionId)) {
	        	console.log('Session ID '+sessionId);
	        	this.setSessionId(sessionId);
	        } 
	        
	        window.fireEvent('onLoadEngine',[this]);
	        TPH.loadAsset('LZString',function(){
				if (!this.sessionReady) {
					this.check(function(){
						
			        }.bind(this));
				}		        
	        }.bind(this));
	    },
	    getStorage:function(key){
	    	if ($defined(window.localStorage)) {
	    		return localStorage.getItem(key);
	    	}
	    },
	    setStorage:function(key,value){
	    	if ($defined(window.localStorage)) {
	    		localStorage.setItem(key,value);
	    	}
	    },
	    removeStorage:function(key){
	    	if ($defined(window.localStorage)) {
	    		localStorage.removeItem(key);
	    	}
	    },
	    setSessionId:function(sessionId) {
	    	this.$sessionId = sessionId;
	    	this.setStorage('session',sessionId);
	    	return this;
	    },
	    getSessionId:function(){
	    	return this.$sessionId;
	    },
	    check:function(onCheck,onFailure){		
	        if ($defined(this.checkRequest)) {
	            if (this.checkRequest.isRunning()) {
	                this.checkRequest.cancel();
	            }
	        }
	        if ($defined(this.timer)) {
	        	clearTimeout(this.timer);
	        }
	        if (!this.sessionReady) {
	        	window.fireEvent('sessionLoad');
	        	ENGINE.showOverlay('Loading...');
	        }
	        var dateStart = new Date();  
	        var params = $merge(this.options.params,{
            	time:dateStart.format('db'),
            	session:this.getSessionId()
           	});
           	console.log('Requesting Session Details...');
	        this.checkRequest = new TPH.Ajax({
	            data:params,
	            onComplete:function(html){	            	
	            	//console.log(html);
	            	//console.log(html.base64_decode());
	            	var data = Json.decode(html);
	            	console.log('Session Data Loaded',data);   
	            	this.checkRequest = null;
	            	var responseDate = new Date(),
	            		serverDate = new Date().parse(data.$date),
	            		times = $merge($pick(data.$times,{}),{
	            			'replyReceived':responseDate.format('db'),
	            			'replyReceivedDiff':responseDate-new Date().parse($pick(data.$times,{}).replySent)
	            		});
            		
            		var requestDiff = $pick(times.requestReceivedDiff,0),
            			receivedDiff = $pick(times.receivedReplyDiff,0),
	            		replyDiff = times.replyReceivedDiff
	            		;
	                $extend(window.TPH,$merge(data,{
	                	$times:times,
	                	$latency:requestDiff+receivedDiff+replyDiff,
	                	//$latency:(serverDate-dateStart)+(responseDate-dateStart),
	                	$checkTime:dateStart
	                }));
	                
	                if ($defined(TPH.$session)) {
	                	this.setSessionId(TPH.$session);
	                }
	                
	                if (!this.sessionReady) {
	                	TPH.loadAsset('libphonenumber',function(){
	                		window.fireEvent('sessionReady');
		                    this.sessionReady = true;
		                    ENGINE.hideOverlay();	
	                	}.bind(this));
	                }
	                this.count = data.$refreshTime;                
	                this.timer = this.check.delay(data.$refreshTime,this);
	                
	                if ($type(onCheck)=='function') {
	                	onCheck();
	                }
	            }.bind(this),
	            onFailure:function(){
	            	console.log('Session Request Failed...');
	            	if (!this.sessionReady) {
	            		ENGINE.hideOverlay();
	            		
						window.fireEvent('sessionFailed');
		            	if ($type(onFailure)=='function') {
		            		onFailure();
		            	}           			
	            	}
	            }.bind(this)
	        }).request();
	    }
	});
	
	$extend(ENGINE,{
		$overlayCount:0,
		showOverlay:function(message,params){
			ENGINE.$overlayCount++;
			var check = window.document.body.getElement('.engineOverlay');
			if ($defined(check)) {
				check.destroy();
			}
			ENGINE.$overlay = new Element('div',$pick(params,{}));
			ENGINE.$overlay.addClass('engineOverlay').addClass('active');
			ENGINE.$overlay.inject(window.document.body).setStyles({
				'z-index':TPH.windowIndex+10,
			}).set('html','<div>'+message+'</div>');
		},
		hideOverlay:function(){
			ENGINE.$overlayCount--;
			if (!ENGINE.$overlayCount) {
				if ($defined(ENGINE.$overlay)){
					ENGINE.$overlay.destroy();
					ENGINE.$overlay = null;	
				}	
			}
		}
	});
	
	ENGINE.Activate = new Class({
		Implements:[Events,Options],
	    options:{
	        form:'activateForm',
	        params:{
	            option:'com_engine',
	            task:'activate',
	            format:'raw'
	        }
	    },
	    initialize:function(options){
	        this.setOptions(options);
	        this.form = $type(this.options.form)=='element'?this.options.form:$(window.document[this.options.form]);
	        
	        this.form.addEvent('submit',function(e){
	            e.stop();
	            this.submit();
	            return false;
	        }.bind(this));
	        this.scanActions(this.form);
	        this.fireEvent('onReady',[this]);
	        this.form.elements[0].focus();
	    },
	    scanActions:function(container){
	    	container.getElements('.appAction').each(function(el){
	    		var func = el.get('rel');
	    		if ($defined(this[func])) {
	    			el.addEvent('click',function(){
	    				this[func]();
	    			}.bind(this));
	    		}
	    	}.bind(this));
	    },
	    resendsms:function(){
	    	this.resend('sms');
	    },
	    resend:function(method){
	    	ENGINE.showOverlay('Resending Activation Key.');
	    	var data = this.form.toQueryString().parseQueryString();
	    	var params = $merge(this.options.params,{
	    		task:'resend',
	    		method:$pick(method,'email'),
	    		id:data.data.id
	    	});
	    	params[TPH.$token]=1;
	    	params.session = $pick(ENGINE.instance.$sessionId,TPH.$session);
	    	this.fireEvent('onBeforeActivate',[this]);
	    	new TPH.Json({
	    		data:params,
	    		onComplete:function(result){
	    			ENGINE.hideOverlay();
	    			if ($defined(result.message)) {
	    				TPH.alert('System Message',result.message,function(){
	    					this.form.elements[0].focus();
	    				}.bind(this));
	    			}
	    			this.fireEvent('onActivate',[result,this]);
	    		}.bind(this),
	    		onFailure:function(){
	    			ENGINE.hideOverlay();
	    			this.fireEvent('onActivateFailure',[this]);
	    		}.bind(this)
	    	}).request();
	    },
	    submit:function(){
	    	if (!TPH.validateForm(this.form)) {
	    		return;
	    	}
	    	ENGINE.showOverlay('Activating your account. Please wait...');
	    	var container  = new Element('div').injectInside(this.form);
	        this.options.params[TPH.$token]=1;
	        this.options.params.session = $pick(ENGINE.instance.$sessionId,TPH.$session);
	        for(key in this.options.params){
	            new Element('input',{type:'hidden',name:key,value:this.options.params[key]}).injectInside(container);
	        }
	        this.fireEvent('onBeforeActivate',[this]);
	        new TPH.JsonForm(this.form,{
	            onRequest:function(){
	                
	            }.bind(this),
	            onComplete:function(data){
	            	ENGINE.hideOverlay();
	                if (data.status){
	                	ENGINE.instance.setSessionId(data.session);
	                	var message = $pick(data.message,'Congratulations, Your user account has now been activated.');
	                    TPH.alert($pick(TPH.$applicationname,'Welcome!'),message,function(){
	                        //window.location.assign($pick(data.homeLink,TPH.$base));
	                        this.fireEvent('onActivate',[data,this]);
	                    }.bind(this));                    
	                } else {
	                    TPH.alert('Account Activation',$pick(data.message,'Invalid Request. Please make sure you have entered the correct information.'));
	                    this.fireEvent('onActivateFailure',[this]);
	                }
	                
	            }.bind(this),
	            onFailure:function(){
	                ENGINE.hideOverlay();
	                this.fireEvent('onActivateFailure',[this]);
	            }.bind(this)
	        }).request();
	        container.remove();
	    }
	});
	
	ENGINE.Social = {
		CloseRedirectParent:function(link){
			window.location.assign(link);
			/*
			return;
			if (window.opener != null && !window.opener.closed) {
	            window.opener.location.reload(); //assign(target.toString());
	            window.close.delay(100,window);
	        }
	        */
		}
	};
	
	ENGINE.Plugins = {
		PhotoCapture:new Class({
			Extends:TPH.ToolForm,
			options:{
				tool:'photo.capture',
				form:'photo.capture',
				caption:'Take Photo',
				size:{
					width:400
				}
			},
			initialize:function(options){
				this.addEvents({
					onBeforeClose:function(){
						this.video.pause();
						this.video.remove();
						this.stream.getTracks()[0].stop();
					}.bind(this),
					onBeforeLoadModal:function(params,el){
						params.data.target = el.get('data-target');
					}.bind(this),
					onLoadModal:function(modal){
						modal.content.getElement('.'+this.options.classes.$save).setStyle('display','none');
						this.video = modal.content.getElement('video');
	
						// Get access to the camera!
						if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
						    // Not adding `{ audio: true }` since we only want video now
						    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
						    	this.stream = stream;
						        this.video.src = window.URL.createObjectURL(stream);
						        this.video.play();
						        modal.content.getElement('.'+this.options.classes.$save).setStyle('display','');
						    }.bind(this));
						}
					}.bind(this)
				});
				this.parent(options);
			},
			save:function(el){
				var coords = this.video.getCoordinates(),
					size = {
						width:this.video.videoWidth,
						height:this.video.videoHeight
					};
				var canvas = new Element('canvas',{width:size.width,height:size.height}).injectInside(window.document.body);
				canvas.setStyles({
					position:'absolute',
					top:0,
					left:0,
					visibility:'hidden'
				});
				
				var context = canvas.getContext('2d');
				context.drawImage(this.video,0,0,size.width,size.height);
				
				var data = canvas.toDataURL('image/png');
				canvas.remove();
				
				this.fireEvent('onCapture',[data,this.form.toQueryString().parseQueryString().data,this]);
				this.modal.close();
			}
		}),
		CountryCodeSelect:new Class({
			Extends:TPH.ToolForm,
			options:{
				tool:'select.country.code',
				form:'select.country.code',
				caption:'Select Country Code',
				size:{
					width:400
				}
			},
			initialize:function(options){
				this.addEvents({
					onBeforeLoadModal:function(params){
						$extend(params.data,{
							option:'com_engine',
							view:'modal'
						});
					}.bind(this)
				});
				this.parent(options);
			},
			save:function(el){
				this.fireEvent('onSelect',[el.get('rel'),el.get('data-dial'),this]);
				this.modal.close();
			}
		})
	};
	
	ENGINE.Abstract = {
		Search:new Class({
			Implements:[Events,Options],
			options:{
				name:'searchField',
				classes:{
					searchContainer:'searchContainer',
					containment:'',
					visible:'visible'
				},
				params:{
					option:'com_engine',
					task:'search',
					format:'raw'
				},
				template:'{name}',
				itemTag:'div',
				containmentTag:'div'
			},
			initialize:function(el,options){
				this.element = document.id(el);
				this.setOptions(options);
				
				if (!$defined(ENGINE.SearchFields)) {
					ENGINE.SearchFields = new Hash();
				} 
				
				if (ENGINE.SearchFields.has(this.options.name)) {
					this.searchContainer = ENGINE.SearchFields.get(this.options.name);
					this.containment = this.searchContainer.retrieve('containment');	
				} else {
					this.searchContainer = new Element('div',{'class':this.options.classes.searchContainer});
					this.containment = new Element(this.options.containmentTag,{'class':this.options.classes.containment}).inject(this.searchContainer);
					ENGINE.SearchFields.set(this.options.name,this.searchContainer.store('containment',this.containment));
				}
				var containment = $pick(this.options.containment,window.document.body);
				this.searchContainer.inject(containment);
				
				this.hide();
				
				this.element.addEvents({
					keyup:function(e){
						var len = this.element.get('value').length; 
						if (!len) {
							this.clear();
						} else if (len>1) {
							this.search();
						}
					}.bind(this)
				});
				
				containment.addEvents({
					onDragElement:function(){
						this.hide();
					}.bind(this),
					mouseup:function(e){
						var target = e.target;
						if (this.searchContainer.hasClass(this.options.classes.visible) && (!this.searchContainer.contains(target) || target!=this.element)) {
							this.hide();
						}
					}.bind(this)
				});
			},
			show:function(){
				var coords = this.element.getCoordinates();
				var top = coords.bottom, left=coords.left, width=coords.width;
				this.searchContainer.addClass(this.options.classes.visible).setStyles({
					top:top,
					left:left,
					width:width,
					'z-index':TPH.windowIndex+1
				});
				return this;
			},
			hide:function(){
				this.searchContainer.removeClass(this.options.classes.visible);
				return this;
			},
			search:function(){
				if ($defined(this.$request)) {
					this.$request.cancel();
				}
				var params = $merge(this.options.params,{
					term:this.element.get('value')
				});
				this.fireEvent('onBeforeSearch',[params,this]);
				params[TPH.$token]=1;
				this.clear().show();
				this.$request = new TPH.Json({
					data:params,
					onRequest:function(){
						this.searchContainer.addClass('loading');
					}.bind(this),
					onComplete:function(result){
						if (result.status){
							result.items.each(function(item){
								var row = new Element(this.options.itemTag).injectInside(this.containment).set('html',this.options.template.substitute(item));
								row.getElements('.styleContent').each(function(el){
									el.setStyle(el.get('data-style'),el.get('data-content'));
								});
								row.addEvents({
									mousedown:function(e){
										e.stopPropagation();
									},
									click:function(e){
										e.stop();
										this.hide();
										this.fireEvent('onSelect',[item,row,this]);
										
										return false;
									}.bind(this)
								});
							}.bind(this));
						}
						this.searchContainer.removeClass('loading');
					}.bind(this),
					onFailure:function(){
						this.searchContainer.removeClass('loading');
					}.bind(this)
				}).request();
				return this;
			},
			clear:function(){
				this.containment.empty();
				return this;
			}
		})
	};
	
	ENGINE.Tools = {
		CitySearch:new Class({
			Extends:ENGINE.Abstract.Search,
			options:{
				name:'searchFieldCity',
				params:{
					controller:'ph.cities',
					search:'city'
				},
				template:'<div><b>{name}</b></div><div>{state}</div>'
			}
		}),
		StateSearch:new Class({
			Extends:ENGINE.Abstract.Search,
			options:{
				name:'searchFieldState',
				params:{
					controller:'ph.provinces',
					search:'state'
				},
				template:'<div><b>{name}</b></div>'
						+'<div>{region}</div>'
			}
		}),
		CountrySearch:new Class({
			Extends:ENGINE.Abstract.Search,
			options:{
				name:'searchFieldCountry',
				params:{
					controller:'countries',
					search:'name'
				},
				classes:{
					containment:'fieldList spaced separated'
				},
				itemTag:'li',
				containmentTag:'ul',
				template:'<div class="profile thumb align_center"><div class="profile thumb small styleContent" data-style="background-image" data-content="url({icon})"></div></div>'
						+'<div><div class="font bold">{name}</div><div>{code}</div></div>'
			}
		})
	};
	window.ENGINE = ENGINE;
}());

