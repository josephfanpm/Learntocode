import type { Unit } from '../types'

const MENU_HELPERS =
  'def add_habit(habits, name):\n    habits.append({"name": name, "days": []})\n\ndef mark_done(habits, name, day):\n    for habit in habits:\n        if habit["name"] == name and day not in habit["days"]:\n            habit["days"].append(day)\n\ndef show(habits):\n    for habit in habits:\n        print(f"{habit[\'name\']}: {len(habit[\'days\'])}")\n\nhabits = []\n'

export const u12: Unit = {
  id: 'u12',
  week: 13,
  title: 'Final project',
  summary: 'Plan, build and ship something of your own',
  lessons: [
    {
      id: 'u12-idea',
      title: 'Pick an idea and shrink it',
      exercises: [
        {
          kind: 'concept',
          title: 'Your own project',
          body: 'The last step of the course is a **final project**: one small program that is yours.\n\nPick something you would use yourself. Then make it smaller. A tiny project you finish teaches more than a grand one you abandon. In this unit we build a habit tracker together as a model.',
        },
        {
          kind: 'choice',
          prompt: 'Which idea is the best size for a first project?',
          options: [
            'A social network for the whole city',
            'A game with online multiplayer and 50 levels',
            'A tracker for which days you did a habit',
            'An app that replaces your bank',
          ],
          answer: 2,
          explain: 'You can describe the tracker in one sentence and build it with tools you already know. The others would take a team months.',
        },
        {
          kind: 'concept',
          title: 'Good, better, best',
          body: 'To **scope** a project is to decide what is in and what is out. Write three outcomes.\n\n**Good**: the least that would still be useful. **Better**: what you expect to finish. **Best**: the dream, if all goes well.\n\nBuild good first. Then you always have something that works.',
        },
        {
          kind: 'match',
          prompt: 'Match each outcome to a version of the habit tracker.',
          pairs: [
            ['Good', 'Add habits and mark a day done'],
            ['Better', 'Also shows streaks and saves to a file'],
            ['Best', 'Also a web page with charts'],
          ],
          explain: 'Each level includes the one before it. If time runs out at "better", you still have a finished program.',
        },
        {
          kind: 'type',
          prompt: 'You have written your good, better and best outcomes. Which one do you build first? Type one word.',
          accept: ['good', 'the good', 'good one', 'the good one'],
          explain: 'Good comes first because it is the smallest thing that works. Better and best are added on top of it.',
        },
        {
          kind: 'concept',
          title: 'From outcome to steps',
          body: 'Turn the good outcome into a list of small **steps**. A useful step names one thing you can build and check, like *print every book title*. A vague one, like *make it nice*, gives you nowhere to start.\n\nOrder them so each step only uses what is already built.',
        },
        {
          kind: 'order',
          prompt: 'Put the habit tracker\'s build steps in a sensible order.',
          lines: [
            'Decide how one habit is stored',
            'Add a habit to the list',
            'Mark a day as done',
            'Work out the streak from the marked days',
            'Add a menu so a person can use it',
          ],
          explain: 'Each step relies on the one before it. The menu comes last because it only calls functions that already work.',
        },
        {
          kind: 'spot',
          prompt: 'One step in this plan is too vague to start on. Tap it.',
          lines: [
            'Store habits in a list',
            'Write a function that adds a habit',
            'Make the app really good',
            'Print each habit with its number of days',
          ],
          answer: 2,
          explain: 'You cannot tell when "really good" is done. A useful step names one thing you can build and check.',
        },
        {
          kind: 'choice',
          prompt: 'One step on your plan feels too big to begin. What helps most?',
          options: [
            'Skip it and hope it is not needed',
            'Split it into smaller steps until one feels easy',
            'Start a different project',
            'Write all the code at once, then run it',
          ],
          answer: 1,
          explain: 'This is the same trick as breaking a problem into functions. Keep splitting until the next step is something you know how to do.',
        },
        {
          kind: 'match',
          prompt: 'Match each part of the tracker to the Python tool that fits.',
          pairs: [
            ['One habit', 'A dictionary'],
            ['All the habits', 'A list'],
            ['Remember between runs', 'A file'],
            ['Ask the person what to do', 'input()'],
            ['Keep asking until they quit', 'A while loop'],
          ],
          explain: 'You already know every tool this project needs. A project is mostly choosing which ones go where.',
        },
      ],
    },
    {
      id: 'u12-data',
      title: 'Habits as data',
      exercises: [
        {
          kind: 'concept',
          title: 'The data model',
          body: 'First decide how the program stores things. That plan is the **data model**.\n\nOurs: each habit is a dictionary with a `"name"` and a list of `"days"` it was done. All habits live in one list.',
          code: 'habits = [\n    {"name": "Read", "days": ["2025-03-01", "2025-03-02"]},\n    {"name": "Walk", "days": []},\n]',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: 'habits = [\n    {"name": "Read", "days": ["2025-03-01", "2025-03-02"]},\n    {"name": "Walk", "days": []},\n]\nprint(habits[1]["name"])',
          language: 'python',
          options: ['Read', 'Walk', 'name', '[]'],
          answer: 1,
          explain: '`habits[1]` is the second dictionary, because counting starts at 0. Its `"name"` is Walk.',
        },
        {
          kind: 'type',
          prompt: 'What does this print? Type the output.',
          code: 'habits = [\n    {"name": "Read", "days": ["2025-03-01", "2025-03-02"]},\n    {"name": "Walk", "days": []},\n]\nprint(len(habits[0]["days"]))',
          language: 'python',
          accept: ['2'],
          explain: '`habits[0]["days"]` is the list of days for Read, and it holds two dates.',
        },
        {
          kind: 'concept',
          title: 'Reminder: a list of dictionaries',
          body: '`.append` adds one item to the end of a list, and that item can be a whole dictionary. Give every dictionary the same keys and the rest of the program can rely on them.',
          code: `books = []
books.append({"title": "Dune", "pages": 412})
books.append({"title": "Emma", "pages": 320})
print(len(books))
print(books[1]["title"])`,
          language: 'python',
          output: '2\nEmma',
        },
        {
          kind: 'concept',
          title: 'Reminder: functions can change a list',
          body: 'A function can change a list you pass in. `add_score` appends to the very list it was given, so the change is still there after the call. No `return` is needed.',
          code: `def add_score(scores, points):
    scores.append(points)

scores = []
add_score(scores, 7)
add_score(scores, 9)
print(scores)`,
          language: 'python',
          output: '[7, 9]',
        },
        {
          kind: 'write',
          prompt: 'Write `add_habit(habits, name)` so it adds a new habit dictionary with that name and an empty `"days"` list to the end of `habits`.',
          language: 'python',
          starter: 'def add_habit(habits, name):\n    pass\n\nhabits = []\nadd_habit(habits, input())\nadd_habit(habits, input())\nprint(habits)\n',
          tests: [
            { stdin: ['Read', 'Walk'], expected: "[{'name': 'Read', 'days': []}, {'name': 'Walk', 'days': []}]" },
            { stdin: ['Stretch', 'Sleep early'], expected: "[{'name': 'Stretch', 'days': []}, {'name': 'Sleep early', 'days': []}]" },
          ],
          hint: 'habits.append({"name": name, "days": []})',
          solution:
            'def add_habit(habits, name):\n    habits.append({"name": name, "days": []})\n\nhabits = []\nadd_habit(habits, input())\nadd_habit(habits, input())\nprint(habits)\n',
          explain: 'Every habit now has the same shape, so the rest of the program can rely on `"name"` and `"days"` being there.',
        },
        {
          kind: 'spot',
          prompt: 'After this runs, `habits[0]["name"]` crashes. Tap the buggy line.',
          lines: [
            'def add_habit(habits, name):',
            '    habit = {"name": name, "days": []}',
            '    habits.append(name)',
            '',
            'habits = []',
            'add_habit(habits, "Read")',
          ],
          language: 'python',
          answer: 2,
          explain: 'It builds the dictionary but appends the bare name, so the list holds a string, not a habit. It should append `habit`.',
        },
        {
          kind: 'concept',
          title: 'Finding one habit',
          body: 'To change one habit, loop through the list and compare names. When you find the match, change that dictionary. The list sees the change too, because it holds the very same dictionary.',
          code: 'for habit in habits:\n    if habit["name"] == "Read":\n        habit["days"].append("2025-03-03")',
          language: 'python',
        },
        {
          kind: 'concept',
          title: 'Reminder: not in',
          body: '`not in` is true when a value is missing from a list. Check it before you append and nothing is ever added twice. Cal turns up twice here but is listed once.',
          code: `guests = ["Ana", "Ben"]
for name in ["Ben", "Cal", "Cal"]:
    if name not in guests:
        guests.append(name)
print(guests)`,
          language: 'python',
          output: "['Ana', 'Ben', 'Cal']",
        },
        {
          kind: 'write',
          prompt: 'Write `mark_done(habits, name, day)`. Find the habit with that name and add `day` to its `"days"` list, but only if that day is not already in it. The program calls it twice with the same day to check.',
          language: 'python',
          starter:
            'def mark_done(habits, name, day):\n    pass\n\nhabits = [{"name": "Read", "days": []}, {"name": "Walk", "days": []}]\nname = input()\nday = input()\nmark_done(habits, name, day)\nmark_done(habits, name, day)\nprint(habits)\n',
          tests: [
            { stdin: ['Read', '2025-03-01'], expected: "[{'name': 'Read', 'days': ['2025-03-01']}, {'name': 'Walk', 'days': []}]" },
            { stdin: ['Walk', '2025-03-09'], expected: "[{'name': 'Read', 'days': []}, {'name': 'Walk', 'days': ['2025-03-09']}]" },
            { stdin: ['Swim', '2025-03-09'], expected: "[{'name': 'Read', 'days': []}, {'name': 'Walk', 'days': []}]" },
          ],
          hint: 'Loop over habits. If habit["name"] == name and day not in habit["days"], append the day.',
          solution:
            'def mark_done(habits, name, day):\n    for habit in habits:\n        if habit["name"] == name and day not in habit["days"]:\n            habit["days"].append(day)\n\nhabits = [{"name": "Read", "days": []}, {"name": "Walk", "days": []}]\nname = input()\nday = input()\nmark_done(habits, name, day)\nmark_done(habits, name, day)\nprint(habits)\n',
          explain: 'The `not in` check stops a double tap from counting a day twice. A habit that does not exist is simply left alone.',
        },
        {
          kind: 'type',
          prompt: 'How many days does Read have at the end? Type the number.',
          code: 'habits = [{"name": "Read", "days": ["2025-03-01"]}]\nmark_done(habits, "Read", "2025-03-01")\nmark_done(habits, "Read", "2025-03-02")\nmark_done(habits, "Read", "2025-03-02")',
          language: 'python',
          accept: ['2', 'two'],
          explain: 'March 1 was already there and March 2 is added only once, so the list holds two days.',
        },
        {
          kind: 'blank',
          prompt: 'Finish the loop that prints each habit\'s name and how many days it was done.',
          code: 'for habit in habits:\n    count = ___(habit["days"])\n    print(habit[___], count)',
          language: 'python',
          bank: ['len', '"name"', '"days"', 'sum'],
          answers: ['len', '"name"'],
          explain: '`len` counts the dates in the list, and `habit["name"]` gives the label to print beside it.',
        },
      ],
    },
    {
      id: 'u12-streak',
      title: 'Counting a streak',
      exercises: [
        {
          kind: 'concept',
          title: 'What is a streak?',
          body: 'A **streak** is how many days in a row a habit was done, counting back from the most recent day.\n\nWe write dates as `"YYYY-MM-DD"`. Year first, then month, then day, each padded with zeros, so sorting them as text also sorts them by time.',
        },
        {
          kind: 'choice',
          prompt: 'Why write March 9 as `"2025-03-09"` and not `"2025-3-9"`?',
          options: [
            'Python cannot store a string without zeros',
            'With the zeros, text order matches date order',
            'The zeros make the program run faster',
            'Dates must always be exactly 12 characters',
          ],
          answer: 1,
          explain: 'As text, "2025-3-9" would sort after "2025-3-10", because "9" comes after "1". The padded form sorts correctly.',
        },
        {
          kind: 'concept',
          title: 'Days between two dates',
          body: 'Months have different lengths, so let Python do the date maths. `date.fromisoformat` turns a `"YYYY-MM-DD"` string into a date. Subtract two dates and `.days` gives the gap.',
          code: 'from datetime import date\n\na = date.fromisoformat("2025-03-01")\nb = date.fromisoformat("2025-03-05")\nprint((b - a).days)  # 4',
          language: 'python',
          output: '4',
        },
        {
          kind: 'write',
          prompt: 'Read two dates as `YYYY-MM-DD`, the earlier one first. Print the number of days between them.',
          language: 'python',
          starter: 'from datetime import date\n\nfirst = input()\nsecond = input()\nprint(0)\n',
          tests: [
            { stdin: ['2025-03-01', '2025-03-05'], expected: '4' },
            { stdin: ['2025-02-27', '2025-03-01'], expected: '2' },
            { stdin: ['2025-12-31', '2026-01-01'], expected: '1' },
          ],
          hint: 'Turn each into a date with date.fromisoformat(...), subtract the first from the second, and print .days.',
          solution:
            'from datetime import date\n\nfirst = input()\nsecond = input()\ngap = date.fromisoformat(second) - date.fromisoformat(first)\nprint(gap.days)\n',
          explain: 'Python knows February is short and that years roll over, so you do not have to.',
        },
        {
          kind: 'steps',
          prompt: 'These are the days a habit was done, in order. Act out the streak count by walking back from the end.',
          cells: ['03-01', '03-02', '03-04', '03-05', '03-06'],
          steps: [
            { ask: 'Start at the most recent day. Tap it. (Streak: 1)', answer: 4 },
            { ask: 'Tap the day exactly one day before it. (Streak: 2)', answer: 3 },
            { ask: 'Again: tap the day exactly one day before that. (Streak: 3)', answer: 2 },
            { ask: 'The next step back is a gap of two days. Tap the earlier day that is not part of the streak.', answer: 1 },
          ],
          explain: 'March 3 is missing, so the walk stops there. The streak is 3: March 4, 5 and 6.',
        },
        {
          kind: 'type',
          prompt: 'What is the streak for these days? Type the number.',
          code: 'days = ["2025-04-10", "2025-04-12", "2025-04-13"]',
          language: 'python',
          accept: ['2', 'two'],
          explain: 'Walking back: the 13th, then the 12th. The 11th is missing, so the count stops at 2.',
        },
        {
          kind: 'concept',
          title: 'Reminder: an empty list',
          body: 'An empty list counts as false, so `if not items:` catches it. Deal with that case first and leave early with `return`. The rest of the function can then trust there is at least one item.',
          code: `def last_item(items):
    if not items:
        return "nothing"
    return items[-1]

print(last_item([]))
print(last_item(["a", "b"]))`,
          language: 'python',
          output: 'nothing\nb',
        },
        {
          kind: 'concept',
          title: 'Reminder: walking a list backwards',
          body: 'Start `i` at the last position and take 1 away each time round. `steps[i - 1]` is the item just before. `while i > 0` stops at the front, where there is no item before.',
          code: `steps = [3, 4, 9, 10]
i = len(steps) - 1
while i > 0:
    print(steps[i], "-", steps[i - 1], "=", steps[i] - steps[i - 1])
    i -= 1`,
          language: 'python',
          output: '10 - 9 = 1\n9 - 4 = 5\n4 - 3 = 1',
        },
        {
          kind: 'write',
          prompt: 'Write `streak(days)`. `days` is a sorted list of `"YYYY-MM-DD"` strings. Return 0 for an empty list. Otherwise start at 1 and walk back from the last day, adding 1 each time the gap to the day before is exactly 1, and stopping at the first bigger gap.',
          language: 'python',
          starter:
            'from datetime import date\n\ndef streak(days):\n    return len(days)\n\ndays = input().split()\nprint(streak(days))\n',
          tests: [
            { stdin: ['2025-03-01 2025-03-02 2025-03-04 2025-03-05 2025-03-06'], expected: '3' },
            { stdin: ['2025-02-27 2025-02-28 2025-03-01'], expected: '3' },
            { stdin: [''], expected: '0' },
          ],
          hint: 'Set count = 1 and i = len(days) - 1. While i > 0, find the gap between days[i] and days[i - 1]. If it is not 1, break. Otherwise add 1 to count and take 1 from i.',
          solution:
            'from datetime import date\n\ndef streak(days):\n    if not days:\n        return 0\n    count = 1\n    i = len(days) - 1\n    while i > 0:\n        gap = date.fromisoformat(days[i]) - date.fromisoformat(days[i - 1])\n        if gap.days != 1:\n            break\n        count += 1\n        i -= 1\n    return count\n\ndays = input().split()\nprint(streak(days))\n',
          explain: 'The function never asks what today is. It only looks at the dates it was given, so it gives the same answer every time you test it.',
        },
        {
          kind: 'spot',
          prompt: 'This version always gives a streak one too small. Tap the buggy line.',
          lines: [
            'def streak(days):',
            '    if not days:',
            '        return 0',
            '    count = 0',
            '    i = len(days) - 1',
            '    while i > 0 and gap(days[i - 1], days[i]) == 1:',
            '        count += 1',
            '        i -= 1',
            '    return count',
          ],
          language: 'python',
          answer: 3,
          explain: 'The most recent day counts as day 1 of the streak, so `count` must start at 1. This is a classic off-by-one bug.',
        },
        {
          kind: 'choice',
          prompt: 'Why does `streak` take the dates as a list instead of looking up today\'s date itself?',
          options: [
            'Python cannot find out today\'s date',
            'Lists are faster than dates',
            'So the same input always gives the same answer, which makes it easy to test',
            'Because habits can only be done in the past',
          ],
          answer: 2,
          explain: 'A function that depends only on what you pass in can be checked with fixed examples today, tomorrow and next year.',
        },
      ],
    },
    {
      id: 'u12-save-menu',
      title: 'Save, load and a menu',
      exercises: [
        {
          kind: 'concept',
          title: 'JSON',
          body: 'When the program ends, the `habits` list vanishes. To keep it, write it to a file.\n\n**JSON** is a text format that looks a lot like Python lists and dictionaries. `json.dump` writes data to a file and `json.load` reads it back.',
          code: 'import json\n\nwith open("habits.json", "w") as f:\n    json.dump(habits, f)\n\nwith open("habits.json") as f:\n    habits = json.load(f)',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Finish the function that saves the habits.',
          code: 'def save(habits):\n    with open("habits.json", "___") as f:\n        json.___(habits, f)',
          language: 'python',
          bank: ['w', 'dump', 'r', 'load'],
          answers: ['w', 'dump'],
          explain: '`"w"` opens the file for writing, and `dump` pours the data into it.',
        },
        {
          kind: 'concept',
          title: 'Reminder: reading inside a function',
          body: 'A function can hand back what it read. `return json.load(f)` reads the file and returns the data in one step. Opening with no `"w"` means read only.',
          code: `import json

with open("scores.json", "w") as f:
    json.dump([3, 5], f)

def read_scores():
    with open("scores.json") as f:
        return json.load(f)

print(read_scores())`,
          language: 'python',
          output: '[3, 5]',
        },
        {
          kind: 'write',
          prompt: 'Write `save(habits)` to store the list in `habits.json`, and `load()` to read the file and return the list. The program adds a habit, saves, then prints what `load()` gives back.',
          language: 'python',
          starter:
            'import json\n\ndef save(habits):\n    pass\n\ndef load():\n    return []\n\nhabits = [{"name": "Read", "days": ["2025-03-01"]}]\nhabits.append({"name": input(), "days": []})\nsave(habits)\nprint(load())\n',
          tests: [
            { stdin: ['Swim'], expected: "[{'name': 'Read', 'days': ['2025-03-01']}, {'name': 'Swim', 'days': []}]" },
            { stdin: ['Walk'], expected: "[{'name': 'Read', 'days': ['2025-03-01']}, {'name': 'Walk', 'days': []}]" },
          ],
          hint: 'save: open("habits.json", "w") then json.dump(habits, f). load: open("habits.json") then return json.load(f).',
          solution:
            'import json\n\ndef save(habits):\n    with open("habits.json", "w") as f:\n        json.dump(habits, f)\n\ndef load():\n    with open("habits.json") as f:\n        return json.load(f)\n\nhabits = [{"name": "Read", "days": ["2025-03-01"]}]\nhabits.append({"name": input(), "days": []})\nsave(habits)\nprint(load())\n',
          explain: 'What comes back from the file is equal to what went in. That round trip is how a program remembers things between runs.',
        },
        {
          kind: 'spot',
          prompt: 'Saving crashes with "not writable". Tap the buggy line.',
          lines: [
            'import json',
            '',
            'def save(habits):',
            '    with open("habits.json", "r") as f:',
            '        json.dump(habits, f)',
          ],
          language: 'python',
          answer: 3,
          explain: '`"r"` opens the file for reading only. Saving needs `"w"` for writing.',
        },
        {
          kind: 'choice',
          prompt: 'The very first time the tracker runs, `habits.json` does not exist yet. What should `load()` do?',
          options: [
            'Crash, so the person knows something is wrong',
            'Catch `FileNotFoundError` and return an empty list',
            'Return the word "missing"',
            'Delete the program',
          ],
          answer: 1,
          explain: 'No file just means no habits yet. With `try` and `except FileNotFoundError`, the program starts with an empty list instead of crashing.',
        },
        {
          kind: 'concept',
          title: 'A text menu',
          body: 'A **menu** lets a person drive the program. Loop forever, read a command with `input()`, and run the matching function. One command breaks out of the loop.',
          code: 'while True:\n    command = input()\n    if command == "add":\n        add_habit(habits, input())\n    elif command == "quit":\n        break',
          language: 'python',
        },
        {
          kind: 'order',
          prompt: 'Put this menu loop in order.',
          lines: [
            'while True:',
            '    command = input()',
            '    if command == "list":',
            '        show(habits)',
            '    elif command == "quit":',
            '        print("Bye")',
            '        break',
          ],
          language: 'python',
          explain: 'Read the command inside the loop so it asks again each time round. `break` comes last, after the goodbye.',
        },
        {
          kind: 'type',
          prompt: 'The person types `add`, then `Read`, then `add`, then `Walk`, then `quit`. What does this print? Type the output.',
          code: 'habits = []\nwhile True:\n    command = input()\n    if command == "add":\n        habits.append(input())\n    elif command == "quit":\n        print(len(habits))\n        break',
          language: 'python',
          accept: ['2'],
          explain: 'Each `add` reads one more line as the name, so two habits are stored before `quit` prints the count.',
        },
        {
          kind: 'concept',
          title: 'Reminder: one branch per command',
          body: 'One `if`/`elif` chain picks what to do for each command, and every command gets its own branch. In the menu, a branch that needs more details, like a name, reads them with `input()` inside that branch.',
          code: `total = 0
for command in ["add", "add", "show", "undo", "show"]:
    if command == "add":
        total += 5
    elif command == "undo":
        total -= 5
    elif command == "show":
        print(total)`,
          language: 'python',
          output: '10\n5',
        },
        {
          kind: 'write',
          prompt: 'Finish the menu. `add` reads a name and adds the habit. `done` reads a name, then a date, and marks it. `list` calls `show(habits)`. `quit` prints `Bye` and stops. Use `input()` with empty brackets.',
          language: 'python',
          starter:
            MENU_HELPERS +
            '\nwhile True:\n    command = input()\n    if command == "quit":\n        print("Bye")\n        break\n',
          tests: [
            { stdin: ['add', 'Read', 'done', 'Read', '2025-03-01', 'list', 'quit'], expected: 'Read: 1\nBye' },
            {
              stdin: ['add', 'Walk', 'add', 'Read', 'done', 'Walk', '2025-03-01', 'done', 'Walk', '2025-03-02', 'list', 'quit'],
              expected: 'Walk: 2\nRead: 0\nBye',
            },
            { stdin: ['list', 'quit'], expected: 'Bye' },
          ],
          hint: 'Add branches: if command == "add": add_habit(habits, input()). For "done", read name = input() and day = input(), then call mark_done(habits, name, day).',
          solution:
            MENU_HELPERS +
            '\nwhile True:\n    command = input()\n    if command == "add":\n        add_habit(habits, input())\n    elif command == "done":\n        name = input()\n        day = input()\n        mark_done(habits, name, day)\n    elif command == "list":\n        show(habits)\n    elif command == "quit":\n        print("Bye")\n        break\n',
          explain: 'The menu is short because the real work lives in functions you already built and tested. That is a whole working program.',
        },
        {
          kind: 'choice',
          prompt: 'Why did we write and test `add_habit`, `mark_done` and `streak` before the menu?',
          options: [
            'Python requires functions to be written in alphabetical order',
            'Menus cannot be tested at all',
            'Small pieces are easy to check alone, and the menu just connects them',
            'The menu would run slower if written first',
          ],
          answer: 2,
          explain: 'When each piece is known to work, any new bug must be in the small part you just added.',
        },
      ],
    },
    {
      id: 'u12-ship',
      title: 'Test it, share it, keep going',
      exercises: [
        {
          kind: 'concept',
          title: 'Test like a stranger',
          body: 'To **test** is to run your program on purpose with inputs whose right answer you already know.\n\nTry three sorts: a normal case, an **edge case** (the unusual end, like an empty list or just one item), and wrong input, like a habit name that does not exist.',
        },
        {
          kind: 'choice',
          prompt: 'Which is an edge case worth testing for `streak(days)`?',
          options: [
            'A list with five days in a row',
            'The same five days in a row again',
            'A list with ten days in a row',
            'An empty list',
          ],
          answer: 3,
          explain: 'Empty input is where loops and indexes most often break. The other three all test the same ordinary path.',
        },
        {
          kind: 'spot',
          prompt: 'Each line is a test: a call and the answer we expect. One expected answer is wrong. Tap it.',
          lines: [
            'streak([]) should be 0',
            'streak(["2025-03-01"]) should be 1',
            'streak(["2025-03-01", "2025-03-03"]) should be 2',
            'streak(["2025-03-01", "2025-03-02"]) should be 2',
          ],
          answer: 2,
          explain: 'March 2 is missing, so only March 3 counts and the streak is 1. Tests can have bugs too, so work each answer out by hand.',
        },
        {
          kind: 'concept',
          title: 'Code is read more than written',
          body: 'In a month you will have forgotten how your program works. Help that future reader: clear names, short functions, and a comment where the *why* is not obvious.\n\nA **README** is a short text file beside your code that says what the project is and how to run it.',
        },
        {
          kind: 'spot',
          prompt: 'One variable here has a name that will be hard to understand in six months. Tap the line that creates it.',
          lines: [
            'def longest_name(habits):',
            '    longest = ""',
            '    for habit in habits:',
            '        if len(habit["name"]) > len(longest):',
            '            x2 = habit["name"]',
            '            longest = x2',
            '    return longest',
          ],
          language: 'python',
          answer: 4,
          explain: '`x2` says nothing about what it holds. A name like `name`, or no extra variable at all, would read at a glance.',
        },
        {
          kind: 'order',
          prompt: 'Put the parts of a README in the order a visitor needs them.',
          lines: [
            'The project\'s name',
            'One sentence on what it does',
            'How to run it',
            'An example of using it',
            'Ideas for what to add next',
          ],
          explain: 'A visitor first asks "what is this?", then "how do I try it?". Future plans are a nice extra at the end.',
        },
        {
          kind: 'type',
          prompt: 'What is the usual name of the file that explains your project to a visitor? Type one word.',
          accept: ['README', 'readme.md', 'readme.txt', 'read me'],
          explain: 'People look for a README first, so it is the best place for "what is this and how do I run it".',
        },
        {
          kind: 'concept',
          title: 'Where to go next',
          body: 'CS50 has follow-on courses that each go deep on one thing you tasted here: Python, web programming, AI, and SQL databases.\n\nAlso try **building in public**: sharing what you make and learn as you go. It keeps you moving and others can cheer and help.',
        },
        {
          kind: 'match',
          prompt: 'Match each goal to the follow-on course that fits.',
          pairs: [
            ['Write bigger, tidier programs', 'The Python course'],
            ['Build full sites people can visit', 'The web programming course'],
            ['Teach programs to learn from data', 'The AI course'],
            ['Ask sharper questions of data', 'The SQL course'],
          ],
          explain: 'Pick by what you want to make next. Whichever you choose, the habit of small finished projects carries over.',
        },
        {
          kind: 'choice',
          prompt: 'You finished the habit tracker. What is the best next step for your own project?',
          options: [
            'Wait until you feel completely ready',
            'Write your good, better and best outcomes and build "good" this week',
            'Plan the biggest app you can imagine before writing any code',
            'Reread every unit before starting',
          ],
          answer: 1,
          explain: 'You learn the most by building. A small "good" version this week beats a perfect plan that never starts.',
        },
      ],
    },
  ],
}
