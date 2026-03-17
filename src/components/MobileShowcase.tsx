import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Menu, X, Plus, Minus, MessageCircle } from "lucide-react";

/* ─── Data ─── */
type Driver = "verstappen" | "norris" | "leclerc" | "russell";

interface Product {
  id: string;
  name: string;
  driver: Driver;
  driverName: string;
  team: string;
  tagline: string;
  number: string;
  price: number;
  image: string;
  description: string;
  specs: string[];
  fit: string;
  drop: string;
  sizes: string[];
}

const driverThemes: Record<Driver, { label: string; team: string; tagline: string }> = {
  verstappen: { label: "Max Verstappen", team: "Red Bull Racing", tagline: "Built for domination." },
  norris: { label: "Lando Norris", team: "McLaren", tagline: "Pure racing energy." },
  leclerc: { label: "Charles Leclerc", team: "Ferrari", tagline: "Legacy meets speed." },
  russell: { label: "George Russell", team: "Mercedes", tagline: "Precision. Performance. Power." },
};

const products: Product[] = [
  { 
    id: "ver-01", 
    name: "MAX VERSTAPPEN — RED BULL RACING TEE", 
    driver: "verstappen", 
    driverName: "Max Verstappen", 
    team: "Red Bull Racing", 
    tagline: "Built for domination.",
    number: "1", 
    price: 799, 
    image: "/images/MaxVerstappen.png", 
    description: "Inspired by the relentless speed of Red Bull Racing and the dominance of Max Verstappen, this tee captures the energy of championship racing. The front keeps it minimal with a clean team mark, while the back explodes with a bold graphic of Verstappen and his machine in full attack mode.\n\nDesigned for fans who live for race day and the roar of engines.", 
    specs: ["240 GSM French Terry Cotton", "Oversized streetwear fit", "Premium soft cotton fabric", "High-detail graphic print", "Made to order"],
    fit: "Relaxed oversized silhouette designed for comfort and everyday wear.",
    drop: "Limited Anantam Racing drop.",
    sizes: ["S", "M", "L", "XL"] 
  },
  { 
    id: "nor-01", 
    name: "LANDO NORRIS — MCLAREN TEE", 
    driver: "norris", 
    driverName: "Lando Norris", 
    team: "McLaren", 
    tagline: "Pure racing energy.",
    number: "4", 
    price: 799, 
    image: "/images/LandoNorris.png", 
    description: "The McLaren spirit is fearless, fast, and always pushing forward. This Lando Norris tee captures that momentum with a dynamic back graphic featuring Norris and the iconic papaya machine.\n\nA statement piece for fans who love speed, precision, and the new era of Formula 1.", 
    specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print", "Made to order"],
    fit: "Designed with a relaxed oversized silhouette for a modern motorsport streetwear look.",
    drop: "Limited Anantam Racing drop.",
    sizes: ["S", "M", "L", "XL"] 
  },
  { 
    id: "lec-01", 
    name: "CHARLES LECLERC — FERRARI TEE", 
    driver: "leclerc", 
    driverName: "Charles Leclerc", 
    team: "Ferrari", 
    tagline: "Legacy meets speed.",
    number: "16", 
    price: 799, 
    image: "/images/CharlesLeclerc.png", 
    description: "Ferrari is more than a team — it’s a legacy. This Charles Leclerc tee captures the intensity of Scuderia racing with a bold back graphic featuring Leclerc and the iconic Ferrari machine.\n\nA tribute to passion, precision, and the relentless pursuit of victory.", 
    specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print", "Made to order"],
    fit: "Comfortable oversized fit designed for everyday wear and racing culture style.",
    drop: "Limited Anantam Racing drop.",
    sizes: ["S", "M", "L", "XL"] 
  },
  { 
    id: "rus-01", 
    name: "GEORGE RUSSELL — MERCEDES AMG PETRONAS TEE", 
    driver: "russell", 
    driverName: "George Russell", 
    team: "Mercedes", 
    tagline: "Precision. Performance. Power.",
    number: "63", 
    price: 799, 
    image: "/images/GeorgeRussell.png", 
    description: "The Mercedes AMG Petronas era represents engineering excellence and relentless performance. This George Russell tee showcases that precision with a powerful back graphic featuring Russell and the silver machine.\n\nBuilt for fans who appreciate the technical side of racing and the pursuit of perfection.", 
    specs: ["240 GSM French Terry Cotton", "Oversized fit", "Premium soft cotton fabric", "High-detail graphic print", "Made to order"],
    fit: "Relaxed oversized fit designed for comfort and movement.",
    drop: "Limited Anantam Racing drop.",
    sizes: ["S", "M", "L", "XL"] 
  },
];

