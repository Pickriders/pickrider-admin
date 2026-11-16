/**
 * A compact QR code encoder for the authenticator setup screen: byte mode, error correction
 * level M, versions 1 to 10 (up to 213 bytes, enough for any otpauth:// URI the core issues).
 * Follows ISO/IEC 18004 the way Nayuki's reference encoder lays it out: data codewords, Reed
 * Solomon blocks interleaved, function patterns, zigzag placement, all eight masks scored and
 * the best one kept. No dependency; the output is a module matrix the SVG renderer draws.
 */
export type QrMatrix = {
  /** Modules per side (17 + 4 * version). */
  size: number;
  version: number;
  mask: number;
  /** modules[y][x] is true for a dark module. */
  modules: boolean[][];
};

const MAX_VERSION = 10;

/** Level M, versions 1..10: error-correction codewords per block and number of blocks. */
const ECC_PER_BLOCK = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

// ── Capacity ──────────────────────────────────────────────────────────────────

/** Every data module in the symbol (function patterns excluded), as the standard counts them. */
export function rawDataModules(version: number) {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

export function totalCodewords(version: number) {
  return Math.floor(rawDataModules(version) / 8);
}

/** Codewords left for data at level M. */
export function dataCodewords(version: number) {
  return totalCodewords(version) - ECC_PER_BLOCK[version - 1] * NUM_BLOCKS[version - 1];
}

/** Byte mode character count field: 8 bits through version 9, 16 from version 10. */
export function byteCountBits(version: number) {
  return version <= 9 ? 8 : 16;
}

export function utf8Bytes(text: string): number[] {
  if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(text));
  const out: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  return out;
}

/** The smallest version whose data capacity holds the bytes, or null above version 10. */
export function pickVersion(byteLength: number): number | null {
  for (let version = 1; version <= MAX_VERSION; version += 1) {
    const needed = 4 + byteCountBits(version) + byteLength * 8;
    if (needed <= dataCodewords(version) * 8) return version;
  }
  return null;
}

// ── Bit stream ────────────────────────────────────────────────────────────────

class BitBuffer {
  bits: number[] = [];
  push(value: number, length: number) {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push((value >>> i) & 1);
  }
  toBytes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j += 1) byte = (byte << 1) | (this.bits[i + j] ?? 0);
      out.push(byte);
    }
    return out;
  }
}

/** Mode, count, data, terminator, byte alignment and the 0xEC/0x11 pad bytes, for the version. */
export function dataBytes(bytes: number[], version: number): number[] {
  const capacity = dataCodewords(version) * 8;
  const buffer = new BitBuffer();
  buffer.push(0b0100, 4);
  buffer.push(bytes.length, byteCountBits(version));
  for (const byte of bytes) buffer.push(byte, 8);
  if (buffer.bits.length > capacity) throw new Error("Payload does not fit the version");
  buffer.push(0, Math.min(4, capacity - buffer.bits.length));
  while (buffer.bits.length % 8 !== 0) buffer.bits.push(0);
  for (let pad = 0xec; buffer.bits.length < capacity; pad ^= 0xec ^ 0x11) buffer.push(pad, 8);
  return buffer.toBytes();
}

// ── Reed Solomon over GF(256), primitive polynomial 0x11D ─────────────────────

export function gfMultiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

/** Coefficients of the generator polynomial (x - a^0)(x - a^1)...(x - a^(degree-1)), highest power first, leading 1 dropped. */
export function rsGenerator(degree: number): number[] {
  const result = new Array<number>(degree - 1).fill(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

/** The error-correction codewords for a block of data codewords. */
export function rsRemainder(data: number[], degree: number): number[] {
  const generator = rsGenerator(degree);
  const result = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() as number);
    result.push(0);
    for (let j = 0; j < result.length; j += 1) result[j] ^= gfMultiply(generator[j], factor);
  }
  return result;
}

