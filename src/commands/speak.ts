import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import {
	ElevenLabsClient,
	getApiKey,
	getDefaultVoiceId,
	type TTSRequest,
	type Voice,
	type VoiceSettings
} from '../lib/elevenlabs.js';
import { log, padRight } from '../utils/index.js';

interface SpeakOptions {
	voice?: string;
	voiceId?: string;
	modelId: string;
	output?: string;
	format: string;
	stream: boolean;
	play: boolean;
	latencyTier: number;
	speed: number;
	rate?: number;
	inputFile?: string;
	stability?: number;
	similarity?: number;
	similarityBoost?: number;
	style?: number;
	speakerBoost?: boolean;
	noSpeakerBoost?: boolean;
	seed?: number;
	normalize?: string;
	lang?: string;
	metrics: boolean;
	apiKey?: string;
	baseUrl: string;
}

const DEFAULT_WPM = 175;

export function createSpeakCommand(): Command {
	return new Command('speak')
		.description('Speak text (streams by default)')
		.argument('[text...]', 'Text to speak')
		.option('--voice-id <id>', 'Voice ID')
		.option('-v, --voice <name>', 'Voice name or ID (use "?" to list)')
		.option('--model-id <id>', 'ElevenLabs model (eleven_v3, eleven_multilingual_v2, etc.)', 'eleven_v3')
		.option('-o, --output <path>', 'Save audio to file')
		.option('--format <format>', 'Audio format', 'mp3_44100_128')
		.option('--stream', 'Stream audio while generating', true)
		.option('--no-stream', 'Disable streaming')
		.option('--play', 'Play audio through speakers', true)
		.option('--no-play', 'Disable playback')
		.option('--latency-tier <n>', 'Lower = faster (0-4)', '0')
		.option('--speed <n>', 'Speed multiplier (0.5-2.0)', '1.0')
		.option('-r, --rate <wpm>', 'Words per minute (default 175)')
		.option('-f, --input-file <path>', 'Read from file (use "-" for stdin)')
		.option('--stability <n>', 'Voice consistency (0-1)')
		.option('--similarity <n>', 'Match to original voice (0-1)')
		.option('--similarity-boost <n>', 'Same as --similarity')
		.option('--style <n>', 'Expressiveness (0-1)')
		.option('--speaker-boost', 'Add clarity')
		.option('--no-speaker-boost', 'No clarity boost')
		.option('--seed <n>', 'For reproducible output')
		.option('--normalize <mode>', 'Handle numbers/URLs: auto|on|off')
		.option('--lang <code>', 'Language (en, de, fr, etc.)')
		.option('--metrics', 'Show timing stats', false)
		// macOS say compatibility flags (no-op)
		.option('--progress', 'macOS say compatibility (no-op)')
		.option('--network-send <host>', 'macOS say compatibility (no-op)')
		.option('--audio-device <device>', 'macOS say compatibility (no-op)')
		.option('--interactive <mode>', 'macOS say compatibility (no-op)')
		.option('--file-format <fmt>', 'macOS say compatibility (no-op)')
		.option('--data-format <fmt>', 'macOS say compatibility (no-op)')
		.option('--channels <n>', 'macOS say compatibility (no-op)')
		.option('--bit-rate <n>', 'macOS say compatibility (no-op)')
		.option('--quality <n>', 'macOS say compatibility (no-op)')
		.action(async function (this: Command, textArgs: string[]) {
			const opts = this.optsWithGlobals<SpeakOptions>();

			try {
				// Parse numeric options
				const speed = parseFloat(String(opts.speed));
				const latencyTier = parseInt(String(opts.latencyTier), 10);

				// Validate speed
				let finalSpeed = speed;
				if (opts.rate) {
					const rate = parseInt(String(opts.rate), 10);
					finalSpeed = rate / DEFAULT_WPM;
					if (finalSpeed <= 0.5 || finalSpeed >= 2.0) {
						throw new Error(
							`Rate ${rate} wpm maps to speed ${finalSpeed.toFixed(2)}, which is outside the allowed 0.5–2.0 range`
						);
					}
				} else if (finalSpeed <= 0.5 || finalSpeed >= 2.0) {
					throw new Error('Speed must be between 0.5 and 2.0 (e.g. 1.1 for 10% faster)');
				}

				// Get API key and create client
				const apiKey = getApiKey(opts.apiKey);
				const client = new ElevenLabsClient({
					apiKey,
					baseUrl: opts.baseUrl
				});

				// Resolve voice
				let voiceId = opts.voice || opts.voiceId || getDefaultVoiceId();

				if (voiceId === '?') {
					// List voices and exit
					const voices = await client.listVoices();
					console.log(`${padRight('VOICE ID', 24)}  ${padRight('NAME', 24)}  CATEGORY`);
					for (const v of voices) {
						console.log(
							`${padRight(v.voice_id, 24)}  ${padRight(v.name, 24)}  ${v.category}`
						);
					}
					return;
				}

				voiceId = await resolveVoice(client, voiceId);

				// Resolve text
				const text = await resolveText(textArgs, opts.inputFile);

				// Determine if we should play (disable if output is set and play wasn't explicitly set)
				let shouldPlay = opts.play;
				if (opts.output && !this.getOptionValueSource('play')) {
					shouldPlay = false;
				}

				// Infer format from output extension
				let outputFormat = opts.format;
				if (opts.output) {
					const inferred = inferFormatFromExt(opts.output);
					if (inferred) {
						outputFormat = inferred;
					}
				}

				// Build TTS request
				const payload = buildTTSRequest(this, opts, text, finalSpeed, outputFormat);

				const spinner = ora('Generating speech...').start();
				const start = Date.now();
				let bytes = 0;

				if (opts.stream) {
					bytes = await streamAndSave(
						client,
						voiceId,
						payload,
						latencyTier,
						opts.output,
						shouldPlay,
						spinner
					);
				} else {
					bytes = await convertAndSave(
						client,
						voiceId,
						payload,
						opts.output,
						shouldPlay,
						spinner
					);
				}

				spinner.succeed('Done');

				if (opts.metrics) {
					const duration = Date.now() - start;
					console.error(
						`metrics: chars=${text.length} bytes=${bytes} model=${opts.modelId} voice=${voiceId} stream=${opts.stream} latencyTier=${latencyTier} dur=${duration}ms`
					);
				}
			} catch (err) {
				log.error((err as Error).message);
				process.exit(1);
			}
		});
}

