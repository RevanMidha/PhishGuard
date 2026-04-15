import { useState } from 'react';
import { ImageIcon, UploadCloud, AlertOctagon, CheckCircle2, Loader2, X, Flag } from 'lucide-react';

export default function VisionScanner() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setFeedbackSubmitted(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setFeedbackSubmitted(false);
  };

  const handleScan = () => {
    if (!image) return;
    setIsScanning(true);
    setFeedbackSubmitted(false);
    
    // Fake API call
    setTimeout(() => {
      setIsScanning(false);
      setResult(Math.random() > 0.5 ? 'safe' : 'malicious');
    }, 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-4 text-purple-400">
            <ImageIcon size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Scan Screenshots</h2>
          <p className="text-slate-400 text-lg">Upload a screenshot of a suspicious webpage. Our visual AI will detect brand impersonation and fake login forms.</p>
        </div>

        {/* Upload Box */}
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 hover:border-purple-500/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
              <p className="mb-2 text-lg text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-sm text-slate-500">PNG, JPG or JPEG (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col items-center p-4">
            <button onClick={clearImage} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10">
              <X size={20} />
            </button>
            <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-lg mb-4" />
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full flex justify-center items-center gap-2"
            >
              {isScanning ? <><Loader2 className="animate-spin" size={20} /> Analyzing Image...</> : 'Run Visual Scan'}
            </button>
          </div>
        )}

        {/* Results Area */}
        {result && !isScanning && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${result === 'safe' ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20'}`}>
              
              <div className="absolute top-4 right-4 z-10">
                {!feedbackSubmitted ? (
                  <button 
                    onClick={async () => {
                      setFeedbackSubmitted(true);
                      try {
                        await fetch('http://localhost:5000/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            scanType: 'vision',
                            originalInput: 'image_uploaded',
                            predictedResult: result,
                            reportedAs: result === 'safe' ? 'False Negative' : 'False Positive'
                          })
                        });
                      } catch (e) { console.error(e); }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Flag size={12} />
                    Report False {result === 'safe' ? 'Negative' : 'Positive'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5">
                    <CheckCircle2 size={12} /> Flagged for review
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mt-8 md:mt-0">
                <div className={`p-3 rounded-full ${result === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {result === 'safe' ? <CheckCircle2 size={24} /> : <AlertOctagon size={24} />}
                </div>
                <div className="text-center md:text-left">
                  <h3 className={`text-xl font-bold ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'safe' ? 'Visuals Appear Authentic' : 'Warning: Brand Impersonation Detected!'}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1 mb-2 w-full md:w-10/12">
                     {result === 'safe' ? 'This screenshot does not strongly resemble known phishing templates.' : 'This image closely mirrors a known login portal. Proceed with extreme caution.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}