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

function CustomMenu(e) {
  var target = $(e.target);
  var off = target.offset();
  var remove = function(event) {};
  // contextmenu() and menu() replace remove, so always call the current one
  this.remove = function() { remove(); };
  e.stopPropagation();

  var place = function(div,left,right,top) { // left, right: borders of the element the menu belongs to
    var win = $(window);
    var minl = win.scrollLeft(), maxr = minl + win.width();
    var mint = win.scrollTop(),  maxb = mint + win.height();
    var flip = right - 15;
    left = left + 15;
    div.css({'left':left,'top':top,'max-width':'','max-height':'','overflow':''});
    if (left + div.outerWidth() > maxr) {
      // flip: right border at end of element - 15, if it fits, otherwise shift left
      if (flip - div.outerWidth() >= minl) { left = flip - div.outerWidth(); }
      else { left = maxr - div.outerWidth(); }
    }
    if (left < minl) { left = minl; div.css({'max-width':maxr - minl,'overflow':'auto'}); }
    if (top + div.outerHeight() > maxb) { top = maxb - div.outerHeight(); }
    if (top < mint) { top = mint; div.css({'max-height':maxb - mint,'overflow':'auto'}); }
    div.css({'left':left,'top':top});
  };

  this.contextmenu = function(items) {
    // only one context menu at a time, close the open one with its own remove
    if (CustomMenu.open_contextmenu) { CustomMenu.open_contextmenu(); }

    remove = function(event) {
      // a left mousedown on an item selects it (only there, not on things outside the menu)
      if (event && event.button == 0 && $(event.target).closest('tr.contextmenuitem').length > 0) { $(event.target).trigger('click'); }
      div.remove();
      $('body', document).off('mousedown',remove);
      if (CustomMenu.open_contextmenu === remove) { CustomMenu.open_contextmenu = null; }
    }
    $('body', document).on('mousedown',remove);
    CustomMenu.open_contextmenu = remove;

    var div = $('<div class="contextmenu" oncontextmenu="return false"><table class="contextmenu"/></div>');
    for (const head in items) {
      div.children().first().append('<tr class="contextmenuheader"><td colspan="2">' + head + '</td></tr>');
      for (const item of items[head]) {
        var icon = null;
        if(item.menu_icon) {
          icon = $X('<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
                      '<g transform="translate(1,1) scale(0.5, 0.5)"/>' +
                    '</svg>');
          icon.children('g').append(item.menu_icon.clone().children());
          icon = icon.serializeXML();
        }
        if(item.text_icon) {
          icon = item.text_icon;
        }
        var row = $('<tr class="contextmenuitem"><td class="contextmenuicon"><div>' + (icon == null ? '' : icon) + '</div></td><td class="' + (item.class ? ' ' + item.class: '') + '">' + item.label + '</td></tr>');
        div.children().first().append(row);
        row.on('click', null, item, function(event){
          event.data.function_call.apply(null, event.data.params);
        });
      }
    }
    div.css({'display':'block'});
    $('body', document).append(div);
    place(div,off.left,off.left+target.outerWidth(),off.top+15);
  }

  this.menu = function(menu,call) {
    remove = function(event) {
      // a left mousedown in the menu selects the item (only there, not on things outside the menu)
      if (event && event.button == 0 && $(event.target).closest(menu).length > 0) { $(event.target).trigger('click'); }
      menu.hide();
      $('body', document).off('mousedown',remove);
      $("div.menuitem",$(menu)).each(function(ind,ele){
        $(ele).off('click',mitemclick);
      });
    }

    menu.show();
    var mitemclick = function(ele){
      $("div.menuitem[data-selected=selected]",$(menu)).each(function(ind,rem){ $(rem).removeAttr('data-selected'); });
      $(ele.target).attr('data-selected','selected');
      call(ele.target);
    };
    $('body', document).on('mousedown',remove);

    $("div.menuitem",$(menu)).each(function(ind,ele){
      $(ele).on('click',mitemclick);
    });

    menu.css({'min-width': target.width()});
    place(menu,off.left,off.left+target.outerWidth(),off.top+target.outerHeight()+1);
  }
}
