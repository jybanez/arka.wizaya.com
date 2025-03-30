var WebBluetoothReceiptPrinter = new Class({
    Implements:[
        Events,Options
    ],
    $device:null,
    $profile:null,
    $characteristics: {
		print:		null,
		status:		null
	},
    initialize:function(options){
        this.setOptions(options);
        this.$queue = new WebBluetoothReceiptPrinter.CallbackQueue();
        navigator.bluetooth.addEventListener('disconnect', function(event){
			if (this.$device == event.device) {
                this.fireEvent('onDisconnected');
			}
		}.bind(this));
    },
    connect:function(customProfile,onConnect,onFailure){
        if ($defined(customProfile)) {
            WebBluetoothReceiptPrinter.DeviceProfiles.push(customProfile);
        }
        var filters =WebBluetoothReceiptPrinter.DeviceProfiles.map(i => i.filters).reduce((a, b) => a.concat(b));
		var optionalServices = WebBluetoothReceiptPrinter.DeviceProfiles.map(i => Object.values(i.functions).map(f => f.service)).reduce((a, b) => a.concat(b)).filter((v, i, a) => a.indexOf(v) === i);

        try {
			navigator.bluetooth.requestDevice({ 
				filters, optionalServices
			}).then(function(device){
                console.log('Paired Bluetooth Device',device);
                this.open(device,onConnect,onFailure);
            }.bind(this),onFailure);		
		} catch(error) {
			console.log('Could not connect! ' + error);
			$pick(onFailure,$empty)(error);
		}
    },
	reconnect:function(previousDevice,onReconnect,onFailure) {
		try {
			navigator.bluetooth.getDevices()
				.then(function(devices){
					var device = devices.find(device => device.id == previousDevice.id);
					if (device){
						this.open(device,onReconnect,onFailure);
					} else {
						this.fireEvent('onReconnectError',[device,'unable to find device.']);
					}
				}.bind(this),onFailure);
		} catch(error) {
			console.log('Could not reconnect! ' + error);
			this.fireEvent('onReconnectError',[null,error]);
		}
	},
    open:function(device,onOpen,onFailure){
        this.$device = device;
		/*
        this.$device.gatt.connect().then(function(server){
            console.log(server);
        }.bind(this),function(err){
            console.log(err);
        }.bind(this));
        
        return;
		*/
        this.$device.gatt.connect().then(function(server){
            console.log('Server',server);
            server.getPrimaryServices().then(function(services){
                console.log('Services',services);
                var uuids = services.map(service => service.uuid);
                console.log('uuids',uuids);

                this.$profile = WebBluetoothReceiptPrinter.DeviceProfiles.find(item => item.filters.some(filter => this.evaluateFilter(filter, uuids)));
                console.log('profiles',this.$profile);

                server.getPrimaryService(this.$profile.functions.print.service).then(function(printService){
			        printService.getCharacteristic(this.$profile.functions.print.characteristic).then(function(print){
                        this.$characteristics.print = print;

                        if (this.$profile.functions.status) {
                            server.getPrimaryService(this.$profile.functions.status.service).then(function(statusService){
                                statusService.getCharacteristic(this.$profile.functions.status.characteristic).then(function(status){
                                    this.$characteristics.status = status;
									console.log('Connected!');
									this.fireEvent('onConnected',{
										type:				'bluetooth',
										name: 				this.$device.name,
										id: 				this.$device.id,
										language: 			this.evaluate(this.$profile.language),
										codepageMapping:	this.evaluate(this.$profile.codepageMapping)
									});
									$pick(onOpen,$empty)();
                                }.bind(this),function(err){
                                    this.fireEvent('onGetPrintServiceStatusCharacteristicError',[err,this]);
                                    $pick(onFailure,$empty)(err);
                                }.bind(this));
                            }.bind(this),function(err){
                                this.fireEvent('onGetPrintServiceStatusError',[err,this]);
                                $pick(onFailure,$empty)(err);
                            }.bind(this));
                        } else {
							console.log('Connected!');
							this.fireEvent('onConnected',{
								type:				'bluetooth',
								name: 				this.$device.name,
								id: 				this.$device.id,
								language: 			this.evaluate(this.$profile.language),
								codepageMapping:	this.evaluate(this.$profile.codepageMapping)
							});
							$pick(onOpen,$empty)();
						}
                        
                    }.bind(this),function(err){
                        console.log('onGetPrintServiceCharacteristicError');
                        this.fireEvent('onGetPrintServiceCharacteristicError',[err,this]);
                        $pick(onFailure,$empty)(err);
                    }.bind(this));
                }.bind(this),function(err){
                    console.log('onGetPrimaryServiceError');
                    this.fireEvent('onGetPrimaryServiceError',[err,this]);
                    $pick(onFailure,$empty)(err);
                }.bind(this));
            }.bind(this),function(err){
                console.log('onGetPrimaryServicesError');
                this.fireEvent('onGetPrimaryServicesError',[err,this]);
                $pick(onFailure,$empty)(err);
            }.bind(this));
        }.bind(this),function(err){
            console.log('onOpenError');
			this.fireEvent('onOpenError',[err,this]);
			$pick(onFailure,$empty)(err);
		}.bind(this));
		
		

        
        /*
		this.$device.open()
        .then(function(){
            this.$device.selectConfiguration(this.$profile.configuration)
            .then(function(){
                this.$device.claimInterface(this.$profile.interface)
                .then(function(){
                    var iface = this.$device.configuration.interfaces.find(i => i.interfaceNumber == this.$profile.interface);

                    this.$endpoints.output = iface.alternate.endpoints.find(e => e.direction == 'out');
                    this.$endpoints.input = iface.alternate.endpoints.find(e => e.direction == 'in');

                    this.fireEvent('onConnected',[{
                        type:				'usb',
                        manufacturerName: 	this.$device.manufacturerName,
                        productName: 		this.$device.productName,
                        serialNumber: 		this.$device.serialNumber,
                        vendorId: 			this.$device.vendorId,
                        productId: 			this.$device.productId,			
                        language: 			this.$profile.language,
                        codepageMapping:	this.$profile.codepageMapping
                    }]);
                    
                    this.$device.reset()
					.then(onOpen,onFailure)
                    .catch(function(e){
                        console.log('Unable to reset device.');
                    });
                }.bind(this),function(err){
					this.fireEvent('onClaimInterfaceError',[err,this]);
					$pick(onFailure,$empty)(err);
				}.bind(this));
            }.bind(this),function(err){
				this.fireEvent('onSelectConfigurationError',[err,this]);
				$pick(onFailure,$empty)(err);
			}.bind(this));
        }.bind(this),function(err){
			this.fireEvent('onOpenError',[err,this]);
			$pick(onFailure,$empty)(err);
		}.bind(this));
        */
    },
    evaluate:function(expression) {
		if (typeof expression == 'function') {
			return expression(this.$device);
		}

		return expression;
	},
    evaluateFilter:function(filter, uuids) {
		if (filter.services) {
			for (let service of filter.services) {
				if (!uuids.includes(service)) {
					return false;
				}
			}
		}

		if (filter.name) {
			if (this.$device.name != filter.name) {
				return false;
			}
		}

		if (filter.namePrefix) {
			if (!this.$device.name.startsWith(filter.namePrefix)) {
				return false;
			}
		}

		return true;
	},

    listen:async function() {
		if (this.$characteristics.status) {	
			this.$characteristics.status.startNotifications().then(function(){
                this.$characteristics.status.addEventListener( "characteristicvaluechanged", function(e){
                    this.fireEvent('onData',[e.target.value]);
                }.bind(this));
            }.bind(this),function(err){
                this.fireEvent('onStartNotificationsError',[err,this]);
            }.bind(this));

			return true;
		}
		return false;
	},
    /*
    read:function(){
        if (!$defined(this.$device)) {
			return;
		}

		try {
            this.$device.transferIn(this.$endpoints.input.endpointNumber, 64)
            .then(function(result){
                if (result instanceof USBInTransferResult) {
                    if (result.data.byteLength) {
                        fireEvent('onData',[result.data]);
                    }
                }
    
                this.read();
            }.bind(this));
		} catch(e) {
		}
    },
    */
    disconnect() {
		if (!this.$device) {
			return;
		}

		this.$device.gatt.disconnect();
		this.$device = null;
		this.$characteristics.print = null;
		this.$characteristics.status = null;
		this.$profile = null;
		this.fireEvent('onDisconnected',[this]);
	},
    print(commands,onPrint,onError) {
		//if (ArrayBuffer.isView(commands)) {
		//	commands = [ commands ];
		//}
		var data = new Array();
		var commandLength = commands.length;
		var maxLength = this.$profile.messageSize || 100;
		var chunks = Math.ceil(commandLength / maxLength);

		if (chunks === 1) {
			data.push(commands);
			//this.$characteristics.print.writeValueWithResponse(data);
			
			//if (this.$profile.sleepAfterCommand) {
			//	this.$queue.sleep(this.$profile.sleepAfterCommand);
			//}
		} else {
			for (var i = 0; i < chunks; i++) {
				var byteOffset = i * maxLength;
				var length = Math.min(commandLength, byteOffset + maxLength);
				data.push(commands.slice(byteOffset, length));

				//this.$characteristics.print.writeValueWithResponse(data);

				//if (this.$profile.sleepAfterCommand) {
				//	this.$queue.sleep(this.$profile.sleepAfterCommand);
				//}	
			}
		}
		//console.log(data);
		this.send(data,onPrint);
		//$pick(onPrint,$empty)();
	},
	send:function(data,onSend){
		if (data.length){
			var line = data.shift();
			this.$characteristics.print.writeValueWithoutResponse(line).then(function(){
				this.send(data,onSend);
			}.bind(this),function(){
				console.log('Problem sending data to BT Printer',line);
			}.bind(this));
		} else {
			$pick(onSend,$empty)();
		}
	},
	/*print(commands,onPrint,onError) {
		return new Promise(resolve => {
			if (ArrayBuffer.isView(commands)) {
				commands = [ commands ];
			}
			
			for (let command of commands) {
				const maxLength = this.$profile.messageSize || 100;
				let chunks = Math.ceil(command.length / maxLength);
		
				if (chunks === 1) {
					let data = command;

					this.$queue.add(() => this.$characteristics.print.writeValueWithResponse(data));

					if (this.$profile.sleepAfterCommand) {
						this.$queue.sleep(this.$profile.sleepAfterCommand);
					}
				} else {
					for (let i = 0; i < chunks; i++) {
						let byteOffset = i * maxLength;
						let length = Math.min(command.length, byteOffset + maxLength);
						let data = command.slice(byteOffset, length);

						this.$queue.add(() => this.$characteristics.print.writeValueWithResponse(data));

						if (this.$profile.sleepAfterCommand) {
							this.$queue.sleep(this.$profile.sleepAfterCommand);
						}	
					}
				}
			}
	
			this.$queue.add(() => resolve());
            if ($defined(onPrint)) {
                this.$queue.add(onPrint);
            }
		});
	},
    /*
    print:function(command,onPrint,onError){
        if (this.$device && this.$endpoints.output) {
			//var commandString = $type(command)=='array'?command.join('\r\n'):command;
			console.log('Sending Command',command);
			this.$device.transferOut(this.$endpoints.output.endpointNumber, command)
			.then(function(result){
				$pick(onPrint,$empty)(result);
			}.bind(this))
			.catch(function(e){
				console.log('Print Error',e);
				$pick(onError,$empty)(e);
			}.bind(this))
		}
    }
        */
});

