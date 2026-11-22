import type { Unit } from '../types'

export const u30: Unit = {
  id: 'u30',
  week: 5,
  course: 'ai',
  title: 'Reliable output',
  summary: 'Structured answers and testing prompts',
  lessons: [
    {
      id: 'u30-json',
      title: 'Asking for JSON',
      exercises: [
        {
          kind: 'concept',
          title: 'Programs need structure',
          body: 'A person can read "Sure! That order is for two pizzas." A program cannot use it safely: where is the number?\n\nSo ask the model for **structured output**: a reply in a fixed shape. The usual shape is **JSON**, text that looks like a Python dict. `json.loads` turns it into a real dict.',
        },
        {
          kind: 'choice',
          prompt: 'Your code must add the item count from a model reply to a total. Which reply is easiest to use?',
          options: [
            'Great question! I count three items in that order.',
            'There are 3 items (two pizzas and a drink).',
            '{"items": 3}',
            'THREE',
          ],
          answer: 2,
          explain: 'The JSON reply has a known key with a real number. The others would need fragile guessing to find the count.',
        },
        {
          kind: 'type',
          prompt: 'What does this print?',
          code: 'import json\n\nreply = \'{"dish": "soup", "tags": ["hot", "vegan"]}\'\ndata = json.loads(reply)\nprint(data["tags"][1])',
          language: 'python',
          accept: ['vegan'],
          explain: 'After `json.loads`, the reply is an ordinary dict. `data["tags"]` is a list, and index 1 is its second item.',
        },
        {
          kind: 'concept',
          title: 'Describe the shape you want',
          body: 'The model cannot guess your keys. Spell them out in the prompt:\n\n- every **key name**\n- the **type** of each value\n- the **allowed values**, if there are only a few\n- one short example\n\nEnd with: "Reply with only the JSON object." Otherwise you may get a friendly sentence wrapped around it.',
        },
        {
          kind: 'spot',
          prompt: 'This prompt asks for JSON, but one line leaves the shape vague. Tap it.',
          lines: [
            'Read the review below.',
            'Reply with only a JSON object.',
            'Key "sentiment": one of "positive", "negative", "neutral".',
            'Also include a score of some kind.',
            'Key "summary": one sentence, as a string.',
          ],
          answer: 3,
          explain: 'What is the key called? Is the score 1 to 5, or 0 to 100? Your code needs to know both, so the prompt must say both.',
        },
        {
          kind: 'blank',
          prompt: 'Turn the reply text into a dict, then read the price.',
          code: 'import json\n\nreply = \'{"item": "tea", "price": 3}\'\ndata = json.___(reply)\nprint(data[___])',
          language: 'python',
          bank: ['loads', 'dumps', '"price"', 'price', '"item"'],
          answers: ['loads', '"price"'],
          explain: '`loads` reads JSON text into Python. `dumps` goes the other way. Keys are strings, so `"price"` needs its quotes.',
        },
        {
          kind: 'match',
          prompt: 'Match each line of a prompt to the problem it prevents.',
          pairs: [
            ['"Use the key \\"total\\""', 'The model inventing its own key name'],
            ['"total is a number, not text"', 'Getting "12 dollars" where you need 12'],
            ['"status is one of: open, closed"', 'Getting "kind of open, I think"'],
            ['"Reply with only the JSON"', 'A chatty sentence around the data'],
          ],
          explain: 'Each instruction closes one gap the model would otherwise fill by guessing.',
        },
        {
          kind: 'write',
          prompt: 'A model replied with JSON holding a `city` and a `temp`. Read the reply with input(), parse it, and print the city, then the temperature plus 1 on a second line.',
          language: 'python',
          starter: 'import json\n\nreply = input()\nprint(reply)\n',
          tests: [
            { stdin: ['{"city": "Lima", "temp": 18}'], expected: 'Lima\n19' },
            { stdin: ['{"temp": -2, "city": "Oslo"}'], expected: 'Oslo\n-1' },
          ],
          hint: 'data = json.loads(reply) gives you a dict. Then print data["city"] and data["temp"] + 1.',
          solution: 'import json\n\nreply = input()\ndata = json.loads(reply)\nprint(data["city"])\nprint(data["temp"] + 1)\n',
          explain: 'Because the temperature arrived as a real number, you could do maths with it straight away. That is the point of structured output.',
        },
        {
          kind: 'choice',
          prompt: 'Some model APIs, including Claude\'s, have a **structured outputs** feature: you give a schema (a description of the shape) and the reply must follow it. What can that feature still not promise?',
          options: [
            'That the reply is valid JSON',
            'That the values are true',
            'That the keys have the names you asked for',
            'That a number field holds a number',
          ],
          answer: 1,
          explain: 'A schema controls the shape, not the meaning. `{"age": 250}` has a perfect shape and a wrong answer, so you still check values.',
        },
      ],
    },
    {
      id: 'u30-validate',
      title: 'Parse and validate',
      exercises: [
        {
          kind: 'concept',
          title: 'Two ways a reply can be wrong',
          body: '**1. It is not JSON at all.** `json.loads` raises `json.JSONDecodeError`.\n\n**2. It is JSON, but the wrong shape.** A key is missing, or a number arrived as text.\n\nTo **validate** is to check a reply before you use it. Treat every model reply like a form filled in by a stranger.',
        },
        {
          kind: 'choice',
          prompt: 'What happens when this runs?',
          code: 'import json\n\nreply = \'Sure! Here it is: {"total": 12}\'\ndata = json.loads(reply)\nprint(data["total"])',
          language: 'python',
          options: [
            'It prints 12',
            'It prints Sure! Here it is: 12',
            'It raises json.JSONDecodeError',
            'It prints None',
          ],
          answer: 2,
          explain: 'The whole text must be JSON. The friendly words at the start make the parse fail before `data` even exists.',
        },
        {
          kind: 'blank',
          prompt: 'Catch a reply that is not JSON so the program does not crash.',
          code: 'import json\n\n___:\n    data = json.loads(reply)\n___ json.JSONDecodeError:\n    print("not json")',
          language: 'python',
          bank: ['try', 'except', 'if', 'else', 'catch'],
          answers: ['try', 'except'],
          explain: 'The risky line goes under `try`. If it raises that error, Python jumps to the `except` block.',
        },
        {
          kind: 'spot',
          prompt: 'Your code needs `name` as a string and `age` as a whole number. Tap the reply that fails the check.',
          lines: [
            '{"name": "Ana", "age": 31}',
            '{"name": "Bo", "age": 0}',
            '{"name": "Cy", "age": "40"}',
            '{"age": 22, "name": "Di"}',
          ],
          answer: 2,
          explain: '`"40"` in quotes is text, not a number, so `age + 1` would crash. Key order does not matter, and 0 is a fine number.',
        },
        {
          kind: 'concept',
          title: 'Checking keys and types',
          body: 'Two small checks cover most problems.\n\n**Is the key there?** `"age" in data`\n\n**Is the value the right type?** `isinstance(data["age"], int)`\n\n`isinstance(value, type)` gives `True` or `False`. Check the key first: reading a missing key raises `KeyError`.',
          code: 'data = {"name": "Ana", "age": 31}\nprint("age" in data)                  # True\nprint(isinstance(data["age"], int))   # True\nprint(isinstance(data["name"], int))  # False',
          language: 'python',
        },
        {
          kind: 'type',
          prompt: 'What does this print?',
          code: 'data = {"count": "5"}\nprint(isinstance(data["count"], int))',
          language: 'python',
          accept: ['False'],
          explain: 'The value is the string "5", not the number 5. It looks like a number to you, but not to Python.',
        },
        {
          kind: 'order',
          prompt: 'Put the steps for handling a model reply in a safe order.',
          lines: [
            'Get the reply text from the model',
            'Parse it with json.loads inside try',
            'Check that every required key is there',
            'Check that each value has the right type',
            'Use the data in the rest of your program',
          ],
          explain: 'Each check protects the next step. You cannot check keys before parsing, or types before you know the keys exist.',
        },
        {
          kind: 'write',
          prompt: 'Read one model reply with input(). Print `not json` if it cannot be parsed. Print `bad shape` if it parses but is not a dict with `name` as a string and `age` as an int. Otherwise print `ok`.',
          language: 'python',
          starter:
            'import json\n\nreply = input()\ntry:\n    data = json.loads(reply)\n    print("ok")\nexcept json.JSONDecodeError:\n    print("not json")\n',
          tests: [
            { stdin: ['{"name": "Ana", "age": 31}'], expected: 'ok' },
            { stdin: ['Here you go: Ana, 31'], expected: 'not json' },
            { stdin: ['{"name": "Ana", "age": "31"}'], expected: 'bad shape' },
          ],
          hint: 'Write a function valid(data) that returns False if data is not a dict, a key is missing, or isinstance fails. Print "ok" only when valid(data) is True.',
          solution:
            'import json\n\n\ndef valid(data):\n    if not isinstance(data, dict):\n        return False\n    if "name" not in data or "age" not in data:\n        return False\n    return isinstance(data["name"], str) and isinstance(data["age"], int)\n\n\nreply = input()\ntry:\n    data = json.loads(reply)\n    if valid(data):\n        print("ok")\n    else:\n        print("bad shape")\nexcept json.JSONDecodeError:\n    print("not json")\n',
          explain: 'Parsing and validating are separate gates. A reply has to pass both before the rest of your program touches it.',
        },
        {
          kind: 'choice',
          prompt: 'A reply parses and has every key, but `"age"` is -4. Your type check passes. What does this show?',
          options: [
            'Type checks are pointless',
            'json.loads has a bug',
            'The model cannot produce numbers',
            'You sometimes need a rule about the value too, like age >= 0',
          ],
          answer: 3,
          explain: 'The right type can still hold a silly value. Add range or allowed-value checks wherever a wrong value would hurt.',
        },
      ],
    },
    {
      id: 'u30-retry',
      title: 'Retry with the error',
      exercises: [
        {
          kind: 'concept',
          title: 'Tell the model what went wrong',
          body: 'A reply failed validation. Do not crash, and do not guess at a repair.\n\n**Retry with the error**: add the bad reply to the messages, then a new message saying exactly what was wrong, and call the model again. With the mistake in front of it, the model usually fixes it.',
        },
        {
          kind: 'order',
          prompt: 'The first reply was missing the `age` key. Put the messages list for the retry in order.',
          lines: [
            'user: "Extract name and age as JSON from: Ana is 31."',
            'assistant: {"name": "Ana"}',
            'user: "Your reply is missing the key age. Reply again with only the JSON."',
            'assistant: {"name": "Ana", "age": 31}',
          ],
          explain: 'The API keeps no memory, so the retry must carry the original request, the bad reply, and the error. Then the model answers again.',
        },
        {
          kind: 'choice',
          prompt: 'Validation failed because `"age"` came back as `"thirty-one"`. Which retry message helps most?',
          options: [
            'Try again.',
            'The value of "age" must be a whole number such as 31, not text. Reply again with only the JSON.',
            'WRONG. Do better this time!',
            'Please be more careful with your JSON in future.',
          ],
          answer: 1,
          explain: 'A specific error names the key, the problem and the fix. "Try again" gives the model nothing new to work with.',
        },
        {
          kind: 'steps',
          prompt: 'Your loop allows up to 3 attempts and needs a JSON object with `name` and `age`. Tap the right attempt for each question.',
          cells: [
            '1: Sure! {"name": "Ana"}',
            '2: {"name": "Ana"}',
            '3: {"name": "Ana", "age": 31}',
            '4: never sent',
          ],
          steps: [
            { ask: 'Which attempt cannot be parsed at all?', answer: 0 },
            { ask: 'Which attempt parses but has the wrong shape?', answer: 1 },
            { ask: 'Which attempt does the loop accept and return?', answer: 2 },
            { ask: 'If attempt 3 had failed too, which box shows what happens next?', answer: 3 },
          ],
          explain: 'Each failure triggers one more try, until a reply validates or the limit is hit. After 3 failures the loop stops asking.',
        },
        {
          kind: 'concept',
          title: 'Always set a limit',
          body: 'Some inputs will never produce a valid reply. A loop with no limit would call the model forever, and every call costs time and money.\n\nSet a **maximum number of attempts**, often 2 or 3. If they all fail, fall back: show a clear error, use a safe default, or pass the case to a person.',
        },
        {
          kind: 'type',
          prompt: 'Your loop allows 3 attempts. The first reply is invalid and the second is valid. How many times was the model called? Type the number.',
          accept: ['2', 'two'],
          explain: 'The loop stops at the first valid reply. The third attempt is only there in case it is needed.',
        },
        {
          kind: 'spot',
          prompt: 'This retry loop can run forever. Tap the line that lets it.',
          lines: [
            'messages = [first_request]',
            'while True:',
            '    reply = ask_model(messages)',
            '    if is_valid(reply):',
            '        break',
            '    messages.append(error_message(reply))',
          ],
          language: 'python',
          answer: 1,
          explain: '`while True` only ends on a valid reply. Use `for attempt in range(3):` so the loop gives up after three tries.',
        },
        {
          kind: 'write',
          prompt: 'The input is a list of simulated model replies separated by `|`, in the order the model would give them. Try them in order, at most 3. A reply is valid if it parses as a dict with the key `answer`. For the first valid one, print `attempt` and its number, then the answer on a second line, and stop. If no valid reply turns up in 3 attempts, print `gave up`.',
          language: 'python',
          starter:
            'import json\n\nreplies = input().split("|")\n\n\ndef is_valid(text):\n    try:\n        data = json.loads(text)\n    except json.JSONDecodeError:\n        return False\n    return isinstance(data, dict) and "answer" in data\n\n\nfor attempt in range(1, 4):\n    pass  # stop if you run out of replies; check replies[attempt - 1]\nprint("gave up")\n',
          tests: [
            { stdin: ['oops|{"answer": 42}'], expected: 'attempt 2\n42' },
            { stdin: ['{"answer": "yes"}'], expected: 'attempt 1\nyes' },
            { stdin: ['no|{"x": 1}|nope|{"answer": 1}'], expected: 'gave up' },
          ],
          hint: 'Keep a variable found = False. In the loop: break if attempt > len(replies). If is_valid(text), print the two lines, set found = True and break. Print "gave up" only if not found.',
          solution:
            'import json\n\nreplies = input().split("|")\n\n\ndef is_valid(text):\n    try:\n        data = json.loads(text)\n    except json.JSONDecodeError:\n        return False\n    return isinstance(data, dict) and "answer" in data\n\n\nfound = False\nfor attempt in range(1, 4):\n    if attempt > len(replies):\n        break\n    text = replies[attempt - 1]\n    if is_valid(text):\n        print("attempt", attempt)\n        print(json.loads(text)["answer"])\n        found = True\n        break\nif not found:\n    print("gave up")\n',
          explain: 'In the last test a valid reply was waiting in fourth place, but the limit is 3. Giving up on purpose beats looping without end.',
        },
        {
          kind: 'choice',
          prompt: 'A signup app asks a model to pull a birth date out of a message. All 3 attempts fail validation. What should the app do?',
          options: [
            'Save the last invalid reply anyway',
            'Keep retrying until one works',
            'Make up a date so signup can continue',
            'Stop and ask the user to type the date themselves',
          ],
          answer: 3,
          explain: 'Invalid data must never flow onward. A clear fallback, here asking the person, keeps the app honest and working.',
        },
      ],
    },
    {
      id: 'u30-grounded',
      title: 'Staying grounded',
      exercises: [
        {
          kind: 'concept',
          title: 'Fluent is not the same as true',
          body: 'A model writes whatever text seems likely. When it lacks a fact, it may still produce a confident, made-up answer.\n\n**Grounding** means tying the answer to text you supply. Put the document in the prompt and say: "Answer using only this document."',
        },
        {
          kind: 'choice',
          prompt: 'A support bot should answer from your returns policy. Which setup is best grounded?',
          options: [
            'Ask the question and trust what the model remembers about shops',
            'Tell the model "be accurate" in capital letters',
            'Paste the policy into the prompt and say to answer only from it',
            'Ask the same question twice and keep the longer answer',
          ],
          answer: 2,
          explain: 'The model has never seen your policy. Only the text you put in front of it can make the answer about your shop.',
        },
        {
          kind: 'concept',
          title: 'An exit, and a receipt',
          body: '**Allow "I don\'t know".** If the answer is not in the document, the model needs a permitted way out. Without one, it tends to invent something.\n\n**Ask for a quote.** Have it copy the exact sentence that supports the answer. A quote is a receipt: your code can check it really appears in the document.',
        },
        {
          kind: 'spot',
          prompt: 'One line of this prompt invites made-up answers. Tap it.',
          lines: [
            'Answer using only the document below.',
            'If the answer is not in the document, say "I don\'t know".',
            'Always give an answer, even if you are unsure.',
            'Quote the sentence that supports your answer.',
          ],
          answer: 2,
          explain: 'Demanding an answer every time removes the exit. The model will fill the gap with a guess that sounds right.',
        },
        {
          kind: 'steps',
          prompt: 'The document has three sentences. For each question, tap the sentence a grounded model would quote, or the last box.',
          cells: [
            'We open Monday to Friday.',
            'We close at 6 pm.',
            'Parking behind the shop is free.',
            'Not in the document',
          ],
          steps: [
            { ask: 'What time do you close?', answer: 1 },
            { ask: 'Do I have to pay for parking?', answer: 2 },
            { ask: 'What is the owner\'s name?', answer: 3 },
            { ask: 'Which days are you open?', answer: 0 },
          ],
          explain: 'Three questions have a sentence to point at. The owner\'s name does not, so the honest answer is "I don\'t know".',
        },
        {
          kind: 'type',
          prompt: 'What does this print?',
          code: 'document = "The shop closes at 6 pm on weekdays."\nquote = "closes at 6 pm"\nprint(quote in document)',
          language: 'python',
          accept: ['True'],
          explain: '`in` checks whether one string appears inside another. It is the simplest possible check that a quote is real.',
        },
        {
          kind: 'write',
          prompt: 'Read the document with input(), then a model reply: JSON with the keys `answer` and `quote`. If the answer is `I don\'t know`, print `no answer`. Otherwise, if the quote appears in the document, print the answer. If it does not, print `unsupported`.',
          language: 'python',
          starter: 'import json\n\ndocument = input()\nreply = json.loads(input())\nprint(reply["answer"])\n',
          tests: [
            {
              stdin: ['We close at 6 pm. Parking is free.', '{"answer": "6 pm", "quote": "We close at 6 pm."}'],
              expected: '6 pm',
            },
            {
              stdin: ['We close at 6 pm. Parking is free.', '{"answer": "Sam", "quote": "The owner is Sam."}'],
              expected: 'unsupported',
            },
            {
              stdin: ['We close at 6 pm. Parking is free.', '{"answer": "I don\'t know", "quote": ""}'],
              expected: 'no answer',
            },
          ],
          hint: 'Check the answer first with ==. Then use: if reply["quote"] in document.',
          solution:
            'import json\n\ndocument = input()\nreply = json.loads(input())\nif reply["answer"] == "I don\'t know":\n    print("no answer")\nelif reply["quote"] in document:\n    print(reply["answer"])\nelse:\n    print("unsupported")\n',
          explain: 'The second reply sounded sure of itself, but its quote was nowhere in the document. One line of code caught it.',
        },
        {
          kind: 'match',
          prompt: 'Match each grounding technique to what it does.',
          pairs: [
            ['Put the document in the prompt', 'Gives the model the facts to use'],
            ['"Answer only from the document"', 'Stops it mixing in things it half remembers'],
            ['Allow "I don\'t know"', 'Gives it an honest way out'],
            ['Ask for a supporting quote', 'Lets your code check the answer'],
          ],
          explain: 'Together they turn "trust me" into "here is where it says so".',
        },
        {
          kind: 'choice',
          prompt: 'You used all four techniques. Can the model still get an answer wrong?',
          options: [
            'No: grounding makes mistakes impossible',
            'Yes: it can still misread the text, so you keep checking',
            'No: a real quote proves the answer is right',
            'Yes, but only on very short documents',
          ],
          answer: 1,
          explain: 'Grounding lowers the error rate. It does not make it zero. A real quote can still be misunderstood, which is why the next lesson is about testing.',
        },
      ],
    },
    {
      id: 'u30-evals',
      title: 'Testing prompts like code',
      exercises: [
        {
          kind: 'concept',
          title: 'One good answer proves nothing',
          body: 'You try your prompt once and the answer looks great. But the next input may differ, and so may the next reply.\n\nAn **evaluation set** (an **eval**) is a list of inputs, each with the result you expect. Run the prompt on all of them and count. It is a test suite for a prompt.',
        },
        {
          kind: 'choice',
          prompt: 'You reworded a prompt, tried one email, and the label was right. What do you know?',
          options: [
            'The new prompt is better than the old one',
            'The new prompt works on all emails',
            'It worked on that one email, and nothing more',
            'The old prompt was broken',
          ],
          answer: 2,
          explain: 'One example cannot show whether the change helped, hurt or did nothing. Only a set of cases can.',
        },
        {
          kind: 'type',
          prompt: 'A prompt gets 8 of the 10 cases in an eval set right. What is its accuracy as a percentage? Type the number.',
          accept: ['80', '80%', 'eighty'],
          explain: '**Accuracy** is correct answers divided by total cases: 8 / 10 = 80%. Now you have a number to beat.',
        },
        {
          kind: 'concept',
          title: 'Three ways to grade',
          body: '**Exact match**: the output equals the expected answer. Best for labels.\n\n**A rule in code**: valid JSON? Under 50 words? Contains the order number?\n\n**A model as judge**: a second model call scores the output against written criteria. For open-ended text like summaries. Judges make mistakes too, so read some of their grades yourself.',
        },
        {
          kind: 'match',
          prompt: 'Match each kind of output to the grader that fits it best.',
          pairs: [
            ['A label: "spam" or "not spam"', 'Exact match'],
            ['A reply that must be JSON with a "total" key', 'A rule in code'],
            ['A friendly, accurate summary of an article', 'A model as judge'],
          ],
          explain: 'Use the simplest grader that works. Code checks are free and never vary. Save the judge for text with many good answers.',
        },
        {
          kind: 'write',
          prompt: 'Line 1 holds the expected labels for an eval set, separated by spaces. Line 2 holds the labels a prompt actually gave, in the same order. Grade by exact match. Print how many are correct, then the accuracy as a whole-number percentage on a second line.',
          language: 'python',
          starter: 'expected = input().split()\noutputs = input().split()\ncorrect = 0\nfor i in range(len(expected)):\n    correct += 1\nprint(correct)\n',
          tests: [
            { stdin: ['spam ok spam ok', 'spam ok ok ok'], expected: '3\n75' },
            { stdin: ['a b c', 'a b c'], expected: '3\n100' },
            { stdin: ['yes no yes no yes', 'no no no no no'], expected: '2\n40' },
          ],
          hint: 'Only add 1 when outputs[i] == expected[i]. The percentage is correct * 100 // len(expected).',
          solution:
            'expected = input().split()\noutputs = input().split()\ncorrect = 0\nfor i in range(len(expected)):\n    if outputs[i] == expected[i]:\n        correct += 1\nprint(correct)\nprint(correct * 100 // len(expected))\n',
          explain: 'That is a whole eval: cases, a grader and a score. Real ones are longer, but they have the same three parts.',
        },
        {
          kind: 'steps',
          prompt: 'Two prompt versions ran on the same four cases. Tap the right box for each question.',
          cells: [
            'Case 1: A right, B right',
            'Case 2: A wrong, B right',
            'Case 3: A right, B wrong',
            'Case 4: A wrong, B right',
          ],
          steps: [
            { ask: 'Which case did version B break?', answer: 2 },
            { ask: 'Which case tells you nothing about which version is better?', answer: 0 },
            { ask: 'B scores 3 of 4 and A scores 2 of 4. Before shipping B, which case should you read closely?', answer: 2 },
          ],
          explain: 'B wins overall, but it lost a case A handled. A total hides that. Reading the failures shows what the change cost.',
        },
        {
          kind: 'spot',
          prompt: 'Someone compared two prompt versions and decided B is better. Tap the line that makes the comparison unfair.',
          lines: [
            'Eval set: 40 support emails with expected labels',
            'Version A: run on all 40 emails, 33 correct',
            'Version B: run on the 10 easiest emails, 10 correct',
            'Conclusion: B is better, 100% beats 82%',
          ],
          answer: 2,
          explain: 'The versions faced different cases, so the scores cannot be compared. Always run both on the same set.',
        },
        {
          kind: 'write',
          prompt: 'Two functions stand in for two prompt versions that label a message `urgent` or `normal`. Finish `score` so it returns how many cases a version gets right. The program reads one extra case as `text|label`. Print `A` and its score, `B` and its score, then `winner` and the better version (or `tie`).',
          language: 'python',
          starter: `cases = [
    ("Server is down!", "urgent"),
    ("Lunch on Friday?", "normal"),
    ("URGENT: invoice overdue", "urgent"),
    ("Is the site down for anyone else", "urgent"),
]
text, label = input().split("|")
cases.append((text, label))


def version_a(text):
    # Stand-in for prompt version A.
    return "urgent" if "!" in text else "normal"


def version_b(text):
    # Stand-in for prompt version B.
    lowered = text.lower()
    return "urgent" if "down" in lowered or "urgent" in lowered else "normal"


def score(version):
    correct = 0
    # run version on every case and count exact matches
    return correct


a = score(version_a)
b = score(version_b)
print("A", a)
print("B", b)
`,
          tests: [
            { stdin: ['See you tomorrow|normal'], expected: 'A 3\nB 5\nwinner B' },
            { stdin: ['Happy birthday!|normal'], expected: 'A 2\nB 5\nwinner B' },
            { stdin: ['Slow down, no rush|normal'], expected: 'A 3\nB 4\nwinner B' },
          ],
          hint: 'In score: for text, label in cases: if version(text) == label: correct += 1. Then compare a and b with if / elif / else.',
          solution: `cases = [
    ("Server is down!", "urgent"),
    ("Lunch on Friday?", "normal"),
    ("URGENT: invoice overdue", "urgent"),
    ("Is the site down for anyone else", "urgent"),
]
text, label = input().split("|")
cases.append((text, label))


def version_a(text):
    # Stand-in for prompt version A.
    return "urgent" if "!" in text else "normal"


def version_b(text):
    # Stand-in for prompt version B.
    lowered = text.lower()
    return "urgent" if "down" in lowered or "urgent" in lowered else "normal"


def score(version):
    correct = 0
    for text, label in cases:
        if version(text) == label:
            correct += 1
    return correct


a = score(version_a)
b = score(version_b)
print("A", a)
print("B", b)
if a > b:
    print("winner A")
elif b > a:
    print("winner B")
else:
    print("winner tie")
`,
          explain: 'Same cases, same grader, two versions: that is a fair comparison. The third test shows B is not perfect either, which one lucky example would never reveal.',
        },
        {
          kind: 'choice',
          prompt: 'A real user finds an input your prompt gets wrong. You fix the prompt. What else should you do?',
          options: [
            'Nothing: it is fixed now',
            'Delete the eval cases that still pass',
            'Add that input to the eval set with its expected result',
            'Replace the whole eval set with just this input',
          ],
          answer: 2,
          explain: 'Every real failure is a free test case. Adding it means a later prompt change cannot quietly bring the bug back.',
        },
      ],
    },
  ],
}
