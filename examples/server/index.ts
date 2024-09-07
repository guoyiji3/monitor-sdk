import http from 'http';
import express from 'express';
import opn from 'open';
import coBody from 'co-body';
import cors from 'cors';
import { port, FilePaths, ServerUrls } from './config';

const app = express();

app.use(cors());

Object.entries(FilePaths).forEach(([path, resolvePath]) => {
  app.use(path, express.static(resolvePath));
});

// mock
app.get(ServerUrls.normalGet, (req, res) => {
  res.send('get 正常请求响应体');
});

app.get(ServerUrls.exceptionGet, (req, res) => {
  res.status(500).send('get 异常响应体!!!');
});

app.post(ServerUrls.normalPost, (req, res) => {
  res.send('post 正常请求响应体');
});

app.post(ServerUrls.exceptionPost, (req, res) => {
  res.status(500).send('post 异常响应体!!!');
});

app.post(ServerUrls.errorsUpload, async (req, res) => {
  const parmas = await coBody.json(req);
  console.log('sendBeacon | xhr parmas', parmas);
  res.send('sendBeacon | xhr 错误上报成功');
});

app.get(ServerUrls.errorsUpload, async (req, res) => {
  console.log('img parmas', req.query.data);
  res.send('img 错误上报成功');
});

const server = http.createServer(app);

server.listen(port, () => {
  if (process.env.NODE_ENV === 'demo') {
    const urls = `http://localhost:${port}`;
    console.log(`examples server is available at: ${urls}`);
  }
});
