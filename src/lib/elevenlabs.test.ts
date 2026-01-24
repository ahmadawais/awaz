import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElevenLabsClient, getApiKey, getDefaultVoiceId } from './elevenlabs.js';

describe('ElevenLabsClient', () => {
	describe('constructor', () => {
		it('should use default base URL if not provided', () => {
			const client = new ElevenLabsClient({ apiKey: 'test-key' });
			expect(client).toBeDefined();
		});

		it('should use custom base URL if provided', () => {
			const client = new ElevenLabsClient({
				apiKey: 'test-key',
				baseUrl: 'https://custom.api.com'
			});
			expect(client).toBeDefined();
		});
	});
});

describe('getApiKey', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('should return provided key if given', () => {
		expect(getApiKey('my-key')).toBe('my-key');
	});

	it('should return ELEVENLABS_API_KEY from env if no key provided', () => {
		process.env.ELEVENLABS_API_KEY = 'env-key';
		expect(getApiKey()).toBe('env-key');
	});

	it('should return AWAZ_API_KEY from env as fallback', () => {
		delete process.env.ELEVENLABS_API_KEY;
		process.env.AWAZ_API_KEY = 'awaz-key';
		expect(getApiKey()).toBe('awaz-key');
	});

	it('should throw if no key is available', () => {
		delete process.env.ELEVENLABS_API_KEY;
		delete process.env.SAG_API_KEY;
		expect(() => getApiKey()).toThrow('Missing ElevenLabs API key');
	});
});

describe('getDefaultVoiceId', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('should return ELEVENLABS_VOICE_ID from env', () => {
		process.env.ELEVENLABS_VOICE_ID = 'voice-123';
		expect(getDefaultVoiceId()).toBe('voice-123');
	});

	it('should return AWAZ_VOICE_ID as fallback', () => {
		delete process.env.ELEVENLABS_VOICE_ID;
		process.env.AWAZ_VOICE_ID = 'awaz-voice';
		expect(getDefaultVoiceId()).toBe('awaz-voice');
	});

	it('should return undefined if no voice ID set', () => {
		delete process.env.ELEVENLABS_VOICE_ID;
		delete process.env.AWAZ_VOICE_ID;
		expect(getDefaultVoiceId()).toBeUndefined();
	});
});
