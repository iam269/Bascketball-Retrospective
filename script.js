let state = {
  data: {
    players: [
      {id: 'p1', name: 'Andrei Popescu', number: 9, position: 'G'},
      {id: 'p2', name: 'Mihai Ionescu', number: 23, position: 'F'},
      {id: 'p3', name: 'Cristi Georgescu', number: 4, position: 'C'}
    ],
    seasons: [
      {season: '2021/22', avgPoints: 72.4},
      {season: '2022/23', avgPoints: 78.1},
      {season: '2023/24', avgPoints: 81.6},
      {season: '2024/25', avgPoints: 76.8}
    ],
    games: [
      {date:'2025-09-15', home:'Steaua', away:'Dinamo', homeScore:82, awayScore:77, notes:'Final strâns'},
      {date:'2025-09-22', home:'Cluj', away:'Oradea', homeScore:68, awayScore:95, notes:'Dominare ofensivă Oradea'},
      {date:'2025-10-01', home:'Brașov', away:'Pitești', homeScore:74, awayScore:74, notes:'Egalitate spectaculoasă'}
    ]
  },
  selectedPlayer: null
}

async function loadData(){
  // data is embedded in the script; nothing to fetch
  return Promise.resolve()
}

function el(tag, cls, txt){
  const d = document.createElement(tag)
  if(cls) d.className = cls
  if(txt !== undefined) d.textContent = txt
  return d
}

function renderPlayersGrid(){
  const grid = document.getElementById('playersGrid')
  grid.innerHTML = ''
  state.data.players.forEach(p=>{
    const card = el('div','player-card')
    card.appendChild(el('div','number', `#${p.number}`))
    card.appendChild(el('div','name', p.name))
    card.appendChild(el('div','pos', p.position))
    card.onclick = ()=>{ state.selectedPlayer = p.id; updateAll() }
    if(state.selectedPlayer === p.id) card.style.outline = '2px solid var(--accent)'
    grid.appendChild(card)
  })
}

function renderStats(){
  const container = document.getElementById('statCards')
  container.innerHTML = ''
  const totals = {games:0,points:0,rebounds:0,assists:0}
  state.data.games.forEach(g=>{
    totals.games += 1
    totals.points += g.homeScore + g.awayScore
  })

  container.appendChild(card('Meciuri', totals.games))
  container.appendChild(card('Puncte totale (ambele echipe)', totals.points))
  container.appendChild(card('Jucători', state.data.players.length))
}

function card(title, value){
  const c = el('div','card')
  c.appendChild(el('h4',null,title))
  c.appendChild(el('div','value',value))
  return c
}

function renderScheduleTable(filterText=''){
  const tbody = document.querySelector('#scheduleTable tbody')
  tbody.innerHTML = ''
  const games = state.data.games.filter(g=>{
    if(!filterText) return true
    const ft = filterText.toLowerCase()
    const notesMatch = g.notes && g.notes.toLowerCase().includes(ft)
    return g.home.toLowerCase().includes(ft) || g.away.toLowerCase().includes(ft) || notesMatch
  })
  games.forEach(g=>{
    const tr = document.createElement('tr')
    tr.appendChild(cell(g.date))
    tr.appendChild(cell(`${g.home} vs ${g.away}`))
    tr.appendChild(cell(`${g.homeScore}:${g.awayScore}`))
    tr.appendChild(cell(g.notes || ''))
    tbody.appendChild(tr)
  })
}

function cell(txt){ const td = document.createElement('td'); td.textContent = txt; return td }

let pointsChart = null
function renderChart(){
  const ctx = document.getElementById('pointsChart').getContext('2d')
  const labels = state.data.seasons.map(function(s){ return s.season })
  const points = state.data.seasons.map(function(s){ return s.avgPoints })
  if(pointsChart) pointsChart.destroy()
  pointsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Puncte medii / sezon',
          data: points,
          backgroundColor: 'rgba(255,107,107,0.12)',
          borderColor: '#ff6b6b',
          tension: 0.3
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

function wireSearch(){
  const s = document.getElementById('searchInput')
  if(!s) return
  s.addEventListener('input', ()=>{
    renderScheduleTable(s.value)
  })
}

function updateAll(){
  renderPlayersGrid()
  renderStats()
  renderScheduleTable()
  renderChart()
}

async function init(){
  await loadData()
  wireSearch()
  updateAll()
}

init().catch(err=>{
  console.error(err)
  document.body.innerHTML = '<p>Eroare la încărcare date. Vezi consola.</p>'
})
