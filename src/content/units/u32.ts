import type { Unit } from '../types'

// A scripted stand-in for a coding agent's model: it picks its next tool
// from the last tool result, like a real agent would.
const FIX_SETUP = `target = input()
state = {"fixed": target == "none"}


def run_tests(inputs):
    return "PASS" if state["fixed"] else "FAIL in " + target


def read_file(inputs):
    return "contents of " + inputs["path"]


def edit_file(inputs):
    state["fixed"] = True
    return "edited " + inputs["path"]


TOOLS = {"run_tests": run_tests, "read_file": read_file, "edit_file": edit_file}


def ask(name, inputs):
    return {"stop_reason": "tool_use", "content": [
        {"type": "tool_use", "id": "toolu_1", "name": name, "input": inputs}]}


def fake_model(messages):
    # A scripted stand-in for a real model. It chooses the next step
    # by looking at the most recent tool result.
    last = messages[-1]["content"]
    if isinstance(last, str):
        return ask("run_tests", {})
    result = last[0]["content"]
    if result.startswith("FAIL in "):
        return ask("read_file", {"path": result[8:]})
    if result.startswith("contents of "):
        return ask("edit_file", {"path": result[12:]})
    if result.startswith("edited "):
        return ask("run_tests", {})
    return {"stop_reason": "end_turn", "content": [
        {"type": "text", "text": "Done: tests pass"}]}


def run_tool(block):
    output = TOOLS[block["name"]](block["input"])
    return {"type": "tool_result", "tool_use_id": block["id"], "content": output}

`

const LIMIT_SETUP = `goal = input()
max_steps = int(input())


def lookup(inputs):
    return "Lima is the capital of Peru"


def search(inputs):
    return "nothing found for " + inputs["query"]


TOOLS = {"lookup": lookup, "search": search}


def ask(name, inputs):
    return {"stop_reason": "tool_use", "content": [
        {"type": "tool_use", "id": "toolu_1", "name": name, "input": inputs}]}


def fake_model(messages):
    # A scripted stand-in for a real model. For the goal "capital" it
    # needs one tool call. For anything else it searches forever.
    tool_turns = sum(1 for m in messages if isinstance(m["content"], list) and m["role"] == "user")
    if goal == "capital":
        if tool_turns == 0:
            return ask("lookup", {"country": "Peru"})
        return {"stop_reason": "end_turn", "content": [
            {"type": "text", "text": "The capital is Lima"}]}
    return ask("search", {"query": goal})


def run_tool(block):
    output = TOOLS[block["name"]](block["input"])
    return {"type": "tool_result", "tool_use_id": block["id"], "content": output}

`

const CHAIN_SETUP = `def extract_name(message):
    # Stand-in for model call 1: find the sender's name.
    words = message.replace(",", " ").replace(".", " ").split()
    for i in range(len(words) - 1):
        if words[i].lower() in ("am", "is") and words[i + 1][0].isupper():
            return words[i + 1]
    return ""


def write_reply(name):
    # Stand-in for model call 2: draft a reply.
    return "Hi " + name + ", thanks for your message!"


message = input()
`

const ROUTE_SETUP = `def classify(message):
    # Stand-in for a model call that labels the message.
    text = message.lower()
    if "refund" in text or "charge" in text:
        return "billing"
    if "error" in text or "crash" in text:
        return "technical"
    if "hello" in text:
        return "chitchat"
    return "other"


def billing(message):
    return "Billing: we will check your payment."


def technical(message):
    return "Tech: please send a screenshot."


def general(message):
    return "General: how can we help?"


HANDLERS = {"billing": billing, "technical": technical}

message = input()
`

const EVAL_SETUP = `drafts = input().split("|")


def generate(attempt, feedback):
    # Stand-in for the writer model: returns its next draft.
    return drafts[min(attempt, len(drafts)) - 1]


def evaluate(draft):
    # Stand-in for the checker. Returns "" if the draft passes,
    # or a short piece of feedback if it does not.
    if len(draft.split()) > 6:
        return "too long"
    if "sale" not in draft.lower():
        return "must mention the sale"
    return ""


`

