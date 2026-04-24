import { useEffect, useRef, useState } from 'react';
import { ImageIcon, UploadCloud, CheckCircle2, Loader2, X, Flag, Search, ClipboardPaste } from 'lucide-react';
import { postJson, submitFeedback } from '../lib/api';
import { createResultStyles, getPercent } from '../lib/scanUi';

const RESULT_STYLES = createResultStyles({
  safe: 'Visuals Look Safe',
  suspicious: 'Visual Scan Needs Review',
  malicious: 'Likely Phishing Screenshot',
  error: 'Scan Failed',
});

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read the selected image.'));
  reader.readAsDataURL(file);
});

export default function VisionScanner() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [pasteHint, setPasteHint] = useState('Paste a screenshot with Ctrl+V or upload an image.');
  const pasteZoneRef = useRef(null);

  const loadImageFile = (file, sourceLabel = 'Pasted screenshot ready to scan.') => {
    setImage(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
    setScan(null);
    setFeedbackSubmitted(false);
    setPasteHint(sourceLabel);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    loadImageFile(file, 'Uploaded screenshot ready to scan.');
  };

  useEffect(() => {
    const pasteZone = pasteZoneRef.current;
    if (!pasteZone) return undefined;

    const handlePaste = (event) => {
      const clipboardItems = Array.from(event.clipboardData?.items || []);
      const imageItem = clipboardItems.find((item) => item.type.startsWith('image/'));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      loadImageFile(file, 'Screenshot pasted from clipboard.');
    };

    pasteZone.addEventListener('paste', handlePaste);
    return () => pasteZone.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImage(null);
    setPreviewUrl(null);
    setWebsiteUrl('');
    setScan(null);
    setFeedbackSubmitted(false);
    setPasteHint('Paste a screenshot with Ctrl+V or upload an image.');
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setScan(null);
    setFeedbackSubmitted(false);

    try {
      const imageData = await fileToDataUrl(image);
      setScan(
        await postJson('/api/scan/vision', {
          imageData,
          url: websiteUrl.trim() || undefined
        })
      );
    } catch (error) {
      console.error('Vision Scan Error:', error);
      setScan({
        result: 'error',
        summary: error.message || 'The visual scan could not be completed.',
        indicators: [],
        confidence_score: 0,
        risk_score: 0
      });
    } finally {
      setIsScanning(false);
    }
  };

  const tone = RESULT_STYLES[scan?.result || 'safe'];
  const ResultIcon = tone.Icon;
  const confidence = getPercent(scan?.confidence_score);
  const risk = getPercent(scan?.risk_score);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
      <div className="w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-amber-400/15 rounded-full mb-3 text-amber-200">
            <ImageIcon size={34} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Scan Screenshots</h2>
          <p className="text-stone-400">
            Upload a suspicious webpage screenshot. The scanner now checks OCR text, login and payment cues, urgency language, form-like layouts, and optional brand-to-domain mismatches.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/80 via-orange-300/80 to-rose-300/80 rounded-3xl blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div
            ref={pasteZoneRef}
            tabIndex={0}
            className="relative rounded-3xl border border-stone-800 bg-neutral-950/70 p-3.5 md:p-5 focus:outline-none focus:ring-2 focus:ring-orange-300/40"
          >
          {!previewUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-60 border-2 border-stone-700 border-dashed rounded-2xl cursor-pointer bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-orange-300/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-12 h-12 text-stone-400 mb-4" />
              <p className="mb-2 text-lg text-stone-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-sm text-stone-500">PNG, JPG or JPEG</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden border border-stone-700 bg-neutral-900 flex flex-col items-center p-4 gap-4">
            <button onClick={clearImage} className="absolute top-4 right-4 p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-stone-700 transition-all z-10">
              <X size={20} />
            </button>
            <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-lg" />

            <div className="w-full grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -transtone-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Optional: paste the page URL or domain to validate the brand"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950/70 py-2.5 pl-11 pr-4 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-orange-300/50"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="bg-orange-300 hover:bg-orange-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 px-6 py-2.5 rounded-xl font-bold transition-all w-full flex justify-center items-center gap-2"
              >
                {isScanning ? <><Loader2 className="animate-spin" size={20} /> Analyzing Image...</> : 'Run Visual Scan'}
              </button>
            </div>
          </div>
        )}

          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-3 text-sm text-stone-400 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardPaste size={16} className="text-amber-200" />
              <span>{pasteHint}</span>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Focus here and press Ctrl+V</span>
          </div>
          </div>
        </div>

        {scan && !isScanning && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-5 rounded-2xl border backdrop-blur-sm ${tone.card}`}>
              <div className="absolute top-4 right-4 z-10">
                {!feedbackSubmitted && scan.result !== 'error' ? (
                  <button
                    onClick={async () => {
                      setFeedbackSubmitted(true);
                      try {
                        await submitFeedback({
                          scanType: 'vision',
                          originalInput: websiteUrl || 'image_uploaded',
                          predictedResult: scan.result,
                          reportedAs: scan.result === 'safe' ? 'False Negative' : 'False Positive'
                        });
                      } catch (feedbackError) {
                        console.error(feedbackError);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white bg-stone-900/60 hover:bg-stone-800 border border-stone-700/50 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Flag size={12} />
                    Report False {scan.result === 'safe' ? 'Negative' : 'Positive'}
                  </button>
                ) : feedbackSubmitted ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5">
                    <CheckCircle2 size={12} /> Flagged for review
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col md:flex-row items-start gap-4 mt-8 md:mt-0">
                <div className={`p-3 rounded-full ${tone.iconWrap}`}>
                  <ResultIcon size={24} />
                </div>
                <div className="w-full space-y-4">
                  <div>
                    <h3 className={`text-xl font-bold ${tone.title}`}>{tone.headline}</h3>
                    <p className="text-stone-300 text-sm mt-1 w-full md:w-10/12">{scan.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className={`px-3 py-2 rounded-lg text-sm ${tone.badge}`}>
                      Risk score: <span className="font-semibold">{risk}%</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-sm bg-stone-900/70 border border-stone-700 text-stone-300">
                      Verdict confidence: <span className="font-semibold">{confidence}%</span>
                    </div>
                    {scan.detected_brand && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-stone-900/70 border border-stone-700 text-stone-300">
                        Detected brand: <span className="font-semibold capitalize">{scan.detected_brand}</span>
                      </div>
                    )}
                    {scan.supplied_domain && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-stone-900/70 border border-stone-700 text-stone-300">
                        Domain checked: <span className="font-semibold">{scan.supplied_domain}</span>
                      </div>
                    )}
                  </div>

                  {scan.visual_features && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Form cues</p>
                        <p className="text-sm text-stone-300 mt-2">
                          Input-like regions: <span className="font-semibold text-white">{scan.visual_features.input_field_candidates}</span>
                        </p>
                        <p className="text-sm text-stone-300 mt-1">
                          Button-like regions: <span className="font-semibold text-white">{scan.visual_features.button_candidates}</span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">OCR preview</p>
                        <p className="text-sm text-stone-400 mt-2 line-clamp-4">
                          {scan.extracted_text_preview || 'No readable text was extracted from the screenshot.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {scan.indicators?.length > 0 && (
                    <div className="grid gap-3">
                      {scan.indicators.map((indicator, index) => (
                        <div key={`${indicator.label}-${index}`} className="rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{indicator.label}</p>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{indicator.severity}</span>
                          </div>
                          <p className="text-sm text-stone-400 mt-1">{indicator.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
