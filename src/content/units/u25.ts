import type { Unit } from '../types'

// String.raw keeps regex patterns and Python code exactly as written:
// backslashes stay single, and line breaks are real line breaks.
const r = String.raw

export const u25: Unit = {
  id: 'u25',
  week: 12,
  lecture: 'https://missing.csail.mit.edu/2020/data-wrangling/',
  lectureFrom: 'MIT Missing Semester: Data wrangling',
  course: 'dev',
  title: 'Everyday tools',
  summary: 'Text patterns, dates and type hints',
  lessons: [
    {
      id: 'u25-regex-basics',
      title: 'Patterns in text',
      exercises: [
        {
          kind: 'concept',
          title: 'Regular expressions',
          body: 'A **regular expression** (regex) is a pattern that describes text, like "three digits, then a dash".\n\nPlain letters match themselves. Special codes match kinds of characters: `\\d` is any digit.\n\nIn Python, `re.search(pattern, text)` finds the first match, or gives `None`. Write patterns as raw strings, `r"..."`, so backslashes stay as typed.',
          code: r`import re

m = re.search(r"\d\d\d", "Room 204 is free")
print(m.group())`,
          language: 'python',
          output: '204',
        },
        {
          kind: 'match',
          prompt: 'Match each piece of a pattern to what it matches.',
          pairs: [
            [r`\d`, 'One digit, 0 to 9'],
            [r`\w`, 'One letter, digit or underscore'],
            [r`\s`, 'One space, tab or line break'],
            ['.', 'Any one character'],
            ['[aeiou]', 'One of the letters listed'],
          ],
          explain: 'Square brackets make a **character class**: one character from your own list. The backslash codes are ready-made classes.',
        },
        {
          kind: 'type',
          prompt: 'Type a pattern that matches exactly one digit.',
          accept: [r`\d`, '[0-9]', r`\d{1}`, '[0-9]{1}', r`[\d]`],
          explain: '`\\d` and `[0-9]` both mean "one character that is a digit".',
        },
        {
          kind: 'concept',
          title: 'Find every match',
          body: '`re.search` stops at the first match. `re.findall(pattern, text)` keeps going and returns a list of every match, each one a string.\n\nNo match at all gives an empty list.',
          code: r`import re

print(re.findall(r"[aeiou]", "tomato"))
print(re.findall(r"x", "tomato"))`,
          language: 'python',
          output: r`['o', 'a', 'o']
[]`,
        },
        {
          kind: 'concept',
          title: 'How many times?',
          body: 'A **quantifier** says how many of the thing before it.\n\n`+` one or more. `*` zero or more. `?` zero or one (optional). `{3}` exactly three. `{2,4}` two to four.\n\nSo `\\d+` matches a whole run of digits, and `colou?r` matches both spellings.',
          code: r`import re

print(re.findall(r"\d+", "Room 12, floor 3"))`,
          language: 'python',
          output: r`['12', '3']`,
        },
        {
          kind: 'choice',
          prompt: 'What does this give?',
          code: r`re.findall(r"\d", "Room 12, floor 3")`,
          language: 'python',
          options: ["['12', '3']", "['1', '2', '3']", "['123']", "['Room', 'floor']"],
          answer: 1,
          explain: 'Without `+`, `\\d` matches a single digit each time, so 12 comes back as two separate matches.',
        },
        {
          kind: 'spot',
          prompt: 'The pattern is `colou?r`. Tap the word it does NOT match.',
          lines: ['color', 'colour', 'colr'],
          answer: 2,
          explain: 'The `?` makes only the `u` optional. The second `o` is still required, and `colr` is missing it.',
        },
        {
          kind: 'write',
          prompt: 'Read a line with `input()`. Use `re.findall` to pull out every whole number in it, and print their sum.',
          language: 'python',
          starter: r`import re

text = input()
numbers = []   # replace [] with re.findall(...)
print(sum(int(n) for n in numbers))
`,
          tests: [
            { stdin: ['3 apples and 12 pears'], expected: '15' },
            { stdin: ['Room 101, floor 2'], expected: '103' },
          ],
          hint: r`re.findall(r"\d+", text) gives a list of digit runs as strings.`,
          solution: r`import re

text = input()
numbers = re.findall(r"\d+", text)
print(sum(int(n) for n in numbers))
`,
          explain: '`findall` returns strings, even when they look like numbers, so each one still needs `int()`.',
        },
        {
          kind: 'type',
          prompt: 'Type a pattern that matches exactly four digits in a row, like a year.',
          accept: [r`\d{4}`, '[0-9]{4}', r`\d\d\d\d`, '[0-9][0-9][0-9][0-9]', r`[\d]{4}`],
          explain: '`{4}` repeats the thing before it exactly four times, which is neater than writing `\\d` four times.',
        },
        {
          kind: 'concept',
          title: 'Plain characters plus codes',
          body: 'A pattern can mix plain characters with codes. Here a literal `@` must come first. Then `\\w+` takes one or more letters, digits or underscores.\n\nThe match stops at the first character that does not fit, so the `!` is left out.',
          code: r`import re

print(re.findall(r"@\w+", "Thanks @ana and @ben_2!"))`,
          language: 'python',
          output: r`['@ana', '@ben_2']`,
        },
        {
          kind: 'write',
          prompt: 'Read a line with `input()` and print every hashtag in it, one per line. A hashtag is `#` followed by one or more letters, digits or underscores.',
          language: 'python',
          starter: r`import re

text = input()
tags = text.split()   # this keeps every word, not just hashtags
for tag in tags:
    print(tag)
`,
          tests: [
            { stdin: ['Loving #python and #regex today'], expected: '#python\n#regex' },
            { stdin: ['#day_2 done!'], expected: '#day_2' },
          ],
          hint: r`re.findall(r"#\w+", text): a literal #, then one or more word characters.`,
          solution: r`import re

text = input()
tags = re.findall(r"#\w+", text)
for tag in tags:
    print(tag)
`,
          explain: '`\\w+` stops at the first character that is not a letter, digit or underscore, so the `!` is left out.',
        },
        {
          kind: 'choice',
          prompt: 'Why write patterns as `r"\\d+"` with an `r` in front?',
          options: [
            'The r makes the search run faster',
            'The r means "regex", and Python needs it to search',
            'A raw string keeps backslashes exactly as typed, so the pattern arrives intact',
            'The r makes the match ignore capital letters',
          ],
          answer: 2,
          explain: 'In a normal string Python gives some backslash pairs its own meaning, like `\\n` for a new line. A raw string switches that off.',
        },
      ],
    },
    {
      id: 'u25-regex-more',
      title: 'Anchors, groups and replacing',
      exercises: [
        {
          kind: 'concept',
          title: 'Validate or extract?',
          body: '**Extracting** means finding pieces inside a longer text. **Validating** means checking the *whole* text fits.\n\n`re.search` is happy with a match anywhere. To validate, pin the pattern down with **anchors**: `^` means the start of the text and `$` means the end.',
          code: r`re.search(r"\d{4}", "abc12345")     # matches: finds 1234
re.search(r"^\d{4}$", "abc12345")   # None: not exactly 4 digits`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Which pattern accepts `2024` but rejects `20245` and `x2024`?',
          options: [r`\d{4}`, r`^\d{4}`, r`\d{4}$`, r`^\d{4}$`],
          answer: 3,
          explain: 'Both anchors are needed. With only `^`, extra characters at the end slip through; with only `$`, extra characters at the start do.',
        },
        {
          kind: 'spot',
          prompt: 'This should accept only a 4-digit PIN, but it says `valid` for `12345678`. Tap the line with the bug.',
          lines: [
            'import re',
            'pin = input()',
            r`if re.search(r"\d{4}", pin):`,
            '    print("valid")',
            'else:',
            '    print("invalid")',
          ],
          language: 'python',
          answer: 2,
          explain: 'Without anchors, the pattern finds four digits inside the longer number. It needs `^\\d{4}$` to check the whole input.',
        },
        {
          kind: 'concept',
          title: 'Anchors in an if',
          body: 'With both anchors, the pattern has to cover the whole text. One extra character before or after, and `re.search` gives `None`.\n\n`None` counts as false in an `if`, so the check reads naturally.',
          code: r`import re

for text in ["90210", "902101", "zip 90210"]:
    if re.search(r"^\d{5}$", text):
        print(text, "ok")
    else:
        print(text, "no")`,
          language: 'python',
          output: r`90210 ok
902101 no
zip 90210 no`,
        },
        {
          kind: 'write',
          prompt: 'A product code is two capital letters, a dash, then three digits, like `AB-123`, and nothing else. Read a code with `input()` and print `valid` or `invalid`. The starter is too generous: fix its pattern.',
          language: 'python',
          starter: r`import re

code = input()
if re.search(r"[A-Z]{2}-\d{3}", code):
    print("valid")
else:
    print("invalid")
`,
          tests: [
            { stdin: ['AB-123'], expected: 'valid' },
            { stdin: ['AB-1234'], expected: 'invalid' },
            { stdin: ['xAB-123'], expected: 'invalid' },
          ],
          hint: 'Put `^` at the start of the pattern and `$` at the end.',
          solution: r`import re

code = input()
if re.search(r"^[A-Z]{2}-\d{3}$", code):
    print("valid")
else:
    print("invalid")
`,
          explain: 'The anchors turn "contains a code" into "is a code". `re.fullmatch` does the same job without them.',
        },
        {
          kind: 'concept',
          title: 'Groups, either/or, replace',
          body: 'Round brackets make a **group**: a part of the match you can pick out with `m.group(1)`, `m.group(2)` and so on.\n\nA bar means **either/or**: `cat|dog` matches either word.\n\n`re.sub(pattern, new, text)` replaces every match with new text.',
          code: r`import re

m = re.search(r"(\d+)-(\d+)", "pages 10-25")
print(m.group(1))
print(m.group(2))`,
          language: 'python',
          output: r`10
25`,
        },
        {
          kind: 'blank',
          prompt: 'Pull the hour out of the time.',
          code: r`m = re.___(r"(\d+):(\d+)", "Starts at 9:45")
print(m.___(1))`,
          language: 'python',
          bank: ['search', 'group', 'sub', 'find'],
          answers: ['search', 'group'],
          explain: '`re.search` finds the match, and `group(1)` is whatever the first pair of brackets caught: `9`.',
        },
        {
          kind: 'concept',
          title: 'Replacing with re.sub',
          body: '`re.sub(pattern, new, text)` gives back a copy of the text with every match swapped for `new`.\n\nHere each run of spaces, however long, becomes a single space.',
          code: r`import re

print(re.sub(r"\s+", " ", "too    many   spaces"))`,
          language: 'python',
          output: 'too many spaces',
        },
        {
          kind: 'type',
          prompt: 'What does this print? Type it exactly.',
          code: r`print(re.sub(r"\d", "#", "Card 4521"))`,
          language: 'python',
          accept: ['Card ####'],
          explain: '`re.sub` swaps every match for the new text. Each of the four digits matches `\\d` separately, so each becomes one `#`.',
        },
        {
          kind: 'concept',
          title: 'Groups that catch a phrase',
          body: '`.+` means one or more of any character, so a group can catch a whole phrase, spaces included.\n\nPlain characters around the groups, like the `=` here, must be in the text, but they are not handed back.',
          code: r`import re

m = re.search(r"(\w+)=(.+)", "colour=dark blue")
print(m.group(1))
print(m.group(2))`,
          language: 'python',
          output: r`colour
dark blue`,
        },
        {
          kind: 'write',
          prompt: 'Read a line like `Ana Silva <ana@example.com>`. Use two groups to print the name on one line and the email on the next.',
          language: 'python',
          starter: r`import re

text = input()
m = re.search(r".+ <.+>", text)
print(m.group(0))
`,
          tests: [
            { stdin: ['Ana Silva <ana@example.com>'], expected: 'Ana Silva\nana@example.com' },
            { stdin: ['Ben <ben@example.org>'], expected: 'Ben\nben@example.org' },
          ],
          hint: 'Wrap each part you want in round brackets: r"(.+) <(.+)>". Then print m.group(1) and m.group(2).',
          solution: r`import re

text = input()
m = re.search(r"(.+) <(.+)>", text)
print(m.group(1))
print(m.group(2))
`,
          explain: 'The brackets do not change what matches. They only mark the parts you want handed back.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the regex symbol for each job.',
          cells: ['^', '$', '|', '( )', '+'],
          steps: [
            { ask: 'Which means "the text must start here"?', answer: 0 },
            { ask: 'Which lets you pick out one part of a match?', answer: 3 },
            { ask: 'Which means "either this or that"?', answer: 2 },
            { ask: 'Which means "one or more of the thing before"?', answer: 4 },
          ],
          explain: 'Anchors pin the position, groups capture parts, the bar offers a choice, and quantifiers count.',
        },
        {
          kind: 'choice',
          prompt: 'When is a regex the WRONG tool?',
          options: [
            'Finding every phone number in a block of text',
            'Checking that a code is two letters and three digits',
            'Reading the data out of a JSON or HTML document',
            'Replacing every run of spaces with one space',
          ],
          answer: 2,
          explain: 'Nested formats need a real parser, like `json.loads`. And for a simple check, `in` or `startswith` is clearer than any pattern.',
        },
      ],
    },
    {
      id: 'u25-dates',
      title: 'Dates and times',
      exercises: [
        {
          kind: 'concept',
          title: 'Dates are not strings',
          body: 'Keep dates as `datetime` objects, not text. Then Python can compare them and do sums.\n\n`strptime` **parses**: text in, datetime out. `strftime` **formats**: datetime in, text out. Both use a format made of codes like `%Y` (year), `%m` (month), `%d` (day), `%H` (hour) and `%M` (minute).',
          code: r`from datetime import datetime

when = datetime.strptime("2024-03-15 09:30", "%Y-%m-%d %H:%M")
print(when.strftime("%d/%m/%Y"))`,
          language: 'python',
          output: '15/03/2024',
        },
        {
          kind: 'match',
          prompt: 'Match each format code to its meaning.',
          pairs: [
            ['%Y', 'Year with four digits'],
            ['%m', 'Month as a number'],
            ['%d', 'Day of the month'],
            ['%H', 'Hour, 00 to 23'],
            ['%M', 'Minute'],
          ],
          explain: 'Capital letters matter. Lower-case `%m` is the month, and capital `%M` is the minute.',
        },
        {
          kind: 'spot',
          prompt: 'This crashes with a `ValueError`. Tap the line with the bug.',
          lines: [
            'from datetime import datetime',
            'text = "2024-03-15 09:30"',
            'when = datetime.strptime(text, "%Y-%M-%d %H:%m")',
            'print(when.year)',
          ],
          language: 'python',
          answer: 2,
          explain: '`%M` and `%m` are swapped, so the month code lands on the minutes, `30`. There is no month 30, so the text does not fit the format.',
        },
        {
          kind: 'write',
          prompt: 'Read a date written day first, like `15/03/2024`, with `input()`. Print it year first, like `2024-03-15`.',
          language: 'python',
          starter: r`from datetime import datetime

text = input()
when = datetime.strptime(text, "%Y-%m-%d")
print(when)
`,
          tests: [
            { stdin: ['15/03/2024'], expected: '2024-03-15' },
            { stdin: ['01/12/2023'], expected: '2023-12-01' },
          ],
          hint: 'Parse with "%d/%m/%Y", then print when.strftime("%Y-%m-%d").',
          solution: r`from datetime import datetime

text = input()
when = datetime.strptime(text, "%d/%m/%Y")
print(when.strftime("%Y-%m-%d"))
`,
          explain: 'Parse with the format the text has, then format with the one you want. Year-first dates also sort correctly as plain text.',
        },
        {
          kind: 'concept',
          title: 'Sums with timedelta',
          body: 'Subtract one datetime from another and you get a `timedelta`: a length of time. Its `.days` tells you how many days.\n\nYou can also add a timedelta to a date to move forwards or backwards. Python handles month lengths and leap years for you.',
          code: r`from datetime import datetime, timedelta

start = datetime(2024, 1, 30)
print(start + timedelta(days=3))`,
          language: 'python',
          output: '2024-02-02 00:00:00',
        },
        {
          kind: 'type',
          prompt: '2024 is a leap year, so February has 29 days. What does this print? Type the number.',
          code: r`from datetime import datetime

gap = datetime(2024, 3, 1) - datetime(2024, 2, 27)
print(gap.days)`,
          language: 'python',
          accept: ['3', 'three'],
          explain: 'Feb 27 to 28, 28 to 29, 29 to Mar 1: three days. Doing this by hand is how off-by-one bugs happen, so let `datetime` do it.',
        },
        {
          kind: 'write',
          prompt: 'Read a start date and an end date, one per line, each like `2024-01-01`. Print the number of days between them. Then print the date 30 days after the start, in the same format.',
          language: 'python',
          starter: r`from datetime import datetime, timedelta

start = datetime.strptime(input(), "%Y-%m-%d")
end = datetime.strptime(input(), "%Y-%m-%d")
# Print the gap in days, then the date 30 days after start.
`,
          tests: [
            { stdin: ['2024-01-01', '2024-03-01'], expected: '60\n2024-01-31' },
            { stdin: ['2023-12-25', '2024-01-01'], expected: '7\n2024-01-24' },
          ],
          hint: '`(end - start).days` is the gap. `start + timedelta(days=30)` is the later date; format it with strftime("%Y-%m-%d").',
          solution: r`from datetime import datetime, timedelta

start = datetime.strptime(input(), "%Y-%m-%d")
end = datetime.strptime(input(), "%Y-%m-%d")
print((end - start).days)
later = start + timedelta(days=30)
print(later.strftime("%Y-%m-%d"))
`,
          explain: 'The second test crosses a year boundary and still just works. That is the point of using real date objects.',
        },
        {
          kind: 'concept',
          title: 'Time zones and UTC',
          body: 'One moment has many clock readings: 13:00 in one city is 08:00 in another. **Daylight saving** makes it worse: once a year a local hour is skipped, and once it happens twice.\n\nThe habit that avoids most bugs: store every time in **UTC**, the world\'s reference clock, and convert to local time only when showing it.',
          code: r`from datetime import datetime, timezone, timedelta

utc = datetime(2024, 3, 15, 13, 0, tzinfo=timezone.utc)
local = utc.astimezone(timezone(timedelta(hours=-5)))
print(local.strftime("%H:%M"))`,
          language: 'python',
          output: '08:00',
        },
        {
          kind: 'steps',
          prompt: 'A meeting is stored as 13:00 UTC. Tap what each clock shows at that moment.',
          cells: ['08:00', '13:00', '18:00', '23:00'],
          steps: [
            { ask: 'A user whose zone is UTC-5 (five hours behind).', answer: 0 },
            { ask: 'A server whose clock is set to UTC.', answer: 1 },
            { ask: 'A user whose zone is UTC+5 (five hours ahead).', answer: 2 },
          ],
          explain: 'It is one moment with three readings. Storing the UTC value means everyone converts from the same starting point.',
        },
        {
          kind: 'write',
          prompt: 'The first input line is a UTC time like `2024-03-15 22:30`. The second is an offset in whole hours, like `5` or `-5`. Print the local time for that offset in the same format.',
          language: 'python',
          starter: r`from datetime import datetime, timezone, timedelta

utc = datetime.strptime(input(), "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
hours = int(input())
# Convert utc to the zone that is "hours" away, then print it.
print(utc.strftime("%Y-%m-%d %H:%M"))
`,
          tests: [
            { stdin: ['2024-03-15 22:30', '5'], expected: '2024-03-16 03:30' },
            { stdin: ['2024-03-15 22:30', '-5'], expected: '2024-03-15 17:30' },
          ],
          hint: 'local = utc.astimezone(timezone(timedelta(hours=hours))), then print local.strftime(...).',
          solution: r`from datetime import datetime, timezone, timedelta

utc = datetime.strptime(input(), "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
hours = int(input())
local = utc.astimezone(timezone(timedelta(hours=hours)))
print(local.strftime("%Y-%m-%d %H:%M"))
`,
          explain: 'In the first test the local date is already the 16th. A time zone can change the day, not only the hour.',
        },
      ],
    },
    {
      id: 'u25-type-hints',
      title: 'Type hints',
      exercises: [
        {
          kind: 'concept',
          title: 'Labels for your values',
          body: 'A **type hint** says what kind of value a parameter takes and what a function returns.\n\nPython itself ignores hints when running. They are for people, for your editor, and for a **type checker**: a tool that reads your code *without running it* and reports values of the wrong kind.',
          code: r`def greet(name: str, times: int) -> str:
    return ("Hi " + name + "! ") * times`,
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Add the hints: `word` is text and `times` is a whole number.',
          code: 'def repeat(word: ___, times: ___) -> str:\n    return word * times',
          language: 'python',
          bank: ['str', 'int', 'float', 'list'],
          answers: ['str', 'int'],
          explain: 'The hint goes after a colon next to each parameter. The arrow before the final colon says what comes back.',
        },
        {
          kind: 'choice',
          prompt: 'What happens when you run this?',
          code: r`def double(n: int) -> int:
    return n * 2

print(double("ha"))`,
          language: 'python',
          options: [
            'A TypeError, because "ha" is not an int',
            'It prints haha',
            'It prints 0',
            'Python refuses to start the program',
          ],
          answer: 1,
          explain: 'Python does not enforce hints at run time, and a string times 2 is legal. A type checker would have flagged the call before you ran it.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line a type checker would complain about.',
          lines: [
            'def total(prices: list[float]) -> float:',
            '    return sum(prices)',
            'total([1.5, 2.0])',
            'total("12.50")',
          ],
          language: 'python',
          answer: 3,
          explain: 'The function promises to take a list of floats, and `"12.50"` is a string. The checker spots the mismatch without running anything.',
        },
        {
          kind: 'concept',
          title: 'Collections and Optional',
          body: 'Hints can describe what is inside a collection: `list[str]` is a list of strings, and `dict[str, int]` maps strings to whole numbers.\n\n`Optional[str]` means "a string, or `None`". It warns every caller that there might be nothing there, so they must check first.',
          code: r`from typing import Optional

def find_email(name: str) -> Optional[str]:
    ...`,
          language: 'python',
        },
        {
          kind: 'match',
          prompt: 'Match each hint to what it describes.',
          pairs: [
            ['list[str]', 'A list of pieces of text'],
            ['dict[str, int]', 'Names mapped to whole numbers'],
            ['Optional[int]', 'A whole number, or None'],
            ['-> None', 'The function returns nothing'],
          ],
          explain: 'Square brackets say what is inside. `Optional` adds "or None" to any type.',
        },
        {
          kind: 'write',
          prompt: 'Give `average` its hints and make it work: `nums` is a `list[float]` and it returns a `float`, the mean of the list. The last line checks your hints and must print `True`.',
          language: 'python',
          starter: r`def average(nums):
    return 0.0

print(average([2.0, 4.0, 9.0]))
print(average.__annotations__ == {"nums": list[float], "return": float})
`,
          tests: [{ expected: '5.0\nTrue' }],
          hint: 'def average(nums: list[float]) -> float: and return sum(nums) / len(nums).',
          solution: r`def average(nums: list[float]) -> float:
    return sum(nums) / len(nums)

print(average([2.0, 4.0, 9.0]))
print(average.__annotations__ == {"nums": list[float], "return": float})
`,
          explain: 'Python stores hints on the function in `__annotations__` and otherwise ignores them. Tools read them from there.',
        },
        {
          kind: 'concept',
          title: 'Keeping an Optional promise',
          body: 'The return hint `Optional[str]` is a promise: a string, or `None`.\n\nThe body keeps it by dealing with the empty case first and returning `None`. Only then does it reach for an item, which is now safe.',
          code: r`from typing import Optional

def last_item(items: list[str]) -> Optional[str]:
    if not items:
        return None
    return items[-1]

print(last_item(["a", "b"]))
print(last_item([]))`,
          language: 'python',
          output: r`b
None`,
        },
        {
          kind: 'write',
          prompt: 'Fix `first_word`. Hint it as taking a `str` and returning `Optional[str]`. Return the first word of the text, or `None` when the text has no words. The last line checks your hints and must print `True`.',
          language: 'python',
          starter: r`from typing import Optional

def first_word(text):
    return text.split()[0]

for text in ["hello there", "   "]:
    word = first_word(text)
    if word is None:
        print("nothing")
    else:
        print(word.upper())
print(first_word.__annotations__ == {"text": str, "return": Optional[str]})
`,
          tests: [{ expected: 'HELLO\nnothing\nTrue' }],
          hint: 'words = text.split(); if the list is empty return None, otherwise return words[0]. The signature is (text: str) -> Optional[str].',
          solution: r`from typing import Optional

def first_word(text: str) -> Optional[str]:
    words = text.split()
    if not words:
        return None
    return words[0]

for text in ["hello there", "   "]:
    word = first_word(text)
    if word is None:
        print("nothing")
    else:
        print(word.upper())
print(first_word.__annotations__ == {"text": str, "return": Optional[str]})
`,
          explain: 'Because the return type is `Optional`, a checker insists the caller handles `None` before calling `.upper()`. The loop does exactly that.',
        },
        {
          kind: 'type',
          prompt: 'A checker flags this call. What type does `input()` return? Type its Python name.',
          code: r`def next_year(age: int) -> int:
    return age + 1

next_year(input())`,
          language: 'python',
          accept: ['str', 'string'],
          explain: '`input()` always gives a `str`. The checker sees a str going where an int is promised and tells you to convert it with `int()`.',
        },
        {
          kind: 'steps',
          prompt: 'Your code passes a number to a function hinted as taking a `str`. Tap the right box for each question.',
          cells: ['In the editor, before running', 'When that line runs', 'Never'],
          steps: [
            { ask: 'With a type checker, when do you learn about the mistake?', answer: 0 },
            { ask: 'With no checker, when is the earliest it can show up?', answer: 1 },
            { ask: 'When does Python itself stop the program just because a hint was broken?', answer: 2 },
          ],
          explain: 'A checker moves the discovery to before the program runs. Python on its own never enforces hints; it only fails if the value then misbehaves.',
        },
      ],
    },
    {
      id: 'u25-formats',
      title: 'Paths, CSV, JSON and encodings',
      exercises: [
        {
          kind: 'concept',
          title: 'Paths and extensions',
          body: 'A **path** says where a file lives: folders, then the file name. The **extension** is the ending after the last dot, and hints at the format.\n\nDo not cut paths up with string tricks. Python\'s `Path` knows the parts: `.name`, `.stem` (name without extension) and `.suffix` (the extension).',
          code: r`from pathlib import Path

p = Path("reports/2024/sales.csv")
print(p.name)
print(p.stem)
print(p.suffix)`,
          language: 'python',
          output: r`sales.csv
sales
.csv`,
        },
        {
          kind: 'type',
          prompt: 'What does this print? Type it exactly.',
          code: r`from pathlib import Path

print(Path("photos/cat.final.png").suffix)`,
          language: 'python',
          accept: ['.png'],
          explain: 'The suffix is only the part after the *last* dot, and it includes the dot.',
        },
        {
          kind: 'write',
          prompt: 'Read a path with `input()`. Print three lines: the file name, the name without its extension, and the extension in lower case.',
          language: 'python',
          starter: r`from pathlib import Path

p = Path(input())
print(p)
`,
          tests: [
            { stdin: ['docs/Report.PDF'], expected: 'Report.PDF\nReport\n.pdf' },
            { stdin: ['notes.final.TXT'], expected: 'notes.final.TXT\nnotes.final\n.txt' },
          ],
          hint: 'Print p.name, then p.stem, then p.suffix.lower().',
          solution: r`from pathlib import Path

p = Path(input())
print(p.name)
print(p.stem)
print(p.suffix.lower())
`,
          explain: 'Extensions arrive in any mix of capitals, so lower-case them before comparing with `".pdf"`.',
        },
        {
          kind: 'concept',
          title: 'CSV or JSON?',
          body: '**CSV** is a table as text: one row per line, commas between columns. Simple, opens in any spreadsheet, but every value is text and it cannot nest.\n\n**JSON** can nest lists and objects and knows numbers from strings. It suits API data and settings.\n\nUse Python\'s `csv` and `json` modules. Do not split the text by hand.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the format that fits each job best.',
          cells: ['CSV', 'JSON', 'Plain text'],
          steps: [
            { ask: 'Exporting 10,000 orders for a colleague to open in a spreadsheet.', answer: 0 },
            { ask: 'An API response for a user who has a list of addresses.', answer: 1 },
            { ask: 'A log that a person reads from top to bottom.', answer: 2 },
            { ask: 'A settings file with groups of options inside other groups.', answer: 1 },
          ],
          explain: 'Flat rows suit CSV. Anything nested suits JSON. Text meant only for human eyes can stay plain.',
        },
        {
          kind: 'spot',
          prompt: 'This CSV has columns name, city and age. Code that splits each line on commas goes wrong on one row. Tap it.',
          lines: ['name,city,age', 'Ana,Lima,31', 'Ben,Paris, France,28', 'Cy,Oslo,40'],
          answer: 2,
          explain: 'The comma inside the city makes four pieces instead of three. Proper CSV wraps such a value in quotes, and the `csv` module understands them.',
        },
        {
          kind: 'concept',
          title: 'Reading CSV the safe way',
          body: '`csv.DictReader` takes the lines, uses the first one as the header, and gives one dict per row. `list(...)` collects them.\n\nQuotes around a value keep its comma inside, so the pet\'s full name arrives in one piece.',
          code: r`import csv

lines = ["pet,owner", '"Rex, the dog",Ana']
rows = list(csv.DictReader(lines))
print(rows)
print(rows[0]["pet"])`,
          language: 'python',
          output: r`[{'pet': 'Rex, the dog', 'owner': 'Ana'}]
Rex, the dog`,
        },
        {
          kind: 'write',
          prompt: 'Turn CSV into JSON. Three lines arrive: a header, then two rows. A value may be in quotes and contain a comma. Print a JSON list with one object per row. The starter splits on commas by hand and gets it wrong: use `csv.DictReader` instead.',
          language: 'python',
          starter: r`import csv
import json

lines = [input(), input(), input()]
header = lines[0].split(",")
rows = [dict(zip(header, line.split(","))) for line in lines[1:]]
print(json.dumps(rows))
`,
          tests: [
            {
              stdin: ['name,city', 'Ana,Lima', '"Ben","Paris, France"'],
              expected: '[{"name": "Ana", "city": "Lima"}, {"name": "Ben", "city": "Paris, France"}]',
            },
            {
              stdin: ['item,note', '"Mug, large",new', 'Cap,sale'],
              expected: '[{"item": "Mug, large", "note": "new"}, {"item": "Cap", "note": "sale"}]',
            },
          ],
          hint: '`rows = list(csv.DictReader(lines))` reads the header from the first line and gives one dict per row.',
          solution: r`import csv
import json

lines = [input(), input(), input()]
rows = list(csv.DictReader(lines))
print(json.dumps(rows))
`,
          explain: 'The `csv` module handles quotes and commas inside values. Two lines of library code beat a page of home-made splitting.',
        },
        {
          kind: 'concept',
          title: 'Encodings and UTF-8',
          body: 'Files hold bytes, not letters. An **encoding** is the rule that turns characters into bytes and back.\n\n**UTF-8** is the standard one. It covers every language and emoji. Plain English letters take 1 byte each; others take 2 to 4.\n\nRead a file with the wrong encoding and you get garbage like `cafÃ©`. So say it out loud: `open(path, encoding="utf-8")`.',
        },
        {
          kind: 'type',
          prompt: 'In UTF-8, `c`, `a` and `f` take 1 byte each and `é` takes 2. What does this print? Type the number.',
          code: r`print(len("café".encode("utf-8")))`,
          language: 'python',
          accept: ['5', 'five'],
          explain: 'Four characters, five bytes. Characters and bytes are different counts, which matters for size limits.',
        },
        {
          kind: 'choice',
          prompt: 'A customer\'s name shows up as `JosÃ©` instead of `José`. What most likely happened?',
          options: [
            'The customer typed their name wrong',
            'The database ran out of space',
            'The file was too large to read fully',
            'UTF-8 bytes were read using a different encoding',
          ],
          answer: 3,
          explain: 'The two bytes of `é` were each shown as a separate character. The data is fine; it only needs reading as UTF-8.',
        },
      ],
    },
  ],
}
