import type { Unit } from '../types'

export const u13: Unit = {
  id: 'u13',
  week: 12,
  title: 'Systems design',
  summary: 'How big apps stay fast and stay up',
  lessons: [
    {
      id: 'u13-one-server',
      title: 'One server, many users',
      exercises: [
        {
          kind: 'concept',
          title: 'One kitchen, many diners',
          body: 'Your web app is a **server**: a computer that waits for requests. Each browser or phone asking is a **client**.\n\nThink of a small kitchen. Every order takes the cook some **time** and some counter space (**memory**). One diner is easy. A thousand at once is a queue out the door.',
        },
        {
          kind: 'choice',
          prompt: 'Your app runs on one server. It was quick with 10 users and is slow with 10,000. What is the most likely reason?',
          options: [
            'The code got older',
            'Each request uses time and memory, and they are piling up',
            'Browsers slow down when a site is popular',
            'The server forgot how to answer',
          ],
          answer: 1,
          explain: 'Every request costs a little time and memory. With enough requests at once, they wait in line for the same machine.',
        },
        {
          kind: 'concept',
          title: 'Two ways to measure speed',
          body: '**Latency** is how long one request takes. In a café, it is your wait for one coffee.\n\n**Throughput** is how many requests get done per second. It is how many coffees the café serves in an hour.\n\nThe slowest part of a system, the one holding everything else up, is the **bottleneck**.',
        },
        {
          kind: 'type',
          prompt: 'A server handles one request at a time. Each takes a tenth of a second. How many requests can it finish per second? Type the number.',
          accept: ['10', 'ten', '10 per second'],
          explain: 'Ten tenths fit in one second. The latency is 0.1 seconds and the throughput is 10 requests per second.',
        },
        {
          kind: 'steps',
          prompt: 'One page load passes through these four parts. The time each part takes is shown. Tap the right box for each question.',
          cells: ['Network: 20 ms', 'App code: 30 ms', 'Database: 400 ms', 'Build page: 10 ms'],
          steps: [
            { ask: 'Which part is the bottleneck?', answer: 2 },
            { ask: 'You can speed up only one part this week. Which one helps most?', answer: 2 },
            { ask: 'You fix it: the database now takes 5 ms. Which part is the bottleneck now?', answer: 1 },
          ],
          explain: 'Fix the slowest part first: nothing else changes the total much. Once it is fixed, a different part becomes the bottleneck.',
        },
        {
          kind: 'concept',
          title: 'Bigger, or more?',
          body: '**Vertical scaling** means swapping your server for a bigger one: more memory, a faster processor. It is simple, but the biggest machine has a limit and a big price.\n\n**Horizontal scaling** means adding more servers side by side. Like opening more checkouts, not hiring one very fast cashier.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Latency', 'How long one request takes'],
            ['Throughput', 'Requests finished per second'],
            ['Bottleneck', 'The slowest part, holding up the rest'],
            ['Vertical scaling', 'One bigger machine'],
            ['Horizontal scaling', 'More machines side by side'],
          ],
          explain: 'You measure with latency and throughput, hunt for the bottleneck, then scale up (bigger) or out (more).',
        },
        {
          kind: 'spot',
          prompt: 'This rough estimate should give requests per second, but one line is wrong. Tap it.',
          lines: [
            'users = 500000',
            'requests_each = 10',
            'per_day = users * requests_each',
            'seconds_per_day = 24 * 60',
            'print(per_day // seconds_per_day)',
          ],
          language: 'python',
          answer: 3,
          explain: '24 × 60 is the number of minutes in a day. Seconds need one more × 60, which gives 86,400.',
        },
        {
          kind: 'concept',
          title: 'A rough estimate',
          body: 'A quick sum with round numbers tells you roughly how busy a server will be. A day has 24 × 60 × 60 = 86,400 seconds.\n\n`//` divides and drops the remainder, so 172,800 visits a day is about 2 a second.',
          code: `visits = 172800
seconds_per_day = 24 * 60 * 60
print(seconds_per_day)
print(visits // seconds_per_day)`,
          language: 'python',
          output: '86400\n2',
        },
        {
          kind: 'write',
          prompt: 'Read the number of daily users, then how many requests each user makes per day. Print the average requests per second as a whole number. A day has 86400 seconds.',
          language: 'python',
          starter: 'users = int(input())\nrequests_each = int(input())\nper_day = users * requests_each\nprint(per_day)\n',
          tests: [
            { stdin: ['86400', '10'], expected: '10' },
            { stdin: ['1000000', '20'], expected: '231' },
            { stdin: ['500000', '5'], expected: '28' },
          ],
          hint: 'Divide the daily total by 86400 with whole-number division: per_day // 86400.',
          solution: 'users = int(input())\nrequests_each = int(input())\nper_day = users * requests_each\nprint(per_day // 86400)\n',
          explain: 'A million users sounds huge, but it is only about 231 requests per second on average. Rough sums like this tell you how much machine you need.',
        },
        {
          kind: 'concept',
          title: 'Rounding up',
          body: '`//` rounds down, but leftovers still need a box. `%` gives the remainder: what is left after dividing. If it is more than 0, add one more.\n\n14 eggs fill 2 boxes of 6 with 2 left over, so you need 3.',
          code: `eggs = 14
per_box = 6
boxes = eggs // per_box
if eggs % per_box > 0:
    boxes += 1
print(boxes)`,
          language: 'python',
          output: '3',
        },
        {
          kind: 'write',
          prompt: 'Read the requests per second your app gets, then how many requests per second one server can handle. Print how many servers you need. Round up: half a server does not exist.',
          language: 'python',
          starter: 'requests = int(input())\ncapacity = int(input())\nservers = requests // capacity\nprint(servers)\n',
          tests: [
            { stdin: ['1000', '300'], expected: '4' },
            { stdin: ['900', '300'], expected: '3' },
            { stdin: ['50', '300'], expected: '1' },
          ],
          hint: 'After the division, check the remainder: if requests % capacity > 0, add 1 to servers.',
          solution:
            'requests = int(input())\ncapacity = int(input())\nservers = requests // capacity\nif requests % capacity > 0:\n    servers += 1\nprint(servers)\n',
          explain: 'Three servers handle 900 requests, so the last 100 need a fourth. Leftover work always needs one more machine.',
        },
      ],
    },
    {
      id: 'u13-load',
      title: 'Sharing the load',
      exercises: [
        {
          kind: 'concept',
          title: 'The load balancer',
          body: 'With many servers, who decides which one answers? A **load balancer**. It sits in front, takes every request and passes it to one server. Like a host seating diners at different tables.\n\nThe simplest rule is **round robin**: take turns. A, B, C, then A again.',
        },
        {
          kind: 'steps',
          prompt: 'The load balancer uses round robin, starting with Server A. Tap the server that gets each request.',
          cells: ['Server A', 'Server B', 'Server C'],
          steps: [
            { ask: 'Request 1 arrives. Who gets it?', answer: 0 },
            { ask: 'Request 2?', answer: 1 },
            { ask: 'Request 3?', answer: 2 },
            { ask: 'Request 4?', answer: 0 },
          ],
          explain: 'Round robin just takes turns. After the last server, it wraps around to the first.',
        },
        {
          kind: 'concept',
          title: 'Taking turns with a remainder',
          body: 'The remainder `%` wraps a growing count back to the start: `i % 3` goes 0, 1, 2, then 0 again. Use it as a position in a list and the list takes turns for ever.',
          code: `days = ["Mon", "Tue", "Wed"]
for i in range(5):
    print(i % 3, days[i % 3])`,
          language: 'python',
          output: '0 Mon\n1 Tue\n2 Wed\n0 Mon\n1 Tue',
        },
        {
          kind: 'blank',
          prompt: 'Request number `i` should go to the next server in turn, wrapping back to the start. Fill the gap.',
          code: 'servers = ["A", "B", "C"]\nchosen = servers[i ___ len(servers)]',
          language: 'python',
          bank: ['%', '//', '+', '*'],
          answers: ['%'],
          explain: 'The remainder of i divided by 3 goes 0, 1, 2, 0, 1, 2 and so on. That is exactly taking turns.',
        },
        {
          kind: 'write',
          prompt: 'Read how many requests arrive. For each request, print the server that gets it, one per line. Take turns through `servers`, starting with A.',
          language: 'python',
          starter: 'servers = ["A", "B", "C"]\ncount = int(input())\nfor i in range(count):\n    print(servers[0])\n',
          tests: [
            { stdin: ['4'], expected: 'A\nB\nC\nA' },
            { stdin: ['7'], expected: 'A\nB\nC\nA\nB\nC\nA' },
          ],
          hint: 'Use the remainder to wrap around: servers[i % len(servers)].',
          solution: 'servers = ["A", "B", "C"]\ncount = int(input())\nfor i in range(count):\n    print(servers[i % len(servers)])\n',
          explain: 'You just wrote a round-robin load balancer. Real ones do the same thing, only with network addresses in the list.',
        },
        {
          kind: 'concept',
          title: 'Smarter picking',
          body: 'Some requests are slow, so taking turns can overload one server. **Least busy** sends each request to the server with the fewest requests in progress.\n\nThe load balancer also runs **health checks**: every few seconds it asks each server "are you there?". A server that stops replying gets no more requests.',
        },
        {
          kind: 'concept',
          title: 'Best so far, in a dict',
          body: 'Looping over a dict gives each key. Keep a best-so-far key, and swap it whenever another key\'s value beats it.\n\nHere the biggest wins. For the smallest, turn the comparison round.',
          code: `heights = {"Ada": 150, "Bo": 172, "Cy": 165}
tallest = "Ada"
for name in heights:
    if heights[name] > heights[tallest]:
        tallest = name
print(tallest)`,
          language: 'python',
          output: 'Bo',
        },
        {
          kind: 'write',
          prompt: 'Read three numbers: the requests in progress on servers A, B and C. Print the name of the least busy server. If there is a tie, print the one that comes first.',
          language: 'python',
          starter:
            'active = {"A": int(input()), "B": int(input()), "C": int(input())}\nbest = "A"\nfor name in active:\n    pass  # make best the name with the smallest number\nprint(best)\n',
          tests: [
            { stdin: ['4', '1', '3'], expected: 'B' },
            { stdin: ['2', '5', '0'], expected: 'C' },
            { stdin: ['3', '3', '7'], expected: 'A' },
          ],
          hint: 'Inside the loop: if active[name] < active[best], set best = name.',
          solution:
            'active = {"A": int(input()), "B": int(input()), "C": int(input())}\nbest = "A"\nfor name in active:\n    if active[name] < active[best]:\n        best = name\nprint(best)\n',
          explain: 'Using `<` and not `<=` keeps the first server when two are tied. The busy server gets a rest while the idle one takes the work.',
        },
        {
          kind: 'spot',
          prompt: 'These are the latest health check results. Tap the server the load balancer should stop sending requests to.',
          lines: [
            'Server A: replied in 40 ms',
            'Server B: replied in 55 ms',
            'Server C: no reply after 3 tries',
            'Server D: replied in 38 ms',
          ],
          answer: 2,
          explain: 'A server that does not answer its health check is treated as down. The others share its work until it replies again.',
        },
        {
          kind: 'concept',
          title: 'Servers that forget',
          body: 'Remember **sessions**: the server remembering who is logged in. If Server A keeps your session in its own memory, Server B has never heard of you.\n\nThe fix: keep sessions in one **shared store** that every server can read. Servers that keep nothing to themselves are called **stateless**, and any of them can answer anyone.',
        },
        {
          kind: 'steps',
          prompt: 'You log in to a site with two servers. Tap the right box for each question.',
          cells: ['Server A', 'Server B', 'Shared session store'],
          steps: [
            { ask: 'Server A handles your login and keeps the session in its own memory. Which box knows you are logged in?', answer: 0 },
            { ask: 'Your next click is sent to the other server, and you are asked to log in again. Which server did not know you?', answer: 1 },
            { ask: 'Where should sessions live so that either server can find them?', answer: 2 },
          ],
          explain: 'A session kept on one server is invisible to the rest. A shared store lets every server look up the same session.',
        },
        {
          kind: 'choice',
          prompt: 'Your servers are stateless and sessions live in a shared store. Server A crashes while you are shopping. What happens to you?',
          options: [
            'Your basket is lost and you must log in again',
            'The whole site goes down until A is repaired',
            'Your next request goes to another server and you carry on',
            'You are moved to a slower version of the site',
          ],
          answer: 2,
          explain: 'Nothing about you lived on Server A. The health check removes A, and any other server can read your session from the shared store.',
        },
      ],
    },
    {
      id: 'u13-cache',
      title: 'Caching and delivery',
      exercises: [
        {
          kind: 'concept',
          title: 'A shortcut for repeated work',
          body: 'A **cache** is a small, fast place to keep answers you already worked out. Like a sticky note by the phone, so you do not look up the same number twice.\n\nIf the answer is in the cache, that is a **hit**: fast. If not, a **miss**: do the slow work, then save the answer.',
        },
        {
          kind: 'steps',
          prompt: 'The cache starts empty. After every miss, the answer is saved in it. The app server asks for each profile. Tap where the answer comes from.',
          cells: ['App server', 'Cache', 'Database'],
          steps: [
            { ask: 'Someone asks for the profile of user 7.', answer: 2 },
            { ask: 'Someone asks for user 7 again.', answer: 1 },
            { ask: 'Now a request for user 9.', answer: 2 },
            { ask: 'User 9 again.', answer: 1 },
          ],
          explain: 'The first request for anything is a miss and goes to the database. Repeats are hits and never touch it.',
        },
        {
          kind: 'type',
          prompt: 'A cache starts empty and never fills up. Requests arrive for: a, b, a, c, a, b. How many are misses? Type the number.',
          accept: ['3', 'three'],
          explain: 'Only the first request for a, b and c misses. The other three requests are hits.',
        },
        {
          kind: 'concept',
          title: 'Look before you work',
          body: '`key in some_dict` asks whether a key is already stored. Check first. If it is missing, do the work and store it, so the next check finds it.',
          code: `seen = {}
for word in ["hi", "yo", "hi"]:
    if word in seen:
        print(word, "seen before")
    else:
        print(word, "new")
        seen[word] = True`,
          language: 'python',
          output: 'hi new\nyo new\nhi seen before',
        },
        {
          kind: 'write',
          prompt: 'Read one line of keys separated by spaces. For each key: if it is already in `cache`, count a hit. If not, count a miss and save it in `cache`. Print `hits` and the number, then `misses` and the number on a second line.',
          language: 'python',
          starter:
            'keys = input().split()\ncache = {}\nhits = 0\nmisses = 0\nfor key in keys:\n    misses += 1\n    cache[key] = key.upper()  # pretend this is slow work\nprint("hits", hits)\nprint("misses", misses)\n',
          tests: [
            { stdin: ['a b a c a b'], expected: 'hits 3\nmisses 3' },
            { stdin: ['x x x x'], expected: 'hits 3\nmisses 1' },
            { stdin: ['p q r'], expected: 'hits 0\nmisses 3' },
          ],
          hint: 'Check first with `if key in cache:` and add 1 to hits. Put the miss lines under `else:`.',
          solution:
            'keys = input().split()\ncache = {}\nhits = 0\nmisses = 0\nfor key in keys:\n    if key in cache:\n        hits += 1\n    else:\n        misses += 1\n        cache[key] = key.upper()  # pretend this is slow work\nprint("hits", hits)\nprint("misses", misses)\n',
          explain: 'A dict makes a fine cache: looking up a key is fast. Every hit is slow work you did not have to repeat.',
        },
        {
          kind: 'concept',
          title: 'Old answers and full caches',
          body: 'A saved answer can go **stale**: out of date. So each entry gets a **TTL** (time to live), say 60 seconds. After that it is thrown away and fetched fresh.\n\nA cache is also small. When it is full, it **evicts** (removes) something, often the **least recently used** entry, or LRU.',
        },
        {
          kind: 'choice',
          prompt: 'A shop caches each price with a TTL of 60 seconds. The owner changes a price in the database. What can a shopper see?',
          options: [
            'The old price for up to 60 seconds, then the new one',
            'The old price forever',
            'An error until the cache is restarted',
            'The new price at once, every time',
          ],
          answer: 0,
          explain: 'Until the entry expires, the cache keeps serving its stale copy. A shorter TTL means fresher data but more misses.',
        },
        {
          kind: 'steps',
          prompt: 'A cache holds 3 items and evicts the least recently used. It holds A, B and C, used in this order: A, B, C, then A again.',
          cells: ['A', 'B', 'C', 'D'],
          steps: [
            { ask: 'D arrives and the cache is full. Which item is evicted?', answer: 1 },
            { ask: 'The cache now holds A, C and D. Then C is read. Which item was used longest ago?', answer: 0 },
            { ask: 'E arrives. Which item is evicted?', answer: 0 },
          ],
          explain: 'Reading an item counts as using it, so it moves to the back of the line. The item untouched for longest leaves first.',
        },
        {
          kind: 'concept',
          title: 'Moving to the back of the line',
          body: '`.remove(x)` takes `x` out of a list and `.append(x)` puts it at the end. Together they move it to the back.\n\n`.pop(0)` removes whatever is at the front.',
          code: `line = ["a", "b", "c"]
line.remove("a")
line.append("a")
print(line)
line.pop(0)
print(line)`,
          language: 'python',
          output: "['b', 'c', 'a']\n['c', 'a']",
        },
        {
          kind: 'write',
          prompt: 'Build a tiny LRU cache that holds 2 keys. `cache` is a list with the least recently used key first. Read one line of keys. For each key: if it is in the cache, move it to the end. If not, evict the first key when the cache is full, then add the new key at the end. Print the final list.',
          language: 'python',
          starter:
            'keys = input().split()\ncapacity = 2\ncache = []\nfor key in keys:\n    if key in cache:\n        pass  # move key to the end\n    else:\n        if len(cache) == capacity:\n            cache.pop(0)\n        cache.append(key)\nprint(cache)\n',
          tests: [
            { stdin: ['a b a c'], expected: "['a', 'c']" },
            { stdin: ['a b c'], expected: "['b', 'c']" },
            { stdin: ['x y x y z x'], expected: "['z', 'x']" },
          ],
          hint: 'To move a key to the end: cache.remove(key), then cache.append(key).',
          solution:
            'keys = input().split()\ncapacity = 2\ncache = []\nfor key in keys:\n    if key in cache:\n        cache.remove(key)\n        cache.append(key)\n    else:\n        if len(cache) == capacity:\n            cache.pop(0)\n        cache.append(key)\nprint(cache)\n',
          explain: 'In the first test, reading `a` again saved it: `b` became the oldest and was evicted when `c` arrived.',
        },
        {
          kind: 'concept',
          title: 'Copies close to you',
          body: 'Distance costs time too. A photo stored on the other side of the world takes longer to arrive.\n\nA **CDN** (content delivery network) is a set of caches spread around the world. It keeps copies of files like images and videos, and each user gets them from the nearest one.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Hit', 'The answer was already saved'],
            ['Miss', 'Do the slow work, then save it'],
            ['TTL', 'How long an entry is kept'],
            ['Evict', 'Remove an entry to make room'],
            ['CDN', 'Copies of files near each user'],
          ],
          explain: 'Caches trade a little freshness for a lot of speed. A CDN is the same idea, spread across the map.',
        },
      ],
    },
    {
      id: 'u13-databases',
      title: 'Databases at scale',
      exercises: [
        {
          kind: 'concept',
          title: 'Everyone wants the database',
          body: 'You can add app servers all day, but they all talk to one database. It often becomes the bottleneck.\n\nFirst, make each query cheaper. Remember an **index**: like the index at the back of a book, it lets the database jump straight to the right rows without reading every one.',
        },
        {
          kind: 'choice',
          prompt: 'A table has 5 million users. Finding one by email takes 2 seconds. What should you try first?',
          options: [
            'Buy ten more app servers',
            'Delete the oldest users',
            'Ask users to log in less often',
            'Add an index on the email column',
          ],
          answer: 3,
          explain: 'Without an index the database reads every row. More app servers would only send the same slow query more often.',
        },
        {
          kind: 'concept',
          title: 'Copies for reading',
          body: 'Most apps read far more than they write. So keep one main database, the **primary**, for all writes. It copies every change to **read replicas**, which answer reads.\n\nCopying takes a moment. This delay is **replication lag**: right after a write, a replica may still show the old data.',
        },
        {
          kind: 'steps',
          prompt: 'This app sends writes to the primary and reads to the replicas, taking turns from Replica 1. Tap where each request goes.',
          cells: ['Primary', 'Replica 1', 'Replica 2'],
          steps: [
            { ask: 'A user posts a new comment.', answer: 0 },
            { ask: 'Someone opens the home page (a read).', answer: 1 },
            { ask: 'Someone else opens a profile (a read).', answer: 2 },
            { ask: 'A user changes their name.', answer: 0 },
            { ask: 'That change was made a split second ago. Which box is sure to have the new name already?', answer: 0 },
          ],
          explain: 'Writes have one home, the primary. Replicas share the reads but can be a moment behind, which is replication lag.',
        },
        {
          kind: 'concept',
          title: 'Turns for some, not for all',
          body: 'A shop has one post desk and two tills. Post always goes to the desk. Everything else takes the next till in turn.\n\nThe counter `turn` only moves when a till is used, so the tills share the work evenly.',
          code: `tills = ["till 1", "till 2"]
turn = 0
for item in ["bread", "post", "milk"]:
    if item == "post":
        print("post desk")
    else:
        print(tills[turn % 2])
        turn += 1`,
          language: 'python',
          output: 'till 1\npost desk\ntill 2',
        },
        {
          kind: 'write',
          prompt: 'Read one line of operations, each `read` or `write`, separated by spaces. For each one print where it goes: `primary` for a write, or for a read the next replica in turn, starting with `replica 1`.',
          language: 'python',
          starter:
            'ops = input().split()\nreplicas = ["replica 1", "replica 2"]\nreads = 0\nfor op in ops:\n    print("primary")\n',
          tests: [
            { stdin: ['read write read read'], expected: 'replica 1\nprimary\nreplica 2\nreplica 1' },
            { stdin: ['write write'], expected: 'primary\nprimary' },
            { stdin: ['read read read'], expected: 'replica 1\nreplica 2\nreplica 1' },
          ],
          hint: 'If op == "write", print "primary". Otherwise print replicas[reads % 2] and add 1 to reads.',
          solution:
            'ops = input().split()\nreplicas = ["replica 1", "replica 2"]\nreads = 0\nfor op in ops:\n    if op == "write":\n        print("primary")\n    else:\n        print(replicas[reads % 2])\n        reads += 1\n',
          explain: 'Only reads move the turn along, so the replicas share them evenly. It is round robin again, this time for databases.',
        },
        {
          kind: 'concept',
          title: 'Splitting the data',
          body: 'When the data itself is too big for one machine, split it. Each piece is a **shard**, on its own machine.\n\nYou need a rule that always sends the same user to the same shard. A simple one: the user id modulo the number of shards. `user_id % 4` gives 0, 1, 2 or 3.',
        },
        {
          kind: 'type',
          prompt: 'There are 4 shards and the rule is `user_id % 4`. Which shard holds user 14? Type the number.',
          accept: ['2', 'two', 'shard 2'],
          explain: '14 divided by 4 is 3 remainder 2. User 14 lives on shard 2, today and every day after.',
        },
        {
          kind: 'concept',
          title: 'Text into a number',
          body: '`ord` gives the number code of one character. Add the codes up and the same text always gives the same total. Then `%` turns that total into a shard number.',
          code: `print(ord("a"))
print(ord("b"))
print((ord("a") + ord("b")) % 4)`,
          language: 'python',
          output: '97\n98\n3',
        },
        {
          kind: 'write',
          prompt: 'Some ids are text, not numbers. Read the number of shards, then a username. Add up the character codes of the username with `ord`, and print that total modulo the number of shards.',
          language: 'python',
          starter: 'shards = int(input())\nname = input()\ntotal = 0\nfor ch in name:\n    total += 1\nprint(total % shards)\n',
          tests: [
            { stdin: ['4', 'ana'], expected: '0' },
            { stdin: ['4', 'kim'], expected: '1' },
            { stdin: ['5', 'bo'], expected: '4' },
          ],
          hint: 'ord(ch) gives the code of one character. Add ord(ch) to total, not 1.',
          solution: 'shards = int(input())\nname = input()\ntotal = 0\nfor ch in name:\n    total += ord(ch)\nprint(total % shards)\n',
          explain: 'The same name always gives the same total, so it always lands on the same shard. Python\'s built-in `hash()` would not work here: for text it changes every time the program starts.',
        },
        {
          kind: 'concept',
          title: 'Backups and simpler stores',
          body: 'A **backup** is a copy of the data saved somewhere else, on a schedule. If data is deleted by mistake, you restore it.\n\nNot all data needs SQL tables. A **key-value store** works like one giant dict: give a key, get a value. Fewer features, very fast. Good for sessions and caches.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Primary', 'The database that takes all writes'],
            ['Read replica', 'A copy that answers reads'],
            ['Replication lag', 'A copy is briefly behind'],
            ['Shard', 'One slice of the data on its own machine'],
            ['Key-value store', 'Like one giant dict'],
          ],
          explain: 'Replicas spread the reads, shards spread the data itself, and a key-value store handles the simple lookups.',
        },
      ],
    },
    {
      id: 'u13-failure',
      title: 'When things fail',
      exercises: [
        {
          kind: 'concept',
          title: 'Everything fails eventually',
          body: 'Disks wear out. Networks drop. With enough machines, something is broken every day.\n\nA **single point of failure** is a part with no spare: if it stops, everything stops. The cure is **redundancy**: keep a spare, like the spare tyre in a car.',
        },
        {
          kind: 'spot',
          prompt: 'Here is what one app runs on. Tap the single point of failure.',
          lines: [
            'Load balancers: 2',
            'App servers: 6',
            'Cache servers: 2',
            'Databases: 1, with no replica',
            'CDN locations: 30',
          ],
          answer: 3,
          explain: 'Every other part has a spare. If the one database stops, the whole app stops with it.',
        },
        {
          kind: 'concept',
          title: 'Wait, then try again',
          body: 'A **timeout** is a limit on waiting: no answer in 2 seconds? Stop waiting.\n\nThen **retry**: ask again. Many failures last only a moment. But do not hammer a struggling server. Wait longer before each new try: 1 second, then 2, then 4. That growing wait is called **backoff**.',
        },
        {
          kind: 'type',
          prompt: 'A retry waits 1 second, then 2, then 4, doubling each time. How many seconds does it wait before the next try? Type the number.',
          accept: ['8', 'eight', '8 seconds', '8s'],
          explain: 'Each wait is double the last, so 8 comes next. The server gets more and more breathing room to recover.',
        },
        {
          kind: 'concept',
          title: 'Do it later, and keep watch',
          body: 'A **queue** is a waiting line for jobs. Slow work, like sending emails, goes in the queue, and a **worker** does it later. A sudden rush just makes the line longer, not the site slower.\n\n**Monitoring** means watching numbers like latency and error counts. An **alert** messages a person when one looks wrong.',
        },
        {
          kind: 'choice',
          prompt: 'A hobby blog has 50 readers a day. A friend says it needs 10 servers in 3 countries so it never goes down. What is the best reply?',
          options: [
            'Yes: more servers are always better',
            'That costs far more than a short outage would. One server and a backup is enough for now',
            'No: redundancy never helps small sites or big ones',
            'Yes, but only if all 10 servers are in one room',
          ],
          answer: 1,
          explain: 'Speed, reliability and cost pull against each other. A good design spends where a failure would really hurt, and no more.',
        },
        {
          kind: 'order',
          prompt: 'Now design a photo-sharing app. Someone opens their feed. Put the journey in order.',
          lines: [
            'The phone sends a request for the feed',
            'The load balancer picks a healthy app server',
            'The app server looks for the feed in the cache',
            'On a miss, it reads the feed from a database replica',
            'The phone loads each photo from the nearest CDN copy',
          ],
          explain: 'Each piece removes one bottleneck: many servers, a cache for repeats, replicas for reads, and a CDN for the heavy photo files.',
        },
        {
          kind: 'match',
          prompt: 'Match each piece of the photo app to its job.',
          pairs: [
            ['Load balancer', 'Spreads requests across app servers'],
            ['Cache', 'Remembers popular feeds'],
            ['Database replica', 'Answers reads so the primary can write'],
            ['File storage and CDN', 'Holds photo files, serves nearby copies'],
            ['Queue', 'Holds resize jobs for later'],
          ],
          explain: 'Small facts like captions go in the database. Big files go in file storage. Slow jobs wait in the queue.',
        },
        {
          kind: 'steps',
          prompt: 'A user uploads a photo. Tap the piece that handles each part.',
          cells: ['Load balancer', 'App server', 'File storage', 'Primary database', 'Queue'],
          steps: [
            { ask: 'Which piece does the upload request reach first?', answer: 0 },
            { ask: 'Where is the photo file itself saved?', answer: 2 },
            { ask: 'Where are the caption and the name of the poster written?', answer: 3 },
            { ask: 'Making small preview sizes takes 5 seconds. Where does that job wait so the upload feels instant?', answer: 4 },
          ],
          explain: 'The user gets a quick "done" while a worker resizes the photo in the background. You just designed a real system.',
        },
        {
          kind: 'concept',
          title: 'Stopping a loop early',
          body: 'Now the retry idea in code. `break` leaves a loop at once. This loop tries each door and stops at the first open one, so the fourth door is never touched.',
          code: `doors = ["locked", "locked", "open", "open"]
tried = 0
for door in doors:
    tried += 1
    if door == "open":
        break
print(tried)`,
          language: 'python',
          output: '3',
        },
        {
          kind: 'write',
          prompt: 'A flaky service gives one outcome per try. Read one line of outcomes, each `ok` or `fail`, separated by spaces. Try them in order and stop at the first `ok`. Print `ok` if a try worked or `gave up` if none did. On a second line, print how many tries you made.',
          language: 'python',
          starter:
            'outcomes = input().split()\nattempts = 0\nresult = "gave up"\nfor outcome in outcomes:\n    attempts += 1\nprint(result)\nprint(attempts)\n',
          tests: [
            { stdin: ['fail fail ok ok'], expected: 'ok\n3' },
            { stdin: ['ok fail'], expected: 'ok\n1' },
            { stdin: ['fail fail fail'], expected: 'gave up\n3' },
          ],
          hint: 'Inside the loop, after counting: if outcome == "ok", set result = "ok" and use break to stop.',
          solution:
            'outcomes = input().split()\nattempts = 0\nresult = "gave up"\nfor outcome in outcomes:\n    attempts += 1\n    if outcome == "ok":\n        result = "ok"\n        break\nprint(result)\nprint(attempts)\n',
          explain: 'A retry loop needs two exits: success, or running out of tries. Giving up after a limit stops one broken service from hanging your whole app.',
        },
      ],
    },
  ],
}
