import http from 'node:http';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initialProducts } from '../src/data.js';

const folder=dirname(fileURLToPath(import.meta.url));
const database=join(folder,'local-products.json');
const port=Number(process.env.PORT||3000);
const host=process.env.HOST||'0.0.0.0';

export async function loadDb(path=database) {
  try {
    return JSON.parse(await readFile(path,'utf8'));
  } catch(error) {
    if(error.code!=='ENOENT')throw error;
    return structuredClone(initialProducts);
  }
}
export async function saveDb(products,path=database) {
  const temp=`${path}.${randomUUID()}.tmp`;
  await writeFile(temp,JSON.stringify(products,null,2),'utf8');
  await rename(temp,path);
}
function send(res,status,data){
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Cache-Control':'no-store'
  });
  res.end(JSON.stringify(data));
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    let text='';
    req.on('data',(chunk)=>{text+=chunk;if(text.length>50000){reject(new Error('El cuerpo excede el límite de 50 KB.'));req.destroy();}});
    req.on('end',()=>{try{resolve(JSON.parse(text||'{}'));}catch{reject(new Error('JSON inválido.'));}});
    req.on('error',reject);
  });
}
const permittedImage=/^\/images\/[\w.-]+$/;
function sanitizeProduct(input,id){
  const nombre=String(input.nombre??'').trim(),precio=Number(input.precio);
  if(nombre.length<2||nombre.length>90||!Number.isFinite(precio)||precio<=0||precio>100000000){throw new Error('Nombre o precio no válido.');}
  const imagen=permittedImage.test(input.imagen)?input.imagen:'/images/logo.png';
  return {id,nombre,precio,imagen};
}

export function createServer(dbPath=database){
  // API de laboratorio SIN autenticación. Solo para LAN privada; NO exponer a internet.
  return http.createServer(async(req,res)=>{
    if(req.method==='OPTIONS')return send(res,204,{});
    const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
    if(url.pathname==='/api/health'&&req.method==='GET')return send(res,200,{status:'ok',service:'Beauty Store API'});
    if(!/^\/api\/products(?:\/\d+)?$/.test(url.pathname))return send(res,404,{error:'Ruta no encontrada.'});
    try{
      const list=await loadDb(dbPath);
      if(!Array.isArray(list))throw new Error('Base de datos inválida.');
      const id=Number(url.pathname.split('/')[3]);
      if(req.method==='GET'){
        return id?send(res,list.some(x=>x.id===id)?200:404,list.find(x=>x.id===id)||{error:'Producto no encontrado.'}):send(res,200,list);
      }
      if(req.method==='POST'&& !id){
        const input=await readBody(req);
        const product=sanitizeProduct(input,Math.max(0,...list.map(x=>x.id))+1);
        list.push(product);await saveDb(list,dbPath);return send(res,201,product);
      }
      if(req.method==='PUT'&&id){
        const index=list.findIndex(x=>x.id===id);if(index<0)return send(res,404,{error:'Producto no encontrado.'});
        list[index]=sanitizeProduct(await readBody(req),id);await saveDb(list,dbPath);return send(res,200,list[index]);
      }
      if(req.method==='DELETE'&&id){
        const index=list.findIndex(x=>x.id===id);if(index<0)return send(res,404,{error:'Producto no encontrado.'});
        const [removed]=list.splice(index,1);await saveDb(list,dbPath);return send(res,200,removed);
      }
      return send(res,405,{error:'Método no permitido.'});
    }catch(error){
      const invalid=/no válido|JSON inválido|excede el límite/.test(error.message);
      send(res,invalid?400:500,{error:invalid?error.message:'Error interno de la API.'});
    }
  });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  createServer().listen(port,host,()=>console.log(`Beauty Store API: http://localhost:${port}/api/health (LAN solo para pruebas)`));
}
