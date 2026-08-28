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

  // Bersihkan teks secara agresif: Hapus karakter aneh, ubah newline jadi spasi
  let clean = rawText.replace(/[\n\r]/g, ' ').replace(/[^\w\s\/\.,-]/g, ' ').trim();
  
  // Normalisasi O/I ke angka jika bersebelahan angka
  clean = clean.replace(/(\d)[oO]\b/g, '$10')
               .replace(/\b[oO](?=\d)/g, '0')
               .replace(/(\d)[iIlL]\b/g, '$11')
               .replace(/\b[iIlL](?=\d)/g, '1');

  // Coba Format Standar ISO & DMY menggunakan regex murni dulu
  const isoMatch = clean.match(/\b(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})\b/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    if (parseInt(m) <= 12 && parseInt(d) <= 31 && parseInt(y) > 1900) {
      return { display: `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`, iso: `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` };
    }
  }

  const dmyMatch = clean.match(/\b(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})\b/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    if (parseInt(m) <= 12 && parseInt(d) <= 31 && parseInt(y) > 1900) {
      return { display: `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`, iso: `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` };
    }
  }

  // Jika tidak ada format angka-angka-angka, mari kita cari pola "Tanggal Bulan Tahun" (contoh: 12 Agustus 2024)
  // Ekstrak Tahun dulu
  const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : null;

  if (!year) return null; // Jika tahun tidak ada, kita asumsikan gagal total (terlalu kotor)

  // Cari Hari (Day) yang berdekatan dengan sebelum bulan/tahun
  let day = '01'; // Default 01 jika hari tidak terbaca
  const dayMatch = clean.match(/\b([0-3]?[0-9])\b/);
  if (dayMatch && parseInt(dayMatch[1]) > 0 && parseInt(dayMatch[1]) <= 31) {
    day = dayMatch[1].padStart(2, '0');
  }

  // Cari Bulan menggunakan pencocokan kosa kata fleksibel
  const words = clean.toLowerCase().split(/\s+/);
  let month = null;
  let rawMonthWord = '';
  
  // Kamus bulan dengan variasi typo umum OCR
  const monthDict = {
    '01': ['januari', 'jan', 'january', '1anuari'],
    '02': ['februari', 'feb', 'february', 'pebruari', 'februari'],
    '03': ['maret', 'mar', 'march', 'm4ret'],
    '04': ['april', 'apr', 'apri'],
    '05': ['mei', 'may', 'me1'],
    '06': ['juni', 'jun', 'june'],
    '07': ['juli', 'jul', 'july', 'ju1i'],
    '08': ['agustus', 'ags', 'august', 'aug', 'agst', 'agusus', '0gustus', 'agutu'],
    '09': ['september', 'sep', 'sept', 'september'],
    '10': ['oktober', 'okt', 'october', 'oct', '0ktober', 'oktob3r'],
    '11': ['november', 'nov', 'nopember', 'n0vember'],
    '12': ['desember', 'des', 'december', 'dec', 'd3sember']
  };

  for (const w of words) {
    if (w.length < 3) continue; // Skip kata terlalu pendek
    for (const [mNum, aliases] of Object.entries(monthDict)) {
      if (aliases.some(alias => w.includes(alias) || alias.includes(w))) {
        month = mNum;
        rawMonthWord = w;
        break;
      }
    }
    if (month) break;
  }

  if (month && year) {
    return {
      display: `${day}/${month}/${year}`,
      iso: `${year}-${month}-${day}`,
      isFuzzy: day === '01' && !dayMatch, // Hanya fuzzy jika hari diset paksa ke 01
      rawMonthYear: `${rawMonthWord} ${year}`
    };
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

  // Gabungkan semua baris menjadi satu teks dan hilangkan spasi/newline berlebih
  let clean = rawText.replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ').trim();

  // Hapus kata-kata awalan (label) yang sering menempel di hasil OCR
  const removeLabels = [
    /nomor\s+sertifikat\s*[:;\.\-]?\s*/i,
    /no\.\s*sertifikat\s*[:;\.\-]?\s*/i,
    /nomor\s*[:;\.\-]?\s*/i,
    /no\.\s*[:;\.\-]?\s*/i,
    /no\s*[:;\.\-]?\s*/i,
    /reg(?:istrasi)?\s*(?:no\.?)?\s*[:;\.\-]?\s*/i,
    /sertifikat\s*(?:no\.?)?\s*[:;\.\-]?\s*/i,
    /certificate\s*(?:no\.?)?\s*[:;\.\-]?\s*/i,
    /surat\s+keterangan\s*[:;\.\-]?\s*/i,
  ];

  for (const labelRegex of removeLabels) {
    clean = clean.replace(labelRegex, '');
  }

  // Bersihkan karakter awalan/akhiran yang kotor
  clean = clean.replace(/^[^A-Za-z0-9]+/, '').replace(/[^A-Za-z0-9]+$/, '').trim();

  if (!clean || clean.length < 3) return null;

  // Jika teks hasil pembersihan hanya mengandung kombinasi huruf, angka, slash, dash, dot, koma
  // maka itu pasti nomor sertifikatnya. (Kita hentikan di spasi pertama)
  const certNumberCandidateMatch = clean.match(/^([A-Za-z0-9\/\-\.,]+)/);
  
  if (certNumberCandidateMatch) {
    let candidate = certNumberCandidateMatch[1];
    
    // Periksa apakah ini bukan sekadar kata blacklist (misal: "tanggal", "berlaku")
    // dan pastikan panjangnya cukup, minimal 4 karakter
    if (!isBlacklisted(candidate) && candidate.length >= 4) {
      // Jika kandidat hanya angka dan titik/koma (misal: 500.15), tapi string aslinya panjang (mengandung huruf),
      // maka kandidat awal ini mungkin terpotong spasi. Kita pakai fallback terakhir di bawah.
      const hasAlpha = /[A-Za-z]/.test(candidate);
      const isVeryShort = candidate.length < 8;
      if (hasAlpha || !isVeryShort) {
         return candidate.toUpperCase(); // Standarisasi output ke huruf besar
      }
    }
  }

  // Fallback: cari pola nomor sertifikat khas (memiliki slash atau dash yang panjang)
  const certPatterns = [
    /([0-9]{2,}[\/\.][A-Za-z0-9\/\.\-]{4,40})/,  // misal: 123/DISNAKER/2024
    /(SK[-\s][A-Za-z0-9\-\/]{4,30})/i,           // misal: SK-12345/A
    /(CERT[-\s][A-Za-z0-9\-\/]{4,30})/i,         // misal: CERT-999
    /([A-Z]{2,6}[-\/][0-9]{2,4}[-\/][A-Za-z0-9\.\/-]{3,20})/, // misal: SJA-2024/01
  ];

  for (const pattern of certPatterns) {
    const match = clean.match(pattern);
    if (match && match[1] && !isBlacklisted(match[1])) {
      return match[1].trim().replace(/[,;:\.\s]+$/, '').toUpperCase();
    }
  }

  // Fallback terakhir: jika tidak ada pola khas tapi mengandung huruf & angka
  if (/[0-9]/.test(clean) && /[A-Za-z]/.test(clean) && !isBlacklisted(clean)) {
      // Ambil token pertama yang memiliki kombinasi huruf dan angka
      const tokens = clean.split(' ');
      for (const t of tokens) {
          if (/[0-9]/.test(t) && /[A-Za-z]/.test(t) && t.length > 4) {
              return t.toUpperCase();
          }
      }
  }

  return null;
}

function isBlacklisted(str) {
  const blacklist = ['tanggal', 'berlaku', 'nama', 'jenis', 'surat', 'sertifikat',
    'halaman', 'telp', 'fax', 'website', 'email', 'jalan', 'jl'];
  return blacklist.some(w => str.toLowerCase().includes(w));
}
