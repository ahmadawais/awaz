# awaz spec

Text to speech CLI. ElevenLabs under the hood.

## Requirements

- Node.js 18+
- ElevenLabs API key

## Architecture

TypeScript + tsup. ESM only. No magic.

## Commands

### `awaz [text]`

Default command. Speaks text.

**Input:**
- Args: `awaz "Hello"`
- Pipe: `echo "Hello" | awaz`
- File: `awaz -f message.txt`
- Stdin: `awaz -f -`

**Output:**
- Speakers (default, streaming)
- File: `-o output.mp3`

**Core flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `-v, --voice` | first available | Voice name or ID |
| `-o, --output` | — | Save to file |
| `-r, --rate` | 175 | Words per minute |
| `--speed` | 1.0 | Multiplier (0.5-2.0) |
| `--model-id` | eleven_v3 | Model |
| `--format` | mp3_44100_128 | Audio format |
| `--stream` | true | Stream audio |
| `--latency-tier` | 0 | 0-4, lower = faster |

**Voice tuning:**

| Flag | Description |
|------|-------------|
| `--stability` | Consistency (0-1) |
| `--similarity` | Match original (0-1) |
| `--style` | Expressiveness (0-1) |
| `--speaker-boost` | Add clarity |
| `--seed` | Reproducibility |
| `--normalize` | Handle numbers: auto/on/off |
| `--lang` | Language code |

**Mac `say` compat:**

Works: `-v`, `-r`, `-o`, `-f`

Ignored (for compat): `--progress`, `--audio-device`, `--network-send`, `--interactive`, `--file-format`, `--data-format`, `--channels`, `--bit-rate`, `--quality`

### `awaz voices`

List available voices.

```bash
awaz voices
awaz voices --search english
awaz voices --limit 10
```

### `awaz prompting`

Tips for better results. No API key needed.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `ELEVENLABS_API_KEY` | Yes | API key |
| `ELEVENLABS_VOICE_ID` | No | Default voice |
| `AWAZ_VOICE_ID` | No | Alt default voice |
| `AWAZ_API_KEY` | No | Alt API key |

Also: `--api-key`, `--base-url` flags.

## API

Streaming: `POST /v1/text-to-speech/{voice_id}/stream`
Non-streaming: `POST /v1/text-to-speech/{voice_id}`

## Roadmap

- [ ] Built-in audio playback
- [ ] Config file
- [ ] More tests
