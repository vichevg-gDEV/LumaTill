import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid2X2, 
  Move, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Users, 
  X, 
  Layers, 
  Sparkles,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Clock,
  User,
  Coffee,
  Wine,
  Utensils,
  ChefHat
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { VenueTable, TableStatus } from '../types';

export const TablesCanvas: React.FC = () => {
  const { 
    tables, 
    selectedTable, 
    selectTable, 
    updateTableLayout, 
    resetTablesLayout,
    addTable, 
    deleteTable, 
    updateTableDetails, 
    currentUser,
    openOrders,
    categories,
    switchTab,
    settings,
    clearActiveOrder
  } = usePOS();

  const [viewMode, setViewMode] = useState<'floorplan' | 'grid'>('floorplan');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<VenueTable | null>(null);
  const [tableToDelete, setTableToDelete] = useState<VenueTable | null>(null);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Table Form State
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableSection, setNewTableSection] = useState<string>('Dining Room');
  const [newTableShape, setNewTableShape] = useState<'circle' | 'rectangle' | 'booth'>('rectangle');
  const [newTableSeats, setNewTableSeats] = useState<number>(4);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Dynamic Sections based on configured tables
  const sections = useMemo(() => {
    const raw = Array.from(new Set(tables.map(t => t.section)));
    return ['All', ...raw];
  }, [tables]);

  // Dragging state for Floor Plan
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef<boolean>(false);

  const handlePointerDown = (table: VenueTable, e: React.PointerEvent) => {
    if (!isEditMode) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setDraggingId(table.id);
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !draggingId || !canvasRef.current) return;

    if (pointerStartPosRef.current) {
      const dist = Math.hypot(e.clientX - pointerStartPosRef.current.x, e.clientY - pointerStartPosRef.current.y);
      if (dist > 6) {
        didDragRef.current = true;
      }
    }

    if (!didDragRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to percentage coordinates
    let pctX = Math.round((clientX / rect.width) * 100);
    let pctY = Math.round((clientY / rect.height) * 100);

    // Grid snap step (2%)
    pctX = Math.round(pctX / 2) * 2;
    pctY = Math.round(pctY / 2) * 2;

    // Bounds check
    pctX = Math.max(8, Math.min(92, pctX));
    pctY = Math.max(8, Math.min(92, pctY));

    updateTableLayout(draggingId, pctX, pctY);
  };

  const handlePointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
      setTimeout(() => {
        didDragRef.current = false;
      }, 50);
    }
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    addTable({
      tableName: newTableName.trim(),
      section: newTableSection,
      shape: newTableShape,
      seats: Number(newTableSeats) || 4,
      posX: 50,
      posY: 50,
    });

    setNewTableName('');
    setIsAddModalOpen(false);
  };

  const handleTableClick = (table: VenueTable) => {
    if (isEditMode) {
      if (didDragRef.current) return;
      setEditingTable(table);
    } else {
      selectTable(table);
    }
  };

  const handleTakeOrderForTable = (table: VenueTable) => {
    selectTable(table);
    switchTab(categories[0]?.id || 'drinks');
  };

  const handleClearTable = (tableId: string) => {
    updateTableDetails(tableId, { status: 'empty', assignedServer: undefined });
    if (selectedTable?.id === tableId) {
      clearActiveOrder();
    }
  };

  const getStatusColor = (status: TableStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-xl shadow-amber-950/40 ring-2 ring-amber-400 ring-offset-2 ring-offset-black';
    }
    switch (status) {
      case 'occupied':
        return 'bg-zinc-800/90 border-zinc-500 text-zinc-100 shadow-md hover:border-zinc-300';
      case 'billed':
        return 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md hover:bg-amber-500/30';
      case 'action_required':
        return 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md animate-pulse';
      case 'empty':
      default:
        return 'bg-[#151518] border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-[#1a1a1f]';
    }
  };

  const filteredTables = tables.filter(t => 
    activeSectionFilter === 'All' || t.section === activeSectionFilter
  );

  // Active table order info
  const selectedTableOrder = selectedTable ? openOrders[selectedTable.id] : null;
  const selectedTableTotal = selectedTableOrder ? selectedTableOrder.totalAmount : 0;
  const selectedTableItemCount = selectedTableOrder ? selectedTableOrder.items.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none relative bg-[#09090b] font-['Inter',sans-serif]">
      {/* Top Controls Header - Touch Sized */}
      <div className="p-3 sm:p-4 border-b border-zinc-800 bg-[#121215] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: View Mode Toggle & Walk-up Quick Switch */}
        <div className="flex items-center gap-2">
          {/* Floor Plan vs Grid Toggle */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('floorplan')}
              className={`h-10 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'floorplan'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`h-10 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
              <span>Table List ({tables.length})</span>
            </button>
          </div>

          {/* Quick Switch to Walk-up Mode */}
          <button
            id="walkup-till-toggle-btn"
            onClick={() => {
              selectTable(null);
            }}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              !selectedTable
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>Walk-up Mode</span>
          </button>
        </div>

        {/* Section Filters - Large Touch Targets */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSectionFilter(sec)}
              className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeSectionFilter === sec
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{sec}</span>
            </button>
          ))}
        </div>

        {/* Edit Layout Toggle (Manager & Admin Only) */}
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <button
                  type="button"
                  onClick={resetTablesLayout}
                  className="h-10 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Reset to default dining & 2-bar layout"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Layout</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-10 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Table</span>
                </button>
              </>
            )}

            <button
              id="toggle-layout-edit-btn"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isEditMode
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Move className="w-4 h-4" />
              <span>{isEditMode ? 'Finish Layout' : 'Edit Layout'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Floor Plan Stage or Grid View */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {viewMode === 'floorplan' ? (
          /* 2D Architectural Dining Hall Stage */
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`flex-1 relative overflow-hidden m-2 sm:m-4 rounded-2xl bg-[#0a0a0d] border border-zinc-800/90 shadow-2xl ${
              isEditMode ? 'canvas-dot-grid cursor-crosshair' : ''
            }`}
          >
            {/* Top Architectural Header Strip: Kitchen & Service Pass */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900/95 border border-amber-500/30 text-[10px] font-mono text-zinc-300 uppercase tracking-widest pointer-events-none shadow-md z-10">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Kitchen Expo & Service Pass</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            </div>

            {/* Bottom Architectural Strip: Main Entrance & Host Stand */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900/95 border border-emerald-500/30 text-[10px] font-mono text-zinc-300 uppercase tracking-widest pointer-events-none shadow-md z-10">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Main Entrance • Host Stand</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            </div>

            {/* Left Flank Header: West Bar */}
            <div className="absolute top-3 left-[3%] flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400/90 pointer-events-none z-10">
              <Wine className="w-3.5 h-3.5" />
              <span>West Bar</span>
            </div>

            {/* Right Flank Header: East Bar */}
            <div className="absolute top-3 right-[3%] flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 pointer-events-none z-10">
              <Coffee className="w-3.5 h-3.5" />
              <span>East Bar</span>
            </div>

            {/* West Bar Architectural Counter Structure */}
            <div className="absolute left-[3%] top-[10%] bottom-[10%] w-[6%] min-w-[42px] max-w-[56px] rounded-2xl bg-[#121217] border border-zinc-800 pointer-events-none flex flex-col items-center justify-between py-5 shadow-inner z-0">
              <div className="w-1 h-8 rounded-full bg-cyan-500/30" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-600 uppercase -rotate-90 whitespace-nowrap">
                TAP COUNTER
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-600 uppercase -rotate-90 whitespace-nowrap">
                SERVICE WELL
              </span>
              <div className="w-1 h-8 rounded-full bg-cyan-500/30" />
            </div>

            {/* East Bar Architectural Counter Structure */}
            <div className="absolute right-[3%] top-[10%] bottom-[10%] w-[6%] min-w-[42px] max-w-[56px] rounded-2xl bg-[#121217] border border-zinc-800 pointer-events-none flex flex-col items-center justify-between py-5 shadow-inner z-0">
              <div className="w-1 h-8 rounded-full bg-amber-500/30" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-600 uppercase rotate-90 whitespace-nowrap">
                COCKTAIL BAR
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-600 uppercase rotate-90 whitespace-nowrap">
                SPEED RAIL
              </span>
              <div className="w-1 h-8 rounded-full bg-amber-500/30" />
            </div>

            {/* Central Dining Hall Bounds, Floor Plan Boundary & Aisle Guides */}
            <div className="absolute left-[20%] right-[20%] top-[10%] bottom-[10%] rounded-3xl border border-dashed border-zinc-800/80 bg-[#0e0e12]/30 pointer-events-none z-0">
              {/* Center Walkway Aisle Guideline */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px border-r border-dashed border-zinc-800/50" />
              {/* Row Cross Aisle Guidelines */}
              <div className="absolute top-[36%] left-0 right-0 h-px border-b border-dashed border-zinc-800/40" />
              <div className="absolute top-[62%] left-0 right-0 h-px border-b border-dashed border-zinc-800/40" />
              {/* Subtle Architectural Zone Label */}
              <div className="absolute top-2 left-3 text-[9px] font-mono tracking-widest text-zinc-600 uppercase font-semibold">
                MAIN DINING HALL
              </div>
            </div>

            {/* Floorplan Status Legend - Bottom Left (docked cleanly) */}
            <div className="absolute bottom-2.5 left-3 sm:left-4 hidden md:flex items-center gap-3 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400 pointer-events-none shadow-sm z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-zinc-500" />
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-300" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Alert</span>
              </div>
            </div>

            {/* Render Architectural Table Nodes */}
            {filteredTables.map(table => {
              const isSelected = selectedTable?.id === table.id;
              const statusClass = getStatusColor(table.status, isSelected);
              const orderForTable = openOrders[table.id];
              const billAmount = orderForTable ? orderForTable.totalAmount : 0;
              const hasItems = orderForTable && orderForTable.items.length > 0;
              const isBar = table.section.includes('Bar');
              const isBooth = table.shape === 'booth';
              const isCircle = table.shape === 'circle' && !isBar;

              // Proportional Architectural Table Dimensions
              let shapeClasses = 'rounded-xl w-24 h-18 sm:w-28 sm:h-20';
              if (isBar) {
                // Circular Bar Stool with footrest rim
                shapeClasses = 'rounded-full w-16 h-16 sm:w-[72px] sm:h-[72px]';
              } else if (isBooth) {
                // Banquette Booth with curved top cushion
                shapeClasses = 'rounded-2xl w-24 h-18 sm:w-28 sm:h-20';
              } else if (isCircle) {
                // Grand VIP Round Table
                shapeClasses = 'rounded-full w-20 h-20 sm:w-24 sm:h-24';
              } else if (table.seats > 4) {
                // 6-Person Rectangular Center Table
                shapeClasses = 'rounded-xl w-28 h-18 sm:w-34 sm:h-20';
              }

              return (
                <div
                  key={table.id}
                  id={`table-node-${table.id}`}
                  style={{
                    left: `${table.posX}%`,
                    top: `${table.posY}%`,
                  }}
                  onPointerDown={e => {
                    if (isEditMode) {
                      handlePointerDown(table, e);
                    }
                  }}
                  onPointerUp={handlePointerUp}
                  onClick={() => handleTableClick(table)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 select-none flex flex-col items-center justify-between p-2 border transition-colors z-10 ${shapeClasses} ${statusClass} ${
                    isEditMode
                      ? 'cursor-grab active:cursor-grabbing hover:border-amber-400 hover:ring-2 hover:ring-amber-400/40 touch-none shadow-lg z-30'
                      : 'cursor-pointer hover:border-zinc-400 hover:shadow-lg active:brightness-110 active:border-amber-400/80 shadow-md'
                  }`}
                >
                  {/* Banquette Booth Cushion Backing */}
                  {isBooth && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[92%] h-2.5 rounded-t-lg bg-zinc-800 border-t border-x border-zinc-600/70 shadow-sm pointer-events-none" />
                  )}

                  {/* Rectangular Table Chairs (Top & Bottom) */}
                  {!isBar && !isCircle && !isBooth && (
                    <>
                      {/* Top Chairs */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 pointer-events-none">
                        <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        {table.seats > 4 && (
                          <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        )}
                      </div>
                      {/* Bottom Chairs */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 pointer-events-none">
                        <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        {table.seats > 4 && (
                          <span className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 border border-zinc-600/50" />
                        )}
                      </div>
                    </>
                  )}

                  {/* Circle VIP Table Radial Chairs */}
                  {isCircle && (
                    <>
                      <span className="w-4 h-1.5 rounded-full bg-zinc-700 border border-zinc-600/50 absolute -top-1.5 left-1/2 -translate-x-1/2 pointer-events-none" />
                      <span className="w-4 h-1.5 rounded-full bg-zinc-700 border border-zinc-600/50 absolute -bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none" />
                      <span className="w-1.5 h-4 rounded-full bg-zinc-700 border border-zinc-600/50 absolute -left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <span className="w-1.5 h-4 rounded-full bg-zinc-700 border border-zinc-600/50 absolute -right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </>
                  )}

                  {/* Table Header: Category Kicker & Capacity */}
                  <div className="w-full flex items-center justify-between pointer-events-none leading-none px-0.5">
                    <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase">
                      {isBar ? 'Bar' : isBooth ? 'Booth' : 'Tbl'}
                    </span>
                    <div className="flex items-center gap-0.5 text-[9px] font-mono text-zinc-400">
                      <Users className="w-2.5 h-2.5" />
                      <span>{table.seats}</span>
                    </div>
                  </div>

                  {/* Table Main Name / Server info */}
                  <div className="text-center my-auto pointer-events-none">
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-white block leading-tight">
                      {table.tableName}
                    </span>
                    {table.assignedServer && table.status !== 'empty' && (
                      <span className="text-[8px] sm:text-[9px] text-zinc-400 truncate max-w-[70px] sm:max-w-[85px] block font-mono">
                        {table.assignedServer.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Table Status / Bill Total Badge */}
                  <div className="w-full text-center pointer-events-none leading-none">
                    {hasItems && billAmount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 text-[9px] sm:text-[10px] font-mono font-bold block truncate shadow-sm">
                        {settings.currencySymbol}{billAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className={`text-[8px] sm:text-[9px] uppercase font-mono tracking-wider block ${
                        table.status === 'occupied' ? 'text-zinc-300 font-semibold' : 'text-zinc-500'
                      }`}>
                        {table.status === 'action_required' ? 'Alert' : table.status}
                      </span>
                    )}
                  </div>

                  {/* Edit Mode Drag Grip & Direct Delete Button */}
                  {isEditMode && (
                    <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 z-40">
                      <button
                        type="button"
                        id={`delete-table-btn-${table.id}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteTable(table.id);
                          if (editingTable?.id === table.id) {
                            setEditingTable(null);
                          }
                        }}
                        className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border border-rose-400/40"
                        title={`Delete ${table.tableName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg font-bold pointer-events-none border border-amber-300/40" title="Drag to reposition">
                        <Move className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty Canvas Message */}
            {tables.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                <Layers className="w-10 h-10 stroke-1 mb-3 text-zinc-700" />
                <p className="text-sm">No tables configured. Switch to Edit Mode to map your venue floor plan.</p>
              </div>
            )}
          </div>
        ) : (
          /* Table Grid / List View - Touch Optimized Cards */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTables.map(table => {
                const isSelected = selectedTable?.id === table.id;
                const orderForTable = openOrders[table.id];
                const billAmount = orderForTable ? orderForTable.totalAmount : 0;
                const itemCount = orderForTable ? orderForTable.items.reduce((s, i) => s + i.quantity, 0) : 0;

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                      isSelected
                        ? 'bg-zinc-800/90 border-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-black shadow-xl'
                        : table.status === 'occupied'
                        ? 'bg-[#18181c] border-zinc-700 hover:border-zinc-500'
                        : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row: Name, Section & Capacity */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-white tracking-tight">
                          {table.tableName}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
                          <Users className="w-3.5 h-3.5" />
                          <span>{table.seats} seats</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-mono">{table.section}</span>
                        {table.assignedServer && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-300 font-medium">Server: {table.assignedServer}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Middle: Open Tab Information */}
                    <div className="my-3 py-2 border-t border-b border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          table.status === 'occupied' ? 'bg-emerald-400' :
                          table.status === 'billed' ? 'bg-amber-400' : 'bg-zinc-600'
                        }`} />
                        <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                          {table.status} ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                        </span>
                      </div>

                      <span className={`text-base font-bold font-mono tabular ${
                        billAmount > 0 ? 'text-amber-400' : 'text-zinc-600'
                      }`}>
                        {settings.currencySymbol}{billAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Bottom Action Buttons - Large Touch Targets */}
                    <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      {isEditMode ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingTable(table)}
                            className="flex-1 h-10 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Table</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteTable(table.id);
                              if (editingTable?.id === table.id) {
                                setEditingTable(null);
                              }
                            }}
                            className="h-10 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                            title="Delete Table"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleTakeOrderForTable(table)}
                            className="flex-1 h-10 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Take Order</span>
                          </button>

                          {itemCount > 0 && (
                            <button
                              onClick={() => {
                                selectTable(table);
                                switchTab('total');
                              }}
                              className="h-10 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                              title="View Tab & Checkout"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span>Pay</span>
                            </button>
                          )}

                          {table.status !== 'empty' && (
                            <button
                              onClick={() => handleClearTable(table.id)}
                              className="h-10 px-3 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 text-xs transition-all"
                              title="Clear / Free Table"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Table Quick Action Bar (Bottom Drawer on Floor Plan) */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="p-3 sm:p-4 bg-[#151518] border-t border-zinc-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 z-30"
            >
              {/* Table Info Badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex flex-col items-center justify-center text-amber-400 font-bold shadow-inner">
                  <span className="text-xs font-mono">{selectedTable.section.slice(0, 3)}</span>
                  <span className="text-sm leading-none">{selectedTable.tableName.replace(/[^0-9]/g, '') || selectedTable.tableName.slice(0, 3)}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{selectedTable.tableName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {selectedTable.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedTable.section} • {selectedTable.seats} seats • {selectedTableItemCount} items on tab
                  </p>
                </div>
              </div>

              {/* Total & Action Buttons - Large Touch Targets */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right pr-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Active Tab</span>
                  <span className="text-lg font-bold font-mono text-amber-400 tabular">
                    {settings.currencySymbol}{selectedTableTotal.toFixed(2)}
                  </span>
                </div>

                {/* Direct Order Button */}
                <button
                  id="open-menu-for-table-btn"
                  onClick={() => handleTakeOrderForTable(selectedTable)}
                  className="h-12 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-md active:scale-[0.98] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Take Order</span>
                </button>

                {/* Settle Bill Button */}
                {selectedTableItemCount > 0 && (
                  <button
                    onClick={() => {
                      switchTab('total');
                    }}
                    className="h-12 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-md active:scale-[0.98] transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Bill</span>
                  </button>
                )}

                {/* Clear Table Button */}
                {selectedTable.status !== 'empty' && (
                  <button
                    onClick={() => handleClearTable(selectedTable.id)}
                    className="h-12 px-3.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Clear Table & Reset Status"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Free Table</span>
                  </button>
                )}

                {/* Unselect / Switch to Walk-up */}
                <button
                  onClick={() => selectTable(null)}
                  className="h-12 w-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
                  title="Close Selection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Edit Configuration Modal (Edit Mode) */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[#18181c] rounded-2xl p-5 border border-zinc-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit {editingTable.tableName}</h3>
              <button onClick={() => setEditingTable(null)} className="h-9 w-9 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Table Name</label>
                <input
                  type="text"
                  value={editingTable.tableName}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingTable(prev => prev ? { ...prev, tableName: val } : null);
                    updateTableDetails(editingTable.id, { tableName: val });
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Section</label>
                <select
                  value={editingTable.section}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingTable(prev => prev ? { ...prev, section: val } : null);
                    updateTableDetails(editingTable.id, { section: val });
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                >
                  <option value="Main Bar">Main Bar</option>
                  <option value="Dining Hall">Dining Hall</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Patio">Patio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Shape</label>
                  <select
                    value={editingTable.shape}
                    onChange={e => {
                      const val = e.target.value as any;
                      setEditingTable(prev => prev ? { ...prev, shape: val } : null);
                      updateTableDetails(editingTable.id, { shape: val });
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="booth">Booth</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingTable.seats}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 4;
                      setEditingTable(prev => prev ? { ...prev, seats: val } : null);
                      updateTableDetails(editingTable.id, { seats: val });
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-800 gap-2">
                <button
                  type="button"
                  id="modal-delete-table-btn"
                  onClick={() => {
                    deleteTable(editingTable.id);
                    setEditingTable(null);
                  }}
                  className="h-11 px-4 rounded-xl bg-rose-600/25 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  title={`Delete ${editingTable.tableName}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="h-11 px-6 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Custom Delete Table Confirmation Dialog (Zero window.confirm blocks) */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/75 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18181c] rounded-2xl p-5 border border-zinc-700 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete {tableToDelete.tableName}?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Are you sure you want to remove <span className="text-white font-semibold">{tableToDelete.tableName}</span> ({tableToDelete.section}) from the venue layout? This cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="flex-1 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTable(tableToDelete.id);
                  setTableToDelete(null);
                  if (editingTable?.id === tableToDelete.id) {
                    setEditingTable(null);
                  }
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70 p-4">
          <form onSubmit={handleCreateNewTable} className="w-full max-w-sm bg-[#18181c] rounded-2xl p-5 border border-zinc-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Table</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="h-9 w-9 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Table Name / Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 14, Bar Seat 5"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  autoFocus
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Floor Section</label>
                <select
                  value={newTableSection}
                  onChange={e => setNewTableSection(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                >
                  <option value="Main Bar">Main Bar</option>
                  <option value="Dining Hall">Dining Hall</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Patio">Patio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Shape</label>
                  <select
                    value={newTableShape}
                    onChange={e => setNewTableShape(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="booth">Booth</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTableSeats}
                    onChange={e => setNewTableSeats(parseInt(e.target.value) || 4)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 shadow-md"
                >
                  Create Table
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
