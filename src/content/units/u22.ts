import type { Unit } from '../types'

// String.raw keeps Python code readable: real line breaks, no escaping.
const r = String.raw

const SHOP = `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER, status TEXT);
INSERT INTO customers (id, name) VALUES (1, 'Ana'), (2, 'Ben'), (3, 'Cy');
INSERT INTO orders (id, customer_id, total, status) VALUES
  (1, 1, 30, 'paid'),
  (2, 2, 12, 'paid'),
  (3, 7, 45, 'new'),
  (4, 1, 8, 'new'),
  (5, 9, 20, 'paid'),
  (6, 3, 15, 'cancelled');`

const SHOP_COLS = '-- customers: id, name\n-- orders: id, customer_id, total, status\n'

const BLOG = `CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE posts (id INTEGER PRIMARY KEY, author_id INTEGER REFERENCES authors(id), title TEXT NOT NULL);
INSERT INTO authors (id, name) VALUES (1, 'Ana'), (2, 'Ben');
INSERT INTO posts (id, author_id, title) VALUES
  (1, 1, 'Zebra facts'),
  (2, 2, 'Baking bread'),
  (3, 1, 'Moving house'),
  (4, 2, 'Fixing bikes');`

const USERS_AFTER_MIGRATION = `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO users (id, name) VALUES (1, 'Ana'), (2, 'Ben'), (3, 'Cy'), (4, 'Dee');
ALTER TABLE users ADD COLUMN email TEXT;
UPDATE users SET email = 'ben@example.com' WHERE id = 2;
UPDATE users SET email = 'dee@example.com' WHERE id = 4;`

