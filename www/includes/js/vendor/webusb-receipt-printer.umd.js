var WebUSBReceiptPrinter = new Class({
    Implements:[
        Events,Options
    ],
    $device:null,
    $profile:null,
    $endpoints: {
		input:		null,
		output:		null
	},
    initialize:function(options){
        this.setOptions(options);
        navigator.usb.addEventListener('disconnect', event => {
			if (this.$device == event.device) {
                this.fireEvent('onDisconnected');
			}
		});
    },
    connect:function(customProfile,onConnect,onFailure){
        if ($defined(customProfile)) {
            WebUSBReceiptPrinter.DeviceProfiles.push(customProfile);
        }
        try {
			navigator.usb.requestDevice({ 
				filters: WebUSBReceiptPrinter.DeviceProfiles.map(i => i.filters).reduce((a, b) => a.concat(b))
			}).then(function(device){
                console.log('Paired USB Device',device);
                this.open(device,onConnect,onFailure);
            }.bind(this),onFailure);		
		} catch(error) {
			console.log('Could not connect! ' + error);
			$pick(onFailure,$empty)(error);
		}
    },
	reconnect:function(previousDevice,onReconnect,onFailure) {
		try {
			navigator.usb.getDevices()
				.then(function(devices){
					var device = devices.find(device => device.serialNumber == previousDevice.serialNumber)
					if (!device) {
						device = devices.find(device => device.vendorId == previousDevice.vendorId && device.productId == previousDevice.productId)
					}
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

        this.$profile = WebUSBReceiptPrinter.DeviceProfiles.find(
			item => item.filters.some(
				filter => filter.vendorId && filter.productId ? filter.vendorId == this.$device.vendorId && filter.productId == this.$device.productId : filter.vendorId == this.$device.vendorId
			)
		);

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
    },
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
    disconnect:function(){
        if (!$defined(this.$device)) {
			return;
		}

		this.$device.close()
        .then(function(){
            this.$device = null;
            this.$profile = null;

            this.fireEvent('onDisconnected');
        }.bind(this));
    },
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
});

WebUSBReceiptPrinter.DeviceProfiles = [

	/* POS-8022 and similar printers */
	{
		filters: [
			{ vendorId: 0x0483, productId: 0x5743 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'default'
	},
			
	/* POS-5805, POS-8360 and similar printers */
	{
		filters: [
			{ vendorId: 0x0416, productId: 0x5011 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'zjiang'
	},
			
	/* MPT-II and similar printers */
	{
		filters: [
			{ vendorId: 0x0483, productId: 0x5840 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'mpt'
	},
			
	/* Samsung SRP */
	{
		filters: [
			{ vendorId: 0x0419 }, { vendorId: 0x1504 }
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'bixolon'
	},
			
	/* Star */
	{
		filters: [
			{ vendorId: 0x0519 }
		],
		
		configuration:		1,
		interface:			0,
		

		/*

			vendorId	productId	productName

									FVP10				star-line
			0x0519		0x0001		TSP650II			star-line
									TSP700II			star-line
									TSP800II			star-line
									SP700				star-line
			0x0519 		0x0003		TSP100II			star-graphics
									TSP100III			star-graphics
									TSP100IV			star-prnt
			0x0519		0x0017		mPOP				star-prnt
			0x0519		0x0019		mC-Label3			star-prnt
			0x0519		0x000b		BSC10				esc-pos
			0x0519		0x0011		BSC10BR				esc-pos
			0x0519		0x001b		BSC10II				esc-pos
			0x0519		0x0043		SM-S230i			
			0x0519		0x0047		mC-Print3			star-prnt
			0x0519		0x0049		mC-Print2			star-prnt

		*/

		language:			device => {
								let language = 'star-line';
								let name = device.productName;

								/* 
									Even though the product names are a bit messy, the best way to distinguish between 
									models is by the product name. It is not possible to do it by the productId alone, 
									as the same productId is used for different models supporting different languages.

									But we do need to normalize the names a bit, as they are not consistent.

									For example:	
									TSP654 (STR_T-001) -> TSP650
									Star TSP143IIIU -> TSP100III									
								*/
								
								name = name.replace(/^Star\s+/i, '');
								name = name.replace(/^TSP(1|4|6|7|8|10)(13|43)(.*)?$/, (m, p1, p2, p3) => 'TSP' + p1 + '00' + (p3 || ''));
								name = name.replace(/^TSP(55|65)(1|4)(.*)?$/, (m, p1, p2, p3) => 'TSP' + p1 + '0' + (p3 || ''));
								name = name.replace(/^TSP([0-9]+)(II|III|IV|V|VI)?(.*)?$/, (m, p1, p2) => 'TSP' + p1 + (p2 || ''));

								switch(name) {
									case 'TSP100IV':
									case 'mPOP':
									case 'mC-Label3':
									case 'mC-Print3':
									case 'mC-Print2':
										language = 'star-prnt';
										break;

									case 'TSP100':
									case 'TSP100II':
									case 'TSP100III':
										language = 'star-graphics';
										break;

									case 'BSC10':
									case 'BSC10BR':
									case 'BSC10II':
										language = 'esc-pos';
										break;
								}

								return language;
							},

		codepageMapping:	'star'
	},

	/* Epson */
	{
		filters: [
			{ vendorId: 0x04b8 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'epson'
	},

	/* Citizen */
	{
		filters: [
			{ vendorId: 0x1d90 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'citizen'
	},

	/* HP */
	{
		filters: [
			{ vendorId: 0x05d9 },
		],

		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'hp'
	},

	/* Fujitsu */

	{
		filters: [
			{ vendorId: 0x04c5 },
		],

		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'epson'
	},
			
	/* Dtronic */
	{
		filters: [
			{ vendorId: 0x0fe6, productId: 0x811e },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'epson'
	},

	/* Xprinter */
	{
		filters: [
			{ vendorId: 0x1fc9, productId: 0x2016 },
		],
		
		configuration:		1,
		interface:			0,

		language:			'esc-pos',
		codepageMapping:	'xprinter'
	}
];