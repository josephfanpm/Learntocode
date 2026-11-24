import type { Unit } from '../types'

const py = (...lines: string[]) => lines.join('\n')

export const u6: Unit = {
  id: 'u6',
  week: 6,
  title: 'Python power tools',
  summary: 'Dictionaries, errors and shortcuts',
  lessons: [
    {
      id: 'u6-dicts',
      title: 'Dictionaries in depth',
      exercises: [
        {
          kind: 'concept',
          title: 'Keys and values',
          body: 'A **dictionary** stores pairs. Each **key** points to a **value**, the way a word in a real dictionary points to its meaning.\n\nLook up a value by putting its key in square brackets.',
          code: `ages = {"Mia": 34, "Leo": 29}
print(ages["Leo"])   # 29`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `stock = {"apples": 5, "pears": 2}
stock["pears"] = 7
print(stock["pears"])`,
          language: 'python',
          options: ['7', '2', '9', 'An error'],
          answer: 0,
          explain: 'Assigning to a key that already exists replaces its old value, so pears goes from 2 to 7.',
        },
        {
          kind: 'choice',
          prompt: 'What happens here?',
          code: `ages = {"Mia": 34, "Leo": 29}
print(ages["Zoe"])`,
          language: 'python',
          options: ['It prints 0', 'It prints None', 'It crashes with a KeyError', 'It prints Zoe'],
          answer: 2,
          explain: 'Square brackets demand that the key exists. "Zoe" is not a key, so Python stops with a KeyError.',
        },
        {
          kind: 'concept',
          title: 'Safer lookups with get',
          body: '`.get(key, default)` looks up a key but never crashes. If the key is missing, you get the **default** (a fallback value you choose) instead.',
          code: `ages = {"Mia": 34}
print(ages.get("Mia", 0))   # 34
print(ages.get("Zoe", 0))   # 0`,
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Print the price of the item the user types, or "unknown" if it is not on the menu.',
          code: `prices = {"tea": 3, "cake": 5}
item = input()
print(prices.___(item, "unknown"))`,
          language: 'python',
          bank: ['get', 'find', 'index', 'key'],
          answers: ['get'],
          explain: '`.get` returns the second argument when the key is missing, so a typo prints "unknown" instead of crashing.',
        },
        {
          kind: 'concept',
          title: 'Looping over pairs',
          body: '`.keys()` gives the keys, `.values()` gives the values, and `.items()` gives both at once as pairs.\n\nWith `.items()`, use two loop variables to unpack each pair.',
          code: `scores = {"Ana": 9, "Ben": 7}
for name, score in scores.items():
    print(name, score)`,
          language: 'python',
          output: 'Ana 9\nBen 7',
        },
        {
          kind: 'match',
          prompt: 'Match each dictionary tool to what it gives you.',
          pairs: [
            ['.keys()', 'Just the keys'],
            ['.values()', 'Just the values'],
            ['.items()', 'Key and value pairs'],
            ['.get(k, d)', 'The value for k, or d if k is missing'],
          ],
          explain: 'Pick the one that hands you exactly what your loop or lookup needs.',
        },
        {
          kind: 'concept',
          title: 'Counting with a dictionary',
          body: 'Assigning to a key that is not there yet adds it. That makes a dictionary a handy tally sheet.\n\n`votes.get(pet, 0)` is the count so far, or 0 the first time a pet shows up. Add 1 and store it back.',
          code: `votes = {}
for pet in ["cat", "dog", "cat"]:
    votes[pet] = votes.get(pet, 0) + 1
print(votes)`,
          language: 'python',
          output: "{'cat': 2, 'dog': 1}",
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order to count how often each color appears, then print the count for red.',
          lines: [
            'counts = {}',
            'for color in ["red", "blue", "red"]:',
            '    counts[color] = counts.get(color, 0) + 1',
            'print(counts["red"])',
          ],
          language: 'python',
          explain: 'Start with an empty dictionary. For each color, `.get(color, 0)` gives its count so far (0 the first time) and we add 1.',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `counts = {}
for w in "a b a c a".split():
    counts[w] = counts.get(w, 0) + 1
print(counts["a"])`,
          language: 'python',
          options: ['3', '1', '5', 'KeyError'],
          answer: 0,
          explain: '"a" appears three times, and each time its count goes up by 1.',
        },
        {
          kind: 'write',
          prompt: 'Read one line of words. Count each word, then print each word and its count separated by a space, one per line, in the order each word first appears.',
          language: 'python',
          starter: `words = input().split()
counts = {}
# count each word, then print each word and its count
`,
          tests: [
            { stdin: ['cat dog cat'], expected: 'cat 2\ndog 1' },
            { stdin: ['hi hi hi'], expected: 'hi 3' },
            { stdin: ['red blue green blue'], expected: 'red 1\nblue 2\ngreen 1' },
          ],
          hint: 'Use `counts[w] = counts.get(w, 0) + 1` in one loop, then a second loop over `counts.items()` to print.',
          solution: `words = input().split()
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
for word, n in counts.items():
    print(word, n)
`,
          explain: 'Dictionaries remember the order keys were added, so looping over `.items()` prints words in the order they first showed up.',
        },
      ],
    },
    {
      id: 'u6-fstrings',
      title: 'Formatting with f-strings',
      exercises: [
        {
          kind: 'concept',
          title: 'f-strings',
          body: 'Put an `f` right before the quotes and you can drop values straight into text with curly braces `{}`.\n\nPython swaps each `{...}` for its value. This is called an **f-string** (f for format).',
          code: `name = "Sam"
age = 30
print(f"{name} is {age}")   # Sam is 30`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `item = "tea"
qty = 3
print(f"{qty} cups of {item}")`,
          language: 'python',
          options: ['3 cups of tea', '{qty} cups of {item}', 'qty cups of item', 'An error'],
          answer: 0,
          explain: 'The `f` tells Python to replace each `{...}` with the value of what is inside.',
        },
        {
          kind: 'choice',
          prompt: 'This code forgot something. What does it print?',
          code: `name = "Sam"
print("Hi {name}")`,
          language: 'python',
          options: ['Hi {name}', 'Hi Sam', 'Hi name', 'An error'],
          answer: 0,
          explain: 'Without the `f` in front, the braces are just ordinary characters, so they print as they are.',
        },
        {
          kind: 'blank',
          prompt: 'Read a city and print a welcome like `Welcome to Lima!`.',
          code: `city = input()
print(___"Welcome to {___}!")`,
          language: 'python',
          bank: ['f', 'r', 'city', '"city"', 'name'],
          answers: ['f', 'city'],
          explain: 'The `f` turns on swapping, and the braces hold the variable name itself, without quotes.',
        },
        {
          kind: 'concept',
          title: 'Math and decimals in braces',
          body: 'Braces can hold any expression, like `{a + b}`.\n\nAdd `:.2f` after a value to show exactly 2 decimal places. Python rounds for you. Use `:.1f` for 1 place, and so on.',
          code: `price = 2.5
print(f"Total: {price * 3:.2f}")   # Total: 7.50`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `x = 3.14159
print(f"{x:.1f}")`,
          language: 'python',
          options: ['3.1', '3.14', '3', '3.1f'],
          answer: 0,
          explain: '`:.1f` means one digit after the decimal point, so 3.14159 rounds to 3.1.',
        },
        {
          kind: 'match',
          prompt: 'Match each f-string to what it shows.',
          pairs: [
            ['f"{5 + 2}"', '7'],
            ['f"{9 / 2}"', '4.5'],
            ['f"{1 / 3:.2f}"', '0.33'],
            ['f"{7:.1f}"', '7.0'],
          ],
          explain: 'Python works out the expression first, then `:.Nf` (if present) decides how many decimal places to show.',
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order: read an item, its price and a quantity, then print a line like `3 x tea = 7.50`.',
          lines: [
            'item = input()',
            'price = float(input())',
            'qty = int(input())',
            'total = price * qty',
            'print(f"{qty} x {item} = {total:.2f}")',
          ],
          language: 'python',
          explain: 'Read the inputs in the order they arrive, work out the total, then format it with 2 decimal places.',
        },
        {
          kind: 'write',
          prompt: 'Read a price (a decimal number) and then a quantity (a whole number). Print `Total: ` followed by price times quantity with exactly 2 decimal places, like `Total: 7.50`.',
          language: 'python',
          starter: `price = float(input())
qty = int(input())
# print the total with 2 decimal places
`,
          tests: [
            { stdin: ['2.5', '3'], expected: 'Total: 7.50' },
            { stdin: ['1.2', '4'], expected: 'Total: 4.80' },
            { stdin: ['10', '2'], expected: 'Total: 20.00' },
          ],
          hint: 'Inside the braces, put the math and then `:.2f`.',
          solution: `price = float(input())
qty = int(input())
print(f"Total: {price * qty:.2f}")
`,
          explain: '`:.2f` always shows two decimal places, which is how money is usually written.',
        },
      ],
    },
    {
      id: 'u6-errors',
      title: 'When things go wrong',
      exercises: [
        {
          kind: 'concept',
          title: 'Reading a traceback',
          body: 'When a program crashes, Python prints a **traceback**: a report of what went wrong.\n\nRead it from the bottom. The last line names the **error type** and explains it. The lines above show where it happened.',
          code: `Traceback (most recent call last):
  File "main.py", line 2, in <module>
    age = int(answer)
ValueError: invalid literal for int() with base 10: 'ten'`,
        },
        {
          kind: 'choice',
          prompt: 'In that traceback, which line of the program crashed?',
          options: ['Line 2', 'Line 1', 'Line 10', 'The last line of the file'],
          answer: 0,
          explain: 'The traceback says `line 2` and even shows the code on that line: `age = int(answer)`.',
        },
        {
          kind: 'match',
          prompt: 'Match each error type to code that causes it.',
          pairs: [
            ['ValueError', 'int("ten")'],
            ['KeyError', 'A dictionary lookup with a missing key'],
            ['IndexError', 'nums[5] when nums has 3 items'],
            ['ZeroDivisionError', '10 / 0'],
            ['NameError', 'Using a variable you never created'],
          ],
          explain: 'The error name is a strong clue. ValueError means the right type but a bad value, like text that is not a number.',
        },
        {
          kind: 'choice',
          prompt: 'Which error does this raise?',
          code: `colors = ["red", "green"]
print(colors[2])`,
          language: 'python',
          options: ['IndexError', 'KeyError', 'ValueError', 'No error, it prints green'],
          answer: 0,
          explain: 'Positions start at 0, so a 2-item list only has positions 0 and 1. Position 2 is out of range.',
        },
        {
          kind: 'concept',
          title: 'try and except',
          body: 'Put risky code under `try:`. If it raises an error, Python jumps to the matching `except` block instead of crashing.\n\nIf nothing goes wrong, the `except` block is skipped.',
          code: `try:
    n = int(input())
    print(n * 2)
except ValueError:
    print("Not a number")`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `try:
    x = int("12")
    print("ok")
except ValueError:
    print("bad")`,
          language: 'python',
          options: ['ok', 'bad', 'ok, then bad', '12'],
          answer: 0,
          explain: '"12" turns into a number fine, so no error happens and the `except` block never runs.',
        },
        {
          kind: 'blank',
          prompt: 'Catch the error that happens when the user types an item that is not on the menu.',
          code: `prices = {"tea": 3}
try:
    print(prices[input()])
except ___:
    print("Not on the menu")`,
          language: 'python',
          bank: ['KeyError', 'ValueError', 'IndexError', 'NameError'],
          answers: ['KeyError'],
          explain: 'A missing dictionary key raises KeyError, so that is the one to catch.',
        },
        {
          kind: 'concept',
          title: 'Loop until it works',
          body: '`while True:` loops forever. `break` is the way out: it leaves the loop at once.\n\nTogether they mean "keep going until something works". Put a `try` inside and the loop can ask again after every failure.',
          code: `n = 1
while True:
    n = n * 2
    if n > 20:
        break
print(n)`,
          language: 'python',
          output: '32',
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order: keep asking until the user types a whole number, then print that number plus 1.',
          lines: [
            'while True:',
            '    try:',
            '        n = int(input())',
            '        break',
            '    except ValueError:',
            '        print("Try again")',
            'print(n + 1)',
          ],
          language: 'python',
          explain: 'If `int` fails, we skip `break`, print a message and loop again. Once it works, `break` leaves the loop.',
        },
        {
          kind: 'write',
          prompt: "Read an age. If it is a whole number, print `Next year you'll be N` (N is the age plus 1). If it is not, print `Please type a number`.",
          language: 'python',
          starter: `age = int(input())
print(f"Next year you'll be {age + 1}")
`,
          tests: [
            { stdin: ['30'], expected: "Next year you'll be 31" },
            { stdin: ['thirty'], expected: 'Please type a number' },
            { stdin: ['7'], expected: "Next year you'll be 8" },
          ],
          hint: 'Wrap both lines in `try:` and add `except ValueError:` that prints the message.',
          solution: `try:
    age = int(input())
    print(f"Next year you'll be {age + 1}")
except ValueError:
    print("Please type a number")
`,
          explain: '`int("thirty")` raises ValueError. Catching it turns a crash into a friendly message.',
        },
      ],
    },
    {
      id: 'u6-comprehensions',
      title: 'Comprehensions and sets',
      exercises: [
        {
          kind: 'concept',
          title: 'List comprehensions',
          body: 'A **list comprehension** builds a new list in one line: `[expression for item in list]`.\n\nIt works out the expression for each item and collects the results in a new list.',
          code: `nums = [1, 2, 3]
doubled = [n * 2 for n in nums]
print(doubled)   # [2, 4, 6]`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `print([w.upper() for w in ["hi", "yo"]])`,
          language: 'python',
          options: ["['HI', 'YO']", "['hi', 'yo']", 'HI YO', "['HIYO']"],
          answer: 0,
          explain: 'The comprehension runs `w.upper()` on each word and puts the results in a new list.',
        },
        {
          kind: 'blank',
          prompt: 'Build the list `[1, 4, 9]`: each number from 1 to 3, squared.',
          code: `squares = [___ ___ n in range(1, 4)]`,
          language: 'python',
          bank: ['n * n', 'for', 'while', 'n + n'],
          answers: ['n * n', 'for'],
          explain: 'The expression comes first (`n * n`), then the `for` part says where the items come from.',
        },
        {
          kind: 'concept',
          title: 'Keep only some items',
          body: 'Add `if` at the end to filter: `[x for x in items if test]`.\n\nOnly items that pass the test make it into the new list.',
          code: `nums = [4, 7, 10, 3]
big = [n for n in nums if n > 5]
print(big)   # [7, 10]`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `words = ["apple", "kiwi", "banana"]
print([w for w in words if len(w) > 4])`,
          language: 'python',
          options: ["['apple', 'banana']", "['kiwi']", "['apple', 'kiwi', 'banana']", '[5, 6]'],
          answer: 0,
          explain: '"kiwi" has only 4 letters, so it fails `len(w) > 4`. The words themselves are kept, not their lengths.',
        },
        {
          kind: 'order',
          prompt: 'This loop does the same job as `[n for n in range(10) if n % 2 == 0]`. Put it in order.',
          lines: [
            'evens = []',
            'for n in range(10):',
            '    if n % 2 == 0:',
            '        evens.append(n)',
            'print(evens)',
          ],
          language: 'python',
          explain: 'A comprehension is a shortcut for exactly this pattern: empty list, loop, test, append.',
        },
        {
          kind: 'write',
          prompt: 'Read a line of whole numbers separated by spaces. Use a list comprehension to keep only the even ones, then print that list.',
          language: 'python',
          starter: `nums = [int(x) for x in input().split()]
# keep only the even numbers, then print the new list
`,
          tests: [
            { stdin: ['1 2 3 4'], expected: '[2, 4]' },
            { stdin: ['5 7'], expected: '[]' },
            { stdin: ['10 3 8'], expected: '[10, 8]' },
          ],
          hint: 'A number is even when `n % 2 == 0`. Put that after `if` in the comprehension.',
          solution: `nums = [int(x) for x in input().split()]
evens = [n for n in nums if n % 2 == 0]
print(evens)
`,
          explain: 'The starter already uses a comprehension to turn each piece of text into a number. The second one filters.',
        },
        {
          kind: 'concept',
          title: 'Sets',
          body: 'A **set** is a collection of unique items: duplicates disappear, and there is no order.\n\nMake one with `set(a_list)`. Add items with `.add()`. Checking `x in a_set` is very fast, even for huge sets.',
          code: `seen = set(["red", "blue", "red"])
print(len(seen))   # 2`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: `s = set([1, 2])
s.add(2)
s.add(3)
print(len(s))`,
          language: 'python',
          options: ['3', '4', '2', '5'],
          answer: 0,
          explain: 'Adding 2 again does nothing because it is already in the set. Only 3 is new, so the set holds 1, 2 and 3.',
        },
        {
          kind: 'write',
          prompt: 'Read a line of words. Print how many **different** words it has.',
          language: 'python',
          starter: `words = input().split()
# print how many different words there are
`,
          tests: [
            { stdin: ['the cat and the hat'], expected: '4' },
            { stdin: ['a a a'], expected: '1' },
            { stdin: ['one two three'], expected: '3' },
          ],
          hint: 'Turn the list into a set, then use `len`.',
          solution: `words = input().split()
print(len(set(words)))
`,
          explain: 'A set drops the repeats for you, so its length is the number of different words.',
        },
      ],
    },
    {
      id: 'u6-modules-csv',
      title: 'Modules and CSV files',
      exercises: [
        {
          kind: 'concept',
          title: 'Importing modules',
          body: 'A **module** is a file of ready-made code. `import math` loads one, and then you use its tools with a dot, like `math.sqrt(16)`.\n\nPython comes with hundreds of modules, called the **standard library**.',
          code: `import math
print(math.sqrt(16))   # 4.0
print(math.pi)         # 3.141592653589793`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: '`math.floor` rounds down to a whole number. What does this print?',
          code: `import math
print(math.floor(7.9))`,
          language: 'python',
          options: ['7', '8', '7.9', '8.0'],
          answer: 0,
          explain: 'Floor always rounds down, no matter how close to the next number you are.',
        },
        {
          kind: 'blank',
          prompt: '`from module import name` lets you use a tool without the `math.` part. Fill the gaps so this prints `3.0`.',
          code: `from ___ import ___
print(sqrt(9))`,
          language: 'python',
          bank: ['math', 'sqrt', 'string', 'import'],
          answers: ['math', 'sqrt'],
          explain: 'The module name goes after `from`, and the tool you want goes after `import`.',
        },
        {
          kind: 'match',
          prompt: 'The `string` module holds handy text constants. Match each one to what it shows.',
          pairs: [
            ['string.digits', '0123456789'],
            ['string.ascii_lowercase', 'abcdefghijklmnopqrstuvwxyz'],
            ['string.ascii_uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
          ],
          explain: 'These save you typing the alphabet by hand, for example to check whether a character is a letter: `c in string.ascii_lowercase`.',
        },
        {
          kind: 'concept',
          title: 'CSV files',
          body: 'A **CSV** file (comma-separated values) is a table saved as plain text: one row per line, with commas between the columns.\n\nThe first line usually holds the column names. It is called the **header**.',
          code: `name,city
Ana,Lima
Ben,Oslo`,
        },
        {
          kind: 'choice',
          prompt: 'In that CSV file, what is the header?',
          options: ['name,city', 'Ana,Lima', 'Ben,Oslo', 'There is no header'],
          answer: 0,
          explain: 'The header is the first line. It names the columns, so it is not a row of data.',
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order to save a small CSV file with a header, then print `Saved`.',
          lines: [
            'with open("pets.csv", "w") as f:',
            '    f.write("name,legs\\n")',
            '    f.write("cat,4\\n")',
            'print("Saved")',
          ],
          language: 'python',
          explain: 'Open the file for writing with `"w"`, write the header first, then the data. The `\\n` ends each line.',
        },
        {
          kind: 'concept',
          title: 'Reading with csv.DictReader',
          body: 'The `csv` module reads CSV files for you. `csv.DictReader` hands you each row as a dictionary, using the header for keys.\n\nEvery value arrives as text, so use `int()` for numbers.',
          code: `import csv
with open("pets.csv") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["legs"]))`,
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Print the name from every row of `pets.csv`.',
          code: `import csv
with open("pets.csv") as f:
    for row in csv.___(f):
        print(row["___"])`,
          language: 'python',
          bank: ['DictReader', 'reader', 'name', 'row'],
          answers: ['DictReader', 'name'],
          explain: '`DictReader` gives each row as a dictionary, so you look up a column by its header name.',
        },
        {
          kind: 'concept',
          title: 'Keeping only some rows',
          body: 'Each row from `DictReader` is a dictionary like the two below. To keep only some rows, turn the text into a number with `int()` and test it with `if`.',
          code: `rows = [{"name": "cat", "legs": "4"}, {"name": "bird", "legs": "2"}]
for row in rows:
    if int(row["legs"]) > 2:
        print(row["name"])`,
          language: 'python',
          output: 'cat',
        },
        {
          kind: 'write',
          prompt: 'The starter saves `scores.csv`. Read a minimum score from input, then print the name of every player with at least that many points, one per line, in file order.',
          language: 'python',
          starter: `import csv

with open("scores.csv", "w") as f:
    f.write("player,points\\n")
    f.write("Ana,12\\n")
    f.write("Ben,7\\n")
    f.write("Cleo,15\\n")

minimum = int(input())
# read scores.csv and print each player with points >= minimum
`,
          tests: [
            { stdin: ['10'], expected: 'Ana\nCleo' },
            { stdin: ['13'], expected: 'Cleo' },
            { stdin: ['0'], expected: 'Ana\nBen\nCleo' },
          ],
          hint: 'Open the file, loop over `csv.DictReader(f)`, and compare `int(row["points"])` with `minimum`.',
          solution: `import csv

with open("scores.csv", "w") as f:
    f.write("player,points\\n")
    f.write("Ana,12\\n")
    f.write("Ben,7\\n")
    f.write("Cleo,15\\n")

minimum = int(input())
with open("scores.csv") as f:
    for row in csv.DictReader(f):
        if int(row["points"]) >= minimum:
            print(row["player"])
`,
          explain: 'CSV values are text, so `int()` is needed before comparing. Comparing the text "7" with a number would crash.',
        },
      ],
    },
    {
      id: 'u6-classes',
      title: 'Classes and objects',
      exercises: [
        {
          kind: 'concept',
          title: 'Blueprints and objects',
          body: 'A **class** is a blueprint for your own kind of value. An **object** is one thing built from that blueprint.\n\n`__init__` runs each time you build an object. `self` means "this object", so `self.name = name` stores a piece of data inside it. Stored data like this is called an **attribute**.',
          code: py(
            'class Pet:',
            '    def __init__(self, name, sound):',
            '        self.name = name',
            '        self.sound = sound',
            '',
            'rex = Pet("Rex", "Woof")',
            'print(rex.name)   # Rex',
          ),
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'One class can build many objects, each with its own data. What does this print?',
          code: py(
            'class Pet:',
            '    def __init__(self, name, sound):',
            '        self.name = name',
            '        self.sound = sound',
            '',
            'a = Pet("Rex", "Woof")',
            'b = Pet("Tom", "Meow")',
            'print(a.sound, b.name)',
          ),
          language: 'python',
          options: ['Rex Tom', 'Woof Meow', 'Meow Rex', 'Woof Tom'],
          answer: 3,
          explain: '`a.sound` is the sound stored in the first pet, "Woof". `b.name` is the name stored in the second, "Tom".',
        },
        {
          kind: 'blank',
          prompt: 'Fill the gaps so the book stores its title and the last line prints `Maps`.',
          code: py(
            'class Book:',
            '    def __init__(self, title):',
            '        ___.title = title',
            '',
            'b = Book("Maps")',
            'print(b.___)',
          ),
          language: 'python',
          bank: ['self', 'title', 'Book', 'name'],
          answers: ['self', 'title'],
          explain: '`self.title` stores the value inside the object. Outside the class you read it back with the object\'s name and a dot: `b.title`.',
        },
        {
          kind: 'concept',
          title: 'Methods',
          body: 'A **method** is a function that lives inside a class. Its first parameter is always `self`, so it can reach the object\'s own data.\n\nYou call it with a dot, and Python fills in `self` for you: `rex.speak()`.',
          code: py(
            'class Pet:',
            '    def __init__(self, name, sound):',
            '        self.name = name',
            '        self.sound = sound',
            '',
            '    def speak(self):',
            '        print(self.name + " says " + self.sound)',
            '',
            'rex = Pet("Rex", "Woof")',
            'rex.speak()   # Rex says Woof',
          ),
          language: 'python',
        },
        {
          kind: 'type',
          prompt: 'What does this print?',
          code: py(
            'class Counter:',
            '    def __init__(self):',
            '        self.count = 0',
            '',
            '    def add(self):',
            '        self.count = self.count + 1',
            '',
            'c = Counter()',
            'c.add()',
            'c.add()',
            'print(c.count)',
          ),
          language: 'python',
          accept: ['2'],
          explain: 'The counter starts at 0. Each call to `add()` changes the data stored inside `c`, so after two calls it holds 2.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['class', 'a blueprint'],
            ['object', 'one thing built from a blueprint'],
            ['attribute', 'data stored inside an object'],
            ['method', 'a function that belongs to an object'],
            ['__init__', 'runs when an object is built'],
          ],
          explain: 'You have used these all along: `"hi".upper()` calls the method `upper` on a string object.',
        },
        {
          kind: 'spot',
          prompt: 'Calling `add()` on this counter crashes: the object has no `count`. Tap the line with the bug.',
          lines: [
            'class Counter:',
            '    def __init__(self):',
            '        count = 0',
            '    def add(self):',
            '        self.count = self.count + 1',
          ],
          language: 'python',
          answer: 2,
          explain: 'Without `self.`, `count` is an ordinary variable that vanishes when `__init__` ends. It must be `self.count = 0` to stay in the object.',
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order to make a class, build one dog and make it speak. Write `__init__` first, then `speak`.',
          lines: [
            'class Dog:',
            '    def __init__(self, name):',
            '        self.name = name',
            '    def speak(self):',
            '        print(self.name + " says woof")',
            'rex = Dog("Rex")',
            'rex.speak()',
          ],
          language: 'python',
          explain: 'The blueprint comes first, with `__init__` storing the name. Only then can you build a dog and call its method.',
        },
        {
          kind: 'concept',
          title: 'Methods that take a value',
          body: 'A method can have more parameters after `self`. You pass them in the brackets when you call it.\n\nHere `spend` uses `cost` to change the data stored in the object.',
          code: py(
            'class Wallet:',
            '    def __init__(self):',
            '        self.coins = 10',
            '',
            '    def spend(self, cost):',
            '        self.coins = self.coins - cost',
            '',
            'w = Wallet()',
            'w.spend(3)',
            'print(w.coins)',
          ),
          language: 'python',
          output: '7',
        },
        {
          kind: 'write',
          prompt: 'Finish the `deposit` method so it adds `amount` to the account\'s balance. The program reads two amounts, deposits both and prints the balance.',
          language: 'python',
          starter: py(
            'class Account:',
            '    def __init__(self):',
            '        self.balance = 0',
            '',
            '    def deposit(self, amount):',
            '        # Add amount to this account\'s balance',
            '        pass',
            '',
            'acc = Account()',
            'acc.deposit(int(input()))',
            'acc.deposit(int(input()))',
            'print(acc.balance)',
          ),
          tests: [
            { stdin: ['10', '5'], expected: '15' },
            { stdin: ['100', '250'], expected: '350' },
          ],
          hint: 'Inside the method: `self.balance = self.balance + amount`.',
          solution: py(
            'class Account:',
            '    def __init__(self):',
            '        self.balance = 0',
            '',
            '    def deposit(self, amount):',
            '        self.balance = self.balance + amount',
            '',
            'acc = Account()',
            'acc.deposit(int(input()))',
            'acc.deposit(int(input()))',
            'print(acc.balance)',
          ),
          explain: 'The balance lives inside the object, so it is remembered between the two calls. `self` is how the method reaches it.',
        },
        {
          kind: 'concept',
          title: 'Methods that return a value',
          body: 'A method can `return` an answer, just like any function. It works the answer out from the object\'s own data.\n\nThe call `s.perimeter()` then stands for that answer, so you can print it.',
          code: py(
            'class Square:',
            '    def __init__(self, side):',
            '        self.side = side',
            '',
            '    def perimeter(self):',
            '        return self.side * 4',
            '',
            's = Square(5)',
            'print(s.perimeter())',
          ),
          language: 'python',
          output: '20',
        },
        {
          kind: 'write',
          prompt: 'Write a class `Rectangle`. Its `__init__` takes `width` and `height` and stores them. Its method `area` returns width times height.',
          language: 'python',
          starter: py(
            'class Rectangle:',
            '    # Write __init__(self, width, height) and area(self)',
            '    pass',
            '',
            'w = int(input())',
            'h = int(input())',
            'r = Rectangle(w, h)',
            'print(r.area())',
          ),
          tests: [
            { stdin: ['3', '4'], expected: '12' },
            { stdin: ['10', '2'], expected: '20' },
          ],
          hint: 'In `__init__`, write `self.width = width` and `self.height = height`. In `area`, `return self.width * self.height`.',
          solution: py(
            'class Rectangle:',
            '    def __init__(self, width, height):',
            '        self.width = width',
            '        self.height = height',
            '',
            '    def area(self):',
            '        return self.width * self.height',
            '',
            'w = int(input())',
            'h = int(input())',
            'r = Rectangle(w, h)',
            'print(r.area())',
          ),
          explain: 'A class keeps data and the code that uses it in one place. Every rectangle you build knows how to work out its own area.',
        },
      ],
    },
    {
      id: 'u6-programs',
      title: 'Programs and libraries',
      exercises: [
        {
          kind: 'concept',
          title: 'Command-line arguments',
          body: 'Outside this app, you run a program by typing in a **terminal**: `python greet.py Ana`.\n\nThe extra words after the file name are **command-line arguments**. Python puts them in a list called `sys.argv`. Position 0 is the program\'s own name. Position 1 is the first extra word.',
          code: py('import sys', 'print("Hello, " + sys.argv[1])'),
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'You type `python greet.py Ana Ben`. What is `sys.argv[1]`?',
          options: ['python', 'greet.py', 'Ana', 'Ben'],
          answer: 2,
          explain: 'The list is `["greet.py", "Ana", "Ben"]`. The word `python` is not included, so position 1 is "Ana".',
        },
        {
          kind: 'type',
          prompt: 'You type `python add.py 3 4`. What does `len(sys.argv)` give?',
          accept: ['3', 'three'],
          explain: 'The list holds the program name plus two arguments: `["add.py", "3", "4"]`. That is 3 items.',
        },
        {
          kind: 'blank',
          prompt: 'This program needs exactly one name after the file name. Fill the gaps so it checks first. `sys.exit(1)` stops the program and signals that something went wrong.',
          code: py(
            'import sys',
            '',
            'if len(sys.argv) != ___:',
            '    print("Usage: python greet.py NAME")',
            '    sys.exit(1)',
            'print("Hello, " + sys.argv[___])',
          ),
          language: 'python',
          bank: ['2', '1', '0', '3'],
          answers: ['2', '1'],
          explain: 'The program name plus one argument makes 2 items. Checking the count first avoids an IndexError when the name is missing.',
        },
        {
          kind: 'spot',
          prompt: 'You type `python double.py 21`, hoping for 42, but it prints 2121. Tap the line with the bug.',
          lines: ['import sys', 'n = sys.argv[1]', 'print(n * 2)'],
          language: 'python',
          answer: 1,
          explain: 'Arguments always arrive as text, just like `input()`. Text times 2 repeats it. The line needs `int(sys.argv[1])`.',
        },
        {
          kind: 'concept',
          title: 'Your own library',
          body: 'A **library** is code written to be reused. You have imported Python\'s own, like `math` and `csv`.\n\nYou can make one too. Save some functions in a file such as `helpers.py`. Any program in the same folder can then `import helpers` and call them as `helpers.shout("hi")`.',
        },
        {
          kind: 'choice',
          prompt: 'Two files sit in one folder. You run main.py. What does it print?',
          code: py(
            '# helpers.py',
            'def shout(text):',
            '    return text.upper() + "!"',
            '',
            '# main.py',
            'import helpers',
            'print(helpers.shout("hi"))',
          ),
          language: 'python',
          options: ['hi!', 'HI!', 'helpers.shout("hi")', 'An error: shout is not defined'],
          answer: 1,
          explain: '`import helpers` loads the file helpers.py. Its function is then called with the module name and a dot, just like `math.floor`.',
        },
        {
          kind: 'concept',
          title: 'Reading text files',
          body: 'Programs often work on a file instead of typed input. `f.read()` gives the whole file as one string.\n\nFrom there, `.split()` cuts it into words and `.splitlines()` cuts it into lines.',
          code: py('with open("story.txt") as f:', '    text = f.read()', 'print(len(text.split()))   # how many words'),
          language: 'python',
        },
        {
          kind: 'concept',
          title: 'Lines and words',
          body: 'In a file\'s text, each line ends with a hidden `\\n`. `.splitlines()` cuts there, giving a list of lines. `.split()` cuts at every gap, giving a list of words.\n\n`len()` of either list is the count.',
          code: py('text = "Buy milk\\nCall Sam\\n"', 'print(text.splitlines())', 'print(len(text.split()))'),
          language: 'python',
          output: "['Buy milk', 'Call Sam']\n4",
        },
        {
          kind: 'write',
          prompt: 'The starter saves `story.txt`. Read the file, then print the number of lines like `Lines: 3` and the number of words like `Words: 9`.',
          language: 'python',
          starter: py(
            'with open("story.txt", "w") as f:',
            '    f.write("The fox ran\\nIt ran far\\nThen it slept\\n")',
            '',
            '# Read story.txt, then print Lines: and Words:',
          ),
          tests: [{ expected: 'Lines: 3\nWords: 9' }],
          hint: 'Read with `text = f.read()`. Then `len(text.splitlines())` counts lines and `len(text.split())` counts words.',
          solution: py(
            'with open("story.txt", "w") as f:',
            '    f.write("The fox ran\\nIt ran far\\nThen it slept\\n")',
            '',
            'with open("story.txt") as f:',
            '    text = f.read()',
            'print("Lines:", len(text.splitlines()))',
            'print("Words:", len(text.split()))',
          ),
          explain: '`open` with no mode reads the file. You have rebuilt a tiny version of a classic terminal tool that counts lines and words.',
        },
        {
          kind: 'concept',
          title: 'Searching inside text',
          body: '`"tea" in item` is True when the text `item` contains `tea` anywhere.\n\nTo know how many matches there were once the loop is over, count them as you go.',
          code: py(
            'menu = ["green tea", "black tea", "cocoa"]',
            'matches = 0',
            'for item in menu:',
            '    if "tea" in item:',
            '        print(item)',
            '        matches = matches + 1',
            'print("Matches:", matches)',
          ),
          language: 'python',
          output: 'green tea\nblack tea\nMatches: 2',
        },
        {
          kind: 'write',
          prompt: 'Build a tiny search tool. Read a word from input. Print every line of `story.txt` that contains that word. If no line contains it, print `No lines found`.',
          language: 'python',
          starter: py(
            'with open("story.txt", "w") as f:',
            '    f.write("The fox ran\\nIt ran far\\nThen it slept\\n")',
            '',
            'word = input()',
            'found = 0',
            'with open("story.txt") as f:',
            '    for line in f:',
            '        line = line.strip()',
            '        # If word is in line, print the line and add 1 to found',
            '# If nothing was found, print: No lines found',
          ),
          tests: [
            { stdin: ['ran'], expected: 'The fox ran\nIt ran far' },
            { stdin: ['slept'], expected: 'Then it slept' },
            { stdin: ['cat'], expected: 'No lines found' },
          ],
          hint: '`if word in line:` checks whether the text contains the word. After the loop, check `if found == 0:`.',
          solution: py(
            'with open("story.txt", "w") as f:',
            '    f.write("The fox ran\\nIt ran far\\nThen it slept\\n")',
            '',
            'word = input()',
            'found = 0',
            'with open("story.txt") as f:',
            '    for line in f:',
            '        line = line.strip()',
            '        if word in line:',
            '            print(line)',
            '            found = found + 1',
            'if found == 0:',
            '    print("No lines found")',
          ),
          explain: 'Counting matches lets you tell "nothing found" apart after the loop ends. A real version would take the word from `sys.argv` instead of `input()`.',
        },
      ],
    },
    {
      id: 'u6-lab-dna',
      title: 'Lab: DNA detective',
      exercises: [
        {
          kind: 'concept',
          title: 'Repeats in DNA',
          body: 'DNA can be written as a long string of the letters A, C, G and T. In some places a short pattern repeats back to back, like `AGATAGATAGAT`.\n\nThe length of the longest **run** of repeats differs from person to person. Count a few patterns and you get something like a fingerprint.',
        },
        {
          kind: 'type',
          prompt: 'How many times does AGAT repeat in the longest back-to-back run in `AGATAGATCCAGAT`?',
          accept: ['2', 'two'],
          explain: 'It starts with AGAT twice in a row. The third AGAT comes after CC, so it is a separate run of 1.',
        },
        {
          kind: 'steps',
          prompt: 'This DNA is cut into chunks to make it easier to read. Find the runs of AGAT.',
          cells: ['TT', 'AGAT', 'AGAT', 'C', 'AGAT', 'AGAT', 'AGAT', 'G'],
          steps: [
            { ask: 'Tap the chunk where the first run starts.', answer: 1 },
            { ask: 'Tap the chunk where the longest run starts.', answer: 4 },
            { ask: 'Tap the chunk where the longest run ends.', answer: 6 },
          ],
          explain: 'The first run has 2 repeats and the second has 3. The C between them breaks the run, so the answer for this DNA is 3.',
        },
        {
          kind: 'concept',
          title: 'Walking along a run',
          body: '`text[i:i + 2]` is the 2 letters starting at position `i`.\n\nThis loop jumps forward 2 letters for as long as it still sees `la`. It stops at position 6, where the letters are `ly`.',
          code: py('text = "lalalaly"', 'i = 0', 'while text[i:i + 2] == "la":', '    i = i + 2', 'print(i)'),
          language: 'python',
          output: '6',
        },
        {
          kind: 'write',
          prompt: 'Count a run from the very start. `dna[i:i + 4]` gives the 4 letters beginning at position `i`. While those letters are `AGAT`, add 1 to `count` and move `i` forward by 4. Print `count`.',
          language: 'python',
          starter: py(
            'dna = input()',
            'count = 0',
            'i = 0',
            '# While dna[i:i + 4] is "AGAT": count it and move i forward by 4',
            'print(count)',
          ),
          tests: [
            { stdin: ['AGATAGATAGATCC'], expected: '3' },
            { stdin: ['AGATCAGAT'], expected: '1' },
            { stdin: ['CCAGAT'], expected: '0' },
          ],
          hint: 'Write `while dna[i:i + 4] == "AGAT":` with `count = count + 1` and `i = i + 4` inside.',
          solution: py(
            'dna = input()',
            'count = 0',
            'i = 0',
            'while dna[i:i + 4] == "AGAT":',
            '    count = count + 1',
            '    i = i + 4',
            'print(count)',
          ),
          explain: 'Jumping 4 letters lands on the next possible repeat. The loop ends at the first chunk that is not AGAT. Past the end of the string a slice is just empty.',
        },
        {
          kind: 'spot',
          prompt: 'For `AGATAGAT` this prints 1 instead of 2. Tap the line with the bug.',
          lines: [
            'count = 0',
            'i = 0',
            'while dna[i:i + 4] == "AGAT":',
            '    count = count + 1',
            '    i = i + 1',
            'print(count)',
          ],
          language: 'python',
          answer: 4,
          explain: 'Moving 1 letter lands on "GATA", which does not match, so the loop stops early. It must jump the whole pattern: `i = i + 4`.',
        },
        {
          kind: 'concept',
          title: 'Keeping the biggest so far',
          body: 'To find the biggest of many values, keep a `best` that starts at 0. Look at each value in turn and replace `best` whenever you meet a bigger one.\n\n`range(len(scores))` gives every position: 0, 1, 2.',
          code: py(
            'scores = [4, 9, 6]',
            'best = 0',
            'for i in range(len(scores)):',
            '    n = scores[i]',
            '    if n > best:',
            '        best = n',
            'print(best)',
          ),
          language: 'python',
          output: '9',
        },
        {
          kind: 'write',
          prompt: 'A run can start anywhere. `run_at` is done for you: it counts the run that begins at position `i`. Finish `longest_run` so it tries every start position and returns the biggest count.',
          language: 'python',
          starter: py(
            'def run_at(dna, pattern, i):',
            '    count = 0',
            '    while dna[i:i + len(pattern)] == pattern:',
            '        count = count + 1',
            '        i = i + len(pattern)',
            '    return count',
            '',
            'def longest_run(dna, pattern):',
            '    best = 0',
            '    # Try every position i in dna. Keep the biggest run_at in best.',
            '    return best',
            '',
            'dna = input()',
            'print(longest_run(dna, "AGAT"))',
            'print(longest_run(dna, "TC"))',
          ),
          tests: [
            { stdin: ['AGATTCTCTCAGATAGAT'], expected: '2\n3' },
            { stdin: ['GGTCGG'], expected: '0\n1' },
          ],
          hint: 'Loop `for i in range(len(dna)):`, set `n = run_at(dna, pattern, i)`, and if `n > best` then `best = n`.',
          solution: py(
            'def run_at(dna, pattern, i):',
            '    count = 0',
            '    while dna[i:i + len(pattern)] == pattern:',
            '        count = count + 1',
            '        i = i + len(pattern)',
            '    return count',
            '',
            'def longest_run(dna, pattern):',
            '    best = 0',
            '    for i in range(len(dna)):',
            '        n = run_at(dna, pattern, i)',
            '        if n > best:',
            '            best = n',
            '    return best',
            '',
            'dna = input()',
            'print(longest_run(dna, "AGAT"))',
            'print(longest_run(dna, "TC"))',
          ),
          explain: 'Using `len(pattern)` instead of 4 lets one function handle patterns of any length. Checking every start is simple and plenty fast for this.',
        },
        {
          kind: 'concept',
          title: 'The table of people',
          body: 'The detective has a table: one row per person, with their longest run for each pattern. It is CSV text.\n\n`csv.DictReader` expects a file. `io.StringIO(text)` wraps a string so it can be read **like** a file, which is handy when the text is already in your program.',
          code: py(
            'import csv',
            'import io',
            '',
            'table = "name,AGAT,TC\\nAna,2,3\\nBen,4,1\\n"',
            'for row in csv.DictReader(io.StringIO(table)):',
            '    print(row["name"], row["AGAT"])',
          ),
          language: 'python',
          output: 'Ana 2\nBen 4',
        },
        {
          kind: 'type',
          prompt: 'One row is `{"name": "Ana", "AGAT": "2", "TC": "3"}`. What does this print?',
          code: py('print(row["AGAT"] == 2)'),
          language: 'python',
          accept: ['False'],
          explain: 'Values read from CSV are text. The text "2" is not the number 2, so turn it into a number first: `int(row["AGAT"]) == 2`.',
        },
        {
          kind: 'write',
          prompt: 'Read a number from input. Print the name of every person in the table whose AGAT count equals that number, one per line.',
          language: 'python',
          starter: py(
            'import csv',
            'import io',
            '',
            'table = "name,AGAT,TC\\nAna,2,3\\nBen,4,1\\nCleo,3,3\\nDev,2,5\\n"',
            'wanted = int(input())',
            'for row in csv.DictReader(io.StringIO(table)):',
            '    # Print the name if this row\'s AGAT count equals wanted',
            '    pass',
          ),
          tests: [
            { stdin: ['2'], expected: 'Ana\nDev' },
            { stdin: ['4'], expected: 'Ben' },
          ],
          hint: 'Use `if int(row["AGAT"]) == wanted:` then `print(row["name"])`.',
          solution: py(
            'import csv',
            'import io',
            '',
            'table = "name,AGAT,TC\\nAna,2,3\\nBen,4,1\\nCleo,3,3\\nDev,2,5\\n"',
            'wanted = int(input())',
            'for row in csv.DictReader(io.StringIO(table)):',
            '    if int(row["AGAT"]) == wanted:',
            '        print(row["name"])',
          ),
          explain: 'One pattern is not enough to pick a person: Ana and Dev both have 2. That is why the real check compares several patterns at once.',
        },
        {
          kind: 'concept',
          title: 'Two tests at once',
          body: '`and` passes only when both tests are true.\n\nStart with a fallback answer. Replace it when a row passes both tests. If no row does, the fallback is still there to print.',
          code: py(
            'pets = [{"name": "Rex", "legs": "4", "wings": "0"}, {"name": "Kiwi", "legs": "2", "wings": "2"}]',
            'found = "Nobody"',
            'for pet in pets:',
            '    if int(pet["legs"]) == 2 and int(pet["wings"]) == 2:',
            '        found = pet["name"]',
            'print(found)',
          ),
          language: 'python',
          output: 'Kiwi',
        },
        {
          kind: 'write',
          prompt: 'Solve the case. Read a DNA string. Work out its longest runs of `AGAT` and `TC`. Print the name of the person whose row matches **both** counts. If nobody matches, print `No match`.',
          language: 'python',
          starter: py(
            'import csv',
            'import io',
            '',
            'def longest_run(dna, pattern):',
            '    best = 0',
            '    for start in range(len(dna)):',
            '        count = 0',
            '        i = start',
            '        while dna[i:i + len(pattern)] == pattern:',
            '            count = count + 1',
            '            i = i + len(pattern)',
            '        if count > best:',
            '            best = count',
            '    return best',
            '',
            'table = "name,AGAT,TC\\nAna,2,3\\nBen,4,1\\nCleo,3,3\\nDev,2,5\\n"',
            'dna = input()',
            'agat = longest_run(dna, "AGAT")',
            'tc = longest_run(dna, "TC")',
            'match = "No match"',
            'for row in csv.DictReader(io.StringIO(table)):',
            '    # If both counts match this row, set match to the row\'s name',
            '    pass',
            'print(match)',
          ),
          tests: [
            { stdin: ['AGATTCTCTCAGATAGAT'], expected: 'Ana' },
            { stdin: ['TCAGATAGATAGATAGATGG'], expected: 'Ben' },
            { stdin: ['AGATAGATTCTCTCTCTC'], expected: 'Dev' },
            { stdin: ['TCTCAGAT'], expected: 'No match' },
          ],
          hint: 'Use `if int(row["AGAT"]) == agat and int(row["TC"]) == tc:` then `match = row["name"]`.',
          solution: py(
            'import csv',
            'import io',
            '',
            'def longest_run(dna, pattern):',
            '    best = 0',
            '    for start in range(len(dna)):',
            '        count = 0',
            '        i = start',
            '        while dna[i:i + len(pattern)] == pattern:',
            '            count = count + 1',
            '            i = i + len(pattern)',
            '        if count > best:',
            '            best = count',
            '    return best',
            '',
            'table = "name,AGAT,TC\\nAna,2,3\\nBen,4,1\\nCleo,3,3\\nDev,2,5\\n"',
            'dna = input()',
            'agat = longest_run(dna, "AGAT")',
            'tc = longest_run(dna, "TC")',
            'match = "No match"',
            'for row in csv.DictReader(io.StringIO(table)):',
            '    if int(row["AGAT"]) == agat and int(row["TC"]) == tc:',
            '        match = row["name"]',
            'print(match)',
          ),
          explain: 'Starting `match` as "No match" means the right thing prints even if no row fits. Every count has to agree before a name is chosen.',
        },
      ],
    },
    {
      id: 'u6-python-way',
      title: 'The Python way',
      exercises: [
        {
          kind: 'concept',
          title: 'Fewest coins',
          body: 'A classic puzzle: give change using as few coins as possible. The trick is to be **greedy**: always take the biggest coin that still fits.\n\nPython makes it short. `cents // 25` says how many 25s fit, and `cents % 25` says what is left over.',
        },
        {
          kind: 'type',
          prompt: 'The coins are worth 25, 10, 5 and 1. What is the fewest coins that make 68?',
          accept: ['7', 'seven'],
          explain: 'Two 25s make 50, one 10 makes 60, one 5 makes 65, and three 1s make 68. That is 2 + 1 + 1 + 3 = 7 coins.',
        },
        {
          kind: 'steps',
          prompt: 'Make 41 with as few coins as possible. Each box is a coin value. Always take the biggest coin that fits in what is left.',
          cells: ['25', '10', '5', '1'],
          steps: [
            { ask: '41 left. Tap the coin to take.', answer: 0 },
            { ask: '16 left. Tap the coin to take.', answer: 1 },
            { ask: '6 left. Tap the coin to take.', answer: 2 },
            { ask: '1 left. Tap the coin to take.', answer: 3 },
          ],
          explain: '25 + 10 + 5 + 1 = 41 with just 4 coins. Taking the biggest coin each time shrinks the amount fastest.',
        },
        {
          kind: 'concept',
          title: 'How many fit, and what is left',
          body: '`68 // 25` is 2, because two 25s fit into 68. `68 % 25` is 18, the amount still to make with smaller coins.\n\nDo the same again with 18 and the next coin down.',
          code: py('cents = 68', 'print(cents // 25)', 'print(cents % 25)'),
          language: 'python',
          output: '2\n18',
        },
        {
          kind: 'blank',
          prompt: 'Fill the gaps. For each coin, count how many fit, then keep only what is left over.',
          code: py(
            'coins = 0',
            'for coin in [25, 10, 5, 1]:',
            '    coins = coins + cents ___ coin',
            '    cents = cents ___ coin',
            'print(coins)',
          ),
          language: 'python',
          bank: ['//', '%', '/', '-'],
          answers: ['//', '%'],
          explain: '`//` counts whole coins and `%` gives the remainder. Looping over a list of coin values replaces four near-identical blocks of code.',
        },
        {
          kind: 'write',
          prompt: 'Read an amount in cents. Print the fewest coins needed, using coins worth 25, 10, 5 and 1.',
          language: 'python',
          starter: py(
            'cents = int(input())',
            'coins = 0',
            'for coin in [25, 10, 5, 1]:',
            '    # Add how many of this coin fit, then keep what is left',
            '    pass',
            'print(coins)',
          ),
          tests: [
            { stdin: ['41'], expected: '4' },
            { stdin: ['68'], expected: '7' },
            { stdin: ['99'], expected: '9' },
          ],
          hint: 'Inside the loop: `coins = coins + cents // coin`, then `cents = cents % coin`.',
          solution: py(
            'cents = int(input())',
            'coins = 0',
            'for coin in [25, 10, 5, 1]:',
            '    coins = coins + cents // coin',
            '    cents = cents % coin',
            'print(coins)',
          ),
          explain: 'Four lines do the whole job. The list must go from biggest to smallest, or the greedy idea falls apart.',
        },
        {
          kind: 'concept',
          title: 'Numbers that check themselves',
          body: 'Card and ID numbers have a built-in **checksum**: a sum that reveals typing mistakes.\n\nA common rule: start from the **right**. Double every second digit. If a doubled digit is more than 9, subtract 9. Add everything up. The number passes if the total ends in 0.',
        },
        {
          kind: 'type',
          prompt: 'Check the number 59. From the right: 9 stays as it is. 5 is doubled to 10, and 10 is more than 9, so subtract 9. What is the total?',
          accept: ['10', 'ten'],
          explain: '9 plus (10 − 9) is 9 + 1 = 10. The total ends in 0, so 59 passes the check.',
        },
        {
          kind: 'concept',
          title: 'Two handy helpers',
          body: '`reversed(text)` walks through text from the last character to the first.\n\n`enumerate(...)` hands you a position and an item together, counting from 0. With both, "every second digit from the right" is just the odd positions.',
          code: py('for i, ch in enumerate(reversed("59")):', '    print(i, ch)', '# 0 9', '# 1 5'),
          language: 'python',
        },
        {
          kind: 'spot',
          prompt: 'This checksum gives the wrong total for 59. Tap the line with the bug.',
          lines: [
            'total = 0',
            'for i, ch in enumerate(reversed(number)):',
            '    d = int(ch)',
            '    if i % 2 == 1:',
            '        d = d * 2',
            '        if d > 9:',
            '            d = d + 9',
            '    total = total + d',
          ],
          language: 'python',
          answer: 6,
          explain: 'A doubled digit over 9 should have 9 subtracted, not added. Subtracting 9 is the same as adding its two digits: 10 becomes 1.',
        },
        {
          kind: 'write',
          prompt: 'Read a number as text. Work out its checksum with the rule above. Print `valid` if the total ends in 0, and `invalid` if not.',
          language: 'python',
          starter: py(
            'number = input()',
            'total = 0',
            'for i, ch in enumerate(reversed(number)):',
            '    d = int(ch)',
            '    # At odd positions: double d, and subtract 9 if it is over 9',
            '    total = total + d',
            '# Print valid if total ends in 0, otherwise invalid',
          ),
          tests: [
            { stdin: ['59'], expected: 'valid' },
            { stdin: ['79927398713'], expected: 'valid' },
            { stdin: ['79927398710'], expected: 'invalid' },
            { stdin: ['1234'], expected: 'invalid' },
          ],
          hint: 'Use `if i % 2 == 1:` to find odd positions. After the loop, `total % 10 == 0` means the total ends in 0.',
          solution: py(
            'number = input()',
            'total = 0',
            'for i, ch in enumerate(reversed(number)):',
            '    d = int(ch)',
            '    if i % 2 == 1:',
            '        d = d * 2',
            '        if d > 9:',
            '            d = d - 9',
            '    total = total + d',
            'if total % 10 == 0:',
            '    print("valid")',
            'else:',
            '    print("invalid")',
          ),
          explain: 'Change one digit and the total almost always stops ending in 0. That is how a website can tell you mistyped a card number before it even asks the bank.',
        },
      ],
    },
  ],
}
