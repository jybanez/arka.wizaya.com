window.FileBlob = window.File;
(function(){
	Events.implement({
	    /*
		used to check if a type of event has been set
	    */
	    hasEvent: function(type) {
	        try {
	            var evs = this.retrieve('events', {});
	            if(!evs || !evs[type])
	                return false;
	            return true;
	        } catch(err) {
	            return $chk(this.$events[type]);
	        }
	    }
	});
	
	/*
	var clean = function(item){
		var uid = item.uniqueNumber;
		if (item.removeEvents) item.removeEvents();
		if (item.clearAttributes) item.clearAttributes();
		if (uid != null){
			delete collected[uid];
			delete storage[uid];
		}
		return item;
	};
	*/
	
	//var oldDestroy = ;
	//Element.implement({
	//	oldDestroy:Element.destroy
	//});
	//console.log(Element.dispose);
	//Element.dispose = function(){
	//	
	//};
	/*
	Element.implement({
		dispose: function(){
			console.log('DESTROY',this.$elements);
			if ($defined(this.$elements)) {
				
				this.$elements.each(function(el){
					console.log('DESTROY',$type(el),el.destroy);
					if ($type(el.destroy)=='function') {
						el.destroy();
					}	
				});
			}
			return (this.parentNode) ? this.parentNode.removeChild(this) : this;
		}
	});
	*/
	var oldSet = Element.set;
	Element.implement({
		set:function(prop, value){
			var property = Element.Properties[prop];
			(property && property.set) ? property.set.call(this, value) : this.setProperty(prop, value);
			this.fireEvent('onSetProperty',[prop,value]);
		}.overloadSetter(),
		print:function(){
			var head = document.id(window.document.head),
				stylesheets = new Array(),
				styles = new Array();
				
			head.getElements('link[rel="stylesheet"]').each(function(stylesheet){
				stylesheets.push(stylesheet.outerHTML);
			});
			head.getElements('style').each(function(style){
				styles.push(style.outerHTML);
			});
			var size = window.getSize();
			var width = 816; //(size.x-20)
			var printWindow = window.open("", "printWindow",'width='+width+',height='+(size.y-20)+',top=10,left=10');
			if ($defined(printWindow)) {
				var html = ['<!DOCTYPE html>',
							'<html>',
							'<head>',
							'<title>' + document.title  + '</title>',
							stylesheets.join(''),
							styles.join(''),
							'<style>.printable {padding:4em;}</style>',
							'</head>',
							'<body class="printable">',
							this.outerHTML,
							'<script type="text/javascript">'
								+'setTimeout(function () { '
								+'window.print();'
								+'window.close();'
								+' }, 1000);'
							+'</script>',
							'</body>',
							'</html>'];
				printWindow.document.clear();
				printWindow.document.write(html.join('')); 
			} else {
				TPH.alert('System Message','Sorry. Printing is not available for your device.');
			}
		}
	});
})();

var TPH = $pick(TPH,{});
$extend(TPH,{
	version:'1.0 Beta',
	Connectivity: {
		invalidResponse:function(message){
			TPH.alert('<i class="fa fa-exclamation-circle"></i> Unexpected Server Response',String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
		},
		noConnection:function(message){
			TPH.alert('<i class="fa fa-exclamation-circle"></i> Connectivity Error',$pick(message,'Unable to connect to server. Please check your internet connection'));
		}
	},
	confirm:function(caption,message,onOk,onCancel,onContent,options){
		var options = $pick(options,{});
		var params = $merge({
			caption:caption,
			closable:false
		},$pick(options,{}));
		var awin = TPH.getWindow('$$confirm$$',$merge(params,{
			onClose:function(win){
				win.content.empty();
			}
		})).open(function(win){
			win.setCaption(caption);
			win.content.setStyles({'height':'','width':''});
			win.messageContainer = new Element('div',{'class':$pick(options.messageClass,'confirmMessage')})
									.injectInside(win.content)
									.setStyles({'max-width':600})
									.set('html',message);
			if ($type(onContent)=='function') {
				onContent(win.messageContainer,win);	
			}
			
			var alertControls = new Element('li',{'class':$pick(options.controlsClass,'confirmControls')})
								.injectInside(new Element('ul',{'class':'fieldList spaced border_top'}).injectInside(win.content));
			win.messageActions = new Element('div',{'class':'actions padded'}).injectInside(alertControls);
			win.messageControl = new Element('div',{'class':'controls padded align_right'}).injectInside(alertControls);
			
			
			TPH.button($pick(options.okText,'Ok'),{'class':'btn '+$pick(options.okButton,'primary rounded')}).injectInside(win.messageControl)
				.addEvent('click',function(e){
					e.stop();
					win.close(onOk);
				});
			TPH.button($pick(options.cancelText,'Cancel'),{'class':'btn '+$pick(options.cancelButton,'default pretty')}).injectInside(win.messageControl)
				.addEvent('click',function(e){
					e.stop();
					win.close(onCancel);
				});
			var wsize = window.getSize();
			win.messageContainer.setStyle('max-height',wsize.y-150);
			win.toTop().toCenter(true);
		},true);
	},
	alert:function(caption,message,onOk,onContent,options){
		var params = $merge({
			caption:caption,
			closable:false
		},$pick(options,{}));
		var awin = TPH.getWindow('$$alert$$',$merge(params,{
			onCreate:function(win){
				win.content.setStyles({'height':'','width':''});
				win.messageContainer = new Element('div',{'class':'alertMessage'}).injectInside(win.content).setStyles({'max-width':600});
				
				var alertControls = new Element('li',{'class':'alertControls'})
									.injectInside(new Element('ul',{'class':'fieldList spaced border_top'}).injectInside(win.content));
				win.messageActions = new Element('div',{'class':'actions padded_small'}).injectInside(alertControls);
				win.messageControl = new Element('div',{'class':'controls padded_small align_right'}).injectInside(alertControls);
				
				
				TPH.button('Ok',{'class':'btn primary medium wide rounded'}).injectInside(win.messageControl)
					.addEvent('click',function(e){
						e.stop();
						win.close(win.onOk);
					});
				
				window.addEvent('resize',function(){
					var wsize = window.getSize();
					win.messageContainer.setStyle('max-height',wsize.y-150);
				});
				var wsize = window.getSize();
				win.messageContainer.setStyle('max-height',wsize.y-150);
				(function(){ win.toCenter(true); }).delay(100);
			}
		}));
		if ($type(message)=='object'){
			var controls = message.actions;
			var message = message.message;
		} 
		if ($defined(controls)) {
			awin.messageActions.set('html',controls);
		}
		awin.messageContainer.set('html',message);
		if ($defined(onContent)) {
			onContent(awin.messageContainer,awin);
		}
		awin.onOk = onOk;
		
		awin.toTop().setCaption(caption).open(function(){
			var win = TPH.getWindow('$$alert$$');
			win.content.setStyles({'height':'','width':''});
			(function(){ win.toTop().toCenter(true); }).delay(100);
		});
	},
	hasWindow:function(name){
		if (!$defined(TPH.windows)) return false;
		return TPH.windows.has(name);
	},
	getWindow:function(name,options){
		if (!$defined(TPH.windows)) {
			TPH.windows = new Hash();
		}
		if (!TPH.windows.has(name)) {
			TPH.windows.set(name,new TPH.window(options));
		}
		var win = TPH.windows.get(name);
		var options = $pick(options,{});
		win.setContainment($pick(options.containment,window.document.body));
		return win;
	},
	unsetWindow:function(name){
		if ($defined(TPH.windows)) {
			if (TPH.windows.has(name)) {
				TPH.windows.get(name).destroy();
				TPH.windows.erase(name);
			}
		}
	},
	button:function(label,options,params) {
		var button = new Element($defined(params)?$pick(params.tag,'span'):'span',options)
						.addClass('btn')
						.adopt(new Element('span').set('html',label))
						;
		if ($defined(params)) {
		    for(key in params){
		        if (key!='tag') {
		            button.setProperty(key,params[key]);
		        }
		        
		    }
		}
		return button;
	},
	iconButton:function(label,bclass,options,params) {
		var button = new Element($defined(params)?$pick(params.tag,'span'):'span',options)
						.addClass('btn')
						.adopt(new Element('span').set('html','<i class="fa fa-'+bclass+'"></i> '+label))
						;
		if ($defined(params)) {
            for(key in params){
                if (key!='tag') {
                    button.setProperty(key,params[key]);
                }
                
            }
        }
		return button;
	},
	ordinal:function($number) {
		var $number = $type(number)=='string'?$number.toInt():$number;
        $ends = ['th','st','nd','rd','th','th','th','th','th','th'];
        if ((($number % 100) >= 11) && (($number%100) <= 13))
            return $number+'th';
        else
            return $number+$ends[$number % 10];
   	},
   	getCountry:function(code,$countrySource){
   		var count = $countrySource.length;
   		for(var i=0;i<count;i++){
   			if (code==$countrySource[i].code) {
   				return $countrySource[i];
   			}
   		}
   	},
   	getCountryCode:function(country,$countrySource){
   		var count = $countrySource.length;
   		for(var i=0;i<count;i++) {
   			if ($countrySource[i].name==country) {
   				return $countrySource[i].code;
   			}
   		}
   	},
	buildAddress:function($adata,$fields,$countrySource){
		var $fields = $pick($fields,['room','floor','building','street','town','neighborhood','suburb','city','zipcode','state','country']);
		if (!$defined($adata)) return;
        var $capitalize = ['street','town','neighborhood','suburb','city','state'];
        var $address = new Array();
        $fields.each(function($field){
        	var $value = $adata[$field];
        	if ($pick($value,'').length) {
        		switch($field){
        			case 'floor':
        				$value = $value.toInt();
                        if ($value<0) {
                            $value = 'Basement '+Math.abs($value);
                        } else if ($value>1){
                            $value = TPH.ordinal($value)+' Floor';    
                        } else if ($value==1){
                            $value = 'Ground Floor';
                        }
                        break;
                    case 'street':
                        if ($defined($adata.street_number)) {
                            $value = $adata.street_number+' '+$value;
                        }
                        break;
                    case 'country':
                        $country = TPH.getCountry($value,$countrySource);
                        if ($defined($country)) {
                        	$value=$country.name;
                    	}
                        break;
        		}
        		if ($capitalize.contains($field)) $value = $value; //ucwords(strtolower($value));
                $address.push($value);
        	}
        });
        return $address.join(', ');
	},
	stringURLSafe:function(str){
		return str.replace(/\-/ig,' ').replace(/\s+/ig,'-').replace(/[^A-Za-z0-9\-]/ig,'').replace(/\./ig,'').trim().toLowerCase();
	},
	MD5:function (string) {
		function RotateLeft(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		}
	 
		function AddUnsigned(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
	 	}
	 
	 	function F(x,y,z) { return (x & y) | ((~x) & z); }
	 	function G(x,y,z) { return (x & z) | (y & (~z)); }
	 	function H(x,y,z) { return (x ^ y ^ z); }
		function I(x,y,z) { return (y ^ (x | (~z))); }
	 
		function FF(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function GG(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function HH(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function II(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};
	 
		function ConvertToWordArray(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};
	 
		function WordToHex(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};
	 
		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		};
	 
		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;
	 
		string = Utf8Encode(string);
	 
		x = ConvertToWordArray(string);
	 
		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
	 
		for (k=0;k<x.length;k+=16) {
			AA=a; BB=b; CC=c; DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
		}
	 
		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
	 
		return temp.toLowerCase();
	},
	number_format:function(number, decimals, dec_point, thousands_sep) {
	  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	  var n = !isFinite(+number) ? 0 : +number,
	    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	    s = '',
	    toFixedFix = function (n, prec) {
	      var k = Math.pow(10, prec);
	      return '' + Math.round(n * k) / k;
	    };
	  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
	  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	  if (s[0].length > 3) {
	    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	  }
	  if ((s[1] || '').length < prec) {
	    s[1] = s[1] || '';
	    s[1] += new Array(prec - s[1].length + 1).join('0');
	  }
	  return s.join(dec);
	},
	htmlEntities:function(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	byteSize:function($bytes)  
    { 
	    var $size = $bytes / 1024; 
	    if($size < 1024) { 
	        $size = TPH.number_format($size, 2,'.',','); 
	        $size += ' KB'; 
	    } else { 
	        if($size / 1024 < 1024)  { 
	            $size = TPH.number_format($size / 1024, 2,'.',','); 
	            $size += ' MB'; 
	        } else if ($size / 1024 / 1024 < 1024) { 
	            $size = TPH.number_format($size / 1024 / 1024, 2,'.',','); 
	            $size += ' GB'; 
	        }  
	    } 
	    return $size; 
    },
    diff:function(obj1, obj2) {
	    var result = {};
	    for(key in obj1) {
	        if(obj2[key] != obj1[key]) result[key] = obj2[key];
	        if(typeof obj2[key] == 'array' && typeof obj1[key] == 'array') 
	            result[key] = arguments.callee(obj1[key], obj2[key]);
	        if(typeof obj2[key] == 'object' && typeof obj1[key] == 'object') 
	            result[key] = arguments.callee(obj1[key], obj2[key]);
	    }
	    return result;
	},
	getDate:function(sample,latency){
		//console.log('GET DATE',TPH);
		var date = new Date(),
			latency = $pick(latency,TPH.$latency)
			;
		if ($defined(sample)) {
			date.parse(sample);
			if ($defined(TPH.$latency)) {
				date.setMilliseconds(date.getMilliseconds() + latency);
			}
		}
		/* 
		else if ($defined(TPH.$checkTime) && $defined(TPH.$date)) {
			var timeDiff = date-TPH.$checkTime+latency;
			var serverDate = new Date().parse(TPH.$date);
			//serverDate.increment('second',timeDiff/1000);
			//console.log('Server Date',serverDate);
			
			//date.setMilliseconds(date.getMilliseconds() - TPH.$latency);
			date.setMilliseconds(date.getMilliseconds()+latency);
		}
		*/
		return date;
	},
	distanceText:function($distance){
        var $unit = 'm';
        if ($distance>1000) {
            $distance = $distance/1000;
            $unit = 'Km';
        } 
        return TPH.number_format($distance,2,'.',',')+' '+$unit; 
    }
});

TPH.Assets = {
	Howl				:'includes/js/vendor/howler/howler.js',
	QRCode				:'includes/js/vendor/qrcode.js',
	Swiper				:['includes/js/swiper.js','includes/css/swiper.css'],
	ZXing				:'includes/js/vendor/zxing.js',
	L					:[
						'includes/js/leaflet.js',
						//'/includes/js/leaflet.mapcenter.js',
						'includes/css/leaflet.css'],
	XLSX				:'includes/js/vendor/xlsx.js',
	canvasDatagrid		:'includes/js/vendor/canvas-datagrid.js',
	EXIF				:'includes/js/vendor/exif.js',
	libphonenumber		:'includes/js/vendor/libphonenumber.js',
	opentype			:'includes/js/vendor/opentype.js',
	LZString			:'includes/js/vendor/lz-string.js',
	Print				:'includes/js/print.js',
	PageEditor			:[
							'includes/js/grapes/grapes.min.js',
							'includes/js/grapes/grapesjs-preset-webpage.min.js',
							'includes/css/grapes/grapes.css',
							'includes/css/grapes/grapesjs-preset-webpage.min.css',
							'includes/js/tph/page.editor.js',
							'includes/css/tph/page.editor.css'
						],
	Codemirror			:['includes/js/codemirror/lib/codemirror.js','includes/css/codemirror.css'],
	CodemirrorMode		:'includes/js/codemirror/addon/mode/loadmode.js',
	CodemirrorMeta		:'includes/js/codemirror/mode/meta.js',
	CSS					:'includes/js/tph/css.js',
	DOM					:'includes/js/tph/dom.js',
	CKEDITOR			:'includes/js/ckeditor/ckeditor.js',
    Progressbar			:'includes/js/vendor/progressbar.js',
	jsPDF				:'includes/js/vendor/jspdf.min.js',
    jsPDFAutoTable		:'includes/js/vendor/jspdf/autotable.js',
    DayPilot			:['includes/js/daypilot.js'],
    CanvasJS			:'includes/js/canvasjs.min.js',
    Calendar			:'includes/js/vendor/calendar.js',
    NoSleep				:'includes/js/vendor/nosleep.js',
    Hammer				:'includes/js/vendor/hammer.js',
    RAF					:'includes/js/vendor/raf.js',
    Editorjs			:'includes/js/vendor/editorjs.js',
    MaterializeSocial	:'includes/css/materialize-social.css',
    RollDate			:'includes/js/vendor/rolldate.js',
    
    HEREFlexiblePolyline:'includes/js/vendor/here/flexiblepolyline.js',
    
    TPHGrid				:['includes/js/tph/grid.js','includes/css/tph/grid.css'],
    TPHScrollbar		:['includes/js/tph/scrollbar.js','includes/css/tph/scrollbar.css'],
    TPHWall				:['includes/js/tph/wall.js','includes/css/tph/wall.css'],
    TPHTable			:['includes/js/tph/table.js','includes/css/tph/table.css'],
    TPHSlide			:['includes/js/tph/slide.js'],
    TPHProgress			:['includes/js/tph/progress.js'],
    TPHTimeselect		:['includes/js/timeselect.js','includes/css/timeselect.css'],
    TPHComponent		:['includes/js/tph/component.js'],
    TPHTree				:['includes/js/tph/tree.js'],
    TPHHTMLBuilder		:['includes/js/tph/html.builder.js'],
    HLS					:['includes/js/vendor/hls.js'],
    PanZoom				:['includes/js/vendor/panzoom.min.js'],
    agGrid				:['includes/js/vendor/ag-grid-community.min.js'],
	JSZip				:['includes/js/vendor/jszip.js'],
	Zip					:['includes/js/vendor/zip.js']
};
TPH.AssetsLoaded = new Array();
TPH.AssetAlias = {
	Leaflet:'L'
};

TPH.loadAsset = function(library,onLoad) {
	var library = $pick(TPH.AssetAlias[library],library);
	//console.log(library,!$defined(window[library]) && !TPH.AssetsLoaded.contains(library));
	if (!$defined(window[library]) || !TPH.AssetsLoaded.contains(library)) {
		var assets = $type(TPH.Assets[library])=='array'?TPH.Assets[library]:[TPH.Assets[library]];
		TPH.loadAssetFiles(assets,function(){
			TPH.AssetsLoaded.include(library);
			window.fireEvent('onLoadAsset',[library]);
			if ($type(onLoad)=='function') {
				onLoad();
			}
		});
		/*
		var loaders = new Array();
		assets.each(function(asset){
			var link = asset.toURI();
			if ($defined(TPH.$remote)) {
				var remote = TPH.$remote.toURI();
				link.set('scheme',remote.get('scheme'));
				link.set('host',remote.get('host'));
			}
			link.set('port',null);
			var ext = (/[.]/.exec(link)) ? /[^.]+$/.exec(link)[0] : undefined;
			switch(ext){
				case 'js':
					new Asset.javascript(link.toString(),{
						onLoad:function(){
							onLoad();
						}
					});
					break;
				case 'css':
					new Asset.css(link.toString());		
					break;
			}	
		});
		*/
	} else {
		TPH.AssetsLoaded.include(library);
		if ($type(onLoad)=='function') {
			onLoad();
		}
	}	
	//console.log(TPH.AssetsLoaded);
};

TPH.loadAssets = function(assets,onLoad){
	if (assets.length){
		var asset = assets.shift();
		TPH.loadAsset(asset,function(){
			TPH.loadAssets(assets,onLoad);
		}.bind(this));
	} else if ($type(onLoad)=='function') {
		onLoad();	
	}
};

TPH.loadScript = function(url,onLoad,onError,doc,useCDN){
	var doc = $pick(doc,document);
	if (!$defined(doc.$scripts)) {
		doc.$scripts = new Array();
	}
	var link = url.toURI();
	var servers = $pick(TPH.$servers,{});
	if ($defined(servers.cdn) && $pick(useCDN,true)) {
		var cdn = servers.cdn.toURI();
		link.set('scheme',cdn.get('scheme'));
		link.set('host',cdn.get('host'));
		link.set('port',null);
	} else if ($defined(TPH.$remote) && $pick(useCDN,true)) {
		var remote = TPH.$remote.toURI();
		link.set('scheme',remote.get('scheme'));
		link.set('host',remote.get('host'));
		link.set('port',null);
	}
	
	if (!doc.$scripts.contains(link.toString())) {
		new Asset.javascript(link.toString(),{
			onLoad:function(){	
				doc.$scripts.push(link.toString());
				if ($type(onLoad)=='function') {
					onLoad();	
				}
			},
			//onError:onError,
			document:doc
		});	
	} else if ($type(onLoad)=='function') {
		onLoad();	
	}
};

TPH.loadStylesheet = function(url,onLoad,onError,doc,useCDN){
	var doc = $pick(doc,document);
	if (!$defined(doc.$stylesheets)) {
		doc.$stylesheets = new Array();
	}
	var link = url.toURI();
	var servers = $pick(TPH.$servers,{});
	if ($defined(servers.cdn) && $pick(useCDN,true)) {
		var cdn = servers.cdn.toURI();
		link.set('scheme',cdn.get('scheme'));
		link.set('host',cdn.get('host'));
		link.set('port',null);
	} else if ($defined(TPH.$remote) && $pick(useCDN,true)) {
		var remote = TPH.$remote.toURI();
		link.set('scheme',remote.get('scheme'));
		link.set('host',remote.get('host'));
		link.set('port',null);
	}

	if (!doc.$stylesheets.contains(link.toString())) {
		new Asset.css(link.toString(),{
			onLoad:function(){
				doc.$stylesheets.push(link.toString());
				if ($type(onLoad)=='function') {
					onLoad();	
				}
			},
			//onError:onError,
			document:doc
		});
	} else if ($type(onLoad)=='function') {
		onLoad();	
	}	
};

TPH.loadAssetFiles = function(files,onLoad){
	if (files.length) {
		var asset = files.shift();
		var link = asset.toURI();
		/*
		if ($defined(TPH.$remote)) {
			var remote = TPH.$remote.toURI();
			link.set('scheme',remote.get('scheme'));
			link.set('host',remote.get('host'));
			link.set('port',null);
		}
		*/
		var ext = (/[.]/.exec(link)) ? /[^.]+$/.exec(link)[0] : undefined;
		switch(ext){
			case 'js':
				TPH.loadScript(link.toString(),function(){
					TPH.loadAssetFiles.delay(200,null,[files,onLoad]);
				});
				/*
				new Asset.javascript(link.toString(),{
					onLoad:function(){
						TPH.loadAssetFiles(files,onLoad);
					}
				});
				*/
				break;
			case 'css':
				TPH.loadStylesheet(link.toString(),function(){
					TPH.loadAssetFiles.delay(200,null,[files,onLoad]);
				});
				/*
				new Asset.css(link.toString(),{
					onLoad:function(){
						TPH.loadAssetFiles(files,onLoad);
					}
				});
				*/		
				break;
		}	
	} else {
		if ($type(onLoad)=='function') {
			onLoad();
		}
	}
};
TPH.$drivers = {};
TPH.Drivers = {
	printer:{
		epsontm:{
			name:'Epson POS Printer',
			files:['epos-2.9.0.js','driver.js']
		}
	}
};

TPH.loadDriver = function(device,brand,onLoad){
	var id = device+'-'+brand;
	if (!$defined(TPH.$drivers[id])) {
		if ($defined(TPH.Drivers[device])) {
			if ($defined(TPH.Drivers[device][brand])) {
				var files = new Array();
				var path = '/includes/js/drivers/{device}/{brand}/'.substitute({
					device:device,
					brand:brand
				});
				TPH.Drivers[device][brand].files.each(function(file){
					files.push(path+file);
				});
				TPH.loadAssetFiles(files,onLoad);
			} else {
				console.log('Driver Load Issue: Unable to find '+device+' driver for '+brand);
			}
		} else {
			console.log('Driver Load Issue: Unable to find '+device+' drivers');
		}
	} else {
		if ($type(onLoad)=='function') {
			onLoad();	
		}
	}
};

TPH.getDriverClassName = function(device,driver){
	return driver.ucfirst()+device.ucfirst()+'Driver';
};
TPH.getDriver = function(driverData,options,onReady){
	TPH.loadDriver(driverData.device,driverData.driver,function(){
		var driverClass = TPH.getDriverClassName(driverData.device,driverData.driver);
		//var driverClass = driverData.driver.ucfirst()+driverData.device.ucfirst()+'Driver';
		//console.log(driverClass);
		var instance = new window[driverClass](driverData,options);
		if ($type(onReady)=='function') {
			onReady(instance);
		}
	}.bind(this));
};

TPH.ContentContainer = new Class({
	Implements:[Events,Options],
	options:{
		selector:'.contentContainer',
		active:'active',
		action:'containerAction',
		stopEvents:false
	},
	$dynamicDOM:false,
	containers:{},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = document.id($pick(container,window.document.body));
		this.$history = new Array();
		
		this.recheck();
		this.continueSelect = true;
	},
	recheck:function(){
		this.index = new Array();
		var current = null;
		
		this.container.getElements(this.options.selector).each(function(el){
			var id = el.get('rel');
			if ($defined(id)) {
				this.setContainer(id,el);
				this.index.push(id);
				this.fireEvent('onCreate',[id,el,this]);
				if (el.hasClass('active')) {
					this.select(el.get('rel'),el);
					//this.currentContainer = el.get('rel');
				} 
			}
		}.bind(this));
		this.scanActions(this.container);
		return this;
	},
	select:function(container,trigger){
		if (this.currentContainer!=container) {
			this.continueSelect = true;
			this.fireEvent('onBeforeSelect',[container,trigger,this]);
			if (this.continueSelect && this.hasContainer(container)) {
				this.previousContainer = this.currentContainer;
				this.currentContainer = container;
				
				var saveHistory = true;
				if (this.$history.length) {
					var lastHistory = this.$history[this.$history.length-1];
					saveHistory = lastHistory.container!=container; 	
				}
				
				if (saveHistory) {
					this.$history.push({
						trigger:trigger,
						container:container
					});
				}
				
				for(key in this.containers){
					this.containers[key][(key==container?'add':'remove')+'Class'](this.options.active);	
				}
				this.fireEvent('onSelect',[container,this,trigger]);	
			}	
		}
		return this.containers[this.currentContainer];
	},
	back:function(){
		this.$history.pop();
		if (!this.$history.length) return null;
		
		var back = this.$history[this.$history.length-1];
		if ($defined(back)) {
			this.continueSelect = true;
			this.fireEvent('onBeforeSelect',[back.container,back.trigger,this]);
			if (this.continueSelect && this.hasContainer(back.container)) {
				this.previousContainer = this.currentContainer;
				this.currentContainer = back.container;
				for(key in this.containers){
					this.containers[key][(key==back.container?'add':'remove')+'Class'](this.options.active);	
				}
				this.fireEvent('onSelect',[back.container,this,back.trigger]);	
			}
			return this.containers[this.currentContainer];	
		}
	},
	forward:function(){
		
	},
	hasContainer:function(container){
		//return $defined(this.index.contains(container));
		var containers = new Hash(this.containers).getKeys();
		return containers.contains(container);
	},
	getContainer:function(container){
		return this.containers[container];
	},
	setContainer:function(id,container){
		this.containers[id] = container;
		this.fireEvent('onSetContainer',[id,container,this]);
		return this;
	},
	removeContainer:function(id){
		if ($defined(this.containers[id])) {
			this.containers[id].destroy();
			delete this.containers[id];
			this.index.erase(id);
		}
		return this;
	},
	scanActions:function(container){
		container.getElements('.'+this.options.action).each(function(el){
			var id = el.get('rel');
			switch(id){
				case '$back':
					el.addEvent('click',function(e){
						if (this.options.stopEvents) {
							e.stop();	
						}
						this.back();
					}.bind(this));	
					break;
				case '$next':
					el.addEvent('click',function(e){
						if (this.options.stopEvents) {
							e.stop();	
						}
						this.forward();
					}.bind(this));
					break;
				default:
					if (this.hasContainer(id)) {
						el.addEvent('click',function(e){
							if (this.options.stopEvents) {
								e.stop();	
							}
							if (this.hasContainer(id)) {
								this.select(id,el);	
							}
						}.bind(this));	
					}
			}
		}.bind(this));
	}
});

TPH.ContentNavigation = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			item:'navigationItem',
			active:'active'
		}
	},
	initialize:function(container,options){
		this.setOptions(options); 
		this.container = document.id($pick(container,window.document.body));
		this.items = this.container.getElements($pick(this.options.selector,'.'+this.options.classes.item));
		this.items.each(function(item){
			if (item.hasClass(this.options.classes.active)) {
				this.currentItem = item;
			}
			item.addEvent('click',function(e){
				this.select(item);
			}.bind(this));
		}.bind(this));
	},
	select:function(item){
		if (this.currentItem!=item) {
			if ($defined(this.currentItem)) {
				this.currentItem.removeClass(this.options.classes.active);
			}
			this.currentItem = item.addClass(this.options.classes.active);
			this.fireEvent('onSelect',[this.currentItem,this]);
		}
	},
	getActive:function(){
		return this.container.getElement($pick(this.options.selector,'.'+this.options.classes.item)+'.'+this.options.classes.active);
	},
	clear:function(){
		this.items.each(function(item){
			item.removeClass(this.options.classes.active);
		}.bind(this));
		this.currentItem = null;
		return this;
	}
});
TPH.TabMenus = new Class({
	Implements:[Events,Options],
    options:{
        classes:{
            tabs:'tabMenus',
            pages:'tabPages',
            container:'tabContainer',
            wrapper:'tabWrapper',
            left:'tab left',
            right:'tab right',
            select:'tabSelect'
        },
        padding:20
    },
    pageIndex:{},
    initialize:function(menu,options){
    	this.setOptions(options);
        this.menu = menu;
        this.ref = $pick(menu.get('data-tabref'),'rel');
        this.wrapper = new Element('div',{'class':this.options.classes.wrapper}).injectAfter(this.menu);
        this.container = new Element('div',{'class':this.options.classes.container}).injectInside(this.wrapper).adopt(this.menu);
        this.scroller = new Fx.Scroll(this.container,{
        	link:'cancel',
        	wait: false,
			duration: 'short',
			transition: Fx.Transitions.Quad.easeInOut
        });
        
        this.pages = document.id($pick(menu.get(this.ref),this.options.pages));
        menu.getChildren().each(function(tab,i){
        	var page = document.id(this.pages.children[i]).store('tab',tab);
        	var pageIndex = page.get(this.ref);
        	if ($defined(pageIndex)) {
        		this.pageIndex[pageIndex] = page;
        	}
            tab.store('page',page);
            tab.addEvent('click',function(e){
                e.stop();
                this.selectTab(tab);
            }.bind(this));
            this.scanActions(page);         
            this.fireEvent('onCreate',[tab,page,this]);
        }.bind(this));        
        
        
       	this.reposition.delay(500,this);
    },
    scanActions:function(container){
    	container.getElements('.'+this.options.classes.select).each(function(el){
	    	el.addEvent('click',function(e){
	    		this.selectPage(el.get(this.ref));
	    	}.bind(this));
	    }.bind(this));   
    },
    selectTab:function(tab){
    	this.clear();
        tab.addClass('active').retrieve('page').addClass('active');
        this.fireEvent('onSelect',[tab,tab.retrieve('page'),this]);
    },
    selectPage:function(pageIndex){
    	var page = this.pageIndex[pageIndex];
    	
    	if ($defined(page)) {
    		var tab = page.retrieve('tab');
    		if ($defined(tab)) {
    			this.selectTab(tab);
    		}
    	}
    },
    getPage:function(id){
    	return this.pageIndex[id];
    },
    reposition:function(){
    	if ($defined(this.leftScroller)) {
    		this.leftScroller.remove();
    	}
    	if ($defined(this.rightScroller)) {
    		this.rightScroller.remove();
    	}
    	this.container.setStyles({width:'',padding:''});
    	this.menu.setStyle('width','').getChildren().setStyle('display','');
    	var size = this.menu.getSize(),
    		scroll = this.menu.getScroll();
    	
        if (scroll.x>size.x) {
        	this.scrollSize = size.x-(this.options.padding*2);
        	
        	this.container.setStyle('width',this.scrollSize);
        	this.menu.setStyle('width',size.scrollSize.x);
        
        	this.leftScroller = new Element('div',{'class':this.options.classes.left}).injectBefore(this.container);
	        this.leftScroller.addEvents({
	        	click:function(e){
	        		e.stop();
	        		this.scroller.start(this.container.scrollLeft-this.scrollSize,0);
	        		this.lastX = this.container.scrollLeft-this.scrollSize;
	        	}.bind(this)
	        });
	        
	        this.rightScroller = new Element('div',{'class':this.options.classes.right}).injectAfter(this.container);
	        this.rightScroller.addEvents({
	        	click:function(e){
	        		e.stop();
	        		this.scroller.start(this.container.scrollLeft+this.scrollSize,0);
	        		this.lastX = this.container.scrollLeft+this.scrollSize;
	        	}.bind(this)
	        });
        } 
        if (!this.initialized) {
        	window.addEvent('resize',function(){
        		this.reposition();
        		this.container.scrollLeft = this.lastX;
	       	}.bind(this));
        	this.initialized = true;
        }
        
    },
    clear:function(){
        this.menu.getChildren().each(function(tab){
            tab.removeClass('active').removeProperty('tabIndex').retrieve('page').removeClass('active');  
        }.bind(this));        
    }
});

