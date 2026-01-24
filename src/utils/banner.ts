import pc from 'picocolors';

export const banner = `
${pc.cyan('╔═════════════════════════════════════╗')}
${pc.cyan('║')}  ${pc.bold(pc.magenta('awaz'))} ${pc.dim('— text to speech, done right')} ${pc.cyan('║')}
${pc.cyan('╚═════════════════════════════════════╝')}
`;

export function showBanner(): void {
	console.log(banner);
}
