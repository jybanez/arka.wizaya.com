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

TPH = {
	version:'1.0 Beta',
	Connectivity: {
		invalidResponse:function(message){
			TPH.alert('<i class="fa fa-exclamation-circle"></i> Unexpected Server Response',String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
		},
		noConnection:function(){
			TPH.alert('<i class="fa fa-exclamation-circle"></i> Connectivity Error','Unable to connect to server. Please check your internet connection');
		}
	},
	alert:function(caption,message,onOk){
		var awin = TPH.getWindow('alert',{caption:caption,'closable':false,'onCreate':function(win){
			win.content.setStyles({'height':'','width':''});
			win.messageContainer = new Element('div',{'class':'alertMessage'}).injectInside(win.content).setStyles({'max-width':600});
			win.messageControl = new Element('div',{'class':'alertControls text_right'}).injectInside(win.content);
			
			
			TPH.button('Ok',{'class':'btn primary medium'}).injectInside(win.messageControl)
				.addEvent('click',function(e){
					new Event(e).stop();
					win.close(onOk);
				});
			
			window.addEvent('resize',function(){
				var wsize = window.getSize();
				win.messageContainer.setStyle('max-height',wsize.y-150);
			});
			var wsize = window.getSize();
			win.messageContainer.setStyle('max-height',wsize.y-150);
			(function(){ win.toCenter(true); }).delay(100);
		}});
		awin.messageContainer.set('html',message);
		awin.toTop().setCaption(caption).open(function(){
			var win = TPH.getWindow('alert');
			win.content.setStyles({'height':'','width':''});
			(function(){ win.toCenter(true); }).delay(100);
		});
	},
	getWindow:function(name,options){
		if (!$defined(TPH.windows)) {
			TPH.windows = new Hash();
		}
		if (!TPH.windows.hasKey(name)) {
			TPH.windows.set(name,new TPH.window(options));
		}
		return TPH.windows.get(name);
	},
	button:function(label,options,params) {
		var button = new Element($defined(params)?$pick(params.tag,'span'):'span',options)
						.addClass('btn')
						.adopt(new Element('span').setHTML(label))
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
						.adopt(new Element('span').setHTML('<i class="fa fa-'+bclass+'"></i> '+label))
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
	scanTips:function(container){
	    var tips = container.getElements('.hasTip');
        if ($defined(Tips.instance)) {
            Tips.instance.parseTitle(tips);
            Tips.instance.attach(tips);
        } else {
            Tips.instance = new Tips(tips);
        }
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
    } 
};
TPH.ContentContainer = new Class({
	Implements:[Events,Options],
	options:{
		selector:'.contentContainer',
		active:'active',
		action:'containerAction'
	},
	containers:{},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = document.id($pick(container,window.document.body));
		this.recheck();
	},
	recheck:function(){
		this.index = new Array();
		this.container.getElements(this.options.selector).each(function(el){
			var id = el.get('rel');
			if ($defined(id)) {
				this.setContainer(id,el);
				this.index.push(id);
			}
		}.bind(this));
		return this;
	},
	select:function(container){
		this.currentContainer = container;
		for(key in this.containers){
			this.containers[key][(key==container?'add':'remove')+'Class'](this.options.active);
		}
		this.fireEvent('onSelect',[container,this]);
		return this.containers[container];
	},
	getContainer:function(container){
		return this.containers[container];
	},
	setContainer:function(id,container){
		this.scanActions(container);
		this.containers[id] = container;
		this.fireEvent('onSetContainer',[id,container,this]);
		return this;
	},
	scanActions:function(container){
		container.getElements('.'+this.options.action).each(function(el){
			el.addEvent('click',function(e){
				new Event(e).stop();
				var id = el.get('rel');
				if (this.index.contains(id)) {
					this.select(id);	
				}
			}.bind(this));
		}.bind(this));
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
            right:'tab right'
        },
        padding:20
    },
    initialize:function(menu,options){
    	this.setOptions(options);
        this.menu = menu;
        this.wrapper = new Element('div',{'class':this.options.classes.wrapper}).injectAfter(this.menu);
        this.container = new Element('div',{'class':this.options.classes.container}).injectInside(this.wrapper).adopt(this.menu);
        this.scroller = new Fx.Scroll(this.container,{
        	link:'cancel',
        	wait: false,
			duration: 'short',
			transition: Fx.Transitions.Quad.easeInOut
        });
        
        this.pages = $(menu.get('rel'));
        menu.getChildren().each(function(tab,i){
            tab.store('page',this.pages.children[i]);
            tab.addEvent('click',function(e){
                new Event(e).stop();
                this.clear();
                tab.addClass('active').retrieve('page').addClass('active');
                this.fireEvent('onSelect',[tab,tab.retrieve('page'),this]);
            }.bind(this));            
        }.bind(this));        
        
        
       	this.reposition();
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
    	var size = this.menu.getSize();
    	
        if (size.scrollSize.x>size.x) {
        	this.scrollSize = size.x-(this.options.padding*2);
        	
        	this.container.setStyle('width',this.scrollSize);
        	this.menu.setStyle('width',size.scrollSize.x);
        
        	this.leftScroller = new Element('div',{'class':this.options.classes.left}).injectBefore(this.container);
	        this.leftScroller.addEvents({
	        	click:function(e){
	        		new Event(e).stop();
	        		this.scroller.start(this.container.scrollLeft-this.scrollSize,0);
	        		this.lastX = this.container.scrollLeft-this.scrollSize;
	        	}.bind(this)
	        });
	        
	        this.rightScroller = new Element('div',{'class':this.options.classes.right}).injectAfter(this.container);
	        this.rightScroller.addEvents({
	        	click:function(e){
	        		new Event(e).stop();
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
TPH.selectOptions = new Class({
    Implements:[Options,Events],
    options:{
        className:'selectOption'
    },  
    defaults:{},
    nonText:{},
    initialize:function(container,options){
        this.selectOptions = new Hash();
        this.setOptions(options);
        this.container = $($pick(container,window.document.body));
        this.container.getElements('.'+this.options.className).each(function(target){
            var elName = target.get('rel');                     
            if ($defined(elName)) {             
                this.attach(elName,target);
            }
        }.bind(this));
        
        for(def in this.defaults){
        	var el = this.defaults[def];
            this.checkValue(def,el.get('value'),el);
        }
        
        for(elName in this.nonText) {
        	var el = this.nonText[elName];
        	this.container.getElements('input[name="'+elName+'"]').each(function(radio){
            	this.checkValue(elName,radio.get('value'),el);
            }.bind(this));
        }
        
       this.fireEvent('onInitialize',[this]);
    },
    attach:function(elName,target){
        if (!this.selectOptions.has(elName)) {
            this.selectOptions.set(elName,[target]);
            
            if (elName.charAt(0)=='#') {
                var el = this.container.getElementById(elName.replace('#',''));
            } else {
                var el = this.container.getElement('select[name="'+elName+'"]');
            }           
           
            if ($defined(el)) {
                el.addEvent('change',function(e){
                    this.checkValue(elName,el.get('value'),el);
                }.bind(this)).fireEvent('change');
                this.defaults[elName] = el;//.get('value');
            } else {
                this.container.getElements('input[name="'+elName+'"]').each(function(el){   
                    el.addEvent('click',function(e){                        
                        this.container.getElements('input[name="'+elName+'"]').each(function(radio){
                        	this.checkValue(elName,radio.get('value'),el);
                        }.bind(this));
                    }.bind(this));
                    this.nonText[elName] = el;                   
                }.bind(this));
                
            }    
        } else {
            this.selectOptions.get(elName).push(target);
        }       
    },
    checkValue:function(elName,value,el){
        if (!this.selectOptions.has(elName)) return;
        var hasValid = false;  
        this.fireEvent('onBeforeSelect',[elName,this]);
        this.selectOptions.get(elName).each(function(target){
        	var values = $pick(target.get('rev'),'').split('|');
        	switch(el.get('tag')) {
        		case 'select':
        			var valid = $defined(target.get('rev'))?values.contains(value):value!='';
        			break;
        		default:
        			switch(el.get('type')) {
		        		case 'radio':
		        		case 'checkbox':
		        			var checked = target.get('data-checked').toInt();
		        			var checked = (el.get('checked') && checked) || (!el.get('checked') && !checked);
		            		var valid = $defined(target.get('rev'))?values.contains(value) && checked:value!='';
		        			break;
		        		default:
		            		var valid = $defined(target.get('rev'))?values.contains(value):value!='';
		        	}	
        	}
        	
            target.setStyle('display',valid?'':'none')
                .getElements('input,select,textarea')
                .each(function(el){
                    el.set('disabled',!valid);
                });
            if (valid && !hasValid) {                
                hasValid = true;
            }
        }.bind(this));
        if (hasValid) {
            this.fireEvent('onSelect',[value,elName,this]);
        }
        this.fireEvent('onChange',[elName,this]);
    }
});
TPH.selectGallery = new Class({
	Implements:[Options,Events],
	options:{
		targetTag:'label',
		setTag:'dd'
	},
	initialize:function(container,options){
		this.setOptions(options);
		
		this.container = $(container);
		
		this.container.getElements(this.options.setTag).each(function(set){
			this.initializeSet(set);	
		}.bind(this));
	},
	initializeSet:function(set){
		set.getElements('input[type="radio"]').each(function(input){
			input.addEvent('click',function(){
				this.updateSet(set);
			}.bind(this));
		}.bind(this));
		this.updateSet(set);
	},
	updateSet:function(set){
		var selected;
		set.getElements('input[type="radio"]').each(function(input){
			if (input.checked) {
				selected = input.getParent();
			}
			input.getParent().removeClass('selected');
		}.bind(this));
		if ($defined(selected)) {
			selected.addClass('selected');
		}
	}
});
TPH.DataSet = new Class({
	Implements:[Options],
	options:{
		classes:{
			list:'fieldList'
		}
	},
	initialize:function(container,options){
		this.container = $(container);
		this.setOptions(options);
		this.fields = new Hash();
	},
	setFields:function(fields){
		this.fields.empty();
		this.fieldList = new Element('dl',{'class':this.options.classes.list}).injectInside(this.container);
		this.addFields($H($pick(fields,this.options.fields)));
		return this;
	},
	addFields:function(fields){
		fields.each(function(data,id){
			this.addField(id,data);
		}.bind(this));
		return this;
	},
	addField:function(id,data){
		var field = {
			'type':data.type,
			'term':new Element('dt').injectInside(this.fieldList),
			'definition':new Element('dd').injectInside(this.fieldList)
		};				
		var fieldID = 'field_'+id;
		field.label = new Element('label',{'for':fieldID}).injectInside(field.term).set('html',$pick(data.label,'Enter Field Name'));
		field.input = TPH.DataSet.Field.createField(data.type,$merge(data.params,{attributes:{id:fieldID}})).injectInside(field.definition);
		
		this.fields.set(id,field);
		return this;
	},
	hasField:function(id){
		return this.fields.has(id);
	},
	getField:function(id){
		return this.fields.get(id);
	},
	getFields:function(){
		return this.fields.getKeys();
	},
	removeField:function(id){
		var field = this.getField(id);
		if ($defined(field)) {
			field.term.remove();
			field.definition.remove();
		}
		this.fields.erase(id);
	},
	removeFields:function(fields){
		fields.each(function(field){
			this.removeField(field);
		}.bind(this));
	},
	getFieldValue:function(id){
		var field = this.fields.get(id);
		if ($defined(field)){
			return field.input.getValue();
		}
	},
	setFieldValue:function(id,value) {
		var field = this.fields.get(id);
		if ($defined(field)) {
			field.input.setValue(value);
		}
		return this;
	},
	getData:function(){
		var ret = {};
		this.fields.each(function(dataSet,key){
			ret[key] = this.getFieldValue(key);
		}.bind(this));
		return ret;
	},
	setData:function(data){
		for(id in data){
			this.setFieldValue(id,data[id]);
		}
	}
});

TPH.DataContainer = new Class({
	Implements:[Options,Events,TPH.DataSet],
	options:{
		classes:{
			container:'formFields',
			list:'fieldList'
		},
		containerTag:'div',
		fields:{}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = new Element(this.options.containerTag).injectInside(container);
		if ($defined(this.options.container)) {
			for(key in this.options.container) {
				this.container.set(key,this.options.container[key]);
			}
		}
		this.fields = new Hash();
		this.setFields();
	}
});

TPH.Form = new Class({
	Extends:TPH.DataContainer,
	options:{
		classes:{
			container:'formFields',
			list:'fieldList'
		},
		container:{
			method:'post',
			action:'.'
		},
		containerTag:'form',
		fields:{}
	},
	initialize:function(container,options){
		this.parent(container,options);
	}
});

TPH.window = new Class({
	Implements:[Options,Events],
	options:{
		'overlayOpacity':0.7,
		'windowClass':'tphWindow',
		'captionClass':'tphWindowCaption',
		'contentClass':'tphWindowContent',
		'contentContainerClass':'tphWindowContentContainer',
		'contentBlockClass':'tphWindowContentBlock',
		'reloaderClass':'tphContentReload',
		'size':{
			'width':250,
			'height':300
		},
		'closable':true,
		'closeOnOverlay':true,
		'caption':'',
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
		this.overlay = new Element('div',{'class':'tphOverlay'}).setStyles({opacity:this.options.overlayOpacity,'z-index':this.index}).injectInside(window.document.body);
		this.window = new Element('div',{'class':this.options.windowClass,'styles':{'z-index':this.index}}).injectInside(window.document.body);
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
		this.caption = new Element('span').setHTML(this.options.caption).injectInside(this.captionContainer);
								
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
			this.content.setHTML(this.options.content);
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
				'handle':this.captionContainer,
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
			'resize':function(){
				//this.adjustOverlay.debounce(this);
			}.bind(this)
				
		});
		this.adjustOverlay();
		this.fireEvent('create',[this]);
		this.fireEvent('beforeOpen',[this]);
		this.fireEvent('open',[this]);
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
	setSize:function(size){
		this.options.size = size;
		return this.setStyles(size);
	},
	setStyles:function(styles){
	    for(style in styles){
	        if (!['left','top','right','bottom'].contains(style)) {
	            this.content.setStyle(style,styles[style]);
	        }
	    }
		this.toCenter();
		return this;
	},
	reload:function(){
		this.reloader.fireEvent('click');
	},
	loadURL:function(url,data,contentLoader){
		if ($defined(this.contentRequest)) {
			if (this.contentRequest.isRunning()) {
				this.contentRequest.cancel();				
			}
		}
		var data = $pick(data,{});
		this.fireEvent('onBeforeLoad',[data,this]);
		var contentLoader = $pick(contentLoader,true);
		var onComplete = function(html){
			var setContent = $pick(this.options.setContent,true);
			if (setContent) {
				this.content.setHTML(html);
			}
			
			TPH.window.scanContainer(this.content);
			this.stopSpin();
			this.fireEvent('complete',[html,this]);
		}.bind(this);
		var onRequest = function(){
			this.startSpin();
			this.fireEvent('request',[this]);
		}.bind(this);
		var onFailure = function(){
			TPH.Connectivity.noConnection();
			this.stopSpin();
			this.fireEvent('failure',[this]);
		}.bind(this);
		this.contentRequest = new TPH.Ajax({
			url:url,
			data:data,
			onComplete:onComplete,
			onRequest:onRequest,
			onFailure:onFailure
		}).request();
	},
	toCenter:function(morph){
		if (!this.visible) return;
		var screenSize = window.getSize();
		var windowSize = this.window.getSize();
		var params = {
			'left':screenSize.scroll.x+screenSize.size.x-((screenSize.size.x+windowSize.size.x)/2).round(),
			'top':screenSize.scroll.y+screenSize.size.y-((screenSize.size.y+windowSize.size.y)/2).round()
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
		this.content.setHTML(html);
		return this;
	},
	setCaption:function(caption){
		this.caption.setHTML(caption);
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
		this.window.set('morph',{duration:'short',onComplete:function(){
			this.overlay.set('morph',{duration:'short',onComplete:function(){
				this.window.set('morph',{onComplete:$empty}).setStyle('display','none');
				this.overlay.set('morph',{onComplete:$empty}).setStyle('display','none');
				if ($defined(onClose))
					onClose(this);
				this.fireEvent('close',[this]);
				this.visible = false;
				this.window.setStyle('display','none');
			}.bind(this)}).morph({'opacity':0});
		}.bind(this)}).morph({'opacity':0});
		return this;
	},
	open:function(onOpen){
		if (this.visible) return this;
		this.fireEvent('onBeforeOpen',this);
		this.window.setStyle('display','');
		this.overlay.set('morph',{duration:'short',onComplete:function(){
			this.window.set('morph',{duration:'short',onComplete:function(){
				this.window.set('morph',{onComplete:$empty});
				this.overlay.set('morph',{onComplete:$empty});
				this.adjustOverlay(true);
				this.visible = true;
				if ($defined(onOpen))
					onOpen(this);
				
				this.fireEvent('open',[this]);
				
			}.bind(this)}).setStyle('display','block').morph({'opacity':1});
		}.bind(this)}).setStyle('display','block').morph({'opacity':this.options.overlayOpacity});
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
		this.reloader.addClass('loading');
		this.fireEvent('onStartSpin',[this]);
	},
	stopSpin:function(){
		this.contentContainer.removeClass('loading');
		this.reloader.removeClass('loading');
		this.fireEvent('onStopSpin',[this]);
	}
});
$extend(TPH.window,{
	scanContainer:function(container){
		container.getElements('a.window').each(function(el){
			el.addEvent('click',function(e){
				new Event(e).stop();
				var options = Json.evaluate(el.get('rel'));
				new TPH.window(options);
			});
		});
	},
	PhotoBox:new Class({
		Implements:[Events,Options],
		options:{
			autoSize:false
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
						var e = new Event(e).stop();
						
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
				draggable:this.options.autoSize,
				onCreate:function(modal){
					if (!this.options.autoSize) {
						modal.window.setStyles({
							position:'absolute',
							left:'10%',
							right:'10%',
							top:'10%',
							height:'auto'
						});
						modal.content.setStyles({width:'',height:'auto','text-align':'center'});
						
					}
					modal.contentContainer.setStyle('padding',0);
					modal.content.addClass('container');
					//modal.captionContainer.injectInside(modal.contentContainer);
				}.bind(this),
				onBeforeOpen:function(modal){
					modal.toTop();
					modal.content.empty().addClass('loading');
				}.bind(this),
				onOpen:function(modal){
					modal.setCaption(this.photoURL);
					modal.content.removeClass('loading');
					//modal.content.empty(); //.adopt(new Element('img',{src:this.photoURL,width:'100%'})); 
					
					this.image = new Asset.image(this.photoURL,{
						onload:function(e){				
							var img = $(e).injectInside(modal.content);		
							if (this.options.autoSize) {
								var size = img.getSize();
								var size = {width:size.x,height:size.y};
								modal.setSize(size).toCenter();
								modal.captionContainer.setStyle('width',size.width);
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
	initialize:function(params){
		this.params = params;
		this.tools = new Hash();
		this.scanContainer();
		TPH.Tools.instance = this;
	},
	scanContainer:function(container){
		var container = $pick(container,$(window.document.body));
		
		container.getElements('.tphTool').each(function(item){
			var rel = item.getProperty('rel');
			if ($defined(rel)) {
				if (this.tools.hasKey(rel)) {
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
			new Event(e).stop();
			this.handleTool(el);
		}.bind(this));
	},
	setStatus:function(status){
		this.status = status;
	},
	addTrigger:function(el){
		el.addEvent('click',function(e){
			new Event(e).stop();
			this.handleTool(el);
		}.bind(this));
	},
	handleTool:function(el){
		this.fireEvent('onBeforeOpen',[this]);
		
		if (!this.status) return;
		var data = $merge(this.options.params,{layout:this.id});
		var modal = this.getModal();
		
		var options = {
			data:data,
			url:this.options.toolUrl,
			closeOnOverlay:false,
			onComplete:function(){
				this.fireEvent('open');
			}.bind(this),
			onCreate:function(){
				this.fireEvent('create');
			}.bind(this),
			onFailure:function(){
				this.fireEvent('failure');
			}.bind(this),
			onRequest:function(){
				if ($defined(modal)) {
					var coords = modal.content.getCoordinates();
					modal.setSize(coords);
					//modal.setContent('');
				}
				this.fireEvent('request');
			}.bind(this),
			onReload:function(options){
				this.fireEvent('beforeLoad',[modal.options]);
			}.bind(this),
			onBeforeClose:function(win){
				this.fireEvent('onBeforeClose',[this]);
			}.bind(this)
		};
		
		if (!$defined(modal)) {
			this.fireEvent('beforeLoad',[options,el]);
			var modal = new TPH.window(options);
			modal.addEvents({
				'onBeforeOpen':function(modalWindow){
						modalWindow.doOpen = this.status;
						modalWindow.toTop();
				}.bind(this)
			});
			this.element.store('modal',modal);
		} else {
			modal.options.data = data;
			modal.open(function(){
				this.fireEvent('beforeLoad',[options,el]);
				modal.options.data = options.data;				
				modal.loadURL(options.url,options.data);
			}.bind(this));
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
		evalResponse:true,
		notices:{
			noConnection:true
		},
		cancelUnload:false,
		retryOnFail:false,
		container:null
	},
	initialize:function(options){
		this.setOptions(options);
		if ($defined(this.options.container)) {
			this.container = document.id(this.options.container);
		}
		var onComplete = function(html){
			this.onComplete(html);
			this.postComplete();
		}.bind(this);
		var onRequest = function(){
			this.fireEvent('request',[this]);
		}.bind(this);
		var onFailure = function(){
			if (this.options.retryOnFail) {
				this.request();	
			} else {
				if (this.options.notices.noConnection) {
					$pick(this.options.noConnection,TPH.Connectivity.noConnection)();
				}
				this.fireEvent('failure');	
			}
		}.bind(this);
		this.buildRequest({onComplete:onComplete,onRequest:onRequest,onFailure:onFailure});
		if (this.options.cancelUnload){
			window.addEvent('unload',function(){
				this.cancel();
			}.bind(this));
		}
	},
	buildRequest:function(options){
		var options = $merge({data:this.options.data},options);
		this.fireEvent('build',[options]);
		this.req = new Ajax(this.options.url,options);
	},
	request:function(){
		this.req.request();
		window.addEvent('unload',function(e){
		    if (this.isRunning()) {
                this.cancel();
            }
		}.bind(this));
		return this;
	},
	onComplete:function(html){
		if ($defined(this.container)){
			this.container.set('html',html);
		}
		this.fireEvent('complete',[html]);		
	},
	postComplete:function(){
		this.fireEvent('onPostComplete',[this]);
		window.fireEvent('postAjax',[this]);
	},
	isRunning:function(){
		if ($defined(this.req)) {
			return this.req.running;
		} 
		return false;		
	},
	cancel:function(){
		if (this.req.running) {
			this.req.cancel();
		}		
		return this;
	}
});

TPH.Json = new Class({
	Extends:TPH.Ajax,
	onComplete:function(html){
		try {
			var data = Json.evaluate(html);
		} catch(e) {};
		if ($defined(data)){
			this.parent(data); 
		} else {
			TPH.Connectivity.invalidResponse(html);
			this.fireEvent('failure');
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
        this.fireEvent('build',[options]);
        this.req = new Ajax(this.options.url,options);
    }	
});

TPH.JsonForm = new Class({
	Extends:TPH.AjaxForm,
	onComplete:function(html){
		try {
			var data = Json.evaluate(html);
		} catch(e) {};		
		if ($defined(data)){
			this.parent(data); 
		} else {
			TPH.Connectivity.invalidResponse(html);
			this.fireEvent('failure');
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
		subtmitURL:'.',
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
		listMethod:'ajax',
		submitMethod:'json'
	},
	status:true,
	initialize:function(options){
		this.setOptions(options);
		this.fireEvent('onCreate',[this]);
		this.initializeTool();
		this.initializeList();
	},
	getTool:function(){
		this.tool = TPH.Tools.instance.getTool(this.options.tool);
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
				onBeforeOpen:function(instance){
					this.fireEvent('onBeforeOpen',[this,instance]);
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
					} else if ($defined(TPH.token)) {
						options.data[TPH.token]=1;
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
		this.container = $(this.options.container);
		if ($defined(this.container)) {
		    this.container.addClass('ajaxContainer');
		    this.options.listURL = '.';
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
			this.listRequest = new TPH[this.options.listMethod.ucfirst()]({
				url:this.options.listURL,
				data:this.options.list,
				onComplete:function(data){
					switch(this.options.listMethod.ucfirst()){
						case 'Ajax':
							if ($defined(this.container) && this.options.loadList) {
								this.container.set('html',data);
								this.fireEvent('onBeforeInitializeList',[this,data]);
								TPH.Tools.instance.scanContainer(this.container);
								var tips = this.container.getElements('.hasTip');
								if ($defined(Tips.instance)) {
									Tips.instance.parseTitle(tips);
									Tips.instance.attach(tips);
								} else {
									Tips.instance = new Tips(tips);
								}
								
								this.container.getElements('a.'+this.options.classes.$page).each(function(page){									   
								    page.addEvent('click',function(e){
								        new Event(e).stop();
								        this.options.listURL = page.get('href');
								        this.listRequest = null;
								        this.loadList();
								    }.bind(this));
								}.bind(this));
								
								this.fireEvent('onAfterInitializeList',[this,data]);								
							}															
							break;
						case 'Json':
							this.fireEvent('onInitializeList',[this,data]);
							break;
					}
					this.container.removeClass('loading');		
					if ($defined(onSuccess)) {
						onSuccess();
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
				}.bind(this),
				onRequest:function(){
					this.container.addClass('loading');
					this.fireEvent('onRequestList',[this]);
				}.bind(this)
			}).request();
		}
		return this;
	},
	getModal:function(){
		this.modal = this.getTool().getModal();
		return this.modal;
	},
	loadModal:function(){
		this.getModal();

		this.modal.setSize(this.options.size);
		this.modal.setCaption(this.options.caption);
		
		var tips = this.modal.content.getElements('.hasTip');
		if (!$defined(Tips.instance)) {
			Tips.instance = new Tips(tips);
		} else {
			Tips.instance.parseTitle(tips);
			Tips.instance.attach(tips);
		}
		
		if (!$defined(this.form)) {
			this.form = $(window.document[this.options.form]);
			
			if ($defined(this.form)) {
				this.form.addEvents({
				   submit:function(e){
				       new Event(e).stop();
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
						new Event(e).stop();
						this.save(save);
					}.bind(this));
				}.bind(this));
				
				this.form.getElements('.'+this.options.classes.$close).each(function(close){
				    close.addEvent('click',function(e){
				        new Event(e).stop();
				        this.modal.close();
				    }.bind(this));
				}.bind(this));
				
			}
		}	
		this.fireEvent('loadModal',[this.modal,this]);
		window.fireEvent('onLoadTool',[this.options.tool,this.modal.this]);
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
				
				for(option in options){
				    data.data[option] = options[option];							
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
								this.loadList();
								if (this.options.autoClose) {
									this.modal.close();
								}
								
								if ($defined(this.options.messages.success)) {
									TPH.alert(this.options.caption,this.options.messages.success,this.options.onSuccess);
								} else if ($defined(this.options.onSuccess)){
									this.options.onSuccess();
								} else if ($defined(data.message)) {
									TPH.alert($defined(data.caption)?data.caption:this.options.caption,data.message);
								}
								
														
								window.fireEvent('onToolUpdate',[this.options.tool,data]);
							}						
						} else {
							TPH.alert(this.options.caption,data.message);
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
		TPH.Tools.instance.removeTool(this.options.tool);
	}
});

TPH.Table = new Class({
	Implements:[Options,Events],
	options:{
		classes:{
			table:'table',
			fixed:'fixed',
			columns:'columns',
			column:'column',
			header:'header',
			cell:'cell',
			content:'content',
			element:'element',
			object:'object'
		},
		columns:10,
		rows:10
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = $(container).addClass(this.options.classes.table);
		
		this.createTable();
		
		this.fireEvent('onCreate',[this]);
		/*
		if (!$defined(TPH.Tables)) {
			window['TPHTables'] = new Array();
		}
		window['TPHTables'].push(this);
		*/
		window.addEvent('resize',function(){
			this.adjustSize.debounce(this);
		}.bind(this));
		//this.coords = this.getCoordinates();
		this.size = this.getSize();
		this.adjustSize.debounce(this); // delay execution
		this.checkSize();
	},
	checkSize:function(){
		var size = this.getSize();
		if (size.x!=this.size.x || size.y!=this.size.y || size.scrollSize.x!=this.size.scrollSize.x || size.scrollSize.y!=this.size.scrollSize.y) {
			this.fireEvent('onResize',[this.size,size,this]);
			this.size = $merge(size,{});
		}
		//this.checkSize.delay(100,this);
	},
	checkSize_:function(){
		var coords = this.getCoordinates();
		if ((coords.width!=this.coords.width) || (coords.height!=this.coords.height)) {
			this.fireEvent('onResize',[this.coords,coords,this]);
			this.coords = $merge(coords,{});
		}
		
		this.checkSize.delay(100,this);
	},
	createTable:function(){
		var events = {
			onCreateColumn:function(column) {
				this.fireEvent('onCreateColumn',[column]);
			}.bind(this),
			onResizeColumn:function(column){
				this.fireEvent('onResizeColumn',[column]);
			}.bind(this),
			onCreateCell:function(cell,column){
				this.fireEvent('onCreateCell',[cell,column]);
			}.bind(this),
			onClickCell:function(cell,column){
				this.fireEvent('onClickCell',[cell,column]);
			}.bind(this),
			onMouseEnterCell:function(cell,column){
				this.fireEvent('onMouseEnterCell',[cell,column]);
			}.bind(this),
			onMouseLeaveCell:function(cell,column) {
				this.fireEvent('onMouseLeaveCell',[cell,column]);
			}.bind(this)
		};
		this.columns = new TPH.Table.Columns(this,events);
		switch($type(this.options.columns)) {
			case 'array':
				this.options.columns.each(function(column){
					this.createColumn(column);
				}.bind(this));
				break;
			case 'number':
				break;
		}
		switch($type(this.options.rows)) {
			case 'array':
				this.options.rows.each(function(cells){
					this.createRow(cells);
				}.bind(this));
				break;
			case 'number':
				this.addRows(this.options.rows);
				break;
		}
	},
	addRows:function(rows){
		for(var r=0;r<rows;r++) {
			this.createRow();
		}
	},
	createRow:function(data){
		var data = $pick(data,[]);
		
		this.columns.getColumns().each(function(column,index){
			var cell = column.createCell($pick(data[index],null));
		}.bind(this));
	},
	getRow:function(index){
		var row = new Array();
		this.columns.getColumns().each(function(column){
			row.push(column.getCell(index));
		}.bind(this));
		return row;
	},
	createColumn:function(data){
		this.columns.createColumn(data);
	},
	getColumn:function(index){
		return this.columns.getColumn(index);
	},
	getCell:function(col,row){
		return this.getColumn(col).getCell(row);
	},
	setRowHeight:function(row,height){
		this.columns.getColumns().each(function(column){
			column.setCellHeight(row,height);
		});
	},
	adjustSize:function(){
		if (!this.resizing) {
			this.resizing = true;
			var parent = this.container.getParent();
			var height = parent.getCoordinates().height-parent.getStyle('padding-top').toInt()-parent.getStyle('padding-bottom').toInt();
			this.container.setStyle('height',height);
			this.resizing = false;
		}
	},
	getCoordinates:function(){
		var coords = this.container.getCoordinates();
		//coords.width -= this.container.getStyle('border-left-width').toInt()-this.container.getStyle('border-right-width').toInt();
		//coords.height -= this.container.getStyle('border-top-width').toInt()-this.container.getStyle('border-bottom-width').toInt(); 
		return coords;
	},
	getSize:function(){
		var size = this.container.getSize(this.container.getParent());
		return size;
	},
	reset:function(){
		this.columns.destroy();
		this.columns = null;
		
		this.container.empty();
		this.fireEvent('onReset',[this]);
		//this.createTable();
		return this;
	}
});
TPH.Table.Columns = new Class({
	Implements:[Options,Events],
	columns:new Array(),
	scrolling:false,
	elements:new Hash(),
	initialize:function(table,options){
		this.setOptions(options);
		this.table = table;
		this.container = new Element('div',{'class':this.table.options.classes.columns}).injectInside(this.table.container);
		this.table.container.addEvents({
			/*
			'touchmove':function(e){
				this.handleScroll();
			}.bind(this),
			'touchend':function(e){
				this.handleScroll();
			}.bind(this),
			'touchstart':function(e){
				this.handleScroll();
			}.bind(this),
			*/
			'scroll':function(e){
				//alert('scroll');
				this.handleScroll.debounce(this);
			}.bind(this)
		});
	},
	createColumn:function(data){
		var events = {
			onCreate:function(column){
				this.fireEvent('onCreateColumn',[column,this]);
				
			}.bind(this),
			onResize:function(column){
				this.fireEvent('onResizeColumn',[column,this]);
				//this.adjustSize();
			}.bind(this),
			onCreateCell:function(cell,column){
				this.fireEvent('onCreateCell',[cell,column]);
			}.bind(this),
			onClickCell:function(cell,column){
				this.fireEvent('onClickCell',[cell,column]);
			}.bind(this),
			onMouseEnterCell:function(cell,column){
				this.fireEvent('onMouseEnterCell',[cell,column]);
			}.bind(this),
			onMouseLeaveCell:function(cell,column) {
				this.fireEvent('onMouseLeaveCell',[cell,column]);
			}.bind(this)
		} ;
		var column = new TPH.Table.Column(this,$merge(data,events));
		this.columns.push(column);
		this.adjustSize();
		return column;
	},
	adjustSize:function(){
		if (!this.adjusting) {
			this.adjusting = true;
			var dynamicWidth = 0;
			var fixedWidth = 0;
			this.columns.each(function(column){
				var coords = column.getCoordinates();
				if (column.options.fixed) {
					fixedWidth += coords.width;
				} else {
					dynamicWidth += coords.width;
				}
			});
			var width = this.table.getCoordinates().width.toInt();
			
			this.container.setStyles({'width':dynamicWidth,'padding-left':fixedWidth});
			this.handleScroll.debounce(this);
			this.adjusting = false;
		}
		
	},
	handleScroll:function(){
		if (this.scrolling) {
			this.handleScroll.debounce(this);
			return;
		}
		this.scrolling=true;
		var size = this.table.container.getSize();
		var offset = 0;
		this.columns.each(function(column){
			if (column.options.fixed) {
				column.container.setStyles({'left':offset+size.scroll.x});
				offset += column.getCoordinates().width;
			}
		}.bind(this));
		this.scrolling=false;
	},
	getColumn:function(index){
		return this.columns[index-1];
	},
	getColumns:function(){
		return this.columns;
	},
	getCoordinates:function(){
		return this.container.getCoordinates();
	},
	destroy:function(){
		this.columns.each(function(column){
			column.destroy();
		}.bind(this));
		this.columns.empty();
		this.container.remove();
	},
	createElement:function(id,options){
		var obj = new TPH.Table.Columns.Element(this,options);
		this.elements.set(id,obj);
		return obj;
	},
	getElement:function(id){
		return this.elements.get(id);
	}
});
TPH.Table.Column = new Class({
	Implements:[Options,Events],
	options:{
		fixed:false,
		width:100
	},
	cells:new Array(),
	elements:new Hash(),
	initialize:function(columns,options){
		this.columns = columns;
		this.setOptions(options);
		
		this.buildElements();
		this.fireEvent('onCreate',[this]);
	},
	destroy:function(){
		this.cells.each(function(cell){
			cell.destroy();
		});
		this.cells.empty();
		this.elements.each(function(el){
			el.destroy();
		});
		this.elements.empty();
		this.header.destroy();
		this.container.remove();
	},
	buildElements:function(){
		this.container = new Element('div',{'class':this.columns.table.options.classes.column})
							.injectInside(this.columns.container)
							.setStyles({'width':this.options.width});
		if (this.options.fixed) {
			this.container.addClass(this.columns.table.options.classes.fixed);
		}
		this.header = new TPH.Table.Header(this,this.options.header.text,this.options.header.data);
		if ($defined(this.options.header)) {
			this.setHeader(this.options.header);
		}
	},
	createCell:function(data){
		var options = {
			onCreate:function(cell){
				this.fireEvent('onCreateCell',[cell,this]);
			}.bind(this)
		};
		
		switch($type(data)) {
			case 'object':
				$extend(options,data);
				break;
			case 'number':
			case 'string':
				options.content = data;
				break;
		}
		 
		var cell = new TPH.Table.Cell(this,options).addEvents({
			onClick:function(cell){ 
				this.fireEvent('onClickCell',[cell,this]); 
			}.bind(this),
			onMouseEnter:function(cell){
				this.fireEvent('onMouseEnterCell',[cell,this]);
			}.bind(this),
			onMouseLeave:function(cell){
				this.fireEvent('onMouseLeaveCell',[cell,this]);
			}.bind(this)
		});
		cell.index = this.cells.length+1;
		this.cells.push(cell);
		return cell;
	},
	getCells:function(){
		return this.cells;
	},
	getCell:function(index){
		return this.cells[index-1];
	},
	setCellHeight:function(index,height){
		var cell = this.getCell(index);
		if ($defined(cell)){
			cell.setHeight(height);
		}
		return this;
	},
	getCoordinates:function(){
		return this.container.getCoordinates();
	},
	setWidth:function(width){
		this.container.setStyle('width',width);
		this.fireEvent('onResize',[this]);
		this.columns.adjustSize();
	},
	getTable:function(){
		return this.columns.table;
	},
	setHeader:function(header){
		this.header.setContent(header);
	},
	createElement:function(id,options){
		var el = new TPH.Table.Column.Element(this,options);
		this.elements.set(id,el);
		return el;
	},
	getCount:function(){
		return this.cells.length;
	},
	setData:function(key,value){
		if (!$defined(this.data)) {
			this.data = new Hash();
		}
		this.data.set(key,value);
	},
	getData:function(key){
		return this.data.get(key);
	}
});

TPH.Table.Cell = new Class({
	Implements:[Options,Events],
	options:{
		classes:{
			width:'width',
			height:'height'
		}
	},
	controls:{},
	initialize:function(column,options){
		this.setOptions(options);
		this.column = column;
		this.buildElements();
		
		if ($defined(this.options.content)) {
			this.setContent(this.options.content);
		}
		
		this.fireEvent('onCreate',[this]);
	},
	destroy:function(){
		this.content.remove();
		this.container.remove();
	},
	buildElements:function(){
		this.container = new Element('div',{'class':this.column.columns.table.options.classes.cell})
							.injectInside(this.column.container)
							.addEvents({
								'click':function(e){
									new Event(e).stop();
									this.fireEvent('onClick',[this]);
								}.bind(this),
								'mouseenter':function(e){
									new Event(e).stop();
									this.fireEvent('onMouseEnter',[this]);
								}.bind(this),
								'mouseleave':function(e){
									new Event(e).stop();
									this.fireEvent('onMouseLeave',[this]);
								}.bind(this)
							})
							.store('cell',this)
							;
		this.content = new Element('div',{'class':this.column.columns.table.options.classes.content})
						.injectInside(this.container)
						.addEvents({
							'click':function(e){
									new Event(e).stop();
									this.fireEvent('onClickCellContent',[this]);									
								}.bind(this)
						});
	},
	setData:function(data){
		this.container.store('data',data);
		return this;
	},
	getData:function(){
		this.container.retrieve('data');
	},
	setContent:function(content){
		this.content.set('html',content);
		return this;
	},
	getContent:function(){
		return this.content.get('html');
	},
	getCoordinates:function(offset){
		var coords = this.container.getCoordinates($pick(offset,this.column.container));
		var border = {
			left:this.container.getStyle('border-left-width').toInt(),
			top:this.container.getStyle('border-top-width').toInt(),
			right:this.container.getStyle('border-right-width').toInt(),
			bottom:this.container.getStyle('border-top-width').toInt()
		};
		coords.left += border.left;
		coords.top += border.top;
		coords.width -=  border.left+border.right ;
		coords.height -=  border.top+border.bottom ;
		return coords;
	},
	setAlignment:function(alignment){
		this.content.setStyle('text-align',alignment);
	},
	setStyles:function(styles){
		this.content.setStyles(styles);
	},
	setHeight:function(height){
		this.container.setStyles({'height':height});
	},
	getNext:function(){
		var next = this.container.getNext('div.'+this.column.columns.table.options.classes.cell);
		if ($defined(next)) {
			var next = next.retrieve('cell');
		} else {
			var next = this.column.getCell(this.column.getCount());
		} 
		return next;
	},
	getPrevious:function(){
		var prev = this.container.getPrevious('div.'+this.column.columns.table.options.classes.cell);
		if ($defined(prev)) {
			var prev = prev.retrieve('cell');
		} else {
			var prev = this.column.getCell(1);
		} 
		return prev;
	}
});

TPH.Table.Header = new Class({
	Extends:TPH.Table.Cell,
	positioning:false,
	initialize:function(column,options){
		this.parent(column,options);
		this.column.columns.table.container.addEvents({
			'scroll':function(e){
				this.reposition();
			}.bind(this)
		});
		this.column.addEvents({
			'onResize':function(column){
				this.container.setStyle('width',column.getCoordinates().width);
			}.bind(this)
		});
		this.reposition();
	},
	destroy:function(){
		this.parent();
		for(control in this.controls) {
			this.controls[control].remove();
		}
	},
	buildElements:function(){
		this.parent();
		this.container.addClass(this.column.columns.table.options.classes.header);
		var coords = this.column.getCoordinates();
		this.container.setStyles({'width':coords.width});
		
		this.controls = {
			width : new Element('div',{'class':this.options.classes.width}).injectInside(this.container),
			height : new Element('div',{'class':this.options.classes.height}).injectInside(this.container)
		};
		this.container.makeResizable({
			modifiers:{x:'width',y:false},
			onDrag:function(dragging){
				this.column.setWidth(dragging.getWidth());
			}.bind(this)
		});
	},
	reposition:function(){
		if (this.positioning) {
			
			return;
		}
		this.positioning = true;
		var size = this.column.columns.table.container.getSize();
		this.container.setStyles({'top':size.scroll.y});
		this.column.container.setStyle('padding-top',this.getCoordinates().height);
		this.positioning = false;
	}
});

TPH.Table.Column.Element = new Class({
	Implements:[Options,Events],
	data:new Hash(),
	initialize:function(column,options){
		this.column = column;
		this.setOptions(options);
		this.container = new Element('div',{'class':this.column.columns.table.options.classes.element}).injectInside(this.column.container);
	},
	destroy:function(){
		this.container.remove();
		this.data.empty();
		this.data = null;
	},
	getElement:function(){
		return this.container;
	},
	setStyles:function(styles){
		this.container.setStyles(styles);
		return this;
	},
	setStyle:function(style,value){
		this.container.setStyle(style,value);
		return this;
	},
	getCoordinates:function(){
		return this.container.getCoordinates(this.column);
	},
	toCell:function(cell){
		this.setStyles(cell.getCoordinates());
		return this;
	},
	toCells:function(cellFrom,cellTo){
		if (!$defined(cellFrom.index)){
			cellFrom = this.column.getCell(1);
		} 
		var cellFrom = cellFrom.getCoordinates();
		
		if (!$defined(cellTo.index)) {
			cellTo = this.column.getCell(this.column.getCount());
		}
		var cellTo = cellTo.getCoordinates();
		
		var coords = {
			top:cellFrom.top,
			left:cellFrom.left,
			width:cellTo.width,
			height:cellTo.top-cellFrom.top+cellTo.height
		};
		this.setStyles(coords);
		return this;
	},
	setData:function(key,value){
		this.data.set(key,value);
	},
	getData:function(key){
		return this.data.get(key);
	}
});

TPH.Table.Columns.Element = new Class({
	Implements:[Options,Events],
	options:{
		
	},
	initialize:function(columns,options){
		this.columns = columns;
		this.setOptions(options);
		this.container = new Element('div',{'class':this.columns.table.options.classes.element}).injectInside(this.columns.container);
		this.fireEvent('onCreate',[this]);
	},
	getCoordinates:function(){
		return this.container.getCoordinates([this.table.container]);
	},
	setStyles:function(styles){
		this.container.setStyles(styles);
		return this;
	},
	setStyle:function(key,value){
		this.container.setStyle(key,value);
		return this;
	},
	getElement:function(){
		return this.container;
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
		}
	},
	initialize:function(el,options){
		this.el = el.setStyle('display','none');
		this.setOptions(options);
		this.container = new Element('select',{
			'class':this.options.classes.container
		}).injectAfter(el);
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

/*
---
script: array-sortby.js
version: 1.3.0
description: Array.sortBy is a prototype function to sort arrays of objects by a given key.
license: MIT-style
download: http://mootools.net/forge/p/array_sortby
source: http://github.com/eneko/Array.sortBy

authors:
- Eneko Alonso: (http://github.com/eneko)
- Fabio M. Costa: (http://github.com/fabiomcosta)

credits:
- Olmo Maldonado (key path as string idea)

provides:
- Array.sortBy

requires:
- core/1.3.0:Array

...
*/

(function(){

	var keyPaths = [];

	var saveKeyPath = function(path) {
		keyPaths.push({
			sign: (path[0] === '+' || path[0] === '-')? parseInt(path.shift()+1) : 1,
			path: path
		});
	};

	var valueOf = function(object, path) {
		var ptr = object;
		path.each(function(key) { ptr = ptr[key]; });
		return ptr;
	};

	var comparer = function(a, b) {
		for (var i = 0, l = keyPaths.length; i < l; i++) {
			aVal = valueOf(a, keyPaths[i].path);
			bVal = valueOf(b, keyPaths[i].path);
			if (typeof valueOf(a, keyPaths[i].path) == 'string' && typeof valueOf(b, keyPaths[i].path) == 'string'){
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
			if (aVal > bVal) return keyPaths[i].sign;
			if (aVal < bVal) return -keyPaths[i].sign;
		}
		return 0;
	};

	Array.implement('sortBy', function(){
		keyPaths.empty();
		Array.each(arguments, function(argument) {
			switch (typeof(argument)) {
				case "array": saveKeyPath(argument); break;
				case "string": saveKeyPath(argument.match(/[+-]|[^.]+/g)); break;
			}
		});
		return this.sort(comparer);
	});

})();

/*
---
description: A MooTools plugin that automatically map mouse events to touch events

license: MIT-style

authors:
- Chi Wai Lau (http://tabqwert.com)
- Scott Kyle (http://appden.com)

requires:
- core/1.2.4: '*'

provides: [Mouse2Touch]
...
*/
(function() {
  try {
    document.createEvent("TouchEvent");
  } catch(e) {
    return;
  }

  ['touchstart', 'touchmove', 'touchend'].each(function(type){
      Element.NativeEvents[type] = 2;
  });

  var mapping = {
    'mousedown': 'touchstart',
    'mousemove': 'touchmove',
    'mouseup': 'touchend'
  };

  var condition = function(event) {
    var touch = event.event.changedTouches[0];
    event.page = {
      x: touch.pageX,
      y: touch.pageY
    };
    return true;
  };

  for (var e in mapping) {
    Element.Events[e] = {
      base: mapping[e],
      condition: condition
    };
  }
})();

String.implement({
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
	_parseQueryString: function(decodeKeys, decodeValues){
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
            self.apply(context, args);
        }).delay(timeout || 100);
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
										new Event(e).stop();
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

var TagContainer = new Class({
	Implements:[Events,Options],
	options:{
		selector:'TagWords'
	},
	initialize:function(container,options){
		this.setOptions(options);
		
		this.container = $pick($(container),$(window.document.body));
		this.container.getElements('.'+this.options.selector).each(function(el){
			new TagContainer.Tags(el,{
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
			});
		}.bind(this));
	}
});

TagContainer.Tags = new Class({
	Implements:[Events,Options],
	options:{
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
					new Event(e).stop();
					this.addTag(editor.getValue());
				}
				this.fireEvent('onKeyUp',[e,editor,this]);
			}.bind(this),
			onKeyDown:function(e,editor){
				if ([','].contains(e.event.key)) {
					new Event(e).stop();
					this.addTag(editor.getValue());
				}
				this.fireEvent('onKeyDown',[e,editor,this]);
			}.bind(this),
			onBlur:function(e,editor){
			    this.addTag(editor.getValue());
			    this.fireEvent('onBlur',[e,editor,this]);
			}.bind(this)
		});
		
		var preset = this.el.get('value').split(',');
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
		this.el.set('value',this.tags.getKeys().join(','));
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

var TPHBrowser = new Class({
	Implements:[Options,Events],
	options:{
		selectors:{
			browserData:'browserData'
		},
		elements:{
			browserPreview:'browserPreview'
		},
		dummyText:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse nec pulvinar quam. Mauris pellentesque quam in mauris aliquam rutrum. Morbi tempor accumsan sapien, laoreet volutpat eros tristique non. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
		dummyList:[
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			'Nulla dapibus leo at nisl pulvinar, ut lacinia velit mollis.',
			'Nam dictum dui eu dictum accumsan.',
			'Integer luctus nisi vitae mauris imperdiet blandit.',
			'Sed sagittis velit eu tellus egestas blandit.',
			'Suspendisse sed magna mollis, bibendum lectus ut, euismod justo.'
		]
	},
	elements:{},
	fields:{},
	cache:{},
	initialize:function(plugin,options){
		this.plugin = plugin;
		this.setOptions(options);
		if ($defined(TPH.Browser.Instance)) {
		    this.browser = TPH.Browser.Instance;
		    this.browser.addEvents({
		        onSelect:function(file){                    
                    this.fields['src'].set('value',file.url);
                    this.preview('src');
                    this.fields['alt'].set('value',file.name);
                }.bind(this)
		    });
		} else {
		    this.browser = new TPH.Browser({
                onSelect:function(file){                    
                    this.fields['src'].set('value',file.url);
                    this.preview('src');
                    this.fields['alt'].set('value',file.name);
                }.bind(this)
            });
		      
		}
		
		
		this.reset();
		 		
		this.plugin.on('show',function(e){			
			TPH.Tools.instance.scanContainer(this.container);			
			TPH.windowIndex = e.sender.parts.dialog.$.getStyle('z-index')+1;			
			
			TPH.Tools.instance.scanContainer(e.sender.parts.dialog.$);
			this.browser.initializeTool();
			this.browser.reset();
		}.bind(this));			
				
		 		
	},
	reset:function(){
		
		this.container = this.plugin.parts.contents.$;
		
		for(elName in this.options.elements){
			this.elements[elName] = this.plugin.parts.contents.$.getElementById(this.options.elements[elName]);
			if ($defined(this.elements[elName])) {				
				switch(elName) {
					case 'browserPreview':
						new Element('p').set('html',this.options.dummyText).injectInside(this.elements[elName]);
						this.defaultImage = TPH.$root+'/includes/images/browser/photo.png'; 
						this.previewImage = new Element('img',{src:this.defaultImage}).injectInside(this.elements[elName]);
						this.previewImage.addEvents({
							load:function(){  }.bind(this),
							error:function(){ 
								this.previewImage.set('src',this.defaultImage); 
							}.bind(this)
						});
						new Element('p').set('html',this.options.dummyText).injectInside(this.elements[elName]);
						var list = new Element('ul').injectInside(this.elements[elName]);
						this.options.dummyList.each(function(item){
							new Element('li').set('html',item).injectInside(list);
						});
						break;
				}				
			}
		}
		
		this.container.getElements('.'+this.options.selectors.browserData).each(function(el){
			var fieldName = el.get('rel');
			this.fields[fieldName] = el;
			el.addEvents({
				keydown:function(e){
					this.cache[fieldName] = e.target.get('value');
				}.bind(this),
				keyup:function(e){
					this.preview(fieldName);
				}.bind(this),
				blur:function(e){
					this.preview(fieldName);
				}.bind(this)				
			});			
			if (el.get('tag')=='select') {
				el.addEvent('change',function(){
					this.preview(fieldName);
				}.bind(this));
			}
		}.bind(this));		
	},
	clear:function(){
		for(field in this.cache) {
			this.cache[field] = '';
			this.preview(field);
		}
	},
	preview:function(fieldName){
		for(field in this.fields) {
			var value = this.fields[field].get('value');
			if (this.cache[fieldName]!=value && fieldName==field) {
				switch(field) {					
					default:
						if(fieldName=='src' && !value.length) {
							value = this.defaultImage;
						}
						this.previewImage.set(field,value);
						break;
				}
				
				this.cache[fieldName] = value;
			}
		}
	}
});

TPH.Browser = new Class({
	Extends:TPH.ToolForm,
	options:{
		caption:'<i class="fa fa-files-o"></i> Browser',
		tool:'browser',
		form:'browserform',
		size:{
			width:800
		},
		list:{
			view:'browse',
			layout:'files',
			format:'raw'
		},
		pathContainer:'pathContainer'		
	},
	currentFolder:'',
	currentFile:'',
	initialize:function(options){
		this.parent($merge(options,{
			list:{
				option:TPH.$component
			}
		}));
		this.addEvents({
			onLoadModal:function(modal){
				
				modal.contentContainer.setStyle('padding',0);
								
				if ($defined(Tips.instance)) {
					Tips.instance.tip.setStyle('z-index',TPH.windowIndex);
				}
				
				this.pathContainer = this.modal.content.getElementById(this.options.pathContainer);
				
				this.reset();
				TPH.Tools.instance.scanContainer(modal.content);
				this.Files.initializeTool().initializeList();
				this.Folders.initializeTool().initializeList();
			}.bind(this)
		});
		
		this.Files = new TPH.Browser.Files({
			onSelect:function(file){
				this.modal.close();
				this.fireEvent('onSelect',[file]);
			}.bind(this),
			onInitializeList:function(modal,data){				
				this.pathContainer.set('html','<h2>'+data.folder.replace('\\\\','\\')+'</h2>');						
			}.bind(this)
		});
		this.Folders = new TPH.Browser.Folders({
			onSelectFolder:function(folder){
				this.Files.currentFolder = folder;				
				this.Files.loadList();
			}.bind(this),
			onDeleteFolder:function(data){
				this.Files.currentFolder = data.reload;				
				this.Files.loadList();
			}.bind(this)
		});  
		TPH.Browser.Instance = this;
	},
	reset:function(){
		this.Files.reset();
		this.Folders.reset();
	}
});

$extend(TPH.Browser,{
	Files:new Class({
		Extends:TPH.ToolForm,
		options:{
			//listURL:'.',
			caption:'<i class="fa fa-upload"></i> Upload File',
			tool:'fileupload',
			form:'fileuploadform',
			classes:{
				item:'item'
			},
			size:{
				width:600
			},
			list:{				
				option:'',
				view:'files',
				format:'raw'
			},
			params:{				
				task:'uploadfile',
				format:'raw'
			},
			container:'fileListContainer',
			listMethod:'json',
			templates:{
				item:'<li class="item">'
						+'<a class="listItem" href="{url}" data-path="{path}" data-name="{name}"><img src="{url}"/><span>{name}</span></a>'
						+'<div class="column controls align_center">'							
							+'<a class="dataicon view_item photoBox" href="{url}" rel="{name}"></a>'							
							+'<span class="dataicon thrash_item tphTool" rel="filedelete" data-id="{path}"></span>'							
						+'</div>'
					+'</li>',
				list:'<ul class="fileList">{items}</ul>',
				uploadPreview:'<img src="{medium}" width="100%"/><input type="hidden" name="data[id]" value="{id}"/>',
				sizeSelection:'<dl class="definitions"><dt>Select Photo Size(s)</dt><dd><ul>{sizes}</ul></dd></dl>',
				sizeItem:'<li><label><input type="checkbox" name="data[sizes][]" value="{size}"/>{label} ( {width}px by {height}px ) </label> <a class="photoBox" rel="{size}" href="{url}">Preview</a></li>',
				fileName:'<dl class="definitions">'
							+'<dt>FileName</dt>'
							+'<dd><input type="text" class="fullWidth" name="data[filename]" value="{localname}.{localext}"/></dd>'
							+'<dt>Target Folder</dt>'
							+'<dd>{currentFolder}<input type="hidden" name="data[folder]" value="{currentFolder}"/></dd>'
						+'</dl>'
						
			},
			ids:{
				uploadPhotoContainer:'uploadPhotoContainer',
				photoConversion:'photoConversion'
			}
		},
		elements:{},
		currentFolder:'\\',		
		initialize:function(options){
			this.parent($merge(options,{
				//listURL:TPH.$base,
				list:{
					option:TPH.$component
				},
				params:{
					option:TPH.$component
				}
			}));
			this.addEvents({
				onBeforeLoadList:function(options,el){
					options.folder = this.currentFolder;
				}.bind(this),
				onInitializeList:function(modal,data){		
					if (data.status) {
						this.buildList(data.items);						
					} else {
						this.container.set('html','');
					}							
				}.bind(this),
				onLoadModal:function(modal){
					for(id in this.options.ids) {
						this.elements[id] = modal.content.getElementById(this.options.ids[id]);
						if ($defined(this.elements[id])) {
							switch(id){								
							}
						}
					}
					new FileUploader.Photo(modal.content,{
						onRequest:function(){
							this.elements.uploadPhotoContainer.empty().addClass('loading');
							this.elements.photoConversion.empty().addClass('loading');
						}.bind(this),
						onComplete:function(data){
							data.currentFolder = this.currentFolder;
							this.elements.uploadPhotoContainer.set('html',this.options.templates.uploadPreview.substitute(data)).removeClass('loading');
							var sizes = new Array();
							data.sizes.each(function(size){
								sizes.push(this.options.templates.sizeItem.substitute({
									size:size,
									label:size.ucfirst(),
									width:data[size+'_size'].width,
									height:data[size+'_size'].height,
									url:data[size]
								}));
							}.bind(this));
							this.elements.photoConversion.set('html',this.options.templates.sizeSelection.substitute({sizes:sizes.join('')})+this.options.templates.fileName.substitute(data)).removeClass('loading');
							if (!$defined(this.photoPreview)) {
								this.photoPreview = new TPH.window.PhotoBox(this.elements.photoConversion,{
														autoSize:true,
														onOpen:function(modal,instance){
															modal.setCaption(instance.lastElement.get('rel').ucfirst());
														}.bind(this)
													});
							} else {
								this.photoPreview.scanContainer(this.elements.photoConversion);
							}							
						}.bind(this)
					});
				}.bind(this)
			});
			this.deleteFile = new TPH.Browser.Files.Delete({
				onDelete:function(data){
					this.loadList();
				}.bind(this)
			});
		},
		buildList:function(files){
			var items = new Array();
			files.each(function(file){
				items.include(this.options.templates.item.substitute(file));
			}.bind(this));
			this.container.set('html',this.options.templates.list.substitute({items:items.join('')}));
			TPH.Tools.instance.scanContainer(this.container);
			this.deleteFile.initializeTool().initializeList();
			
			if (!$defined(this.photoPreview)) {
				this.photoPreview = new TPH.window.PhotoBox(this.container,{
					autoSize:true,				
					onOpen:function(modal,instance){
						modal.setCaption(instance.lastElement.get('rel').ucfirst());
					}.bind(this)
				}); 
			} else {
				this.photoPreview.scanContainer(this.container);
			}
			
			this.container.getElements('a.listItem').each(function(el){
				el.addEvent('click',function(e){
					var e = new Event(e).stop();
					this.fireEvent('onSelect',[{
						url:el.get('href'),
						path:el.get('data-path'),
						name:el.get('data-name')
					}]);
				}.bind(this));
			}.bind(this));			
		},
		reset:function(){
			this.currentFolder = '\\';
		}
	}),
	Folders:new Class({
		Extends:TPH.ToolForm,
		options:{
			//listURL:'.',
			caption:'<i class="fa fa-folder"></i> Create Folder',
			tool:'foldercreate',
			form:'foldercreateform',
			classes:{
				tree:'tree'
			},
			params:{				
				task:'createfolder',
				format:'raw'
			},
			list:{				
				view:'folders',
				format:'raw'
			},
			container:'folderListContainer',
			listMethod:'json',
			templates:{
				item:'<div class="treeItem">'
						+'<div class="float_left">'
							+'<a href="#">{name}</a>'
						+'</div>'
						+'<div class="column align_right">'
							+'<span class="control dataicon folder_edit cursor pointer tphTool" rel="folderrename" data-id="{path}"></span>'
							+'<span class="control dataicon folder_delete cursor pointer tphTool" rel="folderdelete" data-id="{path}"></span>'
						+'</div>'
					+'</div>'
					
			}
		},
		currentFolder:'\\',
		currentFolderEl:null,
		initialize:function(options){
			this.parent($merge(options,{
				//listURL:TPH.$base,
				list:{
					option:TPH.$component
				},
				params:{
					option:TPH.$component
				}
			}));
			this.addEvents({
				onBeforeLoadList:function(options,el){
					options.folder = this.currentFolder;
				}.bind(this),
				onInitializeList:function(modal,data){		
					this.buildList(data.items);					
				}.bind(this),
				onFormComplete:function(data){
					
				}.bind(this),
				onBeforeLoadModal:function(options,rel){					
					options.data.folder = this.currentFolder;					
				}.bind(this)
			});
			
			this.deleteFolder = new TPH.Browser.Folders.Delete({
				onFormComplete:function(data,instance){					
					if (data.status) {						
						this.currentFolder = data.reload; 
						this.currentFolderEl = this.folders.get(data.reload).addClass('active');						
						this.listRequest = null;
						this.loadList();
						
						this.fireEvent('onDeleteFolder',[data]);
					}
					
				}.bind(this)
			});
			this.renameFolder = new TPH.Browser.Folders.Rename({
				onFormComplete:function(data,instance){
					instance.lastElement.set('data-id',data.path);
					instance.lastElement.getParent().getParent().getElement('a').set('html',data.folder);
				}.bind(this)
			});
		},
		initializeList:function(){
			this.folders = new Hash();		
			return this.parent();
		},
		buildList:function(folders){
			if ( this.currentFolder=='\\') {
				this.container.empty();
				var rootLabel = new Element('a',{'class':'root',href:'#'}).set('html','root').addEvent('click',function(e){
					new Event(e).stop();
					this.currentFolder = '\\';						
					this.currentFolderEl = e.target.getParent().addClass('active');
					this.listRequest = null;
					this.loadList();
					this.fireEvent('onSelectFolder',['\\',this]);
				}.bind(this));
				var root = new Element('li',{'class':'active'}).injectInside(new Element('ul',{'class':this.options.classes.tree}).injectInside(this.container)).adopt(rootLabel);
				this.folders.set('\\',root);				
				this.currentFolderEl = root;		
			} else { 		
				var subs = this.currentFolderEl.getElement('ul');
				if ($defined(subs)) {
					subs.destroy();
				}				
			}
			if (folders.length) {
				var list = new Element('ul').injectInside(this.currentFolderEl);
			
				folders.each(function(folder){
					folder.element = new Element('li').injectInside(list).set('html',this.options.templates.item.substitute(folder)); 
					this.folders.set(folder.path,folder.element);
					folder.element.getElement('a')
						.addEvent('click',function(e){
							new Event(e).stop();											
							this.currentFolder = folder.path;
							this.currentFolderEl.removeClass('active');						
							this.currentFolderEl = e.target.getParent().getParent().getParent().addClass('active');
							this.listRequest = null;
							this.loadList();
							this.fireEvent('onSelectFolder',[folder.path,this]);
						}.bind(this));
				}.bind(this));
				
				TPH.Tools.instance.scanContainer(list);
				this.deleteFolder.initializeTool();
				this.renameFolder.initializeTool();
			}
			
		},
		reset:function(){
			this.currentFolder = '\\';
		}
	})
});
$extend(TPH.Browser.Files,{
	Delete:new Class({
		Extends:TPH.ToolForm,
		options:{
			caption:'<i class="fa fa-file-o"></i> Delete File',
			tool:'filedelete',
			form:'filedeleteform',
			params:{
				option:'',
				task:'deletefile',
				format:'raw'
			}
		},
		initialize:function(options){
			this.parent($merge(options,{				
				params:{
					option:TPH.$component
				}
			}));
			this.addEvents({
				onFormComplete:function(data){
					if (data.status) {
						this.fireEvent('onDelete',[data.deleted,this]);
					}					
				}.bind(this)
			});
		}
	})
});
$extend(TPH.Browser.Folders,{
	Delete:new Class({
		Extends:TPH.ToolForm,
		options:{
			caption:'<i class="fa fa-folder"></i> Delete Folder',
			tool:'folderdelete',
			form:'folderdeleteform',
			params:{
				option:'',
				task:'deletefolder',
				format:'raw'
			}
		},
		initialize:function(options){
			this.parent($merge(options,{				
				params:{
					option:TPH.$component
				}
			}));
		}
	}),
	Rename:new Class({
		Extends:TPH.ToolForm,
		options:{
			caption:'<i class="fa fa-pencil"></i> Rename Folder',
			tool:'folderrename',
			form:'folderrenameform',
			params:{
				option:'',
				task:'renamefolder',
				format:'raw'
			}
		},
		initialize:function(options){
			this.parent($merge(options,{				
				params:{
					option:TPH.$component
				}
			}));
		}
	})
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
            new Event(e).stop();
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
		$extend(this.options.params,{option:TPH.$component});
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
	send:function(file,el){
	    var formData = new FormData();
        formData.append('Filedata',file);
        formData.append('Filename',file.name);
        for(key in this.options.params){
            formData.append(key,this.options.params[key]);
        }
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
                    this.fireEvent('onComplete',[Json.evaluate(request.responseText),file,this.uploaded==this.toUpload,el,this]);    
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
            icon:'fa fa-search fa-2x color-grey',
            clear:'fa fa-times-circle cursor pointer fa-2x'
        }
    },
    initialize:function(el,options){
        this.el = $(el);
        this.setOptions(options);
        
        new Element('div',{'class':this.options.classes.container}).injectAfter(this.el).adopt(this.el);
        this.icon = new Element('i',{'class':this.options.classes.icon}).injectBefore(this.el);
        this.clear = new Element('i',{'class':this.options.classes.clear}).injectAfter(this.el).addEvent('click',function(e){
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
            extraPlugins:'tphbrowser,justify',
            allowedContent:true,             
            tabSpaces:4,           
            disallowedContent:'iframe frame head body html script',
		},
		events:{
			
		}
	},
	modes:{
		full:{
			toolbarGroups:[
                { name: 'undo'},
                
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
                { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] }
            ]
		}
	},
    initialize:function(field,options){       
        this.setOptions(options);     
        this.checkEditor();
        this.attach(field);
    },
    checkEditor:function(){
        if (!$defined(TPH.Editor.instance)) {
            TPH.Editor.instance = new Asset.javascript(TPH.$root+'/includes/js/ckeditor/ckeditor.js');   
        }            
        return this;
    },
    loadEditor:function(){
    	this.field.getParent().addClass('loading');
        if(!$defined(TPH.Editor.instance) || !$defined(window['CKEDITOR'])) {
            this.loadEditor.delay(500,this);
            return;
        } 
        var container = this.field.getParent();
        var height = $pick(this.options.height,$pick(container.get('data-height'),container.getCoordinates().height)); 
        var options = $merge(this.options.editor,this.modes[this.options.mode]);
        
        CKEDITOR.replace(this.field,$merge(options,{
            height:height,
            on:{
                focus:function(evt){
                    this.fireEvent('onFocus',[evt,this]);
                }.bind(this),
                change:function(evt){
                    this.fireEvent('onChange',[evt,this]);
                }.bind(this)    ,
                instanceReady:function(evt){   
                	this.field.getParent().removeClass('loading');
                    this.fireEvent('onReady',[evt,this]);
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
                    window.fireEvent('resize');
                }.bind(this),
                mode:function(evt){
                    this.fireEvent('onChangeMode',[evt.editor.mode,evt,this]);
                }.bind(this)
            }           
        }));  
    },
    updateField:function(){
        if ($defined(window['CKEDITOR'])) {
            CKEDITOR.instances[this.field.get('name')].updateElement();
        }
    },
    clear:function(){
    	for(name in CKEDITOR.instances){
		    CKEDITOR.instances[name].destroy(true);
		    CKEDITOR.remove(name);
		}
		return this;
    },
    attach:function(field){
    	this.field = document.id(field);
    	this.loadEditor();
    }
}) ;

TPH.Mapper = new Class({
	Implements:[Events,Options],
	options:{
		map:{
			zoom:12,
			center:{
				lat:10.559153, 
				lng:123.843085
			},
			width:'100%',
			height:'100%',
			styles:[
			  {
			    "featureType": "landscape.natural",
			    "elementType": "geometry.fill",
			    "stylers": [
			      { "lightness": 100 }
			    ]
			  },{
			    "featureType": "road",
			    "elementType": "labels.text.fill",
			    "stylers": [
			      { "lightness": -100 }
			    ]
			  },{
			    "featureType": "landscape",
			    "elementType": "geometry.fill",
			    "stylers": [
			      { "lightness": 100 }
			    ]
			  }
			]
		}
	},
	initialize:function(container,options){
		this.container = document.id(container);
		this.setOptions(options);
		
		if (!$defined(window['google'])) {
			console.log('No connection to Google. Skipping map functions.');
			this.fireEvent('onReady',[this]);
			return;
		}
		
		var mapTypeIds = [];
	    for(var type in google.maps.MapTypeId) {
	        mapTypeIds.push(google.maps.MapTypeId[type]);
	    }
	    if ($defined(TPH.$MapServer)) {
	    	mapTypeIds.push($pick(TPH.$MapName,"TPH"));
			this.map = new google.maps.Map(this.container, $merge(this.options.map,{
				mapTypeId: $pick(TPH.$MapName,"TPH"),
	            mapTypeControlOptions: {
	                mapTypeIds: mapTypeIds
	            }
			}));
			
			this.map.mapTypes.set($pick(TPH.$MapName,"TPH"), new google.maps.ImageMapType({
	            getTileUrl: function(coord, zoom) {
	                // See above example if you need smooth wrapping at 180th meridian
	                //var uri = new URI(TPH.$MapServer);
	                //uri.set('directory','/');
	                //uri.set('file',zoom+'/'+coord.x+'/'+coord.y+'.png');
	                //uri.set('query','zoom='+zoom+'&x='+coord.x+'&y='+coord.y);
	                //console.log(uri.toString());
	                //return uri.toString();
	                //return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
	                return TPH.$MapServer+'/'+zoom+'/'+coord.x+'/'+coord.y+'.png';
	            },
	            tileSize: new google.maps.Size(256, 256),
	            name: $pick(TPH.$MapName,"TPH"),
	            maxZoom: 18
	        }));	
	    }
	    
	        
		google.maps.event.addListenerOnce(this.map, 'idle', function(){
			this.calibrate();
		    this.fireEvent('onReady',[this]);
		}.bind(this));
		
		window.addEvent('resize',function(){
			 this.calibrate.debounce(this);
		}.bind(this));
	},
	calibrate:function(){
		var center = this.map.getCenter();
		google.maps.event.trigger(this.map, 'resize');
		this.map.setCenter(center);
	},
	createMarker:function(lat,lng,options,events){
		if (!$defined(window['google'])) {
			console.log('Unable to make marker for [ {lat},{lng} ].Google Map API not loaded.'.substitute({lat:lat,lng:lng}));
			return false;
		}
		var options = $pick(options,{});
		var events = $pick(events,{});		
		
		var marker = new google.maps.Marker(options); 
	    marker.setMap(this.map);
		marker.setPosition(new google.maps.LatLng(lat,lng));
	    var events = new Hash(events);
	    if (events.getLength()) {
	    	events.each(function(f,e){
	    		//console.log('Adding Marker Event');
	        	marker.addListener(e,function(ev){
	        		if ($defined(f)) {
	        			f(marker,ev);	
	        		}	        		
	        	});
	        }.bind(this));	
	    }
	    return marker;
	},
	createInfoWindow:function(options,events){
		var infoWindow = new google.maps.InfoWindow(options);
		if ($defined(events)) {
			for(e in events) {
				infoWindow.addListener(e,events[e]);
			}
		}
		return infoWindow;
	},
	insertElement:function(el,position){
		var position = $pick(position,'TOP_CENTER');
		this.map.controls[google.maps.ControlPosition[position]].push(el);
		return el;
	},
	getContainer:function(){
		return this.map.getDiv();
	},
	geoCode:function(id,address,onSuccess,onFailure){
		if (!$defined(this.geocoder)) {
			this.geocoder = new google.maps.Geocoder();
		}
		var address = $pick(address,this.options.address);
	    this.geocoder.geocode( { 'address': address}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {
	    		if ($defined(onSuccess)) {
	    			onSuccess(id,results[0].geometry.location);
	    		} else {
	    			this.fireEvent('onGeoCode',[id,results[0].geometry.location,this]);	
	    		}
	      	} 
	    }.bind(this));
	},
	fitMarkers:function(markers){
		var markers = $type(markers)=='object'?new Hash(markers):markers;
		var bounds = new google.maps.LatLngBounds();
		markers.each(function(marker){
			bounds.extend(marker.getPosition());
		});
		this.fit(bounds);
	},
	fit:function(bounds){
		this.map.fitBounds(bounds);
	},
	clearRoutes:function(){
		if (!$defined(this.routes)) return;
		this.routes.each(function(routeData){
			routeData.route.setMap(null);
			routeData.leg = null;
		});
		this.routes.empty();
	},
	createRoute:function(from,to,onSuccess,onFailure){
		if (!$defined(this.routes)) {
			this.routes = new Hash();
		}
		var id = [from.lat(),from.lng(),to.lat(),to.lng()].join('-');
		if (!this.routes.hasKey(id)) {
			if (!$defined(this.directionsService)) {
				this.directionsService = new google.maps.DirectionsService();	
			}
			
			var options = {
				origin:from,
				destination:to,
	    		travelMode: google.maps.TravelMode.DRIVING
			};
			
			this.directionsService.route(options,function(response,status){
				if (status == google.maps.DirectionsStatus.OK) {
					var leg = response.routes[0].legs[0];
					var route = this.drawRoute(leg);
					this.routes.set(id,{
						status:true,
						route:route,
						leg:leg,
						response:response
					});
					if ($defined(onSuccess)) {
						onSuccess(route,leg,response);
					}
		        } else {
		        	if ($defined(onFailure)) {
		        		onFailure(response,status);
		        	}
		        }
			}.bind(this));	
		} else {
			var routeData = this.routes.get(id);
			if (routeData.status) {
				routeData.route = this.drawRoute(routeData.leg);
				if ($defined(onSuccess)) {
					onSuccess(routeData.route,routeData.leg,routeData.response);
				}
			} 
		}
		
	},
	drawRoute:function(route){
		var points = new Array();
		for (var i = 0; i < route.steps.length; i++) {
	        for (var j = 0; j < route.steps[i].lat_lngs.length; j++) {
	            points.push(route.steps[i].lat_lngs[j]);
	        }
	    }
	    var routeLine = new google.maps.Polyline({
	    	path:points,
	    	strokeColor:'red',
	        	strokeOpacity:0.5,
	        	strokeWeight:3
	        });
        routeLine.setMap(this.map);
        return routeLine;
	}
});
TPH.Mapper.loadLibrary = function(onSuccess,onFailure){
	new Asset.javascript('https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places%2Cgeometry&key='+TPH.$MapKey,{
		onload:onSuccess,
		onerror:onFailure
	});
};
function $fullHeight(container){	
	var height = container.getCoordinates().height;
	var offset = container.getStyle('padding-top').toInt()+container.getStyle('padding-bottom').toInt()+container.getStyle('border-top-width').toInt()+container.getStyle('border-bottom-width').toInt();
	var els = new Array();
	var children = container.getChildren();
	children.each(function(el){
		if (!['absolute','fixed'].contains(el.getStyle('position'))) {
			if (!['svg'].contains(el.get('tag'))) {
				el.setStyle('display','');
				if (el.hasClass('fullHeight')) {
					el.getChildren().each(function(child){
						child.setStyle('display',!['absolute','fixed'].contains(child.getStyle('position'))?'none':'');
					});
					els.push(el);
				} else if (el.getStyle('display')!='none'){
					offset+=el.getCoordinates().height;
				}	
			} else {
				el.setStyle('display','');
			}	
		}
	});
	els.each(function(el){		
		el.setStyle('height',(height-offset));	
		$fullHeight(el);
	});
};
function $scan(container){
	var container = $pick(container,document.id(window.document.body));
	container.getElements('.fullHeight').setStyle('height','');
	$fullHeight(container);
};
window.addEvents({
	domready:function() { $scan.delay(100); },
	resize:function() { $scan.debounce(); },
	postAjax:function(instance){
		if ($defined(instance.container)) {
			$fullHeight(instance.container);
		}
	}
});