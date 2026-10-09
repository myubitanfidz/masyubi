import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.md':'text/plain; charset=utf-8'};
export async function startPreview(port = 4182, {redirectDirectories = true} = {}) {
  const server = http.createServer(async (request,response) => {
    try {
      const url = new URL(request.url,'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const relative = pathname.startsWith('/masyubi/') ? pathname.slice(8) : pathname;
      let filename = path.resolve(repository,'.' + relative);
      if (!filename.startsWith(repository + path.sep)) throw new Error('Outside repository');
      if ((await fs.stat(filename)).isDirectory()) {
        if (redirectDirectories && !pathname.endsWith('/')) { response.writeHead(301,{Location:url.pathname+'/'+url.search});response.end();return; }
        filename = path.join(filename,'index.html');
      }
      response.writeHead(200,{'Content-Type':mime[path.extname(filename)] || 'application/octet-stream'});
      response.end(await fs.readFile(filename));
    } catch { response.writeHead(404);response.end('Not found'); }
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = await startPreview();
  console.log('Preview: http://127.0.0.1:4182/masyubi/demos/blog-fotografi/');
  process.on('SIGINT',()=>server.close());
}
