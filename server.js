const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware para processar JSON e habilitar CORS
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Lista inicial de servidores (salva em memória)
let serversList = [
    {
        id: 1,
        name: "Survival Sl Apq",
        address: "wss://relay.lax1dude.net/",
        type: "Survival / Multiplayer",
        online: true,
        description: "Servidor Survival Oficial da Comunidade"
    },
    {
        id: 2,
        name: "Lax1dude Relay #1",
        address: "wss://relay.deev.is/",
        type: "Multiplayer Relay",
        online: true,
        description: "Relay oficial do Eaglercraft para salas criadas por jogadores"
    },
    {
        id: 3,
        name: "Ayunami Relay",
        address: "wss://relay.shhnowisnottheti.me/",
        type: "Public Relay",
        online: true,
        description: "Servidor secundário para partidas em rede"
    }
];

// 1. Rota Principal: Serve o jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Rota da API: Retorna a lista de servidores em formato JSON
app.get('/api/servers', (req, res) => {
    res.json(serversList);
});

// Rota da API: Permite adicionar novos servidores à lista
app.post('/api/servers', (req, res) => {
    const { name, address, type, description } = req.body;
    if (!name || !address) {
        return res.status(400).json({ error: "Nome e Endereço WSS são obrigatórios." });
    }

    const newServer = {
        id: Date.now(),
        name,
        address,
        type: type || "Custom",
        online: true,
        description: description || "Servidor adicionado pelos utilizadores"
    };

    serversList.push(newServer);
    res.status(201).json(newServer);
});

// 3. Rota Visual (/servers): Apresenta um painel elegante para navegar pelos servidores
app.get('/servers', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Servidores Eaglercraft</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #121212;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            h1 { color: #4CAF50; margin-bottom: 5px; }
            p { color: #aaa; margin-bottom: 25px; }
            .container { max-width: 800px; width: 100%; }
            .server-card {
                background-color: #1e1e1e;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 15px 20px;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            .server-info h3 { margin: 0 0 5px 0; color: #fff; }
            .server-info p { margin: 3px 0; font-size: 0.9em; color: #888; }
            .badge {
                display: inline-block;
                padding: 3px 8px;
                background-color: #2e7d32;
                color: white;
                font-size: 0.75em;
                border-radius: 4px;
                margin-top: 5px;
            }
            .btn {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 18px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                text-decoration: none;
            }
            .btn:hover { background-color: #45a049; }
            .add-form {
                background-color: #1a1a1a;
                border: 1px dashed #444;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            .add-form input {
                width: calc(100% - 22px);
                padding: 10px;
                margin-bottom: 10px;
                background: #2b2b2b;
                border: 1px solid #444;
                color: white;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Servidores Disponíveis</h1>
            <p>Lista de servidores WebSocket e Relays para jogar online.</p>
            
            <div id="servers-list">Carregando servidores...</div>

            <div class="add-form">
                <h3>➕ Adicionar Novo Servidor</h3>
                <input type="text" id="name" placeholder="Nome do Servidor (ex: Meu Survival)">
                <input type="text" id="address" placeholder="Endereço WebSocket (wss://...)">
                <input type="text" id="description" placeholder="Descrição rápida">
                <button class="btn" onclick="addServer()">Adicionar Servidor</button>
            </div>
        </div>

        <script>
            async function fetchServers() {
                const res = await fetch('/api/servers');
                const servers = await res.json();
                const listEl = document.getElementById('servers-list');
                listEl.innerHTML = '';

                servers.forEach(s => {
                    listEl.innerHTML += \`
                        <div class="server-card">
                            <div class="server-info">
                                <h3>\${s.name}</h3>
                                <p><strong>Endereço:</strong> \${s.address}</p>
                                <p>\${s.description}</p>
                                <span class="badge">\${s.type}</span>
                            </div>
                            <button class="btn" onclick="copyAddress('\${s.address}')">Copiar WSS</button>
                        </div>
                    \`;
                });
            }

            function copyAddress(addr) {
                navigator.clipboard.writeText(addr);
                alert('Endereço copiado para a área de transferência: ' + addr);
            }

            async function addServer() {
                const name = document.getElementById('name').value;
                const address = document.getElementById('address').value;
                const description = document.getElementById('description').value;

                if (!name || !address) {
                    alert('Por favor preencha pelo menos o Nome e o Endereço!');
                    return;
                }

                await fetch('/api/servers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, address, description, type: 'Comunidade' })
                });

                document.getElementById('name').value = '';
                document.getElementById('address').value = '';
                document.getElementById('description').value = '';
                fetchServers();
            }

            fetchServers();
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});
