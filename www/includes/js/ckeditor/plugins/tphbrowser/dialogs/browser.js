CKEDITOR.dialog.add( 'tphbrowser', function( editor ) {
	return {
		title:'TPH Browser',
		minWidth:800,
		minHeight:300,
		contents:[
			{
				id:'basicTab',
				label:'Basic',
				title:'Basic',
				elements:[
					{
						type:'hbox',
						children:[
							{
								type:'html',
								style:'width:100%',
								html:'<div class="row">'
										+'<div class="six columns divider_right">'
											+'<div class="padded_right">'
												+'<dl class="definitions">'
													+'<dt>'														
														+'<label class="cke_dialog_ui_labeled_label">Image URL</label>'
													+'</dt>'
													+'<dd>'
														+'<div class="row">'
															+'<div class="eight columns">'
																+'<input type="text" class="fullWidth browserData cke_dialog_ui_input_text" rel="src"/>'
															+'</div>'
															+'<div class="four columns">'
																+'<a class="cke_dialog_ui_button tphTool" rel="browser"><span class="cke_dialog_ui_button">Browse</span></a>'
															+'</div>'
														+'</div>'
													+'</dd>'
													+'<dt><label class="cke_dialog_ui_labeled_label">Alternative Text</label></dt>'
													+'<dd><input type="text" class="fullWidth browserData cke_dialog_ui_input_text" rel="alt"/></dd>'
													+'<dt><label class="cke_dialog_ui_labeled_label">Class</label></dt>'
													+'<dd><input type="text" class="browserData cke_dialog_ui_input_text" rel="class"/></dd>'
													+'<dt><label class="cke_dialog_ui_labeled_label">Size</label></dt>'
													+'<dd>'
														+'<table class="browserTable">'
															+'<tr>'
																+'<td><label class="cke_dialog_ui_labeled_label">Width</label></td>'
																+'<td><input type="text" class="browserData cke_dialog_ui_input_text" rel="width" size="3"/></td>'
																+'<td><label class="cke_dialog_ui_labeled_label">Height</label></td>'
																+'<td><input type="text" class="browserData cke_dialog_ui_input_text" rel="height" size="3"/></td>'																
															+'</tr>'
														+'</table>'
													+'</dd>'
													+'<dt><label class="cke_dialog_ui_labeled_label">Alignment</label></dt>'
													+'<dd>'
														+'<select class="browserData cke_dialog_ui_input_select" rel="align">'
															+'<option value="">None</option>'
															+'<option value="left">Left</option>'
															+'<option value="right">Right</option>'																	
														+'</select>'
													+'</dd>'
													+'<dt><label class="cke_dialog_ui_labeled_label">Style</label></dt>'
													+'<dd><input type="text" class="fullWidth browserData cke_dialog_ui_input_text" rel="style"/></dd>'
												+'</dl>'
											+'</div>'
										+'</div>'
										+'<div class="six columns padded_left">'
											+'<ul class="selectList borderBox">'
												+'<li class="header">'
													+'<div class="float_right">'
														+'<a class="cke_dialog_ui_button"><span class="cke_dialog_ui_button iconized refreshIcon">Refresh</span></a>'
													+'</div>'
													+'<h2 class="column">Preview</h2>'
																									
												+'</li>'
												+'<li id="browserPreview" class="previewContainer">'													
												+'</li>'
											+'</ul>'
										+'</div>'
									+'</div>'
									
							}
							
						]
					}					
				]
			}			
		],
		buttons:[
			CKEDITOR.dialog.okButton,         
            CKEDITOR.dialog.cancelButton
		],
		onLoad:function(){
			this.controller = new TPHBrowser(this);
		},
		onShow:function(){
			var sel = editor.getSelection();
			var el = sel.getSelectedElement();
			this.controller.clear();
			for (field in this.controller.fields) {
				var value = $defined(el)?$(el.$).get(field):'';
				this.controller.fields[field].set('value',value);
				this.controller.preview(field);
			}
			
			this.controller.fireEvent('onShow',[this.controller]);
		},
		onOk:function(){
			this.imageElement = editor.document.createElement('img');
			for(field in this.controller.fields){
				this.imageElement.setAttribute(field,this.controller.fields[field].get('value'));
			}
			editor.insertElement(this.imageElement);
			
			this.controller.fireEvent('onOk',[this.controller]);
		}
	};
} );