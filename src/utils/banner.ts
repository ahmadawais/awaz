import pc from 'picocolors';

export const banner = `
${pc.white('▄▀█ █░█░█ ▄▀█ ▀█')}
${pc.gray('█▀█ ▀▄▀▄▀ █▀█ █▄')}
${pc.dim('text to speech cli.')}
`;

export function showBanner(): void {
	console.log(banner);
}
