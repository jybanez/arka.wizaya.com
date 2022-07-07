/*
Copyright (c) 2011 - 2012, Pub-Me CMS - Michal Malenek. All rights reserved.
Custom YouTube plugin for CKEditor by CKSource - Frederico Knabben.
*/

(function ()
{
	cfPluginName = '_cf_extratags';
	tagName = 'field';	

	CKEDITOR.dialog.add( tagName, function( editor )
	{
		var tagLang = CFCKEDITOR[cfPluginName].getLang( editor, tagName );

		if ( typeof editor.config.cffieldWidth == 'undefined' )
			editor.config.cffieldWidth = 640; 
		if ( typeof editor.config.cffieldHeight == 'undefined' )
			editor.config.cffieldHeight = 360;

		return {
			title : tagLang.properties,
			minWidth : 400,
			minHeight : 200,
			contents :
			[
				{
					elements :
					[						
						{
							type : 'vbox',
							children :
							[
								{
									type : 'text',
									id : 'src',
									label : tagLang.source || 'Source',
									setup : CFCKEDITOR[cfPluginName].loadValue,
									commit : CFCKEDITOR[cfPluginName].commitValue
								},
								{
									type : 'html',
									html : tagLang.explainsource || ''
								},
								{
									type : 'hbox',
									widths : [ '50%', '50%' ],
									children :
									[
										{
											type : 'text',
											id : 'width',
											'default' : editor.config.cffieldWidth,
											label : tagLang.width || 'Width',
											setup : CFCKEDITOR[cfPluginName].loadValue,
											commit : CFCKEDITOR[cfPluginName].commitValue
										},	 
										{
											type : 'text',
											id : 'height',
											'default' : editor.config.cffieldHeight,
											label : tagLang.height || 'Height',
											setup : CFCKEDITOR[cfPluginName].loadValue,
											commit : CFCKEDITOR[cfPluginName].commitValue
										}
									]
								},
								{
									type : 'text',
									id : 'title',
									label : tagLang.title || 'Title',
									setup : CFCKEDITOR[cfPluginName].loadValue,
									commit : CFCKEDITOR[cfPluginName].commitValue
								}	 
							]
						}
					]
				}
			],
			onShow : function()
			{
				CFCKEDITOR[cfPluginName].onShow ( this, editor );
			},
			onOk : function()
			{
				CFCKEDITOR[cfPluginName].onOk ( this, editor );
			}

		}	
	});

})();