# How Duolingo reminds people, and what ByteQuest took from it

A short teardown of Duolingo's reminder notifications from public sources, used to design ByteQuest's own messages. Pulled 2026-11-22.

The method follows the evidence standard of the open-source [reverse-engineer-marketing](https://github.com/coreyhaines31/marketingskills) skill: every finding is labelled **Observed** (a source shows it, linked), **Inferred** (reasoned from what was observed), or **Not found** (looked, nothing reliable). A gap is not filled with a guess. That skill's method for apps is to turn notifications on and log every push by day for two weeks. That first-hand log was **not done** here; everything below is from published material.

## Findings

| # | Finding | Label | Source |
|---|---|---|---|
| 1 | After a week without a lesson, Duolingo sends what its team calls "the passive aggressive reminder", which says it will stop sending notifications. The thread calls it "one of our most successful notifications" and says this version "always won" against other variants. No numbers are given. | Observed (timing and claim). The notification's exact wording is only an image in the thread; the wording comes from secondary reports. | [Thread by Cem Kansu, writing as the Duolingo team](https://threadreaderapp.com/thread/1301267132009848832.html) (read 2026-11-22; the page does not state his title); wording reported by [Sherwood News](https://sherwood.news/tech/duolingo-q2-earnings-monthly-active-users-milestone/) and [Ironeko](https://ironeko.com/posts/duolingo-and-the-art-of-engagement) |
| 2 | Which message a learner gets is chosen by an algorithm that learns which templates lead to a lesson within two hours, and avoids repeating a template the learner saw recently. | Observed | [Duolingo research paper, KDD 2020](https://research.Duolingo.com/papers/yancey.kdd20.pdf); [Duolingo blog](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/) |
| 3 | Some templates are only eligible in certain states, for example streak messages only for learners with a streak. | Observed | Same paper |
| 4 | The sequence winds down when ignored: a main reminder, a backup, then a pause. | Inferred | Third-party teardowns ([PushPilot](https://pushpilot.ai/blog/duolingo-push-notification-strategy-teardown), [Laudspeaker](https://www.laudspeaker.com/post/duolingos-push-notification-drip-campaign-playbook-with-lots-of-examples)); they disagree on the exact days |
| 5 | The daily reminder arrives about 23.5 hours after the last lesson. | Not found | Widely repeated, but no primary source turned up in this pull. ByteQuest uses this timing as a design choice, not as a verified fact about Duolingo. |
| 6 | An exact day-by-day schedule (which message on day 2, 3, 5). | Not found | Sources conflict: one teardown says reminders pause after three days, the product lead's thread says a week. |
| 7 | The size of the effect of the "we'll stop" message. | Not found | A 3% retention figure appears in a secondary blog with no primary source. Not used. |

## What ByteQuest does with it

| Borrowed idea | From finding | In ByteQuest |
|---|---|---|
| A last message that says reminders are stopping | 1 | Day 7 without a lesson: "These reminders don't seem to be helping. So Pip will stop sending them. Your progress is saved whenever you want it." Sent as a push, or by email if notifications are off. |
| The promise is real | 1 | After that message, the engine sends nothing, on any channel, until the learner practices again. A test checks this over five simulated weeks. |
| Don't repeat yesterday's wording | 2 | The daily streak reminder rotates through four messages by day. There is no learning algorithm: with no learners there is no data to learn from. |
| Messages gated by state | 3 | Each of the 20 rules has its own condition: streak messages need a streak, the stuck message needs repeated wrong answers, and so on. |
| Wind down when ignored | 4 | Days 2–3 a fresh-start push, days 4–6 a progress push, one email on days 5–6, the last message on day 7. One push a day at most. |

## What was deliberately not copied

- **Guilt.** Duolingo's reminders are known for a guilt-tripping tone, and its own team describes the final message as passive-aggressive. ByteQuest's version states the same fact plainly and adds that progress is saved. Whether the plainer wording works as well is untested.
- **Duolingo's wording.** All ByteQuest copy is original and written in Pip's voice.
- **Anything after the last message.** An earlier version of ByteQuest kept emailing at 14 and 30 days. That would have made the day-7 message untrue, so those emails were removed.

## The full sequence for a learner who stops

| Day since last lesson | Channel | Message |
|---|---|---|
| 1 | Push | Streak reminder at the time they usually practice (one of four wordings), then a streak saver at 8pm if the streak is 3 days or more |
| 2–3 | Push | "Day one again? Good." A fresh start, no guilt |
| 4–6 | Push | "N lessons in the bank." Pip kept your place |
| 5–6 | Email | Your place is saved, with the next lesson and an offer of a smaller daily goal |
| 7 | Push (or email) | Reminders are stopping; progress is saved |
| 8 onward | None | Silence until they come back |

Rules and copy: [src/engine/messaging.ts](../src/engine/messaging.ts). Tests: [src/engine/engine.test.ts](../src/engine/engine.test.ts).
