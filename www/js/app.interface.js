App.Interface={
	Log:new Class({
		initialize:function(){
			var oldConsoleLog = console.log;
			var isFunction = function(obj) {
			  return !!(obj && obj.constructor && obj.call && obj.apply);
			};
			
			var stackLimit = 3;
			
			var arrayToString = function(arr, level) {
				var level = $pick(level,0);
				if (level>stackLimit) {
					return '(Stack Limit Reached)';
				}  
				var spacer = level?"\t".repeat(level):'';
				var lines = new Array();
				arr.each(function(val){
					if (!isFunction(val)) {
						if($defined(val)) {
							switch($type(val)){
								case 'array':
									val = arrayToString(val,level+1);
									break;
								case 'object':
									val = objectToString(val,level+1);
									break;
								case 'string':
									val = '"'+val+'"';
									break;
							}	
						} else {
							val = 'null';
						}
						lines.push(spacer+"\t"+val);	
					}
				});
				var content = lines.length?lines.join(",\n"):'';
				var glue = lines.length?"\n":"";
				return ['Array [',content,(lines.length?spacer:'')+']'].join(glue);
			};
			
			var objectToString = function(obj, level) {
				var level = $pick(level,0);
				if (level>stackLimit) {
					return '(Stack Limit Reached)';
				}
				var spacer = level?"\t".repeat(level):'';
				var lines = new Array();
				for(var key in obj) {
					var val = obj[key];
					if (!isFunction(val)) {
						if($defined(val)) {
							switch($type(val)){
								case 'array':
									val = arrayToString(val,level+1);
									break;
								case 'object':
									val = objectToString(val,level+1);
									break;
								case 'string':
									val = '"'+val+'"';
									break;
							}	
						} else {
							val = 'null';
						}
						
						lines.push(spacer+"\t"+key+' : '+val);	
					}
				}
				var content = lines.length?lines.join(",\n"):'';
				var glue = lines.length?"\n":"";
				return ['Object {',content,(lines.length?spacer:'')+'}'].join(glue);
			};
			
			console.log = function(){
				var error = new Error();
				var callerLine = error.stack.split("\n")[3];
				if ($defined(callerLine)) {
					var callerIndex = callerLine.indexOf("at ");
					var lineNumber = callerLine.slice(callerIndex+2, callerLine.length).trim();
			
					var lines = new Array();
					for(var i=0;i<arguments.length;i++) {
						var arg = arguments[i];
						var type = $type(arg);
						//oldConsoleLog(' - '+type+' - ');
						switch(type) {
							case 'array':
								lines.push(arrayToString(arg));
								break;
							case 'object':
								lines.push(objectToString(arg));
								break;
							default:
								lines.push(arg);
						}
					}
					oldConsoleLog(lineNumber+"\n"+(lines.length?lines.join("\n"):''));
				} else {
					oldConsoleLog.apply(null,arguments);
				}
				
			};
		}
	})
};