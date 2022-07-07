TPH.PropertyBox = new Class({
	Implements:[Events,Options],
	options:{
		theme:'',
		width:'fit',
		height:'fit',
		classes:{
			box:'pbox'
		},
		properties:[],
		data:{}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = document.id(container);
		this.buildGrid();
	},
	buildGrid:function(){
		var classes = this.options.classes;
		//console.log(this.options.properties.length);
		this.grid = new TPH.Grid(this.container,{
			height:this.options.height=='fit'?'100%':this.options.height,
			width:this.options.width=='fit'?'100%':this.options.width,
			
			rows:this.options.properties.length,
			columns:2,
			
			scrollbars:false,
			
			classes:{
				//container:this.options.classes.box
			},
			onColResize:function(col,width){
				this.updateSize();
			}.bind(this),
			onCellCreate:function(cellObj,rowObj) {
				var row = rowObj.getId().toInt(),
					column = cellObj.getId().toInt();
				var property = this.options.properties[row];
				if (!column) {
					cellObj.setOptions({
						field:'label',
						data:{
							label:property.label
						},
						classes:{
							container:'grid-cell property'
						}
					});
				} else {
					if (!$defined(property.columns)) {
						cellObj.setOptions(property,{
							columns:null,
							data:this.options.data,
							resizers:{
								vertical:false,
								horizontal:false
							}
						});	
					}
					
				}	
				
			}.bind(this)
		});
		window.addEvent('resize',function(){
			this.updateSize();
		}.bind(this));
		this.updateSize();
	},
	updateSize:function(){
		var viewport = this.grid.viewport.getCoordinates().width,
			property = this.grid.getColumnWidth(0);
		this.grid.setColumnWidth(1,viewport-property);
	}
});
