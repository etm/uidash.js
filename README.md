## UIDASH.JS

A simple UI lib used by the Cloud Process Execution Engine (cpee.org) and its friends.
Sorry: requires jquery. Feel free to remove this dependency and send a pull request.


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
