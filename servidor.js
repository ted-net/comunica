const WebSocket = require('ws');

// Cria o servidor WebSocket rodando na porta 8080
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    // Quando receber uma mensagem de um cliente
    ws.on('message', (message) => {
        console.log(`Mensagem recebida: ${message}`);

        // Enviar a mensagem para todos os clientes conectados
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Quando um cliente desconectar
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

console.log('Servidor WebSocket rodando na porta 8080');
