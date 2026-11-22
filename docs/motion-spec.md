# Motion spec for the pixel-adventure direction

How the design sample at `#/sample` moves, and where the approach came from. Captured and checked on 2026-11-22 with the open-source [reanimate](https://github.com/NiazMorshed2007/reanimate) tool, which records a page and lists every animation that ran.

## What the reference does

The reference was the hero of codedex.io, captured for six seconds from page load at 1280×800. The point was to learn the approach, not to copy the page: none of its art, layout or wording is used.

| Finding | Measured |
|---|---|
| No animation library. Motion is plain CSS keyframes plus hand-animated images and video (18 animated images and 5 videos on the page). | Observed |
| Nothing animates in on load. The hero is simply there. | Observed |
| The scene never stops moving. A mascot floats 10 px up and down on a 2 s loop that alternates direction. | Observed |
| Clouds drift at about 5 px a second, on a 200 s loop. | Observed |
| Eight stars twinkle on a 3.2 s cycle, each starting 300 ms after the last, between 15% and 90% opacity and 75% and 100% size. | Observed |
| The title's shimmer is an animated image, not code. | Observed |

The lesson: a scene reads as animated when a few small things are always moving. A one-time entrance followed by stillness reads as a picture.

## What the sample does

One clock drives the entrance and the scenery ([src/ui/sample/timeline.ts](../src/ui/sample/timeline.ts)); the ambient loops are CSS so they stay smooth while the page is busy.

| Element | Trigger | Start | Length | Motion | Easing |
|---|---|---|---|---|---|
| "START YOUR" | Load | 250 ms | 420 ms | Rises 14 px and fades in | Ease-out cubic |
| Title | Load | 340 ms | 420 ms | Rises 14 px and fades in, 90 ms after the line above | Ease-out cubic |
| Pip | Load | 700 ms | 460 ms | Rises and fades in | Ease-out cubic |
| Subtitle | Load | 900 ms | 1100 ms | Types out letter by letter, with a block cursor | Linear |
| Gold button | Load | 2000 ms | 360 ms | Rises and fades in | Ease-out cubic |
| Scenery layers | Always | | Loops | Drift at 2, 5, 9 and 16 scene pixels a second, back to front, in whole pixels | Linear |
| Title | Always | | 2.2 s, alternating | Floats 8 px up and down | Ease-in-out |
| Sparkles (8) | Always | 300 ms apart | 3.2 s | Fade and scale between 12% and 100% opacity, 70% and 100% size | Ease-in-out |
| Clouds | Always | | 90 s | Drift left, drawn twice so the loop has no seam | Linear |
| Gold button | Always | | 2.4 s | Brightness pulses by 14% | Ease-in-out |
| Fireflies (6) | Always | 700 ms apart | 5 s | Fade in, drift up and right, fade out | Ease-in-out |
| Pip | After the button lands | Every 6 s | 1.6 s | Waves | Frame swaps |
| Pip | Always | | 1.8 s and random | One-pixel bob; blinks every 2.4 to 5.2 s | Stepped |

Checked by capturing the sample with the same tool: it reported eight twinkle animations with delays of 0 to 2100 ms in 300 ms steps, plus the drift, float, glow and bob loops, and the frames show the entrance in the order above.

## Reduced motion

Animations are on by default. Settings has an Animations switch that freezes the clock at the end state and stops the ambient loops. When a device asks for reduced motion, the Learn tab says so once and offers to turn animations off.
