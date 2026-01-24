import { Command, Option } from 'commander';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createPromptingCommand, createSpeakCommand, createVoicesCommand } from './commands/index.js';
import { banner, getVersion } from './utils/index.js';

const program = new Command();

// Get version from package.json
const version = getVersion();

program
	.name('awaz')
	.description('Text to speech. Done right.')
	.version(version, '-v, --version', 'Print version and exit')
	.helpOption('-h, --help', 'Display help for command')
	.addOption(
		new Option('--api-key <key>', 'ElevenLabs API key (or ELEVENLABS_API_KEY)')
	)
	.addOption(
		new Option('--base-url <url>', 'Override ElevenLabs API base URL')
			.default('https://api.elevenlabs.io')
	)
	.addOption(new Option('--local').hideHelp())
	.addOption(new Option('--env <path>', 'Load env file from path'));

// Add commands
program.addCommand(createSpeakCommand());
program.addCommand(createVoicesCommand());
program.addCommand(createPromptingCommand());

// Check if called like `awaz "Hello"` (default to speak subcommand)
function maybeDefaultToSpeak(): void {
	if (process.argv.length <= 2) {
		return;
	}

	// npm/pnpm pass-through typically prefixes args with "--"; drop it
	if (process.argv[2] === '--') {
		process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(3)];
		if (process.argv.length <= 2) {
			return;
		}
	}

	const first = process.argv[2];

	// Check for known subcommands
	const knownCommands = ['speak', 'voices', 'prompting', 'prompt', 'guide', 'tips'];
	const isKnown =
		knownCommands.includes(first.toLowerCase()) ||
		first === '-h' ||
		first === '--help' ||
		first === '-v' ||
		first === '--version';

	if (!isKnown) {
		// Insert 'speak' subcommand
		process.argv = [process.argv[0], process.argv[1], 'speak', ...process.argv.slice(2)];
	}
}

// Override version output to be clean (no banner)
program.configureOutput({
	writeOut: (str) => process.stdout.write(str),
	writeErr: (str) => process.stderr.write(str)
});

// Custom help to show banner
const originalHelp = program.helpInformation.bind(program);
program.helpInformation = function (): string {
	return banner + '\n' + originalHelp();
};

export async function run(): Promise<void> {
	// Check for version flag early
	if (process.argv.includes('-v') || process.argv.includes('--version')) {
		console.log(version);
		process.exit(0);
	}

	// Load .env file: explicit path > local .env > env var
	const envIndex = process.argv.findIndex(arg => arg === '--env');
	const hasEnvFlag = envIndex !== -1 && process.argv[envIndex + 1];
	const hasEnvKey = process.env.ELEVENLABS_API_KEY || process.env.AWAZ_API_KEY;

	if (hasEnvFlag) {
		config({ path: resolve(process.argv[envIndex + 1]), quiet: true });
	}

	if (!hasEnvFlag && !hasEnvKey) {
		config({ quiet: true });
	}

	maybeDefaultToSpeak();
	await program.parseAsync(process.argv);
}

export { program };

// Run the CLI
run().catch((err) => {
	console.error(err);
	process.exit(1);
});
