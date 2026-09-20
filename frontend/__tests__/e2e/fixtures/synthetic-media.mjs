/**
 * ============================================================================
 * Synthetic Media Fixtures & Binary Generators for E2E Tests
 * ============================================================================
 * 
 * Provides deterministic, spec-compliant synthetic buffers for:
 * - Valid MP4 ISO Base Media containers (ftyp, moov, mvhd, trak, mdat)
 * - Corrupted / truncated video files
 * - Valid minimal and multi-page PDF documents (PDF-1.4 spec)
 * - Image-heavy PDF documents with indirect image XObject streams
 * - Corrupted / non-PDF binary payloads
 */

/**
 * Helper to write a 32-bit big-endian integer into a Uint8Array
 */
function writeUint32BE(buffer, offset, value) {
  buffer[offset] = (value >>> 24) & 0xff;
  buffer[offset + 1] = (value >>> 16) & 0xff;
  buffer[offset + 2] = (value >>> 8) & 0xff;
  buffer[offset + 3] = value & 0xff;
}

/**
 * Helper to write a 4-character ASCII fourcc code into a Uint8Array
 */
function writeFourCC(buffer, offset, fourcc) {
  for (let i = 0; i < 4; i++) {
    buffer[offset + i] = fourcc.charCodeAt(i);
  }
}

/**
 * Helper to construct an MP4 box (atom) with size header
 */
function createBox(fourcc, payload) {
  const size = 8 + payload.length;
  const box = new Uint8Array(size);
  writeUint32BE(box, 0, size);
  writeFourCC(box, 4, fourcc);
  box.set(payload, 8);
  return box;
}

/**
 * Concatenates multiple Uint8Array buffers
 */
export function concatBuffers(...buffers) {
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}

/**
 * Generates a valid ISO Base Media File Format (MP4) buffer
 * containing ftyp, moov (with mvhd and trak headers), and mdat boxes.
 */
export function createValidMp4Buffer({
  durationSec = 10,
  width = 1920,
  height = 1080,
  hasAudio = true,
  timescale = 1000,
  payloadBytes = 256,
} = {}) {
  // 1. ftyp box
  const ftypPayload = new Uint8Array(16);
  writeFourCC(ftypPayload, 0, "isom"); // major_brand
  writeUint32BE(ftypPayload, 4, 0x00000200); // minor_version
  writeFourCC(ftypPayload, 8, "isom"); // compatible_brands[0]
  writeFourCC(ftypPayload, 12, "mp41"); // compatible_brands[1]
  const ftypBox = createBox("ftyp", ftypPayload);

  // 2. mvhd box (Movie Header Box)
  // Version 0: 4 bytes version/flags, 4 bytes creation_time, 4 bytes modification_time,
  // 4 bytes timescale, 4 bytes duration, 4 bytes rate (0x00010000 = 1.0),
  // 2 bytes volume (0x0100 = 1.0), 10 bytes reserved, 36 bytes matrix,
  // 24 bytes pre_defined, 4 bytes next_track_ID
  const mvhdPayload = new Uint8Array(100);
  mvhdPayload[0] = 0; // version 0
  writeUint32BE(mvhdPayload, 12, timescale); // timescale
  writeUint32BE(mvhdPayload, 16, Math.floor(durationSec * timescale)); // duration
  writeUint32BE(mvhdPayload, 20, 0x00010000); // rate 1.0
  mvhdPayload[24] = 0x01; // volume 1.0
  // Identity matrix
  writeUint32BE(mvhdPayload, 36, 0x00010000);
  writeUint32BE(mvhdPayload, 52, 0x00010000);
  writeUint32BE(mvhdPayload, 80, 0x40000000);
  writeUint32BE(mvhdPayload, 96, hasAudio ? 3 : 2); // next_track_ID
  const mvhdBox = createBox("mvhd", mvhdPayload);

  // 3. Video Track (trak)
  // tkhd: Track Header Box
  const tkhdPayload = new Uint8Array(84);
  tkhdPayload[0] = 0; // version 0
  tkhdPayload[3] = 0x07; // flags: track_enabled | track_in_movie | track_in_preview
  writeUint32BE(tkhdPayload, 12, 1); // track_ID = 1
  writeUint32BE(tkhdPayload, 20, Math.floor(durationSec * timescale)); // duration
  // Identity matrix
  writeUint32BE(tkhdPayload, 36, 0x00010000);
  writeUint32BE(tkhdPayload, 52, 0x00010000);
  writeUint32BE(tkhdPayload, 68, 0x40000000);
  writeUint32BE(tkhdPayload, 76, width << 16); // width 16.16 fixed point
  writeUint32BE(tkhdPayload, 80, height << 16); // height 16.16 fixed point
  const tkhdBox = createBox("tkhd", tkhdPayload);

  // mdia / hdlr / minf
  const hdlrPayload = new Uint8Array(25);
  writeFourCC(hdlrPayload, 8, "vide"); // handler_type
  const hdlrBox = createBox("hdlr", hdlrPayload);

  const mdiaBox = createBox("mdia", concatBuffers(hdlrBox));
  const videoTrakBox = createBox("trak", concatBuffers(tkhdBox, mdiaBox));

  // 4. Audio Track (optional)
  let audioTrakBox = new Uint8Array(0);
  if (hasAudio) {
    const audioTkhdPayload = new Uint8Array(84);
    audioTkhdPayload[3] = 0x07;
    writeUint32BE(audioTkhdPayload, 12, 2); // track_ID = 2
    writeUint32BE(audioTkhdPayload, 20, Math.floor(durationSec * timescale));
    audioTkhdPayload[36] = 0x01; // audio volume
    const audioTkhdBox = createBox("tkhd", audioTkhdPayload);

    const audioHdlrPayload = new Uint8Array(25);
    writeFourCC(audioHdlrPayload, 8, "soun"); // handler_type
    const audioHdlrBox = createBox("hdlr", audioHdlrPayload);

    const audioMdiaBox = createBox("mdia", concatBuffers(audioHdlrBox));
    audioTrakBox = createBox("trak", concatBuffers(audioTkhdBox, audioMdiaBox));
  }

  // Combine moov box
  const moovBox = createBox("moov", concatBuffers(mvhdBox, videoTrakBox, audioTrakBox));

  // 5. mdat box (Media Data Box) with simulated payload
  const mdatPayload = new Uint8Array(payloadBytes);
  for (let i = 0; i < payloadBytes; i++) {
    mdatPayload[i] = (i * 37) & 0xff;
  }
  const mdatBox = createBox("mdat", mdatPayload);

  return concatBuffers(ftypBox, moovBox, mdatBox);
}

