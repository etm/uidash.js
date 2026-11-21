/*
  This file is part of UIDASH.JS.

  UIDASH.JS is free software: you can redistribute it and/or modify it under the terms
  of the GNU Lesser General Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any later version.

  UIDASH.JS is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
  PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with
  UIDASH.JS. If not, see <http://www.gnu.org/licenses/>.
*/

$B64 = function(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

$.path_join = ((...parts) => {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.trim().replace(/(?<!:)[/]+$/, '');
      }
      return part.trim().replace(/^[/]+/, '').replace(/(?<!:)[/]+$/, '');
    })
    .filter(x => x.length > 0)
    .join('/');
});

// the parameters of a query string (default: the one of the page) as object, a
// repeated name gets its last value. With list true as [{name, value}, ...] in
// their order, which keeps repeated names.
$.query_params = ((qs, list) => {
  const params = new URLSearchParams(qs === undefined ? window.location.search : qs);
  return list ? [...params].map(([name, value]) => ({ name: name, value: value })) : Object.fromEntries(params);
});

$.pressCmd = (() => {
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    return navigator.userAgentData.platform === 'macOS';
  }
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
});
$.pressCtrl = (() => {
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    return !(navigator.userAgentData.platform === 'macOS');
  }
  return !(/Mac|iPhone|iPod|iPad/i.test(navigator.platform));
});

// replacement for $.browser (removed in jquery 1.9), only name and version.
// Safari reports its WebKit version (e.g. 605), not the marketing version.
if (!$.browser) {
  $.browser = (() => {
    const ua = navigator.userAgent;
    const tests = [
      ['Firefox', /Firefox\/([\d.]+)/],
      ['Chrome',  /Chrom(?:e|ium)\/([\d.]+)/],
      ['Safari',  /AppleWebKit\/([\d.]+)/]
    ];
    for (const [name, re] of tests) {
      const m = ua.match(re);
      if (m) { return { name: name, version: parseFloat(m[1]) }; }
    }
    return { name: 'unknown', version: 0 };
  })();
}

$.fn.to_em_raw = function(settings){
  settings = jQuery.extend({
      scope: 'body'
  }, settings);
  var that = parseInt(this[0]||"0",10),
      scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
      scopeVal = scopeTest.height();
  scopeTest.remove();
  return (that / scopeVal).toFixed(8);
};
$.fn.to_em = function(settings){
  return $(this[0]).to_em_raw(settings) + 'em';
};

$.fn.get_val = function () {
  if ($(this).is('input:radio')) {
    return $(this).filter(':checked').val();
  } else if ($(this).is('input:checkbox')) {
    return $(this).filter(':checked').is(':checked');
  } else if ($(this).is('input') || $(this).is('select') || $(this).is('textarea')) {
    return $(this).val();
  } else {
    var ret = $(this).html().replace(/<div>/g,'').replace(/<\/div>/g,'\n').replace(/<li><br><\/li>/g,'\n').replace(/<li>/g,'').replace(/<\/li>/g,'\n').replace(/<br\/?>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,'\'').trim();
    return ret;
  }
};
$.fn.set_val = function (val) {
  if ($(this).is('input:radio')) {
    $(this).val([val]);
  } else if ($(this).is('input:checkbox')) {
    let tval = String(val).toLowerCase();
    $(this).prop('checked',tval == 'true' ? true : false);
  } else if ($(this).is('input') || $(this).is('select') || $(this).is('textarea')) {
    $(this).val(val);
  } else if ($(this).is('ol') || $(this).is('ul')) {
    $(this).empty();
    let t = $(this);
    let e = val.split(/\r?\n/);
    e.forEach((l) => {
      let n = $("<li></li>");
      let s = l.replace(/ /g,'');
      if (s.length != 0) {
        n.text(l);
      } else {
        n.html($('<br>'));
      }
      t.append(n);
    });
    if (e.length == 0) {
     t.append($("<li><br></li>"));
    }
  } else {
    $(this).text(val);
  }
};
// indents a copy of the DOM and lets XMLSerializer do namespaces and escaping.
// Elements with text or mixed content are kept as is, whitespace between
// elements is dropped, so differently indented input gives the same output.
$.fn.serializePrettyXML = function () {
  const xs = new XMLSerializer();
  const indent = (node, depth) => {
    const kids = Array.from(node.childNodes);
    if (kids.some(c => (c.nodeType == Node.TEXT_NODE && c.nodeValue.trim() != '') || c.nodeType == Node.CDATA_SECTION_NODE)) { return; }
    kids.forEach(c => {
      if (c.nodeType == Node.TEXT_NODE) { node.removeChild(c); return; }
      node.insertBefore(node.ownerDocument.createTextNode('\n' + '  '.repeat(depth + 1)), c);
      if (c.nodeType == Node.ELEMENT_NODE) { indent(c, depth + 1); }
    });
    if (node.childNodes.length > 0) {
      node.appendChild(node.ownerDocument.createTextNode('\n' + '  '.repeat(depth)));
    }
  };
  const out = [];
  this.each(function() {
    const top = this.nodeType == Node.DOCUMENT_NODE ? Array.from(this.childNodes) : [this];
    top.forEach(n => {
      const c = n.cloneNode(true);
      if (c.nodeType == Node.ELEMENT_NODE) { indent(c, 0); }
      out.push(xs.serializeToString(c));
    });
  });
  return out.join('\n');
};

