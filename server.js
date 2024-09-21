const WebSocket = require('ws');

// Usar a porta fornecida pelo Heroku ou 8080 localmente
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

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
                // Envia a mensagem para o pai
                pai.send(JSON.stringify({
                    identificador: data.identificador,
                    texto: data.texto,
                    destinatario: 'pai'
                }));
            }
        } else if (ws.isPai) {
            console.log('Mensagem recebida do pai:', data.texto);

            // Envia a mensagem do pai para todos os filhos
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
