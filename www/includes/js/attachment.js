// JavaScript Document

var Attachment = {
	showSpinner : function(id){
		if ($defined(Attachment.Spinners)) {
			var spinner = Attachment.Spinners.get(id);
			if ($defined(spinner)) {
				spinner.addClass('spin');
			}
		}
	},
	hideSpinner : function(id){
		if ($defined(Attachment.Spinners)) {
			var spinner = Attachement.Spinners.get(id);
			if ($defined(spinner)) {
				spinner.removeClass('spin');
			}
		}
	},
	setInstance:function(id,obj){
		if (!$defined(Attachment.instances)) {
			Attachment.instances = new Hash();
		}
		Attachment.instances.set(id,obj);
	},
	getInstance:function(id){
		if ($defined(Attachment.instances)) {
			return Attachment.instances.get(id);
		}
		return null;
	} 
};

Attachment.PanelSpinners = new Class({
	initialize:function(){
		Attachment.Spinners = new Hash();
		$$('.panel_spinner').each(function(item){
			var id = item.getProperty('rel');
			Attachment.Spinners.set(id,item);
		}.bind(this),this);
	}
});
Attachment.Uploader = new Class({
	Implements: Events,
	initialize:function(settings,options)
	{
		if (!$defined(Attachment.uploaders)) {
			Attachment.uploaders = new Array();
		}
		Attachment.uploaders.include(this);
		this.settings = settings;
		
		var self = this;
		
		if ($defined(options.events)) {
			for(tevent in options.events){
				this.addEvent(tevent,options.events[tevent]);
			}
		}
		
		this.itemContainer = $(options.itemContainer);
		this.itemContainer
			.getElements($pick(options.itemTag,'div')+'.'+options.itemClass)
			.each(function(item){ 
				this.initItem(item); 
			}.bind(this),this);
			
		this.indicatorContainer = $(options.indicatorContainer);
		this.progressContainer = $(options.progressBar);
		if ($defined(this.progressContainer)){
			this.progressContainer.setStyles({padding:4});
			this.bar = new Element('div',{'class':'progress_bar'}).injectInside(this.progressContainer).setStyles({opacity:0,width:'100%'});
			
			this.bar.set('tween',{duration:200,unit:'%',link:'cancel',onComplete:function(){
				var width = this.bar.getStyle('width').toInt();
				var opacity = this.bar.getStyle('opacity').toInt();
				if (width>=100)
				{
					if (opacity==1)
						this.bar.fade();
					else
						this.bar.setStyle('width','0%');
				}
			}.bind(this)});
		}
		var uploadProgress = function(fileobject, bytescomplete, totalbytes)
		{
			self.fireEvent('uploadProgress',{fileObject:fileobject, complete:bytescomplete, total:totalbytes});
		};
		
		var fileDialogComplete = function(filecount, filesqueued, totalfiles)
		{
			if (filesqueued)
			{
				self.bar.setStyles({'width':'0','opacity':1});
				
				self.totalfiles = totalfiles;
				self.filecount = filecount;
				
				this.startUpload();
			}
			self.fireEvent('dialogComplete',{count:filecount, queued:filesqueued, total: totalfiles});
		};
		var uploadError = function (fileobject, errorcode, message)
		{
			self.setStatus('Upload Error:<b style="color:#f00;">'+errorcode+'::'+message+'</b>');
			self.fireEvent('uploadError',{fileObject:fileobject,code:errorcode,message:message});
		};
		var fileQueued = function(fileobject) {
			self.fireEvent('queue',fileobject);
		};
		var uploadStart = function(fileobject) 
		{ 
			self.fireEvent('uploadStart',fileobject);
			return true; 
		};
		var uploadSuccess = function (fileobject, serverdata, receivedresponse)
		{				
			
			self.fireEvent('uploadSuccess',{fileObject:fileobject,data:serverdata,response:receivedresponse});
			if ($defined(self.itemContainer)) {
				var serverdata = Json.evaluate(serverdata);
				self.fireEvent('beforeComplete',serverdata);
				var item = new Element($pick(options.itemTag,'div'),{'class':options.itemClass}).injectInside(self.itemContainer)
					.setHTML(options.template[serverdata.handler].substitute(serverdata))
					.setStyles({opacity:0});
				self.initItem(item);
			}
			
			
		};
		var uploadComplete = function()
		{
			self.computeProgress();
			var stats = this.getStats();
			if (stats.files_queued){
				this.startUpload();
			} else {
				self.fireEvent('uploadComplete',stats);
			}
			
		};
		
		var fileQueueError = function(fileobject, errorcode, message)
		{
			self.fireEvent('queueError',{fileObject:fileobject,code:errorcode,message:message});
		};

		var params = {
						'upload_progress_handler':uploadProgress,
						'file_dialog_complete_handler':fileDialogComplete,
						'upload_start_handler':uploadStart,
						'upload_error_handler':uploadError,
						'upload_success_handler':uploadSuccess,
						'upload_complete_handler':uploadComplete,
						'file_queued_handler':fileQueued,
						'file_queue_error_handler':fileQueueError,
						//'swfupload_loaded_handler':uploaderReady,				
						'debug':settings.debug
						};
		if ($defined(settings))
		{
			$extend(params,settings);
		}

		this.swfu = new SWFUpload(params);
		if ($defined(this.swfu))
		{
			window.addEvent("unload",function(){this.swfu.destroy();}.bind(this));
		}
	},
	computeProgress:function(){
		var stats = this.swfu.getStats();
		var total = stats.files_queued+stats.in_progress+stats.successful_uploads;
		var percent = (stats.successful_uploads/total)*100;	
		this.bar.tween('width',percent);
	},
	initItem:function(item){
		item.getElements('a.lightbox').each(function(el) {
			el.addEvent("click", function(e) {
				e.stop();
				
				var images = {};
				var spos = 1;
				var grouped = false;
				var group='default';
				this.itemContainer.getElements('a.lightbox').each(function(a){
					var rel = $pick(a.getProperty('rel'),'default'); 
					var title = a.getProperty('title');
					if (!$defined(title) && $defined(a.getFirst())) {
						var title = a.getFirst().getProperty('alt');
					}
					if (!$defined(images[rel]))
						images[rel] = new Array();
					
					if ($defined(title))
						var imgs = [a.getProperty('href'),title];
					else
						var imgs = [a.getProperty('href')];
					images[rel].include(imgs);
					if (el==a) {
						spos = images[rel].length-1;
						group = rel;
					}
				}.bind(this),this);
				//alert(spos+'::'+group+'::'+Json.toString(images));
				Slimbox.open(images[group],spos,{loop:false});
			}.bind(this)); 
		}.bind(this),this);
		item.morph({opacity:1});
		this.fireEvent('afterComplete',item);
	},
	showOverlay:function(busy,options){
		var options = $pick(options,{});
		this.busy = busy;
		if (!$defined(this.overlay)) {
			this.overlay = new Element('div',{'class':'upload_overlay'})
				.injectInside(document.body)
				.setStyles({opacity:0})
				.addEvent('click',function(){this.hideOverlay();}.bind(this))
				;
		}
		var win = window.getCoordinates();
		if (busy) {
			this.overlay.set('morph',{onComplete:function(){
					if (!$defined(this.notifier)){
						this.notifier = new Element('div',{'class':'upload_notifier'})
							.injectInside(document.body)
							.setHTML('System is busy uploading. Please do not navigate away from this page')
							;
					}
					this.notifier.set('morph',{onComplete:function(){
						this.notifier.set('morph',{onComplete:null});
						this.notifier.morph({opacity:1});
					}.bind(this)});
					this.notifier.setStyles({'display':'block',opacity:0.01});
					var coords = this.notifier.getCoordinates();
					this.notifier.morph({left:window.getScrollLeft()+((win.width.toInt()-coords.width.toInt())/2).round(0)});
				}.bind(this)
			});
		} else {
			this.overlay.set('morph',{onComplete:$pick(options.onComplete,function(){})});
		}
		this.overlay.morph({opacity:0.7});
	},
	hideOverlay:function(){
		if (this.busy) return;
		this.overlay.set('morph',{onComplete:null});
		this.overlay.morph({opacity:0});
		if ($defined(this.notifier)) {
			this.notifier.set('morph',{onComplete:function(){
				this.notifier.setStyle('display','none');
			}.bind(this)});
			this.notifier.morph({opacity:0});
		}
	},
	
});

