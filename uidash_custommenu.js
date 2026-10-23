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

function CustomMenu(e) {
  var target = $(e.target);
  var off = target.offset();
  var remove = function(event) {};
  this.remove = remove;
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
    remove = function(event) {
      if (!event) {
        $('.contextmenu:first').remove();
        $('body', document).unbind('mousedown',remove);
        return;
      }

      if($(event.target).parent('tr.contextmenuitem') && (event.button == 0)) { $(event.target).click(); }
      $('.contextmenu:first').remove();
      $('body', document).unbind('mousedown',remove);
    }
    $('body', document).bind('mousedown',remove);

    if($('div.contextmenu').length > 0) remove();
    var div = $('<div class="contextmenu" oncontextmenu="return false"><table class="contextmenu"/></div>');
    for(head in items) {
      div.children(':first').append('<tr class="contextmenuheader"><td colspan="2">' + head + '</td></tr>');
      for(item of items[head]) {
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
        div.children(':first').append(row);
        row.bind('click', item, function(event){
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
      if ($(event.target).parent('div.menu') && (event.button == 0)) { $(event.target).click(); }
      menu.hide();
      $('body', document).unbind('mousedown',remove);
      $("div.menuitem",$(menu)).each(function(ind,ele){
        $(ele).unbind('click',mitemclick);
      });
    }

    menu.show();
    var mitemclick = function(ele){
      $("div.menuitem[data-selected=selected]",$(menu)).each(function(ind,rem){ $(rem).removeAttr('data-selected'); });
      $(ele.target).attr('data-selected','selected');
      call(ele.target);
    };
    $('body', document).bind('mousedown',remove);

    $("div.menuitem",$(menu)).each(function(ind,ele){
      $(ele).bind('click',mitemclick);
    });

    menu.css({'min-width': target.width()});
    place(menu,off.left,off.left+target.outerWidth(),off.top+target.outerHeight()+1);
  }
}
