export function padRight(str: string, len: number): string {
	if (str.length >= len) return str.slice(0, len);
	return str + ' '.repeat(len - str.length);
}
