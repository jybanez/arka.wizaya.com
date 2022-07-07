TPH.Grid = new Class({
	Implements:[Events,Options],
	options:{
		width:'fit',
		height:'fit',
		
		columns:20,
		rows:20,
		
		rowHeight:32,
		colWidth:100,
		
		scrollVertical:true,
		scrollHorizontal:true,
		
		scrollbars:{
			vertical:true,
			horizontal:true
		},
		hammerTime:true,
		classes:{
			container:'grid',
			viewport:'grid-viewport',
			wrapper:'grid-wrapper',
			scrollVertical:'scroll-v',
			scrollHorizontal:'scroll-h',
			scrollbars:'scrollbars',
			progress:'progressContainer'
		},
		
		progress:false		
	},
	rows:[],
	visible:[],
	initialize:function(container,options){
		this.el = document.id(container);
		this.setOptions(options);
		this.container = new Element('div',{'class':this.options.classes.container}).inject(this.el);

		var classes = this.options.classes;
		this.viewport = new Element('div',{'class':classes.viewport})
			.addClass(Browser.platform)
			.setStyles({
				width:this.options.width=='fit'?'100%':this.options.width,
				height:this.options.height=='fit'?'100%':this.options.height
			})
			.inject(this.container);
		
		this.wrapper = new Element('div',{'class':classes.wrapper});
		
		this.currentScroll = this.viewport.getScroll();
		this.currentSize = this.viewport.getSize();
		
		if (this.options.scrollVertical) {
			this.viewport.addClass(classes.scrollVertical);
		}
		if (this.options.scrollHorizontal) {
			this.viewport.addClass(classes.scrollHorizontal);
		}
		
		this.viewport.addEvents({
			//scroll:function(e){
			//	
			//}.bind(this),
			mousewheel:function(e){
				e.stop();
				var scroll = this.viewport.getScroll();
				this.scrollTo(scroll.x+(e.event.deltaX*10),scroll.y+(e.event.deltaY*10));
				//e.stopPropagation();
			}.bind(this)
		});
		
		this.viewport.addEventListener('scroll', function(e) {
			(function(){
				if (!this.viewport.contains(e.target)) return;
		    
				if ($defined(this.$scrollingTime)) {
					clearTimeout(this.$scrollingTime);	
				}
				
				this.container.addClass('scrolling');
				
				var scroll = this.viewport.getScroll();
				this.scrollTo(scroll.x,scroll.y);	
			}.debounce(this));
		    
			//this.render.throttle(this);
		}.bind(this));
		
		this.scroller = new Fx.Scroll(this.viewport);
		
		if (this.options.scrollVertical || this.options.scrollHorizontal) {		
			if (this.options.hammerTime) {
				this.hammer = new Hammer.Manager(this.viewport,{
					//preventDefault:true,
					domEvents:true
				});
				var	direction = Hammer.DIRECTION_ALL;
				if (this.options.scrollVertical && !this.options.scrollHorizontal) {
					direction = Hammer.DIRECTION_VERTICAL;
				} else if (!this.options.scrollVertical && this.options.scrollHorizontal){
					direction = Hammer.DIRECTION_HORIZONTAL;
				}
		    	this.hammer.add(new Hammer.Pan({ direction:direction, threshold:0, pointers:0 }));
		    	this.hammer.add(new Hammer.Swipe()).recognizeWith(this.hammer.get('pan'));
		    	
		    	this.hammer.on('swipe',function(e){
					if (!this.canExplore) return;
		    		if (!this.getMode() && $defined(this.panStart)) {
		    			var velocity = {
			    				x:e.overallVelocityX,
			    				y:e.overallVelocityY
		    				},
				    		delta = {
				    			x:e.deltaX,
				    			y:e.deltaY
			    			};
				    	this.slide
							.setVelocity(velocity)
							.setDelta(delta)
							.start(this.panStart);	
		    		}
		    	}.bind(this));
				this.hammer.on('panstart', function(e) {
					if (['select','input','textarea'].contains(e.target.get('tag'))) return;
					if (!this.wrapper.contains(e.target)) return;
					if (!this.canExplore) return;
					if (!this.getMode()) {
						this.slide.cancel();
						this.panStart = this.viewport.getScroll();
						this.fireEvent('onPanStart',[this.panStart,this]);	
					}
				}.bind(this));
				this.hammer.on('panmove panend', function(e) {
					if (['select','input','textarea'].contains(e.target.get('tag'))) return;
					if (!this.wrapper.contains(e.target)) return;
					if (!this.canExplore) return;
					if (!$defined(this.panStart)) return;
					if (!this.getMode()) {
						var x = this.options.scrollHorizontal?this.panStart.x-e.deltaX:this.panStart.x,
							y = this.options.scrollVertical?this.panStart.y-e.deltaY:this.panStart.y;		
									
					    this.scrollTo(x,y);	
					    this.fireEvent('onPanning',[x,y,this]);
					}
				}.bind(this));
				this.hammer.on('panend', function(e) {
					if ($defined(this.panStart)) {
						this.panStart = null;
						this.fireEvent('onPanEnd',[this]);
					}
				}.bind(this));		
			} else {
				//console.log('// Grid : Hammer Disabled');
				//console.log(Browser.platform);
				switch(Browser.platform){
					//case 'windows':
                    default:    
                    	/*
						new Drag(this.viewport, {
						    style: false,
						    invert: true,
						    stopPropagation :true,
						    modifiers: {x: 'scrollLeft', y: 'scrollTop'},
						    onDrag:function(el,e){
						    	var scroll = this.viewport.getScroll();
						    	this.scrollTo(scroll.x,scroll.y);
						    }.bind(this)
						});
						*/
						break;
				}
			}	
			
			this.slide = new TPH.Slide(this.viewport);
		}
		
		this.wrapper.inject(this.viewport);
		
		if (this.options.scrollbars) {
			if (this.options.scrollbars.horizontal) {
				this.hScrollBar = new TPH.Scrollbar(this.container,this.viewport,{
					onScroll:function(x,y){
						//this.scrollTo(x,y,false);
					}.bind(this)
				});	
			}
			if (this.options.scrollbars.vertical) {
				this.vScrollBar = new TPH.Scrollbar(this.container,this.viewport,{
					axis:'y',
					onScroll:function(x,y){
						//this.scrollTo(x,y,false);
					}.bind(this)
				});	
			}
		}
		
		this.build();
		
		window.addEvent('resize',function(){
			this.render();
		}.bind(this));
		
		
	},
	build:function(){
		var row = this.addRow();
		if (this.rows.length<this.options.rows) {
			if (!$defined(this.$height)) {
				this.$height = 0;
			}
			this.$height += row.getHeight();
			if (this.$height>=this.getHeight() && this.options.progress) {
				if (!$defined(this.$progress)) {
					this.$progressContainer = new Element('div',{'class':this.options.classes.progress}).inject(this.container);
					this.$progress = new TPH.ProgressBar(this.$progressContainer);
				}
				this.$progress.set(this.rows.length/this.options.rows*100);
				if (!this.container.hasClass('scrolling')) {
					this.update().render();	
				} 
				this.build.delay(200,this);
			} else {
				this.build();	
			}
		} else {
			if ($defined(this.$progress)) {
				this.$progress.destroy();
				this.$progress = null;
				this.$progressContainer.remove();
				this.$progressContainer = null;
			}
			this.update().render();
			this.fireEvent('onReady',[this]);	
		}
	},
	update:function(){
		var height = 0, width = 0, rows = this.rows.length;
		if (rows) {
			for(var i=0;i<rows;i++) {
				var row=this.rows[i];
				row.offset = height;
				var rowHeight = row.getHeight(true);
				height += rowHeight;
				if (!i) {
					width = row.getWidth();
				}
			}	
		}
		this.wrapper.setStyles({
			height:height,
			width:width
		});
		if (this.options.scrollbars) {
			if (this.options.scrollbars.horizontal) {
				this.hScrollBar.updateSlider();	
			}
			if (this.options.scrollbars.vertical) {
				this.vScrollBar.updateSlider();	
			}
		}
		
		return this;
	},
	render:function(){
		this.fireEvent('onBeforeRender',[this]);
		this.visible.empty();
		
		var rows = this.rows.length,
			scroll = this.viewport.getScroll(),
			size = this.viewport.getSize();
		if (rows) {
			var limitTop = scroll.y-this.rows[0].getHeight(true),
				limitBottom = scroll.y+size.y;
				
			for(var i=0;i<rows;i++) {
				var row = this.rows[i];
				if (row.offset>=limitTop && row.offset<=limitBottom) {
					this.visible.push(row);
				}
				if (row.offset>limitBottom+row.getHeight(true)) {
					break;
				}
			}
			if (this.visible.length) {
				var offset = this.visible[0].offset;
				this.wrapper.setStyles({
					'padding-top':scroll.y, //offset,
					'margin-top':offset-scroll.y
				}).empty();
				this.visible.each(function(row){
					row.render(this.wrapper,scroll,size);
				}.bind(this));	
			}	
		}
		
		this.fireEvent('onRender',[this]);
		return this;
	},
	rescroll:function(){
		var scroll = this.viewport.getScroll(),
			height = this.wrapper.getStyle('height').toInt();
		if (scroll.y>height) {
			var size = this.viewport.getSize();
			var limitTop = height-size.y;
			if (limitTop<0) limitTop=0;
			this.wrapper.setStyle('padding-top',limitTop);
		}
		return this;
	},
	scrollTo:function(x,y,triggerEvent){
		var triggerEvent = $pick(triggerEvent,true);
		//var x = $pick(x,this.currentScroll.x);
		//var y = $pick(y,this.currentScroll.y);
		//var scroll = this.viewport.getScroll();
		if (x!=this.currentScroll.x || y!=this.currentScroll.y) {
			
			this.viewport.scrollTo(x,y);
			
			if (x!=this.currentScroll.x) {						
				this.fireEvent('onScrollHorizontal',[x,this.currentScroll.x,this]);
			}
			if (y!=this.currentScroll.y) {
				this.fireEvent('onScrollVertical',[y,this.currentScroll.y,this]);
			}
			if (this.options.scrollbars) {	
				var canScroll = false;
				if (this.options.scrollbars.horizontal) {
					canScroll = canScroll || this.hScrollBar.set(x); 
				}
				if (this.options.scrollbars.vertical) {
					canScroll = canScroll || this.vScrollBar.set(y); 
				}
				if (canScroll){
					var clearScroller = function(){
						this.container.removeClass('scrolling');
					};		
					this.$scrollingTime = clearScroller.delay(2000,this);	
				} else {
					this.container.removeClass('scrolling');
				}	
			}
			
			this.render();
			
			if (triggerEvent) {
				this.fireEvent('onScroll',[x,y,this]);	
			}
		}
		this.currentScroll = {
			x:x,
			y:y
		};
	},
	setMode:function(mode){
		this.$mode = mode;
	},
	clearMode:function(){
		this.$mode = null;
	},
	getMode:function(){
		return this.$mode;
	},
	addRow:function(){
		var row = new TPH.Grid.Row({
			id:this.rows.length,
			columns:this.options.columns,
			height:this.options.rowHeight,
			onCellContentAction:function(data,column,e,cell,row){
				this.fireEvent('onCellContentAction',[data,column,e,cell,row,this]);
			}.bind(this),
			onCellResize:function(width,height,cellObj,rowObj){				
				if ($defined(width)) {
					var column = cellObj.getId();
					this.setColumnWidth(column,width);
					this.fireEvent('onColResize',[column,width,this]);
				}
				if ($defined(height)) {
					var row = rowObj.getId();
					this.fireEvent('onRowResize',[row,height,this]);
				}
				this.fireEvent('onCellResize',[width,height,cellObj,rowObj,this]);
			}.bind(this),
			onCellResizeStart:function(){
				this.setMode('resizing');
			}.bind(this),
			onCellResizeComplete:function(cellObj,rowObj){
				this.clearMode();
			}.bind(this),
			onCellRender:function(cell,row){
				this.fireEvent('onCellRender',[cell,row,this]);
			}.bind(this),
			onCellCreate:function(cell,row){
				this.fireEvent('onCellCreate',[cell,row,this]);
			}.bind(this),
			onGroupCellCreate:function(cell,parent,row){ 
				this.fireEvent('onGroupCellCreate',[cell,parent,row,this]);
			}.bind(this),
			onCellClick:function(row,column,cellObj,rowObj){
				this.fireEvent('onCellClick',[row,column,cellObj,rowObj,this]);
			}.bind(this),
			onCellDblClick:function(row,column,cell,rowObj){
				this.fireEvent('onCellDblClick',[row,column,cellObj,rowObj,this]);
			}.bind(this)
		});
		this.rows.push(row);		
		return row;
	},
	addColumn:function(){
		var rows = this.rows.length;
		for(var i=0;i<rows;i++) {
			this.rows[i].addCell();
		}
	},
	getColumnWidth:function(column){
		return this.rows[0].columns[column].getWidth();
	},
	setColumnWidth:function(column,width){
		this.rows.each(function(row){
			row.setColumnWidth(column,width);
		});
		this.update();
		return this;
	},
	setWidth:function(width){
		var styles = {width:width};
		this.setOptions(styles);
		this.viewport.setStyles(styles);
		this.render();
		return this;
	},
	setHeight:function(height){
		var styles = {height:height};
		this.setOptions(styles);
		this.viewport.setStyles(styles);
		this.render();
		return this;
	},
	getHeight:function(){
		return this.viewport.getCoordinates().height;
	},
	resize:function(rows,columns){
		var currentRows = this.rows.length;
		if (rows==currentRows){
			this.setOptions({columns:columns});
			for(var i=0;i<currentRows;i++) {
				this.rows[i].resize(columns);
			}
		} else {
			this.setOptions({rows:rows,columns:columns});
			if (rows<currentRows) {
				for(var i=0;i<currentRows;i++) {
					if (i>=rows) {
						this.rows[i].clear();	
					} else {
						this.rows[i].resize(columns);
					}
				}	
				this.rows.length = rows;
			} else {
				for(var i=0;i<rows;i++) {
					if (i>=currentRows) {
						this.addRow();	
					} else {
						this.rows[i].resize(columns);
					}
				}
			}	
		}
		
		this.update().rescroll().render();
		return this;
	},
	getSize:function(){
		return {
			rows:this.rows.length?this.rows.length:0,
			columns:this.rows.length?this.rows[0].getSize():0
		};
	},
	clear:function(){
		var rows = this.rows.length;
		for(var i=0;i<rows;i++){
			this.rows[i].clear();
		}
		this.rows.empty();
		this.wrapper.empty();
		return this.update().render();
	},
	getCell:function(row,col){
		return this.rows[row].columns[col];
	},
	getVisibleRows:function(){
		return this.visible;
	},
	getVisibleCells:function(){
		var cells = [];
		this.visible.each(function(row){
			cells.combine(row.visible);
		});
		return cells;
	},
	getCellFromPoint:function(x,y){
		var rowCount = this.rows.length,
			top = 0,
			height = 0;
		for(var i=0;i<rowCount;i++){
			var row = this.rows[i];
			height = row.getHeight();
			if (y>=top && y<=(top+height)) {
				//console.log('Found row:'+i,y,top,top+height);
				//console.log('columns ',row.columns.length);
				var colCount = row.columns.length,
					left = 0,
					width = 0;
				for(var j=0;j<colCount;j++){
					var col = row.columns[j];
					width = col.getWidth();
					//console.log(j,x,left,left+width);
					if (x>=left && x<=(left+width)){
						//console.log('Found col:'+j,x,left,left+width);
						//console.log('Found cell:',i,j);
						return this.getCell(i+1,j+1);
					} else {
						left += width;
					}
				}	
				break;
			} else {
				top += height;
			}
		}
	},
	getCellCoordinates:function(row,col){
		var rcount = this.rows.length,
			top = 0,
			left = 0,
			height = 0,
			width = 0;
		for(var i=0;i<rcount;i++){
			var r = this.rows[i];
			height = r.getHeight();
			if ((i+1)>=row) {
				var ccount = r.columns.length;
				for(var j=0;j<ccount;j++){
					var c = r.columns[j];
					width = c.getWidth();
					if ((j+1)>=col) {
						break;
					}
					left += width;
				}
				break;
			} else {
				top += height;
			}
		}
		
		return {
			top:top,
			left:left,
			height:height,
			width:width,
			right:left+width,
			bottom:top+height
		};
	}
}); 
TPH.Grid.Row = new Class({
	Implements:[Events,Options],
	options:{
		height:32,
		classes:{
			container:'grid-row'
		}
	},
	visible:[],
	initialize:function(options){
		this.setOptions(options);
		
		if (this.options.columns) {
			this.build();
		}
	},
	destroy:function(){
		if ($defined(this.element)) {
			this.element.remove();
		}
		if ($defined(this.columns)) {
			var columns = this.columns.length;
			if (columns) {
				for(var i=0;i<columns;i++) {
					this.columns[i].destroy();
				}
				this.columns.empty();
				this.columns = null;	
			}	
		}
		
	},
	getId:function(){
		return this.options.id;
	},
	build:function(){
		this.doUpdate = false;
		var cells = this.options.columns;
		while(cells--){
			this.addCell(this.options.cell);
		}
		this.doUpdate = true;
		this.update();
	},
	addCell:function(options){
		if (!$defined(this.columns)) {
			this.columns = new Array();
		}
		var cell = new TPH.Grid.Cell(Object.append({
			id:this.columns.length.toString(),
			row:this.getId(),
			col:this.columns.length,
			height:this.options.height,
			onContentAction:function(data,column,e,instance){
				this.fireEvent('onCellContentAction',[data,column,e,instance,this]);
			}.bind(this),
			onCellCreate:function(cell,parent){
				this.fireEvent('onGroupCellCreate',[cell,parent,this]);
			}.bind(this),
			onCellResize:function(width,height,cell,parent){
				if ($defined(width)) {
					parent.update();
					parent.fireEvent('onResize',[parent.getWidth(),null,parent]);
				}
				if ($defined(height)) {
					var level = parent.getId().split('.').length;
					if ($defined(parent.columns) && level==1) {
						parent.columns.each(function(column){
							column.setHeight(height);
						});
						//parent.update();
						parent.fireEvent('onResize'[null,parent.getHeight(),parent]);
					}
					//console.log(level);
				}
			}.bind(this),
			onResize:function(width,height,instance) {
				if ($defined(height)){
					var level = instance.getId().split('.').length-1;
					this.setHeight(height,level);
				}				
				this.fireEvent('onCellResize',[width,height,instance,this]);
			}.bind(this),
			onCellResizeStart:function(instance){
				this.fireEvent('onCellResizeStart',[instance,this]);
			}.bind(this),
			onResizeStart:function(instance){
				this.fireEvent('onCellResizeStart',[instance,this]);
			}.bind(this),
			onCellResizeComplete:function(instance){
				this.fireEvent('onCellResizeComplete',[instance,this]);
			}.bind(this),
			onCellClick:function(row,col,cellObj){
				this.fireEvent('onCellClick',[row,col,cellObj,this]);
			}.bind(this),
			onResizeComplete:function(instance){
				this.fireEvent('onCellResizeComplete',[instance,this]);
			}.bind(this),
			onClick:function(instance){
				this.fireEvent('onCellClick',[this.getId(),instance.getId(),instance,this]);
			}.bind(this),
			onDblClick:function(instance){
				this.fireEvent('onCellDblClick',[this.getId(),instance.getId(),instance,this]);
			}.bind(this),
			onRender:function(instance){
				this.fireEvent('onCellRender',[instance,this]);
			}.bind(this)
		},options));
		this.fireEvent('onCellCreate',[cell,this]);
		
		this.columns.push(cell);
		if (this.doUpdate) {
			this.update();
		}
		return cell;
	},
	createElement:function(){
		this.element = new Element('div',{'class':this.options.classes.container});	
		this.cellTarget = this.element;		
		return this;
	},
	renderElement:function(container,scroll,size){
		this.visible.empty();
		this.element.inject(container).empty();
		if ($defined(this.columns)) {
			var cells = this.columns.length,
				offset = 0;
			
			if (cells) {
				var	limitLeft = scroll.x,
					limitRight = scroll.x+size.x;
					
				for(var i=0;i<cells;i++) {
					var cell = this.columns[i];
					var cellOffset = cell.offset,
						cellWidth = cell.getWidth();
						
					if ((cellOffset+cellWidth>=limitLeft) && (cellOffset<=limitRight)) {
						this.visible.push(cell);
					} else if (cellOffset>=limitRight+cellWidth) {
						break;
					}
				}
				if (this.visible.length) {
					this.visible.each(function(cell){
						cell.render(this.cellTarget,scroll,size);
					}.bind(this));	
					
					offset = this.visible[0].offset;	
				}
			}
		}
		
		this.element.setStyles({
			'padding-left':scroll.x,
			'margin-left':offset-scroll.x,
			width:this.getWidth()
		});
	},
	render:function(container,scroll,size){
		if (!$defined(this.element)) {
			this.createElement();
		}
		this.renderElement(container,scroll,size);
		this.fireEvent('onRender',[this]);
		return this;
	},
	update:function(){
		var width = 0;
		if ($defined(this.columns)) {
			var cells = this.columns.length;
			for(var i=0;i<cells;i++){
				var cell = this.columns[i];
				cell.offset = width;
				width+=cell.getWidth();
			}	
		}
		this.setWidth(width);
		return this;
	},
	setWidth:function(width){
		this.width = width;
		if ($defined(this.element)) {
			this.element.setStyle('width',this.width);
		}
	},
	getWidth:function(){
		return this.width;
	},
	getSize:function(){
		return this.columns.length;
	},
	setHeight:function(height,level){
		if (!level) {
			this.setOptions({height:height});	
		}
		
		var cells = this.columns.length;
		for(var i=0;i<cells;i++){
			this.columns[i].setHeight(height,level);
		}
		this.update();
		return this;
	},
	getHeight:function(includeColumns){
		var includeColumns = $pick(includeColumns,true);
		var height = this.options.height;
		if ($defined(this.columns) && includeColumns){
			var count = this.columns.length;
			var groupHeights = [height];
			for(var i=0;i<count;i++) {
				groupHeights.push(this.columns[i].getHeight(includeColumns));
			}
			height = groupHeights.max();
		}
		return height;
	},
	setColumnWidth:function(column,width){
		this.columns[column].setWidth(width);
		this.update();
	},
	clear:function(){
		this.columns.empty();
		if ($defined(this.element)) {
			this.element.empty();	
		}
		this.update();
	},
	resize:function(columns){
		var currentColumns = this.columns.length;
		if (columns==currentColumns) return this;
		this.doUpdate = false;
		if (columns<currentColumns) {
			for(var i=columns;i<currentColumns;i++) {
				this.columns[i].destroy(); 
			}
			this.columns.length = columns;
		} else {
			for(var i=currentColumns;i<columns;i++) {
				this.addCell();
			}
		}
		this.doUpdate = true;
		this.update();
		return this;
	}
});