async function resolveVoice(
	client: ElevenLabsClient,
	voiceInput?: string
): Promise<string> {
	if (!voiceInput) {
		// Get first available voice
		const voices = await client.listVoices();
		if (voices.length === 0) {
			throw new Error('No voices available; specify --voice or set ELEVENLABS_VOICE_ID');
		}
		log.info(`Defaulting to voice ${voices[0].name} (${voices[0].voice_id})`);
		return voices[0].voice_id;
	}

	// If it looks like an ID (UUID-like), use directly
	if (voiceInput.length >= 15 && /[0-9]/.test(voiceInput)) {
		return voiceInput;
	}

	// Search for voice by name
	const voices = await client.listVoices(voiceInput);
	const voiceInputLower = voiceInput.toLowerCase();

	// Exact match
	const exact = voices.find((v: Voice) => v.name.toLowerCase() === voiceInputLower);
	if (exact) {
		log.info(`Using voice ${exact.name} (${exact.voice_id})`);
		return exact.voice_id;
	}

	// Closest match
	if (voices.length > 0) {
		const v = voices[0];
		log.info(`Using closest voice match ${v.name} (${v.voice_id})`);
		return v.voice_id;
	}

	throw new Error(`Voice "${voiceInput}" not found; try 'awaz voices' or -v '?'`);
}

async function resolveText(args: string[], inputFile?: string): Promise<string> {
	if (inputFile) {
		if (inputFile === '-') {
			return readStdin();
		}
		const data = fs.readFileSync(inputFile, 'utf-8');
		const text = data.trim();
		if (!text) {
			throw new Error('Input file was empty');
		}
		return text;
	}

	if (args.length > 0) {
		return args.join(' ');
	}

	return readStdin();
}

function readStdin(): Promise<string> {
	return new Promise((resolve, reject) => {
		if (process.stdin.isTTY) {
			reject(new Error('No text provided; pass text args, --input-file, or pipe input'));
			return;
		}

		let data = '';
		process.stdin.setEncoding('utf-8');
		process.stdin.on('data', (chunk) => {
			data += chunk;
		});
		process.stdin.on('end', () => {
			const text = data.trim();
			if (!text) {
				reject(new Error('stdin was empty'));
				return;
			}
			resolve(text);
		});
		process.stdin.on('error', reject);
	});
}

