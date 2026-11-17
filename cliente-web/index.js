const SERVICES = {
    atletas: 'http://localhost:3001/atletas',
    resultados: 'http://localhost:3002/resultados',
    rankings: 'http://localhost:3003/rankings/geral'
};

let store = {
    atletas: [],
    resultados: [],
    rankings: [],
    categoriaSelecionada: null
};

let sortConfig = {
    rankings: { col: 'tempo', dir: 'asc' },
    resultados: { col: 'tempo', dir: 'asc' },
    atletas: { col: 'id', dir: 'asc' }
};


function timeToSeconds(t) {
    if (!t || t === '--:--:--' || t === '-') return Infinity;
    const parts = String(t).split(':').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return Infinity;
}


function safeGet(obj, keys, defaultVal = '-') {
    if (!obj) return defaultVal;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }
    return defaultVal;
}

const getNome = item => safeGet(item, ['atleta_nome', 'atletaNome', 'nome', 'nome_atleta']);
const getTempo = item => safeGet(item, ['tempo_prova', 'tempoProva', 'tempo']);
const getStatus = item => safeGet(item, ['status'], 'Finalizou');

function getCatId(item) {
    const val = safeGet(item, ['categoria_id', 'categoriaId', 'categoria', 'id_categoria', 'cat_id', 'categoria_nome']);
    return val !== '-' ? val : 'Geral';
}

function getStatusBadge(status) {
    if (status === 'Finalizou') return `<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded font-medium">Finalizou</span>`;
    if (status === 'DNF') return `<span class="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2 py-0.5 rounded font-medium">DNF</span>`;
    if (status === 'DNS') return `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5 rounded font-medium">DNS</span>`;
    return `<span class="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">${status || '-'}</span>`;
}

window.toggleSort = function(table, col) {
    if (sortConfig[table].col === col) {
        sortConfig[table].dir = sortConfig[table].dir === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig[table].col = col;
        sortConfig[table].dir = 'asc';
    }
    renderAll();
};

function sortData(list, tableKey) {
    const { col, dir } = sortConfig[tableKey];
    const multiplier = dir === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
        let valA, valB;
        if (tableKey === 'rankings') {
            if (col === 'pos' || col === 'tempo') { valA = timeToSeconds(getTempo(a)); valB = timeToSeconds(getTempo(b)); }
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'cat') { valA = getCatId(a); valB = getCatId(b); }
        } else if (tableKey === 'resultados') {
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'tempo') { valA = timeToSeconds(getTempo(a)); valB = timeToSeconds(getTempo(b)); }
            if (col === 'status') { valA = getStatus(a); valB = getStatus(b); }
        } else if (tableKey === 'atletas') {
            if (col === 'id') { valA = parseInt(a.id) || 0; valB = parseInt(b.id) || 0; }
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'cat') { valA = getCatId(a); valB = getCatId(b); }
        }

        if (valA < valB) return -1 * multiplier;
        if (valA > valB) return 1 * multiplier;
        return 0;
    });
}

