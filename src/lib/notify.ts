// Notification API helpers + audio fallback (Web Audio beep, no asset).

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function notifyRestDone(exerciseName: string) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification('Descanso terminado', {
        body: exerciseName ? `Siguiente serie: ${exerciseName}` : 'Empieza la próxima serie.',
        icon: '/icons/icon-192.png',
      });
    } catch {
      /* ignore */
    }
  }
  beep();
}

function beep() {
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    osc.onended = () => void ctx.close();
  } catch {
    /* ignore */
  }
}
