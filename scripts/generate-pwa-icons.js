import fs from 'fs';
import zlib from 'zlib';

function createPNGBuffer(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw pixel data: each row has 1 filter byte (0) + width * 3 bytes (RGB)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 3;
      // Border logic
      const isBorder = x < 16 || x > width - 16 || y < 16 || y > height - 16;
      if (isBorder) {
        rawData[idx] = 79;   // R (#4f46e5)
        rawData[idx + 1] = 70; // G
        rawData[idx + 2] = 229; // B
      } else {
        rawData[idx] = r;
        rawData[idx + 1] = g;
        rawData[idx + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate PWA Icons (#0f172a background -> R:15, G:23, B:42)
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPNGBuffer(192, 192, 15, 23, 42));
fs.writeFileSync('public/pwa-512x512.png', createPNGBuffer(512, 512, 15, 23, 42));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNGBuffer(512, 512, 30, 27, 75));
fs.writeFileSync('public/apple-touch-icon.png', createPNGBuffer(180, 180, 15, 23, 42));

console.log('✅ PWA Icons successfully generated in /public!');
