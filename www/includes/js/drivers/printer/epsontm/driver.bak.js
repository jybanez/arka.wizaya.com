var EpsontmPrinterDriver = new Class({
	test:function(driver){
		var canvas = document.getElementById('canvas');
		var printer = null;
		var ePosDev = new epson.ePOSDevice();
		console.log(driver.ip,driver.port.toInt(),driver.name);
		ePosDev.connect(driver.ip, driver.port.toInt(), cbConnect,{
			eposprint:true
		});
		function cbConnect(data) {
		    if(data == 'OK' || data == 'SSL_CONNECT_OK') {
		        ePosDev.createDevice(driver.name, ePosDev.DEVICE_TYPE_PRINTER,
		                              {'crypto':false, 'buffer':false}, cbCreateDevice_printer);
		    } else {
		        console.log(data);
		    }
		}
		function cbCreateDevice_printer(devobj, retcode) {
		    if( retcode == 'OK' ) {
		        printer = devobj;
		        printer.timeout = 60000;
		        printer.onreceive = function (res) { alert(res.success); };
		        printer.oncoveropen = function () { alert('coveropen'); };
		        print();
		    } else {
		        console.log(retcode);
		    }
		}
		
		function print() {
		    printer.addText('Hello World!\n');
		    printer.addFeed();
		    printer.addFeed();
		    printer.addCut(printer.CUT_FEED);
		    printer.send();
		}
	}
});