TPH.scanTabs = function(container,options){
    container.getElements('ul.tabMenu').each(function(tabs){
        new TPH.TabMenus(tabs,options);
    });
};
TPH.SelectOptions = new Class({
    Implements:[Options,Events],
    options:{
        className:'selectOption'
    },  
    defaults:{},
    nonText:{},
    initialize:function(container,options){
        this.selectOptions = new Hash();
        this.setOptions(options);
        this.container = document.id($pick(container,window.document.body));
        this.container.getElements('.'+this.options.className).each(function(target){
            var elName = $pick(target.get('data-option'),target.get('rel'));                     
            if ($defined(elName)) {             
                this.attach(elName,target);
            }
        }.bind(this));
        
        for(def in this.defaults){
        	var el = this.defaults[def];
            this.checkValue(def,el.get('value'),el);
        }
        
        for(elName in this.nonText) {
        	/*
        	var el = this.nonText[elName];
        	this.container.getElements('input[name="'+elName+'"]').each(function(radio){
            	this.checkValue(elName,radio.get('value'),el);
            }.bind(this));
            */
           
           var values = this.getItemsValue(this.nonText[elName]);
           //console.log(elName,values);
           this.checkValue(elName,values,this.nonText[elName][0]);
        }
        
       this.fireEvent('onInitialize',[this]);
    },
    getItemsValue:function(items){
    	var values = new Array();
    	items.each(function(item){
    		if (item.get('checked')) {
    			values.push(item.get('value'));
    		}
    	});
    	
    	return values;
    },
    setItemsValue:function(items,value){
    	items.each(function(item){
    		item.set('checked',item.get('value')=='value');
    	});
    },
    attach:function(elName,target){
        if (!this.selectOptions.has(elName)) {
            this.selectOptions.set(elName,[target]);
            
            var el;
            if (elName.charAt(0)=='#') {
                el = this.container.getElementById(elName.replace('#',''));
            } else if (elName.charAt(0)=='.') {
                el = this.container.getElement(elName);
            } else {
                el = this.container.getElement('select[name="'+elName+'"]');
            }           
            //console.log(elName,el,target);
            if ($defined(el)) {
            	switch(el.get('tag')){
            		case 'input':
            			switch(el.get('type')){
            				case 'checkbox':
            				case 'radio':
	            				if (!$defined(this.nonText[elName])) {
			                    	this.nonText[elName] = new Array();
			                    }
	                    		this.nonText[elName].push(el); 
            					el.addEvent('click',function(e){
            						//console.log('clicked');
				                    this.checkValue(elName,this.getItemsValue(this.nonText[elName]),el);
				                }.bind(this));
            					break;
        					default:
        						el.addEvent('input',function(e){
				                    this.checkValue(elName,el.get('value'),el);
				                }.bind(this)).fireEvent('input');
        						break;
            			}
            			break;
            		case 'select':
            			el.addEvent('change',function(e){
		                    this.checkValue(elName,el.get('value'),el);
		                }.bind(this)).fireEvent('change');
            			break;
            			
            	}
                this.defaults[elName] = el;//.get('value');
            } else {
                this.container.getElements('input[name="'+elName+'"]').each(function(el){   
                	if (!$defined(this.nonText[elName])) {
                    	this.nonText[elName] = new Array();
                    }
                    this.nonText[elName].push(el); 
                    el.addEvent('click',function(e){                        
                    	this.checkValue(elName,this.getItemsValue(this.nonText[elName]),el);
                    }.bind(this));                                    
                }.bind(this));
            }    
        } else {
            this.selectOptions.get(elName).push(target);
        }       
        //console.log(this);
    },
    checkValue:function(elName,rawvalue,el){
        if (!this.selectOptions.has(elName)) return;
        var hasValid = false;  
        //console.log(elName,rawvalue,el.get('tag'));
        this.fireEvent('onBeforeSelect',[elName,this]);
        this.selectOptions.get(elName).each(function(target){
        	var value = rawvalue;
        	var values = $pick(target.get('rev'),'').split('|');
        	var valid = false;
        	switch(el.get('tag')) {
        		case 'select':
        			valid = el.get('disabled')?false:$defined(target.get('rev'))?values.contains(value):value!='';
        			break;
        		default:
        			switch(el.get('type')) {
		        		case 'radio':
		        		case 'checkbox':
		        			//console.log(elName);
		        			var checked = $pick(target.get('data-checked'),'1').toInt();
		        			var value = target.get('rev');
		            		valid = (rawvalue.contains(value) && checked) || (!rawvalue.contains(value) && !checked);
		            		//console.log(valid,checked,value,rawvalue);
		        			break;
		        		default:
		            		valid = $defined(target.get('rev'))?values.contains(value):value!='';
		        	}	
        	}
        	//console.log(target,this.nonText);
            target[(valid?'remove':'add')+'Class']('disabled')
                .getElements('input,select,textarea')
                .each(function(el){
                	if (!valid) {
                		var disabledValue = el.get('data-disable-value');
			        	if ($defined(disabledValue)) {
			        		el.set('value',disabledValue);
			        		el.fireEvent('change');
			        	}	
                	}
                    
                    //var name = el.get('name');
                    target.getElements('.'+this.options.className).each(function(ttarget){
                    	//console.log(ttarget);
                    	var selName = $pick(ttarget.get('data-option'),ttarget.get('rel'));
                    	//console.log(selName);
                    	var sel = selName.charAt(0)=='#'?this.container.getElementById(selName.replace('#','')):this.container.getElement('select[name="'+selName+'"]');
                    	
                    	this.checkValue(selName,sel.get('value'),sel);
			        }.bind(this));
			        el.set('disabled',!valid);
                }.bind(this));
            if (valid && !hasValid) {                
                hasValid = true;
            }
        }.bind(this));
        if (hasValid) {
            this.fireEvent('onSelect',[rawvalue,elName,this]);
        }
        this.fireEvent('onChange',[elName,this]);
    }
});

TPH.window = new Class({
	Implements:[Options,Events],
	options:{
		overlayOpacity:0.7,
		windowClass:'tphWindow',
		captionClass:'tphWindowCaption',
		contentClass:'tphWindowContent',
		contentContainerClass:'tphWindowContentContainer',
		contentBlockClass:'tphWindowContentBlock',
		reloaderClass:'tphContentReload',
		size:{
			width:250,
			height:300
		},
		closable:true,
		closeOnOverlay:true,
		caption:'',
		draggable:true
	},
	visible:true,
	$canClose:true,
	initialize:function(options){
		this.setOptions(options);
		if (!$defined(TPH.windowIndex)) {
			TPH.windowIndex = 100;
		}
		this.index = TPH.windowIndex++;
		this.containment = $pick(this.options.containment,window.document.body);
		this.overlay = new Element('div',{'class':'tphOverlay'}).setStyles({opacity:this.options.overlayOpacity,'z-index':this.index}).inject(this.containment);
		this.window = new Element('div',{'class':this.options.windowClass,'styles':{'z-index':this.index}}).inject(this.containment);
		this.window.set('morph',{'link':'cancel','duration':'short'});
		if (this.options.closable) {
			this.closeButton = new Element('div',{'class':'tphCloseWindow'}).injectInside(this.window);
			this.closeButton.addEvent('click',function(){
			    if (this.canClose()) {
			        this.close();
			    }
			}.bind(this));
			this.overlay.addEvent('click',function(){
				if (this.options.closeOnOverlay) {
				    if (this.canClose()) {
				        this.close();    
				    }
				}
			}.bind(this));
		}
		
		
		this.captionContainer = new Element('div',{'class':this.options.captionClass})
			.injectInside(this.window)
			.adopt(this.reloader)
			//.adopt(this.caption)
			;
		this.caption = new Element('span').set('html',this.options.caption).injectInside(this.captionContainer);
								
		this.contentContainer = new Element('div',{'class':this.options.contentContainerClass}).injectInside(this.window);
		this.content = new Element('div',{'class':this.options.contentClass})
						.injectInside(this.contentContainer);
		this.contentBlock = new Element('div',{'class':this.options.contentBlockClass}).injectInside(this.contentContainer);		
		this.setStyles(this.options.size);
						
		if ($defined(this.options.contentClasses)) {
			this.options.contentClasses.each(function(cclass){
				this.content.addClass(cclass);
			}.bind(this),this);
		}
		if ($defined(this.options.content)) {
			this.content.set('html',this.options.content);
		}
		if ($defined(this.options.url)) {
			this.reloader = new Element('div',{'class':this.options.reloaderClass})
								.injectTop(this.captionContainer)
								.addEvent('click',function(){
									this.fireEvent('onReload',[this.options.data]);
									this.loadURL(this.options.url,this.options.data,false);
								}.bind(this));
			this.loadURL(this.options.url,this.options.data);
		}
		if (this.options.draggable) {
			this.window.makeDraggable({
				handle:this.captionContainer,
				onStart:function(){
					this.fireEvent('onStartDrag',[this]);
				}.bind(this),
				onDrag:function(){
					this.fireEvent('onDrag',[this]);
				}.bind(this)
			});
		}
		
		window.addEvents({
			//'scroll':function(){this.toCenter(true);}.bind(this),
			resize:function(){
				//this.adjustOverlay.debounce(this);
				$fullHeight.delay(200,this,this.content);
			}.bind(this)
				
		});
		this.adjustOverlay();
		this.fireEvent('onCreate',[this]);
		this.fireEvent('onBeforeOpen',[this]);
		this.fireEvent('onOpen',[this]);
	},
	
	canClose:function(wset){
	    if ($defined(wset)) {
	        this.$canClose = wset;
	        this.closeButton.setStyle('display',wset?'':'none');
	        return this;
	    } 
	    return this.$canClose;
	},
	toTop:function(){
		this.index = TPH.windowIndex++;
		this.overlay.setStyle('z-index',this.index);
		this.window.setStyle('z-index',this.index);
		return this;
	},
	setContainment:function(containment){
		this.setOptions({containment:containment});
		this.containment = containment;
		return true;
	},
	setSize:function(size,animateToCenter){
		this.options.size = size;
		this.window.setStyles({
			right:'',
			bottom:''
		});
		return this.setStyles(size,animateToCenter);
	},
	setStyles:function(styles,animateToCenter){
	    for(style in styles){
	        if (!['left','top','right','bottom'].contains(style)) {
	            this.content.setStyle(style,styles[style]);
	        }
	    }
		this.toCenter(animateToCenter);
		return this;
	},
	reload:function(){
		this.reloader.fireEvent('click');
	},
	loadURL:function(url,data){
		if ($defined(this.contentRequest)) {
			if (this.contentRequest.isRunning()) {
				this.contentRequest.cancel();				
			}
		}
		
		this.fireEvent('onBeforeLoad',[data,this]);
		this.contentRequest = new TPH.Ajax({
			url:url,
			data:data,
			onComplete:function(html){
				if ($pick(this.options.setContent,true)) {
					this.content.set('html',html);
				}
				
				TPH.window.scanContainer(this.content);
				this.stopSpin();
				this.fireEvent('onComplete',[html,this]);
			}.bind(this),
			onRequest:function(){
				this.startSpin();
				this.fireEvent('onRequest',[this]);
			}.bind(this),
			onFailure:function(){
				TPH.Connectivity.noConnection();
				this.stopSpin();
				this.fireEvent('onFailure',[this]);
			}.bind(this)
		}).request();
	},
	toCenter:function(morph){
		if (!this.visible) return;
		var screenSize = window.getSize();
		var screenScroll = window.getScroll();
		var windowSize = this.window.getSize();
		var params = {
			left:screenScroll.x+screenSize.x-((screenSize.x+windowSize.x)/2).round(),
			top:screenScroll.y+screenSize.y-((screenSize.y+windowSize.y)/2).round()
		};
		if(params.top<16) {
			params.top=16;
		};
		if (morph) {
			this.window.morph(params);
		} else {
			this.window.setStyles(params);
		}	
		this.fireEvent('onPosition',[this]);
		return this;
	},
	adjustOverlay:function(morph){
		//if (!this.visible) return;
		//var size = window.getSize();
		//this.overlay.setStyles({'width':size.scrollSize.x,'height':size.scrollSize.y});
		return this.toCenter(morph);
	},
	setContent:function(html){
		this.content.set('html',html);
		return this;
	},
	setCaption:function(caption){
		this.caption.set('html',caption);
		return this;
	},
	close:function(onClose){
		if (!this.visible) return this;
		if ($defined(this.contentRequest)) {
			if (this.contentRequest.isRunning()) {
				this.contentRequest.cancel();
				this.contentRequest = null;
			}
		}
		this.fireEvent('onBeforeClose',this);
		this.window.setStyles({
			opacity:0,
			display:'none'
		});
		this.overlay.setStyles({
			opacity:0,
			display:'none'
		});
		this.window.remove();
		this.overlay.remove();
		if ($defined(onClose))
			onClose(this);
		this.fireEvent('onClose',[this]);
		this.visible = false;
		
		return this;
	},
	open:function(onOpen,force){
		if (this.visible && !force) return this;
		this.fireEvent('onBeforeOpen',this);
		
		this.overlay.inject(this.containment);
		this.window.inject(this.containment);
		
		this.overlay.setStyles({ opacity:this.options.overlayOpacity, display:'block'});
		this.window.setStyles({ opacity:1,display:'block'});
		
		//this.adjustOverlay(true);				
		
		if ($defined(onOpen))
			onOpen(this);
		
		this.fireEvent('onOpen',[this]);
		
		this.visible = true;
		return this;
	},
	destroy:function(){		
		if (this.visible) {
			this.close(function(){
				this.overlay.remove();
				this.window.remove();
			}.bind(this));
		} else {
			this.overlay.remove();
			this.window.remove();
		}
	},
	startSpin:function(){
	    this.contentContainer.addClass('loading');		
	    if ($defined(this.reloader)) {
	    	this.reloader.addClass('loading');	
	    }
		
		this.fireEvent('onStartSpin',[this]);
	},
	stopSpin:function(){
		this.contentContainer.removeClass('loading');
		if ($defined(this.reloader)) {
			this.reloader.removeClass('loading');	
		}
		
		this.fireEvent('onStopSpin',[this]);
	}
});

$extend(TPH.window,{
	scanContainer:function(container){
		container.getElements('a.window').each(function(el){
			el.addEvent('click',function(e){
				e.stop();
				var options = Json.decode(el.get('rel'));
				new TPH.window(options);
			});
		});
	},
	PhotoBox:new Class({
		Implements:[Events,Options],
		options:{
			autoSize:true
		},
		initialize:function(container,options){
			this.setOptions(options);
			this.scanContainer($pick(container,$(window.document.body)));			
		},
		scanContainer:function(container){			
			var els = container.getElements('a.photoBox');
			if ($defined(els)) {
				els.each(function(el){
					el.addEvent('click',function(e){
						var e = e.stop();
						
						this.lastElement = el;
						this.loadPhoto(el.get('href'),el);
						this.fireEvent('onView',[this]);
					}.bind(this));
				}.bind(this));
			} 
			
		},
		loadPhoto:function(url,el){
			this.photoURL = url;
			TPH.getWindow('photoBox',{
				//draggable:this.options.autoSize,
				onCreate:function(modal){
					if (!this.options.autoSize) {
						/*
						modal.window.setStyles({
							position:'absolute',
							left:'10%',
							right:'10%',
							top:'10%',
							height:'auto'
						});
						*/
						modal.content.setStyles({width:'auto',height:'auto','text-align':'center'});
					}
					modal.contentContainer.setStyle('padding',0);
					modal.content.addClass('container');
					modal.captionContainer.setStyle('height',38);
					modal.caption.setStyles({
						'font-size':11,
						overflow:'hidden'
					});
				}.bind(this),
				onBeforeOpen:function(modal){
					modal.toTop();
					modal.content.empty().addClass('loading');
				}.bind(this),
				onOpen:function(modal){
					modal.setCaption(this.photoURL);
					modal.content.removeClass('loading');
					modal.content.empty(); //.adopt(new Element('img',{src:this.photoURL,width:'100%'})); 
					
					this.image = new Asset.image(this.photoURL,{
						onload:function(e){				
							var img = document.id(e).injectInside(modal.content);		
							if (this.options.autoSize) {
								var size = img.getSize();
								var size = {width:size.x,height:size.y};
								modal.setSize(size).toCenter();
								modal.captionContainer.setStyles({
									width:size.width
								});
								modal.toCenter();
							} else {
								img.setStyle('width','100%').set('height','');
							}
							this.fireEvent('onImageLoad',[img,this]);
						}.bind(this)
					});
					this.fireEvent('onOpen',[modal,this]);
									
				}.bind(this)
			}).open();
		},
		getWindow:function(){
			return TPH.getWindow('photoBox');
		}
	})
});


TPH.Tools = new Class({
	Implements:Events,
	options:{
		selector:'.tphTool'
	},
	initialize:function(params){
		this.params = params;
		this.tools = new Hash();
		this.scanContainer();
		TPH.Tools.instance = this;
	},
	scanContainer:function(container){
		var container = $pick(container,$(window.document.body));
		
		container.getElements(this.options.selector).each(function(item){
			var rel = item.getProperty('rel');
			if ($defined(rel)) {
				if (this.tools.has(rel)) {
					this.tools.get(rel).addTrigger(item);
				} else {
					var tool = new TPH.Tool(item,this.params);
					this.tools.set(rel,tool);
				}
				
			}
		}.bind(this),this);
		
	},
	getTool:function(id){
		return this.tools.get(id);
	},
	removeTool:function(id){
		this.getTool(id).destroy();
		this.tools.erase(id);
	}
});

TPH.Tool = new Class({
	Implements:[Events,Options],
	options:{
	    toolUrl:'.',
		params:{
			option:'com_tph',
			view:'tools',
			format:'raw'
		}
	},
	status:true,
	initialize:function(el,options){
		this.setOptions(options);
		this.element = el;
		this.id = el.getProperty('rel');
		el.addEvent('click',function(e){
			e.stop();
			this.handleTool(el);
		}.bind(this));
	},
	setStatus:function(status){
		this.status = status;
	},
	addTrigger:function(el){
		el.addEvent('click',function(e){
			e.stop();
			this.handleTool(el);
		}.bind(this));
	},
	handleTool:function(el,tparams){
		this.fireEvent('onBeforeOpen',[this,el]);
		
		if (!this.status) return;
		var data = $merge(this.options.params,$merge({layout:this.id},tparams));
		var modal = this.getModal();
		
		var options = {
			data:data,
			url:this.options.toolUrl,
			closeOnOverlay:false,
			onComplete:function(){
				this.fireEvent('onOpen');
			}.bind(this),
			onCreate:function(){
				this.fireEvent('onCreate');
			}.bind(this),
			onFailure:function(){
				this.fireEvent('onFailure');
			}.bind(this),
			onRequest:function(){
				if ($defined(modal)) {
					var coords = modal.content.getCoordinates();
					modal.setSize(coords);
					//modal.setContent('');
				}
				this.fireEvent('onRequest');
			}.bind(this),
			onReload:function(options){
				this.fireEvent('onBeforeLoad',[modal.options]);
			}.bind(this),
			onBeforeClose:function(win){
				this.fireEvent('onBeforeClose',[this]);
			}.bind(this)
		};
		if (!$defined(modal)) {
			this.fireEvent('onBeforeLoad',[options,el]);
			var modal = new TPH.window($merge(options,{
				onBeforeOpen:function(modalWindow){
						modalWindow.doOpen = this.status;
						modalWindow.toTop();
				}.bind(this)
			}));
			this.element.store('modal',modal);
		} else {
			modal.options.data = data;
			if (!modal.visible) {
				modal.open(function(){
					this.fireEvent('onBeforeLoad',[options,el]);
					modal.options.data = options.data;
					modal.loadURL(options.url,options.data);
				}.bind(this));	
			} else {
				this.fireEvent('onBeforeLoad',[options,el]);
				modal.options.data = options.data;				
				modal.loadURL(options.url,options.data);
			}
			
		}
	},
	getModal:function(){
		return this.element.retrieve('modal');
	},
	destroy:function(){
		var modal = this.getModal();
		if ($defined(modal)) modal.destroy();
	}
});

TPH.Ajax = new Class({
	Implements:[Options,Events],
	options:{
		url:'.',
		method:'post',
		evalResponse:true,
		notices:{
			noConnection:true
		},
		cancelUnload:false,
		retryOnFail:false,
		container:null,
		xhr:{},
		chunkSize:100000
	},
	initialize:function(options,attachment){
		this.setOptions(options);
		this.$attachment = attachment;
		
		if ($defined(this.options.container)) {
			this.container = document.id(this.options.container);
		}		
		
		if (this.options.cancelUnload){
			window.addEvent('unload',function(){
				this.cancel();
			}.bind(this));
		}
	},
	process:function(attachments){
		this.buildRequest({
			onSuccess:function(html){
				if ($defined(this.container)) {
					this.container.removeClass('loading');
				}
				this.onComplete(html);
				this.postComplete();
			}.bind(this),
			onRequest:function(){
				if ($defined(this.container)) {
					this.container.addClass('loading');
				}
				this.fireEvent('onRequest',[this]);
			}.bind(this),
			onFailure:function(){
				console.log('XHR Failure',this.options.url,Json.encode(this.options.data));
				if (this.options.retryOnFail) {
					console.log('Retrying...');
					this.request();	
				} else {
					if (this.options.notices.noConnection) {
						$pick(this.options.noConnection,TPH.Connectivity.noConnection)(this.options.url+'<br />'+Json.encode(this.options.data));
					}
					this.fireEvent('onFailure');	
				}
				if ($defined(this.container)) {
					this.container.removeClass('loading');
				}
			}.bind(this),
			onProgress:function(e){
				if (e.lengthComputable) {
					var loaded = e.loaded, total = e.total;
					var percent = parseInt(loaded / total * 100, 10);
					this.fireEvent('onProgress',[percent, loaded, total]);	
				}
			}.bind(this)
		},attachments);
	},
	buildData:function(data,attachment){
		var form = new Element('form');
		var formData = new FormData(form);
		for(var key in data) {
			formData.append(key,this.options.data[key]);
		}
		return formData;
	},
	buildRequest:function(options,attachments){
		var options = $merge({
            data:this.options.data,
            withCredentials:$defined(TPH.$check)
        },options);
        if ($defined(this.options.xhr)){
        	$extend(options,this.options.xhr); 
        }
        
        
		this.fireEvent('onBuild',[options,attachments]);
        var link = this.options.url.toURI();
        if ($defined(TPH.$remote)) {
            var remote = TPH.$remote.toURI();
            link.set('scheme',remote.get('scheme'));
            link.set('host',remote.get('host'));
            link.set('directory',remote.get('directory'));
            link.set('port',null);
        }
        window.fireEvent('buildAjax',[options,this]);
		this.req = new Request($merge(options,{
			url:link.toString(),
			method:this.options.method
		}));
		this.req.send();
	},
	request:function(){
		if ($defined(this.$attachment)){
			this.buildAttachments(function(attachments){
				this.process(attachments);
			}.bind(this)); 
		} else {
			this.process();	
		}
		return this;
	},
	buildAttachments:function(onComplete,onFailure){
		var attachments = new Array();
		var count = this.$attachment.files.length;
		for(var i=0;i<count;i++) {
			var file = this.$attachment.files[i];
			attachments.push(new FileBlob([file],file.name,{type:file.type}));
		}
		this.fireEvent('onBeforeSendAttachments',[attachments,this]);
		this.$attachments = new Array();
		this.sendAttachments(attachments,function(attachments){
			this.fireEvent('onAttachmentsComplete',[attachments,this]);
			$pick(onComplete,$empty)(attachments);
		}.bind(this),onFailure);
	},
	sendAttachments:function(attachments,onComplete,onFailure){
		if (attachments.length) {
			var file = attachments.shift();
			this.sendAttachment(file,function(file,chunk){
				this.$attachments.push({
					file:file,
					chunk:chunk
				});
				this.sendAttachments(attachments,onComplete,onFailure);	
			}.bind(this));
		} else {
			$pick(onComplete,$empty)(this.$attachments);
		}
	},
	sendAttachment:function(file,onComplete,onFailure){
		console.log('Send Attachment',file);
		var blob = file; //.content.toBlob();
		var chunkOffset = 0,
			chunkSize = this.options.chunkSize,
			chunks = new Array();
		do {
			chunks.push(blob.slice(chunkOffset,chunkOffset+chunkSize));
			chunkOffset += chunkSize;
		} while(chunkOffset<blob.size);
		this.fireEvent('onBeforeSendAttachment',[file,chunks.length,this]);
		this.sendAttachmentChunks(file,chunks,chunks.length,onComplete,onFailure);
	},
	sendAttachmentChunks:function(file,chunks,totalChunks,onComplete,onFailure){
		if (chunks.length) {
			var chunk = chunks.shift();
			this.sendAttachmentChunk(file,chunk,totalChunks-chunks.length,totalChunks,function(result){
				this.$attachmentResult = result;
				this.fireEvent('onAttachmentProgress',[file,totalChunks-chunks.length,totalChunks,this]);
				this.sendAttachmentChunks(file,chunks,totalChunks,onComplete);
			}.bind(this),function(){
				//on Chunk Failure
				this.fireEvent('onAttachmentError',[this]);
				$pick(onFailure,$empty)();
			}.bind(this));
		} else {
			this.fireEvent('onAttachmentComplete',[file,this.$attachmentResult,this]);
			$pick(onComplete,$empty)(file,this.$attachmentResult);
		}
	},
	sendAttachmentChunk:function(file,chunk,chunkIndex,totalChunks,onComplete,onFailure){
		var formData = new FormData();
		var data = {
				id:TPH.$session+'-'+TPH.MD5(file.name),
				file:file.name,
				index:chunkIndex,
				total:totalChunks
			},
			params = $merge($pick(this.$attachment.request,{}),{
				session:TPH.$session
			});
		params[TPH.$token]=1;
		for(var key in data) {
			formData.append('data['+key+']',data[key]);
		}
		for(var key in params) {
			formData.append(key,params[key]);
		} 
		
		formData.append('file',chunk,chunkIndex+'-'+totalChunks+':'+file.name);
		/*
		for(var pair of formData.entries()) {
        	console.log(pair[0]+'='+pair[1]);
        }
        console.log('Form Data',formData);
		*/
		var link = this.options.url.toURI();
        //console.log('AJAX:',this.options.url,link.get('host'));
        if ($defined(TPH.$remote)) {
            var remote = TPH.$remote.toURI();
            link.set('scheme',remote.get('scheme'));
            link.set('host',remote.get('host'));
            link.set('directory',remote.get('directory'));
            link.set('port',null);
        }
		
		var request = new XMLHttpRequest();
		request.addEventListener('load',function(e){
			if (request.status==200) {
			    this.$uploadRequest = null;
				var ret = Json.decode(request.response);
				$pick(onComplete,$empty)(ret);	
			}
		}.bind(this));
		request.addEventListener('error',function(){
			$pick(onFailure,$empty)();
		}.bind(this));
		request.upload.addEventListener('progress',function(e){
            var p = e.loaded / e.total;
            //console.log('Progress :'+p*100,e.loaded,e.total);
        }.bind(this));
		request.open('POST',link.toString(),true);
		//request.responseType = 'json';
		//request.setRequestHeader('Content-Type','multipart/form-data');
		request.send(formData);
		this.$uploadRequest = request;
	},
	onComplete:function(html){
		if ($defined(this.container)){
			this.container.set('html',html);
		}
		this.fireEvent('onComplete',[html]);		
	},
	postComplete:function(){
		this.fireEvent('onPostComplete',[this]);
		window.fireEvent('postAjax',[this]);
	},
	isRunning:function(){
		if ($defined(this.req)) {
			return this.req.running;
		} else if ($defined(this.$uploadRequest)) {
		    return true;
		}
		return false;		
	},
	cancel:function(){
		if (this.isRunning()) {
		    if ($defined(this.req)) {
		        this.req.cancel();    
		    } else if ($defined(this.$uploadRequest)) {
		        this.$uploadRequest.abort();
		    }
			
			this.fireEvent('onCancel',[this]);
		}		
		return this;
	}
});

