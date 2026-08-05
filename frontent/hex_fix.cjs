const fs = require('fs');

const badHex1 = 'c383c692c382c2a2c383c2a2c3a2e282acc5a1c382c2acc383c2a2c3a2e2809ac2acc382c29d'; 
const badHex2 = 'c383c692c382c2a2c383c2a2c3a2e280a0c382c2a4'; 
const badHex3 = 'c383c692c382c2a2c383c2a2c3a2e282acc5a1c382c2a2'; 
const badHex4 = 'c383c692c382c2a2c383c2a2c3a2e280a0c2a0c383c2a2c3a2e2809ec2a2'; 
const badHex5 = 'c383c692c382c2a2c383c2a2c3a2e280a0c2a0c383c2a2c3a2e2809ac2ac'; 
const badHex6 = 'c383c692c382c2a2c383c285c3a2e2809cc383c2a2c3a2e2809ac2ac'; 
const badHex7 = 'c383c692c382c2a2c383c285c2a1c383c282c2a1'; 
const badHex8 = '6dc383c692c3a2e2809ac2acc383c282c2b2'; 
const badHex9 = 'c383c692c3a2e2809ac2acc383c282c2b7'; 

const files = [
  'src/pages/DocumentDetailPage.jsx',
  'src/pages/Dashboard.jsx',
  'src/components/DocumentDetailModal.jsx',
  'src/components/HistoryModal.jsx',
  'src/components/perizinan-generic/GenericTable.jsx',
  'src/components/ZipOcrModal.jsx',
  'src/components/CsvImportModal.jsx',
  'src/components/document-detail/ModalUploadCert.jsx',
  'src/components/document-detail/ModalEditHistoryRow.jsx',
  'src/components/document-detail/ModalConfirm.jsx',
  'src/components/document-detail/CertificateNavCards.jsx',
  'src/components/document-detail/CertHistorySection.jsx',
  'src/components/monitoring/FilterModal.jsx',
  'src/components/monitoring/SummaryCards.jsx',
  'src/components/monitoring/UploadRenewalModal.jsx',
  'src/components/monitoring/MonitoringTable.jsx',
  'src/components/monitoring/MonitoringActionModals.jsx',
  'src/components/EditEntryAsetModal.jsx',
  'src/components/SingleEntryAsetModal.jsx',
  'src/components/ViewDocumentModal.jsx',
  'src/pages/PerizinanAset.jsx',
  'src/pages/RiwayatPerpanjangan.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f);
  
  content = Buffer.from(content.toString('utf8')
    .split(Buffer.from(badHex1, 'hex').toString('utf8')).join(' - ')
    .split(Buffer.from(badHex2, 'hex').toString('utf8')).join('<=')
    .split(Buffer.from(badHex3, 'hex').toString('utf8')).join('•')
    .split(Buffer.from(badHex4, 'hex').toString('utf8')).join('->')
    .split(Buffer.from(badHex5, 'hex').toString('utf8')).join('-')
    .split(Buffer.from(badHex6, 'hex').toString('utf8')).join('✓')
    .split(Buffer.from(badHex7, 'hex').toString('utf8')).join('⚡')
    .split(Buffer.from(badHex8, 'hex').toString('utf8')).join('m²')
    .split(Buffer.from(badHex9, 'hex').toString('utf8')).join('·')
  , 'utf8');
  
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