$.fn.serializeXML = function () {
  var out = '';
  if (typeof XMLSerializer == 'function') {
      var xs = new XMLSerializer();
      this.each(function() {
          out += xs.serializeToString(this);
      });
  } else if (this[0] && this[0].xml != 'undefined') {
      this.each(function() {
          out += this.xml;
      });
  }
  return out;
};

$.strip_xmlns = ((text, ns) => {
  const list = ns === undefined ? null : [].concat(ns);
  return text.replace(/<[A-Za-z_][^<>]*>/g, (tag) => {
    return tag.replace(/\s+xmlns\s*=\s*(["'])(.*?)\1/g, (decl, quote, uri) => {
      return list === null || list.includes(uri) ? '' : decl;
    });
  });
});

// not enumerable, so they don't show up in for..in loops over strings and arrays
Object.defineProperty(String.prototype, 'unserialize', { writable: true, configurable: true, value: function() {
  var data = this.split("&");
  var ret = new Array();
  $.each(data, function(){
      var properties = this.split("=");
      ret.push([properties[0], properties[1]]);
  });
  return ret;
}});

Object.defineProperty(Array.prototype, 'sample', { writable: true, configurable: true, value: function(){
  return this[Math.floor(Math.random()*this.length)];
}});
Object.defineProperty(Array.prototype, 'remove', { writable: true, configurable: true, value: function(value){
  return this.filter(function(ele){
    return ele != value;
  });
}});
// each value once, in the order of their first occurrence
Object.defineProperty(Array.prototype, 'uniq', { writable: true, configurable: true, value: function(){
  return [...new Set(this)];
}});
// the values that are also in other, each once (like _.intersection)
Object.defineProperty(Array.prototype, 'intersection', { writable: true, configurable: true, value: function(other){
  return this.filter((ele) => other.includes(ele)).uniq();
}});

/*
 * sprintf and friends, the value first, then the format:
 *   (7).sprintf("%03d")            -> "007" (strings and numbers)
 *   ["a", "b"].vsprintf("%s %s")   -> "a b" (several values)
 *   (7).printf("%03d")             -> console.info("007"), vprintf for arrays
 *
 * Taken from jQuery sprintf 0.0.6 (perl based functionallity for sprintf and
 * friends), Copyright © 2008 Carl Fürstenberg, released under GPL, BSD, or
 * MIT license, used here under the MIT license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
function uidash_vsprintf( format, args ) {
  if( format == null ) {
    throw "Not enough arguments for vsprintf";
  }
  if( args == null ) {
    args = [];
  }

  function _sprintf_format( type, value, flags ) {

    // Similar to how perl printf works
    if( value == undefined ) {
      if( type == 's' ) {
        return '';
      } else {
        return '0';
      }
    }

    var result;
    var prefix = '';
    var fill = '';
    var fillchar = ' ';
    if( flags['short'] || flags['long'] || flags['long_long'] ) {
      /* This is pretty ugly, but as JS ignores bit lengths except
       * somewhat when working with bit operators.
       * So we fake a bit :) */
      switch( type ) {
      case 'e':
      case 'f':
      case 'G':
      case 'E':
      case 'G':
      case 'd': /* signed */
        if( flags['short'] ) {
          if( value >= 32767 ) {
            value = 32767;
          } else if( value <= -32767-1 ) {
            value = -32767-1;
          }
        } else if ( flags['long'] ) {
          if( value >= 2147483647 ) {
            value = 2147483647;
          } else if( value <= -2147483647-1 ) {
            value = -2147483647-1;
          }
        } else /*if ( flags['long_long'] )*/ {
          if( value >= 9223372036854775807 ) {
            value = 9223372036854775807;
          } else if( value <= -9223372036854775807-1 ) {
            value = -9223372036854775807-1;
          }
        }
        break;
      case 'X':
      case 'B':
      case 'u':
      case 'o':
      case 'x':
      case 'b': /* unsigned */
        if( value < 0 ) {
          /* Pretty ugly, but one only solution */
          value = Math.abs( value ) - 1;
        }
        if( flags['short'] ) {
          if( value >= 65535 ) {
            value = 65535;
          }
        } else if ( flags['long'] ) {
          if( value >= 4294967295 ) {
            value = 4294967295;
          }

        } else /*if ( flags['long_long'] )*/ {
          if( value >= 18446744073709551615 ) {
            value = 18446744073709551615;
          }

        }
        break;
      }
    }
    switch( type ) {
    case 'c':
      result = String.fromCharCode( parseInt( value ) );
      break;
    case 's':
      result = value.toString();
      break;
    case 'd':
      result = (new Number( parseInt( value ) ) ).toString();
      break;
    case 'u':
      result = (new Number( parseInt( value ) ) ).toString();
      break;
    case 'o':
      result = (new Number( parseInt( value ) ) ).toString(8);
      break;
    case 'x':
      result = (new Number( parseInt( value ) ) ).toString(16);
      break;
    case 'B':
    case 'b':
      result = (new Number( parseInt( value ) ) ).toString(2);
      break;
    case 'e':
      var digits = flags['precision'] ? flags['precision'] : 6;
      result = (new Number( value ) ).toExponential( digits ).toString();
      break;
    case 'f':
      var digits = flags['precision'] ? flags['precision'] : 6;
      result = (new Number( value ) ).toFixed( digits ).toString();
      break;
    case 'g':
      var digits = flags['precision'] ? flags['precision'] : 6;
      result = (new Number( value ) ).toPrecision( digits ).toString();
      break;
    case 'X':
      result = (new Number( parseInt( value ) ) ).toString(16).toUpperCase();
      break;
    case 'E':
      var digits = flags['precision'] ? flags['precision'] : 6;
      result = (new Number( value ) ).toExponential( digits ).toString().toUpperCase();
      break;
    case 'G':
      var digits = flags['precision'] ? flags['precision'] : 6;
      result = (new Number( value ) ).toPrecision( digits ).toString().toUpperCase();
      break;
    }

    if(flags['+'] && parseFloat( value ) > 0 && ['d','e','f','g','E','G'].indexOf(type) != -1 ) {
      prefix = '+';
    }

    if(flags[' '] && parseFloat( value ) > 0 && ['d','e','f','g','E','G'].indexOf(type) != -1 ) {
      prefix = ' ';
    }

    if( flags['#'] && parseInt( value ) != 0 ) {
      switch(type) {
      case 'o':
        prefix = '0';
        break;
      case 'x':
      case 'X':
        prefix = '0x';
        break;
      case 'b':
        prefix = '0b';
        break;
      case 'B':
        prefix = '0B';
        break;
      }
    }

    if( flags['0'] && !flags['-'] ) {
      fillchar = '0';
    }

    if( flags['width'] && flags['width'] > ( result.length + prefix.length ) ) {
      var tofill = flags['width'] - result.length - prefix.length;
      for( var i = 0; i < tofill; ++i ) {
        fill += fillchar;
      }
    }

    if( flags['-'] && !flags['0'] ) {
      result += fill;
    } else {
      result = fill + result;
    }

    return prefix + result;
  };

  var result = "";

  var index = 0;
  var current_index = 0;
  var flags = {
    'long': false,
    'short': false,
    'long_long': false
  };
  var in_operator = false;
  var relative = false;
  var precision = false;
  var fixed = false;
  var vector = false;
  var bitwidth = false;
  var vector_delimiter = '.';

  for( var i = 0; i < format.length; ++i ) {
    var current_char = format.charAt(i);
    if( in_operator ) {
      // backward compat
      switch( current_char ) {
      case 'i':
        current_char = 'd';
        break;
      case 'D':
        flags['long'] = true;
        current_char = 'd';
        break;
      case 'U':
        flags['long'] = true;
        current_char = 'u';
        break;
      case 'O':
        flags['long'] = true;
        current_char = 'o';
        break;
      case 'F':
        current_char = 'f';
        break;
      }
      switch( current_char ) {
      case 'c':
      case 's':
      case 'd':
      case 'u':
      case 'o':
      case 'x':
      case 'e':
      case 'f':
      case 'g':
      case 'X':
      case 'E':
      case 'G':
      case 'b':
      case 'B':
        var value = args[current_index];
        if( vector ) {
          var fixed_value = value;
          if( value instanceof Array ) {
            // if the value is an array, assume to work on it directly
            fixed_value = value;
          } else if ( typeof(value) == 'string' || value instanceof String ) {
            // normal behavour, assume string is a bitmap
            fixed_value = value.split('').map( function( value ) { return value.charCodeAt(); } );
          } else if ( ( typeof(value) == 'number' || value instanceof Number ) && flags['bitwidth'] ) {
            // if we defined a width, assume we want to vectorize the bits directly
            fixed_value = [];
            do {
              fixed_value.unshift( value & ~(~0 << flags['bitwidth'] ) );
            } while( value >>>= flags['bitwidth'] );
          } else {
            fixed_value = value.toString().split('').map( function( value ) { return value.charCodeAt(); } );

          }
          result += fixed_value.map( function( value ) {
              return _sprintf_format( current_char, value, flags );
            }).join( vector_delimiter );
        } else {
          result += _sprintf_format( current_char, value, flags );
        }
        if( !fixed ) {
          ++index;
        }
        current_index = index;
        flags = {};
        relative = false;
        in_operator = false;
        precision = false;
        fixed = false;
        vector = false;
        bitwidth = false;
        vector_delimiter = '.';
        break;
      case 'v':
        vector = true;
        break;
      case ' ':
      case '0':
      case '-':
      case '+':
      case '#':
        flags[current_char] = true;
        break;
      case '*':
        relative = true;
        break;
      case '.':
        precision = true;
        break;
      case '@':
        bitwidth = true;
        break;
      case 'l':
        if( flags['long'] ) {
          flags['long_long'] = true;
          flags['long'] = false;
        } else {
          flags['long'] = true;
          flags['long_long'] = false;
        }
        flags['short'] = false;
        break;
      case 'q':
      case 'L':
        flags['long_long'] = true;
        flags['long'] = false;
        flags['short'] = false;
        break;
      case 'h':
        flags['short'] = true;
        flags['long'] = false;
        flags['long_long'] = false;
        break;
      }
      if( /\d/.test( current_char ) ) {
        var num = parseInt( format.substr( i ) );
        var len = num.toString().length;
        i += len - 1;
        var next = format.charAt( i  + 1 );
        if( next == '$' ) {
          if( num < 0 || num > args.length ) {
            throw "out of bound";
          }
          if( relative ) {
            if( precision ) {
              flags['precision'] = args[num - 1];
              precision = false;
            } else if( format.charAt( i + 2 ) == 'v' ) {
              vector_delimiter = args[num - 1];
            }else {
              flags['width'] = args[num - 1];
            }
            relative = false;
          } else {
            fixed = true;
            current_index = num - 1;
          }
          ++i;
        } else if( precision ) {
          flags['precision'] = num;
          precision = false;
        } else if( bitwidth ) {
          flags['bitwidth'] = num;
          bitwidth = false;
        } else {
          flags['width'] = num;
        }
      } else if ( relative && !/\d/.test( format.charAt( i + 1 ) ) ) {
        if( precision ) {
          flags['precision'] = args[current_index];
          precision = false;
        } else if( format.charAt( i + 1 ) == 'v' ) {
          vector_delimiter = args[current_index];
        } else {
          flags['width'] = args[current_index];
        }
        ++index;
        if( !fixed ) {
          current_index++;
        }
        relative = false;
      }
    } else {
      if( current_char == '%' ) {
        // If the next character is an %, then we have an escaped %,
        // we'll take this as an exception to the normal lookup, as
        // we don't want/need to process this.
        if( format.charAt(i+1) == '%' ) {
          result += '%';
          ++i;
          continue;
        }
        in_operator = true;
        continue;
      } else {
        result += current_char;
        continue;
      }
    }
  }
  return result;
}
[String.prototype, Number.prototype].forEach((proto) => {
  Object.defineProperty(proto, 'sprintf', { writable: true, configurable: true, value: function(format){
    return uidash_vsprintf(format, [this.valueOf()]);
  }});
  Object.defineProperty(proto, 'printf', { writable: true, configurable: true, value: function(format){
    console.info(uidash_vsprintf(format, [this.valueOf()]));
  }});
});
Object.defineProperty(Array.prototype, 'vsprintf', { writable: true, configurable: true, value: function(format){
  return uidash_vsprintf(format, this);
}});
Object.defineProperty(Array.prototype, 'vprintf', { writable: true, configurable: true, value: function(format){
  console.info(uidash_vsprintf(format, this));
}});