TPH.Json = new Class({
	Extends:TPH.Ajax,
	onComplete:function(html){
		try {
			var data = Json.decode(html);
		} catch(e) {};
		if ($defined(data)){
			this.parent(data);
			if ($defined(data.status)) {
				if (!data.status) {
					switch(data.code){
						case 'session':
							window.fireEvent('onInvalidSession',[data,this]);
							break;
					}
				}
			} 
		} else {
			TPH.Connectivity.invalidResponse(html);
			this.fireEvent('onFailure');
		}
	} 
});

TPH.AjaxForm = new Class({
	Extends:TPH.Ajax,
	initialize:function(form,options){
		this.form = form;
		this.parent(options);
	},
	buildRequest:function(options){
        var options = $merge({data:this.form.toQueryString().parseQueryString()},options);
        this.fireEvent('onBuild',[options]);
        //this.req = new Ajax(this.options.url,options);
        var link = this.options.url.toURI();
        //console.log('AJAX:',this.options.url,link.get('host'));
        if ($defined(TPH.$remote)) {
            var remote = TPH.$remote.toURI();
            link.set('scheme',remote.get('scheme'));
            link.set('host',remote.get('host'));
            link.set('directory',remote.get('directory'));
            link.set('port',null);
        }
        //link.set('port',null);
        
        this.req = new Request($merge(options,{
			url:link.toString()
		}));
		this.req.send();
    }	
});

TPH.JsonForm = new Class({
	Extends:TPH.AjaxForm,
	onComplete:function(html){
		try {
			var data = Json.decode(html);
		} catch(e) {};		
		if ($defined(data)){
			this.parent(data); 
		} else {
			TPH.Connectivity.invalidResponse(html);
			this.fireEvent('onFailure');
		}
	}
});

TPH.ToolForm = new Class({
	Implements:[Options,Events],
	options:{
		caption:'Tool',
		tool:'toolname',
		classes:{
			$save : 'saveButtonClass',
			$close : 'closeButtonClass',
			$page:'pagenav'
		},
		form:'formName',
		messages:{
			//success:'Data successfully saved.'
		},
		submitURL:'.',
		params:{
			task:'save',
			format:'raw'
		},
		listURL:'.',
		list:{
			format:'raw'
		},
		size:{'height':'auto','width':350},
		container:'listContainer',
		loadList:true,
		autoClose:true,
		autoRoute:true,
		autoRefresh:true,
		autoUpdate:false,
		autoUpdateDelay:1000,
		listMethod:'ajax',
		submitMethod:'json',
		infiniteList:false,
		clearListContainer:true
	},
	status:true,
	initialize:function(options,onSuccess){
		this.setOptions(options);
		this.setTools(TPH.Tools.instance);
		this.fireEvent('onCreate',[this]);
		this.initializeTool();
		this.initializeList(onSuccess);
	},
	setTools:function(instance){
		this.tools = instance;
	},
	getTool:function(){
		this.tool = this.tools.getTool(this.options.tool);
		return this.tool;
	},
	setStatus:function(status){
		this.status = status;
		if ($defined(this.tool)) {
			this.tool.setStatus(this.status);
		}
	},
	initializeTool:function(){
		if ($defined(this.getTool())) {
			this.setStatus(this.status);
			this.tool.removeEvents();
			this.tool.addEvents({
				onBeforeClose:function(){				
					if ($defined(this._request)) {
						if (this._request.isRunning()) {
							this._request.cancel();
						}
					}
					this.fireEvent('onBeforeClose');
				}.bind(this),
				onBeforeOpen:function(instance,el){
					this.fireEvent('onBeforeOpen',[this,instance,el]);
				}.bind(this),
				open:function(){
					this.loadModal();
				}.bind(this),
				beforeLoad:function(options,el){
					var el = $pick(el,this.lastElement);				
					if ($defined(el)) {
						var id = el.get('data-id');
						
						if ($defined(id)) {
							//this.options.id = id;
							options.data.id = id;
							this.lastID = id;
						}
						this.lastElement = el;
					} else if ($defined(this.lastID)) {
						options.data.id = this.lastID;
					}
					 
					if ($defined(this.options.token)) {
						options.data[this.options.token]=1;
					} else if ($defined(TPH.$token)) {
						options.data[TPH.$token]=1;
					}
					var session = $pick(this.options.session,TPH.$session);
					if ($defined(session)) {
						options.data.session=session;
					} 
					
					if ($defined(this.form)) {
						this.form.reset();
						this.form.getElements('input,textarea,select,button').set('disabled',true);
						this.form = null;
						this.formInitialized = false;
						this._request = null;
					}
					
					this.fireEvent('onBeforeLoadModal',[options,el,this]);
				}.bind(this)
			});
		}		
		this.fireEvent('onInitializeTool',[this]);
		return this;
	},
	initializeList:function(onSuccess){
		this.container = document.id(this.options.container);
		
		if ($defined(this.container)) {
			this.mainContainer = this.container;
		    this.container.addClass('ajaxContainer');
		    this.options.listURL = '.';
		    
		    if (this.options.infiniteList) {
		    	if (this.options.clearListContainer) {
		    		this.container.empty();
		    	} else {
		    		this.clearedListContainer = false;
		    	}
		    	this.infiniteContainer = document.id($pick(this.options.infiniteContainer,this.container.getParent()));
		    	
		    	this.options.limit = $pick(TPH.$limit,10);
		    	this.options.limitstart = 0;
				this.infiniteContainer.addClass('infinite').addEvent('scroll', function(e){
					if (this.options.infiniteList) {
						var size = this.infiniteContainer.getSize();
						if (size.y+size.scroll.y>=size.scrollSize.y-20) {
							this.loadList();
						}	
					}
				}.bind(this));
			}
			
			this.fireEvent('onAfterInitializeListContainer',[this.mainContainer]);
		}
		return this.loadList(onSuccess);
	},
	loadList:function(onSuccess){
		if ($defined(this.container) && this.options.loadList) {
			if ($defined(this.listRequest)) {
			    if (this.listRequest.isRunning()) {
			        this.listRequest.cancel();
			    }
			}
			this.fireEvent('onBeforeLoadList',[this.options.list,this]);
			this.options.list[TPH.$token]=1;
			var session = TPH.$session;
			if ($defined(session)) {
				options.list.session=session;
			} 
			this.listRequest = new TPH[this.options.listMethod.ucfirst()]({
				url:this.options.listURL,
				data:this.options.list,
				onComplete:function(data){
					this.mainContainer.removeClass('loading');
					switch(this.options.listMethod.ucfirst()){
						case 'Ajax':
							if ($defined(this.container) && this.options.loadList) {
								if (data.length) {
									if (!this.options.clearListContainer && !this.clearedListContainer) {
										this.container.empty();
										this.clearedListContainer = true;
									}
										
									this.container.set('html',data);									
									this.fireEvent('onBeforeInitializeList',[this,data]);
									this.tools.scanContainer(this.container);
									/*
									var tips = this.container.getElements('.hasTip');
									if ($defined(Tips.instance)) {
										Tips.instance.parseTitle(tips);
										Tips.instance.attach(tips);
									} else {
										Tips.instance = new Tips(tips);
									}
									*/
									if (!this.options.infiniteList) {
										this.container.getElements('a.'+this.options.classes.$page).each(function(page){									   
										    page.addEvent('click',function(e){
										        e.stop();
										        this.options.listURL = page.get('href');
										        this.listRequest = null;
										        this.loadList();
										    }.bind(this));
										}.bind(this));	
									} else {
										this.options.limitstart += this.options.limit;
									}
									this.fireEvent('onAfterInitializeList',[this.container,data]);
								} else {
									if (this.options.infiniteList) {
										this.container.remove();	
										this.options.infiniteList = false;
									}									
								}
							}															
							break;
						case 'Json':
							this.fireEvent('onInitializeList',[this,data]);
							break;
					}
					
					if ($type(onSuccess)=='function') {
						onSuccess(this);
					}						
					
					if (this.options.autoUpdate) {
						this.$updaterTimer = this.loadList.delay(this.options.autoUpdateDelay,this,onSuccess);
					}			
				}.bind(this),
				onBuild:function(options){
					if ($defined(this.options.id)) {
						options.data.id = this.options.id;
					}
					
					if ($defined(this.options.token)) {
						options.data[this.options.token]=1;
					} else if ($defined(TPH.token)) {
						options.data[TPH.token]=1;
					}
					
					if (this.options.infiniteList) {
						$extend(options.data,{
							limitstart:this.options.limitstart,
							limit:this.options.limit
						});
					}
				}.bind(this),
				onRequest:function(){			
					if (this.options.infiniteList) {
						this.container = new Element('div',{'class':'listContent'}).injectInside(this.mainContainer); 
					}					
					this.mainContainer.addClass('loading');
					this.fireEvent('onRequestList',[this]);
				}.bind(this)
			}).request();
		} else if ($type(onSuccess)=='function'){
			onSuccess(this);
		}
		return this;
	},
	stopUpdate:function(){
		$clear(this.$updaterTimer);
		if ($defined(this.listRequest)) {
		    if (this.listRequest.isRunning()) {
		        this.listRequest.cancel();
		    }
		}
	},
	getModal:function(){
		this.modal = this.getTool().getModal();
		return this.modal;
	},
	loadModal:function(){
		this.getModal();

		this.modal.setSize(this.options.size);
		this.modal.setCaption(this.options.caption);
		/*
		var tips = this.modal.content.getElements('.hasTip');
		if (!$defined(Tips.instance)) {
			Tips.instance = new Tips(tips);
		} else {
			Tips.instance.parseTitle(tips);
			Tips.instance.attach(tips);
		}
		*/
		if (!$defined(this.form)) {
			this.form = $(window.document[this.options.form]);
			
			if ($defined(this.form)) {
				this.form.addEvents({
				   submit:function(e){
				       e.stop();
				       return false;
				   }.bind(this) 
				}).removeProperty('name');
				var saves = this.form.getElements('.'+this.options.classes.$save);
				saves.each(function(save){
					var classElement = save.getElement('span span span');
					if ($defined(classElement)) {
						save.store('class',classElement.get('class'));
					}
					save.addEvent('click',function(e){
						e.stop();
						this.save(save);
					}.bind(this));
				}.bind(this));
				
				this.form.getElements('.'+this.options.classes.$close).each(function(close){
				    close.addEvent('click',function(e){
				        e.stop();
				        this.modal.close();
				    }.bind(this));
				}.bind(this));
				
				this.form.getElements('input,textarea,select').each(function(el){
					el.addEvent('keydown',function(e){
						switch(e.key){
							case 'f5':
								e.stop();
								this.modal.reload();
								return false;
								break;
						}
					}.bind(this));
				}.bind(this));
					
				var el = document.id(this.form.elements[0]);
				if ($defined(el)) {	
					el.focus();
				}
				
			}
		}	
		this.fireEvent('loadModal',[this.modal,this]);
		window.fireEvent('onLoadTool',[this.options.tool,this.modal,this]);
	},
	resetButton:function(el){
		if ($defined(el)) {
			var className = el.retrieve('class');
			if ($defined(className)) {
				el.getElement('span span span').set('class',className);
			}
			if (el.hasClass('processing')) el.removeClass('processing');
		}		
	},
	validate:function(){
		return true;
	},
	save:function(el){
		var el = $pick(el,this.lastButton);
		this.lastButton = el;
		if (!this.validate()) return;
		if ($defined(this._request)) {
		    if (this._request.isRunning()) {
                this._request.cancel();
            }
		}
		
		this._request = new TPH[this.options.submitMethod.ucfirst()+'Form'](this.form,{
			onBuild:function(data){					
				var options = this.options.params;
				if ($defined(this.options.$token)) {
					options[this.options.$token]=1;
				} else if ($defined(TPH.$token)) {
					options[TPH.$token]=1;
				}
				var session = TPH.$session;
				if ($defined(session)) {
					options.session=session;
				} 
				this.fireEvent('onBeforeSaveBuild',[options,this]);
				for(option in options){
					if ((!$defined(data.data[option]) && this.options.preserveFormData) || !this.options.preserveFormData) {
						data.data[option] = options[option];	
					}							
				}						
				this.fireEvent('onBeforeSave',[el,this,data]);
			}.bind(this),
			onComplete:function(data){
				switch(this.options.submitMethod){
					case 'ajax':
						this.fireEvent('onFormComplete',[data,this]);
						break;
					case 'json':
						if (data.status) {							
							if ($defined(data.link) && this.options.autoRoute) {
								window.location.assign(data.link);
							} else {
							    this.fireEvent('onFormComplete',[data,this]);
							    if (this.options.autoRefresh) {
							    	this[(this.options.infiniteList?'initialize':'load')+'List']();	
							    }
								if (this.options.autoClose) {
									this.modal.close();
								}
								
								if ($defined(this.options.messages.success)) {
									TPH.alert(this.options.caption,this.options.messages.success,this.options.onSuccess);
								} else if ($defined(this.options.onSuccess)){
									this.options.onSuccess();
								} else if ($defined(data.message)) {
									if ($defined(this.options.alertFunction)) {
										this.options.alertFunction($defined(data.caption)?data.caption:this.options.caption,data.message);
									} else {
										TPH.alert($defined(data.caption)?data.caption:this.options.caption,data.message);	
									}
								}
														
								window.fireEvent('onToolUpdate',[this.options.tool,data]);
							}						
						} else {
							if ($defined(this.options.alertFunction)) {
								this.options.alertFunction(this.options.caption,data.message);
							} else {
								TPH.alert(this.options.caption,data.message);	
							}
						}
						break;
				}
				
				this.resetButton(el);
				this.modal.stopSpin();
			}.bind(this),
			onRequest:function(){
				if ($defined(el)) {
					var classElement = el.getElement('span span span');
					if ($defined(classElement)) {
						classElement.set('class','loading_item');
					} else {
						el.addClass('processing');
					}
				}					
				this.modal.startSpin();
			}.bind(this),
			onFailure:function(){
				if ($defined(el)) {
					this.resetButton(el);
				}						
				this.modal.stopSpin();				
			}.bind(this)
		}).request();		
	},
	destroy:function(){
		this.tools.removeTool(this.options.tool);
	}
});

TPH.Selectors = {
	create:function(type,el,options){
		switch(type){
			case 'dropdown':
				return new TPH.Selectors.DropDown(el,options);
				break;
			case 'spinner':
				return new TPH.Selectors.Spinner(el,options);
				break;
			default:
				throw 'Unknown Selector Type \''+type+'\'. Valid selector types are [dropdown,spinner]';
		}
	}
};

TPH.Selectors.DropDown = new Class({
	Implements:[Options,Events],
	options:{
		attributes:{},
		selections:[],
		key:'id',
		text:'text',
		classes:{
			container:'ts_dropdown'
		},
		required:false
	},
	initialize:function(el,options){
		this.containment = new Element('div').injectAfter(el);
		this.el = el.setStyle('display','none').inject(this.containment);
		this.setOptions(options);
		this.container = new Element('select',{
			'class':this.options.classes.container
		}).injectAfter(el);
		if (this.options.required) {
			this.container.set('required','required');
		}
		this.container.addEvents({
			change:function(){
				this.el.set('value',this.container.get('value'));
				this.fireEvent('change',[this.getValue()]);
			}.bind(this)
		});
		for(attribute in this.options.attributes) {
			this.container.setProperty(attribute,this.options.attributes[attribute]);
		}
		this.reloadSelections();
		this.setValue(el.get('value'));
	},
	reloadSelections:function(){
		var lastValue = this.getValue();
		this.container.empty();
		this.options.selections.each(function(item){
			
			switch($type(item)){
				case 'object':
					var value = item[this.options.key];
					var text = item[this.options.text];
					break;
				case 'string':
					var value = item;
					var text = item;
					break;
			}
			if ($defined(value) && $defined(text)) {
				new Element('option',{'value':value})
					.injectInside(this.container)
					.set('html',text)
					.store('data',item)
					;
			}
			
		}.bind(this),this);
		this.setValue(lastValue);
		return this;
	},
	setValue:function(value){
		this.container.set('value',value);
		this.el.set('value',value);		
		return this;
	},
	getValue:function(){
		return this.el.get('value');
	},
	disabled:function(d){
		if ($defined(d)) {
			this.el.set('disabled',d);
			this.container.set('disabled',d);
		}
		return this.el.get('disabled');
	}
});
TPH.Selectors.Spinner = new Class({
	Implements:[Options,Events],
	options : {
		selections:[],
		classes:{
			container:'ts_spinner',
			up:'ts_spinner_plus',
			down:'ts_spinner_minus',
			input:'ts_spinner_input',
			selectContainer:'ts_selection_container',
			selections:'ts_selections'
		}
	},
	initialize:function(el,options) {
		this.setOptions(options);
		
		this.container = new Element('div',{'class':this.options.classes.container}).injectAfter(el);
		if ($defined(this.options.classes)) {
			this.options.classes.each(function(c){
				this.container.addClass(c);
			}.bind(this));
		}
		this.plus = new Element('div',{'class':this.options.classes.up}).injectInside(this.container);
		this.plus.addEvents({
			'mousedown':function(e){ 
						this.startScroll();
						this.goUp(); 
					}.bind(this),
			'mouseup':function(e){ 
						this.stopScroll(); 
					}.bind(this)
		});
		
		this.element = el.injectAfter(this.container).addClass(this.options.classes.input);
		this.selectContainer = new Element('div',{'class':this.options.classes.selectContainer})
									.injectInside(this.container)
									.addEvent('click',function(e){
										if (!this.selectContainer.hasClass('ts_dropped')) {
											this.dropSelections();
											this.clicked = true;											
										} else {
											this.hideSelections();
											
										}
									}.bind(this));
		
		this.selectContainer.store('coords',this.selectContainer.getCoordinates());
		this.selections = new Element('div',{'class':this.options.classes.selections}).injectInside(this.selectContainer);
		
		this.reloadSelections();
		
		this.minus = new Element('div',{'class':this.options.classes.down}).injectInside(this.container);
		this.minus.addEvents({
			'mousedown':function(e){
						this.startScroll();
						this.goDown(); 
					}.bind(this),
			'mouseup':function(e){ 
						this.stopScroll(); 
					}.bind(this)
		});
			
		this.scroll = new Fx.Scroll(this.selectContainer, {
			wait: false,
			duration: 'short',
			offset : {y:-2},
			transition: Fx.Transitions.Quad.easeInOut,
			onStart:function(){
					if ($defined(this.lastScrollAction)) {
						this.lastScrollAction.addClass('active');
						this.selectContainer.addClass('active');
					}
				}.bind(this),
			onComplete:function(){
					if (this.keepScrolling) {
						if ($defined(this.lastScrollAction)) {
							this.lastScrollAction.fireEvent('mousedown');
						}
					} else {
						this.stopScroll();
					}
				}.bind(this)
		});
		
		this.index = 0; 
		
		$(window).addEvent('click',function(){
			if (!this.clicked) {
				this.hideSelections();
			}
			this.clicked = false;
		}.bind(this));
	},
	dropSelections:function(){		
		if (!$defined(this.dropList)) {
			var coords = this.selectContainer.retrieve('coords');
			var ccoords = this.selectContainer.getCoordinates();
			var scoords = this.selections.getCoordinates();

			this.dropList = new Element('div',{'class':'ts_dropSelection'})
									.injectInside(window.document.body)
									.setStyles({'position':'absolute'})									
									;
			var self = this;
			this.options.selections.each(function(item){
				new Element('div',{'rel':item,'class':item==this.getValue()?'current':''}).injectInside(this.dropList).set('html',item)
					.addEvent('click',function(e){
						var data = this.getProperty('rel');
						if (item!=self.getValue()) {
							self.setValue(data);
						}
						 
					});
			}.bind(this),this);
			this.dropList.setStyles({
										'width':scoords.width,
										'top':coords.bottom,
										'left':ccoords.left
									});
		}
		this.selectContainer.addClass('ts_dropped');
	},
	hideSelections:function(){
		if ($defined(this.dropList)) {
			this.dropList.destroy();
			this.dropList = null;
		}
		this.selectContainer.removeClass('ts_dropped');
	},
	setSelections:function(selections){
		this.options.selections = selections;
	},
	reloadSelections:function(){
		this.options.selections.each(function(item){
			new Element('div',{'rel':item}).injectInside(this.selections).set('html',item);
		}.bind(this),this);
	},
	setValue:function(value){
		var elements = this.selections.getChildren();
		for(var i=0; i<elements.length;i++) {
			var el = elements[i];
			var rel = el.getProperty('rel');
			if (rel==value) {
				this.index = i;
				this.stopScroll();
				this.scrollSelection();
				return;
			}
		}
		return this;
	},
	getValue:function(){
		var target = this.selections.getChildren()[this.index];
		return target.getProperty('rel');
	},
	getMaxIndex:function(){
		return this.options.selections.length-1;
	},
	goUp:function(){
		if ((this.index-1)<0) {
			return;
		}
		this.index -= 1;
		this.lastScrollAction = this.plus;
		this.scrollSelection();
		return this;
	},
	goDown:function(){
		if ((this.index+1)>this.getMaxIndex()) {
			return;
		}
		this.index += 1;
		this.lastScrollAction = this.minus;
		this.scrollSelection();
		return this;
	},
	scrollSelection:function() {
		var target = this.selections.getChildren()[this.index];
		this.scroll.toElement(target);
		this.fireEvent('change',[target.getProperty('rel')]);
	},
	startScroll:function(){
		this.keepScrolling = true;
		return this;
	},
	stopScroll:function(){
		this.keepScrolling = false;
		if ($defined(this.lastScrollAction)) {
			this.lastScrollAction.removeClass('active');
			this.selectContainer.removeClass('active');
		}
		return this;
	}
});
Number.implement({
	pad:function(filler,count,left){
		var left = $pick(left,true);
		var numabs = Math.abs(this);
		var numstr = String.convert(numabs);
		
		if (numstr.length>count) {
			return (this<0?'-':'')+numstr;
		} else {
			var filler = numstr.length<count?filler.repeat(count-numstr.length):'';
			var filled = (left?filler:'')+numabs+(left?'':filler);
			return (this<0?'-':'')+(numstr.length>count?numstr:filled);;	
		}
	}
});
String.implement({
	replaceAll:function(search, replacement) {
	    var target = this;
	    return target.replace(new RegExp(search, 'g'), replacement);
	},
	nl2br:function (is_xhtml) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: Philip Peterson
	  // +   improved by: Onno Marsman
	  // +   improved by: Atli Þór
	  // +   bugfixed by: Onno Marsman
	  // +      input by: Brett Zamir (http://brett-zamir.me)
	  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Maximusya
	  // *     example 1: nl2br('Kevin\nvan\nZonneveld');
	  // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
	  // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
	  // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
	  // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
	  // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
	  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
	
	  return (this + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	},
	ucwords:function(){
		var words = this.toLowerCase().split(' ');
		var str = '';
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			word = word.charAt(0).toUpperCase() + word.slice(1);
			if (i > 0) { str = str + ' '; }
			str = str + word;
		}
		return str;
	},
	ucfirst:function() {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   bugfixed by: Onno Marsman
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // *     example 1: ucfirst('kevin van zonneveld');
	  // *     returns 1: 'Kevin van zonneveld'
	  var str = this+'';
	  var f = str.charAt(0).toUpperCase();
	  return f + str.substr(1);
	},
	stripTags:function(){
		return this.replace(/(<([^>]+)>)/ig,"");
	},
	parseQueryString:function(decodeKeys, decodeValues){
		if (decodeKeys == null) decodeKeys = true;
        if (decodeValues == null) decodeValues = true;

        var vars = this.split(/[&;]/),
            object = {};
        if (!vars.length) return object;

        vars.each(function(val){
            var index = val.indexOf('=') + 1,
                value = index ? val.substr(index) : '',
                keys = index ? val.substr(0, index - 1).match(/([^\]\[]+|(\B)(?=\]))/g) : [val],
                obj = object;
            if (!keys) return;
            if (decodeValues) value = decodeURIComponent(value);
            keys = keys.filter(function(item,index){ return item.length>0;});
            keys.each(function(key, i){
                if (decodeKeys) key = decodeURIComponent(key);
                var current = obj[key];

                if (i < keys.length - 1) obj = obj[key] = current || {};
                else if ($type(current) == 'array') current.push(value);
                else obj[key] = current != null ? [current, value] : value;
            });
        });

        return object;
	},
	cleanQueryString: function(method){
		return this.split('&').filter(function(val){
			var index = val.indexOf('='),
				key = index < 0 ? '' : val.substr(0, index),
				value = val.substr(index + 1);

			return method ? method.call(null, key, value) : (value || value === 0);
		}).join('&');
	},
	base64_encode:function() {
	  //  discuss at: http://phpjs.org/functions/base64_encode/
	  // original by: Tyler Akins (http://rumkin.com)
	  // improved by: Bayron Guevara
	  // improved by: Thunder.m
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Rafał Kukawski (http://kukawski.pl)
	  // bugfixed by: Pellentesque Malesuada
	  //   example 1: base64_encode('Kevin van Zonneveld');
	  //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	  //   example 2: base64_encode('a');
	  //   returns 2: 'YQ=='
	  var data = this;
	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    enc = '',
	    tmp_arr = [];
	
	  if (!data) {
	    return data;
	  }
	
	  do { // pack three octets into four hexets
	    o1 = data.charCodeAt(i++);
	    o2 = data.charCodeAt(i++);
	    o3 = data.charCodeAt(i++);
	
	    bits = o1 << 16 | o2 << 8 | o3;
	
	    h1 = bits >> 18 & 0x3f;
	    h2 = bits >> 12 & 0x3f;
	    h3 = bits >> 6 & 0x3f;
	    h4 = bits & 0x3f;
	
	    // use hexets to index into b64, and append result to encoded string
	    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	  } while (i < data.length);
	
	  enc = tmp_arr.join('');
	
	  var r = data.length % 3;
	
	  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	},
	base64_decode:function() {
	  //  discuss at: http://phpjs.org/functions/base64_decode/
	  // original by: Tyler Akins (http://rumkin.com)
	  // improved by: Thunder.m
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //    input by: Aman Gupta
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  // bugfixed by: Onno Marsman
	  // bugfixed by: Pellentesque Malesuada
	  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	  //   returns 1: 'Kevin van Zonneveld'
	  //   example 2: base64_decode('YQ===');
	  //   returns 2: 'a'
	  var data = this;
	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    dec = '',
	    tmp_arr = [];
	
	  if (!data) {
	    return data;
	  }
	
	  data += '';
	
	  do { // unpack four hexets into three octets using index points in b64
	    h1 = b64.indexOf(data.charAt(i++));
	    h2 = b64.indexOf(data.charAt(i++));
	    h3 = b64.indexOf(data.charAt(i++));
	    h4 = b64.indexOf(data.charAt(i++));
	
	    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
	
	    o1 = bits >> 16 & 0xff;
	    o2 = bits >> 8 & 0xff;
	    o3 = bits & 0xff;
	
	    if (h3 == 64) {
	      tmp_arr[ac++] = String.fromCharCode(o1);
	    } else if (h4 == 64) {
	      tmp_arr[ac++] = String.fromCharCode(o1, o2);
	    } else {
	      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
	    }
	  } while (i < data.length);
	
	  dec = tmp_arr.join('');
	
	  return dec.replace(/\0+$/, '');
	},
	isDomain:function(){
		return this.test(/^(http(s)?\:\/\/)?([.a-z0-9/-]+\.)?([.a-z0-9/-]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?(\/)?$/i);
	},
	isEmail:function(){
	    return this.test(/^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]\.?){0,63}[a-z0-9!#$%&'*+\/=?^_`{|}~-]@(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\])$/i);
	},
	toBlob:function() {
		var dataURI = this;
	    // convert base64 to raw binary data held in a string
	    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	    var byteString = atob(dataURI.split(',')[1]);
	
	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	
	    // write the bytes of the string to an ArrayBuffer
	    var ab = new ArrayBuffer(byteString.length);
	    var ia = new Uint8Array(ab);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }
	
	    //Old Code
	    //write the ArrayBuffer to a blob, and you're done
	    //var bb = new BlobBuilder();
	    //bb.append(ab);
	    //return bb.getBlob(mimeString);
	
	    //New Code
	    return new Blob([ab], {type: mimeString});
	}
});