Attachment.filesUpload = Attachment.Uploader.extend({
	initialize:function(settings,options){
		$extend(options,{
			events:{
				queue:function(fileobject){
					this.showOverlay(true);
					Attachment.showSpinner('attachments');
				}.bind(this),
				uploadSuccess:function(data){
					
				}.bind(this),
				uploadComplete:function(stats){
					if (!stats.files_queued){
						this.busy = false;
						this.hideOverlay();
						Attachment.hideSpinner('attachments');
					}
						
				}.bind(this),
				uploadProgress:function(data){
					
				}
			}
		});	
		this.parent(settings,options);
	},
	initItem:function(item){
		
		this.parent(item);
		var del = item.getElement('.remove_item');
		if ($defined(del)){
			del.addEvent('click',function(){this.removeItem(item);}.bind(this));
		}
		var notes = item.getElement('textarea.inputbox');
		if ($defined(notes)) {
			new SPHTML.autoGrow(notes);
		}
		
		var filename = item.getElement('.attachmentName');
		if ($defined(filename)) {
			if($defined($$('.filesempty')[0])) {
				$$('.filesempty')[0].dispose();		
			}	
			filename.addEvent('click',function(e){
				new Event(e).stop();
		
				SqueezeBox.fromElement(filename,{'handler':'iframe'});
			});
		}
		
	},
	removeItem:function(item){
		if (confirm('Attachment will be removed from the list. Proceed?')){
			item.set('morph',{onComplete:function(){
						item.remove();
						if (this.itemContainer.getChildren().length==0) {
							new Element('tr',{'class':'filesempty'})
								.injectInside(this.itemContainer)
								.adopt(new Element('td',{'colspan':4}).setHTML('No Files Available'));
							//alert('its empty');
						}
					}.bind(this)
				});
			item.morph({opacity:0,height:0,width:0});
		}
	},
	editItem:function(item){
		this.showOverlay();
	}
});

