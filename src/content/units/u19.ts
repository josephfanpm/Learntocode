import type { Unit } from '../types'

export const u19: Unit = {
  id: 'u19',
  week: 6,
  lecture: 'https://missing.csail.mit.edu/2026/shipping-code/',
  lectureFrom: 'MIT Missing Semester: Shipping code',
  course: 'dev',
  title: 'Shipping your code',
  summary: 'Hosting, secrets, logs and pipelines',
  lessons: [
    {
      id: 'u19-production',
      title: 'Production and where code lives',
      exercises: [
        {
          kind: 'concept',
          title: 'Three places your code runs',
          body: '**Production** is the copy of your app that real users use. Breaking it costs trust and money.\n\nSo code travels through **environments**: **local** is your own computer, where you build. **Staging** is a private copy that looks like production, for a final check. Then production.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the environment that fits each question.',
          cells: ['Local', 'Staging', 'Production'],
          steps: [
            { ask: 'Where do you first write and try a new feature?', answer: 0 },
            { ask: 'Where does the team do a last check, on a copy that looks like the real thing?', answer: 1 },
            { ask: 'Where do real customers place real orders?', answer: 2 },
            { ask: 'A bug that is first noticed here costs the most. Where?', answer: 2 },
          ],
          explain: 'Each environment is a safety net for the next. The earlier a bug is caught, the fewer people it reaches.',
        },
        {
          kind: 'concept',
          title: 'Hosting in plain words',
          body: '**Hosting** means renting a computer that is always online.\n\n**Static hosting** hands out ready-made files: HTML, CSS, images. **A server** is a machine running your program all day, waiting for requests. **Serverless** runs one of your functions only when a request arrives, and the provider looks after the machines.',
        },
        {
          kind: 'match',
          prompt: 'Match each project to the hosting that fits it best.',
          pairs: [
            ['A portfolio of HTML and CSS pages', 'Static hosting'],
            ['A chat app that keeps connections open all day', 'A server'],
            ['A function that resizes a photo now and then', 'Serverless'],
          ],
          explain: 'Files that never change need no program. Work that never stops needs a machine that stays on. Short, occasional jobs suit serverless.',
        },
        {
          kind: 'choice',
          prompt: 'Your site is three HTML pages and a stylesheet. Nothing is saved and nobody logs in. Which hosting is the simplest good choice?',
          options: [
            'A server you keep running and updated yourself',
            'Static hosting',
            'Serverless functions for every page',
            'Your laptop, left switched on',
          ],
          answer: 1,
          explain: 'There is no program to run, only files to hand out. Static hosting is cheap, fast and has almost nothing to break.',
        },
        {
          kind: 'type',
          prompt: 'Which environment is a private copy of production, used for a final check before release? Type its name.',
          accept: ['staging', 'the staging environment', 'staging environment', 'stage'],
          explain: 'Staging is the dress rehearsal: same setup as production, but no real users watching.',
        },
        {
          kind: 'concept',
          title: 'Recap: names, addresses and padlocks',
          body: 'A **domain** like `shop.example` is a name for people. **DNS** is the phone book that turns it into an **IP address**, the number computers use.\n\n**HTTPS** encrypts what travels between browser and server. The server proves who it is with a **certificate**, and the browser shows a padlock.',
        },
        {
          kind: 'order',
          prompt: 'Someone visits your site for the first time. Put what happens in order.',
          lines: [
            'They type shop.example in the browser',
            'DNS answers with the IP address of your host',
            'The browser connects and checks the HTTPS certificate',
            'The browser asks for the page over the encrypted connection',
            'Your host sends back the HTML',
          ],
          explain: 'First the name becomes an address, then the connection is made safe, and only then does the page travel.',
        },
        {
          kind: 'spot',
          prompt: 'This is a launch checklist for a shop. Tap the line that would send passwords across the internet unprotected.',
          lines: [
            'Domain: shop.example',
            'DNS: points to the host at 203.0.113.10',
            'Login form posts to http://shop.example/login',
            'Certificate: valid for 80 more days',
          ],
          answer: 2,
          explain: 'Plain `http` is not encrypted, so anyone on the path could read the password. Every page and form should use `https`.',
        },
      ],
    },
    {
      id: 'u19-config',
      title: 'Configuration and secrets',
      exercises: [
        {
          kind: 'concept',
          title: 'Same code, different settings',
          body: '**Configuration** is everything that differs between environments: the database address, the port, whether debug mode is on.\n\nKeep it out of the code. The app reads it from **environment variables** when it starts. One codebase then runs anywhere, and only the settings around it change.',
        },
        {
          kind: 'choice',
          prompt: 'The same version of your app runs on staging and on production. What should be different between the two?',
          options: [
            'The Python files',
            'The tests',
            'The configuration, such as which database it talks to',
            'The programming language',
          ],
          answer: 2,
          explain: 'If the code differed, staging would not prove anything about production. Only the settings change.',
        },
        {
          kind: 'concept',
          title: 'Secrets stay out of Git',
          body: 'A **secret** is config that must stay private: passwords, API keys. **Never commit one.** Git remembers every old version, so deleting it later does not remove it.\n\nOn your computer, keep secrets in a `.env` file of `NAME=value` lines, and list `.env` in `.gitignore`. In production, set them in your host\'s settings.',
        },
        {
          kind: 'spot',
          prompt: 'This settings file is about to be committed. Tap the line that must not go into Git.',
          lines: [
            'import os',
            'DEBUG = False',
            'API_KEY = "sk_live_9f2a71c0d4"',
            'PORT = int(os.environ.get("PORT", "8000"))',
          ],
          language: 'python',
          answer: 2,
          explain: 'A real key written into the code is visible to everyone who can ever read the repository. It should be read from the environment like `PORT` is.',
        },
        {
          kind: 'type',
          prompt: 'Your secrets live in a file called `.env`. Which line do you add to `.gitignore` so Git never picks that file up?',
          accept: ['.env', '/.env', '.env*', '*.env'],
          explain: '`.gitignore` is a list of files Git should pretend not to see. One line with the file name is enough.',
        },
        {
          kind: 'blank',
          prompt: 'The database address is required. The port is optional and falls back to 8000. Fill the gaps.',
          code: 'import os\n\ndatabase = os.environ[___]\nport = os.environ.___("PORT", "8000")',
          language: 'python',
          bank: ['"DATABASE_URL"', 'get', '"db.prod.example"', 'find'],
          answers: ['"DATABASE_URL"', 'get'],
          explain: 'Square brackets crash when the variable is missing, which is right for something required. `.get` with a default suits optional settings.',
        },
        {
          kind: 'concept',
          title: 'Required or optional',
          body: 'Two checks cover most config. `not in` asks whether a name is missing from a dictionary: use it for settings the app cannot run without. `.get` reads a value with a fallback: use it for settings that have a sensible default.',
          code: 'settings = {"COLOUR": "blue"}\nif "SIZE" not in settings:\n    print("Missing SIZE")\nprint(settings.get("COLOUR", "red"))\nprint(settings.get("FONT", "plain"))',
          language: 'python',
          output: 'Missing SIZE\nblue\nplain',
        },
        {
          kind: 'write',
          prompt: 'The first input line holds `NAME=value` pairs separated by spaces. The starter turns them into `env`, a stand-in for the environment. `DATABASE_URL` is required: if it is missing, print only `Missing DATABASE_URL`. Otherwise print `db:` and its value, then `port:` and the `PORT` value on a second line, using `8000` when `PORT` is not set.',
          language: 'python',
          starter:
            'env = {}\nfor pair in input().split():\n    name, value = pair.split("=")\n    env[name] = value\n\nprint("db:", env["DATABASE_URL"])\nprint("port:", env["PORT"])\n',
          tests: [
            { stdin: ['DATABASE_URL=db.local PORT=5000'], expected: 'db: db.local\nport: 5000' },
            { stdin: ['DATABASE_URL=db.prod'], expected: 'db: db.prod\nport: 8000' },
            { stdin: ['PORT=9000'], expected: 'Missing DATABASE_URL' },
          ],
          hint: 'Check `if "DATABASE_URL" not in env:` first. For the port, env.get("PORT", "8000") supplies the default.',
          solution:
            'env = {}\nfor pair in input().split():\n    name, value = pair.split("=")\n    env[name] = value\n\nif "DATABASE_URL" not in env:\n    print("Missing DATABASE_URL")\nelse:\n    print("db:", env["DATABASE_URL"])\n    print("port:", env.get("PORT", "8000"))\n',
          explain: 'Good apps check their config at startup: a clear "missing" message beats a confusing crash an hour later.',
        },
        {
          kind: 'steps',
          prompt: 'Tap where each value belongs.',
          cells: ['In the code', '.env file (ignored by Git)', "Host's settings page", 'Public README'],
          steps: [
            { ask: 'The password of the production database.', answer: 2 },
            { ask: 'A test API key you use only on your own laptop.', answer: 1 },
            { ask: 'The number of products shown per page: 20, the same everywhere.', answer: 0 },
            { ask: 'The list of variable names a new teammate must set (names only, no values).', answer: 3 },
          ],
          explain: 'Secrets live with the environment they belong to. Ordinary values that never change can stay in code, and names without values are safe to document.',
        },
        {
          kind: 'choice',
          prompt: 'You pushed a commit that contains a live API key. You notice ten minutes later. What is the right first move?',
          options: [
            'Delete the line in a new commit and say nothing',
            'Make the repository name harder to guess',
            'Wait and see whether anything bad happens',
            'Cancel that key and create a new one, then tell your team',
          ],
          answer: 3,
          explain: 'The old commit still holds the key, so treat it as stolen. A cancelled key is useless to whoever finds it.',
        },
      ],
    },
    {
      id: 'u19-pipeline',
      title: 'Builds, containers and pipelines',
      exercises: [
        {
          kind: 'concept',
          title: 'From source to something you can ship',
          body: 'A **build** turns your source code into the thing that actually runs: it installs dependencies, checks and bundles the code, and packs the result.\n\nThe output is called an **artifact**. You build once, then ship that exact same artifact to staging and to production.',
        },
        {
          kind: 'choice',
          prompt: 'Why ship the same built artifact to staging and then to production, and not build again for production?',
          options: [
            'What you tested on staging is then exactly what goes live',
            'Building twice is against the rules of Git',
            'Production servers cannot install packages',
            'The second build is always slower',
          ],
          answer: 0,
          explain: 'A fresh build might pick up a slightly different dependency. Reusing the artifact means the thing you checked is the thing users get.',
        },
        {
          kind: 'concept',
          title: 'A box with everything inside',
          body: 'A **container** is a sealed box holding your app and everything it needs: the language, the packages, the files. It runs the same on any machine.\n\nThe packed box is an **image**. A **Dockerfile** is the recipe for building it, read top to bottom.',
          code: 'FROM python:3.12\nCOPY . /app\nRUN pip install -r /app/requirements.txt\nCMD ["python", "/app/app.py"]',
        },
        {
          kind: 'steps',
          prompt: 'A tour of that Dockerfile. Tap the line that does each job.',
          cells: ['FROM python:3.12', 'COPY . /app', 'RUN pip install ...', 'CMD ["python", ...]'],
          steps: [
            { ask: 'Which line picks a starting box that already has Python in it?', answer: 0 },
            { ask: 'Which line puts your project files into the box?', answer: 1 },
            { ask: 'Which line installs your packages while the image is being built?', answer: 2 },
            { ask: 'Which line says what to run when the container starts?', answer: 3 },
          ],
          explain: 'Start from a base, copy the code in, install what it needs, and name the start command. Most Dockerfiles follow this shape.',
        },
        {
          kind: 'concept',
          title: 'The pipeline',
          body: '**Continuous integration** (CI): on every push, a fresh machine installs, lints, tests and builds your code, with no human involved.\n\n**Continuous deployment** (CD): if every stage passes, the artifact is released automatically.\n\nTogether they form a **pipeline**. A failing stage stops the line, so broken code never reaches users.',
        },
        {
          kind: 'order',
          prompt: 'Put the stages of a typical pipeline in order.',
          lines: [
            'Install dependencies',
            'Lint: check code style',
            'Run the tests',
            'Build the artifact',
            'Deploy to staging',
            'Deploy to production',
          ],
          explain: 'Cheap, fast checks come first so mistakes are caught early. Nothing is built or deployed until the code has passed its tests.',
        },
        {
          kind: 'spot',
          prompt: 'This pipeline run went red. Tap the stage you need to look at.',
          lines: [
            'install   passed   41s',
            'lint      passed   6s',
            'test      FAILED   2 failed, 148 passed',
            'build     skipped',
            'deploy    skipped',
          ],
          answer: 2,
          explain: 'The first failing stage is the cause. The skipped stages are just the line stopping, as it should.',
        },
        {
          kind: 'type',
          prompt: 'A pipeline has five stages: install, lint, test, build, deploy. The lint stage fails. How many stages run after it? Type the number.',
          accept: ['0', 'zero', 'none'],
          explain: 'A stage that exits with a failure stops everything after it. That is the whole point: no broken release.',
        },
        {
          kind: 'concept',
          title: 'Stopping a loop early',
          body: '`break` leaves a loop at once: `jam` is never looked at.\n\nThe variable `found` remembers what happened inside the loop, so the code after it can decide what to print.',
          code: `found = False
for word in ["tea", "milk", "jam"]:
    print("look at", word)
    if word == "milk":
        found = True
        break
if not found:
    print("no milk")`,
          language: 'python',
          output: 'look at tea\nlook at milk',
        },
        {
          kind: 'write',
          prompt: 'Write a tiny pipeline runner. Read one line of steps like `install:ok test:fail`. For each step in order print `run` and its name. If a step is `fail`, print `stopped at` and its name, and run nothing more. If every step is `ok`, print `deployed` at the end.',
          language: 'python',
          starter:
            'steps = input().split()\nfor step in steps:\n    name, result = step.split(":")\n    print("run", name)\nprint("deployed")\n',
          tests: [
            { stdin: ['install:ok lint:ok test:fail build:ok'], expected: 'run install\nrun lint\nrun test\nstopped at test' },
            { stdin: ['install:ok test:ok'], expected: 'run install\nrun test\ndeployed' },
            { stdin: ['install:fail lint:ok'], expected: 'run install\nstopped at install' },
          ],
          hint: 'Keep a variable like `failed = False`. On a fail: print the stopped line, set it to True and `break`. Print `deployed` only if it is still False.',
          solution:
            'steps = input().split()\nfailed = False\nfor step in steps:\n    name, result = step.split(":")\n    print("run", name)\n    if result == "fail":\n        print("stopped at", name)\n        failed = True\n        break\nif not failed:\n    print("deployed")\n',
          explain: 'Real pipelines work the same way, with exit codes in place of `ok` and `fail`: the first non-zero code stops the line.',
        },
      ],
    },
    {
      id: 'u19-logs',
      title: 'Logs, monitoring and rollbacks',
      exercises: [
        {
          kind: 'concept',
          title: 'Your app keeps a diary',
          body: 'In production you cannot watch the screen, so the app writes **logs**: one line per event, with a time, a **level** and a message.\n\nThe levels, from quiet to loud: `DEBUG` (detail for developers), `INFO` (normal events), `WARNING` (odd, but still working), `ERROR` (something failed).',
        },
        {
          kind: 'match',
          prompt: 'Match each log level to a message that belongs at that level.',
          pairs: [
            ['DEBUG', 'cart contents: [12, 40, 7]'],
            ['INFO', 'user 88 logged in'],
            ['WARNING', 'disk is 85% full'],
            ['ERROR', 'could not save order 501'],
          ],
          explain: 'Levels let you turn the volume up or down. In production you usually hide DEBUG and get alerted on ERROR.',
        },
        {
          kind: 'spot',
          prompt: 'Users say that paying fails. Tap the log line that shows what broke.',
          lines: [
            '09:14:02 INFO GET /cart 200',
            '09:14:03 INFO GET /checkout 200',
            '09:14:05 WARNING payment slow, retry 1 of 3',
            "09:14:09 ERROR POST /pay 500 KeyError: 'card_id'",
            '09:14:10 INFO GET /home 200',
          ],
          answer: 3,
          explain: 'The ERROR line names the request, the status and the exact exception. The warning just before it is a useful clue, but not the failure itself.',
        },
        {
          kind: 'type',
          prompt: 'Look at this log line. Which status code did the server send back? Type the number.',
          code: "09:14:09 ERROR POST /pay 500 KeyError: 'card_id'",
          accept: ['500', '500 error', 'status 500'],
          explain: 'Codes starting with 5 mean the server itself failed. This line also tells you where to look: the code that reads `card_id`.',
        },
        {
          kind: 'concept',
          title: 'Picking one word out of a line',
          body: 'A program can read a log line the way you do. `split()` cuts the line into words. Counting starts at 0, so `words[1]` is the second word: the level.',
          code: 'line = "09:14 WARNING disk nearly full"\nwords = line.split()\nprint(words[1])\nprint(words[1] == "ERROR")',
          language: 'python',
          output: 'WARNING\nFalse',
        },
        {
          kind: 'write',
          prompt: 'Read how many log lines follow, then read each line. A line looks like `09:14 ERROR could not save`: the level is the second word. Print only the ERROR lines, unchanged. Then print `errors:` and how many there were.',
          language: 'python',
          starter:
            'count = int(input())\nerrors = 0\nfor i in range(count):\n    line = input()\n    print(line)\nprint("errors:", errors)\n',
          tests: [
            {
              stdin: ['4', '09:14 INFO page loaded', '09:15 ERROR could not save order', '09:16 WARNING disk nearly full', '09:17 ERROR payment failed'],
              expected: '09:15 ERROR could not save order\n09:17 ERROR payment failed\nerrors: 2',
            },
            { stdin: ['2', '10:00 INFO started', '10:01 INFO no ERROR found in check'], expected: 'errors: 0' },
          ],
          hint: 'line.split()[1] is the level. Print the line and add 1 to errors only when it equals "ERROR".',
          solution:
            'count = int(input())\nerrors = 0\nfor i in range(count):\n    line = input()\n    if line.split()[1] == "ERROR":\n        print(line)\n        errors += 1\nprint("errors:", errors)\n',
          explain: 'Checking the level field, not the whole line, avoids false alarms when the word ERROR merely appears in a message.',
        },
        {
          kind: 'concept',
          title: 'Watching, and stepping back',
          body: '**Monitoring** watches numbers for you: error rate, response time, whether the site is up. An **alert** messages the team when one crosses a limit.\n\nIf a release breaks things, **roll back**: put the previous version live again. It is the fastest fix. Find the real cause afterwards, calmly.',
        },
        {
          kind: 'steps',
          prompt: 'Errors jumped the moment the newest release went live. Tap the version that answers each question.',
          cells: ['v41', 'v42', 'v43: ran fine', 'v44: live now', 'v45: not built yet'],
          steps: [
            { ask: 'Which version is the first suspect?', answer: 3 },
            { ask: 'You roll back. Which version is live now?', answer: 2 },
            { ask: 'You find and fix the bug. Which version carries the fix through the pipeline?', answer: 4 },
          ],
          explain: 'Rolling back returns to the last version known to work. The fix ships as a new version, so the history of what ran when stays honest.',
        },
        {
          kind: 'choice',
          prompt: 'Five minutes after a release, the error alert fires and customers cannot pay. What do you do first?',
          options: [
            'Start reading the whole codebase for the bug',
            'Roll back to the previous version, then investigate',
            'Turn the alert off so it stops distracting you',
            'Wait an hour to see whether it settles',
          ],
          answer: 1,
          explain: 'Stop the harm first. With the old version live again, you can read logs and find the cause without customers waiting.',
        },
        {
          kind: 'order',
          prompt: 'A release went wrong. Put a calm response in order.',
          lines: [
            'An alert shows the error rate jumping',
            'Roll back to the previous version',
            'Check that the error rate has dropped',
            'Read the logs to find the cause',
            'Ship the fix through the normal pipeline',
          ],
          explain: 'Notice, stop the harm, confirm it stopped, then understand and fix. The fix takes the same tested road as any other change.',
        },
      ],
    },
    {
      id: 'u19-ship',
      title: 'Ship something',
      exercises: [
        {
          kind: 'concept',
          title: 'This one happens on your computer',
          body: 'This lesson is a **checklist** you follow on your own computer, not in this app.\n\nThe goal: a small web page of yours, online, at an address you can send to a friend. Static hosting is free in many places, so this costs nothing but an hour.',
        },
        {
          kind: 'concept',
          title: 'Step 1: a page in a repository',
          body: 'Make a folder with an `index.html` (your name and one sentence is enough) and open it in a browser to check it.\n\nThen put the folder under Git, and push it to an online repository on a code hosting site of your choice.',
          code: 'git init\ngit add .\ngit commit -m "First page"',
        },
        {
          kind: 'order',
          prompt: 'Put the steps for getting your page into an online repository in order.',
          lines: ['git init', 'git add .', 'git commit -m "First page"', 'git push'],
          explain: 'Start the repository, choose what to save, save it with a message, then send it online. Pushing comes last because there must be a commit to push.',
        },
        {
          kind: 'spot',
          prompt: 'You are about to push this folder to a public repository. Tap the file that must stay out of it.',
          lines: ['index.html', 'style.css', '.env', 'README.md'],
          answer: 2,
          explain: 'A `.env` file holds secrets. Add it to `.gitignore` before your first commit, even on a tiny project: it is a habit worth having.',
        },
        {
          kind: 'concept',
          title: 'Step 2: connect a static host',
          body: 'Pick a static hosting service (many code hosting sites include one). Connect it to your repository, choose the branch and the folder that holds `index.html`, and press deploy.\n\nThe host copies your files and gives you a public address. From now on, every push is a new release.',
        },
        {
          kind: 'type',
          prompt: 'A static host looks for one file name to serve as the home page of a folder. Type that file name.',
          accept: ['index.html', '/index.html', 'index'],
          explain: 'When a visitor asks for a folder, the host sends back its `index.html`. A page named anything else needs its full name in the address.',
        },
        {
          kind: 'choice',
          prompt: 'The host says the deploy worked, but your address shows "404 Not Found". What is the most likely cause?',
          options: [
            'The internet is full',
            'HTML pages cannot be hosted for free',
            'The host is looking in a folder that has no `index.html`',
            'Your commit message was too short',
          ],
          answer: 2,
          explain: 'A 404 means the host found no file at that address. Check the folder setting and the exact file name, then read the host\'s deploy log.',
        },
        {
          kind: 'concept',
          title: 'Step 3: check it like a visitor',
          body: 'Open the address on your phone. Look for the padlock: that is HTTPS working.\n\nThen change a sentence, commit and push. Watch the host redeploy, and refresh. You have just run your first deployment pipeline.\n\nA bad change? Push the previous version again: your first rollback.',
        },
        {
          kind: 'steps',
          prompt: 'You fix a typo on your live page. Tap where each thing happens.',
          cells: ['Your laptop', 'Your online repository', 'The static host', "A visitor's browser"],
          steps: [
            { ask: 'Where do you edit index.html and commit the change?', answer: 0 },
            { ask: 'Where does git push send the commit?', answer: 1 },
            { ask: 'What notices the new commit and publishes the new files?', answer: 2 },
            { ask: 'Where does the fixed page finally appear after a refresh?', answer: 3 },
          ],
          explain: 'You never edit the live site by hand. Changes flow one way: laptop, repository, host, visitor.',
        },
        {
          kind: 'concept',
          title: 'Optional: your own domain',
          body: 'The host\'s address works fine. If you buy your own **domain**, you add a **DNS record** that points the name at your host, and the host sets up the HTTPS certificate.\n\nDNS changes can take a few hours to spread. Either way: you shipped something. Send the link to someone.',
        },
      ],
    },
  ],
}
