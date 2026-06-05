/**
 * Sound effects dùng Web Audio API — không cần file âm thanh
 */

let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, volume = 0.3, delay = 0 }) {
  try {
    const ac  = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay)
    gain.gain.setValueAtTime(volume, ac.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration)
    osc.start(ac.currentTime + delay)
    osc.stop(ac.currentTime + delay + duration)
  } catch (e) {
    // Âm thanh không khả dụng thì bỏ qua
  }
}

/** ✅ Đúng — 2 nốt đi lên vui vẻ */
export function playCorrect() {
  playTone({ frequency: 523, type: 'sine',     duration: 0.12, volume: 0.25, delay: 0 })
  playTone({ frequency: 784, type: 'sine',     duration: 0.18, volume: 0.25, delay: 0.1 })
}

/** ❌ Sai — 1 nốt trầm ngắn */
export function playWrong() {
  playTone({ frequency: 220, type: 'sawtooth', duration: 0.2,  volume: 0.15, delay: 0 })
}

/** 🏆 Hoàn thành bài — fanfare nhỏ */
export function playComplete(score) {
  const isPerfect = score === 1
  if (isPerfect) {
    // Perfect: 4 nốt ăn mừng
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      playTone({ frequency: f, type: 'sine', duration: 0.2, volume: 0.22, delay: i * 0.12 })
    })
  } else {
    // Normal finish: 2 nốt nhẹ
    playTone({ frequency: 523, type: 'sine', duration: 0.15, volume: 0.2, delay: 0 })
    playTone({ frequency: 659, type: 'sine', duration: 0.2,  volume: 0.2, delay: 0.15 })
  }
}

/** 🔀 Bắt đầu bài — nốt nhẹ báo hiệu */
export function playStart() {
  playTone({ frequency: 659, type: 'sine', duration: 0.1, volume: 0.18, delay: 0 })
  playTone({ frequency: 784, type: 'sine', duration: 0.15, volume: 0.18, delay: 0.08 })
}

/** 🔗 Nối đúng 1 cặp (Matching) */
export function playMatch() {
  playTone({ frequency: 660, type: 'sine', duration: 0.1, volume: 0.2, delay: 0 })
  playTone({ frequency: 880, type: 'sine', duration: 0.12, volume: 0.2, delay: 0.08 })
}

/** Sai khi nối (Matching) */
export function playMatchWrong() {
  playTone({ frequency: 300, type: 'triangle', duration: 0.15, volume: 0.12, delay: 0 })
}
