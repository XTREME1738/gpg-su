# GnuPG / PGP user authentication in Node.JS
This program was developed purely for fun as I just wanted to be able to authenticate with GPG keys
This is the orginal Node.JS version I tried to make a verion in C but could not find a well-documented library
All GPG keys must have permissions of 0600 making them read and write by only the owner for security reasons even though this probably is not secure at all
Licensed under MIT
Using readline-sync and openpgp
PRs are welcomed for features, etc
I don't know why anyone would use this but I only wanted it because I needed a way to get past sudo if i ever broke my 2FA or forgot my password so its good for that although not the best if you forget the GPG key passphrase
So instead of using a password to login you can login with a gpg key and a passphrase...

# Requirements
- Sudo
- Node.JS
- Probably also some other dependencies in openpgp but I don't know them and maybe already included in the distro
- openpgp
- readline-sync
- pkg or another packager

# Building
I used pkg but you can use any packager
For pkg as of writing it didn't support anything above Node 18 at least not for me
If you want to get Node 18 you can download the tarball from https://nodejs.org or use the n package on npm with
```
npm i n
```
then use
```
n v18.5
```
it will download to its directory you can find by looking at --help

To build it is really simple from there if using pkg just run
```
pkg index.js
```
or use esbuild and generate a cjs file I don't know if just running pkg on it works i didn't try
