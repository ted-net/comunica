//const express = require('express');
const WebSocket = require('ws');
const path = require('path');

//const app = express();
const port = process.env.PORT || 8080;

// Servir arquivos HTML na pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Criar o servidor HTTP
const server = app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// WebSocket com integração ao HTTP
const wss = new WebSocket.Server({ server });

let pai = null;

wss.on('connection', (ws) => {
    ws.isPai = false;

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log('Erro ao processar mensagem:', e);
            return;
        }

        if (data.tipo === 'pai') {
            ws.isPai = true;
            pai = ws;
            console.log('Pai conectado');
        } else if (data.tipo === 'filho') {
            console.log('Mensagem recebida de um filho:', data.texto);

            if (pai && pai.readyState === WebSocket.OPEN) {
                pai.send(JSON.stringify({
                    identificador: data.identificador,
                    texto: data.texto,
                    destinatario: 'pai'
                }));
            }
        } else if (ws.isPai) {
            console.log('Mensagem recebida do pai:', data.texto);

            wss.clients.forEach(client => {
                if (client !== pai && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        identificador: 'Pai',
                        texto: data.texto,
                        destinatario: 'filhos'
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws.isPai) {
            pai = null;
            console.log('Pai desconectado');
        }
    });
});