/** Splits data into the version's blocks, appends each block's EC and interleaves them into the final codeword sequence. */
export function interleave(data: number[], version: number): number[] {
  const numBlocks = NUM_BLOCKS[version - 1];
  const eccLength = ECC_PER_BLOCK[version - 1];
  const raw = totalCodewords(version);
  const numShortBlocks = numBlocks - (raw % numBlocks);
  const shortBlockLength = Math.floor(raw / numBlocks);
  const blocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < numBlocks; i += 1) {
    const length = shortBlockLength - eccLength + (i < numShortBlocks ? 0 : 1);
    const block = data.slice(offset, offset + length);
    offset += length;
    const ecc = rsRemainder(block, eccLength);
    if (i < numShortBlocks) block.push(-1); // placeholder so every block has the long length
    blocks.push(block.concat(ecc));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLength - eccLength || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

/** The full codeword sequence for a text, and the version it needs. */
export function buildCodewords(text: string): { version: number; codewords: number[] } {
  const bytes = utf8Bytes(text);
  const version = pickVersion(bytes.length);
  if (!version) throw new Error(`Text is too long for a version ${MAX_VERSION} QR code (${bytes.length} bytes)`);
  return { version, codewords: interleave(dataBytes(bytes, version), version) };
}

// ── Function patterns ─────────────────────────────────────────────────────────

/** 15 format bits for level M (bits 00) and the mask, BCH coded and XORed with 0x5412. */
export function formatBits(mask: number) {
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

/** 18 version bits (versions 7 and up), BCH coded. */
export function versionBits(version: number) {
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  return (version << 12) | rem;
}

/** Centre coordinates of the alignment patterns along one axis. */
export function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const numAlign = Math.floor(version / 7) + 2;
  const size = 17 + 4 * version;
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

const bit = (value: number, index: number) => ((value >>> index) & 1) !== 0;

class QrSymbol {
  readonly size: number;
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];

  constructor(readonly version: number) {
    this.size = 17 + 4 * version;
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
  }

  setFunction(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.isFunction[y][x] = true;
  }

  drawFunctionPatterns() {
    for (let i = 0; i < this.size; i += 1) {
      this.setFunction(6, i, i % 2 === 0);
      this.setFunction(i, 6, i % 2 === 0);
    }
    this.drawFinder(3, 3);
    this.drawFinder(this.size - 4, 3);
    this.drawFinder(3, this.size - 4);
    const positions = alignmentPositions(this.version);
    const last = positions.length - 1;
    positions.forEach((cx, i) => {
      positions.forEach((cy, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
        for (let dy = -2; dy <= 2; dy += 1)
          for (let dx = -2; dx <= 2; dx += 1)
            this.setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    this.drawFormatBits(0);
    this.drawVersion();
  }

  drawFinder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) this.setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  }

  drawFormatBits(mask: number) {
    const bits = formatBits(mask);
    for (let i = 0; i <= 5; i += 1) this.setFunction(8, i, bit(bits, i));
    this.setFunction(8, 7, bit(bits, 6));
    this.setFunction(8, 8, bit(bits, 7));
    this.setFunction(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i += 1) this.setFunction(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i += 1) this.setFunction(this.size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i += 1) this.setFunction(8, this.size - 15 + i, bit(bits, i));
    this.setFunction(8, this.size - 8, true);
  }

  drawVersion() {
    if (this.version < 7) return;
    const bits = versionBits(this.version);
    for (let i = 0; i < 18; i += 1) {
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunction(a, b, bit(bits, i));
      this.setFunction(b, a, bit(bits, i));
    }
  }

  /** Every data module in placement order (zigzag, two columns at a time, right to left). */
  placementOrder(): [number, number][] {
    const order: [number, number][] = [];
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert += 1) {
        for (let j = 0; j < 2; j += 1) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y][x]) order.push([x, y]);
        }
      }
    }
    return order;
  }

  drawCodewords(codewords: number[]) {
    const order = this.placementOrder();
    order.forEach(([x, y], i) => {
      this.modules[y][x] = i < codewords.length * 8 ? bit(codewords[i >>> 3], 7 - (i & 7)) : false;
    });
  }

  applyMask(mask: number) {
    for (let y = 0; y < this.size; y += 1) {
      for (let x = 0; x < this.size; x += 1) {
        if (!this.isFunction[y][x] && maskBit(mask, x, y)) this.modules[y][x] = !this.modules[y][x];
      }
    }
  }

  penalty(): number {
    let result = 0;
    const size = this.size;
    // Adjacent modules in a row or column with the same colour, and finder-like patterns.
    for (let y = 0; y < size; y += 1) {
      let runColor = false;
      let runX = 0;
      const history = new Array<number>(7).fill(0);
      for (let x = 0; x < size; x += 1) {
        if (this.modules[y][x] === runColor) {
          runX += 1;
          if (runX === 5) result += PENALTY_N1;
          else if (runX > 5) result += 1;
        } else {
          addRun(history, runX, size);
          if (!runColor) result += countFinderPatterns(history) * PENALTY_N3;
          runColor = this.modules[y][x];
          runX = 1;
        }
      }
      result += terminateRun(history, runColor, runX, size) * PENALTY_N3;
    }
    for (let x = 0; x < size; x += 1) {
      let runColor = false;
      let runY = 0;
      const history = new Array<number>(7).fill(0);
      for (let y = 0; y < size; y += 1) {
        if (this.modules[y][x] === runColor) {
          runY += 1;
          if (runY === 5) result += PENALTY_N1;
          else if (runY > 5) result += 1;
        } else {
          addRun(history, runY, size);
          if (!runColor) result += countFinderPatterns(history) * PENALTY_N3;
          runColor = this.modules[y][x];
          runY = 1;
        }
      }
      result += terminateRun(history, runColor, runY, size) * PENALTY_N3;
    }
    // 2x2 blocks of one colour.
    for (let y = 0; y < size - 1; y += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const color = this.modules[y][x];
        if (
          color === this.modules[y][x + 1] &&
          color === this.modules[y + 1][x] &&
          color === this.modules[y + 1][x + 1]
        )
          result += PENALTY_N2;
      }
    }
    // Balance of dark and light modules.
    let dark = 0;
    for (const row of this.modules) for (const cell of row) if (cell) dark += 1;
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * PENALTY_N4;
    return result;
  }
}

