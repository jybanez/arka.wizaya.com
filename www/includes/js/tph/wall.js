TPH.Wall = new Class({
	Implements:[Events,Options],
	options:{
		grid:{
			//scrollbars:true,
			progress:true,
			rowHeight:100,
			colWidth:100,
			height:300,
			columns:10,
			rows:10
		},
		data:[]
	},
	z:1,
	selections:[],
	initialize:function(container,options){
		this.setOptions(options);
		this.$items = new Array();
		this.grid = new TPH.Grid(container,$merge(this.options.grid,{
			classes:{
				//container:'grid wall'
			},
			onBeforeRender:function(grid){
				if (!$defined(this.cells)) {
					this.cells = new Array();
				} else {
					this.cells.empty();
				}
			}.bind(this),
			onCellCreate:function(cell){
				cell.setOptions({
					resizers:{
						horizontal:false,
						vertical:false
					}
				});
			}.bind(this),
			onCellRender:function(cell){
				this.cells.push(cell);
			}.bind(this),
			onRender:function(grid){
				return;
			}.bind(this),
			onReady:function(grid){
				this.render();
				this.fireEvent('onReady',[this]);
			}.bind(this),
			onPanStart:function(panStart,grid){
				//console.log('pan start');
				this.fireEvent('onPanStart',[panStart,grid,this]);
			}.bind(this),
			onPanning:function(x,y,grid) {
				this.fireEvent('onPanning',[x,y,grid,this]);
			}.bind(this),
			onPanEnd:function(grid){
				this.fireEvent('onPanEnd',[grid,this]);
			}.bind(this),
			onScroll:function(x,y,grid){
				/*
				this.getItems().each(function(item){
					if (item.isMaximized()) {
						//var scroll = this.wall.grid.currentScroll,
	                    //	coords = instance.element.getCoordinates();
	                    item.element.setStyles({
	                    	//transition:'none',
	                    	//transform:'translate('+x+'px,'+y+'px)'
	                    });
					}
				}.bind(this));
				*/
				this.fireEvent('onScroll',[x,y,grid,this]);
			}.bind(this),
			onCellClick:function(row,column,cellObj,rowObj,grid){
				this.fireEvent('onCellClick',[row,column,cellObj,rowObj,grid,this]);
			}.bind(this)
		}));
		this.grid.canExplore = true;
	},
	render:function(){		
		console.log('WALL RENDER');
		this.getItems().each(function(item){
			item.render();
		}.bind(this));
	},
	hideAll:function(){
		this.getItems().each(function(item){
			item.hide();
		}.bind(this));
	},
	showAll:function(){
		this.getItems().each(function(item){
			item.show();
		}.bind(this));
	},
	toTop:function(item){
		item.setZ(this.z++);
		return this;
	},
	toBottom:function(item){
		item.setZ(0);
		return this;
	},
	addItem:function(item){
		this.options.data.push(item);
		var item = this.renderItem(item);
		this.$items.push(item);
		return item;
	},
	removeItem:function(item){
		this.$items.erase(item);
		return this;
	},
	getItems:function(){
		return this.$items;
	},
	renderItem:function(item){
		var cell = this.grid.getCell(item.row-1,item.col-1);
		if ($defined(cell)) {
			var $item = new TPH.Wall.Item(this,cell,$merge(item,{
				z:this.z++
			})).addEvents({
				onMousedown:function(e,instance){
					if (!instance.focused()) {
						//e.stop();
						//instance.focus();	
					}
				}.bind(this),
				onClick:function(e,instance){
					if (!instance.focused()) {
						//e.stop();
						instance.focus();	
					}
				}.bind(this),
				onFocus:function(instance){
					if (!this.selections.contains(instance)) {
						this.selections.each(function(item){
							item.unfocus();
						});
						this.selections.empty();
					}
					
					this.selections.include(instance);
					this.toTop(instance);
					this.fireEvent('onFocusItem',[instance,this]);
				}.bind(this),
				onUnfocus:function(instance){
					//this.selections.erase(instance);
				}.bind(this),
				onClose:function(instance){
					this.removeItem(instance);
				}.bind(this),
				onMaximize:function(instance){
					//var scroll = this.grid.currentScroll;
                    //instance.element.setStyles({
                    	//transform:'translate('+scroll.x+'px,'+scroll.y+'px)'
                    //});
				}.bind(this)
			}).render().focus();
		}
		return $item;
	}
});

