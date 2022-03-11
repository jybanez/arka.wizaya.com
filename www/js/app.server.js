App.Server=new Class({
	Implements:[Events,Options],
	initialize:function(options){
		this.$httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
		
		this.$httpd.getURL(function(url){
			if(url.length > 0) {
				document.getElementById('url').innerHTML = "server is up: <a href='" + url + "' target='_blank'>" + url + "</a>";
			} else {
				document.getElementById('url').innerHTML = "server is down.";
			}
		});
	},
	getURL:function(){
		
	}
});