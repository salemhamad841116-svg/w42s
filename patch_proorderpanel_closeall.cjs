const fs = require('fs');
let code = fs.readFileSync('src/trading/components/order-panel/ProOrderPanel.tsx', 'utf8');

// Add openOrders, removeOrder, and showCloseConfirm state
code = code.replace(
  "const [wsConnected, setWsConnected] = useState(true);",
  "const [wsConnected, setWsConnected] = useState(true);\n  const [showCloseConfirm, setShowCloseConfirm] = useState(false);\n  const openOrders = usePositionsStore((s) => s.openOrders);\n  const removeOrder = usePositionsStore((s) => s.removeOrder);"
);

// Add closeAll function
code = code.replace(
  "/* ─── Lot Size Stepper ─── */",
  `/* ─── Close All ─── */
  const closeAll = useCallback(() => {
    const allOrders = [...openOrders];
    allOrders.forEach((o) => removeOrder(o.id));
    showOrderToast('order_filled', \`🚨 تم إغلاق \${allOrders.length} أمر وصفقة بالكامل\`);
    setShowCloseConfirm(false);
  }, [openOrders, removeOrder]);

  /* ─── Lot Size Stepper ─── */`
);

// Add Close All button to the panel
code = code.replace(
  "Confirm {side}\n             </button>\n          </div>\n        </div>",
  `Confirm {side}
             </button>
             
             {/* Emergency Close All */}
             <div className="mt-3">
               {!showCloseConfirm ? (
                 <button 
                   onClick={() => setShowCloseConfirm(true)}
                   className="w-full py-2.5 rounded-xl text-xs font-[800] text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors uppercase tracking-widest"
                 >
                   Emergency Close All
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button 
                     onClick={closeAll}
                     className="flex-1 py-2.5 rounded-xl text-xs font-[800] text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 uppercase tracking-widest"
                   >
                     Confirm Close
                   </button>
                   <button 
                     onClick={() => setShowCloseConfirm(false)}
                     className="flex-1 py-2.5 rounded-xl text-xs font-[800] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-widest"
                   >
                     Cancel
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>`
);

fs.writeFileSync('src/trading/components/order-panel/ProOrderPanel.tsx', code);