Number.implement({
	toDistance:function(units){
		var units = $pick(units,['m','Km']);
		var unit = units[0];
		var val = this;
		if (this>1000) {
			unit = units[1];
			val /= 1000;
		}
		return val+' '+unit;
	}
});

Function.implement({
	throttle:function(context,timeout){
	    var self = this;
	    
        if (self.waiting) return;
        self.apply(context, arguments);
        self.waiting = true;
        setTimeout(function(){
            self.waiting = false;
        }, timeout || 100);
	},
	debounce:function(context,timeout){
	    var args = arguments;
	    var self = this;
        clearTimeout(self.timer);
        self.timer = (function(){
            self.apply(context, args[2]);
        }).delay(timeout || 100,context);
	}
});

TPH.ScrollIt = new Class({
	Implements:[Options,Events],
	options:{
		classes:{
			container:'scrollContainer',
			scrollBar:'scrollBar',
			scrollKnob:'scrollKnob'
		},
		slider:{
			range:[0,100],
			wheel:true,
			mode:'vertical'			
		},
		height:200,
		knobHeight:200
	},
	position:0,
	initialize:function(target,options){
		this.target = $(target);
		this.setOptions(options);
		this.container = new Element('div',{'class':this.options.classes.container})
							.injectBefore(this.target)
							.setStyle('height',this.options.height)
							.set('tabindex',0)
							.addEvents({
								keyup:function(e){
									if (!this.check()) return;
 									var e = new Event(e);									
									switch(e.event.key) {
										case 'Up':
											this.slider.set(this.slider.step-1);
											break;
										case 'Down':
											this.slider.set(this.slider.step+1);
											break;
										case 'PageDown':
											this.slider.set(this.slider.step+10);
											break;
										case 'PageUp':
											this.slider.set(this.slider.step-10);
											break;
										case 'Home':
											this.slider.set(0);
											break;
										case 'End':
											this.slider.set(100);
											break;
									}
								}.bind(this),
								mousewheel:function(e){
									if (!this.check()) return;				
									var step = this.slider.step-(e.wheel*5);
									this.slider.set(step);		
									if (step<100 && step>0) {
										e.stop();
									}															
								}.bind(this)
							});
		this.scrollBar = new Element('div',{'class':this.options.classes.scrollBar}).injectInside(this.container);
		this.scrollKnob = new Element('div',{'class':this.options.classes.scrollKnob}).injectInside(this.scrollBar).setStyle('height',this.options.knobHeight);
		this.scrollBar.setStyle('height',this.container.getCoordinates().height);
		
		this.target.injectInside(this.container)
			.addClass('scrollArea')
			.setStyle('width',this.container.getCoordinates().width-this.scrollBar.getCoordinates().width);
			
		this.height = this.target.getCoordinates().height;
		
		this.slider = new Slider(this.scrollBar,this.scrollKnob,this.options.slider).addEvents({
			onChange:function(step){
				this.scroll(step);
			}.bind(this)
		});
		this.check();
		window.fireEvent('onCreateScroller',[this.container]);
	},
	check:function(){
		if (this.height<this.options.height) {
			this.scrollBar.setStyle('display','none');
			return false;
		}
		this.scrollBar.setStyle('display','');
		return true;		
	},
	calibrate:function(){
		this.check();
		this.height = this.target.getCoordinates().height;
		this.slider.set(this.slider.step-1);
		return this;
	},
	scroll:function(step) {
		this.target.setStyle('top',-(this.height-this.options.height)*(step/100));
	},
	set:function(set){
		this.slider.set(set);
	}
});

/*
Element.$originals = {
	innerHTML:Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML').set
}; 
Object.defineProperty(Element.prototype,'innerHTML',{
	set:function(){
		return Element.$originals.innerHTML.call(this, arguments);
	}
});
*/

Element.implement({
	flash: function(to,from,reps,prop,dur) {		
		//defaults
		if(!reps) { reps = 1; }
		if(!prop) { prop = 'background-color'; }
		if(!dur) { dur = 250; }
		
		var oldProp = this.getStyle(prop),
			effect = new Fx.Tween(this, {
			duration: dur,
			link: 'chain',
			onChainComplete:function(){
				this.setStyle(prop,'');
			}.bind(this)
		});
		
		//do it!
		for(x = 1; x <= reps; x++) {
			effect.start(prop,from,to).start(prop,to,from);
		}
		//effect.start(prop,from,to);
	}
});