Attachment.mediaUpload = Attachment.Uploader.extend({
	initialize:function(settings,options){
		this.indicatorContainer = $(options.indicatorContainer);
		$extend(options,{
			events:{
				queue:function(fileobject){
					this.showOverlay(true);
					Attachment.showSpinner('media');
					var container = new Element('div',{'id':fileobject.id,'class':'upload_indicator'})
						.injectInside(this.indicatorContainer);
					new Element('div',{'class':'upload_cancel'})
						.injectInside(container)
						.addEvent('click',function(){
							this.cancelUpload(fileobject.id);
						});
					new Element('div',{'class':'upload_item'}).injectInside(container).setHTML(fileobject.name);
					new Element('div',{'class':'upload_progress'}).injectInside(container)
						.adopt(
							new Element('div',{'class':'upload_progress_bar'})
							.injectInside(container)
							.setStyles({'width':0})
							.set('morph',{'link':'cancel','unit':'%'})
						);
				}.bind(this),
				uploadSuccess:function(data){
					
					var handler = this.indicatorContainer.getElementById(data.fileObject.id);
					if ($defined(handler)) {
						handler.getElement('.upload_cancel').remove();
						handler.set('morph',{onComplete:function(){
							handler.remove();
						}})
						handler.morph({'height':0,'opacity':0});
					}
				}.bind(this),
				uploadComplete:function(stats){
					if (!stats.files_queued){
						this.busy = false;
						this.hideOverlay();
						Attachment.hideSpinner('media');
					}
						
				}.bind(this),
				uploadProgress:function(data){
					var handler = this.indicatorContainer.getElementById(data.fileObject.id);
					if ($defined(handler)) {
						var bar = handler.getElement('.upload_progress_bar');
						bar.morph({'width':(data.complete/data.total)*100});
					}
				}.bind(this)
			}
		});
		this.parent(settings,options);	
		/*
		window.addEvent('resize',function(){
			this.resetPosition(false,this.modal.getCoordinates());
		}.bind(this));
		*/
	},
	initItem:function(item){
		this.parent(item);
		var tipped = item.getElement('.tipped');
		if ($defined(tipped)) {
			if (!$defined(Tips.instance)) {
				Tips.instance = new Tips([tipped],{maxtitleChars:50, fixed:false});
			} else {
				Tips.instance.parseTitle([tipped]);
				Tips.instance.attach([tipped]);
			}
		}
		var del = item.getElement('.remove_item');
		if ($defined(del)){
			del.addEvent('click',function(){this.removeItem(item);}.bind(this));
		}
		var edit = item.getElement('.lock_edit');
		if ($defined(edit)) {
			edit.addEvent('click',function(){this.editItem(item);}.bind(this));
		}		
	},
	removeItem:function(item){
		if (confirm('Image will be removed from gallery. Proceed?')){
			item.set('morph',{onComplete:function(){item.remove();}});
			item.morph({opacity:0,height:0,width:0});
		}
	},
	editItem:function(item){
		this.showOverlay(false);
		if (!$defined(this.modal)) {
			this.modal = new Element('div',{'class':'imageDescriptionEdit'}).injectInside(document.body);
			this.modalContent = new Element('div').injectInside(this.modal);
			this.modalControl = new Element('div').injectInside(this.modal);
			this.modal.set('morph',{'link':'chain'});
			
			this.scroller = new Fx.Scroll(window);
		}
		
		this.modalContent.empty().setStyle('opacity',0.01);
		this.modalControl.empty().setStyle('opacity',0.01);
		this.modal.addClass('loading').setStyles({display:'block',opacity:1,width:'',height:''});
		this.resetPosition(false);
		
		var description = item.getElement('input[type=hidden]');
		var image = item.getElement('a.lightbox').getProperty('href');
		//alert(Json.toString(image));
		new Element('img',{src:image}).injectInside(this.modalContent).setStyle('border','#ccc 1px solid');
		new Asset.image(image, {onload:function(){		
				var desc = new Element('textarea')
					.set('value',description.getValue())
					.injectInside(this.modalControl)
					;
				var applyDescription = function(){
					var tdesc = desc.getValue();
					description.set('value',tdesc);
					var tip = item.getElement('.tipped');
					if ($defined(tip)) {
						tip.store('tip:text',tdesc);
					}
					var img = item.getElement('img');
					if ($defined(img)) {
						img.set('alt',tdesc);
					}
					this.hideOverlay();
				}.bind(this);
				new Element('div')
					.injectInside(this.modalControl)
					.adopt(SPHTML.iconButton('Apply','accept_item').addEvent('click',applyDescription))
					.adopt(SPHTML.iconButton('Close','cancel_item').addEvent('click',function(){this.hideOverlay();}.bind(this)))
					;
				this.modal.removeClass('loading').setStyles({width:'auto',height:'auto'});
				var coords = this.modal.getCoordinates();
				
				this.modal.setStyles({width:'',height:''});
				
				this.resetPosition(true,coords);
			}.bind(this)
		});
	},
	hideOverlay:function(){
		this.parent();
		if ($defined(this.modal)) {
			this.modal.set('morph',{onComplete:function(){
				this.modal.setStyle('display','none');
			}.bind(this)}).morph({opacity:0});
		}
		
	},
	resetPosition:function(morph,coords){
		if ($defined(this.modal)) {
			var win = window.getCoordinates();
			var stop = window.getScrollTop().toInt();
			
			if (!$defined(coords))
				var coords = this.modal.getCoordinates();
 			
			var position = {
					left:((win.width.toInt()-coords.width.toInt())/2).round(0),
					top:stop+((win.height.toInt()-coords.height.toInt())/2).round(0),
					width:coords.width,
					height:coords.height
				};
				
			if (morph) {
				position.opacity = 1;
				this.modal.set('morph',{onComplete:function(){
						this.modalContent.setStyles({opacity:1});
						this.modalControl.setStyles({opacity:1}); 
						this.modal.set('morph',{onComplete:function(){}});
						this.scroller.toElement(this.modalControl);
						this.modalControl.getElement('textarea').focus();
					}.bind(this)})
				this.modal.morph(position);
			}  else {
				this.modal.setStyles(position);
			} 
		}
	}
});



