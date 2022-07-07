/*
---
script: wizard.js
name: Wizard
version : 1.5
description: Stransforms a unordered list into a wizard slide-style display 
requires:
  - Core/MooTools 1.2.5
  - More/Mootools Scroll 1.2.5

...
*/

var Wizard = new Class({
    Implements:[Events,Options],
    options:{
        width:800,
        height:400,
        style:'slide',
        handler:'handler',
        loop:true,
        autoPlay:true,
        delay:3000,
        autoHeight:true,
        responsive:true,
        controls:{
            height:24,
            nextClass:'nextSlide',
            prevClass:'prevSlide',
            
            next:true,
            prev:true,
        
            display:'block'
        },
        labels : {
            prev:false,
            next:false,
            pages:false
        },
        className:'minimal',
        startIndex:0,
        classes:{
        	active:'active',
        	inactive:'inactive'
        }
    },
    maxHeight:0,
    doNext:true,
    doPrev:true,
    doSelect:true,
    initialize:function(container,options){
        this.setOptions(options);
        this.element = container;
        this.container = new Element('div',{'class':'wizardContainer '+this.options.className}).injectBefore(this.element);    
        var id = this.element.get('id');
        Wizard.set(id,this);
        window.fireEvent('onCreateWizard',[this]);
        
        if (!this.options.responsive) {
            container.setStyles({
                width:this.options.width                
            });
        } else {
            this.element.setStyle('display','none');
            var coords = this.container.getCoordinates();
            this.element.setStyle('display','');
            this.options.width = coords.width;
        }
        this.element.setStyles({
            overflow:'hidden',
            position:'relative',
            display:'block',
            height:this.options.autoHeight?'':this.options.height
        }).injectInside(this.container)
        .set('tween',{
            onComplete:function(){
                this.fireEvent('onChangeHeight',this);
            }.bind(this)
        });
                
        this.controls = new Element('div',{'class':'controls'}).setStyles({
            width:this.options.width,
            height:this.options.controls.height,
            display:this.options.controls.display
        }).injectInside(this.container);
        
        
        this.prev = new Element('div',{'class':'prevControl control '+(this.options.loop?'active':'')})
                        .injectBefore(this.controls)
                        .set('html','<span><span></span></span>')
                        //.setStyles({'height':this.options.controls.height})
                        .addEvent('click',function(){this.toPrev();}.bind(this))
                        ;
        if (this.options.labels.prev) this.prev.set('html','Previous');       
        if (!this.options.controls.prev) this.prev.setStyle('display','none');
        
        
        this.next = new Element('div',{'class':'nextControl control '+(this.options.loop?'active':'')})
                    .injectAfter(this.controls)
                    .set('html','<span><span></span></span>')
                    //.setStyles({'height':this.options.controls.height})
                    .addEvent('click',function(){this.toNext();}.bind(this))
                        ;
        if (this.options.labels.next) this.next.set('html','Next');
        if (!this.options.controls.next) this.next.setStyle('display','none');
                                                
        this.pageContainer = new Element('div',{'class':'pageContainer'})
                                .injectInside(this.controls)
                                ;
        this.indices = new Hash();
        var targetTags = 'a,input,button,textarea,select';//.split(',');
        this.slides = this.element.getChildren();
        this.slides.each(function(slide,index){
        	slide.addEvents({
        		mouseclick:function(){
        			if ($defined(this.delayTimer)) {
        				clearTimeout(this.delayTimer);
        			}
        		}.bind(this),
        		mouseleave:function(){
        			if (this.options.autoPlay) {
			        	if ($defined(this.delayTimer)) {
			        		clearTimeout(this.delayTimer);	
			        	}
			            this.delayTimer = this.toNext.delay(this.options.delay,this);
			        }
        		}.bind(this)
        	});
        	if (slide.hasClass('linked')) {
        		slide.addEvent('click',function(e){
        			window.location.assign(slide.get('data-link'));
        		}.bind(this));
        	}
            var scoords = slide.getCoordinates();           
            if (scoords.height.toInt()>this.maxHeight) {
                this.maxHeight = scoords.height.toInt();
            }
            slide.store('background',slide.get('data-background'));
            var page = new Element('span',{'class':'control'}).injectInside(this.pageContainer).store('slide',slide);
            slide.store('page',page);
            page.addEvent('click',function(){
                            this.toPage(page);
                        }.bind(this)).store('index',index);
            if (this.options.labels.pages) page.set('html',index+1);
            if (!$defined(this.currentPage)) {
                this.currentPage = page;    
                this.prev.store('index',index);
                slide.setStyle('display','block');
            }
            if (index==this.slides.length-1) {
                this.next.store('index',index);
            }
            
            slide.getElements(targetTags).each(function(el){
                el.store('index',index).addEvent('focus',function(e){ 
                    this.toIndex(e.target.retrieve('index'));
                }.bind(this));
                
            }.bind(this));
            
            this.indices.set(index,page);
            
            slide.getElements('.'+this.options.handler).each(function(handler){
                var index = handler.get('rel');
                if ($defined(index)) {
                    handler.addEvent('click',function(e){
                        new Event(e).preventDefault();
                        this.toIndex(index);
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this),this);
        
        this.totalPages = this.slides.length-1;
        if (this.options.style=='slide') {
            this.scroller = new Fx.Scroll(container,{
                link:'cancel',
                onStart:function(){
                    this.fireEvent('onStart',this);
                }.bind(this),
                onComplete:function(){                 	
                	this.fireEvent('onLoad',this);
                    this.trackControls(); 
                }.bind(this)
            });
        }       
        
        this.trackControls();
        
        var prevControls = container.getElements('.'+this.options.controls.prevClass);
        if (prevControls.length) {
            prevControls.each(function(control){
                control.addEvent('click',function(e){
                    new Event(e).stop();
                    this.toPrev();
                }.bind(this));
            }.bind(this),this);
        }
        
        var nextControls = container.getElements('.'+this.options.controls.nextClass);
        if (nextControls.length) {
            nextControls.each(function(control){
                control.addEvent('click',function(e){
                    new Event(e).stop();
                    this.toNext();
                }.bind(this));
            }.bind(this),this);
        }
                
        if (this.options.responsive){
            window.addEvent('resize',function(){
                this.recalibrate();
            }.bind(this));
        }
        this.recalibrate();
        var images = this.element.getElements('img');
        if (images.length) {
            images.each(function(img){
                this.imageCount = 0;
                img.onload = function(){
                    this.imageCount++;
                    if (this.imageCount==images.length) {                       
                        window.fireEvent('resize');
                        this.toIndex(this.options.startIndex);        
                    }
                }.bind(this);
            }.bind(this));
        } else {
            this.toIndex(this.options.startIndex);            
        }       
        
        this.fireEvent('onReady',[this]);
    },
    recalibrate:function(){
        this.element.setStyles({visibility:'hidden',height:this.container.getCoordinates().height,weight:''}).getChildren().setStyle('display','none');
        this.controls.setStyle('display','none');
        
        var coords = this.container.getCoordinates();
        
        this.options.width = coords.width;             
                
        this.element.setStyles({width:this.options.width,display:'',visibility:'hidden'});
        
        this.slides.each(function(slide,index){
            slide.removeProperty('style');
            var scoords = slide.getCoordinates();
            slide.setStyles({
                width:this.options.width,
                height:this.options.autoHeight?scoords.height:this.options.height,
                display:slide.retrieve('page')==this.currentPage?'block':this.options.style=='slide'?'block':'none',
                position:'absolute',
                left:this.options.style=='slide'?this.options.width*index:0,
                'background-image':$defined(slide.retrieve('background'))?'url('+slide.retrieve('background')+')':''
            }).store('height',scoords.height);
        }.bind(this));
        
        this.element.setStyles({visibility:''});
        this.controls.setStyles({display:'',width:this.options.width});
        this.toPage(this.currentPage,true);        
    },
    trackControls:function(){
        if (!this.options.loop) {
            if (this.getIndex()==this.prev.retrieve('index')) {
                this.prev.removeClass('active');
            } else {
                this.prev.addClass('active');
            }
            if (this.getIndex()==this.next.retrieve('index')) {
                this.next.removeClass('active');
            } else {
                this.next.addClass('active');
            }
        } 
        
        this.currentPage.addClass('active');
        this.currentPage.retrieve('slide').addClass('active');
        if (this.options.autoPlay) {
        	if ($defined(this.delayTimer)) {
        		clearTimeout(this.delayTimer);	
        	}
        	this.fireEvent('onCycle',[this]);
            this.delayTimer = this.toNext.delay(this.options.delay,this);
        }
    },
    toIndex:function(index){
        if (!this.indices.has(index)) return;
        var page = this.indices.get(index);
        if ($defined(page)) {
            this.toPage(page);
        }
    },
    toPage:function(page,force){
        if (page==this.currentPage && !$pick(force,false)) return;        
        var slide = page.retrieve('slide');
        if (!$defined(slide)) return;
        this.targetSlide = slide;
        if (page!=this.currentPage) {
            this.fireEvent('onSelect',slide);
            if (!this.doSelect) return;
            switch(this.options.style) {
                case 'slide':                	
                    this.scroller.toElement(slide);
                    if (this.options.autoHeight) {
                        this.element.tween('height',page.retrieve('slide').retrieve('height'));
                    }                    
                    this.fireEvent('onChange',this);
                    break;
                case 'fade':
                    slide.setStyles({display:'block',opacity:0});
                    var currentSlide = this.currentPage.retrieve('slide');
                    this.fadeCheck = 0;
                                        
                    if ($defined(this.lastOutFx)) {
                    	this.lastOutFx.cancel();
                    }
                    
                    var outFx = currentSlide.retrieve('outFx');
                    if (!$defined(outFx)) {
                    	var outFx = new Fx.Morph(currentSlide,{
	                        link:'ignore',
	                        onStart:function(){
	                            this.fireEvent('onStart',this);
	                        }.bind(this),
	                        onComplete:function(){                            
	                            
	                            this.trackControls(); 
	                            currentSlide.setStyles({display:'none',opacity:1})
	                            	.addClass(this.options.classes.inactive);
	                            if (this.options.autoHeight) {
	                                this.element.tween('height',page.retrieve('slide').retrieve('height'));
	                            }              
	                            this.fireEvent('onLoad',this);    
	                            this.fireEvent('onChange',this);
	                            /*
	                            this.fadeCheck++;
	                            if (this.fadeCheck==2) {
	                                this.recalibrate.delay(500,this);
	                            }
	                            */
	                        }.bind(this)
                    	});
                    	currentSlide.store('outFx',outFx); 
                    }
                    outFx.start({opacity:[1,0]});
                    this.lastOutFx = outFx;
                    
                    if ($defined(this.lastInFx)) {
                    	this.lastInFx.cancel();
                    }
                    var inFx = slide.retrieve('inFx');
                    if (!$defined(inFx)) {
                    	var inFx = new Fx.Morph(slide,{
	                        link:'ignore',
	                        onStart:function(){
	                        }.bind(this),
	                        onComplete:function(){
	                            this.fadeCheck++;
	                            /*
	                            if (this.fadeCheck==2) {
	                                this.recalibrate.delay(500,this);
	                            }
	                            */
	                        }.bind(this)
	                    }); 
	                    slide.store('inFx',inFx);
                    }
                    inFx.start({opacity:[0,1]});
                    this.lastInFx = inFx;
                    break;
                 
            }
                        
            this.currentPage.removeClass('active');
            this.currentPage.retrieve('slide').removeClass('active');
            this.lastPage = this.currentPage;
            this.currentPage = page;
            this.doSelect = true;
            this.doNext = true;
            this.doPrev = true;
        } else {
            if (this.options.autoHeight) {
                this.element.tween('height',page.retrieve('slide').retrieve('height'));
            }
            this.currentPage.addClass('active');
        }
    },
    toPrev:function(){
        this.fireEvent('onPrev',[this]);
        if (this.doPrev) {
            var prev = this.currentPage.getPrevious();
            if ($defined(prev)) {
                this.toPage(prev);
            } else if (this.options.loop){
                this.toIndex(this.next.retrieve('index'));
            }
        }
    },
    toNext:function(){
        this.fireEvent('onNext',[this]);
        if (this.doNext) {
            var next = this.currentPage.getNext();
            if ($defined(next)) {
                this.toPage(next);
            } else if (this.options.loop){
                this.toIndex(this.prev.retrieve('index'));
            }
        }
        
    },
    getIndex:function(){
        return this.currentPage.retrieve('index');
    },
    getSlide:function(){
        return this.currentPage.retrieve('slide');
    },
    getCurrentHeight:function(){
        return this.getSlide().retrieve('height');
    }
});

Wizards = new Hash();
Wizard.set = function(id,instance) {
	Wizards.set(id,instance);
	return instance;
};

Wizard.get = function(id) {
	return Wizards.get('id');
};

/*
---
script: wizard.js
name: Wizard.Steps
version : 1.0
description: Functions as support for wizard script to display stages using an unordered list 
requires:
  - Core/MooTools 1.2.5
  - More/Mootools Scroll 1.2.5
  - Wizard 1.0
...
*/

Wizard.Steps = new Class({
    Implements:[Events,Options],
    options:{
        className:'basic',
        trigger:true,
        triggerClass:'.trigger'
    },
    initialize:function(el,wizard,options){
        this.setOptions(options);
        this.el = el.addClass(this.options.className);
        this.wizard = wizard;
        this.wizard.addEvent('load',function(){
            this.setStep();
        }.bind(this));
        var steps = this.el.getChildren();
        if ($pick(steps.length,0)){
            steps.each(function(step,index){
                if (index==this.wizard.prev.retrieve('index')) {
                    step.addClass('first');
                } else if (index==this.wizard.next.retrieve('index')) {
                    step.addClass('last');
                }
                if (this.options.trigger) {
                    var trigger = step.getElement('.'+this.options.triggerClass);
                    if ($defined(trigger)) {
                        trigger.addEvent('click',function(e){
                            new Event(e).stop();
                            this.wizard.toIndex(index);
                        }.bind(this));
                    }
                }
            }.bind(this),this);
        }
        this.setStep();     
    },
    setStep:function(){
        var steps = this.el.getChildren();
        if ($pick(steps.length,0)){
            steps.each(function(step,index){
                if (index==this.wizard.getIndex()) {
                    step.addClass('active');
                } else {
                    step.removeClass('active');
                }
            }.bind(this),this);
        }
    }
});