App.Localizer = new Class({
	Implements:[Events,Options],
	options:{
		overwrite:false
	},
	initialize:function(fileSystem,options){
		this.$fileSystem = fileSystem;
		this.setOptions(options);
		this.$items = new Array();
	},
	add:function(item){
		this.$items.push(item);
		return this;
	},
	setItems:function(items){
		this.$items = items;
		//console.log('Localizer setItems:',this.$items);
		return this;
	},
	getItems:function(){
		return this.$items;
	},
	clear:function(){
		this.$items.empty();
		return this;
	},
	download:function(){
		this.fireEvent('onBeforeDownload',[this]);
		this.execute(this.getItems(),function(){
			this.clear();
			//console.log('Localizetion Complete ');
			this.fireEvent('onDownloadComplete',[this]);
		}.bind(this));
		return this;
	},
	/*
	localizeLinks:function(url,content){
		var oldHost = url.toURI().set('directory','').set('file','').toString(),
			newHost = dirEntry.toURL().replace(base,'');	 				
		var regexp = /url\(\s*(['"]?)(.*?)\1\s*\)/ig; //RegExp('url\(\'([^\']+)\'\)','gi');
		var urls = new Array();
		var exts = ['eot','woff','woff2','ttf','svg'];
		while((match=regexp.exec(result))!==null) {
			var uri = match[2].toURI();
			var file = uri.get('file');
			var ext = file.split('.').pop();
			if (exts.contains(ext)) {
				urls.push({
					source:match[2],
					target:match[2].replace(oldHost,'/'+newHost),
					url:base+match[2].replace(oldHost,newHost)
				});
			}
		}
	},
	*/
	request:function(item,onRequest,onError){
		var req = new XMLHttpRequest();
		req.open('GET',item.source,true);
		req.responseType = 'blob';
		req.addEventListener('readystatechange',function(e){
			//console.log(req);
			if (req.readyState == 4) {
				switch(req.status){
					case 200:
						if ($type(onRequest)=='function'){
							onRequest(req.response);
						}
						break;
					case 404:
						if ($type(onError)=='function') {
							onError();
						}
						break;		
				}
			}
		}.bind(this));
		req.addEventListener('error',function(e){
			if ($type(onError)=='function') {
				onError();
			}
		}.bind(this));
		req.send();
	},
	execute:function(list,onComplete){
		if (list.length) {
			var item = list.shift();
			console.log('Localizer check file : ',item.source);
			this.$fileSystem.getEntry(item.target,function(fileEntry){
				console.log('Localizer file exists ',item.target);
				this.fireEvent('onExist',[item,fileEntry,this]);
				if (this.options.overwrite) {
					this.request(item,function(blob){
						this.process(item,blob,function(item,blob){
							//console.log('Processed ',item.source,item.target);
							this.save(item,blob,function(){
								this.execute(list,onComplete);
							}.bind(this));
						}.bind(this));
					}.bind(this),function(){
						this.execute(list,onComplete);
					}.bind(this));	
				} else {
					this.execute(list,onComplete);
				}	
				
			}.bind(this),function(){
				console.log('Locallizer file does not exist ',item.target);
				this.request(item,function(blob){
					this.process(item,blob,function(item,blob){
						this.save(item,blob,function(){
							this.execute(list,onComplete);
						}.bind(this));
					}.bind(this));
				}.bind(this),function(){
					this.execute(list,onComplete);
				}.bind(this));
			}.bind(this));		
		} else if ($type(onComplete)=='function'){
			//console.log('Execute Complete');
			onComplete();
		}
		return this;
	},
	save:function(item,blob,onSave){
		var uri = item.source.toURI();
		var directory = uri.get('directory'),
			file = uri.get('file');
		//var ext = file.split('.').pop();
		//console.log(file,blob);
		/*
		console.log('Localizer Save : ',{
			item:item,
			uri:uri,
			directory:directory,
			file:file
		});
		*/
		this.fireEvent('onBeforeSave',[item,blob,this]);
		this.$fileSystem.getDirectory(this.$fileSystem.getBaseEntry(),directory,true,function(dirEntry){
			console.log('Saving to local '+item.source+' >> '+item.target);
			//console.log('Directory Entry',dirEntry);
			this.$fileSystem.createFile(dirEntry,{
				name:file,
				blob:blob
			},function(fileEntry){
				$extend(item,{
					internal:fileEntry.toInternalURL()
				});
				if ($type(item.onLocalize)=='function') {
					item.onLocalize(item,fileEntry);
				}
				if ($type(onSave)=='function') {
					onSave(item,fileEntry);
				}
				this.fireEvent('onSave',[item,fileEntry,this]);
				//console.log('Save File Success',fileEntry,item);
			}.bind(this),function(e){
				//console.log('Save File Error',directory,file);
				//console.log(e);
				this.fireEvent('onSaveFileError',[directory,file,item,e,this]);
			}.bind(this));	
		}.bind(this),function(e){
			//console.log('Save Directory Error',directory);
			//console.log(e);
			this.fireEvent('onSaveDirectoryError',[directory,item,e,this]);
		}.bind(this));
		return this;
	},
	process:function(item,blob,onProcess){
		var uri = item.target.toURI();
		var directory = uri.get('directory'),
			file = uri.get('file');
		var handler = App.Localizer.Handler;
		 
		var ext = file.split('.').pop();
		//console.log('Localizing ',item.source,blob.type);
		
		switch(blob.type){
			case 'text/css':
				handler = App.Localizer.CSS;
				break;
			case 'application/javascript':
			case 'application/ecmascript':
			case 'text/javascript':
			case 'text/ecmascript':
				handler = App.Localizer.JS;
				break;
			default:
				break;
		}
		new handler(this.$fileSystem,item,blob,{
			overwrite:this.options.overwrite,
			onComplete:onProcess
		});
		return this;
	}
});

