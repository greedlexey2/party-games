// Адрес игрового сервера. Локально (localhost / Wi-Fi) — тот же хост, иначе — сервер на VPS.
if (!/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)) window.GAME_SERVER = 'wss://mathioboard.com/party-ws';