function renderRankings() {
    const data = sortData(store.rankings, 'rankings');
    const container = document.getElementById('rankings');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum ranking disponível.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'pos')">Pos ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'nome')">Atleta ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'tempo')">Tempo ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('rankings', 'cat')">Cat ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map((r, i) => {
                    const posGeral = i + 1;
                    let posStyle = "text-slate-400";
                    if (posGeral === 1) posStyle = "text-amber-400 font-bold";
                    else if (posGeral === 2) posStyle = "text-slate-300 font-bold";
                    else if (posGeral === 3) posStyle = "text-amber-600 font-bold";

                    return `
                        <tr class="hover:bg-slate-700/30 transition-colors">
                            <td class="p-2 font-mono ${posStyle}">#${posGeral}</td>
                            <td class="p-2 font-medium text-slate-200">${getNome(r)}</td>
                            <td class="p-2 font-mono text-slate-300 text-xs">${getTempo(r)}</td>
                            <td class="p-2 text-right text-xs text-slate-400">Cat #${getCatId(r)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderResultados() {
    const data = sortData(store.resultados, 'resultados');
    const container = document.getElementById('resultados');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum resultado disponível.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('resultados', 'nome')">Atleta ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('resultados', 'tempo')">Tempo ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('resultados', 'status')">Status ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map(res => `
                    <tr class="hover:bg-slate-700/30 transition-colors">
                        <td class="p-2 font-medium text-slate-200">${getNome(res)}</td>
                        <td class="p-2 font-mono text-slate-300 text-xs">${getTempo(res)}</td>
                        <td class="p-2 text-right">${getStatusBadge(getStatus(res))}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAtletas() {
    const data = sortData(store.atletas, 'atletas');
    const container = document.getElementById('atletas');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum atleta cadastrado.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('atletas', 'id')">ID ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('atletas', 'nome')">Nome ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('atletas', 'cat')">Cat ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map(a => `
                    <tr class="hover:bg-slate-700/30 transition-colors">
                        <td class="p-2 font-mono text-slate-500 text-xs">#${a.id}</td>
                        <td class="p-2 font-medium text-slate-200">${getNome(a)}</td>
                        <td class="p-2 text-right">
                            <span class="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">Cat #${getCatId(a)}</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderRankingPorCategoria() {
    const select = document.getElementById('select-categoria');
    const container = document.getElementById('ranking-categoria-container');


    const categoriasSet = new Set();
    store.atletas.forEach(a => {
        const cat = String(getCatId(a));
        if(cat !== 'Geral' && cat !== '-') categoriasSet.add(cat);
    });
    store.rankings.forEach(r => {
        const cat = String(getCatId(r));
        if(cat !== 'Geral' && cat !== '-') categoriasSet.add(cat);
    });
    const categorias = Array.from(categoriasSet).sort((a,b) => (parseInt(a)||0) - (parseInt(b)||0));


    document.getElementById('kpi-categorias').innerText = categorias.length;

    if (categorias.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-4">Nenhuma categoria encontrada.</p>';
        return;
    }

    if (!store.categoriaSelecionada || !categorias.includes(store.categoriaSelecionada)) {
        store.categoriaSelecionada = categorias[0];
    }

    select.innerHTML = categorias.map(c => `
        <option value="${c}" ${c === store.categoriaSelecionada ? 'selected' : ''}>Categoria #${c}</option>
    `).join('');

    let filtrados = store.rankings.filter(r => String(getCatId(r)) === store.categoriaSelecionada);

    if (filtrados.length === 0) {
        const atletasCat = store.atletas.filter(a => String(getCatId(a)) === store.categoriaSelecionada);
        filtrados = atletasCat.map(a => {
            const res = store.resultados.find(r => getNome(r) === getNome(a) || r.atleta_id == a.id);
            return {
                ...a,
                tempo_prova: res ? getTempo(res) : '--:--:--',
                status: res ? getStatus(res) : 'Inscrito'
            };
        });
    }


    filtrados.sort((a, b) => {
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        if (statusA !== 'Finalizou' && statusB === 'Finalizou') return 1;
        if (statusA === 'Finalizou' && statusB !== 'Finalizou') return -1;
        return timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b));
    });

    const geralOrdenado = [...store.rankings].sort((a,b) => timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b)));

    if (filtrados.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Sem atletas registrados nesta categoria.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                    <th class="p-3">Pos. na Categoria</th>
                    <th class="p-3">Atleta</th>
                    <th class="p-3">Tempo</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-right">Pos. Geral</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${filtrados.map((item, idx) => {
                    const posCat = idx + 1;
                    const posGeralIndex = geralOrdenado.findIndex(g => getNome(g) === getNome(item));
                    const posGeral = posGeralIndex !== -1 ? posGeralIndex + 1 : '-';

                    let badgeColor = "bg-slate-700 text-slate-300";
                    if (posCat === 1) badgeColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold";
                    else if (posCat === 2) badgeColor = "bg-slate-400/20 text-slate-200 border border-slate-400/30 font-bold";
                    else if (posCat === 3) badgeColor = "bg-amber-700/20 text-amber-500 border border-amber-700/30 font-bold";

                    return `
                        <tr class="hover:bg-slate-700/30 transition-colors">
                            <td class="p-3">
                                <span class="px-2.5 py-1 rounded text-xs ${badgeColor}">
                                    ${posCat}º Lugar
                                </span>
                            </td>
                            <td class="p-3 font-semibold text-slate-100">${getNome(item)}</td>
                            <td class="p-3 font-mono text-xs text-slate-300">${getTempo(item)}</td>
                            <td class="p-3">${getStatusBadge(getStatus(item))}</td>
                            <td class="p-3 text-right font-mono text-slate-400 text-xs">${posGeral !== '-' ? `#${posGeral}` : '-'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

window.onSelectCategoriaChange = function(catId) {
    store.categoriaSelecionada = catId;
    renderRankingPorCategoria();
};

function updateKPIs() {
    document.getElementById('kpi-atletas').innerText = store.atletas.length;

    if (store.resultados && store.resultados.length > 0) {
        const finalizados = store.resultados.filter(r => getStatus(r) === 'Finalizou').length;
        const pct = Math.round((finalizados / store.resultados.length) * 100);
        document.getElementById('kpi-conclusao').innerText = `${pct}%`;
    } else {
        document.getElementById('kpi-conclusao').innerText = '--%';
    }

    const temRankingGeral = store.rankings && store.rankings.length > 0;

    if (temRankingGeral) {
        const rankingOrdenado = [...store.rankings].sort((a,b) => timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b)));
        const lider = rankingOrdenado[0];

        if (lider && getTempo(lider) !== '--:--:--') {
            document.getElementById('kpi-lider').innerText = getNome(lider);
            document.getElementById('kpi-lider-tempo').innerText = getTempo(lider);
        } else {
            document.getElementById('kpi-lider').innerText = '--';
            document.getElementById('kpi-lider-tempo').innerText = '--:--:--';
        }
    } else {
        document.getElementById('kpi-lider').innerText = 'Indisponível';
        document.getElementById('kpi-lider-tempo').innerText = '--:--:--';
    }
}

