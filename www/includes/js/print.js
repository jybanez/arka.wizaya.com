var Print = {
	Text:function(content,options){
		return $merge({
			type:'text',
			content:content
		},options);
	},
	Newline:function(){
		return {
			type:'newline'
		};
	},
	Line:function(){
		return {
			type:'line'
		};
	},
	Doubleline:function(){
		return {
			type:'doubleline'
		};
	},
	Image:function(content){
		return {
			type:'image',
			content:content
		};
	},
	Cut:function(){
		return {
			type:'cut'
		};
	}
};