Attachment.Youtube = new Class({
	Implements:[Events,Options],
	options:{
		itemContainer:'youtubeContainer',
		itemTag:'span',
		itemClass:'property_media',
		categories:[]
	},
	initialize:function(handler,options){
		this.setOptions(options);
		if ($defined(handler)){
			this.handler = handler;
			handler.addEvent('click',function(e){
				new Event(e).stop();
				this.openDialog();
			}.bind(this));
		}
		this.itemContainer = $(this.options.itemContainer);
		this.itemContainer
			.getElements($pick(this.options.itemTag,'div')+'.'+this.options.itemClass)
			.each(function(item){ 
				var mediaData = Json.evaluate(item.getProperty('rev'));
				if ($defined(mediaData)) {
					if (mediaData.type=='youtube') {
						var id = item.getProperty('rel');
						if ($defined(id)) {
							this.loadData(id,item,mediaData);
						}
					}
				}
				
			}.bind(this),this);
		Attachment.setInstance('youtube',this);
	},
	openDialog:function(){
		var options = {
			'handler':'iframe',
			'size':{'x':480,'y':487},
			'url':'index.php?'+Object.toQueryString({
				'option':'com_sp',
				'view':'club',
				'layout':'youtube',
				'tmpl':'component'
			})
		};
		SqueezeBox.fromElement(this.handler,options);
	},
	hasItem:function(id){
		var item = this.itemContainer.getElementById('yt_media_'+id);
		return $defined(item);
	},
	loadData:function(id,container,mediaData){
		var data = {
			'id':id
		};
		
		var onComplete=function(html){
			try {
				var youtubeData = Json.evaluate(html);
			} catch(e) {}
			
			if ($defined(youtubeData)) {
				this.addItem(id,youtubeData,container,mediaData);
			} else {
				alert('Unable to connect with Youtube Server. Please contact System Administrator');
			}
			
		}.bind(this);
		
		var onRequest=function(){
			
		}.bind(this);
		
		var onFailure=function(){
			alert('Unable to connect to server. Please check your internet connection');
		}.bind(this);
		
		var params = {
			'option':'com_sp',
			'controller':'youtube',
			'task':'data',
			'format':'raw',
			'data':data
		};
		
		new Ajax('.',{data:params,onComplete:onComplete,onRequest:onRequest,onFailure:onFailure}).request();
	},
	initItem:function(item){
		var id = item.getProperty('rel');
		var tipped = item.getElement('.tipped');
		if ($defined(tipped)) new Tips([tipped],{maxtitleChars:50, fixed:false});
		var del = item.getElement('.remove_item');
		if ($defined(del)){
			del.addEvent('click',function(){this.removeItem(item);}.bind(this));
		}
		var edit = item.getElement('.lock_edit');
		if ($defined(edit)) {
			edit.addEvent('click',function(){this.editItem(item);}.bind(this));
		}
		var play = item.getElement('.play_video');
		if ($defined(play)) {
			play.addEvent('click',function(){
				this.playVideo(id);
			}.bind(this));
		}
		
		var thumb = item.getElement('img.thumb');
		if ($defined(thumb)) {
			thumb.addEvent('click',function(){
				this.playVideo(id);
			}.bind(this));
		}
	},
	addItem:function(id, data, container, presets){
		if (!$defined(container)) {
			if (this.hasItem(id)) return;
			var container = new Element($pick(this.options.itemTag,'div'),{'class':this.options.itemClass,'id':'yt_media_'+id,'rel':id}).injectInside(this.itemContainer);
		}
		
		var item = new Element('span',{'class':'youtube_item'}).injectInside(container);
		
		var controlsContainer = new Element('span',{'class':'youtube_controls align_center'}).injectInside(item);
		
		var selectContainer = new Element('span',{'class':'column align_center'}).injectInside(item);
		new Element('span',{'html':'Category :'}).injectInside(selectContainer);
		
		var select  = new Element('select',{'name':'data[params][media]['+id+'][category]'}).injectInside(selectContainer);
		//console.log(presets);
		new Element('option',{'value':'','html':'--'}).injectInside(select);
		this.options.categories.each(function(category){
			new Element('option',{'value':category.cat_id,'html':category.name}).injectInside(select);
		}.bind(this),this);
		if($defined(presets))select.set('value',presets.category);
		
		
		SPHTML.iconButton('Title','lock_edit').injectInside(controlsContainer);
		SPHTML.iconButton('Detach','remove_item').injectInside(controlsContainer);
			
		var dataContainer = new Element('span',{'class':'column align_center'}).injectInside(item);
		new Element('input',{'id':'video_'+id,'type':'radio','value':id,'name':'data[params][default_video]'}).injectInside(dataContainer);
		new Element('label',{'for':'video_'+id}).injectInside(dataContainer).setHTML('Default Video');
		new Element('input',{'type':'hidden','name':'data[params][media]['+id+'][type]','value':'youtube'}).injectInside(dataContainer);
		var mediaContainer = new Element('span',{'class':'column align_center'}).injectInside(item);
		if ($defined(data.entry)) {
			if ($defined(presets)) {
				var videoTitle = presets.description;
			} else {
				var title = data.entry.title;
				if ($defined(title)) {
					var videoTitle = title['$t'];
				}
			}
			new Element('input',{'type':'hidden','class':'videoTitle','name':'data[params][media]['+id+'][description]','value':videoTitle}).injectInside(dataContainer);
			
			var media = data.entry['media$group'];
			if ($defined(media)) {
				var thumbs = media['media$thumbnail'];
				if ($defined(thumbs)){
					var thumb = thumbs[1]; //120 x 90
					if ($defined(thumb)){
						var thumbContainer = new Element('span',{'class':'column'}).injectInside(mediaContainer);
						var thumbNail = new Element('img',{'src':thumb.url,'class':'thumb '+($defined(videoTitle)?'tipped':''),'title':$defined(videoTitle)?'Video Title::'+videoTitle:''}).injectInside(thumbContainer);
						new Element('span',{'class':'youtube_controls align_center'}).adopt(SPHTML.iconButton('Play Video','play_video')).injectInside(mediaContainer); 
					}					
				}
			}
			
			
		} 
		
		this.initItem(container);
	},
	removeItem:function(container){
		if (confirm('This will remove attached Youtube Video from the gallery')) {
			container.remove();
		}
	},
	playVideo:function(id){
		
		var playerOptions = {
			'type':'text/html',
			'width':640,
			'height':363,
			'frameborder':0,
			'src':'http://www.youtube.com/embed/'+id
		};
		var options = {
			'handler':'adopt',
			'size':{'x':playerOptions.width,'y':playerOptions.height},
		};
		var player = new Element('iframe',playerOptions);
		SqueezeBox.addEvent('onClose',function(content){
			content.empty();			
		}).fromElement(player,options);
	},
	editItem:function(item){
		var titleEl = item.getElement('.videoTitle');
		if ($defined(titleEl)) {
			var title = titleEl.get('value');
		} else {
			var title = '';
		}
		
		var newTitle = prompt('Video Title',title);
		if ($defined(titleEl)) {
			titleEl.set('value',newTitle);
			var tip = item.getElement('.tipped');
			if ($defined(tip)) {
				tip.store('tip:text',newTitle);
			}
		}
	}
});



