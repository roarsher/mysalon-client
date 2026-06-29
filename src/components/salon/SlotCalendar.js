import { useState, useEffect  } from 'react';
import { getSalonSlots, getSalonAvailableDates } from '../../services/api';

// ── helpers ───────────────────────────────────────────────────────────────────
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmt12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function toDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function isTodayOrFuture(dateStr) {
  return dateStr >= new Date().toISOString().slice(0,10);
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SlotCalendar({ salonId, onSlotSelect }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const [availDates, setAvailDates]   = useState([]); // "YYYY-MM-DD" array
  const [selectedDate, setSelectedDate] = useState(null);
  const [stylistSlots,  setStylistSlots]  = useState([]); // [{stylist, slots[]}]
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedSlot,    setSelectedSlot]    = useState(null);
  const [loadingDates,    setLoadingDates]    = useState(false);
  const [loadingSlots,    setLoadingSlots]    = useState(false);

  // ── Load available dates for current month ────────────────────────────────
  useEffect(() => {
    setLoadingDates(true);
    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    getSalonAvailableDates(salonId, monthStr)
      .then(res => setAvailDates(res.data.data || []))
      .catch(() => setAvailDates([]))
      .finally(() => setLoadingDates(false));
  }, [salonId, year, month]);

  // ── Load slots when date selected ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedStylist(null);
    setSelectedSlot(null);
    setStylistSlots([]);
    getSalonSlots(salonId, selectedDate)
      .then(res => setStylistSlots(res.data.data || []))
      .catch(() => setStylistSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [salonId, selectedDate]);

  // ── Notify parent when slot+stylist chosen ────────────────────────────────
  useEffect(() => {
    if (selectedSlot && selectedStylist) {
      onSlotSelect({
        date:       selectedDate,
        slot:       selectedSlot,
        stylist:    selectedStylist,
        stylistId:  selectedStylist._id,
        startTime:  selectedSlot.startTime,
      });
    } else {
      onSlotSelect(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot, selectedStylist]);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); setSelectedDate(null); };

  // ── Slots for selected stylist ────────────────────────────────────────────
  const activeGroup  = stylistSlots.find(g => g.stylist._id === selectedStylist?._id);
  const visibleSlots = activeGroup?.slots || [];

  return (
    <div>
      {/* ── Calendar ─────────────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition">‹</button>
          <h3 className="font-semibold text-gray-800 text-sm">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
        </div>

        {/* Date cells */}
        {loadingDates ? (
          <div className="h-32 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d       = i + 1;
              const dateStr = toDateStr(year, month, d);
              const isAvail = availDates.includes(dateStr);
              const isPast  = !isTodayOrFuture(dateStr);
              const isSel   = selectedDate === dateStr;
              const isToday = dateStr === now.toISOString().slice(0,10);

              return (
                <button
                  key={d}
                  disabled={!isAvail || isPast}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    relative h-9 w-full rounded-lg text-xs font-medium transition flex items-center justify-center
                    ${isSel    ? 'bg-primary text-white shadow-sm'                      : ''}
                    ${!isSel && isAvail && !isPast ? 'hover:bg-primary-50 text-gray-800 cursor-pointer' : ''}
                    ${!isAvail || isPast ? 'text-gray-300 cursor-not-allowed'           : ''}
                    ${isToday && !isSel ? 'font-bold text-primary'                      : ''}
                  `}
                >
                  {d}
                  {isAvail && !isPast && !isSel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedDate && (
          <p className="text-xs text-center text-gray-400 mt-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}
      </div>

      {/* ── Stylist tabs (shown after date selected) ──────────────────────── */}
      {selectedDate && (
        <div className="card p-4 mb-4">
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading availability…
            </div>
          ) : stylistSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">😔</div>
              <p className="text-gray-500 text-sm font-medium">No stylists available</p>
              <p className="text-gray-400 text-xs mt-1">Try a different date</p>
            </div>
          ) : (
            <>
              {/* Stylist selector */}
              <p className="text-xs font-semibold text-gray-600 mb-3">Choose a stylist</p>
              <div className="flex gap-2 overflow-x-auto pb-1 mb-4 hide-scrollbar">
                {stylistSlots.map(({ stylist, slots }) => {
                  const freeCount = slots.filter(s => !s.isBooked).length;
                  const isSel = selectedStylist?._id === stylist._id;
                  return (
                    <button
                      key={stylist._id}
                      onClick={() => { setSelectedStylist(stylist); setSelectedSlot(null); }}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition w-[72px] ${
                        isSel ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {stylist.photo?.url
                        ? <img src={stylist.photo.url} alt={stylist.name} className="w-10 h-10 rounded-full object-cover" />
                        : <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-lg">💈</div>
                      }
                      <p className="text-xs font-medium text-gray-700 truncate w-full text-center">{stylist.name.split(' ')[0]}</p>
                      <p className={`text-xs font-semibold ${freeCount > 0 ? 'text-green-600' : 'text-red-400'}`}>
                        {freeCount > 0 ? `${freeCount} free` : 'Full'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Time slots for selected stylist */}
              {selectedStylist && (
                <>
                  {selectedStylist.speciality?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedStylist.speciality.slice(0,3).map(sp => (
                        <span key={sp} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sp}</span>
                      ))}
                      {selectedStylist.experience > 0 && (
                        <span className="text-xs text-gray-400">{selectedStylist.experience}yr exp</span>
                      )}
                    </div>
                  )}

                  <p className="text-xs font-semibold text-gray-600 mb-2">Available times</p>

                  {visibleSlots.filter(s => !s.isBooked).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No slots available for {selectedStylist.name.split(' ')[0]} on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {visibleSlots.map(slot => {
                        const isFree = !slot.isBooked;
                        const isSel  = selectedSlot?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            disabled={!isFree}
                            onClick={() => setSelectedSlot(isSel ? null : slot)}
                            className={`
                              py-2 px-1 rounded-xl text-xs font-medium border-2 transition
                              ${isSel  ? 'border-primary bg-primary text-white'          : ''}
                              ${!isSel && isFree  ? 'border-gray-200 hover:border-primary/40 text-gray-700' : ''}
                              ${!isFree ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through' : ''}
                            `}
                          >
                            {fmt12(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-green-700 font-medium bg-green-50 rounded-xl px-3 py-2">
                      <span>✅</span>
                      <span>{selectedStylist.name.split(' ')[0]} · {fmt12(selectedSlot.startTime)} – {fmt12(selectedSlot.endTime)}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 