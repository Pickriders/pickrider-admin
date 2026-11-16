import {
  alignmentPositions,
  buildCodewords,
  dataBytes,
  dataCodewords,
  dataModuleOrder,
  encodeQr,
  formatBits,
  gfMultiply,
  interleave,
  maskModule,
  pickVersion,
  qrPath,
  rsRemainder,
  totalCodewords,
  versionBits,
} from "./qr";

const hex = (bytes: number[]) => bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");

/** Capacity tables for level M, versions 1..10 (ISO/IEC 18004 table 9). */
describe("qr tables", () => {
  it("knows the total and data codewords per version", () => {
    expect(Array.from({ length: 10 }, (_, i) => totalCodewords(i + 1))).toEqual([26, 44, 70, 100, 134, 172, 196, 242, 292, 346]);
    expect(Array.from({ length: 10 }, (_, i) => dataCodewords(i + 1))).toEqual([16, 28, 44, 64, 86, 108, 124, 154, 182, 216]);
  });

  it("places alignment patterns where the standard does", () => {
    expect(alignmentPositions(1)).toEqual([]);
    expect(alignmentPositions(2)).toEqual([6, 18]);
    expect(alignmentPositions(6)).toEqual([6, 34]);
    expect(alignmentPositions(7)).toEqual([6, 22, 38]);
    expect(alignmentPositions(10)).toEqual([6, 28, 50]);
  });

  it("picks the smallest version that fits a byte payload, and gives up past version 10", () => {
    expect(pickVersion(2)).toBe(1);
    expect(pickVersion(14)).toBe(1); // 4 + 8 + 14*8 = 124 bits <= 128
    expect(pickVersion(15)).toBe(2);
    expect(pickVersion(150)).toBe(8); // 154 data codewords
    expect(pickVersion(213)).toBe(10); // 4 + 16 + 213*8 = 1724 <= 1728
    expect(pickVersion(214)).toBeNull();
  });
});

describe("qr bit stream", () => {
  it("encodes a byte-mode payload with terminator and 0xEC/0x11 padding", () => {
    // 0100 (byte mode) 00000010 (2 chars) 'H' 'i' 0000 (terminator), then pad bytes to 16 codewords.
    expect(hex(dataBytes([0x48, 0x69], 1))).toBe("40 24 86 90 ec 11 ec 11 ec 11 ec 11 ec 11 ec 11");
  });

  it("uses a 16-bit character count from version 10", () => {
    const bytes = dataBytes([0x41], 10);
    // 0100 + 0000000000000001 + 01000001 + 0000 ...
    expect(hex(bytes.slice(0, 4))).toBe("40 00 14 10");
    expect(bytes).toHaveLength(216);
  });
});

/** GF(256) polynomial evaluation at a point, Horner style, for the syndrome check. */
function evalAt(poly: number[], point: number) {
  return poly.reduce((acc, coefficient) => gfMultiply(acc, point) ^ coefficient, 0);
}

describe("reed solomon", () => {
  // "HELLO WORLD" at 1-M as the data codewords; the remainder was cross-checked against an
  // independent log/antilog implementation of GF(256) with the 0x11D primitive polynomial.
  const data = [0x20, 0x5b, 0x0b, 0x78, 0xd1, 0x72, 0xdc, 0x4d, 0x43, 0x40, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11];

  it("matches the cross-checked error-correction codewords for a 1-M block", () => {
    expect(hex(rsRemainder(data, 10))).toBe("c4 23 27 77 eb d7 e7 e2 5d 17");
  });

  it("produces a codeword that every generator root divides (all syndromes zero)", () => {
    const codeword = data.concat(rsRemainder(data, 10));
    let root = 1;
    for (let i = 0; i < 10; i += 1) {
      expect(evalAt(codeword, root)).toBe(0);
      root = gfMultiply(root, 2);
    }
    // And a corrupted codeword does not.
    const broken = codeword.slice();
    broken[3] ^= 0x01;
    expect(evalAt(broken, 1)).not.toBe(0);
  });

  it("multiplies in GF(256) with the QR primitive polynomial", () => {
    expect(gfMultiply(0x02, 0x80)).toBe(0x1d); // x * x^7 = x^8 = x^4 + x^3 + x^2 + 1
    expect(gfMultiply(0x53, 0xca)).toBe(0x8f); // cross-checked against the log/antilog tables
    expect(gfMultiply(7, 0)).toBe(0);
  });

  it("interleaves multi-block versions into the right total and keeps every data byte", () => {
    const data = Array.from({ length: dataCodewords(8) }, (_, i) => (i * 7 + 3) & 0xff);
    const out = interleave(data, 8);
    expect(out).toHaveLength(totalCodewords(8));
    // Version 8-M: 2 blocks of 38 and 2 of 39 data codewords, interleaved column by column.
    expect(out.slice(0, 4)).toEqual([data[0], data[38], data[76], data[115]]);
    for (const byte of data) expect(out).toContain(byte);
    expect(out.every((b) => b >= 0 && b <= 255)).toBe(true);
  });
});

