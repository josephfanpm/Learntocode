// Placement tests, one per course: one question per chapter, easiest first.
// Answering a question right skips that chapter; the test stops at the first
// wrong answer or "I don't know". Question i belongs to chapter i of its course.

import type { ChoiceExercise } from './types'

export interface PlacementQuestion extends Omit<ChoiceExercise, 'kind' | 'explain'> {
  /** Unit this question tests out of. */
  unit: string
}

export const PLACEMENT: PlacementQuestion[] = [
  {
    unit: 'u0',
    prompt: 'In binary, what number is written as `101`?',
    options: ['5', '101', '3', '6'],
    answer: 0,
  },
  {
    unit: 'u1',
    prompt: 'What does this print?',
    language: 'python',
    code: 'for i in range(3):\n    print(i)',
    options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3', '3'],
    answer: 0,
  },
  {
    unit: 'u2',
    prompt: 'What does this print?',
    language: 'python',
    code: 'pets = ["cat", "dog", "owl"]\nprint(pets[1] + pets[-1][0])',
    options: ['dogo', 'catd', 'dogw', 'An error'],
    answer: 0,
  },
  {
    unit: 'u3',
    prompt: 'You use binary search on a sorted list of 1,000 names. At most, about how many names do you check?',
    options: ['10', '100', '500', '1,000'],
    answer: 0,
  },
  {
    unit: 'u4',
    prompt: 'What does this print?',
    language: 'python',
    code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)',
    options: ['[1, 2, 3]', '[1, 2]', '[3]', 'An error'],
    answer: 0,
  },
  {
    unit: 'u5',
    prompt: 'This list is used as a stack. What does it print?',
    language: 'python',
    code: 'stack = [1, 2, 3]\nstack.append(4)\nstack.pop()\nprint(stack.pop())',
    options: ['3', '4', '1', '2'],
    answer: 0,
  },
  {
    unit: 'u6',
    prompt: 'What does this print?',
    language: 'python',
    code: 'counts = {}\nfor w in "red blue red".split():\n    counts[w] = counts.get(w, 0) + 1\nprint(counts["red"])',
    options: ['2', '1', 'red', 'A KeyError'],
    answer: 0,
  },
]

/** Developer skills: chapters 1–6 (Git, testing, JavaScript, TypeScript, setup, shipping). */
export const PLACEMENT_DEV: PlacementQuestion[] = [
  {
    unit: 'u14',
    prompt: 'You are on the `main` branch. Which command brings in the commits from a branch called `fix-login`?',
    options: ['git merge fix-login', 'git commit fix-login', 'git push fix-login', 'git branch fix-login'],
    answer: 0,
  },
  {
    unit: 'u15',
    prompt: 'Adults are 18 and over, so this function has a bug. Which test catches it?',
    language: 'python',
    code: 'def is_adult(age):\n    return age > 18',
    options: ['assert is_adult(18) == True', 'assert is_adult(30) == True', 'assert is_adult(5) == False', 'assert is_adult(19) == True'],
    answer: 0,
  },
  {
    unit: 'u16',
    prompt: 'What does this JavaScript print?',
    language: 'javascript',
    code: 'const xs = [1, 2, 3, 4]\nconsole.log(xs.filter((x) => x % 2 === 0).map((x) => x * 10))',
    options: ['[20,40]', '[10,30]', '[2,4]', '[10,20,30,40]'],
    answer: 0,
  },
  {
    unit: 'u17',
    prompt: 'This is TypeScript. What happens?',
    code: 'function greet(name: string): string {\n  return "Hi " + name\n}\ngreet(42)',
    options: ['The compiler reports an error before the code runs', 'It prints Hi 42', 'It crashes while running', 'It returns undefined'],
    answer: 0,
  },
  {
    unit: 'u18',
    prompt: 'Why create a virtual environment for a Python project?',
    options: [
      'So this project’s packages don’t clash with other projects’',
      'So the code runs faster',
      'So other people can’t read the code',
      'Python files won’t run without one',
    ],
    answer: 0,
  },
  {
    unit: 'u19',
    prompt: 'Where should an app’s secret API key live?',
    options: [
      'In an environment variable, kept out of the repository',
      'In the source code, so it is easy to find',
      'In the README',
      'In a comment next to where it is used',
    ],
    answer: 0,
  },
]

/** Building with AI: chapters 1–6 (models, prompting, the API, context, reliable output, tools). */
export const PLACEMENT_AI: PlacementQuestion[] = [
  {
    unit: 'u26',
    prompt: 'A chat model seems to remember what you said earlier in the conversation. How?',
    options: [
      'The whole conversation so far is sent to the model again each time',
      'Each chat is added to its training data as you go',
      'It keeps a private memory of every user',
      'It only ever sees your latest message',
    ],
    answer: 0,
  },
  {
    unit: 'u27',
    prompt: 'Which prompt is most likely to get a useful answer?',
    options: [
      'Summarise the report below in 3 bullet points for a busy sales manager. Focus on risks.',
      'Summarise this.',
      'Make it good.',
      'Summarise the report. Keep it very short but include every detail.',
    ],
    answer: 0,
  },
  {
    unit: 'u28',
    prompt: 'In a call to the Claude Messages API, what does the `messages` list hold?',
    options: [
      'The conversation turns so far, each with a role and content',
      'Only the newest user message',
      'The model’s settings, such as max_tokens',
      'A list of models to try in order',
    ],
    answer: 0,
  },
  {
    unit: 'u29',
    prompt: 'A conversation has grown too long for the model’s context window. What is a sensible fix?',
    options: [
      'Summarise or drop the oldest turns and keep the newest',
      'Send the same request again',
      'Raise max_tokens',
      'Tell the model to remember harder',
    ],
    answer: 0,
  },
  {
    unit: 'u30',
    prompt: 'You changed a prompt and one answer looks better. What tells you the change really helped?',
    options: [
      'Running both versions on the same set of test inputs and comparing scores',
      'The new answer is longer',
      'The model says it is confident',
      'Trying it one more time',
    ],
    answer: 0,
  },
  {
    unit: 'u31',
    prompt: 'When a model “uses a tool”, what actually happens?',
    options: [
      'The model asks for the tool with inputs; your code runs it and sends back the result',
      'The model runs the function itself on its own servers',
      'The model edits your code to add the function',
      'Your tool runs first, and the model is only called afterwards',
    ],
    answer: 0,
  },
]

/** One Python question asked before the Developer skills quiz: can they already program? */
export const GATE: PlacementQuestion = {
  unit: 'u1',
  prompt: 'What does this print?',
  language: 'python',
  code: 'total = 0\nfor n in [2, 4, 6]:\n    if n > 2:\n        total = total + n\nprint(total)',
  options: ['10', '12', '6', '0'],
  answer: 0,
}

export const PLACEMENTS = { cs: PLACEMENT, dev: PLACEMENT_DEV, ai: PLACEMENT_AI }
