const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Permite que qualquer site faça requisições para esta API (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Endpoint que devolve o HTML do jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`API a correr na porta ${PORT}`);
});
