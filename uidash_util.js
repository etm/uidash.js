/*
  This file is part of UIDASH.JS.

  UIDASH.JS is free software: you can redistribute it and/or modify it under the terms
  of the GNU General Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any later version.

  UIDASH.JS is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
  PARTICULAR PURPOSE.  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
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
        return part.trim().replace(/[/]+$/, '');
      }
      return part.trim().replace(/^[/]+/, '').replace(/[/]+$/, '');
    })
    .filter(x => x.length > 0)
    .join('/');
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
    var ret = $(this).html().replace(/<div>/g,'').replace(/<\/div>/g,'\n').replace(/<li><br><\/li>/g,'\n').replace(/<li>/g,'').replace(/<\/li>/g,'\n').replace(/<br\/?>/g,'\n').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,'\'').trim();
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
$.fn.serializePrettyXML = function () {
  return vkbeautify.xml(this.serializeXML(),'  ');
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

String.prototype.repeat = function(num) {
  return new Array(num + 1).join(this);
};

String.prototype.unserialize = function() {
  var data = this.split("&");
  var ret = new Array();
  $.each(data, function(){
      var properties = this.split("=");
      ret.push([properties[0], properties[1]]);
  });
  return ret;
};

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}
Array.prototype.remove = function(value){
  return this.filter(function(ele){
    return ele != value;
  });
}

$XR = function(xmlstr) {
  if (typeof xmlstr == "string") {
    return $.parseXML(xmlstr);
  } else {
    return $(xmlstr.ownerDocument || xmlstr);
  }
};

$X = function(xmlstr) {
  return $($.parseXML(xmlstr).documentElement);
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
