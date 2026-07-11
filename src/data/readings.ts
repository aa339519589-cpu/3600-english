import type { ReadingArticle } from '../types'

export const readings: ReadingArticle[] = [
  {
    id: 'r-light-courtyard',
    title: 'A Light Across the Courtyard',
    deck: 'Sometimes company is only a small square of light.',
    level: 'middle',
    minutes: 3,
    dateLabel: '今日短文',
    paragraphs: [
      'At half past nine, when the library began to empty, a lamp came on in the window across the courtyard. I never saw the person who lit it. I saw only the warm square of light, a plant leaning toward the glass, and sometimes the shadow of a hand turning a page.',
      'During exam week, I stayed late each night. The library felt enormous after the footsteps faded, and every unfinished chapter seemed heavier than the last. Yet the lamp remained. It did not hurry me or ask whether I had learned enough. It simply kept its quiet place in the dark.',
      'On Friday, I looked up and found the opposite window black. Then I noticed my own desk lamp reflected in the glass. Perhaps someone across the courtyard had once looked toward me in the same way. I left the lamp on for another minute.',
    ],
    words: [
      { word: 'courtyard', gloss: '庭院；院子' },
      { word: 'faded', gloss: '逐渐消失；变淡' },
      { word: 'remained', gloss: '仍然存在；留下' },
      { word: 'reflected', gloss: '映出；反射' },
    ],
    question: 'Why does the narrator leave the lamp on?',
    choices: ['To offer the same quiet company to someone else.', 'To finish one more chapter.', 'To help the librarian lock the building.'],
    answer: 'To offer the same quiet company to someone else.',
    reflection: '陪伴不一定要发出声音，有时只要让一盏灯多亮一分钟。',
  },
  {
    id: 'r-umbrella-room-twelve',
    title: 'The Umbrella in Room Twelve',
    deck: 'A borrowed object remembers the weather for us.',
    level: 'basic',
    minutes: 2,
    dateLabel: '昨日短文',
    paragraphs: [
      'An old blue umbrella stood in the corner of Room Twelve. Nobody knew who had left it there. On sunny days, it was easy to forget. But whenever rain began, someone would carry it to the school gate and hand it to a student without one.',
      'The umbrella always returned the next morning. Sometimes it was neatly closed. Sometimes drops of water still shone on its cloth. A small paper label on the handle said only, “Bring me back when the sky is clear.”',
      'By the end of the year, the blue had grown pale and one spoke was bent. Still, the umbrella waited in its corner. It belonged to no one, which was perhaps why it could belong to everyone for a little while.',
    ],
    words: [
      { word: 'whenever', gloss: '每当；无论何时' },
      { word: 'neatly', gloss: '整齐地；利落地' },
      { word: 'handle', gloss: '把手；柄' },
      { word: 'bent', gloss: '弯曲的' },
    ],
    question: 'What makes the umbrella special?',
    choices: ['Anyone who needs it may borrow it.', 'It never becomes wet.', 'A teacher brings it home every day.'],
    answer: 'Anyone who needs it may borrow it.',
    reflection: '一件无人占有的小物，也可以让许多人记住被照顾的感觉。',
  },
  {
    id: 'r-what-tide-returns',
    title: 'What the Tide Returns',
    deck: 'The shore keeps no promise about what it will give back.',
    level: 'advanced',
    minutes: 4,
    dateLabel: '前日短文',
    paragraphs: [
      'Every winter, Mara walked the northern beach after a storm. The tide scattered ordinary things along the sand: pale rope, smooth glass, a single glove. She collected none of them. She preferred to imagine that the sea had placed each object there as the final line of a story whose beginning had been lost.',
      'One morning she found a wooden ruler marked with a child’s careful handwriting. Beside each number was a date. The marks stopped at 142 centimetres. Mara thought of a doorway somewhere, a child standing straight against it, and a hand drawing one more line above dark hair.',
      'For the first time, she carried something home. She kept the ruler for three days, then returned it to the beach before dawn. Keeping it had made the story smaller, as if her answer were the only possible one. By returning it, she restored its uncertainty.',
      'At noon the ruler was gone. The tide might have taken it, or another walker might have found it. Mara felt no need to decide. Some stories remain generous only while they are unfinished.',
    ],
    words: [
      { word: 'ordinary', gloss: '普通的；平常的' },
      { word: 'marked', gloss: '做了标记的' },
      { word: 'restored', gloss: '恢复；归还' },
      { word: 'careful', gloss: '仔细的；谨慎的' },
      { word: 'generous', gloss: '丰富的；慷慨的' },
    ],
    question: 'Why does Mara return the ruler to the beach?',
    choices: ['She wants to keep its story open to other possibilities.', 'She learns that it belongs to a nearby child.', 'She is afraid the ruler will break at home.'],
    answer: 'She wants to keep its story open to other possibilities.',
    reflection: '过早确定一个答案，有时会缩小故事；留一点未完成，想象才有继续呼吸的地方。',
  },
]

export function getTodayReading(date = new Date()): ReadingArticle {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return readings[Math.abs(dayNumber) % readings.length]
}