/**
 * Parses top-level MP4 boxes from a buffer to inspect structure
 */
export function parseMp4Structure(buffer) {
  const boxes = [];
  let offset = 0;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  while (offset + 8 <= buffer.byteLength) {
    const size = view.getUint32(offset);
    if (size < 8 || offset + size > buffer.byteLength) {
      break;
    }
    const type = String.fromCharCode(
      buffer[offset + 4],
      buffer[offset + 5],
      buffer[offset + 6],
      buffer[offset + 7]
    );
    boxes.push({ type, offset, size });
    offset += size;
  }

  const moovBox = boxes.find((b) => b.type === "moov");
  let duration = null;
  let timescale = null;

  if (moovBox) {
    // Look for mvhd inside moov
    const moovEnd = moovBox.offset + moovBox.size;
    let subOffset = moovBox.offset + 8;
    while (subOffset + 8 <= moovEnd) {
      const subSize = view.getUint32(subOffset);
      if (subSize < 8 || subOffset + subSize > moovEnd) break;
      const subType = String.fromCharCode(
        buffer[subOffset + 4],
        buffer[subOffset + 5],
        buffer[subOffset + 6],
        buffer[subOffset + 7]
      );
      if (subType === "mvhd") {
        timescale = view.getUint32(subOffset + 8 + 12);
        const durationUnits = view.getUint32(subOffset + 8 + 16);
        duration = timescale > 0 ? durationUnits / timescale : 0;
        break;
      }
      subOffset += subSize;
    }
  }

  return {
    boxes,
    hasFtyp: boxes.some((b) => b.type === "ftyp"),
    hasMoov: !!moovBox,
    hasMdat: boxes.some((b) => b.type === "mdat"),
    duration,
    timescale,
    totalBytes: buffer.byteLength,
  };
}

/**
 * Creates an empty 0-byte buffer
 */
export function createEmptyBuffer() {
  return new Uint8Array(0);
}

/**
 * Creates a corrupt buffer with invalid header bytes
 */
export function createCorruptedMediaBuffer(size = 128) {
  const buf = new Uint8Array(size);
  // Fill with arbitrary corrupted bytes that don't match any container header
  for (let i = 0; i < size; i++) {
    buf[i] = (0xaa ^ (i * 13)) & 0xff;
  }
  return buf;
}

/**
 * Generates a valid standard PDF 1.4 document buffer from scratch.
 * Compatible with standard PDF parsers and pdf-lib.
 */
