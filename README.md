# ByteQuest: learning to code, and to build with AI, as a daily habit

ByteQuest teaches programming a few minutes a day, the way a habit app would: short lessons, real code that runs in the browser, a streak, a mascot, and reminders that respond to how each learner is doing. It has three courses, for three starting points:

- **Computer science**, for people who have never coded: Harvard's CS50, rewritten in small steps.
- **Developer skills**, for people who can program but haven't worked as developers: Git, testing, JavaScript, shipping, teamwork.
- **Building with AI**, for working developers: language models, the Claude API, agents and Claude Code, from the ground up.

It is a working prototype that runs entirely in the browser.

**[Try the live demo](https://josephfanpm.github.io/Learntocode/)**

![Four screens: the welcome screen, the Learn tab with a chapter banner of Mount Fuji, a worked example with its output in a SQL lab, and the badges on the profile](docs/screenshot.png)

This is an independent portfolio project. It is not affiliated with or endorsed by Harvard, CS50, Anthropic or any other learning app. There are no real learners yet, so there are no usage numbers here.

## At a glance

| | |
|---|---|
| **Problem** | The best free ways to learn programming are built for students: long lectures, multi-hour assignments, documentation written for people who already know the field. People with jobs start them and stop. |
| **User** | Adults with minutes a day rather than hours, at one of three points: no coding experience; able to program but never employed as a developer; or a working developer who has not yet built with AI. |
| **Solution** | Three courses of three-minute lessons with real code that runs in the browser: CS50's full arc (112 lessons), Developer skills (60) and Building with AI (60). Setup suggests a course and places the learner in it. A habit loop holds it together: streaks, a daily goal, worked examples and hints, badges, and reminders timed to when the learner usually practices. |
| **Result** | A working prototype: three courses, 38 units, 232 lessons and 2,562 screens (908 teaching cards and 1,654 questions), 32 tests on the streak, unlock, reminder, hint, badge and save logic, and a checker that runs every code answer and every worked example. No real-world result: nobody has been measured using it. |
| **My role** | Product and build: the problem, the three-course structure and who each is for, the habit and reminder rules, the trade-offs, and the prototype. |

## Problem

CS50 is one of the most popular introductions to computer science, and it is free. It is also built for students: each week is a lecture of about two hours, plus a problem set that can take an evening or a weekend. That shape works in a semester. It works less well for someone fitting learning around a job.

| What a beginner runs into | Why it stops them |
|---|---|
| A two-hour lecture before writing any code | There is no small first win, and no natural place to stop and come back. |
| Installing and configuring tools | The first error message arrives before the first lesson. |
| A blank editor and a long assignment | Without small steps, getting stuck early means not starting. |
| No reason to return tomorrow | Nothing marks progress day to day, so one missed week becomes the end. |

Language-learning apps solved the same shape of problem with short sessions, immediate feedback and a streak. ByteQuest asks what CS50 looks like with that treatment.

The same gap shows up later. Someone who finishes a computer science course still cannot work on a team: nothing taught them Git, testing or how code gets shipped. And a working developer who wants to build with AI finds documentation written for people already doing it. The second and third courses take those two audiences through the same small-step treatment.

<!-- TODO(Joseph): add real evidence for the problem if you have it (online course completion rates, conversations with people who started and stopped a coding course). None is claimed here. -->

## Target users

- **Beginners**: career changers and curious non-technical people who want real programming ability, not a toy, and can give it a few minutes on most days. They start with Computer science.
- **People who can program but have not worked as developers**: students, self-taught coders and graduates of an intro course. They start with Developer skills.
- **Working developers** who have not yet built with language models or coding agents. They start with Building with AI.

In every course a placement quiz lets people skip what they already know.

<!-- TODO(Joseph): no user research was done for this prototype. Add any conversations with learners here if you have them. -->

## Solution

- **The whole of CS50, in small steps.** Fourteen units follow the course week by week, from binary to web apps, AI and cybersecurity, then a systems design unit that goes beyond CS50, and a final project. Each unit covers that week's lecture ideas and the ideas behind its labs and problem sets, rewritten as original lessons of 7 to 14 screens.
- **A second course for the job.** Developer skills is twelve chapters on what an entry-level developer needs beyond computer science: Git, testing, real JavaScript, frameworks and TypeScript, the developer's setup, shipping, APIs, working in existing code, databases in practice, teamwork, accessibility, and everyday tools. It has its own path, switched from the top of the Learn tab, and can be started at any time.
- **A third course on AI.** Building with AI is twelve chapters: how language models work, prompting, the Claude API, context, reliable output, tools, agents, Claude Code, MCP, working with coding agents, and building responsibly. Product facts were checked against the official documentation; prices and limits are left out because they change.
- **Real code, no setup.** Python, JavaScript and SQL run in the browser tab, and web pages are checked as they are built. A program that loops forever is stopped after a few seconds, and error messages are rewritten as one plain sentence.
- **Ten kinds of exercise.** Beyond multiple choice: put lines in order by dragging, match pairs, fill gaps, write code, tap the line with the bug, flip switches to make a binary number, act out an algorithm by tapping the box it would check next, and type what a program prints.
- **Show, then ask.** Every question that has the learner build or fix code comes after a worked example of nearly the same problem: a few lines of code and the output they give. Ideas are met in order (recognise, complete, then write), no lesson runs more than four questions without a teaching card, and each lab step opens with a reminder of the skill it uses.
- **Two-step hints on every question.** The first press recaps the idea being tested; the second gives a specific nudge, such as ruling out two wrong options or revealing which line goes first. Hints are free, and the first one opens by itself after a second miss.
- **Setup that ends in a lesson.** Pip, the mascot, asks one question per screen. The first lesson comes before any profile details; name and avatar are asked after it and can be skipped.
- **Choose a course, then get placed in it.** Setup asks how much coding the learner has done and suggests a course from the answer (Computer science for beginners, Developer skills for people who can program but haven't worked as developers, Building with AI for working developers), then runs that course's placement quiz instead of asking "have you done this before?": one question per chapter, easiest first. Each right answer skips a chapter; the first miss ends the quiz. Developer skills opens with one Python question, and suggests Computer science to anyone who misses it.
- **A habit loop.** A daily streak, streak freezes for missed days, a daily goal, lessons that unlock in order, and wrong answers that come back at the end of the lesson.
- **Reminders that adapt.** In-app banners, browser notifications and email (simulated) come from one set of rules that read the learner's activity. See below.
- **A character.** Pip is a pixel-art red panda who reacts to answers, and every learner gets a pixel-art avatar in the same style.
- **A place for every chapter.** The app has a night-sky, pixel-adventure look, and each of the 38 chapters opens with its own pixel scene of a real destination, from Mount Fuji to Monument Valley. The scenes are drawn in code on a 272 by 160 grid, so they add no image files.
- **Badges that level up.** Seventeen pixel-art badges climb from bronze to silver to gold, each with a progress bar toward the next tier. They reward more than volume: hitting the daily goal, writing code, repeating lessons, coming back after a week away, and progress in each course.
- **Progress that can be kept.** Progress lives in the browser; a backup file or a save code moves it to another device.

### The Computer science course

| Unit | CS50 week | Topics | Labs and projects |
|---|---|---|---|
| 0 | 0 (Scratch) | Binary; text, colour, images and sound as numbers; algorithms | Design a program |
| 1 | 1 (C) | Print, variables, input, decisions, loops, functions; compiling, types and their limits, the command line | Pyramids and coins; checksum |
| 2 | 2 (Arrays) | Lists and text, debugging, arguments | Word scores and reading level; ciphers |
| 3 | 3 (Algorithms) | Searching, sorting, big O, recursion, records, merge sort | Run an election; which sort is this? |
| 4 | 4 (Memory) | Hexadecimal, names and values, copying, files, pointers, memory care, images | Sound volume and lost photos |
| 5 | 5 (Data structures) | Stacks, queues, linked lists, hash tables, trees, tries | Family tree; spell checker |
| 6 | 6 (Python) | Dictionaries, formatting, errors, comprehensions, CSV, classes, libraries | DNA detective |
| 7 | 7 (SQL) | Queries, grouping, joins, subqueries, table design | Music library; a mystery solved with queries |
| 8 | 8 (HTML, CSS, JavaScript) | How the internet works, pages, forms, styling, layout, interactivity | Homepage; quiz page |
| 9 | 9 (Flask) | Routes, forms, templates, sessions, APIs, accounts and passwords | Birthday book; play-money stock trader |
| 10 | AI | Learning from examples, game search, training and testing, how chatbots write, prompts | |
| 11 | Cybersecurity | Passwords, hashing, encryption, staying safe | |
| 12 | Beyond CS50 | Systems design: scaling, load balancing, caching, databases at scale, failure | Design a photo-sharing app |
| 13 | Final project | Scope an idea, then build, save, test and share a habit tracker | The project itself |

### The Developer skills course

| Chapter | Topics | How it is taught |
|---|---|---|
| 1 Git and version control | Commits, history, branches, merge conflicts, remotes, pull requests, undoing safely | Acting out what the history looks like after each command; typing commands |
| 2 Testing | Assert, arrange-act-assert, edge cases, errors, test-first, fakes, CI | Writing real tests in Python that must catch a planted bug |
| 3 Real JavaScript | Values, functions, arrays, objects and JSON, scope, errors, async as an idea | Writing JavaScript that runs in the browser |
| 4 Frameworks and TypeScript | Components, props, state, events; type annotations and what the compiler catches | Reading components; writing render and update functions; spotting the line the compiler rejects |
| 5 Your developer setup | Editor, terminal, PATH, packages, virtual environments, the debugger | Typing commands, stepping through a debugger; ends with a checklist to do on your own machine |
| 6 Shipping your code | Hosting, environments, secrets, pipelines, containers, logs, rollbacks | Ordering pipeline stages, reading logs; ends with a checklist for putting a page online |
| 7 Building a real API | Methods, status codes, validation, tokens, pagination | Building an in-memory tasks API step by step |
| 8 Working in existing code | Reading unfamiliar code, naming, refactoring, comments, code review | Refactoring messy code while its tests keep passing |
| 9 Databases in practice | Parameterised queries, transactions, migrations, ORMs, indexes, non-SQL stores | Real SQLite from Python, with rollbacks and ordered migrations |
| 10 Working on a team | Tickets, estimates, asking good questions, pull requests, incidents | Choosing the better message; spotting the vague sentence |
| 11 Accessible, responsive pages | Semantic HTML, alt text, labels, keyboard, contrast, media queries, flexbox | Writing HTML that is checked for the right structure |
| 12 Everyday tools | Regular expressions, dates and time zones, type hints, file formats | Writing patterns and date code in Python |

Three things in this course cannot be learned by tapping through lessons: installing tools, using Git on a real project, and deploying. Those chapters teach the ideas and commands, then hand over to a checklist to do for real.

### The Building with AI course

| Chapter | Topics | How it is taught |
|---|---|---|
| 1 How language models work | Tokens, next-token prediction, sampling, the context window, hallucination | Acting out next-word choices; spotting the claim to verify |
| 2 Prompting well | Clear instructions, context, examples, roles, structure, thinking step by step, iterating | Picking the better prompt; spotting the vague or contradictory line |
| 3 The Claude API | The Messages API, stateless conversations, content blocks, stop reasons, usage, models, keys, retries | Reading real SDK code; writing the code around a stand-in model |
| 4 Context | Token budgets, cost, long conversations, retrieval, caching, context engineering | Estimating tokens, trimming a history, picking the best chunks |
| 5 Reliable output | JSON output, validation, retries, grounding, evaluation sets | Parsing and validating replies; scoring two prompt versions |
| 6 Tools | Tool definitions, the tool-use loop, errors, choosing among tools | Writing the dispatcher and the full loop |
| 7 Agents from the ground up | The agent loop, workflows vs agents, the common patterns, step limits, memory | Writing an agent loop with a step limit, a router, a chain, an evaluator loop |
| 8 Claude Code basics | What it is, sessions, permissions, diffs, good tasks, CLAUDE.md | Realistic sessions: what happens next, which command to decline |
| 9 Claude Code in depth | Memory, permission rules, commands, skills, subagents, hooks, long sessions | Which feature fits; what belongs in a memory file |
| 10 Connecting things with MCP | Hosts, clients and servers; tools, resources, prompts; trust | Building a toy server in Python (labelled as a teaching model, not the real protocol) |
| 11 Working with coding agents | Good tasks, small steps, tests as guard rails, reading diffs, staying responsible | Spotting the bug or weakened test in an AI-written change |
| 12 Building responsibly | Prompt injection, least privilege, approval, privacy, honesty | A capstone: design a support-inbox triage agent with an approval rule |

The app cannot call a real model, since that would need a private API key in the browser. Learners instead write the code that surrounds a model call, in Python, against a scripted stand-in whose replies have the same shape as real ones. Real API code is shown read-only.

Sources for this course: the [Claude API documentation](https://docs.claude.com), the [Claude Code documentation](https://code.claude.com/docs), Anthropic's [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), and the [Model Context Protocol](https://modelcontextprotocol.io) site, read in November 2026. The lessons are original writing.

### How the habit loop works

| Mechanic | Rule |
|---|---|
| Streak | Counts the learner's own calendar days. A day stays alive until midnight. |
| Streak freeze | Covers a missed day. Start with 1, hold up to 2, buy more with gems. Freezes are only spent when they cover the whole gap. |
| XP and daily goal | 10 XP for a new lesson, 5 for a repeat, 5 more for a perfect one. Goals are 10, 20, 30 or 50 XP a day. |
| Unlocks | Lessons open in order; finishing a unit opens the next. |
| Mistakes | A wrong answer returns at the end of the lesson. Code exercises allow retries. After two misses the worked example opens by itself, and for code the answer is offered too. |

### How reminders decide what to send

Twenty rules read a snapshot of the learner: streak, days away, progress toward today's goal, wrong answers in the current lesson, and why they signed up.

| Channel | Examples |
|---|---|
| In-app | First lesson, a freeze saved your streak, your streak ended (fresh start), welcome back with a review, stuck on a lesson, unit finished, streak milestones, close to the daily goal |
| Push | Streak at risk, a late streak saver, first lesson not started, a fresh start (days 2–3 away), progress saved (days 4–6), the last message (day 7) |
| Email (simulated) | Welcome, weekly recap, one email at days 5–6 away (next step and a smaller goal), the last message by email if notifications are off |

- **Timing.** The daily reminder is due about 23.5 hours after the learner's last lesson, kept between 8am and 8pm. If a streak of three or more days is still at risk at 8pm, one streak saver follows.
- **Wording.** The streak reminder rotates through several messages and never repeats the previous day's.
- **The last message.** A week after the last lesson, the learner gets one message saying the reminders don't seem to be helping and will stop. After it, nothing is sent on any channel until they come back. This is taken from Duolingo, whose team has said its week-of-inactivity version is one of their most successful notifications; see the [notification teardown](docs/notification-teardown.md) for the evidence and what was not copied.
- **Limits.** Each message is sent once. One daily reminder, one email every three days, nothing overnight.

This is a static site, so notifications only arrive while the tab is open and email is not actually sent. A production version would run the same rules on a server.

## My role

I built ByteQuest with Claude Code as a pair programmer. I set the product direction: basing the first course on CS50, adding the Developer skills and Building with AI courses and deciding who each is for, the habit mechanics, placing learners with questions rather than asking about experience, asking for profile details only after the first lesson, giving every learner a starting avatar, timing reminders to when people actually practice, the pixel-art direction for the mascot, and what to cut. I reviewed the prototype screen by screen and directed the changes.

<!-- TODO(Joseph): confirm this matches what you'd say in an interview, and add a line on your background if you want it here. -->

## Key decisions and trade-offs

| Decision | Options | Chose | Gave up | Why |
|---|---|---|---|---|
| **What to teach** | Write a new curriculum · follow an established course | Follow CS50 week by week | Freedom to reorder or drop hard topics | A known syllabus gives beginners a credible destination, and the hard topics (memory, algorithms) are what make it real. |
| **Teaching language** | C, as CS50 does · Python throughout | Python, with C shown in read-only snippets where the idea needs it | Hands-on C: learners read pointers and memory management but do not write them | Python runs in a browser tab and gets out of a beginner's way. Installing a C toolchain is where many people stop. |
| **Lesson size** | Lecture-length · one idea per three-minute lesson | Three to five minutes, 7 to 14 screens | Depth in a single sitting | A habit needs a session that fits in a spare moment, and a clear place to stop. |
| **Labs and problem sets** | Skip them · copy them · rebuild the ideas in small steps | Original lab lessons that build the same ideas step by step | The open-ended struggle of a blank file, which is where some learning happens | A beginner with ten minutes cannot start a four-hour assignment. Scaffolded steps keep them moving; the final project hands back the blank page. |
| **Where to start a learner** | Ask how experienced they are · test them | Pick a course, then a placement quiz for that course, one question per chapter | A few seconds of setup, and precision: one question per chapter is a coarse test | People misjudge their own level in both directions. A question they can or cannot answer is better evidence. Each course keeps its own starting point, so being advanced in one does not skip anything in another. |
| **Developers who already code** | Send them to Computer science like everyone else · route them to AI automatically · suggest AI and let them choose | One question about coding experience sets the suggested course; anyone who aces the Computer science quiz is offered the other two | Pure evidence-based placement: this one answer is self-reported | A working developer's gap is AI, not loops or Git; someone who can program but has never held the job needs the job skills first. But some want fundamentals, so it is a suggestion. The self-report only picks a default; the quiz still decides where in a course they start, and catches the developer who answered modestly. |
| **Courses with prerequisites** | Lock them until the first course is done · leave them open · open, with a check | Open, with one Python question before the Developer skills quiz | A guarantee that every learner is ready | Locking would turn away people who already program, who are the course's main audience. One real question catches the beginner who wandered in, and they can still continue. |
| **When to ask for a profile** | During setup · after the first lesson | After the first lesson, skippable | Knowing the learner's name from the start | Every screen before the first lesson loses people. A profile is easier to ask for once they have finished something. |
| **Avatar** | Empty until made · build one during setup · assign one at random | Random pixel avatar for everyone, customisable later | A deliberate first choice | Nobody starts with a blank placeholder, there is no extra step, and people are more likely to adjust something they were given. |
| **Reminder time** | Learner picks a time · remind when they usually practice | About 23.5 hours after the last lesson, with no time setting at all | The learner's control over the time | A time someone picks is a guess about their day. The time they practiced yesterday is something they already did. |
| **Streak freezes** | No protection · spend a freeze per missed day · spend only when it saves the streak | Only when freezes cover the whole gap | Simplicity | A streak with no forgiveness punishes one bad day. Burning freezes on a streak that is lost anyway is a second punishment. |
| **Lapsed learners** | Remind forever · fade out quietly · say reminders are stopping, then stop | A last message on day 7 that says reminders are stopping, then silence | Any chance to win someone back after a week, and the later emails an earlier version sent | Duolingo's team reports that this message beat every variant they tried. Saying it and then continuing to email would make it untrue, so the later emails were removed. |
| **Wrong answers** | Hearts that run out · no penalty | No hearts: the question returns at the end, and the wrong sound is soft | The tension that scarcity creates | Beginners are wrong a lot. Locking them out for mistakes punishes the thing learning requires. |
| **Hints** | None · show the answer · two steps: the idea, then a nudge | Two steps, free, on every question | A cost that would make learners think before asking; hints are generated from each question's answer, so they are less tailored than hand-written ones | A stuck beginner either gets unstuck or leaves. Explaining the idea first gives them the chance to solve it themselves; the nudge is there if that isn't enough. Charging for help punishes the people who need it. |
| **Hard questions** | More explanation up front · leave them hard · a worked example before each one | A worked example with its real output before every code question, an easier form of each idea first, and a reminder before each lab step: 317 cards added | Lessons are about a third longer, and the hardest labs lose some of their puzzle | Some questions asked for things the lesson had not shown. Codédex puts a short solved example directly before each task, and Duolingo's own tests found that explanation-heavy lessons nearly doubled mistakes, so the fix was examples, not reading. The checker now fails a lesson that asks for code before showing any. |
| **Chapter art** | One repeated backdrop · downloaded illustrations · scenes drawn in code | 38 destination scenes painted by small drawing programs | Hand-drawn polish; each scene took several rounds of rendering and correcting | A path of 38 chapters with the same banner gives no sense of travelling. Drawing in code keeps one style and palette discipline across all of them, with nothing to license. |
| **Exercise formats** | Multiple choice only · add hands-on formats | Ten formats, including drag, tap-the-bug and step-through | Content cost: each new format needs its own authoring and checking | Recognising an answer is weaker than producing one. Debugging and tracing are skills in their own right. |
| **Mascot** | None · smooth vector character · pixel art | A pixel-art red panda with seven moods | The fluid motion of a rigged character | A character makes feedback feel like it comes from someone. Pixel art suits the subject, animates frame by frame in code, and is cheap to extend to learner avatars. |
| **Sound** | None · sounds from famous games · an open-licensed pack · made in code | Original classic-console sounds made in code (pulse waves, triangle bass, noise); the right-answer blip climbs with each answer in a row | The instant recognition of a famous game's sounds, and the polish of studio-made effects | Sound marks the moments that matter. Sounds from real games are copyrighted whether or not the app makes money, so the style was borrowed and every tune is original. |
| **Saving progress** | Accounts and a server · browser only · browser plus export | Browser storage with a backup file and a save code | Automatic sync across devices | A prototype with no server has nothing to breach and nothing to run. The save code covers moving devices without an account. |
| **Where job skills go** | Leave them out · bonus chapters after the final project · a second course | A second course with its own path | One simple, single path | Twelve chapters would have doubled the path and buried the final project. A separate course keeps the first one's promise clear (CS50, in small steps) and lets someone who already programs start with Git or testing. |
| **Teaching AI without calling a model** | Call a real model from the browser · teach it read-only · a scripted stand-in | Learners write the surrounding code against a stand-in with realistically shaped replies | The feel of a live model answering | A real call needs a secret key, which cannot live in a static site. The stand-in keeps exercises deterministic, so every answer can be checked, and the skill being taught (the loop around the model) is the same. |
| **Product facts that change** | State everything · state only what the official docs confirm, without prices or limits | Only what the docs confirm, dated, no prices or limits | Some specifics a learner might want | A lesson with a wrong command or an old price teaches the wrong thing with confidence. Anything that could not be confirmed was left out. |
| **Running JavaScript** | Read-only snippets · run it in the page · run it in a worker | A worker with a four-second limit, with console.log as the output | The DOM, timers and network inside exercises | JavaScript is the one language a browser runs natively, so learners should write it. A worker means an endless loop is stopped instead of freezing the lesson. |
| **Reduced motion** | Follow the device setting · always animate · animate by default, with an off switch and a prompt | On by default; an Animations switch in Settings; a one-time prompt to turn them off when the device asks for reduced motion | Automatic protection for people who are sensitive to movement: they have to press a button | Many computers have the setting on for reasons unrelated to motion sensitivity, and the app looked broken on them, sitting still with no explanation. The prompt keeps the choice one tap away for the people the setting exists for. |
| **Getting around** | Links in the top bar · bottom tabs | Two bottom tabs: Learn and Profile | Screen height on small phones | From the profile there was no obvious way back to the lessons. Tabs make both places one tap away and always visible. |
| **Internal tooling in the app** | Keep a page that simulates which reminders each kind of learner gets · remove it | Removed | A visible demonstration of the reminder rules | It was a tool for the builder, not something a learner needs. The rules and their tests remain. |

## What is not here

- **AI course facts will age.** They were checked against the official documentation in November 2026; commands, model names and features change.
- **No real learners or results.** Whether this keeps people learning is untested.
- **No accounts or sync.** Progress stays in the browser unless exported.
- **No real push or email delivery.** The rules run; a server would be needed to deliver when the app is closed.
- **No first-hand notification log.** The teardown of Duolingo's reminders uses published sources, not a two-week log from a test account.
- **Hands-on tooling.** Git, installing tools and deploying are taught as ideas and commands, with checklists to do on a real machine; the app cannot run them.
- **Simplified assignments.** Some CS50 problem sets are reduced (a one-row blur instead of a full image filter) and the hardest election method is left out. Flask and live web requests are shown, not run.
- **No leagues, friends or leaderboards.**

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # streak, unlock, reminder, hint, badge and save tests
npx tsx scripts/check-content.ts   # validates every exercise; runs each Python, JavaScript and SQL answer and worked example
```

Settings (the gear icon on the profile) has a **Prototype: unlock all lessons** switch, off by default. The first sample of the pixel-adventure look is still at `#/sample` (how it moves is in [docs/motion-spec.md](docs/motion-spec.md)); its backdrops and the welcome screen's are CC0 art by Luis Zuno (see [public/art/CREDITS.md](public/art/CREDITS.md)). `npx tsx scripts/render-worlds.ts <folder>` writes every chapter scene as a PNG. Any exercise can be opened directly with `#/lesson/<lesson-id>?at=<index>`, which does not save progress.

Built with Vite, React, TypeScript and Tailwind. Python runs in [Pyodide](https://pyodide.org) inside a Web Worker, JavaScript in its own worker, and SQL in [sql.js](https://sql.js.org). Pip, the avatars and the sounds are generated in code: sprites as pixel grids ([src/ui/pixel/sprites.ts](src/ui/pixel/sprites.ts)), sounds with the Web Audio API ([src/sound.ts](src/sound.ts)). The reminder rules are in [src/engine/messaging.ts](src/engine/messaging.ts).

## Credits and licence

The course structure follows CS50x by David J. Malan and Harvard University, whose materials are licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The lessons here are original writing. Lesson content in `src/content/` is shared under the same CC BY-NC-SA 4.0 licence.