TPH.Grid.Cell = new Class({
	Extends:TPH.Grid.Row,
	options:{
		width:100,
		height:32,
		classes:{
			container:'grid-cell',
			content:'grid-cell-content',
			value:'grid-cell-value'
		},
		resizers:{
			horizontal:true,
			vertical:true
		}
	},
	addCell:function(options){
		if (!$defined(this.columns)) {
			this.columns = new Array();
		}
		return this.parent($merge(options,{
			id:this.getId()+'.'+this.columns.length,
			parent:this,
			resizers:this.options.resizers
		}));
	},
	build:function(){
		if ($defined(this.options.columns)) {
			this.doUpdate = false;
			var count = this.options.columns.length;
			for(var i=0;i<count;i++) {
				this.addCell(this.options.columns[i]);
			}
			this.doUpdate = true;	
		}
		this.update();
	},
	createElement:function(){
		this.parent();
		this.content = new Element('div',{'class':this.options.classes.content,styles:this.options.styles}).inject(this.element);
		this.content.addEvent('click',function(){
			this.fireEvent('onCellClick',[this.options.row,this.options.col,this]);
		}.bind(this));
		return this;
	},
	renderElement:function(container,scroll,size){	
		this.element.inject(container);	
		this.content.empty();
		this.getElement('Content').render().setContent(TPH.Grid.Cell.Content(this));
		if (this.options.resizers) {
			this.getElement('Resizers',this.options.resizers).render();
		}
		
		if ($defined(this.columns)) {
			this.cellTarget = this.getElement('Group').render().element;
			var cells = this.columns.length;
			
			if (cells) {
				for(var i=0;i<cells;i++) {
					var cell = this.columns[i];
					cell.render(this.cellTarget,scroll,size);
				}
			}
		}
		this.content.setStyles({
			height:this.getHeight(false),
			width:this.getWidth()
		});
		return this;
	},	
	getId:function(){
		return this.options.id;
	},
	getLevel:function(){
		return this.options.id.split('.').length-1;
	},
	getParent:function(){
		return this.options.parent;
	},
	setHeight:function(height,level){
		if (!level) {
			this.options.height = height;
			if ($defined(this.content)) {
				this.content.setStyle('height',height);
			}	
		}
		return this;
	},
	getHeight:function(includeColumns){
		var includeColumns = $pick(includeColumns,true);
		var height = this.options.height;
		if ($defined(this.columns) && includeColumns){
			var count = this.columns.length;
			var groupHeights = [];
			for(var i=0;i<count;i++) {
				groupHeights.push(this.columns[i].getHeight(includeColumns));
			}
			height+=groupHeights.max();
		}
		return height;
	},
	setWidth:function(width){
		this.options.width = width;
		if ($defined(this.columns)) {
			var col = this.columns[this.columns.length-1];
			col.setWidth(width-col.offset);
		}
		if ($defined(this.content)) {
			this.content.setStyle('width',width);
		}
		return this;
	},
	getWidth:function(){
		var width = 0;
		if ($defined(this.columns)) {
			this.columns.each(function(col){
				width += col.getWidth();
			});
		} else {
			width = this.options.width;	
		}
		return width;
	},
	getElement:function(name,options){
		if (!$defined(this.elements)) {
			this.elements = new Hash();
		}
		var className = name.capitalize();
		if (!this.elements.has(name)) {
			this.elements.set(name,new TPH.Grid.Cell.Elements[className](this,options));
		} 
		return this.elements.get(name);
	}
});

