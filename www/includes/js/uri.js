//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

name: More

description: MooTools More

license: MIT-style license

requires:
  - Core/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
    'version': '1.2.5.1',
    'build': '254884f2b83651bf95260eed5c6cceb838e22d8e'
};


/*
---

script: Class.Refactor.js

name: Class.Refactor

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

# Some modules declare themselves dependent on Class.Refactor
provides: [Class.refactor, Class.Refactor]

...
*/

Class.refactor = function(original, refactors){

    $each(refactors, function(item, name){
        var origin = original.prototype[name];
        if (origin && (origin = origin._origin ? origin._origin: origin) && typeof item == 'function') original.implement(name, function(){
            var old = this.previous;
            this.previous = origin;
            var value = item.apply(this, arguments);
            this.previous = old;
            return value;
        }); else original.implement(name, item);
    });

    return original;

};


/*
---

script: String.QueryString.js

name: String.QueryString

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
  - Sebastian Markbåge, Aaron Newton, Lennart Pilon, Valerio Proietti

requires:
  - Core/Array
  - Core/String
  - /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

    parseQueryString: function(decodeKeys, decodeValues){
        if (decodeKeys == null) decodeKeys = true;
        if (decodeValues == null) decodeValues = true;
        var vars = this.split(/[&;]/), res = {};
        if (vars.length) vars.each(function(val){
            var index = val.indexOf('='),
                keys = index < 0 ? [''] : val.substr(0, index).match(/([^\]\[]+|(\B)(?=\]))/g),
                value = decodeValues ? decodeURIComponent(val.substr(index + 1)) : val.substr(index + 1),
                obj = res;
            keys.each(function(key, i){
                if (decodeKeys) key = decodeURIComponent(key);
                var current = obj[key];
                if(i < keys.length - 1)
                    obj = obj[key] = current || {};
                else if($type(current) == 'array')
                    current.push(value);
                else
                    obj[key] = $defined(current) ? [current, value] : value;
            });
        });
        return res;
    },

    cleanQueryString: function(method){
        return this.split('&').filter(function(val){
            var index = val.indexOf('='),
            key = index < 0 ? '' : val.substr(0, index),
            value = val.substr(index + 1);
            return method ? method.run([key, value]) : $chk(value);
        }).join('&');
    }

});

/*
---

script: URI.js

name: URI

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
  - Sebastian Markbåge
  - Aaron Newton

requires:
  - Core/Selectors
  - /String.QueryString

provides: [URI]

...
*/

var URI = new Class({

    Implements: Options,

    options: {
        /*base: false*/
    },

    regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
    parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
    schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

    initialize: function(uri, options){
        this.setOptions(options);
        var base = this.options.base || URI.base;
        if(!uri) uri = base;
        
        if (uri && uri.parsed) this.parsed = $unlink(uri.parsed);
        else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
    },

    parse: function(value, base){
        var bits = value.match(this.regex);
        if (!bits) return false;
        bits.shift();
        return this.merge(bits.associate(this.parts), base);
    },

    merge: function(bits, base){
        if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
        if (base){
            this.parts.every(function(part){
                if (bits[part]) return false;
                bits[part] = base[part] || '';
                return true;
            });
        }
        bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
        bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
        return bits;
    },

    parseDirectory: function(directory, baseDirectory) {
        directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
        if (!directory.test(URI.regs.directoryDot)) return directory;
        var result = [];
        directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
            if (dir == '..' && result.length > 0) result.pop();
            else if (dir != '.') result.push(dir);
        });
        return result.join('/') + '/';
    },

    combine: function(bits){
        return bits.value || bits.scheme + '://' +
            (bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
            (bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
            (bits.directory || '/') + (bits.file || '') +
            (bits.query ? '?' + bits.query : '') +
            (bits.fragment ? '#' + bits.fragment : '');
    },

    set: function(part, value, base){
        if (part == 'value'){
            var scheme = value.match(URI.regs.scheme);
            if (scheme) scheme = scheme[1];
            if (scheme && !$defined(this.schemes[scheme.toLowerCase()])) this.parsed = { scheme: scheme, value: value };
            else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
        } else if (part == 'data') {
            this.setData(value);
        } else {
            this.parsed[part] = value;
        }
        return this;
    },

    get: function(part, base){
        switch(part){
            case 'value': return this.combine(this.parsed, base ? base.parsed : false);
            case 'data' : return this.getData();
        }
        return this.parsed[part] || '';
    },

    go: function(){
        document.location.href = this.toString();
    },

    toURI: function(){
        return this;
    },

    getData: function(key, part){
        var qs = this.get(part || 'query');
        if (!$chk(qs)) return key ? null : {};
        var obj = qs.parseQueryString();
        return key ? obj[key] : obj;
    },

    setData: function(values, merge, part){
        if (typeof values == 'string'){
            data = this.getData();
            data[arguments[0]] = arguments[1];
            values = data;
        } else if (merge) {
            values = $merge(this.getData(), values);
        }
        return this.set(part || 'query', Hash.toQueryString(values));
    },

    clearData: function(part){
        return this.set(part || 'query', '');
    }

});

URI.prototype.toString = URI.prototype.valueOf = function(){
    return this.get('value');
};

URI.regs = {
    endSlash: /\/$/,
    scheme: /^(\w+):/,
    directoryDot: /\.\/|\.$/
};

URI.base = new URI(document.getElements('base[href]', true).getLast(), {base: document.location});

String.implement({

    toURI: function(options){
        return new URI(this, options);
    }

});


/*
---

script: URI.Relative.js

name: URI.Relative

description: Extends the URI class to add methods for computing relative and absolute urls.

license: MIT-style license

authors:
  - Sebastian Markbåge


requires:
  - /Class.refactor
  - /URI

provides: [URI.Relative]

...
*/

URI = Class.refactor(URI, {

    combine: function(bits, base){
        if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
            return this.previous.apply(this, arguments);
        var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

        if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

        var baseDir = base.directory.split('/'),
            relDir = bits.directory.split('/'),
            path = '',
            offset;

        var i = 0;
        for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
        for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
        for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

        return (path || (bits.file ? '' : './')) + end;
    },

    toAbsolute: function(base){
        base = new URI(base);
        if (base) base.set('directory', '').set('file', '');
        return this.toRelative(base);
    },

    toRelative: function(base){
        return this.get('value', new URI(base));
    }

});
