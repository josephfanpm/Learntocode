import type { Unit } from '../types'

export const u9: Unit = {
  id: 'u9',
  week: 9,
  title: 'Web apps',
  summary: 'Routes, forms and pages that respond',
  lessons: [
    {
      id: 'u9-web-apps',
      title: 'Pages that think',
      exercises: [
        {
          kind: 'concept',
          title: 'Static pages vs web apps',
          body: 'A **static page** is a file the server sends exactly as written. Everyone sees the same thing.\n\nA **web app** runs code on the server for each request and builds the page fresh. That is how a site can show *your* inbox or search results for *your* words.',
        },
        {
          kind: 'choice',
          prompt: 'Which of these needs a web app, not just a static page?',
          options: [
            'Search results for whatever the visitor types',
            'A page with the shop\'s opening hours',
            'A photo with a caption',
            'A list of the team\'s names',
          ],
          answer: 0,
          explain: 'Search results change with every visitor\'s words, so code must run to build them. The others can be the same file for everyone.',
        },
        {
          kind: 'concept',
          title: 'Flask',
          body: '**Flask** is a Python **library** (ready-made code you can use) for building web apps. A tiny Flask app looks like this. When someone visits `/`, Flask runs `index()` and sends back what it returns.',
          code: 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef index():\n    return "Hello, world!"',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Someone visits `/` on this app. What do they see?',
          code: 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef index():\n    return "Welcome to the bakery"',
          language: 'python',
          options: ['Welcome to the bakery', 'index', 'Hello, world!', 'Nothing, because there is no print'],
          answer: 0,
          explain: 'Flask sends back whatever the function returns. In a web app you `return` the page instead of printing it.',
        },
        {
          kind: 'order',
          prompt: 'Put this tiny Flask app in order.',
          lines: [
            'from flask import Flask',
            'app = Flask(__name__)',
            '@app.route("/")',
            'def index():',
            '    return "Hi there"',
          ],
          language: 'python',
          explain: 'Import Flask, create the app, then pin a function to a path with `@app.route` right above it.',
        },
        {
          kind: 'blank',
          prompt: 'Complete the app so visiting `/` shows "Open today".',
          code: '@app.___("/")\ndef index():\n    ___ "Open today"',
          language: 'python',
          bank: ['route', 'return', 'print', 'path'],
          answers: ['route', 'return'],
          explain: '`@app.route` connects the function to a path, and `return` hands the page text to Flask to send.',
        },
        {
          kind: 'concept',
          title: 'Pages are just text',
          body: 'The page a web app sends back is just a string, usually full of HTML. So Python can build pages the same way it builds any text, for example with an f-string.',
          code: 'name = "Ana"\npage = f"<h1>Hi, {name}</h1>"\nprint(page)',
          language: 'python',
          output: '<h1>Hi, Ana</h1>',
        },
        {
          kind: 'write',
          prompt: 'Let\'s build a page like a web app would. Read a name with `input()` and print `<h1>Welcome, NAME!</h1>` with the name filled in.',
          language: 'python',
          starter: 'name = input()\nprint("<h1>Welcome!</h1>")\n',
          tests: [
            { stdin: ['Ana'], expected: '<h1>Welcome, Ana!</h1>' },
            { stdin: ['Sam'], expected: '<h1>Welcome, Sam!</h1>' },
          ],
          hint: 'Use an f-string: f"<h1>Welcome, {name}!</h1>"',
          solution: 'name = input()\nprint(f"<h1>Welcome, {name}!</h1>")\n',
          explain: 'Each visitor gets a page built just for them. That is the heart of a web app.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Static page', 'Same file sent to everyone'],
            ['Web app', 'Code builds each page on request'],
            ['Flask', 'A Python library for web apps'],
            ['Library', 'Ready-made code you can use'],
          ],
          explain: 'Flask is a library that helps you write web apps in Python.',
        },
      ],
    },
    {
      id: 'u9-routes',
      title: 'Routes',
      exercises: [
        {
          kind: 'concept',
          title: 'Routes',
          body: 'A **route** connects a URL path to a Python function. The `@app.route("/about")` line sits right above a function and means: when someone visits `/about`, run this.\n\nOne app can have many routes, one per page.',
          code: '@app.route("/about")\ndef about():\n    return "We bake bread."',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Someone visits `/menu`. What do they see?',
          code: '@app.route("/")\ndef index():\n    return "Home"\n\n@app.route("/menu")\ndef menu():\n    return "Bread and cakes"',
          language: 'python',
          options: ['Bread and cakes', 'Home', 'menu', 'Home and then Bread and cakes'],
          answer: 0,
          explain: 'Flask runs only the function whose route matches the path, here `menu()`.',
        },
        {
          kind: 'blank',
          prompt: 'Make `/contact` show the email page.',
          code: '@app.route("___")\ndef contact():\n    return "Email us at hello@example.com"',
          language: 'python',
          bank: ['/contact', 'contact', '/', 'contact()'],
          answers: ['/contact'],
          explain: 'A route\'s path starts with a slash, just like the end of a URL.',
        },
        {
          kind: 'match',
          prompt: 'Match each visited URL to the function Flask runs.',
          pairs: [
            ['example.com/', 'index()'],
            ['example.com/about', 'about()'],
            ['example.com/cart', 'cart()'],
          ],
          explain: 'Flask looks at the path after the domain and finds the route that matches it.',
        },
        {
          kind: 'choice',
          prompt: 'The app only has routes for `/` and `/menu`. Someone visits `/prices`. What happens?',
          options: [
            'Flask sends a 404 Not Found',
            'Flask shows the home page instead',
            'Flask runs the menu function',
            'The server shuts down',
          ],
          answer: 0,
          explain: 'With no matching route there is no page, so Flask answers with the 404 status code you met last unit.',
        },
        {
          kind: 'concept',
          title: 'Routing by hand',
          body: 'Under the hood, routing is a decision: look at the path, pick the page. You can copy that idea in plain Python with `if` and `elif`, plus a fallback for unknown paths.',
          code: 'def page_for(path):\n    if path == "/menu":\n        return "Bread and cakes"\n    elif path == "/contact":\n        return "Email us"\n    else:\n        return "404 Not Found"\n\nprint(page_for("/contact"))\nprint(page_for("/shop"))',
          language: 'python',
          output: 'Email us\n404 Not Found',
        },
        {
          kind: 'write',
          prompt: 'Write `route(path)` so `"/"` returns `Home page`, `"/about"` returns `About us`, and anything else returns `404 Not Found`. The last line prints the result for a path read from input.',
          language: 'python',
          starter: 'def route(path):\n    return "404 Not Found"\n\nprint(route(input()))\n',
          tests: [
            { stdin: ['/'], expected: 'Home page' },
            { stdin: ['/about'], expected: 'About us' },
            { stdin: ['/xyz'], expected: '404 Not Found' },
          ],
          hint: 'Use if path == "/": … elif path == "/about": … else: return "404 Not Found".',
          solution:
            'def route(path):\n    if path == "/":\n        return "Home page"\n    elif path == "/about":\n        return "About us"\n    else:\n        return "404 Not Found"\n\nprint(route(input()))\n',
          explain: 'That is the job a router does: match the path to a page, and fall back to "not found".',
        },
        {
          kind: 'concept',
          title: 'Looking up with a fallback',
          body: 'A dictionary can do the same matching. `hours["sun"]` would crash here, because there is no such key.\n\n`.get(key, fallback)` looks the key up and gives you the fallback when it is missing.',
          code: 'hours = {"mon": "9 to 5", "sat": "10 to 2"}\nprint(hours.get("sat", "Closed"))\nprint(hours.get("sun", "Closed"))',
          language: 'python',
          output: '10 to 2\nClosed',
        },
        {
          kind: 'write',
          prompt: 'Routes can also live in a dictionary. Look up the path read from input in `pages` and print its page, or `404 Not Found` if it is missing.',
          language: 'python',
          starter: 'pages = {"/": "Home page", "/menu": "Bread and cakes"}\npath = input()\nprint(pages[path])\n',
          tests: [
            { stdin: ['/menu'], expected: 'Bread and cakes' },
            { stdin: ['/prices'], expected: '404 Not Found' },
          ],
          hint: 'pages.get(path, "404 Not Found") gives a fallback when the key is missing.',
          solution: 'pages = {"/": "Home page", "/menu": "Bread and cakes"}\npath = input()\nprint(pages.get(path, "404 Not Found"))\n',
          explain: '`pages[path]` crashes on a missing key, but `.get` with a default handles unknown pages gracefully.',
        },
      ],
    },
    {
      id: 'u9-forms',
      title: 'Forms, GET and POST',
      exercises: [
        {
          kind: 'concept',
          title: 'GET and POST',
          body: 'A form sends its data to a route, in one of two ways.\n\n**GET** adds the data to the URL, like `/search?q=tea`. Good for searches you might bookmark.\n\n**POST** sends it hidden inside the request. Use it for passwords and for changing things, like placing an order.',
          code: '<form action="/search" method="get">\n  <input name="q">\n  <button>Search</button>\n</form>',
          language: 'html',
        },
        {
          kind: 'choice',
          prompt: 'Which form should use POST?',
          options: [
            'A login form with a password',
            'A recipe search box',
            'A filter for showing red shoes only',
            'A "page 2" link for results',
          ],
          answer: 0,
          explain: 'With GET, the password would sit in the URL and in your browser history. POST keeps it out of sight.',
        },
        {
          kind: 'match',
          prompt: 'Match each phrase to GET or POST details.',
          pairs: [
            ['GET', 'Data shows in the URL'],
            ['POST', 'Data sent hidden in the request'],
            ['action="/search"', 'Which route gets the form'],
            ['method="post"', 'How the form sends its data'],
          ],
          explain: '`action` says where the form goes and `method` says how. GET is the default if you leave method out.',
        },
        {
          kind: 'concept',
          title: 'Reading the query string',
          body: 'After the `?` in a URL comes the **query string**: pairs like `city=Lima&days=3`.\n\n`&` separates the pairs. `=` separates each name from its value. All values arrive as text.',
        },
        {
          kind: 'choice',
          prompt: 'The URL is `/weather?city=Lima&days=3`. What is the value of `days`?',
          options: ['"3"', '"Lima"', '"days=3"', '3 and Lima'],
          answer: 0,
          explain: 'Find the pair that starts with `days=`. Everything after the `=` is its value, as text.',
        },
        {
          kind: 'concept',
          title: 'Splitting text into pairs',
          body: '`split` cuts text into a list at a separator. Here the text is cut at each comma, then each piece is cut at its colon.\n\n`key, value = ...` names the two halves, and `prices[key] = value` stores them in the dictionary.',
          code: 'text = "tea:3,cake:5"\nprices = {}\nfor pair in text.split(","):\n    key, value = pair.split(":")\n    prices[key] = value\nprint(prices)',
          language: 'python',
          output: "{'tea': '3', 'cake': '5'}",
        },
        {
          kind: 'write',
          prompt: 'Read a query string like `name=Ana&age=30` and turn it into a dictionary. Print the dictionary, e.g. `{\'name\': \'Ana\', \'age\': \'30\'}`.',
          language: 'python',
          starter: 'text = input()\ndata = {}\n\nprint(data)\n',
          tests: [
            { stdin: ['name=Ana&age=30'], expected: "{'name': 'Ana', 'age': '30'}" },
            { stdin: ['q=tea'], expected: "{'q': 'tea'}" },
          ],
          hint: 'Loop over text.split("&"); split each pair on "=" into key and value; store data[key] = value.',
          solution:
            'text = input()\ndata = {}\nfor pair in text.split("&"):\n    key, value = pair.split("=")\n    data[key] = value\nprint(data)\n',
          explain: 'Flask does this splitting for you, but now you know the data is just text in a simple pattern.',
        },
        {
          kind: 'concept',
          title: 'Getting form data in Flask',
          body: 'Flask gives you a `request` object describing the visit.\n\nFor GET, values are in `request.args`. For POST, they are in `request.form`. Use `.get("name")` like a dictionary. A route accepts POST if you add `methods=["POST"]`.',
          code: '@app.route("/search")\ndef search():\n    q = request.args.get("q")\n    return f"Results for {q}"',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Someone visits `/search?q=jam`. What does this route return?',
          code: '@app.route("/search")\ndef search():\n    q = request.args.get("q")\n    return f"Results for {q}"',
          language: 'python',
          options: ['Results for jam', 'Results for q', 'Results for {q}', 'Results for q=jam'],
          answer: 0,
          explain: '`request.args.get("q")` gives the value after `q=`, which the f-string drops into the page.',
        },
        {
          kind: 'blank',
          prompt: 'This route receives a sign-up form sent with POST. Fill the gaps.',
          code: '@app.route("/signup", methods=["___"])\ndef signup():\n    name = request.___.get("name")\n    return f"Thanks, {name}!"',
          language: 'python',
          bank: ['POST', 'form', 'input', 'print'],
          answers: ['POST', 'form'],
          explain: 'POST data lives in `request.form`, and the route must list "POST" in methods to accept it.',
        },
      ],
    },
    {
      id: 'u9-templates',
      title: 'Templates',
      exercises: [
        {
          kind: 'concept',
          title: 'Templates',
          body: 'Writing whole pages inside Python strings gets messy. A **template** is an HTML file with blanks to fill in later.\n\nIn Flask, `{{ name }}` marks a blank. `render_template` fills it and returns the finished page.',
          code: '# hello.html\n<p>Hello, {{ name }}!</p>\n\n# app.py\nreturn render_template("hello.html", name="Ana")',
        },
        {
          kind: 'choice',
          prompt: '`hello.html` holds `<p>Hello, {{ name }}!</p>`. What page does this send?',
          code: 'return render_template("hello.html", name="Sam")',
          language: 'python',
          options: ['<p>Hello, Sam!</p>', '<p>Hello, {{ name }}!</p>', '<p>Hello, name!</p>', '<p>Hello, {{ Sam }}!</p>'],
          answer: 0,
          explain: 'Each `{{ name }}` in the template is swapped for the value you passed as `name=`.',
        },
        {
          kind: 'blank',
          prompt: 'The template says `<h1>Order for {{ customer }}</h1>`. Fill the gap so it shows "Order for Lee".',
          code: 'return render_template("order.html", ___="Lee")',
          language: 'python',
          bank: ['customer', 'name', '{{ customer }}', 'Lee'],
          answers: ['customer'],
          explain: 'The name you pass must match the name inside the curly braces, without the braces.',
        },
        {
          kind: 'concept',
          title: 'Filling a blank by hand',
          body: 'You can copy what a template does with `.replace(old, new)`. It returns a new string with every `old` swapped for `new`. The original string is left as it was, so keep the result in a variable.',
          code: 'template = "Dear {{ name }}, your table is at {{ time }}."\npage = template.replace("{{ name }}", "Lee")\npage = page.replace("{{ time }}", "7pm")\nprint(page)',
          language: 'python',
          output: 'Dear Lee, your table is at 7pm.',
        },
        {
          kind: 'write',
          prompt: 'Fill in a template by hand. Read a name, then a number of messages, and replace `{{ name }}` and `{{ count }}` in `template`. Print the result.',
          language: 'python',
          starter:
            'template = "<p>Hello, {{ name }}! You have {{ count }} messages.</p>"\nname = input()\ncount = input()\nprint(template)\n',
          tests: [
            { stdin: ['Ana', '3'], expected: '<p>Hello, Ana! You have 3 messages.</p>' },
            { stdin: ['Raj', '12'], expected: '<p>Hello, Raj! You have 12 messages.</p>' },
          ],
          hint: 'template.replace("{{ name }}", name) returns a new string. Do it again for count.',
          solution:
            'template = "<p>Hello, {{ name }}! You have {{ count }} messages.</p>"\nname = input()\ncount = input()\npage = template.replace("{{ name }}", name).replace("{{ count }}", count)\nprint(page)\n',
          explain: 'This is roughly what render_template does: find each blank and swap in a value.',
        },
        {
          kind: 'concept',
          title: 'Loops in templates',
          body: 'Templates can repeat parts too. `{% for %}` and `{% endfor %}` wrap a piece of HTML that is written once per item.',
          code: '<ul>\n{% for item in items %}\n  <li>{{ item }}</li>\n{% endfor %}\n</ul>',
        },
        {
          kind: 'order',
          prompt: 'Order the template that lists every book.',
          lines: ['<ul>', '{% for book in books %}', '  <li>{{ book }}</li>', '{% endfor %}', '</ul>'],
          explain: 'The loop sits inside the list, so each book becomes one `<li>`, and `{% endfor %}` ends the repeated part.',
        },
        {
          kind: 'concept',
          title: 'The same loop in Python',
          body: 'Python can do the job of `{% for %}` itself: loop over a list and print one piece of HTML for each item, with an f-string to drop the item in.',
          code: 'names = ["Ana", "Raj"]\nfor name in names:\n    print(f"<p>Hello, {name}</p>")',
          language: 'python',
          output: '<p>Hello, Ana</p>\n<p>Hello, Raj</p>',
        },
        {
          kind: 'write',
          prompt: 'Read items separated by commas, like `milk,eggs`. Print `<ul>`, then one `<li>item</li>` line per item, then `</ul>`.',
          language: 'python',
          starter: 'items = input().split(",")\nprint("<ul>")\n\nprint("</ul>")\n',
          tests: [
            { stdin: ['milk,eggs'], expected: '<ul>\n<li>milk</li>\n<li>eggs</li>\n</ul>' },
            { stdin: ['tea'], expected: '<ul>\n<li>tea</li>\n</ul>' },
          ],
          hint: 'Between the two prints, loop: for item in items: print(f"<li>{item}</li>")',
          solution: 'items = input().split(",")\nprint("<ul>")\nfor item in items:\n    print(f"<li>{item}</li>")\nprint("</ul>")\n',
          explain: 'Same idea as `{% for %}`: one bit of HTML, repeated for each item in a list.',
        },
        {
          kind: 'choice',
          prompt: 'Why do web apps use templates instead of building HTML in Python strings?',
          options: [
            'The page layout stays in its own file and can be reused for every visitor',
            'Templates make the server run faster than Python',
            'Browsers can\'t read HTML made by Python',
            'Templates hide the page from search engines',
          ],
          answer: 0,
          explain: 'One template serves everyone; only the filled-in values change. It also keeps HTML and Python tidy and apart.',
        },
      ],
    },
    {
      id: 'u9-sessions-data',
      title: 'Remembering visitors',
      exercises: [
        {
          kind: 'concept',
          title: 'Cookies',
          body: 'HTTP forgets: every request starts fresh. To remember you, a server can hand your browser a **cookie**, a small note the browser stores and sends back on every visit.\n\nIt\'s like a hand stamp at an event: show it and you\'re let back in.',
        },
        {
          kind: 'choice',
          prompt: 'You log in, close the tab, and come back. You\'re still logged in. Why?',
          options: [
            'The browser sent back a cookie the site gave you',
            'The server recognised your face',
            'Your password is saved in the URL',
            'HTTP remembers every visitor automatically',
          ],
          answer: 0,
          explain: 'The cookie travels with each request, so the server can tell it\'s you again.',
        },
        {
          kind: 'concept',
          title: 'Sessions',
          body: 'A **session** is the server\'s memory about one visitor, linked to them by a cookie.\n\nIn Flask, `session` works like a dictionary that lasts across visits: `session["user"] = "Ana"` now, and `session.get("user")` on a later visit.\n\n`redirect("/")` sends the browser on to another page, here the home page.',
          code: '@app.route("/login", methods=["POST"])\ndef login():\n    session["user"] = request.form.get("name")\n    return redirect("/")',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Log the visitor out by removing them from the session, then send them home.',
          code: '@app.route("/logout")\ndef logout():\n    ___.clear()\n    return ___("/")',
          language: 'python',
          bank: ['session', 'redirect', 'cookie', 'print'],
          answers: ['session', 'redirect'],
          explain: '`session.clear()` forgets everything about this visitor, and `redirect("/")` sends their browser to the home page.',
        },
        {
          kind: 'concept',
          title: 'Counting in a dictionary',
          body: 'A session is a dictionary, so counting in one works like this.\n\n`.get("apples", 0)` gives 0 the first time, when the key is not there yet, and the saved number after that. Add 1 and store it back.',
          code: 'basket = {}\nbasket["apples"] = basket.get("apples", 0) + 1\nbasket["apples"] = basket.get("apples", 0) + 1\nprint(basket["apples"])',
          language: 'python',
          output: '2',
        },
        {
          kind: 'write',
          prompt: 'Simulate a session. Finish `visit(session)` so it adds 1 to `session["visits"]` (starting from 0) and returns `Visit number N`. The code below calls it as many times as the number read from input.',
          language: 'python',
          starter:
            'def visit(session):\n    return "Visit number 1"\n\nsession = {}\nfor i in range(int(input())):\n    print(visit(session))\n',
          tests: [
            { stdin: ['3'], expected: 'Visit number 1\nVisit number 2\nVisit number 3' },
            { stdin: ['2'], expected: 'Visit number 1\nVisit number 2' },
          ],
          hint: 'session["visits"] = session.get("visits", 0) + 1, then return f"Visit number {session[\'visits\']}".',
          solution:
            'def visit(session):\n    session["visits"] = session.get("visits", 0) + 1\n    count = session["visits"]\n    return f"Visit number {count}"\n\nsession = {}\nfor i in range(int(input())):\n    print(visit(session))\n',
          explain: 'Because the same dictionary is passed each time, it remembers the count, just as a real session does between requests.',
        },
        {
          kind: 'concept',
          title: 'A database behind the app',
          body: 'Sessions are short-lived and belong to one visitor. Things everyone needs, like orders or posts, go in a **database**.\n\nA route can run SQL with values from a form. The `?` is a **placeholder**: the library safely drops the value in.',
          code: 'db.execute("INSERT INTO orders (item) VALUES (?)", (item,))',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Why use a `?` placeholder instead of gluing the form value into the SQL text?',
          options: [
            'So a visitor can\'t sneak their own SQL commands in through the form',
            'Because SQL can\'t read text',
            'It makes the query return more rows',
            'Placeholders are required by HTML',
          ],
          answer: 0,
          explain: 'Gluing raw input into SQL lets someone type commands that run on your database, called **SQL injection**. Placeholders treat input as plain data.',
        },
        {
          kind: 'order',
          prompt: 'Order what happens when someone places an order.',
          lines: [
            'The visitor fills in the form and clicks Order',
            'The browser sends a POST request to /order',
            'The route reads the item from request.form',
            'The route INSERTs the order into the database',
            'The route redirects to a "thank you" page',
          ],
          explain: 'Form, request, route, database, response: the whole web app loop in one go.',
        },
        {
          kind: 'match',
          prompt: 'Match each piece to where information is kept.',
          pairs: [
            ['Cookie', 'A small note kept by the browser'],
            ['Session', 'Server memory about one visitor'],
            ['Database', 'Long-term storage shared by everyone'],
            ['Form', 'Where the visitor types new data'],
          ],
          explain: 'Each one keeps information for a different person and a different length of time.',
        },
      ],
    },
    {
      id: 'u9-apis',
      title: 'APIs and JSON',
      exercises: [
        {
          kind: 'concept',
          title: 'Asking another server',
          body: 'Your app does not have to know everything. An **API** is a way for one program to ask another server for data, such as today\'s weather or a price.\n\nThe reply is not a page for people. It is plain data for your code to read.',
          code: 'response = requests.get("https://api.example.com/weather?city=Lima")\ndata = response.json()',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Which of these is an app using an API?',
          options: [
            'A page that shows the same photo to everyone',
            'A travel app asking a weather server for tomorrow\'s forecast',
            'A visitor typing their name into a form',
            'A browser storing a cookie',
          ],
          answer: 1,
          explain: 'One program asks another for data and gets data back. No person reads the reply directly.',
        },
        {
          kind: 'concept',
          title: 'JSON',
          body: 'Most APIs reply in **JSON**, a text format that looks like Python dictionaries and lists. Names go in double quotes.\n\nJSON arrives as one long string. `json.loads(text)` turns it into a real dictionary you can look things up in.',
          code: 'import json\n\ntext = \'{"city": "Lima", "temp": 21}\'\ndata = json.loads(text)\nprint(data["city"])',
          language: 'python',
          output: 'Lima',
        },
        {
          kind: 'type',
          prompt: 'What does this print?',
          code: 'import json\n\ntext = \'{"name": "Ana", "pets": ["cat", "fish"]}\'\ndata = json.loads(text)\nprint(len(data["pets"]))',
          language: 'python',
          accept: ['2', 'two'],
          explain: 'After `json.loads`, `data["pets"]` is an ordinary Python list with two items.',
        },
        {
          kind: 'write',
          prompt: 'A weather API replied with JSON like `{"city": "Lima", "temp": 21}`. Read that line with `input()`, turn it into a dictionary, and print `Lima: 21 degrees` using its values.',
          language: 'python',
          starter: 'import json\n\ntext = input()\nprint(text)\n',
          tests: [
            { stdin: ['{"city": "Lima", "temp": 21}'], expected: 'Lima: 21 degrees' },
            { stdin: ['{"city": "Oslo", "temp": -3}'], expected: 'Oslo: -3 degrees' },
          ],
          hint: 'data = json.loads(text), then print data["city"] and data["temp"] in an f-string.',
          solution: `import json

text = input()
data = json.loads(text)
city = data["city"]
temp = data["temp"]
print(f"{city}: {temp} degrees")
`,
          explain: 'Until you call `json.loads`, the reply is only text. Afterwards it is a dictionary with keys you can use.',
        },
        {
          kind: 'spot',
          prompt: 'This reply is not valid JSON, so `json.loads` crashes. Tap the line that breaks the rules.',
          lines: ['{', '  "name": "Ana",', "  'age': 30,", '  "member": true', '}'],
          answer: 2,
          explain: 'JSON only allows double quotes around names and text. Python is relaxed about quotes, but JSON is not.',
        },
        {
          kind: 'match',
          prompt: 'Match each piece of JSON to what `json.loads` turns it into.',
          pairs: [
            ['{"a": 1}', 'A dictionary'],
            ['[1, 2, 3]', 'A list'],
            ['true', 'True'],
            ['null', 'None'],
          ],
          explain: 'JSON spells a few things differently (`true`, `false`, `null`), and `json.loads` translates them into Python.',
        },
        {
          kind: 'concept',
          title: 'A list of objects',
          body: 'JSON that starts with `[` becomes a Python list. Here each item in the list is a dictionary, so inside the loop `team` is one dictionary and `team["points"]` is its number.',
          code: 'import json\n\ntext = \'[{"team": "Red", "points": 4}, {"team": "Blue", "points": 7}]\'\nteams = json.loads(text)\ntotal = 0\nfor team in teams:\n    total += team["points"]\nprint(total)',
          language: 'python',
          output: '11',
        },
        {
          kind: 'write',
          prompt: 'A shop API replied with a JSON list of items, like `[{"item": "tea", "price": 3}, {"item": "cake", "price": 5}]`. Read it, add up every price, and print `Total: 8`.',
          language: 'python',
          starter: 'import json\n\nitems = json.loads(input())\ntotal = 0\n\nprint(f"Total: {total}")\n',
          tests: [
            { stdin: ['[{"item": "tea", "price": 3}, {"item": "cake", "price": 5}]'], expected: 'Total: 8' },
            { stdin: ['[{"item": "soup", "price": 6}]'], expected: 'Total: 6' },
          ],
          hint: 'items is a list of dictionaries. Loop: for item in items: total += item["price"]',
          solution:
            'import json\n\nitems = json.loads(input())\ntotal = 0\nfor item in items:\n    total += item["price"]\nprint(f"Total: {total}")\n',
          explain: 'A JSON list of objects becomes a Python list of dictionaries, which you already know how to loop over.',
        },
        {
          kind: 'blank',
          prompt: 'Ask the price API about one company and read the JSON reply.',
          code: 'response = requests.___("https://api.example.com/price?symbol=KITE")\ndata = response.___()\nprint(data["price"])',
          language: 'python',
          bank: ['get', 'json', 'post', 'html'],
          answers: ['get', 'json'],
          explain: '`requests.get` sends a GET request, just as a browser would. `.json()` does the `json.loads` step for you.',
        },
      ],
    },
    {
      id: 'u9-accounts',
      title: 'Accounts and passwords',
      exercises: [
        {
          kind: 'concept',
          title: 'Registering and logging in',
          body: 'To **register** is to create an account: the app saves a new row in a `users` table.\n\nTo **log in** is to prove you own an account: the app compares what you type with what it saved. If they match, it remembers you in the session.',
        },
        {
          kind: 'order',
          prompt: 'Put the steps of logging in in order.',
          lines: [
            'The visitor types a name and password and clicks Log in',
            'The browser sends them to /login with POST',
            'The route finds the row for that name in the users table',
            'The route checks the typed password against the saved one',
            'The route stores the user id in the session',
            'The route redirects to the home page',
          ],
          explain: 'Only after the check passes does the app write to the session. From then on, every request carries the cookie that proves who you are.',
        },
        {
          kind: 'concept',
          title: 'Never store the password itself',
          body: 'If passwords are saved as plain text, one leak hands every password to a thief.\n\nA **hash function** scrambles text into a fixed-length jumble. The same text always gives the same jumble, and it cannot be run backwards. Apps store only the hash.',
          code: 'import hashlib\n\nword = "hello"\nprint(hashlib.sha256(word.encode()).hexdigest())',
          language: 'python',
          output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
        },
        {
          kind: 'choice',
          prompt: 'The app only stored a hash. How can it check your password when you log in?',
          options: [
            'It un-scrambles the stored hash back into your password',
            'It emails you the password and asks if it looks right',
            'It lets anyone in who knows your name',
            'It hashes what you typed and compares the two hashes',
          ],
          answer: 3,
          explain: 'The same text always gives the same hash, so matching hashes mean matching passwords. Nothing is ever un-scrambled.',
        },
        {
          kind: 'write',
          prompt: 'Finish `make_hash` so it returns the SHA-256 hash of the password. The last line prints the first 8 characters of the hash of a password read from input.',
          language: 'python',
          starter:
            'import hashlib\n\ndef make_hash(password):\n    return password\n\nprint(make_hash(input())[:8])\n',
          tests: [
            { stdin: ['teapot42'], expected: 'b7c4c6cd' },
            { stdin: ['hello'], expected: '2cf24dba' },
          ],
          hint: 'return hashlib.sha256(password.encode()).hexdigest()',
          solution:
            'import hashlib\n\ndef make_hash(password):\n    return hashlib.sha256(password.encode()).hexdigest()\n\nprint(make_hash(input())[:8])\n',
          explain: '`.encode()` turns the text into bytes, `sha256` scrambles them, and `.hexdigest()` gives the result as 64 letters and digits.',
        },
        {
          kind: 'concept',
          title: 'Comparing hashes',
          body: 'To check a secret, hash what was typed and compare it with the saved hash.\n\nCheck the name is `in` the dictionary first. `and` stops at the first false part, so a missing name never causes a crash.',
          code: 'import hashlib\n\ndef make_hash(text):\n    return hashlib.sha256(text.encode()).hexdigest()\n\nlockers = {"red": make_hash("4821")}\nprint("red" in lockers and lockers["red"] == make_hash("4821"))\nprint("blue" in lockers and lockers["blue"] == make_hash("4821"))',
          language: 'python',
          output: 'True\nFalse',
        },
        {
          kind: 'write',
          prompt: 'The `users` dictionary holds each name and a password hash. Finish `login` so it returns `Welcome, NAME` when the name exists and the hash of the typed password matches. Otherwise return `Wrong name or password`.',
          language: 'python',
          starter: `import hashlib

def make_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

users = {"ana": make_hash("teapot42"), "ben": make_hash("otter7")}

def login(name, password):
    return "Welcome, " + name

name = input()
password = input()
print(login(name, password))
`,
          tests: [
            { stdin: ['ana', 'teapot42'], expected: 'Welcome, ana' },
            { stdin: ['ana', 'otter7'], expected: 'Wrong name or password' },
            { stdin: ['zed', 'teapot42'], expected: 'Wrong name or password' },
          ],
          hint: 'if name in users and users[name] == make_hash(password): return the welcome. After the if, return the other message.',
          solution: `import hashlib

def make_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

users = {"ana": make_hash("teapot42"), "ben": make_hash("otter7")}

def login(name, password):
    if name in users and users[name] == make_hash(password):
        return "Welcome, " + name
    return "Wrong name or password"

name = input()
password = input()
print(login(name, password))
`,
          explain: 'One message covers both failures on purpose. Saying "no such user" would tell an attacker which names exist.',
        },
        {
          kind: 'spot',
          prompt: 'This register route works, but it has a serious security bug. Tap the line.',
          lines: [
            '@app.route("/register", methods=["POST"])',
            'def register():',
            '    name = request.form.get("name")',
            '    password = request.form.get("password")',
            '    db.execute("INSERT INTO users (name, password) VALUES (?, ?)", (name, password))',
            '    return redirect("/login")',
          ],
          language: 'python',
          answer: 4,
          explain: 'It saves the password itself. It should save a hash of it, so a leaked database gives away no passwords.',
        },
        {
          kind: 'concept',
          title: 'Salt, slow hashes and sessions',
          body: 'Real apps go further. They add **salt**, random text mixed in before hashing, so two people with the same password get different hashes. They also use hashes that are slow on purpose, to make guessing costly.\n\nLibraries do both for you. After a good login, the app stores your id in the session.',
          code: 'hash = generate_password_hash(password)\n\nif check_password_hash(hash, typed):\n    session["user_id"] = row["id"]',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Finish the login check: remember the user, then send them home.',
          code: 'if check_password_hash(row["hash"], password):\n    ___["user_id"] = row["id"]\n    return ___("/")\nreturn "Wrong name or password"',
          language: 'python',
          bank: ['session', 'redirect', 'request', 'render'],
          answers: ['session', 'redirect'],
          explain: 'Putting the id in `session` is what "logged in" means. Every later request can check `session.get("user_id")`.',
        },
        {
          kind: 'type',
          prompt: 'Two people both choose the password `sunshine`. The app uses a plain hash with no salt. Are their stored hashes the same or different? Type one word.',
          accept: ['same', 'the same'],
          explain: 'Same text in, same hash out. A thief who cracks one gets both, which is why real apps add salt.',
        },
      ],
    },
    {
      id: 'u9-lab-birthdays',
      title: 'Lab: birthday book',
      exercises: [
        {
          kind: 'concept',
          title: 'A birthday book app',
          body: 'In this lab you build the brains of a small web app that remembers birthdays: add one, list them all, delete one.\n\nA real app keeps them in a database table. Here a list of dictionaries stands in for the table, and each dictionary is one row.',
          code: 'book = [\n    {"name": "Ana", "month": 3, "day": 14},\n]',
          language: 'python',
        },
        {
          kind: 'concept',
          title: 'Reminder: adding a row',
          body: '`.append` adds one item to the end of a list. The item can be a whole dictionary, written with curly braces and a value for each key.',
          code: 'pets = []\npets.append({"name": "Rex", "kind": "dog"})\nprint(len(pets))\nprint(pets[0]["name"])',
          language: 'python',
          output: '1\nRex',
        },
        {
          kind: 'write',
          prompt: 'Finish `add` so it appends a dictionary with the keys `name`, `month` and `day` to `book`. The code below adds two people, then prints how many there are and the second name.',
          language: 'python',
          starter: `book = []

def add(name, month, day):
    # append a dictionary to book here
    pass

add("Ana", 3, 14)
add("Ben", 11, 2)
print(len(book))
print(book[1]["name"])
`,
          tests: [{ expected: '2\nBen' }],
          hint: 'book.append({"name": name, "month": month, "day": day})',
          solution: `book = []

def add(name, month, day):
    book.append({"name": name, "month": month, "day": day})

add("Ana", 3, 14)
add("Ben", 11, 2)
print(len(book))
print(book[1]["name"])
`,
          explain: 'This is the job of an `INSERT`: one new row, with a value for every column.',
        },
        {
          kind: 'concept',
          title: 'Reminder: one line per row',
          body: 'Loop over the list and each turn gives you one dictionary. Pull out the values you need by key, then build the line with an f-string.',
          code: 'pets = [{"name": "Rex", "age": 4}, {"name": "Mog", "age": 9}]\nfor pet in pets:\n    name = pet["name"]\n    age = pet["age"]\n    print(f"{name} is {age}")',
          language: 'python',
          output: 'Rex is 4\nMog is 9',
        },
        {
          kind: 'write',
          prompt: 'Now the list page. The "form" values are read from input and added for you. Finish `show` so it prints one line per person, like `Ana: 3/14`.',
          language: 'python',
          starter: `book = [
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Ben", "month": 11, "day": 2},
]

def show():
    # print one line per person
    pass

name = input()
month = int(input())
day = int(input())
book.append({"name": name, "month": month, "day": day})
show()
`,
          tests: [
            { stdin: ['Cleo', '7', '30'], expected: 'Ana: 3/14\nBen: 11/2\nCleo: 7/30' },
            { stdin: ['Dev', '1', '9'], expected: 'Ana: 3/14\nBen: 11/2\nDev: 1/9' },
          ],
          hint: 'for person in book: then print the name, a colon, the month, a slash and the day with an f-string.',
          solution: `book = [
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Ben", "month": 11, "day": 2},
]

def show():
    for person in book:
        name = person["name"]
        month = person["month"]
        day = person["day"]
        print(f"{name}: {month}/{day}")

name = input()
month = int(input())
day = int(input())
book.append({"name": name, "month": month, "day": day})
show()
`,
          explain: 'In the real app this loop lives in a template: `{% for person in birthdays %}` writes one table row each.',
        },
        {
          kind: 'concept',
          title: 'Reminder: checking a range',
          body: 'To reject a number outside a range, test both ends and join the tests with `or`. If either one is true, the value is bad, and the function returns early.',
          code: 'def check_hour(hour):\n    if hour < 0 or hour > 23:\n        return "Invalid"\n    return "OK"\n\nprint(check_hour(9))\nprint(check_hour(24))',
          language: 'python',
          output: 'OK\nInvalid',
        },
        {
          kind: 'write',
          prompt: 'Never trust a form. Finish `check` so it returns `Invalid` unless the month is from 1 to 12 and the day is from 1 to 31. Otherwise it returns `Added`.',
          language: 'python',
          starter: `def check(month, day):
    return "Added"

month = int(input())
day = int(input())
print(check(month, day))
`,
          tests: [
            { stdin: ['3', '14'], expected: 'Added' },
            { stdin: ['13', '2'], expected: 'Invalid' },
            { stdin: ['5', '0'], expected: 'Invalid' },
          ],
          hint: 'if month < 1 or month > 12 or day < 1 or day > 31: return "Invalid"',
          solution: `def check(month, day):
    if month < 1 or month > 12 or day < 1 or day > 31:
        return "Invalid"
    return "Added"

month = int(input())
day = int(input())
print(check(month, day))
`,
          explain: 'A browser form can be bypassed, so the server always checks the values again before saving them.',
        },
        {
          kind: 'spot',
          prompt: 'The form sends its data with POST, but this route always saves the name as `None`. Tap the line with the bug.',
          lines: [
            '@app.route("/add", methods=["POST"])',
            'def add():',
            '    name = request.args.get("name")',
            '    db.execute("INSERT INTO birthdays (name) VALUES (?)", (name,))',
            '    return redirect("/")',
          ],
          language: 'python',
          answer: 2,
          explain: '`request.args` holds GET data from the URL. POST data arrives in `request.form`.',
        },
        {
          kind: 'concept',
          title: 'Reminder: keeping all but one',
          body: 'A safe way to remove something is to build a new list of everything you want to keep. `!=` means "is not equal to".',
          code: 'scores = [4, 9, 2, 7]\nkept = []\nfor score in scores:\n    if score != 9:\n        kept.append(score)\nprint(kept)',
          language: 'python',
          output: '[4, 2, 7]',
        },
        {
          kind: 'write',
          prompt: 'Add a delete button. Finish `delete` so it returns a new list without the person whose name was given. A name read from input is deleted, then the remaining names are printed.',
          language: 'python',
          starter: `book = [
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Ben", "month": 11, "day": 2},
    {"name": "Cleo", "month": 7, "day": 30},
]

def delete(book, name):
    kept = []
    # add every person except the named one to kept
    return book

book = delete(book, input())
for person in book:
    print(person["name"])
`,
          tests: [
            { stdin: ['Ben'], expected: 'Ana\nCleo' },
            { stdin: ['Zed'], expected: 'Ana\nBen\nCleo' },
          ],
          hint: 'for person in book: if person["name"] != name: kept.append(person). Then return kept.',
          solution: `book = [
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Ben", "month": 11, "day": 2},
    {"name": "Cleo", "month": 7, "day": 30},
]

def delete(book, name):
    kept = []
    for person in book:
        if person["name"] != name:
            kept.append(person)
    return kept

book = delete(book, input())
for person in book:
    print(person["name"])
`,
          explain: 'Deleting a name that is not there changes nothing and causes no crash, just like SQL.',
        },
        {
          kind: 'type',
          prompt: 'In the real app the birthdays live in a database table. Which SQL command removes a row? Type the one word.',
          accept: ['DELETE', 'DELETE FROM'],
          explain: '`DELETE FROM birthdays WHERE id = ?` removes one row. The `WHERE` matters: without it, every row goes.',
        },
        {
          kind: 'blank',
          prompt: 'Here is the real route. Save the new birthday, then send the visitor back to the list.',
          code: '@app.route("/add", methods=["POST"])\ndef add():\n    name = request.form.get("name")\n    month = request.form.get("month")\n    day = request.form.get("day")\n    db.execute("___ INTO birthdays (name, month, day) VALUES (?, ?, ?)", (name, month, day))\n    return ___("/")',
          language: 'python',
          bank: ['INSERT', 'redirect', 'SELECT', 'render_template'],
          answers: ['INSERT', 'redirect'],
          explain: 'Same shape as your Python version: take the form values, add a row, go back to the list page.',
        },
        {
          kind: 'concept',
          title: 'Reminder: sorted, or nothing to show',
          body: '`sorted(names)` gives a copy of the list in A to Z order. Before printing, check whether the list is empty with `len`, so you can say so instead of printing nothing.',
          code: 'names = ["Mog", "Ada"]\nif len(names) == 0:\n    print("Nobody yet")\nelse:\n    for name in sorted(names):\n        print(name)',
          language: 'python',
          output: 'Ada\nMog',
        },
        {
          kind: 'write',
          prompt: 'One more feature: read a month number and print the names of everyone with a birthday that month, sorted A to Z, one per line. If there is nobody, print `None this month`.',
          language: 'python',
          starter: `book = [
    {"name": "Cleo", "month": 3, "day": 1},
    {"name": "Ben", "month": 11, "day": 2},
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Dev", "month": 7, "day": 30},
]

month = int(input())
names = []

print("None this month")
`,
          tests: [
            { stdin: ['3'], expected: 'Ana\nCleo' },
            { stdin: ['7'], expected: 'Dev' },
            { stdin: ['5'], expected: 'None this month' },
          ],
          hint: 'Loop over book and append matching names to names. If names is empty print the message, else loop over sorted(names).',
          solution: `book = [
    {"name": "Cleo", "month": 3, "day": 1},
    {"name": "Ben", "month": 11, "day": 2},
    {"name": "Ana", "month": 3, "day": 14},
    {"name": "Dev", "month": 7, "day": 30},
]

month = int(input())
names = []
for person in book:
    if person["month"] == month:
        names.append(person["name"])

if len(names) == 0:
    print("None this month")
else:
    for name in sorted(names):
        print(name)
`,
          explain: 'In SQL this whole loop is one line: `SELECT name FROM birthdays WHERE month = ? ORDER BY name`.',
        },
      ],
    },
    {
      id: 'u9-project-trader',
      title: 'Project: play-money stock trader',
      exercises: [
        {
          kind: 'concept',
          title: 'A pretend trading app',
          body: 'A **share** is a small slice of a company that you can buy and sell. In this project you build the logic of an app for trading shares with play money.\n\nOur companies are invented, each with a short **symbol**. A real app asks an API for prices; here a dictionary does the job.',
          code: 'PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}',
          language: 'python',
        },
        {
          kind: 'concept',
          title: 'Reminder: a forgiving lookup',
          body: '`.upper()` gives a copy of some text in capital letters. `.get(key)` looks a key up without crashing: when the key is missing it gives `None`, Python\'s word for "nothing here".',
          code: 'stock = {"TEA": 12, "JAM": 5}\nword = "jam"\nprint(stock.get(word.upper()))\nprint(stock.get("MILK"))',
          language: 'python',
          output: '5\nNone',
        },
        {
          kind: 'write',
          prompt: 'Step 1, quote. Finish `lookup` so it returns the price for a symbol typed in any capitals, or `None` if the symbol is unknown. The rest prints the price or `Unknown symbol`.',
          language: 'python',
          starter: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}

def lookup(symbol):
    return PRICES[symbol]

price = lookup(input())
if price is None:
    print("Unknown symbol")
else:
    print(price)
`,
          tests: [
            { stdin: ['kite'], expected: '25' },
            { stdin: ['MOSS'], expected: '110' },
            { stdin: ['abc'], expected: 'Unknown symbol' },
          ],
          hint: 'return PRICES.get(symbol.upper()). With no default, .get gives None for a missing key.',
          solution: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}

def lookup(symbol):
    return PRICES.get(symbol.upper())

price = lookup(input())
if price is None:
    print("Unknown symbol")
else:
    print(price)
`,
          explain: '`.upper()` forgives lowercase typing, and `.get` turns a missing symbol into `None` instead of a crash.',
        },
        {
          kind: 'concept',
          title: 'Reminder: check first, then change',
          body: 'When something can run out, test before you take any away. The `if` branch refuses. The `else` branch is the only place the amount changes.',
          code: 'battery = 50\nneed = 30\nif need > battery:\n    print("Not enough charge")\nelse:\n    battery = battery - need\n    print(f"Used {need}, {battery} left")',
          language: 'python',
          output: 'Used 30, 20 left',
        },
        {
          kind: 'write',
          prompt: 'Step 2, buy. You have 1000 in cash. Read a symbol and a number of shares. If the cost is more than your cash, print `Not enough cash`. Otherwise take the cost off your cash and print `Bought 4 KITE, cash left 900`.',
          language: 'python',
          starter: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
cash = 1000

symbol = input()
shares = int(input())
cost = PRICES[symbol] * shares

print(f"Bought {shares} {symbol}, cash left {cash}")
`,
          tests: [
            { stdin: ['KITE', '4'], expected: 'Bought 4 KITE, cash left 900' },
            { stdin: ['MOSS', '10'], expected: 'Not enough cash' },
            { stdin: ['ZEST', '125'], expected: 'Bought 125 ZEST, cash left 0' },
          ],
          hint: 'if cost > cash: print("Not enough cash"). else: cash = cash - cost, then the Bought line.',
          solution: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
cash = 1000

symbol = input()
shares = int(input())
cost = PRICES[symbol] * shares

if cost > cash:
    print("Not enough cash")
else:
    cash = cash - cost
    print(f"Bought {shares} {symbol}, cash left {cash}")
`,
          explain: 'Check first, then change. Spending exactly all your cash is allowed, which is why the test is `>` and not `>=`.',
        },
        {
          kind: 'spot',
          prompt: 'This buy function refuses every purchase you can afford and allows the ones you cannot. Tap the line with the bug.',
          lines: [
            'def buy(cash, price, shares):',
            '    cost = price * shares',
            '    if cost < cash:',
            '        return "Not enough cash"',
            '    return cash - cost',
          ],
          language: 'python',
          answer: 2,
          explain: 'The comparison is backwards. You are short of cash when the cost is **greater** than your cash: `cost > cash`.',
        },
        {
          kind: 'concept',
          title: 'Reminder: changing two things',
          body: 'A sale changes two things at once: fewer items in the dictionary and more money. `.get("TEA", 0)` counts something you never had as zero.',
          code: 'shelf = {"TEA": 6, "JAM": 2}\ntill = 100\nowned = shelf.get("TEA", 0)\nshelf["TEA"] = owned - 2\ntill = till + 12 * 2\nprint(shelf["TEA"], till)',
          language: 'python',
          output: '4 124',
        },
        {
          kind: 'write',
          prompt: 'Step 3, sell. Read a symbol and a number of shares. If you own fewer than that (or none), print `Not enough shares`. Otherwise remove them, add the money to your cash, and print `Sold 4 KITE, cash now 600`.',
          language: 'python',
          starter: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
cash = 500
portfolio = {"KITE": 10, "ZEST": 40}

symbol = input()
shares = int(input())
owned = portfolio.get(symbol, 0)

print(f"Sold {shares} {symbol}, cash now {cash}")
`,
          tests: [
            { stdin: ['KITE', '4'], expected: 'Sold 4 KITE, cash now 600' },
            { stdin: ['KITE', '11'], expected: 'Not enough shares' },
            { stdin: ['MOSS', '1'], expected: 'Not enough shares' },
          ],
          hint: 'if shares > owned: print the message. else: portfolio[symbol] = owned - shares, cash = cash + PRICES[symbol] * shares, then print.',
          solution: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
cash = 500
portfolio = {"KITE": 10, "ZEST": 40}

symbol = input()
shares = int(input())
owned = portfolio.get(symbol, 0)

if shares > owned:
    print("Not enough shares")
else:
    portfolio[symbol] = owned - shares
    cash = cash + PRICES[symbol] * shares
    print(f"Sold {shares} {symbol}, cash now {cash}")
`,
          explain: 'A **portfolio** is the set of shares you own. `.get(symbol, 0)` treats a company you never bought as zero shares.',
        },
        {
          kind: 'type',
          prompt: 'KITE costs 25 and ZEST costs 8. What is this portfolio worth? Type the number.',
          code: 'portfolio = {"KITE": 2, "ZEST": 5}',
          language: 'python',
          accept: ['90', '$90'],
          explain: '2 × 25 = 50 and 5 × 8 = 40, and 50 + 40 = 90. Shares times price, added up for every company.',
        },
        {
          kind: 'concept',
          title: 'Reminder: looping over a dictionary',
          body: '`.items()` hands a loop each key together with its value, so you can name them both. Here the count comes from `basket`, and the same key looks up the cost in `COST`.',
          code: 'COST = {"TEA": 12, "JAM": 5}\nbasket = {"TEA": 2, "JAM": 3}\ntotal = 0\nfor item, count in basket.items():\n    total += count * COST[item]\nprint(total)',
          language: 'python',
          output: '39',
        },
        {
          kind: 'write',
          prompt: 'Step 4, the home page total. Read your cash from input. Add the value of every holding in `portfolio` (shares times price) and print `Total: 1290`.',
          language: 'python',
          starter: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
portfolio = {"KITE": 10, "MOSS": 2, "ZEST": 40}

cash = int(input())
total = cash

print(f"Total: {total}")
`,
          tests: [
            { stdin: ['500'], expected: 'Total: 1290' },
            { stdin: ['0'], expected: 'Total: 790' },
          ],
          hint: 'for symbol, shares in portfolio.items(): total += shares * PRICES[symbol]',
          solution: `PRICES = {"KITE": 25, "MOSS": 110, "ZEST": 8}
portfolio = {"KITE": 10, "MOSS": 2, "ZEST": 40}

cash = int(input())
total = cash
for symbol, shares in portfolio.items():
    total += shares * PRICES[symbol]

print(f"Total: {total}")
`,
          explain: 'Cash plus what your shares are worth right now. When prices change, the total changes with them.',
        },
        {
          kind: 'write',
          prompt: 'Step 5, history. Trades arrive as one line like `buy KITE 3,sell ZEST 5`. Finish `record` so it appends a dictionary with the keys `kind`, `symbol` and `shares` to `history`. The rest prints the list.',
          language: 'python',
          starter: `history = []

def record(kind, symbol, shares):
    # append a dictionary to history here
    pass

for trade in input().split(","):
    kind, symbol, shares = trade.split()
    record(kind, symbol, int(shares))

number = 1
for t in history:
    print(f"{number}. {t['kind']} {t['shares']} {t['symbol']}")
    number += 1
print(f"Trades: {len(history)}")
`,
          tests: [
            { stdin: ['buy KITE 3,sell ZEST 5'], expected: '1. buy 3 KITE\n2. sell 5 ZEST\nTrades: 2' },
            { stdin: ['buy MOSS 1'], expected: '1. buy 1 MOSS\nTrades: 1' },
          ],
          hint: 'history.append({"kind": kind, "symbol": symbol, "shares": shares})',
          solution: `history = []

def record(kind, symbol, shares):
    history.append({"kind": kind, "symbol": symbol, "shares": shares})

for trade in input().split(","):
    kind, symbol, shares = trade.split()
    record(kind, symbol, int(shares))

number = 1
for t in history:
    print(f"{number}. {t['kind']} {t['shares']} {t['symbol']}")
    number += 1
print(f"Trades: {len(history)}")
`,
          explain: 'History only ever grows: every buy and sell adds a row and none are changed. In the real app it is its own database table.',
        },
        {
          kind: 'blank',
          prompt: 'Here is the real buy route. It reads the form, works out the cost, and refuses if the user is short.',
          code: '@app.route("/buy", methods=["___"])\ndef buy():\n    symbol = request.___.get("symbol")\n    shares = int(request.form.get("shares"))\n    cost = lookup(symbol) * shares\n    if cost > get_cash(session["user_id"]):\n        return "Not enough cash", 400',
          language: 'python',
          bank: ['POST', 'form', 'GET', 'args'],
          answers: ['POST', 'form'],
          explain: 'Buying changes data, so the form uses POST and its values arrive in `request.form`. The `400` is a status code meaning "bad request".',
        },
        {
          kind: 'spot',
          prompt: 'This sell route crashes because it compares text with a number. The fix goes where `shares` is first read, so every later use gets a number. Tap that line.',
          lines: [
            '@app.route("/sell", methods=["POST"])',
            'def sell():',
            '    symbol = request.form.get("symbol")',
            '    shares = request.form.get("shares")',
            '    if shares > get_shares(session["user_id"], symbol):',
            '        return "Not enough shares", 400',
            '    return redirect("/")',
          ],
          language: 'python',
          answer: 3,
          explain: 'Everything from a form arrives as text. Wrap it in `int(...)` before doing maths with it.',
        },
      ],
    },
  ],
}
