// --- VARIABLES GLOBALES ---
let agents = [], maps = [], skins = [];
let myAgent = null, mode = '', gameOver = false, isPicking = false;
let qCount = 0, fCount = 0;
let miniAns = '', miniAnsAlt = '', miniMode = '';
let miniStreak = 0, miniTimer = null, timeLeft = 15;
let wordleWord = '', wordleGuesses = [], wordleCurrent = '', wordleOver = false, wordleStreak = 0;
let discardModeAsk = false; // Modo descarte para "Adivina el Agente"

const agentExtra = {
    "Jett": { c: "Corea del Sur", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Raze": { c: "Brasil", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Breach": { c: "Suecia", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "No", reveal: "No" },
    "Omen": { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Brimstone": { c: "Estados Unidos", g: "Masculino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Phoenix": { c: "Reino Unido", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Sage": { c: "China", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "Sova": { c: "Rusia", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Viper": { c: "Estados Unidos", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" },
    "Cypher": { c: "Marruecos", g: "Masculino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "Sí" },
    "Reyna": { c: "México", g: "Femenino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Killjoy": { c: "Alemania", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Skye": { c: "Australia", g: "Femenino", flash: "Sí", stunt: "Sí", humo: "No", slow: "No", reveal: "Sí" },
    "Yoru": { c: "Japón", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "Sí" },
    "Astra": { c: "Ghana", g: "Femenino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "No" },
    "Chamber": { c: "Francia", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "Sí" },
    "Neon": { c: "Filipinas", g: "Femenino", flash: "No", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Fade": { c: "Turquía", g: "Femenino", flash: "Sí", stunt: "No", humo: "No", slow: "Sí", reveal: "Sí" },
    "Harbor": { c: "India", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Gekko": { c: "Estados Unidos", g: "Masculino", flash: "Sí", stunt: "Sí", humo: "No", slow: "Sí", reveal: "No" },
    "Deadlock": { c: "Noruega", g: "Femenino", flash: "No", stunt: "Sí", humo: "Sí", slow: "Sí", reveal: "No" },
    "Tejo" : { c: "Colombia", g: "Masculino", flash: "No", stunt: "Sí", humo: "No", slow: "No", reveal: "Sí" },
    "Veto": { c: "Senegal", g: "Masculino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "Miks" : { c: "Croacia", g: "Masculino", flash: "No", stunt: "Sí", humo: "Sí", slow: "No", reveal: "No" },
    "Waylay" : { c: "Tailandia", g: "Femenino", flash: "No", stunt: "No", humo: "No", slow: "Sí", reveal: "No" },
    "KAY/O" : { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "Sí" },
    "Iso" : { c: "China", g: "Masculino", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Vyse" : { c: "Desconocido", g: "No Humano", flash: "Sí", stunt: "No", humo: "No", slow: "No", reveal: "No" },
    "Clove" : { c: "Escocia", g: "Femenino", flash: "No", stunt: "No", humo: "Sí", slow: "No", reveal: "No" }
};

// --- Manejo de la historia y flechas de navegación ---
window.addEventListener('popstate', (e) => {
    if (document.getElementById('main-menu').style.display === 'none') {
        backToMenu(true);
    }
});

// --- INICIALIZACIÓN ---
async function init() {
    try {
        const [rA, rM, rS] = await Promise.all([
            fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=es-ES'),
            fetch('https://valorant-api.com/v1/maps?language=es-ES'),
            fetch('https://valorant-api.com/v1/weapons/skins?language=es-ES')
        ]);
        agents = (await rA.json()).data;
        maps = (await rM.json()).data.filter(m => m.displayIcon && m.displayName !== "District" && m.displayName !== "Kasbah" && m.displayName !== "Piazza" && m.displayName !== "Drift" && m.displayName !== "Glitch");
        skins = (await rS.json()).data.filter(s => s.displayIcon && !s.displayName.includes("Standard"));
        
        document.getElementById('menu-grid').innerHTML = `
            <div class="mode-card" onclick="startGame('classic')">
                <h2>Modo Clásico</h2>
                <p>Juega al ¿quién es quién? con un amigo.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startGame('ask')">
                <h2>Adivina el Agente</h2>
                <p>Adivina el agente secreto mediante preguntas de atributos.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('agente')">
                <h2>¿Quién es?</h2>
                <p>Lee la descripción y adivina de qué agente se trata.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('habilidad')">
                <h2>Habilidades</h2>
                <p>Mira el ícono de la habilidad y adivina de qué agente es.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('arma')">
                <h2>Armas</h2>
                <p>Adivina el arma basándote en su precio y capacidad de balas.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('mapa')">
                <h2>Mapas</h2>
                <p>Identifica el mapa de Valorant solo por su radar.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('skin')">
                <h2>Skins</h2>
                <p>¿Eres un experto en la tienda? Adivina el nombre de la skin.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startMini('trivia')">
                <h2>Trivia</h2>
                <p>Preguntas sobre lore, nombres reales y mecánicas del juego.</p>
                <button class="btn">JUGAR</button>
            </div>
            <div class="mode-card" onclick="startWordle()">
                <h2>Wordle</h2>
                <p>Adivina el nombre del agente letra a letra. ¡Tenés 5 intentos!</p>
                <button class="btn">JUGAR</button>
            </div>
        `;
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('menu-grid').style.display = 'grid';
    } catch (e) { console.error(e); }
}

// --- LÓGICA MODOS PRINCIPALES ---
function startGame(m) {
    history.pushState({inGame: true}, '');
    mode = m;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-interface').style.display = 'block';
    document.getElementById('display-mode').textContent = m === 'classic' ? 'MODO CLÁSICO' : 'ADIVINA EL AGENTE';
    document.getElementById('panel-title').textContent = "Agente Secreto";
    resetGame();
}

function resetGame() {
    gameOver = false; isPicking = false; qCount = 0; fCount = 0; discardModeAsk = false;
    myAgent = (mode === 'ask') ? agents[Math.floor(Math.random() * agents.length)] : null;
    
    document.getElementById('stat-q').textContent = "0";
    document.getElementById('stat-f').textContent = "0";
    
    const askContainer = document.getElementById('ask-interface-container');
    askContainer.style.display = (mode === 'ask') ? 'block' : 'none';
    
    document.getElementById('ask-controls').style.display = 'block';
    const btnDiscard = document.getElementById('btn-discard');
    if(btnDiscard) {
        btnDiscard.textContent = "Modo Descarte: DESACTIVADO";
        btnDiscard.style.background = "transparent";
        btnDiscard.style.color = "#ff4655";
    }
    
    document.getElementById('classic-pick-zone').style.display = (mode === 'classic') ? 'block' : 'none';
    document.getElementById('game-message').style.display = 'none';
    document.getElementById('game-message').className = '';
    document.getElementById('reset-zone').style.display = (mode === 'classic' || mode === 'ask') ? 'block' : 'none';
    document.getElementById('q-mark').style.display = 'block';
    document.getElementById('secret-img').style.display = 'none';
    document.getElementById('secret-name').textContent = "???";
    document.getElementById('history-list').innerHTML = '';
    
    updateValOptions();
    renderBoard();
}

function toggleDiscardMode() {
    discardModeAsk = !discardModeAsk;
    const btn = document.getElementById('btn-discard');
    btn.textContent = `Modo Descarte: ${discardModeAsk ? 'ACTIVADO' : 'DESACTIVADO'}`;
    btn.style.background = discardModeAsk ? '#ff4655' : 'transparent';
    btn.style.color = discardModeAsk ? 'white' : '#ff4655';
}

function renderBoard() {
    const b = document.getElementById('board');
    b.innerHTML = '';
    agents.forEach(a => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.innerHTML = `<img src="${a.displayIcon}" width="100%"><br>${a.displayName}`;
        card.onclick = () => {
            if (isPicking) {
                myAgent = a; isPicking = false;
                document.getElementById('secret-img').src = a.displayIcon;
                document.getElementById('secret-img').style.display = 'block';
                document.getElementById('q-mark').style.display = 'none';
                document.getElementById('secret-name').textContent = a.displayName;
                const msg = document.getElementById('game-message');
                msg.textContent = "Agente seleccionado";
                msg.className = 'msg-info';
                msg.style.display = 'block';
            } else if (!gameOver) {
                if (mode === 'classic') card.classList.toggle('discarded'); 
                else if (mode === 'ask') handleGuess(a, card);
            }
        };
        b.appendChild(card);
    });
}

function handleGuess(a, card) {
    if (mode === 'ask' && discardModeAsk) {
        card.classList.toggle('discarded');
        return;
    }

    if (a.displayName === myAgent.displayName) { showEnd(true); } 
    else {
        card.classList.add('discarded');
        fCount++;
        document.getElementById('stat-f').textContent = fCount;
        if (fCount >= 3) showEnd(false);
    }
}

function askQuestion() {
    if (qCount >= 10 || gameOver) return;
    qCount++;
    document.getElementById('stat-q').textContent = qCount;
    const cat = document.getElementById('cat-sel').value;
    const val = document.getElementById('val-sel').value;
    let result = false;

    if (cat === 'role') result = myAgent.role.displayName === val;
    else if (cat === 'country') result = agentExtra[myAgent.displayName]?.c === val;
    else if (cat === 'gender') result = agentExtra[myAgent.displayName]?.g === val;
    else if (cat === 'flash') result = agentExtra[myAgent.displayName]?.flash === val;
    else if (cat === 'stunt') result = agentExtra[myAgent.displayName]?.stunt === val;
    else if (cat === 'humo') result = agentExtra[myAgent.displayName]?.humo === val;
    else if (cat === 'slow') result = agentExtra[myAgent.displayName]?.slow === val;
    else if (cat === 'reveal') result = agentExtra[myAgent.displayName]?.reveal === val;

    const history = document.getElementById('history-list');
    const row = document.createElement('div');
    row.className = 'history-row';
    const label = document.getElementById('cat-sel').options[document.getElementById('cat-sel').selectedIndex].text.replace('...', '');
    row.innerHTML = `<span>${label} ${val}</span><span class="${result ? 'res-si' : 'res-no'}">${result ? 'SÍ' : 'NO'}</span>`;
    history.prepend(row);

    if (qCount >= 10 && !gameOver) {
        const msg = document.getElementById('game-message');
        msg.textContent = "Sin preguntas. ¡Arriesga!";
        msg.className = 'msg-info';
        msg.style.display = 'block';
    }
}

function showEnd(win) {
    gameOver = true;
    const msg = document.getElementById('game-message');
    msg.textContent = win ? "¡GANASTE!" : `PERDISTE. Era ${myAgent.displayName}`;
    msg.className = win ? 'msg-win' : 'msg-lose';
    msg.style.display = 'block';
    document.getElementById('secret-img').src = myAgent.displayIcon;
    document.getElementById('secret-img').style.display = 'block';
    document.getElementById('q-mark').style.display = 'none';
    document.getElementById('secret-name').textContent = myAgent.displayName;
    document.getElementById('reset-zone').style.display = 'block';
    if(mode === 'ask') document.getElementById('ask-controls').style.display = 'none';
}

function startPicking() { 
    isPicking = true;
    const msg = document.getElementById('game-message');
    msg.textContent = "Haz clic en un agente del tablero...";
    msg.className = 'msg-info';
    msg.style.display = 'block';
}

function updateValOptions() {
    const cat = document.getElementById('cat-sel').value;
    const sel = document.getElementById('val-sel');
    sel.innerHTML = '';
    let list = [];
    if (cat === 'role') list = [...new Set(agents.map(a => a.role.displayName))];
    else if (cat === 'country') list = [...new Set(Object.values(agentExtra).map(e => e.c))].sort();
    else if (cat === 'gender') list = [...new Set(Object.values(agentExtra).map(e => e.g))].sort();
    else if (cat === 'flash') list = [...new Set(Object.values(agentExtra).map(e => e.flash))].sort();
    else if (cat === 'stunt') list = [...new Set(Object.values(agentExtra).map(e => e.stunt))].sort();
    else if (cat === 'humo') list = [...new Set(Object.values(agentExtra).map(e => e.humo))].sort();
    else if (cat === 'slow') list = [...new Set(Object.values(agentExtra).map(e => e.slow))].sort();
    else if (cat === 'reveal') list = [...new Set(Object.values(agentExtra).map(e => e.reveal))].sort();
    list.forEach(item => { const o = document.createElement('option'); o.value = item; o.textContent = item; sel.appendChild(o); });
}

// --- LÓGICA MINIJUEGOS ---
function startMini(m) {
    history.pushState({inGame: true}, '');
    miniMode = m;
    miniStreak = 0;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'block';
    document.getElementById('mini-title-display').textContent = m.toUpperCase();
    document.getElementById('mini-streak-display').textContent = '0';
    loadMiniRound();
}

function loadMiniRound() {
    clearInterval(miniTimer);
    timeLeft = 15;
    document.getElementById('mini-timer-display').textContent = timeLeft;
    miniTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('mini-timer-display').textContent = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(miniTimer);
            showMiniResult(false, miniAns);
        }
    }, 1000);

    document.getElementById('mini-msg').style.display = 'none';
    document.getElementById('mini-msg').className = '';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('mini-input').value = '';
    document.getElementById('mini-input-zone').style.display = 'none';
    document.getElementById('mini-options').style.display = 'none';
    document.getElementById('mini-img').style.display = 'none';
    document.getElementById('mini-img').src = '';
    miniAnsAlt = '';
    
    if (miniMode === 'agente') {
        const a = agents[Math.floor(Math.random() * agents.length)];
        miniAns = a.displayName.toLowerCase();
        let desc = a.description.replace(new RegExp(a.displayName, 'gi'), "Este agente");
        document.getElementById('mini-clue').innerHTML = `<b>ROL:</b> ${a.role.displayName}<br><br><i>"${desc}"</i>`;
        document.getElementById('mini-input-zone').style.display = 'block';
    }
    else if (miniMode === 'habilidad') {
        const a = agents[Math.floor(Math.random() * agents.length)];
        const abilitiesWithIcon = a.abilities.filter(ab => ab.displayIcon);
        const ab = abilitiesWithIcon.length > 0
            ? abilitiesWithIcon[Math.floor(Math.random() * abilitiesWithIcon.length)]
            : a.abilities[Math.floor(Math.random() * a.abilities.length)];
        miniAns = a.displayName.toLowerCase();
        if (ab.displayIcon) {
            document.getElementById('mini-img').src = ab.displayIcon;
            document.getElementById('mini-img').style.display = 'block';
        }
        document.getElementById('mini-clue').innerHTML = `<b>¿A qué agente pertenece esta habilidad?</b>`;
        document.getElementById('mini-input-zone').style.display = 'block';
    }
    else if (miniMode === 'mapa') {
        const m = maps[Math.floor(Math.random() * maps.length)];
        miniAns = m.displayName.toLowerCase();
        document.getElementById('mini-img').src = m.displayIcon;
        document.getElementById('mini-img').style.display = 'block';
        document.getElementById('mini-clue').textContent = "¿Qué mapa es?";
        renderMiniOptions(maps.map(x => x.displayName), m.displayName);
    }
    else if (miniMode === 'arma') {
        const w =   [
                    {n: "Classic", p: "0", c: "12"}, {n: "Shorty", p: "300", c: "2"}, {n: "Frenzy", p: "450", c: "15"},{n: "Ghost", p: "500", c: "13"}, {n: "Bandit", p: "600", c: "8"}, {n: "Sheriff", p: "800", c: "6"},
                    {n: "Bucky", p: "850", c: "5"}, {n: "Judge", p: "1850", c: "5"},
                    {n: "Vandal", p: "2900", c: "25"}, {n: "Phantom", p: "2900", c: "30"},
                    {n: "Operator", p: "4700", c: "5"}, {n: "Marshal", p: "950", c: "5"}, {n: "Outlaw", p: "2400", c: "2"},
                    {n: "Guardian", p: "2250", c: "12"},{n: "Bulldog", p: "2050", c: "24"},
                    {n: "Stinger", p: "1100", c: "20"}, {n: "Spectre", p: "1600", c: "30"},
                    {n: "Odin", p: "3200", c: "100"}, {n: "Ares", p: "1600", c: "50"}];
        const pick = w[Math.floor(Math.random() * w.length)];
        miniAns = pick.n.toLowerCase();
        document.getElementById('mini-clue').innerHTML = `Precio: <b>${pick.p}</b><br>Cargador: <b>${pick.c} balas</b>`;
        renderMiniOptions(w.map(x => x.n), pick.n);
    }
    else if (miniMode === 'skin') {
        const s = skins[Math.floor(Math.random() * skins.length)];
        const weapons = ["Vandal","Phantom","Operator","Guardian","Bulldog","Classic","Ghost","Sheriff","Stinger","Shorty","Odin","Ares","Spectre","Bucky","Judge","Frenzy","Marshal","Outlaw","Knife","Melee"];
        let skinName = s.displayName;
        for (const w of weapons) {
            if (skinName.startsWith(w + " ")) {
                skinName = skinName.slice(w.length + 1);
                break;
            }
        }
        miniAns = skinName.toLowerCase();
        miniAnsAlt = s.displayName.toLowerCase();
        document.getElementById('mini-img').src = s.displayIcon;
        document.getElementById('mini-img').style.display = 'block';
        document.getElementById('mini-clue').textContent = "¿Nombre de la Skin?";
        document.getElementById('mini-input-zone').style.display = 'block';
    }
    else if (miniMode === 'trivia') {
        const t = [{q: "¿Cual es el nombre real de Viper?", "a": "sabine callas"},{q: "¿De que pais es originario Phoenix?", "a": "reino unido"},{"q": "¿Cual es la identidad legal de Jett?", "a": "han sunwoo"},{"q": "¿Que agente era cocinera antes de unirse al Protocolo?", "a": "jett"},{"q": "¿Cual es el nombre real de Sova?", "a": "sasha novikov"},{"q": "¿De donde proviene Sage?", "a": "china"},{"q": "¿Cual es el nombre real de Sage?", "a": "wei ling ying"},{"q": "¿Que agente es de origen marroqui y se llama Aamir?", "a": "cypher"},{"q": "¿Cual es el nombre real de Raze?", "a": "tayane alves"},{"q": "¿De que ciudad de Brasil es Raze?", "a": "salvador"},{"q": "¿Que agente fue bombero en Boston?", "a": "brimstone"},{"q": "¿Cual es el nombre real de Breach?", "a": "erik torsten"},{"q": "¿Que agente es de Australia y se llama Kirra Foster?", "a": "skye"},{"q": "¿Cual es el nombre real de Chamber?", "a": "vincent fabron"},{"q": "¿De que pais es originario Chamber?", "a": "francia"},{"q": "¿Que agente se llama Efia Danso y es de Ghana?", "a": "astra"},{"q": "¿Cual es la identidad real de Reyna?", "a": "zyanya mondragon"},{"q": "¿Que agente es de Filipinas y se llama Tala Valdez?", "a": "neon"},{"q": "¿Cual es el nombre real de Iso?", "a": "li zhao yu"},{"q": "¿De que pais proviene Harbor?", "a": "india"},{"q": "¿Que agente es un robot de una Tierra alternativa?", "a": "kay/o"},{"q": "¿Cual es el nombre real de Gekko?", "a": "mateo armendariz"},{"q": "¿De que ciudad de EE. UU. es Gekko?", "a": "los angeles"},{"q": "¿Que agente es de Noruega y se llama Iselin?", "a": "deadlock"},{"q": "¿Cual es el pais de origen de Clove?", "a": "escocia"},{"q": "¿Que agente es el lider oficial del Protocolo?", "a": "brimstone"},{"q": "¿Como se llama la organizacion enemiga de la Tierra Omega?", "a": "legion valorant"},{"q": "¿Que agente utiliza criaturas llamadas Dizzy y Wingman?", "a": "gekko"},{"q": "¿De que pais es originario Yoru?", "a": "japon"},{"q": "¿Que agente proviene de Estambul, Turquia?", "a": "fade"},{"q": "¿Que agente utiliza nanobots alemanes?", "a": "killjoy"},{"q": "¿Que numero de agente tiene asignado Killjoy?", "a": "04"},{"q": "¿Que agente es el numero 01?", "a": "brimstone"},{"q": "¿Cual es el numero de agente de Viper?", "a": "02"},{"q": "¿Que tipo de habilidad es gratuita cada ronda?", "a": "habilidad firma"},{"q": "¿Cuantos puntos de definitiva otorga un orbe?", "a": "1"},{"q": "¿Que agente puede revivir a un aliado?", "a": "sage"},{"q": "¿Como se llama la definitiva de Sova?", "a": "furia del cazador"},{"q": "¿Cuanto daño hace un disparo de la ulti de Sova?", "a": "80"},{"q": "¿Cual es la habilidad firma de Jett?", "a": "viento de cola"},{"q": "¿Que agente puede colocar una torreta automatica?", "a": "killjoy"},{"q": "¿Como se llama la definitiva de Killjoy?", "a": "bloqueo"},{"q": "¿Que agente puede suprimir habilidades enemigas?", "a": "kay/o"},{"q": "¿Como se llama el robot de Raze que explota?", "a": "boombot"},{"q": "¿Que agente tiene la definitiva Duelo de Honor 1v1?", "a": "iso"},{"q": "¿Cuanto tarda la Spike en detonar?", "a": "45 segundos"},{"q": "¿Cuanto se tarda en desactivar la Spike completa?", "a": "7 segundos"},{"q": "¿Cuanto tarda la Spike en plantarse?", "a": "4 segundos"},{"q": "¿Cuanto cuesta el rifle Vandal?", "a": "2900"},{"q": "¿Cual es el daño a la cabeza de la Vandal?", "a": "160"},{"q": "¿Cuanto cuesta la Phantom?", "a": "2900"},{"q": "¿Cual es el arma mas cara del juego?", "a": "operator"},{"q": "¿Cuanto daño hace el Operator al cuerpo?", "a": "150"},{"q": "¿Que arma secundaria es gratuita cada ronda?", "a": "classic"},{"q": "¿Cuanto cuesta el revolver Sheriff?", "a": "800"},{"q": "¿Cual es el precio de la Ghost?", "a": "500"},{"q": "¿Cual es el subfusil mas barato?", "a": "stinger"},{"q": "¿Que rifle tiene zoom de 1.5x?", "a": "guardian"},{"q": "¿Cuanto cuesta la Odin?", "a": "3200"},{"q": "¿Que secundaria es una escopeta de 2 disparos?", "a": "shorty"},{"q": "¿Cuanto daño hace un cuchillazo por la espalda?", "a": "150"},{"q": "¿Cual es el limite maximo de creditos?", "a": "9000"},{"q": "¿Cuantos creditos tenes al inicio de cada mitad?", "a": "800"},{"q": "¿Que mapa tiene tres sitios de bomba?", "a": "haven"},{"q": "¿Donde se encuentra el mapa Ascent?", "a": "venecia"},{"q": "¿Que mapa tiene teletransportadores ruidosos?", "a": "bind"},{"q": "¿Donde esta ubicado Icebox?", "a": "rusia"},{"q": "¿Que mapa tiene diseño en H?", "a": "fracture"},{"q": "¿En que pais esta Split?", "a": "japon"},{"q": "¿Que mapa tiene puertas giratorias?", "a": "lotus"},{"q": "¿Donde se encuentra el mapa Pearl?", "a": "lisboa"},{"q": "¿Cual es la fuente de energia poderosa del juego?", "a": "radianita"},{"q": "¿Que equipo brasilero gano el mundial 2022?", "a": "loud"},
            {"q": "¿Cuantas rondas se necesitan para ganar una partida normal?", "a": "13"},{"q": "¿Cuantos jugadores hay en cada equipo?", "a": "5"},{"q": "¿Como se llama la moneda del juego?", "a": "creditos"},{"q": "¿Cual es la vida base de todos los agentes?", "a": "100"},{"q": "¿Cuanta vida da el escudo pesado?", "a": "50"},{"q": "¿Cuanto cuesta el escudo pesado?", "a": "1000"},{"q": "¿Cuanto cuesta el escudo ligero?", "a": "400"},{"q": "¿Cuanta vida da el escudo ligero?", "a": "25"},{"q": "¿Que agente tiene la habilidad Paranoia?", "a": "omen"},{"q": "¿Como se llama la definitiva de Reyna?", "a": "dominio"},{"q": "¿Que agente puede moverse por el mapa en forma de niebla?", "a": "omen"},{"q": "¿Como se llama la definitiva de Astra?", "a": "cosmos dividido"},{"q": "¿Que agente lanza granadas de conmocion con los brazos mecanicos?", "a": "breach"},{"q": "¿Como se llama la definitiva de Breach?", "a": "descarga"},{"q": "¿Que habilidad de Sage crea una barrera de hielo?", "a": "barrera de cristal"},{"q": "¿Como se llama el flash de Phoenix?", "a": "bengala"},{"q": "¿Que agente puede crear portales de teletransporte?", "a": "yoru"},{"q": "¿Como se llama la definitiva de Yoru?", "a": "dimension paralela"},{"q": "¿Que agente usa un gancho para moverse rapidamente?", "a": "neon"},{"q": "¿Como se llama la definitiva de Neon?", "a": "overdrive"},{"q": "¿Que agente coloca trampas de red en el suelo?", "a": "deadlock"},{"q": "¿Como se llama la definitiva de Deadlock?", "a": "aniquilacion"},{"q": "¿Que agente usa la habilidad Tornadoes?", "a": "jett"},{"q": "¿Como se llama la camara de Cypher?", "a": "camara espia"},{"q": "¿Como se llama la definitiva de Cypher?", "a": "neural robo"},{"q": "¿Que agente puede lanzar una lanza de luz que revela enemigos?", "a": "sova"},{"q": "¿Como se llama el dron de Sova?", "a": "dron de reconocimiento"},{"q": "¿Que agente tiene una habilidad llamada Torbellino?", "a": "raze"},{"q": "¿Como se llama la definitiva de Raze?", "a": "showstopper"},{"q": "¿Que agente puede sanar a aliados a distancia?", "a": "skye"},{"q": "¿Como se llama la definitiva de Skye?", "a": "busqueda y destruccion"},{"q": "¿Que agente usa minas de gravedad?", "a": "killjoy"},{"q": "¿Como se llama la definitiva de Viper?", "a": "pit de viper"},{"q": "¿Que habilidad de Viper crea una pared de humo toxico?", "a": "pantalla de veneno"},{"q": "¿Que agente de Colombia se llama Gabriel Silva?", "a": "tejo"},{"q": "¿Que agente usa ataques de precision electronica?", "a": "tejo"},{"q": "¿De que pais es originario Vyse?", "a": "desconocido"},{"q": "¿Que rol tiene el agente Tejo?", "a": "iniciador"},{"q": "¿Cuantos agentes habia en el lanzamiento original del juego?", "a": "11"},{"q": "¿En que año se lanzo Valorant oficialmente?", "a": "2020"},{"q": "¿Cual es el nombre del modo competitivo por equipos de 5v5?", "a": "valorant"},{"q": "¿Como se llaman los proyectiles de Sova que rebotan?", "a": "flecha de reconocimiento"},{"q": "¿Que agente tiene la habilidad Paranoia que ciega a los enemigos?", "a": "omen"},{"q": "¿Que arma tiene mayor alcance entre la Vandal y la Phantom?", "a": "vandal"},{"q": "¿Cuantos cargadores tiene el Operator?", "a": "1"},{"q": "¿Que escopeta es la mas cara del juego?", "a": "judge"},{"q": "¿Cuanto cuesta la Judge?", "a": "1850"},{"q": "¿Que ametralladora ligera cuesta 1600 creditos?", "a": "ares"},{"q": "¿Cuanto cuesta el subfusil Spectre?", "a": "1600"},{"q": "¿Que mapa fue el primero en lanzarse con el juego?", "a": "bind"},{"q": "¿Cual es el unico mapa con un sitio C?", "a": "haven"},{"q": "¿Que mapa tiene un cajon en el centro del mapa?", "a": "icebox"},{"q": "¿Cual es el rango mas alto en Valorant?", "a": "radiante"},{"q": "¿Cuantos niveles tiene el rango Inmortal?", "a": "3"},{"q": "¿Como se llama el tutorial de practica de disparos?", "a": "poligono de tiro"}
        ];
        const pick = t[Math.floor(Math.random() * t.length)];
        miniAns = pick.a.toLowerCase();
        document.getElementById('mini-clue').textContent = pick.q;
        document.getElementById('mini-input-zone').style.display = 'block';
    }
}

function renderMiniOptions(pool, correct) {
    const grid = document.getElementById('mini-options');
    grid.innerHTML = ''; grid.style.display = 'grid';
    let options = [...new Set(pool)].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (!options.includes(correct)) options[0] = correct;
    options.sort().forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.textContent = opt;
        btn.onclick = () => showMiniResult(opt.toLowerCase() === correct.toLowerCase(), correct);
        grid.appendChild(btn);
    });
}

function checkMiniAnswer() {
    const user = document.getElementById('mini-input').value.trim().toLowerCase();
    const isCorrect = user === miniAns || (miniAnsAlt && user === miniAnsAlt);
    showMiniResult(isCorrect, miniAns);
}

function showMiniResult(win, correct) {
    clearInterval(miniTimer); // Detener el temporizador
    const msg = document.getElementById('mini-msg');
    if (win) {
        miniStreak++;
        msg.textContent = miniStreak >= 3 ? `¡CORRECTO! 🔥 Racha: ${miniStreak}` : "¡CORRECTO!";
    } else {
        miniStreak = 0;
        msg.textContent = `INCORRECTO. Era: ${correct.toUpperCase()}`;
    }
    document.getElementById('mini-streak-display').textContent = miniStreak;
    msg.className = win ? "msg-win" : "msg-lose";
    msg.style.display = 'block';
    document.getElementById('btn-next').style.display = 'block';
    document.getElementById('mini-input-zone').style.display = 'none';
    document.getElementById('mini-options').style.display = 'none';
}

function backToMenu(fromPopState = false) {
    if (!fromPopState) history.back();
    clearInterval(miniTimer);
    miniStreak = 0;
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-interface').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'none';
    document.getElementById('wordle-interface').style.display = 'none';
}

// ---- WORDLE ----
const WORDLE_AGENTS = ["Jett","Raze","Sage","Sova","Viper","Cypher","Reyna","Killjoy","Breach","Omen","Brimstone","Phoenix","Skye","Yoru","Astra","Iso","Clove","Neon","Fade","Harbor","Gekko","Deadlock","Chamber","KAYO","Vyse","Tejo","Miks","Veto","Waylay"];

function startWordle() {
    history.pushState({inGame: true}, '');
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('minigame-interface').style.display = 'none';
    document.getElementById('wordle-interface').style.display = 'block';
    wordleWord = WORDLE_AGENTS[Math.floor(Math.random() * WORDLE_AGENTS.length)].toUpperCase();
    wordleGuesses = [];
    wordleCurrent = '';
    wordleOver = false;
    document.getElementById('wordle-streak').textContent = wordleStreak;
    document.getElementById('wordle-msg').textContent = '';
    document.getElementById('wordle-hint').textContent = `Agente de ${wordleWord.length} letras`;
    document.getElementById('wordle-next-btn').style.display = 'none';
    buildWordleGrid();
    buildWordleKeyboard();
}

function buildWordleGrid() {
    const grid = document.getElementById('wordle-grid');
    grid.innerHTML = '';
    for (let r = 0; r < 5; r++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        row.id = `wrow-${r}`;
        for (let c = 0; c < wordleWord.length; c++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.id = `wcell-${r}-${c}`;
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function buildWordleKeyboard() {
    const kb = document.getElementById('wordle-keyboard');
    kb.innerHTML = '';
    const rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['ENTER','Z','X','C','V','B','N','M','⌫']
    ];
    rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'wordle-kb-row';
        r.forEach(k => {
            const btn = document.createElement('button');
            btn.className = 'wordle-key' + (k === 'ENTER' || k === '⌫' ? ' wide' : '');
            btn.textContent = k;
            btn.id = `wkey-${k}`;
            btn.onclick = () => handleWordleKey(k);
            div.appendChild(btn);
        });
        kb.appendChild(div);
    });
}

document.addEventListener('keydown', e => {
    if (document.getElementById('wordle-interface').style.display === 'none') return;
    if (wordleOver) return;
    if (e.key === 'Enter') handleWordleKey('ENTER');
    else if (e.key === 'Backspace') handleWordleKey('⌫');
    else if (/^[a-zA-Z]$/.test(e.key)) handleWordleKey(e.key.toUpperCase());
});

function handleWordleKey(k) {
    if (wordleOver) return;
    const row = wordleGuesses.length;
    if (k === '⌫') {
        if (wordleCurrent.length > 0) {
            wordleCurrent = wordleCurrent.slice(0, -1);
            document.getElementById(`wcell-${row}-${wordleCurrent.length}`).textContent = '';
        }
    } else if (k === 'ENTER') {
        if (wordleCurrent.length !== wordleWord.length) {
            shakeRow(row);
            return;
        }
        submitWordleGuess();
    } else {
        if (wordleCurrent.length < wordleWord.length) {
            document.getElementById(`wcell-${row}-${wordleCurrent.length}`).textContent = k;
            wordleCurrent += k;
        }
    }
}

function shakeRow(r) {
    const row = document.getElementById(`wrow-${r}`);
    row.style.animation = 'none';
    row.style.transform = 'translateX(-8px)';
    setTimeout(() => row.style.transform = 'translateX(8px)', 80);
    setTimeout(() => row.style.transform = 'translateX(-5px)', 160);
    setTimeout(() => row.style.transform = '', 240);
}

function submitWordleGuess() {
    const row = wordleGuesses.length;
    const guess = wordleCurrent;
    wordleGuesses.push(guess);

    const result = Array(wordleWord.length).fill('absent');
    const used = Array(wordleWord.length).fill(false);
    const guessUsed = Array(guess.length).fill(false);

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === wordleWord[i]) {
            result[i] = 'correct';
            used[i] = true;
            guessUsed[i] = true;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (guessUsed[i]) continue;
        for (let j = 0; j < wordleWord.length; j++) {
            if (!used[j] && guess[i] === wordleWord[j]) {
                result[i] = 'present';
                used[j] = true;
                break;
            }
        }
    }

    for (let i = 0; i < guess.length; i++) {
        const cell = document.getElementById(`wcell-${row}-${i}`);
        setTimeout(() => cell.classList.add(result[i]), i * 120);
    }

    setTimeout(() => {
        for (let i = 0; i < guess.length; i++) {
            const keyEl = document.getElementById(`wkey-${guess[i]}`);
            if (!keyEl) continue;
            const cur = keyEl.className;
            if (result[i] === 'correct') keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' correct';
            else if (result[i] === 'present' && !cur.includes('correct')) keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' present';
            else if (result[i] === 'absent' && !cur.includes('correct') && !cur.includes('present')) keyEl.className = 'wordle-key' + (keyEl.classList.contains('wide') ? ' wide' : '') + ' absent';
        }
    }, guess.length * 120 + 100);

    wordleCurrent = '';

    const won = result.every(r => r === 'correct');
    if (won) {
        wordleStreak++;
        document.getElementById('wordle-streak').textContent = wordleStreak;
        setTimeout(() => {
            document.getElementById('wordle-msg').textContent = wordleStreak >= 4 ? `¡GANASTE! 🔥 Racha: ${wordleStreak}` : '¡GANASTE!';
            document.getElementById('wordle-msg').style.color = '#4caf50';
            document.getElementById('wordle-next-btn').style.display = 'inline-block';
        }, guess.length * 120 + 200);
        wordleOver = true;
    } else if (wordleGuesses.length >= 5) {
        wordleStreak = 0;
        document.getElementById('wordle-streak').textContent = wordleStreak;
        setTimeout(() => {
            document.getElementById('wordle-msg').textContent = `PERDISTE. Era: ${wordleWord}`;
            document.getElementById('wordle-msg').style.color = '#ff4655';
            document.getElementById('wordle-next-btn').style.display = 'inline-block';
        }, guess.length * 120 + 200);
        wordleOver = true;
    }
}

// Iniciar aplicación
init();