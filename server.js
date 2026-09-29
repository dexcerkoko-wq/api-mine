const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS para permitir conexões externas
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Lista de Servidores Padrão (IPs WSS do Eaglercraft)
let serversList = [
    {
        id: 1,
        name: "Survival Sl Apq",
        address: "wss://relay.lax1dude.net/",
        type: "Survival / Relay",
        online: true,
        description: "Servidor Survival Oficial"
    },
    {
        id: 2,
        name: "ArchMC Eagler",
        address: "wss://wss.archmc.pt/",
        type: "Anarchy / Survival",
        online: true,
        description: "Servidor Anarchy público para Eaglercraft"
    },
    {
        id: 3,
        name: "Ayunami Public Relay",
        address: "wss://relay.shhnowisnottheti.me/",
        type: "Public Relay",
        online: true,
        description: "Servidor relay para criar/entrar em salas"
    }
];

// 1. Rota Principal do Jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API de Servidores
app.get('/api/servers', (req, res) => {
    res.json(serversList);
});

app.post('/api/servers', (req, res) => {
    let { name, address, description } = req.body;
    if (!address) {
        return res.status(400).json({ error: "O endereço IP/WSS é obrigatório." });
    }

    // Formata o IP para o protocolo WSS se o utilizador esquecer
    if (!address.startsWith('wss://') && !address.startsWith('ws://')) {
        address = 'wss://' + address;
    }

    const newServer = {
        id: Date.now(),
        name: name || "Servidor Personalizado",
        address: address,
        type: "Comunidade",
        online: true,
        description: description || "Adicionado por utilizador"
    };

    serversList.push(newServer);
    res.status(201).json(newServer);
});

// 3. Painel da Lista de Servidores e Entrar por IP (/servers)
app.get('/servers', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Servidores Eaglercraft & IPs</title>
        <style>
            body { font-family: sans-serif; background-color: #121212; color: #fff; margin: 0; padding: 20px; }
            h1 { color: #4CAF50; text-align: center; }
            .container { max-width: 800px; margin: 0 auto; }
            .card { background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .server-card { display: flex; justify-content: space-between; align-items: center; }
            .btn { background: #4CAF50; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; }
            .btn-blue { background: #2196F3; }
            .btn:hover { opacity: 0.9; }
            input { width: calc(100% - 22px); padding: 10px; margin-bottom: 10px; background: #2b2b2b; border: 1px solid #444; color: #fff; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Servidores & IPs Eaglercraft</h1>

            <!-- Entrar por IP Rápido -->
            <div class="card">
                <h3>⚡ Conectar por IP Direto</h3>
                <input type="text" id="quickIp" placeholder="Ex: wss://wss.archmc.pt ou relay.lax1dude.net">
                <button class="btn btn-blue" onclick="connectIp()">Copiar IP e Ir para o Jogo</button>
            </div>

            <!-- Adicionar Servidor na Lista -->
            <div class="card">
                <h3>➕ Adicionar Novo IP à Lista</h3>
                <input type="text" id="srvName" placeholder="Nome do Servidor">
                <input type="text" id="srvIp" placeholder="Endereço IP / WSS (ex: wss://servidor.com)">
                <input type="text" id="srvDesc" placeholder="Descrição (opcional)">
                <button class="btn" onclick="addServer()">Guardar Servidor</button>
            </div>

            <h2>📋 Lista de Servidores Disponíveis</h2>
            <div id="list">A carregar servidores...</div>
        </div>

        <script>
            async function loadServers() {
                const res = await fetch('/api/servers');
                const data = await res.json();
                const list = document.getElementById('list');
                list.innerHTML = '';

                data.forEach(s => {
                    list.innerHTML += \`
                        <div class="card server-card">
                            <div>
                                <h3 style="margin:0 0 5px 0;">\${s.name}</h3>
                                <p style="margin:0; font-size:0.85em; color:#aaa;"><strong>IP/WSS:</strong> \${s.address}</p>
                                <p style="margin:5px 0 0 0; font-size:0.8em; color:#777;">\${s.description}</p>
                            </div>
                            <button class="btn" onclick="copyAndPlay('\${s.address}')">Copiar IP</button>
                        </div>
                    \`;
                });
            }

            function copyAndPlay(ip) {
                navigator.clipboard.writeText(ip);
                alert('IP copiado: ' + ip + '\\n\\nAgora vai ao jogo -> Multiplayer -> Add Server e cola o endereço!');
            }

            function connectIp() {
                let ip = document.getElementById('quickIp').value.trim();
                if(!ip) return alert('Digita um IP válido!');
                if(!ip.startsWith('wss://') && !ip.startsWith('ws://')) ip = 'wss://' + ip;
                
                navigator.clipboard.writeText(ip);
                alert('IP ' + ip + ' copiado! Redirecionando para o jogo...');
                window.location.href = '/';
            }

            async function addServer() {
                const name = document.getElementById('srvName').value;
                const address = document.getElementById('srvIp').value;
                const description = document.getElementById('srvDesc').value;

                if(!address) return alert('O endereço IP é obrigatório!');

                await fetch('/api/servers', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, address, description })
                });

                document.getElementById('srvName').value = '';
                document.getElementById('srvIp').value = '';
                document.getElementById('srvDesc').value = '';
                loadServers();
            }

            loadServers();
        </script>
    </body>
    </html>
    `);
});

app.get('/server', (req, res) => res.redirect('/servers'));

// 4. Cliente para o Console do Navegador
app.get('/client.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
(function() {
    const host = "https://api-mine-t1yh.onrender.com";
    document.body.innerHTML = "";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#000";

    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:0;left:0;width:100%;height:35px;background:#141414;z-index:99999;display:flex;align-items:center;padding:0 10px;box-sizing:border-box;border-bottom:1px solid #333;";

    const btn = document.createElement("button");
    btn.innerText = "🌐 Lista de Servidores / Entrar por IP";
    btn.style.cssText = "background:#4CAF50;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px;";
    btn.onclick = () => window.open(host + "/servers", "EaglerServers", "width=850,height=650");

    bar.appendChild(btn);
    document.body.appendChild(bar);

    const frame = document.createElement("iframe");
    frame.src = host;
    frame.style.cssText = "width:100vw;height:calc(100vh - 35px);margin-top:35px;border:none;";
    document.body.appendChild(frame);
})();
    `);
});

app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
