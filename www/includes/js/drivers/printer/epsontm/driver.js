var EpsontmPrinterDriver = new Class({
	Implements:[Events,Options],
	options:{
		timeout:60000,
	},
	models:{
		generic:{
			name:'Generic',
			cols:48,
			width:576
		},
		TMT81:{
			name:'TM-T81',
			cols:48,
			width:576
		},
		TMP20:{
			name:'TM-P20',
			cols:32,
			width:354
		}
	},
	initialize:function(driver,options){
		this.driver = driver;
		this.setOptions(options);
		this.device = new epson.ePOSDevice();
	},
	getModel:function(){
		return $merge(this.models.generic,this.models[$pick(this.driver.model,'generic')]);
	},
	test:function(){
		console.log(this.getModel());
		TPH.loadAsset('Print',function(){
			this.print([
				Print.Text('Welcome to the world of Wizaya!',{
					size:'FONT_SIZE_LARGE',
					alignment:'ALIGN_CENTER'
				}),
				Print.Newline(),
				Print.Newline(),
				Print.Text('Device Details',{
					size:'FONT_SIZE_NORMAL',
					alignment:'ALIGN_LEFT'
				}),
				Print.Newline(),
				Print.Line(),
				Print.Text('Device :'+this.driver.device),
				Print.Newline(),
				Print.Text('Driver :'+this.driver.driver),
				Print.Newline(),
				Print.Text('Printer Name :'+this.driver.name),
				Print.Newline(),
				Print.Text('IP Address :'+this.driver.ip+':'+this.driver.port),
				Print.Newline(),
				Print.Doubleline(),
				Print.Text('- End of Print -',{
					alignment:'ALIGN_CENTER'
				}),
				Print.Newline(),
				Print.Newline(),
				Print.Newline(),
				Print.Cut()
			]);	
		}.bind(this));
	},
	print:function(data){
		this.$printData = data;
		var driver = this.driver;
		this.device.connect(driver.ip, driver.port.toInt(), function(data) {
			console.log('Connecting',data);
		    if(data == 'OK' || data == 'SSL_CONNECT_OK') {
		        this.device.createDevice(driver.name, this.device.DEVICE_TYPE_PRINTER,
		                              {'crypto':false, 'buffer':false}, function(devobj, retcode) {
		                              	console.log('Create Device',devobj,retcode);
									    if( retcode == 'OK' ) {
									        this.printerDevice = devobj;
									        this.printerDevice.timeout = this.options.timeout;
									        this.printerDevice.onreceive = function (res) {
									        	this.fireEvent('onReceive',[res,this]);
								        	}.bind(this);
									        this.printerDevice.oncoveropen = function () { 
									        	alert('coveropen'); 
								        	};
									        this.printRoutine();
									    } else {
									    	this.fireEvent('onPrintError',[retcode,this]);
									    }
									}.bind(this));
		    } else {
		    	this.fireEvent('onConnectFailure',[data,this]);
		    }
		}.bind(this),{
			eposprint:true
		});
	},
	getImages:function(){
		this.$imageIndex = {};
		var images = new Array();
		this.$printData.each(function(data){
			if (data.type=='image') {
				if (!images.contains(data.content)) {
					images.include(data.content);
					this.$imageIndex[data.content] = data;
				}
			}
		}.bind(this));
		return images;
	},
	preloadImages:function(images,onLoad){
		if (images.length) {
			var model = this.getModel();
			var image = images.shift();
			var data = this.$imageIndex[image];
			console.log('Loading ',image);
			new Asset.image(image,{
				onLoad:function(img){
					var ratio = img.naturalWidth/model.width;
					var height = img.naturalHeight*ratio;
					data.canvas = new Element('canvas',{width:model.width,height:height}).inject(window.document.body);
					data.context = data.canvas.getContext('2d');
					data.context.drawImage(img, 
									0, 0, img.width, img.height,     // source rectangle
                   					0, 0, data.canvas.width, data.canvas.height);
   					this.preloadImages(images,onLoad);
				}.bind(this)
			});
		} else {
			console.log('All Images Loaded');
			if ($type(onLoad)=='function') {
				onLoad();
			}
		}
	},
	printRoutine:function(){
		var images = this.getImages();
		// Preload Images
		this.preloadImages(images,function(){
			this.$printData.each(function(data){
				var f = '_print'+data.type.ucfirst();
				if ($defined(this[f])) {
					this[f](data);
				}
			}.bind(this));
			console.log(this.$printData);
			this.printerDevice.send();
			var images = new Hash(this.$imageIndex);
			if (images.getLength()) {
				images.each(function(data){
					data.canvas.destroy();
				});
			}
		}.bind(this));
		
		
	},
	_printText:function(data){
		this.printerDevice.addTextSize(1,1);
		switch(data.size){
			case 'FONT_SIZE_NORMAL':
				this.printerDevice.addTextDouble(false,false);
				break;
			case 'FONT_SIZE_WIDE':
				this.printerDevice.addTextDouble(true,false);
				break;
			case 'FONT_SIZE_TALL':
				this.printerDevice.addTextDouble(false,true);
				break;
			case 'FONT_SIZE_LARGE':
				this.printerDevice.addTextDouble(true,true);
				break;
			default:
				if ($type(data.size)=='array') {
					this.printerDevice.addTextSize(data.size[0].toInt(),data.size[1].toInt());
				}
		}
		switch(data.alignment){
			case 'ALIGN_LEFT':
				this.printerDevice.addTextAlign(this.printerDevice.ALIGN_LEFT);
				break;
			case 'ALIGN_RIGHT':
				this.printerDevice.addTextAlign(this.printerDevice.ALIGN_RIGHT);
				break;
			case 'ALIGN_CENTER':
				this.printerDevice.addTextAlign(this.printerDevice.ALIGN_CENTER);
				break;	
		}
		this.printerDevice.addText(data.content);
	},
	_printImage:function(data){
		//this.printerDevice.brightness = 1.0;
		//this.printerDevice.halftone = this.printerDevice.HALFTONE_ERROR_DIFFUSION;
		this.printerDevice.addImage(data.context,0,0,data.canvas.width,data.canvas.height,this.printerDevice.COLOR_1,this.printerDevice.MODE_MONO);
	},
	_printNewline:function(){
		this.printerDevice.addFeed();
	},
	_printLine:function(){
		var model = this.getModel();
		this._printText({content:'-'.repeat(model.cols)});
		this._printNewline();
	},
	_printDoubleline:function(){
		var model = this.getModel();
		this._printText({content:'='.repeat(model.cols)});
		this._printNewline();
	},
	_printCut:function(){
		this.printerDevice.addCut(this.printerDevice.CUT_FEED);
	}
});
