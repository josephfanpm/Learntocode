import type { Unit } from '../types'

export const u11: Unit = {
  id: 'u11',
  week: 11,
  lecture: 'https://cs50.harvard.edu/cybersecurity/',
  title: 'Cybersecurity',
  summary: 'Passwords, encryption and staying safe',
  lessons: [
    {
      id: 'u11-passwords',
      title: 'Passwords and guessing',
      exercises: [
        {
          kind: 'concept',
          title: 'Brute force',
          body: 'The simplest way to break a password is to try every possibility, one after another. That is called **brute force**.\n\nSo a password is only as strong as the number of possibilities a guesser must get through. A 4-digit PIN has 10 choices for each digit: 10 × 10 × 10 × 10.',
        },
        {
          kind: 'type',
          prompt: 'A PIN has 4 digits, each from 0 to 9. How many different PINs exist? Type the number.',
          accept: ['10000', '10,000', '10 000'],
          explain: '10 × 10 × 10 × 10 = 10,000. A computer can try all of those in a blink.',
        },
        {
          kind: 'choice',
          prompt: 'A password has 8 lowercase letters (26 choices each). Roughly how many passwords are possible?',
          options: ['208 (26 × 8)', 'About 209 thousand', 'About 209 billion', 'Exactly 26'],
          answer: 2,
          explain: 'You multiply 26 by itself 8 times, which is about 209 billion. Multiplying 26 × 8 is the common slip.',
        },
        {
          kind: 'concept',
          title: 'Powers in Python',
          body: 'Multiplying a number by itself several times is a **power**. Python writes it with two stars: `10 ** 3` means 10 × 10 × 10, three tens multiplied together.',
          code: `print(10 * 10 * 10)
print(10 ** 3)
print(2 ** 5)`,
          language: 'python',
          output: '1000\n1000\n32',
        },
        {
          kind: 'write',
          prompt: 'Read how many symbols are allowed, then the password length. Print how many passwords are possible: symbols to the power of length.',
          language: 'python',
          starter: 'symbols = int(input())\nlength = int(input())\nprint(symbols * length)\n',
          tests: [
            { stdin: ['10', '4'], expected: '10000' },
            { stdin: ['26', '8'], expected: '208827064576' },
            { stdin: ['2', '8'], expected: '256' },
          ],
          hint: 'The power operator in Python is two stars: symbols ** length.',
          solution: 'symbols = int(input())\nlength = int(input())\nprint(symbols ** length)\n',
          explain: 'Each extra character multiplies the total by the number of symbols. That is why the count explodes so fast.',
        },
        {
          kind: 'concept',
          title: 'Length beats cleverness',
          body: 'Every extra character multiplies the work for a guesser. One more lowercase letter makes it 26 times harder.\n\nSo a long password of plain words usually beats a short one full of symbols. Longer is stronger.',
        },
        {
          kind: 'concept',
          title: 'How long will it take?',
          body: 'Time is the amount of work divided by the speed. `//` divides and drops the remainder, so you get whole hours only. Reading 900 pages at 40 pages an hour takes 22 whole hours.',
          code: `pages = 900
per_hour = 40
print(pages // per_hour)`,
          language: 'python',
          output: '22',
        },
        {
          kind: 'write',
          prompt: 'Read the number of possible passwords, then how many guesses a computer makes per second. Print how many whole seconds it takes to try them all.',
          language: 'python',
          starter: 'combos = int(input())\nper_second = int(input())\nprint(combos)\n',
          tests: [
            { stdin: ['10000', '1000'], expected: '10' },
            { stdin: ['208827064576', '1000000'], expected: '208827' },
          ],
          hint: 'Whole-number division is two slashes: combos // per_second.',
          solution: 'combos = int(input())\nper_second = int(input())\nprint(combos // per_second)\n',
          explain: 'Time is the number of possibilities divided by the guessing speed. More possibilities is the only part you control.',
        },
        {
          kind: 'type',
          prompt: 'You add one more digit to a PIN. The number of possible PINs is multiplied by what number?',
          accept: ['10', 'ten', 'x10', '10x', '×10', '10 times', 'ten times', 'times 10', 'by 10'],
          explain: 'The new digit has 10 choices for every PIN that existed before, so the total grows 10 times.',
        },
        {
          kind: 'concept',
          title: 'Three helpers',
          body: 'A **password manager** is an app that makes up and remembers a long, different password for every site.\n\n**Two-factor authentication** asks for a second proof, like a code from your phone.\n\nA **passkey** replaces the password: your device holds a secret and proves it is you.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to what it means.',
          pairs: [
            ['Brute force', 'Trying every possibility'],
            ['Password manager', 'Remembers a different password per site'],
            ['Two-factor authentication', 'Password plus a second proof'],
            ['Passkey', 'Your device proves it is you'],
          ],
          explain: 'Each one fights guessing in a different way: more possibilities, no reuse, a second lock, or no password at all.',
        },
        {
          kind: 'choice',
          prompt: 'Someone learns your password for one site. Which habit limits the damage most?',
          options: [
            'Using a different password on every site',
            'Adding "1" to the end of the same password elsewhere',
            'Writing the password in capital letters',
            'Logging in less often',
          ],
          answer: 0,
          explain: 'If each site has its own password, a leak at one site opens only that one door. Small tweaks like adding "1" are the first thing guessers try.',
        },
      ],
    },
    {
      id: 'u11-hashing',
      title: 'Hashing',
      exercises: [
        {
          kind: 'concept',
          title: 'A one-way scrambler',
          body: 'A **hash function** turns any text into a fixed-length jumble called a **hash**.\n\nThe same text always gives the same hash. But it is **one-way**: nobody can run it backwards to get the text from the hash.',
        },
        {
          kind: 'choice',
          prompt: 'A careful website needs to check your password when you log in. What should it keep in its database?',
          options: [
            'Your password, exactly as typed',
            'Your password spelled backwards',
            'A hash of your password',
            'Nothing at all',
          ],
          answer: 2,
          explain: 'The site hashes what you type and compares hashes. If the database is ever stolen, the thieves get jumbles, not passwords.',
        },
        {
          kind: 'concept',
          title: 'Hashing in Python',
          body: 'Python comes with `hashlib`. **SHA-256** is one well-known hash function.\n\n`.encode()` turns the text into bytes, and `.hexdigest()` gives the hash as 64 letters and digits.',
          code: 'import hashlib\n\ntext = "hello"\nprint(hashlib.sha256(text.encode()).hexdigest())',
          language: 'python',
          output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
        },
        {
          kind: 'write',
          prompt: 'Read a password and print the first 12 characters of its SHA-256 hash.',
          language: 'python',
          starter: 'import hashlib\n\npassword = input()\nprint(password[:12])\n',
          tests: [
            { stdin: ['hello'], expected: '2cf24dba5fb0' },
            { stdin: ['tulip42'], expected: '4cf06678f9cc' },
          ],
          hint: 'Make the hash with hashlib.sha256(password.encode()).hexdigest(), then slice it with [:12].',
          solution: 'import hashlib\n\npassword = input()\nhashed = hashlib.sha256(password.encode()).hexdigest()\nprint(hashed[:12])\n',
          explain: 'Your output matched ours because a hash function always gives the same result for the same text.',
        },
        {
          kind: 'type',
          prompt: 'You hash the word `tulip` today and again next year. Are the two hashes the same? Type yes or no.',
          accept: ['yes', 'y', 'yes.'],
          explain: 'Same input, same hash, every time. That is what lets a site compare hashes at login.',
        },
        {
          kind: 'concept',
          title: 'Comparing hashes',
          body: 'To check a password without keeping it, hash the attempt and compare the two hashes. Same text gives the same hash, so `==` is true only when the attempt is right.',
          code: `import hashlib

saved = hashlib.sha256("kiwi".encode()).hexdigest()
print(hashlib.sha256("kiwi".encode()).hexdigest() == saved)
print(hashlib.sha256("kiwj".encode()).hexdigest() == saved)`,
          language: 'python',
          output: 'True\nFalse',
        },
        {
          kind: 'write',
          prompt: '`stored` is the hash a site saved at sign-up. Read a password attempt, hash it, and print `Welcome` if the hashes match or `Wrong password` if not.',
          language: 'python',
          starter:
            'import hashlib\n\nstored = "4cf06678f9cca4a09ad3593478e9da969888c47fde5b556e4d4e7ffa0870b317"\nattempt = input()\nif attempt == stored:\n    print("Welcome")\nelse:\n    print("Wrong password")\n',
          tests: [
            { stdin: ['tulip42'], expected: 'Welcome' },
            { stdin: ['tulip43'], expected: 'Wrong password' },
          ],
          hint: 'Hash the attempt first: hashlib.sha256(attempt.encode()).hexdigest(). Compare that with stored.',
          solution:
            'import hashlib\n\nstored = "4cf06678f9cca4a09ad3593478e9da969888c47fde5b556e4d4e7ffa0870b317"\nattempt = input()\nif hashlib.sha256(attempt.encode()).hexdigest() == stored:\n    print("Welcome")\nelse:\n    print("Wrong password")\n',
          explain: 'The site never needs the real password. It only checks that the hash of your attempt equals the hash it saved.',
        },
        {
          kind: 'concept',
          title: 'Salts',
          body: 'A **rainbow table** is a huge ready-made list of common passwords and their hashes. A thief looks a stolen hash up in it.\n\nThe defence is a **salt**: a few random characters, different for each user, added to the password before hashing. Now ready-made lists no longer match.',
        },
        {
          kind: 'concept',
          title: 'Salt, then hash',
          body: '`+` joins two pieces of text. Join the salt to the word first, then hash the joined text. The brackets make sure `.encode()` works on the whole thing.\n\nOne word, with and without a salt: two unrelated hashes.',
          code: `import hashlib

salt = "q9"
word = "kiwi"
print(hashlib.sha256(word.encode()).hexdigest()[:8])
print(hashlib.sha256((salt + word).encode()).hexdigest()[:8])`,
          language: 'python',
          output: '1a5afeda\nf635ada3',
        },
        {
          kind: 'write',
          prompt: 'Read a salt, then a password. Join them (salt first) and print the first 12 characters of the SHA-256 hash of the joined text.',
          language: 'python',
          starter: 'import hashlib\n\nsalt = input()\npassword = input()\nhashed = hashlib.sha256(password.encode()).hexdigest()\nprint(hashed[:12])\n',
          tests: [
            { stdin: ['x7', 'tulip42'], expected: '235d8ea0acc0' },
            { stdin: ['k2', 'tulip42'], expected: '44f4d1102ad6' },
          ],
          hint: 'Hash (salt + password).encode() instead of password.encode().',
          solution:
            'import hashlib\n\nsalt = input()\npassword = input()\nhashed = hashlib.sha256((salt + password).encode()).hexdigest()\nprint(hashed[:12])\n',
          explain: 'Same password, different salt, completely different hash. Two users with the same password no longer look the same in the database.',
        },
        {
          kind: 'spot',
          prompt: 'This sign-up code has one unsafe line. Tap it.',
          lines: [
            'def sign_up(users, name, password, salt):',
            '    text = salt + password',
            '    hashed = hashlib.sha256(text.encode()).hexdigest()',
            '    users[name] = password',
            '    return users',
          ],
          language: 'python',
          answer: 3,
          explain: 'It works out the hash and then saves the plain password anyway. It should save `hashed` (and the salt) instead.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Hash', 'Fixed-length jumble made from text'],
            ['One-way', 'Cannot be run backwards'],
            ['Salt', 'Random extra text added before hashing'],
            ['Rainbow table', 'Ready-made list of passwords and hashes'],
          ],
          explain: 'Hashes protect stored passwords, and salts stop ready-made lists from working against them.',
        },
      ],
    },
    {
      id: 'u11-encryption',
      title: 'Encryption',
      exercises: [
        {
          kind: 'concept',
          title: 'Scramble and unscramble',
          body: '**Encryption** scrambles a message so only someone with the **key** can read it. Unlike a hash, it can be undone.\n\nA toy example: shift every letter forward by the key. With key 1, `A` becomes `B`. To decrypt, shift back.',
          code: 'letter = "A"\nkey = 1\nprint(chr((ord(letter) - 65 + key) % 26 + 65))  # B',
          language: 'python',
          output: 'B',
        },
        {
          kind: 'type',
          prompt: 'Encrypt `HI` by shifting each letter forward by 1. Type the result.',
          accept: ['IJ'],
          explain: 'H moves to I and I moves to J. Anyone who knows the key is 1 can shift back and read it.',
        },
        {
          kind: 'concept',
          title: 'Letters to numbers and back',
          body: '`ord` gives a letter\'s code and `chr` turns a code back into a letter. `A` is 65, so taking 65 away makes A to Z into 0 to 25.\n\n`% 26` wraps past 25 back to 0. That is how Z shifts round to A.',
          code: `print(ord("A"))
print(ord("C") - 65)
print(chr(2 + 65))
print((25 + 1) % 26)`,
          language: 'python',
          output: '65\n2\nC\n0',
        },
        {
          kind: 'concept',
          title: 'Only change the letters',
          body: '`"A" <= ch <= "Z"` is true only for capital letters. Use it to change the letters and pass everything else through untouched, building the result one character at a time.',
          code: `result = ""
for ch in "HI, YOU":
    if "A" <= ch <= "Z":
        result += ch.lower()
    else:
        result += ch
print(result)`,
          language: 'python',
          output: 'hi, you',
        },
        {
          kind: 'write',
          prompt: 'Read a message in capital letters, then a key (a number). Shift every letter A–Z forward by the key, wrapping from Z back to A. Leave spaces and punctuation alone. Print the result.',
          language: 'python',
          starter: 'message = input()\nkey = int(input())\nresult = ""\nfor ch in message:\n    result += ch\nprint(result)\n',
          tests: [
            { stdin: ['HELLO', '3'], expected: 'KHOOR' },
            { stdin: ['ZOO, BYE', '1'], expected: 'APP, CZF' },
            { stdin: ['KHOOR', '23'], expected: 'HELLO' },
          ],
          hint: 'If "A" <= ch <= "Z", add chr((ord(ch) - 65 + key) % 26 + 65). Otherwise add ch unchanged.',
          solution:
            'message = input()\nkey = int(input())\nresult = ""\nfor ch in message:\n    if "A" <= ch <= "Z":\n        result += chr((ord(ch) - 65 + key) % 26 + 65)\n    else:\n        result += ch\nprint(result)\n',
          explain: 'The last test decrypted: shifting by 23 undoes a shift by 3, because 3 + 23 = 26, a full lap of the alphabet. With only 26 keys, this toy is easy to brute force.',
        },
        {
          kind: 'concept',
          title: 'XOR',
          body: 'Real encryption works on bits. A common building block is **XOR**: compare two bits, and the answer is 1 if they are different, 0 if they are the same.\n\nXOR with the same key twice and you get the original back. In Python, XOR is `^`.',
          code: '  1100   message\n^ 1010   key\n  ----\n  0110   secret',
        },
        {
          kind: 'bits',
          prompt: 'The message is 1001 and the key is 0011. Set the switches to the XOR of the two (1 where the bits differ).',
          target: 10,
          bits: 4,
          explain: '1001 XOR 0011 = 1010. The first two bits stay as they were because the key has 0 there, and the last two flip.',
        },
        {
          kind: 'bits',
          prompt: 'Now decrypt. The secret is 1010 and the key is still 0011. Set the switches to the XOR of the two.',
          target: 9,
          bits: 4,
          explain: '1010 XOR 0011 = 1001, the original message. XOR with the same key undoes itself.',
        },
        {
          kind: 'concept',
          title: 'XOR in Python',
          body: '`^` XORs two numbers bit by bit. 65 is the code for `A`. XOR it with the key 5 and you get 68. XOR 68 with the same key and 65 comes back.',
          code: `secret = 65 ^ 5
print(secret)
print(secret ^ 5)
print(chr(secret ^ 5))`,
          language: 'python',
          output: '68\n65\nA',
        },
        {
          kind: 'write',
          prompt: 'Read a message, then a key (a number). Build `secret`, a list with each character\'s code XORed with the key, and print it. Then turn `secret` back into text with the same key and print that.',
          language: 'python',
          starter:
            'message = input()\nkey = int(input())\n\nsecret = []\nfor ch in message:\n    secret.append(ord(ch))\nprint(secret)\n\nback = ""\nfor n in secret:\n    back += chr(n)\nprint(back)\n',
          tests: [
            { stdin: ['HI', '7'], expected: '[79, 78]\nHI' },
            { stdin: ['cat', '42'], expected: '[73, 75, 94]\ncat' },
          ],
          hint: 'Encrypt with ord(ch) ^ key. Decrypt with chr(n ^ key).',
          solution:
            'message = input()\nkey = int(input())\n\nsecret = []\nfor ch in message:\n    secret.append(ord(ch) ^ key)\nprint(secret)\n\nback = ""\nfor n in secret:\n    back += chr(n ^ key)\nprint(back)\n',
          explain: 'One key both locks and unlocks. That is **symmetric** encryption: both sides must share the same secret key.',
        },
        {
          kind: 'concept',
          title: 'The padlock trick',
          body: 'How do you share a key with a stranger? **Public-key** encryption uses two keys. Your **public key** is like an open padlock you hand to anyone. Only your **private key** opens it.\n\n**HTTPS** uses this to protect data between your browser and a site. **End-to-end** encryption means only you and your friend hold the keys.',
        },
        {
          kind: 'steps',
          prompt: 'A chat message travels along this row from you to a friend. Tap the right box for each question.',
          cells: ['You', 'Wi-Fi', 'Provider', 'Chat server', 'Friend'],
          steps: [
            { ask: 'With end-to-end encryption, who besides you can read the message?', answer: 4 },
            { ask: 'Without end-to-end, the app still uses HTTPS. Which stop in the middle can read it?', answer: 3 },
            { ask: 'Whose private key opens a message locked with your friend\'s public key?', answer: 4 },
          ],
          explain: 'HTTPS hides the message from the network on the way to the server. End-to-end goes further: even the server only passes along a jumble.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to its meaning.',
          pairs: [
            ['Symmetric', 'One shared key locks and unlocks'],
            ['Public key', 'An open padlock anyone may use'],
            ['Private key', 'The only thing that opens your padlock'],
            ['HTTPS', 'Encrypts between browser and site'],
            ['End-to-end', 'Only sender and receiver can read'],
          ],
          explain: 'Public-key encryption solves the sharing problem, and HTTPS and end-to-end chat are built on top of it.',
        },
      ],
    },
    {
      id: 'u11-staying-safe',
      title: 'Staying safe',
      exercises: [
        {
          kind: 'concept',
          title: 'Phishing',
          body: '**Phishing** is a message that pretends to be from someone you trust, to trick you into giving up a password or money.\n\nWarning signs: a rush ("act now"), a request for your password, and a link whose address is not quite the real one.',
        },
        {
          kind: 'spot',
          prompt: 'One line of this message is the clear warning sign. Tap it.',
          lines: [
            'Hi Sam,',
            'Thanks for shopping with us last week.',
            'We hope you like your new kettle.',
            'Confirm your password in the next 10 minutes or your account will be deleted.',
            'Have a lovely day!',
          ],
          answer: 3,
          explain: 'A rush plus a request for your password is the classic phishing pair. Real services do not ask for your password by message.',
        },
        {
          kind: 'concept',
          title: 'Reading a link',
          body: 'Find the first single slash after `https://`. The real site is the last part just before it.\n\n`https://shop.example/sale` goes to `shop.example`.\n\n`https://shop.example.deals.example/sale` goes to `deals.example`. The shop\'s name is only stuck on the front.',
        },
        {
          kind: 'spot',
          prompt: 'Your bank\'s real site is `mybank.example`. Tap the link that does NOT go to the bank.',
          lines: [
            'https://mybank.example/login',
            'https://mybank.example/help/cards',
            'https://mybank.example.account-check.example/login',
            'https://www.mybank.example/statements',
          ],
          answer: 2,
          explain: 'The site is the part just before the first single slash. That link really ends in `account-check.example`, with the bank\'s name only stuck on the front.',
        },
        {
          kind: 'choice',
          prompt: 'A message says there is a problem with your account and gives a link. What is the safest move?',
          options: [
            'Tap the link and log in quickly',
            'Reply with your password so they can check',
            'Forward it to your friends to ask',
            'Open the site yourself by typing its address',
          ],
          answer: 3,
          explain: 'If you go to the real site your own way, a fake link cannot fool you. If there really is a problem, you will see it there.',
        },
        {
          kind: 'concept',
          title: 'Updates and backups',
          body: 'Software has bugs, and some bugs are holes an attacker can use. **Updates** patch those holes, so install them soon.\n\n**Ransomware** is a program that encrypts your files and demands money for the key. A **backup**, a spare copy kept somewhere else, means you can say no.',
        },
        {
          kind: 'choice',
          prompt: 'Why is "remind me later" on a security update risky?',
          options: [
            'The update will cost money later',
            'The hole it fixes is now publicly known but still open on your device',
            'Your files are deleted until you update',
            'Updates only work on the day they come out',
          ],
          answer: 1,
          explain: 'Once a fix is out, attackers can study what it fixed and go looking for devices that have not installed it yet.',
        },
        {
          kind: 'type',
          prompt: 'What is the name for a program that locks up your files and demands money? Type one word.',
          accept: ['ransomware', 'ransom ware', 'ransom-ware'],
          explain: 'Ransomware holds your files for ransom. Updates help keep it out and backups take away its power.',
        },
        {
          kind: 'concept',
          title: 'Deleting is not erasing',
          body: 'When you delete a file, the computer often just forgets where it is. The data stays on the disk until something overwrites it. Many newer drives do clear it soon after, but you cannot count on that.\n\n**Full-disk encryption** scrambles everything on the device. Without your password, a lost laptop or old phone is just noise.',
        },
        {
          kind: 'choice',
          prompt: 'You delete a photo from an old hard disk and empty the bin. What has most likely happened to the photo\'s data?',
          options: [
            'It was overwritten with zeros right away',
            'It was sent back to the camera',
            'It is still on the disk, marked as free space',
            'It was encrypted with your password',
          ],
          answer: 2,
          explain: 'Deleting removes the signpost, not the data. That is why you turn on full-disk encryption and do a proper erase before selling a device.',
        },
        {
          kind: 'match',
          prompt: 'Match each threat or tool to its description.',
          pairs: [
            ['Phishing', 'A fake message that tricks you'],
            ['Ransomware', 'Locks your files and demands money'],
            ['Update', 'Patches known holes'],
            ['Backup', 'A spare copy kept elsewhere'],
            ['Full-disk encryption', 'Scrambles a whole device'],
          ],
          explain: 'A few steady habits cover most of the risk: slow down on messages, update, back up and encrypt.',
        },
      ],
    },
    {
      id: 'u11-web-attacks',
      title: 'Keeping your own code safe',
      exercises: [
        {
          kind: 'concept',
          title: 'SQL injection, again',
          body: 'You met this with databases. If you build a query by gluing a visitor\'s text into it, their text can become part of the SQL command. That is **SQL injection**.\n\nThe rule for your own code: never trust what a user typed.',
          code: 'query = f"SELECT * FROM users WHERE name = \'{name}\'"',
          language: 'python',
        },
        {
          kind: 'choice',
          prompt: 'Why is gluing user text into a query dangerous?',
          code: 'query = f"SELECT * FROM users WHERE name = \'{name}\'"',
          language: 'python',
          options: [
            'F-strings are slower than normal strings',
            'The database only accepts capital letters',
            'A quote mark in the text can end the value and start new SQL',
            'The query will be too long to run',
          ],
          answer: 2,
          explain: 'The database cannot tell which part you wrote and which part the visitor wrote. A stray quote lets their text escape the value and act as a command.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line that opens this code to SQL injection.',
          lines: [
            'def find_orders(db, customer):',
            '    query = "SELECT * FROM orders WHERE customer = \'" + customer + "\'"',
            '    rows = db.execute(query)',
            '    return rows.fetchall()',
          ],
          language: 'python',
          answer: 1,
          explain: 'That line glues the customer\'s text straight into the SQL. The other lines are fine once the query is built safely.',
        },
        {
          kind: 'concept',
          title: 'Why placeholders work',
          body: 'A **placeholder** is a `?` in the query. You send the SQL and the values separately.\n\nThe database fixes the command first, then drops each value in as plain data. Whatever the user typed, it can only ever be a value, never a command.',
          code: 'db.execute("SELECT * FROM users WHERE name = ?", (name,))',
          language: 'python',
        },
        {
          kind: 'blank',
          prompt: 'Make this query safe with a placeholder.',
          code: 'db.execute("SELECT * FROM orders WHERE customer = ___", (___,))',
          language: 'python',
          bank: ['?', 'customer', '{customer}', '"customer"'],
          answers: ['?', 'customer'],
          explain: 'The `?` marks the spot and the value travels separately, so the database treats it as data only.',
        },
        {
          kind: 'concept',
          title: 'Cross-site scripting',
          body: 'The same mistake exists in HTML. If your page shows a visitor\'s comment as-is, and the comment holds a `<script>` tag, every reader\'s browser runs it. That is **cross-site scripting** (XSS).\n\nThe fix is to **escape** the text: turn `<` into `&lt;` so the browser shows it instead of running it.',
        },
        {
          kind: 'spot',
          prompt: 'Tap the line that puts a visitor\'s text into the page without escaping it.',
          lines: [
            'def comment_page(author, comment):',
            '    page = "<h1>Comments</h1>"',
            '    page += "<p>" + comment + "</p>"',
            '    page += "<p>Posted by " + escape(author) + "</p>"',
            '    return page',
          ],
          language: 'python',
          answer: 2,
          explain: 'The author is escaped but the comment goes in raw, so any tags inside it would become part of the page.',
        },
        {
          kind: 'concept',
          title: 'Swapping text with replace',
          body: '`.replace(old, new)` gives back a copy of the text with every `old` swapped for `new`. Save the result into the variable again to make several swaps, one after another.',
          code: `text = "cats and dogs"
text = text.replace("cats", "birds")
text = text.replace("dogs", "fish")
print(text)`,
          language: 'python',
          output: 'birds and fish',
        },
        {
          kind: 'write',
          prompt: 'Write `escape(text)` so it returns the text with `&` changed to `&amp;`, `<` to `&lt;` and `>` to `&gt;`. Replace `&` first. The last line prints the escaped input.',
          language: 'python',
          starter: 'def escape(text):\n    return text\n\nprint(escape(input()))\n',
          tests: [
            { stdin: ['<b>hi</b>'], expected: '&lt;b&gt;hi&lt;/b&gt;' },
            { stdin: ['a < b & c'], expected: 'a &lt; b &amp; c' },
            { stdin: ['plain text'], expected: 'plain text' },
          ],
          hint: 'Chain three replaces: text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").',
          solution:
            'def escape(text):\n    text = text.replace("&", "&amp;")\n    text = text.replace("<", "&lt;")\n    text = text.replace(">", "&gt;")\n    return text\n\nprint(escape(input()))\n',
          explain: '`&` goes first, or you would escape the `&` inside the `&lt;` you just made. Web tools like Flask templates do this escaping for you.',
        },
        {
          kind: 'type',
          prompt: 'After escaping, what does the single character `<` become? Type it.',
          accept: ['&lt;', '&lt'],
          explain: '`&lt;` means "less-than sign". The browser draws a `<` on screen but does not treat it as the start of a tag.',
        },
        {
          kind: 'match',
          prompt: 'Match each problem to its fix.',
          pairs: [
            ['SQL injection', 'Placeholders in queries'],
            ['Cross-site scripting', 'Escape text before showing it'],
            ['Stolen password database', 'Store salted hashes'],
            ['Reading data on the network', 'HTTPS'],
          ],
          explain: 'Most web safety comes down to one habit: treat everything a user sends as data, never as code.',
        },
      ],
    },
  ],
}
