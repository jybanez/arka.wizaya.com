var TPHGoogleMap = new Class({
	Implements:[Options,Events],	
	options:{
		zoomFactor:14,
	    map:{
	        scrollwheel: false,
            navigationControl: false,
            mapTypeControl: false,
            scaleControl: false,
            draggable: true
	    }
	},
	initialize:function(container,options){
		//return;
		this.setOptions(options);
		this.container = $type(container)=='string'?$(container):container;
		this.geocoder = new google.maps.Geocoder();
		this.codeAddress();
	},
	codeAddress:function(address) {
		var self = this;
		var address = $pick(address,this.options.address);
	    this.geocoder.geocode( { 'address': address}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	      	self.location = results[0].geometry.location;
			var params = $merge(self.options.map,{
                zoom: self.options.zoomFactor,
                center: new google.maps.LatLng(self.location.Xa, self.location.Ya),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
			if (!$defined(self.map)) {
				self.map = new google.maps.Map(self.container, params);
			}
			self.map.setCenter(self.location);
			if ($defined(self.marker)) {
				self.marker.setMap(null); 
			}
	        self.marker = new google.maps.Marker({
	            map: self.map, 
	            position: results[0].geometry.location
	        });
	      } else {
	      	self.fireEvent('onMarkAddressFailed',[address]);
	      }
	    });
	},
	reset:function(){
		this.marker.setMap(null);
	}
});


