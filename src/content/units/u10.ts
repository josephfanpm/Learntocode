import type { Unit } from '../types'

export const u10: Unit = {
  id: 'u10',
  week: 10,
  lecture: 'https://cs50.harvard.edu/x/weeks/ai/',
  title: 'Artificial intelligence',
  summary: 'How machines learn and how to use them well',
  lessons: [
    {
      id: 'u10-what-is-ai',
      title: 'What is AI?',
      exercises: [
        {
          kind: 'concept',
          title: 'Artificial intelligence',
          body: '**Artificial intelligence (AI)** means computers doing tasks that seem to need human thinking: recognising faces in photos, translating languages, answering questions in plain words.\n\nUnder the hood it is still code and data, just like what you have written.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these is an example of AI?',
          options: [
            'A photo app that finds every picture of your friend',
            'A calculator adding two numbers',
            'A light switch turning on a lamp',
            'A web page showing opening hours',
          ],
          answer: 0,
          explain: 'Spotting one face among thousands of photos is a "seems to need thinking" task. The others just follow one fixed step.',
        },
        {
          kind: 'concept',
          title: 'Rules vs learning',
          body: 'There are two ways to make a program "smart".\n\n**Rules:** a person writes every `if` by hand.\n\n**Learning:** you show the program many **examples** with the right answers, and it finds the patterns itself.',
        },
        {
          kind: 'concept',
          title: 'A rule in code',
          body: 'A rule is just an `if`. `.lower()` makes the text all lowercase first, so capitals stop mattering. `in` checks whether one piece of text sits inside another, and `or` lets either clue count.',
          code: `message = "Huge SALE ends today"
text = message.lower()
if "sale" in text or "discount" in text:
    print("advert")
else:
    print("ok")`,
          language: 'python',
          output: 'advert',
        },
        {
          kind: 'write',
          prompt: 'Write a rule-based spam filter. Read a message. If it contains `free money` or `winner` (in any capitals), print `spam`, otherwise print `ok`.',
          language: 'python',
          starter: 'message = input()\nprint("ok")\n',
          tests: [
            { stdin: ['Claim your FREE MONEY now'], expected: 'spam' },
            { stdin: ['You are a Winner!'], expected: 'spam' },
            { stdin: ['Lunch at noon?'], expected: 'ok' },
          ],
          hint: 'Lowercase it first with message.lower(), then check "free money" in message or "winner" in message.',
          solution:
            'message = input().lower()\nif "free money" in message or "winner" in message:\n    print("spam")\nelse:\n    print("ok")\n',
          explain: 'This is the rules approach: you decided exactly what counts as spam.',
        },
        {
          kind: 'choice',
          prompt: 'A spammer writes "fr3e m0ney". What does your rule-based filter do?',
          options: [
            'Says "ok", because the rule only looks for the exact words',
            'Says "spam", because it understands the meaning',
            'Crashes with an error',
            'Asks the user what to do',
          ],
          answer: 0,
          explain: 'Hand-written rules only catch what you thought of. That is why many AI systems learn patterns from examples instead.',
        },
        {
          kind: 'concept',
          title: 'Training data',
          body: '**Training data** is the pile of examples a program learns from. Each example has a **label**, the right answer, like "spam" or "not spam".\n\nThe result of learning is called a **model**: the patterns it found, ready to use on new examples.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Rule', 'An instruction a person writes by hand'],
            ['Training data', 'Examples the program learns from'],
            ['Label', 'The right answer attached to an example'],
            ['Model', 'The patterns learned, ready to use'],
          ],
          explain: 'Learning turns labelled training data into a model, instead of a person writing rules.',
        },
        {
          kind: 'order',
          prompt: 'Put the steps of making a learning spam filter in order.',
          lines: [
            'Collect lots of real emails',
            'Label each one spam or not spam',
            'Let the program learn patterns from them',
            'Test it on emails it has never seen',
            'Use it on new incoming mail',
          ],
          explain: 'Testing on unseen emails matters: it shows whether the model learned patterns or just memorised the examples.',
        },
      ],
    },
    {
      id: 'u10-learning-examples',
      title: 'Learning from examples',
      exercises: [
        {
          kind: 'concept',
          title: 'Counting clues',
          body: 'A simple way to learn: count words. Go through many spam emails and count how often each word appears.\n\nWords that show up a lot in spam, and rarely in normal mail, become **clues**.',
        },
        {
          kind: 'choice',
          prompt: 'From 100 spam and 100 normal emails, you counted these words. Which is the best spam clue?',
          code: 'word      in spam   in normal\n"prize"        40           1\n"the"          95          97\n"meeting"       2          30',
          options: ['"prize"', '"the"', '"meeting"', 'They are all equally good'],
          answer: 0,
          explain: '"prize" is common in spam and rare in normal mail. "the" is everywhere, so it tells you nothing.',
        },
        {
          kind: 'concept',
          title: 'Counting with a dictionary',
          body: 'A dictionary can keep a tally. `counts.get(letter, 0)` gives the count so far, or 0 the first time a letter is seen. Add 1 and store it back.',
          code: `counts = {}
for letter in "banana":
    counts[letter] = counts.get(letter, 0) + 1
print(counts)`,
          language: 'python',
          output: "{'b': 1, 'a': 3, 'n': 2}",
        },
        {
          kind: 'blank',
          prompt: 'Count how many times each word appears.',
          code: 'counts = {}\nfor word in text.split():\n    counts[word] = counts.___(word, ___) + 1',
          language: 'python',
          bank: ['get', '0', '1', 'count'],
          answers: ['get', '0'],
          explain: '`counts.get(word, 0)` gives the count so far, or 0 the first time a word is seen. Then we add 1.',
        },
        {
          kind: 'concept',
          title: 'Many messages, one tally',
          body: 'To count across several messages, put one loop inside another: the outer loop takes each message, the inner loop takes each of its words.\n\nAsking with `.get(word, 0)` is safe for a word that was never seen: it gives 0.',
          code: `notes = ["red blue", "blue green"]
counts = {}
for note in notes:
    for word in note.split():
        counts[word] = counts.get(word, 0) + 1
print(counts.get("blue", 0))
print(counts.get("pink", 0))`,
          language: 'python',
          output: '2\n0',
        },
        {
          kind: 'write',
          prompt: 'Learn from examples. Count every word across the three spam messages, then read a word and print how many times it appeared.',
          language: 'python',
          starter:
            'spam = ["win cash now", "cash prize today", "win a prize"]\ncounts = {}\n\nword = input()\nprint(0)\n',
          tests: [
            { stdin: ['cash'], expected: '2' },
            { stdin: ['today'], expected: '1' },
            { stdin: ['lunch'], expected: '0' },
          ],
          hint: 'Loop over each message, then over message.split(), adding to counts. Print counts.get(word, 0).',
          solution:
            'spam = ["win cash now", "cash prize today", "win a prize"]\ncounts = {}\nfor message in spam:\n    for w in message.split():\n        counts[w] = counts.get(w, 0) + 1\nword = input()\nprint(counts.get(word, 0))\n',
          explain: 'Nobody told the program "cash" is a spam word. It found that out by counting examples.',
        },
        {
          kind: 'concept',
          title: 'Scoring a new message',
          body: 'Once you have clue words with points, you can judge a new message: add up the points for each of its words. If the total passes a **threshold** (a cut-off number), call it spam.',
          code: 'points = {"win": 3, "cash": 2}\nscore = 0\nfor w in "win big cash".split():\n    score += points.get(w, 0)',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What is `score` after this code runs?',
          code: 'points = {"win": 3, "cash": 2}\nscore = 0\nfor w in "win big cash".split():\n    score += points.get(w, 0)\nprint(score)',
          language: 'python',
          options: ['5', '3', '0', '6'],
          answer: 0,
          explain: '"win" adds 3, "big" is not a clue so adds 0, "cash" adds 2: 3 + 0 + 2 = 5.',
        },
        {
          kind: 'write',
          prompt: 'Read a message and lowercase it. Add up its points from `clues`. Print the score, then print `spam` if the score is 4 or more, otherwise `not spam`.',
          language: 'python',
          starter: 'clues = {"win": 3, "cash": 2, "prize": 2, "free": 3}\nmessage = input()\nscore = 0\n\nprint(score)\n',
          tests: [
            { stdin: ['Win free cash'], expected: '8\nspam' },
            { stdin: ['free lunch'], expected: '3\nnot spam' },
            { stdin: ['see you at noon'], expected: '0\nnot spam' },
          ],
          hint: 'for w in message.lower().split(): score += clues.get(w, 0). Then print(score) and an if/else.',
          solution:
            'clues = {"win": 3, "cash": 2, "prize": 2, "free": 3}\nmessage = input()\nscore = 0\nfor w in message.lower().split():\n    score += clues.get(w, 0)\nprint(score)\nif score >= 4:\n    print("spam")\nelse:\n    print("not spam")\n',
          explain: 'Real spam filters use the same idea at a much bigger scale: clue weights learned from millions of emails.',
        },
        {
          kind: 'choice',
          prompt: 'Your filter learned from only 3 spam messages. What is the biggest problem?',
          options: [
            'Too few examples, so it will miss lots of spam words',
            'Python can\'t count more than 3 messages',
            'It will mark every message as spam',
            'There is no problem; 3 is enough',
          ],
          answer: 0,
          explain: 'A model only knows what its examples show. More, and more varied, examples usually make it better.',
        },
      ],
    },
    {
      id: 'u10-nearest-neighbour',
      title: 'Nearest neighbour',
      exercises: [
        {
          kind: 'concept',
          title: 'Copy the closest example',
          body: 'Another way to learn from examples: when something new arrives, find the known example most like it, and give the new thing the same label.\n\nThis is called **nearest neighbour**. "Neighbour" just means the closest example.',
        },
        {
          kind: 'choice',
          prompt: 'Known fruits: 120 g is an apple, 150 g is an apple, 1200 g is a melon. A new fruit weighs 140 g. What does nearest neighbour guess?',
          options: ['Apple', 'Melon', 'Half apple, half melon', 'It can\'t guess'],
          answer: 0,
          explain: '140 g is closest to 150 g, an apple, so it copies that label.',
        },
        {
          kind: 'concept',
          title: 'Measuring distance',
          body: 'With single numbers, "how close" is the gap between them. Python\'s `abs()` gives the **absolute value**: the number without its minus sign. So `abs(a - b)` is the distance, whichever is bigger.',
          code: 'print(abs(3 - 10))  # 7\nprint(abs(10 - 3))  # 7',
          language: 'python',
          output: '7\n7',
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: 'print(abs(140 - 150))',
          language: 'python',
          options: ['10', '-10', '290', '140'],
          answer: 0,
          explain: '140 - 150 is -10, and `abs` drops the minus sign, giving 10.',
        },
        {
          kind: 'order',
          prompt: 'Put the nearest neighbour steps in order.',
          lines: [
            'Get the new item\'s number',
            'Work out its distance to every known example',
            'Pick the example with the smallest distance',
            'Give the new item that example\'s label',
          ],
          explain: 'Measure everything, pick the closest, copy its label. That is the whole method.',
        },
        {
          kind: 'concept',
          title: 'Keeping the best so far',
          body: 'You stand at 6 on a street and want the nearest shop. Start `best_gap` bigger than any real gap, so the first shop always beats it. Each closer shop then replaces the best so far.',
          code: `shops = [(2, "bakery"), (9, "bank"), (5, "cafe")]
best_gap = 999
for spot, name in shops:
    if abs(6 - spot) < best_gap:
        best_gap = abs(6 - spot)
        best_name = name
print(best_name)`,
          language: 'python',
          output: 'cafe',
        },
        {
          kind: 'blank',
          prompt: 'Keep track of the closest example so far.',
          code: 'for weight, label in examples:\n    distance = ___(new - weight)\n    if distance ___ best_distance:\n        best_distance = distance\n        best_label = label',
          language: 'python',
          bank: ['abs', '<', '>', 'min'],
          answers: ['abs', '<'],
          explain: 'Take the distance with `abs`, and only replace the best one when the new distance is smaller.',
        },
        {
          kind: 'write',
          prompt: 'Read a weight in grams (a whole number). Find the closest example in `examples` and print its label.',
          language: 'python',
          starter:
            'examples = [(5, "grape"), (120, "apple"), (150, "apple"), (1100, "melon"), (1500, "melon")]\nnew = int(input())\n\nprint("apple")\n',
          tests: [
            { stdin: ['130'], expected: 'apple' },
            { stdin: ['1300'], expected: 'melon' },
            { stdin: ['8'], expected: 'grape' },
          ],
          hint: 'Start with best_distance = None or a huge number. Loop over examples, and keep the label with the smallest abs(new - weight).',
          solution:
            'examples = [(5, "grape"), (120, "apple"), (150, "apple"), (1100, "melon"), (1500, "melon")]\nnew = int(input())\nbest_distance = 999999\nbest_label = ""\nfor weight, label in examples:\n    distance = abs(new - weight)\n    if distance < best_distance:\n        best_distance = distance\n        best_label = label\nprint(best_label)\n',
          explain: 'You just wrote a tiny machine-learning program: no rules about fruit, only examples.',
        },
        {
          kind: 'choice',
          prompt: 'Someone mislabelled the 150 g example as "melon". A new 145 g fruit arrives. What happens?',
          options: [
            'It is called a melon, copying the mistake',
            'It is called an apple, because the program knows better',
            'The program fixes the wrong label',
            'The program crashes',
          ],
          answer: 0,
          explain: 'A learning program trusts its examples. Bad examples in means bad answers out.',
        },
      ],
    },
    {
      id: 'u10-language-models',
      title: 'How chatbots write',
      exercises: [
        {
          kind: 'concept',
          title: 'Predicting the next word',
          body: 'A **large language model (LLM)** is the kind of AI behind chatbots. It was trained on a huge amount of text to do one thing: guess the most likely next word.\n\nIt writes an answer by guessing one word, adding it, then guessing the next, over and over.',
        },
        {
          kind: 'choice',
          prompt: 'An LLM sees "Salt and ___". Which next word is it most likely to pick?',
          options: ['pepper', 'bicycle', 'seven', 'quickly'],
          answer: 0,
          explain: '"Salt and pepper" appears far more often in text than the others, so it is the most likely guess.',
        },
        {
          kind: 'concept',
          title: 'A tiny next-word model',
          body: 'You can build a very small version: go through some text and count which word comes after which. To predict, pick the word that followed most often.\n\nReal LLMs are far bigger and smarter, but the goal is the same.',
        },
        {
          kind: 'concept',
          title: 'A dictionary of dictionaries',
          body: 'The tally has two levels. The outer key is a word. Its value is another dictionary: each word that came next, with how many times.\n\nSo `follows["the"]` is the little tally for "the".',
          code: `follows = {"the": {"cat": 2, "mat": 1}, "sat": {"on": 1}}
print(follows["the"])
print(follows["the"]["cat"])`,
          language: 'python',
          output: "{'cat': 2, 'mat': 1}\n2",
        },
        {
          kind: 'concept',
          title: 'Pick the biggest count',
          body: '`.items()` gives each key with its value. Keep the best pair seen so far, and swap it whenever a bigger count turns up.',
          code: `votes = {"pizza": 2, "soup": 5, "rice": 1}
best = ""
best_count = 0
for food, count in votes.items():
    if count > best_count:
        best = food
        best_count = count
print(best)`,
          language: 'python',
          output: 'soup',
        },
        {
          kind: 'write',
          prompt: 'For each word in `text`, count what follows it (already done for you). Read a word and print the word that most often comes right after it.',
          language: 'python',
          starter:
            'text = "the cat sat on the mat the cat ate the fish"\nwords = text.split()\nfollows = {}\nfor i in range(len(words) - 1):\n    current = words[i]\n    nxt = words[i + 1]\n    if current not in follows:\n        follows[current] = {}\n    follows[current][nxt] = follows[current].get(nxt, 0) + 1\n\nword = input()\nprint("cat")\n',
          tests: [
            { stdin: ['the'], expected: 'cat' },
            { stdin: ['sat'], expected: 'on' },
            { stdin: ['on'], expected: 'the' },
          ],
          hint: 'follows[word] is a dict of next words and counts. Loop over its items and keep the one with the biggest count.',
          solution:
            'text = "the cat sat on the mat the cat ate the fish"\nwords = text.split()\nfollows = {}\nfor i in range(len(words) - 1):\n    current = words[i]\n    nxt = words[i + 1]\n    if current not in follows:\n        follows[current] = {}\n    follows[current][nxt] = follows[current].get(nxt, 0) + 1\n\nword = input()\nbest = ""\nbest_count = 0\nfor nxt, count in follows[word].items():\n    if count > best_count:\n        best = nxt\n        best_count = count\nprint(best)\n',
          explain: '"the" is followed by "cat" twice and others once, so "cat" wins. An LLM does this kind of guessing with billions of examples.',
        },
        {
          kind: 'concept',
          title: 'Prompts',
          body: 'A **prompt** is the text you give an AI chatbot. Since it predicts what fits best after your words, clear prompts with context get better answers.\n\nSay who it\'s for, what you want, and any limits, like "in 3 short steps".',
        },
        {
          kind: 'choice',
          prompt: 'Which prompt will most likely get a useful answer?',
          options: [
            'My Python code says "KeyError: \'age\'" when I read people["age"]. Explain why simply and show one fix.',
            'code broken',
            'Fix it',
            'Python?',
          ],
          answer: 0,
          explain: 'It gives the exact error, the line involved, and what kind of answer is wanted. The AI can\'t see your screen.',
        },
        {
          kind: 'concept',
          title: 'Why AI makes things up',
          body: 'An LLM picks words that *sound* likely, not words it has checked are true. So it can confidently state a wrong fact, invent a quote, or name a book that doesn\'t exist.\n\nThis is often called a **hallucination**.',
        },
        {
          kind: 'choice',
          prompt: 'A chatbot recommends a book with a title and author, but the book doesn\'t exist. Why?',
          options: [
            'It produced words that sound like a real book, without checking',
            'It looked the book up and the library was wrong',
            'Someone deleted the book from the internet',
            'Chatbots never make mistakes, so the book must exist',
          ],
          answer: 0,
          explain: 'Predicting likely words is not the same as looking up facts. Always check important claims elsewhere.',
        },
        {
          kind: 'match',
          prompt: 'Match each term to its meaning.',
          pairs: [
            ['LLM', 'AI trained on lots of text to predict words'],
            ['Prompt', 'The text you give the AI'],
            ['Hallucination', 'A confident answer that is made up'],
            ['Next-word prediction', 'How an LLM builds its reply'],
          ],
          explain: 'Knowing how an LLM works explains both its strengths and its mistakes.',
        },
      ],
    },
    {
      id: 'u10-ai-helper',
      title: 'Using AI wisely',
      exercises: [
        {
          kind: 'concept',
          title: 'AI as a coding helper',
          body: 'AI chatbots can explain error messages, suggest code, and answer "why" questions at any hour. They are great helpers.\n\nBut you are still the programmer. If the code goes wrong, it\'s your program, so you check it.',
        },
        {
          kind: 'concept',
          title: 'Check with a tiny example',
          body: 'The quickest check of any code, yours or an AI\'s, is a small example whose answer you can work out in your head.\n\nTwo helpers for lists: `sum` adds the items up and `len` counts them.',
          code: `numbers = [2, 4, 6]
print(sum(numbers))
print(len(numbers))`,
          language: 'python',
          output: '12\n3',
        },
        {
          kind: 'choice',
          prompt: 'An AI wrote this function to find the average. What does it print?',
          code: 'def average(numbers):\n    return sum(numbers) / 2\n\nprint(average([2, 4, 6]))',
          language: 'python',
          options: ['6.0', '4.0', '12', '2.0'],
          answer: 0,
          explain: 'It always divides by 2, not by how many numbers there are. The real average is 4.0, so this AI code has a bug.',
        },
        {
          kind: 'blank',
          prompt: 'Fix the AI\'s bug so it divides by how many numbers there are.',
          code: 'def average(numbers):\n    return ___(numbers) / ___(numbers)',
          language: 'python',
          bank: ['sum', 'len', 'max', 'count'],
          answers: ['sum', 'len'],
          explain: 'The average is the total (`sum`) divided by how many there are (`len`). Testing with a small example caught the bug.',
        },
        {
          kind: 'spot',
          prompt: 'An AI wrote this to check whether a number is even, but it says 4 is not even. Tap the line with the bug.',
          lines: ['def is_even(n):', '    if n % 2 == 1:', '        return True', '    return False'],
          language: 'python',
          answer: 1,
          explain: 'A remainder of 1 means the number is odd. Even numbers leave a remainder of 0, so the test should be `n % 2 == 0`.',
        },
        {
          kind: 'concept',
          title: 'Keep secrets out',
          body: 'Things you type into a chatbot may be stored or seen by others. Never paste **secrets**: passwords, **API keys** (secret codes that let a program use a paid service), or private data about real people.\n\nReplace them with fake stand-ins like `MY_KEY`.',
        },
        {
          kind: 'choice',
          prompt: 'Which is safe to paste into an AI chatbot?',
          options: [
            'The error message from your program',
            'Your email password',
            'Your API key for a paid service',
            'A list of customers\' phone numbers',
          ],
          answer: 0,
          explain: 'An error message helps the AI help you and gives nothing away. The others are secrets or private data.',
        },
        {
          kind: 'concept',
          title: 'Bias',
          body: 'An AI learns from its training data. If that data is unfair or lopsided, the AI copies the unfairness. This is called **bias**.\n\nFor example, a model trained mostly on photos of one group may work worse for everyone else.',
        },
        {
          kind: 'choice',
          prompt: 'A company trains an AI on its past hiring choices, which mostly picked people from one university. What will the AI likely do?',
          options: [
            'Favour people from that university, repeating the old pattern',
            'Pick the best person fairly, no matter the data',
            'Refuse to choose anyone',
            'Pick people at random',
          ],
          answer: 0,
          explain: 'The model learns whatever pattern is in its examples, including unfair ones. Fair results need fair data and careful checks.',
        },
        {
          kind: 'order',
          prompt: 'Order the steps for using AI help responsibly.',
          lines: [
            'Describe your problem clearly, with no secrets',
            'Read the answer and make sure you understand it',
            'Run the code on small test examples',
            'Fix anything that is wrong before keeping it',
          ],
          anyOrder: [[1, 2]],
          explain: 'Ask well, understand and test, then fix. Skipping the middle steps is how bugs and made-up answers slip in.',
        },
        {
          kind: 'match',
          prompt: 'Match each situation to the best response.',
          pairs: [
            ['AI code you don\'t understand', 'Ask it to explain step by step'],
            ['AI states a surprising fact', 'Check it in a trusted source'],
            ['Your code contains a password', 'Swap it for a fake before pasting'],
            ['AI code seems to work', 'Test it with a few examples anyway'],
          ],
          explain: 'AI speeds you up, but understanding, checking and protecting secrets stay your job.',
        },
      ],
    },
    {
      id: 'u10-search',
      title: 'Thinking ahead in games',
      exercises: [
        {
          kind: 'concept',
          title: 'Game trees',
          body: 'One of the oldest kinds of AI plays games by looking ahead. From any position, each possible move leads to a new position, and each of those leads to more.\n\nDrawn out, this branching picture is called a **game tree**. The AI explores it to find a good move.',
        },
        {
          kind: 'type',
          prompt: 'A tic-tac-toe board is empty and X goes first. How many different first moves can X choose from? Type the number.',
          accept: ['9', 'nine'],
          explain: 'Nine empty squares means nine branches from the top of the tree. Each one then has eight replies.',
        },
        {
          kind: 'steps',
          prompt: 'The nine boxes are a tic-tac-toe board read row by row: the first three boxes are the top row, the next three the middle row, the last three the bottom row. Numbers are empty squares.',
          cells: ['X', 'X', '3', 'O', 'O', '6', '7', '8', '9'],
          steps: [
            { ask: 'It is X\'s turn. Tap the square where X wins at once.', answer: 2 },
            { ask: 'Suppose X carelessly plays square 9 instead. Tap the square where O then wins.', answer: 5 },
          ],
          explain: 'You just looked two moves down the game tree: your move, then the reply. A game AI does the same, only deeper.',
        },
        {
          kind: 'concept',
          title: 'Minimax',
          body: 'Give each ending a score: `1` if X wins, `-1` if O wins, `0` for a draw. X wants the highest score and O wants the lowest.\n\n**Minimax** means: assume your opponent will pick their best reply. So a move is only worth the *worst* score the opponent can force.',
        },
        {
          kind: 'type',
          prompt: 'X is thinking about a move. After it, O gets to choose between an ending scored 1 and an ending scored -1. O wants the lowest. What is the move really worth to X? Type the number.',
          accept: ['-1', '−1', 'minus 1', 'minus one'],
          explain: 'O will not hand X the win. O picks -1, so that is what the move is worth, however tempting the 1 looks.',
        },
        {
          kind: 'steps',
          prompt: 'Each box is a move for X, followed by the two scores O can choose between afterwards. O always picks the lower one.',
          cells: ['A: 5 or -3', 'B: 2 or 1', 'C: 4 or 0'],
          steps: [
            { ask: 'Tap the move that turns out worst for X once O replies.', answer: 0 },
            { ask: 'Tap the move worth exactly 0 after O replies.', answer: 2 },
            { ask: 'X wants the highest worth. Tap the move X should play.', answer: 1 },
          ],
          explain: 'A is worth -3, B is worth 1 and C is worth 0. The move holding the biggest number, A, is actually the worst.',
        },
        {
          kind: 'concept',
          title: 'A board as text',
          body: 'A board can be a string of 9 squares, numbered 0 to 8. A line is three of those positions. Here `(0, 3, 6)` is the left column, and `and` checks that all three squares hold X.',
          code: `board = "XO.XO.X.."
a, b, c = (0, 3, 6)
print(board[a], board[b], board[c])
if board[a] == "X" and board[b] == "X" and board[c] == "X":
    print("X has this line")`,
          language: 'python',
          output: 'X X X\nX has this line',
        },
        {
          kind: 'write',
          prompt: 'Score a finished board. Read 9 characters like `XXXOO....` (row by row, `.` is empty). Print `1` if X has three in a line, `-1` if O does, and `0` otherwise. `LINES` lists the eight winning lines.',
          language: 'python',
          starter: `LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
board = input()
score = 0

for a, b, c in LINES:
    # set score to 1 or -1 if this line is all X or all O
    pass

print(score)
`,
          tests: [
            { stdin: ['XXXOO....'], expected: '1' },
            { stdin: ['X.XOOOX..'], expected: '-1' },
            { stdin: ['XOXOXOOXO'], expected: '0' },
          ],
          hint: 'if board[a] == "X" and board[b] == "X" and board[c] == "X": score = 1. Then the same with "O" and -1.',
          solution: `LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
board = input()
score = 0

for a, b, c in LINES:
    if board[a] == "X" and board[b] == "X" and board[c] == "X":
        score = 1
    if board[a] == "O" and board[b] == "O" and board[c] == "O":
        score = -1

print(score)
`,
          explain: 'This is the bottom of the game tree: a rule that turns a finished board into a number the AI can compare.',
        },
        {
          kind: 'concept',
          title: 'min plays the opponent',
          body: '`min` gives the smallest number in a list. That is the reply your opponent would pick, so it is what the move is really worth.\n\nHere `left` is worth 3 and `right` is worth 4, so right is the better move.',
          code: `replies = {"left": [3, 7], "right": [4, 5]}
for move, scores in replies.items():
    print(move, min(scores))`,
          language: 'python',
          output: 'left 3\nright 4',
        },
        {
          kind: 'write',
          prompt: 'Now choose like minimax. `moves` holds, for each move, the scores the opponent can pick from (two scores for C are read from input). A move is worth its lowest score. Print the move with the highest worth and that worth, like `B 1`.',
          language: 'python',
          starter: `moves = {"A": [5, -3], "B": [2, 1], "C": [int(input()), int(input())]}

best_move = "A"
best_worth = min(moves["A"])

print(best_move, best_worth)
`,
          tests: [
            { stdin: ['4', '0'], expected: 'B 1' },
            { stdin: ['6', '3'], expected: 'C 3' },
          ],
          hint: 'for move, scores in moves.items(): worth = min(scores). If worth > best_worth, update best_move and best_worth.',
          solution: `moves = {"A": [5, -3], "B": [2, 1], "C": [int(input()), int(input())]}

best_move = "A"
best_worth = min(moves["A"])
for move, scores in moves.items():
    worth = min(scores)
    if worth > best_worth:
        best_move = move
        best_worth = worth

print(best_move, best_worth)
`,
          explain: '`min` plays the opponent and "keep the highest" plays you. That pair of steps, repeated down the tree, is the whole minimax idea.',
        },
        {
          kind: 'choice',
          prompt: 'Tic-tac-toe has a small game tree, so a computer can search all of it. Chess has more possible games than there are atoms in the universe. What do chess programs do?',
          options: [
            'Search every game anyway, it just takes a few minutes',
            'Pick moves at random and hope',
            'Only ever copy moves from old games',
            'Look a limited number of moves ahead, then estimate how good each position is',
          ],
          answer: 3,
          explain: 'They stop at a set depth and score the position with an estimate, such as who has more pieces. Good estimates are where learning comes in.',
        },
      ],
    },
    {
      id: 'u10-training',
      title: 'Training and testing a model',
      exercises: [
        {
          kind: 'concept',
          title: 'Hold some examples back',
          body: 'Before training, the examples are split in two. **Training data** is what the model learns from. **Test data** is kept hidden until the end.\n\nIt is like an exam: questions you have never seen show what you really learned.',
        },
        {
          kind: 'choice',
          prompt: 'Why test a model on examples it never saw during training?',
          options: [
            'Because test examples are always easier',
            'To find out whether it learned patterns or only memorised its examples',
            'Because the training data is thrown away afterwards',
            'To make the training run faster',
          ],
          answer: 1,
          explain: 'In real use, every example is new. Only unseen test data tells you how the model will do then.',
        },
        {
          kind: 'concept',
          title: 'Accuracy',
          body: '**Accuracy** is the share of answers a model gets right: the number correct divided by the total.\n\nCompare each **prediction** (the model\'s guess) with the true label, and count the matches.',
          code: 'predictions = ["spam", "ok", "ok", "spam"]\nlabels      = ["spam", "ok", "spam", "spam"]\n# 3 of 4 match: 75% accuracy',
          language: 'python',
        },
        {
          kind: 'type',
          prompt: 'A model labels 10 test emails and gets 8 right. What is its accuracy as a percentage? Type the number.',
          accept: ['80', '80%', '80 %', '80 percent'],
          explain: '8 ÷ 10 = 0.8, which is 80%.',
        },
        {
          kind: 'concept',
          title: 'Counting matches',
          body: 'To compare two lists item by item, loop over the positions. `range(len(answers))` gives 0, 1, 2, and the same `i` picks the matching item from each list.',
          code: `guesses = ["cat", "dog", "dog"]
answers = ["cat", "dog", "cat"]
right = 0
for i in range(len(answers)):
    if guesses[i] == answers[i]:
        right += 1
print(right)`,
          language: 'python',
          output: '2',
        },
        {
          kind: 'write',
          prompt: 'Measure a model. Its predictions are read from input as words separated by spaces. Count how many match `labels` at the same position and print the accuracy as a whole percentage, like `80%`.',
          language: 'python',
          starter: `labels = ["spam", "ok", "ok", "spam", "ok"]
predictions = input().split()
correct = 0

percent = correct * 100 // len(labels)
print(f"{percent}%")
`,
          tests: [
            { stdin: ['spam ok ok spam spam'], expected: '80%' },
            { stdin: ['ok ok ok ok ok'], expected: '60%' },
            { stdin: ['spam ok ok spam ok'], expected: '100%' },
          ],
          hint: 'for i in range(len(labels)): if predictions[i] == labels[i]: correct += 1',
          solution: `labels = ["spam", "ok", "ok", "spam", "ok"]
predictions = input().split()
correct = 0
for i in range(len(labels)):
    if predictions[i] == labels[i]:
        correct += 1

percent = correct * 100 // len(labels)
print(f"{percent}%")
`,
          explain: 'Notice the middle test: a "model" that always says ok still scores 60%. Accuracy alone can flatter a lazy model.',
        },
        {
          kind: 'concept',
          title: 'Overfitting',
          body: '**Overfitting** is when a model memorises its training examples, quirks and all, instead of learning the general pattern.\n\nThe sign: very high accuracy on training data, much lower on test data. Like learning last year\'s exam answers by heart.',
        },
        {
          kind: 'steps',
          prompt: 'Three models were scored twice. Each box shows accuracy on the training data, then accuracy on hidden test data.',
          cells: ['A: 99% / 60%', 'B: 90% / 88%', 'C: 62% / 61%'],
          steps: [
            { ask: 'Tap the model that has overfitted.', answer: 0 },
            { ask: 'Tap the model that has not learned much at all.', answer: 2 },
            { ask: 'Tap the model you would trust on new emails.', answer: 1 },
          ],
          explain: 'A memorised its examples. C learned too little. B does nearly as well on unseen data as on its training data, which is the goal.',
        },
        {
          kind: 'spot',
          prompt: 'This check reports a wonderful score that means nothing. Tap the line with the mistake.',
          lines: [
            'train = emails[:80]',
            'test = emails[80:]',
            'model = learn(train)',
            'score = accuracy(model, train)',
            'print(score)',
          ],
          language: 'python',
          answer: 3,
          explain: 'It marks the model on the same emails it learned from. The score must come from `test`, the examples it never saw.',
        },
        {
          kind: 'concept',
          title: 'Slicing a list in two',
          body: 'A **slice** copies part of a list. `letters[:2]` is everything before position 2, and `letters[2:]` is everything from position 2 onwards. Together they hold every item exactly once.',
          code: `letters = ["a", "b", "c", "d", "e"]
print(letters[:2])
print(letters[2:])`,
          language: 'python',
          output: "['a', 'b']\n['c', 'd', 'e']",
        },
        {
          kind: 'write',
          prompt: 'Split the data yourself. Put the first 80% of `data` in `train` and the rest in `test`, then print the two lengths, like `8 2`.',
          language: 'python',
          starter: `count = int(input())
data = list(range(1, count + 1))
cut = len(data) * 8 // 10

train = data
test = []

print(len(train), len(test))
`,
          tests: [
            { stdin: ['10'], expected: '8 2' },
            { stdin: ['25'], expected: '20 5' },
          ],
          hint: 'A slice does it: train = data[:cut] and test = data[cut:].',
          solution: `count = int(input())
data = list(range(1, count + 1))
cut = len(data) * 8 // 10

train = data[:cut]
test = data[cut:]

print(len(train), len(test))
`,
          explain: '`data[:cut]` is everything before the cut and `data[cut:]` is everything from it onwards, so no example lands in both piles.',
        },
      ],
    },
    {
      id: 'u10-prompts',
      title: 'Prompts that work',
      exercises: [
        {
          kind: 'concept',
          title: 'Four habits',
          body: 'An AI chatbot only knows what your prompt tells it. Four habits get better answers.\n\n**Be specific** about what you want. **Give an example** of a good result. **Ask for steps** so you can follow the reasoning. **Check the answer** before you trust it.',
        },
        {
          kind: 'match',
          prompt: 'Match each habit to a line that does it.',
          pairs: [
            ['Be specific', 'Write a Python function that adds up a list of prices'],
            ['Give an example', 'For [2, 3, 4] the answer should be 9'],
            ['Ask for steps', 'Explain what each line does, one at a time'],
            ['Check the answer', 'Run it on a list you already know the total of'],
          ],
          explain: 'The first three go in the prompt. The last one is your job after the answer arrives.',
        },
        {
          kind: 'spot',
          prompt: 'Three lines of this prompt help the AI. Tap the one that is too vague to act on.',
          lines: [
            'I am new to Python and have not learned functions yet.',
            'Make my code better.',
            'It should print the numbers 1 to 5, one per line.',
            'Explain each change in one short sentence.',
          ],
          answer: 1,
          explain: '"Better" could mean shorter, faster or easier to read. The other lines say who it is for, what the code must do, and how to answer.',
        },
        {
          kind: 'order',
          prompt: 'Build a strong prompt: who you are, the task, an example, then how to answer.',
          lines: [
            'I run a small bakery and I am a beginner at Python.',
            'Write a function that works out the total of a list of prices.',
            'For example, [2, 3, 4] should give 9.',
            'Explain it step by step, then show me how to test it.',
          ],
          explain: 'Context first, then the task, then an example that pins down exactly what you mean, then the shape of the answer.',
        },
        {
          kind: 'concept',
          title: 'Check by running it',
          body: 'AI-written code often looks right and is nearly right. The fastest check is a tiny test where you already know the answer.\n\nIf the result surprises you, tell the AI exactly what you ran, what you expected and what you got.',
        },
        {
          kind: 'concept',
          title: 'A tiny test',
          body: '`ch in "0123456789"` is true when the character is one of those ten. This function counts digits. One test with an answer you already know, 2, shows it works.',
          code: `def count_digits(text):
    count = 0
    for ch in text:
        if ch in "0123456789":
            count += 1
    return count

print(count_digits("room 42"))`,
          language: 'python',
          output: '2',
        },
        {
          kind: 'type',
          prompt: 'You asked an AI for a vowel counter and it wrote this. "hello" has 2 vowels. What does the code actually print?',
          code: 'def count_vowels(word):\n    count = 0\n    for letter in word:\n        if letter in "aeiu":\n            count += 1\n    return count\n\nprint(count_vowels("hello"))',
          language: 'python',
          accept: ['1', 'one'],
          explain: 'The AI left `o` out of its vowel list, so only the `e` is counted. One small test exposed it.',
        },
        {
          kind: 'write',
          prompt: 'Fix the AI\'s vowel counter so it counts all five vowels: a, e, i, o and u. It prints the count for a word read from input.',
          language: 'python',
          starter: `def count_vowels(word):
    count = 0
    for letter in word:
        if letter in "aeiu":
            count += 1
    return count

print(count_vowels(input()))
`,
          tests: [
            { stdin: ['hello'], expected: '2' },
            { stdin: ['audio'], expected: '4' },
            { stdin: ['sky'], expected: '0' },
          ],
          hint: 'The string of vowels is missing one letter. Make it "aeiou".',
          solution: `def count_vowels(word):
    count = 0
    for letter in word:
        if letter in "aeiou":
            count += 1
    return count

print(count_vowels(input()))
`,
          explain: 'A one-letter fix, but you could only make it because you read the code and tested it instead of trusting it.',
        },
        {
          kind: 'concept',
          title: 'Test the awkward cases',
          body: 'Bugs hide at the edges. Try the inputs the author may not have pictured: negative numbers, an empty list, the very last value.\n\nRemember that `range` stops just before its second number.',
          code: `for i in range(1, 4):
    print(i)`,
          language: 'python',
          output: '1\n2\n3',
        },
        {
          kind: 'spot',
          prompt: 'An AI wrote this to find the largest number. It returns 0 for `[-5, -2, -9]`. Tap the line that causes that.',
          lines: [
            'def largest(numbers):',
            '    best = 0',
            '    for n in numbers:',
            '        if n > best:',
            '            best = n',
            '    return best',
          ],
          language: 'python',
          answer: 1,
          explain: 'Starting at 0 assumes some number is at least 0. Start with `best = numbers[0]` so it works for negative numbers too.',
        },
        {
          kind: 'spot',
          prompt: 'You asked for code that prints 1 to 5. This prints 1 to 4. Tap the line with the bug.',
          lines: ['print("Counting")', 'for i in range(1, 5):', '    print(i)', 'print("Done")'],
          language: 'python',
          answer: 1,
          explain: '`range` stops just before its second number. To include 5 it must be `range(1, 6)`.',
        },
        {
          kind: 'choice',
          prompt: 'The vowel counter gave the wrong answer. Which follow-up prompt will get the best help?',
          options: [
            'That is wrong.',
            'Try again but better.',
            'count_vowels("hello") printed 1 but I expected 2. Find the bug and explain it.',
            'Are you sure?',
          ],
          answer: 2,
          explain: 'It says what you ran, what you got and what you expected. That is everything the AI needs to find the bug.',
        },
      ],
    },
  ],
}
