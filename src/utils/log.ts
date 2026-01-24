import pc from 'picocolors';

export function error(msg: string): void {
	console.error(`${pc.red('✖')} ${msg}`);
}

export function warn(msg: string): void {
	console.error(`${pc.yellow('⚠')} ${msg}`);
}

export function info(msg: string): void {
	console.error(`${pc.blue('ℹ')} ${msg}`);
}

export function success(msg: string): void {
	console.error(`${pc.green('✔')} ${msg}`);
}

export function dim(msg: string): string {
	return pc.dim(msg);
}

export function bold(msg: string): string {
	return pc.bold(msg);
}

export function cyan(msg: string): string {
	return pc.cyan(msg);
}

export function yellow(msg: string): string {
	return pc.yellow(msg);
}

export function green(msg: string): string {
	return pc.green(msg);
}

export function red(msg: string): string {
	return pc.red(msg);
}