function buildTTSRequest(
	_cmd: Command,
	opts: SpeakOptions,
	text: string,
	speed: number,
	outputFormat: string
): TTSRequest {
	const voiceSettings: VoiceSettings = {
		speed
	};

	// Stability
	if (opts.stability !== undefined) {
		const stability = parseFloat(String(opts.stability));
		if (stability < 0 || stability > 1) {
			throw new Error('Stability must be between 0 and 1');
		}
		if (opts.modelId === 'eleven_v3') {
			if (![0, 0.5, 1].some((v) => Math.abs(stability - v) < 1e-9)) {
				throw new Error(
					'For eleven_v3, stability must be one of 0.0, 0.5, 1.0 (Creative/Natural/Robust)'
				);
			}
		}
		voiceSettings.stability = stability;
	}

	// Similarity
	const similarity = opts.similarity ?? opts.similarityBoost;
	if (similarity !== undefined) {
		const simVal = parseFloat(String(similarity));
		if (simVal < 0 || simVal > 1) {
			throw new Error('Similarity must be between 0 and 1');
		}
		voiceSettings.similarity_boost = simVal;
	}

	// Style
	if (opts.style !== undefined) {
		const styleVal = parseFloat(String(opts.style));
		if (styleVal < 0 || styleVal > 1) {
			throw new Error('Style must be between 0 and 1');
		}
		voiceSettings.style = styleVal;
	}

	// Speaker boost
	if (opts.speakerBoost && opts.noSpeakerBoost) {
		throw new Error('Choose only one of --speaker-boost or --no-speaker-boost');
	}
	if (opts.speakerBoost) {
		voiceSettings.use_speaker_boost = true;
	} else if (opts.noSpeakerBoost) {
		voiceSettings.use_speaker_boost = false;
	}

	const request: TTSRequest = {
		text,
		model_id: opts.modelId,
		output_format: outputFormat,
		voice_settings: voiceSettings
	};

	// Seed
	if (opts.seed !== undefined) {
		const seedVal = parseInt(String(opts.seed), 10);
		if (seedVal < 0 || seedVal > 4294967295) {
			throw new Error('Seed must be between 0 and 4294967295');
		}
		request.seed = seedVal;
	}

	// Normalize
	if (opts.normalize) {
		const norm = opts.normalize.toLowerCase().trim();
		if (!['auto', 'on', 'off'].includes(norm)) {
			throw new Error('Normalize must be one of: auto, on, off');
		}
		request.apply_text_normalization = norm;
	}

	// Language
	if (opts.lang) {
		const lang = opts.lang.toLowerCase().trim();
		if (lang.length !== 2 || !/^[a-z]+$/.test(lang)) {
			throw new Error('Lang must be a 2-letter ISO 639-1 code (e.g. en, de, fr)');
		}
		request.language_code = lang;
	}

	return request;
}

async function streamAndSave(
	client: ElevenLabsClient,
	voiceId: string,
	payload: TTSRequest,
	latencyTier: number,
	outputPath: string | undefined,
	_shouldPlay: boolean,
	spinner: ReturnType<typeof ora>
): Promise<number> {
	const stream = await client.streamTTS(voiceId, payload, latencyTier);

	if (!stream) {
		throw new Error('No stream returned from API');
	}

	const chunks: Uint8Array[] = [];
	const reader = stream.getReader();

	let totalBytes = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) {
			chunks.push(value);
			totalBytes += value.length;
			spinner.text = `Generating speech... ${Math.round(totalBytes / 1024)}KB`;
		}
	}

	const audioData = Buffer.concat(chunks);

	// Save to file if requested
	if (outputPath) {
		const dir = path.dirname(outputPath);
		if (dir && dir !== '.') {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(outputPath, audioData);
		log.info(`Audio saved to ${outputPath}`);
	}

	// Note: Browser/Node.js audio playback is complex and platform-dependent
	// For now we just save the file; users can play it with their preferred player
	// A full implementation would use something like node-speaker or similar

	return totalBytes;
}

async function convertAndSave(
	client: ElevenLabsClient,
	voiceId: string,
	payload: TTSRequest,
	outputPath: string | undefined,
	_shouldPlay: boolean,
	spinner: ReturnType<typeof ora>
): Promise<number> {
	spinner.text = 'Converting text to speech...';
	const audioData = await client.convertTTS(voiceId, payload);

	// Save to file if requested
	if (outputPath) {
		const dir = path.dirname(outputPath);
		if (dir && dir !== '.') {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(outputPath, audioData);
		log.info(`Audio saved to ${outputPath}`);
	}

	return audioData.length;
}

function inferFormatFromExt(filePath: string): string | null {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case '.mp3':
			return 'mp3_44100_128';
		case '.wav':
		case '.wave':
			return 'pcm_44100';
		default:
			return null;
	}
}


