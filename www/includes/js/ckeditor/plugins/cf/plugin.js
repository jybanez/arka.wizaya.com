/*
Copyright (c) 2011, Pub-Me CMS - Michal Malenek. All rights reserved.
Custom YouTube plugin for CKEditor by CKSource - Frederico Knabben.
*/

if ( typeof(CFCKEDITOR) == "undefined" || CFCKEDITOR === null )
{
	var CFCKEDITOR = {};
}

(function()
{
	// name of the plugin
	var cfPluginName = '_cf_extratags';

	// definition of custom tags
	var cfCustomTags = {
		field : {
			dtd : [ '$empty','$inline','$body','div' ]
		}
	};
	
	// setttings end

	CFCKEDITOR[cfPluginName] = {
		pluginName : cfPluginName,
		getLang : function ( editor, cfTagName )
		{				
			// prevent "lang error"
			if ( !editor.lang.cf )
				editor.lang.cf = {};
			if ( !editor.lang.cf[this.pluginName] )
				editor.lang.cf[cfPluginName] = {};
			if ( !editor.lang.cf[this.pluginName][cfTagName] )
				editor.lang.cf[this.pluginName][cfTagName] =
				{
					fakeObjectTitle : cfTagName,
					mainMenu : cfTagName,
					properties : cfTagName
				}
			var tagLang = editor.lang.cf[ this.pluginName ][ cfTagName ];

			// update on hover title
			if ( !editor.lang.fakeobjects[cfTagName] )
				editor.lang.fakeobjects[cfTagName] = tagLang.fakeObjectTitle;

			return tagLang;
		},
		loadValue : function ( attributes )
		{
			if ( this.id in attributes )
				this.setValue ( attributes [ this.id ] );
		},
		commitValue : function ( attributes )
		{
			attributes [ this.id ] = this.getValue();
		},
		onShow : function( t, editor )
		{
			// Clear previously saved elements.
			t.fakeImage = t.iframeNode = null;

			var fakeImage = t.getSelectedElement();
			if ( fakeImage && fakeImage.data( 'cke-real-element-type' ) && fakeImage.data( 'cke-real-element-type' ) == tagName )
			{
				// custom tag needs to be parsed using "brutal force" - it is not possible to use inner/outerHTML and getAttributes methods
				// as custom tags are not included in dom for some reason
				// so we simply take the "realelement" string and search for quotes and apostrophes instead
				// We assume the format is <tag arg="something" arg2='something' /> or <tag arg="something" arg2='something'>something</tag> 
				t.fakeImage = fakeImage;
				var html = decodeURIComponent( fakeImage.data( 'cke-realelement' ) );
				var attributes = [];
				
				var i, i1, i2, attribute, attributeValue, useChar;
				
				i = html.indexOf(" ");
				html = html.substr ( i );

				while ( html.indexOf("=")>=0 )
				{
					i = html.indexOf("=");
					attribute = html.substr ( 0, i ).replace(/^\s+|\s+$/g,"");
					html = html.substr ( i+1 );
					
					i = -1;
					i1 =  html.indexOf("'");
					i2 =  html.indexOf('"');
					i3 =  html.indexOf('>');

					if (i1 >= 0)
						i = i1;

					if (i2 >=0 && (i2<i || i<0) )
						i = i2;

					if (i3 >=0 && (i3<i || i<0) )
						html = "";
					
					useChar = html.substr ( i, 1 );
					html = html.substr ( i + 1 );

					if ( html.indexOf( useChar )>=0 )
					{
						i = html.indexOf( useChar );
						attributeValue = html.substr ( 0, i ).replace(/^\s+|\s+$/g,"");
						html = html.substr ( i+1 );
						attributes [ attribute ] = attributeValue;
					}
					else
						html = "";
				}
				
				t.setupContent( attributes );
				
			}
		},
		onOk : function( t, editor )
		{
			var attributes = [];
			t.commitContent( attributes );
			
			var fakeElement = new CKEDITOR.dom.element( tagName );

			for (var i in attributes)
			{
				attributes [ i ] = attributes [ i ].replace(/^\s+|\s+$/g,"");
				if ( ( i == "width" || i == "height" ) && attributes [ i ] != "" )
				{
					attributes [ i ] = parseInt ( attributes [ i ] );
					if ( attributes [ i ] <= 0 || isNaN (attributes [ i ]) )
						attributes [i] = "";
				}
					
				if ( attributes[i] != "" )
					fakeElement.setAttribute( i, attributes[i] );
			}

			newFakeImage = editor.createFakeElement( fakeElement, 'cke_' + tagName, tagName, true );

			if ( t.fakeImage )
			{
				newFakeImage.replace( t.fakeImage );
				editor.getSelection().selectElement( newFakeImage );
			}
			else
				editor.insertElement( newFakeImage );

		}
	};
	
	// extract cfCustomTags and update dtd and needed "local" variables
	var cfTagNames = [];
	for ( var tagName in cfCustomTags )
	{
		// append cfTagNames array
		cfTagNames.push ( tagName );
		
		// update custom tage dtd definition
		var dtd = CKEDITOR.dtd;
		var customDtd = cfCustomTags[ tagName ].dtd;
		dtd[tagName] = 1;
		for (var i in customDtd)
		{
			dtd[customDtd[i]][tagName] = 1;
		}

	}	

	
	CKEDITOR.plugins.add( cfPluginName,
	{
		init : function( editor )
		{
			for (var tagIndex in cfTagNames)
			{
				cfTagName = cfTagNames[tagIndex]; 

				var tagLang = CFCKEDITOR[cfPluginName].getLang( editor, cfTagName );
	
				// create new command
				editor.addCommand( cfTagName, new CKEDITOR.dialogCommand( cfTagName ) );

				//
				var iconImage = this.path + 'images/' + cfTagName + '-icon.png';
				
				// main menu button
				editor.ui.addButton( cfTagName,
					{
						label : tagLang.mainMenu || cfTagName,
						command : cfTagName,
						icon : iconImage
					});
					
				// connect with dialog file
				CKEDITOR.dialog.add( cfTagName, this.path + 'dialogs/' + cfTagName + '-dialog.js' );
	
				// If the "menu" plugin is loaded, register the menu items.
				if ( editor.contextMenu )
				{
					editor.addMenuGroup( cfTagName );

					var newMenuItems = {};
					newMenuItems[ cfTagName ] =
					{
						label : tagLang.properties || cfTagName,
						icon : iconImage,
						command : cfTagName,
						group : cfTagName
					};
					editor.addMenuItems ( newMenuItems );					
				}
				
				// bind double click to object
				editor.on( 'doubleclick', function( evt )
					{
						var element = evt.data.element;
	
						if ( element.is( 'img' ) && element.data( 'cke-real-element-type' ) == cfTagName )
							evt.data.dialog = cfTagName;
					});
					
				// register listeners for contextmenu
				if ( editor.contextMenu )
				{
					editor.contextMenu.addListener( function( element, selection )
						{
							if ( element && element.is( 'img' ) && !element.isReadOnly()
									&& element.data( 'cke-real-element-type' ) == cfTagName )
								{
									var ret = "var ret = { '" + cfTagName + "' : CKEDITOR.TRISTATE_OFF };";
									eval (ret); 
									return ret;
								}	
						});
				}

				// add css for replacement image	
				editor.addCss(
					'img.cke_' + cfTagName +
					'{' +
						'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/' + cfTagName + '-placeholder.png' ) + ');' +
						'background-position: center center;' +
						'background-repeat: no-repeat;' +
						'border: 1px solid #a9a9a9;' +
						'width: 64px;' +
						'height: 64px;' +
					'}'
					);
			}
		},
				
		afterInit : function( editor )
		{

			for (var tagIndex in cfTagNames)
			{
				cfTagName = cfTagNames[tagIndex]; 
		
				// Tyto chyby jsou jen pri inicializaci - pokud se zada rucne a pak se to ulozi, je to v databazi OK.
				// TODO  - pridava to divne <p> - chyba je v tom, že fakeImage se normálně formátuje jako obrázek - a ten je inline, tudíž musí být 
				// součástí blokového tagu - a ten je defaultně odstavec.
				// TODO - v jadru je bug, ktery pri inicializaci tagy v jednom bloku slouci do jednoho (zobrazi jen prvni, ostatni killne - i iframu)
				//     pozn.: ve skutečnosti to z <tag /><tag /> udělá <tag><tag></tag></tag>!!!
				var dataProcessor = editor.dataProcessor,
					dataFilter = dataProcessor && dataProcessor.dataFilter;
								
				if ( dataFilter )
				{
					var newRules = { elements : {} };
					newRules.elements[ cfTagName ] = function ( element )
					{
						var fakeElement = editor.createFakeParserElement( element, 'cke_'+cfTagName, cfTagName, true );
						return fakeElement;
					};

					dataFilter.addRules( newRules );

				}
			}

		},

		requires : [ 'fakeobjects' ]
	});
})();