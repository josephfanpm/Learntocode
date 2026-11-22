import type { Unit } from '../types'

export const u36: Unit = {
  id: 'u36',
  week: 11,
  course: 'ai',
  title: 'Working with coding agents',
  summary: 'Good tasks, review and guard rails',
  lessons: [
    {
      id: 'u36-tasks',
      title: 'Giving a good task',
      exercises: [
        {
          kind: 'concept',
          title: 'Three parts of a good task',
          body: 'A coding agent is fast, but it cannot read your mind. Give it three things.\n\nThe **goal**: what should be true when it is done. The **context**: which files, what you tried, what must not change. And **how to verify**: a test or command that shows it worked.\n\nBrief it like a capable new teammate.',
        },
        {
          kind: 'choice',
          prompt: 'Which task description gives a coding agent the best chance?',
          options: [
            '"Fix the login."',
            '"Login is broken, please sort it out quickly."',
            '"Users with an expired session get a blank page. They should be sent to /login. The check is in auth/session.py. Run pytest tests/test_session.py to confirm."',
            '"Make the auth code more robust and modern."',
          ],
          answer: 2,
          explain: 'It names the symptom, the wanted result, where to look and how to check. The others leave the agent to guess all four.',
        },
        {
          kind: 'match',
          prompt: 'Match each sentence from a task to the part it plays.',
          pairs: [
            ['Goal', 'Expired sessions should lead to the login page'],
            ['Context', 'The session check lives in auth/session.py'],
            ['How to verify', 'Run pytest tests/test_session.py'],
            ['Limit', 'Do not change the database tables'],
          ],
          explain: 'Goal says where to end up, context says where to start, the check says how to know, and limits say what to leave alone.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line in this task that is too vague to act on.',
          lines: [
            'Bug: the export button gives an empty CSV for orders after 1 March.',
            'The export code is in reports/export.py.',
            'Also make it better.',
            'Check: pytest tests/test_export.py should pass.',
          ],
          answer: 2,
          explain: '"Better" could mean faster, shorter, prettier or anything else. The agent will pick one, and probably not the one you had in mind.',
        },
        {
          kind: 'concept',
          title: 'Hand over the real thing',
          body: 'If you have the error message, paste it. If a test fails, name it. If another file already does it the right way, point at it.\n\nThe exact thing beats your summary of it, because a summary drops the details that matter.',
        },
        {
          kind: 'choice',
          prompt: 'Your script crashes. Which message helps the agent most?',
          options: [
            '"It crashed again, same as before."',
            '"There is some kind of error with the dates I think."',
            '"Why is Python like this?"',
            'The command you ran, followed by the full error text copied from the terminal',
          ],
          answer: 3,
          explain: 'The error text names the file, the line and the kind of failure. Your memory of it is always less exact than the original.',
        },
        {
          kind: 'order',
          prompt: 'Build a task message. Put the lines in this order: goal, where, limits, how to verify.',
          lines: [
            'Goal: the signup form should reject passwords shorter than 8 characters.',
            'Where: the checks are in forms/signup.py.',
            'Keep: the wording style of the existing error messages.',
            'Verify: add a test for a 7-character password, then run pytest.',
          ],
          explain: 'The order is less important than having all four. Leading with the goal makes sure everything after it is read in the right light.',
        },
        {
          kind: 'type',
          prompt: 'A task says what to change and which file to change, but gives no way to check the result. Which part is missing: goal, context or verify?',
          accept: ['verify', 'verification', 'how to verify', 'the verify part'],
          explain: 'Without a check, "done" only means "looks done". With one, the agent can test its own work and keep going until it passes.',
        },
        {
          kind: 'choice',
          prompt: 'You want to ask: "Make the whole app faster." What is a better first task?',
          options: [
            '"The orders page takes 6 seconds to load. Find out why and get it under 1 second. Time it before and after."',
            '"Make the whole app much, much faster."',
            '"Rewrite everything in a faster language."',
            '"Optimise all the files, starting from A."',
          ],
          answer: 0,
          explain: 'One page, one number, one way to measure. A task you can finish and check beats a wish you cannot.',
        },
      ],
    },
    {
      id: 'u36-small-steps',
      title: 'Small steps, clean Git',
      exercises: [
        {
          kind: 'concept',
          title: 'Save point first',
          body: 'Before the agent starts, commit your own work so that `git status` is clean.\n\nNow everything that changes is the agent\'s. You can see it all with `git diff`, and throw it all away if it goes wrong. It is like saving the game before the boss fight.',
        },
        {
          kind: 'choice',
          prompt: 'Why start an agent task from a clean Git state?',
          options: [
            'Agents refuse to run when files are uncommitted',
            'It makes the model think faster',
            'You can tell the agent\'s changes apart from yours, and undo only its changes',
            'Git deletes uncommitted files after an hour',
          ],
          answer: 2,
          explain: 'If your half-finished edits are mixed in, the diff shows both and undoing loses both. A commit draws the line between your work and its work.',
        },
        {
          kind: 'order',
          prompt: 'Put this loop for working with an agent in order.',
          lines: [
            'Commit your own work so the state is clean',
            'Give the agent one small task',
            'Read the diff',
            'Run the tests',
            'Commit with a clear message',
            'Move on to the next small task',
          ],
          explain: 'Each trip round the loop ends with a commit, so you are never more than one small step away from a state that works.',
        },
        {
          kind: 'concept',
          title: 'Small steps',
          body: 'Ask for one change at a time: one bug, one function, one screen.\n\nA 30-line diff you will really read. A 900-line diff you will skim, and the mistake hides in the part you skimmed. Small steps also mean a bad result costs you minutes, not an afternoon.',
        },
        {
          kind: 'steps',
          prompt: 'The agent has finished a step. Tap what you should do next.',
          cells: ['Commit it', 'Ask for a fix', 'Discard it and ask again'],
          steps: [
            { ask: 'The diff is small, you understand every line, and the tests pass.', answer: 0 },
            { ask: 'The change works, but one new function has a misleading name.', answer: 1 },
            { ask: 'It rewrote 14 files you never mentioned, and the approach is wrong.', answer: 2 },
          ],
          explain: 'Good work gets committed, nearly-good work gets a nudge, and a wrong direction is cheaper to throw away than to repair.',
        },
        {
          kind: 'type',
          prompt: 'Which Git command shows the changes made to your files since the last commit? Type the two words.',
          accept: ['git diff'],
          explain: '`git diff` shows every added and removed line. It is the agent\'s actual work, whatever its summary said.',
        },
        {
          kind: 'spot',
          prompt: 'You asked for one thing: "fix the typo in the README". This is what changed. Tap the line you should look into first.',
          lines: [
            'On branch fix-readme-typo',
            'modified:   README.md',
            'modified:   src/payments/charge.py',
            'no other files changed',
          ],
          answer: 2,
          explain: 'A typo fix has no business in the payment code. An unrequested change is the first place to look, however small it seems.',
        },
        {
          kind: 'choice',
          prompt: 'You started clean. The agent\'s change turns out to be wrong from top to bottom. What is the easiest way forward?',
          options: [
            'Fix each wrong line by hand, one at a time',
            'Use Git to discard the uncommitted changes, then ask again with a clearer task',
            'Ask the agent to patch its patch, again and again',
            'Commit it anyway and fix it next week',
          ],
          answer: 1,
          explain: 'Because nothing of yours is mixed in, throwing the changes away costs nothing. That is what the clean start was for.',
        },
        {
          kind: 'choice',
          prompt: 'The feature is "user profiles": a database table, an API, a page and a welcome email. How should you hand it to an agent?',
          options: [
            'All four in one message, then review once at the end',
            'Start with the email, since it is the most fun',
            'In four separate sessions running at the same time on the same files',
            'One piece at a time, checking and committing after each',
          ],
          answer: 3,
          explain: 'Each piece builds on the last. If the table is wrong, you want to know before the API, the page and the email are built on top of it.',
        },
        {
          kind: 'type',
          prompt: 'You commit after each small step. Steps 1, 2 and 3 are committed. Step 4 goes badly wrong. How many steps of finished work are safe in Git? Type the number.',
          accept: ['3', 'three'],
          explain: 'Only step 4 is lost. With one giant step and no commits, the answer would have been zero.',
        },
      ],
    },
    {
      id: 'u36-tests',
      title: 'Tests as guard rails',
      exercises: [
        {
          kind: 'concept',
          title: 'Tests are the guard rail',
          body: 'A test is a small program that checks your code. With tests, the agent can run them, see a failure and fix its own work. And you get proof, not "it should work now".\n\nA strong habit: ask for the test first, watch it fail, then ask for the fix.',
        },
        {
          kind: 'order',
          prompt: 'Put this bug-fixing routine in order.',
          lines: [
            'Write a test that shows the bug',
            'Run the test and watch it fail',
            'Ask the agent to fix the code without touching the test',
            'Run the test and watch it pass',
            'Run all the other tests as well',
          ],
          explain: 'A test that fails first proves it really detects the bug. Running everything at the end proves the fix broke nothing else.',
        },
        {
          kind: 'concept',
          title: 'The cheap way to pass',
          body: 'Told to "make the tests pass", an agent has two roads: fix the code, or weaken the test.\n\nWeakening looks like a deleted `assert`, an expected value changed to match the bug, a skipped test, or a `try` that swallows the failure. Read every change to a test file with extra care.',
        },
        {
          kind: 'spot',
          prompt: 'The agent says "tests pass now". This is its diff: `-` lines were removed and `+` lines were added. Tap the line where the test was weakened.',
          lines: [
            ' def test_total_with_tax():',
            '     cart = Cart([10, 20])',
            '-    assert cart.total(tax=0.1) == 33',
            '+    assert cart.total(tax=0.1) > 0',
          ],
          language: 'python',
          answer: 3,
          explain: 'The old test demanded exactly 33. The new one accepts any positive number, so it passes even when the tax is wrong.',
        },
        {
          kind: 'spot',
          prompt: 'Another diff from the same session. Tap the added line that quietly switches a test off.',
          lines: [
            ' def test_refund_cannot_exceed_payment():',
            '+    return  # TODO: turn back on later',
            '     payment = Payment(50)',
            '     assert payment.refund(80) == "error"',
          ],
          language: 'python',
          answer: 1,
          explain: 'The early `return` ends the test before its assert runs. It will show as passing for ever while checking nothing.',
        },
        {
          kind: 'type',
          prompt: 'A cart holds two items costing 10 and 20. Tax is 10%. What total should the test expect? Type the number.',
          accept: ['33', '33.0'],
          explain: '10 + 20 = 30, and 10% of 30 is 3, so 33. Working one case out by hand tells you whether the code or the test is wrong.',
        },
        {
          kind: 'choice',
          prompt: 'The agent changed a test\'s expected value from 33 to 30 "to match the actual output". What is the best response?',
          options: [
            'Accept it: the agent knows the code best',
            'Delete the test so the question goes away',
            'Work the case out by hand, then tell it: "33 is correct. Put the test back and fix total() instead."',
            'Change the tax rate until 30 is right',
          ],
          answer: 2,
          explain: 'The test was describing what the code should do. Changing it to match a bug turns the guard rail into a decoration.',
        },
        {
          kind: 'write',
          prompt:
            'An agent wrote `average`, but two of the three tests fail. Fix the function so that the average of `2 3` prints `2.5`, an empty line of input prints `0`, and `4 4 4` prints `4.0`. Leave the last two lines alone.',
          language: 'python',
          starter: `def average(numbers):
    return sum(numbers) // len(numbers)

numbers = [int(word) for word in input().split()]
print(average(numbers))
`,
          tests: [
            { stdin: ['2 3'], expected: '2.5' },
            { stdin: [''], expected: '0' },
            { stdin: ['4 4 4'], expected: '4.0' },
          ],
          hint: 'Two bugs. `//` throws away the decimal part, so use `/`. And an empty list divides by zero, so return 0 first `if not numbers`.',
          solution: `def average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

numbers = [int(word) for word in input().split()]
print(average(numbers))
`,
          explain: 'The code looked fine and worked for `4 4 4`. Only the tests for an uneven split and for no numbers at all showed the two mistakes.',
        },
        {
          kind: 'write',
          prompt:
            'An agent wrote a password check. The rule is: at least 8 characters, and at least one digit. Its version gets the tests wrong. Fix `is_valid` so the program prints `valid` or `invalid` correctly.',
          language: 'python',
          starter: `def is_valid(password):
    return len(password) > 8 and password.isdigit()

if is_valid(input()):
    print("valid")
else:
    print("invalid")
`,
          tests: [
            { stdin: ['abcdefg1'], expected: 'valid' },
            { stdin: ['abc1'], expected: 'invalid' },
            { stdin: ['abcdefgh'], expected: 'invalid' },
          ],
          hint: '"At least 8" is `>= 8`. And `password.isdigit()` asks whether every character is a digit. Loop over the characters and remember if any one is.',
          solution: `def is_valid(password):
    has_digit = False
    for ch in password:
        if ch.isdigit():
            has_digit = True
    return len(password) >= 8 and has_digit

if is_valid(input()):
    print("valid")
else:
    print("invalid")
`,
          explain: 'Both bugs read naturally: `> 8` sounds like "8 or more", and `isdigit()` sounds like "has a digit". Tests at the exact boundary catch what reading misses.',
        },
        {
          kind: 'choice',
          prompt: 'The agent reports: "All tests pass!" What should you still do before trusting that?',
          options: [
            'Nothing: a passing report is proof',
            'Ask it to say so again, more confidently',
            'Delete the tests now that they have done their job',
            'Run the tests yourself and read the diff of the test files',
          ],
          answer: 3,
          explain: 'The report is a claim. Running the tests checks that they pass, and reading their diff checks that they still test something.',
        },
      ],
    },
    {
      id: 'u36-review',
      title: 'Reading the diff',
      exercises: [
        {
          kind: 'concept',
          title: 'Read every diff',
          body: 'The diff is the agent\'s actual work. Its summary is only its opinion of the work. Read every changed line before you accept.\n\nHunt for four things: **wrong assumptions**, **deleted checks**, **invented functions or packages**, and **weakened tests**.',
        },
        {
          kind: 'spot',
          prompt: 'The agent "simplified" this function. Lines starting with `-` were removed. Tap the removed `if` line that was protecting users.',
          lines: [
            ' def withdraw(account, amount):',
            '-    if amount > account.balance:',
            '-        raise ValueError("not enough money")',
            '     account.balance -= amount',
            '     return account.balance',
          ],
          language: 'python',
          answer: 1,
          explain: 'Without that check, an account can go below zero. Shorter code is not simpler if it does less: always ask why a check was removed.',
        },
        {
          kind: 'spot',
          prompt: 'This new function looks tidy, but one line calls something that does not exist in Python\'s `json` module. Tap it.',
          lines: ['import json', 'def load_settings(path):', '    with open(path) as f:', '        return json.parse_file(f)'],
          language: 'python',
          answer: 3,
          explain: 'The real function is `json.load(f)`. Models sometimes produce a name that sounds right but was never real, so run the code before you believe it.',
        },
        {
          kind: 'choice',
          prompt: 'The diff adds `import quickdatefix` and the agent says to install that package. You have never heard of it. What do you do?',
          options: [
            'Install it at once: the agent chose it for a reason',
            'Check that the package really exists and is what it claims to be, or ask for a solution using the standard library',
            'Install three packages with similar names to be safe',
            'Ignore the import and hope it is not needed',
          ],
          answer: 1,
          explain: 'A model can invent a package name. Installing an unknown package means running a stranger\'s code on your machine, so look before you install.',
        },
        {
          kind: 'concept',
          title: 'Wrong assumptions',
          body: 'An agent fills gaps with guesses: that a list is never empty, that a price is in dollars and not cents, that "at least 18" means "over 18".\n\nThe code looks neat and runs, but it answers a slightly different question. Compare what was built with what you asked, edge cases first.',
        },
        {
          kind: 'spot',
          prompt: 'The task said: "Prices are stored in cents. Show them in dollars." Tap the line with the wrong assumption.',
          lines: ['def show_price(cents):', '    dollars = cents / 10', '    return "$" + format(dollars, ".2f")'],
          language: 'python',
          answer: 1,
          explain: 'There are 100 cents in a dollar, not 10. The function runs without error and prints a neat price that is ten times too big.',
        },
        {
          kind: 'write',
          prompt:
            'The task was: "Return the names of users who are at least 18, in the same order they were given." The agent\'s version is subtly wrong in two ways. Fix `adults`. Input looks like `ana:18 bo:17 cy:40` and the program prints the names separated by spaces.',
          language: 'python',
          starter: `def adults(users):
    result = []
    for name, age in users:
        if age > 18:
            result.append(name)
    return sorted(result)

users = []
for item in input().split():
    name, age = item.split(":")
    users.append((name, int(age)))
print(" ".join(adults(users)))
`,
          tests: [
            { stdin: ['ana:18 bo:17 cy:40'], expected: 'ana cy' },
            { stdin: ['zed:30 amy:19'], expected: 'zed amy' },
            { stdin: ['kim:18'], expected: 'kim' },
          ],
          hint: '"At least 18" includes 18, so use `>=`. And the task asked for the original order, so return `result` without sorting it.',
          solution: `def adults(users):
    result = []
    for name, age in users:
        if age >= 18:
            result.append(name)
    return result

users = []
for item in input().split():
    name, age = item.split(":")
    users.append((name, int(age)))
print(" ".join(adults(users)))
`,
          explain: 'Neither bug crashes. One drops people who are exactly 18, the other reorders the list. Only comparing the code with the request reveals them.',
        },
        {
          kind: 'concept',
          title: 'Make it explain itself',
          body: 'Ask the agent: "Explain this change line by line." "What did you assume?" "What could break?" "Review this diff as if someone else wrote it."\n\nA second look often catches its own mistakes. And if you still cannot understand a change after that, do not accept it.',
        },
        {
          kind: 'choice',
          prompt: 'You notice the agent removed the balance check from `withdraw`. Which reply is the most useful?',
          options: [
            '"Looks good, thanks!"',
            '"This is all wrong. Start the whole project again."',
            '"You removed the balance check in withdraw. Put it back, and add a test for withdrawing more than the balance."',
            'Say nothing, and quietly fix it yourself later',
          ],
          answer: 2,
          explain: 'It names the exact problem, says what to do, and asks for a test so the check cannot quietly vanish again.',
        },
        {
          kind: 'type',
          prompt: 'The agent says this returns the number of pages needed. With 11 items and 5 per page, what does it return? Type the number.',
          code: 'def count_pages(items, per_page):\n    return items // per_page',
          language: 'python',
          accept: ['2', 'two'],
          explain: 'It returns 2, but 11 items need 3 pages. Trying one small example in your head is the quickest review tool you have.',
        },
      ],
    },
    {
      id: 'u36-responsible',
      title: 'Staying the engineer',
      exercises: [
        {
          kind: 'concept',
          title: 'Know when to take over',
          body: 'An agent can get stuck in a loop: fix, break, fix again. If you have corrected the same thing twice, stop.\n\nStart a fresh session with a better task, or make the change by hand. A two-line fix that you understand is often quicker to type than to explain.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the best way to handle each job.',
          cells: ['Let the agent do it', 'Do it by hand', 'Fresh session, better task'],
          steps: [
            { ask: 'Rename a function in 30 files. There are tests to check the result.', answer: 0 },
            { ask: 'Change one number in a settings file you already have open.', answer: 1 },
            { ask: 'Third attempt at the same bug. Each fix breaks something else.', answer: 2 },
            { ask: 'Write tests for six functions that all look alike.', answer: 0 },
          ],
          explain: 'Agents shine on wide, repetitive, checkable work. Tiny edits are quicker by hand, and a tangled session is best restarted.',
        },
        {
          kind: 'concept',
          title: 'Secrets stay out',
          body: 'Never paste passwords, API keys or customer data into a prompt, and never commit them.\n\nKeep keys in environment variables, or in a file listed in `.gitignore`. What you paste is sent to the model provider. What you commit stays in the Git history.',
        },
        {
          kind: 'spot',
          prompt: 'You are about to send this task to a coding agent. Tap the line that must not be sent.',
          lines: [
            'The upload fails with a 403 error.',
            'The code is in storage/upload.py.',
            'Here is our live key so you can test: AKIA7Q2EXAMPLEKEY99',
            'Run pytest tests/test_upload.py to check.',
          ],
          answer: 2,
          explain: 'The agent does not need the real key to read the code and fix the bug. Once pasted, the key has left your machine.',
        },
        {
          kind: 'spot',
          prompt: 'The agent added these lines to a config file. Tap the line that must not be committed.',
          lines: ['+import os', '+API_URL = "https://api.example.com"', '+API_KEY = "sk-live-4f9a8b7c6d5e"', '+TIMEOUT = 30'],
          language: 'python',
          answer: 2,
          explain: 'A key written into the code is copied to everyone who has the repository. Read it from the environment, for example `os.environ["API_KEY"]`.',
        },
        {
          kind: 'choice',
          prompt: 'You realise you pasted a real API key into a prompt an hour ago. What is the right move?',
          options: [
            'Delete the message and forget about it',
            'Ask the model to forget the key',
            'Treat the key as leaked: cancel it and create a new one',
            'Wait and see whether anything bad happens',
          ],
          answer: 2,
          explain: 'You cannot un-send it. Replacing the key makes the leaked copy useless, which is the only fix that works.',
        },
        {
          kind: 'concept',
          title: 'Time and cost',
          body: 'Everything in a session is re-read at every step, so long sessions cost more and run slower. Start fresh for a new task.\n\nBigger models reason better but are slower and cost more. A smaller model is fine for simple, repetitive jobs. Match the model to the task.',
        },
        {
          kind: 'choice',
          prompt: 'Which job most deserves the largest, slowest model?',
          options: [
            'Adding the same comment to the top of 50 files',
            'Planning how to move live customer data to a new table layout without losing any',
            'Renaming a variable',
            'Fixing the spacing in one file',
          ],
          answer: 1,
          explain: 'Hard reasoning with costly mistakes is where a stronger model pays for itself. The other jobs are mechanical.',
        },
        {
          kind: 'type',
          prompt: 'An agent wrote the code. You accepted the diff. It broke the live site. Who is responsible: you or the agent? Type one word.',
          accept: ['you', 'me', 'i', 'myself', 'the engineer'],
          explain: 'The agent is a tool. The person who accepts and ships the change owns the result, exactly as with code they typed themselves.',
        },
        {
          kind: 'choice',
          prompt: 'What is a good personal rule before merging code an agent wrote?',
          options: [
            '"I could explain what this change does, and why, to a teammate."',
            '"It is long, so it must be thorough."',
            '"The agent sounded sure."',
            '"I will read it properly after it is live."',
          ],
          answer: 0,
          explain: 'If you can explain it, you have really reviewed it. If you cannot, you are shipping something nobody on the team understands.',
        },
      ],
    },
  ],
}
