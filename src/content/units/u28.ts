import type { Unit } from '../types'

// Facts about the API in this chapter were checked against Anthropic's
// developer docs (platform.claude.com/docs) in November 2026. Runnable
// exercises use a small stand-in function, because the real `anthropic`
// package and a network are not available in the browser runner.

export const u28: Unit = {
  id: 'u28',
  week: 3,
  course: 'ai',
  title: 'The Claude API',
  summary: 'Messages, roles, models and replies',
  lessons: [
    {
      id: 'u28-call',
      title: 'Your first API call',
      exercises: [
        {
          kind: 'concept',
          title: 'Calling a model from code',
          body: 'A chat app is one way to reach a model. An **API call** is the other: your program sends a request over the internet to the servers where the model runs, and gets the reply back as data.\n\nThis is the official Python library. The model named was current at the time of writing. Names change, so check the docs.',
          code: `import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'When your program calls `client.messages.create(...)`, where does the model actually run?',
          options: [
            'Inside your Python program',
            'In your web browser',
            'On the provider\'s servers, reached over the internet',
            'Inside the `anthropic` package you installed',
          ],
          answer: 2,
          explain: 'The package is only a messenger. It sends your request to the servers and hands you back the reply.',
        },
        {
          kind: 'concept',
          title: 'Three things every call needs',
          body: '`model`: which model should answer, as a name in a string.\n\n`max_tokens`: the most tokens the reply may use. It is a cap, not a target.\n\n`messages`: the conversation so far, as a list. Each item is a dict with a `role` and some `content`.',
        },
        {
          kind: 'match',
          prompt: 'Match each part of the request to what it does.',
          pairs: [
            ['model', 'Chooses which model answers'],
            ['max_tokens', 'Caps the length of the reply'],
            ['messages', 'Holds the conversation as a list'],
            ['"role": "user"', 'Marks a message as coming from you'],
          ],
          explain: 'Which model, how long at most, and what has been said. Those three make a complete request.',
        },
        {
          kind: 'blank',
          prompt: 'Fill in the three required parts of the call.',
          code: `response = client.messages.create(
    ___="claude-opus-5-5",
    ___=500,
    ___=[{"role": "user", "content": "Name one planet."}],
)`,
          language: 'python',
          bank: ['model', 'max_tokens', 'messages', 'prompt', 'length'],
          answers: ['model', 'max_tokens', 'messages'],
          explain: 'The model name is a string, the cap is a number, and the conversation is a list of dicts.',
        },
        {
          kind: 'spot',
          prompt: 'This call fails with a "bad request" error. Tap the line with the mistake.',
          lines: [
            'response = client.messages.create(',
            '    model="claude-opus-5-5",',
            '    max_words=500,',
            '    messages=[{"role": "user", "content": "Hi"}],',
            ')',
          ],
          language: 'python',
          answer: 2,
          explain: 'The limit is called `max_tokens`. Length is always counted in tokens, never in words.',
        },
        {
          kind: 'type',
          prompt: 'In the `messages` list, what `role` does a message written by you have? Type the word.',
          accept: ['user', '"user"', "'user'"],
          explain: 'Your messages have the role `user`. The replies from the model have the role `assistant`.',
        },
        {
          kind: 'concept',
          title: 'A message is a dict in a list',
          body: 'One message is a dict with two keys, `role` and `content`. `messages` is a list of them, even when there is only one.\n\n`messages[-1]` is the last item in the list.',
          code: `message = {"role": "user", "content": "Name one planet."}
messages = [message]

print(len(messages))
print(messages[-1]["role"])
print(messages[-1]["content"])`,
          language: 'python',
          output: '1\nuser\nName one planet.',
        },
        {
          kind: 'order',
          prompt: 'Put this program in order.',
          lines: [
            'import anthropic',
            'client = anthropic.Anthropic()',
            'response = client.messages.create(',
            '    model="claude-opus-5-5",',
            '    max_tokens=300,',
            '    messages=[{"role": "user", "content": "Hi"}],',
            ')',
          ],
          language: 'python',
          explain: 'Import the library, make a client, then make the call with its three required parts.',
        },
        {
          kind: 'write',
          prompt: 'You cannot call the real API here, so `fake_model` stands in for it. Read a question, put it in `messages` as one user message, and print what `fake_model(messages)` returns.',
          language: 'python',
          starter: `def fake_model(messages):
    # A stand-in for the real API. It just repeats the last message.
    last = messages[-1]
    if last["role"] != "user":
        return "Error: the last message must come from the user"
    return "You asked: " + last["content"]

question = input()
messages = []  # put one user message in this list
print(fake_model(messages))
`,
          tests: [
            { stdin: ['What is a token?'], expected: 'You asked: What is a token?' },
            { stdin: ['Hello'], expected: 'You asked: Hello' },
          ],
          hint: 'A message is a dict with two keys: {"role": "user", "content": question}. Put it inside the list.',
          solution: `def fake_model(messages):
    # A stand-in for the real API. It just repeats the last message.
    last = messages[-1]
    if last["role"] != "user":
        return "Error: the last message must come from the user"
    return "You asked: " + last["content"]

question = input()
messages = [{"role": "user", "content": question}]
print(fake_model(messages))
`,
          explain: 'This list of role-and-content dicts is exactly the shape the real `messages` parameter takes.',
        },
      ],
    },
    {
      id: 'u28-conversation',
      title: 'Keeping a conversation going',
      exercises: [
        {
          kind: 'concept',
          title: 'A list of turns',
          body: 'A conversation is a list of **turns**. Each turn is a dict: who spoke (`role`) and what they said (`content`).\n\nThere are two roles: `user` for you and `assistant` for the model. The list starts with a user turn, then the two roles alternate.',
          code: `messages = [
    {"role": "user", "content": "Name a planet."},
    {"role": "assistant", "content": "Saturn."},
    {"role": "user", "content": "How many moons does it have?"},
]`,
          language: 'python',
        },
        {
          kind: 'steps',
          prompt: 'Tap the role each line of this chat would have in the `messages` list.',
          cells: ['user', 'assistant', 'Not in the list'],
          steps: [
            { ask: 'You type: "Suggest a name for my cat."', answer: 0 },
            { ask: 'The model writes: "How about Pixel?"', answer: 1 },
            { ask: 'You type: "Something more old-fashioned."', answer: 0 },
            { ask: 'The model writes: "Then perhaps Mabel."', answer: 1 },
            { ask: 'Something you typed in a different chat last week.', answer: 2 },
          ],
          explain: 'What you send is `user`. What the model sends back is `assistant`. Other conversations are not part of this list at all.',
        },
        {
          kind: 'concept',
          title: 'The API forgets everything',
          body: 'The API is **stateless**: it keeps nothing between calls. Each request must carry the whole conversation.\n\nTo continue a chat: add the reply to your list as an `assistant` turn, add the new question as a `user` turn, and send the **entire list** again.',
        },
        {
          kind: 'choice',
          prompt: 'Your first call asked "What is the capital of Peru?" and got "Lima." Your second call sends only one message: "And its population?" What happens?',
          options: [
            'The model answers about Lima, because it remembers',
            'The API returns the first answer again',
            'The model does not know what "its" refers to',
            'The API refuses any second call',
          ],
          answer: 2,
          explain: 'The second request contains nothing about Peru or Lima. If the history is not in the list, the model never sees it.',
        },
        {
          kind: 'order',
          prompt: 'Put the lines in order to ask a follow-up question with the full history.',
          lines: [
            'messages = [{"role": "user", "content": "Name a planet."}]',
            'first = client.messages.create(model=MODEL, max_tokens=300, messages=messages)',
            'messages.append({"role": "assistant", "content": first.content})',
            'messages.append({"role": "user", "content": "How big is it?"})',
            'second = client.messages.create(model=MODEL, max_tokens=300, messages=messages)',
          ],
          language: 'python',
          explain: 'Ask, save the reply as an assistant turn, add the next question, and send the whole list again.',
        },
        {
          kind: 'type',
          prompt: 'A chat has had 2 questions and 2 replies. You add a third question and send. How many messages are in the list for this call? Type the number.',
          accept: ['5', 'five'],
          explain: 'Two user turns, two assistant turns, plus the new user turn. The list grows with every exchange.',
        },
        {
          kind: 'concept',
          title: 'Where the system prompt goes',
          body: 'The system prompt from the last chapter is not a turn in the list. It has its own parameter, `system`, next to `model` and `max_tokens`.\n\nLike the history, it is sent again with every call.',
          code: `response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=500,
    system="You are a patient maths tutor.",
    messages=[{"role": "user", "content": "What is a prime number?"}],
)`,
          language: 'python',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line with a role the API does not accept.',
          lines: [
            'messages = [',
            '    {"role": "user", "content": "Tell me a joke."},',
            '    {"role": "bot", "content": "Why did the chicken cross the road?"},',
            '    {"role": "user", "content": "Why?"},',
            ']',
          ],
          language: 'python',
          answer: 2,
          explain: 'The reply side of the conversation is always `assistant`. A name like `bot` or `ai` is rejected.',
        },
        {
          kind: 'concept',
          title: 'Grow the same list',
          body: '`append` adds a turn to the end of the list you already have. The earlier turns stay where they are, so the next call can carry all of them.\n\nMaking a new list would throw the history away.',
          code: `messages = [{"role": "user", "content": "Name a planet."}]
messages.append({"role": "assistant", "content": "Saturn."})
messages.append({"role": "user", "content": "How big is it?"})

print(len(messages))
print(messages[-1]["content"])`,
          language: 'python',
          output: '3\nHow big is it?',
        },
        {
          kind: 'write',
          prompt: 'Read two questions. Send the first and print the reply text. Then keep the conversation going: append the reply as an assistant turn, append the second question as a user turn, send the **whole list** and print the second reply text.',
          language: 'python',
          starter: `def fake_model(messages):
    # A stand-in for the real API. It reports how many user turns it was sent.
    seen = 0
    for m in messages:
        if m["role"] == "user":
            seen += 1
    return "Seen " + str(seen) + ": " + messages[-1]["content"]

first = input()
second = input()

messages = [{"role": "user", "content": first}]
reply = fake_model(messages)
print(reply)

# This starts a brand-new list, so the history is lost. Fix it.
messages = [{"role": "user", "content": second}]
reply = fake_model(messages)
print(reply)
`,
          tests: [
            { stdin: ['Hi', 'Bye'], expected: 'Seen 1: Hi\nSeen 2: Bye' },
            { stdin: ['Name a planet', 'How big is it?'], expected: 'Seen 1: Name a planet\nSeen 2: How big is it?' },
          ],
          hint: 'Do not make a new list. Use messages.append(...) twice: once with role "assistant" and the reply, once with role "user" and the second question.',
          solution: `def fake_model(messages):
    # A stand-in for the real API. It reports how many user turns it was sent.
    seen = 0
    for m in messages:
        if m["role"] == "user":
            seen += 1
    return "Seen " + str(seen) + ": " + messages[-1]["content"]

first = input()
second = input()

messages = [{"role": "user", "content": first}]
reply = fake_model(messages)
print(reply)

messages.append({"role": "assistant", "content": reply})
messages.append({"role": "user", "content": second})
reply = fake_model(messages)
print(reply)
`,
          explain: 'The second call saw both user turns only because you sent them both. The memory of a chat lives in your list.',
        },
        {
          kind: 'choice',
          prompt: 'Your tutor app should always answer in simple words. Where does that instruction belong?',
          options: [
            'In the `system` parameter',
            'In `max_tokens`',
            'In the model name',
            'Nowhere: the API learns it after a few calls',
          ],
          answer: 0,
          explain: 'Standing instructions go in `system`. The API learns nothing between calls, so you send it every time.',
        },
      ],
    },
    {
      id: 'u28-reply',
      title: 'Reading the reply',
      exercises: [
        {
          kind: 'concept',
          title: 'Content comes in blocks',
          body: 'The response is an object with several fields. The reply itself is in `content`, and `content` is a **list of blocks**, not one string.\n\nA text block has `type` equal to `"text"` and the words in `text`. Other block types exist, so check the type before reading.',
          code: `for block in response.content:
    if block.type == "text":
        print(block.text)`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Why is `content` a list of blocks and not a single string?',
          options: [
            'To make it harder to read',
            'Because every word is its own block',
            'Because old versions of Python had no strings',
            'A reply can hold more than one kind of thing, such as text and other block types',
          ],
          answer: 3,
          explain: 'A list leaves room for different kinds of block in one reply. You will meet more kinds when you reach tools.',
        },
        {
          kind: 'concept',
          title: 'The same loop, with dicts',
          body: 'The real library gives objects, read with a dot: `block.type`. The practice code in this course uses dicts, read with square brackets: `block["type"]`. The loop is the same.\n\nNotice the first block here is not text.',
          code: `content = [
    {"type": "thinking", "thinking": "A short answer will do."},
    {"type": "text", "text": "Saturn."},
]
for block in content:
    if block["type"] == "text":
        print("text block:", block["text"])
    else:
        print("skipped a", block["type"], "block")`,
          language: 'python',
          output: 'skipped a thinking block\ntext block: Saturn.',
        },
        {
          kind: 'write',
          prompt: 'The stand-in returns a dict shaped like a real response. Read a name, call `fake_model`, and print the text of every block whose type is `"text"`. The real library gives objects (`block.text`). Here they are dicts, so use `block["text"]`.',
          language: 'python',
          starter: `def fake_model(messages):
    name = messages[-1]["content"]
    return {
        "content": [
            {"type": "thinking", "thinking": "The user gave a name. Greet them."},
            {"type": "text", "text": "Hello, " + name + "!"},
        ],
        "stop_reason": "end_turn",
        "usage": {"input_tokens": 12, "output_tokens": 9},
    }

response = fake_model([{"role": "user", "content": input()}])

# This assumes the first block is text. It is not. Loop and check the type.
print(response["content"][0]["text"])
`,
          tests: [
            { stdin: ['Ada'], expected: 'Hello, Ada!' },
            { stdin: ['Grace'], expected: 'Hello, Grace!' },
          ],
          hint: 'for block in response["content"]: then if block["type"] == "text": print(block["text"]).',
          solution: `def fake_model(messages):
    name = messages[-1]["content"]
    return {
        "content": [
            {"type": "thinking", "thinking": "The user gave a name. Greet them."},
            {"type": "text", "text": "Hello, " + name + "!"},
        ],
        "stop_reason": "end_turn",
        "usage": {"input_tokens": 12, "output_tokens": 9},
    }

response = fake_model([{"role": "user", "content": input()}])

for block in response["content"]:
    if block["type"] == "text":
        print(block["text"])
`,
          explain: 'Grabbing block number 0 works until the first block is something else. Checking the type always works.',
        },
        {
          kind: 'concept',
          title: 'Why did it stop?',
          body: 'Every response has a `stop_reason`. Two you will see most:\n\n`"end_turn"`: the model finished what it wanted to say.\n\n`"max_tokens"`: the reply hit your cap and was **cut off**, possibly mid-sentence.\n\n`"tool_use"`: the model wants to use a tool, a topic for later.\n\nCheck it before trusting that a reply is complete.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the stop reason you would expect in each case.',
          cells: ['end_turn', 'max_tokens', 'tool_use'],
          steps: [
            { ask: 'You ask for one word and get one word.', answer: 0 },
            { ask: 'You ask for a long essay with max_tokens=50.', answer: 1 },
            { ask: 'The reply ends halfway through a sentence.', answer: 1 },
            { ask: 'The reply ends with a neat closing line, well under the cap.', answer: 0 },
            { ask: 'The model pauses because it wants to call a tool.', answer: 2 },
          ],
          explain: 'A natural finish is `end_turn`. Running into your own limit is `max_tokens`. A request to use a tool is `tool_use`.',
        },
        {
          kind: 'type',
          prompt: 'A JSON reply stops before its closing bracket, and your parser crashes. Which `stop_reason` would explain that? Type it.',
          accept: ['max_tokens', '"max_tokens"', 'max tokens'],
          explain: 'The cap cut the reply short. Raise `max_tokens`, or ask for a shorter answer.',
        },
        {
          kind: 'concept',
          title: 'Usage: what it cost in tokens',
          body: 'Every response also carries `usage`. It reports `input_tokens`, everything you sent, and `output_tokens`, everything the model wrote.\n\nThese are exact counts for that call. They are what your bill is based on, so they are worth logging.',
          code: `print(response.usage.input_tokens)
print(response.usage.output_tokens)`,
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Add up the tokens one call used.',
          code: 'total = response.usage.___ + response.usage.___',
          language: 'python',
          bank: ['input_tokens', 'output_tokens', 'words', 'max_tokens'],
          answers: ['input_tokens', 'output_tokens'],
          explain: 'What went in plus what came out. `max_tokens` is the cap you set, not a count of what was used.',
        },
        {
          kind: 'concept',
          title: 'A running total',
          body: '`=` replaces the old value. `+=` adds to it.\n\nTo total something across several calls, start at 0 before the loop and use `+=` inside it. Here two calls used 12 and 30 input tokens.',
          code: `calls = [
    {"input_tokens": 12, "output_tokens": 9},
    {"input_tokens": 30, "output_tokens": 15},
]
total_in = 0
for usage in calls:
    total_in += usage["input_tokens"]
print(total_in)`,
          language: 'python',
          output: '42',
        },
        {
          kind: 'write',
          prompt: 'Read a number, then that many prompts, one per line. Send each prompt to `fake_model` in its own call and add up the usage. Print `input` and the total input tokens, then `output` and the total output tokens on a second line.',
          language: 'python',
          starter: `def fake_model(messages):
    words = len(messages[-1]["content"].split())
    return {
        "content": [{"type": "text", "text": "ok"}],
        "stop_reason": "end_turn",
        "usage": {"input_tokens": words, "output_tokens": words * 2},
    }

count = int(input())
total_in = 0
total_out = 0
for i in range(count):
    response = fake_model([{"role": "user", "content": input()}])
    # These lines keep only the latest call. Make them add up.
    total_in = response["usage"]["input_tokens"]
    total_out = response["usage"]["output_tokens"]

print("input", total_in)
print("output", total_out)
`,
          tests: [
            { stdin: ['3', 'hi there', 'what is a token', 'bye'], expected: 'input 7\noutput 14' },
            { stdin: ['2', 'one two three', 'four five'], expected: 'input 5\noutput 10' },
          ],
          hint: 'Use += so each call adds to the running total: total_in += response["usage"]["input_tokens"].',
          solution: `def fake_model(messages):
    words = len(messages[-1]["content"].split())
    return {
        "content": [{"type": "text", "text": "ok"}],
        "stop_reason": "end_turn",
        "usage": {"input_tokens": words, "output_tokens": words * 2},
    }

count = int(input())
total_in = 0
total_out = 0
for i in range(count):
    response = fake_model([{"role": "user", "content": input()}])
    total_in += response["usage"]["input_tokens"]
    total_out += response["usage"]["output_tokens"]

print("input", total_in)
print("output", total_out)
`,
          explain: 'Keeping a running total of usage is how you find out what a feature really costs.',
        },
        {
          kind: 'spot',
          prompt: 'This code crashes with "list has no attribute text". Tap the line that causes it.',
          lines: [
            'response = client.messages.create(',
            '    model=MODEL, max_tokens=300, messages=messages',
            ')',
            'print(response.content.text)',
            'print(response.stop_reason)',
          ],
          language: 'python',
          answer: 3,
          explain: '`content` is a list of blocks. The text lives on a block inside it, such as `response.content[0].text` after checking its type.',
        },
      ],
    },
    {
      id: 'u28-models-keys',
      title: 'Models and keys',
      exercises: [
        {
          kind: 'concept',
          title: 'A family of models',
          body: 'A provider usually offers several models at once, in tiers. **Larger** models handle harder tasks but are slower and cost more per token. **Smaller** ones are faster and cheaper.\n\nAt the time of writing, Claude tiers include Opus (larger), Sonnet (middle) and Haiku (smaller). Exact names, limits and prices change: check the models page in the docs.',
        },
        {
          kind: 'steps',
          prompt: 'Pick a starting tier for each job.',
          cells: ['Smaller tier', 'Middle tier', 'Larger tier'],
          steps: [
            { ask: 'Label 50,000 support emails as "billing" or "other", as cheaply as possible.', answer: 0 },
            { ask: 'Untangle a subtle bug across many files, where quality matters most.', answer: 2 },
            { ask: 'An everyday assistant that needs a balance of quality, speed and cost.', answer: 1 },
            { ask: 'Suggestions that must appear almost instantly as someone types.', answer: 0 },
          ],
          explain: 'Simple, high-volume or instant jobs suit smaller models. Hard reasoning earns the cost of a larger one.',
        },
        {
          kind: 'type',
          prompt: 'Which usually costs less per token: a smaller model or a larger one? Type smaller or larger.',
          accept: ['smaller', 'a smaller model', 'smaller model', 'small', 'the smaller one'],
          explain: 'Smaller models are cheaper and quicker to run. The trade is that they cope less well with hard tasks.',
        },
        {
          kind: 'choice',
          prompt: 'What is the most reliable way to choose a model for your feature?',
          options: [
            'Always use the largest, whatever the task',
            'Always use the cheapest, whatever the task',
            'Try your real task on more than one tier and compare quality, speed and cost',
            'Pick the one with the nicest name',
          ],
          answer: 2,
          explain: 'The right tier depends on the job. A quick test on your own examples beats any general rule.',
        },
        {
          kind: 'concept',
          title: 'API keys are passwords',
          body: 'An **API key** is a secret string that tells the provider which account to bill. Anyone who has it can spend your money.\n\nNever type it into your code. Keep it in an **environment variable** named `ANTHROPIC_API_KEY`. The library finds it there by itself.',
          code: `import anthropic

# No key in the code. It is read from the environment.
client = anthropic.Anthropic()`,
          language: 'python',
        },
        {
          kind: 'spot',
          prompt: 'This file is about to be committed to Git. Tap the line that must not be in it.',
          lines: [
            'import anthropic',
            'client = anthropic.Anthropic(api_key="sk-ant-EXAMPLE-not-a-real-key")',
            'messages = [{"role": "user", "content": "Hi"}]',
            'response = client.messages.create(model=MODEL, max_tokens=100, messages=messages)',
          ],
          language: 'python',
          answer: 1,
          explain: 'A key written in code ends up in Git history, where anyone with the repo can read it. Leave the brackets empty and use the environment.',
        },
        {
          kind: 'blank',
          prompt: 'Create the client so that it reads the key from the environment.',
          code: 'import anthropic\n\nclient = anthropic.___()',
          language: 'python',
          bank: ['Anthropic', 'Key', 'connect', 'Messages'],
          answers: ['Anthropic'],
          explain: '`anthropic.Anthropic()` with empty brackets looks for the key in the environment for you.',
        },
        {
          kind: 'concept',
          title: 'If a key leaks',
          body: 'Suppose a key is saved in a file that other people can open. Removing it afterwards is not enough: someone may already have copied it.\n\nA leaked key has to be **revoked**, which means switched off so that it stops working. Then you create a new one and keep that one in the environment.',
        },
        {
          kind: 'choice',
          prompt: 'You realise you pushed a real API key to a public repository an hour ago. What do you do first?',
          options: [
            'Delete the line and push again',
            'Make the repository private',
            'Revoke that key and create a new one',
            'Wait and see whether anyone uses it',
          ],
          answer: 2,
          explain: 'The key is in the history and may already be copied. Only revoking it makes it worthless.',
        },
        {
          kind: 'match',
          prompt: 'Match each item to where it belongs.',
          pairs: [
            ['The API key', 'An environment variable'],
            ['The model name', 'The `model` parameter'],
            ['Standing instructions', 'The `system` parameter'],
            ['The conversation', 'The `messages` list'],
          ],
          explain: 'Only the key is a secret. Everything else is ordinary code you can commit.',
        },
      ],
    },
    {
      id: 'u28-streaming-errors',
      title: 'Streaming, errors and retries',
      exercises: [
        {
          kind: 'concept',
          title: 'Streaming',
          body: 'A reply is written token by token, and a long one takes a while. With **streaming**, the API sends each piece as soon as it exists. You do not wait for the whole reply.\n\nThe total time is about the same. But the first words show up almost at once, which feels much faster.',
          code: `with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=messages,
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'What does streaming improve for someone using your chat app?',
          options: [
            'How soon the first words appear',
            'The quality of the answer',
            'The price per token',
            'How much the model can remember',
          ],
          answer: 0,
          explain: 'Same reply, same tokens. The difference is that the reader sees it arrive piece by piece and is not left staring at a blank screen.',
        },
        {
          kind: 'type',
          prompt: 'A stream delivers three pieces in order: "Hel", "lo th", "ere". The loop prints each with `end=""`. What is on the screen at the end? Type it.',
          accept: ['hello there'],
          explain: 'The pieces join with nothing between them. Chunks do not line up with whole words.',
        },
        {
          kind: 'concept',
          title: 'Calls can fail',
          body: 'When a call fails, the API says why with a status code.\n\n**Your mistake**: 400 (bad request) or 401 (bad key). Retrying sends the same mistake. Fix the code.\n\n**Temporary**: 429 (you hit a **rate limit**, a cap on how much you may send in a period), or 500 and 529 (the service is struggling). Wait, then retry.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the right response to each error.',
          cells: ['Fix your request', 'Wait and retry', 'Nothing: it worked'],
          steps: [
            { ask: '401: the API key is invalid.', answer: 0 },
            { ask: '429: too many requests this minute.', answer: 1 },
            { ask: '400: the request is missing max_tokens.', answer: 0 },
            { ask: '529: the service is overloaded right now.', answer: 1 },
            { ask: '200: the reply arrived.', answer: 2 },
          ],
          explain: 'If the request itself is wrong, sending it again changes nothing. If the moment is wrong, a later try can succeed.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the one error here that is not worth retrying.',
          lines: [
            '429 rate_limit_error',
            '500 api_error',
            '401 authentication_error',
            '529 overloaded_error',
          ],
          answer: 2,
          explain: 'A wrong key stays wrong however long you wait. The other three are temporary conditions.',
        },
        {
          kind: 'concept',
          title: 'Back off',
          body: 'Retrying instantly, again and again, just adds to the pile-up. Wait a little, and wait **longer each time**: 1 second, then 2, then 4. This is **exponential backoff**.\n\nAlways cap the number of tries. The official library already retries a couple of times for you, and its `max_retries` setting changes how many.',
        },
        {
          kind: 'concept',
          title: 'Doubling in a loop',
          body: 'To make a value twice as big on every trip round a loop, replace it with two times itself at the end of the loop body.',
          code: `size = 3
for i in range(4):
    print(size)
    size = size * 2`,
          language: 'python',
          output: '3\n6\n12\n24',
        },
        {
          kind: 'write',
          prompt: 'Read how many retries are planned. Print the wait before each one, in seconds, one per line. The first wait is 1 and each wait is double the one before.',
          language: 'python',
          starter: `retries = int(input())
wait = 1
for i in range(retries):
    print(wait)
    # make the next wait twice as long
`,
          tests: [
            { stdin: ['3'], expected: '1\n2\n4' },
            { stdin: ['5'], expected: '1\n2\n4\n8\n16' },
          ],
          hint: 'After printing, double the wait: wait = wait * 2.',
          solution: `retries = int(input())
wait = 1
for i in range(retries):
    print(wait)
    wait = wait * 2
`,
          explain: 'Doubling gives a struggling service more room with every attempt. Real code would pause for that many seconds before trying again.',
        },
        {
          kind: 'concept',
          title: 'Several chances',
          body: 'A `try` inside a loop gives a failing step more than one chance. A failure jumps to `except`, and the loop goes round again.\n\n`break` leaves the loop as soon as one try works. Here the third try does.',
          code: `answers = ["later", "later", "7"]
for attempt in range(3):
    try:
        number = int(answers[attempt])
        print("got", number)
        break
    except ValueError:
        print("not yet")`,
          language: 'python',
          output: 'not yet\nnot yet\ngot 7',
        },
        {
          kind: 'write',
          prompt: 'The stand-in fails with `RateLimitError` a set number of times before it works. Call it up to `MAX_TRIES` times. After each failure print `retrying`. On success print the reply text and stop. If every try fails, print `gave up` at the end.',
          language: 'python',
          starter: `class RateLimitError(Exception):
    pass

fail_times = int(input())
calls = 0

def fake_model(messages):
    global calls
    calls += 1
    if calls <= fail_times:
        raise RateLimitError("too many requests")
    return {"content": [{"type": "text", "text": "Done"}], "stop_reason": "end_turn"}

messages = [{"role": "user", "content": "Hello"}]
MAX_TRIES = 3
done = False

# One try, with no safety net. Wrap it in a loop with try / except.
response = fake_model(messages)
print(response["content"][0]["text"])
done = True

if not done:
    print("gave up")
`,
          tests: [
            { stdin: ['0'], expected: 'Done' },
            { stdin: ['2'], expected: 'retrying\nretrying\nDone' },
            { stdin: ['5'], expected: 'retrying\nretrying\nretrying\ngave up' },
          ],
          hint: 'for attempt in range(MAX_TRIES): put the call and the print inside try:, then set done = True and break. Under except RateLimitError: print("retrying").',
          solution: `class RateLimitError(Exception):
    pass

fail_times = int(input())
calls = 0

def fake_model(messages):
    global calls
    calls += 1
    if calls <= fail_times:
        raise RateLimitError("too many requests")
    return {"content": [{"type": "text", "text": "Done"}], "stop_reason": "end_turn"}

messages = [{"role": "user", "content": "Hello"}]
MAX_TRIES = 3
done = False

for attempt in range(MAX_TRIES):
    try:
        response = fake_model(messages)
        print(response["content"][0]["text"])
        done = True
        break
    except RateLimitError:
        print("retrying")

if not done:
    print("gave up")
`,
          explain: 'A capped loop turns a temporary failure into a short delay, and a lasting one into a clear message. The real library raises `anthropic.RateLimitError` for a 429.',
        },
        {
          kind: 'choice',
          prompt: 'How many requests per minute does the API allow?',
          options: [
            'Exactly 60 for everyone',
            'It is unlimited',
            'It depends on the model and your account, so look it up in the docs',
            'One at a time, always',
          ],
          answer: 2,
          explain: 'Limits differ by model and account and change over time. Read the current numbers, and write code that copes when you hit them.',
        },
      ],
    },
  ],
}
