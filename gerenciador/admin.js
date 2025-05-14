const API_URL = 'https://33765672-f51d-46f5-b276-32beaed4448a-00-3qd9ymtpuc1xv.worf.replit.dev';

// Buscar competições e popular select
async function fetchCompeticoes() {
  const res = await fetch(`${API_URL}/competicoes`);
  return res.json();
}

// Buscar jogos
async function fetchJogos() {
  const res = await fetch(`${API_URL}/jogos`);
  return res.json();
}

// Renderizar opções de competições no select
async function populateCompeticoes() {
  const select = document.getElementById('competicao');
  const comps = await fetchCompeticoes();
  comps.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });
}

// Renderizar tabela de jogos
function renderTable(jogos) {
  const tbody = document.getElementById('jogos-table');
  tbody.innerHTML = '';

  jogos.forEach(j => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${j.time_casa} x ${j.time_fora}</td>
      <td>${j.competicao}</td>
      <td><input data-id="${j.id}" data-book="bet365" data-type="casa" value="${j.odds.bet365.casa}"></td>
      <td><input data-id="${j.id}" data-book="bet365" data-type="fora" value="${j.odds.bet365.fora}"></td>
      <td><input data-id="${j.id}" data-book="betano" data-type="casa" value="${j.odds.betano.casa}"></td>
      <td><input data-id="${j.id}" data-book="betano" data-type="fora" value="${j.odds.betano.fora}"></td>
      <td><input data-id="${j.id}" data-book="betfair" data-type="casa" value="${j.odds.betfair?.casa || ''}"></td>
      <td><input data-id="${j.id}" data-book="betfair" data-type="fora" value="${j.odds.betfair?.fora || ''}"></td>
      <td>
        <button data-id="${j.id}">Salvar</button>
        <button class="delete-btn" data-id="${j.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Listeners
  tbody.querySelectorAll('button').forEach(btn => {
    if (btn.classList.contains('delete-btn')) {
      btn.onclick = () => deleteGame(btn.dataset.id);
    } else {
      btn.onclick = () => updateOdds(btn.dataset.id);
    }
  });
}

// Atualizar odds
async function updateOdds(id) {
  const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
  const odds = { bet365: {}, betano: {}, betfair: {} };

  inputs.forEach(input => {
    const { book, type } = input.dataset;
    odds[book][type] = parseFloat(input.value);
  });
  ['bet365','betano','betfair'].forEach(b => odds[b].atualizado = new Date().toISOString());

  await fetch(`${API_URL}/jogos/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ odds })
  });
  alert('Odds atualizadas!');
  load();
}

// Excluir jogo
async function deleteGame(id) {
  if (!confirm('Confirmar exclusão do jogo?')) return;
  await fetch(`${API_URL}/jogos/${id}`, { method: 'DELETE' });
  alert('Jogo excluído!');
  load();
}

// Adicionar novo jogo
document.getElementById('add-game-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const novoJogo = {
    time_casa: form.time_casa.value,
    time_fora: form.time_fora.value,
    horario: form.horario.value,
    competicao: form.competicao.value,
    odds: {
      bet365: { casa: parseFloat(form.bet365_casa.value), fora: parseFloat(form.bet365_fora.value), atualizado: new Date().toISOString() },
      betano: { casa: parseFloat(form.betano_casa.value), fora: parseFloat(form.betano_fora.value), atualizado: new Date().toISOString() },
      betfair: { casa: parseFloat(form.betfair_casa.value), fora: parseFloat(form.betfair_fora.value), atualizado: new Date().toISOString() }
    }
  };
  await fetch(`${API_URL}/jogos`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(novoJogo)
  });
  alert('Jogo adicionado!');
  form.reset();
  load();
});

// Carregar tudo
async function load() {
  await populateCompeticoes();
  const jogos = await fetchJogos();
  renderTable(jogos);
}

load();