/*
---
description: Simple color picker for mootools.

license: MIT-style

authors:
- Fiona Coulter

requires:
- core/1.2: [Class, Class.Extras, Element, Element.Event,Element.Style,Fx,Fx.Tween]

provides: [ColorPicker]

...
*/

var ColorPicker = new Class({
	Implements:[Options,Events],
	options : { 
		cellWidth: 10, 
		cellHeight: 10, 
		top: 20, 
		right: 0, 
		transition: true,
		classes:{
			infoPanel:'infoPanel',
			colorPanel:'colorPanel',
			colorElement:'colorElement',
			colorPickerContainer:'colorPickerContainer'
		},
		containerTag:'div'
	},	
    initialize: function(el,options){
        this.setOptions(options);
		var ms = new String(MooTools.version);
		this.version = ms.substr(0,3);
		
		if(this.version == '1.1')
		{
    		this.el = $(el);
			
		}
		else
		{
	    	this.el = document.id(el);
		}
		this.el.addEvent("focus", function(e){ this.openPicker();}.bind(this));
		this.el.addEvent("change", function(e){ this.validate(); this.closePicker();}.bind(this));
		this.el.addEvent('keyup', function(e){ e = new Event(e);  try{ this.colorPanel.setStyle("backgroundColor", this.el.value); } catch(e){}}.bind(this));

		this.height = this.options.cellHeight * 8 + this.options.top;
		this.active = false;
				
		
		this.container = new Element(this.options.containerTag,{'class':this.options.classes.colorPickerContainer});
		
		this.el.parentNode.insertBefore(this.container, this.el);
		this.container.appendChild(this.el);
		this.el.addClass(this.options.classes.colorElement);
		//this.el.setStyle("float","left");
		
		
		this.colorPanel = new Element("input",{'class':this.options.classes.colorPanel});
		this.colorPanel.setAttribute("size","2");
		this.colorPanel.setAttribute("type","text");
		this.colorPanel.setAttribute("readonly","readonly");
		this.colorPanel.setStyle("backgroundColor",this.el.value);
		this.colorPanel.setStyle("cursor","pointer");	
		//this.colorPanel.setStyle("float","left");
		
		this.colorPanel.addEvent("focus", function(e){
			this.openPicker();
		}.bind(this));		
		this.container.appendChild(this.colorPanel);
		
		this.infoPanel = new Element("span",{'class':this.options.classes.infoPanel});
		//this.infoPanel.setStyle("display","none");
        this.container.appendChild(this.infoPanel);		
		
		//color chart container
		this.chartContainer = new Element("div");
		this.chartContainer.setStyles({position:"relative", "z-index": 100, cursor: "pointer","background-color":"#000000", 'float':"right","overflow":"visible"});
		this.chartContainer.addEvent('blur', function(e){ e = new Event(e);  this.closePicker();}.bind(this));
		
		
		this.container.parentNode.insertBefore(this.chartContainer, this.container);
		
		
		this.colorTable = new Element("table");
		this.colorTable.setAttribute("border","1");
		this.colorTable.setAttribute("bordercolor","silver");
		this.colorTable.setAttribute("cellpadding","0");
		this.colorTable.setAttribute("cellspacing","0");
		this.colorTable.setStyles({"background-color":"#000000", visibility:"visible", position:"absolute", top: this.options.top + "px", right: this.options.right + "px", "z-index": 100, cursor: "pointer"});
 	    var tabBody = new Element("tbody");
		this.colorTable.appendChild(tabBody);
		
		
        var colorArray = ["00", "33", "66", "99", "cc", "ff"];
        for ( var i=0; i< colorArray.length; i++)
 	    {
 	      var currRow = new Element("tr");
		  tabBody.appendChild(currRow);
		  
		  for ( var j=0; j< colorArray.length; j++)
		  {
  
			  for ( var k=0; k< colorArray.length; k++)
			  {
  
			       var currColor = "#"+colorArray[i]+colorArray[j]+colorArray[k];
			       var currCell = new Element("td");
				   currCell.innerHTML = '<div width="'+  this.options.cellWidth +'px" height="'+ this.options.cellHeight +'px" style="width:'+ this.options.cellWidth +'px;height:'+ this.options.cellHeight +'px;">&nbsp;</div>';
				   currCell.setStyle("backgroundColor",currColor);
				   currCell.addEvent('click', function(e, currColor){ 
				   		e = new Event(e); 
				   		this.el.value = currColor; 
				   		this.closePicker();
				   		this.fireEvent('onPickColor',[currColor,this]);
				   	}.bindWithEvent(this, currColor));
				   currCell.addEvent('mouseover', function(e, currColor){ e = new Event(e);  this.colorPanel.setStyle("backgroundColor", currColor);  this.infoPanel.innerHTML = currColor;	}.bindWithEvent(this, currColor));
				   //currCell.setStyles({"width":this.options.cellWidth +"px", "height":this.options.cellHeight +"px"});
				   currCell.setStyles({"padding":"0px"});
				   //currCell.setAttribute("width", this.options.cellWidth +'px');
				   
				   currRow.appendChild(currCell);
			   
  
			   }
			   
  
		  }
		  
  
		}
		
		this.fader = null;
		if(this.options.transition)
		{
			if(this.version == '1.1')
			{
			   this.fader = new Fx.Style(this.colorTable,'opacity', {duration:1000});
			}
			else
			{
			   this.fader = new Fx.Tween(this.colorTable,'opacity', {duration:1000});
			}

		}
		
		
		this.chartContainer.addEvent('mouseout', function(e, currColor){ e = new Event(e);  try{this.colorPanel.setStyle("backgroundColor", this.el.value); } catch(e){} this.infoPanel.innerHTML = '';	}.bindWithEvent(this, currColor));
		
		this.chartContainer.appendChild(this.colorTable);
		
		$(document).addEvent('click', function(e){e = new Event(e); if((e.target != this.el) &&(e.target != this.colorPanel)){ this.closePicker();}}.bind(this));
		this.hidePicker();
	
	},
	closePicker: function(){
		this.colorTable.setStyle("visibility","hidden");
		this.infoPanel.innerHTML = '';		
        this.colorPanel.setStyle("backgroundColor",this.el.value);	
		//this.chartContainer.setStyle("height","auto");
			if(this.options.transition && this.active)
			{
				if(this.version == '1.1')
				{
				  this.fader.start(1,0);
				}
				else
				{
				  this.colorTable.fade('show');
				  this.colorTable.fade('out');
				}
			}
			this.infoPanel.setStyle('display','none');
			this.active = false;
		
	},
	openPicker: function(){
		this.colorTable.setStyle("visibility","visible");
		//this.chartContainer.setStyle("height",this.height + "px");
			if(this.options.transition)
			{
				if(this.version == '1.1')
				{
				  this.fader.start(0,1);
				}
				else
				{
				  this.colorTable.fade('hide');
				  this.colorTable.fade('in');
				}
			}
		this.infoPanel.setStyle('display','block');
		this.active = true;
	},
	hidePicker: function(){
		this.colorTable.setStyle("visibility","hidden");
		this.infoPanel.innerHTML = '';		
        this.colorPanel.setStyle("backgroundColor",this.el.value);	
        this.infoPanel.setStyle('display','none');
	},	
	validate: function(){
	  var pattern = /#[0-9A-Fa-f]{6}/;
	  if( pattern.test(this.el.value))
	  {
		return;  
	  }
	  
	  var stringVal = new String(this.el.value);
	  if(stringVal.charAt(0) != '#')
	  {
		  stringVal = '#' + stringVal;		  
	  }
	  
	  var pattern2 = /[^#A-Fa-f0-9]/g;
	  stringVal = stringVal.replace(pattern2, '');
	  
	  var l = 7 - stringVal.length; //extra 0s to pad
	  for(var i=0; i<l; i++)
	  {
		  stringVal = stringVal + '0';
	  }
	  
	  stringVal = stringVal.substr(0,7);
	  
	  //finally retest
	  if( ! pattern.test(stringVal))
	  {
		stringVal = '#ffffff';  
	  }
	  
	  this.el.value = stringVal;
		
	}
	
							
							
							
});

