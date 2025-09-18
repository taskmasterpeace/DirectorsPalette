# Director's Palette Prompt Language Guide

## Overview

Director's Palette uses a specialized prompt language that allows for powerful image generation with variations, chaining, and reference management. This guide explains the three core syntaxes and how they work together.

## Core Concepts

### 1. Reference Library vs Prompt Library

- **Reference Library**: Pre-saved images that can be used as visual references in your prompts
- **Prompt Library**: Saved prompt templates and snippets for quick reuse
- **Wild Cards**: Dynamic placeholders that expand to random values (e.g., `_location_`, `_time_of_day_`)

## Prompt Language Syntax

### 1. Bracket Syntax `[option1, option2, option3]` - Multiple Variations

The bracket syntax generates **multiple variations** from a single prompt by creating different combinations.

#### How It Works
- Each bracketed group `[...]` contains comma-separated options
- The system generates one image for each option
- Multiple bracket groups create combinations

#### Examples

**Single Bracket Group:**
```
A woman in a [red, blue, green] dress
```
Generates 3 images:
- A woman in a red dress
- A woman in a blue dress
- A woman in a green dress

**Multiple Bracket Groups:**
```
A [young, elderly] [man, woman] in a [suit, casual outfit]
```
Generates 8 images (2 × 2 × 2 combinations):
- A young man in a suit
- A young man in a casual outfit
- A young woman in a suit
- A young woman in a casual outfit
- A elderly man in a suit
- A elderly man in a casual outfit
- A elderly woman in a suit
- A elderly woman in a casual outfit

**Complex Example:**
```
[Sunrise, Sunset, Night] over a [mountain, ocean, desert] landscape with [dramatic, soft, moody] lighting
```
Generates 27 unique variations (3 × 3 × 3)

### 2. Pipe Syntax `|` - Sequential Prompt Chaining

The pipe syntax creates a **chain of prompts** where each subsequent prompt builds upon or modifies the previous result.

#### How It Works
- Each line separated by `|` is a sequential step
- The output of one line influences the next
- Creates a progressive transformation or story

#### Examples

**Basic Transformation:**
```
A simple sketch of a house |
Add color and shading |
Transform into photorealistic rendering
```
This creates 3 images showing the progression from sketch to final render.

**Scene Evolution:**
```
Empty stage with dramatic lighting |
Add a single performer in spotlight |
Fill stage with full orchestra |
Add audience in foreground
```
Creates 4 images showing the scene building up progressively.

**Style Transfer Chain:**
```
Portrait of a woman, photorealistic |
Apply impressionist painting style |
Transform to cubist interpretation |
Render as minimalist line art
```
Shows the same subject through different artistic interpretations.

### 3. Wild Cards `_placeholder_` - Dynamic Value Expansion

Wild cards are placeholders that automatically expand to random values from predefined lists.

#### Available Wild Cards

**Location Wild Cards:**
- `_location_` → mystical forest, abandoned warehouse, neon-lit cityscape, etc.
- `_interior_` → victorian mansion, modern office, cozy cabin, etc.
- `_exterior_` → mountain peak, beach at sunset, urban rooftop, etc.

**Time Wild Cards:**
- `_time_of_day_` → golden hour, blue hour, midnight, noon, etc.
- `_season_` → spring bloom, summer heat, autumn colors, winter snow

**Mood Wild Cards:**
- `_mood_` → mysterious, joyful, melancholic, tense, serene
- `_atmosphere_` → foggy, clear, stormy, ethereal

**Camera Wild Cards:**
- `_shot_type_` → close-up, wide shot, aerial view, dutch angle
- `_lens_` → 24mm wide angle, 85mm portrait, fisheye, macro

#### Examples

**Basic Wild Card Usage:**
```
A detective in _location_ during _time_of_day_
```
Might generate: "A detective in abandoned warehouse during blue hour"

**Combining with Brackets:**
```
[Young, Old] wizard in _location_ casting [fire, ice, lightning] magic
```
Creates variations with random locations for each combination.

## Advanced Techniques

### Combining All Three Syntaxes

You can combine brackets, pipes, and wild cards for complex generation workflows:

```
[Male, Female] protagonist in _location_ with _mood_ atmosphere |
Add [dramatic, soft] lighting |
Transform to [cinematic, painterly, noir] style
```

This would:
1. Generate initial variations with different protagonists and random locations/moods
2. Apply different lighting options to each
3. Transform each result into different artistic styles

### Reference Image Integration

When using the Reference Library:

```
{ref:sunset_beach_001} A couple walking, [holding hands, embracing] |
Transform time to _time_of_day_ |
Apply [romantic, dramatic, melancholic] color grading
```

The `{ref:image_id}` syntax incorporates saved reference images into your prompts.

### Best Practices

1. **Start Simple**: Begin with one syntax type and gradually combine them
2. **Test Variations**: Use brackets to quickly explore different options
3. **Build Progressively**: Use pipes for storytelling or style evolution
4. **Add Randomness**: Wild cards keep generations fresh and unexpected
5. **Save Successful Prompts**: Build your prompt library with proven combinations

## Model-Specific Considerations

Different AI models may interpret these syntaxes differently:

- **DALL-E 3**: Excels at bracket variations and wild card expansion
- **Midjourney**: Better for pipe chaining and style progression
- **Stable Diffusion**: Handles complex combinations well
- **Flux**: Optimized for photorealistic chaining

## Examples Gallery

### Fashion Photography
```
[Male, Female] model in _location_ wearing [elegant, casual, avant-garde] outfit during _time_of_day_ |
Adjust to [high-key, low-key] lighting |
Apply [film noir, technicolor, monochrome] treatment
```

### Architecture Visualization
```
Modern house exterior at _time_of_day_ |
Add [lush, minimalist, xeriscaped] landscaping |
Include [family, party, solitary figure] for scale |
Render in [photorealistic, watercolor, technical drawing] style
```

### Character Design
```
[Warrior, Mage, Rogue] character in _mood_ pose |
Add [heavy, light, medium] armor with [fire, ice, nature] enchantments |
Place in _location_ with _atmosphere_ weather
```

## Troubleshooting

### Common Issues

**Too Many Variations:**
- Limit bracket groups to 2-3 to avoid exponential combinations
- Use wild cards instead of brackets for non-critical variations

**Unclear Chaining:**
- Make each pipe step a clear transformation
- Avoid too many steps (3-5 is optimal)

**Wild Card Not Expanding:**
- Check spelling: must be lowercase with underscores
- Ensure wild card is supported in current model

## Quick Reference Card

```
[a, b, c]        → Generate multiple variations
prompt1 | prompt2 → Chain prompts sequentially
_wildcard_       → Expand to random value
{ref:id}         → Use reference image
```

## Need Help?

- Check saved examples in the Prompt Library
- Experiment with the Test Canvas
- Use Preview mode before generating final images
- Save successful prompts for future use

---

*This guide is part of Director's Palette - Professional AI Creative Platform*