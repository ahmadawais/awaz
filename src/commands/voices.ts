import { Command } from 'commander';
import ora from 'ora';
import { ElevenLabsClient, getApiKey } from '../lib/elevenlabs.js';
import { log, padRight } from '../utils/index.js';

interface VoicesOptions {
	search?: string;
	limit: number;
	apiKey?: string;
	baseUrl: string;
}

export function createVoicesCommand(): Command {
	return new Command('voices')
		.description('List voices')
		.option('--search <query>', 'Filter by name')
		.option('--limit <n>', 'Max results (0 = all)', '100')
		.action(async function (this: Command) {
			const opts = this.optsWithGlobals<VoicesOptions>();
			const limit = parseInt(String(opts.limit), 10);

			const spinner = ora('Fetching voices...').start();

			try {
				const apiKey = getApiKey(opts.apiKey);
				const client = new ElevenLabsClient({
					apiKey,
					baseUrl: opts.baseUrl
				});

				let voices = await client.listVoices(opts.search);
				spinner.stop();

				if (limit > 0 && voices.length > limit) {
					voices = voices.slice(0, limit);
				}

				// Print header
				console.log(
					`${padRight('VOICE ID', 24)}  ${padRight('NAME', 24)}  CATEGORY`
				);

				// Print rows
				for (const v of voices) {
					console.log(
						`${padRight(v.voice_id, 24)}  ${padRight(v.name, 24)}  ${v.category}`
					);
				}

				if (voices.length === 0) {
					log.info('No voices found');
				}
			} catch (err) {
				spinner.fail('Failed to fetch voices');
				log.error((err as Error).message);
				process.exit(1);
			}
		});
}


