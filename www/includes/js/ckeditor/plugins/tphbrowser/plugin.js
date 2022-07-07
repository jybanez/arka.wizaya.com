CKEDITOR.plugins.add('tphbrowser', {
	requires: 'dialog',	
	icons: 'image', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%
	init: function (editor) {		
		var pluginName = 'tphbrowser';

		// Register the dialog.
		CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/browser.js' );
		
		var allowed = 'img[alt,!src]{border-style,border-width,float,height,margin,margin-bottom,margin-left,margin-right,margin-top,width}',
			required = 'img[alt,src]';

		if ( CKEDITOR.dialog.isTabEnabled( editor, pluginName, 'advanced' ) )
			allowed = 'img[alt,dir,id,lang,longdesc,!src,title]{*}(*)';
			
		// Register the command.
		editor.addCommand( pluginName, new CKEDITOR.dialogCommand( pluginName, {
			allowedContent: allowed,
			requiredContent: required,
			contentTransformations: [
				[ 'img{width}: sizeToStyle', 'img[width]: sizeToAttribute' ],
				[ 'img{float}: alignmentToStyle', 'img[align]: alignmentToAttribute' ]
			]
		} ) );

		// Register the toolbar button.
		editor.ui.addButton && editor.ui.addButton( 'TPH', {
			label: editor.lang.common.image,
			command: pluginName,
			toolbar: 'insert,10'
		});
		
		editor.on( 'doubleclick', function( evt ) {
			var element = evt.data.element;

			if ( element.is( 'img' ) && !element.data( 'cke-realelement' ) && !element.isReadOnly() )
				evt.data.dialog = 'tphbrowser';
		});
			
		// If the "menu" plugin is loaded, register the menu items.
		if ( editor.addMenuItems ) {
			editor.addMenuItems({
				image: {
					label: editor.lang.image.menu,
					command: pluginName,
					group: 'tph'
				}
			});
		}
		
	}
});
