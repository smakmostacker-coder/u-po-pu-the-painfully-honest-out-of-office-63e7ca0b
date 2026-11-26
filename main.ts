// The Painfully Honest Out-of-Office — make.fun entry
// Writes one brutally honest but still polite out-of-office auto-reply
// to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Node 22+, standard library only. No network, no randomness, no secrets.
//
// The entry admits the truth every employee only says privately: the
// inbox is a mountain of unread mail, the enthusiasm is real, and the
// plan for getting through it is nonexistent — then stays polite
// enough that a manager would let it stand.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I'm away until Monday, and your email has joined the 847 unread messages I will open with genuine enthusiasm and absolutely no plan — thank you for your patience.";

function countSentences(text: string): number {
  // A sentence ends on ., ! or ? followed by end-of-text or whitespace.
  // The em dash inside the entry is not a sentence boundary.
  const matches = text.match(/[.!?](?=\s|$)/g);
  return matches === null ? 0 : matches.length;
}

function validate(text: string): void {
  if (text.length === 0) {
    throw new Error("entry must not be empty");
  }
  // Gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
  // not only white space. Count code points, not UTF-16 units.
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end with a full stop");
  }
  // The competition asks for a single sentence: exactly one terminator.
  if (countSentences(text) !== 1) {
    throw new Error(
      `entry must be exactly one sentence, got ${countSentences(text)}`,
    );
  }
  // The reply must stay polite: it thanks the sender.
  if (!/thank you/i.test(text)) {
    throw new Error("entry must thank the sender");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
validate(ENTRY);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
// Read the file back and re-check it: the program only exits cleanly
// when what is on disk is exactly the validated entry, byte for byte.
const written = readFileSync(outPath, "utf8");
if (written !== ENTRY) {
  throw new Error("entry.txt on disk does not match the validated entry");
}
validate(written);