export function createMinimalPdfBuffer({
  pageCount = 1,
  withImages = false,
  imageWidth = 40,
  imageHeight = 40,
  text = "Botock Test Document",
} = {}) {
  const objects = [];
  let currentObjId = 1;

  // Obj 1: Catalog
  const catalogId = currentObjId++;
  // Obj 2: Pages tree
  const pagesId = currentObjId++;

  const pageIds = [];
  const contentIds = [];
  const imageIds = [];

  for (let i = 0; i < pageCount; i++) {
    const pageId = currentObjId++;
    pageIds.push(pageId);
    const contentId = currentObjId++;
    contentIds.push(contentId);

    if (withImages) {
      const imgId = currentObjId++;
      imageIds.push(imgId);
    }
  }

  // Catalog object
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  // Pages object
  const kidsStr = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesId] = `<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${pageCount} >>`;

  // Page objects & contents
  for (let i = 0; i < pageCount; i++) {
    const pId = pageIds[i];
    const cId = contentIds[i];
    const pageText = `${text} - Page ${i + 1}`;

    let resources = `<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>`;
    if (withImages) {
      const imgId = imageIds[i];
      resources += ` /XObject << /Im${i + 1} ${imgId} 0 R >>`;
    }
    resources += ` >>`;

    objects[pId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [ 0 0 612 792 ] /Resources ${resources} /Contents ${cId} 0 R >>`;

    let streamData = `BT /F1 16 Tf 72 720 Td (${pageText}) Tj ET`;
    if (withImages) {
      streamData += `\nq 200 0 0 200 100 400 cm /Im${i + 1} Do Q`;
    }

    objects[cId] = `<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`;

    if (withImages) {
      const imgId = imageIds[i];
      // Generate synthetic RGB raster stream (imageWidth * imageHeight * 3 bytes)
      const rgbSize = imageWidth * imageHeight * 3;
      const rgbStream = new Uint8Array(rgbSize);
      for (let p = 0; p < rgbSize; p++) {
        rgbStream[p] = (p * 17) & 0xff;
      }
      // Store image object with binary stream
      objects[imgId] = {
        header: `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${rgbSize} >>`,
        rawStream: rgbStream,
      };
    }
  }

  // Assemble the PDF byte stream with correct xref offsets
  const encoder = new TextEncoder();
  const headerStr = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const chunks = [encoder.encode(headerStr)];
  let currentByteOffset = chunks[0].length;

  const xrefOffsets = [];
  xrefOffsets[0] = 0;

  for (let id = 1; id < currentObjId; id++) {
    xrefOffsets[id] = currentByteOffset;
    const objDef = objects[id];
    let objBytes;

    if (typeof objDef === "string") {
      const s = `${id} 0 obj\n${objDef}\nendobj\n`;
      objBytes = encoder.encode(s);
    } else {
      // Object with raw binary stream
      const sPrefix = `${id} 0 obj\n${objDef.header}\nstream\n`;
      const sSuffix = `\nendstream\nendobj\n`;
      const pBytes = encoder.encode(sPrefix);
      const sufBytes = encoder.encode(sSuffix);
      objBytes = concatBuffers(pBytes, objDef.rawStream, sufBytes);
    }

    chunks.push(objBytes);
    currentByteOffset += objBytes.length;
  }

  // xref table
  const startXref = currentByteOffset;
  let xrefStr = `xref\n0 ${currentObjId}\n0000000000 65535 f \n`;
  for (let id = 1; id < currentObjId; id++) {
    const offset10 = String(xrefOffsets[id]).padStart(10, "0");
    xrefStr += `${offset10} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${currentObjId} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  chunks.push(encoder.encode(xrefStr));

  return concatBuffers(...chunks);
}

/**
 * Generates a 5-page invoice PDF with realistic document text
 */
export function createMultiPageInvoicePdf(pageCount = 5) {
  return createMinimalPdfBuffer({
    pageCount,
    withImages: false,
    text: "INVOICE #INV-2026-9812 - Vendor: Botock Creative Systems",
  });
}

/**
 * Generates an image-heavy PDF document with multiple large embedded image streams
 */
export function createImageHeavyPdfBuffer({ pageCount = 3, imageDim = 120 } = {}) {
  return createMinimalPdfBuffer({
    pageCount,
    withImages: true,
    imageWidth: imageDim,
    imageHeight: imageDim,
    text: "Quarterly Photographic Portfolio Report",
  });
}

/**
 * Creates a corrupt PDF buffer
 */
export function createCorruptPdfBuffer() {
  const encoder = new TextEncoder();
  return encoder.encode("%PDF-INVALID\nCorrupted header payload without valid objects or trailer\n%%NOT_EOF");
}
