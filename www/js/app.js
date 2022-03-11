var App = {
	getInstance:function(){
		return App.$instance;
	},
	Splash:new Class({
		Implements:[Events,Options],
		options:{
			classes:{
				active:'active'
			}
		},
		initialize:function(options){
			this.splash = new Element('div',{'class':'splash '+this.options.classes.active}).inject(window.document.body);
		},
		show:function(){
			this.splash.addClass(this.options.classes.active);
		},
		hide:function(){
			this.splash.removeClass(this.options.classes.active);
		} 
	}),  
	Loader:new Class({
		Implements:[Events,Options],
		options:{
			idleTimer:10000,
			splash:{
				//message:'Please wait...'
			}
		},
		$assetsUpdated:false,
		initialize:function(app,options){     
			this.app = app;
			var url = app.toURI();
			this.$id = url.get('host');
			
			this.setOptions(options);
			this.$body = document.id(window.document.body);
			this.$head = document.id(window.document.head);
			
			this.$assets = new Array();
			this.$isLoaded = new Array();
			
			//console.log('Welcome!',this.$id,device);
			if (['android'].contains(device.platform.toLowerCase())) {
				new App.Interface.Log();	
			}
			
			
			this.intro(function(){
				this.initializeAssets();
				if ($defined(cordova.getAppVersion)) {
					cordova.getAppVersion.getVersionNumber(function (version) {
						this.$version = version;
						App.FileSystem.getInstance('TEMPORARY',{
							base:'/'+this.$id,
							onReady:function(instance){
								this.$fileSystem = instance;
								
								this.initializeNetwork.delay(1000,this,function(){
									this.run(function(){
										this.hideSplash();
									}.bind(this));	
								}.bind(this));
							}.bind(this)
						});
					}.bind(this));	
				} else {
					App.FileSystem.getInstance('TEMPORARY',{
						base:'/'+this.$id,
						onReady:function(instance){
							this.$fileSystem = instance;
							
							this.initializeNetwork.delay(1000,this,function(){
								this.run(function(){
									this.hideSplash();
								}.bind(this));	
							}.bind(this));
						}.bind(this)
					});
				}
			}.bind(this));
			
			
			
			App.$instance = this;
			 
			window.addEvents({
				onLoadAsset:function(library){
					console.log('Asset Loaded',library);
					switch(library){
						case 'L':
							L.Icon.Default.imagePath = "https://cdn.wizaya.com/includes/images/";
							console.log(L.Icon.Default);
							break;	
					}
				}
			});
		},
		intro:function(onComplete){
			if (false){ //device.platform!='browser') {
				this.$intro = new Element('video',{
					controls:false,
					autoplay:true,
					playsinline:true,
					'webkit-playsinline':true,
					width:'100%',
					height:'100%',
					styles:{
						width:'100%',
						height:'100%',
						'object-fit':'contain',
						background:'#000',
						opacity:0
					}
				}).inject(this.$body);
				
				this.$intro.addEventListener('canplay',function(){
					this.$intro.fade('in');
				}.bind(this),false);
				this.$intro.addEventListener('ended',function(){
					this.clearIntro();
					$pick(onComplete,$empty)();
				}.bind(this),false);
				this.$intro.addEventListener('error',function(){
					this.clearIntro();
					$pick(onComplete,$empty)();
				}.bind(this),false);
				
				this.$intro.adopt(new Element('source',{
					src:'video/intro.mp4',
					type:'video/mp4'
				})); 
			} else {
				$pick(onComplete,$empty)();
			}
		},
		clearIntro:function(){
			this.$intro.destroy();
		},
		initializeAssets:function(){
			this.$splash = this.$body.getElement('.splash.poster');
			this.$splashTemplate = this.$splash.get('html');
			this.$splash.empty();
			
			this.$offline = this.$body.getElement('.offline.poster');
			this.$offlineTemplate = this.$offline.get('html');
			this.$offline.empty();
			
			this.$body.empty().removeClass('empty');
		},
		initializeNetwork:function(onInitialize){
			this.updateNetwork();
		    
		    document.addEventListener("offline", function(){
		    	this.updateNetwork();
		    	window.fireEvent('onOffline');
		    	console.log('App Offline');
		    }.bind(this), false);
		    document.addEventListener("online", function(){
		    	this.updateNetwork();
		    	window.fireEvent('onOnline');
		    	console.log('App Online');
		    }.bind(this), false);
			
			if ($type(onInitialize)=='function') {
				onInitialize();
			}
		},
		updateNetwork:function(){
			console.log('Check Internet Connection');
			var networkState = navigator.connection.type;

		    var states = {};
		    states[Connection.UNKNOWN]  = 'Unknown connection';
		    states[Connection.ETHERNET] = 'Ethernet connection';
		    states[Connection.WIFI]     = 'WiFi connection';
		    states[Connection.CELL_2G]  = 'Cell 2G connection';
		    states[Connection.CELL_3G]  = 'Cell 3G connection';
		    states[Connection.CELL_4G]  = 'Cell 4G connection';
		    states[Connection.CELL]     = 'Cell generic connection';
		    states[Connection.NONE]     = 'No network connection';
		    
		    window.$connection = states[networkState];
		    window.$isOnline = device.platform=='browser'?networkState==Connection.UNKNOWN:networkState!=Connection.NONE;
		    console.log(window.$connection,window.$isOnline);
		    console.log(navigator.connection);
		},
		getFileSystem:function(){
			return this.$fileSystem;
		},
		showSplash:function(options){
			this.$splash.inject(this.$body)
				.set('html',this.$splashTemplate.substitute($merge(this.options.splash,options)));
		},
		hideSplash:function(){
			this.$splash.destroy();
		},
		showOffline:function(message,onRetry){
			var button = this.$offline.inject(this.$body).set('html',this.$offlineTemplate.substitute({
				message:message
			})).getElement('button');
			button.addEvent('click',onRetry);
		},
		hideOffline:function(){
			if ($defined(this.$offline)) {
				this.$offline.remove();	
			}
		},
		requestData:function(onRequest,onError){
			this.hideOffline();
			if (window.$isOnline) {
				this.startSpin('Downloading Updates. Please wait...');
				new Request({
					url:this.app,
					onSuccess:function(result){
						if ($type(onRequest)=='function'){
							onRequest(result);
						}
						this.stopSpin('Update Complete!');
					}.bind(this),
					onFailure:function(xhr){
						console.log(arguments);
						switch(xhr.status){
							case 500:
								this.showOffline('Unable to connect to Internet. Please check your internet connection.',function(){
									this.requestData(onRequest,onError);
								}.bind(this));
								break;
							default:
								if ($type(onError)=='function') {
									onError();
								}
						}
						this.stopSpin('No Internet Connection','exclamation');
					}.bind(this)
				}).send();
			} else {
				this.showOffline('Unable to connect to Internet. Please check your internet connection.',function(){
					this.requestData(onRequest,onError);
				}.bind(this));
			}
			
		},
		getData:function(onGet,onError){
			if (!$defined(this.$data)) {
				//var filePath = '/'+this.$id;
				var fileName = 'data.json';
				this.$fileSystem.getEntry('/'+fileName,function(fileEntry){
					this.$fileSystem.readFile(fileEntry,function(content){
						this.$data = Json.decode(content);
						console.log('Cached App Data Found',this.$data);
						if ($type(onGet)=='function') {
							onGet(this.$data);
						}
					}.bind(this),onError);
				}.bind(this),function(){
					this.requestData(function(result){			
						this.$data = Json.decode(result);
						this.$fileSystem.createFile(this.$fileSystem.getBaseEntry(),{
							name:fileName,
							content:[result]
						},function(entry){
							if ($type(onGet)=='function') {
								onGet(this.$data);
							}
							//this.stopSpin();
						}.bind(this),onError);
					}.bind(this),onError);
				}.bind(this));

				//this.$fileSystem.getDirectory(this.$fileSystem.getBaseEntry(),filePath,true,function(dirEntry){
					
				//}.bind(this),onError);
				
			} else {
				onGet(this.$data);
			}
		},
		$spinCounter:0,
		startSpin:function(message){
			if (!this.$spinCounter) {
				//console.log('Create Spinner');
				if (!$defined(this.$spinner)) {
					this.$spinner = new Element('div',{
						'class':'assetsLoader'
					}).inject(window.document.body);	
				}
			}
			this.$spinner.set('html',message);
			this.$spinner.addClass('loading').removeClass('check').addClass('visible');
			this.$spinCounter++;
			//console.log(this.$spinCounter);
		},
		stopSpin:function(message,icon){
			if (this.$spinCounter) {
				this.$spinCounter--;
				if (!this.$spinCounter) {
					var message = $pick(message,'');
					if (message.length) {
						this.$spinner
							.removeClass('loading')
							.addClass($pick(icon,'check'))
							.set('html',message)
							;	
					}
					this.$spinner.removeClass('visible');
				}	
			}
		},
		reset:function(onReset,onError){
			if (typeof(window.localStorage) !== "undefined") {
				try {
					window.localStorage.clear();	
				} catch(e){
					
				}
			}
			this.$fileSystem.clear(function(){
				if (confirm('App will now restart. Press OK to continue.')) {
					location.reload();
				}
			}.bind(this));
		},
		update:function(onUpdate,onError){
			this.requestData(function(result){
				this.$fileSystem.createFile(this.$fileSystem.getBaseEntry(),{
					name:'app.json',
					content:[result]
				},function(entry){
					var data = Json.decode(result);
					var stylesheet = data.stylesheet.toURI(),	
						javascript = data.script.toURI();
					new App.Localizer(this.$fileSystem,{
						overwrite:true,
						onDownloadComplete:function(){
							//console.log('Update Complete');
							if ($type(onUpdate)=='function') {
								onUpdate();
							}
							
						}.bind(this)
					}).setItems([{
						source:data.stylesheet,
						target:stylesheet.get('directory')+stylesheet.get('file')
					},{
						source:data.script,
						target:javascript.get('directory')+javascript.get('file')
					}]).download();	
				}.bind(this),onError);
			}.bind(this),onError);
		},
		loadAsset:function(source,onLoad){
			var url = source.toURI();
			var target = url.get('directory')+url.get('file');
			console.log('App Load Asset',target);
			this.$fileSystem.getEntry(target,function(fileEntry){
				console.log('Asset Local Cache',fileEntry);
				onLoad(fileEntry.toURL());
			}.bind(this),function(){
				onLoad(source);
				this.startSpin('Downloading Updates. Please wait...');
				new App.Localizer(this.$fileSystem,{
					onSave:function(item,fileEntry){
						console.log('Generated Local Cache',target,fileEntry);
						//onLoad(fileEntry.toURL());
					}.bind(this),
					onDownloadComplete:function(){
						this.stopSpin('Updates Complete!');
					}.bind(this)
				}).setItems([{
					source:source,
					target:target
				}]).download();	
			}.bind(this));				
		},
		run:function(onRun){
			this.showSplash({
				connection:window.$connection+' - '+(window.$isOnline?'Online':'Offline'),
		    	version:'v'+this.$version
		    });
			if (!window.$isOnline) {
				this.showOffline('No internet connection found. Please check your connection and try again.',function(){
					this.hideOffline();
					this.updateNetwork();
					this.run(onRun);
				}.bind(this));
			} else {
				this.getData(function(data){
					console.log('App Data',data);
					var body = this.$body.appendHTML(data.body,'top');
					var head = this.$head;
					//this.startSpin('Updating. Please wait...');
					this.loadAsset(data.stylesheet,function(styleUrl){
						console.log(data.stylesheet,styleUrl);
						new Asset.css(styleUrl,{
							onload:function(){
								new Element('style',{
									type:'text/css'
								}).inject(head).set('text',data.inlineStyles);		
							}.bind(this)
						});					
						this.loadAsset(data.script,function(scriptUrl){ 
							console.log(data.script,scriptUrl);
							new Asset.javascript(scriptUrl,{
								onload:function(){
									$extend(TPH,{
										$remote:this.app,
										$session:data.session
									});
									
									Function(data.inlineScripts)();
									window.fireEvent('domready');
									/*
									new Element('script',{
										type:'text/javascript'
									}).inject(head).set('text',data.inlineScripts);
									*/	
								}.bind(this)
							});
							window.addEvent('onPlatformReady',function(instance){
								if ($type(onRun)=='function') {
									onRun();
								}
							}.bind(this));
						}.bind(this));	
					}.bind(this));				
				}.bind(this),function(e){
					console.log(e);
				}.bind(this));
			}
		}
	})
};