function maskBit(mask: number, x: number, y: number) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function addRun(history: number[], run: number, size: number) {
  if (history[0] === 0) run += size; // a light run at the edge counts as touching the quiet zone
  history.pop();
  history.unshift(run);
}

/** Dark:light:dark:light:dark in 1:1:3:1:1 with at least 4 light modules on a side, as in the finder. */
function countFinderPatterns(history: number[]) {
  const n = history[1];
  const core = n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
  return (
    (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) + (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0)
  );
}

function terminateRun(history: number[], runColor: boolean, run: number, size: number) {
  if (runColor) {
    addRun(history, run, size);
    run = 0;
  }
  addRun(history, run + size, size);
  return countFinderPatterns(history);
}

// ── Public ────────────────────────────────────────────────────────────────────

export function encodeQr(text: string): QrMatrix {
  const { version, codewords } = buildCodewords(text);
  const symbol = new QrSymbol(version);
  symbol.drawFunctionPatterns();
  symbol.drawCodewords(codewords);
  let best = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask += 1) {
    symbol.applyMask(mask);
    symbol.drawFormatBits(mask);
    const penalty = symbol.penalty();
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      best = mask;
    }
    symbol.applyMask(mask); // undo
  }
  symbol.applyMask(best);
  symbol.drawFormatBits(best);
  return { size: symbol.size, version, mask: best, modules: symbol.modules.map((row) => row.slice()) };
}

/** Test and renderer helper: the placement order of the data modules for a version. */
export function dataModuleOrder(version: number): [number, number][] {
  const symbol = new QrSymbol(version);
  symbol.drawFunctionPatterns();
  return symbol.placementOrder();
}

export function maskModule(mask: number, x: number, y: number) {
  return maskBit(mask, x, y);
}

/** One SVG path drawing every dark module as a unit square, in module units. */
export function qrPath(matrix: QrMatrix): string {
  const parts: string[] = [];
  matrix.modules.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      let run = 1;
      while (row[x + run]) run += 1;
      parts.push(`M${x} ${y}h${run}v1h-${run}z`);
      x += run;
    }
  });
  return parts.join("");
}