TPH.Implementors = {
	ToolPlugins:new Class({
		plugins:{},
		rebuildPlugins:function(plugins,onSuccess){
			if (plugins.length) {
				var plugin = plugins.shift();
				plugins.each(function(p){
					if ($defined(this.plugins[p])) {
						var container = this.plugins[p].container;
						if ($defined(container)) {
							container.empty().addClass('loading');
						}	
					}
				}.bind(this));
				if (!$defined(this.plugins[plugin])) {
					var options = {loadList:false};
					
					this.createPlugin(plugin,options);
					this.plugins[plugin] = new this.pluginStore[plugin](options);
				} 
				this.loadPlugin(plugin,this.plugins[plugin]);
				this.plugins[plugin].initializeTool().initializeList(function(){
					this.rebuildPlugins(plugins,onSuccess);
				}.bind(this));		
			} else if ($type(onSuccess)=='function') {
				onSuccess();
			}
		},
		createPlugin:function(plugin,options){},
		loadPlugin:function(plugin,instance){}
	}),
	ToolListFilters:new Class({
		prepFilters:function(){
			this.filterForm = document.id(window.document[this.options.filterForm]);
			if ($defined(this.filterForm)) {
				this.filterForm.addEvent('submit',function(e){
					new Event(e).stop();
					this.setOptions({listUrl:'.'}).loadList();
					return false;
				}.bind(this));	
				
				var term = this.filterForm.getElement('.searchTerm');
				if ($defined(term)) {
					new SearchTerm(term,{
						onClear:function(){
							this.setOptions({listUrl:'.'}).loadList();
						}.bind(this)
					});
				}
				
				this.filterForm.getElements('select').each(function(el){
					el.addEvent('change',function(e){
						this.setOptions({listUrl:'.'}).loadList();
					}.bind(this));
				}.bind(this));
			}
		}
	}),
	ListFilters:new Class({
		$filters:{},
		$activeFilter:false,
		createFilter:function(name,container,listMethod){
			this.$filters[name] = container;
			container.addEvent('submit',function(e){
				e.stop();
				//listMethod();
				return false;
			}.bind(this));
			var terms = container.getElements('input[name="term"],input[type="text"].isTerm');
			terms.each(function(term){
				var termContainer = term.getParent();
				var row = new Element('li').inject(new Element('ul',{
					'class':'fieldList spaced'
				}).inject(termContainer));
				new Element('div',{'class':'inputSpace noPadding'}).inject(row).adopt(term);
				new Element('i',{'class':'fa fa-times control active'}).inject(row).addEvent('click',function(){
					term.set('value','');
					listMethod();
				}.bind(this));
			}.bind(this));
			this.scanFilterElements(container,listMethod);
		},
		scanFilterElements:function(container,listMethod){
			container.getElements('input,select').each(function(el){
				this.prepFilterElement(el,listMethod);
			}.bind(this));
		},
		prepFilterElement:function(el,listMethod){
			switch(el.get('tag')){
				case 'input':
					switch(el.get('type')){
						case 'checkbox':
						case 'radio':
							el.addEvent('click',function(){
								listMethod.delay(200);
							});
							break;
						case 'date':
							el.addEvents({
								input:function(e){
									listMethod();	
								}
							});
							break;
						default:
							el.addEvents({
								keyup:function(e){
									switch(e.key){
										case 'esc':
											if ($type(e.stop)=='function') {
												e.stop();	
											}
											el.set('value','');
											listMethod();
											break;
										case 'enter':
											if ($type(e.stop)=='function') {
												e.stop();	
											}
											listMethod();
											break;
										default:
											if (this.$activeFilter) {
												listMethod();
											}	
									}	
								}.bind(this)
							});
					}
					break;
				case 'select':
					var disableTrigger = el.hasClass('disableFilterUpdate');
					if (!disableTrigger) {
						el.addEvent('change',function(){
							listMethod();
						});	
					}
					
					break;
			}
		},
		getFilter:function(name){
			return $defined(this.$filters[name])?this.$filters[name].toQueryString().parseQueryString():{};
		},
		hasFilter:function(name){
			return $defined(this.$filters[name]);
		},
		setFilterValue:function(name,field,value){
			var el = this.$filters[name].getElement('[name="'+field+'"]');
			if ($defined(el)) {
				el.set('value',value);
			}
			return this;
		}
	}),
	ServerRequest:new Class({
		//startSpin:function(){},
		//stopSpin:function(){},
		serverRequest:function(params,options,attachment){
			if ($defined(this.$request)) {
				this.$request.cancel();
			}
			params[TPH.$token]=1;
			var session = TPH.$session;
			if ($defined(session)) {
				params.session=session;
			} 
			this.$request = new TPH.Json($merge({data:params},options),attachment);
			this.$request.addEvents({
				onRequest:function(){
					/*
					if ($defined(this.startSpin)) {
						this.startSpin();	
					}
					*/
				}.bind(this),
				onComplete:function(){
					/*
					if ($defined(this.stopSpin)) {
						this.stopSpin();	
					}
					*/
				}.bind(this),
				onFailure:function(){
					/*
					if ($defined(this.stopSpin)) {
						this.stopSpin();	
					}
					*/
				}.bind(this)
			});
			this.$request.request();
		},
		stopServerRequest:function(){
			if ($defined(this.$request)) {
				this.$request.cancel();
			}
		}
	}),
	ActiveRequest:new Class({
		$requests:{},
		//startSpin:function(){},
		//stopSpin:function(){},
		activeRequest:function(id,params,options,attachment){
			if ($defined(this.$requests[id])) {
				this.$requests[id].cancel();
			}
			params[TPH.$token]=1;
			var session = TPH.$session;
			if ($defined(session)) {
				params.session=session;
			} 
			this.$requests[id] = new TPH.Json($merge({data:params},options),attachment);
			this.$requests[id].addEvents({
				onRequest:function(){
					/*
					if ($defined(this.startSpin)) {
						this.startSpin();	
					}
					*/
				}.bind(this),
				onComplete:function(){
					/*
					if ($defined(this.stopSpin)) {
						this.stopSpin();	
					}
					*/
				}.bind(this),
				onFailure:function(){
					/*
					if ($defined(this.stopSpin)) {
						this.stopSpin();	
					}
					*/
				}.bind(this)
			});
			this.$requests[id].request();
			return this.$requests[id];
		}
	}),
	ImageProcessing:new Class({
		rotate:function(data,degrees,onRotate){
			var image = new Image();
		    //assume png if not provided
		    image.src = data;
		    image.onload = function() {
		    	var w = image.width;
			    var h = image.height;
			    var rads = degrees * Math.PI/180;
			    var c = Math.cos(rads);
			    var s = Math.sin(rads);
			    if (s < 0) { s = -s; }
			    if (c < 0) { c = -c; }
			    
			    var canvas = new Element('canvas',{
			    	styles:{
			    		visibility:'hidden'
			    	}
			    }).inject(window.document.body);
			     var ctx = canvas.getContext("2d");
			     
			    //use translated width and height for new canvas
			    canvas.width = h * s + w * c;
			    canvas.height = h * c + w * s;
			    
			    //draw the rect in the center of the newly sized canvas
			    ctx.translate(canvas.width/2, canvas.height/2);
			    ctx.rotate(degrees * Math.PI / 180);
			    ctx.drawImage(image, -image.width/2, -image.height/2);
			    
			    var ret = {
			    	width:canvas.width,
			    	height:canvas.height,
			    	data:canvas.toDataURL()
			    };
			    
			    canvas.destroy();
			    image.destroy();
			    
			    if ($type(onRotate)=='function') {
			    	onRotate(ret);
			    }
		    };
		}
	}),
	TemplateData:new Class({
		applyDataConditions:function(container,data,selector){
			var inputs = new Array();
			var selector = $pick(selector,'');
			container.getElements('.valueCheck'+selector).each(function(el){
				var type = $pick(el.get('data-type'),'string');
				var field = $pick(el.get('data-check'),el.get('data-field'));
				var value = data[field];
				if ($defined(value)) {
					switch(type){
						case 'number':
							try {
								var num = value.toInt();
								if ($type(num)=='number') {
									if (!num) {
										el.destroy();
									}
								}
							} catch (e) {
								
							}
							break;
						case 'boolean':
							if (!value) {
								el.destroy();
							}
							break;
						default:
							if (!$pick(value,'').length) {
								el.destroy();
							}
							break;
					}	
				} else {
                    el.destroy();
                }
					
				el.removeClass('valueCheck');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.notValueCheck'+selector).each(function(el){
				var type = $pick(el.get('data-type'),'string');
				var field = $pick(el.get('data-check'),el.get('data-field'));
				var value = data[field];
				//if ($defined(value)) {
					switch(type){
						case 'number':
							try {
								var num = value.toInt();
								if ($type(num)=='number') {
									if (num) {
										el.destroy();
									}
								}
							} catch (e) {
								
							}
							break;
						case 'boolean':
							if (value) {
								el.destroy();
							}
						default:
							if ($pick(value,'').length) {
								el.destroy();
							}
							break;
					}	
				//}
					
				el.removeClass('notValueCheck');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			
			container.getElements('.styleContent'+selector).each(function(el){
				el.setStyle(el.get('data-style'),el.get('data-content')).removeProperties('data-style','data-content').removeClass('styleContent');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.propertyContent'+selector).each(function(el){
				el.set(el.get('data-property'),el.get('data-content')).removeProperties('data-property','data-content').removeClass('propertyContent');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.mapContent'+selector).each(function(el){
				var userLocation = $pick(el.get('data-user-location'),'1').toInt();
				var coords =el.get('data-coords').split(',');
				var map = new TPH.Map(el,{
					userLocation:userLocation==1,
					map:{
						center:coords
					},
					list:[{
						name:el.get('data-name'),
						address:el.get('data-address'),
						lat:coords[0],
						lng:coords[1]
					}],
					onReady:function(map){
						map.update.delay(500,map);	
					}
				});
				
                el.removeClass('mapContent');
                if (selector.length) {
                    el.removeClass(selector);    
                }
                inputs.push(map);
			});
			
			if ($defined(window.QRCode)) {
				container.getElements('.qrContent'+selector).each(function(el){
					var text = el.get('data-code');
					if ($defined(text)) {
						var size = $pick(el.get('data-size'),'100,100').split(',');
						new QRCode(el,{
							text:text,
							width:size[0].toInt(),
							height:size[1].toInt()
						});	
					}	
					el.removeClass('qrContent');
	                if (selector.length) {
	                    el.removeClass(selector);    
	                }
				});	
			}
			
			
			container.getElements('.noValueCheck'+selector).each(function(el){
				var field = $pick(el.get('data-check'),el.get('data-field'));
				if ($pick(data[field],'').length) {
					el.destroy();
				}	
				el.removeClass('noValueCheck');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.inValue'+selector).each(function(el){
				var separator = $pick(el.get('data-separator'),',');
				var value = $pick(el.get('data-value'),'').split(separator);
				var field = el.get('data-field');
				var list = $type(data[field])=='array'?data[field]:$pick(data[field],'').split(separator);
				var inValue = false;
				value.each(function(val){
					if (list.contains(val)) {
						inValue = true;
					}
				});
				
				if (!inValue) {
					el.destroy();
					return;
				}
				el.removeClass('inValue');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.notInValue'+selector).each(function(el){
				var separator = $pick(el.get('data-separator'),',');
				var value = $pick(el.get('data-value'),'').split(separator);
				var field = el.get('data-field');
				var list = $type(data[field])=='array'?data[field]:$pick(data[field],'').split(separator);
				var inValue = false;
				value.each(function(val){
					if (list.contains(val)) {
						inValue = true;
					}
				});
				
				if (inValue) {
					el.destroy();
					return;
				}
				el.removeClass('notInValue');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			container.getElements('.hasValue'+selector).each(function(el){
				var separator = $pick(el.get('data-separator'),',');
				var values = $pick(el.get('data-value'),'').split(separator);
				var field = el.get('data-field');
				var value = $type(data[field])=='number'?String(data[field]):data[field];
				if (!values.contains(value)) {
					el.destroy();
				}
				el.removeClass('hasValue');
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
            container.getElements('.notHasValue'+selector).each(function(el){
                var separator = $pick(el.get('data-separator'),',');
                var value = $pick(el.get('data-value'),'').split(separator);
                var field = el.get('data-field');
                if (value.contains($type(data[field])=='number'?String(data[field]):data[field])) {
                    el.destroy();
                }
                el.removeClass('notHasValue');
                if (selector.length) {
                    el.removeClass(selector);    
                }
            });
			
			container.getElements('select'+selector).each(function(el){
				var value = el.get('data-value');
				el.set('value',value);
				if (!$defined(value) || !value.length) {
					var def = el.get('data-default');
					if ($defined(def)) {
						el.set('value',def);	
					}
				}
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			
			container.getElements('.inputElement'+selector).each(function(el){
				var defaults = {},
					properties = {};
				$pick(el.get('data-default'),'').split(',').each(function(vals){
					if (vals.length) {
						var parts = vals.split('=');
						defaults[parts[0]]=parts[1];	
					}
				});
				$pick(el.get('data-properties'),'').split(',').each(function(vals){
					if (vals.length) {
						var parts = vals.split('=');
						properties[parts[0]]=parts[1];	
					}
				});
                
				inputs.push(TPH.createInput(el.get('data-type'),{
					name:el.get('data-name'),
					value:el.get('data-value'),
					defaults:defaults,
					required:el.get('data-required')=='1'?'required':null,
					properties:properties,
                    multiple:el.get('data-multiple'),
                    selections:$pick(el.get('data-selections'),'').split(',')
				}).inject(el));
				el.removeClass('inputElement')
					.removeProperty('data-type')
					.removeProperty('data-name')
					.removeProperty('data-value')
					.removeProperty('data-default')
					.removeProperty('data-required')
					.removeProperty('data-properties')
                    .removeProperty('data-multiple')
                    .removeProperty('data-selections')
					;
			});
			
			container.getElements('.removeIfEmpty'+selector).each(function(el){
				if (!el.getChildren().length) {
					el.destroy();
				}
			});
			
			container.getElements('input'+selector).each(function(el){
            	switch(el.get('type')){
            		case 'checkbox':
            			var value = el.get('data-value');
						if ($defined(value)) {
							el.set('checked',value.split(',').contains(el.get('value')));	
						}
						var required = 	el.get('required');
						if ($defined(required)) {
							el.addClass('required').removeProperty('required');
						}
						
            			break;
        			case 'radio':
        				if ($defined(el.get('data-value'))) {
							el.set('checked',el.get('data-value').split(',').contains(el.get('value')));	
						}
						var required = 	el.get('required');
						if ($defined(required)) {
							el.addClass('required').removeProperty('required');
						}
        				break;
    				case 'date':

    					break;
    				default:
    					var value = el.get('value');
						if (!value.length) {
							value = el.get('data-value');	
						} 
						el.set('value',value);
						if (!$defined(value) || !value.length) {
							var def = el.get('data-default');
							if ($defined(def)) {
								el.set('value',def);	
							}
						}
            	}
				
                if (selector.length) {
                    el.removeClass(selector);    
                }
			});
			
			return inputs;
		},
		applyTemplateData:function(el,template,data){
			var data = $pick(data,{});
			var date = new Date();
			
			el.set('html',template.substitute($merge(data,{
				today:date.format('%Y-%m-%d'),
				now:date.format('db'),
				thismonth:date.format('%m'),
				thisyear:date.format('%Y')
			})));
			return this.applyDataConditions(el,data);
		}
	})
};
TPH.Implementors.Templates = new Class({
    Implements:[TPH.Implementors.TemplateData],
    $focusSelector:'input[type="number"],input[type="text"],textarea,select',
    $templates:{},
    getTemplates:function(){
        return new Hash(this.$templates).getKeys();
    },
    dynamicTemplate:function(name,status){
        var template = this.$templates[name]; 
        if ($defined(status)) {
            template.dynamic = status;    
            if (status){
                template.containment.setProperty('class',$pick(template.fullHeight,false)?'template fullHeight':'template containment');
            } else {
                template.containment.setProperty('class','fullHeight overflow visible');
            }
        }
        return template.dynamic;
    },
    clearTemplates:function(){
        this.getTemplates().each(function(template){
            this.clearTemplate(template);
        }.bind(this));
    },
    clearTemplate:function(name){  
        var template = this.$templates[name];
        if ($defined(template)) {
            template.containment.setStyles({
                height:'',
                'padding-top':''
            });
            template.container.empty();
            template.items.each(function(item){
                if ($defined(item.el)) {
                    //console.log(item.el.$elements.length);
                    if (item.el.$elements.length) {
                        item.el.$elements.each(function(ele){
                            ele.destroy();
                        });    
                    }
                    item.el.destroy();
                }
            });
            template.items.empty();
            template.totalHeight = 0;
            this.updateTemplate(name);    
        }
        return this;
    },
    destroyTemplate:function(name){
    	var template = this.$templates[name];
    	if ($defined(template)) {
    		this.clearTemplate(name);
	        var parent = this.getTemplate(name).parent;
	        parent.removeEvents();
	        parent.destroy();
	        this.$templates[name] = null;	
    	}
    },
    destroyTemplates:function(){
        this.getTemplates().each(function(template){
            this.clearTemplate(template);
            var parent = this.getTemplate(template).parent;
            parent.removeEvents();
            parent.remove();
            this.$templates[template] = null;
        }.bind(this));
        this.$templates = {};
    },
    setTemplateContainer:function(name,container,fullHeight){
        var parent = container.getParent(),
            first = container.getFirst(),
            containment = new Element('div').inject(container,'before');
        
        containment.addClass($pick(fullHeight,false)?'template fullHeight':'template containment');
        var template = this.getTemplate(name);
        $extend(template,{
            parent:parent,
            containment:containment,
            container:container.inject(containment)
        });
        container.empty();
        this.updateTemplate(name);
        return this;
    },
    hideTemplate:function(name){
        this.$templates[name].containment.addClass('hidden');
    },
    showTemplate:function(name){
        this.$templates[name].containment.removeClass('hidden');
        this.updateTemplate(name);
    },
    setTemplate:function(name,template){
        this.$templates[name] = template;
    },
    createTemplate:function(name,container,fullHeight,dynamic){
        if ($defined(this.$templates[name])) {
            this.destroyTemplate(name);
        }
        var fullHeight = $pick(fullHeight,false),
            first = container.getFirst(),
            parent = container.getParent(), //.inject(content),
            containment = new Element('div',{'data-template':name}).inject(container,'before');
        
        containment.addClass(fullHeight?'template fullHeight':'template containment');
        containment.set('data-template-dynamic',dynamic?0:1);
        var template = {
            name:name,
            parent:parent,
            containment:containment,
            container:container.inject(containment),
            properties:first.getProperties('class','rel'),
            tag:first.get('tag'),
            template:first.get('html'),
            scroll:parent.getScroll(),
            items:new Array(),
            fullHeight:fullHeight,
            dynamic:$pick(dynamic,true),
            totalHeight:0
        };
        this.$templates[name] = template;
        container.empty();                  
        parent.addClass('ajaxContainer').addEvents({ 
            onBeforeFullHeight:function(parent){
                parent.setStyle('max-height','').getElements('.template.containment').addClass('hidden');
            }.bind(this),
            onAfterFullHeight:function(tel){
                var height = parent.getStyle('height').toInt(); //+parent.getStyle('margin-top').toInt()+parent.getStyle('margin-bottom').toInt()+parent.getStyle('border-top-width').toInt()+parent.getStyle('border-bottom-width').toInt();
                parent.setStyle('max-height',height);
                parent.getElements('.template.containment').each(function(el){
                    el.removeClass('hidden').setStyle('display','');
                    this.updateTemplate(el.get('data-template'));    
                }.bind(this));
            }.bind(this)
        }).addEventListener('scroll', function(e) {  
            if (template.dynamic) {
            	if ($defined(template.$scrollTimer)) {
            		clearTimeout(template.$scrollTimer);
            	}
                $extend(template.scroll,template.parent.getScroll());
                this.renderTemplate(name);
                this.fireEvent('onScroll',[template,this]);    
                
                template.$scrollTimer = (function(){
                	this.updateTemplateFocus(template);
                }.delay(500,this));
            }
        }.bind(this));
        
        
        switch(Browser.platform){
            case 'windows':
            	break;
                new Drag(parent, {
                    stopPropagation :true,
                    preventDefault:true,
                    style: false,
                    invert: true,
                    modifiers: {x: 'scrollLeft', y: 'scrollTop'}
                });
                break;
        }
        
        return this;
    },
    updateTemplate:function(name){
        var template = this.$templates[name];
        if ($defined(template)) {
            if (!template.items.length) return this;
            if ($defined(template.dynamic)) {
                if (template.dynamic) {
                    template.containment.setStyles({
                        height:template.totalHeight, //template.items.length*template.itemHeight,
                        width:template.container.hasClass('scrollX')?template.totalWidth:'',
                        'padding-top':template.scroll.y
                    });    
                    template.containment.getParent().scrollTo(template.scroll.x,template.scroll.y);
                } else {
                    template.containment.setStyles({
                    	width:'',
                        height:'',
                        'padding-top':''
                    });    
                }    
            }
        }            
        return this;
    },
    setTemplateFilter:function(name,filterFunction){
        this.$templates[name].filterFunction = filterFunction;
        return this;
    },
    applyTemplate:function(name,data,onCreateElement,onInjectElement){
        var template = this.$templates[name];
        var item = {
                data:data,
                offset:template.items.length,
                onCreateElement:onCreateElement,
                onInjectElement:onInjectElement
            };
       
        template.items.push(item);
        if (template.items.length<20) {
            (function(){
                this.renderTemplate(name);
            }.throttle(this));    
        } 
        
        
        return this;
    },
    renderTemplate:function(name,onRender){
        var template = this.$templates[name];
        var count = template.items.length;
        if (!count) {
            this.clearTemplate(name);
            return template;    
        }
        if (template.dynamic) {
        	var parentCoordinates = template.parent.getCoordinates(); 
            var parentHeight = parentCoordinates.height,
            	parentWidth = parentCoordinates.width,
                scroll = template.scroll,
                $empty = true;
            template.containment.setStyles({
                'padding-top':scroll.y,
                //'padding-left':scroll.x
            });
            /*
            template.container.empty().setStyles({
                'margin-top':0,
                'margin-left':0
            });
            */
           template.container.setStyles({
                'margin-top':0,
                'margin-left':0
            });
            var positionY = 0,
            	positionX = 0,
                hasFilter = $type(template.filterFunction)=='function',
                insertPosition = 'top',
                insertObject = template.container
                ;
                
            template.$offsetY = 0;
            template.$offsetX = 0;
            //var hasFocus = false;
            for (var i=0;i<count;i++) {
                var item = template.items[i];
                item.data.$i = i;
                var isVisible = hasFilter?template.filterFunction(item.data):true;
                if (!isVisible) {
                	if ($defined(item.el)) {
                		item.el.remove();
                	}
                } else {
                    var isNew = !$defined(item.el);
                
                    if (isNew) {
                        item.el = this.createTemplateElement(template,item.data).inject(template.container);
                        if ($type(item.onCreateElement)=='function') {
                            item.onCreateElement(item.el,template,item.data);
                        }
                        var coords = item.el.getCoordinates();
	                    $extend(item,{
	                        width:coords.width,
	                        height:coords.height
	                        		+item.el.getStyle('border-top-width').toInt()
	                        		+item.el.getStyle('border-bottom-width').toInt()
	                    });
                        this.initializeTemplateElementFocus(template,item);
                    }
                    
                        
                    var height = item.height,
                    	width = item.width;                    
                    if ((positionY+height>=scroll.y-height) && 
                        (positionY<=scroll.y+parentHeight+height)) {
                        if (!template.$offsetY) {
                            template.$offsetY = i;
                        }
                        if ($empty && scroll.y) {
                            template.container.setStyle('margin-top',positionY-scroll.y-8);
                            $empty = false;
                        }
                        if (!isNew) {
                        	var parent = item.el.parentElement;
                        	if (!$defined(parent)) {
                        		//console.log('No Parent',item.el);
                        		item.el.inject(insertObject,insertPosition);
                                if ($type(item.onInjectElement)=='function') {
                                	item.onInjectElement(item.el,template,item.data);
                                }	
                        	} else {
                        		insertObject = item.el;
                        		insertPosition = 'after';
                        	}
                        }
                    } else if ($defined(item.el)) {
                        item.el.remove();    
                    }
                    positionY += height;
                }
            }
            
            if ($pick(template.totalWidth,0)<width) {
            	template.totalWidth  = width;
            } 
            if (positionY!=$pick(template.totalHeight,0)) {
                template.totalHeight = positionY;
                this.updateTemplate(name);
            }
        } else {
            template.$offsetY = 0;
            template.container.empty().setStyle('margin-top','');
            var hasFilter = $type(template.filterFunction)=='function';
            for (var i=0;i<count;i++) {
                var item = template.items[i];
                var isVisible = hasFilter?template.filterFunction(item.data):true;
                if (!isVisible) {
                	if ($defined(item.el)) {
                		item.el.remove();
                	}
                } else {
	                if (!$defined(item.el)) {
	                    item.el = this.createTemplateElement(template,item.data).inject(template.container);
	                    //console.log(item.el.$elements);
	                    if ($type(item.onCreateElement)=='function') {
	                        item.onCreateElement(item.el,template,item.data);
	                    }    
	                    //this.initializeTemplateElementFocus(template,item);
	                } else {
	                    item.el.inject(template.container);
	                }
                }
            }
        }
        
        if ($type(onRender)=='function') {
            onRender(template);
        }
        
        return template;
    },
    updateTemplateElement:function(template,el,data){
        if (!$defined(el)) return this;
        //console.log(el.$elements);
        if ($defined(el.$elements)) {
            el.$elements.each(function(el){
                if ($type(el.destroy)=='function') {
                    el.destroy();
                }
            });
        }
        el.$elements = this.applyTemplateData(el,template.template,data);
        return this;
    },
    createTemplateElement:function(template,data){
        var el = new Element(template.tag)
                        .setProperties(template.properties)
                        ;
        el.setProperty('data-xid',data.$i);
        this.updateTemplateElement(template,el,data);        
        return el;
    },
    updateTemplateFocus:function(template){
    	return;
    	if ($defined(template.$focused)) {
    		if ($defined(window.IntersectionObserver)) {
    			if (!$defined(template.$observer)) {
    				template.$observer = new IntersectionObserver(function(entries,opts){
		        		console.clear();
		        		console.log(opts);
		        		entries.each(function(entry){
		        			template.$observer.unobserve(entry.target);
		        			//var visible = entry.intersectionRatio >= opts.thresholds[0];
		        			//console.log(visible,entry);
		        			if (entry.isIntersecting){
		        				entry.target.focus();
		        			} else {
		        				template.$focused = null;
		        			}	
		        		}.bind(this));
		        	}.bind(this),{
		        		root:template.parent,
		        		threshold:0.5
		        	});	
    			}
	        	
	        	template.$observer.observe(template.$focused.el);
	        }	
    	}
    	
    	return;
    	if ($defined(template.$focused)) {
    		var viewCoords = template.containment.getCoordinates();
    		var elCoords = template.$focused.el.getCoordinates();
    		var vTop = elCoords.top-template.scroll.y,
    			vBottom = elCoords.bottom-(template.scroll.y+viewCoords.height),
    			vLeft = elCoords.left-template.scroll.x,
    			vRight = elCoords.right-(template.scroll.x+viewCoords.width);
			
    		console.log('Template Item Focused Top',vTop,template.scroll.y,elCoords.top,viewCoords.top);
    		console.log('Template Item Focused Bottom',vBottom,template.scroll.y,elCoords.bottom,viewCoords.bottom);
    		
    		//template.$focused.el.focus();
    	}
    },
    initializeTemplateElementFocus:function(template,item){
    	var data = item.data;
    	var el = item.el;
    	//console.log('Initialize Template Focus',data,el);
    	if ($defined(data.id)) {
        	var inputs = el.getElements(this.$focusSelector);
        	//console.log('Search Focusable',data.id,inputs.length);
	        var count = inputs.length;
	        if (count) {
	        	for(var i=0;i<count;i++) {
		        	var input = inputs[i];
		        	
		        	//console.log(input);
		        	input.addEvent('focus',function(e){
		        		template.$focused = {
		        			id:data.id,
		        			index:i,
		        			name:input.getProperty('name'),
		        			el:input
		        		};
		        		//console.log('Focused',template.$focused);
		        	}.bind(this));
		        }	
	        }	
        }
    },
    getTemplate:function(name){
        return this.$templates[name];
    },
    getTemplateItems:function(name){
        var template = this.getTemplate(name);
        if ($defined(template)) {
            var items = new Array();
            template.items.each(function(item){
                items.push(item.data);
            });
            return items;    
        }
    },
    getTemplateItem:function(name,value,key){
        var template = this.getTemplate(name);
        var key = $pick(key,'id');
        var count = template.items.length;
        for(var i=0;i<count;i++){
            if (template.items[i].data[key]==value) {
                return template.items[i];
            }
        }
    },
    removeTemplateItem:function(templateName,item){
        var template = this.getTemplate(templateName);
        if ($defined(template)) {
            template.items.erase(item);
            if ($defined(item.el)) {
                item.el.destroy();
                template.totalHeigth -= item.height;
                this.updateTemplate(templateName);
            }
        }
        return this;
    }
});

TPH.Implementors.AppActions = new Class({
	Implements:[Options],
	options:{
		actionClass:'appAction',
		actionSelector:'.appAction'
	},
	scanActions:function(container){
		container.getElements(this.options.actionSelector).each(function(el){
			var func = el.get('rel');
			if ($defined(this[func])) {
				el.addEvent('click',function(e){
					var params = el.get('data-params');
					var params = $defined(params)?params.split(','):[];
					params.push(el);
					this[func].apply(this,params);
					e.stop();
				}.bind(this));
				el.removeClass(this.options.actionClass);	
			}
		}.bind(this));
		return this;
	}
});

TPH.Implementors.FileList = new Class({
	Implements:[TPH.Implementors.ActiveRequest],
	createFileList:function(container,template,tag){
		this.$fileListContainer = container;
		this.$fileListTemplate = $pick(template,'<div class="width_50"><img class="block propertyContent" data-property="src" data-content="{icon}" /></div><div class=""><div class="overflow hidden text_overflow ellipsis">{name}</div><div class="font smaller">{size_text}</div></div><i class="fa fa-times control active removeFile"></i>');
		this.$fileListTag = $pick(tag,'li');
		this.$fileCounter = 0;
	},
	canAddFile:function(data){
		return true;
	},
	addFile:function(data){
		if (!this.canAddFile(data)) return;
		if (!$defined(this.$fileList)) {
			this.$fileList = new Array();	
		}
		var file = {
			id:this.$fileCounter++,
			data:$merge(data,{
				size_text:TPH.byteSize(data.size)
			}),
			el:new Element(this.$fileListTag).inject(this.$fileListContainer)
		};
		this.applyTemplateData(file.el,this.$fileListTemplate,file.data);
		var removeFile = file.el.getElement('.removeFile');
		if ($defined(removeFile)) {
			removeFile.addEvent('click',function(){
				this.removeFile(file.id);
			}.bind(this));
		}
		this.$fileList.push(file);
		return file.id;
	},
	removeFile:function(id){
		var data = this.getFile(id);
		if ($defined(data)) {
			data.el.destroy();
			//var file = this.getFile(id);
			this.$fileList.erase(data);
		}
		return this;
	},
	getFile:function(id){
		if (!$defined(this.$fileList)) return null;
		var count = this.$fileList.length;
		for(var i=0;i<count;i++) {
			if (this.$fileList[i].id==id) {
				return this.$fileList[i];
			}
		}
	},
	getFileIndex:function(id){
		if (!$defined(this.$fileList)) return null;
		var count = this.$fileList.length;
		for(var i=0;i<count;i++) {
			if (this.$fileList[i].id==id) {
				return i;
			}
		}
	},
	clearFiles:function(){
		if (!$defined(this.$fileList)) {
			this.$fileList = new Array();	
		} else {
			this.$fileList.empty();
		}
		return this;
	},
	getFiles:function(){
		return $pick(this.$fileList,[]);
	},
	uploadFiles:function(onComplete){
		var files = this.getFiles();
		var count = files.length;
		var queue = new Array();
		for(var i=0;i<count;i++) {
			var file = files[i];
			queue.push(file.id);
		}
		this.uploadQueue(queue,onComplete);
	},
	getFileUploadParams:function(file){
		return {
			format:'json',
			data:file
		};
	},
	uploadQueue:function(queue,onComplete){
		if (queue.length){
			var id = queue.shift();
			var file = this.getFile(id);
			if ($defined(file)) {
				var params = this.getFileUploadParams(file.data);
				this.activeRequest('file',params,{
					onProgress:function(){
						console.log(arguments);
					}.bind(this),
					onComplete:function(result){
						$extend(file,{
							upload:result
						});
						this.uploadQueue(queue,onComplete);
					}.bind(this)
				});
			}
		} else {
			if ($type(onComplete)=='function') {
				onComplete();
			}
		}
	}
});

if (typeof(window.localStorage) !== "undefined") {
	// Code for localStorage/sessionStorage.
	TPH.localStorage = new Class({
  		Implements:[Events,Options],
  		options:{
  			
  		},
  		initialize:function(id,options){
  			this.id = id;
  			this.setOptions(options); 
  		},
  		compress:function(data){
  			var jsonstring = '';
  			try { 
  				jsonstring = Json.encode(data);
  				return LZString.compressToUTF16(jsonstring);
  			} catch(e) {
  				console.log('Compression Error for storage '+this.id,e);
  			}
  			return '{}';
  		},
  		decompress:function(data){
  			//console.log(data);
  			try {
  				var jsonstring = LZString.decompressFromUTF16(data);	
  				//console.log(jsonstring);
  				var data = Json.decode(jsonstring);
  				return $defined(data)?data:{};
  			} catch(e) {
  				console.log('Decompression Error for storage '+this.id,e);
  			}
  			return {};
  		},
  		getStorage:function(){
  			try{
  				var storage = localStorage.getItem(this.id);	
  			} catch(e) {
  				console.log('Problem Decompressing Storage Data for '+this.id,e);
  			}
  			 
  			return $defined(storage)?this.decompress(storage):{};
  		},
  		save:function(storage){
  			localStorage.setItem(this.id,this.compress(storage));
  			return this;
  		},
  		bind:function(data){
  			this.save(data);
  		},
  		set:function(key,value){  			
  			var storage = this.getStorage();
  			storage[key] = value;
  			return this.save(storage);
  		},
  		get:function(key){
  			var storage = this.getStorage();
  			return storage[key];
  		},
  		has:function(key){
  			var storage = this.getStorage();
  			return $defined(storage[key]);
  		},
  		erase:function(key){
  			var storage = this.getStorage();
  			delete storage[key];
  			this.save(storage);
  			return this;
  		},
  		clear:function(){
  			localStorage.removeItem(this.id);
  		}
	});
	$extend(TPH.localStorage,{
		instances:{},
		getInstance:function(id,options){
			if (!$defined(TPH.localStorage.instances[id])){
				TPH.localStorage.instances[id] = new TPH.localStorage(id,options);
			}
			return TPH.localStorage.instances[id];
		},
        clear:function(){
            localStorage.clear();
        }
	});
} else {
  // Sorry! No Web Storage support..
}

TPH.Module = new Class({
	Implements:[Events,Options,TPH.Implementors.TemplateData],
	options:{
		tag:'div',
		properties:{
		},
		data:{}
	},
	initialize:function(options){
		this.setOptions(options);
	},
	destroy:function(){
		if ($defined(this.container)) {
			this.container.destroy();
		}
	},
	render:function(container){
        this.createContainer(container); 
		if ($defined(this.options.template)) {			
			this.applyTemplateData(this.container.empty(),this.options.template,this.getData());	
			this.scanActions(this.container);
		}
		if ($defined(container)) {
			this.container.inject(container);
		}
		this.fireEvent('onRender',[this]);
	},
	createContainer:function(container){
		if (!$defined(this.container)) {
            this.container = new Element(this.options.tag,this.options.properties);    
        }
        return this;
	},
	getData:function(){
		return this.options.data;
	},
	scanActions:function(container){
		container.getElements('.moduleAction').each(function(el){
			el.addEvent('click',function(e){
				e.stop();
				var func = el.get('rel'),
					params = el.get('data-params');
				if ($defined(this[func])) {
					this[func](params);	
				} else {
					if ($defined(this.options.functions)) {
						if ($defined(this.options.functions[func])) {
							this.options.functions[func](params);
						}
					}
				}
			}.bind(this));
		}.bind(this));
		return this;
	}
});

TPH.Modules = new Class({
	Implements:[Events,Options,TPH.Implementors.TemplateData],
	options:{
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		this.$modules = {};
		this.$index = new Array();
	},
	add:function(name,instance,position,ref){
		//console.log(name,position,ref);
		//console.log(this.$index);
		if (!this.has(name)) {
			this.$modules[name] = instance;
			if ($defined(ref)) {
				if (this.has(ref)) {
					switch(position){
						case 'top':
							this.$index.unshift(name);
							break;
						case 'before':
							this.$index.splice(this.$index.indexOf(ref),0,name);
							break;
						case 'after':
							this.$index.splice(this.$index.indexOf(ref)+1,0,name);
							break;
						default:
							this.$index.push(name);
					}	
				} else {
					switch(position){
						case 'top':
							this.$index.unshift(name);
							break;
						default:
							this.$index.push(name);
					}
				}
			} else {
				switch(position){
					case 'top':
						this.$index.unshift(name);
						break;
					default:
						this.$index.push(name);
				}	
			}
		} else {
			console.log('Module '+name+' already exists.');
		}
		//console.log(this.$index);
		return this;
	},
	remove:function(name){
        if (this.has(name)) {
            this.$modules[name].destroy();
            this.$modules[name] = null;
            this.$index.erase(name);    
        }
		
		return this;
	},
	get:function(name){
		return this.$modules[name];
	},
	has:function(name){
		return $defined(this.$modules[name]);
	},
	clear:function(){
		for(name in this.$modules){
			this.remove(name);
		}
		this.$modules = {};
		return this;
	},
	render:function(){
		this.fireEvent('onBeforeRender',[this]);
		this.container.empty();
		this.$index.each(function(name){
            console.log('Module',name);
            var module = this.get(name);
            if ($defined(module)) {
            	module.render(this.container);	
            }
		}.bind(this));
		this.fireEvent('onRender',[this]);
		return this;
	},
	getData:function(){
		var items = new Array();
		this.$index.each(function(name){
			items.push(this.get(name).getData());
		}.bind(this));
		return items;
	},
	setIndex:function(index){
		this.$index.empty();
		this.$index.combine(index);
		return this;
	}
});
TPH.InitDates = function(container,options){
	var dates = container.getElements('input[type="date"]');
	dates.each(function(date){
		if (date.type=='text') {
			var picker = new DayPilot.DatePicker({
		        target: date, 
		        pattern: 'yyyy-MM-dd'
		   	});
		   	
		   	date.set('readonly',true).addEvents({
		   		focus:function(){
		   			picker.show();
					picker.div.inject($pick(options.containment,window.document.body)).setStyles({
						'z-index':TPH.windowIndex+1
					});
		   		}
		   	});
			date.store('picker',picker);	
		}
	});
};

TPH.toHHMMSS=function(secs,options){
	var options = $merge({
		template:'{hours}:{minutes}:{seconds}'
	},options);
    var sec_num = parseInt(secs, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    return options.template.substitute({
    	hours:hours.pad('0',2),
    	minutes:minutes.pad('0',2),
    	seconds:seconds.pad('0',2)
    });
};
TPH.validateForm = function(form,onInvalid){
	var count = form.elements.length,
		checkboxes = new Hash(),
		messages = new Array(),
		invalids = new Array();
		
	for(var i=0;i<count;i++) {
		var field = form.elements[i];
		if (!field.disabled) {
			switch(field.get('tag')) {
				case 'input':
					switch(field.get('type')){
						case 'checkbox':
							if (field.hasClass('required')) {
								if (!checkboxes.has(field.get('name'))) {
									checkboxes.set(field.get('name'),new Array());
								}
								checkboxes.get(field.get('name')).push(field);
							}
							break;
						default:
							if ((!field.validity.valid || (field.get('type')=='hidden' && field.hasClass('required') && field.get('value').trim()==''))) {
								invalids.push(field.getParent());
								var message = field.get('data-validation-message');
								if ($defined(message)) {
									messages.push('<li><i class="fa fa-caret-right"></i><div>'+message+'</div></li>');
								}
							}	
					}
					break;
				default:				
					if ((!field.validity.valid || (field.get('type')=='hidden' && field.hasClass('required') && field.get('value').trim()==''))) {
						invalids.push(field.getParent());
						var message = field.get('data-validation-message');
						if ($defined(message)) {
							messages.push('<li><i class="fa fa-caret-right"></i><div>'+message+'</div></li>');
						}
					}
					break;	
			}
		}
	}
	
	if (checkboxes.getLength()) {
		var hasCheck = new Array();
		checkboxes.each(function(boxList,name){
			boxList.each(function(cb){
				if (cb.get('checked')) {
					hasCheck.include(name);
				}
			});
		});
		checkboxes.each(function(boxList,name){
			boxList.each(function(cb){
				if (!hasCheck.contains(name)) {
					invalids.push(cb.getParent());
				}
			});
		});
		//console.log(hasCheck);
	}
	
	//console.log(checkboxes);
	
	if (invalids.length){		
		if ($type(onInvalid)=='function') {
			onInvalid(invalids);
		}		
		invalids.each(function(el){
			el.flash('#f99','#fff',3,'background-color',100);	
		});
		window.fireEvent('onInputError');
		var fullContainer = form.getElement('.fullHeight');
		var scroller = new Fx.Scroll($defined(fullContainer)?fullContainer:form,{
			onComplete:function(){
				var input = invalids[0].getElement('input,select,textarea');
				if ($defined(input)) {
					input.focus();
				}
				if (messages.length) {
					TPH.alert('System Message','<ul class="fieldList spaced">'+messages.join('')+'</ul>',function(){
						if ($defined(input)) {
							input.focus();	
						}		
					});
				}	
			}
		});
		scroller.toElement(invalids[0]);
		
		return false;
	}
	return true;
};
TPH.OptionContainer = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			visible:'visible',
			trigger:'optionTrigger',
			container:'optionContainer'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.containers = container.getElements('.'+this.options.classes.container);
		container.getElements('.'+this.options.classes.trigger).each(function(el){
			el.addEvent('click',function(e){
				this.containers.toggleClass(this.options.classes.visible);
			}.bind(this));
		}.bind(this));
	},
	show:function(){
		this.containers.addClass(this.options.classes.visible);
	},
	hide:function(){
		this.containers.removeClass(this.options.classes.visible);
	}
});

TPH.SelectContent = new Class({
	Implements:[Events,Options],
	options:{
		selector:'.selectContent',
		classes:{
			trigger:'trigger',
			active:'active',
			item:'recordItem'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.selectors = container.getElements(this.options.selector);
		this.selectors.each(function(el){
			var value = el.get('data-value');
			var fieldName = el.get('data-field');
			var field = container.getElement('[name="'+fieldName+'"]');
			
			el.getElement('dt .'+this.options.classes.trigger).addEvent('click',function(){
				el.toggleClass(this.options.classes.active);
				this.fireEvent(el.hasClass(this.options.classes.active)?'onOpen':'onClose',[fieldName,this]);
			}.bind(this));
			
			el.getElements('dd .'+this.options.classes.item).each(function(item){
				item.addEvent('click',function(e){
					field.set('value',item.get('rel'));
					el.getElement('dt .'+this.options.classes.trigger).set('html',item.get('html'));
					this.fireEvent('onSelect',[fieldName,item.get('rel'),item,this]);
					el.removeClass(this.options.classes.active);
				}.bind(this));
				if (item.get('rel')==value) {
					el.getElement('dt .'+this.options.classes.trigger).set('html',item.get('html'));
				}
			}.bind(this));	
		}.bind(this));
		
		window.addEvent('mouseup',function(e){
			var target = e.target;
			this.selectors.each(function(selector){
				if (selector.hasClass('active') && !selector.contains(target)) {
					selector.removeClass('active');
				}
			}.bind(this));
		}.bind(this));
	}
});

TPH.SelectList = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.Templates
	],
	options:{
		autoHide:true,
		containerClass:'selectList',
		listSelector:'.fieldList.content',
		content:{},
		templates:{
			content:'<ul class="fieldList spaced content separated"><li></li></ul>',
			item:'<div>{name}</div>'
		},
		exemptTriggers:[]
	},
	initialize:function(options){
		this.setOptions(options);
		this.container = new Element('div',{'class':this.options.containerClass}).inject(window.document.body);
		this.$inputs = this.applyTemplateData(this.container,this.options.templates.content,this.options.data);
		
		var closer = new Element('div',{
			'class':'list_closer'
		}).inject(this.container,'top');
		closer.addEvent('click',function(){
			this.hide();
		}.bind(this));
		this.createTemplate('list',this.container.getElement(this.options.listSelector));
		this.getTemplate('list').template = this.options.templates.item;
		window.addEvents({
			mousedown:function(e){
				if (this.options.autoHide) {
					if (this.container.hasClass('active') && !this.container.contains(e.target)) {
						this.hide();
						e.stop();
					}	
				}
			}.bind(this),
			resize:function(){
				this.hide();
			}.bind(this)
		});
	},
	destroy:function(){
		this.$inputs.each(function(input){
			input.destroy();
		});
		this.clearTemplates();
		this.container.destroy();
	},
	addItem:function(item){
		this.applyTemplate('list',item,function(el,template,item){
			el.addEvent('click',function(e){
				this.fireEvent('onSelectItem',[item,el,this,e]);
			}.bind(this));
			this.fireEvent('onRenderItem',[item,el,this]);
		}.bind(this));
		return this;
	},
	clear:function(){
		this.clearTemplate('list');
		return this;
	},
	position:function(top,left){
		this.container.setStyles({
			top:top,
			left:left
		});
		return this;
	},
	inject:function(container){
		var coords = container.getCoordinates(window.document.body);
		//this.container.inject(container);
		this.container.setStyles({
			top:coords.bottom,
			left:coords.left,
			right:coords.right,
			'z-index':TPH.windowIndex+1
		});
		return this;
	},
	show:function(){
		this.container.addClass('active');
		this.updateTemplate('list').renderTemplate('list'); //;
		return this;
	},
	hide:function(){
		this.container.removeClass('active');
		return this;
	},
	isVisible:function(){
		return this.container.hasClass('active');
	}
});

TPH.Dropdown = new Class({
	Implements:[Events,Options],
	options:{
		selector:'dl.dropDown',
		autoClose:true
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.dropdowns = container.getElements(this.options.selector);
		this.dropdowns.each(function(dropdown){
            this.handle(dropdown);
        }.bind(this));
		window.addEvents({
			mouseup:function(e){
				this.close(e.target);	
			}.bind(this),
			resize:function(){
                (function(){
                    this.dropdowns.each(function(dropdown){
                        var dd = dropdown.getElement('dd');
                        if (dropdown.hasClass('active')) {
                            dd.setStyle('height','');
                            this.position(dd);
                        }
                    }.bind(this));
                }.delay(500,this));
				
			}.bind(this)
		});
	}, 
	handle:function(dropdown){
		var trigger = dropdown.getElement('dt');
		if (!trigger.retrieve('dropdown')) {
            var dd = dropdown.getElement('dd');
			trigger.addEvent('click',function(e){
				this.open(dropdown); 
			}.bind(this));
			dropdown.getElement('dd').addEvent('click',function(e){
				this.fireEvent('onClick',[e,this]);
			}.bind(this));
            if (dropdown.hasClass('active')) {
                dd.setStyle('height','');
                this.fireEvent('onOpen',[dd,this]);
                this.position(dd);
            }
			trigger.store('dropdown',true);	
		}
		dropdown.getElements('.closeDropDown').each(function(closeAction){
			closeAction.addEvent('click',function(e){
				e.stop();
				var el = dropdown.getElement('dd');
				if (dropdown.hasClass('active')){
					dropdown.removeClass('active');
				}
			}.bind(this));
		}.bind(this));
	},
	open:function(dropdown){
		var dd = dropdown.getElement('dd');
		dropdown.toggleClass('active').setStyle('height','');
		if (dropdown.hasClass('active')) {
			this.fireEvent('onOpen',[dd,this]);
			this.position(dd);
		}
	},
	position:function(dd){
		this.fireEvent('onBeforePosition',[dd,this]);
		dd.setStyle('height','');
        var win = $pick(this.options.viewport,window);
        //console.log(this.options.viewport);
        //console.log(win);
		var winSize = win.getSize();
		var coords = dd.getCoordinates($defined(this.options.viewport)?win:win.document.body);
		var height = coords.height-(coords.bottom-winSize.y);
        //console.log(coords.bottom,winSize.y);
        dd.isOverflow = coords.bottom>winSize.y;
		if (coords.bottom>winSize.y) {
			dd.setStyle('height',height);
		} else {
			dd.setStyle('height','auto');
		}
		this.fireEvent('onPosition',[dd,this]);
	},
	close:function(trigger){
		this.dropdowns.each(function(dropdown){
			//var dd = dropdown.getElement('dd');
			if ($defined(trigger)) {
				if (dropdown.hasClass('active') && !dropdown.contains(trigger)) {
					dropdown.removeClass('active');
				}	
			} else{
				dropdown.removeClass('active');
			}
		}.bind(this));
	},
	getOpen:function(){
		var count = this.dropdowns.length,
			open = new Array();
		for(var i=0;i<count;i++) {
			var dropdown = this.dropdowns[i];
			//var dd = dropdown.getElement('dd');
			if (dropdown.hasClass('active')) {
				open.push(dropdown);
			}
		}
		return open;
	}
});

TPH.Dropup = new Class({
	Extends:TPH.Dropdown,
	options:{
		selector:'dl.dropUp'
	}
});

TPH.NumberInput = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(container,options){
		this.setOptions(options);
		container.getElements('.numberInputControl').each(function(control){
			var offset = control.get('data-offset');
			if ($defined(offset)) {
				var input = control.get('rel');
				if ($defined(input)) {
					var el = container.getElement('input[name="'+input+'"');
					if ($defined(el)) {
						var count = offset.toInt();
						control.addEvent('click',function(){
							value = el.get('value').toInt();
							el.set('value',value+count).fireEvent('input');
						}.bind(this));		
					}
				}
					
			}
		}.bind(this));
	}
});

TPH.FileReader = new Class({
	Implements:[Events,Options],
	options:{
		mode:'urldata'
	},
	initialize:function(el,options){
		this.el = el;
		this.setOptions(options);
		this.content = new Array();
		this.el.addEvents({
			mouseup:function(e){
				e.stopPropagation();
			},
			click:function(e){
				e.stopPropagation();
			},
			input:function(e){
				e.stop();
				var files=[],
					count = this.el.files.length;
				for(var i=0;i<count;i++) {
					files.push(this.el.files[i]);
				}
				this.fireEvent('onBeforeReadFile',[this]);
				this.clear().read(files);	
			}.bind(this)
		});
	},
	destroy:function(){
		this.clear();
	},
	read_:function(files){
		if (files.length) {
			var file = files.pop();
			this.parseFile(file,function(content,e){
				var fileData = {
					name:file.name,
					size:file.size,
					type:file.type,
					ext:file.name.split('.').pop().toLowerCase(),
					lastModified:file.lastModified,
					content:content
				};
				console.log('Read Complete',fileData);
				this.fireEvent('onReadFile',[fileData,this,e,file]);
				this.content.push(fileData);
				this.read(files);
			}.bind(this));				
		} else {
			this.fireEvent('onComplete',[this.content,this]);
		}
	},
	parseFile:function(file, callback) {
		this.$file 		= file;
	    this.$fileSize  = file.size;
	    this.$chunkSize = 64 * 1024; // bytes
	    this.$offset    = 0;
		this.$results 	= new Array();
	    // now let's start the read with the first block
	    this.chunkReaderBlock(this.$offset, this.$chunkSize, this.$file, callback);
	},
	readEventHandler:function(evt,callback) {
        if (evt.target.error == null) {
            this.$offset += evt.target.result.length;
            //console.log('Chunk',evt.target.result);
            switch(this.options.mode){
        		//case 'arraybuffer':
        		//	this.$results.append(evt.target.result);
        		//	break;
    			default:
    				this.$results.push(evt.target.result);
    				break;
    		}
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (this.$offset >= this.$fileSize) {
        	console.log("Done reading file");
        	switch(this.options.mode){
        		case 'arraybuffer':
        			$pick(callback,$empty)(this.$results,evt);
        			break;
        		default:
        			$pick(callback,$empty)(this.$results.join(''),evt);
        			break;
        	}
        	
        } else {
        	this.chunkReaderBlock(this.$offset, this.$chunkSize, this.$file, callback);	
        }        
    },
	chunkReaderBlock:function(offset, length, file, callback) {
		console.log('Reading Chunck ',offset,length);
        var reader = new FileReader();
        var blob = file.slice(offset, length + offset);
        reader.onloadend = function(evt){
        	console.log(evt);
        	//this.readEventHandler(evt,callback);
        }.bind(this);
        switch(this.options.mode){
			case 'arraybuffer':
				reader.readAsArrayBuffer(blob);
				break;
			case 'text':
				reader.readAsText(blob);
				break;
			case 'binary':
				reader.readAsBinaryString(blob);
				break;
			default:
				reader.readAsDataURL(blob);
				break;
		}
   	},
	read:function(files){
		if (files.length) {
			var file = files.pop();
			var reader = new FileReader();
			reader.onloadstart = function(e){
				this.fireEvent('onStartReadFile',[e,file]);
			}.bind(this);
			reader.onloadend = function(e){
				var fileData = {
					name:file.name,
					size:file.size,
					type:file.type,
					ext:file.name.split('.').pop().toLowerCase(),
					lastModified:file.lastModified,
					content:e.target.result
				};
				//console.log('On Read File',file);
				this.fireEvent('onReadFile',[fileData,this,e,file]);
				this.content.push(fileData);
				this.read(files);
			}.bind(this);
			switch(this.options.mode){
				case 'arraybuffer':
					reader.readAsArrayBuffer(file);
					break;
				case 'text':
					reader.readAsText(file);
					break;
				case 'binary':
					reader.readAsBinaryString(file);
					break;
				default:
					reader.readAsDataURL(file);
					break;
			}
				
		} else {
			this.fireEvent('onComplete',[this.content,this]);
		}
	},
	clear:function(){
		this.content.empty();
		return this;
	}
});

TPH.CameraPhotoCapture = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.ImageProcessing,
		TPH.Implementors.TemplateData
	],
	options:{
		useNative:true,
		shutterDelay:100,
		cameraTag:'option',
		cameraTemplate:'{label}'
	},
	$initialized:false,
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		if ($defined(navigator.camera) && this.options.useNative) {
			//this.$preview = this.$video.getParent();
			this.$video.remove();
			this.$video = null;
			console.log('Using Device Camera');
			navigator.camera.getPicture(function(imageData){
				//var data = "data:image/png;base64,"+imageData;
				//this.$preview.setStyle('background-image','url('+data+')');
				this.fireEvent('onCapture',[data,this]);
			}.bind(this), function(err){
				console.log('Camera Error:',err);
				this.fireEvent('onError',[err,this]);
			}.bind(this), {
				encodingType: Camera.EncodingType.JPEG,
        		mediaType: Camera.MediaType.PICTURE,
        		correctOrientation: true,
				sourceType:Camera.PictureSourceType.CAMERA,
				destinationType:Camera.DestinationType.FILE_URI
			});	
		} else { // Assume on browser
			this.$video = this.container.getElement('video');
			if (!$defined(this.$video)) {
				var videoContainer = this.container.getElement('.videoContainer');
				if ($defined(videoContainer)) {
					window.$captureVideo.pause();
					window.$captureVideo.inject(videoContainer,'top').inject(videoContainer,'top');
					this.$video = window.$captureVideo;
				}
			};
			
			if ($defined(this.$video)) {
				this.$cameraList = this.container.getElement('.cameraList');
				if ($defined(this.$cameraList)) {
					switch(this.$cameraList.get('tag')) {
						case 'select':
							this.$cameraList.addEvent('change',function(){
								this.setDevice(this.$cameraList.get('value'));
							}.bind(this));
							break;
					}
				}
				if ($defined(this.options.trigger)) {
					this.options.trigger.addEvent('click',function(){
						this.capture(this.$video);
					}.bind(this));
				}
				this.stream.delay(500,this);	
			} else {
				this.fireEvent('onError','Unable to retrieve Video Element');
			}
		}
	},
	destroy:function(){
		this.stop();
		if ($defined(this.$canvas)) {
			this.$canvas.remove();
		}
	},
	stop:function(){
        if ($defined(this.$video)) {
            this.$video.pause();
        }
		if ($defined(this.$stream)) {
			var tracks = this.$stream.getTracks();
			if ($defined(tracks)) {
				tracks.each(function(track){
					track.stop();
				});	
			} 
		}
		return this;
	},
	getDevices:function(onGet,onFail){
        if (!$defined(TPH.$cameraDevices)) {
            var onFail = $pick(onFail,$empty);
            this.fireEvent('onBeforeInitializeMedia',[this]);
            navigator.mediaDevices.getUserMedia({
                video:true
            }).then(function(stream){
                var tracks = stream.getVideoTracks();
                if ($defined(tracks)) {
                    tracks.each(function(track){
                        track.stop();
                    });	
                } 
                this.fireEvent('onBeforeEnumerateMediaDevices',[this]);
                navigator.mediaDevices.enumerateDevices().then(function (devices) {
                    TPH.$cameraDevices = new Array();
                    var mobile = {
                            1:'Front Camera',
                            2:'Back Camera',
                            3:'Back Camera (Wide-Angle)',
                            4:'Back Camera (Macro)'
                        };
                    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
                    devices.forEach(function (device) {
                        //deviceList.push(device);
                        if (device.kind === 'videoinput') {
                            var index = TPH.$cameraDevices.length+1;
                            var defaultLabel = 'Camera '+index;
                            TPH.$cameraDevices.push($merge(device,{
                                index:index,
                                label:device.label || ($defined(window.cordova)?$pick(mobile[index],defaultLabel):defaultLabel)
                            }));
                        }
                    });

                    console.log('Devices ',devices);
                    console.log('Camera Devicees ',TPH.$cameraDevices);
                    if (!TPH.$cameraDevices.length) {
                        onFail('onEmptyDevices','No Video Capture Device detected.');
                    } else if ($type(onGet)=='function') {
                        $pick(onGet,$empty)(TPH.$cameraDevices);					
                    }
                }.bind(this)).catch(function(err){
                    onFail('onErrorEnumeratingMediaDevices','Unable to enumerate devices');
                }.bind(this));	
            }.bind(this)).catch(function(err){
                onFail('onErrorInitializingMedia','Camera unsupported on this device');
            }.bind(this));
        } else {
            $pick(onGet,$empty)(TPH.$cameraDevices);
        }
	},
	stream:function(){
		this.getDevices(function(cameraDevices){
			if ($defined(this.$cameraList)) {
				cameraDevices.each(function(camera){
					var el = new Element(this.options.cameraTag).inject(this.$cameraList);
					switch(this.options.cameraTag) {
						case 'option':
							el.set('value',camera.deviceId);
							break;
					}
					this.applyTemplateData(el,this.options.cameraTemplate,camera);
				}.bind(this));	
			}
			
			this.setDevice(cameraDevices[0].deviceId,function(){
				this.$initialized = true;
				this.fireEvent('onReady',[this]);
			}.bind(this),function(){
				this.fireEvent('onErrorSettingPrimaryDevice',[cameraDevices,this]);
			}.bind(this));
		}.bind(this),function(eventName,message){
			this.fireEvent(eventName,message,[this]);
			this.fireEvent('onError',message);
		}.bind(this));
	},
	setDevice:function(deviceId,onSet,onFail){
		if ($defined(this.$stream)) {
			var tracks = this.$stream.getVideoTracks();
			//console.log('Tracks',tracks);
			if ($defined(tracks)) {
				tracks.each(function(track){
					track.stop();
				});	
			}
			try {
			  	this.$video.srcObject = null;
			} catch (error) {
				window.URL.revokeObjectURL(this.$video.src);
			  	this.$video.src = null;
			} 
		}
		if (this.$initialized) {
			this.fireEvent('onBeforeSetDevice',[deviceId,this]);	
		}
		
		//(function(){
			var options = {
				video:{
					deviceId: {
						exact:deviceId
					}
				}
			};
			
			this.$video.pause();
			navigator.mediaDevices.getUserMedia(options).then(function(stream) {
				this.currentDeviceId = deviceId;
		    	this.$stream = stream;
		        try {
				  this.$video.srcObject = stream;
				} catch (error) {
				  this.$video.src = window.URL.createObjectURL(stream);
				}
				this.$video.load();
				
				//this.$video.play().then(function(){
					if (this.$initialized) {
						this.fireEvent('onSetDevice',[deviceId,this]);	
					}
					
					if ($type(onSet)=='function') {
						onSet();
					}
				//}.bind(this)).catch(function(err){
				//	console.log('Unable to play video');
				//}.bind(this));
		        //this.$video.play();
		    }.bind(this)).catch(function(err){
		    	console.log(err);		    	
		    	if ($type(onFail)=='function') {
		    		onFail();
		    	} else if (this.$initialized){
		    		this.fireEvent('onErrorSetDevice',[deviceId,this]);
		    	}
		    }.bind(this));	
		//}.delay(500,this));
	},
	capture:function(source){		
		var coords = source.getCoordinates();
		//console.log(source);
		var videoSize = {
			width:source.videoWidth,
			height:source.videoHeight
		};
		
		var canvas = new Element('canvas',{width:videoSize.width,height:videoSize.height,styles:{
			position:'absolute',
			top:0,
			left:0,
			visibility:'hidden'
		}}).injectInside(window.document.body);
		
		var context = canvas.getContext('2d');
		context.drawImage(source,0,0,videoSize.width,videoSize.height);
		
		var data = canvas.toDataURL('image/png');
		canvas.remove();
		var container = this.$video.getParent();
		var coords = container.getCoordinates();
		var size = coords.width<coords.height?coords.width:coords.height,
			maxSize = coords.width>coords.height?coords.width:coords.height;
		var position = {
			left:(coords.width-size)/2,
			top:(coords.height-size)/2,
			width:size,
			height:size
		};
		var shutter = new Element('div',{
			'class':'shutter',
			styles:$merge(position,{
				'box-shadow':'0 0 0 '+maxSize+'px rgba(255,255,255,0.9)',
				position:'absolute',
				'z-index':1,
				'border-radius':size/2,
				opacity:0
			})
		}).inject(this.$video.getParent());
		var shutterClose = new Fx.Morph(shutter,{
			duration:this.options.shutterDelay,
			onComplete:function(){
				this.fireEvent('onCapture',[data,{
					name:'Capture',
					type:'image/png',
					ext:'png',
					size:videoSize.width*videoSize.height,
					width:videoSize.width,
					height:videoSize.height,
					content:data
				},this]);
				var shutterOpen = new Fx.Morph(shutter,{
					duration:this.options.shutterDelay,
					onComplete:function(){
						//console.log('Shutter Complete');
						shutter.destroy();
					}.bind(this)
				});
				shutterOpen.start.delay(300,shutterOpen,$merge(position,{
					opacity:0
				}));
			}.bind(this)
		});
		shutterClose.start({
			left:coords.width/2,
			top:coords.height/2,
			width:0,
			height:0,
			opacity:1
		});
		return;
		
	}
});

