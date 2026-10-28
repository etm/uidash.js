## UIDASH.JS

A simple UI lib used by the Cloud Process Execution Engine (cpee.org) and its friends.
Sorry: requires jquery. Feel free to remove this dependency and send a pull request.

uidash_util.js additionally requires vkbeautify for $.fn.serializePrettyXML
(everything else works without it).

uidash_util.js provides $.browser (removed in jquery 1.9), which uidash.js
uses on document ready. So load jquery, then uidash_util.js, then uidash.js.


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