/* ─── Driver style maps ─── */
const accentText: Record<Driver, string> = { verstappen: "text-verstappen", norris: "text-norris", leclerc: "text-leclerc", russell: "text-russell" };
const borderAcc: Record<Driver, string> = { verstappen: "border-verstappen/30", norris: "border-norris/30", leclerc: "border-leclerc/30", russell: "border-russell/30" };
const bgGlow: Record<Driver, string> = { verstappen: "bg-verstappen/20", norris: "bg-norris/20", leclerc: "bg-leclerc/20", russell: "bg-russell/20" };
const gradBg: Record<Driver, string> = { verstappen: "from-verstappen/10", norris: "from-norris/10", leclerc: "from-leclerc/10", russell: "from-russell/10" };
const textGlow: Record<Driver, string> = { verstappen: "text-glow-verstappen", norris: "text-glow-norris", leclerc: "text-glow-leclerc", russell: "text-glow-russell" };

/* ─── Main Component ─── */
export function MobileShowcase() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  /* ─── Product Detail View ─── */
  if (selectedProduct) {
    const p = selectedProduct;
    return (
      <div className="min-h-screen bg-carbon text-white pb-20 overflow-x-hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-carbon/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between">
          <button onClick={() => { setSelectedProduct(null); setSelectedSize(null); setQuantity(1); }} className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/50 uppercase outline-none">
            <ArrowLeft size={14} /> Back
          </button>
          <span className="font-orbitron font-black text-xs tracking-[0.3em] text-white">
            <span className="text-f1-red">ANANTAM</span>
          </span>
          <div className="w-10" />
        </div>

        <div className="pt-24 px-6">
          {/* Image viewer - Explicitly Static per User Request */}
          <div className={`relative aspect-square flex items-center justify-center overflow-hidden mb-8 glass-panel border ${borderAcc[p.driver]} rounded-2xl`}>
            <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] ${bgGlow[p.driver]} opacity-40`} />
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={p.image}
              alt={p.name}
              className="w-4/5 h-4/5 object-contain relative z-10"
            />
            <span className="absolute bottom-4 right-6 font-display text-9xl font-black text-white/3 select-none leading-none tracking-tighter italic">#{p.number}</span>
          </div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="font-mono text-[10px] tracking-[0.4em] text-f1-red uppercase mb-2 font-bold italic">{p.team} // COLLECTION</p>
            <h1 className="font-display text-3xl font-black text-white mb-2 leading-[0.9] uppercase italic">{p.name}</h1>
            <p className="font-display text-lg font-black text-white/40 mb-6 uppercase tracking-widest italic">{p.tagline}</p>
            
            <div className="w-12 h-1 mb-8" style={{ backgroundColor: '#ff1801' }} />

            <div className="space-y-6">
              <div>
                <h4 className="font-mono text-[10px] tracking-widest text-white/30 uppercase mb-3 italic font-bold">// Brief</h4>
                <p className="font-sans text-sm text-white/60 leading-relaxed italic">{p.description}</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-f1-red uppercase mb-3 font-bold italic">// Build Specs</h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {p.specs.map(spec => (
                      <li key={spec} className="font-mono text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-1 bg-f1-red rounded-full" /> {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-f1-red uppercase mb-2 font-bold italic">// Silhouette</h4>
                  <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider italic">{p.fit}</p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-8 mb-8">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase mb-1 italic">Price Unit</p>
                  <div className="font-display text-4xl text-white font-black italic tracking-tighter">₹799</div>
                </div>
                <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mb-1 italic">{p.drop}</p>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase italic font-bold">Select Size</p>
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest italic underline cursor-pointer">[ View Size Chart ]</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(['S', 'M', 'L', 'XL'] as const).map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`h-14 font-mono text-sm border transition-all rounded-xl flex items-center justify-center outline-none ${selectedSize === s ? `border-white text-white bg-white/10` : 'border-white/10 text-white/30'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase italic font-bold ml-2">Units</p>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-white/30 p-2 outline-none"><Minus size={16} /></button>
                  <span className="font-display text-xl w-6 text-center text-white font-black italic">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="text-white/30 p-2 outline-none"><Plus size={16} /></button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    if (!selectedSize) return alert('Please select a size');
                    const msg = encodeURIComponent(`Hello, I would like to order the following item:\n\nProduct: ${p.name}\nSize: ${selectedSize}\nQuantity: ${quantity}\n\nPlease confirm availability.`);
                    window.open(`https://wa.me/919310124672?text=${msg}`, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-4 py-5 bg-[#25D366] text-white font-orbitron font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl active:bg-[#20bd5c] transition-all transform active:scale-[0.98] outline-none cursor-pointer shadow-[0_8px_25px_rgba(37,211,102,0.2)]"
                >
                  <MessageCircle size={18} />
                  Order via WhatsApp
                </button>
                <p className="font-mono text-[9px] text-center text-white/20 uppercase tracking-widest italic font-bold">Direct order // Fast support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Home View ─── */
  return (
    <div className="min-h-screen bg-carbon selection:bg-f1-red/30">
      {/* Navbar - Simplified per User Request */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-carbon/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-5 flex items-center justify-between">
          <span onClick={() => window.scrollTo({top:0, behavior: 'smooth'})} className="font-orbitron font-black text-lg tracking-[0.25em] text-white uppercase cursor-pointer outline-none flex-1">
            <span className="text-f1-red">ANANTAM</span> RACING
          </span>
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/50 hover:text-white transition-colors outline-none">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 overflow-hidden bg-carbon/95">
              <div className="px-6 py-8 flex flex-col gap-6 font-orbitron text-[10px] tracking-[0.4em] uppercase">
                <button onClick={() => scrollTo('collection')} className="text-left py-2 text-white/40 hover:text-white transition-colors outline-none">Collection</button>
                <button onClick={() => scrollTo('drivers')} className="text-left py-2 text-white/40 hover:text-white transition-colors outline-none">Drivers</button>
                <button onClick={() => scrollTo('about')} className="text-left py-2 text-white/40 hover:text-white transition-colors outline-none">About</button>
                <a href="https://anantamracing.com" target="_blank" rel="noopener noreferrer" className="py-2 text-white/40 hover:text-white transition-colors no-underline">The Lab</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-carbon/60 via-carbon/40 to-carbon" />
          <div className="absolute inset-0 grid-overlay opacity-30" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-1/4 left-0 w-full h-px bg-linear-to-r from-transparent via-f1-red/50 to-transparent"
            animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-full bg-radial-gradient from-f1-red/5 to-transparent blur-[120px]" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="font-mono text-[9px] tracking-[0.5em] text-white/30 mb-8 uppercase italic font-bold">// Pinnacle of Motorsport Style</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="font-display text-[15vw] font-black leading-[0.8] mb-6 text-white uppercase italic tracking-tighter">
            ANANTAM<br /><span className="text-f1-red text-glow-red font-black">RACING</span>
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12">
            <p className="font-orbitron text-xs tracking-[0.3em] text-f1-red font-black uppercase text-glow-red italic">FAST. FIERCE. FEARLESS.</p>
            <p className="font-sans text-[11px] text-white/30 mt-6 max-w-[260px] mx-auto italic leading-relaxed uppercase tracking-widest">Engineered for performance.<br/>Designed for the street.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-14 flex flex-col gap-4 items-center">
            <button onClick={() => scrollTo('collection')} className="glass-panel w-48 py-5 font-orbitron text-[10px] font-black tracking-[0.2em] uppercase text-white hover:bg-f1-red transition-all no-underline shadow-[0_0_30px_rgba(255,18,1,0.15)] rounded-2xl outline-none">Enter Collection</button>
            <div className="w-px h-16 bg-linear-to-b from-f1-red/80 to-transparent mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="relative py-32 px-6">
        <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
              THE <span className="text-f1-red text-glow-red">GARAGE</span>
            </h2>
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase italic font-bold">// SEASON 01 / COLLECTION 2026</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6">
            {products.map((product, i) => (
              <motion.button key={product.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProduct(product)} className="text-left block outline-none group">
                <div className="relative glass-panel border border-white/10 rounded-3xl overflow-hidden active:scale-[0.98] transition-all p-4">
                  <div className="flex gap-6 items-center">
                    <div className="relative aspect-square w-32 bg-white/5 rounded-2xl flex items-center justify-center p-2">
                       <img src={product.image} alt={product.name} className="w-full h-full object-contain relative z-10 p-2" />
                       <span className="absolute -bottom-2 -right-1 font-display text-4xl font-black text-white/5 select-none leading-none italic">#{product.number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-[9px] tracking-[0.3em] text-f1-red uppercase mb-1 font-bold italic">{product.team}</p>
                      <h3 className="font-display text-xl font-black leading-[0.95] text-white uppercase italic mb-3 group-hover:text-f1-red transition-colors whitespace-pre-wrap">{product.name.split(' — ')[0]}</h3>
                      <div className="flex items-center justify-between">
                         <span className="font-display text-2xl text-white font-black italic tracking-tighter">₹799</span>
                         <span className="text-white/20 font-mono text-[9px] uppercase tracking-widest font-bold">Specs →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Driver Spotlight */}
      <div id="drivers" className="bg-white/2">
        {(["verstappen", "norris", "leclerc", "russell"] as Driver[]).map(driver => {
          const theme = driverThemes[driver];
          const product = products.find(p => p.driver === driver)!;
          return (
            <section key={driver} className="relative py-32 overflow-hidden border-b border-white/5">
              <div className={`absolute inset-0 bg-linear-to-b ${gradBg[driver]} via-transparent to-transparent opacity-20 pointer-events-none`} />
              <div className="px-6 relative z-10 text-white">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  className={`bg-carbon/60 backdrop-blur-3xl border ${borderAcc[driver]} rounded-[40px] p-10 max-w-sm mx-auto mb-12 relative group overflow-hidden`}>
                  <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] ${bgGlow[driver]} opacity-40 group-hover:opacity-60 transition-opacity`} />
                  <motion.img src={product.image} alt={product.name} className="w-full relative z-10"
                    animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                  
                  <div className="mt-8 pt-8 border-t border-white/10">
                     <div className="flex justify-between items-center">
                        <span className={`font-display text-6xl font-black ${accentText[driver]} opacity-10 italic`}>#{product.number}</span>
                        <div className="text-right">
                           <p className="font-mono text-[9px] tracking-widest uppercase text-white/30 italic font-bold">Unit Model</p>
                           <p className="font-mono text-[10px] tracking-widest uppercase text-white font-bold italic">{theme.team}</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                  <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase mb-4 italic font-bold">// Driver Paddock Special</p>
                  <h2 className={`font-display text-7xl font-black italic ${accentText[driver]} ${textGlow[driver]} mb-4 leading-none tracking-tighter whitespace-pre-wrap`}>
                    {theme.label.split(" ").slice(-1)[0].toUpperCase()}
                  </h2>
                  <p className="font-display text-lg tracking-widest text-white uppercase italic font-bold mb-6">{theme.tagline}</p>
                  <p className="font-sans text-sm text-white/40 leading-relaxed mb-10 max-w-[280px] mx-auto italic">{product.description.split('\n\n')[0]}</p>
                  <button onClick={() => setSelectedProduct(product)}
                    className={`glass-panel border ${borderAcc[driver]} px-10 py-5 font-orbitron text-[10px] font-black tracking-[0.25em] uppercase text-white active:scale-95 transition-all bg-carbon/50 rounded-2xl outline-none`}>
                    View Details
                  </button>
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* About */}
      <section id="about" className="relative py-40 px-6">
        <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
        <div className="text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase mb-6 font-bold italic">// Our DNA</p>
            <h2 className="font-display text-5xl font-black text-white mb-8 italic uppercase tracking-tighter leading-none">BORN ON <span className="text-f1-red text-glow-red font-black">THE GRID</span></h2>
            <div className="w-12 h-1 bg-f1-red mx-auto mb-10" />
            <p className="font-sans text-sm text-white/50 leading-relaxed italic max-w-xs mx-auto">
              Anantam Racing Merch brings the absolute intensity, engineering precision, and raw passion of the world's most elite motorsport to premium streetwear. Every stitch is inspired by the chase for the millisecond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-16 bg-carbon/50">
        <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
        <div className="px-6 relative z-10 text-center text-white">
          <p onClick={() => window.scrollTo({top:0, behavior: 'smooth'})} className="font-orbitron text-2xl font-black tracking-[0.3em] text-white uppercase cursor-pointer outline-none">
            <span className="text-f1-red">ANANTAM</span> RACING
          </p>
          <div className="flex justify-center gap-8 font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase my-10 italic font-bold">
            <a href="https://www.instagram.com/anantamracing/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors no-underline">INSTAGRAM</a>
            <a href="https://anantamracing.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors no-underline">MAIN SITE</a>
            <a href="mailto:anantamracing@gmail.com" className="hover:text-white transition-colors no-underline">CONTACT</a>
          </div>
          <div className="w-full h-px bg-white/5 mb-10" />
          <p className="font-mono text-[9px] text-white/10 tracking-[0.3em] font-bold uppercase italic pointer-events-none">© 2026 ANANTAM RACING MERCH // GEN 01 LIMITED</p>
        </div>
      </footer>
    </div>
  );
}
