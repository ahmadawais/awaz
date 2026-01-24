// Main entry point for programmatic use
export {
	ElevenLabsClient,
	getApiKey,
	getDefaultVoiceId,
	type Voice,
	type VoiceSettings,
	type TTSRequest,
	type ElevenLabsClientConfig
} from './lib/index.js';

export { getVersion, getPackageJson } from './utils/index.js';
