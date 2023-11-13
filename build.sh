#!/bin/bash
# this file probably will not work for you but if you install node 18 and copy npx from it to npx18 in your bin directory it should work
npx esbuild index.js  --bundle --outfile=gpg-su.cjs --format=cjs --platform=node
npx18 pkg gpg-su.cjs -t node18
sudo chown root:root gpg-su
sudo mv gpg-su /usr/bin/gpg-su
sudo chmod 4755 /usr/bin/gpg-su
