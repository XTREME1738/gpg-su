/*
GnuPG / PGP user authentication - originl Node.JS version
Licensed under MIT and using opengpg and readline-sync libraries
Created by XTREME
codeberg.org/XTREME/gpg-su
github.com/XTREME/gpg-su
Made 12 Nov 2023 23:30 BST
Last Modified 13 Nov 2023 01:50 BST
*/

const fs = require('fs');
const openpgp = require('openpgp');
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');

function checkPermissions(file) {
	return fs.stat(file, (err, stats) => {
		const unixFilePermissions = (stats.mode & parseInt('777', 8)).toString(8);
		if (unixFilePermissions != "600") {
			console.error('File permissions on gpg keys must be 0600')
			process.exit(1)
		}
	})
}

async function signAndVerify(username, privateKeyPath, passphrase) {
	try {
		// Read public key
		const publicKeyPath = `/etc/gpg_auth/${username}.gpg`;
		if (!fs.existsSync(publicKeyPath)) {
			console.error('Your user does not have a GPG authentication key configured.');
			process.exit(1);
		}
		await checkPermissions(publicKeyPath);
		const publicKeyArmored = fs.readFileSync(publicKeyPath, 'utf-8');
		const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

		const message = await openpgp.createCleartextMessage({ text: `Sign test.` });

		const privateKey = await openpgp.decryptKey({
			privateKey: await openpgp.readPrivateKey({ armoredKey: fs.readFileSync(privateKeyPath, 'utf-8') }),
			passphrase
		});

		const cleartextMessage = await openpgp.sign({
			message,
			signingKeys: privateKey,
		});

		// reads the signed message as a cleartextMessage
                const signedMessage = await openpgp.readCleartextMessage({ cleartextMessage });
		
		const verification = await openpgp.verify({
			message: signedMessage,
			verificationKeys: publicKey,
		});

		// gets the verification signature
		const { verified } = verification.signatures[0];
		try {
			// if signature is verified then will continue otherwise will throw error
			await verified;
			console.log('Signature verified. Authentication successful.');
			const login = readlineSync.question('User to login as: ');
			if (!login || !(/^[a-zA-Z0-9]+$/.test(login)) || !fs.readFileSync('/etc/passwd').includes(login)) {
				console.error('Invalid user.')
				process.exit(1);
			}
			try { execSync(`sudo -i${login ? ` su - ${login}` : ''}`, { stdio: 'inherit' }); } catch { }
		} catch {
			console.error('Signature verification failed. Authentication failed.');
		}
	} catch (error) {
		console.error('Error:', error.message || error);
	}
}

try {
	// set the uid to root
	process.setuid(0);
} catch {
	console.error('Could not set process uid.');
}

// get the username and ask for private key path
const username = process.env.LOGNAME;
if (!username) {
	console.error('Invalid user.');
	process.exit(1);
}
const privateKeyPath = readlineSync.question('Path to the private key: ').replace('~', `/home/${username}`);
if (!privateKeyPath || !fs.existsSync(privateKeyPath)) {
	console.error('Invalid private key path.');
	process.exit(1);
}

// Prompt for the passphrase
const passphrase = readlineSync.question('Enter key passphrase: ', { hideEchoBack: true, mask: '*' });

signAndVerify(username, privateKeyPath, passphrase);

