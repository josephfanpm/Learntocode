// Placement test: one question per unit, easiest first. Answering a question
// right skips that unit; the test stops at the first wrong answer or
// "I don't know". Seven right answers start the learner at unit 7 (SQL).

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
