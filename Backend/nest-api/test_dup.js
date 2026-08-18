const norm = (v) => (v || '').trim().toLowerCase().replace(/^-$/, '');
const getCompareKey = (title, code) => norm(code) + '|' + norm(title);
const fileProcessedKeys = new Map();
const groupedData = [
  { master: { title: 'A', code: '' }, certificates: [] },
  { master: { title: 'A', code: '' }, certificates: [] }
];
for (let i = 0; i < groupedData.length; i++) {
  const group = groupedData[i];
  const rawTitle = group.master.title;
  const rawCode = group.master.code;
  const certNo = group.certificates.length > 0 ? group.certificates[0].noSertifikat : '';
  const compareKey = getCompareKey(rawTitle, rawCode) + '|' + norm(certNo);
  const firstSeenRow = fileProcessedKeys.get(compareKey);
  if (firstSeenRow !== undefined) {
    console.log('FAILED on row ' + i);
  } else {
    fileProcessedKeys.set(compareKey, i + 1);
    console.log('NEW on row ' + i);
  }
}
