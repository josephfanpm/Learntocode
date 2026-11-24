import type { Unit } from '../types'

// Facts about the API in this chapter were checked against Anthropic's
// developer docs (platform.claude.com/docs) in November 2026. All prices in
// this chapter are invented for practice and are labelled as examples.

export const u29: Unit = {
  id: 'u29',
  week: 4,
  lecture: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api',
  lectureFrom: 'Anthropic course: Building with the Claude API',
  course: 'ai',
  title: 'Context',
  summary: 'The window, tokens, cost and what to put in',
  lessons: [
    {
      id: 'u29-window',
      title: 'The window has a limit',
      exercises: [
        {
          kind: 'concept',
          title: 'A desk of fixed size',
          body: 'The context window is the desk the model works at, and the desk has a **fixed size, measured in tokens**. The size depends on the model, so look it up in the docs.\n\nIf what you send is bigger than the window, the API does not quietly drop the extra. It rejects the request with an error.',
        },
        {
          kind: 'choice',
          prompt: 'Your request is larger than the context window of the model. What happens?',
          options: [
            'The model reads the first half and guesses the rest',
            'The API returns an error saying the prompt is too long',
            'The model reads it all, just more slowly',
            'The extra text is saved for the next call',
          ],
          answer: 1,
          explain: 'Nothing is trimmed for you. Fitting inside the window is the job of your code.',
        },
        {
          kind: 'concept',
          title: 'Everything costs tokens',
          body: 'It is not only your question that takes up room. All of this counts:\n\nthe **system prompt**, every turn of **history**, any **documents** you paste in, results from **tools**, and the **reply** the model writes.\n\nThe reply needs space too, so never fill the window to the brim with input.',
        },
        {
          kind: 'steps',
          prompt: 'Does it take up room in the context window for this request? Tap the right box.',
          cells: ['Counts, as input', 'Counts, as output', 'Does not count'],
          steps: [
            { ask: 'The system prompt.', answer: 0 },
            { ask: 'The reply the model is writing.', answer: 1 },
            { ask: 'A chat from last week that you did not send.', answer: 2 },
            { ask: 'A 30-page report pasted into the message.', answer: 0 },
            { ask: 'The earlier turns of this conversation, sent again.', answer: 0 },
          ],
          explain: 'If it is sent with the request, or written in the reply, it counts. Things left out cost nothing and cannot be seen.',
        },
        {
          kind: 'type',
          prompt: 'A request has a 200-token system prompt, 1,500 tokens of history and a 3,000-token document. The reply is 300 tokens. How many tokens of the window are used in total? Type the number.',
          accept: ['5000', '5,000', '5000 tokens'],
          explain: '200 + 1,500 + 3,000 + 300 = 5,000. Input and output share the same window.',
        },
        {
          kind: 'concept',
          title: 'Estimating in code',
          body: '`len` counts the characters in a piece of text. `//` divides and throws away the remainder, so the result is a whole number.\n\n"strawberry" has 10 characters. At 3 characters per token, that is about 3 tokens.',
          code: `word = "strawberry"
print(len(word))
print(len(word) // 3)`,
          language: 'python',
          output: '10\n3',
        },
        {
          kind: 'write',
          prompt: 'Read one line of text. Print the estimated number of tokens using the course rule: 3 characters per token, rounded down.',
          language: 'python',
          starter: `text = input()
print(len(text))
`,
          tests: [
            { stdin: ['The quick brown fox jumps over the lazy dog'], expected: '14' },
            { stdin: ['Hello there, how are you today?'], expected: '10' },
            { stdin: ['Hi'], expected: '0' },
          ],
          hint: 'len(text) counts the characters. Divide by 3 with whole-number division: len(text) // 3.',
          solution: `text = input()
print(len(text) // 3)
`,
          explain: 'A rough estimate is enough for planning. The real count depends on the model and the language of the text.',
        },
        {
          kind: 'concept',
          title: 'An exact count',
          body: 'The estimate is rough. For the real number, the API can count a request without running the model: `client.messages.count_tokens(...)`.\n\nGive it the model and the messages you plan to send. The answer comes back as `input_tokens`. No reply has been written, so there is no output to count.',
        },
        {
          kind: 'blank',
          prompt: 'For an exact count, the API has an endpoint that counts without running the model. Fill the gaps.',
          code: `count = client.messages.___(
    model="claude-opus-5-5",
    messages=[{"role": "user", "content": long_text}],
)
print(count.___)`,
          language: 'python',
          bank: ['count_tokens', 'input_tokens', 'create', 'output_tokens'],
          answers: ['count_tokens', 'input_tokens'],
          explain: 'You pass the same model you plan to use, because each model counts in its own way. Nothing has been written yet, so only input tokens are reported.',
        },
        {
          kind: 'spot',
          prompt: 'This request is over the limit. Tap the part to deal with first.',
          lines: [
            'System prompt: 300 tokens',
            'Conversation history: 2,000 tokens',
            'Pasted product manual: 140,000 tokens',
            'New question: 40 tokens',
          ],
          answer: 2,
          explain: 'One huge document dwarfs everything else. Later in this chapter you will send only the relevant pieces of it.',
        },
        {
          kind: 'concept',
          title: 'Check before you send',
          body: 'Add up every part, **plus the room you are keeping for the reply**. Then compare the total with the budget.\n\n`<=` means "less than or equal to": a total that exactly equals the budget still fits.',
          code: `budget = 15
total = 5 + 4 + 10   # instructions + question + room for the reply
print("total", total)
if total <= budget:
    print("fits")
else:
    print("too long")`,
          language: 'python',
          output: 'total 19\ntoo long',
        },
        {
          kind: 'write',
          prompt: 'Read a token budget, then three lines: a system prompt, a document and a question. Estimate each with `estimate`, add `RESERVE` tokens of room for the reply, and print `total` and the sum. On a second line print `fits` if the total is within the budget, otherwise `too long`.',
          language: 'python',
          starter: `def estimate(text):
    return len(text) // 3

RESERVE = 20  # room kept free for the reply

budget = int(input())
system = input()
document = input()
question = input()

# The reply needs room too. Add RESERVE.
total = estimate(system) + estimate(document) + estimate(question)

print("total", total)
print("fits")
`,
          tests: [
            { stdin: ['60', 'You are a helpful tutor.', 'Tokens are pieces of words. Models count length in tokens.', 'What is a token?'], expected: 'total 52\nfits' },
            { stdin: ['50', 'You are a helpful tutor.', 'Tokens are pieces of words. Models count length in tokens.', 'What is a token?'], expected: 'total 52\ntoo long' },
            { stdin: ['24', 'Be brief.', 'abc', 'Hi'], expected: 'total 24\nfits' },
          ],
          hint: 'Add + RESERVE to the total. Then use if total <= budget: print("fits") else: print("too long").',
          solution: `def estimate(text):
    return len(text) // 3

RESERVE = 20  # room kept free for the reply

budget = int(input())
system = input()
document = input()
question = input()

total = estimate(system) + estimate(document) + estimate(question) + RESERVE

print("total", total)
if total <= budget:
    print("fits")
else:
    print("too long")
`,
          explain: 'Checking before you send beats finding out from an error. Leaving room for the reply is the part people forget.',
        },
        {
          kind: 'choice',
          prompt: 'A model has a very large window, and your request fits easily. Should you paste in everything you have, just in case?',
          options: [
            'Yes: more context always gives better answers',
            'Yes: unused window space is wasted money',
            'No: the window must be left completely empty',
            'No: extra material costs tokens and can make the model less accurate',
          ],
          answer: 3,
          explain: 'As the window fills, models get worse at finding the detail that matters. Send what helps, not everything that fits.',
        },
      ],
    },
    {
      id: 'u29-cost',
      title: 'Counting the cost',
      exercises: [
        {
          kind: 'concept',
          title: 'You pay per token',
          body: 'API pricing is per token, with **one price for input and another for output**. Output usually costs more. Prices are often quoted per million tokens.\n\nReal prices differ by model and change over time, so read the pricing page. Every price in this lesson is **made up** for practice.',
        },
        {
          kind: 'type',
          prompt: 'Example price (made up): input costs 2 cents per 1,000 tokens. What do 5,000 input tokens cost, in cents? Type the number.',
          accept: ['10', '10 cents', 'ten'],
          explain: '5,000 tokens is five lots of 1,000, and 5 × 2 = 10 cents.',
        },
        {
          kind: 'choice',
          prompt: 'With typical pricing, which costs more?',
          options: [
            '1,000 tokens that you send',
            '1,000 tokens that the model writes',
            'They always cost exactly the same',
            'Neither: only the first call of the day is charged',
          ],
          answer: 1,
          explain: 'Output tokens usually carry the higher price. A long reply can cost more than a long prompt.',
        },
        {
          kind: 'concept',
          title: 'Price times tokens',
          body: 'When a price is per 1,000 tokens, multiply the tokens by the price and divide by 1,000.\n\nWith two prices, do that once for input and once for output, then add the two. The price below is made up.',
          code: `PRICE = 2   # made-up price: cents per 1,000 tokens
tokens = 5000
print(tokens * PRICE / 1000)`,
          language: 'python',
          output: '10.0',
        },
        {
          kind: 'write',
          prompt: 'Read the input tokens, then the output tokens of one call. Using the **example** prices in the starter (made up, in cents per 1,000 tokens), print the cost in cents.',
          language: 'python',
          starter: `# Example prices, invented for this exercise. Cents per 1,000 tokens.
IN_PRICE = 1
OUT_PRICE = 4

input_tokens = int(input())
output_tokens = int(input())

# This charges output at the input price. Fix it.
cost = (input_tokens * IN_PRICE + output_tokens * IN_PRICE) / 1000
print(cost)
`,
          tests: [
            { stdin: ['2000', '500'], expected: '4.0' },
            { stdin: ['1500', '250'], expected: '2.5' },
            { stdin: ['12000', '3000'], expected: '24.0' },
          ],
          hint: 'Multiply output_tokens by OUT_PRICE, not IN_PRICE.',
          solution: `# Example prices, invented for this exercise. Cents per 1,000 tokens.
IN_PRICE = 1
OUT_PRICE = 4

input_tokens = int(input())
output_tokens = int(input())

cost = (input_tokens * IN_PRICE + output_tokens * OUT_PRICE) / 1000
print(cost)
`,
          explain: 'Two counts, two prices, one sum. The counts come straight from `usage` on each response.',
        },
        {
          kind: 'spot',
          prompt: 'Use the same made-up prices: 1 cent per 1,000 input tokens and 4 cents per 1,000 output tokens. Tap the call that cost the most.',
          lines: [
            'Call A: 4,000 input, 100 output',
            'Call B: 1,000 input, 1,000 output',
            'Call C: 3,000 input, 200 output',
            'Call D: 500 input, 900 output',
          ],
          answer: 1,
          explain: 'B costs 1 + 4 = 5 cents. A is 4.4, C is 3.8 and D is 4.1. The call with the most output wins, not the one with the most input.',
        },
        {
          kind: 'concept',
          title: 'Long chats get expensive',
          body: 'The API is stateless, so every call resends the whole history. That means you pay for the early turns **again on every later call**.\n\nTurn 1 is paid for once in call 1, again in call 2, again in call 3. The cost of a chat grows faster than its length.',
        },
        {
          kind: 'steps',
          prompt: 'Every question is 100 tokens and every reply is 100 tokens. Tap how many input tokens each call sends.',
          cells: ['100', '300', '500', '700'],
          steps: [
            { ask: 'Call 1: just the first question.', answer: 0 },
            { ask: 'Call 2: question, reply, new question.', answer: 1 },
            { ask: 'Call 3.', answer: 2 },
            { ask: 'Call 4.', answer: 3 },
          ],
          explain: 'Each call carries everything before it plus one new question. Four calls sent 1,600 input tokens for only 400 tokens of questions.',
        },
        {
          kind: 'concept',
          title: 'Watching the history grow',
          body: 'Here every question and every reply is 50 tokens. The question joins the history before the call. The reply joins after it.\n\nSo each call sends more than the one before.',
          code: `history = 0
for call in range(3):
    history += 50      # the new question
    print("call sends", history)
    history += 50      # the reply`,
          language: 'python',
          output: 'call sends 50\ncall sends 150\ncall sends 250',
        },
        {
          kind: 'write',
          prompt: 'A chat has a number of exchanges. Every question is 100 tokens and every reply is 100 tokens, and each call resends the full history. Read the number of exchanges and print the total input tokens sent across all the calls.',
          language: 'python',
          starter: `exchanges = int(input())
history = 0   # tokens in the conversation so far
total = 0     # input tokens sent across all calls

for i in range(exchanges):
    history += 100      # the new question joins the history
    total += 100        # wrong: the call sends the whole history
    history += 100      # the reply joins the history

print(total)
`,
          tests: [
            { stdin: ['1'], expected: '100' },
            { stdin: ['3'], expected: '900' },
            { stdin: ['5'], expected: '2500' },
          ],
          hint: 'Each call sends everything so far, so add history to the total: total += history.',
          solution: `exchanges = int(input())
history = 0   # tokens in the conversation so far
total = 0     # input tokens sent across all calls

for i in range(exchanges):
    history += 100      # the new question joins the history
    total += history    # the call sends the whole history
    history += 100      # the reply joins the history

print(total)
`,
          explain: 'Five exchanges hold 1,000 tokens of conversation but cost 2,500 input tokens to have. This is why long chats need managing.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these does not reduce what a feature costs?',
          options: [
            'Sending less history with each call',
            'Using a smaller model for easy tasks',
            'Adding "please be cheap" to the prompt',
            'Asking for shorter replies',
          ],
          answer: 2,
          explain: 'Cost is tokens times price. Fewer input tokens, fewer output tokens or a cheaper model all help. Asking nicely changes none of them.',
        },
      ],
    },
    {
      id: 'u29-long-chats',
      title: 'When conversations get long',
      exercises: [
        {
          kind: 'concept',
          title: 'Two ways to shrink a history',
          body: 'A long chat costs more with each call and will one day not fit at all. You have two basic tools.\n\n**Trim**: drop the oldest turns and keep the newest.\n\n**Summarise**: replace the old turns with a short summary of them, so the gist stays but the bulk goes.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the best move for each situation.',
          cells: ['Trim', 'Summarise', 'Leave it alone'],
          steps: [
            { ask: 'The oldest turns are greetings and small talk.', answer: 0 },
            { ask: 'Decisions made early on still matter, but they are spread over 40 long turns.', answer: 1 },
            { ask: 'The chat is six short turns and nowhere near any limit.', answer: 2 },
            { ask: 'Old turns hold long tool output that is no longer needed.', answer: 0 },
          ],
          explain: 'Drop what no longer matters, compress what still does, and do nothing when there is no problem.',
        },
        {
          kind: 'choice',
          prompt: 'When trimming a history, which part should always survive?',
          options: [
            'The longest message',
            'The oldest three turns',
            'The system prompt and the newest turns',
            'Every assistant turn, but no user turns',
          ],
          answer: 2,
          explain: 'The system prompt holds the rules, and the newest turns hold what is being discussed right now. The oldest turns matter least.',
        },
        {
          kind: 'type',
          prompt: 'A history has 10 turns of 50 tokens each. You may spend 300 tokens on history. How many of the newest turns can you keep? Type the number.',
          accept: ['6', 'six'],
          explain: '300 ÷ 50 = 6. The four oldest turns are dropped.',
        },
        {
          kind: 'concept',
          title: 'Trim from the newest backwards',
          body: 'To trim to a budget: count the system prompt first, because it always stays. Then walk the history **from newest to oldest**, keeping each turn while there is room.\n\nStop at the first turn that does not fit. Skipping it and keeping older ones would leave a gap in the conversation.',
        },
        {
          kind: 'concept',
          title: 'Walking a list backwards',
          body: '`reversed` walks a list from its last item to its first.\n\n`insert(0, ...)` puts an item at the **front** of a list. Use the two together and the new list ends up in the original order.',
          code: `turns = ["one", "two", "three"]
kept = []
for text in reversed(turns):
    print("looking at", text)
    kept.insert(0, text)
print(kept)`,
          language: 'python',
          output: "looking at three\nlooking at two\nlooking at one\n['one', 'two', 'three']",
        },
        {
          kind: 'concept',
          title: 'Stop when the budget is used',
          body: 'Check **before** keeping: would this one push the total past the budget? If so, `break` leaves the loop at once.\n\nOtherwise keep it and add its size to the running total. Here the budget is 10.',
          code: `sizes = [4, 6, 5, 3]
used = 0
for size in reversed(sizes):
    if used + size > 10:
        break
    used += size
    print("kept", size)
print("used", used)`,
          language: 'python',
          output: 'kept 3\nkept 5\nused 8',
        },
        {
          kind: 'write',
          prompt: 'Read a token budget. Always keep the system prompt. Then walk `history` from newest to oldest, keeping each turn while the running total stays within the budget, and stop at the first one that does not fit. Print the system prompt, then the kept turns in their original order, one per line.',
          language: 'python',
          starter: `def estimate(text):
    return len(text) // 3

system = "You are a helpful tutor."
history = [
    "What is a token?",
    "A token is a piece of a word.",
    "How long is my prompt?",
    "About forty tokens.",
    "Thanks, and the cost?",
]

budget = int(input())
used = estimate(system)
kept = []

for text in reversed(history):
    # Only keep this turn if it fits. If it does not, stop the loop.
    kept.insert(0, text)

print(system)
for text in kept:
    print(text)
`,
          tests: [
            { stdin: ['21'], expected: 'You are a helpful tutor.\nAbout forty tokens.\nThanks, and the cost?' },
            { stdin: ['30'], expected: 'You are a helpful tutor.\nHow long is my prompt?\nAbout forty tokens.\nThanks, and the cost?' },
            { stdin: ['10'], expected: 'You are a helpful tutor.' },
          ],
          hint: 'Inside the loop: cost = estimate(text). If used + cost > budget, break. Otherwise insert the turn and add cost to used.',
          solution: `def estimate(text):
    return len(text) // 3

system = "You are a helpful tutor."
history = [
    "What is a token?",
    "A token is a piece of a word.",
    "How long is my prompt?",
    "About forty tokens.",
    "Thanks, and the cost?",
]

budget = int(input())
used = estimate(system)
kept = []

for text in reversed(history):
    cost = estimate(text)
    if used + cost > budget:
        break
    kept.insert(0, text)
    used += cost

print(system)
for text in kept:
    print(text)
`,
          explain: '`insert(0, ...)` puts each kept turn at the front, so the list ends up in the original order even though you walked it backwards.',
        },
        {
          kind: 'spot',
          prompt: 'This history was trimmed, and one leftover turn now answers a question that is gone. Tap the turn that should be dropped too.',
          lines: [
            'system: You are a travel helper.',
            'assistant: Lisbon is lovely in May.',
            'user: What about the food?',
            'assistant: Try the custard tarts.',
            'user: And hotels?',
          ],
          answer: 1,
          explain: 'A reply without its question is noise, and the turns should begin with a user message. Trim in whole question-and-answer pairs.',
        },
        {
          kind: 'choice',
          prompt: 'What is the main risk of summarising old turns?',
          options: [
            'The summary may leave out or change a detail that matters later',
            'The summary is always longer than the original',
            'The API refuses conversations that contain summaries',
            'There is no risk at all',
          ],
          answer: 0,
          explain: 'A summary is written by a model, so it can drop or distort things. Keep exact facts, such as names and numbers, somewhere safe.',
        },
        {
          kind: 'order',
          prompt: 'Put the steps of summarising a long chat in order.',
          lines: [
            'Split the history into old turns and recent turns',
            'Ask a model to summarise the old turns',
            'Replace the old turns with that summary, and keep the recent turns as they were',
            'Send the system prompt, summary, recent turns and new question',
          ],
          explain: 'The gist of the past travels as a short summary, and the recent turns stay word for word.',
        },
      ],
    },
    {
      id: 'u29-retrieval',
      title: 'Documents and retrieval',
      exercises: [
        {
          kind: 'concept',
          title: 'Document first, question last',
          body: 'When a prompt contains a long document, put the **document at the top** and your **question at the end**.\n\nModels tend to answer better this way: the question is the freshest thing in view when the reply begins. Wrap the document in tags so its edges are clear.',
        },
        {
          kind: 'choice',
          prompt: 'You are asking one question about a 20-page contract. Which layout is best?',
          options: [
            'Question, then the contract',
            'Half the contract, the question, then the other half',
            'The contract inside tags, then the question',
            'The question only, with the contract in a separate later call',
          ],
          answer: 2,
          explain: 'Long material goes first and the question goes after it. A separate call would not work at all, because the API keeps nothing between calls.',
        },
        {
          kind: 'concept',
          title: 'Retrieval: find first, then ask',
          body: 'You have 500 help pages and one question. Do not send all 500.\n\nCut the pages into small **chunks**. For each question, **search** for the few chunks that are relevant, and put only those in the prompt. This is **retrieval**, and the full pattern is often called RAG: retrieval-augmented generation.',
        },
        {
          kind: 'steps',
          prompt: 'The question is "How do I reset my password?". These are the chunks you could send.',
          cells: ['Opening hours', 'Password reset steps', 'Refund policy', 'Password rules', 'Company history'],
          steps: [
            { ask: 'Tap the most relevant chunk.', answer: 1 },
            { ask: 'Tap the next most relevant chunk.', answer: 3 },
            { ask: 'Tap the chunk about money, which the question never mentions.', answer: 2 },
          ],
          explain: 'Two chunks are worth sending. The other three would only cost tokens and distract.',
        },
        {
          kind: 'concept',
          title: 'Words two texts share',
          body: '`split` cuts a text into words, and `set` keeps each different word once.\n\n`&` between two sets gives the items that are in **both**. `len` then counts them.',
          code: `a = set("the cat sat on the mat".split())
b = set("a cat on a mat".split())
print(sorted(a & b))
print(len(a & b))`,
          language: 'python',
          output: "['cat', 'mat', 'on']\n3",
        },
        {
          kind: 'write',
          prompt: 'The simplest search scores a chunk by shared words. Read a question, then a chunk. Print how many different words from the question also appear in the chunk. Ignore upper and lower case.',
          language: 'python',
          starter: `question = input()
chunk = input()

q_words = set(question.lower().split())
c_words = set(chunk.lower().split())

# This counts every question word. Count only the shared ones.
print(len(q_words))
`,
          tests: [
            { stdin: ['how do I reset my password', 'to reset your password click forgot password'], expected: '2' },
            { stdin: ['When are refunds paid', 'Refunds are paid within ten days'], expected: '3' },
            { stdin: ['hello', 'goodbye'], expected: '0' },
          ],
          hint: 'Two sets share the items in their intersection: q_words & c_words. Print its length.',
          solution: `question = input()
chunk = input()

q_words = set(question.lower().split())
c_words = set(chunk.lower().split())

print(len(q_words & c_words))
`,
          explain: 'More shared words suggests the chunk is about the same thing. It is crude, but it is a real retrieval score.',
        },
        {
          kind: 'concept',
          title: 'Ranking by a score',
          body: '`sorted` can rank a list by any function you pass as `key`. Here the score is `len`, the length of each word.\n\n`reverse=True` puts the highest score first. `[:2]` takes the first two.',
          code: `words = ["fig", "banana", "kiwi", "apple"]
ranked = sorted(words, key=len, reverse=True)
print(ranked)
print(ranked[:2])`,
          language: 'python',
          output: "['banana', 'apple', 'kiwi', 'fig']\n['banana', 'apple']",
        },
        {
          kind: 'write',
          prompt: 'Read a question. Score every chunk with `overlap` and print the two highest-scoring chunks, best first. If scores tie, the chunk that comes earlier in the list wins.',
          language: 'python',
          starter: `chunks = [
    "the shop opens at nine and closes at five",
    "to reset your password click forgot password on the login page",
    "refunds are paid within ten days",
    "your password must be at least twelve characters",
    "delivery takes three to five working days",
]

question = input()
q_words = set(question.lower().split())

def overlap(chunk):
    return len(q_words & set(chunk.split()))

# This always prints the first two. Sort by score first.
ranked = chunks
for chunk in ranked[:2]:
    print(chunk)
`,
          tests: [
            {
              stdin: ['how do I reset my password'],
              expected: 'to reset your password click forgot password on the login page\nyour password must be at least twelve characters',
            },
            {
              stdin: ['how many days until delivery and refunds are paid'],
              expected: 'refunds are paid within ten days\ndelivery takes three to five working days',
            },
            {
              stdin: ['what time does the shop close at'],
              expected: 'the shop opens at nine and closes at five\nto reset your password click forgot password on the login page',
            },
          ],
          hint: 'sorted(chunks, key=overlap, reverse=True) gives a new list with the highest score first. Ties keep their original order.',
          solution: `chunks = [
    "the shop opens at nine and closes at five",
    "to reset your password click forgot password on the login page",
    "refunds are paid within ten days",
    "your password must be at least twelve characters",
    "delivery takes three to five working days",
]

question = input()
q_words = set(question.lower().split())

def overlap(chunk):
    return len(q_words & set(chunk.split()))

ranked = sorted(chunks, key=overlap, reverse=True)
for chunk in ranked[:2]:
    print(chunk)
`,
          explain: 'You just built the retrieval half of RAG. The two winners would go into the prompt, above the question.',
        },
        {
          kind: 'concept',
          title: 'Embeddings: search by meaning',
          body: 'Word matching misses "I forgot my login" when the page says "password reset": no words are shared.\n\nAn **embedding** turns a piece of text into a list of numbers that stands for its meaning. Texts that mean similar things get lists that are close together. So you can search for the *nearest* chunks, like nearest neighbour in the first course.',
        },
        {
          kind: 'choice',
          prompt: 'A user asks "my card was charged twice". Your refund chunk says "duplicate payments are returned within ten days". Why might keyword search miss it?',
          options: [
            'The chunk is too short',
            'The question and the chunk share almost no words, even though they mean the same',
            'Keyword search only works on numbers',
            'The chunk is in the wrong file',
          ],
          answer: 1,
          explain: 'Same meaning, different words. Searching by embeddings compares meaning, so it can still find the match.',
        },
        {
          kind: 'type',
          prompt: 'In RAG, the G is "generation" and the A is "augmented". What does the R stand for? Type the word.',
          accept: ['retrieval', 'retrieve', 'retrieval-augmented'],
          explain: 'Retrieval comes first: find the relevant pieces. Then the model generates an answer with those pieces in its window.',
        },
        {
          kind: 'spot',
          prompt: 'The question is "How long does delivery take?". Tap the retrieved chunk that should not have been included.',
          lines: [
            'Delivery takes three to five working days.',
            'Express delivery arrives the next working day.',
            'Our founder started the company in a garage in 1998.',
            'Deliveries to islands can take two extra days.',
          ],
          answer: 2,
          explain: 'It costs tokens and adds nothing. Irrelevant chunks can also pull the answer off course.',
        },
      ],
    },
    {
      id: 'u29-engineering',
      title: 'Caching and context engineering',
      exercises: [
        {
          kind: 'concept',
          title: 'Prompt caching',
          body: 'Many requests start with the same long text: a system prompt, a manual. With **prompt caching**, the API keeps that processed beginning briefly and reuses it. The reused part is billed at a lower rate and is faster.\n\nIt only works if the start is **exactly** the same. One changed character and everything after it is read fresh.',
          code: `response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    cache_control={"type": "ephemeral"},
    system=LONG_MANUAL,
    messages=messages,
)
print(response.usage.cache_read_input_tokens)`,
          language: 'python',
        },
        {
          kind: 'steps',
          prompt: 'Caching reuses an unchanged beginning. Tap where each piece should go in the request.',
          cells: ['Near the start (stays the same)', 'Near the end (changes each time)', 'Leave it out'],
          steps: [
            { ask: 'A long system prompt that is identical on every call.', answer: 0 },
            { ask: 'The question this user just typed.', answer: 1 },
            { ask: 'A 50-page manual used for every question.', answer: 0 },
            { ask: 'The current date and time.', answer: 1 },
            { ask: 'A second manual, for a product nobody has asked about.', answer: 2 },
          ],
          explain: 'Stable content first, changing content last. Then the long stable part can be reused call after call.',
        },
        {
          kind: 'spot',
          prompt: 'This prompt is sent on every call, but the cache is never reused. Tap the line that spoils it.',
          lines: [
            'Current time: 14:02:37',
            'You are a support assistant for a bike shop.',
            '<manual> ...40 pages, always the same... </manual>',
            'Customer question: How do I fix a puncture?',
          ],
          answer: 0,
          explain: 'The time changes every second and sits at the very top, so nothing after it ever matches. Move it to the end, or leave it out.',
        },
        {
          kind: 'concept',
          title: 'Two lists, side by side',
          body: '`zip` walks two lists together, one pair at a time.\n\nLook at the third pair: it matches again. A cache would never get that far. It stops at the first difference, and stopping a loop early is the job of `break`.',
          code: `first = ["red", "blue", "green"]
second = ["red", "pink", "green"]
for a, b in zip(first, second):
    print(a, b, a == b)`,
          language: 'python',
          output: 'red red True\nblue pink False\ngreen green True',
        },
        {
          kind: 'write',
          prompt: 'A request is a list of parts. Read two requests, each on one line with parts separated by ` | `. Print how many parts at the **start** are identical in both. Stop counting at the first difference.',
          language: 'python',
          starter: `first = input().split(" | ")
second = input().split(" | ")

count = 0
for a, b in zip(first, second):
    # This counts every match, even after a difference. Stop at the first mismatch.
    if a == b:
        count += 1

print(count)
`,
          tests: [
            { stdin: ['system | manual | question one', 'system | manual | question two'], expected: '2' },
            { stdin: ['time 14:02 | system | manual', 'time 14:03 | system | manual'], expected: '0' },
            { stdin: ['a | b | c', 'a | b | c'], expected: '3' },
          ],
          hint: 'If a != b, use break to leave the loop. Otherwise add 1 to count.',
          solution: `first = input().split(" | ")
second = input().split(" | ")

count = 0
for a, b in zip(first, second):
    if a != b:
        break
    count += 1

print(count)
`,
          explain: 'A cache matches from the beginning only. In the second test the manual is identical, but a changed part in front of it means none of it can be reused.',
        },
        {
          kind: 'type',
          prompt: 'Two requests have 6 parts each. Parts 1 to 4 are identical, part 5 differs, and part 6 is identical again. How many parts can be reused from the cache? Type the number.',
          accept: ['4', 'four'],
          explain: 'Reuse stops at the first difference. Part 6 matches, but it comes after a change, so it is read fresh.',
        },
        {
          kind: 'choice',
          prompt: 'You turned caching on, but `usage.cache_read_input_tokens` is 0 on every call. What is the likeliest cause?',
          options: [
            'The model is too large',
            'Something near the start of the request changes on every call',
            'Your replies are too short',
            'Caching only works on the first call of the day',
          ],
          answer: 1,
          explain: 'A zero means nothing was reused. Look for a timestamp, a random ID or a reordered list near the top. A very short beginning may also be too small to cache.',
        },
        {
          kind: 'concept',
          title: 'Context engineering',
          body: 'The model can only work with what is in its window. So the real craft is **deciding what goes in**: which instructions, which examples, which chunks, how much history, in what order.\n\nThat is **context engineering**. Too little and the model guesses. Too much and the key fact gets lost. It is most of the job.',
        },
        {
          kind: 'match',
          prompt: 'Match each problem to the context fix.',
          pairs: [
            ['The model does not know your refund policy', 'Retrieve the policy chunk and include it'],
            ['The chat is slow and costly after 200 turns', 'Trim or summarise the old turns'],
            ['The same manual is sent on every call', 'Put it first and cache it'],
            ['The question is lost under a huge paste', 'Move the question to the end'],
          ],
          explain: 'Four different symptoms, one skill: choosing what the model sees and where it sits.',
        },
        {
          kind: 'choice',
          prompt: 'Your app gives a wrong answer about a customer order. What should you check first?',
          options: [
            'Whether a bigger model exists',
            'Whether the reply was long enough',
            'Whether the temperature dial was mentioned in the prompt',
            'What was actually in the context: was the order data sent at all?',
          ],
          answer: 3,
          explain: 'A model cannot use what it was never shown. Print the exact request and read it before blaming the model.',
        },
      ],
    },
  ],
}
