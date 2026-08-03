/**
 * ocrTextParser.js
 * Utility untuk mem-parsing teks mentah hasil Tesseract OCR
 * menjadi field terstruktur: No. Sertifikat, Tanggal Terbit, Tanggal Berakhir
 * 
 * Semua fungsi berjalan 100% di client-side, tanpa API eksternal.
 */

const MONTH_MAP = {
  januari: '01', jan: '01',
  februari: '02', feb: '02',
  maret: '03', mar: '03',
  april: '04', apr: '04',
  mei: '05', may: '05',
  juni: '06', jun: '06',
  juli: '07', jul: '07',
  agustus: '08', ags: '08', aug: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10', oct: '10',
  november: '11', nov: '11',
  desember: '12', des: '12', dec: '12',
};

/**
 * Convert berbagai format tanggal ke object { display: 'dd/mm/yyyy', iso: 'yyyy-mm-dd' }
 * Mendukung:
 * - "10 Juli 2024"
 * - "10/07/2024"
 * - "10-07-2024"
 * - "2024-07-10"
 * - "2024/07/10"
 * @param {string} rawText - teks mentah yang mungkin mengandung tanggal
 * @returns {{ display: string, iso: string } | null}
 */
export function parseDate(rawText) {
  if (!rawText) return null;

  // Normalisasi: ganti huruf O mirip angka 0
  const clean = rawText.trim()
    .replace(/(\d)[oO]\b/g, '$10')
    .replace(/\bO(?=\d)/g, '0');

  // Format: "10 Juli 2024" atau "10 Juli, 2024"
  const wordMatch = clean.match(
    /(\d{1,2})\s+([A-Za-z]+)\s*,?\s*(\d{4})/
  );
  if (wordMatch) {
    const day = wordMatch[1].padStart(2, '0');
    const monthKey = wordMatch[2].toLowerCase();
    const year = wordMatch[3];
    const month = MONTH_MAP[monthKey];
    if (month && parseInt(day) <= 31 && parseInt(year) >= 2000) {
      return { display: `${day}/${month}/${year}`, iso: `${year}-${month}-${day}` };
    }
  }

  // Format: "YYYY-MM-DD" atau "YYYY/MM/DD"
  const isoMatch = clean.match(/(\d{4})[-\/\.](\d{2})[-\/\.](\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      return { display: `${day}/${month}/${year}`, iso: `${year}-${month}-${day}` };
    }
  }

  // Format: "DD/MM/YYYY" atau "DD-MM-YYYY" atau "DD.MM.YYYY"
  const dmyMatch = clean.match(/(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    if (parseInt(month) <= 12 && parseInt(day) <= 31 && parseInt(year) >= 2000) {
      return { display: `${day}/${month}/${year}`, iso: `${year}-${month}-${day}` };
    }
  }

  return null;
}

/**
 * Convert format display dd/mm/yyyy ke ISO yyyy-mm-dd untuk dikirim ke backend
 * @param {string} displayDate - "dd/mm/yyyy"
 * @returns {string} "yyyy-mm-dd" atau string kosong jika tidak valid
 */
export function displayToIso(displayDate) {
  if (!displayDate || !displayDate.includes('/')) return '';
  const parts = displayDate.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Convert format ISO yyyy-mm-dd ke display dd/mm/yyyy
 * @param {string} isoDate - "yyyy-mm-dd"
 * @returns {string} "dd/mm/yyyy" atau string kosong
 */
export function isoToDisplay(isoDate) {
  if (!isoDate || isoDate.length < 10) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/**
 * Validasi apakah string adalah format dd/mm/yyyy yang valid
 * @param {string} val 
 * @returns {boolean}
 */
export function isValidDisplayDate(val) {
  if (!val) return true; // kosong = valid (opsional)
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(val)) return false;
  const [d, m, y] = val.split('/').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < 2000 || y > 2100) return false;
  return true;
}

/**
 * Ekstrak nomor sertifikat dari teks OCR mentah
 * Mendukung pola seperti:
 * - "No: 567/KPTS/DISNAKER/2024"
 * - "Nomor: SKP-2024/DISNAKER/1234"
 * - "567/PEM/2024/DISNAKER-KALTIM"
 * @param {string} rawText
 * @returns {string | null}
 */
export function parseCertificateNumber(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n');

  // Cari baris yang mengandung label "Nomor / No"
  for (const line of lines) {
    const trimmed = line.trim();
    // Label nomor/no diikuti dengan nilai
    const labelMatch = trimmed.match(
      /(?:nomor|no\.?|sk\s*no\.?|registrasi\s*no\.?|seri)\s*[:\.]?\s*([A-Za-z0-9][A-Za-z0-9\.\/\-\s]{3,50})/i
    );
    if (labelMatch) {
      const candidate = labelMatch[1].trim().replace(/[,;:\.\s]+$/, '');
      if (candidate.length >= 4 && !isBlacklisted(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback: cari pola nomor sertifikat khas (angka/huruf dengan slash)
  const certPatterns = [
    /([0-9]{3,}[\/\.][A-Za-z0-9\/\.\-]{4,40})/,
    /(SK[-\s][A-Za-z0-9\-\/]{4,30})/i,
    /(CERT[-\s][A-Za-z0-9\-\/]{4,30})/i,
    /([A-Z]{2,6}[-\/][0-9]{4}[-\/][A-Za-z0-9\.\/-]{3,20})/,
  ];

  for (const pattern of certPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1] && !isBlacklisted(match[1])) {
      return match[1].trim().replace(/[,;:\.\s]+$/, '');
    }
  }

  return null;
}

function isBlacklisted(str) {
  const blacklist = ['tanggal', 'berlaku', 'nama', 'jenis', 'surat', 'sertifikat',
    'halaman', 'telp', 'fax', 'website', 'email', 'jalan', 'jl'];
  return blacklist.some(w => str.toLowerCase().includes(w));
}