TPH.Grid.Cell.Element = new Class({
	Implements:[Events,Options],
	options:{
		
	},
	initialize:function(cell,options){
		this.cell = cell;
		this.setOptions(options);
	},
	render:function(){
		return this;
	}
});
TPH.Grid.Cell.Elements = {
	Group : new Class({
		Extends:TPH.Grid.Cell.Element,
		options:{
			classes:{
				group:'grid-cell-group'
			}
		},
		render:function(){
			if (!$defined(this.element)) {
				this.element = new Element('div',{'class':this.options.classes.group});
			}
			this.element.inject(this.cell.element);
			return this;
		}
	}),
	Content : new Class({
		Extends:TPH.Grid.Cell.Element,
		options:{
			classes:{
				display:'grid-cell-display'
			}
		},
		render:function(){
			if (!$defined(this.display)) {
				var classes=this.options.classes;
				this.display = new Element('div',{'class':classes.display});
				this.display.addEvents({
					click:function(e){
						this.fireEvent('click',[this.cell]);
					}.bind(this),
					dblclick:function(e){
						this.fireEvent('dblclick',[this.cell]);
					}.bind(this)
				});
			}
			this.display.inject(this.cell.content);
			return this;
		},
		setContent:function(content){
			switch($type(content)) {
				case 'string':
					this.display.set('html',content);
					break;
				case 'element':
					content.inject(this.display.empty());
					break;	
			}
			return this.cell;
		}
	}),
	Resizers : new Class({
		Extends:TPH.Grid.Cell.Element,
		options:{
			horizontal:true,
			vertical:true,
			classes:{
				Hresize:'grid-cell-resize-horizontal',
				Vresize:'grid-cell-resize-vertical',
				VHresize:'grid-cell-resize'
			}
		},
		resizers:{},
		render:function(){
			if (!this.resizersInit) {
				var resizeStart = function(){
					window.elementResizing = true;
					this.cell.fireEvent('onResizeStart',[this.cell]);
				}.bind(this);
				var resizeComplete = function(){
					window.elementResizing = false;
					this.cell.fireEvent('onResizeComplete',[this.cell]);
				}.bind(this);
				var classes = this.options.classes;
				var cell = this.cell.content.setProperty('tabindex',0);
				if (this.options.horizontal) {
					var handleHorizontal = function(cell,e){
						var width = cell.getSize().x;
						var newwidth = this.cell.options.width==width?null:width;
							
						this.cell.setOptions({
							width:$pick(newwidth,width)
						}).fireEvent('onResize',[newwidth,null,this.cell]);
					}.bind(this);
					this.resizers.horizontal = new Element('div',{'class':classes.Hresize});
					cell.makeResizable({
						handle:this.resizers.horizontal,
						modifiers:{
							x:'width',
							y:false
						},
						
						onDrag:handleHorizontal,
						onStart:resizeStart,
						onComplete:resizeComplete,
						stopPropagation:true,
						preventDefault:true
					});
				}
				
				if (this.options.vertical) {
					var handleVertical = function(cell,e){
						var height = cell.getSize().y;
						var newheight = this.cell.options.height==height?null:height;
							
						this.cell.setOptions({
							height:$pick(newheight,height)
						}).fireEvent('onResize',[null,newheight,this.cell]);
					}.bind(this);
					this.resizers.vertical = new Element('div',{'class':classes.Vresize});
					cell.makeResizable({
						handle:this.resizers.vertical,
						modifiers:{
							x:false,
							y:'height'
						},
						onDrag:handleVertical,
						onStart:resizeStart,
						onComplete:resizeComplete,
						stopPropagation:true,
						preventDefault:true
					});
				}
				
				if (this.options.vertical && this.options.horizontal) {
					var handleResize = function(cell,e){
						var size = cell.getSize();
						var height = size.y, width = size.x;
						var newheight = this.cell.options.height==height?null:height,
							newwidth = this.cell.options.width==width?null:width;
							
						this.cell.setOptions({
							height:$pick(newheight,height),
							width:$pick(newwidth,width)
						}).fireEvent('onResize',[newwidth,newheight,this.cell]);
					}.bind(this);
					this.resizers.both = new Element('div',{'class':classes.VHresize});
					cell.makeResizable({
						handle:this.resizers.both,
						onDrag:handleResize,
						onStart:resizeStart,
						onComplete:resizeComplete,
						stopPropagation:true,
						preventDefault:true
					});
				}
				var showResizers = function(){
					for(r in this.resizers){
						this.resizers[r].inject(this.cell.content);
					}
				}.bind(this);
				var hideResizers = function(){
					for(r in this.resizers){
						this.resizers[r].remove();
					}
				}.bind(this);
				this.cell.content.addEvents({
					focus:showResizers,
					blur:hideResizers,
					mouseenter:showResizers,
					mouseleave:hideResizers
				});
				//console.log(cell);
				this.resizersInit = true;
			}
			
			return this;
		}
	})
};

