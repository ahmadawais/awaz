# awaz

Text to speech CLI using ElevenLabs. Use when asked to speak text, generate audio, or convert text to speech.

## Install

```bash
npm i -g awaz
# OR
npx awaz
```

For AI agents install the skill and ask them to use `awaz`.

```bash
npx skills ahmadawais/awaz
```


## Requirements

- `ELEVENLABS_API_KEY` environment variable

## Usage

```bash
# Speak text
awaz "Hello world"

# Pick a voice
awaz -v Roger "Hello world"

# Save to file
awaz -o output.mp3 "Hello world"

# Pipe text
echo "Hello world" | awaz

# Faster speech
awaz --speed 1.2 "Ship it"

# List voices
awaz voices
```

## When to use

- User asks to "speak", "say", or "read aloud" text
- User wants to generate audio from text
- User needs text-to-speech output
- User wants to preview how text sounds

## Options

| Flag | Description |
|------|-------------|
| `-v, --voice <name>` | Voice name or ID |
| `-o, --output <file>` | Save audio to file |
| `-r, --rate <wpm>` | Words per minute |
| `--speed <n>` | Speed multiplier (0.5-2.0) |
| `--model-id <id>` | ElevenLabs model |
| `--stability <n>` | Voice consistency (0-1) |
| `--similarity <n>` | Match original voice (0-1) |

## Models

- `eleven_v3` — Default. Most expressive. Supports [whispers], [laughs], etc.
- `eleven_multilingual_v2` — Reliable. SSML support.
- `eleven_flash_v2_5` — Fastest. ~75ms latency.
- `eleven_turbo_v2_5` — Balanced speed/quality.

## Examples for agents

```bash
# Read a file aloud
cat README.md | awaz

# Generate audio file for user
awaz -o welcome.mp3 "Welcome to the app"

# Use specific voice
awaz -v "Rachel" "Your order is ready"

# Dramatic effect (v3 only)
awaz "[whispers] The secret is... [short pause] ship fast."
```

## Tips

- Use `-v ?` to list voices inline
- Pipe long text from files
- Use `--speed 1.2` for faster playback
- v3 model supports emotion tags like `[whispers]`, `[laughs]`

## References

- [spec.md](./references/spec.md) — Full CLI specification
