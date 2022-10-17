/*
 The buffer module from node.js, for the browser.

 @author   Feross Aboukhadijeh <https://feross.org>
 @license  MIT
 ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
 (function(){function z(E,y,A){function k(g,l){if(!y[g]){if(!E[g]){var m="function"==typeof require&&require;if(!l&&m)return m(g,!0);if(e)return e(g,!0);m=Error("Cannot find module '"+g+"'");throw m.code="MODULE_NOT_FOUND",m;}m=y[g]={exports:{}};E[g][0].call(m.exports,function(q){return k(E[g][1][q]||q)},m,m.exports,z,E,y,A)}return y[g].exports}for(var e="function"==typeof require&&require,p=0;p<A.length;p++)k(A[p]);return k}return z})()({1:[function(z,E,y){function A(g){var l=g.length;if(0<l%4)throw Error("Invalid string. Length must be a multiple of 4");
 g=g.indexOf("=");-1===g&&(g=l);return[g,g===l?0:4-g%4]}y.byteLength=function(g){g=A(g);var l=g[1];return 3*(g[0]+l)/4-l};y.toByteArray=function(g){var l=A(g);var m=l[0];l=l[1];var q=new p(3*(m+l)/4-l),n=0,x=0<l?m-4:m,r;for(r=0;r<x;r+=4)m=e[g.charCodeAt(r)]<<18|e[g.charCodeAt(r+1)]<<12|e[g.charCodeAt(r+2)]<<6|e[g.charCodeAt(r+3)],q[n++]=m>>16&255,q[n++]=m>>8&255,q[n++]=m&255;2===l&&(m=e[g.charCodeAt(r)]<<2|e[g.charCodeAt(r+1)]>>4,q[n++]=m&255);1===l&&(m=e[g.charCodeAt(r)]<<10|e[g.charCodeAt(r+1)]<<
 4|e[g.charCodeAt(r+2)]>>2,q[n++]=m>>8&255,q[n++]=m&255);return q};y.fromByteArray=function(g){for(var l=g.length,m=l%3,q=[],n=0,x=l-m;n<x;n+=16383){for(var r=q,B=r.push,C,G=g,K=n+16383>x?x:n+16383,v=[],w=n;w<K;w+=3)C=(G[w]<<16&16711680)+(G[w+1]<<8&65280)+(G[w+2]&255),v.push(k[C>>18&63]+k[C>>12&63]+k[C>>6&63]+k[C&63]);C=v.join("");B.call(r,C)}1===m?(g=g[l-1],q.push(k[g>>2]+k[g<<4&63]+"==")):2===m&&(g=(g[l-2]<<8)+g[l-1],q.push(k[g>>10]+k[g>>4&63]+k[g<<2&63]+"="));return q.join("")};var k=[],e=[],p=
 "undefined"!==typeof Uint8Array?Uint8Array:Array;for(z=0;64>z;++z)k[z]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[z],e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(z)]=z;e[45]=62;e[95]=63},{}],2:[function(z,E,y){(function(A){(function(){function k(a){if(a>L)throw new RangeError('The value "'+a+'" is invalid for option "size"');a=new Uint8Array(a);a.__proto__=e.prototype;return a}function e(a,b,c){if("number"===typeof a){if("string"===typeof b)throw new TypeError('The "string" argument must be of type string. Received type number');
 return l(a)}return p(a,b,c)}function p(a,b,c){if("string"===typeof a){var d=b;if("string"!==typeof d||""===d)d="utf8";if(!e.isEncoding(d))throw new TypeError("Unknown encoding: "+d);b=x(a,d)|0;c=k(b);a=c.write(a,d);a!==b&&(c=c.slice(0,a));return c}if(ArrayBuffer.isView(a))return m(a);if(null==a)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);if(F(a,ArrayBuffer)||a&&F(a.buffer,ArrayBuffer)){if(0>b||a.byteLength<
 b)throw new RangeError('"offset" is outside of buffer bounds');if(a.byteLength<b+(c||0))throw new RangeError('"length" is outside of buffer bounds');a=void 0===b&&void 0===c?new Uint8Array(a):void 0===c?new Uint8Array(a,b):new Uint8Array(a,b,c);a.__proto__=e.prototype;return a}if("number"===typeof a)throw new TypeError('The "value" argument must not be of type number. Received type number');d=a.valueOf&&a.valueOf();if(null!=d&&d!==a)return e.from(d,b,c);if(d=q(a))return d;if("undefined"!==typeof Symbol&&
 null!=Symbol.toPrimitive&&"function"===typeof a[Symbol.toPrimitive])return e.from(a[Symbol.toPrimitive]("string"),b,c);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof a);}function g(a){if("number"!==typeof a)throw new TypeError('"size" argument must be of type number');if(0>a)throw new RangeError('The value "'+a+'" is invalid for option "size"');}function l(a){g(a);return k(0>a?0:n(a)|0)}function m(a){for(var b=
 0>a.length?0:n(a.length)|0,c=k(b),d=0;d<b;d+=1)c[d]=a[d]&255;return c}function q(a){if(e.isBuffer(a)){var b=n(a.length)|0,c=k(b);if(0===c.length)return c;a.copy(c,0,0,b);return c}if(void 0!==a.length)return(b="number"!==typeof a.length)||(b=a.length,b=b!==b),b?k(0):m(a);if("Buffer"===a.type&&Array.isArray(a.data))return m(a.data)}function n(a){if(a>=L)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+L.toString(16)+" bytes");return a|0}function x(a,b){if(e.isBuffer(a))return a.length;
 if(ArrayBuffer.isView(a)||F(a,ArrayBuffer))return a.byteLength;if("string"!==typeof a)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof a);var c=a.length,d=2<arguments.length&&!0===arguments[2];if(!d&&0===c)return 0;for(var f=!1;;)switch(b){case "ascii":case "latin1":case "binary":return c;case "utf8":case "utf-8":return M(a).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return 2*c;case "hex":return c>>>1;case "base64":return O(a).length;
 default:if(f)return d?-1:M(a).length;b=(""+b).toLowerCase();f=!0}}function r(a,b,c){var d=!1;if(void 0===b||0>b)b=0;if(b>this.length)return"";if(void 0===c||c>this.length)c=this.length;if(0>=c)return"";c>>>=0;b>>>=0;if(c<=b)return"";for(a||(a="utf8");;)switch(a){case "hex":a=b;b=c;c=this.length;if(!a||0>a)a=0;if(!b||0>b||b>c)b=c;d="";for(c=a;c<b;++c)a=d,d=this[c],d=16>d?"0"+d.toString(16):d.toString(16),d=a+d;return d;case "utf8":case "utf-8":return K(this,b,c);case "ascii":a="";for(c=Math.min(this.length,
 c);b<c;++b)a+=String.fromCharCode(this[b]&127);return a;case "latin1":case "binary":a="";for(c=Math.min(this.length,c);b<c;++b)a+=String.fromCharCode(this[b]);return a;case "base64":return b=0===b&&c===this.length?N.fromByteArray(this):N.fromByteArray(this.slice(b,c)),b;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":b=this.slice(b,c);c="";for(a=0;a<b.length;a+=2)c+=String.fromCharCode(b[a]+256*b[a+1]);return c;default:if(d)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase();
 d=!0}}function B(a,b,c){var d=a[b];a[b]=a[c];a[c]=d}function C(a,b,c,d,f){if(0===a.length)return-1;"string"===typeof c?(d=c,c=0):2147483647<c?c=2147483647:-2147483648>c&&(c=-2147483648);c=+c;c!==c&&(c=f?0:a.length-1);0>c&&(c=a.length+c);if(c>=a.length){if(f)return-1;c=a.length-1}else if(0>c)if(f)c=0;else return-1;"string"===typeof b&&(b=e.from(b,d));if(e.isBuffer(b))return 0===b.length?-1:G(a,b,c,d,f);if("number"===typeof b)return b&=255,"function"===typeof Uint8Array.prototype.indexOf?f?Uint8Array.prototype.indexOf.call(a,
 b,c):Uint8Array.prototype.lastIndexOf.call(a,b,c):G(a,[b],c,d,f);throw new TypeError("val must be string, number or Buffer");}function G(a,b,c,d,f){function h(I,P){return 1===t?I[P]:I.readUInt16BE(P*t)}var t=1,u=a.length,D=b.length;if(void 0!==d&&(d=String(d).toLowerCase(),"ucs2"===d||"ucs-2"===d||"utf16le"===d||"utf-16le"===d)){if(2>a.length||2>b.length)return-1;t=2;u/=2;D/=2;c/=2}if(f)for(d=-1;c<u;c++)if(h(a,c)===h(b,-1===d?0:c-d)){if(-1===d&&(d=c),c-d+1===D)return d*t}else-1!==d&&(c-=c-d),d=-1;
 else for(c+D>u&&(c=u-D);0<=c;c--){u=!0;for(d=0;d<D;d++)if(h(a,c+d)!==h(b,d)){u=!1;break}if(u)return c}return-1}function K(a,b,c){c=Math.min(a.length,c);for(var d=[];b<c;){var f=a[b],h=null,t=239<f?4:223<f?3:191<f?2:1;if(b+t<=c)switch(t){case 1:128>f&&(h=f);break;case 2:var u=a[b+1];128===(u&192)&&(f=(f&31)<<6|u&63,127<f&&(h=f));break;case 3:u=a[b+1];var D=a[b+2];128===(u&192)&&128===(D&192)&&(f=(f&15)<<12|(u&63)<<6|D&63,2047<f&&(55296>f||57343<f)&&(h=f));break;case 4:u=a[b+1];D=a[b+2];var I=a[b+3];
 128===(u&192)&&128===(D&192)&&128===(I&192)&&(f=(f&15)<<18|(u&63)<<12|(D&63)<<6|I&63,65535<f&&1114112>f&&(h=f))}null===h?(h=65533,t=1):65535<h&&(h-=65536,d.push(h>>>10&1023|55296),h=56320|h&1023);d.push(h);b+=t}a=d.length;if(a<=Q)d=String.fromCharCode.apply(String,d);else{c="";for(b=0;b<a;)c+=String.fromCharCode.apply(String,d.slice(b,b+=Q));d=c}return d}function v(a,b,c){if(0!==a%1||0>a)throw new RangeError("offset is not uint");if(a+b>c)throw new RangeError("Trying to access beyond buffer length");
 }function w(a,b,c,d,f,h){if(!e.isBuffer(a))throw new TypeError('"buffer" argument must be a Buffer instance');if(b>f||b<h)throw new RangeError('"value" argument is out of bounds');if(c+d>a.length)throw new RangeError("Index out of range");}function R(a,b,c,d,f,h){if(c+d>a.length)throw new RangeError("Index out of range");if(0>c)throw new RangeError("Index out of range");}function S(a,b,c,d,f){b=+b;c>>>=0;f||R(a,b,c,4,3.4028234663852886E38,-3.4028234663852886E38);H.write(a,b,c,d,23,4);return c+4}function T(a,
 b,c,d,f){b=+b;c>>>=0;f||R(a,b,c,8,1.7976931348623157E308,-1.7976931348623157E308);H.write(a,b,c,d,52,8);return c+8}function M(a,b){b=b||Infinity;for(var c,d=a.length,f=null,h=[],t=0;t<d;++t){c=a.charCodeAt(t);if(55295<c&&57344>c){if(!f){if(56319<c){-1<(b-=3)&&h.push(239,191,189);continue}else if(t+1===d){-1<(b-=3)&&h.push(239,191,189);continue}f=c;continue}if(56320>c){-1<(b-=3)&&h.push(239,191,189);f=c;continue}c=(f-55296<<10|c-56320)+65536}else f&&-1<(b-=3)&&h.push(239,191,189);f=null;if(128>c){if(0>
 --b)break;h.push(c)}else if(2048>c){if(0>(b-=2))break;h.push(c>>6|192,c&63|128)}else if(65536>c){if(0>(b-=3))break;h.push(c>>12|224,c>>6&63|128,c&63|128)}else if(1114112>c){if(0>(b-=4))break;h.push(c>>18|240,c>>12&63|128,c>>6&63|128,c&63|128)}else throw Error("Invalid code point");}return h}function U(a){for(var b=[],c=0;c<a.length;++c)b.push(a.charCodeAt(c)&255);return b}function O(a){var b=N,c=b.toByteArray;a=a.split("=")[0];a=a.trim().replace(V,"");if(2>a.length)a="";else for(;0!==a.length%4;)a+=
 "=";return c.call(b,a)}function J(a,b,c,d){for(var f=0;f<d&&!(f+c>=b.length||f>=a.length);++f)b[f+c]=a[f];return f}function F(a,b){return a instanceof b||null!=a&&null!=a.constructor&&null!=a.constructor.name&&a.constructor.name===b.name}var N=z("base64-js"),H=z("ieee754");y.Buffer=e;y.SlowBuffer=function(a){+a!=a&&(a=0);return e.alloc(+a)};y.INSPECT_MAX_BYTES=50;var L=2147483647;y.kMaxLength=L;e.TYPED_ARRAY_SUPPORT=function(){try{var a=new Uint8Array(1);a.__proto__={__proto__:Uint8Array.prototype,
 foo:function(){return 42}};return 42===a.foo()}catch(b){return!1}}();e.TYPED_ARRAY_SUPPORT||"undefined"===typeof console||"function"!==typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");Object.defineProperty(e.prototype,"parent",{enumerable:!0,get:function(){if(e.isBuffer(this))return this.buffer}});Object.defineProperty(e.prototype,"offset",{enumerable:!0,get:function(){if(e.isBuffer(this))return this.byteOffset}});
 "undefined"!==typeof Symbol&&null!=Symbol.species&&e[Symbol.species]===e&&Object.defineProperty(e,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1});e.poolSize=8192;e.from=function(a,b,c){return p(a,b,c)};e.prototype.__proto__=Uint8Array.prototype;e.__proto__=Uint8Array;e.alloc=function(a,b,c){g(a);a=0>=a?k(a):void 0!==b?"string"===typeof c?k(a).fill(b,c):k(a).fill(b):k(a);return a};e.allocUnsafe=function(a){return l(a)};e.allocUnsafeSlow=function(a){return l(a)};e.isBuffer=function(a){return null!=
 a&&!0===a._isBuffer&&a!==e.prototype};e.compare=function(a,b){F(a,Uint8Array)&&(a=e.from(a,a.offset,a.byteLength));F(b,Uint8Array)&&(b=e.from(b,b.offset,b.byteLength));if(!e.isBuffer(a)||!e.isBuffer(b))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(a===b)return 0;for(var c=a.length,d=b.length,f=0,h=Math.min(c,d);f<h;++f)if(a[f]!==b[f]){c=a[f];d=b[f];break}return c<d?-1:d<c?1:0};e.isEncoding=function(a){switch(String(a).toLowerCase()){case "hex":case "utf8":case "utf-8":case "ascii":case "latin1":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return!0;
 default:return!1}};e.concat=function(a,b){if(!Array.isArray(a))throw new TypeError('"list" argument must be an Array of Buffers');if(0===a.length)return e.alloc(0);var c;if(void 0===b)for(c=b=0;c<a.length;++c)b+=a[c].length;var d=e.allocUnsafe(b),f=0;for(c=0;c<a.length;++c){var h=a[c];F(h,Uint8Array)&&(h=e.from(h));if(!e.isBuffer(h))throw new TypeError('"list" argument must be an Array of Buffers');h.copy(d,f);f+=h.length}return d};e.byteLength=x;e.prototype._isBuffer=!0;e.prototype.swap16=function(){var a=
 this.length;if(0!==a%2)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var b=0;b<a;b+=2)B(this,b,b+1);return this};e.prototype.swap32=function(){var a=this.length;if(0!==a%4)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var b=0;b<a;b+=4)B(this,b,b+3),B(this,b+1,b+2);return this};e.prototype.swap64=function(){var a=this.length;if(0!==a%8)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var b=0;b<a;b+=8)B(this,b,b+7),B(this,b+1,b+6),
 B(this,b+2,b+5),B(this,b+3,b+4);return this};e.prototype.toString=function(){var a=this.length;return 0===a?"":0===arguments.length?K(this,0,a):r.apply(this,arguments)};e.prototype.toLocaleString=e.prototype.toString;e.prototype.equals=function(a){if(!e.isBuffer(a))throw new TypeError("Argument must be a Buffer");return this===a?!0:0===e.compare(this,a)};e.prototype.inspect=function(){var a=y.INSPECT_MAX_BYTES;var b=this.toString("hex",0,a).replace(/(.{2})/g,"$1 ").trim();this.length>a&&(b+=" ... ");
 return"<Buffer "+b+">"};e.prototype.compare=function(a,b,c,d,f){F(a,Uint8Array)&&(a=e.from(a,a.offset,a.byteLength));if(!e.isBuffer(a))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof a);void 0===b&&(b=0);void 0===c&&(c=a?a.length:0);void 0===d&&(d=0);void 0===f&&(f=this.length);if(0>b||c>a.length||0>d||f>this.length)throw new RangeError("out of range index");if(d>=f&&b>=c)return 0;if(d>=f)return-1;if(b>=c)return 1;b>>>=0;c>>>=0;d>>>=0;f>>>=
 0;if(this===a)return 0;var h=f-d,t=c-b,u=Math.min(h,t);d=this.slice(d,f);a=a.slice(b,c);for(b=0;b<u;++b)if(d[b]!==a[b]){h=d[b];t=a[b];break}return h<t?-1:t<h?1:0};e.prototype.includes=function(a,b,c){return-1!==this.indexOf(a,b,c)};e.prototype.indexOf=function(a,b,c){return C(this,a,b,c,!0)};e.prototype.lastIndexOf=function(a,b,c){return C(this,a,b,c,!1)};e.prototype.write=function(a,b,c,d){if(void 0===b)d="utf8",c=this.length,b=0;else if(void 0===c&&"string"===typeof b)d=b,c=this.length,b=0;else if(isFinite(b))b>>>=
 0,isFinite(c)?(c>>>=0,void 0===d&&(d="utf8")):(d=c,c=void 0);else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var f=this.length-b;if(void 0===c||c>f)c=f;if(0<a.length&&(0>c||0>b)||b>this.length)throw new RangeError("Attempt to write outside buffer bounds");d||(d="utf8");for(f=!1;;)switch(d){case "hex":a:{b=Number(b)||0;d=this.length-b;c?(c=Number(c),c>d&&(c=d)):c=d;d=a.length;c>d/2&&(c=d/2);for(d=0;d<c;++d){f=parseInt(a.substr(2*d,2),16);if(f!==f){a=d;break a}this[b+
 d]=f}a=d}return a;case "utf8":case "utf-8":return J(M(a,this.length-b),this,b,c);case "ascii":return J(U(a),this,b,c);case "latin1":case "binary":return J(U(a),this,b,c);case "base64":return J(O(a),this,b,c);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":d=a;f=this.length-b;for(var h=[],t=0;t<d.length&&!(0>(f-=2));++t){var u=d.charCodeAt(t);a=u>>8;u%=256;h.push(u);h.push(a)}return J(h,this,b,c);default:if(f)throw new TypeError("Unknown encoding: "+d);d=(""+d).toLowerCase();f=!0}};e.prototype.toJSON=
 function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var Q=4096;e.prototype.slice=function(a,b){var c=this.length;a=~~a;b=void 0===b?c:~~b;0>a?(a+=c,0>a&&(a=0)):a>c&&(a=c);0>b?(b+=c,0>b&&(b=0)):b>c&&(b=c);b<a&&(b=a);c=this.subarray(a,b);c.__proto__=e.prototype;return c};e.prototype.readUIntLE=function(a,b,c){a>>>=0;b>>>=0;c||v(a,b,this.length);c=this[a];for(var d=1,f=0;++f<b&&(d*=256);)c+=this[a+f]*d;return c};e.prototype.readUIntBE=function(a,b,c){a>>>=0;b>>>=0;c||
 v(a,b,this.length);c=this[a+--b];for(var d=1;0<b&&(d*=256);)c+=this[a+--b]*d;return c};e.prototype.readUInt8=function(a,b){a>>>=0;b||v(a,1,this.length);return this[a]};e.prototype.readUInt16LE=function(a,b){a>>>=0;b||v(a,2,this.length);return this[a]|this[a+1]<<8};e.prototype.readUInt16BE=function(a,b){a>>>=0;b||v(a,2,this.length);return this[a]<<8|this[a+1]};e.prototype.readUInt32LE=function(a,b){a>>>=0;b||v(a,4,this.length);return(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]};e.prototype.readUInt32BE=
 function(a,b){a>>>=0;b||v(a,4,this.length);return 16777216*this[a]+(this[a+1]<<16|this[a+2]<<8|this[a+3])};e.prototype.readIntLE=function(a,b,c){a>>>=0;b>>>=0;c||v(a,b,this.length);c=this[a];for(var d=1,f=0;++f<b&&(d*=256);)c+=this[a+f]*d;c>=128*d&&(c-=Math.pow(2,8*b));return c};e.prototype.readIntBE=function(a,b,c){a>>>=0;b>>>=0;c||v(a,b,this.length);c=b;for(var d=1,f=this[a+--c];0<c&&(d*=256);)f+=this[a+--c]*d;f>=128*d&&(f-=Math.pow(2,8*b));return f};e.prototype.readInt8=function(a,b){a>>>=0;b||
 v(a,1,this.length);return this[a]&128?-1*(255-this[a]+1):this[a]};e.prototype.readInt16LE=function(a,b){a>>>=0;b||v(a,2,this.length);var c=this[a]|this[a+1]<<8;return c&32768?c|4294901760:c};e.prototype.readInt16BE=function(a,b){a>>>=0;b||v(a,2,this.length);var c=this[a+1]|this[a]<<8;return c&32768?c|4294901760:c};e.prototype.readInt32LE=function(a,b){a>>>=0;b||v(a,4,this.length);return this[a]|this[a+1]<<8|this[a+2]<<16|this[a+3]<<24};e.prototype.readInt32BE=function(a,b){a>>>=0;b||v(a,4,this.length);
 return this[a]<<24|this[a+1]<<16|this[a+2]<<8|this[a+3]};e.prototype.readFloatLE=function(a,b){a>>>=0;b||v(a,4,this.length);return H.read(this,a,!0,23,4)};e.prototype.readFloatBE=function(a,b){a>>>=0;b||v(a,4,this.length);return H.read(this,a,!1,23,4)};e.prototype.readDoubleLE=function(a,b){a>>>=0;b||v(a,8,this.length);return H.read(this,a,!0,52,8)};e.prototype.readDoubleBE=function(a,b){a>>>=0;b||v(a,8,this.length);return H.read(this,a,!1,52,8)};e.prototype.writeUIntLE=function(a,b,c,d){a=+a;b>>>=
 0;c>>>=0;d||w(this,a,b,c,Math.pow(2,8*c)-1,0);d=1;var f=0;for(this[b]=a&255;++f<c&&(d*=256);)this[b+f]=a/d&255;return b+c};e.prototype.writeUIntBE=function(a,b,c,d){a=+a;b>>>=0;c>>>=0;d||w(this,a,b,c,Math.pow(2,8*c)-1,0);d=c-1;var f=1;for(this[b+d]=a&255;0<=--d&&(f*=256);)this[b+d]=a/f&255;return b+c};e.prototype.writeUInt8=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,1,255,0);this[b]=a&255;return b+1};e.prototype.writeUInt16LE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,2,65535,0);this[b]=a&255;this[b+
 1]=a>>>8;return b+2};e.prototype.writeUInt16BE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,2,65535,0);this[b]=a>>>8;this[b+1]=a&255;return b+2};e.prototype.writeUInt32LE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,4,4294967295,0);this[b+3]=a>>>24;this[b+2]=a>>>16;this[b+1]=a>>>8;this[b]=a&255;return b+4};e.prototype.writeUInt32BE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,4,4294967295,0);this[b]=a>>>24;this[b+1]=a>>>16;this[b+2]=a>>>8;this[b+3]=a&255;return b+4};e.prototype.writeIntLE=function(a,b,c,d){a=
 +a;b>>>=0;d||(d=Math.pow(2,8*c-1),w(this,a,b,c,d-1,-d));d=0;var f=1,h=0;for(this[b]=a&255;++d<c&&(f*=256);)0>a&&0===h&&0!==this[b+d-1]&&(h=1),this[b+d]=(a/f>>0)-h&255;return b+c};e.prototype.writeIntBE=function(a,b,c,d){a=+a;b>>>=0;d||(d=Math.pow(2,8*c-1),w(this,a,b,c,d-1,-d));d=c-1;var f=1,h=0;for(this[b+d]=a&255;0<=--d&&(f*=256);)0>a&&0===h&&0!==this[b+d+1]&&(h=1),this[b+d]=(a/f>>0)-h&255;return b+c};e.prototype.writeInt8=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,1,127,-128);0>a&&(a=255+a+1);this[b]=
 a&255;return b+1};e.prototype.writeInt16LE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,2,32767,-32768);this[b]=a&255;this[b+1]=a>>>8;return b+2};e.prototype.writeInt16BE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,2,32767,-32768);this[b]=a>>>8;this[b+1]=a&255;return b+2};e.prototype.writeInt32LE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,b,4,2147483647,-2147483648);this[b]=a&255;this[b+1]=a>>>8;this[b+2]=a>>>16;this[b+3]=a>>>24;return b+4};e.prototype.writeInt32BE=function(a,b,c){a=+a;b>>>=0;c||w(this,a,
 b,4,2147483647,-2147483648);0>a&&(a=4294967295+a+1);this[b]=a>>>24;this[b+1]=a>>>16;this[b+2]=a>>>8;this[b+3]=a&255;return b+4};e.prototype.writeFloatLE=function(a,b,c){return S(this,a,b,!0,c)};e.prototype.writeFloatBE=function(a,b,c){return S(this,a,b,!1,c)};e.prototype.writeDoubleLE=function(a,b,c){return T(this,a,b,!0,c)};e.prototype.writeDoubleBE=function(a,b,c){return T(this,a,b,!1,c)};e.prototype.copy=function(a,b,c,d){if(!e.isBuffer(a))throw new TypeError("argument should be a Buffer");c||
 (c=0);d||0===d||(d=this.length);b>=a.length&&(b=a.length);b||(b=0);0<d&&d<c&&(d=c);if(d===c||0===a.length||0===this.length)return 0;if(0>b)throw new RangeError("targetStart out of bounds");if(0>c||c>=this.length)throw new RangeError("Index out of range");if(0>d)throw new RangeError("sourceEnd out of bounds");d>this.length&&(d=this.length);a.length-b<d-c&&(d=a.length-b+c);var f=d-c;if(this===a&&"function"===typeof Uint8Array.prototype.copyWithin)this.copyWithin(b,c,d);else if(this===a&&c<b&&b<d)for(d=
 f-1;0<=d;--d)a[d+b]=this[d+c];else Uint8Array.prototype.set.call(a,this.subarray(c,d),b);return f};e.prototype.fill=function(a,b,c,d){if("string"===typeof a){"string"===typeof b?(d=b,b=0,c=this.length):"string"===typeof c&&(d=c,c=this.length);if(void 0!==d&&"string"!==typeof d)throw new TypeError("encoding must be a string");if("string"===typeof d&&!e.isEncoding(d))throw new TypeError("Unknown encoding: "+d);if(1===a.length){var f=a.charCodeAt(0);if("utf8"===d&&128>f||"latin1"===d)a=f}}else"number"===
 typeof a&&(a&=255);if(0>b||this.length<b||this.length<c)throw new RangeError("Out of range index");if(c<=b)return this;b>>>=0;c=void 0===c?this.length:c>>>0;a||(a=0);if("number"===typeof a)for(d=b;d<c;++d)this[d]=a;else{f=e.isBuffer(a)?a:e.from(a,d);var h=f.length;if(0===h)throw new TypeError('The value "'+a+'" is invalid for argument "value"');for(d=0;d<c-b;++d)this[d+b]=f[d%h]}return this};var V=/[^+/0-9A-Za-z-_]/g}).call(this)}).call(this,z("buffer").Buffer)},{"base64-js":1,buffer:2,ieee754:3}],
 3:[function(z,E,y){y.read=function(A,k,e,p,g){var l=8*g-p-1;var m=(1<<l)-1,q=m>>1,n=-7;g=e?g-1:0;var x=e?-1:1,r=A[k+g];g+=x;e=r&(1<<-n)-1;r>>=-n;for(n+=l;0<n;e=256*e+A[k+g],g+=x,n-=8);l=e&(1<<-n)-1;e>>=-n;for(n+=p;0<n;l=256*l+A[k+g],g+=x,n-=8);if(0===e)e=1-q;else{if(e===m)return l?NaN:Infinity*(r?-1:1);l+=Math.pow(2,p);e-=q}return(r?-1:1)*l*Math.pow(2,e-p)};y.write=function(A,k,e,p,g,l){var m,q=8*l-g-1,n=(1<<q)-1,x=n>>1,r=23===g?Math.pow(2,-24)-Math.pow(2,-77):0;l=p?0:l-1;var B=p?1:-1,C=0>k||0===
 k&&0>1/k?1:0;k=Math.abs(k);isNaN(k)||Infinity===k?(k=isNaN(k)?1:0,p=n):(p=Math.floor(Math.log(k)/Math.LN2),1>k*(m=Math.pow(2,-p))&&(p--,m*=2),k=1<=p+x?k+r/m:k+r*Math.pow(2,1-x),2<=k*m&&(p++,m/=2),p+x>=n?(k=0,p=n):1<=p+x?(k=(k*m-1)*Math.pow(2,g),p+=x):(k=k*Math.pow(2,x-1)*Math.pow(2,g),p=0));for(;8<=g;A[e+l]=k&255,l+=B,k/=256,g-=8);p=p<<g|k;for(q+=g;0<q;A[e+l]=p&255,l+=B,p/=256,q-=8);A[e+l-B]|=128*C}},{}],4:[function(z,E,y){window.Buffer=z("buffer").Buffer},{buffer:2}]},{},[4]);