TPH.Wall.Item = new Class({
	Implements:[Events,Options],
	options:{
		classes:{
			container:'wall-item',
			content:'wall-item-content',
			resize:'wall-item-resize'
		},
		size:{
			x:1,
			y:1
		},
		draggable:true,
		resizable:true
	},
	initialize:function(wall,cell,options){
		this.wall = wall;
		this.setOptions(options);
		this.cell = cell;
		if (!$defined(cell.$items)) {
			cell.$items = new Array();
		}
		cell.$items.include(this);
		this.syncCoordinates();
	},
	toCenter:function(){
		if ($defined(this.element)) {
			var el = this.element;
			if (!el.hasClass('dragging') && !el.hasClass('resizing')) {
				this.wall.grid.scroller.toElement(this.element);
			}		
		}
		return this;
	},
	/*
	toggleFocus:function(){
		this.element.toggleClass('active');
		this.fireEvent(this.element.hasClass('active')?'onFocus':'onUnfocus',[this]);
		return this;
	},
	*/
	focused:function(){
		return $defined(this.element)?this.element.hasClass('active'):false;
	},
	focus:function(){
		if ($defined(this.element)) {
			var el = this.element;
			if (!el.hasClass('dragging') && !el.hasClass('resizing')) {
				if (!el.hasClass('active')) {
					el.addClass('active');
				}	
				this.fireEvent('onFocus',[this]);	
			}
			
		}
		return this;
	},
	unfocus:function(){
		if ($defined(this.element)) {
			if (this.element.hasClass('active')) {
				this.element.removeClass('active');
				this.fireEvent('onUnfocus',[this]);	
			}	
		}
		return this;
	},
	toggleMaximize:function(){
		this.element.toggleClass('maximize');
		this.fireEvent(this.isMaximized()?'onMaximize':'onRestore',[this]);
		this.fireEvent('onResize',[this]);
		return this;
	},
	maximize:function(){
		if (!this.isMaximized()) {
			this.element.addClass('maximize');
			this.fireEvent('onMaximize',[this]);
			this.fireEvent('onResize',[this]);	
		}
		
		return this;
	},
	isMaximized:function(){
		return this.element.hasClass('maximize');
	},
	restore:function(){
		if (this.isMaximized()) {
			this.element.removeClass('maximize');
			this.fireEvent('onRestore',[this]);
			this.fireEvent('onResize',[this]);	
		}
		
		return this;
	},
	scanActions:function(container){
		container.getElements('.wallItemAction').each(function(el){
			el.addEvent('click',function(e){
				this[el.get('rel')]();	
			}.bind(this));
		}.bind(this));
		return this;
	},
	render:function(){
		if (!$defined(this.element)) {
			var classes = [this.options.classes.container];
			if ($defined(this.options.windowstate)) {
				classes.push(this.options.windowstate);
			}
			this.element = new Element('div',{
				'class':classes.join(' '),
				styles:$merge(this.coords,{'z-index':this.options.z})
			});
			
			this.content = new Element('div',{'class':this.options.classes.content})
							.inject(this.element);
							
			var content = TPH.Wall.Item.render($pick(this.options.type,'html'),this);
			
			switch($type(content)) {
				case 'string':
					this.content.set('html',content);
					break;
				case 'element':
					this.content.adopt(content);
					break;
			}
			this.element.addEvents({
				mousedown:function(e){
					this.fireEvent('onMousedown',[e,this]);
				}.bind(this),
				click:function(e){		
					this.fireEvent('onClick',[e,this]);
				}.bind(this)
			});
			
			if (this.options.draggable) {
				this.makeDraggable();	
			}
			if (this.options.resizable) {
				this.makeResizable();
			}
			
			this.show();
			
			this.fireEvent('onCreate',[this]);
			if (classes.contains('maximize')) {
				(function(){
					this.fireEvent('onMaximize',[this]);
					this.fireEvent('onResize',[this]);	
				}.delay(500,this));
			}
		} 
		return this;
	},
	createResizeHandles:function(){
		this.$resizeHandles = {};
		var handles = {
			l:{
				classname:'horizontal left',
				modifiers:{
					y:false,
					x:'left'
				},
				onDrag:function(){
					var coords = this.element.getCoordinates();
					this.element.setStyles({
						width:this.$resizeCoords.right-coords.left,
						right:this.$resizeCoords.right
					});
				}.bind(this)
			},
			r:{
				classname:'horizontal right',
				modifiers:{
					y:false	
				}
			},
			t:{
				classname:'vertical top',
				modifiers:{
					x:false,
					y:'top'	
				},
				onDrag:function(){
					var coords = this.element.getCoordinates();
					this.element.setStyles({
						height:this.$resizeCoords.bottom-coords.top,
						bottom:this.$resizeCoords.bottom
					});
				}.bind(this)
			},
			b:{
				classname:'vertical bottom',
				modifiers:{
					x:false	
				}
			},
			'b-r':{
				classname:'diagonal br',
				modifiers:{
					x:'width',
					y:'height'
				}
			},
			'b-l':{
				classname:'diagonal bl',
				modifiers:{
					x:'left',
					y:'height'
				},
				onDrag:function(){
					var coords = this.element.getCoordinates();
					this.element.setStyles({
						width:this.$resizeCoords.right-coords.left,
						right:this.$resizeCoords.right
					});
				}.bind(this)
			},
			't-r':{
				classname:'diagonal tr',
				modifiers:{
					x:'width',
					y:'top'
				},
				onDrag:function(){
					var coords = this.element.getCoordinates();
					this.element.setStyles({
						height:this.$resizeCoords.bottom-coords.top,
						bottom:this.$resizeCoords.bottom
					});
				}.bind(this)
			},
			't-l':{
				classname:'diagonal tl',
				modifiers:{
					x:'left',
					y:'top'
				},
				onDrag:function(){
					var coords = this.element.getCoordinates();
					this.element.setStyles({
						width:this.$resizeCoords.right-coords.left,
						right:this.$resizeCoords.right,
						height:this.$resizeCoords.bottom-coords.top,
						bottom:this.$resizeCoords.bottom
					});
				}.bind(this)
			}
		};
		for(rel in handles){
			var handle = handles[rel];
			var el = new Element('div',{'class':[this.options.classes.resize,handle.classname].join(' '),rel:rel}).inject(this.element);
			this.$resizeHandles[rel] = $merge(handle,{
				el:el
			});
		}		
	},
	makeResizable:function(){
		//Resizers
		this.createResizeHandles(); 
		
		var options = {
			grid:this.options.grid,
			stopPropagation:true,
			onBeforeStart:function(){
				this.$resizeCoords = this.element.getCoordinates();
				this.wall.grid.canExplore = false;
				this.element.addClass('resizing');
				this.focus();
				this.fireEvent('onBeforeResize',[this]);
			}.bind(this),
			onCancel:function(){
				this.wall.grid.canExplore = true;
				this.element.removeClass('resizing');
				this.fireEvent('onCancelResize',[this]);
			}.bind(this),
			onComplete:function(dragged,e){
				this.wall.grid.canExplore = true;
				this.element.removeClass('resizing');
					
				this.fireEvent('onResize',[this]);
			}.bind(this)
		};
		this.resizers = {};
		for(position in this.$resizeHandles){
			var handle = this.$resizeHandles[position];
			var options = $merge(options,{
				handle:handle.el
			});
			if ($defined(handle.modifiers)) {
				$extend(options,{
					modifiers:handle.modifiers
				});
			}
			this.resizers[position]=this.element.makeResizable(options);
			if ($defined(handle.onDrag)) {
				this.resizers[position].addEvent('onDrag',handle.onDrag);
			}
			this.resizers[position].addEvent('onDrag',function(){
				this.fireEvent('onResizing',[this]);
			}.bind(this));
		}
	},
	makeDraggable:function(){
		this.dragger = this.element.makeDraggable({
			grid:this.options.grid,
			//stopPropagation:true,
			handle:this.options.dragHandle,
			onBeforeStart:function(){
				this.wall.grid.canExplore = false;
				this.element.addClass('dragging');
				this.focus();
				this.fireEvent('onBeforeDrag',[this]);
				window.fireEvent('onDragElement',[this]);
			}.bind(this),
			onCancel:function(){
				this.wall.grid.canExplore = true;
				this.element.removeClass('dragging');
				this.fireEvent('onDragCancel',[this]);
			}.bind(this),
			onComplete:function(el,e){
				this.wall.grid.canExplore = true;
				this.element.removeClass('dragging');
				/*
				var scrollSize = this.wall.grid.viewport.getScrollSize();
				var scroll = this.wall.grid.viewport.getScroll();
				var coords = el.getCoordinates(this.wall.grid.viewport);
				if (coords.top<0) coords.top=0;
				if (coords.left<0) coords.left=0;
				if (coords.left+coords.width+scroll.x>scrollSize.x) coords.left = scrollSize.x-scroll.x-coords.width;
				if (coords.top+coords.height+scroll.y>scrollSize.y) coords.top = scrollSize.y-scroll.y-coords.height;
				
				//console.log(coords.left,coords.top);
				var cell = this.wall.grid.getCellFromPoint(coords.left,coords.top);
				//console.log(cell);
				if ($defined(cell)) {
					this.setCell(cell);		
				}
				*/
				this.fireEvent('onDrag',[this]);
			}.bind(this)
		});
	},
	attachDragger:function(){
		if ($defined(this.dragger)) {
			this.dragger.attach();
		} else {
			this.makeDraggable();
		}
		return this;
	},
	detachDragger:function(){
		if ($defined(this.dragger)) {
			this.dragger.detach();
		}
	},
	hide:function(){
		if ($defined(this.element)) {
			this.element.remove();	
		}
		return this;
	},
	show:function(){
		if ($defined(this.element)) {
			if (!this.wall.grid.viewport.contains(this.element)) {
					this.element.inject(this.wall.grid.viewport);	
			}
		}
		return this;
	},
	close:function(){
		this.unfocus().detachDragger();
		if ($defined(this.element)) {
			this.element.destroy();	
			this.element = null;
		}
		this.fireEvent('onClose',[this]);
		return this;
	},
	setCell:function(cell){
		if (this.cell!=cell) {
			if ($defined(this.cell)) {
				this.cell.$items.erase(this);
			}
			this.cell = cell;
			this.syncCoordinates();
			if (!$defined(cell.$items)) {
				cell.$items = new Array();
			}
			cell.$items.include(this);
		}
		return this;
	},
	syncCoordinates:function(){
		var anchor = {
			col:this.cell.options.col,
			row:this.cell.options.row
		};
		var scroll = this.wall.grid.viewport.getScroll();
		var endCol = (anchor.col)+(this.options.size.x-1),
			endRow = (anchor.row)+(this.options.size.y-1);
		
		var startCoords = this.wall.grid.getCellCoordinates(anchor.row,anchor.col);
			endCoords = this.wall.grid.getCellCoordinates(endRow,endCol);
			
		var top = startCoords.top+scroll.y,
			left = startCoords.left+scroll.x,
			width = (endCoords.left+endCoords.width)-startCoords.left,
			height = (endCoords.top+endCoords.height)-startCoords.top;
		
		this.coords = {
			top:top,
			left:left,
			width:width,
			height:height,
			right:left+width,
			bottom:top+height
		};
		
		if ($defined(this.element)) {
			this.element.setStyles(this.coords);
		}
	},
	setZ:function(z){
		this.setOptions({z:z});
		if ($defined(this.element)) {
			this.element.setStyle('z-index',z);	
		}
	}
});

TPH.Wall.Item.render = function(type,itemData){
	return TPH.Wall.Items[$defined(TPH.Wall.Items[type.capitalize()])?type.capitalize():'Html'](itemData);                   
};

TPH.Wall.Items = {
	Html:function(itemData){
		return itemData.options.content;
	},
	Image:function(itemData){
		var el = new Element('img',{src:itemData.options.content});
		el.ondragstart = function(){
			return false;
		};
		return el;
	},
	Iframe:function(itemData){
		var el = new Element('div',{
			styles:{
				width:'100%',
				height:'100%'
			}
		});
		
		var header = new Element('div',{
			'class':'frame-header'
		}).inject(el).set('html',itemData.options.title);
		
		itemData.setOptions({dragHandle:header});
		
		var iframe = new Element('iframe',{
			src:itemData.options.content,
			height:'100%',
			width:'100%',
			frameborder:0,
			seamless:'seamless'
		});
		iframe.addEvent('load',function(){
			console.log(iframe);
			//header.set('html',iframe.contentDocument.title);
		});
		el.adopt(iframe);
		
		return el;
	},
	App:function(itemData){
		return Json.encode(itemData.options);
	}
};