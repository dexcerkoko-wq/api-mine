const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ativa o CORS para permitir requisições de qualquer site/console
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Lista de Servidores (Guardada em memória)
let serversList = [
    {
        id: 1,
        name: "Survival Sl Apq",
        address: "wss://relay.lax1dude.net/",
        type: "Survival / Multiplayer",
        online: true,
        description: "Servidor Survival Principal"
    },
    {
        id: 2,
        name: "Lax1dude Relay #1",
        address: "wss://relay.deev.is/",
        type: "Relay Oficial",
        online: true,
        description: "Servidor para salas multiplayer criadas por jogadores"
    },
    {
        id: 3,
        name: "Ayunami Relay",
        address: "wss://relay.shhnowisnottheti.me/",
        type: "Public Relay",
        online: true,
        description: "Relay público alternativo"
    }
];

// 1. Rota Principal: Serve o jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API de Servidores (JSON)
app.get('/api/servers', (req, res) => {
    res.json(serversList);
});

app.post('/api/servers', (req, res) => {
    const { name, address, description, type } = req.body;
    if (!name || !address) {
        return res.status(400).json({ error: "Nome e endereço são obrigatórios." });
    }
    const newServer = {
        id: Date.now(),
        name,
        address,
        type: type || "Comunidade",
        online: true,
        description: description || "Adicionado via API"
    };
    serversList.push(newServer);
    res.status(201).json(newServer);
});

// 3. Página Visual de Servidores (/servers e /server)
const renderServersPage = (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Servidores Eaglercraft</title>
        <style>
            body { font-family: sans-serif; background-color: #121212; color: #fff; margin: 0; padding: 20px; }
            h1 { color: #4CAF50; }
            .container { max-width: 800px; margin: 0 auto; }
            .server-card { background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .server-info h3 { margin: 0 0 5px 0; color: #fff; }
            .server-info p { margin: 2px 0; font-size: 0.85em; color: #aaa; }
            .btn { background: #4CAF50; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; }
            .btn:hover { background: #45a049; }
            .add-box { background: #1a1a1a; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px dashed #444; }
            .add-box input { width: calc(100% - 20px); padding: 8px; margin-bottom: 10px; background: #2b2b2b; border: 1px solid #444; color: #fff; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Lista de Servidores Online</h1>
            <p>Endereços WSS para colar no Multiplayer do Eaglercraft.</p>
            <div id="list">A carregar servidores...</div>

            <div class="add-box">
                <h3>➕ Adicionar Servidor</h3>
                <input type="text" id="name" placeholder="Nome do Servidor (ex: Survival Sl Apq)">
                <input type="text" id="address" placeholder="Endereço (wss://...)">
                <input type="text" id="desc" placeholder="Descrição curta">
                <button class="btn" onclick="addSrv()">Adicionar</button>
            </div>
        </div>

        <script>
            async function loadServers() {
                const res = await fetch('/api/servers');
                const data = await res.json();
                const list = document.getElementById('list');
                list.innerHTML = '';
                data.forEach(s => {
                    list.innerHTML += \`
                        <div class="server-card">
                            <div class="server-info">
                                <h3>\${s.name}</h3>
                                <p><strong>WSS:</strong> \${s.address}</p>
                                <p>\${s.description}</p>
                            </div>
                            <button class="btn" onclick="navigator.clipboard.writeText('\${s.address}'); alert('Endereço copiado!');">Copiar WSS</button>
                        </div>
                    \`;
                });
            }

            async function addSrv() {
                const name = document.getElementById('name').value;
                const address = document.getElementById('address').value;
                const description = document.getElementById('desc').value;
                if(!name || !address) return alert('Preencha os campos obrigatorios!');
                
                await fetch('/api/servers', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, address, description })
                });
                document.getElementById('name').value = '';
                document.getElementById('address').value = '';
                document.getElementById('desc').value = '';
                loadServers();
            }

            loadServers();
        </script>
    </body>
    </html>
    `);
};

app.get('/servers', renderServersPage);
app.get('/server', (req, res) => res.redirect('/servers'));

// 4. METODO RESERVA DO CLIENTE (Script JS estático para o Console)
app.get('/client.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
(function() {
    const host = "https://api-mine-t1yh.onrender.com";
    
    // Limpa a página
    document.body.innerHTML = "";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#000";

    // 1. Barra de Controlo Flutuante
    const topBar = document.createElement("div");
    topBar.style.position = "fixed";
    topBar.style.top = "0";
    topBar.style.left = "0";
    topBar.style.width = "100%";
    topBar.style.height = "35px";
    topBar.style.backgroundColor = "rgba(20, 20, 20, 0.9)";
    topBar.style.zIndex = "99999";
    topBar.style.display = "flex";
    topBar.style.alignItems = "center";
    topBar.style.padding = "0 10px";
    topBar.style.boxSizing = "border-box";
    topBar.style.borderBottom = "1px solid #333";

    const srvBtn = document.createElement("button");
    srvBtn.innerText = "🌐 Lista de Servidores";
    srvBtn.style.background = "#4CAF50";
    srvBtn.style.color = "#fff";
    srvBtn.style.border = "none";
    srvBtn.style.padding = "5px 12px";
    srvBtn.style.borderRadius = "4px";
    srvBtn.style.cursor = "pointer";
    srvBtn.style.fontWeight = "bold";
    srvBtn.style.fontSize = "12px";

    srvBtn.onclick = function() {
        window.open(host + "/servers", "EaglerServers", "width=850,height=650");
    };

    topBar.appendChild(srvBtn);
    document.body.appendChild(topBar);

    // 2. Frame do Jogo
    const gameFrame = document.createElement("iframe");
    gameFrame.src = host;
    gameFrame.style.width = "100vw";
    gameFrame.style.height = "calc(100vh - 35px)";
    gameFrame.style.marginTop = "35px";
    gameFrame.style.border = "none";
    
    document.body.appendChild(gameFrame);
    console.log("🎮 Eaglercraft injetado com sucesso!");
})();
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
