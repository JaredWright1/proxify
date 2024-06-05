const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const port = 8080;
const host = 'localhost';
const targetHost = 'github.com';
const targetPort = 443;

const app = express();
const proxyMiddleware = require('http-proxy-middleware')({
  target: `https://${targetHost}:${targetPort}`,
  changeOrigin: true,
  ws: true,
});

const agent = new https.Agent({
  ca: fs.readFileSync('path/to/target-cert.pem'),
  key: fs.readFileSync('path/to/target-key.pem'),
  cert: fs.readFileSync('path/to/target-cert.pem'),
});

app.use('/', (req, res, next) => {
  req.headers['host'] = targetHost;
  req.headers['x-forwarded-host'] = targetHost;
  req.headers['x-forwarded-proto'] = 'https';
  req.headers['x-real-ip'] = req.connection.remoteAddress;

  req.socket.on('data', (data) => {
    if (data.toString().includes('username') || data.toString().includes('password')) {
      console.warn('Credentials found in request');
    }
  });

  proxyMiddleware(req, res, next);
});

app.listen(port, host, () => {
  console.log(`Proxy running at http://${host}:${port}`);
});