WebBluetoothReceiptPrinter.CallbackQueue = new Class({
    initialize:function(){
        this._queue = new Array();
        this._working = false;
    },
    add:function(data){
        this._queue.push(data);
        if (!this._working) {
            this.run();
        }
    },
    run:function(){
        if (!this._queue.length) {
            this._working = false;
            return;
        }

        this._working = true;
        var callback = this._queue.shift();
        callback();

        this.run();
    },
    sleep:function(ms){
        this.add(function(){ new Promise(function(resolve){ setTimeout(resolve,ms); }); });
    }
});

WebBluetoothReceiptPrinter.DeviceProfiles = [

	/* Epson TM-P series, for example the TM-P20II */
	{
		filters: [
			{
				namePrefix: 'TM-P'
			}
		],

		functions: {
			'print':		{
				service: 		'49535343-fe7d-4ae5-8fa9-9fafd205e455',
				characteristic:	'49535343-8841-43f4-a8d4-ecbe34729bb3'
			},

			'status':		{
				service: 		'49535343-fe7d-4ae5-8fa9-9fafd205e455',
				characteristic:	'49535343-1e4d-4bd9-ba61-23c647249616'
			}
		},

		language:			'esc-pos',
		codepageMapping:	'epson'
	},

	/* Star SM-L series, for example the SM-L200 */
	{
		filters: [
			{
				namePrefix: 'STAR L'
			}
		],

		functions: {
			'print':		{
				service: 		'49535343-fe7d-4ae5-8fa9-9fafd205e455',
				characteristic:	'49535343-8841-43f4-a8d4-ecbe34729bb3'
			},

			'status':		{
				service: 		'49535343-fe7d-4ae5-8fa9-9fafd205e455',
				characteristic:	'49535343-1e4d-4bd9-ba61-23c647249616'
			}
		},

		language:			'star-line',
		codepageMapping:	'star'
	},

	/* POS-5805, POS-8360 and similar printers */
	{
		filters: [ 
			{ 
				name: 		'BlueTooth Printer',
				services: 	[ '000018f0-0000-1000-8000-00805f9b34fb' ] 
			}
		],
		
		functions: {
			'print':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af1-0000-1000-8000-00805f9b34fb'
			},

			'status':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af0-0000-1000-8000-00805f9b34fb'
			}
		},

		language:			'esc-pos',
		codepageMapping:	'zjiang'
	}, 

	/* Xprinter */
	{
		filters: [ 
			{ 
				name: 		'Printer001',
				services: 	[ '000018f0-0000-1000-8000-00805f9b34fb' ] 
			} 
		],
		
		functions: {
			'print':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af1-0000-1000-8000-00805f9b34fb'
			},

			'status':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af0-0000-1000-8000-00805f9b34fb'
			}
		},

		language:			'esc-pos',
		codepageMapping:	'xprinter'
	}, 

	/* MPT-II printer */
	{
		filters: [ 
			{ 
				name: 		'MPT-II',
				services: 	[ '000018f0-0000-1000-8000-00805f9b34fb' ] 
			} 
		],
		
		functions: {
			'print':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af1-0000-1000-8000-00805f9b34fb'
			},

			'status':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af0-0000-1000-8000-00805f9b34fb'
			}
		},

		language:			'esc-pos',
		codepageMapping:	'mpt'
	},

	/* Cat printer */
	{
		filters: [ 
			{ 
				services: 	[ '0000ae30-0000-1000-8000-00805f9b34fb' ] 
			} 
		],
		
		functions: {
			'print':		{
				service: 		'0000ae30-0000-1000-8000-00805f9b34fb',
				characteristic:	'0000ae01-0000-1000-8000-00805f9b34fb'
			},

			'notify':		{
				service: 		'0000ae30-0000-1000-8000-00805f9b34fb',
				characteristic:	'0000ae02-0000-1000-8000-00805f9b34fb'
			}

		},

		language:			'meow',
		codepageMapping:	'default',
		messageSize:		200,
		sleepAfterCommand:	30
	},

	/* Generic printer */
	{
		filters: [ 
			{ 
				services: 	[ '000018f0-0000-1000-8000-00805f9b34fb' ] 
			} 
		],
		
		functions: {
			'print':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af1-0000-1000-8000-00805f9b34fb'
			},

			'status':		{
				service: 		'000018f0-0000-1000-8000-00805f9b34fb',
				characteristic:	'00002af0-0000-1000-8000-00805f9b34fb'
			}
		},

		language:			'esc-pos',
		codepageMapping:	'default'
	}
];