TPH.CameraPhotoCapture.Prepare = function(){
	if (!$defined(window.$captureVideo)) {
		window.$captureVideo = new Element('video',{
			width:'100%',
			height:'100%',
			autoplay:'autoplay',
			muted:'muted',
			playsinline:'playsinline'
		});	
	}
};

TPH.slideButton = new Class({
	Implements:[Events,Options],
	options:{
		limit:100,
		classes:{
			container:'slideContainer',
			label:'label',
			knob:'knob'
		}
	},
	initialize:function(containment,options){
		this.setOptions(options);
		var container = new Element('div',{'class':this.options.classes.container}).inject(containment);
		this.label = new Element('div',{'class':this.options.classes.label}).inject(container);
		if ($defined(this.options.label)) {
			this.setLabel(this.options.label);
		}
		var knob = new Element('div',{'class':this.options.classes.knob}).inject(container);
		
		this.slider = new Slider(container,knob,{
			offset:0,
			onChange:function(value){
				if (value==this.options.limit) {
					this.fireEvent('onClick',[this]);	
				} else {
					this.fireEvent('onStep',[value,this]);
				}
			}.bind(this),
			onComplete:function(value){
				if (value<this.options.limit) {
					this.slider.set(0);
				}				
			}.bind(this)
		});
	},
	setLabel:function(label){
		this.label.set('html',label);
		return this;
	},
	enable:function(){
		this.slider.attach();
		return this;
	},
	disable:function(){
		this.slider.detach();
		return this;
	},
	update:function(){
		this.slider.autosize();
	}
});

TPH.uploadButton = new Class({
	Implements:[Events,Options,TPH.Implementors.ActiveRequest],
	options:{
		mode:'urldata',
		request:{
			task:'upload',
			format:'json'
		}
	},
	content:[],
	initialize:function(el,options){
		this.el = el;
		this.setOptions(options);
		this.$index = 0;
		this.el.addEvent('change',function(e){
			e.stop();
			this.content.empty();
			var files=[],
				count = this.el.files.length;
			for(var i=0;i<count;i++) {
				files.push(this.el.files[i]);
			}
			this.read(files);	
		}.bind(this));
	},
	read:function(files){
		if (files.length) {
			var file = files.pop();
			var reader = new FileReader();
			reader.onload = function(e){
				var fileData = {
					name:file.name,
					size:file.size,
					type:file.type,
					ext:file.name.split('.').pop().toLowerCase(),
					lastModified:file.lastModified,
					content:e.target.result
				};
				this.fireEvent('onProcessFile',[fileData,this]);
				//this.content.push(fileData);
				this.upload(fileData);
				this.read(files);
			}.bind(this);
			switch(this.options.mode){
				case 'arraybuffer':
					reader.readAsArrayBuffer(file);
					break;
				case 'binary':
					reader.readAsBinaryString(file);
					break;
				default:
					reader.readAsDataURL(file);
					break;
			}	
		} else {
			this.upload();
		}
	},
	upload:function(content){
		if ($defined(content)) {
			var params = $merge(this.options.request,{
				data:Json.encode([content])
			});
			
			this.fireEvent('onRequest',[params,this]);
			this.activeRequest(++this.$index,params,{
				onComplete:function(result){
					this.fireEvent('onComplete',[result,this]);
				}.bind(this),
				onFailure:function(){
					this.fireEvent('onFailure',[this]);
				}.bind(this)
			});	
		}
		
	}
});

TPH.Computed = new Class({
	Implements:[Events,Options],
	options:{
		selector:'.computed',
		pattern:/{([^}]+)}/g
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		var inputList = new Array();
		this.container.getElements(this.options.selector).each(function(el){
			var formula = el.get('data-formula');
			var fields = this.getWords(formula);
			//console.log(formula);
			fields.each(function(fieldName){
				var field = this.container.getElement('[name="'+fieldName+'"]');
				//console.log(fieldName,field);
				if ($defined(field)){
					switch(el.get('tag')) {
						case 'input':
							var currentFieldName = el.get('name');
                            if (currentFieldName!=fieldName) {
                                inputList.push(field);
                                field.addEvent('input',function(){
									this.compute(formula,el);
                                }.bind(this));            
							}
							break;
						default:
							inputList.push(field);
							field.addEvent('input',function(){
								this.compute(formula,el);
							}.bind(this));
					}
				}
            }.bind(this));
		}.bind(this));
		inputList.each(function(el){
			el.fireEvent('input');
		});
	},
	compute:function(tformula,target){
		var fields = this.getWords(tformula);
		var data = {};
		fields.each(function(field){
			var value = this.container.getElement('[name="'+field+'"]').get('value').toFloat();
			if ($type(value)!='number') {
				value = 0;
			}
			data[field] = value;
		}.bind(this));
        //console.log(tformula,data);
        var formula = tformula.substitute(data,this.options.pattern);
		var value = eval(formula);
		var value = value.round(2);
		var min = target.get('data-min');
		if ($defined(min)) {
			if (value<min) {
				value = min;
			}
		}
		switch(target.get('tag')) {
			case 'input':
				target.set('value',value).fireEvent('input');
				break;
			default:
				target.set('html',TPH.number_format(value,2,'.',','));
		}
		this.fireEvent('onCompute',[target,tformula,this]);
	},
	getWords:function(str) {
		var results = [], re = this.options.pattern, text;
		
		while(text = re.exec(str)) {
		    results.push(text[1]);
		}
		return results;
	}
});

TPH.Mirror = new Class({
	Implements:[Events,Options],
	options:{
		selector:'.mirror'
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		this.container.getElements(this.options.selector).each(function(el){
			this.attach(el);
		}.bind(this));
	},
	attach:function(el){
		var source = el.get('data-source');
		var type = $pick(el.get('data-type'),'string');
		var field = this.container.getElement('[name="'+source+'"]');
		if ($defined(field)){
			field.addEvent('input',function(){
				var raw = field.get('value');
				var value = raw;
				switch(type){
					case 'number':
						value = TPH.number_format(value.toFloat(),2,'.',',');
						break;
                    case 'date':
						if (value.length) {
							var format = $pick(el.get('data-format'),'%b %d, %Y');
							value = new Date().parse(value).format(format);	
						}
						break;
				}
				switch(el.get('tag')){
					case 'input':
					case 'select':
					case 'textarea':
						el.set('value',value);
						break;
					default:
						switch(field.get('tag')){
							case 'select':
								var selected = field.getSelected();
								if ($defined(selected)) {
                                    var sels = new Array();
									selected.each(function(sel){
										sels.push(sel.get('html'));
									});
									value = sels.join(', ');	
								} 
								
								break;
						}
						el.set('html',value);
						this.fireEvent('onMirror',[source,raw,el,field]);
						break;	
				}
				
			}.bind(this));
			field.fireEvent('input');
		}
	}
});




TPH.QRScanner = new Class({
	Implements:[Events,Options],
	options:{
		delay:1000
	},
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		
		this.$video = this.container.getElement('video');
		this.stream();
	},
	destroy:function(){
		if ($defined(this.$captureTimer)) {
			clearTimeout(this.$captureTimer);
		}
		if ($defined(this.$stream)) {
			var tracks = this.$stream.getTracks();
			if ($defined(tracks)) {
				tracks.each(function(track){
					track.stop();
				});	
			} 
			this.$video.remove();
		}
		if ($defined(this.$canvas)) {
			this.$canvas.remove();
		}
	},
	stream:function(){
		var supportsVideo = !!this.$video.canPlayType;
		if(supportsVideo) {
		    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		    	this.$stream = stream;
		    	try {
				  this.$video.srcObject = stream;
				} catch (error) {
				  this.$video.src = window.URL.createObjectURL(stream);
				}
		        this.$video.play();
		        
		        this.createCanvas.delay(1000,this);
		    }.bind(this));
		}
	},
	createCanvas:function(){
		var coords = this.$video.getCoordinates();
		this.$size = {
			width:this.$video.videoWidth,
			height:this.$video.videoHeight
		};
        this.$canvas = new Element('canvas',{
        	width:this.$size.width,
        	height:this.$size.height,
        	styles:{
        		position:'absolute',
				top:0,
				left:0,
				visibility:'hidden'	
        	}
    	}).injectInside(window.document.body);
        
        console.log('Stream');
        this.$captureTimer = this.capture.delay(this.options.delay,this);
	},
	getZXing:function(){
		if (!$defined(this.$ZXing)) {
			this.$ZXing = new ZXing();
			this.$decodePtr = this.$ZXing.Runtime.addFunction(function (ptr, len, resultIndex, resultCount) {
				var raw = new Uint8Array(this.$ZXing.HEAPU8.buffer, ptr, len);
				this.$result = String.fromCharCode.apply(null, raw);
				console.log(this.$result);
			}.bind(this));
		}
		return this.$ZXing;
	},
	capture:function(){
		if ($defined(this.$captureTimer)) {
			clearTimeout(this.$captureTimer);
		}
		if (!$defined(this.$video)) return;
		TPH.loadAsset('ZXing',function(){
			var zxing = new ZXing();
			var decodePtr = zxing.Runtime.addFunction(function (ptr, len, resultIndex, resultCount) {
				var raw = new Uint8Array(zxing.HEAPU8.buffer, ptr, len);
				this.$result = String.fromCharCode.apply(null, raw);
				//console.log('Result',this.$result);
			}.bind(this));
			
			var context = this.$canvas.getContext('2d');
			context.drawImage(this.$video,0,0,this.$size.width,this.$size.height);
			
			try {
				var imageData = context.getImageData(0, 0, this.$size.width,this.$size.height);
				var idd = imageData.data;
				
				var image = zxing._resize(this.$size.width,this.$size.height);
				for (var i = 0, j = 0; i < idd.length; i += 4, j++) {
				    zxing.HEAPU8[image + j] = idd[i];
				}
				
				var err = zxing._decode_any(decodePtr);
				console.log('Capture',err);
				if (err == -2) {
				    this.$captureTimer = this.capture.delay(this.options.delay,this);
				} else {
					clearTimeout(this.$captureTimer);
					console.log('QR Captured');
					this.fireEvent('onCapture',[this.$result,this]);
				}	
			} catch(err) {
				console.log(err);
				//this.$captureTimer = this.capture.delay(this.options.delay,this);
			}
		}.bind(this));
	},
	capture__:function(){
		if ($defined(this.$captureTimer)) {
			clearTimeout(this.$captureTimer);
		}
		if (!$defined(this.$video)) return;
		TPH.loadAsset('ZXing',function(){
			var zxing = this.getZXing();
			var coords = this.$video.getCoordinates(),
				size = {
					width:this.$video.videoWidth,
					height:this.$video.videoHeight
				};
			
			if (!$defined(this.$canvas)) {
				this.$canvas = new Element('canvas',{width:size.width,height:size.height}).injectInside(window.document.body);	
			}
			
			this.$canvas.setStyles({
				position:'absolute',
				top:0,
				left:0,
				visibility:'hidden'
			});
			
			var context = this.$canvas.getContext('2d');
			context.drawImage(this.$video,0,0,size.width,size.height);
			
			try {
				var imageData = context.getImageData(0, 0, size.width,size.height);
				var idd = imageData.data;
				
				var image = zxing._resize(size.width,size.height);
				for (var i = 0, j = 0; i < idd.length; i += 4, j++) {
				    zxing.HEAPU8[image + j] = idd[i];
				}
				
				var err = zxing._decode_any(this.$decodePtr);
				console.log('Capture',err);
				if (err == -2) {
				    this.$captureTimer = this.capture.delay(500,this);
				} else {
					clearTimeout(this.$captureTimer);
					console.log('QR Captured');
					this.fireEvent('onCapture',[this.$result,this]);
				}	
			} catch(err) {
				this.$captureTimer = this.capture.delay(1000,this);
			}
		}.bind(this));
	}
});

TPH.Frame = new Class({
	Implements:[Events,Options],
	options:{
		styles:'',
		scripts:[],
		stylesheets:[],
		desktop:true,
		tablet:true,
		mobile:true,
		syncHeight:false,
		heightReference:'max'
	},
	$screenSize:'max',
	initialize:function(container,options){
		this.setOptions(options);
		this.$el = new Element('iframe',{
			'class':'screenSize '+this.$screenSize,
			scrolling:'no',
			frameborder:0,
		});
		
		this.$el.onload = function(){			
			this.$document = this.$el.contentDocument;
			this.$window = this.$el.contentWindow;
			this.$html = this.$document.documentElement;
			this.$head = this.$document.head;
			this.$body = this.$document.body;
			
			this.options.stylesheets.each(function(stylesheet){
				TPH.loadStylesheet(stylesheet,null,null,this.$el.contentDocument);	
			}.bind(this));
			if ($defined(this.options.styles)) {
				new Element('style').set('text',this.options.styles).inject(this.$head);	
			}
			
			this.loadScripts(this.options.scripts,function(){	
				this.fireEvent('onReady',[this]);
				if ($defined(this.options.content)) {
					this.setHTML(this.options.content);
				}
				if (this.options.syncHeight) {
					this.syncHeight.periodical(100,this);
				}
			}.bind(this));
		}.bind(this);
        
        this.$el.inject(container);
	},
	loadScripts:function(scripts,onLoad){
		if (scripts.length) {
			var script = scripts.shift();	
			TPH.loadScript(script,function(){
				this.loadScripts(scripts,onLoad);
			}.bind(this),null,this.$document);
		} else {
			if ($type(onLoad)=='function') {
				onLoad();
			}
		}
	},
	setScreen:function(size){
		if (this.$screenSize!=size) {
			this.$screenSize = size;
			this.$el.set('class','screenSize '+size);
			this.syncHeight.delay(500,this);
			this.syncHeight.delay(1000,this);	
		}
		
	},
	syncHeight:function(){
		this.$el.setStyle('height','');
		var height = Math[this.options.heightReference](this.$body.scrollHeight, this.$body.offsetHeight, this.$html.clientHeight, this.$html.scrollHeight, this.$html.offsetHeight),
			padding = this.$body.getStyle('padding-top').toInt()+this.$body.getStyle('padding-bottom').toInt(),
			margin = this.$body.getStyle('margin-top').toInt()+this.$body.getStyle('margin-bottom').toInt()
			;
			
		//var size = this.$window.getScrollSize();
		//console.log(this.$body.getCoordinates(),size);
		//console.log(height,padding,$type(padding));
		this.$el.setStyle('height',height+padding+margin);
	},
	setHTML:function(content){
		this.$body.set('html',content);
		this.syncHeight.delay(500,this);
		this.syncHeight.delay(1000,this);
	}
});

