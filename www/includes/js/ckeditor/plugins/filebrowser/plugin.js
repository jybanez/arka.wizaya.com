console.log('TEST');
CKEDITOR.plugins.add( 'filebrowser', {
    icons: 'filebrowser',
    init: function( editor ) {
		editor.addCommand( 'filebrowserDialog', new CKEDITOR.dialogCommand( 'filebrowserDialog' ) );
		editor.ui.addButton( 'filebrowser', {
		    label: 'File Browser',
		    command: 'filebrowserDialog',
		    toolbar:'insert'
		});
		
		CKEDITOR.dialog.add( 'filebrowserDialog', this.path + 'dialogs/filebrowser.js' );
    }
});