if (typeof(window.localStorage) !== "undefined") {
	// Code for localStorage/sessionStorage.
	$extend(App,{
		localStorage:new Class({
	  		Implements:[Events,Options],
	  		options:{
	  			
	  		},
	  		initialize:function(id,options){
	  			this.id = id;
	  			this.setOptions(options); 
	  		},
	  		getStorage:function(){
	  			if (!$defined(localStorage[this.id])) {
	  				localStorage[this.id] = Json.encode({});
	  			}
	  			return Json.decode(localStorage[this.id]);
	  		},
	  		set:function(key,value){  			
	  			var storage = this.getStorage();
	  			storage[key] = value;
	  			localStorage[this.id] = Json.encode(storage);
	  		},
	  		get:function(key){
	  			var storage = this.getStorage();
	  			return storage[key];
	  		},
	  		has:function(key){
	  			var storage = this.getStorage();
	  			return $defined(storage[key]);
	  		},
	  		clear:function(){
	  			localStorage[this.id] = Json.encode({});
	  		}
		})
	});
	$extend(App.localStorage,{
		instances:{},
		getInstance:function(id,options){
			if (!$defined(App.localStorage.instances[id])){
				App.localStorage.instances[id] = new App.localStorage(id,options);
			}
			return App.localStorage.instances[id];
		}
	});
} else {
  // Sorry! No Web Storage support..
}
