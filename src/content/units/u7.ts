import type { Unit } from '../types'

// A small neighborhood bakery: what it sells (treats) and who bought what (orders).
const BAKERY = `CREATE TABLE treats (
  id INTEGER PRIMARY KEY,
  name TEXT,
  kind TEXT,
  price INTEGER,
  stock INTEGER
);
INSERT INTO treats VALUES
  (1, 'Croissant', 'pastry', 3, 12),
  (2, 'Sourdough', 'bread', 6, 5),
  (3, 'Bagel', 'bread', 2, 20),
  (4, 'Brownie', 'cake', 4, 8),
  (5, 'Cheesecake', 'cake', 7, 3),
  (6, 'Muffin', 'cake', 4, 15),
  (7, 'Baguette', 'bread', 4, 10),
  (8, 'Danish', 'pastry', 5, 6);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  treat_id INTEGER REFERENCES treats(id),
  customer TEXT,
  qty INTEGER
);
INSERT INTO orders VALUES
  (1, 1, 'Ana', 2),
  (2, 3, 'Ben', 6),
  (3, 4, 'Ana', 1),
  (4, 2, 'Cleo', 1),
  (5, 1, 'Dev', 3),
  (6, 6, 'Ben', 2),
  (7, 5, 'Cleo', 1),
  (8, 3, 'Ana', 4);
`

const TREATS_COLS = '-- treats: id, name, kind, price, stock\n'
const BOTH_COLS = '-- treats: id, name, kind, price, stock\n-- orders: id, treat_id, customer, qty\n'

// A school with clubs: one student can join many clubs, one club has many students.
const CLUBS = `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT
);
INSERT INTO students VALUES
  (1, 'Ava'), (2, 'Ben'), (3, 'Cal'), (4, 'Dee'), (5, 'Eli');
CREATE TABLE clubs (
  id INTEGER PRIMARY KEY,
  title TEXT
);
INSERT INTO clubs VALUES
  (1, 'Chess'), (2, 'Choir'), (3, 'Garden');
CREATE TABLE members (
  student_id INTEGER REFERENCES students(id),
  club_id INTEGER REFERENCES clubs(id)
);
INSERT INTO members VALUES
  (1, 1), (1, 2), (2, 1), (3, 3), (4, 1), (4, 3), (5, 2);
`

const CLUBS_COLS = '-- students: id, name\n-- clubs: id, title\n-- members: student_id, club_id\n'

// An invented music library for the lab.
const MUSIC = `CREATE TABLE artists (
  id INTEGER PRIMARY KEY,
  name TEXT
);
INSERT INTO artists VALUES
  (1, 'Paper Lanterns'),
  (2, 'Mina Okoro'),
  (3, 'The Slow Tides'),
  (4, 'DJ Marmalade');
CREATE TABLE songs (
  id INTEGER PRIMARY KEY,
  title TEXT,
  artist_id INTEGER REFERENCES artists(id),
  tempo INTEGER,
  seconds INTEGER,
  plays INTEGER
);
INSERT INTO songs VALUES
  (1, 'Rain on Tin', 1, 92, 201, 5400),
  (2, 'Kite Weather', 1, 128, 185, 8100),
  (3, 'Borrowed Bicycle', 2, 110, 224, 12000),
  (4, 'Lemon Moon', 2, 74, 251, 3000),
  (5, 'Harbour Lights', 3, 84, 312, 4500),
  (6, 'Slow Train Home', 3, 68, 275, 2600),
  (7, 'Jam Jar', 4, 140, 170, 9900),
  (8, 'Marmalade Sky', 4, 150, 163, 15000),
  (9, 'Paper Boats', 1, 101, 214, 7000),
  (10, 'Night Bus', 2, 122, 205, 6500);
`

const MUSIC_COLS = '-- artists: id, name\n-- songs: id, title, artist_id, tempo, seconds, plays\n'

// The town of Pebble Bay, for the mystery lab.
const TOWN = `CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  name TEXT,
  job TEXT
);
INSERT INTO people VALUES
  (1, 'Ada Brook', 'teacher'),
  (2, 'Dara Voss', 'caretaker'),
  (3, 'Milo Finch', 'coach'),
  (4, 'Petra Lunn', 'band leader'),
  (5, 'Ivo Marsh', 'costume shop owner'),
  (6, 'Noor Hale', 'baker'),
  (7, 'Sam Tully', 'bus driver'),
  (8, 'Lena Quill', 'librarian');
CREATE TABLE reports (
  id INTEGER PRIMARY KEY,
  day TEXT,
  place TEXT,
  description TEXT
);
INSERT INTO reports VALUES
  (1, 'Thursday', 'Library', 'A book came back forty years late.'),
  (2, 'Friday', 'Gym', 'Puffin costume gone. Side door used after 21:00.'),
  (3, 'Friday', 'Bakery', 'A bike was left outside all night.'),
  (4, 'Saturday', 'Bus stop', 'Huge bag with yellow feet seen on the Gull Rock bus.');
CREATE TABLE door_logs (
  id INTEGER PRIMARY KEY,
  person_id INTEGER REFERENCES people(id),
  door TEXT,
  day TEXT,
  time TEXT
);
INSERT INTO door_logs VALUES
  (1, 1, 'main', 'Friday', '08:05'),
  (2, 2, 'side', 'Friday', '21:10'),
  (3, 3, 'side', 'Friday', '21:25'),
  (4, 4, 'side', 'Friday', '21:40'),
  (5, 6, 'main', 'Friday', '15:30'),
  (6, 8, 'side', 'Friday', '17:45'),
  (7, 3, 'main', 'Thursday', '21:30'),
  (8, 1, 'side', 'Thursday', '22:00');
CREATE TABLE calls (
  id INTEGER PRIMARY KEY,
  caller_id INTEGER REFERENCES people(id),
  receiver_id INTEGER REFERENCES people(id),
  day TEXT,
  minutes INTEGER
);
INSERT INTO calls VALUES
  (1, 2, 6, 'Friday', 12),
  (2, 3, 1, 'Friday', 1),
  (3, 4, 5, 'Friday', 1),
  (4, 8, 7, 'Friday', 1),
  (5, 4, 6, 'Thursday', 1),
  (6, 1, 3, 'Friday', 9);
CREATE TABLE bus_tickets (
  id INTEGER PRIMARY KEY,
  person_id INTEGER REFERENCES people(id),
  destination TEXT,
  day TEXT
);
INSERT INTO bus_tickets VALUES
  (1, 3, 'Fern Hill', 'Monday'),
  (2, 4, 'Gull Rock', 'Saturday'),
  (3, 6, 'Gull Rock', 'Saturday'),
  (4, 2, 'Fern Hill', 'Sunday'),
  (5, 7, 'Mill Lane', 'Saturday');
`

const TOWN_COLS =
  '-- people: id, name, job\n-- reports: id, day, place, description\n-- door_logs: id, person_id, door, day, time\n-- calls: id, caller_id, receiver_id, day, minutes\n-- bus_tickets: id, person_id, destination, day\n'

