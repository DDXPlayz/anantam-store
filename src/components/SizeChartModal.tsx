import { motion, AnimatePresence } from 'framer-motion';

interface SizeDetail {
  size: string;
  chest: number;
  length: number;
  shoulder: number;
  sleeve: number;
}

const sizeData: SizeDetail[] = [
  { size: 'S', chest: 46, length: 28, shoulder: 22, sleeve: 9 },
  { size: 'M', chest: 48, length: 29, shoulder: 23, sleeve: 9.5 },
  { size: 'L', chest: 50, length: 30, shoulder: 24, sleeve: 10 },
  { size: 'XL', chest: 52, length: 31, shoulder: 25, sleeve: 10.5 },
];

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/10 bg-[#050505] shadow-[0_0_100px_rgba(255,18,1,0.1)]"
          >
            <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
            
            <div className="relative p-10 md:p-16">
              {/* Header */}
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.5em] text-f1-red mb-3 font-bold italic">// Blueprint Analysis</h4>
                  <h3 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-white italic">Fitting Guide</h3>
                </div>
                <button
                  onClick={onClose}
                  className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition-all hover:border-f1-red hover:bg-f1-red/10 outline-none"
                >
                  <span className="text-3xl leading-none text-white/30 group-hover:text-f1-red font-light">×</span>
                </button>
              </div>

              {/* Fit Summary */}
              <div className="mb-12 grid grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="font-mono text-[9px] text-f1-red uppercase tracking-widest mb-1 italic font-bold">Silhouette</p>
                  <p className="text-white text-xs uppercase font-black font-display tracking-widest italic">Oversized / Street</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="font-mono text-[9px] text-f1-red uppercase tracking-widest mb-1 italic font-bold">Fabric Weight</p>
                  <p className="text-white text-xs uppercase font-black font-display tracking-widest italic">240 GSM French Terry</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold italic">
                      <th className="pb-6 pr-4 font-normal font-mono">// Size</th>
                      <th className="pb-6 pr-4 font-normal">Chest (IN)</th>
                      <th className="pb-6 pr-4 font-normal">Length (IN)</th>
                      <th className="pb-6 pr-4 font-normal">Sleeve (IN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row) => (
                      <tr key={row.size} className="border-b border-white/5 text-[11px] transition-colors hover:bg-white/[0.03] group uppercase">
                        <td className="py-6 pr-4 font-black font-display text-lg text-white italic group-hover:text-f1-red transition-colors">{row.size}</td>
                        <td className="py-6 pr-4 text-white/50 group-hover:text-white transition-colors">{row.chest}</td>
                        <td className="py-6 pr-4 text-white/50 group-hover:text-white transition-colors">{row.length}</td>
                        <td className="py-6 pr-4 text-white/50 group-hover:text-white transition-colors">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="mt-12 flex items-center gap-4 bg-white/[0.03] border border-white/5 p-6 rounded-2xl">
                <div className="w-1.5 h-1.5 bg-f1-red rounded-full animate-pulse" />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20 italic font-bold">
                  All units are measured in inches. Relaxed oversized drop. Recommend true to size for intended fit.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
