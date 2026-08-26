import React from 'react';
import { Columns, Rows, ArrowLeft, Loader2 } from 'lucide-react';
import { useAturKolomBaris } from '../hooks/useAturKolomBaris';
import ColumnConfigTab from '../components/atur-kolom-baris/ColumnConfigTab';
import RowConfigTab from '../components/atur-kolom-baris/RowConfigTab';
import CustomModals from '../components/atur-kolom-baris/CustomModals';

export default function AturKolomBaris({ categoryKey: propCategoryKey, onBack }) {
  const hookState = useAturKolomBaris(propCategoryKey);
  const {
    activeTab, setActiveTab,
    categoryKey, setCategoryKey,
    isLoading, isSaving,
    columns, setColumns,
    isAddColOpen, setIsAddColOpen,
    newColLabel, setNewColLabel,
    newColType, setNewColType,
    draggedColIndex, setDraggedColIndex,
    dragOverColIndex, setDragOverColIndex,
    rows, setRows,
    barisMode, setBarisMode,
    modifiedCerts, setModifiedCerts,
    draggedRowIndex, setDraggedRowIndex,
    dragOverRowIndex, setDragOverRowIndex,
    toast, setToast,
    confirmModal, setConfirmModal,
    showToast, showConfirm, convertToYYYYMMDD, loadData,
    handleColDragStart, handleColDragOver, handleColDrop, toggleColVisibility, handleSaveColumns, handleAddColumn, handleDeleteColumn,
    handleRowDragStart, handleRowDragOver, handleRowDrop,
    handleCellChange, handleChildCellChange, handleSaveRowsSpreadsheet, handleSaveCertsSpreadsheet, handleDeleteRow, handleDeleteCert,
    getModuleLabel
  } = hookState;

  const childRows = [];
  rows.forEach(master => {
    if (master.certificates && Array.isArray(master.certificates)) {
      master.certificates.forEach(cert => {
        childRows.push({
          ...cert,
          masterTitle: master.title || 'Untitled',
          masterId: master.id,
        });
      });
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-12 rounded-tl-3xl">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl text-sm font-bold shadow-2xs z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-[#00a368] text-white' :
          toast.type === 'error' ? 'bg-rose-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 z-40 rounded-tl-3xl shadow-2xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                Atur Kolom & Baris
              </h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                Modul: <span className="font-bold text-[#005ea4] bg-blue-50 px-2 py-0.5 rounded-md">{getModuleLabel()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        {/* Toggle Mode: Master vs Child */}
        {propCategoryKey !== 'peralatan-pabrik' && (
          <div className="flex bg-white rounded-xl shadow-2xs p-1.5 w-fit border border-slate-200">
            <button
              onClick={() => {
                setCategoryKey(propCategoryKey);
                setBarisMode('master');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                !categoryKey.endsWith('-child')
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Data Master
            </button>
            <button
              onClick={() => {
                setCategoryKey(`${propCategoryKey}-child`);
                setBarisMode('child');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                categoryKey.endsWith('-child')
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Data Child (Sertifikat)
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-6 space-y-6">
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('kolom')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'kolom' 
                  ? 'border-[#005ea4] text-[#005ea4]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Atur Struktur Kolom</span>
            </button>
            <button
              onClick={() => setActiveTab('baris')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'baris' 
                  ? 'border-[#005ea4] text-[#005ea4]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Rows className="w-4 h-4" />
              <span>Atur Susunan & Data Baris ({barisMode === 'master' ? rows.length : childRows.length})</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#005ea4]" />
              <p className="font-mono-data text-xs font-bold">Memuat konfigurasi modul...</p>
            </div>
          ) : (
            <>
              {activeTab === 'kolom' && (
                <ColumnConfigTab
                  columns={columns}
                  setIsAddColOpen={setIsAddColOpen}
                  handleSaveColumns={handleSaveColumns}
                  isSaving={isSaving}
                  handleColDragStart={handleColDragStart}
                  handleColDragOver={handleColDragOver}
                  handleColDrop={handleColDrop}
                  setDragOverColIndex={setDragOverColIndex}
                  setDraggedColIndex={setDraggedColIndex}
                  dragOverColIndex={dragOverColIndex}
                  toggleColVisibility={toggleColVisibility}
                  handleDeleteColumn={handleDeleteColumn}
                />
              )}

              {activeTab === 'baris' && (
                <RowConfigTab
                  barisMode={barisMode}
                  setBarisMode={setBarisMode}
                  rows={rows}
                  childRows={childRows}
                  columns={columns}
                  dragOverRowIndex={dragOverRowIndex}
                  handleRowDragStart={handleRowDragStart}
                  handleRowDragOver={handleRowDragOver}
                  handleRowDrop={handleRowDrop}
                  setDragOverRowIndex={setDragOverRowIndex}
                  setDraggedRowIndex={setDraggedRowIndex}
                  handleCellChange={handleCellChange}
                  handleChildCellChange={handleChildCellChange}
                  handleDeleteRow={handleDeleteRow}
                  handleDeleteCert={handleDeleteCert}
                  handleSaveRowsSpreadsheet={handleSaveRowsSpreadsheet}
                  handleSaveCertsSpreadsheet={handleSaveCertsSpreadsheet}
                  isSaving={isSaving}
                  convertToYYYYMMDD={convertToYYYYMMDD}
                />
              )}
            </>
          )}
        </div>
      </div>

      <CustomModals
        isAddColOpen={isAddColOpen}
        setIsAddColOpen={setIsAddColOpen}
        handleAddColumn={handleAddColumn}
        isSaving={isSaving}
        newColLabel={newColLabel}
        setNewColLabel={setNewColLabel}
        newColType={newColType}
        setNewColType={setNewColType}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />
    </div>
  );
}
