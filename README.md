# ByteQuest

Learn to code from zero, a few minutes a day. Bite-sized lessons, daily streaks, unlocks, and reminders that respond to how each learner is actually doing.

**Live:** https://josephfanpm.github.io/Learntocode/

The course follows the topics of Harvard's [CS50x](https://cs50.harvard.edu/x/), week by week, rewritten for people who have never coded. Code is written and run in the browser: no installs, no accounts.

## The course

| Unit | CS50 week | Topic | Labs and projects |
|---|---|---|---|
| 0 | 0 (Scratch) | Thinking like a computer: binary, text, colour, images and sound as numbers, algorithms | Design a program |
| 1 | 1 (C) | First programs: print, variables, input, decisions, loops, functions; compiling, types and their limits, the command line | Pyramids and coins; checksum |
| 2 | 2 (Arrays) | Lists and text, debugging, arguments and how strings end | Word scores and reading level; shift and substitution ciphers |
| 3 | 3 (Algorithms) | Searching, sorting, big O, recursion, records, merge sort | Run an election; which sort is this? |
| 4 | 4 (Memory) | Hexadecimal, names and values, copying, files, pointers, memory care, images as numbers | Sound volume and lost photos |
| 5 | 5 (Data structures) | Stacks, queues, linked lists, hash tables, trees, tries | Family tree; spell checker |
| 6 | 6 (Python) | Dictionaries, f-strings, errors, comprehensions, CSV, classes, libraries | DNA detective |
| 7 | 7 (SQL) | SELECT, WHERE, GROUP BY, JOIN, subqueries, table design, safe changes | Music library; the missing mascot mystery |
| 8 | 8 (HTML, CSS, JS) | How the web and the internet work, HTML, forms, CSS, layout, JavaScript | Your homepage; quiz page |
| 9 | 9 (Flask) | Routes, forms, templates, sessions, APIs and JSON, accounts and passwords | Birthday book; play-money stock trader |
| 10 | AI | Learning from examples, game search, training and testing, how chatbots write, prompts | |
| 11 | Cybersecurity | Passwords, hashing, encryption, staying safe, keeping your own code safe | |
| 12 | Final project | Scope an idea, then build, save, test and share a habit tracker | The project itself |

107 lessons and 1,038 exercises in ten types. Six are the basics: concept cards, multiple choice, fill the gap, put lines in order (drag or arrows), match pairs (drag to slot or tap), and write real code. Four are hands-on formats:

- **Spot the bug:** tap the line of code that's wrong.
- **Bit switches:** flip on/off switches to make a number in binary.
- **Step through:** act out an algorithm by tapping the box you'd check next (binary search, walking a linked list, a sort's next swap).
- **Type the answer:** type what the code prints, instead of picking from options.

Each unit covers its CS50 week's lecture ideas plus the ideas behind that week's labs and problem sets, rewritten as original small-step lessons. CS50 teaches weeks 1-5 in C; this course uses Python throughout, because beginners can run it in a browser tab, and shows C in read-only snippets where the idea needs it (compiling, types, pointers, memory).

