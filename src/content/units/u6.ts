import type { Unit } from '../types'

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
  ],
}
