import type { Unit } from '../types'

// String.raw keeps Python code readable: real line breaks, no escaping.
const r = String.raw

export const u20: Unit = {
  id: 'u20',
  week: 7,
  course: 'dev',
  title: 'Building a real API',
  summary: 'Endpoints, status codes and tokens',
  lessons: [
    {
      id: 'u20-contract',
      title: 'Contracts, resources and methods',
      exercises: [
        {
          kind: 'concept',
          title: 'An API is a promise',
          body: 'An API lets programs talk to your app. Its **contract** is the promise it makes: which requests it accepts, and exactly what comes back.\n\nThink of a restaurant menu. You order what is listed, and you know what will arrive. Other developers build on that promise, so breaking it breaks their apps.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these is part of an API\'s contract?',
          options: [
            'The name of the variable the server stores tasks in',
            'Which programming language the server is written in',
            'The fields a task has when the API sends it back',
            'How many developers work on the server',
          ],
          answer: 2,
          explain: 'The contract covers what clients can see: requests and responses. What happens inside the server can change freely.',
        },
        {
          kind: 'concept',
          title: 'Resources and URLs',
          body: 'A **resource** is a thing your API manages, like a task. Each resource gets a URL made of nouns.\n\n`/tasks` is the whole collection. `/tasks/7` is the one task with id 7.\n\nThe URL says *which thing*. The HTTP method says *what to do with it*.',
        },
        {
          kind: 'spot',
          prompt: 'Three of these follow the "URLs are nouns" habit. Tap the one that does not.',
          lines: ['GET /tasks', 'GET /tasks/7', 'POST /createNewTask', 'DELETE /tasks/7'],
          answer: 2,
          explain: '`POST` already means "create", so the URL only needs the noun: `POST /tasks`. Verbs in URLs pile up fast and are hard to guess.',
        },
        {
          kind: 'match',
          prompt: 'Match each HTTP method to what it does.',
          pairs: [
            ['GET', 'Read something'],
            ['POST', 'Create something new'],
            ['PUT', 'Replace the whole thing'],
            ['PATCH', 'Change part of it'],
            ['DELETE', 'Remove it'],
          ],
          explain: 'Five methods cover almost everything you do to a resource. PUT swaps the whole thing; PATCH edits just the fields you send.',
        },
        {
          kind: 'concept',
          title: 'Safe and idempotent',
          body: 'A **safe** method only reads. GET is safe: calling it changes nothing.\n\nAn **idempotent** method leaves the same result whether you send it once or five times. PUT and DELETE are idempotent. POST is not: send it twice and you get two new tasks.\n\nThis matters because networks fail and clients retry.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the right method for each question.',
          cells: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          steps: [
            { ask: 'Which one is safe: it never changes anything?', answer: 0 },
            { ask: 'Which one, sent twice by accident, would create two tasks?', answer: 1 },
            { ask: 'You want to change only the title of task 7. Which one?', answer: 3 },
            { ask: 'You want task 7 gone. Which one?', answer: 4 },
          ],
          explain: 'GET reads, POST creates (and is risky to repeat), PATCH edits part, DELETE removes.',
        },
        {
          kind: 'type',
          prompt: 'A client wants to add a brand-new task to `/tasks`. Which HTTP method should it use? Type it.',
          accept: ['POST'],
          explain: 'POST to the collection URL creates a new item inside it.',
        },
        {
          kind: 'concept',
          title: 'A handler in code',
          body: 'A **handler** is a function that takes a request and returns the response. Here it returns a pair: a status code, then the body.\n\nIt checks the method and the path together. `200` means it worked. Anything it does not recognise falls through to the `404` (not found) at the bottom.',
          code: r`def handle(method, path):
    if method == "GET" and path == "/books":
        return (200, ["Dune", "Emma"])
    return (404, {"error": "not found"})

print(handle("GET", "/books"))
print(handle("GET", "/films"))`,
          language: 'python',
          output: r`(200, ['Dune', 'Emma'])
(404, {'error': 'not found'})`,
        },
        {
          kind: 'write',
          prompt: 'Let\'s start a tiny API. Finish `handle` so that `GET` on `/tasks` returns `(200, TASKS)`, and anything else (for now) returns `(404, {"error": "not found"})`. The last lines read a request and print the result.',
          language: 'python',
          starter: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}, {"id": 2, "title": "Call Sam"}]

def handle(method, path, body):
    # Return a pair: (status code, response body)
    return (200, TASKS)

method, path = input().split()
status, result = handle(method, path, None)
print(status, json.dumps(result, sort_keys=True))
`,
          tests: [
            { stdin: ['GET /tasks'], expected: '200 [{"id": 1, "title": "Buy milk"}, {"id": 2, "title": "Call Sam"}]' },
            { stdin: ['GET /pets'], expected: '404 {"error": "not found"}' },
          ],
          hint: 'Check `if method == "GET" and path == "/tasks":` and return the 200 pair inside it. After the `if`, return the 404 pair.',
          solution: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}, {"id": 2, "title": "Call Sam"}]

def handle(method, path, body):
    if method == "GET" and path == "/tasks":
        return (200, TASKS)
    return (404, {"error": "not found"})

method, path = input().split()
status, result = handle(method, path, None)
print(status, json.dumps(result, sort_keys=True))
`,
          explain: 'Every API handler boils down to this: look at the method and path, then answer with a status code and a body.',
        },
        {
          kind: 'choice',
          prompt: 'A client sends `DELETE /tasks/7`, gets no reply because the wifi drops, and sends it again. Why is that fine?',
          options: [
            'DELETE is safe, so nothing was changed',
            'The server ignores every repeated request',
            'DELETE creates a backup first',
            'DELETE is idempotent: once or twice, task 7 ends up gone',
          ],
          answer: 3,
          explain: 'Idempotent means repeating it leaves the same end result. DELETE is not safe, though: it does change things.',
        },
      ],
    },
    {
      id: 'u20-status-codes',
      title: 'Status codes',
      exercises: [
        {
          kind: 'concept',
          title: 'Three families',
          body: 'Every response starts with a **status code**. The first digit tells the story.\n\n**2xx**: it worked. **4xx**: the client made a mistake. **5xx**: the server broke.\n\nThree 2xx codes to know: `200` OK, `201` Created (something new was made), `204` No Content (it worked, and there is nothing to send back).',
        },
        {
          kind: 'match',
          prompt: 'Match each status code to its meaning.',
          pairs: [
            ['200', 'OK, here is what you asked for'],
            ['201', 'Created something new'],
            ['204', 'Worked, nothing to send back'],
            ['404', 'That thing does not exist'],
            ['500', 'The server crashed'],
          ],
          explain: '2xx codes are different kinds of success. 404 blames the request; 500 blames the server.',
        },
        {
          kind: 'type',
          prompt: 'A `POST /tasks` request worked and a new task now exists. Which status code fits best? Type the number.',
          accept: ['201'],
          explain: '201 Created tells the client that something new was made, which is more exact than a plain 200.',
        },
        {
          kind: 'concept',
          title: 'The 4xx codes',
          body: '`400` Bad Request: I cannot read this (broken JSON).\n\n`401`: I do not know who you are.\n\n`403`: I know you, and you may not do this.\n\n`404`: no such thing.\n\n`409` Conflict: clashes with what exists (that email is taken).\n\n`422`: I can read it, but the values are not valid (empty title).',
        },
        {
          kind: 'steps',
          prompt: 'Tap the best status code for each request.',
          cells: ['400', '401', '403', '404', '409', '422'],
          steps: [
            { ask: 'The request has no token at all, so the server cannot tell who is asking.', answer: 1 },
            { ask: 'The token is valid, but the task belongs to someone else.', answer: 2 },
            { ask: 'The body is cut off halfway, so it is not valid JSON.', answer: 0 },
            { ask: 'The JSON is fine, but the title is an empty string.', answer: 5 },
            { ask: 'Someone signs up with an email that is already registered.', answer: 4 },
          ],
          explain: '401 is "who are you?", 403 is "not allowed", 400 is "cannot read this", 422 is "read it, values are wrong", and 409 is "clashes with what exists".',
        },
        {
          kind: 'spot',
          prompt: 'This handler looks up one task. Tap the line that sends the wrong status code.',
          lines: [
            'def get_task(task_id):',
            '    task = find(task_id)',
            '    if task is None:',
            '        return (200, {"error": "task not found"})',
            '    return (200, task)',
          ],
          language: 'python',
          answer: 3,
          explain: 'A missing task should be 404. With 200, client code thinks the request worked and tries to use an error as a task.',
        },
        {
          kind: 'choice',
          prompt: 'A perfectly valid request hits a bug in your code and the server crashes. Which code does the client get?',
          options: ['400', '500', '404', '204'],
          answer: 1,
          explain: '5xx means the fault is on the server. The client did nothing wrong and may simply try again later.',
        },
        {
          kind: 'concept',
          title: 'Find one, or say 404',
          body: 'To fetch one item, loop through the list and return as soon as an id matches.\n\nIf the loop ends with no match, the item does not exist, so return a 404 pair with a clear message.',
          code: r`BOOKS = [{"id": 1, "title": "Dune"}, {"id": 2, "title": "Emma"}]

def get_book(book_id):
    for book in BOOKS:
        if book["id"] == book_id:
            return (200, book)
    return (404, {"error": "book not found"})

print(get_book(2))
print(get_book(5))`,
          language: 'python',
          output: r`(200, {'id': 2, 'title': 'Emma'})
(404, {'error': 'book not found'})`,
        },
        {
          kind: 'write',
          prompt: 'Add "get one task" to the API. For `GET /tasks/ID`, return `(200, the task)` if a task has that id, otherwise `(404, {"error": "task not found"})`.',
          language: 'python',
          starter: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}, {"id": 2, "title": "Call Sam"}]

def handle(method, path, body):
    if method == "GET" and path == "/tasks":
        return (200, TASKS)
    if method == "GET" and path.startswith("/tasks/"):
        task_id = int(path.split("/")[2])
        # Look through TASKS for this id.
        return (200, TASKS[0])
    return (404, {"error": "not found"})

status, result = handle("GET", input(), None)
print(status, json.dumps(result, sort_keys=True))
`,
          tests: [
            { stdin: ['/tasks/2'], expected: '200 {"id": 2, "title": "Call Sam"}' },
            { stdin: ['/tasks/9'], expected: '404 {"error": "task not found"}' },
          ],
          hint: 'Loop: `for task in TASKS:` and `if task["id"] == task_id: return (200, task)`. After the loop, return the 404 pair.',
          solution: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}, {"id": 2, "title": "Call Sam"}]

def handle(method, path, body):
    if method == "GET" and path == "/tasks":
        return (200, TASKS)
    if method == "GET" and path.startswith("/tasks/"):
        task_id = int(path.split("/")[2])
        for task in TASKS:
            if task["id"] == task_id:
                return (200, task)
        return (404, {"error": "task not found"})
    return (404, {"error": "not found"})

status, result = handle("GET", input(), None)
print(status, json.dumps(result, sort_keys=True))
`,
          explain: 'The id comes out of the URL, and a missing id gets an honest 404 with a message a developer can act on.',
        },
        {
          kind: 'type',
          prompt: '`DELETE /tasks/2` worked. The task is gone and there is nothing to send back. Which status code fits? Type the number.',
          accept: ['204'],
          explain: '204 No Content means success with an empty body. 200 would also be understood, but 204 is the exact fit.',
        },
        {
          kind: 'choice',
          prompt: 'Why not always answer 200 and put any error in the body?',
          options: [
            'Client code and tools check the status code first to decide what happened',
            '200 responses are slower to send',
            'Browsers refuse to show a 200 response',
            'JSON cannot hold error messages',
          ],
          answer: 0,
          explain: 'Libraries, logs and monitoring all read the code. A fake 200 hides failures from every one of them.',
        },
      ],
    },
    {
      id: 'u20-bodies',
      title: 'Bodies, validation and errors',
      exercises: [
        {
          kind: 'concept',
          title: 'Bodies carry the data',
          body: 'A request or response can carry a **body**: the data itself, usually written as JSON.\n\n`POST /tasks` sends the new task in its body. The response sends back the saved task, now with an id.\n\nIn Python, `json.loads` turns JSON text into a dict, and `json.dumps` turns a dict back into text.',
          code: 'POST /tasks\n{"title": "Buy milk"}\n\n201 Created\n{"id": 3, "title": "Buy milk"}',
        },
        {
          kind: 'blank',
          prompt: 'Fill the gaps: read a JSON body, then write a JSON response.',
          code: 'data = json.___(request_text)    # text -> dict\nreply = json.___({"id": 3})      # dict -> text',
          language: 'python',
          bank: ['loads', 'dumps', 'read', 'print'],
          answers: ['loads', 'dumps'],
          explain: 'The `s` stands for "string": `loads` loads from a string, `dumps` dumps to a string.',
        },
        {
          kind: 'concept',
          title: 'Never trust the body',
          body: '**Validation** means checking a request before acting on it. Anyone can send anything: missing fields, empty text, a word where a number belongs.\n\nWhen a check fails, stop and answer with a 4xx code and a message that names the field and the problem. A good error message saves another developer an hour.',
        },
        {
          kind: 'choice',
          prompt: 'A client sent a task with no title. Which error body helps them most?',
          options: [
            '{"error": "Bad request"}',
            '{"error": "Something went wrong"}',
            '{"error": "Validation failed"}',
            '{"error": "title is required"}',
          ],
          answer: 3,
          explain: 'It names the field and says what is wrong, so the fix is obvious. The others leave the developer guessing.',
        },
        {
          kind: 'concept',
          title: 'Missing or empty?',
          body: '`body["age"]` crashes when the key is missing. `body.get("age")` gives `None` instead, or the second value if you pass one.\n\n`None` and `""` both count as false, so one `if not` catches a missing value and an empty one.',
          code: r`body = {"name": ""}
print(body.get("age"))
print(body.get("age", 0))
if not body.get("name"):
    print("name is required")`,
          language: 'python',
          output: r`None
0
name is required`,
        },
        {
          kind: 'concept',
          title: 'Is it the right kind of value?',
          body: '`isinstance(value, bool)` is `True` only when the value is a real `True` or `False`. The text `"yes"` does not count.\n\nTo check a field that is allowed to be missing, first ask whether the key is there with `in`.',
          code: r`print(isinstance(False, bool))
print(isinstance("yes", bool))
body = {"age": "ten"}
if "age" in body and not isinstance(body["age"], int):
    print("age must be a number")`,
          language: 'python',
          output: r`True
False
age must be a number`,
        },
        {
          kind: 'write',
          prompt: 'Write `validate(body)`. It returns a list of error messages. Add `"title is required"` if `"title"` is missing or empty. Add `"done must be true or false"` if `"done"` is present but is not a bool. A good body returns an empty list.',
          language: 'python',
          starter: r`def validate(body):
    errors = []
    # Check the title, then check done.
    return errors

print(validate({"title": "Buy milk", "done": False}))
print(validate({"title": ""}))
print(validate({"done": "yes"}))
`,
          tests: [{ expected: "[]\n['title is required']\n['title is required', 'done must be true or false']" }],
          hint: '`body.get("title")` gives None when the key is missing, and both None and "" count as false in `if not ...`. Use `isinstance(body["done"], bool)` for the second check.',
          solution: r`def validate(body):
    errors = []
    if not body.get("title"):
        errors.append("title is required")
    if "done" in body and not isinstance(body["done"], bool):
        errors.append("done must be true or false")
    return errors

print(validate({"title": "Buy milk", "done": False}))
print(validate({"title": ""}))
print(validate({"done": "yes"}))
`,
          explain: 'Collecting every problem lets the client fix them all in one go, instead of one failed request at a time.',
        },
        {
          kind: 'spot',
          prompt: 'This create handler rejects good tasks and saves bad ones. Tap the line with the bug.',
          lines: [
            'def create(body):',
            '    if "title" in body:',
            '        return (422, {"error": "title is required"})',
            '    TASKS.append(body)',
            '    return (201, body)',
          ],
          language: 'python',
          answer: 1,
          explain: 'The check is backwards. It should be `if "title" not in body:` so only a missing title gets the 422.',
        },
        {
          kind: 'steps',
          prompt: 'Follow one `POST /tasks` request through the server. Tap the part that answers each question.',
          cells: ['Client', 'Router', 'Validation', 'Storage', 'Response'],
          steps: [
            { ask: 'Who sends the request with a JSON body?', answer: 0 },
            { ask: 'Which part reads the method and path to pick the code to run?', answer: 1 },
            { ask: 'The title is empty. Which part stops the request here?', answer: 2 },
            { ask: 'This time the title is fine. Where is the new task saved?', answer: 3 },
            { ask: 'What carries 201 and the new task back to the client?', answer: 4 },
          ],
          explain: 'Route, validate, save, respond. Validation sits before storage so bad data never gets in.',
        },
        {
          kind: 'concept',
          title: 'Build it, save it, send it back',
          body: 'The server chooses the id: one more than the number of notes so far. It builds the new dict, appends it to the list, and returns it with `201`.\n\n`.strip()` trims spaces from both ends, so text made only of spaces becomes empty.',
          code: r`NOTES = [{"id": 1, "text": "Hi"}]

def add_note(text):
    note = {"id": len(NOTES) + 1, "text": text.strip()}
    NOTES.append(note)
    return (201, note)

print(add_note("  Bye "))
print(len(NOTES))`,
          language: 'python',
          output: r`(201, {'id': 2, 'text': 'Bye'})
2`,
        },
        {
          kind: 'write',
          prompt: 'Add "create a task". For `POST /tasks`: if the body has no `"title"`, or the title is empty after `.strip()`, return `(422, {"error": "title is required"})`. Otherwise make `{"id": ..., "title": ...}` with an id one bigger than the number of tasks, append it to `TASKS`, and return `(201, the new task)`.',
          language: 'python',
          starter: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}]

def handle(method, path, body):
    if method == "POST" and path == "/tasks":
        # 1. Validate the title.
        # 2. Build the new task, save it, return it.
        return (201, body)
    return (404, {"error": "not found"})

for body in [{"title": "Call Sam"}, {"title": "   "}, {}, {"title": "Pay rent"}]:
    status, result = handle("POST", "/tasks", body)
    print(status, json.dumps(result, sort_keys=True))
print(len(TASKS))
`,
          tests: [
            {
              expected:
                '201 {"id": 2, "title": "Call Sam"}\n422 {"error": "title is required"}\n422 {"error": "title is required"}\n201 {"id": 3, "title": "Pay rent"}\n3',
            },
          ],
          hint: '`title = body.get("title", "").strip()` then `if not title:` return the 422 pair. The new id is `len(TASKS) + 1`.',
          solution: r`import json

TASKS = [{"id": 1, "title": "Buy milk"}]

def handle(method, path, body):
    if method == "POST" and path == "/tasks":
        title = body.get("title", "").strip()
        if not title:
            return (422, {"error": "title is required"})
        task = {"id": len(TASKS) + 1, "title": title}
        TASKS.append(task)
        return (201, task)
    return (404, {"error": "not found"})

for body in [{"title": "Call Sam"}, {"title": "   "}, {}, {"title": "Pay rent"}]:
    status, result = handle("POST", "/tasks", body)
    print(status, json.dumps(result, sort_keys=True))
print(len(TASKS))
`,
          explain: 'The server picks the id, not the client. Bad bodies are turned away before anything is saved.',
        },
        {
          kind: 'type',
          prompt: 'In the API you just built, a client sends `{"title": ""}` to `POST /tasks`. Which status code comes back? Type the number.',
          accept: ['422'],
          explain: 'The JSON is readable but the value is not acceptable, which is what 422 means.',
        },
        {
          kind: 'choice',
          prompt: 'A request body arrives as `{"title": "Buy mi` and stops there. Which status code fits best?',
          options: ['422, because the title is too short', '400, because the body is not valid JSON', '404, because the task was not found', '201, because part of a title arrived'],
          answer: 1,
          explain: 'The server cannot even read the body, so it is a 400. 422 is for bodies that parse fine but hold bad values.',
        },
      ],
    },
    {
      id: 'u20-auth',
      title: 'Tokens and permissions',
      exercises: [
        {
          kind: 'concept',
          title: 'Who are you? What may you do?',
          body: '**Authentication** answers "who are you?". **Authorisation** answers "what may you do?".\n\nAn API has no login page. Instead the client sends a **token**, a long secret string, with every request, in a header.\n\nNo valid token: `401`. Valid token, but not allowed: `403`.',
          code: 'GET /tasks\nAuthorization: Bearer 8f3a...c21',
        },
        {
          kind: 'match',
          prompt: 'Match each term to its plain meaning.',
          pairs: [
            ['API key', 'A long-lived secret that identifies an app'],
            ['Bearer token', 'Whoever carries it is let in'],
            ['JWT', 'A token with signed facts inside, like user id and expiry'],
            ['OAuth', 'Sign in through another service without sharing your password'],
          ],
          explain: 'They are all ways to prove who is calling. "Bearer" just means "the one carrying it", like a cinema ticket.',
        },
        {
          kind: 'concept',
          title: 'Inside a JWT',
          body: 'A **JWT** (JSON Web Token) has three parts: a header, a **payload** and a **signature**.\n\nThe payload holds facts such as the user id and when the token expires. Anyone can read it, so never put secrets there.\n\nThe signature is made with a key only the server has. Change one letter of the payload and it no longer matches.',
        },
        {
          kind: 'choice',
          prompt: 'A user edits their JWT payload to say `"role": "admin"`. Why does the server reject it?',
          options: [
            'The payload is encrypted, so it cannot be edited',
            'JWTs can only be used once',
            'The signature no longer matches the changed payload',
            'The server keeps a copy of every payload',
          ],
          answer: 2,
          explain: 'The signature was made from the original payload with the server\'s secret key. Without that key, nobody can make a matching one.',
        },
        {
          kind: 'steps',
          prompt: 'Ana\'s token is valid. Tap the status code each request gets.',
          cells: ['204', '401', '403', '404'],
          steps: [
            { ask: 'A request arrives with no Authorization header.', answer: 1 },
            { ask: 'A request arrives with a token the server has never seen.', answer: 1 },
            { ask: 'Ana asks to delete a task that belongs to Ben.', answer: 2 },
            { ask: 'Ana asks to delete task 99, which does not exist.', answer: 3 },
            { ask: 'Ana deletes her own task.', answer: 0 },
          ],
          explain: 'First "who are you?" (401), then "does it exist?" (404), then "is it yours?" (403). Only then does the delete happen.',
        },
        {
          kind: 'concept',
          title: 'Looking up a token',
          body: 'Keep the known tokens in a dict: token in, user name out.\n\n`.get` gives `None` for a token that is not there, and also when no token was sent at all. So one `is None` check covers both.',
          code: r`KEYS = {"key-1": "lee", "key-2": "mia"}

def who(key):
    user = KEYS.get(key)
    if user is None:
        return "stranger"
    return user

print(who("key-2"))
print(who("key-9"))
print(who(None))`,
          language: 'python',
          output: r`mia
stranger
stranger`,
        },
        {
          kind: 'write',
          prompt: 'Write `check(token, owner)`. Return `401` if the token is not in `TOKENS`. Return `403` if the token\'s user is not the `owner`. Otherwise return `200`.',
          language: 'python',
          starter: r`TOKENS = {"tok-ana": "ana", "tok-ben": "ben"}

def check(token, owner):
    return 200

print(check(None, "ana"))
print(check("tok-zzz", "ana"))
print(check("tok-ben", "ana"))
print(check("tok-ana", "ana"))
`,
          tests: [{ expected: '401\n401\n403\n200' }],
          hint: '`user = TOKENS.get(token)` gives None for a missing or unknown token. Check that first, then compare `user` with `owner`.',
          solution: r`TOKENS = {"tok-ana": "ana", "tok-ben": "ben"}

def check(token, owner):
    user = TOKENS.get(token)
    if user is None:
        return 401
    if user != owner:
        return 403
    return 200

print(check(None, "ana"))
print(check("tok-zzz", "ana"))
print(check("tok-ben", "ana"))
print(check("tok-ana", "ana"))
`,
          explain: 'Authentication comes first: you cannot decide what someone may do until you know who they are.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line that returns the wrong status code.',
          lines: [
            'def delete_task(token, task):',
            '    user = TOKENS.get(token)',
            '    if user is None:',
            '        return (403, {"error": "sign in first"})',
            '    if task["owner"] != user:',
            '        return (403, {"error": "not your task"})',
            '    return (204, None)',
          ],
          language: 'python',
          answer: 3,
          explain: 'An unknown caller gets 401. That tells the client to sign in again, while 403 says signing in will not help.',
        },
        {
          kind: 'concept',
          title: 'Find it, then remove it',
          body: 'To delete from a list of dicts, first find the right one and keep it in a variable that starts as `None`.\n\nStill `None` after the loop? Nothing matched. Otherwise `.remove(found)` takes it out of the list.',
          code: r`PETS = [{"id": 1, "name": "Rex"}, {"id": 2, "name": "Tom"}]

found = None
for pet in PETS:
    if pet["id"] == 2:
        found = pet
print(found)
PETS.remove(found)
print(PETS)`,
          language: 'python',
          output: r`{'id': 2, 'name': 'Tom'}
[{'id': 1, 'name': 'Rex'}]`,
        },
        {
          kind: 'write',
          prompt: 'Add "delete a task" with a token check. For `DELETE /tasks/ID`, in this order: `(401, {"error": "sign in first"})` if the token is unknown; `(404, {"error": "task not found"})` if no task has that id; `(403, {"error": "not your task"})` if the owner is someone else; otherwise remove the task and return `(204, None)`.',
          language: 'python',
          starter: r`TASKS = [
    {"id": 1, "title": "Buy milk", "owner": "ana"},
    {"id": 2, "title": "Call Sam", "owner": "ben"},
]
TOKENS = {"tok-ana": "ana", "tok-ben": "ben"}

def handle(method, path, body, token):
    if method == "DELETE" and path.startswith("/tasks/"):
        task_id = int(path.split("/")[2])
        user = TOKENS.get(token)
        # 401, then 404, then 403, then delete.
        return (204, None)
    return (404, {"error": "not found"})

print(handle("DELETE", "/tasks/1", None, None)[0])
print(handle("DELETE", "/tasks/9", None, "tok-ana")[0])
print(handle("DELETE", "/tasks/2", None, "tok-ana")[0])
print(handle("DELETE", "/tasks/1", None, "tok-ana")[0])
print([task["id"] for task in TASKS])
`,
          tests: [{ expected: '401\n404\n403\n204\n[2]' }],
          hint: 'Find the task with a loop and keep it in a variable that starts as None. `TASKS.remove(task)` deletes it from the list.',
          solution: r`TASKS = [
    {"id": 1, "title": "Buy milk", "owner": "ana"},
    {"id": 2, "title": "Call Sam", "owner": "ben"},
]
TOKENS = {"tok-ana": "ana", "tok-ben": "ben"}

def handle(method, path, body, token):
    if method == "DELETE" and path.startswith("/tasks/"):
        task_id = int(path.split("/")[2])
        user = TOKENS.get(token)
        if user is None:
            return (401, {"error": "sign in first"})
        found = None
        for task in TASKS:
            if task["id"] == task_id:
                found = task
        if found is None:
            return (404, {"error": "task not found"})
        if found["owner"] != user:
            return (403, {"error": "not your task"})
        TASKS.remove(found)
        return (204, None)
    return (404, {"error": "not found"})

print(handle("DELETE", "/tasks/1", None, None)[0])
print(handle("DELETE", "/tasks/9", None, "tok-ana")[0])
print(handle("DELETE", "/tasks/2", None, "tok-ana")[0])
print(handle("DELETE", "/tasks/1", None, "tok-ana")[0])
print([task["id"] for task in TASKS])
`,
          explain: 'Each check guards the next step. Only a known user, asking about a real task they own, reaches the delete.',
        },
        {
          kind: 'type',
          prompt: 'You are signed in with a valid token, but you try to read another customer\'s invoice. Which status code should you get? Type the number.',
          accept: ['403'],
          explain: 'The server knows who you are, so it is not 401. You are simply not allowed: 403 Forbidden.',
        },
        {
          kind: 'choice',
          prompt: 'You tap "Sign in with your email provider" on a new app. With OAuth, what does the new app receive?',
          options: [
            'Your email password, so it can log in as you',
            'A token from the provider that proves who you are',
            'A copy of every email in your inbox',
            'Nothing; it just trusts whatever name you type',
          ],
          answer: 1,
          explain: 'You type your password only on the provider\'s own page. The app gets a limited token, which you can cancel later without changing your password.',
        },
      ],
    },
    {
      id: 'u20-growing',
      title: 'Pages, versions and limits',
      exercises: [
        {
          kind: 'concept',
          title: 'Pagination',
          body: 'Sending 50,000 tasks in one response is slow for everyone. **Pagination** sends a list in pages, like a book.\n\nThe client asks with the query string: `GET /tasks?page=2&per_page=20`. A good response also says how many items and pages there are in total, so the client knows when to stop.',
        },
        {
          kind: 'concept',
          title: 'Rounding up',
          body: 'Seven items at two per page do not fit in 3.5 pages: the last one still needs a page of its own.\n\n`math.ceil` rounds any fraction **up** to the next whole number. A whole number stays as it is.',
          code: r`import math

print(7 / 2)
print(math.ceil(7 / 2))
print(math.ceil(8 / 2))`,
          language: 'python',
          output: r`3.5
4
4`,
        },
        {
          kind: 'type',
          prompt: 'There are 45 tasks and `per_page` is 20. How many pages are there? Type the number.',
          accept: ['3', 'three'],
          explain: 'Pages 1 and 2 hold 20 each, and page 3 holds the last 5. Always round up.',
        },
        {
          kind: 'concept',
          title: 'Cutting out one page',
          body: 'A page is a slice of the list. Page 1 starts at index 0, so the start is `(page - 1) * per_page`, and the slice runs for `per_page` items.\n\nHere is page 2, with 2 per page.',
          code: r`days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
page = 2
per_page = 2
start = (page - 1) * per_page
print(start)
print(days[start:start + per_page])`,
          language: 'python',
          output: r`2
['Wed', 'Thu']`,
        },
        {
          kind: 'write',
          prompt: 'Write `paginate(items, page, per_page)`. Return a dict with `"items"` (just that page\'s slice), `"page"`, `"pages"` (total pages, rounded up) and `"total"` (how many items in all). Page 1 is the first page.',
          language: 'python',
          starter: r`import json
import math

def paginate(items, page, per_page):
    return {"items": items, "page": page, "pages": 1, "total": len(items)}

letters = ["a", "b", "c", "d", "e", "f", "g"]
page, per_page = input().split()
print(json.dumps(paginate(letters, int(page), int(per_page)), sort_keys=True))
`,
          tests: [
            { stdin: ['1 3'], expected: '{"items": ["a", "b", "c"], "page": 1, "pages": 3, "total": 7}' },
            { stdin: ['3 3'], expected: '{"items": ["g"], "page": 3, "pages": 3, "total": 7}' },
            { stdin: ['2 5'], expected: '{"items": ["f", "g"], "page": 2, "pages": 2, "total": 7}' },
          ],
          hint: 'The slice starts at `(page - 1) * per_page` and is `per_page` long. Total pages is `math.ceil(len(items) / per_page)`.',
          solution: r`import json
import math

def paginate(items, page, per_page):
    start = (page - 1) * per_page
    return {
        "items": items[start:start + per_page],
        "page": page,
        "pages": math.ceil(len(items) / per_page),
        "total": len(items),
    }

letters = ["a", "b", "c", "d", "e", "f", "g"]
page, per_page = input().split()
print(json.dumps(paginate(letters, int(page), int(per_page)), sort_keys=True))
`,
          explain: 'Page 1 starts at index 0, so you subtract one before multiplying. A slice past the end is simply shorter, never an error.',
        },
        {
          kind: 'concept',
          title: 'Filtering',
          body: 'The query string can also narrow a list: `GET /tasks?done=true` asks for finished tasks only.\n\nThe resource is still `/tasks`. The filter just trims what comes back.\n\nRemember that query values arrive as text. `"true"` is a string, not the Python value `True`.',
        },
        {
          kind: 'concept',
          title: 'Text to bool, then filter',
          body: 'Turn the query text into a real bool once: `text == "true"` is `True` only for that exact word.\n\nThen keep the items whose value equals it.',
          code: r`PETS = [{"name": "Rex", "fed": True}, {"name": "Tom", "fed": False}]

text = "false"
wanted = text == "true"
print(wanted)
for pet in PETS:
    if pet["fed"] == wanted:
        print(pet["name"])`,
          language: 'python',
          output: r`False
Tom`,
        },
        {
          kind: 'write',
          prompt: 'Finish `list_tasks(query)`. `query` is a dict of text values. If it has `"done"`, return only the tasks whose `done` matches (`"true"` means True, anything else means False). With no `"done"` key, return every task.',
          language: 'python',
          starter: r`TASKS = [
    {"title": "Buy milk", "done": True},
    {"title": "Call Sam", "done": False},
    {"title": "Pay rent", "done": True},
    {"title": "Fix bike", "done": False},
]

def list_tasks(query):
    return TASKS

text = input()          # "done=true", "done=false" or an empty line
query = {}
if text:
    key, value = text.split("=")
    query[key] = value
for task in list_tasks(query):
    print(task["title"])
`,
          tests: [
            { stdin: ['done=true'], expected: 'Buy milk\nPay rent' },
            { stdin: ['done=false'], expected: 'Call Sam\nFix bike' },
            { stdin: [''], expected: 'Buy milk\nCall Sam\nPay rent\nFix bike' },
          ],
          hint: 'Turn the text into a bool first: `wanted = query["done"] == "true"`. Then keep the tasks where `task["done"] == wanted`.',
          solution: r`TASKS = [
    {"title": "Buy milk", "done": True},
    {"title": "Call Sam", "done": False},
    {"title": "Pay rent", "done": True},
    {"title": "Fix bike", "done": False},
]

def list_tasks(query):
    if "done" not in query:
        return TASKS
    wanted = query["done"] == "true"
    return [task for task in TASKS if task["done"] == wanted]

text = input()          # "done=true", "done=false" or an empty line
query = {}
if text:
    key, value = text.split("=")
    query[key] = value
for task in list_tasks(query):
    print(task["title"])
`,
          explain: 'Converting the text to a real bool once keeps the comparison simple. Comparing `True` with `"true"` directly would never match.',
        },
        {
          kind: 'concept',
          title: 'Versions and rate limits',
          body: 'A **breaking change** makes existing clients fail, like renaming a field. Put it in a new **version**, such as `/v2/tasks`, and keep `/v1` working.\n\nA **rate limit** caps how many requests one client may send in a time window. Go over it and you get `429` Too Many Requests. It protects the server from one greedy or buggy client.',
        },
        {
          kind: 'spot',
          prompt: 'Three of these changes are safe for existing clients. Tap the breaking change.',
          lines: [
            'Add a new optional field "due" to each task',
            'Add a new endpoint: GET /tags',
            'Rename the field "title" to "name"',
            'Add an optional filter: ?sort=title',
          ],
          answer: 2,
          explain: 'Every client reading `title` would suddenly find nothing. Adding things is safe; renaming or removing them needs a new version.',
        },
        {
          kind: 'steps',
          prompt: 'This API allows 3 requests per minute for each token. Tap the response each request gets.',
          cells: ['200 OK', '401 Unauthorized', '429 Too Many Requests'],
          steps: [
            { ask: 'Request 1 this minute, with a valid token.', answer: 0 },
            { ask: 'Request 3 in the same minute.', answer: 0 },
            { ask: 'Request 4 in the same minute.', answer: 2 },
            { ask: 'A new minute begins. The next request?', answer: 0 },
          ],
          explain: 'The count resets when the window ends. A polite client waits and tries again instead of hammering the server.',
        },
        {
          kind: 'choice',
          prompt: 'You are writing the documentation for `POST /tasks`. What helps another developer most?',
          options: [
            'A paragraph on why you chose Python',
            'The method and path, required fields, an example request and response, and the possible error codes',
            'A list of the server\'s internal function names',
            'Only the words "creates a task"',
          ],
          answer: 1,
          explain: 'Documentation is the contract written down. A copy-and-paste example plus the errors to expect gets someone working in minutes.',
        },
      ],
    },
  ],
}
