TPH.Table = new Class({
	Implements:[Events,Options],
	options:{
		theme:'',
		width:'fit',
		height:'fit',
		columns:[],
		data:[],
		header:{
			height:32,
			rows:1
		},
		body:{},
		footer:{
			height:32,
			rows:1
		},
		sections:{
			header:true,
			body:true,
			footer:true
		},
		classes:{
			table:'table',
			header:'table-header',
			body:'table-body',
			footer:'table-footer',
			slider:'table-slider',
			knob:'table-slider-knob'
		}
	},
	grids:{},
	initialize:function(container,options){
		this.setOptions(options);
		
		var classes = this.options.classes;
		
		this.container = new Element('div',{'class':classes.table}).inject(document.id(container)).setStyles({
			width:this.options.width=='fit'?'':this.options.width,
			height:this.options.height=='fit'?'':this.options.height
		}).addClass(this.options.theme);
		
		this.buildColumns();
		
		['header','body'/*,'footer'*/].each(function(section){
			if (this.options.sections[section]) {
				var params = {
					rows:1,
					columns:this.columns[section].length,
					scrollVertical:!['fit','100%'].contains(this.options.height),
					scrollHorizontal:true,
					scrollbars:false
				};
				switch(section){
					case 'header':
						$extend(params,{
							onColResize:function(col,width,instance){
								var column = this.columns.header[col];
								column.width = width;
								if (!$defined(column.columns)) {
									this.columns.body.each(function(body,bcol){
										if (body.index==col && !$defined(body.group)) {
											this.grids.body.setColumnWidth(bcol,width);
											body.width = width;	
										}
									}.bind(this));
								} else {
									var bodyCell = this.grids.header.getCell(0,col);
									bodyCell.columns.each(function(bgCell){
										var vgparts = bgCell.getId().split('.');
										this.columns.body.each(function(body,bcol){
											if (body.index==vgparts[1].toInt() && body.group==vgparts[0].toInt()) {
												this.grids.body.setColumnWidth(bcol,bgCell.getWidth());
											}
										}.bind(this));
									}.bind(this));
								}
								this.hscroll.updateSlider();
							}.bind(this),
							onCellCreate:function(cellObj){
								var header = this.columns[section][cellObj.getId()];
								cellObj.setOptions({
									resizers:{
										horizontal:true,
										vertical:false
									},
									field:'label',
									type:'text',
									data:{
										label:header.label
									},
									columns:$pick(header.columns,[])
								});

								if (cellObj.options.columns.length) {
									cellObj.build();
								};
							}.bind(this),
							onGroupCellCreate:function(cellObj,parentObj,rowObj,grid) {
								var parts = cellObj.getId().split('.');
								var main = this.columns.header[parts[0].toInt()];
									header = main.columns[parts[1].toInt()];
								cellObj.setOptions({
									resizers:{
										horizontal:true,
										vertical:false
									},
									field:'label',
									type:'text',
									data:{
										label:header.label
									}
								});
							}.bind(this)
						});
						break;
					case 'body':
						$extend(params,{
							rows:this.options.data.length,
							scrollbars:{
								vertical:true,
								horizontal:false
							},
							onRowResize:function(row,height,instance) {
								instance.update();
								this.updateSize();
							}.bind(this),
							onColResize:function(col,width,instance){
								this.hscroll.updateSlider();
							}.bind(this),
							onCellCreate:function(cellObj,rowObj){
								var row = rowObj.getId(), column = cellObj.getId();
								var data = this.options.data[row],
									header = this.columns[section][column];
								cellObj.setOptions(header,{
									data:data,
									resizers:{
										horizontal:false
									}
								});
							}.bind(this),
							onScrollHorizontal:function(x,ox){
								if ($defined(this.$scrollingTime)) {
									clearTimeout(this.$scrollingTime);	
								}
								
								this.container.addClass('scrolling');
																
								if (this.hscroll.set(x)){
									var clearScroller = function(){
										this.container.removeClass('scrolling');
									};
									this.$scrollingTime = clearScroller.delay(2000,this);	
								} else {
									this.container.removeClass('scrolling');
								}								
							}.bind(this),
							onCellContentAction:function(data,column,e,cell,row,grid){
								this.fireEvent('onCellContentAction',[data,column,e,cell,row,grid,this]);
							}.bind(this)
						});
						break;
				}
				$extend(params,this.options[section]);
				this.grids[section] = new TPH.Grid(new Element('div',{'class':classes[section]}).inject(this.container),$merge(params,{
					/*
					onColResize:function(col,width,instance){
						for(section in this.grids) {
							var grid = this.grids[section];
							if (grid!=instance) {
								grid.setColumnWidth(col,width);
							}
						}
						
					}.bind(this),
					*/					
					onScroll:function(x,y,instance){
						for(section in this.grids){
							var grid = this.grids[section];
							if (grid!=instance){
								grid.scrollTo(x,y,false);	
							}
						}
					}.bind(this),
					onPanStart:function(panStart,instance){
						for(section in this.grids){
							var grid = this.grids[section];
							if (grid!=instance){
								grid.panStart = panStart;	
							}
						}
					}.bind(this)
				}));
			}
		}.bind(this));
		
		for(section in this.grids){
			var grid = this.grids[section];
			this.options.columns.each(function(column,i){
				if ($defined(column.width)) {
					grid.setColumnWidth(i,column.width);	
				}
			});	
			
		}
		this.handleNavigation();
		this.updateSize();
		
		
		
		this.fireEvent('onReady',[this]);
	},
	buildColumns:function(){
		this.columns = {
			header:[],
			body:[]
		};
		this.options.columns.each(function(column,i){
			this.columns.header.push(column);
			if ($defined(column.columns)) {
				column.columns.each(function(col,j){
					this.columns.body.push($merge(col,{
						group:i,
						index:j
					}));
				}.bind(this));
			} else {
				this.columns.body.push($merge(column,{
					index:i
				}));
			}
		}.bind(this));
		return this;
	},
	handleNavigation:function(){
		this.hscroll = new TPH.Scrollbar(this.container,this.grids.body.viewport,{
			onScroll:function(x,y){
				for(var section in this.grids){
					var grid = this.grids[section].scrollTo(x,scroll.y,false);
				}
			}.bind(this)
		});
	},
	updateSize:function(){
		var height=0;
		['header','footer'].each(function(section){
			var grid = this.grids[section];
			if ($defined(grid)) {
				if (this.options.height=='fit') {
					grid.setHeight(grid.wrapper.getCoordinates().height);
				}
				var vp = grid.viewport;
				height+=vp.getCoordinates().height+2;
			}
		}.bind(this));
		var grid = this.grids.body; 
		grid.setHeight(this.options.height=='fit'?(this.container.getCoordinates().height-height):grid.wrapper.getCoordinates().height);
		if ($defined(this.hscroll)) {
			this.hscroll.updateSlider();	
		}
		
		return this;
	},
	reload:function(){
		this.updateSize();
		
		['header','body','footer'].each(function(section){
			var grid = this.grids[section];
			if ($defined(grid)) {
				grid.update().render();
			}
		}.bind(this));
		
		return this;
	},
	setData:function(data){
		this.setOptions({data:data});
		this.grids.body.clear().resize(this.options.data.length,this.options.columns.length); //setOptions({rows:this.options.data.length});
		//console.log(this.grids.body.options);
		//this.grids.body.build();//update().render();
		return this;
	}
});
