/**
 * What the app home says today. The day decides the greeting ("Happy Friday"),
 * special dates override it, and each visit pulls a different line and joke
 * (the last one shown on this device is never repeated straight away).
 */

export type DayMood = { hello: string; lines: string[] };

const WEEK: DayMood[] = [
  { hello: "Happy Sunday", lines: ["Slow coffee. Slower brushstrokes.", "A day for wandering round galleries in your socks.", "Sunday rule: no rules, just paint."] },
  { hello: "Hello Monday", lines: ["Bit grey out. Let's add some colour.", "New week, fresh canvas. Mind the drips.", "Mondays are just Fridays that haven't been painted yet."] },
  { hello: "Happy Tuesday", lines: ["The week's warmed up. So has the paint.", "Tuesday: criminally underrated, like a good underpainting.", "Nobody's ever said 'thank god it's Tuesday'. Let's change that."] },
  { hello: "Happy Wednesday", lines: ["Halfway there. Treat yourself to a new piece.", "Hump day. The bee's halfway up the wall.", "Midweek, mid-masterpiece."] },
  { hello: "Happy Thursday", lines: ["Basically Friday, if you squint.", "Thursday is Friday's warm-up act. Stretch those eyes.", "Nearly the weekend. Nearly naughty."] },
  { hello: "Happy Friday", lines: ["The paint's wet, the wine's open.", "Weekend loading. Art first, chaos after.", "Friday feeling, framed and hung."] },
  { hello: "Happy Saturday", lines: ["No alarms, just art.", "Saturday: perfect for falling in love with a painting.", "Brunch, gallery, nap. In that order."] },
];

/** Fixed dates (MM-DD) that beat the weekday. */
const SPECIAL: Record<string, DayMood> = {
  "01-01": { hello: "Happy New Year", lines: ["New year, same honest paint.", "Resolution: more art on your walls."] },
  "02-14": { hello: "Happy Valentine's", lines: ["Roses are red, canvases too.", "Fall for something one of one."] },
  "03-17": { hello: "Happy St Patrick's", lines: ["Forty shades of green, and that's just the palette."] },
  "04-01": { hello: "Happy April Fools'", lines: ["Every painting is now free. (It isn't.)"] },
  "10-31": { hello: "Happy Halloween", lines: ["Spooky season. The paintings are watching.", "Trick or treat? Treat. Obviously."] },
  "11-05": { hello: "Remember, remember", lines: ["Fireworks outside, colour inside."] },
  "12-24": { hello: "Happy Christmas Eve", lines: ["Still need a gift? We know a bee."] },
  "12-25": { hello: "Merry Christmas", lines: ["Merry everything. Thank you for being in the Hive."] },
  "12-26": { hello: "Happy Boxing Day", lines: ["Leftovers and a little light browsing."] },
  "12-31": { hello: "Happy New Year's Eve", lines: ["One last look before midnight."] },
};

export const JOKES: { q: string; a: string }[] = [
  { q: "Why did the painting go to jail?", a: "It was framed." },
  { q: "What do you call a painter with no money?", a: "A brush with poverty." },
  { q: "Why was the artist always calm?", a: "She had a good sense of balance." },
  { q: "What did the bee say to the flower?", a: "Hey bud, when do you open?" },
  { q: "Why don't paintings ever win at hide and seek?", a: "They always get hung up." },
  { q: "What's an artist's favourite exercise?", a: "Drawing breath." },
  { q: "Why did the bee get married?", a: "She finally found her honey." },
  { q: "What did the canvas say to the painter?", a: "Stop touching me. Actually, don't." },
  { q: "Why are art galleries so quiet?", a: "Everyone's too busy being moved." },
  { q: "How do bees get to the studio?", a: "On the buzz." },
  { q: "What did the palette say to the brush?", a: "You complete me. Mostly in burnt sienna." },
  { q: "Why did the artist break up with the pencil?", a: "It was too sketchy." },
  { q: "What's a bee's favourite painting?", a: "The Mona Bee-sa." },
  { q: "Why did the art thief bring a ladder?", a: "He'd heard the prices were high." },
  { q: "What do you call a sleeping painting?", a: "A still life." },
  { q: "Why was the easel so tired?", a: "It had been standing all day." },
  { q: "What's the most honest colour?", a: "True blue. The rest are bluffing." },
  { q: "Why do bees hum?", a: "They forgot the words." },
  { q: "What did Picasso say when he lost his glasses?", a: "Everything looks cubist." },
  { q: "Why did the watercolour get the job?", a: "It was very fluid in interviews." },
  { q: "What's an artist's favourite month?", a: "Draw-gust." },
  { q: "Why did the bee go to the doctor?", a: "Hives." },
  { q: "What did one wall say to the other?", a: "Meet you at the corner. Bring a nice frame." },
  { q: "Why did the painter refuse to argue?", a: "She didn't want to cross the line." },
  { q: "Why are artists great at football?", a: "They know how to draw a foul." },
  { q: "What do galleries and onions have in common?", a: "Layers. And people cry in both." },
  { q: "Why did the artist bring a ladder to the gallery?", a: "She wanted to take her work to the next level." },
  { q: "What's a painter's favourite type of shoe?", a: "Brogues. Pollock-splattered ones." },
  { q: "What does a bee use to brush its hair?", a: "A honeycomb." },
];

const londonParts = (now: Date) => {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", month: "2-digit", day: "2-digit", hour: "numeric", hour12: false });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { dow, md: `${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
};

export function moodFor(now = new Date()): DayMood & { timeOfDay: string } {
  const { dow, md, hour } = londonParts(now);
  const base = SPECIAL[md] ?? WEEK[dow];
  const timeOfDay = hour < 5 ? "Up late" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  return { ...base, timeOfDay };
}

/** A number that is the same all day (London), different tomorrow: for "painting of the day". */
export function daySeed(now = new Date()) {
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
  return [...d].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
}

/** A random index for this visit, never the same as the last one shown on this device. */
export function freshIndex(key: string, length: number) {
  if (length <= 1) return 0;
  let last = -1;
  try { last = Number(localStorage.getItem(key) ?? -1); } catch {}
  let i = Math.floor(Math.random() * length);
  if (i === last) i = (i + 1 + Math.floor(Math.random() * (length - 1))) % length;
  try { localStorage.setItem(key, String(i)); } catch {}
  return i;
}
