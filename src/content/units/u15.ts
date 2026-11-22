import type { Unit } from '../types'

export const u15: Unit = {
  id: 'u15',
  week: 2,
  course: 'dev',
  title: 'Testing',
  summary: 'Proving your code works, and keeping it working',
  lessons: [
    {
      id: 'u15-assert',
      title: 'Why test, and assert',
      exercises: [
        {
          kind: 'concept',
          title: 'Code that checks code',
          body: 'A **test** is a small piece of code that runs your code and checks the answer.\n\nChecking by hand works once. Tests check again in seconds, every time you change something. When a change breaks something that used to work, that is a **regression**, and a test tells you at once.',
        },
        {
          kind: 'choice',
          prompt: 'You change a function that is used in 12 places. What is the quickest way to know that nothing broke?',
          options: [
            'Click through the whole app by hand',
            'Read the function again very carefully',
            'Wait and see if users complain',
            'Run the tests',
          ],
          answer: 3,
          explain: 'Tests re-check all 12 places in seconds, and they do not get bored or skip one.',
        },
        {
          kind: 'concept',
          title: 'assert',
          body: 'Python has a keyword for checking: `assert`. Write a condition after it.\n\nIf the condition is true, nothing happens and the program carries on. If it is false, the program stops with an `AssertionError`. Silence means the check passed.',
          code: 'assert 2 + 2 == 4\nassert len("cat") == 3',
          language: 'python',
        },
        {
          kind: 'type',
          prompt: 'This program stops on the first line. What is the name of the error it raises?',
          code: 'assert max(3, 9) == 3\nprint("done")',
          language: 'python',
          accept: ['AssertionError', 'assertion error'],
          explain: '`max(3, 9)` is 9, so the condition is false. A false assert raises `AssertionError` and "done" never prints.',
        },
        {
          kind: 'spot',
          prompt: 'Three of these checks pass. Tap the one that fails.',
          lines: [
            'assert "a".upper() == "A"',
            'assert len([1, 2, 3]) == 3',
            'assert 7 // 2 == 3.5',
            'assert "py" in "python"',
          ],
          language: 'python',
          answer: 2,
          explain: '`//` is whole-number division, so `7 // 2` is 3, not 3.5.',
        },
        {
          kind: 'blank',
          prompt: 'Check that `double(4)` gives 8. Fill the gaps.',
          code: 'def double(n):\n    return n * 2\n\n___ double(4) ___ 8',
          language: 'python',
          bank: ['assert', '==', '=', 'check'],
          answers: ['assert', '=='],
          explain: '`==` compares two values. A single `=` would try to store a value, which is an error here.',
        },
        {
          kind: 'write',
          prompt: '`is_even` is already written. Under it, write three `assert` lines: `is_even(4)` is True, `is_even(7)` is False, and `is_even(0)` is True. Then print `3 checks passed`.',
          language: 'python',
          starter: `def is_even(n):
    return n % 2 == 0

# write three asserts, then the print
`,
          tests: [{ expected: '3 checks passed' }],
          hint: 'For example: assert is_even(4) == True. The print goes after all three asserts, so it only runs if none of them fail.',
          solution: `def is_even(n):
    return n % 2 == 0

assert is_even(4) == True
assert is_even(7) == False
assert is_even(0) == True
print("3 checks passed")
`,
          explain: 'The print is only reached when every assert before it was true. That is the simplest test file there is.',
        },
        {
          kind: 'choice',
          prompt: 'A file holds ten `assert` lines and nothing else. You run it and it prints nothing at all. What does that mean?',
          options: [
            'The file did not run',
            'All ten checks were true',
            'Asserts only work inside functions',
            'The first check failed quietly',
          ],
          answer: 1,
          explain: 'A passing assert is silent. A failing one is loud: it stops the program with an error.',
        },
        {
          kind: 'write',
          prompt: 'A stopped program tells you about one failure only. Finish `check` so it prints `PASS: ` and the name when `condition` is True, and `FAIL: ` and the name when it is False. (`shout` has a bug: it should never end with two exclamation marks. Leave the bug in.)',
          language: 'python',
          starter: `def shout(text):
    return text.upper() + "!"

def check(name, condition):
    print("PASS: " + name)

check("adds a bang", shout("hi") == "HI!")
check("keeps one bang", shout("hey!") == "HEY!")
check("empty text", shout("") == "!")
`,
          tests: [{ expected: 'PASS: adds a bang\nFAIL: keeps one bang\nPASS: empty text' }],
          hint: 'Inside check, use if condition: for the PASS line and else: for the FAIL line.',
          solution: `def shout(text):
    return text.upper() + "!"

def check(name, condition):
    if condition:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("adds a bang", shout("hi") == "HI!")
check("keeps one bang", shout("hey!") == "HEY!")
check("empty text", shout("") == "!")
`,
          explain: 'Now every check reports, even after one fails. The FAIL line points straight at the bug: "hey!" became "HEY!!".',
        },
        {
          kind: 'type',
          prompt: 'A feature worked last week. Your change today broke it. What is the one-word name for that kind of break?',
          accept: ['regression', 'a regression'],
          explain: 'A regression is something that used to work and no longer does. Catching them is the main job of a set of tests.',
        },
      ],
    },
    {
      id: 'u15-aaa',
      title: 'Arrange, act, assert',
      exercises: [
        {
          kind: 'concept',
          title: 'Three steps',
          body: 'Most tests have the same three parts.\n\n**Arrange**: set up the inputs. **Act**: call the code you are testing. **Assert**: check the result.\n\nLike testing a kettle: fill it, switch it on, check the water is hot.',
          code: 'def test_total():\n    prices = [2, 3]          # arrange\n    result = total(prices)   # act\n    assert result == 5       # assert',
          language: 'python',
        },
        {
          kind: 'steps',
          prompt: 'Each line comes from a test. Tap the part it belongs to.',
          cells: ['Arrange', 'Act', 'Assert'],
          steps: [
            { ask: 'cart = ["tea", "milk"]', answer: 0 },
            { ask: 'count = count_items(cart)', answer: 1 },
            { ask: 'assert count == 2', answer: 2 },
            { ask: 'user = {"name": "Ana", "age": 30}', answer: 0 },
          ],
          explain: 'Making data is arranging. Calling the function under test is acting. The `assert` line does the checking.',
        },
        {
          kind: 'order',
          prompt: 'Put this test in order: arrange, act, assert.',
          lines: [
            'def test_longest_word():',
            '    words = ["hi", "hello", "hey"]',
            '    result = longest(words)',
            '    assert result == "hello"',
          ],
          language: 'python',
          explain: 'The input has to exist before the call, and the result has to exist before you can check it.',
        },
        {
          kind: 'concept',
          title: 'One function per test',
          body: 'A **unit test** checks one small unit of code, usually one function.\n\nPut each test in its own function with a name starting `test_` that says what it checks. A test tool such as **pytest** finds every `test_` function, runs each one, and reports them one by one.',
        },
        {
          kind: 'choice',
          prompt: 'pytest runs every function whose name starts with `test_`. How many tests will it run in this file?',
          code: 'def add(a, b):\n    return a + b\n\ndef test_add_small_numbers():\n    assert add(2, 3) == 5\n\ndef test_add_negative():\n    assert add(-1, 1) == 0\n\ndef check_add_zero():\n    assert add(0, 0) == 0',
          language: 'python',
          options: ['1', '2', '3', '4'],
          answer: 1,
          explain: 'Only the two `test_` functions count. `check_add_zero` has the wrong prefix, so it is silently skipped: an easy mistake to make.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the **act** line of this test.',
          lines: [
            'def test_discount():',
            '    price = 200',
            '    final = apply_discount(price, 10)',
            '    assert final == 180',
          ],
          language: 'python',
          answer: 2,
          explain: 'The act is the call to the code being tested. The line before it arranges, the line after it asserts.',
        },
        {
          kind: 'choice',
          prompt: 'A test fails at 5 pm and all you see is its name. Which name helps you most?',
          options: ['test_total_of_empty_cart_is_zero', 'test1', 'test_total', 'test_it_works'],
          answer: 0,
          explain: 'A good name states the situation and the expected result. You know what broke before opening the file.',
        },
        {
          kind: 'write',
          prompt: '`total` has a hidden bug. Do not fix it: catch it. Write `test_two_items`, which checks that `total([2, 3])` is 5, and run it with `run` after `test_empty`.',
          language: 'python',
          starter: `def total(prices):
    result = 0
    for i in range(1, len(prices)):
        result += prices[i]
    return result

def run(test):
    try:
        test()
        print("PASS:", test.__name__)
    except AssertionError:
        print("FAIL:", test.__name__)

def test_empty():
    prices = []              # arrange
    result = total(prices)   # act
    assert result == 0       # assert

# write test_two_items here

run(test_empty)
# run your new test here
`,
          tests: [{ expected: 'PASS: test_empty\nFAIL: test_two_items' }],
          hint: 'Copy the shape of test_empty: prices = [2, 3], result = total(prices), assert result == 5. Then add run(test_two_items) at the bottom.',
          solution: `def total(prices):
    result = 0
    for i in range(1, len(prices)):
        result += prices[i]
    return result

def run(test):
    try:
        test()
        print("PASS:", test.__name__)
    except AssertionError:
        print("FAIL:", test.__name__)

def test_empty():
    prices = []              # arrange
    result = total(prices)   # act
    assert result == 0       # assert

def test_two_items():
    prices = [2, 3]
    result = total(prices)
    assert result == 5

run(test_empty)
run(test_two_items)
`,
          explain: 'A FAIL here is good news: your test found a real bug. The empty cart alone would never have shown it.',
        },
        {
          kind: 'write',
          prompt: 'Now fix the bug. The loop in `total` skips the first price. Change `total` so that both tests pass. Do not change the tests.',
          language: 'python',
          starter: `def total(prices):
    result = 0
    for i in range(1, len(prices)):
        result += prices[i]
    return result

def run(test):
    try:
        test()
        print("PASS:", test.__name__)
    except AssertionError:
        print("FAIL:", test.__name__)

def test_empty():
    assert total([]) == 0

def test_two_items():
    assert total([2, 3]) == 5

run(test_empty)
run(test_two_items)
`,
          tests: [{ expected: 'PASS: test_empty\nPASS: test_two_items' }],
          hint: 'range(1, len(prices)) starts at index 1. Start at 0: range(len(prices)).',
          solution: `def total(prices):
    result = 0
    for i in range(len(prices)):
        result += prices[i]
    return result

def run(test):
    try:
        test()
        print("PASS:", test.__name__)
    except AssertionError:
        print("FAIL:", test.__name__)

def test_empty():
    assert total([]) == 0

def test_two_items():
    assert total([2, 3]) == 5

run(test_empty)
run(test_two_items)
`,
          explain: 'The test went from FAIL to PASS, so you know the fix worked. It stays in the file to catch the bug if it ever returns.',
        },
        {
          kind: 'blank',
          prompt: 'Finish this pytest-style test. Fill the gaps.',
          code: 'def ___add_two_numbers():\n    result = add(2, 3)\n    ___ result == 5',
          language: 'python',
          bank: ['test_', 'assert', 'check_', 'return'],
          answers: ['test_', 'assert'],
          explain: 'The `test_` prefix lets the tool find it. `assert` does the checking. `return result == 5` would check nothing.',
        },
      ],
    },
    {
      id: 'u15-edges',
      title: 'Edge cases and boundaries',
      exercises: [
        {
          kind: 'concept',
          title: 'Where bugs hide',
          body: 'An **edge case** is an unusual input at the limit of what code handles: an empty list, zero, a negative number, one single item.\n\nA **boundary** is a value where behaviour changes, like age 18 for "adult". Test just below it, exactly on it, and just above it.',
        },
        {
          kind: 'steps',
          prompt: '`is_adult(age)` should be True from age 18 up. Tap the right age.',
          cells: ['16', '17', '18', '19', '20'],
          steps: [
            { ask: 'Which value is the boundary?', answer: 2 },
            { ask: 'Which value is just below it, and should give False?', answer: 1 },
            { ask: 'A buggy version checks age > 18. Which of these ages gets the wrong answer?', answer: 2 },
          ],
          explain: 'Mixing up `>` and `>=` only goes wrong on the boundary itself. Tests with 16 and 20 would never notice.',
        },
        {
          kind: 'spot',
          prompt: 'Delivery should be free for orders of 30 or more. Tap the line with the bug.',
          lines: ['def delivery_fee(total):', '    if total > 30:', '        return 0', '    return 4'],
          language: 'python',
          answer: 1,
          explain: 'An order of exactly 30 is charged 4. It should be `total >= 30`: a classic boundary bug.',
        },
        {
          kind: 'choice',
          prompt: '`longest(words)` returns the longest word in a list. Which input is the edge case most worth a test?',
          options: ['["cat", "horse"]', '["a", "bb", "ccc"]', '[]', '["dog", "bird"]'],
          answer: 2,
          explain: 'The other three are the same ordinary situation. An empty list is where code like this tends to crash.',
        },
        {
          kind: 'write',
          prompt: 'A score of 90 or more is an A, 80 or more is a B. `grade` has a boundary bug: catch it. Under the first check, add two more with exactly these names and values: `"90 is A"` and `"89 is B"`.',
          language: 'python',
          starter: `def grade(score):
    if score > 90:
        return "A"
    if score > 80:
        return "B"
    return "C"

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("95 is A", grade(95), "A")
`,
          tests: [{ expected: 'PASS: 95 is A\nFAIL: 90 is A\nPASS: 89 is B' }],
          hint: 'Follow the pattern: check("90 is A", grade(90), "A") and then check("89 is B", grade(89), "B").',
          solution: `def grade(score):
    if score > 90:
        return "A"
    if score > 80:
        return "B"
    return "C"

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("95 is A", grade(95), "A")
check("90 is A", grade(90), "A")
check("89 is B", grade(89), "B")
`,
          explain: 'A test with 95 passes happily. Only the value sitting on the boundary, 90, shows that `>` should be `>=`.',
        },
        {
          kind: 'concept',
          title: 'Pick values, not piles',
          body: 'You do not need hundreds of inputs. Scores of 91, 95 and 99 all behave the same way, so one of them is enough.\n\nSort inputs into groups that behave alike. Test one value from each group, then every boundary between groups.',
        },
        {
          kind: 'type',
          prompt: 'Tickets are free for ages under 5. You already test age 4. Which age sits right on the other side of the boundary and needs a test too? Type the number.',
          accept: ['5', 'five'],
          explain: 'Age 4 is the last free age and 5 is the first paid one. Testing both pins the boundary in place.',
        },
        {
          kind: 'write',
          prompt: '`in_range(n)` should be True for 1 to 10, including both ends. Write four checks in this order with these names: `"0 is out"`, `"1 is in"`, `"10 is in"`, `"11 is out"`. One of them will catch a bug.',
          language: 'python',
          starter: `def in_range(n):
    return n >= 1 and n < 10

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("0 is out", in_range(0), False)
`,
          tests: [{ expected: 'PASS: 0 is out\nPASS: 1 is in\nFAIL: 10 is in\nPASS: 11 is out' }],
          hint: 'Values that are in should give True: check("1 is in", in_range(1), True). Values that are out should give False.',
          solution: `def in_range(n):
    return n >= 1 and n < 10

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("0 is out", in_range(0), False)
check("1 is in", in_range(1), True)
check("10 is in", in_range(10), True)
check("11 is out", in_range(11), False)
`,
          explain: 'A range has two boundaries, so it needs four tests: both ends and one step outside each.',
        },
        {
          kind: 'write',
          prompt: 'The third check crashes the program: you cannot divide by zero items. Change `average` so that an empty list gives 0 and all three checks pass.',
          language: 'python',
          starter: `def average(numbers):
    return sum(numbers) / len(numbers)

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("three numbers", average([2, 4, 6]), 4)
check("one number", average([7]), 7)
check("empty list", average([]), 0)
`,
          tests: [{ expected: 'PASS: three numbers\nPASS: one number\nPASS: empty list' }],
          hint: 'At the top of average: if len(numbers) == 0, return 0.',
          solution: `def average(numbers):
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

check("three numbers", average([2, 4, 6]), 4)
check("one number", average([7]), 7)
check("empty list", average([]), 0)
`,
          explain: 'The edge-case test found a crash before any user did. Empty input is the first edge case to try on anything that takes a list.',
        },
        {
          kind: 'match',
          prompt: 'Match each kind of input to the edge cases worth testing.',
          pairs: [
            ['A list', 'Empty, or just one item'],
            ['A number', 'Zero and negatives'],
            ['Text', 'An empty string, or only spaces'],
            ['A range like 1 to 10', 'Both ends, and one step outside'],
          ],
          explain: 'These few habits catch a large share of real bugs. Ask "what is the smallest, emptiest, strangest input?"',
        },
      ],
    },
    {
      id: 'u15-errors',
      title: 'Errors and test-first',
      exercises: [
        {
          kind: 'concept',
          title: 'Sometimes failing is correct',
          body: 'Good code refuses bad input by raising an error, such as `ValueError`. That deserves a test too.\n\nCall the code with bad input inside `try`. The test passes only if the right error is raised. If the call finishes normally, the test fails.',
          code: 'try:\n    int("abc")\n    print("FAIL: no error")\nexcept ValueError:\n    print("PASS")',
          language: 'python',
        },
        {
          kind: 'order',
          prompt: '`set_age(-5)` should raise a `ValueError`. Put the test in order.',
          lines: [
            'try:',
            '    set_age(-5)',
            '    print("FAIL: no error raised")',
            'except ValueError:',
            '    print("PASS: negative age refused")',
          ],
          language: 'python',
          explain: 'If the call raises, Python jumps straight to `except` and prints PASS. The FAIL line is reached only when no error happened.',
        },
        {
          kind: 'choice',
          prompt: 'In that test, suppose `set_age(-5)` has a bug and quietly accepts the negative age. What does the test print?',
          options: [
            'PASS: negative age refused',
            'Nothing at all',
            'FAIL: no error raised',
            'A ValueError message',
          ],
          answer: 2,
          explain: 'With no error, the line after the call runs. That is why the FAIL print sits right under the call.',
        },
        {
          kind: 'blank',
          prompt: 'pytest has a shorter way to say "this block must raise this error". Fill the gaps.',
          code: 'import pytest\n\ndef test_negative_age_is_refused():\n    with pytest.___(___):\n        set_age(-5)',
          language: 'python',
          bank: ['raises', 'ValueError', 'assert', 'except'],
          answers: ['raises', 'ValueError'],
          explain: '`pytest.raises(ValueError)` passes if the block raises that error and fails if it does not. It is the try/except test in two lines.',
        },
        {
          kind: 'write',
          prompt: '`withdraw` should raise `ValueError` when the amount is more than the balance, but it does not. Catch the bug: after the first test, write a second try/except that calls `withdraw(50, 80)` and prints `FAIL: overdraw` if no error is raised, or `PASS: overdraw` if a `ValueError` is raised.',
          language: 'python',
          starter: `def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must be positive")
    return balance - amount

try:
    withdraw(50, -10)
    print("FAIL: negative amount")
except ValueError:
    print("PASS: negative amount")

# test the overdraw here
`,
          tests: [{ expected: 'PASS: negative amount\nFAIL: overdraw' }],
          hint: 'Copy the first try/except. Change the call to withdraw(50, 80) and the two messages to use the word overdraw.',
          solution: `def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must be positive")
    return balance - amount

try:
    withdraw(50, -10)
    print("FAIL: negative amount")
except ValueError:
    print("PASS: negative amount")

try:
    withdraw(50, 80)
    print("FAIL: overdraw")
except ValueError:
    print("PASS: overdraw")
`,
          explain: 'The function handed back a balance of -30 without complaint. Your test proves the missing check before a customer finds it.',
        },
        {
          kind: 'concept',
          title: 'Test first',
          body: 'Try writing the test **before** the code.\n\n**Red**: the test fails, because the code is not there yet. **Green**: write just enough code to pass. **Refactor**: tidy up while the test stays green.\n\nIt makes you decide what "working" means before you start.',
        },
        {
          kind: 'steps',
          prompt: 'You are building `initials(name)` test-first. Tap the stage you are in.',
          cells: ['Red: failing test', 'Green: make it pass', 'Refactor: tidy up'],
          steps: [
            { ask: 'You write test_initials. It fails: the function does not exist yet.', answer: 0 },
            { ask: 'You write the shortest code that makes the test pass.', answer: 1 },
            { ask: 'You rename a confusing variable and run the tests again.', answer: 2 },
            { ask: 'A new rule arrives: handle middle names. Which stage comes first?', answer: 0 },
          ],
          explain: 'Every new behaviour starts with a failing test. Seeing it fail first proves the test can actually catch something.',
        },
        {
          kind: 'write',
          prompt: 'The tests are already written, and one fails. Make them all pass: change `withdraw` so it also raises `ValueError` when `amount` is more than `balance`. Do not change the tests.',
          language: 'python',
          starter: `def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must be positive")
    return balance - amount

if withdraw(50, 20) == 30:
    print("PASS: normal")
else:
    print("FAIL: normal")

try:
    withdraw(50, -10)
    print("FAIL: negative amount")
except ValueError:
    print("PASS: negative amount")

try:
    withdraw(50, 80)
    print("FAIL: overdraw")
except ValueError:
    print("PASS: overdraw")
`,
          tests: [{ expected: 'PASS: normal\nPASS: negative amount\nPASS: overdraw' }],
          hint: 'Add a second check inside withdraw: if amount > balance, raise ValueError("not enough money").',
          solution: `def withdraw(balance, amount):
    if amount < 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError("not enough money")
    return balance - amount

if withdraw(50, 20) == 30:
    print("PASS: normal")
else:
    print("FAIL: normal")

try:
    withdraw(50, -10)
    print("FAIL: negative amount")
except ValueError:
    print("PASS: negative amount")

try:
    withdraw(50, 80)
    print("FAIL: overdraw")
except ValueError:
    print("PASS: overdraw")
`,
          explain: 'Red, then green. The "normal" test matters too: it shows your new check did not break ordinary withdrawals.',
        },
        {
          kind: 'write',
          prompt: 'Test-first: the tests exist, the code does not. Write `initials` so every assert passes. It returns the first letter of each word, in capitals.',
          language: 'python',
          starter: `def initials(name):
    return ""

assert initials("ada lovelace") == "AL"
assert initials("grace") == "G"
assert initials("") == ""
print("all tests passed")
`,
          tests: [{ expected: 'all tests passed' }],
          hint: 'Loop over name.split(). For each word, add word[0].upper() to a result string.',
          solution: `def initials(name):
    result = ""
    for word in name.split():
        result += word[0].upper()
    return result

assert initials("ada lovelace") == "AL"
assert initials("grace") == "G"
assert initials("") == ""
print("all tests passed")
`,
          explain: 'The asserts told you exactly what to build, edge case included. `"".split()` gives an empty list, so the loop simply does nothing.',
        },
        {
          kind: 'spot',
          prompt: 'This test should prove that `divide(1, 0)` raises an error. But it can never fail. Tap the line that makes it useless.',
          lines: [
            'try:',
            '    divide(1, 0)',
            '    print("PASS")',
            'except ZeroDivisionError:',
            '    print("PASS: error raised")',
          ],
          language: 'python',
          answer: 2,
          explain: 'If no error is raised, that line still prints PASS. It should print FAIL. A test that cannot fail tells you nothing.',
        },
      ],
    },
    {
      id: 'u15-ci',
      title: 'Fakes, CI and failure reports',
      exercises: [
        {
          kind: 'concept',
          title: 'What to test',
          body: 'Test your own logic: calculations, decisions, edge cases.\n\nDo not test Python itself (`len` works), and do not test tiny details that change weekly.\n\nTest **behaviour**: what goes in and what comes out. Then your tests keep passing when you tidy the inside of a function.',
        },
        {
          kind: 'choice',
          prompt: 'You have time for one more test. Which is most worth writing?',
          options: [
            'That print() prints',
            'That a late fee is worked out correctly from two dates',
            'That a list gets longer after append',
            'That the constant MAX_ITEMS equals MAX_ITEMS',
          ],
          answer: 1,
          explain: 'The late fee is your own logic with real money attached, and dates are full of edge cases. The others test Python, which already works.',
        },
        {
          kind: 'concept',
          title: 'Fakes',
          body: 'Some code depends on things that are slow or keep changing: the clock, the network, a real database.\n\nIn a test, hand it a **fake**: a simple stand-in that gives fixed answers. A **mock** is a fake that also records how it was used. Now the test is fast and gives the same result every run.',
        },
        {
          kind: 'write',
          prompt: '`greeting` asks a clock for the hour, so its answer changes during the day. Write a class `FakeClock` that is created with an hour and has a method `hour()` that returns it. Store the number as `self.fixed`.',
          language: 'python',
          starter: `def greeting(clock):
    if clock.hour() < 12:
        return "Good morning"
    return "Good afternoon"

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

class FakeClock:
    pass

check("morning", greeting(FakeClock(9)), "Good morning")
check("afternoon", greeting(FakeClock(15)), "Good afternoon")
check("noon", greeting(FakeClock(12)), "Good afternoon")
`,
          tests: [{ expected: 'PASS: morning\nPASS: afternoon\nPASS: noon' }],
          hint: 'Give the class def __init__(self, fixed): self.fixed = fixed, and def hour(self): return self.fixed.',
          solution: `def greeting(clock):
    if clock.hour() < 12:
        return "Good morning"
    return "Good afternoon"

def check(name, got, want):
    if got == want:
        print("PASS: " + name)
    else:
        print("FAIL: " + name)

class FakeClock:
    def __init__(self, fixed):
        self.fixed = fixed

    def hour(self):
        return self.fixed

check("morning", greeting(FakeClock(9)), "Good morning")
check("afternoon", greeting(FakeClock(15)), "Good afternoon")
check("noon", greeting(FakeClock(12)), "Good afternoon")
`,
          explain: 'With a fake clock you can test morning, afternoon and the noon boundary at any time of day. The real clock would give one answer per run.',
        },
        {
          kind: 'choice',
          prompt: 'Your checkout code calls a payment service over the internet. Why use a fake payment service in tests?',
          options: [
            'The real one is slow, may cost money, and can fail for reasons that are not your bug',
            'Fakes make the real service faster',
            'Tests are not allowed to use the internet',
            'So the checkout code never needs testing',
          ],
          answer: 0,
          explain: 'A test should fail only when your code is wrong. A fake removes the slow, costly, unreliable parts you do not control.',
        },
        {
          kind: 'concept',
          title: 'Tests that run themselves',
          body: 'People forget to run tests. So teams set up **continuous integration** (CI): a server that runs every test automatically on each push or pull request.\n\nA green tick means all passed. A red cross means something failed, and the change should not be merged until it is fixed.',
        },
        {
          kind: 'steps',
          prompt: 'You open a pull request on a project with CI. Tap what happens next each time.',
          cells: ['Push your branch', 'CI runs the tests', 'Read the failure', 'Fix and push again', 'Merge'],
          steps: [
            { ask: 'You have just pushed. What happens with no one lifting a finger?', answer: 1 },
            { ask: 'CI shows a red cross. What do you do first?', answer: 2 },
            { ask: 'You found the cause: your change broke an edge case. Next?', answer: 3 },
            { ask: 'CI is green and a reviewer approved. What now?', answer: 4 },
          ],
          explain: 'CI is a safety net for the whole team: broken code is caught before it reaches `main`, even if you forgot to run the tests.',
        },
        {
          kind: 'spot',
          prompt: 'This is a pytest-style failure report. Tap the line that shows what the code actually returned, next to what was expected.',
          lines: [
            'test_cart.py::test_empty_cart PASSED',
            'test_cart.py::test_two_items FAILED',
            '    assert total([2, 3]) == 5',
            'E   assert 3 == 5',
            '1 failed, 1 passed',
          ],
          answer: 3,
          explain: 'The `E` line fills in the real values: the code gave 3 where 5 was expected. Start reading a failure there.',
        },
        {
          kind: 'type',
          prompt: 'Read this report. What number did `area(4, 5)` return? Type it.',
          code: 'test_shapes.py::test_area FAILED\n    assert area(4, 5) == 20\nE   assert 9 == 20\n1 failed, 6 passed',
          accept: ['9', 'nine'],
          explain: 'The left side of the `E` line is what the code gave: 9. It looks like `area` adds where it should multiply.',
        },
        {
          kind: 'write',
          prompt: 'Build a tiny test runner. Run each test in `tests`. If it raises `AssertionError`, print `FAIL: ` and the test name, and count it as failed. Otherwise count it as passed. The last line then prints the totals.',
          language: 'python',
          starter: `def test_add():
    assert 2 + 3 == 5

def test_upper():
    assert "hi".upper() == "HI"

def test_negative():
    assert abs(-4) == -4

tests = [test_add, test_upper, test_negative]
passed = 0
failed = 0
for test in tests:
    test()
    passed += 1
print(passed, "passed,", failed, "failed")
`,
          tests: [{ expected: 'FAIL: test_negative\n2 passed, 1 failed' }],
          hint: 'Wrap the two lines in try:. Add except AssertionError: with print("FAIL: " + test.__name__) and failed += 1.',
          solution: `def test_add():
    assert 2 + 3 == 5

def test_upper():
    assert "hi".upper() == "HI"

def test_negative():
    assert abs(-4) == -4

tests = [test_add, test_upper, test_negative]
passed = 0
failed = 0
for test in tests:
    try:
        test()
        passed += 1
    except AssertionError:
        print("FAIL: " + test.__name__)
        failed += 1
print(passed, "passed,", failed, "failed")
`,
          explain: 'That is the heart of every test tool: run each test, catch the failures, keep going, and report the totals at the end.',
        },
      ],
    },
  ],
}
