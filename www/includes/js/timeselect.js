var SPDateSelect = new Class({
	Implements:[Options,Events],
	options:{
		Months:[{id:'',text:'Month'}].combine('Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',')),
		yearCount:10,
		format:'%Y-%m-%d %I:%M %p',
		type:'spinner',
		presets:{}
	},
	monthDays : {
		'Jan':31,
		'Feb':28,
		'Mar':31,
		'Apr':30,
		'May':31,
		'Jun':30,
		'Jul':31,
		'Aug':31,
		'Sep':30,
		'Oct':31,
		'Nov':30,
		'Dec':31
	},
	doUpdate:false,
	initialize:function(el,options) {
		if ($defined(el.retrieve('dateselect'))) return;
		
		this.el = el;
		el.store('dateselect',this);
		
		this.setOptions(options);
		var today = new Date();
		var thisYear = $pick(this.options.presets.yearFrom,today.get('year')).toInt();
		
		this.options.Years = new Array();
		for(var i=thisYear; i<=$pick(this.options.presets.yearTo,thisYear+this.options.yearCount); i++) {
			this.options.Years.push(String(i).pad(2,'0','left'));
		}
		
		this.options.Days = new Array({id:'',text:'Day'});
		for(var i=1; i<=this.monthDays.Dec; i++) {
			this.options.Days.push(String(i).pad(2,'0','left'));
		}
		
		this.setOptions(options);
		this.options.Years.sort();
		this.options.Years.reverse();
		
		this.options.Years.unshift({id:'',text:'Year'});
		this.container = new Element('div',{'class':'dateSelectContainer'});
		if ($defined(this.options.container)) {
			this.container.injectInside(this.options.container);
		} else {
			this.container.injectAfter(el);
		} 
		
		this.elements = {
			Month : TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.Months,'classes':{container:'sp_spinner sp_spin_month'}}),
			Day : TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.Days,'classes':{container:'sp_spinner sp_spin_day'}}),
			Year : TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.Years,'classes':{container:'sp_spinner sp_spin_year'}})
		};
		
		this.reset();
	},
	set:function(date){
		this.el.set('value',date);
		this.reset();
	},
	reset:function(){
		var map = {
			Month:'%b',
			Day:'%d',
			Year:'%Y'
		};
		this.doUpdate = false;
		var value = this.el.get('value');
		if (value.length) {
			var tdate = new Date().parse(value);
			for(el in this.elements) {
				this.elements[el].removeEvents('change');
				this.elements[el].setValue(tdate.format(map[el]));
				this.elements[el].addEvent('change',function(){ this.update(); }.bind(this));
			}	
		} else {
			for(el in this.elements) {
				this.elements[el].removeEvents('change');
				this.elements[el].setValue('');
				this.elements[el].addEvent('change',function(){ this.update(); }.bind(this));
			}
		}
		this.doUpdate = true;
	},
	update:function(){
		if (!this.doUpdate) return;
		if (!this.elements.Month.getValue().length || 
			!this.elements.Day.getValue().length || 
			!this.elements.Year.getValue().length) {
			this.el.set('value','');
			this.fireEvent('onInvalid',[this]);
		} else {
			var tdate = new Date().parse(this.el.get('value'));
			tdate.set('month',this.options.Months.indexOf(this.elements.Month.getValue())-1)
						.set('date',this.elements.Day.getValue())
						.set('year',this.elements.Year.getValue())
					;
			if ($type(tdate.getTime())=='number') {
				this.el.set('value',tdate.format(this.options.format));
				this.fireEvent('onUpdate',[this.el.get('value')]);	
			} else {
				this.el.set('value','');
				this.fireEvent('onInvalid',[tdate]);
			}	
		} 
	},
	disabled:function(d){
		if ($defined(d)) {
			for(key in this.elements){
				this.elements[key].disabled(d);
			}
			this.el.set('disabled',d);
		}
		return this.el.get('disabled');
	}
});
var SPTimeSelect = new Class({
	Implements:[Events,Options],
	options:{
		Hours:[{id:'',text:'Hour'}].combine('01,02,03,04,05,06,07,08,09,10,11,12'.split(',')),
		AMPM:[{id:'',text:'--'}].combine(['AM','PM']),
		format:'%Y-%m-%d %I:%M %p',
		display:{
			ampm:true,
			hour:true,
			min:true
		},
		type:'spinner'
	},
	doUpdate:false,
	initialize:function(el,options) {
		if (el.retrieve('timeselect')) return;
		this.el = el.store('timeselect',true);
		
		this.options.Minutes = new Array({id:'',text:'Min'});
		for(var i=00; i<=59; i++) {
			this.options.Minutes.push(String(i).pad(2,'0','left'));
		}
		this.setOptions(options);
		var toptions = Json.decode(el.get('rel'));
		if($type(toptions)=='object') {
			this.setOptions(toptions); 
		}
		
		
		this.container = new Element('div',{'class':'timeSelectContainer'});
		if ($defined(this.options.container)) {
			this.container.injectInside(this.options.container);
		} else {
			this.container.injectAfter(el);
		}
		
		//var tdate = new Date().parse(el.get('value')); 
		this.elements = {};
		
		if (this.options.display.hour) {
			this.elements.Hour=TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.Hours,'classes':{container:'sp_spinner sp_spin_hour'}});
		}
		if (this.options.display.min) {	
			this.elements.Minute=TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.Minutes,'classes':{container:'sp_spinner sp_spin_minute'}});
			
		}
		if (this.options.display.ampm) {
			this.elements.AMPM=TPH.Selectors.create(this.options.type,new Element('input').injectInside(this.container),{'selections':this.options.AMPM,'classes':{container:'sp_spinner sp_spin_ampm'}});
			
		}
		this.reset();
		
	},
	set:function(time){
		this.el.set('value',time);
		this.reset();
	},
	reset:function(){
		this.doUpdate = false;
		var value = this.el.get('value');
		if (value.length) {
			var tdate = new Date().parse(value);
			
			for(el in this.elements) {
				this.elements[el].removeEvents('change');
			}
			if (this.options.display.hour) {
				this.elements.Hour.setValue(String(tdate.format('%I').pad(2,'0','left')));
			}
			if (this.options.display.min) {	
				this.elements.Minute.setValue(tdate.format('%M').pad(2,'0','left'));
			}
			if (this.options.display.ampm) {
				this.elements.AMPM.setValue(tdate.format('%p'));
			}
			for(el in this.elements) {
				this.elements[el].addEvent('change',function(){this.update();}.bind(this));
			}
			
		} else {
			for(el in this.elements) {
				this.elements[el].removeEvents('change');
				this.elements[el].setValue('');
				this.elements[el].addEvent('change',function(){ this.update(); }.bind(this));
			}
		}
		
		this.doUpdate = true;
	},
	update:function(){
		if (!this.doUpdate) return;
		if (!this.elements.Hour.getValue().length || 
			!this.elements.Minute.getValue().length || 
			!this.elements.AMPM.getValue().length) {
			this.el.set('value','');
			this.fireEvent('onInvalid',[this]);
		} else {
			var tdate = new Date().parse(this.el.get('value'));
			if ($defined(this.elements.Hour)) {
				tdate.set('hr',this.elements.Hour.getValue());	
			}
			if ($defined(this.elements.Minute)) {
				tdate.set('min',this.elements.Minute.getValue());
			}
			if ($defined(this.elements.AMPM)) {
				tdate.set('ampm',this.elements.AMPM.getValue());
			}
					
			this.el.set('value',tdate.format(this.options.format));
		}
	}
});

window.addEvent("domready",function(){ 
	$$('.timeselect').each(function(el){
		var type = $pick(el.get('data-options'),'dropdown');
		new SPTimeSelect(el,{type:type});
	});
	$$('.dateselect').each(function(el){
		var rev = el.get('data-options');
		if ($defined(rev)) {
			var options = Json.decode(rev);
		}
		//var type = $pick(el.getProperty('rev'),'dropdown');
		new SPDateSelect(el,$merge({type:'dropdown'},options));
	});
});