TPH.Grid.Cell.Content = function(cell){
	var type = $pick(cell.options.type,'text').capitalize();
	if ($defined(cell.options.field) && $defined(cell.options.data)) {
		var content = TPH.Grid.Cell.Contents[type](cell,cell.options.custom),
		el = new Element('div',{'class':cell.options.classes.value});
		switch($type(content)){
			case 'element':
				el.adopt(content);
				break;
			default:
				el.set('html',content);
				break;
			
		}
		return el;	
		
	}
};

TPH.Grid.Cell.Contents = {
	Text:function(cell){
		return cell.options.data[cell.options.field];	
	},
	Number:function(cell){
		return $pick(cell.options.data[cell.options.field],'0').toFloat().format($pick(cell.options.format,{
			decimal: '.',
		    group: ',',
		    decimals: 2
		}));
	},
	Select:function(cell){
		var el = new Element('select',{styles:cell.options.styles});
		cell.options.options.each(function(option){
			new Element('option',{value:option.value}).set('html',option.text).inject(el);
		});
		return el.set('value',$pick(cell.options.data[cell.options.field],''));
	},
	Date:function(cell){
		return new Date().parse(cell.options.data[cell.options.field]).format($pick(cell.options.format,'%b %d, %Y'));
	},
	Time:function(cell){
		return new Date().parse(cell.options.data[cell.options.field]).format($pick(cell.options.format,'%I:%M %p'));
	},
	Progressbar:function(cell){
		var value = cell.options.data[cell.options.field];
		return new Element('div',{'class':$pick(cell.options.barClass,'progressBar'),styles:cell.options.barStyles})
				.adopt(new Element('div',{'class':$pick(cell.options.progressClass,'progress'),styles:$merge({width:value+'%'},cell.options.progressStyles)}));
	},
	Checkbox:function(cell){
		var el = new Element('input',{type:'checkbox',checked:cell.options.data[cell.options.field]==cell.options.checked});
		el.addEvents({
			click:function(e){
				this.fireEvent('onContentAction',[cell.options.data,cell.options.field,e,this]);
			}.bind(cell)
		});
		return el;
	},
	Color:function(cell){
		var value = cell.options.data[cell.options.field];
		var el = new Element('input',{type:'color',value:value});
		el.addEvents({
			change:function(e){
				this.fireEvent('onContentAction',[cell.options.data,cell.options.field,e,this]);
			}.bind(cell)
		});
		
		return el;
	},
	Button:function(cell){
		
	},
	Custom:function(cell,custom){
		console.log($type(custom));
		if ($type(custom)=='function') {
			return custom();
		}
	}
};

