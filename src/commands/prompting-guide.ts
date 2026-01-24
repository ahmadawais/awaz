export const promptingGuide = `# Better results from awaz

What you write matters. Here's what works.

## Models

**v3 (default)** — Most expressive. Tags like [whispers], [laughs]. No SSML.
**v2** — Reliable. SSML pauses work. Predictable.
**Flash** — Fast. ~75ms. Half the cost.
**Turbo** — Balanced. ~250ms. Good quality.

## Writing tips

Write how you'd say it. Short sentences. Natural breaks.

**Punctuation = pacing:**
- Comma, dash → slight pause
- Ellipsis... → dramatic pause
- Period → full stop
- ! → energy

**Spell it how it sounds.** "API" wrong? Try "A P I" or "ay-pee-eye".

## v3 tags

**Emotions:** [whispers], [shouts], [laughs], [sighs], [sarcastic], [excited]
**Actions:** [clears throat], [exhales], [swallows]
**Effects:** [applause], [short pause], [long pause]
**Experimental:** [strong French accent], [sings]

Not every voice responds to every tag. Experiment.

## The knobs

**--stability** (0-1)
Higher = consistent. Lower = varied. v3 uses presets: 0=Creative, 0.5=Natural, 1=Robust.

**--similarity** (0-1)
Higher = closer to original voice sample.

**--style** (0-1)
Higher = more expressive. Can get weird if too high.

**--speaker-boost**
Adds clarity. Sometimes helps.

**--seed**
Same seed = same output. Good for A/B testing.

## Examples

Natural:
  awaz -v Roger --stability 0.5 "We shipped today. It worked."

Fast:
  awaz --model-id eleven_flash_v2_5 "Quick and cheap."

Dramatic (v3):
  awaz "[whispers] Don't move. [short pause] Something's there..."

## TL;DR

1. v3 for expression, v2 for reliability, Flash for speed
2. Write naturally
3. Experiment with tags on v3
4. Tweak stability/similarity if it sounds off
`;