describe("format and version information", () => {
  it("produces the standard's format string for level M, mask 0", () => {
    expect(formatBits(0)).toBe(0x5412);
  });

  it("every mask gets a distinct 15-bit format string", () => {
    const all = Array.from({ length: 8 }, (_, mask) => formatBits(mask));
    expect(new Set(all).size).toBe(8);
    for (const bits of all) expect(bits).toBeLessThan(1 << 15);
  });

  it("produces the standard's version strings", () => {
    expect(versionBits(7)).toBe(0x07c94);
    expect(versionBits(8)).toBe(0x085bc);
    expect(versionBits(10)).toBe(0x0a4d3);
  });
});

/** Reads the data modules back out of a finished symbol: unmask, walk the placement order, pack bits. */
function readCodewords(matrix: ReturnType<typeof encodeQr>) {
  const order = dataModuleOrder(matrix.version);
  const bits = order.map(([x, y]) => (matrix.modules[y][x] !== maskModule(matrix.mask, x, y) ? 1 : 0));
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(bits.slice(i, i + 8).reduce<number>((acc, b) => (acc << 1) | b, 0));
  return bytes;
}

describe("encodeQr", () => {
  const finder = (m: boolean[][], ox: number, oy: number) => {
    // 7x7 finder: ring of dark, ring of light, 3x3 dark centre.
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const dist = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        expect(m[oy + y][ox + x]).toBe(dist !== 2);
      }
    }
  };

  it("draws a version 1 symbol for a short payload with finders, timing and the dark module", () => {
    const qr = encodeQr("Hi");
    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    finder(qr.modules, 0, 0);
    finder(qr.modules, 14, 0);
    finder(qr.modules, 0, 14);
    for (let i = 8; i <= 12; i += 1) {
      expect(qr.modules[6][i]).toBe(i % 2 === 0);
      expect(qr.modules[i][6]).toBe(i % 2 === 0);
    }
    expect(qr.modules[qr.size - 8][8]).toBe(true);
  });

  it("writes the format bits for the chosen mask in both copies", () => {
    const qr = encodeQr("Hi");
    const bits = formatBits(qr.mask);
    const bit = (i: number) => ((bits >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i += 1) expect(qr.modules[i][8]).toBe(bit(i));
    expect(qr.modules[7][8]).toBe(bit(6));
    expect(qr.modules[8][8]).toBe(bit(7));
    expect(qr.modules[8][7]).toBe(bit(8));
    for (let i = 9; i < 15; i += 1) expect(qr.modules[8][14 - i]).toBe(bit(i));
    for (let i = 0; i < 8; i += 1) expect(qr.modules[8][qr.size - 1 - i]).toBe(bit(i));
    for (let i = 8; i < 15; i += 1) expect(qr.modules[qr.size - 15 + i][8]).toBe(bit(i));
  });

  it("places the codewords so they read back after unmasking", () => {
    const text = "otpauth://totp/Pickriders%20Admin:ops@pickriders.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Pickriders%20Admin";
    const qr = encodeQr(text);
    const { version, codewords } = buildCodewords(text);
    expect(qr.version).toBe(version);
    expect(version).toBeGreaterThanOrEqual(7); // long enough to exercise version information
    expect(readCodewords(qr).slice(0, codewords.length)).toEqual(codewords);
    // Version information, both copies.
    const vbits = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const a = qr.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      expect(qr.modules[b][a]).toBe(((vbits >>> i) & 1) === 1);
      expect(qr.modules[a][b]).toBe(((vbits >>> i) & 1) === 1);
    }
  });

  it("round-trips the data bytes of a version 1 payload through the matrix", () => {
    const qr = encodeQr("Hi");
    expect(hex(readCodewords(qr).slice(0, 16))).toBe("40 24 86 90 ec 11 ec 11 ec 11 ec 11 ec 11 ec 11");
  });

  it("refuses a payload above version 10", () => {
    expect(() => encodeQr("x".repeat(214))).toThrow(/too long/);
  });

  it("renders dark modules as path runs in module units", () => {
    const path = qrPath({ size: 3, version: 1, mask: 0, modules: [[true, true, false], [false, false, false], [false, true, true]] });
    expect(path).toBe("M0 0h2v1h-2zM1 2h2v1h-2z");
  });
});
