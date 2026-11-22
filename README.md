# ByteQuest

Learn to code from zero, a few minutes a day. Bite-sized lessons, daily streaks, unlocks, and reminders that respond to how each learner is actually doing.

**Live:** https://josephfanpm.github.io/Learntocode/

The course follows the topics of Harvard's [CS50x](https://cs50.harvard.edu/x/), week by week, rewritten for people who have never coded. Code is written and run in the browser: no installs, no accounts.

## The course

| Unit | CS50 week | Topic |
|---|---|---|
| 0 | 0 (Scratch) | Thinking like a computer: binary, text and colour as numbers, algorithms |
| 1 | 1 (C) | Your first programs: print, variables, input, decisions, loops, functions |
| 2 | 2 (Arrays) | Lists and text, ending with a shift cipher |
| 3 | 3 (Algorithms) | Searching, sorting, big O, recursion |
| 4 | 4 (Memory) | Hexadecimal, names and values, copying, files |
| 5 | 5 (Data structures) | Stacks, queues, linked lists, hash tables, trees |
| 6 | 6 (Python) | Dictionaries, f-strings, errors, comprehensions, CSV |
| 7 | 7 (SQL) | SELECT, WHERE, GROUP BY, JOIN, safe changes, SQL injection |
| 8 | 8 (HTML, CSS, JS) | How the web works, HTML, forms, CSS, a first taste of JavaScript |
| 9 | 9 (Flask) | Routes, forms, templates, sessions |
| 10 | AI | Learning from examples, how chatbots write, using AI well |

55 lessons, 522 exercises in six types: concept cards, multiple choice, fill the gap, put lines in order, match pairs, and write real code. Match questions are drag-to-slot (each answer lands next to its partner), with tap-then-tap as a no-drag alternative. CS50 teaches weeks 1–5 in C; this course uses Python throughout, because beginners can run it in a browser tab and the syntax gets out of the way.

**Code runs in the browser.** Python runs in [Pyodide](https://pyodide.org) inside a Web Worker, so an endless loop is stopped after 6 seconds instead of freezing the page. SQL runs in [sql.js](https://sql.js.org) (SQLite). HTML is checked by CSS selectors against a sandboxed preview. Python errors are translated into one plain sentence ("Line 3: Python doesn't know the name "nme"…").

## Placement test

Instead of asking "have you coded before?", setup asks real questions ([src/content/placement.ts](src/content/placement.ts)): one per unit for units 0–6, easiest first. Each right answer skips that unit; the first wrong answer or "I don't know" ends the test, so a beginner is out after one question. Brand-new learners can skip it entirely. Skipped units show as dashed stations on the path, stay open for review, and don't count as finished lessons.

## Pip and avatars

Pip is the mascot ([src/ui/Pip.tsx](src/ui/Pip.tsx)): a pixel-art red panda with seven moods (happy, wave, cheer, oops, think, sleepy, celebrate). Pip shows up on the welcome screen, the placement test, right and wrong answers, the lesson-done screen, message banners and the profile. The Messaging lab lists every mood and where it's used.

Learners can make a **pixel avatar** in the same style ([src/ui/Avatar.tsx](src/ui/Avatar.tsx)): a red panda, cat, bunny or bear, with six fur colours, five expressions, six accessories and six backgrounds. It shows in the top bar and on the profile. The app doesn't ask for it during sign-up, where every extra step costs first-lesson completions. Instead an in-app banner suggests it once the first lesson is done, and it can be made or changed from the profile at any time.

All sprites are drawn in code as pixel grids ([src/ui/pixel/sprites.ts](src/ui/pixel/sprites.ts)): heads are drawn as half rows and mirrored, with faces, paws, accessories and effects layered on top.

## Habit loop

- **Streaks** count the learner's own calendar days. A day stays "alive" until midnight.
- **Streak freezes** (start with 1, hold up to 2, 50 gems each) cover missed days. They are only spent when they cover the whole gap, so a long absence doesn't burn them for nothing.
- **XP and daily goal:** 10 XP for a new lesson, 5 for a repeat, +5 for a perfect lesson. Goals are 10/20/30/50 XP.
- **Gems:** 5 per lesson, 20 for hitting the daily goal.
- **Unlocks:** lessons open strictly in order; finishing a unit opens the next one.
- **Mistakes come back:** a wrong answer returns at the end of the lesson. Code exercises let you retry, with the answer offered after two misses.

## Sound

Sounds are synthesised in the browser ([src/sound.ts](src/sound.ts)), so there are no audio files. The rules come from Material Design's sound guidance (sound only at moments that matter; silence is part of the design) and research on earcons (short, abstract, consistent sounds that people learn by hearing them with an action):

| Moment | Sound | Why |
|---|---|---|
| Tap an answer | Tiny filtered tick, no pitch | Confirms the touch without being musical or distracting |
| Right answer | A crisp snap, then two quick notes rising a fifth, with a sparkle on top. Under half a second. Climbs a semitone for each answer in a row (up to 5) | Rising, consonant and short reads as "yes"; the climb makes a run feel like it's building |
| Wrong answer | Two soft, low notes stepping down | Clearly different from right, but gentle: no buzzer, in line with supportive feedback copy |
| Lesson done | Major arpeggio up to the octave, like a station arrival chime | The biggest moment gets the fullest sound |
| Streak extended | A higher, sparkling rise after the lesson chime | Marks the habit win separately from the lesson |

Sound can be turned off from the speaker button in any lesson or in Settings.

## Targeted messaging

All reminders come from one rules engine ([src/engine/messaging.ts](src/engine/messaging.ts)): 19 pure rules over a snapshot of the learner. Learners are grouped as `new`, `active`, `casual`, `slipping` or `dormant`, and each rule reads things like streak, days away, daily-goal progress, wrong answers in the current lesson, and why they joined.

| Channel | Examples |
|---|---|
| In-app | first lesson, make your avatar (after lesson one), a freeze saved your streak, your streak ended (fresh start), welcome back with a review, stuck on a lesson, unit finished, streak milestones, close to daily goal, buy a freeze |
| Push | first lesson (days 1–3), streak at risk at the learner's chosen hour, days 2–4 away, days 5–6 away |
| Email | welcome, Sunday recap, 7 days away, 14 days away (suggests a smaller goal), 30 days away (last message) |

Guardrails: every message has a dedupe key and is sent once; at most 1 push a day and 1 email every 3 days; no push from 9pm to 8am except at the learner's chosen time; push hands over to email after a week away; nothing after day 30.

The **Messaging lab** (`#/lab`, linked at the bottom of the path) plays five learner personas through six weeks and shows every message each would get, plus what would be sent to you right now and why.

This is a static site, so push only reaches you while the tab is open, and email is only simulated. A production version would run the same `decide()` function on a server on a schedule.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # streak, unlock and messaging tests
npx tsx scripts/check-content.ts   # validates every exercise; runs each Python/SQL solution against its tests
```

Settings has a **Prototype: unlock all lessons** switch (off by default) that opens every lesson on the path. You can also jump to any exercise with `#/lesson/<lesson-id>?at=<index>`. This doesn't save progress.

Stack: Vite, React 19, TypeScript, Tailwind 4. Progress is saved in `localStorage`.

## Credits and licence

Course structure follows CS50x by David J. Malan and Harvard University, whose materials are licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The lessons here are original writing and are not affiliated with or endorsed by Harvard. Lesson content in `src/content/` is shared under the same CC BY-NC-SA 4.0 licence.
