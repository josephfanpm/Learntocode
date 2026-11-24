import type { Unit } from '../types'

// Shared by the two loop exercises: tools plus a scripted stand-in for a model.
const LOOP_SETUP = `import json


def get_weather(inputs):
    data = {"Lima": "18C cloudy", "Oslo": "3C snow"}
    return data.get(inputs["city"], "unknown city")


TOOLS = {"get_weather": get_weather}


def fake_model(messages):
    # A scripted stand-in for a real model call. It asks for the weather
    # of each city in the first message, one at a time, then answers.
    cities = messages[0]["content"].split()
    results = []
    for m in messages:
        if m["role"] == "user" and isinstance(m["content"], list):
            for block in m["content"]:
                results.append(block["content"])
    if len(results) < len(cities):
        n = len(results)
        return {"stop_reason": "tool_use", "content": [
            {"type": "tool_use", "id": "toolu_" + str(n + 1),
             "name": "get_weather", "input": {"city": cities[n]}}]}
    return {"stop_reason": "end_turn", "content": [
        {"type": "text", "text": "Weather: " + "; ".join(results)}]}

`

export const u31: Unit = {
  id: 'u31',
  week: 6,
  lecture: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api',
  lectureFrom: 'Anthropic course: Building with the Claude API',
  course: 'ai',
  title: 'Tools',
  summary: 'Letting a model call your code',
  lessons: [
    {
      id: 'u31-why',
      title: 'Why models need tools',
      exercises: [
        {
          kind: 'concept',
          title: 'A brain in a jar',
          body: 'On its own, a model only writes text from its training and the prompt. It cannot:\n\n- **look things up**, like today\'s weather or your orders\n- **calculate** big sums reliably\n- **act**: send an email, save a file\n\nA **tool** fixes this. It is a function in *your* program that the model can ask you to run.',
        },
        {
          kind: 'choice',
          prompt: 'Which question can a model not answer correctly without a tool?',
          options: [
            'What is a for loop?',
            'What is on my calendar tomorrow?',
            'Rewrite this sentence to sound friendlier.',
            'What is the capital of France?',
          ],
          answer: 1,
          explain: 'Your calendar was never in the training data and is not in the prompt. Something has to go and fetch it.',
        },
        {
          kind: 'steps',
          prompt: 'For each request, tap what the model needs.',
          cells: ['No tool needed', 'A look-up tool', 'A calculator tool', 'An action tool'],
          steps: [
            { ask: '"Explain what a variable is."', answer: 0 },
            { ask: '"Where is order 812 right now?"', answer: 1 },
            { ask: '"What is 48,219 times 7,733, exactly?"', answer: 2 },
            { ask: '"Cancel order 812."', answer: 3 },
          ],
          explain: 'Explaining is what a model does alone. Fresh facts, exact maths and changing things in the world all need your code.',
        },
        {
          kind: 'concept',
          title: 'The model asks. Your code acts.',
          body: 'A model **never runs code itself**. With tools, it can only write a request: "please run `get_weather` with city Lima."\n\nYour program reads the request, runs the function, and sends the result back. Like a diner and a waiter: the diner orders, but only the waiter walks into the kitchen.',
        },
        {
          kind: 'choice',
          prompt: 'When a model "uses a tool", what does it actually produce?',
          options: [
            'The finished result of the tool',
            'Python code that it runs on its own computer',
            'A structured request: a tool name and the inputs to use',
            'A direct connection to your database',
          ],
          answer: 2,
          explain: 'The model\'s only output is text. A tool request is text in an agreed shape that your program knows how to read.',
        },
        {
          kind: 'spot',
          prompt: 'This chat app gave its model no tools. Tap the line you should not trust.',
          lines: [
            'User: What is the weather in Lima right now?',
            'Model: It is 24°C and sunny in Lima right now.',
            'User: Thanks! And what does "humid" mean?',
            'Model: Humid means the air holds a lot of water vapour.',
          ],
          answer: 1,
          explain: 'With no way to look anything up, the model cannot know the weather right now. The number is a fluent guess. The definition is fine.',
        },
        {
          kind: 'type',
          prompt: 'The model asks for `get_weather`. Who runs the function: the model, or your code? Type your answer.',
          accept: ['code', 'your code', 'my code', 'the code', 'program', 'my program', 'your program', 'the program'],
          explain: 'Always your code. That is also what keeps you in control: nothing happens unless your program chooses to do it.',
        },
        {
          kind: 'match',
          prompt: 'Match each need to the kind of tool that meets it.',
          pairs: [
            ['Facts that change, like stock levels', 'Look something up'],
            ['An exact total for 300 prices', 'Calculate'],
            ['Booking a table', 'Take an action'],
            ['Explaining an idea', 'No tool at all'],
          ],
          explain: 'Tools cover what the model lacks: fresh facts, exact maths and hands.',
        },
        {
          kind: 'concept',
          title: 'Looking is not the same as changing',
          body: 'Some tools only read. A tool that fetches a menu can run a hundred times and nothing is different afterwards.\n\nOther tools change things. A tool that places an order spends money, and may be hard to undo. The more a tool can change, the more careful your code should be before running it.',
        },
        {
          kind: 'choice',
          prompt: 'You are choosing tools for a shop assistant bot. Which one deserves the most care before your code runs it?',
          options: [
            'get_opening_hours: reads the shop hours',
            'search_products: looks up products by name',
            'refund_order: sends money back to a customer',
            'add: adds two numbers',
          ],
          answer: 2,
          explain: 'Reading and adding change nothing. A refund moves real money and is hard to undo. You will see how to guard tools like that later.',
        },
      ],
    },
    {
      id: 'u31-define',
      title: 'Describing a tool',
      exercises: [
        {
          kind: 'concept',
          title: 'Three parts',
          body: 'You describe each tool to the model with three things:\n\n- **name**: what the model calls it\n- **description**: what it does and when to use it\n- **input_schema**: the inputs it takes, written as JSON Schema (a standard way to describe the shape of JSON)',
          code: 'weather_tool = {\n    "name": "get_weather",\n    "description": "Get the current weather for a city.",\n    "input_schema": {\n        "type": "object",\n        "properties": {\n            "city": {"type": "string", "description": "City name, e.g. Lima"}\n        },\n        "required": ["city"],\n    },\n}',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Fill in the two missing keys of this tool definition.',
          code: 'tool = {\n    "___": "get_time",\n    "description": "Get the current time in a city.",\n    "___": {\n        "type": "object",\n        "properties": {"city": {"type": "string"}},\n        "required": ["city"],\n    },\n}',
          language: 'python',
          bank: ['name', 'input_schema', 'function', 'parameters', 'title'],
          answers: ['name', 'input_schema'],
          explain: 'In the Claude API the keys are `name`, `description` and `input_schema`. The model reads all three.',
        },
        {
          kind: 'choice',
          prompt: 'In the schema, what does `"required": ["city"]` tell the model?',
          options: [
            'The tool only works in cities',
            'Every request for this tool must include a city',
            'The city must be chosen by the user',
            'The tool must be used in every reply',
          ],
          answer: 1,
          explain: '`required` lists the inputs that must be present. Inputs under `properties` that are not listed there are optional.',
        },
        {
          kind: 'concept',
          title: 'Handing tools to the model',
          body: 'You send your tool definitions with each request, as a list in the **`tools`** parameter. It sits beside `model`, `max_tokens` and `messages`.\n\nThe model does not have to use a tool. It reads the descriptions and decides.\n\n(Read-only: this needs the `anthropic` package and an API key, so it will not run here.)',
          code: 'response = client.messages.create(\n    model="claude-opus-5-5",\n    max_tokens=1024,\n    tools=[weather_tool],\n    messages=[{"role": "user", "content": "Is it raining in Lima?"}],\n)',
          language: 'python',
        },
        {
          kind: 'spot',
          prompt: 'The model keeps ignoring this tool. Tap the line that most needs rewriting.',
          lines: [
            '"name": "get_order",',
            '"description": "Order stuff.",',
            '"input_schema": {',
            '    "type": "object",',
            '    "properties": {"order_id": {"type": "string"}},',
            '    "required": ["order_id"],',
            '},',
          ],
          language: 'python',
          answer: 1,
          explain: 'The description is how the model decides when to use a tool. "Order stuff" could mean looking up, placing or cancelling.',
        },
        {
          kind: 'choice',
          prompt: 'Which description would help a model most?',
          options: [
            'Gets data.',
            'A really useful tool. Use it a lot!',
            'Look up one order by its order ID. Use this when the user asks about the status or contents of an order. Returns the status and the list of items.',
            'get_order',
          ],
          answer: 2,
          explain: 'A good description says what the tool does, when to use it and what comes back. Write it as if briefing a new colleague.',
        },
        {
          kind: 'type',
          prompt: 'A schema can limit an input to fixed choices with `enum`. How many different values may `unit` take here? Type the number.',
          code: '"unit": {\n    "type": "string",\n    "enum": ["celsius", "fahrenheit"]\n}',
          language: 'python',
          accept: ['2', 'two'],
          explain: '`enum` lists every allowed value. It stops the model sending "C", "centigrade" or anything else your function does not expect.',
        },
        {
          kind: 'match',
          prompt: 'Match each part of a tool definition to its job.',
          pairs: [
            ['name', 'What the model writes to ask for the tool'],
            ['description', 'How the model decides when to use it'],
            ['input_schema', 'Which inputs exist, and their types'],
            ['required', 'Which inputs must always be sent'],
          ],
          explain: 'The model never sees your function\'s code. These few fields are all it knows about the tool.',
        },
        {
          kind: 'concept',
          title: 'Inside the schema',
          body: '`properties` is a dict: each input name points to its own small dict holding a `type`.\n\n`required` is a list of the input names that must always be sent. A definition is an ordinary dict, so you can read it back with square brackets.',
          code: `tool = {
    "name": "get_order",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "string"}},
        "required": ["order_id"],
    },
}
schema = tool["input_schema"]
print(schema["properties"]["order_id"]["type"])
print(schema["required"])`,
          language: 'python',
          output: "string\n['order_id']",
        },
        {
          kind: 'write',
          prompt: 'Finish the definition for a tool named `get_time`. It takes one input, `city`, which is a string and is required. The four prints check your work.',
          language: 'python',
          starter: `tool = {
    "name": "",
    "description": "Get the current time in a city. Use when the user asks what time it is somewhere.",
    "input_schema": {
        "type": "object",
        "properties": {},
        "required": [],
    },
}

schema = tool["input_schema"]
print(tool["name"])
print(sorted(schema["properties"]))
print(schema["properties"].get("city", {}).get("type"))
print(schema["required"])
`,
          tests: [{ expected: "get_time\n['city']\nstring\n['city']" }],
          hint: 'properties should be {"city": {"type": "string"}} and required should be ["city"].',
          solution: `tool = {
    "name": "get_time",
    "description": "Get the current time in a city. Use when the user asks what time it is somewhere.",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}

schema = tool["input_schema"]
print(tool["name"])
print(sorted(schema["properties"]))
print(schema["properties"].get("city", {}).get("type"))
print(schema["required"])
`,
          explain: 'A tool definition is just a dict. Nothing in it runs: it is a label on the outside of a function, written for the model to read.',
        },
      ],
    },
    {
      id: 'u31-loop',
      title: 'The tool-use loop',
      exercises: [
        {
          kind: 'concept',
          title: 'Ask, run, return, continue',
          body: 'Using a tool takes two trips to the model.\n\n1. You send the messages and tools.\n2. The model replies with a **tool request** and stops.\n3. **Your code** runs the function.\n4. You send the result back.\n5. The model continues, now knowing the result.\n\nIt may ask again, so this is a loop.',
        },
        {
          kind: 'order',
          prompt: 'Put one round of tool use in order.',
          lines: [
            'Your code sends the user\'s question and the tool definitions',
            'The model replies asking for get_weather with city "Lima"',
            'Your code runs get_weather and gets "18C cloudy"',
            'Your code sends that result back to the model',
            'The model writes the final answer in words',
          ],
          explain: 'The model asks in the middle and answers at the end. Your code does the running in between.',
        },
        {
          kind: 'concept',
          title: 'What a tool request looks like',
          body: 'A reply\'s `content` is a list of **blocks**. A tool request is a block of type **`tool_use`**. It has an `id`, the tool `name`, and the `input` as a dict.\n\nThe reply\'s **stop reason** is `"tool_use"`: the model has paused and is waiting for you. A finished answer has the stop reason `"end_turn"`.',
          code: '# response.stop_reason is "tool_use"\n# response.content, shown as JSON:\n[\n  {\n    "type": "tool_use",\n    "id": "toolu_01",\n    "name": "get_weather",\n    "input": {"city": "Lima"}\n  }\n]',
          language: 'python',
        },
        {
          kind: 'type',
          prompt: 'Which stop reason tells your code that the model is waiting for a tool to be run? Type it.',
          accept: ['tool_use', '"tool_use"'],
          explain: 'Your loop checks for `tool_use`. Any other stop reason means there is nothing for your code to run this round.',
        },
        {
          kind: 'concept',
          title: 'Sending the result back',
          body: 'The result travels back in a message with the role `user`. Its content is a list holding a **`tool_result`** block.\n\n`tool_use_id` repeats the `id` of the request, so the model can pair each answer with the request it belongs to.',
          code: '{\n    "role": "user",\n    "content": [\n        {"type": "tool_result", "tool_use_id": "toolu_07", "content": "3C snow"}\n    ],\n}',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Build the message that carries a tool\'s output back to the model.',
          code: 'reply = {\n    "role": "___",\n    "content": [\n        {\n            "type": "___",\n            "tool_use_id": "toolu_01",\n            "content": "18C cloudy",\n        }\n    ],\n}',
          language: 'python',
          bank: ['user', 'assistant', 'tool_result', 'tool_use', 'tool'],
          answers: ['user', 'tool_result'],
          explain: 'Results go back in a `user` message, inside a `tool_result` block. Its `tool_use_id` repeats the request\'s `id` so the model can pair them.',
        },
        {
          kind: 'steps',
          prompt: 'A user asks "Is it raining in Lima?" Tap who does each job.',
          cells: ['Your code', 'The model', 'The get_weather function'],
          steps: [
            { ask: 'Who decides that a tool is needed?', answer: 1 },
            { ask: 'Who calls the get_weather function?', answer: 0 },
            { ask: 'Where does "18C cloudy" actually come from?', answer: 2 },
            { ask: 'Who turns "18C cloudy" into a sentence for the user?', answer: 1 },
          ],
          explain: 'The model decides and writes. Your code runs things. The function holds the real data.',
        },
        {
          kind: 'spot',
          prompt: 'Here are four content blocks from one conversation, in order. Tap the one with a mistake.',
          lines: [
            'user text: "Is it raining in Lima?"',
            'tool_use: id "toolu_A1", name "get_weather", input {"city": "Lima"}',
            'tool_result: tool_use_id "toolu_B7", content "18C cloudy"',
            'assistant text: "No, it is cloudy and 18 degrees in Lima."',
          ],
          answer: 2,
          explain: 'The result must carry the same id as the request it answers: "toolu_A1". Otherwise the model cannot tell which request it belongs to.',
        },
        {
          kind: 'concept',
          title: 'Looking a function up by name',
          body: 'A dict can hold functions. Look one up with the name in the block, then call it with the block\'s input.\n\nThe model chose the name and the input. Your code did the running.',
          code: `def double(inputs):
    return inputs["number"] * 2

TOOLS = {"double": double}
block = {"type": "tool_use", "id": "toolu_9", "name": "double", "input": {"number": 21}}

function = TOOLS[block["name"]]
print(function(block["input"]))`,
          language: 'python',
          output: '42',
        },
        {
          kind: 'write',
          prompt: 'One round, by hand. `fake_model` stands in for a real model and has asked for a tool. Find the `tool_use` block in `response["content"]`, run the right function from `TOOLS` with the block\'s input, and build the message that returns the result. The print shows it.',
          language: 'python',
          starter:
            LOOP_SETUP +
            `messages = [{"role": "user", "content": input()}]
response = fake_model(messages)
block = response["content"][0]

output = ""  # run the tool the block asks for
result_message = {
    "role": "user",
    "content": [],  # one tool_result block
}
print(json.dumps(result_message, sort_keys=True))
`,
          tests: [
            {
              stdin: ['Lima'],
              expected:
                '{"content": [{"content": "18C cloudy", "tool_use_id": "toolu_1", "type": "tool_result"}], "role": "user"}',
            },
            {
              stdin: ['Paris'],
              expected:
                '{"content": [{"content": "unknown city", "tool_use_id": "toolu_1", "type": "tool_result"}], "role": "user"}',
            },
          ],
          hint: 'output = TOOLS[block["name"]](block["input"]). The block to send back is {"type": "tool_result", "tool_use_id": block["id"], "content": output}.',
          solution:
            LOOP_SETUP +
            `messages = [{"role": "user", "content": input()}]
response = fake_model(messages)
block = response["content"][0]

output = TOOLS[block["name"]](block["input"])
result_message = {
    "role": "user",
    "content": [
        {"type": "tool_result", "tool_use_id": block["id"], "content": output}
    ],
}
print(json.dumps(result_message, sort_keys=True))
`,
          explain: 'You looked the function up by name in a dict and passed it the model\'s inputs. That small step is called a **dispatcher**.',
        },
        {
          kind: 'concept',
          title: 'Keep going while it asks',
          body: 'The loop runs **while** the stop reason is `tool_use`. Each round ends by asking the model again, which gives a new stop reason.\n\nWhen it is anything else, the loop ends. Here a list stands in for three replies from a model.',
          code: `stop_reasons = ["tool_use", "tool_use", "end_turn"]
rounds = 0
stop_reason = stop_reasons[0]
while stop_reason == "tool_use":
    rounds += 1
    print("round", rounds)
    stop_reason = stop_reasons[rounds]
print("finished after", rounds, "rounds")`,
          language: 'python',
          output: 'round 1\nround 2\nfinished after 2 rounds',
        },
        {
          kind: 'write',
          prompt: 'Now the full loop. The input is one or more city names. While the stop reason is `tool_use`: append the model\'s reply as an `assistant` message, run every `tool_use` block, append one `user` message holding the `tool_result` blocks, and call `fake_model` again. Then print the final text, and the number of messages on a second line.',
          language: 'python',
          starter:
            LOOP_SETUP +
            `messages = [{"role": "user", "content": input()}]
response = fake_model(messages)

# loop here while the model keeps asking for tools

print(response["content"][0].get("text", "still waiting for a tool"))
print(len(messages))
`,
          tests: [
            { stdin: ['Lima'], expected: 'Weather: 18C cloudy\n3' },
            { stdin: ['Lima Oslo'], expected: 'Weather: 18C cloudy; 3C snow\n5' },
            { stdin: ['Oslo Rome Lima'], expected: 'Weather: 3C snow; unknown city; 18C cloudy\n7' },
          ],
          hint: 'while response["stop_reason"] == "tool_use": append {"role": "assistant", "content": response["content"]}, build a list of tool_result blocks with a for loop, append {"role": "user", "content": results}, then response = fake_model(messages).',
          solution:
            LOOP_SETUP +
            `messages = [{"role": "user", "content": input()}]
response = fake_model(messages)

while response["stop_reason"] == "tool_use":
    messages.append({"role": "assistant", "content": response["content"]})
    results = []
    for block in response["content"]:
        if block["type"] == "tool_use":
            output = TOOLS[block["name"]](block["input"])
            results.append(
                {"type": "tool_result", "tool_use_id": block["id"], "content": output}
            )
    messages.append({"role": "user", "content": results})
    response = fake_model(messages)

print(response["content"][0].get("text", "still waiting for a tool"))
print(len(messages))
`,
          explain: 'Each round adds two messages: the request and its result. With a real model, only the `fake_model` call changes. The loop stays the same.',
        },
        {
          kind: 'choice',
          prompt: 'Why must you append the model\'s own `tool_use` reply to `messages` before adding the result?',
          options: [
            'To make the list longer',
            'Because the API keeps no memory: the model must see its request next to the result',
            'So the tool runs a second time',
            'Because the model charges less for longer lists',
          ],
          answer: 1,
          explain: 'Each call starts from the messages you send. Without the request in the history, the result would answer a question nobody asked.',
        },
      ],
    },
    {
      id: 'u31-errors',
      title: 'When tools go wrong',
      exercises: [
        {
          kind: 'concept',
          title: 'Report failures to the model',
          body: 'Tools fail. The city is misspelt, the order does not exist, the network is down.\n\nDo not let your program crash, and do not hide the failure. Send it back as a tool result with **`"is_error": True`** and a clear message. The model can then try again or explain the problem to the user.',
          code: '{\n    "type": "tool_result",\n    "tool_use_id": "toolu_01",\n    "content": "Error: city \'Limaa\' not found.",\n    "is_error": True,\n}',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'The model asks for the weather in "Limaa" and your function finds no such city. What should your code send back?',
          options: [
            'Nothing: skip the result and call the model again',
            'A normal result saying "18C cloudy" so the chat keeps moving',
            'A tool result marked as an error that says the city was not found',
            'A brand-new user message that says "you made a mistake"',
          ],
          answer: 2,
          explain: 'Every tool request needs a matching result, even a failed one. An honest error lets the model correct itself.',
        },
        {
          kind: 'blank',
          prompt: 'Complete the result for a failed tool call.',
          code: 'result = {\n    "type": "tool_result",\n    "___": block["id"],\n    "content": "Error: order 999 not found.",\n    "is_error": ___,\n}',
          language: 'python',
          bank: ['tool_use_id', 'id', 'True', 'False', '"error"'],
          answers: ['tool_use_id', 'True'],
          explain: 'Failures still pair with their request through `tool_use_id`. `is_error` is a real boolean, not the word "error".',
        },
        {
          kind: 'choice',
          prompt: 'Which error message gives the model the best chance of fixing its request?',
          options: [
            'Error',
            'Error: date "next Tuesday" is not valid. Use the form YYYY-MM-DD, for example 2026-03-14.',
            'Something went wrong. Please try again later.',
            'Traceback (most recent call last): File "tools.py", line 88 ...',
          ],
          answer: 1,
          explain: 'It names the bad input and shows the right form. The model reads error text just as it reads everything else.',
        },
        {
          kind: 'concept',
          title: 'Two ways a tool call can fail',
          body: 'The **function** can fail: it raises an exception because the booking does not exist.\n\nOr the **request** can be wrong: the model asks for a tool you never defined, perhaps a misspelt name. Looking up a name that is not in a dict raises `KeyError`.\n\nYour dispatcher, the code that runs tools, should catch both.',
        },
        {
          kind: 'steps',
          prompt: 'Your dispatcher handles each situation one way. Tap the right one.',
          cells: ['Send the result back', 'Send back an error result', 'Let the program crash'],
          steps: [
            { ask: 'get_weather returns "3C snow".', answer: 0 },
            { ask: 'get_order raises an exception: no such order.', answer: 1 },
            { ask: 'The model asks for a tool name that is not in your TOOLS dict.', answer: 1 },
            { ask: 'Which box should never be the plan?', answer: 2 },
          ],
          explain: 'Success and failure both go back to the model as results. A crash helps nobody: the user gets nothing and the model learns nothing.',
        },
        {
          kind: 'spot',
          prompt: 'The model asked for a tool called `get_wether`, which does not exist. Tap the line where this dispatcher crashes.',
          lines: [
            'def run_tool(block):',
            '    name = block["name"]',
            '    function = TOOLS[name]',
            '    output = function(block["input"])',
            '    return {"type": "tool_result", "tool_use_id": block["id"], "content": output}',
          ],
          language: 'python',
          answer: 2,
          explain: 'Looking up a missing key raises `KeyError`. Check `if name not in TOOLS` first and return an error result.',
        },
        {
          kind: 'type',
          prompt: 'In a `tool_result` block, which key marks the result as a failure? Type it.',
          accept: ['is_error', '"is_error"'],
          explain: 'Set `is_error` to `True` and put the explanation in `content`.',
        },
        {
          kind: 'concept',
          title: 'Turning a crash into a message',
          body: '`except Exception as e` catches whatever went wrong and names it `e`. `str(e)` is its message as text.\n\nThat text is what you would send back to the model in place of a crash.',
          code: `def half(text):
    return int(text) / 2

for text in ["10", "ten"]:
    try:
        print(half(text))
    except Exception as e:
        print("Error: " + str(e))`,
          language: 'python',
          output: "5.0\nError: invalid literal for int() with base 10: 'ten'",
        },
        {
          kind: 'write',
          prompt: 'Finish `run_tool` so it never crashes. If the name is not in `TOOLS`, the content is `Error: unknown tool` followed by the name. If the function raises an exception, the content is `Error:` followed by the exception\'s message. Both cases set `is_error` to True. The program reads a tool name and its JSON input, then prints the result.',
          language: 'python',
          starter: `import json

ORDERS = {"A1": "shipped", "B2": "packing"}


def get_order(inputs):
    order_id = inputs["order_id"]
    if order_id not in ORDERS:
        raise ValueError("order " + order_id + " not found")
    return ORDERS[order_id]


TOOLS = {"get_order": get_order}


def run_tool(block):
    result = {"type": "tool_result", "tool_use_id": block["id"]}
    result["content"] = TOOLS[block["name"]](block["input"])
    return result


block = {"type": "tool_use", "id": "toolu_1", "name": input(), "input": json.loads(input())}
print(json.dumps(run_tool(block), sort_keys=True))
`,
          tests: [
            {
              stdin: ['get_order', '{"order_id": "A1"}'],
              expected: '{"content": "shipped", "tool_use_id": "toolu_1", "type": "tool_result"}',
            },
            {
              stdin: ['get_order', '{"order_id": "Z9"}'],
              expected:
                '{"content": "Error: order Z9 not found", "is_error": true, "tool_use_id": "toolu_1", "type": "tool_result"}',
            },
            {
              stdin: ['get_ordr', '{"order_id": "A1"}'],
              expected:
                '{"content": "Error: unknown tool get_ordr", "is_error": true, "tool_use_id": "toolu_1", "type": "tool_result"}',
            },
          ],
          hint: 'First: if block["name"] not in TOOLS, set content and is_error and return. Then wrap the function call in try / except Exception as e, and use "Error: " + str(e).',
          solution: `import json

ORDERS = {"A1": "shipped", "B2": "packing"}


def get_order(inputs):
    order_id = inputs["order_id"]
    if order_id not in ORDERS:
        raise ValueError("order " + order_id + " not found")
    return ORDERS[order_id]


TOOLS = {"get_order": get_order}


def run_tool(block):
    result = {"type": "tool_result", "tool_use_id": block["id"]}
    if block["name"] not in TOOLS:
        result["content"] = "Error: unknown tool " + block["name"]
        result["is_error"] = True
        return result
    try:
        result["content"] = TOOLS[block["name"]](block["input"])
    except Exception as e:
        result["content"] = "Error: " + str(e)
        result["is_error"] = True
    return result


block = {"type": "tool_use", "id": "toolu_1", "name": input(), "input": json.loads(input())}
print(json.dumps(run_tool(block), sort_keys=True))
`,
          explain: 'Whatever the model asks for, your loop now gets a well-formed result back. JSON prints Python\'s `True` as `true`.',
        },
        {
          kind: 'choice',
          prompt: 'The model receives the error "order Z9 not found". What is a sensible next move for it?',
          options: [
            'Pretend the order shipped',
            'Send the identical request again and again',
            'Tell the user the order could not be found and ask them to check the ID',
            'Stop replying',
          ],
          answer: 2,
          explain: 'A clear error gives the model something true to pass on. That beats a crash and it beats a made-up answer.',
        },
      ],
    },
    {
      id: 'u31-choose',
      title: 'Many tools, careful tools',
      exercises: [
        {
          kind: 'concept',
          title: 'A toolbox',
          body: 'You can pass many tools at once. For each message, the model reads the descriptions and picks the tool that fits, or none.\n\nIt may also ask for **several tools in one reply**. Run them all, then send every result back together in **one** `user` message.',
        },
        {
          kind: 'steps',
          prompt: 'The model has three tools. Tap what it should choose for each message.',
          cells: ['get_weather', 'search_orders', 'send_email', 'No tool'],
          steps: [
            { ask: '"Has my parcel left the warehouse yet?"', answer: 1 },
            { ask: '"Thanks, that is all I needed!"', answer: 3 },
            { ask: '"Email the receipt to my accountant."', answer: 2 },
            { ask: '"Do I need a coat in Oslo today?"', answer: 0 },
          ],
          explain: 'The model matches the request to a description. A plain thank-you needs no tool, only a reply.',
        },
        {
          kind: 'spot',
          prompt: 'The model keeps choosing the wrong order tool. Tap the description that is causing the confusion.',
          lines: [
            'get_order: Look up one order by its ID. Returns status and items.',
            'find_orders: List a customer\'s orders by their email address.',
            'orders: Does things with orders.',
            'cancel_order: Cancel one order by its ID. This cannot be undone.',
          ],
          answer: 2,
          explain: 'A vague description overlaps with every other tool. Each one should make clear when to use it and not its neighbours.',
        },
        {
          kind: 'type',
          prompt: 'One reply from the model contains 3 `tool_use` blocks. How many `tool_result` blocks must your next message hold? Type the number.',
          accept: ['3', 'three'],
          explain: 'One result per request, each with the matching id, all inside a single user message.',
        },
        {
          kind: 'concept',
          title: 'A request is not a command',
          body: 'The model can be wrong, and it can be tricked by text it reads. So before running anything risky, **your code checks**:\n\n- Are the inputs the right type and in a sensible range?\n- Is this action allowed for this user?\n- Is it hard to undo? Then ask a person to confirm first.',
        },
        {
          kind: 'choice',
          prompt: 'The model asks for `delete_file` with the path `/`, the top of the whole disk. What should your dispatcher do?',
          options: [
            'Run it: the model asked',
            'Run it, then warn the user afterwards',
            'Refuse, and send back an error result saying that path is not allowed',
            'Crash, so nothing else can happen',
          ],
          answer: 2,
          explain: 'Your code is the last gate before the real world. An error result stops the damage and tells the model why.',
        },
        {
          kind: 'match',
          prompt: 'Match each tool to how careful your code should be with it.',
          pairs: [
            ['get_weather', 'Only reads: run it freely'],
            ['add(a, b)', 'Pure maths: just check the inputs are numbers'],
            ['send_email', 'Hard to take back: confirm with a person'],
            ['delete_account', 'Cannot be undone: confirm, and limit who may ask'],
          ],
          explain: 'Care grows with the damage a mistake could do. Reading is cheap to get wrong. Deleting is not.',
        },
        {
          kind: 'concept',
          title: 'A check that returns early',
          body: 'A check function returns at the first problem it finds. Test the **type** before the size: comparing text with a number would crash.\n\nOnly a value that passes every test reaches `ok`.',
          code: `def check(age):
    if not isinstance(age, int) or age < 0:
        return "blocked: bad age"
    if age > 120:
        return "blocked: too high"
    return "ok"

for age in [30, "old", 400]:
    print(check(age))`,
          language: 'python',
          output: 'ok\nblocked: bad age\nblocked: too high',
        },
        {
          kind: 'write',
          prompt: 'A bank bot has two tools. Read one `tool_use` block as JSON and finish `check`. It returns `unknown tool` if the name is not in `TOOLS`. For `transfer`, it returns `blocked: bad amount` unless the amount is an int greater than 0, and `blocked: over limit` if it is more than 100. Otherwise it returns `ok`. If the check passes, the tool runs.',
          language: 'python',
          starter: `import json


def get_balance(inputs):
    return "balance is 250"


def transfer(inputs):
    return "sent " + str(inputs["amount"]) + " to " + inputs["to"]


TOOLS = {"get_balance": get_balance, "transfer": transfer}


def check(block):
    # return "unknown tool", "blocked: bad amount", "blocked: over limit" or "ok"
    return "ok"


block = json.loads(input())
verdict = check(block)
if verdict == "ok":
    print(TOOLS[block["name"]](block["input"]))
else:
    print(verdict)
`,
          tests: [
            { stdin: ['{"name": "transfer", "input": {"amount": 40, "to": "Ana"}}'], expected: 'sent 40 to Ana' },
            { stdin: ['{"name": "transfer", "input": {"amount": 5000, "to": "Bo"}}'], expected: 'blocked: over limit' },
            { stdin: ['{"name": "transfer", "input": {"amount": "lots", "to": "Bo"}}'], expected: 'blocked: bad amount' },
          ],
          hint: 'Check the name first. Then, only if the name is "transfer": amount = block["input"]["amount"], test isinstance(amount, int) and amount > 0, then amount > 100.',
          solution: `import json


def get_balance(inputs):
    return "balance is 250"


def transfer(inputs):
    return "sent " + str(inputs["amount"]) + " to " + inputs["to"]


TOOLS = {"get_balance": get_balance, "transfer": transfer}


def check(block):
    if block["name"] not in TOOLS:
        return "unknown tool"
    if block["name"] == "transfer":
        amount = block["input"]["amount"]
        if not isinstance(amount, int) or amount <= 0:
            return "blocked: bad amount"
        if amount > 100:
            return "blocked: over limit"
    return "ok"


block = json.loads(input())
verdict = check(block)
if verdict == "ok":
    print(TOOLS[block["name"]](block["input"]))
else:
    print(verdict)
`,
          explain: 'The limit lives in code, so no wording in any message can talk its way past it. In a real loop the blocked verdict would go back as an error result.',
        },
        {
          kind: 'choice',
          prompt: 'You never want transfers over 100. Where should that rule live?',
          options: [
            'Only in the system prompt: "never transfer more than 100"',
            'Only in the tool description',
            'In your code, checked before the tool runs',
            'Nowhere: a good model will know',
          ],
          answer: 2,
          explain: 'Prompts and descriptions guide the model, but only code enforces. Put the hard limits where they cannot be argued with.',
        },
      ],
    },
  ],
}
