App.FileSystem=new Class({
	Implements:[Events,Options],
	options:{
		base:'/',
		quota:100,
		storage:'PERSISTENT'
	},
	initialize:function(options){
		this.setOptions(options);
		window.requestFileSystem(LocalFileSystem[this.options.storage], this.getQuota(), function (fileSystem) {
			console.log('Filesystem Ready',cordova.file);
			this.$rootEntry = fileSystem.root;
			this.$base = this.options.storage.toLowerCase()+(this.options.base!='/'?this.options.base:'');
			
			console.log('file system open: ' + fileSystem.name);
			console.log(fileSystem);
			this.$rootEntry.getDirectory(this.options.base,{
				create:true
			},function(dirEntry){
				console.log('Base Directory',this.options.base,dirEntry);
				this.$baseEntry = dirEntry;
				this.fireEvent('onReady',[this]);
				
				/*
				if (this.options.base!='/') {
					this.getDirectory(dirEntry,this.options.base,true,function(dirEntry){
						console.log(dirEntry);
						this.$baseEntry = dirEntry;
						this.fireEvent('onReady',[this]);
					}.bind(this));	
				} else {
					console.log(dirEntry);
					this.$baseEntry = dirEntry;
					this.fireEvent('onReady',[this]);
				}
				*/
			}.bind(this),function(e){
				console.log(e);
			}.bind(this));
			
		}.bind(this), function(){
			console.log('ON Request File System Error',arguments);
		}.bind(this));
	},
	getQuota:function(){
		return this.options.quota*1024*1024; 
	},
	getRootEntry:function(){
		return this.$root;
	},
	getBaseEntry:function(){
		return this.$baseEntry;
	},
	isEmpty:function(onEmpty,onNotEmpty){
		this.readDirectory(this.getBaseEntry(),false,function(entries){
			console.log('isEmpty',entries.length);
			if (entries.length) {
				if ($type(onNotEmpty)=='function') {
					onNotEmpty();
				}
			} else {
				if ($type(onEmpty)=='function') {
					onEmpty();
				}
			}
		}.bind(this));
	},
	clear:function(onClear,onError){
		this.readDirectory(this.getBaseEntry(),false,function(entries){
			this.deleteEntries(entries,onClear,onError);	
		}.bind(this),onError);
		return this;
	},
	deleteEntries:function(entries,onComplete,onError){
		if (entries.length) {
			var entry = entries.shift();
			if (entry.isFile) {
				this.deleteFile(entry,function(){
					this.deleteEntries(entries,onComplete,onError); 
				}.bind(this),onError);
			} else {
				this.deleteDirectory(entry,function(){
					this.deleteEntries(entries,onComplete,onError);
				}.bind(this),onError);
			}
		} else if ($type(onComplete)=='function') {
			onComplete();
		}
	},
	getStorageDirectory:function(){
		return cordova.file[this.options.storage=='PERSISTENT'?'dataDirectory':'cacheDirectory'];
	},
	getBase:function(){
		return this.$base;
	},
	getCDV:function(path){
		return 'cdvfile://localhost/'+this.getBase()+path;
	},
	getEntry:function(path,onSuccess,onError){
		//var name = path.charAt(0)=='/'?this.getBase()+path.substr(1):path;
		//console.log('FileSystem:Get Entry',path);
		var name = this.getCDV(path);
		
		//console.log('FileSystem:getEntry:',{
		//	path:path,
		//	name:name
		//});
		window.resolveLocalFileSystemURL(name,onSuccess,onError);
		return this;
	},
	createFile:function(dirEntry, fileData, onCreate, onError) {
		dirEntry.getFile(fileData.name, {create: true, exclusive: false}, function(fileEntry) {
	        fileEntry.createWriter(function (fileWriter) {
	        	//console.log('Create File '+fileData.name);
		        fileWriter.onwriteend = function() {
		            //console.log("Successfull file write "+fileData.name);
		            //this.readFile(fileEntry, onCreate, onError);
		            if ($type(onCreate)=='function') {
		            	onCreate(fileEntry);
		            }	
		        }.bind(this);
		
		        fileWriter.onerror = onError;
		        
		        //console.log($defined(fileData.blob));
		        //console.log('Blob',fileData.blob);
		        var dataObj = $defined(fileData.blob)?fileData.blob:new Blob(fileData.content, { type: $pick(fileData.type,'text/plain') });
				//console.log(dataObj);
		        fileWriter.write(dataObj);
		    }.bind(this));
	    }.bind(this), onError);
	    return this;
	},
	readFile:function(fileEntry, onRead, onError) {
    	fileEntry.file(function (file) {
	        var reader = new FileReader();
	        reader.onloadend = function() {
	            //console.log("Successful file read: " + this.result);
	            //displayFileData(fileEntry.fullPath + ": " + this.result);
	            onRead(this.result);
	        };
	        reader.readAsText(file);
	    }, onError);
	    return this;
	},
	deleteFile:function(fileEntry, onDelete, onError){
		fileEntry.remove(onDelete, onError);
	    return this;
	},
	recurseDirectory:function(dirEntry,paths,onFinished,onError){
		if (paths.length) {
			var path = paths.shift();
			dirEntry.getDirectory(path,{
				create:true
			},function(newDirEntry){
				this.recurseDirectory(newDirEntry,paths,onFinished,onError);
			}.bind(this),onError);	
		} else if ($type(onFinished)=='function') {
			//console.log(dirEntry);
			//console.log('Directory found '+dirEntry.name);
			onFinished(dirEntry);
		}
	},
	getDirectory:function(dirEntry,name,autoCreate,onGet,onError){
		var $paths = new Array();
		name.split('/').each(function(part){
			if (part.length) {
				$paths.push(part);
			}
		}) ;
		
		if (autoCreate) {
			this.recurseDirectory(dirEntry,$paths,onGet,onError);
		} else {
			dirEntry.getDirectory(name,{
				create:$pick(autoCreate,false)
			},onGet,onError);	
		}
		
		return this;
	},
	createDirectory:function(dirEntry,name,onCreate,onError){
		this.getDirectory(dirEntry,true,onCreate,onError);
		return this;
	},
	readDirectory:function(dirEntry,recursive,onRead,onError){
		//console.log('Read Directory ',dirEntry.toURL());
		var reader = dirEntry.createReader();
		var entries = new Array();
		reader.readEntries(function(results){
			results.each(function(result){
				entries.push(result);
				if ($pick(recursive,false) && result.isDirectory) {
					result.children = this.readDirectory(result,true);
				}
			}.bind(this));
			if ($type(onRead)=='function') {
				onRead(entries);
			}
		}.bind(this),onError);
		//console.log(entries);
		return entries;
	},
	deleteDirectory:function(dirEntry,onFinished){
		dirEntry.removeRecursively(onFinished,onFinished);
		return this;
	}
});

$extend(App.FileSystem,{
	$instances:{},
	getInstance:function(storage,options){
		var storage = $pick(storage,'PERSISTENT');
		if (!$defined(App.FileSystem.$instances[storage])) {
			App.FileSystem.$instances[storage] = new App.FileSystem($merge({
				storage:storage
			},options));
		}
		return App.FileSystem.$instances[storage];
	}
});