export const u22: Unit = {
  id: 'u22',
  week: 9,
  lecture: 'https://cs50.harvard.edu/web/weeks/4/',
  lectureFrom: 'CS50 Web: SQL, models and migrations',
  course: 'dev',
  title: 'Databases in practice',
  summary: 'Migrations, transactions and beyond SQL',
  lessons: [
    {
      id: 'u22-from-code',
      title: 'Talking to a database from code',
      exercises: [
        {
          kind: 'concept',
          title: 'Connect, execute, fetch',
          body: 'Your app opens a **connection** to the database, like a phone line. It sends SQL as text with `execute`, and reads rows back with `fetchall`.\n\nEach row arrives as a tuple. Here we use Python\'s built-in `sqlite3`, and `":memory:"` means a throwaway database that lives only while the program runs.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE pets (name TEXT)")
db.execute("INSERT INTO pets VALUES ('Rex')")
rows = db.execute("SELECT name FROM pets").fetchall()`,
          language: 'python',
        },
        {
          kind: 'order',
          prompt: 'Put this program in order: connect, make a table, add a row, read it back.',
          lines: [
            'import sqlite3',
            'db = sqlite3.connect(":memory:")',
            'db.execute("CREATE TABLE pets (name TEXT)")',
            'db.execute("INSERT INTO pets VALUES (\'Rex\')")',
            'print(db.execute("SELECT name FROM pets").fetchall())',
          ],
          language: 'python',
          explain: 'You need a connection before any SQL, a table before any rows, and rows before a SELECT finds anything.',
        },
        {
          kind: 'choice',
          prompt: 'The `pets` table holds one row, Rex. What does this print?',
          code: 'print(db.execute("SELECT name FROM pets").fetchall())',
          language: 'python',
          options: ["['Rex']", 'Rex', "[('Rex',)]", "{'name': 'Rex'}"],
          answer: 2,
          explain: '`fetchall` gives a list of rows, and each row is a tuple, even with one column. The comma in `(\'Rex\',)` marks a one-item tuple.',
        },
        {
          kind: 'concept',
          title: 'Placeholders, always',
          body: 'Never glue user input into SQL text. Someone could type SQL of their own and the database would run it. That is **SQL injection**.\n\nA **parameterised query** puts a `?` where each value goes and sends the values separately. The database treats them as plain data, never as commands.',
          code: r`db.execute("SELECT * FROM users WHERE name = ?", (name,))`,
          language: 'python',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line that is open to SQL injection.',
          lines: [
            'name = input()',
            'age = int(input())',
            'db.execute(f"SELECT * FROM users WHERE name = \'{name}\'")',
            'db.execute("SELECT * FROM users WHERE age > ?", (age,))',
          ],
          language: 'python',
          answer: 2,
          explain: 'The f-string pastes whatever was typed straight into the SQL. The last line is safe because the value travels separately from the query.',
        },
        {
          kind: 'blank',
          prompt: 'Make this query safe by filling the gaps.',
          code: 'db.execute("SELECT title FROM books WHERE author = ___", (___,))',
          language: 'python',
          bank: ['?', 'author', '{author}', '"author"'],
          answers: ['?', 'author'],
          explain: 'The `?` marks the spot, and the tuple after the query supplies the value. One value still needs the trailing comma to be a tuple.',
        },
        {
          kind: 'concept',
          title: 'A safe query, start to finish',
          body: 'The `?` holds the place and `(kind,)` supplies the value. `ORDER BY name` sorts the rows A to Z.\n\nEach row comes back as a tuple, so `row[0]` is its first column.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE pets (name TEXT, kind TEXT)")
db.execute("INSERT INTO pets VALUES ('Rex', 'dog'), ('Tom', 'cat'), ('Ace', 'dog')")
kind = "dog"
rows = db.execute("SELECT name FROM pets WHERE kind = ? ORDER BY name", (kind,)).fetchall()
for row in rows:
    print(row[0])`,
          language: 'python',
          output: r`Ace
Rex`,
        },
        {
          kind: 'write',
          prompt: 'Read an author with `input()`. Select that author\'s titles from `books`, A to Z, using a `?` placeholder, and print one title per line.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (title TEXT, author TEXT)")
db.executemany("INSERT INTO books VALUES (?, ?)", [
    ("Persuasion", "Austen"),
    ("Dune", "Herbert"),
    ("Emma", "Austen"),
    ("Ulysses", "Joyce"),
])

author = input()
rows = []   # replace [] with your query and .fetchall()
for row in rows:
    print(row[0])
`,
          tests: [
            { stdin: ['Austen'], expected: 'Emma\nPersuasion' },
            { stdin: ['Joyce'], expected: 'Ulysses' },
          ],
          hint: 'db.execute("SELECT title FROM books WHERE author = ? ORDER BY title", (author,)).fetchall()',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (title TEXT, author TEXT)")
db.executemany("INSERT INTO books VALUES (?, ?)", [
    ("Persuasion", "Austen"),
    ("Dune", "Herbert"),
    ("Emma", "Austen"),
    ("Ulysses", "Joyce"),
])

author = input()
rows = db.execute("SELECT title FROM books WHERE author = ? ORDER BY title", (author,)).fetchall()
for row in rows:
    print(row[0])
`,
          explain: 'The query text never changes, whatever the user types. Only the value in the tuple does.',
        },
        {
          kind: 'type',
          prompt: 'The `pets` table has 2 rows. What does this print? Type it.',
          code: 'print(db.execute("SELECT COUNT(*) FROM pets").fetchone()[0])',
          language: 'python',
          accept: ['2'],
          explain: '`fetchone` returns a single row, here the tuple `(2,)`, and `[0]` takes the first value out of it.',
        },
        {
          kind: 'concept',
          title: 'Placeholders work for INSERT too',
          body: 'Any value can travel through a `?`, not only the ones in a `WHERE`.\n\nThis name has an apostrophe in it. Glued into the SQL text it would end the string early. Sent as a parameter, it is saved exactly as typed.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE pets (name TEXT)")
name = "Rex's twin"
db.execute("INSERT INTO pets VALUES (?)", (name,))
print(db.execute("SELECT name FROM pets").fetchone()[0])`,
          language: 'python',
          output: r`Rex's twin`,
        },
        {
          kind: 'write',
          prompt: 'Read a book title with `input()` and insert it into `books` with a `?` placeholder. The title may contain an apostrophe, and that must not break anything. The last lines print the row count and the newest title.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (title TEXT)")
db.execute("INSERT INTO books VALUES ('Dune'), ('Emma')")

title = input()
# Insert the title here.

print(db.execute("SELECT COUNT(*) FROM books").fetchone()[0])
print(db.execute("SELECT title FROM books ORDER BY rowid DESC LIMIT 1").fetchone()[0])
`,
          tests: [
            { stdin: ["O'Brien's Day"], expected: "3\nO'Brien's Day" },
            { stdin: ['Ulysses'], expected: '3\nUlysses' },
          ],
          hint: 'db.execute("INSERT INTO books VALUES (?)", (title,))',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (title TEXT)")
db.execute("INSERT INTO books VALUES ('Dune'), ('Emma')")

title = input()
db.execute("INSERT INTO books VALUES (?)", (title,))

print(db.execute("SELECT COUNT(*) FROM books").fetchone()[0])
print(db.execute("SELECT title FROM books ORDER BY rowid DESC LIMIT 1").fetchone()[0])
`,
          explain: 'Pasted into the SQL text, that apostrophe would end the string early and cause an error. As a parameter it is just another character.',
        },
      ],
    },
    {
      id: 'u22-transactions',
      title: 'Transactions and guard rails',
      exercises: [
        {
          kind: 'concept',
          title: 'All or nothing',
          body: 'Moving money takes two updates: take 50 from Ana, add 50 to Ben. If the program dies in between, 50 vanishes.\n\nA **transaction** groups changes so they all happen or none do. **Commit** makes them permanent. **Rollback** undoes everything since the transaction began.',
          code: r`db.execute("UPDATE accounts SET balance = balance - 50 WHERE name = 'ana'")
db.execute("UPDATE accounts SET balance = balance + 50 WHERE name = 'ben'")
db.commit()      # or db.rollback() to undo both`,
          language: 'python',
        },
        {
          kind: 'steps',
          prompt: 'A transfer runs as one transaction. Tap the right step for each question.',
          cells: ['BEGIN', 'Take 50 from Ana', 'Add 50 to Ben', 'COMMIT', 'ROLLBACK'],
          steps: [
            { ask: 'Which step starts the all-or-nothing group?', answer: 0 },
            { ask: 'An error hits right after "Take 50 from Ana". Which command puts her money back?', answer: 4 },
            { ask: 'Both updates worked. Which command makes them permanent?', answer: 3 },
          ],
          explain: 'Between BEGIN and COMMIT nothing is final. ROLLBACK returns the data to how it was at BEGIN.',
        },
        {
          kind: 'type',
          prompt: 'Ana has 100. A transfer takes 50 from her, then crashes before paying Ben, and the transaction rolls back. What is Ana\'s balance now? Type the number.',
          accept: ['100'],
          explain: 'Rollback undoes every change in the transaction, so the half-finished transfer never happened.',
        },
        {
          kind: 'concept',
          title: 'Rollback in action',
          body: 'The shop has 3 mugs and someone orders 5. The update runs, and the count reads -2. Nothing is final yet.\n\n`db.rollback()` undoes everything since the last `db.commit()`, so the count is 3 again.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE stock (item TEXT, amount INTEGER)")
db.execute("INSERT INTO stock VALUES ('mug', 3)")
db.commit()
db.execute("UPDATE stock SET amount = amount - 5 WHERE item = 'mug'")
print(db.execute("SELECT amount FROM stock").fetchone()[0])
db.rollback()
print(db.execute("SELECT amount FROM stock").fetchone()[0])`,
          language: 'python',
          output: r`-2
3`,
        },
        {
          kind: 'write',
          prompt: 'Finish `transfer`. After both updates, `left` holds the sender\'s new balance. If `left` is below 0, undo both updates with `db.rollback()` and print `rolled back`. Otherwise make them permanent with `db.commit()` and print `ok`.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE accounts (name TEXT, balance INTEGER)")
db.execute("INSERT INTO accounts VALUES ('ana', 100), ('ben', 20)")
db.commit()

def transfer(src, dst, amount):
    db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, src))
    db.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, dst))
    left = db.execute("SELECT balance FROM accounts WHERE name = ?", (src,)).fetchone()[0]
    # Roll back or commit here.

transfer("ana", "ben", int(input()))
print(db.execute("SELECT name, balance FROM accounts ORDER BY name").fetchall())
`,
          tests: [
            { stdin: ['50'], expected: "ok\n[('ana', 50), ('ben', 70)]" },
            { stdin: ['500'], expected: "rolled back\n[('ana', 100), ('ben', 20)]" },
          ],
          hint: 'if left < 0: db.rollback() and print("rolled back"); else: db.commit() and print("ok").',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE accounts (name TEXT, balance INTEGER)")
db.execute("INSERT INTO accounts VALUES ('ana', 100), ('ben', 20)")
db.commit()

def transfer(src, dst, amount):
    db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, src))
    db.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, dst))
    left = db.execute("SELECT balance FROM accounts WHERE name = ?", (src,)).fetchone()[0]
    if left < 0:
        db.rollback()
        print("rolled back")
    else:
        db.commit()
        print("ok")

transfer("ana", "ben", int(input()))
print(db.execute("SELECT name, balance FROM accounts ORDER BY name").fetchall())
`,
          explain: 'One rollback undid both updates together. Notice the `db.commit()` after the setup: without it, the rollback would wipe the starting balances too.',
        },
        {
          kind: 'concept',
          title: 'Constraints are guard rails',
          body: 'A **constraint** is a rule the database itself enforces on a column.\n\n`NOT NULL`: a value is required. `UNIQUE`: no two rows may share it. A **foreign key** (`REFERENCES`): the value must point at a real row in another table.\n\nBreak a rule and the database refuses the change, even if your app code forgot to check.',
          code: 'CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE\n);',
          language: 'sql',
        },
        {
          kind: 'match',
          prompt: 'Match each constraint to the mistake it stops.',
          pairs: [
            ['NOT NULL', 'A row saved with the value missing'],
            ['UNIQUE', 'Two accounts with the same email'],
            ['FOREIGN KEY', 'An order for a customer who does not exist'],
            ['CHECK (balance >= 0)', 'A balance that drops below zero'],
          ],
          explain: 'Each one turns a silent data mess into a loud, early error. `CHECK` lets you write a rule of your own.',
        },
        {
          kind: 'spot',
          prompt: 'The `email` column is `NOT NULL UNIQUE`. These run in order. Tap the INSERT the database rejects.',
          lines: [
            "INSERT INTO users (email) VALUES ('ana@example.com');",
            "INSERT INTO users (email) VALUES ('ben@example.com');",
            "INSERT INTO users (email) VALUES ('ana@example.com');",
            "INSERT INTO users (email) VALUES ('cy@example.com');",
          ],
          language: 'sql',
          answer: 2,
          explain: 'Ana\'s email is already in the table, so `UNIQUE` blocks the second copy. The other rows go in fine.',
        },
        {
          kind: 'concept',
          title: 'Catching a refusal',
          body: 'When a constraint is broken, `sqlite3` raises an error called `IntegrityError` and the program would stop.\n\nPut the risky line inside `try:`. If the error happens, Python jumps to the `except` block and carries on from there.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tags (name TEXT UNIQUE)")
db.execute("INSERT INTO tags VALUES ('red')")
try:
    db.execute("INSERT INTO tags VALUES ('red')")
    print("added")
except sqlite3.IntegrityError:
    print("already there")`,
          language: 'python',
          output: 'already there',
        },
        {
          kind: 'write',
          prompt: 'Read an email with `input()` and try to insert it. If the database refuses (it raises `sqlite3.IntegrityError`), print `taken`. If it works, print `saved`. The last line prints how many users there are.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE)")
db.execute("INSERT INTO users (email) VALUES ('ana@example.com'), ('ben@example.com')")

email = input()
db.execute("INSERT INTO users (email) VALUES (?)", (email,))
print("saved")

print(db.execute("SELECT COUNT(*) FROM users").fetchone()[0])
`,
          tests: [
            { stdin: ['cy@example.com'], expected: 'saved\n3' },
            { stdin: ['ana@example.com'], expected: 'taken\n2' },
          ],
          hint: 'Wrap the insert and `print("saved")` in `try:`, then add `except sqlite3.IntegrityError:` with `print("taken")`.',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE)")
db.execute("INSERT INTO users (email) VALUES ('ana@example.com'), ('ben@example.com')")

email = input()
try:
    db.execute("INSERT INTO users (email) VALUES (?)", (email,))
    print("saved")
except sqlite3.IntegrityError:
    print("taken")

print(db.execute("SELECT COUNT(*) FROM users").fetchone()[0])
`,
          explain: 'The database is the judge of "is this email taken?". Your code catches its answer and can turn it into a friendly message, or a 409 in an API.',
        },
        {
          kind: 'concept',
          title: 'LEFT JOIN shows the gaps',
          body: 'A plain `JOIN` drops an order when no customer matches it. `LEFT JOIN` keeps every order and fills the missing side with `NULL`.\n\nTo test for a gap, write `IS NULL`. Comparing with `= NULL` never matches.',
          code: 'SELECT orders.id, customers.name\nFROM orders\nLEFT JOIN customers ON customers.id = orders.customer_id\nORDER BY orders.id;',
          language: 'sql',
          setup: SHOP,
          output: '1|Ana\n2|Ben\n3|NULL\n4|Ana\n5|NULL\n6|Cy',
        },
        {
          kind: 'write',
          prompt: 'This `orders` table was made without a foreign key, so some orders point at customers who do not exist. List the `id` of each of those orders, smallest first.',
          language: 'sql',
          setup: SHOP,
          starter: SHOP_COLS + 'SELECT ',
          tests: [{ expected: '3\n5' }],
          hint: 'LEFT JOIN orders to customers on the customer id, then keep rows `WHERE customers.id IS NULL`.',
          solution:
            'SELECT orders.id FROM orders LEFT JOIN customers ON customers.id = orders.customer_id WHERE customers.id IS NULL ORDER BY orders.id;',
          explain: 'Rows like these are called orphans. A foreign key would have refused them on the way in, so nobody has to hunt for them later.',
        },
        {
          kind: 'choice',
          prompt: 'Your app already checks that emails are unique before saving. Why add a `UNIQUE` constraint as well?',
          options: [
            'Constraints make SELECT queries return fewer rows',
            'It lets you delete the email column later',
            'Every script, import and second server writes through the database, so only it can stop them all',
            'The database will not start without one',
          ],
          answer: 2,
          explain: 'App checks can be skipped by other code or lose a race between two requests. The constraint is the last line of defence.',
        },
      ],
    },
    {
      id: 'u22-migrations',
      title: 'Migrations',
      exercises: [
        {
          kind: 'concept',
          title: 'Changing tables safely',
          body: 'Apps grow, so tables must change: a new column here, a new table there. A table\'s structure is called its **schema**.\n\nA **migration** is a small numbered script that makes one schema change. They run in order, and the database keeps a note of which ones have already run, so each runs exactly once.',
          code: '001_create_users.sql\n002_add_email_to_users.sql\n003_create_posts.sql',
        },
        {
          kind: 'order',
          prompt: 'Put these migrations in an order that works.',
          lines: [
            'CREATE TABLE users (id, name)',
            'ALTER TABLE users ADD COLUMN email',
            'CREATE UNIQUE INDEX on users (email)',
            'CREATE TABLE posts (id, author_email REFERENCES users (email))',
          ],
          language: 'sql',
          explain: 'Each step builds on the one before: the table must exist before it gains a column, the column before it is indexed, and a column must be unique before another table can point at it.',
        },
        {
          kind: 'steps',
          prompt: 'The project has four migrations. Tap the one that runs next in each case.',
          cells: ['001 create users', '002 add email', '003 create posts', '004 add index'],
          steps: [
            { ask: 'A brand-new, empty database. Which runs first?', answer: 0 },
            { ask: 'Production has already run 001 and 002. Which runs next?', answer: 2 },
            { ask: 'A teammate\'s laptop has run up to 003. They pull your code. Which runs?', answer: 3 },
          ],
          explain: 'Every database remembers how far it got and picks up from there. That is how laptops, test servers and production end up with the same schema.',
        },
        {
          kind: 'concept',
          title: 'Numbered pairs, in order',
          body: 'Each step here is a pair: a number and some text. `sorted` orders pairs by their first item, so the numbers decide.\n\n`for number, text in ...` unpacks each pair into two names.',
          code: r`STEPS = [(2, "pour water"), (3, "stir"), (1, "add tea")]

for number, text in sorted(STEPS):
    print(number, text)`,
          language: 'python',
          output: r`1 add tea
2 pour water
3 stir`,
        },
        {
          kind: 'write',
          prompt: 'Run every migration in number order. Print `ran N` after each one (for example `ran 1`). The list is jumbled on purpose. The last lines print the columns of `users`.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")

MIGRATIONS = [
    (2, "ALTER TABLE users ADD COLUMN email TEXT"),
    (3, "CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, body TEXT)"),
    (1, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
]

# Run them in order here.

columns = [row[1] for row in db.execute("PRAGMA table_info(users)")]
print(columns)
`,
          tests: [{ expected: "ran 1\nran 2\nran 3\n['id', 'name', 'email']" }],
          hint: '`for number, sql in sorted(MIGRATIONS):` goes through them smallest number first. Inside, `db.execute(sql)` then print.',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")

MIGRATIONS = [
    (2, "ALTER TABLE users ADD COLUMN email TEXT"),
    (3, "CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, body TEXT)"),
    (1, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
]

for number, sql in sorted(MIGRATIONS):
    db.execute(sql)
    print(f"ran {number}")

columns = [row[1] for row in db.execute("PRAGMA table_info(users)")]
print(columns)
`,
          explain: 'Run out of order, migration 2 would fail because `users` did not exist yet. The numbers are what make the order certain.',
        },
        {
          kind: 'concept',
          title: 'Never edit an old migration',
          body: 'Once a migration has run somewhere, treat it as history. Databases that already ran it will never run it again, so your edit would reach new databases only. Now they disagree.\n\nMade a mistake in 002? Write a new migration that fixes it. Old databases and new ones both end up in the same place.',
        },
        {
          kind: 'choice',
          prompt: 'Migration 002 ran in production last month. Today you notice it gave a column the wrong name. What do you do?',
          options: [
            'Edit 002 and ask everyone to delete their databases',
            'Edit 002 quietly; production will pick up the change',
            'Rename the column by hand in production only',
            'Write a new migration that renames the column',
          ],
          answer: 3,
          explain: 'Production will never re-run 002, and hand edits leave no record. A new numbered migration fixes every database the same way.',
        },
        {
          kind: 'concept',
          title: 'Skip what is already done',
          body: '`continue` skips the rest of this turn of the loop and moves to the next item.\n\nHere the note of finished work is a list. In the next question it is a table, so you record a number with an `INSERT`.',
          code: r`done = [1, 2]

for number in [1, 2, 3, 4]:
    if number in done:
        continue
    done.append(number)
    print("ran", number)
print(done)`,
          language: 'python',
          output: r`ran 3
ran 4
[1, 2, 3, 4]`,
        },
        {
          kind: 'write',
          prompt: 'Real tools remember what has run. Finish `migrate()`: for each migration in order, skip it if its number is already in the `done` table; otherwise run it, insert its number into `done`, and print `ran N`. Calling `migrate()` a second time must only run what is new.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE done (number INTEGER)")

MIGRATIONS = [
    (1, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
    (2, "ALTER TABLE users ADD COLUMN email TEXT"),
]

def migrate():
    already = [row[0] for row in db.execute("SELECT number FROM done")]
    for number, sql in sorted(MIGRATIONS):
        db.execute(sql)
        print(f"ran {number}")

migrate()
MIGRATIONS.append((3, "CREATE TABLE posts (id INTEGER PRIMARY KEY, body TEXT)"))
migrate()
print(db.execute("SELECT COUNT(*) FROM done").fetchone()[0])
`,
          tests: [{ expected: 'ran 1\nran 2\nran 3\n3' }],
          hint: 'Start the loop body with `if number in already: continue`. After running one, record it: db.execute("INSERT INTO done VALUES (?)", (number,)).',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE done (number INTEGER)")

MIGRATIONS = [
    (1, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
    (2, "ALTER TABLE users ADD COLUMN email TEXT"),
]

def migrate():
    already = [row[0] for row in db.execute("SELECT number FROM done")]
    for number, sql in sorted(MIGRATIONS):
        if number in already:
            continue
        db.execute(sql)
        db.execute("INSERT INTO done VALUES (?)", (number,))
        print(f"ran {number}")

migrate()
MIGRATIONS.append((3, "CREATE TABLE posts (id INTEGER PRIMARY KEY, body TEXT)"))
migrate()
print(db.execute("SELECT COUNT(*) FROM done").fetchone()[0])
`,
          explain: 'The second call ran only migration 3. That little `done` table is the whole trick behind every migration tool.',
        },
        {
          kind: 'spot',
          prompt: 'One of these migrations can destroy data that you cannot get back without a backup. Tap it.',
          lines: [
            '005: ALTER TABLE users ADD COLUMN nickname TEXT',
            '006: CREATE INDEX idx_orders_customer ON orders (customer_id)',
            '007: ALTER TABLE users DROP COLUMN phone',
            '008: CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT)',
          ],
          language: 'sql',
          answer: 2,
          explain: 'Dropping a column deletes every value in it. Adding columns, tables and indexes only adds, so those are far safer.',
        },
        {
          kind: 'type',
          prompt: 'The project\'s newest migration is `007`. You need to add a table. What number does your new migration get? Type it.',
          accept: ['008', '8'],
          explain: 'New changes always go at the end of the line. You never slot one in between older migrations.',
        },
        {
          kind: 'concept',
          title: 'Rows with and without a value',
          body: '`NULL` means "no value here". You test for it with `IS NULL` or `IS NOT NULL`, never with `=`.\n\nThis query lists the users who do have an email.',
          code: 'SELECT name FROM users\nWHERE email IS NOT NULL\nORDER BY name;',
          language: 'sql',
          setup: USERS_AFTER_MIGRATION,
          output: 'Ben\nDee',
        },
        {
          kind: 'write',
          prompt: 'A migration just added an `email` column to `users`. Rows that existed before have `NULL` there. List the `name` of every user still missing an email, A to Z.',
          language: 'sql',
          setup: USERS_AFTER_MIGRATION,
          starter: '-- users: id, name, email\nSELECT ',
          tests: [{ expected: 'Ana\nCy' }],
          hint: 'Use `WHERE email IS NULL`. Comparing with `= NULL` never matches.',
          solution: 'SELECT name FROM users WHERE email IS NULL ORDER BY name;',
          explain: 'A new column starts empty for old rows. That is why you cannot add `NOT NULL` until the gaps are filled in.',
        },
      ],
    },
    {
      id: 'u22-orms-indexes',
      title: 'ORMs and indexes',
      exercises: [
        {
          kind: 'concept',
          title: 'What an ORM does',
          body: 'An **ORM** (object-relational mapper) is a library that lets you use tables as Python classes. One class per table, one object per row, one attribute per column.\n\nYou write `user.name = "Ana"` and `user.save()`, and the ORM writes the SQL for you. Handy, but the queries are now hidden from view.',
          code: r`class User(Model):      # the users table
    name: str
    email: str

user = User.find(3)     # one row, as an object`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Which SQL does an ORM most likely send for `User.find(3)`?',
          options: [
            'SELECT * FROM users WHERE id = 3',
            'SELECT * FROM users LIMIT 3',
            'INSERT INTO users (id) VALUES (3)',
            'SELECT 3 FROM users',
          ],
          answer: 0,
          explain: '"Find user 3" means "the row whose id is 3". Behind every ORM call sits ordinary SQL like this.',
        },
        {
          kind: 'match',
          prompt: 'Match each ORM idea to its database twin.',
          pairs: [
            ['A class', 'A table'],
            ['An object', 'A row'],
            ['An attribute', 'A column'],
            ['user.save()', 'An INSERT or UPDATE'],
          ],
          explain: 'An ORM is a translator between two ways of describing the same data.',
        },
        {
          kind: 'concept',
          title: 'The N+1 problem',
          body: 'You load 50 posts with 1 query. Then a loop prints each post\'s author, and the ORM quietly runs 1 more query per post. That is 1 + 50 queries for one page.\n\nThis is the **N+1 query problem**. The fix is to fetch everything together, with a JOIN or by asking the ORM to load authors up front.',
        },
        {
          kind: 'type',
          prompt: 'A page lists 20 orders. The code loads the orders in 1 query, then loads each order\'s customer with a separate query. How many queries run in total? Type the number.',
          accept: ['21', 'twenty-one', 'twenty one'],
          explain: 'One for the list, plus one per order: 1 + 20. With 2,000 orders it would be 2,001, which is why pages slow down as data grows.',
        },
        {
          kind: 'spot',
          prompt: 'This loop has an N+1 problem. Tap the line that fires an extra query on every pass.',
          lines: [
            'posts = Post.all()',
            'for post in posts:',
            '    print(post.title)',
            '    print(post.author.name)',
          ],
          language: 'python',
          answer: 3,
          explain: '`post.author` is not loaded yet, so the ORM fetches it from the database each time round the loop. `post.title` was already loaded.',
        },
        {
          kind: 'concept',
          title: 'One query with a JOIN',
          body: 'A `JOIN` glues each post to its author inside a single query. `ON` says how the rows pair up: the post\'s `author_id` equals the author\'s `id`.\n\nWith two tables in play, write `table.column` so it is clear which one you mean.',
          code: "SELECT posts.id, authors.name\nFROM posts\nJOIN authors ON authors.id = posts.author_id\nWHERE authors.name = 'Ana'\nORDER BY posts.id;",
          language: 'sql',
          setup: BLOG,
          output: '1|Ana\n3|Ana',
        },
        {
          kind: 'write',
          prompt: 'Fix the N+1 by hand: with one query, show each post\'s `title` and its author\'s `name`, sorted by title A to Z.',
          language: 'sql',
          setup: BLOG,
          starter: '-- authors: id, name\n-- posts: id, author_id, title\nSELECT ',
          tests: [{ expected: 'Baking bread|Ben\nFixing bikes|Ben\nMoving house|Ana\nZebra facts|Ana' }],
          hint: 'JOIN authors ON authors.id = posts.author_id, then ORDER BY posts.title.',
          solution: 'SELECT posts.title, authors.name FROM posts JOIN authors ON authors.id = posts.author_id ORDER BY posts.title;',
          explain: 'One JOIN replaces a query per post. The database is far quicker at matching rows than your loop is at asking again and again.',
        },
        {
          kind: 'concept',
          title: 'Is my index used?',
          body: 'An index lets the database jump to matching rows instead of reading them all. To check, ask for the **query plan**: put `EXPLAIN QUERY PLAN` before a query.\n\n`SCAN` means it reads every row. `SEARCH ... USING INDEX` means it jumps.\n\nIndexes are not free: each one takes space and slows down writes a little.',
          code: 'EXPLAIN QUERY PLAN\nSELECT total FROM orders WHERE customer_id = 7;',
          language: 'sql',
        },
        {
          kind: 'steps',
          prompt: 'The query `WHERE customer_id = 7` is slow on a big `orders` table. Tap the right box for each question.',
          cells: [
            'SCAN orders',
            'SEARCH orders USING INDEX idx_customer',
            'CREATE INDEX idx_customer ON orders (customer_id)',
          ],
          steps: [
            { ask: 'Which plan line means the database reads every single row?', answer: 0 },
            { ask: 'Which statement do you run to fix it?', answer: 2 },
            { ask: 'After that, which plan line do you hope to see?', answer: 1 },
          ],
          explain: 'Read the plan, add an index on the column you filter by, then read the plan again to confirm it changed.',
        },
        {
          kind: 'concept',
          title: 'Creating an index',
          body: '`CREATE INDEX name ON table (column)` builds an index on one column. You pick the name.\n\nThe plan comes back as a row, with its text in `row[3]`. This table has an index on `owner`, so the first word of the plan is `SEARCH`.',
          code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE pets (name TEXT, owner TEXT)")
db.execute("CREATE INDEX idx_owner ON pets (owner)")
row = db.execute("EXPLAIN QUERY PLAN SELECT name FROM pets WHERE owner = 'Ana'").fetchone()
print(row[3].split()[0])`,
          language: 'python',
          output: 'SEARCH',
        },
        {
          kind: 'write',
          prompt: '`plan()` returns the first word of the query plan: `SCAN` or `SEARCH`. It is printed twice. Between the two prints, create an index on `orders (customer_id)` so the second one prints `SEARCH`.',
          language: 'python',
          starter: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER)")

def plan():
    row = db.execute("EXPLAIN QUERY PLAN SELECT total FROM orders WHERE customer_id = 7").fetchone()
    return row[3].split()[0]

print(plan())
# Create the index here.
print(plan())
`,
          tests: [{ expected: 'SCAN\nSEARCH' }],
          hint: 'db.execute("CREATE INDEX idx_customer ON orders (customer_id)")',
          solution: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, total INTEGER)")

def plan():
    row = db.execute("EXPLAIN QUERY PLAN SELECT total FROM orders WHERE customer_id = 7").fetchone()
    return row[3].split()[0]

print(plan())
db.execute("CREATE INDEX idx_customer ON orders (customer_id)")
print(plan())
`,
          explain: 'Same query, new plan. You did not change the SELECT at all: the database chose the index by itself once it existed.',
        },
      ],
    },
    {
      id: 'u22-beyond',
      title: 'Beyond SQL, and backups',
      exercises: [
        {
          kind: 'concept',
          title: 'Key-value stores',
          body: 'Not every database has tables. A **key-value store** is one giant dictionary: you `set` a value under a key and `get` it back by that key.\n\nIt is very fast and very simple. The price: you can only look things up by key. No JOINs, no "find all where...". Great for caches and login sessions.',
        },
        {
          kind: 'concept',
          title: 'A dict is a tiny key-value store',
          body: 'Setting is `store[key] = value`. Getting is `store.get(key, fallback)`, which gives the fallback when the key is missing.\n\nCommands arrive as one line of text. `.split()` cuts the line into its words.',
          code: r`store = {}
store["colour"] = "blue"
print(store.get("colour", "(none)"))
print(store.get("size", "(none)"))
print("set size big".split())`,
          language: 'python',
          output: r`blue
(none)
['set', 'size', 'big']`,
        },
        {
          kind: 'choice',
          prompt: 'What does this print?',
          code: 'store = {}\nstore["a"] = "1"\nstore["a"] = "2"\nprint(store.get("a"), store.get("b", "(none)"))',
          language: 'python',
          options: ['1 (none)', '2 (none)', '1 2', '2 None'],
          answer: 1,
          explain: 'Setting a key a second time replaces the old value, so `a` holds 2. Key `b` was never set, so `.get` hands back the fallback.',
        },
        {
          kind: 'write',
          prompt: 'Build a tiny key-value store on a dict. The first input line is how many commands follow. `set KEY VALUE` saves a value. `get KEY` prints the value, or `(none)` if the key is missing.',
          language: 'python',
          starter: r`store = {}

count = int(input())
for _ in range(count):
    parts = input().split()
    # parts[0] is "set" or "get"
`,
          tests: [
            { stdin: ['4', 'set color blue', 'get color', 'get size', 'set size big'], expected: 'blue\n(none)' },
            { stdin: ['3', 'set a 1', 'set a 2', 'get a'], expected: '2' },
          ],
          hint: 'For set: `store[parts[1]] = parts[2]`. For get: `print(store.get(parts[1], "(none)"))`.',
          solution: r`store = {}

count = int(input())
for _ in range(count):
    parts = input().split()
    if parts[0] == "set":
        store[parts[1]] = parts[2]
    else:
        print(store.get(parts[1], "(none)"))
`,
          explain: 'That is the whole interface of a key-value store. Setting a key again simply replaces the old value.',
        },
        {
          kind: 'concept',
          title: 'Document stores',
          body: 'A **document store** saves JSON-like records called documents. Each one can have its own fields, and can nest lists and objects inside.\n\nFlexible, and a whole record comes back in one read. What you give up: the database no longer forces a shape, JOINs are weak or missing, and constraints are mostly your job.',
          code: '{"name": "Mug", "price": 4, "tags": ["kitchen", "gift"]}',
        },
        {
          kind: 'match',
          prompt: 'Match each kind of database to what it is like.',
          pairs: [
            ['Relational (SQL)', 'Tables with JOINs and constraints'],
            ['Key-value', 'One value looked up by its key'],
            ['Document', 'JSON-like records with flexible fields'],
          ],
          explain: 'Each trades something away. SQL gives the most safety and query power; the others give speed or flexibility for simpler jobs.',
        },
        {
          kind: 'steps',
          prompt: 'Tap the store that fits each job best.',
          cells: ['Relational (SQL)', 'Key-value', 'Document'],
          steps: [
            { ask: 'Bank accounts and transfers that must never half-happen.', answer: 0 },
            { ask: 'Login sessions, fetched by session id thousands of times a second.', answer: 1 },
            { ask: 'A product catalogue where every kind of product has different fields.', answer: 2 },
            { ask: 'Monthly reports that combine customers, orders and payments.', answer: 0 },
          ],
          explain: 'Transactions and reports across tables point to SQL. Pure lookups by key suit key-value. Varied, self-contained records suit documents.',
        },
        {
          kind: 'spot',
          prompt: 'A document store holds these products, and your code runs `doc["price"] * 2` on each one. Tap the document that makes it crash.',
          lines: [
            '{"name": "Mug", "price": 4}',
            '{"name": "Cap", "price": 9}',
            '{"name": "Pen", "cost": 2}',
            '{"name": "Bag", "price": 20}',
          ],
          answer: 2,
          explain: 'Nothing stopped someone saving `cost` instead of `price`. In SQL the table\'s columns would have refused it; here your code must check.',
        },
        {
          kind: 'concept',
          title: 'Backups and restores',
          body: 'A **backup** is a copy of the database at one moment. A **restore** loads that copy back after a disaster or a bad delete.\n\nThree habits: back up on a schedule, keep a copy somewhere else, and practise restoring. A backup you have never restored is only a hope.',
        },
        {
          kind: 'type',
          prompt: 'Backups run once a day at midnight. The disk dies at 9 pm. Up to how many hours of data are lost? Type the number.',
          accept: ['21', 'twenty-one', 'twenty one'],
          explain: 'Everything written since the last backup is gone: midnight to 9 pm is 21 hours. More frequent backups shrink that window.',
        },
        {
          kind: 'choice',
          prompt: 'Your team has made nightly backups for a year, but nobody has ever tried a restore. What is the risk?',
          options: [
            'Backups slowly use up the database\'s indexes',
            'Restoring gets slower every night',
            'The backups might be broken or incomplete, and you would only find out during an emergency',
            'There is no risk; a backup file always works',
          ],
          answer: 2,
          explain: 'Backup jobs fail quietly: an empty file, a missing table, a lost password. A practice restore is the only real test.',
        },
        {
          kind: 'concept',
          title: 'Counting by group',
          body: '`GROUP BY` puts rows with the same value into one group, and `COUNT(*)` counts the rows in each group.\n\nThis counts the orders for each customer id.',
          code: 'SELECT customer_id, COUNT(*)\nFROM orders\nGROUP BY customer_id\nORDER BY customer_id;',
          language: 'sql',
          setup: SHOP,
          output: '1|2\n2|1\n3|1\n7|1\n9|1',
        },
        {
          kind: 'write',
          prompt: 'You have just restored the shop database from a backup. As a quick sanity check, count the orders in each `status`. Show the status and its count, sorted by status A to Z.',
          language: 'sql',
          setup: SHOP,
          starter: SHOP_COLS + 'SELECT ',
          tests: [{ expected: 'cancelled|1\nnew|2\npaid|3' }],
          hint: 'SELECT status, COUNT(*) ... GROUP BY status ORDER BY status.',
          solution: 'SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status;',
          explain: 'Comparing a few counts with what you expect is a fast way to see whether a restore brought everything back.',
        },
      ],
    },
  ],
}