TPH.Map = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.TemplateData
	],
	options:{
		map:{
			attributionControl: false,
			center:[10.309855, 123.893107],
			zoom:13
		},
		autoTooltip:true,
		marker:{},
		tileServer:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		//tileServer:'https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/512/png8?apiKey=u2KKfQ-bv9pvmwhcp96Btgz2e6ALwFdCfQGotiZNNaM&ppi=320',//'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		list:[],
		latKey:'lat',
		lngKey:'lng',
		template:'{name}',
		trackUser:true,
		userLocation:true,
		userLocationText:'Your Current Location',
		markerTitle:'name'
	},
	$userIcon:'<svg class="mePin" xmlns="http://www.w3.org/2000/svg" width="43.3" height="42.4" viewBox="0 0 43.3 42.4"><path class="ring_outer" fill="#878787" d="M28.6 23c6.1 1.4 10.4 4.4 10.4 8 0 4.7-7.7 8.6-17.3 8.6-9.6 0-17.4-3.9-17.4-8.6 0-3.5 4.2-6.5 10.3-7.9.7-.1-.4-1.5-1.3-1.3C5.5 23.4 0 27.2 0 31.7c0 6 9.7 10.7 21.7 10.7s21.6-4.8 21.6-10.7c0-4.6-5.7-8.4-13.7-10-.8-.2-1.8 1.2-1 1.4z"/><path class="ring_inner" fill="#5F5F5F" d="M27 25.8c2 .7 3.3 1.8 3.3 3 0 2.2-3.7 3.9-8.3 3.9-4.6 0-8.3-1.7-8.3-3.8 0-1 .8-1.9 2.2-2.6.6-.3-.3-2-1-1.6-2.8 1-4.6 2.7-4.6 4.6 0 3.2 5.1 5.7 11.4 5.7 6.2 0 11.3-2.5 11.3-5.7 0-2-2.1-3.9-5.4-5-.7-.1-1.2 1.3-.7 1.5z"/><path class="mePin" d="M21.6 8.1a4 4 0 0 0 4-4 4 4 0 0 0-4-4.1 4.1 4.1 0 0 0-4.1 4 4 4 0 0 0 4 4.1zm4.9 8v-3.7c0-1.2-.6-2.2-1.7-2.6-1-.4-1.9-.6-2.8-.6h-.9c-1 0-2 .2-2.8.6-1.2.4-1.8 1.4-1.8 2.6V16c0 .9 0 2 .2 2.8.2.8.8 1.5 1 2.3l.2.3.4 1 .1.8.2.7.6 3.6c-.6.3-.9.7-.9 1.2 0 .9 1.4 1.7 3.2 1.7 1.8 0 3.2-.8 3.2-1.7 0-.5-.3-.9-.8-1.2l.6-3.6.1-.7.2-.8.3-1 .1-.3c.3-.8 1-1.5 1.1-2.3.2-.8.2-2 .2-2.8z" fill="#282828"/></svg>',
	initialize:function(container,options){
		this.container = container;
		this.setOptions(options);
		this.$index = new Array();
		this.$markers = new Hash();
		this.$layers = new Hash();
		
		this.options.list.each(function(item){
			this.$index.push(item.id);
		}.bind(this));
		TPH.loadAsset('Leaflet',function(){
			this.mapInstance = L.map(this.container,this.options.map).on('click',function(e){
									this.fireEvent('onClick',[e,this]);
								}.bind(this));							
			this.markers = new L.LayerGroup();
			this.markers.addTo(this.mapInstance);
			this.mapLayer = L.tileLayer(this.options.tileServer,{
									maxNativeZoom:19,
					        		maxZoom:19
								})
								.addTo(this.mapInstance)
								.on('load',function(){			
									if (!this.$loaded) {
										this.fireEvent('onLoad',[this]);
										this.plotMarkers(true);
										if (this.options.userLocation) {
											this.showUserLocation();
											if (this.options.trackUser) {
												window.addEvent('onChangeLocation',function(){
													this.showUserLocation();
													if ($defined(TPH.$gps)) {
														this.fireEvent('onChangeUserLocation',[TPH.$gps,this]);
													}
												}.bind(this));	
											}
										}
										this.$loaded = true;	
										this.fireEvent('onReady',[this]);
									}						
								}.bind(this));
		}.bind(this));
		this.container.addEvents({
			mousemove:function(e){
				e.stopPropagation();
			}.bind(this)
		});
	},
	destroy:function(){
		this.$index.empty();
		this.$markers.empty();
		this.$layers.empty();
		
		this.markers.off();
		this.markers.remove();
		
		this.mapLayer.off();
		this.mapLayer.remove();
		
		this.mapInstance.off();
		this.mapInstance.remove();
	},
	addItem:function(item,options){
		if (!this.hasItem(item.id)) {
			this.$index.push(item.id);
			this.options.list.push(item);
			var lat = $type(item[this.options.latKey])=='string'?item[this.options.latKey].toFloat():item[this.options.latKey],
				lng = $type(item[this.options.lngKey])=='string'?item[this.options.lngKey].toFloat():item[this.options.lngKey];
			if (lat && lng) {
				return this.addMarker(lat,lng,item,options);
			}	
		}		
		return this;
	},
	hasItem:function(id){
		return this.$index.contains(id);
	},
	getItem:function(id){
		if (this.hasItem(id)) {
			var count = this.options.list.length;
			for(var i=0;i<count;i++){
				if (this.options.list[i].id==id) {
					return this.options.list[i];
				}
			}	
		}
	},
	deleteItem:function(id){
		if (this.hasItem(id)) {
			var item = this.getItem(id);
			this.$index.erase(id);
			this.options.list.erase(item);
			
			var marker = this.getMarker(id);
			marker.closePopup();
			marker.off();
			marker.remove();
			
			this.$markers.erase(id);
		}
		return this;
	},
	clearItems:function(){
		this.options.list.empty();
		this.$index.empty();
		this.$markers.empty();
		this.$layers.empty();
		this.plotMarkers();
		return this;
	},
	plotMarkers:function(reCenter){
		this.$markers.empty();
		this.markers.clearLayers();
		this.lastPosition = null;
		this.bounds = null;
		this.options.list.each(function(item){
			var lat = $type(item[this.options.latKey])=='string'?item[this.options.latKey].toFloat():item[this.options.latKey],
				lng = $type(item[this.options.lngKey])=='string'?item[this.options.lngKey].toFloat():item[this.options.lngKey];
			if (lat && lng) {
				this.addMarker(lat,lng,item,reCenter);
			}
		}.bind(this));
		if ($pick(reCenter,true)) {
			this.reCenter();	
		}
		return this;
	},
	showUserLocation:function(){
		if ($defined(TPH.$gps)) {
			console.log('GPS : Current User Location '+Json.encode(TPH.$gps));
			if ($defined(TPH.$gps.latitude) || $defined(TPH.$gps.longitude)) {
				var position = L.latLng(TPH.$gps.latitude,TPH.$gps.longitude);
				if (!$defined(this.$userMarker)) {
					var layer = this.getGroup('$user');
					var meIcon = L.divIcon({
						iconSize    : [36, 42],
						//iconAnchor  : [22, 28],
						popupAnchor : [0, -30],
						className: "leaflet-data-marker",
						html: this.$userIcon.replace('#','%23'),
			
						
					});
					this.$userMarker = L.marker(position, {
						icon: meIcon,
						title: this.options.userLocationText
					});
					layer.addLayer(this.$userMarker);
				} else {
					this.$userMarker.setLatLng(position);
				}
				if ($defined(this.bounds)) {
					//this.bounds.extend(this.$userMarker.getLatLng());	
				}	
			}			
		}
		return this;
	},
	hideUserLocation:function(){
		
	},
	reCenter:function(){
		var markers = this.markers.getLayers().length;
		if (markers) {
			if (markers>1) {
				this.mapInstance.fitBounds(this.bounds,{
					animate:true
				});	
			} else if (markers==1) {
				this.mapInstance.setView(this.markers.getLayers()[0].getLatLng(),this.options.map.zoom,{
					animate:true
				});
			} else {
				this.mapInstance.setView(this.bounds.getCenter(),this.options.map.zoom,{
					animate:true
				});
				//this.mapInstance.setView(this.options.map.center,this.options.map.zoom);
			}	
		}
		return this;
	},
	setCenter:function(lat,lng){
		this.mapInstance.panTo(L.latLng(lat,lng),{
			animate:true
		});
		return this;
	},
	setView:function(lat,lng,zoom) {
		this.mapInstance.setView(L.latLng(lat,lng),$pick(zoom,this.options.map.zoom),{
			animate:true
		});
	},
	addMarker:function(lat,lng,data,reCenter,options) {
		var position = [lat,lng];
		var marker = this.getMarker(data.id);
		if (!$defined(marker)) {
			var marker;
			if ($type(this.options.markerCreate)=='function') {
				marker = this.options.markerCreate(position,data,options,this);
			} else {
				var div = new Element('div');
				this.applyTemplateData(div,this.options.template,data);
				var markerOptions = $merge(this.options.marker,options,{
					title:data[this.options.markerTitle]
				});
				this.fireEvent('onBeforeMarkerCreate',[markerOptions,this]);
				marker = L.marker(position,markerOptions).addTo(this.mapInstance);	
			}
			if (this.options.autoTooltip) {
				marker.bindTooltip(div,{
					autoClose:false,
					interactive:true
				});
			}
			this.fireEvent('onMarkerCreate',[marker,data,this,div]);
			marker.on('click',function(e){
				this.fireEvent('onMarkerClick',[marker,data,this,e]);
			}.bind(this));
			this.markers.addLayer(marker);
			this.$markers.set(data.id,marker);
		} else {
			marker.setLatLng(position);
		}
		
		if (!$defined(this.lastPosition)) {
			this.bounds = L.latLngBounds([marker.getLatLng()]);
			if ($pick(reCenter,true)) {
				this.reCenter();	
			}
		} else {
			this.bounds.extend(marker.getLatLng());
			if ($pick(reCenter,true)) {
				this.reCenter.debounce(this);	
			}
		}	
		this.lastPosition = marker.getLatLng();
		return marker;
	},
	getMarker:function(id){
		if (this.$markers.has(id)) {
			return this.$markers.get(id);	
		}
	},
	getMarkers:function(){
		return this.$markers;
	},
	getGroup:function(name){
		if (!this.$layers.has(name)) {
			var layer = new L.LayerGroup();
			layer.addTo(this.mapInstance);
			this.$layers.set(name,layer);
		}
		return this.$layers.get(name);
	},
	update:function(){
		if (this.$loaded) {
			this.plotMarkers();
			this.mapInstance._onResize();	
		}
		return this;
	}
});

TPH.Map.Setup = new Class({
	Implements:[
		Events,Options,
		TPH.Implementors.TemplateData
	],
	options:{
		lat:'lat',
		lng:'lng',
		entry:'.latlng',
		map:'.mapContainer',
		name:''
	},
	initialize:function(container,options){
		this.$container = container;
		this.setOptions(options);
		
		this.$lat = this.$container.getElement('input[name="'+this.options.lat+'"]'),
		this.$lng = this.$container.getElement('input[name="'+this.options.lng+'"]');
		this.$latlngEl = this.$container.getElement(this.options.entry);
		if ($defined(this.$latlngEl)) {			
			this.$latlngEl.addEvent('input',function(){
				var parts = this.$latlngEl.get('value').split(',');
				if ($defined(parts[0]) && $defined([parts[1]])) {
					this.setCoordinates(parts[0].trim(),parts[1].trim(),this.options.name,true);	
				}
			}.bind(this));
		}
		this.setup();
	},
	setup:function(){
		this.$locationMarker = null;
		this.$map = new TPH.Map(this.$container.getElement(this.options.map),{
			userLocation:false,
			onReady:function(instance){
				var lat = this.$lat.get('value'),
					lng = this.$lng.get('value');
				if (lat!='' && lng!='') {
					this.setCoordinates(lat,lng,this.options.name,true,false);	
				}
			}.bind(this),
			onClick:function(e,instance){
				this.setCoordinates(e.latlng.lat,e.latlng.lng,this.options.name,false);
			}.bind(this)
		});
	},
	updateMap:function(){
		this.$map.update();
	},
	setCoordinates:function(lat,lng,name,recenter,fireEvent){
		var recenter = $pick(recenter,true);
		var lat = $pick(lat,'0').toFloat();
		var lng = $pick(lng,'0').toFloat();
		this.$lat.set('value',lat.toFixed(6));
		this.$lng.set('value',lng.toFixed(6));
		if ($defined(this.$latlngEl)) {
			this.$latlngEl.set('value',(lat && lng)?lat.toFixed(6)+', '+lng.toFixed(6):'');
		}
		
		if (lat && lng) {	
			if (!$defined(this.$locationMarker)) {
				this.$locationMarker = this.$map.addMarker(lat.toFixed(6),lng.toFixed(6),{id:'marker',name:name},recenter,{draggable:true});
				this.$locationMarker.on('dragend',function(e){
					var marker = e.target;
				    var position = marker.getLatLng();
				    var latlng = new L.LatLng(position.lat, position.lng);
					this.setCoordinates(position.lat,position.lng);
				}.bind(this));
				this.$map.setCenter(lat,lng);	
			} else {
				this.$locationMarker.setLatLng(new L.LatLng(lat.toFixed(6), lng.toFixed(6)));
			}
		}
		if ($pick(fireEvent,true)) {
			this.fireEvent('onSetCoordinates',[lat,lng,this]);	
		}
	},
	setName:function(name){
		this.setOptions({
			name:name
		});
		var div = new Element('div');
		this.applyTemplateData(div,this.$map.options.template,{name:name});
		this.$locationMarker.setTooltipContent(div);
	}
});
TPH.Map.HERE = new Class({
	Implements:[Events,Options],
	options:{
		js:[
			'https://js.api.here.com/v3/3.1/mapsjs-core.js',
			'https://js.api.here.com/v3/3.1/mapsjs-service.js'
		]
	},
	initialize:function(options){
		console.log(options);
		this.setOptions($merge({
			params:{
				apikey: TPH.$hereKey
			}
		},options));
		this.loadScripts(this.options.js,function(){
			this.$platform = new H.service.Platform(this.options.params);
			this.setup();
		}.bind(this));
	},
	setup:function(){
		this.fireEvent('onReady',[this]);
	},
	loadScripts:function(items,onLoad){
		if (items.length) {
			var js = items.shift();
			new Asset.javascript(js,{
				onload:function(){
					this.loadScripts(items,onLoad);	
				}.bind(this)
			});	
		} else {
			if ($type(onLoad)=='function') {
				onLoad();
			}	
		}
	}
});
TPH.Map.Search = new Class({
	Implements:[Events,Options],
	Extends:TPH.Map.HERE,
	options:{
		query:{
			limit:10
		}
	},
	setup:function(){
		this.$geocoder = this.$platform.getSearchService();
		this.parent();
	},
	search:function(term,onSuccess,onError){
		//console.log(this.options);
		var params = $merge(this.options.query,{
			at:'{latitude},{longitude}'.substitute(TPH.$gps),
        	q: term
      	});
      	console.log(params);
      	if ($defined(this.$currentRequest)) {
      		this.$currentRequest.cancel();
      	}
	  	this.$currentRequest = this.$geocoder.autosuggest(params,function(result){
	  		this.$results = new Array();
	  		this.processResults(result.items,function(){
	  			//console.log(this.$results);
	  			if ($type(onSuccess)=='function') {
	  				onSuccess(this.$results);
	  			}
	  		}.bind(this));
	  	}.bind(this),onError);
	},
	processResults:function(items,onComplete){
		if (items.length){
			var item = items.shift();
			switch(item.resultType){
				case 'chainQuery':
					break;
				default:
					var itemData = {
						_id:item.id,
		  				name:item.title,
		  				type:item.resultType,
		  				source:'search'
		  			};
		  			if ($defined(item.address)) {
		  				$extend(itemData,{
		  					address:item.address.label,
		  					lat:item.position.lat,
			  				lng:item.position.lng,
			  				distance:item.distance
		  				});
		  			}
		  			this.$results.push(itemData);
		  			break;
			}
			this.processResults(items,onComplete);
		} else {
			if ($type(onComplete)=='function') {
				onComplete();
			}
		}
	}
});
TPH.Map.Lookup = new Class({
	Implements:[Events,Options],
	Extends:TPH.Map.HERE,
	setup:function(){
		this.$geocoder = this.$platform.getSearchService();
		this.parent();
	},
	lookup:function(id,onComplete,onError){
      	if ($defined(this.$currentRequest)) {
      		this.$currentRequest.cancel();
      	}
	  	this.$currentRequest = this.$geocoder.lookup({
			id:id
      	},function(result){
      		console.log('LOOKUP RESULT',result);
	  		if ($type(onComplete)=='function') {
	  			var address = result.address,
	  				position = result.position,
	  				titles = result.title.split(','),
	  				parts = [address.street,address.district,address.city,address.county,address.postalCode],
	  				cleaned = new Array()
	  				;
	  			titles.each(function(title){
	  				if (!parts.contains(title)) {
	  					cleaned.include(title);
	  				}
	  			});
	  			console.log('CLEANED',cleaned);
	  			var itemData = {
	  				id:result.id,
	  				name:result.title,
	  				building:cleaned.length?cleaned[0]:'',
	  				address:address.label,
	  				
	  				street:address.street,
	  				town:address.district,
	  				city:address.city,
	  				state:address.county,
	  				zipcode:address.postalCode,
	  				country:address.countryCode,
	  				lat:position.lat,
	  				lng:position.lng
	  			};
	  			onComplete(itemData);
	  		}
	  	}.bind(this),onError);
	}
});
TPH.Map.Router = new Class({
	Implements:[Events,Options],
	options:{
		params:{
			mode:'car',
			return:'polyline'
		},
		urlTemplate:'https://route.ls.hereapi.com/routing/7.2/getroute.json?transportMode={mode}&origin={origin}&destination={destination}&return={return}&apiKey={apiKey}'
	},
	initialize:function(origin,destination,options) {
		this.setOptions(options);
		this.$url = this.options.urlTemplate.substitute($merge(this.options.params,{
			origin:[origin.lat,origin.lng],
			destination:[destination.lat,destination.lng],
			apiKey:$pick(this.options.params.apiKey,TPH.$hereKey)
		})); 
		
		this.$request = new Request.JSONP({
			url:this.$url,
			callbackKey:'jsoncallback',
			onComplete:function(result){
				console.log(result);
				/*
				console.log(result.routes[0].sections[0].polyline);
				TPH.loadAsset('HEREFlexiblePolyline',function(){
					var data = FlexiblePolyline.decode(result.routes[0].sections[0].polyline);
					console.log(data);
				}.bind(this));
				*/		
			}.bind(this),
			onError:function(text, error){
				//console.log('onError',arguments);
				this.fireEvent('onError',[text,error,this]);
			}.bind(this),
			onFailure:function(req){
				//console.log('onFailure',arguments);
				this.fireEvent('onFailure',[req,this]);
			}.bind(this)
		});
		//console.log('onRequest',this.$request);
		this.fireEvent('onRequest',[this]);
		this.$request.send();
	}
});

TPH.Map.Geocode = new Class({
	Implements:[Events,Options],
	Extends:TPH.Map.HERE,
	options:{
		
	},
	setup:function(){
		
	}
});

TPH.Map.Geocode.Reverse = new Class({
	Implements:[Events,Options],
	options:{
		radius:10,
		params:{
			maxresults:5,
			mode:'retrieveAddresses'
		},
		urlTemplate:'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?maxresults={maxresults}&mode={mode}&prox={prox}&apiKey={apiKey}'
	},
	initialize:function(lat,lng,options){
		this.setOptions(options);
		this.$url = this.options.urlTemplate.substitute($merge(this.options.params,{
			prox:[lat,lng,this.options.radius].join(','),
			apiKey:$pick(this.options.params.apiKey,TPH.$hereKey)
		})); 
		this.$request = new Request.JSONP({
			url:this.$url,
			callbackKey:'jsoncallback',
			onComplete:function(data){
				console.log('MAP GEOCODE REVERSE',lat,lng,data);
				if ($defined(data.Response)) {
					if (data.Response.View.length) {
						var tresults = data.Response.View[0].Result,
							results = new Array();
						tresults.each(function(titem){
							if (titem.Distance>=0) {
								var address = titem.Location.Address,
									item = {
										type:titem.MatchLevel,
										distance:titem.Distance,
										country:this.getAdditionalDataValue('CountryName',address.AdditionalData),
										state:address.County,
										zipcode:address.PostalCode,
										city:address.City,
										town:address.District,
										street:address.Street,
										housenumber:$defined(address.HouseNumber)?'No. '+address.HouseNumber:null
									},
									label = new Array();
								'housenumber,street,town,city,zipcode,state,country'.split(',').each(function(field){
									var value = item[field];
									switch(field) {
									}
									if ($defined(value)) {
										label.push(value);
									}
								});
								$extend(item,{
									label:label.join(', ')
								});
								results.push(item);	
							}					
						}.bind(this));
						this.fireEvent('onComplete',[results,this,data]);
					} else {
						this.fireEvent('onNoData',[data,this]);
					}	
				} else {
					console.error('Unable to load Geocode Reverse Data',lat,lng,data);
					this.fireEvent('onNoData',[data,this]);
				}			
			}.bind(this),
			onError:function(text, error){
				//console.log('onError',arguments);
				this.fireEvent('onError',[text,error,this]);
			}.bind(this),
			onFailure:function(req){
				//console.log('onFailure',arguments);
				this.fireEvent('onFailure',[req,this]);
			}.bind(this)
		});
		//console.log('onRequest',this.$request);
		this.fireEvent('onRequest',[this]);
		this.$request.send();
	},
	getAdditionalDataValue:function(key,reference){
		if (!$defined(reference)) return;
		var count = reference.length;
		for(var i=0;i<count;i++) {
			var ref = reference[i];
			if (ref.key==key) {
				return ref.value;
			}
		}
	}
});

TPH.Spreadsheet = new Class({
	Implements:[Events,Options],
	options:{
		templates:{
			tabsContainer:'<ul class="fieldList spaced inline"><li class="tabsContainer"></li></ul>',
			tab:'<div class="navigationItem">{name}</div>'
		}
	},
	initialize:function(container,options){
		this.container = container;
		this.tabsContainer = new Element('ul',{'class':'tabMenu'}).inject(new Element('div',{'class':'tabsContainer overflow auto'}).inject(container));
		this.sheetContainer = new Element('div',{'class':'fullHeight'}).inject(container);
		this.setOptions(options);
	},
	destroy:function(){
		if ($defined(this.$grid)) {
			this.$grid.dispose();
			this.$grid = null;
		}
		this.container.empty();
		this.clear();
	},
	clear:function(){
		if ($defined(this.$grid)) {
			this.$grid.dispose();
			this.$grid = null;
		}
		this.tabsContainer = null;
		this.sheetContainer = null;
		this.$workbook = null;
	},
	setContent:function(content){
		TPH.loadAsset('XLSX',function(){
			this.$workbook = XLSX.read(content,{type:'arraybuffer',raw:false});
			//console.log(this.$workbook);
			this.render();
		}.bind(this));	
	},
	getSheetNames:function(){
		if ($defined(this.$workbook)) {
			return this.$workbook.SheetNames;
		}
		return [];
	},
	getSheet:function(name){
		if ($defined(this.$workbook)) {
			function alphaToNum(alpha) {
				var i = 0,
					num = 0,
						len = alpha.length;
				for (; i < len; i++) {
				    num = num * 26 + alpha.charCodeAt(i) - 0x40;
				}
			
			  	return num - 1;
			}
			function numToAlpha(num) {
				var alpha = '';
			
				for (; num >= 0; num = parseInt(num / 26, 10) - 1) {
			    	alpha = String.fromCharCode(num % 26 + 0x41) + alpha;
				}
			  	return alpha;
			}
			function _buildColumnsArray(sheet) {
			  	var res = new Array();
			  	if ($defined(sheet['!ref'])) {
			  		var rangeNum = sheet['!ref'].split(':').map(function(val) {
				        	return alphaToNum(val.replace(/[0-9]/g, ''));
				      	}),
				      	start = rangeNum[0],
				      	end = rangeNum[1] + 1;
					for (var i = start; i < end ; i++) {
						var col = numToAlpha(i);
				    	res.push({
				    		col:col,
				    		header:$pick(sheet[col+'1'],{v:''}).v
				    	});
				  	}	
			  	}
			    
			 	return res;
			}
			
			var sheet = this.$workbook.Sheets[name];
			var columns = _buildColumnsArray(sheet);
			return {
				columns:columns,
				elements:sheet
			};
		}
	},
	render:function(){
		if ($defined(this.$grid)) {
			this.$grid.dispose();
			this.$grid = null;
		}
		this.tabsContainer.empty();
		this.sheetContainer.empty();
		this.getSheetNames().each(function(name,i){
			new Element('li',{'class':(!i?'active':'')+' tabItem'}).inject(this.tabsContainer).adopt(new Element('div').set('html','<div>'+name+'</div>')).store('name',name);
		}.bind(this));
		this.fireEvent('onRenderTabs',[this]);
		
		new TPH.ContentNavigation(this.tabsContainer,{
			classes:{
				item:'tabItem'	
			},
			onSelect:function(el){
				var name = el.retrieve('name');
				this.renderSheet(name);
			}.bind(this)
		});
		this.renderSheet.delay(500,this,this.getSheetNames()[0]);
	},
	renderSheet:function(name){
		if ($defined(this.$grid)) {
			this.$grid.dispose();
			this.$grid = null;
		}
		this.sheetContainer.empty();
		this.$currentSheet = name;
		var sheet = this.getSheet(name);
		TPH.loadAsset('canvasDatagrid',function(){
			var json = XLSX.utils.sheet_to_json(sheet.elements, {raw:false, header:1});
			var hasContent = false;
			if (json.length) {		
				/* set up table headers */
				var L = 0;
				json.forEach(function(r) { if(L < r.length) L = r.length; });
				//console.log(L);
				for(var i = json[0].length; i < L; ++i) {
					json[0][i] = "";
				}
				if (L) {
					hasContent = true;
					this.$grid = canvasDatagrid({
						parentNode: this.sheetContainer
					});
					this.$grid.addEventListener('rendercell', function (e) {
					    //if (e.cell.header.name === 'MyStatusCell' && /blah/.test(e.cell.value)) {
					    //    e.ctx.fillStyle = '#AEEDCF';
					    //}
					    this.fireEvent('onRenderCell',[e,this]);
					}.bind(this));
					this.$grid.style.height = '100%';
					this.$grid.style.width = '100%';
					this.$grid.data = json;	
				}
			}
			if (!hasContent) {
				this.sheetContainer.adopt(new Element('div',{'class':'padded'}).set('html','Selected Sheet is Empty.'));
			}
		}.bind(this));
		this.fireEvent('onRenderSheet',[name,sheet,this]);
	},
	getItems:function(params){
		var sheet = this.getSheet(this.$currentSheet);
		return XLSX.utils.sheet_to_json(sheet.elements, $pick(params,{raw:false, header:1}));
	}
});

TPH.ScrollZoom = function(container,max_scale,factor){
    var target = container.getFirst();
    var size = {w:target.getStyle('width').toInt(),h:target.getStyle('height').toInt()};
    var pos = {x:0,y:0};
    var zoom_target = {x:0,y:0};
    var zoom_point = {x:0,y:0};
    var scale = 1;
    target.setStyle('transform-origin','0 0');
    target.addEvents({
    	mousewheel:scrolled,
    	scroll:scrolled
    });

    function scrolled(e){
        var offset = container.getPosition();
        zoom_point.x = e.page.x - offset.x;
        zoom_point.y = e.page.y - offset.y;

        e.preventDefault();
        var delta = -e.event.deltaY || e.event.wheelDelta;
        if (delta === undefined) {
          //we are on firefox
          delta = e.event.detail;
        }
        delta = Math.max(-1,Math.min(1,delta)); // cap the delta to [-1,1] for cross browser consistency

        // determine the point on where the slide is zoomed in
        zoom_target.x = (zoom_point.x - pos.x)/scale;
        zoom_target.y = (zoom_point.y - pos.y)/scale;

        // apply zoom
        scale += delta*factor * scale;
        scale = Math.max(1,Math.min(max_scale,scale));

        // calculate x and y based on zoom
        pos.x = -zoom_target.x * scale + zoom_point.x;
        pos.y = -zoom_target.y * scale + zoom_point.y;


        // Make sure the slide stays in its container area when zooming out
        if(pos.x>0)
            pos.x = 0;
        if(pos.x+size.w*scale<size.w)
            pos.x = -size.w*(scale-1);
        if(pos.y>0)
            pos.y = 0;
         if(pos.y+size.h*scale<size.h)
            pos.y = -size.h*(scale-1);

        update();
    }

    function update(){
        target.setStyles({
        	transform:'translate('+(pos.x)+'px,'+(pos.y)+'px) scale('+scale+','+scale+')'
        });
    }
};

var TagContainer = new Class({
	Implements:[Events,Options],
	options:{
		selector:'TagWords'
	},
	initialize:function(container,options){
		this.setOptions(options);
		
		this.container = $pick($(container),$(window.document.body));
		this.container.getElements('.'+this.options.selector).each(function(el){
			new TagContainer.Tags(el,$merge({
			    onAdd:function(word,tags){
			        this.fireEvent('onAddTag',[word,tags,this]);
			    }.bind(this),
			    onRemove:function(word,tags){
                    this.fireEvent('onRemoveTag',[word,tags,this]);
                }.bind(this),
                onKeyUp:function(e,editor,tags){
                    this.fireEvent('onKeyUp',[e,editor,tags,this]);
                }.bind(this),
                onKeyDown:function(e,editor,tags){
                    this.fireEvent('onKeyDown',[e,editor,tags,this]);
                }.bind(this),
                onBlur:function(e,editor,tags){
                    this.fireEvent('onBlur',[e,editor,tags,this]);
                }.bind(this)
			},options));
		}.bind(this));
	}
});