export const u7: Unit = {
  id: 'u7',
  week: 7,
  title: 'Databases with SQL',
  summary: 'Asking questions of data',
  lessons: [
    {
      id: 'u7-tables',
      title: 'Tables, rows and columns',
      exercises: [
        {
          kind: 'concept',
          title: 'What is a database?',
          body: 'A **database** keeps data in **tables**. A table is like a spreadsheet: each **column** is one kind of fact (like price), and each **row** is one thing (like one treat).\n\n**SQL** is the language for asking a database questions.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Table', 'A grid of data about one kind of thing'],
            ['Row', 'One record, like one treat'],
            ['Column', 'One fact every row has, like price'],
            ['SQL', 'The language for asking questions'],
          ],
          explain: 'Picture a spreadsheet: the whole sheet is the table, each line across is a row, each heading down is a column.',
        },
        {
          kind: 'concept',
          title: 'SELECT and FROM',
          body: 'Our bakery has a `treats` table with the columns `id`, `name`, `kind`, `price` and `stock`.\n\n`SELECT` picks which columns you want. `FROM` names the table. The answer comes back as rows.',
          code: 'SELECT name, price FROM treats;',
          language: 'sql',
          setup: BAKERY,
          output: 'Croissant|3\nSourdough|6\nBagel|2\nBrownie|4\nCheesecake|7\nMuffin|4\nBaguette|4\nDanish|5',
        },
        {
          kind: 'choice',
          prompt: 'Which query lists every treat with its name and stock?',
          options: [
            'SELECT name, stock FROM treats;',
            'SELECT treats FROM name, stock;',
            'FROM treats SELECT name, stock;',
            'SELECT name stock treats;',
          ],
          answer: 0,
          explain: 'Columns come right after `SELECT`, separated by commas, and the table comes after `FROM`.',
        },
        {
          kind: 'blank',
          prompt: 'List the kind of every treat.',
          code: '___ kind ___ treats;',
          language: 'sql',
          bank: ['SELECT', 'FROM', 'WHERE', 'TABLE'],
          answers: ['SELECT', 'FROM'],
          explain: 'Every query you write here follows the same shape: `SELECT` columns `FROM` a table.',
        },
        {
          kind: 'concept',
          title: 'Star and sorting',
          body: '`SELECT *` means every column.\n\nRows come back in no promised order, so add `ORDER BY column` to sort them. Text sorts A to Z, numbers smallest first.',
          code: 'SELECT * FROM treats ORDER BY price;',
          language: 'sql',
        },
        {
          kind: 'choice',
          prompt: 'Here are three rows from `treats`. With `ORDER BY stock`, which name comes first?',
          code: `name       | stock
Croissant  | 12
Bagel      | 20
Cheesecake | 3`,
          options: ['Cheesecake', 'Bagel', 'Croissant', 'They come back in the order shown'],
          answer: 0,
          explain: 'Numbers sort smallest first, and 3 is the smallest stock.',
        },
        {
          kind: 'order',
          prompt: 'Put the parts in order: names and prices of all treats, cheapest first.',
          lines: ['SELECT name, price', 'FROM treats', 'ORDER BY price;'],
          language: 'sql',
          explain: 'SQL wants its parts in a fixed order: `SELECT`, then `FROM`, then `ORDER BY`.',
        },
        {
          kind: 'write',
          prompt: 'List the name of every treat, sorted A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [
            { expected: 'Bagel\nBaguette\nBrownie\nCheesecake\nCroissant\nDanish\nMuffin\nSourdough' },
          ],
          hint: 'Select the `name` column from `treats` and add `ORDER BY name`.',
          solution: 'SELECT name FROM treats ORDER BY name;',
          explain: 'Text columns sort alphabetically with `ORDER BY`. Lines starting with `--` are comments that SQL ignores.',
        },
        {
          kind: 'write',
          prompt: 'Show the name and stock of every treat, smallest stock first.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [
            {
              expected:
                'Cheesecake|3\nSourdough|5\nDanish|6\nBrownie|8\nBaguette|10\nCroissant|12\nMuffin|15\nBagel|20',
            },
          ],
          hint: 'Two columns after `SELECT`, then `ORDER BY stock`.',
          solution: 'SELECT name, stock FROM treats ORDER BY stock;',
          explain: 'The bakery can now see at a glance what is running low.',
        },
      ],
    },
    {
      id: 'u7-where',
      title: 'Filtering rows',
      exercises: [
        {
          kind: 'concept',
          title: 'WHERE',
          body: '`WHERE` keeps only the rows that pass a test.\n\nCompare with `=`, `<`, `>`, `<=`, `>=` and `!=` (not equal). Text goes in single quotes.',
          code: "SELECT name FROM treats WHERE kind = 'cake';",
          language: 'sql',
          setup: BAKERY,
          output: 'Brownie\nCheesecake\nMuffin',
        },
        {
          kind: 'choice',
          prompt: 'Which query finds treats that cost less than 4?',
          options: [
            'SELECT name FROM treats WHERE price < 4;',
            'SELECT name FROM treats IF price < 4;',
            'SELECT name WHERE price < 4 FROM treats;',
            'SELECT name FROM treats WHERE price > 4;',
          ],
          answer: 0,
          explain: '`WHERE` comes after `FROM`, and `<` means less than.',
        },
        {
          kind: 'blank',
          prompt: 'List the names of all bread.',
          code: 'SELECT name FROM treats ___ kind = ___;',
          language: 'sql',
          bank: ['WHERE', "'bread'", 'bread', 'IF'],
          answers: ['WHERE', "'bread'"],
          explain: "Text values need single quotes. Without them, SQL thinks `bread` is the name of a column.",
        },
        {
          kind: 'concept',
          title: 'AND, OR and DESC',
          body: 'Join tests with `AND` (both must pass) or `OR` (either one can pass).\n\nAdd `DESC` (short for descending) after `ORDER BY` to sort biggest first.',
          code: "SELECT name FROM treats\nWHERE kind = 'cake' AND price < 5\nORDER BY price DESC;",
          language: 'sql',
        },
        {
          kind: 'choice',
          prompt: 'Which test finds cakes that also cost less than 5?',
          options: [
            "WHERE kind = 'cake' AND price < 5",
            "WHERE kind = 'cake' OR price < 5",
            "WHERE kind = 'cake', price < 5",
            "WHERE kind = 'cake' + price < 5",
          ],
          answer: 0,
          explain: '`AND` needs both tests to pass. `OR` would also let in cheap treats that are not cakes.',
        },
        {
          kind: 'write',
          prompt: 'List the name and price of every bread, most expensive first.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT name, price\nFROM treats\n',
          tests: [{ expected: 'Sourdough|6\nBaguette|4\nBagel|2' }],
          hint: "Add `WHERE kind = 'bread'`, then `ORDER BY price DESC`.",
          solution: "SELECT name, price FROM treats WHERE kind = 'bread' ORDER BY price DESC;",
          explain: '`WHERE` picks the rows, then `ORDER BY ... DESC` puts the biggest price on top.',
        },
        {
          kind: 'concept',
          title: 'LIKE and LIMIT',
          body: '`LIKE` matches text patterns. `%` stands for any run of letters (or none), so `\'B%\'` means "starts with B".\n\n`LIMIT 3` keeps only the first 3 rows of the answer.',
          code: "SELECT name FROM treats\nWHERE name LIKE '%cake'\nLIMIT 3;",
          language: 'sql',
          setup: BAKERY,
          output: 'Cheesecake',
        },
        {
          kind: 'match',
          prompt: 'Match each LIKE pattern to what it finds.',
          pairs: [
            ["'B%'", 'Starts with B'],
            ["'%e'", 'Ends with e'],
            ["'%ou%'", 'Has "ou" anywhere'],
            ["'Bagel'", 'Exactly Bagel'],
          ],
          explain: 'Put `%` wherever any letters are allowed. With no `%` at all, LIKE matches only the exact text.',
        },
        {
          kind: 'choice',
          prompt: 'You want the 3 cheapest treats. How should the query end?',
          options: [
            'ORDER BY price LIMIT 3;',
            'LIMIT 3 ORDER BY price;',
            'ORDER BY price DESC LIMIT 3;',
            'ORDER BY price TOP 3;',
          ],
          answer: 0,
          explain: 'Sort first, cheapest at the top, then `LIMIT` keeps the first 3. `DESC` would give the most expensive ones.',
        },
        {
          kind: 'write',
          prompt: 'List the names of treats that start with B, sorted A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: 'Bagel\nBaguette\nBrownie' }],
          hint: "Use `WHERE name LIKE 'B%'` and `ORDER BY name`.",
          solution: "SELECT name FROM treats WHERE name LIKE 'B%' ORDER BY name;",
          explain: "`'B%'` matches a B followed by anything, so all three B treats come back.",
        },
      ],
    },
    {
      id: 'u7-aggregate',
      title: 'Counting and adding up',
      exercises: [
        {
          kind: 'concept',
          title: 'Squashing rows into one answer',
          body: '**Aggregate functions** turn many rows into one answer. `COUNT(*)` counts rows, `SUM(col)` adds a column up, `AVG(col)` finds the average, and `MIN` and `MAX` find the smallest and largest.',
          code: 'SELECT COUNT(*) FROM treats;   -- 8',
          language: 'sql',
        },
        {
          kind: 'match',
          prompt: 'Match each function to what it tells the bakery.',
          pairs: [
            ['COUNT(*)', 'How many rows there are'],
            ['SUM(stock)', 'All the stock added together'],
            ['AVG(price)', 'The average price'],
            ['MAX(price)', 'The highest price'],
          ],
          explain: 'Each one reads a whole column (or all rows) and gives back a single number.',
        },
        {
          kind: 'choice',
          prompt: "What does `SELECT COUNT(*) FROM treats WHERE kind = 'cake';` give back?",
          options: [
            'One row: how many cakes there are',
            'The name of every cake',
            'The total price of all cakes',
            'An error, because COUNT needs a column name',
          ],
          answer: 0,
          explain: '`WHERE` keeps only cakes, then `COUNT(*)` counts those rows into a single number.',
        },
        {
          kind: 'blank',
          prompt: 'Find the average price of bread.',
          code: "SELECT ___(price) FROM treats WHERE kind = 'bread';",
          language: 'sql',
          bank: ['AVG', 'SUM', 'COUNT', 'MEAN'],
          answers: ['AVG'],
          explain: 'SQL calls the average `AVG`. There is no `MEAN` function.',
        },
        {
          kind: 'write',
          prompt: 'How many treats cost 4 or more? Return just the count.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: '6' }],
          hint: 'Use `COUNT(*)` with `WHERE price >= 4`.',
          solution: 'SELECT COUNT(*) FROM treats WHERE price >= 4;',
          explain: 'Only one row comes back, so there is nothing to sort.',
        },
        {
          kind: 'concept',
          title: 'GROUP BY',
          body: '`GROUP BY kind` sorts rows into piles that share the same kind, then runs the function once per pile.\n\nYou get one row per group.',
          code: 'SELECT kind, COUNT(*) FROM treats\nGROUP BY kind\nORDER BY kind;\n-- bread|3\n-- cake|3\n-- pastry|2',
          language: 'sql',
        },
        {
          kind: 'choice',
          prompt: 'The bakery sells three kinds: bread, cake and pastry. How many rows does `SELECT kind, SUM(stock) FROM treats GROUP BY kind;` return?',
          options: ['3', '1', '8', '79'],
          answer: 0,
          explain: 'One row per group, and there are three kinds.',
        },
        {
          kind: 'order',
          prompt: 'Put the parts in order: the average price for each kind, sorted by kind.',
          lines: ['SELECT kind, AVG(price)', 'FROM treats', 'GROUP BY kind', 'ORDER BY kind;'],
          language: 'sql',
          explain: '`GROUP BY` comes after `FROM` (and after `WHERE`, if there is one), and `ORDER BY` comes last.',
        },
        {
          kind: 'write',
          prompt: 'For each kind, show the kind and its total stock, sorted by kind A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: 'bread|35\ncake|26\npastry|18' }],
          hint: 'Select `kind, SUM(stock)`, then `GROUP BY kind` and `ORDER BY kind`.',
          solution: 'SELECT kind, SUM(stock) FROM treats GROUP BY kind ORDER BY kind;',
          explain: 'Each kind becomes one pile, and `SUM` adds up the stock in that pile.',
        },
        {
          kind: 'write',
          prompt: 'For each kind, show the kind and its average price, sorted by kind A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: 'bread|4\ncake|5\npastry|4' }],
          hint: 'Same shape as before, with `AVG(price)` instead of `SUM(stock)`.',
          solution: 'SELECT kind, AVG(price) FROM treats GROUP BY kind ORDER BY kind;',
          explain: 'Swap the function and the same grouped query answers a new question.',
        },
      ],
    },
    {
      id: 'u7-join',
      title: 'Joining tables',
      exercises: [
        {
          kind: 'concept',
          title: 'Keys link tables',
          body: "Each treat has a unique `id`. That is its **primary key**.\n\nA second table, `orders`, has `id`, `treat_id`, `customer` and `qty`. Its `treat_id` holds a treat's id. A column that points to another table's key is a **foreign key**.",
        },
        {
          kind: 'choice',
          prompt: "Why does `orders` store `treat_id` instead of copying the treat's name and price?",
          options: [
            'So each fact lives in one place: change a price once and every order sees it',
            'Because SQL tables cannot hold text',
            'Because numbers are always more accurate than names',
            'So the orders table looks shorter',
          ],
          answer: 0,
          explain: 'Copying the same facts into many rows means they can drift apart. A key points to the single true copy.',
        },
        {
          kind: 'choice',
          prompt: 'Order 5 has `treat_id` 1. Using these rows from `treats`, what was ordered?',
          code: `id | name
1  | Croissant
2  | Sourdough
3  | Bagel`,
          options: ['Croissant', 'Bagel', 'Order 1', 'Sourdough'],
          answer: 0,
          explain: "The foreign key 1 matches the treat whose primary key `id` is 1, which is Croissant.",
        },
        {
          kind: 'concept',
          title: 'JOIN',
          body: '`JOIN` glues two tables together row by row. `ON` says which columns must match.\n\nWrite `table.column` when you need to say which table a column belongs to.',
          code: 'SELECT orders.customer, treats.name\nFROM orders\nJOIN treats ON orders.treat_id = treats.id;',
          language: 'sql',
        },
        {
          kind: 'blank',
          prompt: 'Join each order to its treat.',
          code: 'SELECT customer, name\nFROM orders\nJOIN treats ___ orders.treat_id = ___;',
          language: 'sql',
          bank: ['ON', 'treats.id', 'orders.id', 'WHERE'],
          answers: ['ON', 'treats.id'],
          explain: "The foreign key `orders.treat_id` must equal the treat's primary key `treats.id`.",
        },
        {
          kind: 'match',
          prompt: 'Match each term to its meaning.',
          pairs: [
            ['Primary key', 'A column that uniquely names each row'],
            ['Foreign key', 'A column that points to a row in another table'],
            ['JOIN', 'Combines rows from two tables'],
            ['ON', 'Says which columns must match'],
          ],
          explain: 'Keys make the links, and `JOIN ... ON` follows them.',
        },
        {
          kind: 'order',
          prompt: "Put the parts in order: the treat and quantity of each of Ben's orders, by order id.",
          lines: [
            'SELECT treats.name, orders.qty',
            'FROM orders',
            'JOIN treats ON orders.treat_id = treats.id',
            "WHERE orders.customer = 'Ben'",
            'ORDER BY orders.id;',
          ],
          language: 'sql',
          explain: '`JOIN` belongs right after `FROM`, since together they say where the rows come from. Then filter, then sort.',
        },
        {
          kind: 'write',
          prompt: "Show each order's customer and the name of the treat they bought, sorted by order id.",
          language: 'sql',
          setup: BAKERY,
          starter: BOTH_COLS + 'SELECT ',
          tests: [
            {
              expected:
                'Ana|Croissant\nBen|Bagel\nAna|Brownie\nCleo|Sourdough\nDev|Croissant\nBen|Muffin\nCleo|Cheesecake\nAna|Bagel',
            },
          ],
          hint: 'Select `orders.customer, treats.name`, join on `orders.treat_id = treats.id`, and `ORDER BY orders.id`.',
          solution:
            'SELECT orders.customer, treats.name FROM orders JOIN treats ON orders.treat_id = treats.id ORDER BY orders.id;',
          explain: 'Each order row finds its matching treat row, so names replace the bare numbers.',
        },
        {
          kind: 'concept',
          title: 'JOIN, then GROUP BY',
          body: 'A joined result can be grouped like any table. The join gives every order its treat. `GROUP BY treats.kind` then piles the orders up by kind, and `SUM` adds the quantities in each pile.',
          code: 'SELECT treats.kind, SUM(orders.qty)\nFROM orders\nJOIN treats ON orders.treat_id = treats.id\nGROUP BY treats.kind\nORDER BY treats.kind;',
          language: 'sql',
          setup: BAKERY,
          output: 'bread|11\ncake|4\npastry|5',
        },
        {
          kind: 'write',
          prompt: 'For each treat that has been ordered, show its name and the total quantity ordered, sorted by name A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: BOTH_COLS + 'SELECT ',
          tests: [{ expected: 'Bagel|10\nBrownie|1\nCheesecake|1\nCroissant|5\nMuffin|2\nSourdough|1' }],
          hint: 'Join the tables, then `GROUP BY treats.name` and use `SUM(orders.qty)`.',
          solution:
            'SELECT treats.name, SUM(orders.qty) FROM orders JOIN treats ON orders.treat_id = treats.id GROUP BY treats.name ORDER BY treats.name;',
          explain: 'JOIN and GROUP BY work together: first link each order to its treat, then pile up the orders per treat.',
        },
      ],
    },
    {
      id: 'u7-changes',
      title: 'Changing data safely',
      exercises: [
        {
          kind: 'concept',
          title: 'INSERT, UPDATE, DELETE',
          body: 'SQL can change data too. `INSERT` adds rows, `UPDATE` changes values in rows, and `DELETE` removes rows.\n\nWith `UPDATE` and `DELETE`, the `WHERE` decides which rows get changed.',
          code: "INSERT INTO treats (name, kind, price, stock)\nVALUES ('Scone', 'pastry', 3, 9);\n\nUPDATE treats SET price = 5 WHERE name = 'Bagel';\n\nDELETE FROM treats WHERE stock = 0;",
          language: 'sql',
        },
        {
          kind: 'match',
          prompt: 'Match each command to what it does.',
          pairs: [
            ['INSERT', 'Adds new rows'],
            ['UPDATE', 'Changes values in existing rows'],
            ['DELETE', 'Removes rows'],
            ['SELECT', 'Reads rows without changing anything'],
          ],
          explain: 'Only `SELECT` is read-only. The other three change what is stored.',
        },
        {
          kind: 'blank',
          prompt: 'The muffins sold out. Set their stock to 0.',
          code: "___ treats ___ stock = 0 WHERE name = 'Muffin';",
          language: 'sql',
          bank: ['UPDATE', 'SET', 'INSERT', 'TO'],
          answers: ['UPDATE', 'SET'],
          explain: '`UPDATE` names the table, `SET` gives the new value, and `WHERE` picks the row.',
        },
        {
          kind: 'choice',
          prompt: 'What does `DELETE FROM treats;` do, with no `WHERE`?',
          options: [
            'Removes every row in the table',
            'Removes nothing, because there is no WHERE',
            'Removes only the first row',
            'Removes the table and its columns',
          ],
          answer: 0,
          explain: 'With no `WHERE`, every row matches. A safe habit: run a `SELECT` with the same `WHERE` first to see what would go.',
        },
        {
          kind: 'write',
          prompt: 'Before running `DELETE FROM treats WHERE stock < 6`, preview it: show the name and stock of the rows it would remove, smallest stock first.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: 'Cheesecake|3\nSourdough|5' }],
          hint: 'Use `SELECT name, stock FROM treats` with the same `WHERE`, then `ORDER BY stock`.',
          solution: 'SELECT name, stock FROM treats WHERE stock < 6 ORDER BY stock;',
          explain: 'Same `WHERE`, same rows. If the preview looks right, the delete is safe to run.',
        },
        {
          kind: 'concept',
          title: 'SQL injection',
          body: 'Programs often build SQL from what users type. If you paste their text straight into the query, a user can type SQL instead of a name, and the database runs it.\n\nThis attack is called **SQL injection**.',
          code: `name = input()
db.execute(f"SELECT * FROM users WHERE name = '{name}'")`,
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: "A user types `x' OR '1'='1` as their name into that code. What happens?",
          options: [
            'The query returns every user, because the test is now always true',
            'The query finds no one named that',
            'Python refuses to run the query',
            'The database deletes the users table',
          ],
          answer: 0,
          explain: "The quote ends the name early, and `OR '1'='1'` is true for every row. The user changed the meaning of the query.",
        },
        {
          kind: 'choice',
          prompt: 'Which line is safe from SQL injection?',
          code: 'name = input()',
          language: 'python',
          options: [
            'db.execute("SELECT * FROM users WHERE name = ?", (name,))',
            'db.execute(f"SELECT * FROM users WHERE name = \'{name}\'")',
            'db.execute("SELECT * FROM users WHERE name = \'" + name + "\'")',
            'db.execute(f"SELECT * FROM users WHERE name = \'{name.upper()}\'")',
          ],
          answer: 0,
          explain: 'The `?` is a **placeholder**: the database fills it in as plain data, so typed text can never become SQL.',
        },
        {
          kind: 'blank',
          prompt: 'Make this lookup safe with a placeholder.',
          code: 'db.execute("SELECT price FROM treats WHERE name = ___", (item,))',
          language: 'python',
          bank: ['?', "'{item}'", 'item', '"item"'],
          answers: ['?'],
          explain: 'The `?` marks where the value goes, and the value itself is passed separately in `(item,)`.',
        },
        {
          kind: 'write',
          prompt: "Before running `UPDATE treats SET price = price + 1 WHERE kind = 'cake'`, check how many rows it would change. Return just the count.",
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT ',
          tests: [{ expected: '3' }],
          hint: "Use `COUNT(*)` with the same `WHERE kind = 'cake'`.",
          solution: "SELECT COUNT(*) FROM treats WHERE kind = 'cake';",
          explain: 'Counting first tells you the size of the change before you make it. Three cakes will get a new price.',
        },
      ],
    },
    {
      id: 'u7-subqueries',
      title: 'Queries inside queries',
      exercises: [
        {
          kind: 'concept',
          title: 'A query in brackets',
          body: 'A **subquery** is a whole `SELECT` written in brackets inside another query. SQL runs the inner one first, then uses its answer in the outer one.\n\nHere the inner query finds the average price. The outer query keeps treats that cost more.',
          code: 'SELECT name FROM treats\nWHERE price > (SELECT AVG(price) FROM treats);',
          language: 'sql',
        },
        {
          kind: 'steps',
          prompt: 'Act out the query. The boxes are its four parts, in the order they are written.',
          cells: ['SELECT name', 'FROM treats', 'WHERE price >', '(SELECT AVG…)'],
          steps: [
            { ask: 'Which part does SQL work out first?', answer: 3 },
            { ask: 'The inner query gives one number. Which part compares each price to it?', answer: 2 },
            { ask: 'Which part decides what is shown for each row that passes?', answer: 0 },
          ],
          explain: 'Inner first: the brackets turn into a single number, and then the outer query runs as if you had typed that number yourself.',
        },
        {
          kind: 'type',
          prompt: 'The highest treat price is 7. What number does the bracket part turn into? Type it.',
          code: 'SELECT name FROM treats\nWHERE price = (SELECT MAX(price) FROM treats);',
          language: 'sql',
          accept: ['7'],
          explain: 'The inner query returns one value, 7, so the outer query becomes `WHERE price = 7`.',
        },
        {
          kind: 'write',
          prompt: 'List the names of treats that cost more than the average price, sorted A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: TREATS_COLS + 'SELECT name FROM treats\nWHERE price > (SELECT )\nORDER BY name;',
          tests: [{ expected: 'Cheesecake\nDanish\nSourdough' }],
          hint: 'Inside the brackets write `SELECT AVG(price) FROM treats`.',
          solution: 'SELECT name FROM treats WHERE price > (SELECT AVG(price) FROM treats) ORDER BY name;',
          explain: 'You never had to know the average yourself. If prices change tomorrow, the same query still works.',
        },
        {
          kind: 'concept',
          title: 'IN: is it on the list?',
          body: '`IN` checks whether a value is on a list. The list can be typed out, or it can come from a subquery that returns one column.\n\n`NOT IN` keeps the rows that are **not** on the list.',
          code: "SELECT name FROM treats WHERE kind IN ('bread', 'cake');\n\nSELECT name FROM treats\nWHERE id IN (SELECT treat_id FROM orders);",
          language: 'sql',
        },
        {
          kind: 'blank',
          prompt: "Find the names of treats that appear in Ben's orders.",
          code: "SELECT name FROM treats\nWHERE id ___ (SELECT ___ FROM orders WHERE customer = 'Ben');",
          language: 'sql',
          bank: ['IN', 'treat_id', 'customer', '='],
          answers: ['IN', 'treat_id'],
          explain: 'The inner query lists the treat ids Ben ordered. `IN` keeps the treats whose id is on that list.',
        },
        {
          kind: 'spot',
          prompt: 'This query should list every treat that has been ordered, but the inner query gives back many ids, not one. Tap the line with the bug.',
          lines: ['SELECT name', 'FROM treats', 'WHERE id = (SELECT treat_id FROM orders)', 'ORDER BY name;'],
          language: 'sql',
          answer: 2,
          explain: '`=` compares with a single value. When the inner query returns a whole list, use `IN`.',
        },
        {
          kind: 'write',
          prompt: 'List the names of the treats Ana has ordered, sorted A to Z. Use `IN` with a subquery.',
          language: 'sql',
          setup: BAKERY,
          starter: BOTH_COLS + 'SELECT name FROM treats\nWHERE id IN (SELECT )\nORDER BY name;',
          tests: [{ expected: 'Bagel\nBrownie\nCroissant' }],
          hint: "The inner query is `SELECT treat_id FROM orders WHERE customer = 'Ana'`.",
          solution:
            "SELECT name FROM treats WHERE id IN (SELECT treat_id FROM orders WHERE customer = 'Ana') ORDER BY name;",
          explain: 'The inner query answers "which ids?", and the outer query turns those ids into names.',
        },
        {
          kind: 'concept',
          title: 'NOT IN',
          body: '`NOT IN` flips the test. This query keeps every treat whose kind is **not** on the list, so only the pastries are left.\n\nThe list in the brackets can also come from a subquery, exactly as with `IN`.',
          code: "SELECT name FROM treats\nWHERE kind NOT IN ('bread', 'cake')\nORDER BY name;",
          language: 'sql',
          setup: BAKERY,
          output: 'Croissant\nDanish',
        },
        {
          kind: 'write',
          prompt: 'Which treats has nobody ordered yet? List their names, sorted A to Z.',
          language: 'sql',
          setup: BAKERY,
          starter: BOTH_COLS + 'SELECT name FROM treats\nWHERE id ',
          tests: [{ expected: 'Baguette\nDanish' }],
          hint: 'Use `NOT IN (SELECT treat_id FROM orders)`, then `ORDER BY name`.',
          solution: 'SELECT name FROM treats WHERE id NOT IN (SELECT treat_id FROM orders) ORDER BY name;',
          explain: '`NOT IN` flips the test: keep every treat whose id never shows up in the orders table.',
        },
      ],
    },
    {
      id: 'u7-design',
      title: 'Designing tables',
      exercises: [
        {
          kind: 'concept',
          title: 'Every column has a type',
          body: 'When you create a table, each column gets a **data type**: the kind of value it may hold.\n\n`INTEGER` is a whole number, `REAL` is a number with a decimal point, and `TEXT` is words. `NULL` means "no value here".',
          code: 'CREATE TABLE students (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  height REAL\n);',
          language: 'sql',
        },
        {
          kind: 'match',
          prompt: 'Match each fact to the best type for its column.',
          pairs: [
            ['How many seats a bus has', 'INTEGER'],
            ['The name of a street', 'TEXT'],
            ['A weight like 2.75', 'REAL'],
            ['A phone number not given yet', 'NULL'],
          ],
          explain: 'Whole numbers are INTEGER, decimals are REAL, words are TEXT, and a missing value is NULL.',
        },
        {
          kind: 'concept',
          title: 'How tables relate',
          body: '**One-to-many:** one artist has many songs. Each song row holds one foreign key, `artist_id`.\n\n**Many-to-many:** a student joins many clubs, and a club has many students. That needs a third **joining table** where each row pairs one student with one club.',
          code: 'CREATE TABLE members (\n  student_id INTEGER REFERENCES students(id),\n  club_id INTEGER REFERENCES clubs(id)\n);',
          language: 'sql',
        },
        {
          kind: 'choice',
          prompt: 'Ava joins both Chess and Choir. Where is that stored?',
          options: [
            'In one students row, with both club names in a single column',
            'In two rows of the members table, one per club',
            'In two copies of Ava in the students table',
            'In the clubs table, in a column named Ava',
          ],
          answer: 1,
          explain: 'Each row of the joining table is one link. Two clubs means two rows, and Ava herself is still stored only once.',
        },
        {
          kind: 'concept',
          title: 'Two joins in a row',
          body: 'To get from clubs to students you cross the joining table, so you write two `JOIN`s. Each has its own `ON`.\n\nThis finds the clubs Ava is in: clubs link to members, and members link to students.',
          code: "SELECT clubs.title\nFROM clubs\nJOIN members ON members.club_id = clubs.id\nJOIN students ON members.student_id = students.id\nWHERE students.name = 'Ava'\nORDER BY clubs.title;",
          language: 'sql',
          setup: CLUBS,
          output: 'Chess\nChoir',
        },
        {
          kind: 'write',
          prompt: 'List the names of the students in the Chess club, sorted A to Z. The first join is done. Add a second join to `clubs`, then filter and sort.',
          language: 'sql',
          setup: CLUBS,
          starter:
            CLUBS_COLS +
            'SELECT students.name\nFROM students\nJOIN members ON members.student_id = students.id\n',
          tests: [{ expected: 'Ava\nBen\nDee' }],
          hint: "Add `JOIN clubs ON members.club_id = clubs.id`, then `WHERE clubs.title = 'Chess'` and `ORDER BY students.name`.",
          solution:
            "SELECT students.name FROM students JOIN members ON members.student_id = students.id JOIN clubs ON members.club_id = clubs.id WHERE clubs.title = 'Chess' ORDER BY students.name;",
          explain: 'The joining table is the bridge: students link to members, and members link to clubs.',
        },
        {
          kind: 'concept',
          title: 'Indexes',
          body: 'Without help, a database finds a name by checking every row, one by one. An **index** is a sorted copy of one column, like the index at the back of a book, so it can jump close to the answer.\n\nLookups get much faster. The cost is extra space and slightly slower inserts.',
          code: 'CREATE INDEX name_index ON students (name);',
          language: 'sql',
        },
        {
          kind: 'steps',
          prompt: 'The index keeps names sorted, so the database can halve the search each time. Find Fay.',
          cells: ['Ava', 'Ben', 'Cal', 'Dee', 'Eli', 'Fay', 'Gus'],
          steps: [
            { ask: 'All seven names are possible. Which box is checked first?', answer: 3 },
            { ask: 'Fay comes after Dee, so only Eli, Fay and Gus are left. Which box is checked next?', answer: 5 },
          ],
          explain: 'Two checks instead of six. With a million rows, a sorted index needs about 20 checks instead of up to a million.',
        },
        {
          kind: 'concept',
          title: 'Two buyers, one cheesecake',
          body: 'A **race condition** is a bug that appears when two things happen at the same moment. Two shoppers both see `stock = 1`, and both buy.\n\nA **transaction** groups steps so they run as one unit, all or nothing, with nobody else cutting in halfway.',
          code: "BEGIN TRANSACTION;\nUPDATE treats SET stock = stock - 1 WHERE name = 'Cheesecake';\nINSERT INTO orders (treat_id, customer, qty) VALUES (5, 'Ana', 1);\nCOMMIT;",
          language: 'sql',
        },
        {
          kind: 'type',
          prompt: 'Stock is 1. Ana and Ben both check it at the same moment, both see 1, and both run `stock = stock - 1`. What is the stock now? Type the number.',
          accept: ['-1', '−1', 'minus 1', 'minus one'],
          explain: 'Each check passed before the other sale was saved, so the shop sold a cake it did not have. A transaction makes "check, then buy" one unbroken step.',
        },
        {
          kind: 'blank',
          prompt: 'Wrap the sale so both changes happen together or not at all.',
          code: "___ TRANSACTION;\nUPDATE treats SET stock = stock - 1 WHERE id = 5;\nINSERT INTO orders (treat_id, customer, qty) VALUES (5, 'Ben', 1);\n___;",
          language: 'sql',
          bank: ['BEGIN', 'COMMIT', 'START NOW', 'SAVE'],
          answers: ['BEGIN', 'COMMIT'],
          explain: '`BEGIN TRANSACTION` opens the group and `COMMIT` saves it. If something fails in between, none of it is kept.',
        },
      ],
    },
    {
      id: 'u7-lab-music',
      title: 'Lab: music library',
      exercises: [
        {
          kind: 'concept',
          title: 'Your music library',
          body: 'Time to practise on a new database. `artists` has `id` and `name`. `songs` has `id`, `title`, `artist_id`, `tempo` (beats per minute), `seconds` (length) and `plays`.\n\nEach song points to its artist with `artist_id`. The column names are shown above every query.',
        },
        {
          kind: 'concept',
          title: 'Reminder: filter, then sort',
          body: '`WHERE` keeps the rows that pass a test. `ORDER BY ... DESC` then sorts them biggest first.\n\nHere are the songs with more than 8000 plays, most played at the top.',
          code: 'SELECT title, plays\nFROM songs\nWHERE plays > 8000\nORDER BY plays DESC;',
          language: 'sql',
          setup: MUSIC,
          output: 'Marmalade Sky|15000\nBorrowed Bicycle|12000\nJam Jar|9900\nKite Weather|8100',
        },
        {
          kind: 'write',
          prompt: 'Find the dance tracks: show the title and tempo of every song with a tempo over 120, fastest first.',
          language: 'sql',
          setup: MUSIC,
          starter: MUSIC_COLS + 'SELECT title, tempo\nFROM songs\n',
          tests: [{ expected: 'Marmalade Sky|150\nJam Jar|140\nKite Weather|128\nNight Bus|122' }],
          hint: 'Add `WHERE tempo > 120`, then `ORDER BY tempo DESC`.',
          solution: 'SELECT title, tempo FROM songs WHERE tempo > 120 ORDER BY tempo DESC;',
          explain: '`WHERE` keeps the fast songs and `DESC` puts the fastest at the top.',
        },
        {
          kind: 'write',
          prompt: 'What is the average length of a song, in seconds? Return just that one number.',
          language: 'sql',
          setup: MUSIC,
          starter: MUSIC_COLS + 'SELECT \nFROM songs;',
          tests: [{ expected: '220' }],
          hint: 'Use `AVG(seconds)` on the `songs` table.',
          solution: 'SELECT AVG(seconds) FROM songs;',
          explain: '`AVG` squashes all ten lengths into one number: 220 seconds, a little under four minutes.',
        },
        {
          kind: 'concept',
          title: 'Reminder: JOIN, then filter',
          body: '`JOIN ... ON` matches each song to its artist: the foreign key `songs.artist_id` must equal `artists.id`. After the join, `WHERE` and `ORDER BY` work as usual.\n\nHere are the slow songs, with a tempo under 80.',
          code: 'SELECT songs.title, artists.name\nFROM songs\nJOIN artists ON songs.artist_id = artists.id\nWHERE songs.tempo < 80\nORDER BY songs.title;',
          language: 'sql',
          setup: MUSIC,
          output: 'Lemon Moon|Mina Okoro\nSlow Train Home|The Slow Tides',
        },
        {
          kind: 'write',
          prompt: 'Show the title and the artist name of every song longer than 240 seconds, sorted by title A to Z.',
          language: 'sql',
          setup: MUSIC,
          starter: MUSIC_COLS + 'SELECT songs.title, artists.name\nFROM songs\nJOIN artists ON ',
          tests: [
            { expected: 'Harbour Lights|The Slow Tides\nLemon Moon|Mina Okoro\nSlow Train Home|The Slow Tides' },
          ],
          hint: 'Join on `songs.artist_id = artists.id`, then `WHERE songs.seconds > 240` and `ORDER BY songs.title`.',
          solution:
            'SELECT songs.title, artists.name FROM songs JOIN artists ON songs.artist_id = artists.id WHERE songs.seconds > 240 ORDER BY songs.title;',
          explain: 'The join swaps each `artist_id` number for the artist it points to.',
        },
        {
          kind: 'spot',
          prompt: 'This query pairs songs with the wrong artists. Tap the line with the bug.',
          lines: [
            'SELECT songs.title, artists.name',
            'FROM songs',
            'JOIN artists ON songs.id = artists.id',
            'ORDER BY songs.title;',
          ],
          language: 'sql',
          answer: 2,
          explain: "It matches a song's own id to an artist's id. The link is the foreign key: `songs.artist_id = artists.id`.",
        },
        {
          kind: 'concept',
          title: 'Reminder: a subquery finds the id',
          body: 'The query in brackets runs first. Here it looks in `songs` for the `artist_id` of one song. The outer query then finds the artist with that id.\n\nYou never need to know the id number yourself.',
          code: "SELECT name FROM artists\nWHERE id IN (SELECT artist_id FROM songs WHERE title = 'Jam Jar');",
          language: 'sql',
          setup: MUSIC,
          output: 'DJ Marmalade',
        },
        {
          kind: 'write',
          prompt: 'List the titles of every song by Mina Okoro, sorted A to Z. Find her id with a subquery.',
          language: 'sql',
          setup: MUSIC,
          starter: MUSIC_COLS + 'SELECT title FROM songs\nWHERE artist_id IN (SELECT )\nORDER BY title;',
          tests: [{ expected: 'Borrowed Bicycle\nLemon Moon\nNight Bus' }],
          hint: "The inner query is `SELECT id FROM artists WHERE name = 'Mina Okoro'`.",
          solution:
            "SELECT title FROM songs WHERE artist_id IN (SELECT id FROM artists WHERE name = 'Mina Okoro') ORDER BY title;",
          explain: 'The subquery looks up her id, so you never have to know it is 2.',
        },
        {
          kind: 'concept',
          title: 'Reminder: one row per group',
          body: '`GROUP BY` piles rows up and runs the function once per pile. It works on joined tables too: join first, then group by the artist name.\n\nHere is how many songs each artist has.',
          code: 'SELECT artists.name, COUNT(*)\nFROM songs\nJOIN artists ON songs.artist_id = artists.id\nGROUP BY artists.name\nORDER BY artists.name;',
          language: 'sql',
          setup: MUSIC,
          output: 'DJ Marmalade|2\nMina Okoro|3\nPaper Lanterns|3\nThe Slow Tides|2',
        },
        {
          kind: 'type',
          prompt: 'There are 10 songs by 4 artists. How many rows does this query return? Type the number.',
          code: 'SELECT artist_id, COUNT(*)\nFROM songs\nGROUP BY artist_id;',
          language: 'sql',
          accept: ['4', 'four'],
          explain: '`GROUP BY` gives one row per group, and there are four artists.',
        },
        {
          kind: 'write',
          prompt: 'For each artist, show their name and the average tempo of their songs, sorted by name A to Z.',
          language: 'sql',
          setup: MUSIC,
          starter:
            MUSIC_COLS + 'SELECT artists.name, AVG(songs.tempo)\nFROM songs\nJOIN artists ON songs.artist_id = artists.id\n',
          tests: [{ expected: 'DJ Marmalade|145\nMina Okoro|102\nPaper Lanterns|107\nThe Slow Tides|76' }],
          hint: 'Add `GROUP BY artists.name`, then `ORDER BY artists.name`.',
          solution:
            'SELECT artists.name, AVG(songs.tempo) FROM songs JOIN artists ON songs.artist_id = artists.id GROUP BY artists.name ORDER BY artists.name;',
          explain: 'Join first, then pile the songs up per artist, then average each pile.',
        },
        {
          kind: 'concept',
          title: 'Sorting by the answer',
          body: 'You can sort groups by the number you worked out for them. Repeat the function after `ORDER BY`, and add `DESC` for biggest first.\n\nHere is the longest song for each `artist_id`, longest at the top.',
          code: 'SELECT artist_id, MAX(seconds)\nFROM songs\nGROUP BY artist_id\nORDER BY MAX(seconds) DESC;',
          language: 'sql',
          setup: MUSIC,
          output: '3|312\n2|251\n1|214\n4|170',
        },
        {
          kind: 'write',
          prompt: 'Who is played the most? For each artist, show their name and total plays, biggest total first.',
          language: 'sql',
          setup: MUSIC,
          starter:
            MUSIC_COLS + 'SELECT artists.name, \nFROM songs\nJOIN artists ON songs.artist_id = artists.id\n',
          tests: [{ expected: 'DJ Marmalade|24900\nMina Okoro|21500\nPaper Lanterns|20500\nThe Slow Tides|7100' }],
          hint: 'Same join and `GROUP BY artists.name`, with `SUM(songs.plays)`. End with `ORDER BY SUM(songs.plays) DESC`.',
          solution:
            'SELECT artists.name, SUM(songs.plays) FROM songs JOIN artists ON songs.artist_id = artists.id GROUP BY artists.name ORDER BY SUM(songs.plays) DESC;',
          explain: 'You can sort by an aggregate too. That is how every "top artists" chart is made.',
        },
      ],
    },
    {
      id: 'u7-lab-mystery',
      title: 'Lab: the missing mascot mystery',
      exercises: [
        {
          kind: 'concept',
          title: 'The case',
          body: 'On Friday night, the puffin mascot costume vanished from the Pebble Bay school gym. You have the town database.\n\nIts tables are `people`, `reports`, `door_logs`, `calls` and `bus_tickets`. Each query you write reveals the next clue. The column names are shown above every query.',
        },
        {
          kind: 'concept',
          title: 'Reminder: two tests with AND',
          body: '`WHERE` can hold two tests joined by `AND`. A row is kept only if it passes both.\n\nThis asks the door log when the main door was used on Thursday. Notice that times are stored as text, like `21:30`.',
          code: "SELECT time\nFROM door_logs\nWHERE day = 'Thursday' AND door = 'main';",
          language: 'sql',
          setup: TOWN,
          output: '21:30',
        },
        {
          kind: 'write',
          prompt: 'Start with the report. Show the `description` of the report filed on Friday at the Gym.',
          language: 'sql',
          setup: TOWN,
          starter: TOWN_COLS + 'SELECT description\nFROM reports\n',
          tests: [{ expected: 'Puffin costume gone. Side door used after 21:00.' }],
          hint: "Add `WHERE day = 'Friday' AND place = 'Gym'`.",
          solution: "SELECT description FROM reports WHERE day = 'Friday' AND place = 'Gym';",
          explain: 'First clue: someone came through the side door after 21:00. Times are stored as text like `21:00`.',
        },
        {
          kind: 'concept',
          title: 'Reminder: names from a log',
          body: 'A log row holds only a `person_id`. Join it to `people` to see the name.\n\nText times like `08:05` compare in clock order, so `<` and `>` work on them. This finds who used the main door before noon.',
          code: "SELECT people.name\nFROM door_logs\nJOIN people ON door_logs.person_id = people.id\nWHERE door_logs.door = 'main' AND door_logs.time < '12:00'\nORDER BY people.name;",
          language: 'sql',
          setup: TOWN,
          output: 'Ada Brook',
        },
        {
          kind: 'write',
          prompt: "Who used the side door on Friday after 21:00? List their names, sorted A to Z. Text times compare in order, so `time > '21:00'` works.",
          language: 'sql',
          setup: TOWN,
          starter:
            TOWN_COLS + 'SELECT people.name\nFROM door_logs\nJOIN people ON door_logs.person_id = people.id\n',
          tests: [{ expected: 'Dara Voss\nMilo Finch\nPetra Lunn' }],
          hint: "Add `WHERE door_logs.door = 'side' AND door_logs.day = 'Friday' AND door_logs.time > '21:00'`, then `ORDER BY people.name`.",
          solution:
            "SELECT people.name FROM door_logs JOIN people ON door_logs.person_id = people.id WHERE door_logs.door = 'side' AND door_logs.day = 'Friday' AND door_logs.time > '21:00' ORDER BY people.name;",
          explain: 'Three tests joined by `AND` cut the whole door log down to the people worth a closer look.',
        },
        {
          kind: 'type',
          prompt: 'How many suspects do you have now? Type the number.',
          accept: ['3', 'three'],
          explain: 'Dara, Milo and Petra. Their ids in the `people` table are 2, 3 and 4.',
        },
        {
          kind: 'choice',
          prompt: 'A neighbour says: "Right after, I heard someone outside the gym make a very short phone call." Which table do you search next?',
          options: ['reports', 'bus_tickets', 'calls', 'door_logs'],
          answer: 2,
          explain: 'The `calls` table records who rang whom, on which day, and for how many minutes.',
        },
        {
          kind: 'concept',
          title: 'Reminder: IN with a list of ids',
          body: '`IN (1, 6, 8)` keeps a row when its value is any number on the list. It saves writing three tests joined by `OR`, and it mixes with `AND` like any other test.\n\nThis shows the doors people 1, 6 and 8 used on Friday.',
          code: "SELECT door, time\nFROM door_logs\nWHERE day = 'Friday' AND person_id IN (1, 6, 8)\nORDER BY time;",
          language: 'sql',
          setup: TOWN,
          output: 'main|08:05\nmain|15:30\nside|17:45',
        },
        {
          kind: 'write',
          prompt: 'Which suspects (ids 2, 3 and 4) made a call on Friday that lasted less than 2 minutes? List the callers\' names, sorted A to Z.',
          language: 'sql',
          setup: TOWN,
          starter: TOWN_COLS + 'SELECT people.name\nFROM calls\nJOIN people ON calls.caller_id = people.id\n',
          tests: [{ expected: 'Milo Finch\nPetra Lunn' }],
          hint: "Add `WHERE calls.day = 'Friday' AND calls.minutes < 2 AND calls.caller_id IN (2, 3, 4)`, then `ORDER BY people.name`.",
          solution:
            "SELECT people.name FROM calls JOIN people ON calls.caller_id = people.id WHERE calls.day = 'Friday' AND calls.minutes < 2 AND calls.caller_id IN (2, 3, 4) ORDER BY people.name;",
          explain: 'Dara is in the clear: her call lasted 12 minutes. Two suspects left, with ids 3 and 4.',
        },
        {
          kind: 'spot',
          prompt: 'A helper wrote this to show who made each call, but it shows the people who were rung instead. Tap the line with the bug.',
          lines: [
            'SELECT people.name, calls.minutes',
            'FROM calls',
            'JOIN people ON calls.receiver_id = people.id',
            "WHERE calls.day = 'Friday'",
            'ORDER BY people.name;',
          ],
          language: 'sql',
          answer: 2,
          explain: 'A call has two foreign keys. Joining on `receiver_id` gives the person rung; the caller needs `caller_id`.',
        },
        {
          kind: 'write',
          prompt: 'New report: a huge bag with yellow feet was seen on the Gull Rock bus on Saturday. Which suspect (id 3 or 4) holds a Saturday ticket to Gull Rock? Show their name.',
          language: 'sql',
          setup: TOWN,
          starter:
            TOWN_COLS + 'SELECT people.name\nFROM bus_tickets\nJOIN people ON bus_tickets.person_id = people.id\n',
          tests: [{ expected: 'Petra Lunn' }],
          hint: "Add `WHERE bus_tickets.day = 'Saturday' AND bus_tickets.destination = 'Gull Rock' AND bus_tickets.person_id IN (3, 4)`.",
          solution:
            "SELECT people.name FROM bus_tickets JOIN people ON bus_tickets.person_id = people.id WHERE bus_tickets.day = 'Saturday' AND bus_tickets.destination = 'Gull Rock' AND bus_tickets.person_id IN (3, 4);",
          explain: 'The baker also rode to Gull Rock that day, but she was never at the side door. Only one suspect fits every clue.',
        },
        {
          kind: 'type',
          prompt: 'Who took the mascot costume? Type the name.',
          accept: ['Petra Lunn', 'Petra', 'Lunn', 'Petra Lunn.'],
          explain: 'Petra Lunn used the side door after 21:00, made a short call, and took the Saturday bus to Gull Rock.',
        },
        {
          kind: 'concept',
          title: 'Reminder: a subquery makes the list',
          body: 'The list for `IN` can come from another query. The brackets run first and give back ids. The outer query turns those ids into names.\n\nThis finds everyone holding a ticket to Fern Hill.',
          code: "SELECT name\nFROM people\nWHERE id IN (SELECT person_id FROM bus_tickets WHERE destination = 'Fern Hill')\nORDER BY name;",
          language: 'sql',
          setup: TOWN,
          output: 'Dara Voss\nMilo Finch',
        },
        {
          kind: 'write',
          prompt: 'One loose end: who did Petra (id 4) ring on Friday? Show that person\'s name and job, using a subquery on `calls`.',
          language: 'sql',
          setup: TOWN,
          starter: TOWN_COLS + 'SELECT name, job\nFROM people\nWHERE id IN (SELECT )',
          tests: [{ expected: 'Ivo Marsh|costume shop owner' }],
          hint: "The inner query is `SELECT receiver_id FROM calls WHERE caller_id = 4 AND day = 'Friday'`.",
          solution:
            "SELECT name, job FROM people WHERE id IN (SELECT receiver_id FROM calls WHERE caller_id = 4 AND day = 'Friday');",
          explain: 'Case closed: the puffin was on its way to a costume shop. You solved it with nothing but SELECT, WHERE, JOIN and a subquery.',
        },
      ],
    },
  ],
}
