export function toThousands(num) {
  const result = []
  let counter = 0
  num = (num || 0).toString().split('')
  for (let i = num.length - 1; i >= 0; i--) {
    counter++
    result.unshift(num[i])
    if (!(counter % 3) && i != 0) {
      result.unshift(',')
    }
  }
  return result.join('')
}

export function formatPercent(val) {
  const sign = val > 0 ? '+' : ''
  return `${sign}${val}%`
}

export function getColorByPercentChange(change) {
  const normalized = Math.min(1, Math.abs(change) / 10) // 10% is pure red or green
  const scale = Math.floor(normalized * 255)
  return change > 0 ? `rgb(${scale}, 0, 0)` : `rgb(0, ${scale}, 0)`
}