// like $.parseXML, but throws only the message of the parser: chrome wraps it
// into prose, firefox adds the url of the page and the source line. An empty
// string throws as well.
function uidash_parse_xml(xmlstr) {
  const doc = new DOMParser().parseFromString(xmlstr, "text/xml");
  const err = doc.getElementsByTagName("parsererror")[0];
  if (err) {
    const div = err.querySelector("div");
    const msg = div ? div.textContent : err.firstChild ? err.firstChild.textContent : err.textContent;
    throw new Error(msg.replace(/\nLocation: .*/, "").trim());
  }
  return doc;
}

$XR = function(xmlstr) {
  if (typeof xmlstr == "string") {
    return uidash_parse_xml(xmlstr);
  } else {
    return $(xmlstr.ownerDocument || xmlstr);
  }
};

$X = function(xmlstr) {
  return $(uidash_parse_xml(xmlstr).documentElement);
};

$UUID = function() {
  var uuid = (function () {
    var i,
      c = "89ab",
      u = [];
    for (i = 0; i < 36; i += 1) {
      u[i] = (Math.random() * 16 | 0).toString(16);
    }
    u[8] = u[13] = u[18] = u[23] = "-";
    u[14] = "4";
    u[19] = c.charAt(Math.random() * 4 | 0);
    return u.join("");
  })();
  return {
    toString: function () {
      return uuid;
    },
    valueOf: function () {
      return uuid;
    }
  };
};
