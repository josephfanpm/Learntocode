import type { Unit } from '../types'

export const u21: Unit = {
  id: 'u21',
  week: 8,
  course: 'dev',
  title: 'Working in existing code',
  summary: 'Reading, refactoring and code review',
  lessons: [
    {
      id: 'u21-reading',
      title: 'Reading unfamiliar code',
      exercises: [
        {
          kind: 'concept',
          title: 'You never read it all',
          body: 'Real projects have thousands of lines. Do not read them top to bottom.\n\nFind the **entry point**: where the program starts. Pick one thing the program does and follow that one path, function by function. Like learning a new city: walk one route first, not the whole map.',
        },
        {
          kind: 'spot',
          prompt: 'This file is run as a program. Tap the line that sets the real work going.',
          lines: [
            'def load_orders(path):',
            '    ...',
            'def main():',
            '    orders = load_orders("orders.csv")',
            '    print_report(orders)',
            'if __name__ == "__main__":',
            '    main()',
          ],
          language: 'python',
          answer: 6,
          explain: 'The `def` lines only define functions. Nothing happens until the call to `main()` at the bottom, so start reading there.',
        },
        {
          kind: 'steps',
          prompt: 'It is your first day on a project with these five files. Tap the file to open.',
          cells: ['README.md', 'main.py', 'orders.py', 'test_orders.py', 'utils.py'],
          steps: [
            { ask: 'Where do you look first to learn what the project is and how to run it?', answer: 0 },
            { ask: 'Which file most likely holds the entry point?', answer: 1 },
            { ask: 'Order totals are wrong. main.py calls orders.total(). Where next?', answer: 2 },
            { ask: 'You want examples of what total() is supposed to return.', answer: 3 },
          ],
          explain: 'README, entry point, then the one path your bug takes. The tests show what the code is meant to do.',
        },
        {
          kind: 'concept',
          title: 'Free clues',
          body: '**Names** tell you what a thing is for. **Tests** show real inputs and the outputs expected for them.\n\nRead both before reading the inside of a function. Often you will not need the inside at all.',
        },
        {
          kind: 'choice',
          prompt: 'You have never seen `slugify`. From this test alone, what does it do?',
          code: 'def test_slug_replaces_spaces():\n    assert slugify("Hello World") == "hello-world"',
          language: 'python',
          options: [
            'Counts the words in a text',
            'Removes every vowel',
            'Makes text lowercase and swaps spaces for dashes',
            'Checks whether a text has spaces',
          ],
          answer: 2,
          explain: 'One example input and output told you the job, without opening the function. Tests are examples that are checked every time they run.',
        },
        {
          kind: 'type',
          prompt: 'Follow the path from the last line into `render`, then into `tag`. What does this print?',
          code: 'def tag(word):\n    return "<" + word + ">"\n\ndef render(words):\n    return " ".join(tag(w) for w in words)\n\nprint(render(["a", "b"]))',
          language: 'python',
          accept: ['<a> <b>'],
          explain: '`render` calls `tag` on each word, giving `<a>` and `<b>`, then joins them with a space.',
        },
        {
          kind: 'spot',
          prompt: 'The name is a promise: `count_long` should count the words longer than `limit`. Tap the line that breaks that promise.',
          lines: [
            'def count_long(words, limit):',
            '    count = 0',
            '    for word in words:',
            '        if len(word) > limit:',
            '            count = 1',
            '    return count',
          ],
          language: 'python',
          answer: 4,
          explain: '`count = 1` resets the count each time. It should be `count += 1`. Knowing what the name promises made the bug easy to see.',
        },
        {
          kind: 'order',
          prompt: 'A bug is reported in code you have never seen. Put your approach in order.',
          lines: [
            'Reproduce the bug: watch it happen yourself',
            'Find the entry point for that feature',
            'Follow the one path the bug takes',
            'Make the smallest change that fixes it',
            'Run the tests',
          ],
          explain: 'See it first, so you know when it is fixed. Then narrow down, change little, and check you broke nothing else.',
        },
        {
          kind: 'concept',
          title: 'Small, safe changes',
          body: 'In code you do not know well, change as little as you can. One purpose per change.\n\nRun the tests before you start and again after. A small change is easy to review, easy to test, and easy to undo if it turns out wrong.',
        },
        {
          kind: 'concept',
          title: 'One rule, one function',
          body: 'New rule here: children under 12 pay 4. It went into `ticket_price` and nowhere else.\n\n`main` did not change at all, yet every call to `ticket_price` now gets the new rule.',
          code: `def ticket_price(age):
    if age < 12:
        return 4
    return 9

def main():
    print("Price:", ticket_price(8))
    print("Price:", ticket_price(30))

main()`,
          language: 'python',
          output: `Price: 4
Price: 9`,
        },
        {
          kind: 'write',
          prompt: 'New rule: orders with a subtotal of 50 or more ship free. Follow the path from `main` to find the one function to change, and change only that one.',
          language: 'python',
          starter: `def subtotal(prices):
    return sum(prices)

def shipping(amount):
    return 5

def main():
    prices = [int(p) for p in input().split()]
    amount = subtotal(prices)
    print("Subtotal:", amount)
    print("Shipping:", shipping(amount))
    print("Total:", amount + shipping(amount))

main()
`,
          tests: [
            { stdin: ['20 10'], expected: 'Subtotal: 30\nShipping: 5\nTotal: 35' },
            { stdin: ['30 20'], expected: 'Subtotal: 50\nShipping: 0\nTotal: 50' },
            { stdin: ['60 15'], expected: 'Subtotal: 75\nShipping: 0\nTotal: 75' },
          ],
          hint: 'Only shipping needs to change: if amount >= 50, return 0. Otherwise return 5.',
          solution: `def subtotal(prices):
    return sum(prices)

def shipping(amount):
    if amount >= 50:
        return 0
    return 5

def main():
    prices = [int(p) for p in input().split()]
    amount = subtotal(prices)
    print("Subtotal:", amount)
    print("Shipping:", shipping(amount))
    print("Total:", amount + shipping(amount))

main()
`,
          explain: 'Two new lines in one function, and both places that use `shipping` got the rule. The second test sits right on the boundary of 50.',
        },
      ],
    },
    {
      id: 'u21-naming',
      title: 'Names that tell the truth',
      exercises: [
        {
          kind: 'concept',
          title: 'Names are the first documentation',
          body: 'A good name says what a value **means**: `days_left`, not `d` or `number`.\n\nFunctions do things, so use a verb: `send_email`. True/False values read like a yes/no question: `is_paid`, `has_stock`.\n\nThe worst name is one that lies.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line where the name does not match what is stored.',
          lines: [
            'names = ["ana", "ben"]',
            'user_list = {"ana": 3, "ben": 5}',
            'is_admin = False',
            'price_in_cents = 499',
          ],
          language: 'python',
          answer: 1,
          explain: 'It is called a list but holds a dict. The next reader will try `user_list[0]` and be confused. `orders_by_user` would say more.',
        },
        {
          kind: 'choice',
          prompt: 'A variable holds how many seconds remain before a login expires. Which name is best?',
          options: ['t', 'data', 'session_number_value', 'seconds_until_expiry'],
          answer: 3,
          explain: 'It gives the unit and the meaning. Short names like `t` save typing once and cost every reader time after that.',
        },
        {
          kind: 'choice',
          prompt: '`get_user(id)` returns a user. You find it also deletes the old messages of that user. What is the problem?',
          options: [
            'The name hides a second job, so callers delete data without knowing',
            'Functions may not have more than three lines',
            'The name is too short to be valid Python',
            'Nothing: extra work inside a function is a bonus',
          ],
          answer: 0,
          explain: 'A function named "get" should only get. A hidden extra action is called a side effect, and it surprises everyone who trusts the name.',
        },
        {
          kind: 'blank',
          prompt: 'Give the function and the variable honest names. Fill the gaps.',
          code: 'def ___(prices):\n    return sum(prices) / len(prices)\n\n___ = True  # the invoice was paid',
          language: 'python',
          bank: ['average_price', 'is_paid', 'do_stuff', 'paid_list', 'calc'],
          answers: ['average_price', 'is_paid'],
          explain: 'The function name says what it works out. The True/False name reads as a question: is it paid?',
        },
        {
          kind: 'concept',
          title: 'A rename, start to finish',
          body: 'This used to be `def g(l):` with a `t` inside.\n\nA rename has to reach every place the name is used: the `def` line, each line of the body, and every call. Miss one and Python stops with a `NameError`. The answer it prints stays the same.',
          code: `def total_price(prices):
    total = 0
    for price in prices:
        total += price
    return total

print(total_price([3, 4]))`,
          language: 'python',
          output: '7',
        },
        {
          kind: 'write',
          prompt: 'This works, but the names say nothing. Rename the function `f` to `count_vowels`, and give `s` and `n` clearer names too. The last line already calls the new name.',
          language: 'python',
          starter: `def f(s):
    n = 0
    for c in s:
        if c in "aeiou":
            n += 1
    return n

print(count_vowels("banana"))
`,
          tests: [{ expected: '3' }],
          hint: 'Change def f(s): to def count_vowels(text): and rename s to text and n to count everywhere inside.',
          solution: `def count_vowels(text):
    count = 0
    for letter in text:
        if letter in "aeiou":
            count += 1
    return count

print(count_vowels("banana"))
`,
          explain: 'The behaviour is identical, but a reader now knows what the function is for without tracing the loop.',
        },
        {
          kind: 'concept',
          title: 'Magic numbers',
          body: 'A **magic number** is a bare number in the code with no explanation. What is the `0.2` in `price * 0.2`?\n\nGive it a name in capitals at the top of the file: `TAX_RATE = 0.2`. That is a **constant**. Readers learn what it means, and you change it in one place.',
          code: `TAX_RATE = 0.2

price = 50
print(price * TAX_RATE)`,
          language: 'python',
          output: '10.0',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line with a magic number that deserves a name.',
          lines: [
            'SECONDS_PER_MINUTE = 60',
            'def to_minutes(seconds):',
            '    return seconds // SECONDS_PER_MINUTE',
            'def late_fee(days):',
            '    return days * 1.5',
          ],
          language: 'python',
          answer: 4,
          explain: 'Nobody can tell what 1.5 is. `FEE_PER_DAY = 1.5` would explain it. The 60 on the first line already has its name.',
        },
        {
          kind: 'write',
          prompt: 'Replace the magic numbers with three constants at the top: `PRICE_EACH = 4`, `DISCOUNT_FROM = 30` and `DISCOUNT = 5`. Use them in the code. The last line prints them, so they must exist.',
          language: 'python',
          starter: `quantity = int(input())
total = quantity * 4
if total >= 30:
    total = total - 5
print(total)
print(PRICE_EACH, DISCOUNT_FROM, DISCOUNT)
`,
          tests: [
            { stdin: ['3'], expected: '12\n4 30 5' },
            { stdin: ['10'], expected: '35\n4 30 5' },
          ],
          hint: 'Put the three constants on the first three lines. Then swap each number in the code for its name, for example quantity * PRICE_EACH.',
          solution: `PRICE_EACH = 4
DISCOUNT_FROM = 30
DISCOUNT = 5

quantity = int(input())
total = quantity * PRICE_EACH
if total >= DISCOUNT_FROM:
    total = total - DISCOUNT
print(total)
print(PRICE_EACH, DISCOUNT_FROM, DISCOUNT)
`,
          explain: 'The sums are the same, but the code now explains itself, and a price change next year is a one-line edit.',
        },
        {
          kind: 'type',
          prompt: 'By convention, are Python constants like `MAX_TRIES` written in upper or lower case? Type the word.',
          accept: ['upper', 'uppercase', 'upper case', 'capitals', 'caps'],
          explain: 'Capitals signal "this value is fixed: do not reassign it". Python does not enforce it, but every reader understands it.',
        },
      ],
    },
    {
      id: 'u21-refactor',
      title: 'Refactoring safely',
      exercises: [
        {
          kind: 'concept',
          title: 'Same behaviour, better shape',
          body: '**Refactoring** means changing how code is written without changing what it does. Like tidying a kitchen: the same meals come out, but cooking is easier.\n\nTests are your safety net: they pass before, and they must pass after. Never mix a refactor and a new feature in one change.',
        },
        {
          kind: 'order',
          prompt: 'Put the steps of a safe refactor in order.',
          lines: [
            'Run the tests: all pass',
            'Make one small refactor',
            'Run the tests again',
            'Commit',
            'Start the next small refactor',
          ],
          explain: 'Small steps with a test run after each. If something breaks, you know it was the last step.',
        },
        {
          kind: 'choice',
          prompt: 'You are refactoring. After your latest small step, one test fails. What is the best move?',
          options: [
            'Change the test so it expects the new result',
            'Keep going and fix it at the end',
            'Undo that step and look at what it changed',
            'Delete the failing test',
          ],
          answer: 2,
          explain: 'A refactor must not change behaviour, so a failing test means the step did. Because the step was small, the cause is easy to find.',
        },
        {
          kind: 'concept',
          title: 'Extract a function',
          body: 'When some lines do one job you can name, or the same lines appear twice, move them into a function and call it. That is **extracting** a function.\n\n**Duplication** is risky: fix a bug in one copy and the other copy still has it.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line that repeats work already written higher up.',
          lines: [
            'first = input()',
            'first = first.strip().title()',
            'second = input()',
            'second = second.strip().title()',
            'print("Hello,", first, "and", second)',
          ],
          language: 'python',
          answer: 3,
          explain: 'The same clean-up is written out twice. One function called twice would hold the rule in a single place.',
        },
        {
          kind: 'concept',
          title: 'Extracted',
          body: 'Before, `.upper() + "!"` was written out once for each word.\n\nNow the rule has a name and lives in one place. Define the function at the top, then call it everywhere the lines were repeated.',
          code: `def shout(word):
    return word.upper() + "!"

print(shout("hey"))
print(shout("stop"))`,
          language: 'python',
          output: `HEY!
STOP!`,
        },
        {
          kind: 'write',
          prompt: 'Extract the clean-up into a function named `tidy` that takes a name and returns it stripped and in title case. Call it for both names. The last line calls `tidy` directly, so it must exist.',
          language: 'python',
          starter: `first = input()
first = first.strip().title()
second = input()
second = second.strip().title()
print("Hello,", first, "and", second)
print(tidy("  zOE "))
`,
          tests: [
            { stdin: ['  aNA', 'bEN  '], expected: 'Hello, Ana and Ben\nZoe' },
            { stdin: ['li', ' SAM '], expected: 'Hello, Li and Sam\nZoe' },
          ],
          hint: 'At the top: def tidy(name): return name.strip().title(). Then write first = tidy(input()) and the same for second.',
          solution: `def tidy(name):
    return name.strip().title()

first = tidy(input())
second = tidy(input())
print("Hello,", first, "and", second)
print(tidy("  zOE "))
`,
          explain: 'The output for the two names did not change: that is what makes it a refactor. The rule for tidying a name now lives in one place.',
        },
        {
          kind: 'steps',
          prompt: 'A 90-line function does five jobs. You are splitting it into five small functions. Tap the function each line belongs in.',
          cells: ['read_order', 'validate', 'price', 'save', 'email'],
          steps: [
            { ask: 'if quantity <= 0: raise ValueError("bad quantity")', answer: 1 },
            { ask: 'total = quantity * PRICE_EACH', answer: 2 },
            { ask: 'send_message(customer, "Thanks for your order!")', answer: 4 },
            { ask: 'database.insert(order)', answer: 3 },
          ],
          explain: 'Each small function has one job and a name that says it. The big function becomes a readable list of five calls.',
        },
        {
          kind: 'concept',
          title: 'Extracting a rule with an if',
          body: 'A rule with an `if` in it can be extracted too. The function returns the answer, and each caller adds it to its own sum.\n\nHere the delivery rule is written once, however many kinds of parcel use it.',
          code: `def delivery(weight):
    if weight < 5:
        return 3
    return 7

def parcel(weight):
    return 10 + delivery(weight)

print(parcel(2), parcel(5))`,
          language: 'python',
          output: '13 17',
        },
        {
          kind: 'write',
          prompt: 'The booking fee is 2 for prices under 20, otherwise 3. That rule was copied into two functions, and one copy has drifted. Write `booking_fee(price)` and use it in both. The last line calls it directly.',
          language: 'python',
          starter: `def student_ticket(price):
    if price < 20:
        fee = 2
    else:
        fee = 3
    return price // 2 + fee

def senior_ticket(price):
    if price <= 20:
        fee = 2
    else:
        fee = 3
    return price - 5 + fee

print(student_ticket(20))
print(senior_ticket(20))
print(booking_fee(10), booking_fee(20))
`,
          tests: [{ expected: '13\n18\n2 3' }],
          hint: 'def booking_fee(price): return 2 if price is under 20, else 3. Then each ticket function ends with + booking_fee(price).',
          solution: `def booking_fee(price):
    if price < 20:
        return 2
    return 3

def student_ticket(price):
    return price // 2 + booking_fee(price)

def senior_ticket(price):
    return price - 5 + booking_fee(price)

print(student_ticket(20))
print(senior_ticket(20))
print(booking_fee(10), booking_fee(20))
`,
          explain: 'One copy said `<` and the other `<=`, so seniors paid the wrong fee at exactly 20. With one function, the two can never disagree again.',
        },
        {
          kind: 'type',
          prompt: 'The same six lines are pasted in 4 places, and a bug is found in them. How many places must be fixed? Type the number.',
          accept: ['4', 'four'],
          explain: 'Every copy needs the fix, and it is easy to miss one. After extracting a function, the answer is always 1.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these is a refactor, and not a change in behaviour?',
          options: [
            'Adding a 10% discount for members',
            'Renaming `x` to `total_cents` everywhere',
            'Changing the error message users see',
            'Correcting a wrong tax rate',
          ],
          answer: 1,
          explain: 'A rename changes how the code reads, not what it does. The other three change what users get, so they are features or fixes.',
        },
      ],
    },
    {
      id: 'u21-simplify',
      title: 'Simpler conditions, useful comments',
      exercises: [
        {
          kind: 'concept',
          title: 'Flatten the nest',
          body: 'Deeply nested `if`s are hard to follow. Two tools help.\n\nReturn the condition itself: `return age >= 18`, not four lines of if/else.\n\nUse a **guard clause**: handle the special case first and return early, so the main path is not buried in indents.',
        },
        {
          kind: 'blank',
          prompt: 'The commented-out version takes four lines. Write it in one. Fill the gaps.',
          code: '# if age >= 18:\n#     return True\n# else:\n#     return False\n\ndef is_adult(age):\n    ___ age ___ 18',
          language: 'python',
          bank: ['return', '>=', 'if', '==', 'True'],
          answers: ['return', '>='],
          explain: '`age >= 18` is already True or False, so you can return it directly.',
        },
        {
          kind: 'spot',
          prompt: 'One line makes a comparison that adds nothing. Tap it.',
          lines: [
            'def can_post(user):',
            '    if user.is_banned == True:',
            '        return False',
            '    return user.has_verified_email',
          ],
          language: 'python',
          answer: 1,
          explain: '`user.is_banned` is already True or False. `if user.is_banned:` says the same thing and reads like a sentence.',
        },
        {
          kind: 'order',
          prompt: 'Build this function with guard clauses: deal with the missing order first, then the unpaid one, then the normal case.',
          lines: [
            'def ship(order):',
            '    if order is None:',
            '        return "no order"',
            '    if not order.paid:',
            '        return "waiting for payment"',
            '    return "shipped"',
          ],
          language: 'python',
          explain: 'Each guard deals with one problem and leaves. The normal case sits at the bottom with no nesting at all.',
        },
        {
          kind: 'concept',
          title: 'Say the rule in one line',
          body: 'The rule: under 5 is free. Under 16 is free for members.\n\n`or` joins the two ways to qualify. `and` joins the two parts of the second way. The brackets keep those two parts together.',
          code: `def free_entry(age, is_member):
    return age < 5 or (age < 16 and is_member)

print(free_entry(3, False))
print(free_entry(10, True))
print(free_entry(10, False))`,
          language: 'python',
          output: `True
True
False`,
        },
        {
          kind: 'write',
          prompt: 'The rule: anyone 140 or taller can ride. Anyone 120 or taller can ride with an adult. The nesting hides a bug. Rewrite the body of `can_ride` as a single `return` line.',
          language: 'python',
          starter: `def can_ride(height, with_adult):
    if height >= 140:
        return True
    else:
        if height > 120:
            if with_adult == True:
                return True
            else:
                return False
        else:
            return False

print(can_ride(150, False))
print(can_ride(130, True))
print(can_ride(130, False))
print(can_ride(120, True))
print(can_ride(100, True))
`,
          tests: [{ expected: 'True\nTrue\nFalse\nTrue\nFalse' }],
          hint: 'Say the rule out loud and write it down: return height >= 140 or (height >= 120 and with_adult).',
          solution: `def can_ride(height, with_adult):
    return height >= 140 or (height >= 120 and with_adult)

print(can_ride(150, False))
print(can_ride(130, True))
print(can_ride(130, False))
print(can_ride(120, True))
print(can_ride(100, True))
`,
          explain: 'Ten lines became one that reads like the rule. The bug, `>` where `>=` was meant, had nowhere left to hide.',
        },
        {
          kind: 'concept',
          title: 'Comments that earn their place',
          body: 'Code already says **what** it does. A good comment says **why**: a reason you cannot see in the code.\n\nA **docstring** is a string on the first line of a function that tells callers what it does.\n\nDelete comments that repeat the code or are out of date.',
        },
        {
          kind: 'spot',
          prompt: 'Two of these comments explain a reason. Tap the comment that only repeats the code.',
          lines: [
            '# Retry 3 times: the bank server often drops the first call',
            'MAX_TRIES = 3',
            '# add 1 to count',
            'count = count + 1',
            '# Prices are in cents to avoid rounding errors',
            'price = 499',
          ],
          language: 'python',
          answer: 2,
          explain: 'The line below it already says "add 1 to count". The other two comments give reasons the code alone could not tell you.',
        },
        {
          kind: 'choice',
          prompt: 'A comment says `# returns the price with tax`. The code was changed last month and now returns the price without tax. What should you do?',
          options: [
            'Leave it: comments do not affect how the code runs',
            'Add a second comment below saying the first is wrong',
            'Change the code back so it matches the comment',
            'Fix or delete the comment in the same change',
          ],
          answer: 3,
          explain: 'A comment that lies is worse than no comment: the next reader will believe it. Keep comments true whenever you change the code under them.',
        },
        {
          kind: 'concept',
          title: 'Writing a docstring',
          body: 'A docstring goes on the first line inside the function, in three double quotes on each side. Say what the function gives back.\n\nPython keeps it on the function as `__doc__`, so you can print it.',
          code: `def is_even(number):
    """Return True if the number is even."""
    return number % 2 == 0

print(is_even(4))
print(is_even.__doc__)`,
          language: 'python',
          output: `True
Return True if the number is even.`,
        },
        {
          kind: 'write',
          prompt: 'The two comments say nothing useful. Delete them and give `days_left` a docstring with exactly this text: `Return the number of days left.` The last line prints the docstring.',
          language: 'python',
          starter: `def days_left(deadline, today):
    # this function does the days
    # subtract
    return deadline - today

print(days_left(10, 7))
print(days_left.__doc__)
`,
          tests: [{ expected: '3\nReturn the number of days left.' }],
          hint: 'A docstring is a string in triple quotes on the first line inside the function: """Return the number of days left."""',
          solution: `def days_left(deadline, today):
    """Return the number of days left."""
    return deadline - today

print(days_left(10, 7))
print(days_left.__doc__)
`,
          explain: 'Python stores a docstring on the function as `__doc__`, so editors and `help()` can show it. A `#` comment is thrown away.',
        },
        {
          kind: 'type',
          prompt: 'What is the string on the first line of this function called? Type the word.',
          code: 'def area(width, height):\n    """Return the area of a rectangle."""\n    return width * height',
          language: 'python',
          accept: ['docstring', 'a docstring', 'doc string'],
          explain: 'A docstring tells callers what the function does, so they can use it without reading the body.',
        },
      ],
    },
    {
      id: 'u21-review',
      title: 'Style tools and code review',
      exercises: [
        {
          kind: 'concept',
          title: 'Robots for the boring parts',
          body: 'A **formatter** rewrites the layout of your code automatically: spacing, line breaks, quote marks.\n\nA **linter** reads your code and warns about likely mistakes: a variable never used, a missing import.\n\nLet tools settle style, so people can spend review time on ideas.',
        },
        {
          kind: 'match',
          prompt: 'Match each safety net to what it does.',
          pairs: [
            ['Formatter', 'Fixes layout automatically'],
            ['Linter', 'Warns about likely mistakes'],
            ['Tests', 'Check the code gives right answers'],
            ['Code review', 'A teammate reads your change'],
          ],
          explain: 'Each one catches a different kind of problem. Teams usually run the first three automatically on every push.',
        },
        {
          kind: 'spot',
          prompt: 'A linter reports "variable assigned but never used". Tap the line it is pointing at.',
          lines: [
            'def total_with_tax(prices):',
            '    subtotal = sum(prices)',
            '    discount = 5',
            '    return subtotal * 1.2',
          ],
          language: 'python',
          answer: 2,
          explain: '`discount` is set and never read. Either it is leftover clutter, or someone forgot to subtract it: a real bug. Both are worth knowing.',
        },
        {
          kind: 'concept',
          title: 'Giving a review',
          body: 'Review the code, not the person.\n\nBe **specific**: say where, and why it matters. Be **kind**: ask or suggest, do not order. Say what is good, too.\n\n"This crashes on an empty list. Could we return 0?" beats "This is wrong."',
        },
        {
          kind: 'choice',
          prompt: 'A function in a pull request crashes when the list is empty. Which review comment is best?',
          options: [
            'Did you even test this?',
            'This is broken.',
            'Looks fine to me!',
            'This divides by len(scores), so an empty list will crash. Could we return 0 for that case?',
          ],
          answer: 3,
          explain: 'It names the place, the reason and a possible fix, and it is phrased as a question. The author can act on it straight away.',
        },
        {
          kind: 'spot',
          prompt: 'Four review comments. Tap the one that should be rewritten before it is sent.',
          lines: [
            'Nice test names: they made this easy to follow.',
            'Could d be days_left? I had to scroll up to see what it meant.',
            'Why would anyone write it like this?',
            'This loop stops one item early: range(len(items) - 1). Is that intended?',
          ],
          answer: 2,
          explain: 'It attacks the author and gives nothing to act on. The others are specific, and each is about the code.',
        },
        {
          kind: 'steps',
          prompt: 'Labelling a comment tells the author how serious it is. Tap the label that fits each comment.',
          cells: ['Bug', 'Question', 'Nitpick', 'Praise'],
          steps: [
            { ask: '"This divides by zero when the list is empty."', answer: 0 },
            { ask: '"I have not seen this library before. What does it do here?"', answer: 1 },
            { ask: '"Tiny thing, feel free to ignore: there is an extra blank line."', answer: 2 },
            { ask: '"Great idea to pull this into its own function."', answer: 3 },
          ],
          explain: 'A bug must be fixed before merging, and a nitpick is optional. Saying which is which saves the author from guessing.',
        },
        {
          kind: 'concept',
          title: 'Receiving a review',
          body: 'Comments are about the code, not about you. Everyone gets them, including the most senior people.\n\nAssume the reviewer means well. Answer every comment: make the fix, or explain why not. If a comment is unclear, ask. Then say thanks.',
        },
        {
          kind: 'choice',
          prompt: 'A reviewer writes only: "This part is confusing." What is the best reply?',
          options: [
            'It is not confusing if you read it properly.',
            'Thanks. Which bit tripped you up: the names or the nested ifs? Happy to rework it.',
            'Say nothing and merge anyway',
            'Delete the pull request and start again',
          ],
          answer: 1,
          explain: 'If a reviewer was confused, the next reader may be too. Asking what was unclear turns a vague comment into something you can fix.',
        },
        {
          kind: 'concept',
          title: 'A review, applied',
          body: 'The review said: "`m` does not say what it finds, and `max` crashes on an empty list."\n\nThe fix is a name that says what comes back, and a guard clause that deals with the empty list first.',
          code: `def highest(scores):
    if len(scores) == 0:
        return 0
    return max(scores)

print(highest([4, 9, 6]))
print(highest([]))`,
          language: 'python',
          output: `9
0`,
        },
        {
          kind: 'write',
          prompt: 'Apply two review comments. One: "`calc` does not say what it calculates. Could it be `average`?" Two: "This crashes on an empty list. Could it return 0?" The last two lines already use the new name.',
          language: 'python',
          starter: `def calc(x):
    return sum(x) / len(x)

print(average([4, 6]))
print(average([]))
`,
          tests: [{ expected: '5.0\n0' }],
          hint: 'Rename the function to average and its parameter to numbers. Add a guard at the top: if len(numbers) == 0, return 0.',
          solution: `def average(numbers):
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

print(average([4, 6]))
print(average([]))
`,
          explain: 'A clearer name and a guard clause for the edge case. Two specific, kind comments made the code better in a couple of minutes.',
        },
      ],
    },
  ],
}