TPH.Grid.Editor = new Class({
	Implements:[Events,Options],
	initialize:function(container,options){
		this.container = document.id(container);
		this.setOptions(options);
		this.render();
	},
	getInput:function(){
		if (typeOf(this.input)=='null') {
			this.input = new Element('input',{type:'text','class':'fullWidth'});
		}
		return this.input;
	},
	render:function(){
		var input = this.getInput();
		input.addEvents({
			keypress:function(e){ 
				e.stopPropagation();
				switch(e.key){
					case 'esc':
						this.cancel();
						break;
					case 'enter':
						this.save();
						break;
				} 
			}.bind(this),
			blur:function(){
				this.cancel();
			}.bind(this)
		});
		input.inject(this.container);
		this.focus();
		return this;
	},
	save:function(){
		this.container.set('html',this.getValue());
		this.input.remove();
		this.fireEvent('onSave',[this]);
	},
	cancel:function(){
		this.container.set('html',this.value);
		this.input.remove();
		this.fireEvent('onCancel',[this]);
	},
	focus:function(){
		this.input.focus();
	},
	setValue:function(value){
		this.value = value;
		this.input.set('value',value);
		return this;
	},
	getValue:function(value){
		return this.input.get('value');
	},
	setStyles:function(styles){
		this.input.setStyles(styles);
		return this;
	}
});

TPH.Grid.getEditor = function(type,container,options){
	var className = type.capitalize().camelCase();
	var obj = $pick(TPH.Grid.Editor[className],TPH.Grid.Editor);
	return new obj(container,options);
};

TPH.Grid.Editor.Text = new Class({
	Extends:TPH.Grid.Editor
});