**Code runs in the browser.** Python runs in [Pyodide](https://pyodide.org) inside a Web Worker, so an endless loop is stopped after 6 seconds instead of freezing the page. SQL runs in [sql.js](https://sql.js.org) (SQLite). HTML is checked by CSS selectors against a sandboxed preview. Python errors are translated into one plain sentence ("Line 3: Python doesn't know the name "nme"…").

## Setup

Setup borrows the structure that Duolingo is known for, with our own content: Pip asks one question per screen in a speech bubble under a progress bar, and the first lesson comes before any profile details.

1. Welcome, then Pip says hi.
2. How did you hear about ByteQuest? (skippable)
3. Why do you want to learn? Pip replies to the answer, and it personalises later messages.
4. What you'll be able to do.
5. Daily goal.
6. Reminders: Pip explains why first, then the browser asks permission. "Not now" is fine. No time to pick; see Reminder timing below.
7. Starting point: start from scratch, or find your level.
8. Lesson one.
9. After lesson one: lesson-done screen, streak screen, then **Create your profile** (name and avatar), which can be skipped with "Later".

**Finding your level** asks real questions instead of "have you coded before?" ([src/content/placement.ts](src/content/placement.ts)): one per unit for units 0–6, easiest first. Each right answer skips that unit; the first wrong answer or "I don't know" ends it. Skipped units show as dashed stations, stay open for review, and don't count as finished lessons.

## Animation

Pip is animated like a sprite in an old game, organised as a small state machine (the same idea character tools such as Rive use): each mood is a state with its own frames, over an idle layer that blinks at random intervals and bobs by one pixel. Body moves (hop, shake) snap between whole-pixel positions.

| Moment | What moves |
|---|---|
| Any time Pip is on screen | Blink, 1-pixel idle bob |
| Setup questions | Pip waves; the speech bubble grows from its tail |
| Right answer | Pip hops with paws up |
| Wrong answer | Pip does a small shake |
| Progress bar | Fill eases to its new width |
| Lesson done | Pixel confetti, stats count up, cards rise in one after another |
| Streak extended | Flame lights up, the number ticks up, today fills in on the week row |
| Home | Pip stands next to your next lesson |

Everything respects the reduced-motion setting: frames and movement stop, and entrances become simple fades.

## Pip and avatars

Pip is the mascot ([src/ui/Pip.tsx](src/ui/Pip.tsx)): a pixel-art red panda with seven moods (happy, wave, cheer, oops, think, sleepy, celebrate). Pip shows up on the welcome screen, the placement test, right and wrong answers, the lesson-done screen, message banners and the profile. The Messaging lab lists every mood and where it's used.

Learners can make a **pixel avatar** in the same style ([src/ui/Avatar.tsx](src/ui/Avatar.tsx)): a red panda, cat, bunny or bear, with six fur colours, five expressions, six accessories and six backgrounds. It shows in the top bar and on the profile. Everyone gets a random avatar during setup, so nobody starts with an empty placeholder and there's no extra step before the first lesson. After lesson one, the create-your-profile step shows it with a shuffle button and a link to the full builder; it can be changed from the profile at any time.

All sprites are drawn in code as pixel grids ([src/ui/pixel/sprites.ts](src/ui/pixel/sprites.ts)): heads are drawn as half rows and mirrored, with faces, paws, accessories and effects layered on top.

## Habit loop

- **Streaks** count the learner's own calendar days. A day stays "alive" until midnight.
- **Streak freezes** (start with 1, hold up to 2, 50 gems each) cover missed days. They are only spent when they cover the whole gap, so a long absence doesn't burn them for nothing.
- **XP and daily goal:** 10 XP for a new lesson, 5 for a repeat, +5 for a perfect lesson. Goals are 10/20/30/50 XP.
- **Gems:** 5 per lesson, 20 for hitting the daily goal.
- **Unlocks:** lessons open strictly in order; finishing a unit opens the next one.
- **Mistakes come back:** a wrong answer returns at the end of the lesson. Code exercises let you retry, with the answer offered after two misses.

**Reminder timing.** Setup doesn't ask for a reminder time. By default ("Smart") the daily reminder is due about 23.5 hours after the learner's last lesson, which is when they have already shown they can practice, kept between 8am and 8pm. If a streak of 3+ days is still at risk at 8pm, one extra "streak saver" goes out. The reminder's wording rotates so no two days in a row match. A fixed time can be chosen in Settings.

## Sound

Sounds are synthesised in the browser ([src/sound.ts](src/sound.ts)), so there are no audio files. The rules come from Material Design's sound guidance (sound only at moments that matter; silence is part of the design) and research on earcons (short, abstract, consistent sounds that people learn by hearing them with an action):

| Moment | Sound | Why |
|---|---|---|
| Tap an answer | A tiny soft blip | Confirms the touch without being musical or distracting |
| Right answer | Two quick square-wave notes rising a fifth, the second ringing briefly. Climbs a semitone for each answer in a row (up to 5) | Rising and short reads as "yes"; the climb makes a run feel like it's building |
| Wrong answer | A soft downward "bwomp" on a triangle wave | Clearly different from right, but round rather than harsh: no buzzer |
| Lesson done | A short level-clear jingle: quick run up, a pause, a held finish over a bass note | The biggest moment gets the fullest sound |
| Streak extended | A fast climbing power-up staircase | Marks the habit win separately from the lesson |

The sounds are chip-style (square and triangle waves with fast pitch steps and slides, as on old consoles) to match the pixel art. They're original to ByteQuest and made in code, so there are no audio files.

Sound can be turned off from the speaker button in any lesson or in Settings.

## Targeted messaging

All reminders come from one rules engine ([src/engine/messaging.ts](src/engine/messaging.ts)): 20 pure rules over a snapshot of the learner. Learners are grouped as `new`, `active`, `casual`, `slipping` or `dormant`, and each rule reads things like streak, days away, daily-goal progress, wrong answers in the current lesson, and why they joined.

| Channel | Examples |
|---|---|
| In-app | first lesson, make your avatar (after lesson one), a freeze saved your streak, your streak ended (fresh start), welcome back with a review, stuck on a lesson, unit finished, streak milestones, close to daily goal, buy a freeze |
| Push | first lesson (days 1–3), streak at risk (smart timing, rotating wording), late streak saver at 8pm, days 2–4 away, days 5–6 away |
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
