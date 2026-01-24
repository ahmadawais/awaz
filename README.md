# awaz

Text to speech. Done right.

```bash
npm i -g awaz
awaz "Ship it"
```

## Setup

```bash
export ELEVENLABS_API_KEY="your-key"
```

Get one at [elevenlabs.io](https://elevenlabs.io)

## Usage

```bash
# Speak
awaz "Hello world"

# Pick a voice
awaz -v Roger "Hello world"

# Save to file
awaz -o hello.mp3 "Hello world"

# Pipe it
echo "Hello world" | awaz

# Go faster
awaz --speed 1.2 "Ship faster"

# List voices
awaz voices
```

## Why awaz?

Mac's `say` command but with voices that don't sound like robots from 2003.

Zero config. One command. Works.

## Options

```
-v, --voice <name>     Voice name or ID
-o, --output <file>    Save to file
-r, --rate <wpm>       Words per minute
--speed <n>            Speed multiplier (0.5-2.0)
--model-id <id>        ElevenLabs model
--stability <n>        Voice consistency (0-1)
--similarity <n>       Match original voice (0-1)
--style <n>            Expressiveness (0-1)
```

## Commands

```bash
awaz [text]           # Speak (default)
awaz voices           # List voices
awaz prompting        # Tips for better output
```

## Environment

```bash
ELEVENLABS_API_KEY    # Required
ELEVENLABS_VOICE_ID   # Default voice (optional)
```

## Dev

```bash
pnpm install
pnpm build
pnpm test
```

## Inspiration

- macOS `say` command — the OG.
- steipete's `sag` in Go.

## License

MIT © [Ahmad Awais](https://twitter.com/MrAhmadAwais)
