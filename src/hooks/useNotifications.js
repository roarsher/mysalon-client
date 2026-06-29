// import { useState, useEffect, useRef, useCallback } from 'react';
// import { getUnreadCount } from '../services/api';
// import { useAuth } from '../context/AuthContext';

// // ── Generate a soft bell chime using Web Audio API ───────────────────────────
// const playNotificationSound = () => {
//   try {
//     const ctx = new (window.AudioContext || window.webkitAudioContext)();

//     const playTone = (freq, startTime, duration) => {
//       const osc    = ctx.createOscillator();
//       const gain   = ctx.createGain();
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.frequency.value = freq;
//       osc.type = 'sine';
//       gain.gain.setValueAtTime(0, startTime);
//       gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
//       gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
//       osc.start(startTime);
//       osc.stop(startTime + duration);
//     };

//     // Two-tone soft chime
//     playTone(880, ctx.currentTime,        0.4);
//     playTone(660, ctx.currentTime + 0.15, 0.4);
//   } catch {}
// };

// export default function useNotifications() {
//   const { currentUser } = useAuth();
//   const [unreadCount, setUnreadCount] = useState(0);
//   const prevCount = useRef(0);
//   const intervalRef = useRef(null);

//   const fetchCount = useCallback(async () => {
//     if (!currentUser) return;
//     try {
//       const res = await getUnreadCount();
//       const count = res.data.count || 0;

//       // Play sound only when count increases
//       if (count > prevCount.current && prevCount.current !== -1) {
//         playNotificationSound();
//       }
//       prevCount.current = count;
//       setUnreadCount(count);
//     } catch {}
//   }, [currentUser]);

//   useEffect(() => {
//     if (!currentUser) { setUnreadCount(0); return; }

//     // Set to -1 on first load so sound doesn't play on page load
//     prevCount.current = -1;
//     fetchCount();
//     // Then set to actual value — subsequent polls will compare correctly
//     setTimeout(() => { prevCount.current = unreadCount; }, 2000);
   
//     intervalRef.current = setInterval(fetchCount, 30000); // poll every 30s
//     return () => clearInterval(intervalRef.current);
//   }, [currentUser, fetchCount]);

//   return { unreadCount, refetch: fetchCount };
// }




import { useState, useEffect, useRef, useCallback } from 'react';
import { getUnreadCount } from '../services/api';
import { useAuth } from '../context/AuthContext';

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, startTime, duration) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(880, ctx.currentTime,        0.4);
    playTone(660, ctx.currentTime + 0.15, 0.4);
  } catch {}
};

export default function useNotifications() {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCount   = useRef(-1); // -1 = first load, skip sound
  const intervalRef = useRef(null);

  const fetchCount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res   = await getUnreadCount();
      const count = res.data.count || 0;

      // Play sound only when count increases after first load
      if (prevCount.current !== -1 && count > prevCount.current) {
        playNotificationSound();
      }
      prevCount.current = count;
      setUnreadCount(count);
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setUnreadCount(0); prevCount.current = -1; return; }

    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000);
    return () => clearInterval(intervalRef.current);
  }, [currentUser, fetchCount]);

  return { unreadCount, refetch: fetchCount };
}