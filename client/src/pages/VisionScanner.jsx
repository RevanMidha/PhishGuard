import { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, ImageIcon, UploadCloud, AlertOctagon, CheckCircle2, Loader2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VisionScanner() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleScan = () => {
    if (!image) return;
    setIsScanning(true);
    
    // Fake API call
    setTimeout(() => {
      setIsScanning(false);
      setResult(Math.random() > 0.5 ? 'safe' : 'malicious');
    }, 2500);
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-slate-950 font-sans text-slate-200">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden w-full max-w-4xl mx-auto">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/30">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2">
            <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Computer Vision Analysis</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
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
                <button onClick={clearImage} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
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
              <div className={`p-6 rounded-2xl border backdrop-blur-sm ${result === 'safe' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
                <div className="flex items-center gap-4">
                  {result === 'safe' ? <CheckCircle2 className="text-emerald-400" size={32} /> : <AlertOctagon className="text-red-400" size={32} />}
                  <h3 className={`text-xl font-bold ${result === 'safe' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'safe' ? 'Visuals Appear Authentic' : 'Warning: Brand Impersonation Detected!'}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}