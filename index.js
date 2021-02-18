import { toThousands, formatPercent, getColorByPercentChange } from './utils.js'

const URL = 'https://fxhapi.feixiaohao.com/public/v1/ticker'
const LIMIT = 100

async function fetchRawData() {
  // const response = await fetch(`${URL}?limit=${LIMIT}`)
  const response = await fetch('/data.json')
  return response.text()
}

const CATEGORIES = {
  BTC: ['BTC'],
  ETH: ['ETH'],
  DEX: ['UNI', 'SUSHI', 'CRV', 'BAL', 'ZRX', 'LRC', '1INCH'],
  DEFI: ['LINK', 'YFI', 'YFII', 'BADGER', 'SNX', 'UMA', 'REN', 'NXM', 'AMPL', 'COMP', 'AAVE', 'MKR'],
  CHAIN: ['ATOM', 'DOT', 'ADA', 'EOS', 'TRX', 'NEO', 'KSM', 'WAVES', 'NEAR', 'LUNA', 'OKT'],
  MAINSTREAM: ['BCH', 'BSV', 'LTC', 'DOGE', 'XRP'],
  CRYPTO: ['XMR', 'DASH', 'ZEC', 'ZEN'],
  PLATFORM: ['OKB', 'HT', 'BNB'],
  NFT: ['MANA', 'ENJ', 'INJ', 'COCOS'],
  OTHERS: [],
}

let totalMarketCap = 0

function build(rawData) {
  const treeMap = new Map()
  const categoryIndex = new Map()
  for (const key in CATEGORIES) {
    const children = CATEGORIES[key]
    for (const item of children) {
      categoryIndex.set(item, key)
    }
    treeMap.set(key, {
      name: key,
      path: key,
      value: 0,
      children: [],
    })
  }

  const tokens = JSON.parse(rawData)
  for (const token of tokens) {
    const { symbol, market_cap_usd, percent_change_24h, price_usd } = token
    if ((symbol.match('BTC') && symbol !== 'BTC') || symbol.match('USD')) {
      console.log('skip pegged token', token.symbol)
      continue
    }
    const key = categoryIndex.get(symbol)
    const value = treeMap.get(key) || treeMap.get('OTHERS')
    const autoFontSize = Math.floor(Math.sqrt(market_cap_usd / 962002548449) * 100)
    value.children.push({
      name: symbol,
      value: market_cap_usd,
      percent_change_24h,
      price_usd,
      path: `${key}/${symbol}`,
      itemStyle: {
        color: getColorByPercentChange(percent_change_24h),
      },
      label: {
        fontSize: Math.max(autoFontSize, 14),
      },
    })
    value.value += market_cap_usd
    totalMarketCap += market_cap_usd
  }
  return [...treeMap.values()]
}

function render(chart, data) {
  const formatter = (params) => {
    console.log(params)
    const marketCap = params.value
    const ratio = ((marketCap * 100) / totalMarketCap).toFixed(2)
    if (!params.data.percent_change_24h) {
      return `${params.name} ${ratio}%`
    }
    return `${params.name}\n$${params.data.price_usd} ${formatPercent(params.data.percent_change_24h)}`
  }

  chart.setOption({
    // title: {
    //   text: '',
    //   left: 'center',
    // },
    width: '100%',
    height: '100%',
    tooltip: {},
    series: [
      {
        name: 'ALL',
        type: 'treemap',
        visibleMin: 300,
        label: {
          show: true,
          normal: {
            formatter,
          },
        },
        upperLabel: {
          show: true,
          height: 20,
        },
        data,
      },
    ],
  })
  chart.hideLoading()
}

async function main() {
  const chartDom = document.getElementById('main')
  const theChart = echarts.init(chartDom)
  theChart.showLoading()

  const rawData = await fetchRawData()
  const data = build(rawData)
  console.log('data:', data)
  render(theChart, data)
}

window.onload = main
