/**
 * ElevenLabs API client for text-to-speech
 */

export interface Voice {
	voice_id: string;
	name: string;
	category: string;
	labels?: Record<string, string>;
	preview_url?: string;
}

export interface VoiceSettings {
	stability?: number;
	similarity_boost?: number;
	style?: number;
	use_speaker_boost?: boolean;
	speed?: number;
}

export interface TTSRequest {
	text: string;
	model_id?: string;
	voice_settings?: VoiceSettings;
	output_format?: string;
	seed?: number;
	apply_text_normalization?: string;
	language_code?: string;
}

interface ListVoicesResponse {
	voices: Voice[];
	next_page_token?: string;
}

export interface ElevenLabsClientConfig {
	apiKey: string;
	baseUrl?: string;
}

export class ElevenLabsClient {
	private readonly baseUrl: string;
	private readonly apiKey: string;

	constructor(config: ElevenLabsClientConfig) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io';
	}

	private async request<T>(
		path: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const headers: Record<string, string> = {
			'xi-api-key': this.apiKey,
			Accept: 'application/json',
			...(options.headers as Record<string, string>)
		};

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}: ${text}`);
		}

		return response.json() as Promise<T>;
	}

	/**
	 * List available voices
	 */
	async listVoices(search?: string): Promise<Voice[]> {
		let path = '/v1/voices';
		if (search) {
			path += `?search=${encodeURIComponent(search)}`;
		}

		const response = await this.request<ListVoicesResponse>(path);
		return response.voices;
	}

	/**
	 * Stream TTS audio
	 */
	async streamTTS(
		voiceId: string,
		payload: TTSRequest,
		latencyTier = 0
	): Promise<ReadableStream<Uint8Array> | null> {
		let path = `/v1/text-to-speech/${voiceId}/stream`;
		if (latencyTier > 0) {
			path += `?optimize_streaming_latency=${latencyTier}`;
		}

		const response = await fetch(`${this.baseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'audio/mpeg',
				'xi-api-key': this.apiKey
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Stream TTS failed: ${response.status}: ${text}`);
		}

		return response.body;
	}

	/**
	 * Convert text to speech (non-streaming)
	 */
	async convertTTS(voiceId: string, payload: TTSRequest): Promise<Buffer> {
		const path = `/v1/text-to-speech/${voiceId}`;

		const response = await fetch(`${this.baseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'audio/mpeg',
				'xi-api-key': this.apiKey
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`Convert TTS failed: ${response.status}: ${text}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		return Buffer.from(arrayBuffer);
	}
}

/**
 * Get API key from environment or throw
 */
export function getApiKey(providedKey?: string): string {
	const key =
		providedKey ||
		process.env.ELEVENLABS_API_KEY ||
		process.env.AWAZ_API_KEY;

	if (!key) {
		throw new Error(
			'Missing ElevenLabs API key. Set --api-key or ELEVENLABS_API_KEY environment variable.'
		);
	}

	return key;
}

/**
 * Get default voice ID from environment
 */
export function getDefaultVoiceId(): string | undefined {
	return process.env.ELEVENLABS_VOICE_ID || process.env.AWAZ_VOICE_ID;
}
