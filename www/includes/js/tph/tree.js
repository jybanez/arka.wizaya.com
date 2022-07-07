
TPH.Tree = new Class({
	Implements:[Events,Options,TPH.Implementors.TemplateData],
	options:{
		listTemplate:null,
		sortKey:'name',
		primaryField:'id',
		parentField:'pid',
		childrenField:'children',
		childTag:'li'
	},
	initialize:function(container,options){
		this.setOptions(options);
        //console.log(this.options.list);
		this.attach(container);
	},
	attach:function(container){
		this.container = container;
		this.buildTree();
	},
	buildTree:function(){
		var index = {},
            ids = new Array();
		this.options.list.each(function(item){
			item[this.options.childrenField] = new Array();
			if (!$defined(item.$expanded)) {
				item.$expanded = true;
			}
			index[item[this.options.primaryField]] = item;
		}.bind(this));
		for(primaryField in index){
			var item = index[primaryField];
			if (item[this.options.parentField].toInt()) {
				if ($defined(index[item[this.options.parentField]])) {
					if (!$defined(index[item[this.options.parentField]][this.options.childrenField])) {
						index[item[this.options.parentField]][this.options.childrenField] = new Array();
					}
					index[item[this.options.parentField]][this.options.childrenField].push(item);	
				}
			}
		}
		return this.buildList();
	},
	buildList:function(){
		this.options.list.each(function(item){ 
			if (!item[this.options.parentField].toInt()) {
				this.applyItem(item);
			}
		}.bind(this));
	},
	applyItem:function(item,container){
		//console.log(item,container);
		var el = new Element(this.options.childTag).inject($pick(container,this.container));
		if ($defined(item.alias)) {
			el.set('rel',item.alias);
		}
		this.applyTemplateData(el,this.options.listTemplate,item);
		if (item.children.length) {
			el.addClass('parent');
			if ($defined(item.alias)) {
				el.addClass(item.alias);
			}
			var childrenContainer = el.getElement('.menu');
			item.children.each(function(child){
                //console.log(child);
				this.applyItem(child,childrenContainer);
			}.bind(this));
		}
	},
	addItem:function(item){
		this.options.list.push(item);
		return this.buildTree();
	},
	deleteItem:function(id){
		var count = this.options.list.length,
			found = null;
		for(var i=0;i<count;i++) {
			if (this.options.list[i][this.options.primaryField]==id) {
				found = i;
				break;
			}
		}
		if ($defined(found)) {
			this.options.list.splice(found,1);
			this.buildTree();
		}
		return this;
	},
	getData:function(){
		return this.options.list;
	}
});

TPH.TreeList = new Class({
	Extends:TPH.Tree,
	Implements:[Events,Options,TPH.Implementors.Templates],
	options:{
		separator:"<i class='fa control'></i>",
		expanded:"<i class='fa fa-minus-square control expandMarker' rel='collapsed'></i>",
		collapsed:"<i class='fa fa-plus-square control expandMarker' rel='expanded'></i>",
		icons:{
			separator:'',
			expanded:'fa fa-minus-square expandMarker',
			collapsed:'fa-plus-square expandMarker'
		},
		status:{
			separator:'',
			expanded:'collapsed',
			collapsed:'expanded'
		}
	},
	templateName:'list',
	destroy:function(){
		this.clearTemplates();
	},
	clear:function(){
		this.clearTemplate(this.templateName);
		return this;
	},
	attach:function(container){
		this.container = container;
		if (!$defined(this.options.listTemplate)) {
			this.createTemplate(this.templateName,this.container);
			var template = this.getTemplate(this.templateName);
			template.template = this.options.template;
		} else {
			this.templateName = this.options.listTemplate.name;
			this.setTemplate(this.templateName,this.options.listTemplate);
		}
		this.buildTree();
	},
	buildList:function(){
		this.fireEvent('onBeforeRender',[this.getTemplate(this.templateName),this]);
		this.clearTemplate(this.templateName).updateTemplate(this.templateName);
		this.options.list.each(function(item){ 
			if (!item[this.options.parentField].toInt()) {
				this.applyItem(item,0);
			}
		}.bind(this));
		 
		this.renderTemplate(this.templateName);
		this.fireEvent('onRender',[this]);
		return this;
	},
	applyItem:function(item,level){
		item.level = level; //this.options.separator.repeat(level);
		item.expandMarker = item[this.options.childrenField].length?(item.$expanded?this.options.expanded:this.options.collapsed):this.options.separator;
		item.markerIcon = this.options.icons[item[this.options.childrenField].length?(item.$expanded?'expanded':'collapsed'):'separator'];
		item.markerStatus = this.options.status[item[this.options.childrenField].length?(item.$expanded?'expanded':'collapsed'):'separator'];
		this.applyTemplate(this.templateName,item,function(el,template,item){
			if (item.level) {
				var content = el.getElement('.content');
				if ($defined(content)) {
					for(var i=0;i<item.level;i++) {
						new Element('span',{'class':'fa control'}).inject(content,'top');
					}	
				}
				
			}
			
			var expandMarker = el.getElement('.expandMarker');
			if ($defined(expandMarker)) {
				expandMarker.addEvent('click',function(e){
					e.stopPropagation();
					item.$expanded = !item.$expanded;
					this.buildList();
				}.bind(this));	
			}
			this.fireEvent('onRenderItem',[el,template,item,this]);
		}.bind(this));
		if (item.children.length && item.$expanded) {
			item.children.sortBy(this.options.sortKey).each(function(item){
				this.applyItem(item,level+1);
			}.bind(this));
		}
		return this;
	},
	refresh:function(){
		this.fireEvent('onBeforeRefresh',[this.getTemplate(this.templateName),this]); 
		this.updateTemplate(this.templateName);
		this.renderTemplate(this.templateName);
	}
});

TPH.TreeSelect = new Class({
	Extends:TPH.TreeList,
	options:{
		separator:' &nbsp;&nbsp;&nbsp;&nbsp;',
		displayField:'name'
	},
	attach:function(el){
		this.container = el.empty();
		this.buildTree();
	},
	buildList:function(){
		this.options.list.each(function(item){ 
			if (!item[this.options.parentField].toInt()) {
				this.applyItem(item,0);
			}
		}.bind(this));
		var value = this.container.get('data-value');
		if ($defined(value)) {
			this.container.set('value',value);	
		}
	},
	applyItem:function(item,level){
		var label = this.options.separator.repeat(level)+item[this.options.displayField];
		new Element('option',{value:item[this.options.primaryField]}).set('html',label).inject(this.container);
		if (item.children.length && item.$expanded) {
			item.children.sortBy(this.options.sortKey).each(function(item){
				this.applyItem(item,level+1);
			}.bind(this));
		}
	}
});