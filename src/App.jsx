import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import {
  ShoppingCart, Search, Receipt, Plus, Minus, Trash2, X, CheckCircle2,
  CreditCard, QrCode, Banknote, ArrowDownCircle, ArrowUpCircle,
  Pause, Play, Send, Printer, Volume2, VolumeX, Hash, Clock,
  LayoutDashboard, Package, DollarSign, BarChart3,
  Percent, Tag, Star, Zap, Store, Copy, Eye,
  AlertCircle, Check, Info, Users, UserPlus, Phone, MapPin, 
  Target, Activity, ShoppingBag, Layers, Briefcase, Camera, ScanLine, Image as ImageIcon,
  FileText, UploadCloud, Folder, Pencil, Save, Download, BarChart2
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx-js-style';
import './index.css';

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtNum = (v) => new Intl.NumberFormat('pt-BR').format(v);

const beep = (freq = 1200, dur = 60) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; gain.gain.value = 0.06;
    osc.start(); osc.stop(ctx.currentTime + dur / 1000);
  } catch {}
};
const beepError = () => beep(280, 200);
const beepSuccess = () => { beep(880, 80); setTimeout(() => beep(1100, 80), 100); };

// ══════════════════════════════════════════════════════
//  TOAST SYSTEM
// ══════════════════════════════════════════════════════
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t)), 2800);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);
  const icons = { success: <Check size={16} />, error: <AlertCircle size={16} />, info: <Info size={16} />, warning: <AlertCircle size={16} /> };
  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? 'leaving' : ''}`}>
            {icons[t.type]} {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ══════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════
const CATEGORIES = ['Todos', 'Carnes', 'Bebidas', 'Padaria', 'Mercearia', 'Limpeza', 'Pet'];
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="%23eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999999">Sem Foto</text></svg>';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Picanha Montana Vácuo 1.5kg', price: 68.90, sku: '78912345', image: 'https://http2.mlstatic.com/D_NQ_NP_725496-MLU74112947036_012024-O.webp', stock: 15, category: 'Carnes', favorite: true },
  { id: 2, name: 'Ração Quatree 15kg', price: 145.00, sku: '78954321', image: 'https://http2.mlstatic.com/D_NQ_NP_837182-MLA99915375405_112025-O.webp', stock: 8, category: 'Pet', favorite: false },
  { id: 9, name: 'Suco Del Valle 1L', price: 6.99, sku: '789456123', image: 'https://www.piramidesdistribuidora.com.br/images/original/11100-del-valle-tetrapak-1l-laranja-6un.20251024104230.png', stock: 25, category: 'Bebidas', favorite: true },
  { id: 3, name: 'Coca-Cola 2L', price: 9.50, sku: '78900011', image: 'https://http2.mlstatic.com/D_Q_NP_741015-MLA110951791308_052026-O.webp', stock: 48, category: 'Bebidas', favorite: true },
  { id: 4, name: 'Pão Francês (kg)', price: 18.90, sku: '1001', image: 'https://http2.mlstatic.com/D_NQ_NP_779509-MLB76547243899_052024-O.webp', stock: 30, category: 'Padaria', favorite: true },
  { id: 5, name: 'Feijão Carioca 1kg', price: 8.50, sku: '78922222', image: 'https://http2.mlstatic.com/D_NQ_NP_703807-MLB94283035507_102025-O.webp', stock: 22, category: 'Mercearia', favorite: false },
  { id: 6, name: 'Arroz Branco 5kg', price: 28.90, sku: '78933333', image: 'https://http2.mlstatic.com/D_NQ_NP_938705-MLA99426381960_112025-O.webp', stock: 18, category: 'Mercearia', favorite: true },
  { id: 7, name: 'Detergente Ypê 500ml', price: 2.49, sku: '78910111', image: 'https://http2.mlstatic.com/D_NQ_NP_2X_834433-MLU47587222971_092021-F.jpg', stock: 60, category: 'Limpeza', favorite: false },
  { id: 8, name: 'Sabão em Pó OMO 1.6kg', price: 19.90, sku: '78910112', image: 'https://http2.mlstatic.com/D_NQ_NP_614617-MLA87303657984_072025-O.webp', stock: 14, category: 'Limpeza', favorite: false }
];

const INITIAL_SUPPLIERS = [
  { id: 1, name: 'Bebidas XPTO', cnpj: '11.222.333/0001-88', phone: '(11) 98765-4321' },
  { id: 2, name: 'Distribuidora de Carnes S.A.', cnpj: '44.555.666/0001-99', phone: '(11) 3333-4444' }
];

// ══════════════════════════════════════════════════════
//  RECEIPT GENERATOR
// ══════════════════════════════════════════════════════
const generateReceipt = (sale) => {
  let r = `================================================\n`;
  r += `                  NOTA FISCAL                   \n`;
  r += `================================================\n`;
  r += `Data: ${new Date(sale.timestamp).toLocaleString('pt-BR')}\n`;
  r += `Operador: ${sale.operator || 'Caixa'}\n`;
  if (sale.customerName) {
    r += `Cliente: ${sale.customerName}\n`;
    if (sale.cpf) r += `CPF/CNPJ: ${sale.cpf}\n`;
  } else if (sale.cpf) {
    r += `CPF/CNPJ Cliente: ${sale.cpf}\n`;
  }
  r += `------------------------------------------------\n`;
  r += `QTD  DESCRIÇÃO               VL.UN    SUBTOTAL\n`;
  r += `------------------------------------------------\n`;
  sale.items.forEach(i => {
    r += ` ${String(i.qty).padStart(2)}  ${i.name.substring(0, 22).padEnd(22)} ${i.price.toFixed(2).padStart(8)} ${(i.price * i.qty).toFixed(2).padStart(10)}\n`;
  });
  r += `------------------------------------------------\n`;
  if (sale.discount > 0) {
    r += `Subtotal:                          ${fmt(sale.subtotal)}\n`;
    r += `Desconto:                         -${fmt(sale.discount)}\n`;
  }
  r += `TOTAL:                              ${fmt(sale.total)}\n`;
  r += `Pagamento: ${sale.paymentMethod}\n`;
  if (sale.paymentMethod === 'Dinheiro' && sale.change > 0) {
    r += `Recebido:                           ${fmt(sale.received)}\n`;
    r += `TROCO:                              ${fmt(sale.change)}\n`;
  }
  r += `================================================\n`;
  r += `          DOCUMENTO SEM VALOR FISCAL            \n`;
  r += `================================================\n`;
  return r;
};

const generateSaleXML = (sale) => {
  const dateStr = new Date(sale.timestamp).toISOString().split('.')[0] + '-03:00';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${Math.floor(Math.random()*1e16)}${Math.floor(Math.random()*1e16)}" versao="4.00">
      <ide>
        <dhEmi>${dateStr}</dhEmi>
      </ide>
      <emit>
        <CNPJ>00000000000191</CNPJ>
        <xNome>Otimiza Market</xNome>
      </emit>
      <dest>
        ${sale.cpf ? `<CNPJ>${sale.cpf.replace(/\\D/g, '')}</CNPJ>` : '<CNPJ>99999999000191</CNPJ>'}
        <xNome>${sale.customerName || 'Consumidor Final'}</xNome>
      </dest>
      <det>
        ${sale.items.map(item => `
        <prod>
          <xProd>${item.name}</xProd>
          <qCom>${item.qty}</qCom>
          <vUnCom>${item.price.toFixed(2)}</vUnCom>
          <vProd>${(item.qty * item.price).toFixed(2)}</vProd>
          <xCat>${item.category || 'Outros'}</xCat>
        </prod>`).join('')}
      </det>
      <total>
        <ICMSTot>
          <vNF>${sale.total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;
  return xml;
};

// ══════════════════════════════════════════════════════
//  RECEIPT MODAL
// ══════════════════════════════════════════════════════
const ReceiptModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;
  const content = generateReceipt(sale);
  const download = () => {
    const blob = new Blob(['\uFEFF', content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cupom_${sale.id}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadXML = () => {
    const xmlContent = generateSaleXML(sale);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `NFe_${sale.id}.xml`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadAll = () => {
    download();
    setTimeout(() => { downloadXML(); }, 500);
  };

  const sendWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, '_blank');
  const copyClipboard = () => { navigator.clipboard.writeText(content); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem' }} onClick={onClose}>
      <div className="panel-elevated anim-scale" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Printer size={18} /> Nota Fiscal / Recibo</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
          <pre className="receipt-paper">{content}</pre>
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#F8FAFC' }}>
          <button onClick={downloadAll} className="btn-primary" style={{ flex: '1 1 100%', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem' }}>
            <Download size={15} /> Baixar Comprovantes (Recibo + XML)
          </button>
          <button onClick={sendWhatsApp} style={{ flex: 1, minWidth: '100px', background: '#25D366', color: '#fff', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem', fontWeight: 500, fontSize: '0.875rem' }}>
            <Send size={15} /> WhatsApp
          </button>
          <button onClick={copyClipboard} className="btn-outline" style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem' }}>
            <Copy size={15} /> Copiar
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  CART CONTENT
// ══════════════════════════════════════════════════════
const CartContent = ({ cart, removeFromCart, decreaseQty, increaseQty, updateQty, total, discount, setDiscount, discountType, setDiscountType, startPaymentFlow, clearCart, holdOrder, onClose }) => {
  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const discountValue = discountType === 'percent' ? subtotal * (discount / 100) : discount;
  const finalTotal = Math.max(0, subtotal - discountValue);

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: 0 }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.75rem', color: 'var(--text-muted)', padding: '2rem 0' }}>
            <ShoppingBag size={40} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: '0.85rem' }}>Carrinho vazio</p>
          </div>
        ) : cart.map((item, idx) => (
          <div key={item.cartId} className="anim-slide" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', animationDelay: `${idx * 20}ms` }}>
            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
              <img src={item.image} alt="" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{fmt(item.price)} × {item.qty}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <button onClick={() => decreaseQty(item.cartId)} style={{ padding: '0.2rem 0.4rem', color: 'var(--text-secondary)' }}><Minus size={12} /></button>
              <input type="number" value={item.qty} onChange={e => updateQty(item.cartId, parseInt(e.target.value))} min="1"
                style={{ width: '36px', padding: '0.15rem', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, boxShadow: 'none' }} />
              <button onClick={() => increaseQty(item.cartId)} style={{ padding: '0.2rem 0.4rem', color: 'var(--text-secondary)' }}><Plus size={12} /></button>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '65px', textAlign: 'right' }}>{fmt(item.price * item.qty)}</div>
            <button onClick={() => removeFromCart(item.cartId)} style={{ color: 'var(--danger)', padding: '0.3rem', borderRadius: '50%', flexShrink: 0, opacity: 0.6 }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {/* Controle de Desconto e Cliente */}
      {cart.length > 0 && (
        <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Tag size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>Desconto:</span>
            <input type="number" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0"
              style={{ width: '60px', padding: '0.3rem 0.5rem', fontSize: '0.8rem', textAlign: 'center' }} />
            <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={() => setDiscountType('percent')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: discountType === 'percent' ? 'var(--primary)' : 'var(--bg-app)', color: discountType === 'percent' ? '#fff' : 'var(--text-secondary)', borderRadius: 0 }}><Percent size={12} /></button>
              <button onClick={() => setDiscountType('fixed')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: discountType === 'fixed' ? 'var(--primary)' : 'var(--bg-app)', color: discountType === 'fixed' ? '#fff' : 'var(--text-secondary)', borderRadius: 0, borderLeft: '1px solid var(--border)' }}>R$</button>
            </div>
            {discountValue > 0 && <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>-{fmt(discountValue)}</span>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {cart.length > 0 && discountValue > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            <span>Subtotal:</span><span>{fmt(subtotal)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          <span>Total</span>
          <span style={{ color: 'var(--success)' }}>{fmt(finalTotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
          <button className="btn-success" onClick={() => startPaymentFlow(finalTotal, subtotal, discountValue)}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '0.95rem', padding: '0.85rem', fontWeight: 600 }}
            disabled={cart.length === 0}>
            <CheckCircle2 size={18} /> COBRAR (F2)
          </button>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn-outline" onClick={holdOrder} disabled={cart.length === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.55rem', fontSize: '0.8rem' }}>
              <Pause size={14} /> Pausar
            </button>
            <button className="btn-outline" onClick={() => { clearCart(); onClose?.(); }} disabled={cart.length === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.55rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}>
              <Trash2 size={14} /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ══════════════════════════════════════════════════════
const Dashboard = ({ sales, movements }) => {
  const today = new Date().toLocaleDateString('pt-BR');
  const todaySales = sales.filter(s => new Date(s.timestamp).toLocaleDateString('pt-BR') === today);
  const totalToday = todaySales.reduce((a, s) => a + s.total, 0);
  const avgTicket = todaySales.length > 0 ? totalToday / todaySales.length : 0;
  const itemsSold = todaySales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);

  const paymentBreakdown = todaySales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {});

  const recentSales = sales.slice(0, 5);

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Resumo diário de operações • {today}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', flexShrink: 0 }}>
        {[
          { label: 'Faturamento Hoje', value: fmt(totalToday), icon: <DollarSign size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Vendas Realizadas', value: fmtNum(todaySales.length), icon: <ShoppingCart size={20} />, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Ticket Médio', value: fmt(avgTicket), icon: <Target size={20} />, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Itens Vendidos', value: fmtNum(itemsSold), icon: <Package size={20} />, color: 'var(--text-main)', bg: 'var(--bg-hover)' },
        ].map((kpi, i) => (
          <div key={i} className="panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', animation: `fadeIn 0.3s ease ${i * 50}ms both` }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.1rem', color: 'var(--text-main)' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflow: 'hidden', flexWrap: 'wrap' }}>
        <div className="panel" style={{ flex: 1, minWidth: '280px', padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <BarChart3 size={18} color="var(--text-secondary)" /> Formas de Pagamento
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {Object.entries(paymentBreakdown).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>Sem vendas registradas hoje</p>
            ) : Object.entries(paymentBreakdown).map(([method, val]) => {
              const pct = totalToday > 0 ? (val / totalToday) * 100 : 0;
              const colors = { 'PIX': 'var(--pix-green)', 'Cartão': 'var(--primary)', 'Dinheiro': 'var(--success)' };
              return (
                <div key={method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 500 }}>{method}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{fmt(val)} <small>({pct.toFixed(0)}%)</small></span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors[method] || 'var(--primary)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ flex: 1.5, minWidth: '320px', padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <Activity size={18} color="var(--text-secondary)" /> Últimas Vendas
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {recentSales.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>Nenhuma venda ainda</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', background: 'transparent' }}>Hora</th>
                    <th style={{ padding: '0.5rem', background: 'transparent' }}>Itens</th>
                    <th style={{ padding: '0.5rem', background: 'transparent' }}>Tipo</th>
                    <th style={{ padding: '0.5rem', background: 'transparent', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '0.5rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.items.length} itens</td>
                      <td style={{ padding: '0.5rem' }}><span className="badge badge-neutral">{s.paymentMethod}</span></td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{fmt(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  PDV PAGE (FRENTE DE CAIXA)
// ══════════════════════════════════════════════════════
const PDV = ({ products, soundEnabled, onAddSale }) => {
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('selecionar');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [activeSale, setActiveSale] = useState(null);
  const [cpf, setCpf] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percent');
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentSubtotal, setPaymentSubtotal] = useState(0);
  const [paymentDiscount, setPaymentDiscount] = useState(0);
  const searchRef = useRef(null);

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const discountValue = discountType === 'percent' ? subtotal * (discount / 100) : discount;
  const total = Math.max(0, subtotal - discountValue);

  const cartQtyMap = cart.reduce((m, i) => { m[i.id] = (m[i.id] || 0) + i.qty; return m; }, {});

  const addToCart = useCallback((product) => {
    if (product.stock !== null && product.stock <= 0) { if (soundEnabled) beepError(); toast('Produto esgotado!', 'error'); return; }
    if (soundEnabled) beep();
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, cartId: Date.now() }];
    });
  }, [soundEnabled, toast]);

  const removeFromCart = (cartId) => setCart(c => c.filter(i => i.cartId !== cartId));
  const decreaseQty = (cartId) => setCart(c => c.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
  const increaseQty = (cartId) => setCart(c => c.map(i => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i));
  const updateQty = (cartId, v) => { if (isNaN(v) || v < 1) v = 1; setCart(c => c.map(i => i.cartId === cartId ? { ...i, qty: v } : i)); };
  const clearCart = () => { setCart([]); setDiscount(0); };

  const holdOrder = () => {
    if (!cart.length) return;
    setHeldOrders(p => [...p, { id: Date.now(), items: [...cart], total, timestamp: new Date().toISOString() }]);
    clearCart(); setIsCartDrawerOpen(false);
    toast('Comanda pausada', 'info');
  };
  const restoreOrder = (id) => {
    const o = heldOrders.find(x => x.id === id);
    if (o) { setCart(o.items); setHeldOrders(h => h.filter(x => x.id !== id)); toast('Comanda restaurada', 'success'); }
  };

  const startPaymentFlow = (finalTotal, sub, disc) => {
    if (!cart.length) return;
    setPaymentTotal(finalTotal); setPaymentSubtotal(sub); setPaymentDiscount(disc);
    setIsPaymentModalOpen(true); setPaymentStep('selecionar'); setPaymentMethod(null); setCashReceived('');
    
    setCpf('');
  };

  const finalizePayment = () => {
    if (paymentMethod === 'Dinheiro' && parseFloat(cashReceived || 0) < paymentTotal) return;
    setPaymentStep('processando');
    setTimeout(() => { setPaymentStep('gerando_nfe'); setTimeout(finishSale, 800); }, 1000);
  };

  const finishSale = () => {
    if (soundEnabled) beepSuccess();
    let customerName = null;
    const sale = {
      id: Date.now(), items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category || 'Outros' })),
      subtotal: paymentSubtotal, discount: paymentDiscount, total: paymentTotal,
      timestamp: new Date().toISOString(), paymentMethod, cpf: cpf || null,
      customerName: customerName,
      received: paymentMethod === 'Dinheiro' ? parseFloat(cashReceived) : paymentTotal,
      change: paymentMethod === 'Dinheiro' ? Math.max(0, parseFloat(cashReceived || 0) - paymentTotal) : 0,
      operator: 'Caixa'
    };
    onAddSale(sale); setActiveSale(sale);
    clearCart(); setIsCartDrawerOpen(false); setIsPaymentModalOpen(false);
    toast('Venda concluída!', 'success');
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'F2') { e.preventDefault(); startPaymentFlow(total, subtotal, discountValue); }
      if (e.key === 'F4') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') { setIsPaymentModalOpen(false); setIsCartDrawerOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [cart, total, subtotal, discountValue]);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      const f = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search));
      if (f.length === 1) { addToCart(f[0]); setSearch(''); }
      else if (!f.length && search.trim()) { if (soundEnabled) beepError(); toast('Produto não encontrado', 'warning'); }
    }
  };

  let filtered = products.filter(p => {
    if (showFavorites && !p.favorite) return false;
    if (category !== 'Todos' && p.category !== category) return false;
    if (search) return p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search);
    return true;
  });

  return (
    <div className="anim-fade" style={{ display: 'flex', gap: '1rem', height: '100%', overflow: 'hidden' }}>
      {/* Product Catalog */}
      <div className="panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Frente de Caixa</h2>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {heldOrders.length > 0 && (
              <span className="badge badge-warning" style={{ cursor: 'default' }}>
                <Pause size={12} /> {heldOrders.length} aguardando
              </span>
            )}
            <button className="btn-primary mobile-only" onClick={() => setIsCartDrawerOpen(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <ShoppingCart size={14} />
              <span style={{ fontWeight: 600 }}>{cart.reduce((a, i) => a + i.qty, 0)}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input ref={searchRef} type="text" placeholder="Buscar produto ou bipe o código de barras (F4)..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKey}
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-app)' }} />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0, paddingBottom: '0.2rem' }}>
            <button onClick={() => setShowFavorites(!showFavorites)} className="btn-outline" style={showFavorites ? { background: 'var(--warning-light)', borderColor: '#FCD34D', color: '#B45309' } : { padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Star size={14} style={{ fill: showFavorites ? '#B45309' : 'none' }} /> Favoritos
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => { setCategory(c); setShowFavorites(false); }} className={category === c && !showFavorites ? 'btn-primary' : 'btn-outline'} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>{c}</button>
            ))}
          </div>

          {/* Held Orders */}
          {heldOrders.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
              {heldOrders.map(o => (
                <button key={o.id} onClick={() => restoreOrder(o.id)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                  <Play size={12} /> {new Date(o.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {fmt(o.total)}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gridAutoRows: 'max-content', gap: '1rem', overflowY: 'auto', flex: 1, minHeight: 0, alignContent: 'start', paddingBottom: '0.5rem', paddingRight: '0.25rem' }}>
            {filtered.map((p, i) => (
              <div key={p.id} className="product-card" onClick={() => addToCart(p)}
                style={{ cursor: 'pointer', padding: 0, opacity: p.stock <= 0 ? 0.4 : 1, animation: `fadeIn 0.2s ease ${i * 20}ms both` }}>
                {cartQtyMap[p.id] && <div className="cart-qty-badge">{cartQtyMap[p.id]}</div>}
                <div style={{ height: '110px', width: '100%', background: '#fff', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <img src={p.image} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', bottom: '0.4rem', left: '0.4rem', background: 'var(--bg-hover)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 600, border: '1px solid var(--border)' }}>{p.sku}</div>
                </div>
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, background: 'var(--bg-app)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem', marginTop: 'auto' }}>{fmt(p.price)}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Search size={40} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart (Desktop) */}
      <div className="panel desktop-only" style={{ width: '320px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-app)' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <ShoppingBag size={16} color="var(--text-secondary)" /> Carrinho
            {cart.length > 0 && <span className="badge badge-neutral" style={{ marginLeft: '0.25rem' }}>{cart.reduce((a, i) => a + i.qty, 0)}</span>}
          </h3>
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <CartContent cart={cart} removeFromCart={removeFromCart} decreaseQty={decreaseQty} increaseQty={increaseQty} updateQty={updateQty}
            total={total} discount={discount} setDiscount={setDiscount} discountType={discountType} setDiscountType={setDiscountType}
            startPaymentFlow={startPaymentFlow} clearCart={clearCart} holdOrder={holdOrder} />
        </div>
      </div>

      {/* Cart Drawer (Mobile) */}
      <div className={`cart-drawer-overlay ${isCartDrawerOpen ? 'open' : ''}`} onClick={() => setIsCartDrawerOpen(false)} />
      <div className={`cart-drawer ${isCartDrawerOpen ? 'open' : ''}`}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShoppingBag size={16} /> Carrinho ({cart.reduce((a, i) => a + i.qty, 0)})</h3>
          <button onClick={() => setIsCartDrawerOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <CartContent cart={cart} removeFromCart={removeFromCart} decreaseQty={decreaseQty} increaseQty={increaseQty} updateQty={updateQty}
            total={total} discount={discount} setDiscount={setDiscount} discountType={discountType} setDiscountType={setDiscountType}
            startPaymentFlow={startPaymentFlow} clearCart={clearCart} holdOrder={holdOrder} onClose={() => setIsCartDrawerOpen(false)} />
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1500, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setIsPaymentModalOpen(false)}>
          <div className="panel-elevated anim-scale" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsPaymentModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}><X size={20} /></button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                Pagamento
              </h2>
              <div style={{ marginTop: '0.5rem', fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{fmt(paymentTotal)}</div>
              {paymentDiscount > 0 && <span className="badge badge-warning" style={{ marginTop: '0.3rem' }}>Desconto aplicado: -{fmt(paymentDiscount)}</span>}
            </div>

            {paymentStep === 'selecionar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}><Hash size={14} /> CPF/CNPJ na nota</label>
                  <input type="text" placeholder="Opcional" value={cpf} onChange={e => setCpf(e.target.value)} />
                </div>
                <div className="divider" style={{ margin: '0.5rem 0' }} />
                <button onClick={() => { setPaymentMethod('PIX'); setPaymentStep('instrucao'); }} className="btn-outline" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--pix-green)', color: 'var(--pix-green)', background: '#F0FDFA' }}>
                  <QrCode size={20} /> PIX
                </button>
                <button onClick={() => { setPaymentMethod('Cartão de Crédito'); setPaymentStep('instrucao'); }} className="btn-outline" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
                  <CreditCard size={20} /> Cartão de Crédito
                </button>
                <button onClick={() => { setPaymentMethod('Cartão de Débito'); setPaymentStep('instrucao'); }} className="btn-outline" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
                  <CreditCard size={20} /> Cartão de Débito
                </button>
                <button onClick={() => { setPaymentMethod('Dinheiro'); setPaymentStep('instrucao'); }} className="btn-outline" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--success)', color: 'var(--success)', background: 'var(--success-light)' }}>
                  <Banknote size={20} /> Dinheiro
                </button>
              </div>
            )}

            {paymentStep === 'instrucao' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
                {paymentMethod === 'PIX' && (
                  <>
                    <div style={{ width: '180px', height: '180px', background: '#fff', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
                      <QrCode size={80} color="#475569" />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>QR Code PIX</span>
                    </div>
                    <div style={{ width: '100%' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Chave Copia e Cola</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" value="00020126360014BR.GOV.BCB.PIX..." readOnly style={{ fontSize: '0.8rem', flex: 1, background: 'var(--bg-hover)' }} />
                        <button onClick={() => { navigator.clipboard.writeText('00020126360014BR.GOV.BCB.PIX...'); toast('Chave PIX copiada!', 'success'); }} className="btn-primary" style={{ padding: '0.5rem', flexShrink: 0 }}>
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {(paymentMethod === 'Cartão de Crédito' || paymentMethod === 'Cartão de Débito') && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <CreditCard size={56} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Siga as instruções na maquininha...</h3>
                  </div>
                )}
                {paymentMethod === 'Dinheiro' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Valor recebido (R$)</label>
                      <input type="number" step="0.01" placeholder="0,00" value={cashReceived} onChange={e => setCashReceived(e.target.value)} style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 600, padding: '0.75rem' }} autoFocus />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[5, 10, 20, 50, 100, 200].map(v => (
                        <button key={v} onClick={() => setCashReceived(String(v))} className="btn-outline" style={{ flex: 1, minWidth: '55px', padding: '0.5rem', fontSize: '0.85rem' }}>R$ {v}</button>
                      ))}
                    </div>
                    {parseFloat(cashReceived || 0) >= paymentTotal && (
                      <div className="anim-slide" style={{ textAlign: 'center', padding: '1rem', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success-hover)', fontWeight: 500 }}>Troco a devolver</span>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-hover)' }}>{fmt(Math.max(0, parseFloat(cashReceived || 0) - paymentTotal))}</div>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={finalizePayment} className="btn-success" style={{ padding: '0.9rem', width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={paymentMethod === 'Dinheiro' && parseFloat(cashReceived || 0) < paymentTotal}>
                  <CheckCircle2 size={18} /> Confirmar Pagamento
                </button>
              </div>
            )}

            {paymentStep === 'processando' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '2rem 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Processando...</p>
              </div>
            )}
            {paymentStep === 'gerando_nfe' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '2rem 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--success)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>Finalizando venda...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ReceiptModal isOpen={!!activeSale} onClose={() => setActiveSale(null)} sale={activeSale} />
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  VENDAS PAGE
// ══════════════════════════════════════════════════════
const VendasPage = ({ sales, onClearSales }) => {
  const [sel, setSel] = useState(null);
  const tot = sales.reduce((a, s) => a + s.total, 0);
  return (
    <div className="anim-fade panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Histórico de Vendas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {sales.length > 0 && <><span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>{sales.length} vendas • {fmt(tot)}</span>
            <button onClick={() => { if (confirm('Apagar todo o histórico?')) onClearSales(); }} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--border)' }}>Limpar</button></>}
        </div>
      </div>
      <div style={{ flex: 1, padding: '0', overflowY: 'auto', minHeight: 0 }}>
        {!sales.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-muted)' }}>
            <Receipt size={48} style={{ opacity: 0.2 }} /><p style={{ fontSize: '0.9rem' }}>Nenhuma venda registrada</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Pagamento</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={s.id} style={{ animation: `fadeIn 0.2s ease ${i * 20}ms both` }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{new Date(s.timestamp).toLocaleDateString('pt-BR')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(s.timestamp).toLocaleTimeString('pt-BR')}</div>
                  </td>
                  <td>{s.customerName || <span style={{ color: 'var(--text-muted)' }}>Consumidor Final</span>}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>{s.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                  <td><span className="badge badge-neutral">{s.paymentMethod}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(s.total)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => setSel(s)} className="btn-ghost" style={{ padding: '0.4rem' }}><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ReceiptModal isOpen={!!sel} onClose={() => setSel(null)} sale={sel} />
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  FORNECEDORES PAGE
// ══════════════════════════════════════════════════════
const FornecedoresPage = ({ suppliers, setSuppliers }) => {
  const toast = useToast();
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');

  const add = () => {
    if (!name.trim()) { toast('Informe o nome do fornecedor', 'warning'); return; }
    if (editId) {
      setSuppliers(suppliers.map(s => s.id === editId ? { ...s, name, cnpj, phone } : s));
      toast('Fornecedor atualizado com sucesso', 'success');
      setEditId(null);
    } else {
      setSuppliers([{ id: Date.now(), name, cnpj, phone }, ...suppliers]);
      toast('Fornecedor cadastrado com sucesso', 'success');
    }
    setName(''); setCnpj(''); setPhone('');
  };

  const handleEdit = (s) => {
    setEditId(s.id); setName(s.name); setCnpj(s.cnpj || ''); setPhone(s.phone || '');
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast('Fornecedor excluído!', 'success');
    }
  };

  return (
    <div className="anim-fade panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} color="var(--primary)" /> Cadastro de Fornecedores</h2>
      </div>
      {/* Banner informativo */}
      <div style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexShrink: 0 }}>
        <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.55 }}>
          <strong style={{ color: '#1d4ed8' }}>Como funciona?</strong> Cadastre aqui os seus fornecedores (empresas que fornecem produtos ao seu estoque).
          Quando você receber uma <strong>NF-e de compra</strong> de um fornecedor, importe o XML no <strong>Organizador NF-e → aba "Notas de Fornecedores"</strong>.
          O sistema identifica automaticamente que a nota não foi emitida pelo Otimiza Market e a classifica como nota de fornecedor.
        </div>
      </div>

      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-app)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>{editId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
          {editId && <button onClick={() => { setEditId(null); setName(''); setCnpj(''); setPhone(''); }} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Cancelar Edição</button>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Nome / Razão Social</label>
            <input type="text" placeholder="Nome do fornecedor" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>CNPJ</label>
            <input type="text" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Telefone</label>
            <input type="text" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button onClick={add} className="btn-primary" style={{ padding: '0.65rem 1.25rem', height: '39px' }}><UserPlus size={16} /> Cadastrar</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        {!suppliers.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.2 }} /><p style={{ fontSize: '0.9rem' }}>Nenhum fornecedor cadastrado</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((c, i) => (
                <tr key={c.id} style={{ animation: `fadeIn 0.2s ease ${i * 20}ms both` }}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.cnpj || '-'}</td>
                  <td>{c.phone || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleEdit(c)} style={{ padding: '0.3rem', color: 'var(--text-secondary)' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '0.3rem', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  PRODUTOS PAGE
// ══════════════════════════════════════════════════════
const ProdutosPage = ({ products, setProducts }) => {
  const toast = useToast();
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [image, setImage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 100 } });
      scanner.render(
        (decodedText) => {
          setSku(decodedText);
          toast('Código lido com sucesso!', 'success');
          scanner.clear();
          setShowScanner(false);
        },
        (err) => {}
      );
      return () => { scanner.clear().catch(e => {}); };
    }
  }, [showScanner]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setName(p.name);
    setPrice(p.price);
    setSku(p.sku);
    setStock(p.stock);
    setCategory(p.category);
    setImage(p.image);
    document.querySelector('.main-area')?.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
      toast('Produto excluído!', 'success');
    }
  };

  const add = () => {
    if (!name.trim() || !price || !sku) { toast('Preencha Nome, Preço e SKU', 'warning'); return; }
    
    if (editId) {
      setProducts(products.map(p => p.id === editId ? {
        ...p, name, price: parseFloat(price), sku, stock: stock ? parseInt(stock) : 0, category, image: image || FALLBACK_IMAGE
      } : p));
      toast('Produto atualizado com sucesso', 'success');
      setEditId(null);
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        sku,
        stock: stock ? parseInt(stock) : 0,
        category,
        image: image || FALLBACK_IMAGE,
        favorite: false
      };
      setProducts([newProduct, ...products]);
      toast('Produto cadastrado com sucesso', 'success');
    }
    setName(''); setPrice(''); setSku(''); setStock(''); setImage('');
  };

  return (
    <div className="anim-fade panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={20} color="var(--primary)" /> Cadastro de Produtos</h2>
      </div>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-app)', flexShrink: 0, overflowY: 'auto', maxHeight: '50vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>{editId ? 'Editar Produto' : 'Novo Produto'}</h3>
          {editId && <button onClick={() => { setEditId(null); setName(''); setPrice(''); setSku(''); setStock(''); setImage(''); }} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Cancelar Edição</button>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Coluna da Imagem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '150px' }}>
            <div style={{ width: '100%', aspectRatio: '1', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {image ? <img src={image} onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={40} color="var(--text-muted)" opacity={0.3} />}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} style={{ display: 'none' }} capture="environment" />
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline" style={{ padding: '0.4rem', fontSize: '0.75rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              <Camera size={14} /> Câmera / Galeria
            </button>
          </div>

          {/* Coluna do Formulário */}
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Nome do Produto *</label>
              <input type="text" placeholder="Ex: Cerveja Heineken Lata 350ml" value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Preço (R$) *</label>
                <input type="number" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Estoque</label>
                <input type="number" placeholder="Qtd" value={stock} onChange={e => setStock(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.5rem', width: '100%' }}>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Código de Barras (SKU) *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="Digite ou bipe o código" value={sku} onChange={e => setSku(e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => setShowScanner(!showScanner)} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  <ScanLine size={18} /> Ler Câmera
                </button>
              </div>
            </div>

            {showScanner && (
              <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <div id="reader" style={{ width: '100%' }}></div>
              </div>
            )}
            
            <button onClick={add} className="btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-end', padding: '0.65rem 1.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {editId ? <><Save size={16} /> Salvar Alterações</> : <><Plus size={16} /> Cadastrar Produto</>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        <table style={{ width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Foto</th>
              <th>Nome</th>
              <th>SKU</th>
              <th>Categoria</th>
              <th>Estoque</th>
              <th style={{ textAlign: 'right' }}>Preço</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ animation: `fadeIn 0.2s ease ${i * 20}ms both` }}>
                <td style={{ padding: '0.5rem' }}><img src={p.image} onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="badge badge-neutral">{p.sku}</span></td>
                <td>{p.category}</td>
                <td>{p.stock} un</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(p.price)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleEdit(p)} style={{ padding: '0.3rem', color: 'var(--text-secondary)' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '0.3rem', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  ORGANIZADOR NF-e (XML)
// ══════════════════════════════════════════════════════
const OrganizadorNFEPage = ({ products = [] }) => {
  const toast = useToast();
  const [organized, setOrganized] = useState({});
  const [activeTab, setActiveTab] = useState('fornecedores');

  const processXML = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const xmlText = e.target.result;
          
          const dEmiMatch = xmlText.match(/<dhEmi>(.*?)<\/dhEmi>/) || xmlText.match(/<dEmi>(.*?)<\/dEmi>/);
          const emitMatch = xmlText.match(/<emit>[\s\S]*?<CNPJ>(.*?)<\/CNPJ>[\s\S]*?<\/emit>/) || xmlText.match(/<CNPJ>(.*?)<\/CNPJ>/);
          const vNFMatch = xmlText.match(/<total>[\s\S]*?<vNF>(.*?)<\/vNF>[\s\S]*?<\/total>/) || xmlText.match(/<vNF>(.*?)<\/vNF>/);
          const xNomeMatch = xmlText.match(/<emit>[\s\S]*?<xNome>(.*?)<\/xNome>[\s\S]*?<\/emit>/) || xmlText.match(/<xNome>(.*?)<\/xNome>/);

          if (!dEmiMatch || !emitMatch || !vNFMatch) { resolve(null); return; }

          const date = new Date(dEmiMatch[1].split('T')[0]);
          const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          const cnpjEmit = emitMatch[1].replace(/[^0-9]/g, '');
          const isVenda = cnpjEmit === '00000000000191';
          const type = isVenda ? 'vendas' : 'fornecedores';

          const categories = {};
          if (isVenda) {
            const prodMatches = xmlText.match(/<prod>[\s\S]*?<\/prod>/g);
            if (prodMatches) {
              prodMatches.forEach(p => {
                const catMatch = p.match(/<xCat>(.*?)<\/xCat>/);
                const vProdMatch = p.match(/<vProd>(.*?)<\/vProd>/);
                const xProdMatch = p.match(/<xProd>(.*?)<\/xProd>/);
                let cat = catMatch ? catMatch[1] : 'Outros';
                // Se a categoria for 'Outros', tenta inferir pelo nome do produto nos cadastrados
                if (cat === 'Outros' && xProdMatch) {
                  const prodName = xProdMatch[1].toLowerCase();
                  const found = products.find(pr => 
                    pr.name.toLowerCase().includes(prodName) || 
                    prodName.includes(pr.name.toLowerCase().slice(0, 8))
                  );
                  if (found && found.category && found.category !== 'Todos') cat = found.category;
                }
                const vProd = vProdMatch ? parseFloat(vProdMatch[1]) : 0;
                categories[cat] = (categories[cat] || 0) + vProd;
              });
            }
          }
          
          resolve({
            filename: file.name,
            rawFile: file,
            monthYear,
            type,
            categories,
            cnpj: emitMatch[1].replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"),
            nome: xNomeMatch ? xNomeMatch[1] : 'Desconhecido',
            valor: parseFloat(vNFMatch[1]),
            data: date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          });
        } catch(err) { console.error('Erro ao processar XML:', err); resolve(null); }
      };
      reader.readAsText(file);
    });
  };

  const handleUpload = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    toast(`Processando ${selected.length} arquivos...`, 'info');
    
    const results = await Promise.all(selected.map(processXML));
    const valid = results.filter(r => r !== null);
    
    if (valid.length < selected.length) {
      toast(`${selected.length - valid.length} arquivos ignorados (inválidos ou não NF-e)`, 'warning');
    }
    
    const newOrg = { ...organized };
    valid.forEach(item => {
      if (!newOrg[item.monthYear]) newOrg[item.monthYear] = [];
      newOrg[item.monthYear].push(item);
    });
    
    setOrganized(newOrg);
    if(valid.length > 0) toast(`${valid.length} notas organizadas com sucesso!`, 'success');
  };

  const handleExportExcel = () => {
    const allItems = Object.values(organized).flat();
    if (allItems.length === 0) { toast('Nenhuma nota para exportar.', 'warning'); return; }

    // Helpers de estilo
    const hdr = (bgHex, fontHex = 'FFFFFF') => ({
      font: { bold: true, color: { rgb: fontHex }, sz: 11 },
      fill: { fgColor: { rgb: bgHex } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: { bottom: { style: 'thin', color: { rgb: 'DDDDDD' } } }
    });
    const cell = (bold = false, color = '1A1A2E', align = 'left') => ({
      font: { bold, color: { rgb: color }, sz: 10 },
      alignment: { horizontal: align, vertical: 'center' },
      border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } }
    });
    const altRow = (isAlt) => ({
      fill: { fgColor: { rgb: isAlt ? 'F8F9FF' : 'FFFFFF' } },
      font: { sz: 10, color: { rgb: '1A1A2E' } },
      alignment: { vertical: 'center' },
      border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } }
    });
    const money = (isAlt) => ({ ...altRow(isAlt), alignment: { horizontal: 'right', vertical: 'center' }, font: { sz: 10, bold: true, color: { rgb: '1D4ED8' } } });
    const totalStyle = { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1D4ED8' } }, alignment: { horizontal: 'right', vertical: 'center' } };

    const setCell = (ws, addr, value, style) => {
      if (!ws[addr]) ws[addr] = {};
      ws[addr].v = value;
      ws[addr].s = style;
      if (typeof value === 'number') ws[addr].t = 'n';
      else ws[addr].t = 's';
    };

    const wb = XLSX.utils.book_new();

    // ───────────────────────────────────────────────────
    // ABA 1: RESUMO (Azul escuro)
    // ───────────────────────────────────────────────────
    const wsResumo = { '!ref': 'A1:D1', '!cols': [{ wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }] };
    let rRow = 0;
    const rHdrs = ['Compet\u00eancia', 'Tipo', 'Qtd. Notas', 'Total (R$)'];
    ['A','B','C','D'].forEach((col, i) => setCell(wsResumo, `${col}1`, rHdrs[i], hdr('1E3A5F')));
    rRow = 1;
    Object.keys(organized).sort().reverse().forEach(my => {
      const vendas = organized[my].filter(i => i.type === 'vendas');
      const forn = organized[my].filter(i => i.type === 'fornecedores');
      const rows = [];
      if (vendas.length > 0) rows.push([my, 'Vendas', vendas.length, vendas.reduce((a,b)=>a+b.valor,0)]);
      if (forn.length > 0) rows.push([my, 'Fornecedores', forn.length, forn.reduce((a,b)=>a+b.valor,0)]);
      rows.forEach((row, ri) => {
        rRow++;
        const isAlt = rRow % 2 === 0;
        const cols = ['A','B','C','D'];
        const styles = [altRow(isAlt), altRow(isAlt), { ...altRow(isAlt), alignment: { horizontal: 'center' } }, money(isAlt)];
        row.forEach((val, ci) => setCell(wsResumo, `${cols[ci]}${rRow}`, val, styles[ci]));
      });
    });
    // Linha total
    rRow++;
    const totalVendas = allItems.filter(i => i.type === 'vendas').reduce((a,b)=>a+b.valor,0);
    const totalForn = allItems.filter(i => i.type === 'fornecedores').reduce((a,b)=>a+b.valor,0);
    setCell(wsResumo, `A${rRow}`, 'TOTAL GERAL', { ...totalStyle, alignment: { horizontal: 'left' } });
    setCell(wsResumo, `B${rRow}`, 'Vendas + Fornec.', totalStyle);
    setCell(wsResumo, `C${rRow}`, allItems.length, totalStyle);
    setCell(wsResumo, `D${rRow}`, totalVendas + totalForn, totalStyle);
    wsResumo['!ref'] = `A1:D${rRow}`;
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // ───────────────────────────────────────────────────
    // ABA 2: NOTAS DE VENDAS (Verde)
    // ───────────────────────────────────────────────────
    const wsVendas = { '!ref': 'A1:F1', '!cols': [{ wch: 12 }, { wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 13 }, { wch: 14 }] };
    const vHdrs = ['Data', 'Emitente', 'CNPJ', 'Arquivo', 'Compet\u00eancia', 'Valor (R$)'];
    ['A','B','C','D','E','F'].forEach((c, i) => setCell(wsVendas, `${c}1`, vHdrs[i], hdr('15803D')));
    const vendasItems = allItems.filter(i => i.type === 'vendas');
    vendasItems.forEach((it, idx) => {
      const r = idx + 2;
      const isAlt = idx % 2 === 0;
      setCell(wsVendas, `A${r}`, it.data, altRow(isAlt));
      setCell(wsVendas, `B${r}`, it.nome, { ...altRow(isAlt), font: { bold: true, sz: 10, color: { rgb: '1A1A2E' } } });
      setCell(wsVendas, `C${r}`, it.cnpj, { ...altRow(isAlt), font: { sz: 9, color: { rgb: '6B7280' } } });
      setCell(wsVendas, `D${r}`, it.filename, { ...altRow(isAlt), font: { sz: 9, color: { rgb: '6B7280' } } });
      setCell(wsVendas, `E${r}`, it.monthYear, { ...altRow(isAlt), alignment: { horizontal: 'center' } });
      setCell(wsVendas, `F${r}`, it.valor, money(isAlt));
    });
    if (vendasItems.length > 0) {
      const lr = vendasItems.length + 2;
      setCell(wsVendas, `E${lr}`, 'TOTAL', { ...totalStyle, alignment: { horizontal: 'center' } });
      setCell(wsVendas, `F${lr}`, vendasItems.reduce((a,b)=>a+b.valor,0), totalStyle);
      ['A','B','C','D'].forEach(c => setCell(wsVendas, `${c}${lr}`, '', totalStyle));
      wsVendas['!ref'] = `A1:F${lr}`;
    } else { wsVendas['!ref'] = 'A1:F1'; }
    XLSX.utils.book_append_sheet(wb, wsVendas, 'Notas de Vendas');

    // ───────────────────────────────────────────────────
    // ABA 3: NOTAS DE FORNECEDORES (Laranja)
    // ───────────────────────────────────────────────────
    const wsForn = { '!ref': 'A1:F1', '!cols': [{ wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 28 }, { wch: 13 }, { wch: 14 }] };
    const fHdrs = ['Data', 'Fornecedor', 'CNPJ', 'Arquivo', 'Compet\u00eancia', 'Valor (R$)'];
    ['A','B','C','D','E','F'].forEach((c, i) => setCell(wsForn, `${c}1`, fHdrs[i], hdr('92400E')));
    const fornItems = allItems.filter(i => i.type === 'fornecedores');
    fornItems.forEach((it, idx) => {
      const r = idx + 2;
      const isAlt = idx % 2 === 0;
      setCell(wsForn, `A${r}`, it.data, altRow(isAlt));
      setCell(wsForn, `B${r}`, it.nome, { ...altRow(isAlt), font: { bold: true, sz: 10, color: { rgb: '1A1A2E' } } });
      setCell(wsForn, `C${r}`, it.cnpj, { ...altRow(isAlt), font: { sz: 9, color: { rgb: '6B7280' } } });
      setCell(wsForn, `D${r}`, it.filename, { ...altRow(isAlt), font: { sz: 9, color: { rgb: '6B7280' } } });
      setCell(wsForn, `E${r}`, it.monthYear, { ...altRow(isAlt), alignment: { horizontal: 'center' } });
      setCell(wsForn, `F${r}`, it.valor, money(isAlt));
    });
    if (fornItems.length > 0) {
      const lr = fornItems.length + 2;
      ['A','B','C','D','E'].forEach(c => setCell(wsForn, `${c}${lr}`, c === 'E' ? 'TOTAL' : '', { ...totalStyle, fill: { fgColor: { rgb: '92400E' } }, alignment: { horizontal: c === 'E' ? 'center' : 'left' } }));
      setCell(wsForn, `F${lr}`, fornItems.reduce((a,b)=>a+b.valor,0), { ...totalStyle, fill: { fgColor: { rgb: '92400E' } } });
      wsForn['!ref'] = `A1:F${lr}`;
    } else { wsForn['!ref'] = 'A1:F1'; }
    XLSX.utils.book_append_sheet(wb, wsForn, 'Notas de Fornecedores');

    // ───────────────────────────────────────────────────
    // ABA 4: CATEGORIAS + GRÁFICO (Roxo)
    // ───────────────────────────────────────────────────
    const allCats = {};
    allItems.filter(i => i.type === 'vendas').forEach(it => {
      Object.entries(it.categories || {}).forEach(([cat, val]) => { allCats[cat] = (allCats[cat] || 0) + val; });
    });
    const totalCat = Object.values(allCats).reduce((a, b) => a + b, 0);
    const sortedCats = Object.entries(allCats).sort((a, b) => b[1] - a[1]);
    const maxCat = sortedCats[0]?.[1] || 1;
    const BAR_COLORS = ['4F46E5','0EA5E9','10B981','F59E0B','EF4444','8B5CF6','EC4899'];

    const wsCat = { '!ref': 'A1:D1', '!cols': [{ wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 30 }] };
    ['A','B','C','D'].forEach((c, i) => setCell(wsCat, `${c}1`, ['Categoria','Valor Total (R$)','Participa\u00e7\u00e3o (%)','Gr\u00e1fico'][i], hdr('5B21B6')));
    sortedCats.forEach(([cat, val], idx) => {
      const r = idx + 2;
      const pct = totalCat > 0 ? (val / totalCat) * 100 : 0;
      const barLen = Math.round((val / maxCat) * 25);
      const bar = '\u25A0'.repeat(barLen) + '\u00B7'.repeat(25 - barLen);
      const catColor = BAR_COLORS[idx % BAR_COLORS.length];
      setCell(wsCat, `A${r}`, cat, { font: { bold: true, sz: 10, color: { rgb: '1A1A2E' } }, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : 'F5F3FF' } }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } });
      setCell(wsCat, `B${r}`, val, { font: { bold: true, sz: 10, color: { rgb: '1D4ED8' } }, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : 'F5F3FF' } }, alignment: { horizontal: 'right' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } });
      setCell(wsCat, `C${r}`, +pct.toFixed(2), { font: { bold: true, sz: 10, color: { rgb: catColor } }, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : 'F5F3FF' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } });
      setCell(wsCat, `D${r}`, bar, { font: { sz: 10, color: { rgb: catColor } }, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : 'F5F3FF' } }, border: { bottom: { style: 'hair', color: { rgb: 'EEEEEE' } } } });
    });
    const catLr = sortedCats.length + 2;
    setCell(wsCat, `A${catLr}`, 'TOTAL', { ...totalStyle, fill: { fgColor: { rgb: '5B21B6' } }, alignment: { horizontal: 'left' } });
    setCell(wsCat, `B${catLr}`, totalCat, { ...totalStyle, fill: { fgColor: { rgb: '5B21B6' } } });
    setCell(wsCat, `C${catLr}`, 100, { ...totalStyle, fill: { fgColor: { rgb: '5B21B6' } }, alignment: { horizontal: 'center' } });
    setCell(wsCat, `D${catLr}`, '', { ...totalStyle, fill: { fgColor: { rgb: '5B21B6' } } });
    wsCat['!ref'] = `A1:D${catLr}`;
    XLSX.utils.book_append_sheet(wb, wsCat, 'Categorias de Vendas');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `OtimizaMarket_NF-e_${date}.xlsx`);
    toast('Planilha Excel exportada com sucesso! \u2728', 'success');
  };

  return (
    <div className="anim-fade panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header compacto */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--primary)" /> Organizador XML (NF-e)
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.5rem 1rem', border: '1.5px dashed var(--primary)', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            <UploadCloud size={15} /> Importar XMLs
            <input type="file" multiple accept=".xml" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
          {Object.keys(organized).length > 0 && (
            <button onClick={handleExportExcel} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <Download size={15} /> Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* Abas */}
      <div style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1.5rem', background: 'var(--bg-app)', flexShrink: 0 }}>
        <button className="btn-ghost" onClick={() => setActiveTab('fornecedores')} style={{ padding: '0.65rem 0', fontWeight: 600, borderBottom: activeTab === 'fornecedores' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'fornecedores' ? 'var(--primary)' : 'var(--text-secondary)', borderRadius: 0, fontSize: '0.85rem' }}>
          Notas de Fornecedores
        </button>
        <button className="btn-ghost" onClick={() => setActiveTab('vendas')} style={{ padding: '0.65rem 0', fontWeight: 600, borderBottom: activeTab === 'vendas' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'vendas' ? 'var(--primary)' : 'var(--text-secondary)', borderRadius: 0, fontSize: '0.85rem' }}>
          Notas de Vendas (Gráficos)
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {Object.keys(organized).length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
            <Folder size={56} style={{ opacity: 0.15, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Nenhuma nota importada ainda.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Clique em <strong>Importar XMLs</strong> no canto superior direito para começar.</p>
          </div>
        ) : (
          Object.keys(organized).sort().reverse().map(my => {
            const allItems = organized[my];
            const items = allItems.filter(it => it.type === activeTab);
            if (items.length === 0) return (
              <div key={my} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                {activeTab === 'fornecedores' ? (
                  <>
                    <Users size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: 500 }}>Nenhuma nota de fornecedor em {my}</p>
                    <p style={{ fontSize: '0.78rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
                      Importe XMLs de NF-e emitidas pelos seus <strong>fornecedores</strong> quando você realiza compras para o estoque.
                      O sistema os separa automaticamente das suas vendas pelo CNPJ emitente.
                    </p>
                  </>
                ) : (
                  <>
                    <BarChart2 size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: 500 }}>Nenhuma nota de venda em {my}</p>
                  </>
                )}
              </div>
            );

            const totalMes = items.reduce((a, b) => a + b.valor, 0);
            const BAR_COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
            
            let categoriesGraph = null;
            if (activeTab === 'vendas') {
              const cats = {};
              items.forEach(it => {
                Object.entries(it.categories || {}).forEach(([c, v]) => {
                  cats[c] = (cats[c] || 0) + v;
                });
              });
              const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
              const maxVal = sortedCats[0]?.[1] || 1;
              categoriesGraph = sortedCats.length > 0 ? (
                <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BarChart2 size={16} color="var(--primary)" /> Vendas por Categoria — {my}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sortedCats.map(([cat, val], idx) => {
                      const pct = (val / maxVal) * 100;
                      const totalPct = totalMes > 0 ? (val / totalMes) * 100 : 0;
                      return (
                        <div key={cat} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 130px', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat}</span>
                          <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: BAR_COLORS[idx % BAR_COLORS.length], borderRadius: '5px', transition: 'width 0.8s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(val)} <span style={{ color: BAR_COLORS[idx % BAR_COLORS.length], fontWeight: 600 }}>({totalPct.toFixed(1)}%)</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            }

            return (
              <div key={my} className="panel-elevated anim-fade" style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Header do mês */}
                <div style={{ padding: '0.9rem 1.25rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}><Folder size={18} /> Competência: {my}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{items.length} nota{items.length > 1 ? 's' : ''}</span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem' }}>Total: {fmt(totalMes)}</span>
                  </div>
                </div>

                {/* Gráfico de categorias */}
                {categoriesGraph}

                {/* Tabela */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-app)' }}>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emitente</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Arquivo</th>
                        <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-app)' }}>
                          <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>{it.data}</td>
                          <td style={{ padding: '0.65rem 1rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{it.nome}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{it.cnpj}</div>
                          </td>
                          <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.filename}</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{fmt(it.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════
const AnimatedLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'logoPulse 3s ease-in-out infinite' }}>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary)" />
        <stop offset="100%" stopColor="var(--accent)" />
      </linearGradient>
    </defs>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" fill="url(#grad)" opacity="0.15" stroke="none" />
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

// ══════════════════════════════════════════════════════
//  LIVE CLOCK
// ══════════════════════════════════════════════════════
const LiveClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
};

// ══════════════════════════════════════════════════════
//  LOGIN PAGE
// ══════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.trim() && pass.trim()) {
      onLogin(); // Aceita qualquer login preenchido por enquanto (demonstração)
    }
  };

  return (
    <div className="login-bg">
      <div className="login-shape-1" />
      <div className="login-shape-2" />
      <div className="login-glass">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <AnimatedLogo size={56} />
          <h1 style={{ marginTop: '1rem', marginBottom: '0.25rem', fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>Otimiza Market</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Acesso ao Sistema PDV</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input type="text" placeholder="Usuário" className="login-input" value={user} onChange={e => setUser(e.target.value)} required />
            <Users className="login-input-icon" size={18} />
          </div>
          <div className="login-input-group">
            <input type="password" placeholder="Senha" className="login-input" value={pass} onChange={e => setPass(e.target.value)} required />
            <span className="login-input-icon" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
          </div>
          <button type="submit" className="login-btn">
            Entrar no Sistema <ArrowUpCircle size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('pdv'); // Start directly at POS usually better for operators
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sound, setSound] = useState(true);
  const [products, setProducts] = useState(() => { try { const p = JSON.parse(localStorage.getItem('om_products')); return p && p.length ? p : MOCK_PRODUCTS; } catch { return MOCK_PRODUCTS; } });
  const [sales, setSales] = useState(() => { try { return JSON.parse(localStorage.getItem('om_sales') || '[]'); } catch { return []; } });
  const [suppliers, setSuppliers] = useState(() => { try { const c = JSON.parse(localStorage.getItem('om_suppliers')); return c && c.length ? c : INITIAL_SUPPLIERS; } catch { return INITIAL_SUPPLIERS; } });

  const saveProducts = (p) => { setProducts(p); localStorage.setItem('om_products', JSON.stringify(p)); };
  const saveSales = (s) => { setSales(s); localStorage.setItem('om_sales', JSON.stringify(s)); };
  const saveSuppliers = (s) => { setSuppliers(s); localStorage.setItem('om_suppliers', JSON.stringify(s)); };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'pdv', icon: <ShoppingCart size={18} />, label: 'Frente de Caixa' },
    { id: 'produtos', icon: <Package size={18} />, label: 'Produtos' },
    { id: 'vendas', icon: <Receipt size={18} />, label: 'Vendas' },
    { id: 'fornecedores', icon: <Users size={18} />, label: 'Fornecedores' },
    { id: 'nfe', icon: <FileText size={18} />, label: 'Organizador NF-e' },
  ];

  return (
    <ToastProvider>
      {!isAuthenticated ? (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <div className="app-shell" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          {/* Sidebar */}
        <aside className="panel desktop-only" style={{ width: isSidebarCollapsed ? '80px' : '240px', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0, borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Brand area */}
          <div onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AnimatedLogo size={28} />
            </div>
            {!isSidebarCollapsed && (
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <h1 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)', lineHeight: 1.1, fontWeight: 700 }}>Otimiza Market</h1>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ponto de Vendas</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} className={`nav-item ${page === n.id ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }} title={isSidebarCollapsed ? n.label : undefined}>
                <div className="nav-icon-container">{n.icon}</div>
                {!isSidebarCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {/* Top Bar */}
          <header className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderRadius: 0, borderTop: 'none', borderRight: 'none', borderLeft: 'none', flexShrink: 0 }}>
            {/* Mobile brand */}
            <div className="mobile-only" style={{ alignItems: 'center', gap: '0.5rem' }}>
              <AnimatedLogo size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Otimiza Market</span>
            </div>

            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Caixa 01</span>
              <span className="badge badge-success">Aberto</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                color: '#00ffcc', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace',
                background: '#1a1a2e', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid #0f0f1a', textShadow: '0 0 5px rgba(0,255,204,0.5)'
              }}>
                <Clock size={20} color="#00ffcc" /> <LiveClock />
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="main-area" style={{ flex: 1, padding: '1.25rem', overflow: 'hidden' }}>
            {page === 'dashboard' && <Dashboard sales={sales} />}
            {page === 'pdv' && <PDV products={products} soundEnabled={sound} onAddSale={(s) => saveSales([s, ...sales])} />}
            {page === 'produtos' && <ProdutosPage products={products} setProducts={saveProducts} />}
            {page === 'vendas' && <VendasPage sales={sales} onClearSales={() => saveSales([])} />}
            {page === 'fornecedores' && <FornecedoresPage suppliers={suppliers} setSuppliers={saveSuppliers} />}
            {page === 'nfe' && <OrganizadorNFEPage products={products} />}
          </main>
        </div>

        {/* Bottom Nav (Mobile) */}
        <nav className="bottom-nav mobile-only">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} className={page === n.id ? 'active' : ''}>
              <div className="nav-icon-container" style={{ width: 32, height: 32 }}>{n.icon}</div>
              <span>{n.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>
      )}
    </ToastProvider>
  );
}