function renderAll() {
    renderRankingPorCategoria();
    updateKPIs();
    renderRankings();
    renderResultados();
    renderAtletas();
}

async function fetchAll() {
    try {
        const [resAtletas, resResultados, resRankings] = await Promise.all([
            fetch(SERVICES.atletas).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(SERVICES.resultados).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(SERVICES.rankings).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        store.atletas = Array.isArray(resAtletas) ? resAtletas : [];
        store.resultados = Array.isArray(resResultados) ? resResultados : [];
        store.rankings = Array.isArray(resRankings) ? resRankings : [];

        renderAll();
    } catch (err) {
        console.error("Erro na atualização dos dados:", err);
    }
}

setInterval(fetchAll, 5000);
fetchAll();

// =====================================================================
// Chat com o Comissário Técnico Virtual (MTBExpert)
// =====================================================================
const EXPERT_API = 'http://localhost:3005/api/chat';
let chatHistory = [];

let isChatExpanded = false;

window.toggleExpandChat = function() {
    const win = document.getElementById('chat-window');
    const icon = document.getElementById('chat-expand-icon');
    isChatExpanded = !isChatExpanded;

    if (isChatExpanded) {
        win.classList.remove('w-96', 'sm:w-[440px]', 'h-[580px]');
        win.classList.add('w-[92vw]', 'sm:w-[680px]', 'lg:w-[840px]', 'h-[85vh]', 'max-h-[850px]');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0h4m-4 0v4m11 0V4m0 0h-4m4 0l-5 5M9 15l-5 5m0 0h4m-4 0v-4m11 0v4m0 0h-4m4 0l-5-5"></path>`;
    } else {
        win.classList.remove('w-[92vw]', 'sm:w-[680px]', 'lg:w-[840px]', 'h-[85vh]', 'max-h-[850px]');
        win.classList.add('w-96', 'sm:w-[440px]', 'h-[580px]');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>`;
    }
};

window.toggleChat = function() {
    const win = document.getElementById('chat-window');
    win.classList.toggle('hidden');
    if (!win.classList.contains('hidden')) {
        document.getElementById('chat-input').focus();
    }
};

window.sendQuickPrompt = function(texto) {
    const input = document.getElementById('chat-input');
    input.value = texto;
    document.getElementById('chat-form').dispatchEvent(new Event('submit'));
};

window.handleChatSubmit = async function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    const messagesContainer = document.getElementById('chat-messages');

    // Mensagem do usuário
    messagesContainer.innerHTML += `
        <div class="flex justify-end gap-2">
            <div class="bg-emerald-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] leading-relaxed shadow-sm">
                ${escapeHtml(msg)}
            </div>
        </div>
    `;

    // Indicador de Carregamento
    const loadingId = 'loading-' + Date.now();
    messagesContainer.innerHTML += `
        <div id="${loadingId}" class="flex gap-2.5 items-center text-slate-400 text-xs py-1">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">AI</div>
            <div class="flex gap-1 items-center bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0.3s"></span>
                <span class="ml-1 text-[11px] text-slate-300">Consultando regulamento e dados...</span>
            </div>
        </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const res = await fetch(EXPERT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, history: chatHistory })
        });

        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        if (!res.ok) {
            throw new Error(`Status ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const respostaTexto = data.reply || data.resposta || 'Sem resposta do especialista.';

        // Badge de Origem
        let badgeHtml = '';
        if (data.origem === 'cache_semantico') {
            const score = data.score_similaridade ? ` (${(data.score_similaridade * 100).toFixed(0)}% similar)` : '';
            badgeHtml = `<span class="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">⚡ Cache Semântico${score}</span>`;
        } else if (data.origem === 'guardrail_bloqueio') {
            badgeHtml = `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">🛡️ Guardrail de Escopo</span>`;
        } else {
            badgeHtml = `<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">🤖 LLM Especialista</span>`;
        }

        let toolsHtml = '';
        if (data.ferramentas_executadas && data.ferramentas_executadas.length > 0) {
            toolsHtml = `<div class="mt-1.5 flex flex-wrap gap-1 text-[10px] text-slate-400">
                <span class="text-slate-500 font-medium">Tools MCP:</span>
                ${data.ferramentas_executadas.map(t => `<span class="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-emerald-400">${t}</span>`).join('')}
            </div>`;
        }

        let cacheGravadoHtml = '';
        if (data.cache_gravado) {
            cacheGravadoHtml = `<div class="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-300/90 font-medium">
                <span class="inline-flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                    💾 Resposta gravada no cache semântico
                </span>
            </div>`;
        }

        messagesContainer.innerHTML += `
            <div class="flex gap-2.5">
                <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 font-bold border border-emerald-500/30">AI</div>
                <div class="bg-slate-700/70 border border-slate-600/60 rounded-2xl rounded-tl-sm p-3 text-slate-200 max-w-[85%] leading-relaxed shadow-sm">
                    <div class="mb-1.5 flex items-center gap-2">
                        ${badgeHtml}
                        ${data.latencia_ms ? `<span class="text-[10px] text-slate-400">${data.latencia_ms}ms</span>` : ''}
                    </div>
                    <div class="text-slate-200">
                        ${formatMarkdown(respostaTexto)}
                    </div>
                    ${toolsHtml}
                    ${cacheGravadoHtml}
                </div>
            </div>
        `;

        chatHistory.push({ role: 'user', text: msg });
        chatHistory.push({ role: 'model', text: respostaTexto });
        if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

    } catch (err) {
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        messagesContainer.innerHTML += `
            <div class="flex gap-2.5">
                <div class="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs shrink-0 font-bold border border-rose-500/30">!</div>
                <div class="bg-rose-950/40 border border-rose-800/60 rounded-2xl rounded-tl-sm p-3 text-rose-200 max-w-[85%] text-xs">
                    Falha ao conectar com o serviço do especialista (${err.message}). Certifique-se de que o container <code>expert-system</code> está ativo na porta 3005.
                </div>
            </div>
        `;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 font-mono text-[11px]">$1</code>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}
