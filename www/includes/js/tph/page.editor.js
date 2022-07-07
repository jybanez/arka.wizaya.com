(function(){
if (!$defined(window.TPH)) {
	window.TPH = {};
}

TPH.PageEditor = new Class({
	Implements:[Events,Options,TPH.Implementors.TemplateData],
	options:{
		classes:{
			frame:'position absolute top left right bottom'
		}
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.$editor = grapesjs.init({
			avoidInlineStyle: 1,
	        height: '100%',
	        container : container,
	        fromElement: 1,
	        showOffsets: 1,
	        storageManager: { type: null },
	        styleManager: { clearProperties: 1 },
	        plugins: ['gjs-preset-webpage'],
	        pluginsOpts: {
	        	'gjs-preset-webpage': {
	        		/*
		            modalImportTitle: 'Import Template',
		            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
		            modalImportContent: function(editor) {
		              return editor.getHtml() + '<style>'+editor.getCss()+'</style>';
		            },
		            */
		            filestackOpts: null, //{ key: 'AYmqZc2e8RLGLE7TGkX3Hz' },
		            aviaryOpts: false,
		            blocksBasicOpts: { flexGrid: 1 },
		            customStyleManager: [{
		            	name: 'General',
		            	buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
		            	properties:[
			            	{
			                	name: 'Alignment',
			                	property: 'float',
			                	type: 'radio',
			                	defaults: 'none',
			                	list: [
			                    	{ value: 'none', className: 'fa fa-times'},
			                    	{ value: 'left', className: 'fa fa-align-left'},
			                    	{ value: 'right', className: 'fa fa-align-right'}
			                  	],
		                	},{ 
	                			property: 'position', 
	                			type: 'select'
                			}
		              	],
		            },{
		                name: 'Dimension',
		                open: false,
		                buildProps: ['width', 'flex-width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
		                properties: [{
		                  id: 'flex-width',
		                  type: 'integer',
		                  name: 'Width',
		                  units: ['px', '%'],
		                  property: 'flex-basis',
		                  toRequire: 1,
		                },{
		                  property: 'margin',
		                  properties:[
		                    { name: 'Top', property: 'margin-top'},
		                    { name: 'Right', property: 'margin-right'},
		                    { name: 'Bottom', property: 'margin-bottom'},
		                    { name: 'Left', property: 'margin-left'}
		                  ],
		                },{
		                  property  : 'padding',
		                  properties:[
		                    { name: 'Top', property: 'padding-top'},
		                    { name: 'Right', property: 'padding-right'},
		                    { name: 'Bottom', property: 'padding-bottom'},
		                    { name: 'Left', property: 'padding-left'}
		                  ],
		                }],
		              },{
		                name: 'Typography',
		                open: false,
		                buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
		                properties:[
		                  { name: 'Font', property: 'font-family'},
		                  { name: 'Weight', property: 'font-weight'},
		                  { name:  'Font color', property: 'color'},
		                  {
		                    property: 'text-align',
		                    type: 'radio',
		                    defaults: 'left',
		                    list: [
		                      { value : 'left',  name : 'Left',    className: 'fa fa-align-left'},
		                      { value : 'center',  name : 'Center',  className: 'fa fa-align-center' },
		                      { value : 'right',   name : 'Right',   className: 'fa fa-align-right'},
		                      { value : 'justify', name : 'Justify',   className: 'fa fa-align-justify'}
		                    ],
		                  },{
		                    property: 'text-decoration',
		                    type: 'radio',
		                    defaults: 'none',
		                    list: [
		                      { value: 'none', name: 'None', className: 'fa fa-times'},
		                      { value: 'underline', name: 'underline', className: 'fa fa-underline' },
		                      { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}
		                    ],
		                  },{
		                    property: 'text-shadow',
		                    properties: [
		                      { name: 'X position', property: 'text-shadow-h'},
		                      { name: 'Y position', property: 'text-shadow-v'},
		                      { name: 'Blur', property: 'text-shadow-blur'},
		                      { name: 'Color', property: 'text-shadow-color'}
		                    ],
		                }],
		              },{
		                name: 'Decorations',
		                open: false,
		                buildProps: ['opacity', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
		                properties: [{
		                  type: 'slider',
		                  property: 'opacity',
		                  defaults: 1,
		                  step: 0.01,
		                  max: 1,
		                  min:0,
		                },{
		                  property: 'border-radius',
		                  properties  : [
		                    { name: 'Top', property: 'border-top-left-radius'},
		                    { name: 'Right', property: 'border-top-right-radius'},
		                    { name: 'Bottom', property: 'border-bottom-left-radius'},
		                    { name: 'Left', property: 'border-bottom-right-radius'}
		                  ],
		                },{
		                  property: 'box-shadow',
		                  properties: [
		                    { name: 'X position', property: 'box-shadow-h'},
		                    { name: 'Y position', property: 'box-shadow-v'},
		                    { name: 'Blur', property: 'box-shadow-blur'},
		                    { name: 'Spread', property: 'box-shadow-spread'},
		                    { name: 'Color', property: 'box-shadow-color'},
		                    { name: 'Shadow type', property: 'box-shadow-type'}
		                  ],
		                },{
		                  property: 'background',
		                  properties: [
		                    { name: 'Image', property: 'background-image'},
		                    { name: 'Repeat', property:   'background-repeat'},
		                    { name: 'Position', property: 'background-position'},
		                    { name: 'Attachment', property: 'background-attachment'},
		                    { name: 'Size', property: 'background-size'}
		                  ],
		                },],
		              },{
		                name: 'Extra',
		                open: false,
		                buildProps: ['transition', 'perspective', 'transform'],
		                properties: [{
		                  property: 'transition',
		                  properties:[
		                    { name: 'Property', property: 'transition-property'},
		                    { name: 'Duration', property: 'transition-duration'},
		                    { name: 'Easing', property: 'transition-timing-function'}
		                  ],
		                },{
		                  property: 'transform',
		                  properties:[
		                    { name: 'Rotate X', property: 'transform-rotate-x'},
		                    { name: 'Rotate Y', property: 'transform-rotate-y'},
		                    { name: 'Rotate Z', property: 'transform-rotate-z'},
		                    { name: 'Scale X', property: 'transform-scale-x'},
		                    { name: 'Scale Y', property: 'transform-scale-y'},
		                    { name: 'Scale Z', property: 'transform-scale-z'}
		                  ],
		                }]
		              },{
		                name: 'Flex',
		                open: false,
		                properties: [{
		                  name: 'Flex Container',
		                  property: 'display',
		                  type: 'select',
		                  defaults: 'block',
		                  list: [
		                    { value: 'block', name: 'Disable'},
		                    { value: 'flex', name: 'Enable'}
		                  ],
		                },{
		                  name: 'Flex Parent',
		                  property: 'label-parent-flex',
		                  type: 'integer',
		                },{
		                  name      : 'Direction',
		                  property  : 'flex-direction',
		                  type    : 'radio',
		                  defaults  : 'row',
		                  list    : [{
		                            value   : 'row',
		                            name    : 'Row',
		                            className : 'icons-flex icon-dir-row',
		                            title   : 'Row',
		                          },{
		                            value   : 'row-reverse',
		                            name    : 'Row reverse',
		                            className : 'icons-flex icon-dir-row-rev',
		                            title   : 'Row reverse',
		                          },{
		                            value   : 'column',
		                            name    : 'Column',
		                            title   : 'Column',
		                            className : 'icons-flex icon-dir-col',
		                          },{
		                            value   : 'column-reverse',
		                            name    : 'Column reverse',
		                            title   : 'Column reverse',
		                            className : 'icons-flex icon-dir-col-rev',
		                          }],
		                },{
		                  name      : 'Justify',
		                  property  : 'justify-content',
		                  type    : 'radio',
		                  defaults  : 'flex-start',
		                  list    : [{
		                            value   : 'flex-start',
		                            className : 'icons-flex icon-just-start',
		                            title   : 'Start',
		                          },{
		                            value   : 'flex-end',
		                            title    : 'End',
		                            className : 'icons-flex icon-just-end',
		                          },{
		                            value   : 'space-between',
		                            title    : 'Space between',
		                            className : 'icons-flex icon-just-sp-bet',
		                          },{
		                            value   : 'space-around',
		                            title    : 'Space around',
		                            className : 'icons-flex icon-just-sp-ar',
		                          },{
		                            value   : 'center',
		                            title    : 'Center',
		                            className : 'icons-flex icon-just-sp-cent',
		                          }],
		                },{
		                  name      : 'Align',
		                  property  : 'align-items',
		                  type    : 'radio',
		                  defaults  : 'center',
		                  list    : [{
		                            value   : 'flex-start',
		                            title    : 'Start',
		                            className : 'icons-flex icon-al-start',
		                          },{
		                            value   : 'flex-end',
		                            title    : 'End',
		                            className : 'icons-flex icon-al-end',
		                          },{
		                            value   : 'stretch',
		                            title    : 'Stretch',
		                            className : 'icons-flex icon-al-str',
		                          },{
		                            value   : 'center',
		                            title    : 'Center',
		                            className : 'icons-flex icon-al-center',
		                          }],
		                },{
		                  name: 'Flex Children',
		                  property: 'label-parent-flex',
		                  type: 'integer',
		                },{
		                  name:     'Order',
		                  property:   'order',
		                  type:     'integer',
		                  defaults :  0,
		                  min: 0
		                },{
		                  name    : 'Flex',
		                  property  : 'flex',
		                  type    : 'composite',
		                  properties  : [{
		                          name:     'Grow',
		                          property:   'flex-grow',
		                          type:     'integer',
		                          defaults :  0,
		                          min: 0
		                        },{
		                          name:     'Shrink',
		                          property:   'flex-shrink',
		                          type:     'integer',
		                          defaults :  0,
		                          min: 0
		                        },{
		                          name:     'Basis',
		                          property:   'flex-basis',
		                          type:     'integer',
		                          units:    ['px','%',''],
		                          unit: '',
		                          defaults :  'auto',
		                        }],
		                },{
		                  name      : 'Align',
		                  property  : 'align-self',
		                  type      : 'radio',
		                  defaults  : 'auto',
		                  list    : [{
		                            value   : 'auto',
		                            name    : 'Auto',
		                          },{
		                            value   : 'flex-start',
		                            title    : 'Start',
		                            className : 'icons-flex icon-al-start',
		                          },{
		                            value   : 'flex-end',
		                            title    : 'End',
		                            className : 'icons-flex icon-al-end',
		                          },{
		                            value   : 'stretch',
		                            title    : 'Stretch',
		                            className : 'icons-flex icon-al-str',
		                          },{
		                            value   : 'center',
		                            title    : 'Center',
		                            className : 'icons-flex icon-al-center',
		                          }],
		                }]
		              }
		            ],
		          },
		        }
		});
		
		var pn = this.$editor.Panels;
	    var modal = this.$editor.Modal;
	    var cmdm = this.$editor.Commands;
	    cmdm.add('canvas-clear', function() {
	        if(confirm('Areeee you sure to clean the canvas?')) {
	          var comps = this.$editor.DomComponents.clear();
	          setTimeout(function(){ localStorage.clear();}, 0);
	        }
	    }.bind(this));
	    cmdm.add('set-device-desktop', {
	        run: function(ed){
	        	ed.setDevice('Desktop');
	        },
	        stop:function(){
	        	
	        },
	    });
	    cmdm.add('set-device-tablet', {
	        run: function(ed){
	        	ed.setDevice('Tablet');
	        },
	        stop:function(){},
	    });
	    cmdm.add('set-device-mobile', {
	        run: function(ed){
	        	ed.setDevice('Mobile portrait');	
	        },
	        stop:function(){},
	    });
	    
	    
		cmdm.add('page-save',function(ed){
			//TPH.alert('System Message','Save data!');
			var obj = ed.store();
			if ($type(this.options.saveRoutine)=='function') {
				this.options.saveRoutine(obj.components);
			}
		}.bind(this));
		
		pn.addButton('options',{
			id:'page-save',
			className:'fa fa-save',
			command:function(){
				this.$editor.runCommand('page-save');
			}.bind(this),
			attributes:{
				title:'Save',
				'data-tooltip-pos':'bottom'
			}
		});
		
		pn.removeButton('options','export-template');
		pn.removeButton('options','gjs-open-import-webpage');
	
		/*
	    // Add info command
	    var mdlClass = 'gjs-mdl-dialog-sm';
	    var infoContainer = document.getElementById('info-panel');
	    cmdm.add('open-info', function() {
	        TPH.alert('System Message','Info');
	    });
	    pn.addButton('options', {
	        id: 'open-info',
	        className: 'fa fa-question-circle',
	        command: function() { 
	        	this.$editor.runCommand('open-info'); 
        	}.bind(this),
	        attributes: {
	          'title': 'About',
	          'data-tooltip-pos': 'bottom',
	        }
	    });
		*/
		
	    // Show borders by default
	    //pn.getButton('options', 'sw-visibility').set('active',true);
	    /*
	    cmdm.add('open-info',function(){
	    	this.pageInfo();
	    }.bind(this));
	    pn.addButton('views',{
	    	id:'page-info',
	    	className:'fa fa-info-circle',
	    	attributes: {
	          'title': 'Page Info',
	          'data-tooltip-pos': 'bottom',
	       	},
	       	command:{
	       		run:function(){
	       			this.$editor.runCommand('open-info');
	       		}.bind(this),
	       		stop:function(){
	       			if ($defined(this.$pageInfo)) {
	       				this.$pageInfo.empty();
	       			}
	       		}.bind(this)
	       	}
	    });
	    */
	},
	destroy:function(){
		
	},
	/*
	pageInfo:function(){
		var pn = this.$editor.Panels;
		if (!$defined(this.$pageInfo)) {
			this.$pageInfo = new Element('div',{
				'class':'pageInfo'
			});
		}
		this.$pageInfo.inject(pn.getPanel('views-container').view.el);
		this.applyTemplateData(this.$pageInfo,this.options.templates.info,this.options.data);
		this.fireEvent('onLoadPageInfo',[this.$pageInfo,this]);
	},
	openPageInfo:function(){
		var pn = this.$editor.Panels;
		pn.getPanel('views-container').active();
		this.$editor.runCommand('open-info');
	}
	*/
});

}());
