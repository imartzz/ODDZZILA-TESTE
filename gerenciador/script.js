const API_URL = 'https://33765672-f51d-46f5-b276-32beaed4448a-00-3qd9ymtpuc1xv.worf.replit.dev';

async function fetchJogos() {
  const res = await fetch(`${API_URL}/jogos`);
  return await res.json();
}

function renderTable(jogos) {
  const tbody = document.querySelector('#jogos-table tbody');
  tbody.innerHTML = '';

  jogos.forEach(j => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${j.id}</td>
      <td>${j.time_casa} x ${j.time_fora}</td>
      <td>${new Date(j.horario).toLocaleString()}</td>
      <td><input data-id="${j.id}" data-book="bet365" value="${j.odds.bet365.casa}" /></td>
      <td><input data-id="${j.id}" data-book="betano" value="${j.odds.betano.casa}" /></td>
      <td><button data-id="${j.id}">Salvar</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => updateOdds(btn.dataset.id);
  });
}

async function updateOdds(id) {
  // Busca o jogo atual
  const jogo = await fetch(`${API_URL}/jogos/${id}`).then(res => res.json());

  const casa365 = document.querySelector(`input[data-id="${id}"][data-book="bet365"]`).value;
  const casaBetano = document.querySelector(`input[data-id="${id}"][data-book="betano"]`).value;

  // Atualiza só as odds de 'casa', mantendo o restante
  jogo.odds.bet365.casa = parseFloat(casa365);
  jogo.odds.bet365.atualizado = new Date().toISOString();

  jogo.odds.betano.casa = parseFloat(casaBetano);
  jogo.odds.betano.atualizado = new Date().toISOString();

  await fetch(`${API_URL}/jogos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ odds: jogo.odds })
  });

  alert('Odds atualizadas!');
  load();
}

async function load() {
  const jogos = await fetchJogos();
  renderTable(jogos);
}

load();
