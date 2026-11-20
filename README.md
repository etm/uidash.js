## UIDASH.JS

A simple UI lib used by the Cloud Process Execution Engine (cpee.org) and its friends.
Sorry: requires jquery. Feel free to remove this dependency and send a pull request.

Load jquery, then uidash_util.js, then uidash.js.

### Layout and tabs

uidash.js/.css lay out a page as boxes with tabs. `is="x-ui-"` turns it on:

```html
<body is="x-ui-">
  <ui-tabbed>
    <ui-tabbar>
      <ui-tab class="switch"></ui-tab>
      <ui-tab data-tab="config">Config</ui-tab>
      <ui-tab class="inactive closeable" data-tab="log">Log</ui-tab>
      <ui-behind></ui-behind>
    </ui-tabbar>
    <ui-content>
      <ui-area data-belongs-to-tab="config">...</ui-area>
      <ui-area data-belongs-to-tab="log" class="inactive">...</ui-area>
    </ui-content>
  </ui-tabbed>
  <ui-resizehandle>drag to resize</ui-resizehandle>
  <ui-rest>
    <ui-tabbar>
      <ui-before></ui-before>
      <ui-tab data-tab="graph">Graph</ui-tab>
      <ui-behind></ui-behind>
    </ui-tabbar>
    <ui-content>
      <ui-area data-belongs-to-tab="graph">...</ui-area>
      <ui-resizehandle data-belongs-to-tab="graph" data-label="drag to resize"></ui-resizehandle>
      <ui-area data-belongs-to-tab="graph">...</ui-area>
    </ui-content>
  </ui-rest>
</body>
```

* `ui-tabbed` is a box as high as its contents, `ui-rest` takes the rest of the
  window. Its areas sit side by side.
* Clicking a `ui-tab` shows the `ui-area`s with the same `data-tab`, the others
  get `inactive`. The `switch` tab folds the box.
* `closeable` tabs get a close button. `ui-behind` (and `ui-before`,
  `ui-last`) hold extra things in the tab bar, like links.
* `ui-resizehandle` between boxes changes their height, between areas their
  width.

From code:

* `uidash_add_tab(tabbed, title, id, closeable, classes)` adds a tab with an
  empty area (or shows it, if it exists), `uidash_add_tab_active(...)` also
  activates it.
* `uidash_activate_tab(tab)`, `uidash_toggle_vis_tab(tabbed)`,
  `uidash_empty_tab_contents(id)`.
* Activating a tab sends `uidash:activate_tab` on `document`, with `tabbed`
  and `active` (the id) in `detail`.

Inside areas, tables with `x-ui-layout` (full width) or `x-ui-compact` have no
borders or spacing. `hidden` hides, `noselect` prevents selecting text.
Buttons, inputs and links are styled too. The colours are the `--x-ui-*`
variables in `:root` of uidash.css.

### Dialogues

uidash_dialogue.js/.css add speech bubble like dialogues that point at an element:

```html
<link rel="stylesheet" href="uidash.css"/>
<link rel="stylesheet" href="uidash_dialogue.css"/>
<script src="jquery.min.js"></script>
<script src="uidash_dialogue.js"></script>

<button id="info">?</button>
<ui-dialogue id="help">Some text.</ui-dialogue>

<script>
  $('#info').on('click', function() { uidash_dialogue($('#help'), this); });
</script>
```

Dialogues are hidden until `uidash_dialogue(dialogue, target)` shows one next
to `target`, where it fits into the window (left-top, if possible). It closes
with its close button, when clicking outside of it, or with
`uidash_dialogue_close(dialogue)`.

Styling:

* Colours: `--x-ui-border-color`, `--x-ui-background-color`,
  `--x-ui-light-text-color` (from uidash.css), for all dialogues or for one.
* Arrow: `--x-ui-dialogue-arrow` (length, default 0.7) and
  `--x-ui-dialogue-inset` (distance from the corner, default 1.7), in em
  without unit.
* Size: `width`, `height`, `max-width`, `max-height`, the contents scroll.
* `font-size`, `border-radius`, `box-shadow`, `z-index`.
* `ui-dialogue > ui-dialogue-content` for the contents, `ui-dialogue > ui-close`
  for the close button, `ui-dialogue[data-position=left-top]` etc. for one
  position.

Don't change `position`, `display`, `overflow` or the border width of
`ui-dialogue`.

### Menus

uidash_custommenu.js/.css add menus that open at the element of an event
(click, contextmenu, ...).

A menu built from data, with headings and entries:

```js
$('#things').on('contextmenu', function(e) {
  new CustomMenu(e).contextmenu({
    'Change to': [
      { label: 'running', function_call: change_it, params: ['a', 'running'],
        text_icon: '<i class="uidash-icon-value"></i>' },
      { label: 'stopped', function_call: change_it, params: ['a', 'stopped'] }
    ]
  });
  return false;
});
```

Choosing an entry calls `function_call(...params)`. Optional: `text_icon`
(html), `menu_icon` (an svg, needs uidash_util.js), `class` (for the label).

A menu that is already in the html:

```html
<div class="menu" id="templates">
  <div class="menuitem">one</div>
  <div class="menuitem">two</div>
</div>
```

```js
$('#load').on('click', function(e) {
  new CustomMenu(e).menu($('#templates'), function(item) { load($(item).text()); });
});
```

The chosen item gets `data-selected="selected"`.

Menus close when clicking outside of them, or with `remove()` on the
`CustomMenu`.

Styling: `div.contextmenu` (`tr.contextmenuheader`, `tr.contextmenuitem`) and
`div.menu` (`div.menuitem`).

### Icons

uidash.css includes an icon font. Use it with `<i class="uidash-icon-NAME"></i>`,
uidash-icons.html shows all icons and their names.

### Utilities

uidash_util.js:

* `$X(xmlstring)` parses xml into a jquery object (the root element),
  `$XR(xmlstring)` into an xml document.
* `.serializeXML()` turns it back into a string, `.serializePrettyXML()`
  indented.
* `.get_val()` and `.set_val(value)` read and write inputs, checkboxes, radio
  buttons, selects, textareas, lists (one line per item) and other elements
  (as text).
* `$(24).to_em()` turns pixels into em, relative to the font size of body
  (`"1.50000000em"` for 16px).
* `$UUID()` makes a random uuid, `$B64(string)` base64 for unicode strings,
  `$.path_join('a/', '/b')` joins path parts (`"a/b"`).
* `$.pressCmd()` is true on macs, `$.pressCtrl()` everywhere else.
* `$.browser.name` and `$.browser.version`.
* `array.sample()` returns a random element, `array.remove(value)` a copy
  without it, `'a=1&b=2'.unserialize()` gives `[['a','1'],['b','2']]`.


### Development

Instructions

```bash
sudo dnf install nodejs nodejs-npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo "export PATH=\"$\{PATH}\":~/.npm-global/bin" >> ~/.bashrc
# close terminal and then open again
npm install -g fantasticon
```

Now you can go to the checked out git repo and recreate the font (possibly after adding svgs to the dir).

```bash
rake
```
