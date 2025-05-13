const API_URL = 'https://33765672-f51d-46f5-b276-32beaed4448a-00-3qd9ymtpuc1xv.worf.replit.dev';

async function fetchJogos() {
  const res = await fetch(`${API_URL}/jogos`);
  return await res.json();
}

function renderTable(jogos) {
  const tbody = document.getElementById('jogos-table');
  tbody.innerHTML = '';

  jogos.forEach(j => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${j.time_casa} x ${j.time_fora}</td>
      <td><input data-id="${j.id}" data-book="bet365" data-type="casa" value="${j.odds.bet365.casa}"></td>
      <td><input data-id="${j.id}" data-book="bet365" data-type="fora" value="${j.odds.bet365.fora}"></td>
      <td><input data-id="${j.id}" data-book="betano" data-type="casa" value="${j.odds.betano.casa}"></td>
      <td><input data-id="${j.id}" data-book="betano" data-type="fora" value="${j.odds.betano.fora}"></td>
      <td><input data-id="${j.id}" data-book="betfair" data-type="casa" value="${j.odds.betfair?.casa ?? '-'}"></td>
      <td><input data-id="${j.id}" data-book="betfair" data-type="fora" value="${j.odds.betfair?.fora ?? '-'}"></td>
      <td><button data-id="${j.id}">Salvar</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => updateOdds(btn.dataset.id);
  });
}

async function updateOdds(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  const odds = { bet365: {}, betano: {}, betfair: {} };

  inputs.forEach(input => {
    const book = input.dataset.book;
    const type = input.dataset.type;
    odds[book][type] = parseFloat(input.value);
  });

  ['bet365', 'betano', 'betfair'].forEach(book => {
    odds[book].atualizado = new Date().toISOString();
  });

  await fetch(`${API_URL}/jogos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ odds })
  });

  alert('Odds atualizadas com sucesso!');
  load();
}

async function load() {
  const jogos = await fetchJogos();
  renderTable(jogos);
}

load();
