const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const esbuild=require('esbuild');
async function bundle(entry){return (await esbuild.build({entryPoints:[entry],write:false,bundle:true,platform:'browser',format:'cjs',external:['photoshop','uxp'],plugins:[{name:'typed-jpeg',setup(b){b.onLoad({filter:/jpeg-js[\\/]lib[\\/]encoder\.js$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace('return Buffer.from(byteout);','return new Uint8Array(byteout);'),loader:'js'}));}}]})).outputFiles[0].text;}
function load(code,mocks={}){const context={module:{exports:{}},exports:{},Uint8Array,ArrayBuffer,Date,setTimeout,clearTimeout,console,require:name=>{if(name in mocks)return mocks[name];throw Error('Unexpected runtime dependency '+name);}};vm.runInNewContext(code,context);return context.module.exports;}
test('PDF runtime operates without Buffer, fetch, canvas or Node imports',async()=>{const pdf=load(await bundle('src/pdfService.js'));for(const transparent of [true,false]){const d=await pdf.create();await pdf.add(d,{width:1,height:1,pageWidth:72,pageHeight:72,data:new Uint8Array([250,20,30,128])},{transparent,quality:90});assert.ok((await pdf.save(d)).length>500);}});
function photoshop(){const layer={id:12,name:'Page'};return {app:{documents:[1],activeDocument:{id:4,title:'Unsaved',resolution:72,activeHistoryState:{id:1},layers:[layer]}},action:{batchPlay:async()=>[{artboardEnabled:true,artboard:{artboardRect:{left:0,top:0,right:2,bottom:2}}}]},core:{executeAsModal:async fn=>fn({reportProgress(){}})},imaging:{getPixels:async()=>({sourceBounds:{left:0,top:0,right:2,bottom:2},level:0,imageData:{width:2,height:2,components:4,hasAlpha:true,getData:async()=>new Uint8Array(16).fill(255),dispose(){}}})}};}
test('cancel before rendering and permission error during commit',async()=>{
 const ps=photoshop();const service=load(await bundle('src/exportService.js'),{photoshop:ps,uxp:{storage:{formats:{binary:'binary'}}}});
 const doc={id:4,name:'Unsaved',resolution:72,history:1,boards:[{id:12,name:'Page',left:0,top:0,right:2,bottom:2,selected:true}]};
 const opts={mode:'single',dpi:0,quality:80,background:'#ffffff',transparent:false};let writes=0;const target={write:async()=>{writes++;throw Error('Permission denied');}};
 await assert.rejects(service.run(doc,doc.boards,opts,target,{cancelled:true},()=>{}),/cancelled/);assert.equal(writes,0);
 const lib=require('../src/pdfService');const d=await lib.create();await lib.add(d,{width:1,height:1,pageWidth:72,pageHeight:72,data:new Uint8Array([255,0,0,255])},{quality:80});const outputs=[{bytes:await lib.save(d)}];
 await assert.rejects(service.commit(outputs,opts,target,{cancelled:false},()=>{}),/Permission denied/);assert.equal(writes,1);
 ps.app.activeDocument.activeHistoryState.id=2;await assert.rejects(service.run(doc,doc.boards,opts,target,{},()=>{}),/Document changed/);
});
test('trimmed transparent render pads to full artboard and disposes pixels',async()=>{
 const ps=photoshop();let disposed=false;ps.imaging.getPixels=async()=>({sourceBounds:{left:1,top:1,right:2,bottom:2},imageData:{width:1,height:1,components:4,hasAlpha:true,getData:async()=>new Uint8Array([255,0,0,128]),dispose(){disposed=true;}}});
 const service=load(await bundle('src/renderService.js'),{photoshop:ps});const result=await service.render({id:4,resolution:72},{id:12,left:0,top:0,right:2,bottom:2},{dpi:0,transparent:true,background:'#ffffff'});assert.equal(result.data[3],0);assert.equal(result.data[15],128);assert.equal(disposed,true);
 await assert.rejects(service.render({resolution:72},{left:0,top:0,right:10000,bottom:10000},{dpi:0}),/safety limit/);
});
test('commit rejects empty output and verifies filesystem bytes before success',async()=>{
 const ps=photoshop();const service=load(await bundle('src/exportService.js'),{photoshop:ps,uxp:{storage:{formats:{binary:'binary'}}}});
 let writes=0;const target={write:async()=>{writes++;},read:async()=>new ArrayBuffer(0)};const opts={mode:'single'};
 await assert.rejects(service.commit([{bytes:new Uint8Array(0)}],opts,target,{},()=>{}),/empty data/);assert.equal(writes,0);
 const lib=require('../src/pdfService');const doc=await lib.create();doc.addPage([72,72]);const bytes=await lib.save(doc);
 await assert.rejects(service.commit([{bytes}],opts,target,{},()=>{}),/empty data/);
 let saved;target.write=async data=>{saved=data;};target.read=async()=>saved;
 assert.equal(await service.commit([{bytes}],opts,target,{},()=>{}),1);
});
test('duplicate document isolates stable layer path and closes only its own document',async()=>{
 const sourceLayers=[{id:1,visible:true,layers:[{id:2,visible:false}]},{id:3,visible:true}];
 const copyLayers=[{id:11,visible:true,layers:[{id:12,visible:false}]},{id:13,visible:true}];
 const app={documents:[]};let closed=false;const copy={id:20,layers:copyLayers,closeWithoutSaving:async()=>{closed=true;app.documents=app.documents.filter(d=>d.id!==20);}};
 const source={id:10,layers:sourceLayers,duplicate:async()=>{app.documents.push(copy);return copy;}};app.documents=[source];
 const service=load(await bundle('src/renderSession.js'),{photoshop:{app}});const session=await service.createSession(10,{});
 await session.prepare(2);assert.equal(copyLayers[1].visible,false);assert.equal(copyLayers[0].layers[0].visible,true);assert.equal(sourceLayers[0].layers[0].visible,false);
 await session.prepare(3);assert.equal(copyLayers[0].visible,false);assert.equal(copyLayers[1].visible,true);assert.equal(copyLayers[0].layers[0].visible,false);
 await session.close();assert.equal(closed,true);assert.deepEqual(app.documents.map(d=>d.id),[10]);
});
