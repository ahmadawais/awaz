import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PackageJson {
	name: string;
	version: string;
	description: string;
}

let _packageJson: PackageJson | null = null;

export function getPackageJson(): PackageJson {
	if (_packageJson) {
		return _packageJson;
	}

	// Try to find package.json, walking up from current file
	let dir = __dirname;
	for (let i = 0; i < 5; i++) {
		const pkgPath = path.join(dir, 'package.json');
		if (fs.existsSync(pkgPath)) {
			_packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as PackageJson;
			return _packageJson;
		}
		dir = path.dirname(dir);
	}

	// Fallback
	return {
		name: 'awaz',
		version: '0.0.1',
		description: 'Text to speech. Done right.'
	};
}

export function getVersion(): string {
	return getPackageJson().version;
}
