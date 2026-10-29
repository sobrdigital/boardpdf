const {core}=require('photoshop');
const {storage}=require('uxp');
const {snapshot,fingerprint}=require('./documentService');
const {render}=require('./renderService');
const {createSession}=require('./renderSession');
const pdf=require('./pdfService');
const {safeName,selected}=require('./model');
function cancelled(token){if(token.cancelled)throw Error('Export cancelled.');}
async function destination(options){
 if(options.mode==='single')return storage.localFileSystem.getFileForSaving(safeName(options.filename.replace(/\.pdf$/i,''))+'.pdf',{types:['pdf']});
 return storage.localFileSystem.getFolder();
}
async function prepare(doc,rows,options,token,progress){
 const boards=selected(rows);if(!boards.length)throw Error('Select at least one artboard.');
 const outputs=[];
 await core.executeAsModal(async context=>{
 context.onCancel=()=>{token.cancelled=true;};
 if(fingerprint(await snapshot())!==fingerprint(doc))throw Error('Document changed. Refresh before exporting.');
 cancelled(token);
 let session;
 try{
 session=await createSession(doc.id,context);
 let combined=options.mode==='single'?await pdf.create():null;
 for(let i=0;i<boards.length;i++){
 cancelled(token);progress(i/boards.length,'Rendering '+(i+1)+' of '+boards.length);
 await session.prepare(boards[i].id);
 const pixels=await render({...doc,id:session.id},boards[i],options);cancelled(token);
 const output=combined||await pdf.create();await pdf.add(output,pixels,options);cancelled(token);
 if(!combined)outputs.push({name:String(i+1).padStart(3,'0')+'-'+safeName(boards[i].name)+'-'+boards[i].id+'.pdf',bytes:await pdf.save(output)});
 context.reportProgress({value:(i+1)/boards.length});
 await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(combined)outputs.push({bytes:await pdf.save(combined)});
 }finally{if(session)await session.close();}
 },{commandName:'Render artboard PDF'});
 cancelled(token);
 for(const output of outputs)validatePdf(output.bytes);
 return outputs;
}
function validatePdf(bytes){
 if(!bytes||bytes.length<100||String.fromCharCode(...bytes.subarray(0,5))!=='%PDF-')throw Error('PDF generation returned invalid or empty data. No output was saved.');
}
async function commit(outputs,options,target,token,progress){
 cancelled(token);for(const output of outputs)validatePdf(output.bytes);
 if(options.mode==='separate'){
 const existing=new Set((await target.getEntries()).map(e=>e.name.toLowerCase()));
 if(outputs.some(o=>existing.has(o.name.toLowerCase())))throw Error('A destination filename already exists. Choose an empty folder. Nothing was overwritten.');
 }
 token.committing=true;progress(.98,'Saving and verifying PDF');
 let count=0;
 for(const output of outputs){let file=target;let created=false;try{
 if(options.mode==='separate'){file=await target.createFile(output.name,{overwrite:false});created=true;}
 const bytes=output.bytes;
 await file.write(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),{format:storage.formats.binary});
 const saved=new Uint8Array(await file.read({format:storage.formats.binary}));
 validatePdf(saved);
 if(saved.length!==bytes.length||saved.some((value,index)=>value!==bytes[index]))throw Error('Saved PDF does not match generated data.');
 count++;
 }catch(e){if(created)try{await file.delete();}catch(_){}throw Error('Could not save PDF ('+count+' files saved): '+(e.message||String(e)));}}
 progress(1,'Saved '+outputs.length+' PDF'+(outputs.length===1?'':'s')+' ('+Math.ceil(outputs.reduce((n,o)=>n+o.bytes.length,0)/1024)+' KB).');
 return outputs.length;
}
async function run(doc,rows,options,target,token,progress){return commit(await prepare(doc,rows,options,token,progress),options,target,token,progress);}
module.exports={destination,prepare,commit,run,cancelled,validatePdf};