App.Localizer.Handler=new Class({
	Implements:[Events,Options],
	initialize:function(fileSystem,item,blob,options){
		this.setOptions(options);
		this.$fileSystem = fileSystem;
		this.$item = item;
		this.$blob = blob;
		this.handle();
	},
	handle:function(){
		this.fireEvent('onComplete',[this.$item,this.$blob,this]);
	}
});
App.Localizer.CSS = new Class({
	Extends:App.Localizer.Handler,
	cleanPath:function(target,source){
		var targetPath = target.split('/');
		var result = target;
		if (targetPath[0]=='..') {
			var targetFile = targetPath.pop();
			var sourcePath = source.split('/').filter(function(item,i){ return item.length>0 || !i ;});
			
			//console.log('** Clean',target,source);
			//console.log('** Clean Source',sourcePath);
			//console.log('** Clean Target',targetPath);
			
			targetPath.each(function(part){
				switch(part){
					case '..':
						sourcePath.pop();
						break;
					default:
						sourcePath.push(part);
				}
			});	
			result = sourcePath.join('/')+'/'+targetFile;
		} 
		//console.log('** Clean Result',result);
		return result;
	},
	handle:function(){
		var base = this.$fileSystem.getBase(),
			source = this.$item.source.toURI();
		
		var sourcePath = source.get('directory'),
			ext = source.get('file').split('.').pop();
		
		var reader = new FileReader();
        reader.onloadend = function() {	
            var content = reader.result;
            var regexp = /url\(\s*(['"]?)(.*?)\1\s*\)/ig; //RegExp('url\(\'([^\']+)\'\)','gi');
			var urls = new Array();
			var exts = ['eot','woff','woff2','ttf','svg','png','jpg','gif'];
			while((match=regexp.exec(content))!==null) {
				var assetPath = this.cleanPath(match[2],source.get('directory')).toURI();
				var assetDirectory = assetPath.get('directory');
				var assetFile = assetPath.get('file');
				
				var ext = assetFile.split('.').pop();
				
				if (exts.contains(ext)) {
					var target = assetDirectory+assetFile;
					var asset = this.$item.source.toURI();
					asset.set('directory',assetDirectory).set('file',assetFile);
					var item = {
						asset:match[2],
						source:asset.toString(),
						target:target, //match[2].replace(oldHost,newHost),
						url:'/'+base+target //match[2].replace(oldHost,newHost)
					};
					//console.log('***CSS Asset',item);
					urls.push(item);
				}
			}
			//console.log('CSS Assets',Json.encode(urls));
			if (urls.length) {
				new App.Localizer(this.$fileSystem,{
					overwrite:this.options.overwrite,
					onSave:function(item,fileEntry){
						content = content.replace(new RegExp(item.asset, 'g'),fileEntry.toURL());
					}.bind(this),
					onDownloadComplete:function(){
						this.fireEvent('onComplete',[this.$item,new Blob([content],{type:'text/css'}),this]);	
					}.bind(this)
				}).setItems(urls).download();	
			} else {
				this.fireEvent('onComplete',[this.$item,this.$blob,this]);
			}
        }.bind(this);
        reader.readAsText(this.$blob);
	}
});
App.Localizer.JS = new Class({
	Extends:App.Localizer.Handler,
	options:{
		excludedExtensions:['map']
	},
	handle:function(){
		var base = this.$fileSystem.getBase(),
			source = this.$item.source.toURI();
		
		var ext = source.get('file').split('.').pop();
		
		//console.log('Localizer JS Handler',this.$item,ext);
    	if (!this.options.excludedExtensions.contains(ext)) {
    		var reader = new FileReader();
	        reader.onloadend = function() {
	        	var oldHost = this.$item.source.toURI().set('directory','').set('file','').toString(),
					newHost = '/'+base+'/'; //this.$fileSystem.getRoot().toURL().replace(base,'');
					
	            var content = reader.result;
	            var regexp = /\/\/\# sourceMappingURL=(.*?)\.map/igm; //RegExp('url\(\'([^\']+)\'\)','gi');
				var urls = new Array();
				while((match=regexp.exec(content))!==null) {
					var sourceFile = source.set('file',match[1]+'.map').toString();
					var item = {
						source:sourceFile,
						target:sourceFile.replace(oldHost,newHost)
					};
					urls.push(item);
				}
				
				if (urls.length) {
					new App.Localizer(this.$fileSystem,{
						overwrite:this.options.overwrite,
						onDownloadComplete:function(){
							this.fireEvent('onComplete',[this.$item,this.$blob,this]);	
						}.bind(this)
					}).setItems(urls).download();
				} else {
					this.fireEvent('onComplete',[this.$item,this.$blob,this]);	
				}
	        }.bind(this);
	        reader.readAsText(this.$blob);	
        } else {
        	this.fireEvent('onComplete',[this.$item,this.$blob,this]);	
        }			
	}
});