YoutubePublic = new Class({
	initialize:function(){
		this.container = $('YouTubeVideos');
		if ($defined(this.container)) {
			this.primaryVideo = this.container.getElement('.primaryVideoContainer');
			
			var items = this.container.getElements('li');
			if (items.length>0) {
				items.each(function(itemContainer){
					var data = Json.evaluate(itemContainer.getProperty('rel'));
					this.loadData(data,itemContainer);
				}.bind(this),this);
			}
		}
	},
	buildItem:function(data,container) {
		
		if ($defined(data.entry)) {
			if ($defined(data.description)) {
				var videoTitle = data.description;
			} else {
				var title = data.entry.title;
				if ($defined(title)) {
					var videoTitle = title['$t'];
				}
			}
			
			var media = data.entry['media$group'];
			if ($defined(media)) {
				var thumbs = media['media$thumbnail'];
				if ($defined(thumbs)){
					var thumb = thumbs[0]; //120 x 90
					if ($defined(thumb)){
						var thumbNail = new Element('img',{'src':thumb.url,'class':'thumb '+($defined(videoTitle)?'tipped':''),'title':$defined(videoTitle)?'Video Title::'+videoTitle:''}).injectInside(container);
						
					}					
				}
			}
			
			this.initItem(container);
		} 
	},
	initItem:function(item){
		var data = Json.evaluate(item.getProperty('rel'));
		var id = data.id;
		var tipped = item.getElement('.tipped');
		if ($defined(tipped)) new Tips([tipped],{maxtitleChars:50, fixed:false});
		
		var thumb = item.getElement('img.thumb');
		if ($defined(thumb)) {
			thumb.addEvent('click',function(){
				this.playVideo(id);
			}.bind(this));
		}
	},
	loadData:function(data,container){	
		var onComplete=function(html){
			try {
				var youtubeData = Json.evaluate(html);
			} catch(e) {}
			if ($defined(youtubeData)) {
				youtubeData.description = data.description;
				this.buildItem(youtubeData,container);
			} else {
				alert('Unable to connect with Youtube Server. Please contact System Administrator');
			}
			
		}.bind(this);
		
		var onRequest=function(){
			
		}.bind(this);
		
		var onFailure=function(){
			alert('Unable to connect to server. Please check your internet connection');
		}.bind(this);
		
		var params = {
			'option':'com_sp',
			'controller':'youtube',
			'task':'data',
			'format':'raw',
			'data':data
		};
		
		new Ajax('.',{
			data:params,
			onComplete:onComplete,
			onRequest:onRequest,
			onFailure:onFailure
			}).request();
	},
	playVideo:function(id){
		var playerOptions = {
			'type':'text/html',
			'width':625,
			'height':363,
			'frameborder':0,
			'src':'http://www.youtube.com/embed/'+id
		};
		this.primaryVideo.empty().adopt(new Element('iframe',playerOptions));
	}
});