export const u32: Unit = {
  id: 'u32',
  week: 7,
  course: 'ai',
  title: 'Agents from the ground up',
  summary: 'The loop, workflows and when not to use one',
  lessons: [
    {
      id: 'u32-loop',
      title: 'What an agent is',
      exercises: [
        {
          kind: 'concept',
          title: 'A model, tools and a loop',
          body: 'An **agent** is a model using tools in a loop, **choosing its own next step**, until the job is done.\n\nIt is the tool loop you just built. The new part is who is in charge: you give a goal, not a list of steps. How many tool calls it takes, and which ones, is up to the model.',
        },
        {
          kind: 'order',
          prompt: 'Put one turn of an agent\'s loop in order.',
          lines: [
            'The model reads the goal and everything that has happened so far',
            'It decides on the next action and asks for a tool',
            'Your code runs the tool',
            'The result is added to the messages',
            'The loop goes round again, until the model answers with no tool request',
          ],
          explain: 'Every turn is the same: look, decide, act, record. The agent finishes when the model stops asking for tools.',
        },
        {
          kind: 'steps',
          prompt: 'An agent is told: "Make the failing test pass." Tap the tool it should choose at each point.',
          cells: ['run_tests', 'read_file', 'edit_file', 'Finish and report'],
          steps: [
            { ask: 'It does not yet know which test is failing.', answer: 0 },
            { ask: 'The test output says the error is in calc.py, line 12.', answer: 1 },
            { ask: 'It has read calc.py and can see the bug.', answer: 2 },
            { ask: 'It has made the edit. Did the fix work?', answer: 0 },
            { ask: 'All tests pass.', answer: 3 },
          ],
          explain: 'Nobody scripted those five steps. Each choice came from the result before it. That is what makes it an agent.',
        },
        {
          kind: 'concept',
          title: 'Feedback from the real world',
          body: 'On every turn the model sees the whole history: the goal, each tool request and each result.\n\nThose results are its **ground truth**: real feedback from the world, like test output or a file\'s contents. An agent that reads results can notice a mistake and correct course. One that does not is only guessing.',
        },
        {
          kind: 'choice',
          prompt: 'What separates an agent from a single tool call?',
          options: [
            'An agent uses a bigger model',
            'An agent never needs tools',
            'The model keeps choosing the next step itself, turn after turn',
            'An agent always takes exactly five steps',
          ],
          answer: 2,
          explain: 'It is the loop plus the model\'s own decisions. The number of steps is not known before it starts.',
        },
        {
          kind: 'type',
          prompt: 'An agent makes 4 tool calls, one per turn, then gives its final answer. How many times was the model called? Type the number.',
          accept: ['5', 'five'],
          explain: 'One call for each tool request, plus the last call that produced the answer. More steps means more calls.',
        },
        {
          kind: 'spot',
          prompt: 'Here is an agent\'s whole run. Tap the line you should not trust.',
          lines: [
            'Step 1: read_file("calc.py")',
            'Step 2: edit_file("calc.py")',
            'Final answer: "Fixed! All the tests pass now."',
          ],
          answer: 2,
          explain: 'It never ran the tests, so "all the tests pass" is a guess. A claim with no tool result behind it has no ground truth.',
        },
        {
          kind: 'write',
          prompt: 'Run the agent. While the model\'s stop reason is `tool_use`: print `step`, the step number and the tool name (like `step 1: run_tests`), append the model\'s reply as an `assistant` message, run the tool with `run_tool`, append the result in a `user` message, and call `fake_model` again. Finally print the model\'s text.',
          language: 'python',
          starter:
            FIX_SETUP +
            `messages = [{"role": "user", "content": "Make the tests pass."}]
response = fake_model(messages)
step = 0

# your loop goes here

print(response["content"][0].get("text", "not finished"))
`,
          tests: [
            {
              stdin: ['calc.py'],
              expected: 'step 1: run_tests\nstep 2: read_file\nstep 3: edit_file\nstep 4: run_tests\nDone: tests pass',
            },
            { stdin: ['none'], expected: 'step 1: run_tests\nDone: tests pass' },
          ],
          hint: 'Inside while response["stop_reason"] == "tool_use": take block = response["content"][0], add 1 to step, print("step " + str(step) + ": " + block["name"]), append both messages, then response = fake_model(messages).',
          solution:
            FIX_SETUP +
            `messages = [{"role": "user", "content": "Make the tests pass."}]
response = fake_model(messages)
step = 0

while response["stop_reason"] == "tool_use":
    block = response["content"][0]
    step += 1
    print("step " + str(step) + ": " + block["name"])
    messages.append({"role": "assistant", "content": response["content"]})
    messages.append({"role": "user", "content": [run_tool(block)]})
    response = fake_model(messages)

print(response["content"][0].get("text", "not finished"))
`,
          explain: 'The same loop took four steps for one input and one step for the other. Your code never decided that: the model did, from the tool results.',
        },
        {
          kind: 'choice',
          prompt: 'In the exercise you just ran, why did the agent run the tests a second time after editing?',
          options: [
            'Because your loop told it to run every tool twice',
            'To check its own work against a real result before saying "done"',
            'Because the first result was lost',
            'To use up its steps',
          ],
          answer: 1,
          explain: 'Verifying is part of the job. The second test run is what turns "I think I fixed it" into "it is fixed".',
        },
      ],
    },
    {
      id: 'u32-workflows',
      title: 'Workflows and agents',
      exercises: [
        {
          kind: 'concept',
          title: 'Who picks the steps?',
          body: 'There are two ways to build with several model calls.\n\n**Workflow**: *you* fix the steps in code. The model fills in each one.\n\n**Agent**: the *model* picks the steps as it goes.\n\nA workflow is like a recipe. An agent is like a cook told only "make dinner". Recipes are more predictable.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the simplest design that fits each job.',
          cells: ['One prompt', 'A workflow', 'An agent'],
          steps: [
            { ask: 'Translate one sentence into Spanish.', answer: 0 },
            { ask: 'For every article: summarise it, then write a headline from the summary.', answer: 1 },
            { ask: 'Find out why the website is slow and fix it. Nobody knows the cause yet.', answer: 2 },
            { ask: 'Label one review as positive or negative.', answer: 0 },
          ],
          explain: 'Known steps suit a workflow. Only the open-ended hunt, where each step depends on what turns up, needs an agent.',
        },
        {
          kind: 'concept',
          title: 'Prompt chaining',
          body: 'The simplest workflow is a **chain**: the output of one model call becomes the input of the next. Each call has one small, easy job.\n\nBetween steps you can add a **gate**: a check in ordinary code. If step 1 produced nothing useful, stop there. Do not feed rubbish into step 2.',
        },
        {
          kind: 'write',
          prompt: 'Chain two steps. `extract_name` and `write_reply` stand in for two model calls. Pass the message to step 1. Gate: if the name is an empty string, print `stopped: no name found`. Otherwise pass the name to step 2 and print the reply.',
          language: 'python',
          starter: CHAIN_SETUP + `print(write_reply(message))\n`,
          tests: [
            { stdin: ['Hello, I am Priya and my order is late.'], expected: 'Hi Priya, thanks for your message!' },
            { stdin: ['My name is Tom.'], expected: 'Hi Tom, thanks for your message!' },
            { stdin: ['where is my refund'], expected: 'stopped: no name found' },
          ],
          hint: 'name = extract_name(message). Then if name == "": print the stopped line, else: print(write_reply(name)).',
          solution:
            CHAIN_SETUP +
            `name = extract_name(message)
if name == "":
    print("stopped: no name found")
else:
    print(write_reply(name))
`,
          explain: 'Step 2 only ever sees a clean name, never the whole messy message. The gate stopped the third input before it could produce "Hi , thanks".',
        },
        {
          kind: 'concept',
          title: 'Routing',
          body: '**Routing** sorts each input first, then sends it to a specialist.\n\nOne model call **classifies** the input: is this about billing, or a technical fault? Your code then picks the matching handler, each with its own focused prompt. One prompt no longer has to be good at everything.',
        },
        {
          kind: 'write',
          prompt: 'Build a router. `classify` stands in for a model call that labels a message. Print the label. Then look the label up in `HANDLERS`, falling back to `general` when there is no handler for it, and print what the handler returns.',
          language: 'python',
          starter: ROUTE_SETUP + `label = classify(message)\nprint(label)\nprint(general(message))\n`,
          tests: [
            { stdin: ['I want a refund'], expected: 'billing\nBilling: we will check your payment.' },
            { stdin: ['The app shows an error'], expected: 'technical\nTech: please send a screenshot.' },
            { stdin: ['hello there'], expected: 'chitchat\nGeneral: how can we help?' },
          ],
          hint: 'handler = HANDLERS.get(label, general) gives the right function, or general if the label is missing. Then print(handler(message)).',
          solution:
            ROUTE_SETUP +
            `label = classify(message)
print(label)
handler = HANDLERS.get(label, general)
print(handler(message))
`,
          explain: 'The model chose a label, but your code chose what runs. A label you did not plan for falls through to a safe default.',
        },
        {
          kind: 'spot',
          prompt: 'Three of these jobs have steps you could write down today. Tap the one that really needs an agent.',
          lines: [
            'Turn each support email into a category, then a draft reply',
            'Check every product description for spelling, then for tone',
            'Work out why the nightly build fails and fix whatever is wrong',
            'Translate the help pages into French, then check the links still work',
          ],
          answer: 2,
          explain: 'The cause is unknown, so the steps cannot be written in advance. Each thing found decides what to look at next.',
        },
        {
          kind: 'type',
          prompt: 'A chain has 3 steps, each one model call. You run it on 10 documents. How many model calls is that? Type the number.',
          accept: ['30', 'thirty'],
          explain: 'A workflow\'s cost is easy to predict: steps times inputs. With an agent, you cannot know the count before it runs.',
        },
        {
          kind: 'choice',
          prompt: 'You know the exact steps a task needs. Why build a workflow instead of handing it to an agent?',
          options: [
            'Agents cannot use tools',
            'A workflow is cheaper, faster and does the same thing every time',
            'Workflows do not need a model',
            'Agents only work on code',
          ],
          answer: 1,
          explain: 'If you already know the steps, letting a model rediscover them each time adds cost and surprises for nothing.',
        },
      ],
    },
    {
      id: 'u32-patterns',
      title: 'More workflow patterns',
      exercises: [
        {
          kind: 'concept',
          title: 'Side by side, and in charge',
          body: '**Parallel calls**: make several model calls at once. Split a job into independent pieces, or run the same task a few times and take a **vote**.\n\n**Orchestrator and workers**: one model reads the task, breaks it into subtasks *it* chooses, hands each to a worker call, then combines the results.',
        },
        {
          kind: 'type',
          prompt: 'You run the same "is this spam?" prompt 5 times on one email. Three runs say `spam` and two say `ok`. By majority vote, what is the label? Type it.',
          accept: ['spam'],
          explain: 'Voting smooths out the odd wrong reply. It costs five calls for one answer, so save it for decisions that matter.',
        },
        {
          kind: 'spot',
          prompt: 'An orchestrator plans to run all four workers at the same time. Tap the one that cannot start yet.',
          lines: [
            'Worker A: summarise chapter 1',
            'Worker B: summarise chapter 2',
            'Worker C: summarise chapter 3',
            'Worker D: merge the three summaries into one page',
          ],
          answer: 3,
          explain: 'D needs the output of A, B and C. Only independent pieces can run side by side.',
        },
        {
          kind: 'choice',
          prompt: 'Parallel calls and orchestrator-workers both split work up. What is the difference?',
          options: [
            'Parallel calls use tools and orchestrators do not',
            'With parallel calls your code fixes the pieces. An orchestrator model decides the pieces for each task',
            'Orchestrators can only have two workers',
            'There is no difference',
          ],
          answer: 1,
          explain: 'If you can list the subtasks in advance, code them. If they depend on the task, such as which files need changing, let a model plan them.',
        },
        {
          kind: 'concept',
          title: 'Write, check, improve',
          body: 'In an **evaluator loop**, one model call writes a draft. A second call (or a rule in code) **evaluates** it against clear criteria. If it fails, the feedback goes back to the writer for another pass.\n\nIt works when you can say plainly what "good" means. Always cap the number of rounds.',
        },
        {
          kind: 'steps',
          prompt: 'An evaluator loop writes a product description. Tap who acts next.',
          cells: ['Generator', 'Evaluator', 'Stop and return the draft'],
          steps: [
            { ask: 'The loop starts. Who writes the first draft?', answer: 0 },
            { ask: 'A draft exists. Who decides if it is good enough?', answer: 1 },
            { ask: 'The verdict is "too long". Who acts next?', answer: 0 },
            { ask: 'The new draft gets the verdict "pass".', answer: 2 },
          ],
          explain: 'The two roles take turns until the evaluator is satisfied. Splitting writing from judging gives each call one clear job.',
        },
        {
          kind: 'write',
          prompt: 'Write the evaluator loop, with at most 3 attempts. Each attempt: get a draft from `generate(attempt, feedback)`, then get feedback from `evaluate(draft)`. If the feedback is an empty string, print `attempt`, the number and `ok`, then the draft, and stop. Otherwise print `attempt`, the number and the feedback. If no draft passes, print `no draft passed`.',
          language: 'python',
          starter:
            EVAL_SETUP +
            `feedback = ""
draft = generate(1, feedback)
print("attempt", 1, "ok")
print(draft)
`,
          tests: [
            {
              stdin: ['Come to our really big summer sale this weekend|Summer sale now on'],
              expected: 'attempt 1 too long\nattempt 2 ok\nSummer sale now on',
            },
            { stdin: ['Sale today'], expected: 'attempt 1 ok\nSale today' },
            {
              stdin: ['Shop with us|Great prices here|We have many things in the shop today|Sale on'],
              expected: 'attempt 1 must mention the sale\nattempt 2 must mention the sale\nattempt 3 too long\nno draft passed',
            },
          ],
          hint: 'Use for attempt in range(1, 4) and a variable passed = False. Inside: draft = generate(attempt, feedback), then feedback = evaluate(draft). On an empty feedback print, set passed = True and break.',
          solution:
            EVAL_SETUP +
            `feedback = ""
passed = False
for attempt in range(1, 4):
    draft = generate(attempt, feedback)
    feedback = evaluate(draft)
    if feedback == "":
        print("attempt", attempt, "ok")
        print(draft)
        passed = True
        break
    print("attempt", attempt, feedback)
if not passed:
    print("no draft passed")
`,
          explain: 'In the last test a passing draft was fourth in line, but the cap is 3. The loop reports failure honestly instead of running on.',
        },
        {
          kind: 'match',
          prompt: 'Match each pattern to a job that suits it.',
          pairs: [
            ['Prompt chaining', 'Write an outline, check it, then write the article from it'],
            ['Routing', 'Send refund questions and login questions to different prompts'],
            ['Parallel calls', 'Check one essay for facts, tone and spelling at the same time'],
            ['Orchestrator and workers', 'Change code across files that are only known once the task is read'],
            ['Evaluator loop', 'Draft a translation, critique it, improve it, repeat'],
          ],
          explain: 'Five patterns, and all of them are workflows: your code holds the overall shape, even where a model makes choices inside it.',
        },
        {
          kind: 'choice',
          prompt: 'When is an evaluator loop a poor fit?',
          options: [
            'When you can state clear pass and fail criteria',
            'When feedback usually improves the next draft',
            'When nobody can say what a good result looks like',
            'When the first draft is often close but not right',
          ],
          answer: 2,
          explain: 'An evaluator needs something to measure against. With no criteria, it just adds calls and opinions.',
        },
      ],
    },
    {
      id: 'u32-limits',
      title: 'When not to, and when to stop',
      exercises: [
        {
          kind: 'concept',
          title: 'Start with the simplest thing',
          body: 'Agents are slower and cost more: every step is another model call. Mistakes also pile up, because step 6 builds on step 5.\n\nSo climb only as far as you need:\n\n1. **One good prompt**\n2. **A fixed workflow**\n3. **An agent**, when the steps truly cannot be known in advance',
        },
        {
          kind: 'choice',
          prompt: 'You need to label 500 emails as spam or not spam. What should you build?',
          options: [
            'An agent with a search tool and a step limit of 50',
            'An orchestrator with ten workers',
            'One clear prompt, run once per email',
            'An evaluator loop with five rounds per email',
          ],
          answer: 2,
          explain: 'Each email is one small, well-defined decision. A single prompt is cheaper, faster and easier to test with an eval set.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the simplest design that does the job.',
          cells: ['One prompt', 'A fixed workflow', 'An agent'],
          steps: [
            { ask: 'Pull the date and total out of a receipt as JSON.', answer: 0 },
            { ask: 'Classify each ticket, then answer it with the prompt for that category.', answer: 1 },
            { ask: 'A bug report says "checkout sometimes fails". Find the cause in a large codebase and fix it.', answer: 2 },
            { ask: 'Summarise a meeting transcript, then turn the summary into action items.', answer: 1 },
          ],
          explain: 'Three of the four have steps you can write down. Reach for an agent only when you cannot.',
        },
        {
          kind: 'concept',
          title: 'Knowing when to stop',
          body: 'An agent normally stops when the model answers without asking for a tool. But a confused agent can go round forever.\n\nSo add your own **stopping conditions**:\n\n- a **step limit**: at most N tool calls\n- a **checkpoint**: pause and ask a person before something risky, or when it is stuck',
        },
        {
          kind: 'spot',
          prompt: 'This agent loop can run forever if the model keeps asking for tools. Tap the line that needs a limit added.',
          lines: [
            'steps = 0',
            'response = model(messages)',
            'while response["stop_reason"] == "tool_use":',
            '    steps += 1',
            '    messages += run_tools(response)',
            '    response = model(messages)',
          ],
          language: 'python',
          answer: 2,
          explain: 'The condition only checks what the model wants. Add `and steps < max_steps` so your code has the final say.',
        },
        {
          kind: 'type',
          prompt: 'An agent has a step limit of 5. The model is stuck and asks for a tool on every single turn. How many tools get run before the loop stops? Type the number.',
          accept: ['5', 'five'],
          explain: 'The limit caps the damage. Five wasted steps is annoying. Five thousand is a bill and a mess.',
        },
        {
          kind: 'write',
          prompt: 'Add a step limit. Loop while the stop reason is `tool_use` **and** `steps` is below `max_steps`. Each time round: add 1 to `steps`, append the `assistant` message, run the tool with `run_tool`, append the result in a `user` message and call `fake_model` again. After the loop, print the final text if the stop reason is `end_turn`, or `stopped: step limit` if not. Then print `steps` and the count.',
          language: 'python',
          starter:
            LIMIT_SETUP +
            `messages = [{"role": "user", "content": goal}]
response = fake_model(messages)
steps = 0

# your loop goes here

print("stopped: step limit")
print("steps", steps)
`,
          tests: [
            { stdin: ['capital', '5'], expected: 'The capital is Lima\nsteps 1' },
            { stdin: ['unicorn farms', '3'], expected: 'stopped: step limit\nsteps 3' },
            { stdin: ['capital', '0'], expected: 'stopped: step limit\nsteps 0' },
          ],
          hint: 'while response["stop_reason"] == "tool_use" and steps < max_steps: ... After it, use if response["stop_reason"] == "end_turn": print(response["content"][0]["text"]) else: print("stopped: step limit").',
          solution:
            LIMIT_SETUP +
            `messages = [{"role": "user", "content": goal}]
response = fake_model(messages)
steps = 0

while response["stop_reason"] == "tool_use" and steps < max_steps:
    steps += 1
    block = response["content"][0]
    messages.append({"role": "assistant", "content": response["content"]})
    messages.append({"role": "user", "content": [run_tool(block)]})
    response = fake_model(messages)

if response["stop_reason"] == "end_turn":
    print(response["content"][0]["text"])
else:
    print("stopped: step limit")
print("steps", steps)
`,
          explain: 'The second goal would have searched forever. Two words in the loop condition turned an endless run into three steps and a clear message.',
        },
        {
          kind: 'choice',
          prompt: 'An agent hits its step limit halfway through a task. What should your program do?',
          options: [
            'Return the last tool result as if it were the final answer',
            'Quietly raise the limit and carry on',
            'Say clearly that it stopped early, and show what was done so far',
            'Delete everything the agent changed',
          ],
          answer: 2,
          explain: 'Hitting the limit is a result too, and people need to know about it. Never present a half-finished job as a finished one.',
        },
        {
          kind: 'match',
          prompt: 'Match each stopping condition to an example.',
          pairs: [
            ['Task complete', 'The model answers with no tool request'],
            ['Step limit', 'At most 20 tool calls, then stop'],
            ['Human checkpoint', 'Ask a person before deleting anything'],
            ['Stuck', 'The same failing command three times in a row'],
          ],
          explain: 'The first is the model\'s decision. The other three are yours, written in code, so the agent can never outrun you.',
        },
      ],
    },
    {
      id: 'u32-memory',
      title: 'Memory, subagents and failure',
      exercises: [
        {
          kind: 'concept',
          title: 'Notes outlast the context',
          body: 'An agent\'s only memory is its messages, and the context window is limited. On a long job, early details get crowded out. A new session starts with nothing.\n\nThe fix is **notes**: give the agent tools to save key facts somewhere outside the conversation, like a file, and to read them back. A lab notebook for the agent.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these is the most useful thing for an agent to save in its notes?',
          options: [
            'The full text of every file it has opened',
            '"Tests are run with pytest. Bug is in cart.py. Still to do: update the docs."',
            'A copy of the whole conversation so far',
            '"I am working hard on this task."',
          ],
          answer: 1,
          explain: 'Good notes are short: what was learned, what was decided and what is left. Copying everything just moves the clutter.',
        },
        {
          kind: 'write',
          prompt: 'Give an agent a notebook. Finish the two tools. `save_note` adds `inputs["text"]` to `notes` and returns `saved note` plus how many notes there are now. `read_notes` returns all notes joined with `; `, or `no notes yet` if there are none. The input is a JSON list of tool calls from a scripted model.',
          language: 'python',
          starter: `import json

notes = []


def save_note(inputs):
    return ""


def read_notes(inputs):
    return ""


TOOLS = {"save_note": save_note, "read_notes": read_notes}

calls = json.loads(input())
for call in calls:
    print(TOOLS[call["name"]](call["input"]))
`,
          tests: [
            { stdin: ['[{"name": "read_notes", "input": {}}]'], expected: 'no notes yet' },
            {
              stdin: [
                '[{"name": "save_note", "input": {"text": "tests live in tests/"}}, {"name": "save_note", "input": {"text": "bug is in cart.py"}}, {"name": "read_notes", "input": {}}]',
              ],
              expected: 'saved note 1\nsaved note 2\ntests live in tests/; bug is in cart.py',
            },
          ],
          hint: 'In save_note: notes.append(inputs["text"]) then return "saved note " + str(len(notes)). In read_notes: if not notes, return "no notes yet"; otherwise return "; ".join(notes).',
          solution: `import json

notes = []


def save_note(inputs):
    notes.append(inputs["text"])
    return "saved note " + str(len(notes))


def read_notes(inputs):
    if not notes:
        return "no notes yet"
    return "; ".join(notes)


TOOLS = {"save_note": save_note, "read_notes": read_notes}

calls = json.loads(input())
for call in calls:
    print(TOOLS[call["name"]](call["input"]))
`,
          explain: 'Memory for an agent is just two more tools. Swap the list for a file and the notes would survive into the next session.',
        },
        {
          kind: 'concept',
          title: 'Subagents',
          body: 'A **subagent** is a second agent that the main one starts for a side job, such as "find where logins are handled".\n\nIt has **its own context**. It may read forty files, but it hands back only a short summary. The main agent\'s context stays clean. The catch: a subagent knows only what its instructions tell it.',
        },
        {
          kind: 'steps',
          prompt: 'A main agent hands a research job to a subagent. Tap where each thing lives.',
          cells: ['Main agent\'s context', 'Subagent\'s context', 'The notes file'],
          steps: [
            { ask: 'The subagent opens 40 files. Where do their contents pile up?', answer: 1 },
            { ask: 'The subagent finishes and returns a five-line summary. Where does it land?', answer: 0 },
            { ask: 'Earlier, the user told the main agent which coding style they like. Where is that, unless it was passed on?', answer: 0 },
            { ask: 'Where should progress go so that a brand-new session tomorrow can find it?', answer: 2 },
          ],
          explain: 'Each context is its own island. Only what is deliberately handed across, or written down, makes the crossing.',
        },
        {
          kind: 'type',
          prompt: 'A subagent reads 40 files and returns a five-line summary. How many of those 40 files\' contents enter the main agent\'s context? Type the number.',
          accept: ['0', 'zero', 'none'],
          explain: 'Only the summary comes back. That is the whole point: the reading happens somewhere else.',
        },
        {
          kind: 'concept',
          title: 'Why agents fail',
          body: 'When an agent goes wrong, look at its surroundings before blaming the model:\n\n- **Bad tools**: vague descriptions, confusing inputs\n- **Missing context**: it cannot see what you never gave it\n- **No way to check its work**: no tests to run, nothing to compare against\n\nFix those and most agents improve.',
        },
        {
          kind: 'spot',
          prompt: 'This agent keeps saying "fixed!" when the bug is still there. Tap the line of its setup that explains why.',
          lines: [
            'Goal: "Fix the checkout bug so the tests pass."',
            'Tools: read_file, edit_file',
            'Step limit: 30',
            'Notes: saved to progress.md',
          ],
          answer: 1,
          explain: 'It can read and edit, but it has no tool that runs the tests. With no way to check, "fixed" can only ever be a hope.',
        },
        {
          kind: 'match',
          prompt: 'Match each symptom to its most likely cause.',
          pairs: [
            ['Keeps picking the wrong tool', 'Tool descriptions are vague or overlap'],
            ['Builds something you did not want', 'The task left out context it could not see'],
            ['Says "done" when it is broken', 'It has no way to check its own work'],
            ['Goes in circles for an hour', 'No step limit or stopping rule'],
          ],
          explain: 'Each failure points at something you control: the tools, the brief, the checks or the limits.',
        },
      ],
    },
  ],
}