TagContainer.Tags = new Class({
	Implements:[Events,Options],
	options:{
		glue:',',
		classes:{
		    wordContainer:'tagWordContainer'
		}
	},	
	initialize:function(el,options){
		this.el = $(el).setStyle('display','none');
		this.setOptions(options);
		this.container = new Element('div',{'class':this.options.classes.wordContainer}).injectAfter(this.el);
		this.tags = new Hash();
				
		
		this.editor = new TagContainer.Tags.Editor(this,{
			onKeyUp:function(e,editor) {
				if (e.key=='enter') {
					e.stop();
					this.addTag(editor.getValue());
				}
				this.fireEvent('onKeyUp',[e,editor,this]);
			}.bind(this),
			onKeyDown:function(e,editor){
				if ([','].contains(e.event.key)) {
					e.stop();
					this.addTag(editor.getValue());
				}
				this.fireEvent('onKeyDown',[e,editor,this]);
			}.bind(this),
			onBlur:function(e,editor){
			    this.addTag(editor.getValue());
			    this.fireEvent('onBlur',[e,editor,this]);
			}.bind(this)
		});
		
		var preset = this.el.get('value').split(this.options.glue);
		this.el.set('value','');
		preset.each(function(word){
			this.addTag(word);
		}.bind(this));
	},
	addTag:function(word){
		var word = word.trim();
		if (word.length) {
			if (!this.tags.has(word)) {
				this.tags.set(word,new TagContainer.Tags.Tag(this,word,{
					onAfterRemove:function(instance){
						this.removeTag(instance.getWord());
					}.bind(this)
				}));				
			}
			this.rebuild();
			this.fireEvent('onAdd',[word,this]);
		}		
	},
	removeTag:function(word){		
		this.tags.erase(word);
		this.rebuild();
		this.fireEvent('onRemove',[word,this]);
	},
	rebuild:function(){
		this.el.set('value',this.tags.getKeys().join(this.options.glue));
		this.editor.clear().reposition().focus();
	}
});

TagContainer.Tags.Tag = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(tags,word,options){
		this.tags = tags;
		this.word = word;
		this.setOptions(options);
		
		this.container = new Element('div',{'class':'tagWord'}).injectInside(this.tags.container);
		this.tagElement = new Element('div',{'class':'_tag'}).set('html',TPH.htmlEntities(word)).injectInside(this.container).addEvent('click',function(e){
			this.fireEvent('onClick',[this]);
		}.bind(this));
		
		this.tagRemove = new Element('div',{'class':'_remove'}).injectInside(this.container).addEvent('click',function(e){
			this.fireEvent('onBeforeRemove',[this]);
			this.container.remove();
			this.fireEvent('onAfterRemove',[this]);
		}.bind(this)); 
	},
	setWord:function(word){
		this.word = word;
		this.tagElement.set('html',word);
	},
	getWord:function(){
		return this.word;
	}
});

TagContainer.Tags.Editor = new Class({
	Implements:[Options,Events],
	options:{
		autoFocus:false,
		classes:{
		    word:'tagWord'
		}
	},
	initialize:function(tags,options){
		this.tags = tags;
		this.setOptions(options);
		this.container = new Element('div',{'class':this.options.classes.word}).injectInside(this.tags.container);
		this.input = new Element('input',{type:'text',size:1}).injectInside(this.container).addEvents({
			keyup:function(e){	
			    if (e.key=='esc') {
                    this.clear();
                }					
				this.fireEvent('onKeyUp',[e,this]);
				this.fit();
			}.bind(this),
			keydown:function(e){			    
				this.fireEvent('onKeyDown',[e,this]);
			}.bind(this),
			blur:function(e){
				this.fit();
				this.fireEvent('onBlur',[e,this]);
			}.bind(this)
		});
		if (this.options.autoFocus) {
			this.input.focus();	
		}
	},
	getValue:function(){
		return this.input.get('value');
	},
	setValue:function(value){
		this.input.set('value',value);
		this.fit();
		return this;
	},
	clear:function(){
		this.setValue('');
		return this;
	},
	fit:function(){
		var size = this.input.get('value').length;
		if (!size) size = 1;
		this.input.set('size',size);
	},
	reposition:function(){
		this.container.injectInside(this.tags.container);
		return this;
	},
	focus:function(){
		this.input.focus();
		return this;
	}
});


var ProgressBar = new Class({
    Implements:[Options,Events],
    options:{
        classes:{
            container:'progressBar',
            bar:'progress'    
        },
        progress:0        
    },
    initialize:function(container,options){
        this.container = $(container);
        this.setOptions(options);
        this.build();
    },
    build:function(){
        this.bar = new Element('div',{'class':this.options.classes.container}).injectInside(this.container);
        this.progress = new Element('div',{'class':this.options.classes.bar}).injectInside(this.bar);
        this.set(this.options.progress);
    },
    set:function(progress){
        this.progress.setStyle('width',progress+'%');
        if (progress>0) {
            this.bar.setStyle('display','');
        } else {
            this.bar.setStyle('display','none');
        }
    },
    reset:function(){
        this.set(0);
    },
    destroy:function(){
        this.bar.remove();
    }
});

ProgressBar.File = new Class({
    Extends:ProgressBar,
    options:{
        classes:{
            fileGroup:'progressFileGroup',
            fileName:'progressFileName',
            cancel:'progressCancel'
        }
    },
    initialize:function(container,file,options){
        this.file = file;
        this.parent(new Element('div',{'class':this.options.classes.fileGroup}).injectInside(container),options);
    },
    build:function(){
        new Element('div',{'class':this.options.classes.cancel}).injectInside(this.container).addEvent('click',function(e){
            e.stop();
            this.fireEvent('onCancel',[this]);
        }.bind(this));
        this.fileName = new Element('div',{'class':this.options.classes.fileName}).set('html',this.file.name).injectInside(this.container);
        this.parent();
    },
    destroy:function(){
        this.container.remove();
    }    
});

var FileUploader = new Class({
	Implements:[Options,Events],
	options:{	    
		selector:'fileUpload',		
		params:{
			option:'',
			task:'upload',
			format:'raw'
		},
		url:'.',
		method:'POST',
		validTypes:[],
		messages:{
			type:'Please upload required file format',
			size:'Maximum File Size you can upload is only <u>{limit}</u>'
		},
		multiple:false
	},
	initialize:function(container,options){
		this.addEvents({			
			onFailure:function(data,el){
				TPH.alert('System Message','There seems to be a problem uploading to the server. Please try again or contact support.');								
			}.bind(this)
		});
		$extend(this.options.params,{option:$pick(this.options.params.option,TPH.$component)});
		this.setOptions(options);
		this.reset(container);
		this.fireEvent('onReady',[this]);
	},
	reset:function(container){	    
	    this.container = document.id(container);
	    this.progress = null;
	    		
		this.container.getElements('input[type="file"].'+this.options.selector).each(function(el){	
			el.addEvents({
				change:function(){
					this.fireEvent('onChange',[el,this]);
					var limit = el.get('data-limit');
					if ($defined(limit)) {
						this.limit = limit.toInt();
					}
					
				    if ($defined(this.options.progress)) {
                       var progress = document.id(container).getElementById(this.options.progress);
                       if ($defined(progress)) {
                           this.progress = progress;
                       } 
                    } 
                    this.fireEvent('onBeforeUpload',[el,this]);
                    
                    if (!$defined(this.progress)) {
                        this.progress = new Element('div').injectAfter(el);    
                    }
                    
				    this.fireEvent('onUpload',[el,this]);
					return this.upload(el);
				}.bind(this)
			});
		}.bind(this));
	},
	validate:function(file){
		var ret = true;
		if (this.options.validTypes.length) {
			ret = this.options.validTypes.contains(file.data.type);
			if (!ret) {
				file.error = 'type';
			}
		}
		if ($defined(this.limit) && ret) {
			ret = file.data.size<=this.limit;
			if (!ret) {
				file.error = 'size';
			}
		}
		if (this.hasEvent('validate') && ret) {
			this.fireEvent('onValidate',[file,this]);	
		} else {
			file.valid = ret;
		}
		return file.valid;
	},
	upload:function(el){
	    this.uploaded = 0;
	    this.toUpload = 0;
	    var valids = new Array(), 
	    	invalids = new Array();
	    for(var i=0;i<el.files.length;i++) {
	        var file = {valid:true,data:el.files.item(i)};	
            if (!this.validate(file)) {
                invalids.push(file);
            }  else {
            	valids.push(file);
            }
	    }	
	    if (invalids.length) {
	    	var message = {}, errorMessage = new Array();
	    	invalids.each(function(file){
	    		var error = $pick(file.error,'$');
	    		if (!$defined(message[error])) {
	    			message[error] = new Array();
	    		}
	    		message[error].push(file);
	    	}.bind(this));
	    	for(error in message){
	    		errorMessage.push('<dt>'+this.options.messages[error].substitute({limit:TPH.byteSize(this.limit)})+'</dt>');
	    		errorMessage.push('<dd class="large">Issues were found:');
	    		var fileMessage = new Array();
	    		message[error].each(function(file){
	    			fileMessage.push('<li>File name : '+file.data.name
	    							+'<br />Size : '+TPH.byteSize(file.data.size)
	    							+'</li>');
	    		});
	    		errorMessage.push('<ul class="margin_left">'+fileMessage.join('<div class="separator"></div>')+'</ul>');
	    		
	    		errorMessage.push('Listed file'+(message[error].length>1?'s':'')+' was not included in upload queue.</dd>');
	    	}
	    	TPH.alert('System Message','<dl class="definitions">'+errorMessage.join('')+'</dl>');
	    }
	    if (valids.length) {
	    	valids.each(function(file){
	    		this.toUpload++;
            	this.send(file.data,el);
	    	}.bind(this));
	    }		
	},
	objToFormdata:function(obj,formdata,ns){
		for(key in obj){
			var fieldName = $defined(ns)?ns+'['+key+']':key;
			var value = obj[key];
			console.log(fieldName,value);
			switch($type(value)){
				case 'object':
					this.objToFormdata(value,formdata,fieldName);
					break;
				default:
					formdata.append(fieldName,value);
					break;
			}
		}
	},
	send:function(file,el){
	    var formData = new FormData();
        formData.append('Filedata',file);
        formData.append('Filename',file.name);
        this.objToFormdata(this.options.params,formData);
        /*
        for(key in this.options.params){
            formData.append(key,this.options.params[key]);
        }
        */
        this.fireEvent('onPreRequest',[formData,file,el,this]);
        var request = new XMLHttpRequest();
        var progress = new ProgressBar.File(this.progress,file,{
            onCancel:function(instance){
                request.abort();
                progress.destroy();
                this.fireEvent('onCancel',[formData,file,request,instance,el,this]);
            }.bind(this)
        });
        
        request.open(this.options.method,this.options.url, true);
        request.upload.onprogress = function(e){
            var loaded = parseInt(e.loaded / e.total * 100, 10).limit(0, 100);
            progress.set(loaded);
        }.bind(this);
        request.onreadystatechange = function(e){
            if (request.readyState == 4) {
                if (request.status == 200) {                   
                    this.uploaded++;
                    this.fireEvent('onComplete',[Json.decode(request.responseText),file,this.uploaded==this.toUpload,el,this]);    
                    progress.destroy();                
                } else {
                    this.fireEvent('onFailure',[formData,file,request,progress,el,this]);
                    progress.progress.addClass('error');                    
                }
            }
        }.bind(this);   
        this.fireEvent('onRequest',[formData,file,request,progress,el,this]);
        request.send(formData);
	}	
});

FileUploader.Photo = new Class({
	Extends:FileUploader,
	options:{
		params:{
			task:'uploadImage'
		},
		validTypes:['image/png','image/jpeg','image/jpg','image/gif'],
		invalidMessage:'Please upload a photo or an image file.'
	}
});

FileUploader.Video = new Class({
    Extends:FileUploader,
    options:{
        params:{
            task:'uploadVideo'
        },
        validTypes:['video/mp4'],
        invalidMessage:'Please upload a video file.'
    }
});

FileUploader.File = new Class({
    Extends:FileUploader,
    options:{
        params:{
            task:'uploadFile'
        },
        validTypes:[],
        invalidMessage:'Please upload a file.'
    }
});

var Uploader = new Class({
	Extends:FileUploader,
	options:{
		params:{
			task:'upload',
			format:'raw'
		}
	},
	initialize:function(el,options){
		this.el = el;
		this.setOptions(options);
		
		var limit = el.get('data-limit');
		if ($defined(limit)) {
			this.limit = limit.toInt();
		}
		el.addEvents({
			change:function(){    
			    this.fireEvent('onUpload',[el,this]);
				return this.upload(el);
			}.bind(this)
		});
	}
});
Uploader.Photo = new Class({
	Extends:FileUploader.Photo,
	options:{
		selector:'.photoUploader'
	},
	initialize:function(container,options){
		this.addEvents({
			onBeforeUpload:function(el,instance){
				console.log(el);
				instance.progress = instance.container.getElementById(el.get('data-target')).addClass('loading');
			}.bind(this),
			onComplete:function(data,file,completed,el,instance){
				var container = instance.container.getElementById(el.get('data-target')).removeClass('loading');
				container.getElements('input.newupload').destroy();
				container.setStyle('background-image','url('+data[el.get('data-size')]+')')
						.adopt(new Element('input',{'class':'newupload',type:'hidden',name:el.get('data-name'),value:data.id}))
						.adopt(new Element('input',{'class':'newupload',type:'hidden',name:el.get('data-ext'),value:data.ext}))
						;
			}.bind(this),
			onFailure:function(formData,file,request,progress,el,instance){
				instance.container.getElementById(el.get('data-target')).removeClass('loading');
			}.bind(this),
			onCancel:function(formData,file,request,progress,el,instance){
				instance.container.getElementById(el.get('data-target')).removeClass('loading');
			}.bind(this)
		});
		this.parent(container,options);
	}
});

var SearchTerm = new Class({
    Implements:[Events,Options],
    options:{
        classes:{
            container:'searchTermContainer',
            icon:'fa fa-search color-grey',
            clear:'fa fa-times-circle cursor pointer padded_sides'
        }
    },
    initialize:function(el,options){
        this.el = $(el);
        this.setOptions(options);
        this.icon = new Element('i',{'class':this.options.classes.icon});
        this.clear = new Element('i',{'class':this.options.classes.clear});
        this.container = new Element('div',{'class':this.options.classes.container})
        	.injectAfter(this.el)
        	.adopt(this.icon)
        	.adopt(new Element('div').adopt(this.el))
        	.adopt(this.clear)
        	;
        this.clear.addEvent('click',function(e){
            this.el.set('value','');
            this.check();
            this.fireEvent('onClear',[this]);             
        }.bind(this));
        
        this.el.addEvents({
        	keypress:function(e){
        		switch(e.key){
        			case 'enter':
        				this.fireEvent('onSearch',[this.el.get('value'),this]);
        				break;
        			case 'esc':
        				this.el.set('value','');
			            this.check();
			            this.fireEvent('onClear',[this]);
        				break;
        		}
        	}.bind(this),
            keyup:function(){
                this.check();
            }.bind(this)
        });
        this.check();
    },
    clear:function(){
    	this.clear.fireEvent('click');
    },
    check:function(){
        if (this.el.get('value').length) {
            this.clear.addClass('active');
        } else {
            this.clear.removeClass('active');
        }
    }
});

TPH.Editor = new Class({
	Implements:[Events,Options],
	options:{
		mode:'standard',
		editor:{
            removeButtons:'Image,Anchor,Strike,Subscript,Superscript,Styles,SpecialChar',
            allowedContent:true,             
            tabSpaces:4,           
            disallowedContent:'iframe frame head body html script'
		},
		events:{
			
		}
	},
	modes:{
		full:{
			extraPlugins:'tphbrowser',
			toolbarGroups:[
                { name: 'undo'},
                { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                
                { name: 'styles' },
                { name: 'links'},
                { name: 'insert' },
                { name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] }
            ]
		},
		standard:{
			toolbarGroups:[
                { name: 'undo'},
                
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                //{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
                { name: 'styles' },
                { name: 'links'},
                { name: 'insert' }
            ]
		},
		lite:{
			toolbarGroups:[
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                { name: 'links'}
            ]
		},
		xlite:{
			toolbarGroups:[
                { name: 'basicstyles', groups: [ 'basicstyles' ] },
                { name: 'paragraph',   groups: [ 'list', 'align' ] }
            ]
		}
	},
	inlines:{},
    initialize:function(field,options){       
        this.setOptions(options);     
        this.fields = new Hash();
        //this.checkEditor();
        TPH.loadAsset('CKEDITOR',function(){
        	this.attach(field);	
        }.bind(this));
    },
    destroy:function(){
    	this.clear();
    	this.fields.empty();
    },
    /*
    checkEditor:function(){
        if (!$defined(TPH.Editor.instance)) {
        	TPH.Editor.loadEditor();   
        }            
        return this;
    },
    */
    loadEditor:function(){
    	this.fields.each(function(field,name){
    		field.getParent().addClass('loading');
    		var container = field.getParent();
	        var height = $pick(container.get('data-height'),$pick(this.options.height,container.getCoordinates().height)); 
	        var options = $merge(this.modes[this.options.mode],this.options.editor);
	        if (this.options.autoGrow) {
	        	options.extraPlugins = $pick(options.extraPlugins,'').split(',').include('autogrow').join(',');
	        	options.autoGrow_minHeight = height;
	        } else {
	        	options.height = height;
	        }
	        //console.log(options);
	        CKEDITOR.env.isCompatible = true;
        	CKEDITOR.disableAutoInline = true;
	        CKEDITOR.replace(field,$merge(options,{
	            //height:height,
	            on:{
	                focus:function(evt){
	                    this.fireEvent('onFocus',[evt,this]);
	                }.bind(this),
	                change:function(evt){
	                    this.fireEvent('onChange',[evt,this]);
	                }.bind(this)    ,
	                instanceReady:function(evt){   
	                	console.log(name);
	                	if (this.options.fullHeight){
	                		this.fullHeight(name);
	                		window.addEvent('resize',function(){
	                			this.fullHeight.delay(500,this,[name]);
	                		}.bind(this));
	                	}
	                	field.getParent().removeClass('loading');
	                    this.fireEvent('onReady',[evt,this,field]);
	                    /*
	                    if (!TPH.Editor.EventInitialized) {
	                    	window.addEvent('resize',function(){
				            	for(name in CKEDITOR.instances) {
				            		(function(){
				            			var container = CKEDITOR.instances[name].element.$.getParent();
			                    		CKEDITOR.instances[name].resize('100%',container.getCoordinates().height);
			                    	}).debounce();
				            	}
				            });
				            TPH.Editor.EventInitialized = true;
	                    }
	                    */
	                    //window.fireEvent('resize');
	                }.bind(this),
	                mode:function(evt){
	                    this.fireEvent('onChangeMode',[evt.editor.mode,evt,this]);
	                }.bind(this)
	            }           
	        }));
    	}.bind(this));
    },
    fullHeight:function(name){
    	console.log(name);
    	var editor = CKEDITOR.instances[name];
    	var container = editor.element.$.getParent();
		editor.resize('100%',container.getCoordinates().height);
    },
    updateField:function(name,target){
        if ($defined(window['CKEDITOR'])) {
        	this.fields.each(function(field,name){
        		if ($defined(CKEDITOR.instances[name])) {
        			CKEDITOR.instances[name].updateElement();	
        		}
        	}.bind(this));
        } 
    },
    getData:function(name){
    	return CKEDITOR.instances[name].getData();
    },
    clear:function(){
    	this.fields.each(function(field,name){
    		if ($defined(CKEDITOR.instances[name])) {
    			CKEDITOR.instances[name].destroy(true);
		    	CKEDITOR.remove(name);	
    		}
    		this.fields.remove(name);
    	}.bind(this));
		return this;
    },
    attach:function(field){
    	if ($type(field)=='array') {
    		field.each(function(field){
    			this.fields.set(field.get('name'),document.id(field));
    		}.bind(this));
    	} else{
    		this.fields.set(field.get('name'),document.id(field));
    	}
    	
    	this.loadEditor();
    },
    inline:function(field){
    	var container = document.id(field).getParent();
        var height = $pick(container.get('data-height'),$pick(this.options.height,container.getCoordinates().height)); 
        var options = $merge(this.options.editor,this.modes[this.options.mode]);
        var fieldName = field.get('name');
        this.inlines[fieldName] = field.get('html');
        this.fields.set(fieldName,field.set('contenteditable',true));
        CKEDITOR.inline(field,options);
    },
    remove:function(name){
    	if ($defined(CKEDITOR.instances[name])) {
    		CKEDITOR.instances[name].destroy(true);
		    CKEDITOR.remove(name);
		    this.fields.remove(name);	
    	}
    },
    cancelInline:function(name){
    	var field = this.fields.get(name);
    	this.remove(name);
    	if ($defined(this.inlines[name])) {
    		field.set('html',this.inlines[name]);
    		this.inlines[name] = null;
    	}
    }
}) ;

TPH.Editor.loadEditor = function(){
	if (!$defined(window['CKEDITOR'])) {
		TPH.Editor.instance = new Asset.javascript(TPH.$host+TPH.$root+'includes/js/ckeditor/ckeditor.js',{
			onload:function(){
				CKEDITOR.env.isCompatible = true;
        		CKEDITOR.disableAutoInline = true;
			}
		});	
	}
};

TPH.System = {
	MonitorSleep:new Class({
		Implements:[Events,Options],
		options:{
			timeout:5000
		},
		initialize:function(options){
			this.setOptions(options);
			this.lastTime = (new Date()).getTime();
			this.monitor.periodical(this.options.timeout,this);
		},
		monitor:function(){
			var currentTime = (new Date()).getTime();
			if (currentTime > (this.lastTime + this.options.timeout + 2000)) {
			    this.fireEvent('onWake',[this]);	
		    }
			this.lastTime = currentTime;
		}
	})
};

TPH.SyncScroll = new Class({
	Implements:[Events,Options],
	options:{
		horizontal:true,
		vertical:true
	},
	initialize:function(elements,options){
		this.$id = Number.random(1,1000);
		this.$elements = new Array();
		this.setOptions(options);
		this.$scroll = {
			x:0,
			y:0
		};
		this.$scrolling = false;
		if ($defined(elements)) {
			elements.each(function(el){
				this.attach(el);
			}.bind(this));	
		}
	},
	/*
	canScroll:function(flag){
		if (flag!==null) {
			this.$canScroll = flag;
		}
		return this.$canScroll;
	},
	*/
	attach:function(el){
		this.$elements.include(el);
		if (!el.$scrollSync) {
			el.scrollTo(this.$scroll.x,this.$scroll.y);
			el.addEventListener('scroll',function(e){
				if (this.$scrolling) return;
				this.$scroll = e.target.getScroll();
				this.sync(e.target);
			}.bind(this));	
		}
		el.$scrollSync = true;
	},
	sync:function(source){
		if (this.$scrolling) return;
		this.$scrolling = true;
        //this.$canScroll = false;
        this.$elements.each(function(otherEl){
        	//console.log('isOther',otherEl != source);
        	if (otherEl != source) {
        		var scroll = otherEl.getScroll();
        		var scrollX = this.options.horizontal?this.$scroll.x:scroll.x,
        			scrollY = this.options.vertical?this.$scroll.y:scroll.y
        			;
        		if (scroll.x!=scrollX || scroll.y!=scrollY) {
        			this.fireEvent('onBeforeScroll',[otherEl,this.$scroll,this]);
        			otherEl.scrollTo(scrollX,scrollY);	
        		}
            }
        }.bind(this));
        //(function(){
        	this.$scrolling = false;	
        //}.debounce(this));
        //this.$canScroll = true;
	},
	clear:function(){
		//var canScroll = this.$canScroll;
		//this.$canScroll = false;
		//this.$elements.each(function(el){
		//	el.removeEvents('scroll');
		//});
		this.$elements.empty();
		//this.$canScroll = canScroll;
		return this;
	}
});

TPH.UI = new Class({
	Implements:[Events,Options],
	options:{
		tabletWidth:1023,
    	mobileWidth:767
	},
	initialize:function(options){
		this.setOptions(options);
		this.container = document.id(window.document.body);
		
		var size = this.container.getSize();
		this.orientation = this.getOrientation(size);
		this.device = this.getDevice(size); 
		window.addEvents({
			resize:function(){
				this.check();
				$fullHeight(this.container);
			}.bind(this)
		});
	},
	check:function(){
		var size = this.container.getSize();
		var orientation = this.getOrientation(size);
		if (orientation!=this.orientation) {
			window.fireEvent('onChangeOrientation',[orientation,this.orientation,this]);
			this.orientation = orientation;
		}
		
		var device = this.getDevice(size);
		if (device!=this.device) {
			window.fireEvent('onChangeDevice',[device,this.device,this]);
			this.device = device;
		}
	},
	getOrientation:function(size){
		return size.x>size.y?'landscape':'portrait';
	},
	getDevice:function(size){
		if (size.x<=this.options.mobileWidth) {
			return 'mobile';
		} else if (size.x>this.options.mobileWidth && size.x<=this.options.tabletWidth) {
			return 'tablet';
		} else {
			return 'desktop';
		}
	}
});

function $fullHeight(container){	
	container.fireEvent('onBeforeFullHeight',[container]);
	var height = container.getCoordinates().height;
    var margins = container.getStyle('margin-top').toInt()
                    +container.getStyle('margin-bottom').toInt();
	var paddings = 0; //container.getStyle('padding-top').toInt()
                    //+container.getStyle('padding-bottom').toInt();
	var borders = container.getStyle('border-top-width').toInt()
                    +container.getStyle('border-bottom-width').toInt();
	var offset = borders+margins+paddings;
	var els = new Array();
	var children = container.getChildren();
	children.each(function(el){
		if (!['absolute','fixed'].contains(el.getStyle('position'))) {
			if (!['svg','script','style'].contains(el.get('tag'))) {
				el.setStyles({
                    display:'',
                    height:''
                });
				var isAutoHeight = el.getStyle('max-height')=='100%';
				var display = el.getStyle('display');
				if (el.hasClass('fullHeight') && !isAutoHeight && display!='none'){ //el.getStyle('height')!='auto') {
					el.getChildren().each(function(child){
						child.setStyle('display',!['absolute','fixed'].contains(child.getStyle('position'))?'none':'');
					});
					els.push(el);
				} else if (el.getStyle('display')!='none'){
					offset+=el.getCoordinates().height
                            +el.getStyle('margin-top').toInt()
                            +el.getStyle('margin-bottom').toInt()
                            //+el.getStyle('padding-top').toInt()
                            //+el.getStyle('padding-bottom').toInt()
                            +el.getStyle('border-top-width').toInt()
                            +el.getStyle('border-bottom-width').toInt();
				}	
			} else {
				//el.setStyle('display','');
                el.setStyles({
                    display:'',
                    height:''
                });
			}	
		}
	});
	var targetHeight = height-offset;
	els.each(function(el){		
		//el.setStyles({
			//'max-height':targetHeight,
		//	height:targetHeight
		//});	
        //el.setStyle('height',targetHeight);
        //var theight = height;
        /*
		var theight = height-(el.getStyle('margin-top').toInt()
                            +el.getStyle('margin-bottom').toInt()
                            +el.getStyle('padding-top').toInt()
                            +el.getStyle('padding-bottom').toInt()
                            +el.getStyle('border-top-width').toInt()
                            +el.getStyle('border-bottom-width').toInt());//-paddings-borders; //-el.getStyle('margin-top').toInt()-el.getStyle('margin-bottom').toInt()-el.getStyle('border-top-width').toInt()-el.getStyle('border-bottom-width').toInt();
        */                    
		if (targetHeight>height) {
			//targetHeight = theight;
			//el.setStyle('height',height);
		}
        
        el.setStyle('height',targetHeight);
		$fullHeight(el);
	});
	container.fireEvent('onAfterFullHeight',[container]);
};

function $scan(container){
	var container = $pick(container,document.id(window.document.body));
	//container.getElements('.fullHeight').setStyle('height','');
	$fullHeight(container);
};
function $fullWidth(container) {
	var els = container.getElements('div.fullWidth');
	els.each(function(el){
		var children = el.getChildren();
		children.setStyle('display','none');
	});
	els.each(function(el){
		var children = el.getChildren();
		var parent = el.getParent();
		var offset = parent.getStyle('padding-left').toInt()+parent.getStyle('padding-right').toInt()+parent.getStyle('border-left-width').toInt()+parent.getStyle('border-right-width').toInt();
		var width = el.getCoordinates([el.getParent()]).width-offset;
		el.setStyle('width',width);		
	});
	els.each(function(el){
		var children = el.getChildren();
		children.setStyle('display','');
	});
}

window.addEvents({
	domready:function() { 
		window.UI = new TPH.UI();
		//$scan.delay(100); 
	},
	//resize:function() { $scan.debounce(); },
	postAjax:function(instance){
		if ($defined(instance.container)) {
			$fullHeight(instance.container);
		}
	}
});