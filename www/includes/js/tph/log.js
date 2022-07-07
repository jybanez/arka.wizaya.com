TPH.Logger = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			container:'logger',
			log:'log',
			item:'log-item'
		}
	},
	initialize:function(container,options){
		this.container = document.id(container).addClass(this.options.classes.container);
		this.setOptions(options);
	},
	log:function(){
		var message = new Element('div',{'class':this.options.classes.log}).inject(this.container);
		var messages = new Array();
		[...arguments].each(function(arg){
			var content = ['text','number'].contains(typeOf(arg))?arg:JSON.stringify(arg, null, 4);
			new Element('div',{'class':this.options.classes.item}).inject(message).set('html',content);
		}.bind(this));	
	},
	clear:function(){
		this.container.empty();
	}
});
