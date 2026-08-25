import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Download, ArrowLeft, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../common/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../common/Button';
import Modal from '../common/Modal';

const TemplateForm = ({ template, onBack }) => {
  const { addToast } = useToast();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [formDataState, setFormDataState] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const titleText = language === 'Hindi' && template.hindiTitle ? template.hindiTitle : template.title;
  const categoryText = language === 'Hindi' && template.hindiCategory ? template.hindiCategory : template.category;
  const descText = language === 'Hindi' && template.hindiDescription ? template.hindiDescription : template.description;

  // 1. Submit Form -> Generate PDF & Open Preview Modal
  const onSubmit = async (data) => {
    setLoading(true);
    setFormDataState(data);

    try {
      const payload = {
        templateId: template.id,
        templateTitle: template.title,
        ...data,
        generatedAt: new Date().toISOString()
      };

      // POST to /api/template/generate expecting PDF blob (Always generated in Official English PDF as requested!)
      const response = await api.post('/api/template/generate', payload, {
        responseType: 'blob'
      });

      let blob;
      if (response.data instanceof Blob) {
        blob = response.data.type === 'application/pdf' 
          ? response.data 
          : new Blob([response.data], { type: 'application/pdf' });
      } else {
        blob = new Blob([response.data], { type: 'application/pdf' });
      }

      const blobUrl = window.URL.createObjectURL(blob);

      setPdfBlobUrl(blobUrl);
      setIsPreviewOpen(true);

      addToast({
        type: 'success',
        title: '📄 Document Preview Ready!',
        message: 'Review your official legal petition preview below. Click Download PDF to save or X to exit.',
        duration: 5000
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate legal document preview. Please check form inputs.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger Download PDF when user explicitly clicks Download in Preview Modal
  const handleDownloadPdf = () => {
    if (!pdfBlobUrl) return;

    const fileName = `NyayaMitra_${template.id.toUpperCase()}_${Date.now()}.pdf`;
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 200);

    addToast({
      type: 'success',
      title: '📥 PDF Saved!',
      message: `${titleText} saved as ${fileName}.`,
      duration: 5000
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-950 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToTemplates')}</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md">
          {categoryText}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-blue-900" />
          <span>{titleText}</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">{descText}</p>
      </div>

      {/* Dynamic react-hook-form Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {template.fields.map((field) => {
            const isFullWidth = field.type === 'textarea' || field.fullWidth;
            const fieldLabelText = language === 'Hindi' && field.hindiLabel ? field.hindiLabel : field.label;
            return (
              <div
                key={field.name}
                className={isFullWidth ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}
              >
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {fieldLabelText} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    {...register(field.name, { required: field.required ? `${fieldLabelText} is required` : false })}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    className={`w-full bg-slate-50 border ${
                      errors[field.name] ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    {...register(field.name, { required: field.required ? `${fieldLabelText} is required` : false })}
                    className={`w-full bg-slate-50 border ${
                      errors[field.name] ? 'border-red-500' : 'border-slate-300'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all`}
                  >
                    <option value="">-- Select {fieldLabelText} --</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    {...register(field.name, { required: field.required ? `${fieldLabelText} is required` : false })}
                    placeholder={field.placeholder}
                    className={`w-full bg-slate-50 border ${
                      errors[field.name] ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all`}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors[field.name].message}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="amber"
            type="submit"
            isLoading={loading}
            icon={Eye}
            className="w-full sm:w-auto font-extrabold cursor-pointer"
          >
            {t('generateBtn')}
          </Button>
        </div>
      </form>

      {/* Document Preview & Download Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`${t('previewTitle')}: ${titleText}`}
        subtitle={t('previewSubtitle')}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Status Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-blue-950 text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t('verifiedBanner')}</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              Ready for Download
            </span>
          </div>

          {/* Embedded PDF / Document Preview Frame */}
          {pdfBlobUrl ? (
            <div className="relative rounded-xl border border-slate-300 bg-slate-100 shadow-inner overflow-hidden">
              <iframe
                src={pdfBlobUrl}
                title="Generated Document PDF Preview"
                className="w-full h-[360px] sm:h-[400px] rounded-xl border-none"
              />
            </div>
          ) : (
            /* Fallback Text Summary Sheet if PDF viewer unavailable */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs text-slate-800">
              <p className="font-bold text-slate-900 border-b pb-2 text-sm uppercase">{titleText}</p>
              {formDataState &&
                Object.entries(formDataState).map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-slate-900">{String(v)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Choice Buttons: Download or Cancel (X) */}
          <div className="sticky bottom-0 bg-white pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-300"
            >
              <X className="w-4 h-4 text-slate-600" />
              <span>{t('closeModalBtn')}</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <Button
                variant="amber"
                onClick={handleDownloadPdf}
                icon={Download}
                className="w-full sm:w-auto font-extrabold shadow-md px-6 py-2.5 text-xs cursor-pointer"
              >
                {t('downloadPdfBtn')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateForm;

