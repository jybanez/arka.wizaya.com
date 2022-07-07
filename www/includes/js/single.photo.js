var SinglePhoto = new Class({
	Implements:[Options],
	options:{
		displaySize:'regular'
	},
	initialize:function(settings,options)
	{
		this.setOptions(options);
		//this.options = options;
		this.options.container = $(options.container);
		this.settings = settings;
		
		var self = this;
		
		this.progressContainer = $(options.progressBar);
		
		if ($defined(this.progressContainer)){

			this.bar = new Element('div',{'class':'progress_bar'}).injectInside(this.progressContainer).setStyles({width:0});

			this.bar.set('fade',{'onComplete':function(){

				this.bar.setStyle('width',0);

			}.bind(this)})

			this.bar.set('tween',{unit:'%'});

		}
		
		var uploadProgress = function(fileobject, bytescomplete, totalbytes)
		{
			var percent = (bytescomplete/totalbytes)*100;	
			
			this.bar.tween('width',percent);
			
		}.bind(this);
		
		var fileDialogComplete = function(filecount, filesqueued, totalfiles)
		{
			if (filesqueued)
			{
				self.filesqueued = totalfiles;
				self.filecount = 0;
				self.bar.setStyles({'opacity':1,'visibility':'visible','width':0});
				this.startUpload();
			}
		};
		
		var uploadError = function (fileobject, errorcode, message)
		{
			self.setStatus('Upload Error:<b style="color:#f00;">'+errorcode+'::'+message+'</b>');
		};
		
		var uploadStart = function(fileobject) 
		{ 
			return true; 
		}.bind(this);
		
		var uploadSuccess = function (fileobject, serverdata, receivedresponse)
		{	
			self.fileobject = fileobject;
			self.serverdata = serverdata;
			self.updatePhoto(serverdata);
		};
		var uploadComplete = function(fileobject)
		{
			//self.computeProgress();
			
			//this.startUpload();
		};
		
		var fileQueueError = function(fileobject, errorcode, message)
		{
			self.setStatus('File Queue Error:'+errorcode+'::'+message);
		};
		
		
		var options = {
						'upload_progress_handler':uploadProgress,
						'file_dialog_complete_handler':fileDialogComplete,
						'upload_start_handler':uploadStart,
						'upload_error_handler':uploadError,
						'upload_success_handler':uploadSuccess,
						'upload_complete_handler':uploadComplete,
						//'file_queued_handler':fileQueued,
						'file_queue_error_handler':fileQueueError,
						//'swfupload_loaded_handler':uploaderReady,
						
						'debug':settings.debug
						};
		if ($defined(settings))
		{
			$extend(options,settings);
		}
		//alert(Json.toString(options));
		this.swfu = new SWFUpload(options);
		if ($defined(this.swfu))
		{
			window.addEvent("unload",function(){this.swfu.destroy();}.bind(this));
		}
	},
	setStatus:function(){
		
	},
	updatePhoto:function(serverdata){
		serverdata = Json.evaluate(serverdata);
		this.options.container.empty();
		if ($defined(this.options.template)) {
			this.options.container.set('html',this.options.template.substitute(serverdata));
			this.options.container.getElements('a.lightbox').each(function(item){
				item.slimbox();
			}); 
		} else {
			this.options.container.adopt(new Element('img',{'src':serverdata[this.options.displaySize]}))
		}
		
		this.options.container.adopt(new Element('input',{'type':'hidden','name':this.options.name,'value':serverdata.id}));
			this.bar.fade('out');
		window.fireEvent('photoUploaded',[this,serverdata]);
	}
});