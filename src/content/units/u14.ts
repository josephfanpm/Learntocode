import type { Unit } from '../types'

export const u14: Unit = {
  id: 'u14',
  week: 1,
  course: 'dev',
  title: 'Git and version control',
  summary: 'Commits, branches, merges and pull requests',
  lessons: [
    {
      id: 'u14-commits',
      title: 'Save points',
      exercises: [
        {
          kind: 'concept',
          title: 'A save point for your code',
          body: '**Version control** keeps every saved version of a project, so you can look back or go back. The tool nearly every team uses is **Git**.\n\nA folder that Git tracks is a **repository**, or repo. Each save point is a **commit**: a snapshot of your files, with a short message saying what changed.',
        },
        {
          kind: 'choice',
          prompt: 'Your app worked on Monday. On Thursday it is broken and you cannot tell which edit did it. How does version control help most?',
          options: [
            'It stops you from typing bugs',
            'It makes the app run faster',
            'You can compare Thursday with the Monday commit, or go back to it',
            'It rewrites the broken code for you',
          ],
          answer: 2,
          explain: 'Every commit is a snapshot you can return to or compare against. The answer to "what changed?" is always one command away.',
        },
        {
          kind: 'concept',
          title: 'Three places',
          body: 'The **working folder** holds the files you edit.\n\nThe **staging area** holds the changes you have picked for the next commit. `git add` puts them there, like placing items in a box.\n\n`git commit` seals the box and stores it in the **repository** for good.',
        },
        {
          kind: 'steps',
          prompt: 'Follow one change to `notes.txt`. Tap where the newest change is after each action.',
          cells: ['Working folder', 'Staging area', 'Repository'],
          steps: [
            { ask: 'You edit notes.txt and save the file.', answer: 0 },
            { ask: 'You run: git add notes.txt', answer: 1 },
            { ask: 'You run: git commit -m "Add notes"', answer: 2 },
            { ask: 'You edit notes.txt once more and save. Where is this new edit?', answer: 0 },
          ],
          explain: 'Edits start in the working folder, `git add` stages them and `git commit` stores them. A new edit starts the trip again.',
        },
        {
          kind: 'concept',
          title: 'One save point, typed out',
          body: 'Here is a whole save point in the terminal. `git status` only looks: it lists what is changed and what is staged. `-m` is followed by the commit message in quotes. `git log` then lists the commits made so far.',
          code: 'git status\ngit add notes.txt\ngit commit -m "Add notes"\ngit log',
        },
        {
          kind: 'type',
          prompt: 'One command shows which files are changed and which are staged. It is `git` followed by the word `status`. Type the full command.',
          accept: ['git status'],
          explain: '`git status` is the "where am I?" command. Run it whenever you are unsure: it changes nothing.',
        },
        {
          kind: 'blank',
          prompt: 'Stage `app.py`, then save a commit. Fill the gaps.',
          code: 'git ___ app.py\ngit ___ -m "Add login page"',
          bank: ['add', 'commit', 'save', 'push'],
          answers: ['add', 'commit'],
          explain: '`add` picks what goes into the commit. `commit -m` seals it with a message.',
        },
        {
          kind: 'order',
          prompt: 'You start a brand new project. `git init` turns a folder into a repo. Put the commands in order to make the first commit and then look at it.',
          lines: ['git init', 'git add README.md', 'git commit -m "Add README"', 'git log'],
          explain: 'The repo must exist before you can stage, and a change must be staged before you can commit it. `git log` then shows the commit.',
        },
        {
          kind: 'concept',
          title: 'A note to future you',
          body: 'A commit message is a note to whoever reads the history later, often you.\n\nSay **what changed** in one short line, starting with a verb: `Fix total when cart is empty`. Keep it to about 50 characters. One purpose per commit makes the message easy to write.',
        },
        {
          kind: 'spot',
          prompt: 'Here are five commit messages. Tap the one that will still make sense in six months.',
          lines: ['fixed it', 'Update', 'Fix total when cart is empty', 'asdf', 'changes to file'],
          answer: 2,
          explain: 'It names what was fixed and when it happened. The others say nothing a reader could not guess.',
        },
        {
          kind: 'concept',
          title: 'Checking a length in Python',
          body: 'A program can check text the way a reviewer would. `len` counts the characters. The checks run from the top, and the first true one wins, so the special case goes first.',
          code: `title = "Hi"
if len(title) == 0:
    print("missing")
elif len(title) < 5:
    print("too short")
else:
    print("fine")`,
          language: 'python',
          output: 'too short',
        },
        {
          kind: 'write',
          prompt: 'Write a tiny commit message checker. Read one message. Print `empty` if it has no characters, `too long` if it has more than 50 characters, and `ok` otherwise.',
          language: 'python',
          starter: `message = input()
if len(message) > 50:
    print("too long")
else:
    print("ok")
`,
          tests: [
            { stdin: ['Fix total when cart is empty'], expected: 'ok' },
            { stdin: [''], expected: 'empty' },
            { stdin: ['Change a whole lot of different things in many files today'], expected: 'too long' },
          ],
          hint: 'Check for the empty message first: if len(message) == 0, print "empty". Use elif for the length check.',
          solution: `message = input()
if len(message) == 0:
    print("empty")
elif len(message) > 50:
    print("too long")
else:
    print("ok")
`,
          explain: 'Teams run small checks like this automatically before a commit is accepted. Order matters: test the special case first.',
        },
      ],
    },
    {
      id: 'u14-history',
      title: 'Reading history',
      exercises: [
        {
          kind: 'concept',
          title: 'The log',
          body: '`git log` lists commits, newest first. Each has an **id** (a long code; the first 7 characters are enough to name it), an author, a date and a message.\n\n**HEAD** is Git\'s name for the commit you are on right now, usually the newest.',
        },
        {
          kind: 'type',
          prompt: '`git log` prints several lines per commit. Adding `--oneline` after it gives one short line each. Type the full command.',
          accept: ['git log --oneline'],
          explain: 'The one-line view shows the short id and the message: perfect for scanning a long history.',
        },
        {
          kind: 'spot',
          prompt: 'This is the output of `git log --oneline`. Tap the commit that was made most recently.',
          lines: ['c3d9a1f Add search box', '8be2f04 Fix typo in header', '1a7c5e2 Add home page', 'e41b7d0 First commit'],
          answer: 0,
          explain: 'The log shows the newest commit at the top and the oldest at the bottom.',
        },
        {
          kind: 'steps',
          prompt: 'Four commits were made in the order A, B, C, D. Each commit remembers the one before it, called its **parent**. Tap the right commit.',
          cells: ['A', 'B', 'C', 'D'],
          steps: [
            { ask: 'Which commit is HEAD?', answer: 3 },
            { ask: 'Which commit is the parent of D?', answer: 2 },
            { ask: 'Which commit has no parent?', answer: 0 },
            { ask: 'Which commit is at the bottom of git log?', answer: 0 },
          ],
          explain: 'History is a chain: each commit points back to its parent. HEAD sits on the newest, and the first commit has nothing behind it.',
        },
        {
          kind: 'concept',
          title: 'What changed?',
          body: '`git diff` shows your edits line by line, before you stage them. A line starting with `-` was removed. A line starting with `+` was added.\n\nAlready ran `git add`? Then use `git diff --staged` to see what is waiting in the staging area.',
          code: '-    print("Hi " + name)\n+    print("Hello, " + name)',
        },
        {
          kind: 'spot',
          prompt: 'This is part of a diff. Tap the line that was added.',
          lines: [' def area(width, height):', '-    return width + height', '+    return width * height', ' print(area(2, 3))'],
          answer: 2,
          explain: 'The `+` marks the new line and the `-` marks the old one it replaced. Lines with neither are unchanged and shown for context.',
        },
        {
          kind: 'choice',
          prompt: 'You edit two files and run `git add` on both. Then `git diff` prints nothing. Why?',
          options: [
            'Your edits were lost',
            'git diff only works after a commit',
            'The files were too small to compare',
            'The edits are staged, and plain git diff only shows unstaged edits',
          ],
          answer: 3,
          explain: 'Nothing is lost. Staged changes show up with `git diff --staged`.',
        },
        {
          kind: 'concept',
          title: 'Files Git should not keep',
          body: 'Some files do not belong in history: passwords, huge folders of downloaded packages, files your editor creates.\n\nList them in a file named `.gitignore`, one pattern per line. `*.log` means every file ending in `.log`. A name ending in `/` means a whole folder.',
          code: '.env\n*.log\nnode_modules/',
        },
        {
          kind: 'spot',
          prompt: '`git status` lists these new files. Tap the one that must never be committed.',
          lines: ['app.py', 'README.md', '.env  (holds the database password)', 'test_app.py'],
          answer: 2,
          explain: 'Once a password is in the history, everyone with the repo can read it, even after you delete the file. Put `.env` in `.gitignore`.',
        },
        {
          kind: 'blank',
          prompt: 'Finish this `.gitignore` so it skips every file ending in `.tmp` and the whole `build` folder.',
          code: '.env\n___.tmp\nbuild___',
          bank: ['*', '/', '#', '.'],
          answers: ['*', '/'],
          explain: 'The star stands for "any name". The slash at the end says "this is a folder: ignore everything inside".',
        },
      ],
    },
    {
      id: 'u14-branches',
      title: 'Branches and merging',
      exercises: [
        {
          kind: 'concept',
          title: 'A branch is a label',
          body: 'A **branch** is a named label that points at one commit. The usual first branch is `main`.\n\nMake a new branch to try something without touching `main`. When you commit, the label of the branch you are on moves forward to the new commit. Other labels stay put.',
        },
        {
          kind: 'concept',
          title: 'Branch commands',
          body: '`git switch -c feature` creates a branch called `feature` and moves you onto it. `git switch main` moves you back to a branch that already exists.\n\n`git merge feature` brings the commits from `feature` into the branch you are standing on.',
          code: 'git switch -c feature\ngit commit -m "Try a new layout"\ngit switch main\ngit merge feature',
        },
        {
          kind: 'steps',
          prompt: 'The history is A, B, C and `main` points at C. Tap the commit each label points at.',
          cells: ['A', 'B', 'C', 'D'],
          steps: [
            { ask: 'You run: git switch -c feature. Where does feature point?', answer: 2 },
            { ask: 'On feature, you make a new commit, D. Where does feature point now?', answer: 3 },
            { ask: 'Where does main point now?', answer: 2 },
            { ask: 'You switch to main and run: git merge feature. Where does main point?', answer: 3 },
          ],
          explain: 'A new branch starts where you are standing. Commits move only the current branch, and a merge lets `main` catch up.',
        },
        {
          kind: 'type',
          prompt: '`git switch -c name` makes a new branch and moves you onto it. Type the command to start a branch called `login`.',
          accept: ['git switch -c login', 'git checkout -b login'],
          explain: 'The `-c` means "create". Without it, `git switch login` only moves to a branch that already exists.',
        },
        {
          kind: 'choice',
          prompt: 'You are on the `login` branch and make two commits. What has happened to `main`?',
          options: [
            'Nothing: it still points at the same commit as before',
            'It moved forward two commits too',
            'It was deleted',
            'It now has a merge conflict',
          ],
          answer: 0,
          explain: 'Only the branch you are on moves. That is the whole point: `main` stays safe while you experiment.',
        },
        {
          kind: 'order',
          prompt: 'Build a login form on its own branch, then bring it into `main`. Put the commands in order.',
          lines: [
            'git switch -c login',
            'git add login.py',
            'git commit -m "Add login form"',
            'git switch main',
            'git merge login',
          ],
          explain: 'You merge *into* the branch you are standing on, so you switch back to `main` before running `git merge login`.',
        },
        {
          kind: 'concept',
          title: 'When a merge gets stuck',
          body: 'Usually Git combines two branches by itself. But if both branches changed the **same lines**, Git cannot guess which to keep. That is a **merge conflict**.\n\nGit pauses the merge and marks the spot in the file. Nothing is broken: it is waiting for you to choose.',
        },
        {
          kind: 'concept',
          title: 'Conflict markers',
          body: 'Between `<<<<<<<` and `=======` is the version on your current branch (HEAD). Between `=======` and `>>>>>>>` is the version coming in.\n\nKeep the lines you want. Delete the rest, including all three marker lines.',
          code: '<<<<<<< HEAD\ntitle = "My Shop"\n=======\ntitle = "Our Shop"\n>>>>>>> login',
        },
        {
          kind: 'spot',
          prompt: 'You are merging `feature` into `main`. The team agrees the incoming `feature` version is right. Tap the one line to keep.',
          lines: ['<<<<<<< HEAD', 'price = 10', '=======', 'price = 12', '>>>>>>> feature'],
          answer: 3,
          explain: 'The incoming version sits between `=======` and `>>>>>>> feature`. The other four lines get deleted.',
        },
        {
          kind: 'order',
          prompt: 'A merge stopped with a conflict in `shop.py`. Put the steps in order to finish it.',
          lines: [
            'Open shop.py and find the conflict markers',
            'Keep the right lines and delete the markers',
            'Run the code to check it still works',
            'git add shop.py',
            'git commit',
          ],
          explain: 'You fix the file by hand, check it, then stage it to tell Git the conflict is solved. The commit completes the merge.',
        },
        {
          kind: 'concept',
          title: 'Does a line start with this?',
          body: 'Conflict markers are plain text, so Python can look for them. `startswith` answers True or False: does this text begin with these characters?',
          code: `line = ">>>>>>> login"
print(line.startswith(">>>>>>>"))
print(line.startswith("======="))`,
          language: 'python',
          output: 'True\nFalse',
        },
        {
          kind: 'concept',
          title: 'A switch that turns printing on',
          body: 'To print only part of a list, keep a True/False variable as a switch. It starts off and flips on after `GO`, so only the later words print. Setting it back to `False` would stop the printing again.\n\nThe order of the two `if`s matters: `GO` itself is not printed.',
          code: `keep = False
for word in ["a", "GO", "b", "c"]:
    if keep:
        print(word)
    if word == "GO":
        keep = True`,
          language: 'python',
          output: 'b\nc',
        },
        {
          kind: 'write',
          prompt: 'Read a number, then that many lines of a conflict block. Print only the incoming lines: the ones after `=======` and before the line starting with `>>>>>>>`.',
          language: 'python',
          starter: `count = int(input())
lines = [input() for _ in range(count)]
keep = False
for line in lines:
    print(line)
`,
          tests: [
            {
              stdin: ['5', '<<<<<<< HEAD', 'colour = "blue"', '=======', 'colour = "green"', '>>>>>>> feature'],
              expected: 'colour = "green"',
            },
            {
              stdin: ['6', '<<<<<<< HEAD', 'size = 1', '=======', 'size = 2', 'unit = "cm"', '>>>>>>> resize'],
              expected: 'size = 2\nunit = "cm"',
            },
          ],
          hint: 'Use keep as a switch. If the line starts with ">>>>>>>", set keep = False. Then print the line if keep is True. Then, if the line is "=======", set keep = True.',
          solution: `count = int(input())
lines = [input() for _ in range(count)]
keep = False
for line in lines:
    if line.startswith(">>>>>>>"):
        keep = False
    if keep:
        print(line)
    if line == "=======":
        keep = True
`,
          explain: 'The markers are plain text, so a program can read them just as you do. Merge tools with "accept incoming" buttons work this way.',
        },
      ],
    },
    {
      id: 'u14-remotes',
      title: 'Remotes and pull requests',
      exercises: [
        {
          kind: 'concept',
          title: 'A copy on a server',
          body: 'A **remote** is a copy of the repo on a server, for example on GitHub. Its usual name is `origin`.\n\n`git clone` downloads a full copy to your computer. `git push` sends your new commits up. `git pull` brings down commits that others pushed.',
        },
        {
          kind: 'match',
          prompt: 'Match each word to what it does.',
          pairs: [
            ['git clone', 'Download a repo for the first time'],
            ['git push', 'Send your commits to the remote'],
            ['git pull', 'Bring new commits down from the remote'],
            ['origin', 'The usual name of the remote'],
          ],
          explain: 'Clone once at the start. After that, your day is pull to catch up and push to share.',
        },
        {
          kind: 'steps',
          prompt: 'You and a teammate both cloned the same repo. Tap where each commit is.',
          cells: ['Your laptop', 'origin (server)', "Teammate's laptop"],
          steps: [
            { ask: 'You make commit A. Where is the only copy of A?', answer: 0 },
            { ask: 'You run git push. Which new place has A now?', answer: 1 },
            { ask: 'Your teammate runs git pull. Which new place has A now?', answer: 2 },
            { ask: 'Your teammate makes commit B and does not push. Where is the only copy of B?', answer: 2 },
          ],
          explain: 'A commit lives only on your machine until you push. Others get it only when they pull.',
        },
        {
          kind: 'type',
          prompt: 'You have two new commits on your laptop. Type the command that sends them to the remote.',
          accept: ['git push', 'git push origin', 'git push origin main'],
          explain: 'Until you push, your commits exist in one place only. A push is also your backup.',
        },
        {
          kind: 'concept',
          title: 'Pull before you push',
          body: 'If a teammate pushed while you were working, the remote holds commits you do not have. Git then refuses your push.\n\nNothing is lost. Run `git pull` to combine their commits with yours, then push again. Git\'s messages often end with a `hint:` line that says what to do.',
          code: 'git pull\ngit push',
        },
        {
          kind: 'spot',
          prompt: 'Your push failed with this output. Tap the line that tells you what to do next.',
          lines: [
            '$ git push',
            ' ! [rejected] main -> main (fetch first)',
            'error: failed to push some commits',
            'hint: the remote has work that you do not have',
            'hint: run git pull, then push again',
          ],
          answer: 4,
          explain: 'A teammate pushed first. Pull to combine their commits with yours, then push. Git output often ends with the fix, so read to the bottom.',
        },
        {
          kind: 'choice',
          prompt: 'You cloned the project last week. Today you want the commits your team pushed since then. Which command?',
          options: ['git clone', 'git init', 'git pull', 'git push'],
          answer: 2,
          explain: 'You already have the repo, so you only need the new commits. Cloning again would make a second copy of everything.',
        },
        {
          kind: 'concept',
          title: 'Pull requests',
          body: 'On a team, you rarely merge into `main` yourself. You push your branch and open a **pull request** (PR): a page that asks, "please merge this".\n\nTeammates read the diff, leave comments and approve it. That is **code review**. It catches bugs and spreads knowledge of the code.',
        },
        {
          kind: 'order',
          prompt: 'Put a normal day of team work in order.',
          lines: [
            'Pull the latest main',
            'Create a branch for your change',
            'Commit your work on the branch',
            'Push the branch to the remote',
            'Open a pull request',
            'A teammate reviews and approves',
            'Merge into main',
          ],
          explain: 'Start from fresh code, work on a branch, and let someone else read it before it reaches `main`.',
        },
        {
          kind: 'choice',
          prompt: 'Which pull request will get the fastest and most careful review?',
          options: [
            '40 files changed, titled "Updates"',
            '3 files changed, one purpose, with a note on how to test it',
            'One huge PR at the end of the month with all your work',
            'A PR with no description so the reviewer is not biased',
          ],
          answer: 1,
          explain: 'Reviewers read small, focused changes closely. Giant ones get a tired skim, and bugs slip through.',
        },
        {
          kind: 'type',
          prompt: 'What name does Git give the remote you cloned from, unless you change it? Type the word.',
          accept: ['origin'],
          explain: '`origin` is just a nickname for the server address, so you never have to type the full address.',
        },
      ],
    },
    {
      id: 'u14-undo',
      title: 'Undoing safely',
      exercises: [
        {
          kind: 'concept',
          title: 'Undo before a commit',
          body: '`git restore app.py` throws away your uncommitted edits to that file and brings back the last committed version. The edits are gone for good, so check `git diff` first.\n\n`git restore --staged app.py` is gentler: it only takes the file out of the staging area. Your edits stay.',
        },
        {
          kind: 'choice',
          prompt: 'You ran `git add` on `draft.txt` by mistake. You want to keep your edits but leave the file out of the next commit. Which command?',
          options: [
            'git restore draft.txt',
            'git commit -m "oops"',
            'git restore --staged draft.txt',
            'Delete draft.txt',
          ],
          answer: 2,
          explain: '`--staged` only un-stages. Plain `git restore draft.txt` would wipe your edits as well.',
        },
        {
          kind: 'type',
          prompt: 'Your edits to `app.py` made things worse, and nothing is committed. Type the command that brings back the last committed version of that file.',
          accept: ['git restore app.py', 'git checkout app.py', 'git checkout -- app.py'],
          explain: 'With no `--staged`, restore replaces the file in your working folder with the committed version.',
        },
        {
          kind: 'concept',
          title: 'Undo after a commit',
          body: '`git revert` adds a **new** commit that does the opposite of an old one. Nothing is erased, so it is safe on branches others use.\n\n`git reset` moves the branch label back, as if later commits never happened. That rewrites history. Use it only on commits you have not pushed.',
        },
        {
          kind: 'steps',
          prompt: 'The branch has commits A, B, C. Commit B added a bug. Tap the right commit.',
          cells: ['A', 'B', 'C', 'D'],
          steps: [
            { ask: 'You run git revert on B. It creates a new commit, D. Where does the branch point now?', answer: 3 },
            { ask: 'Which commit does D cancel out?', answer: 1 },
            { ask: 'Different story: on a private branch with only A, B, C you run git reset back to A. Where does the branch point?', answer: 0 },
          ],
          explain: 'Revert moves forward with a commit that undoes. Reset moves the label backward and leaves the later commits behind.',
        },
        {
          kind: 'choice',
          prompt: 'A bad commit is already on the shared `main`, and teammates have pulled it. What is the safe fix?',
          options: [
            'git reset to before the commit, then force the push',
            'Ask everyone to delete their copy and clone again',
            'Edit the old commit in place',
            'git revert the commit, then push',
          ],
          answer: 3,
          explain: 'Revert adds to history, so everyone simply pulls one more commit. Rewriting shared history leaves teammates with commits that no longer fit.',
        },
        {
          kind: 'concept',
          title: 'Naming the commit to undo',
          body: '`git revert` needs to know which commit to undo. Find its short id with `git log --oneline`, then put the id after `git revert`.\n\n`git reset` takes an id too. With `--hard` it also wipes any edits you have not committed.',
          code: 'git log --oneline\ngit revert c3d9a1f',
        },
        {
          kind: 'spot',
          prompt: 'You are on a branch the whole team shares. Tap the command that could throw away work.',
          lines: ['git status', 'git log --oneline', 'git revert 8be2f04', 'git reset --hard 1a7c5e2', 'git diff'],
          answer: 3,
          explain: '`reset --hard` moves the branch back and wipes uncommitted edits too. The others only look, or add a new commit.',
        },
        {
          kind: 'match',
          prompt: 'Match each situation to the tool for it.',
          pairs: [
            ['Throw away edits to one file', 'git restore file'],
            ['Un-stage a file but keep the edits', 'git restore --staged file'],
            ['Undo a commit others already have', 'git revert'],
            ['Check what you are about to lose', 'git diff'],
          ],
          explain: 'Look first with `git diff`. Then pick the smallest undo that does the job.',
        },
        {
          kind: 'order',
          prompt: 'A commit you pushed yesterday broke the sign-up page. Put the fix in order.',
          lines: [
            'git log --oneline  (find the id of the bad commit)',
            'git revert 8be2f04',
            'Run the tests to check sign-up works again',
            'git push',
          ],
          explain: 'Find the commit, revert it, prove the fix, then share it. The bad commit stays in history, with its undo right after it.',
        },
        {
          kind: 'blank',
          prompt: 'Fill the gaps: first take `notes.txt` out of the staging area, then undo commit `4c1d2aa` with a new commit.',
          code: 'git ___ --staged notes.txt\ngit ___ 4c1d2aa',
          bank: ['restore', 'revert', 'reset', 'remove'],
          answers: ['restore', 'revert'],
          explain: 'Restore deals with changes that are not committed yet. Revert deals with a commit that already exists.',
        },
      ],
    },
  ],
}
