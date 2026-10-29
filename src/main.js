const {entrypoints}=require('uxp');
const {action,app}=require('photoshop');
const documents=require('./documentService');
const exporter=require('./exportService');
const store=require('./settingsService');
const {thumbnail}=require('./renderService');
const {PRESETS,settings,move,selected,selectedArtboardIds,selectionRows,dimensions}=require('./model');
const $=id=>document.getElementById(id);
let doc=null,rows=[],busy=false,token=null,drag=null,revision=0,dirty=false,activeRow=null,syncing=false,lastSelection='';
let thumbnailTask=Promise.resolve();
function status(message,error=false){$('status').textContent=message;$('status').className=error?'error':'';}
function read(){return settings(Object.fromEntries(['preset','quality','dpi','transparent','background','mode','filename'].map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value])));}
function apply(s){for(const key of ['preset','quality','dpi','transparent','background','mode','filename']){if($(key).type==='checkbox')$(key).checked=s[key];else $(key).value=String(s[key]);}$('quality').disabled=s.transparent;$('background').disabled=s.transparent;}
function selectionStamp(){if(!app.documents.length)return 'none';return app.activeDocument.id+':'+app.activeDocument.activeLayers.map(l=>l.id).join(',');}
function updateMoveControls(){const index=rows.findIndex(r=>r.id===activeRow);$('moveUp').disabled=busy||index<=0;$('moveDown').disabled=busy||index<0||index>=rows.length-1;}
function activate(id){activeRow=id;for(const el of $('boards').children)el.className=Number(el.getAttribute('data-id'))===id?'board active':'board';updateMoveControls();}
function draw(){
 $('boards').innerHTML='';let page=0;
 for(const row of rows){
 const el=document.createElement('div');el.className=row.id===activeRow?'board active':'board';el.draggable=!busy;el.setAttribute('role','listitem');el.setAttribute('data-id',String(row.id));el.onclick=()=>activate(row.id);
 const num=document.createElement('span');num.className='page';num.textContent=row.selected?String(++page):'·';el.appendChild(num);
 const check=document.createElement('input');check.type='checkbox';check.checked=row.selected;check.disabled=busy;check.setAttribute('aria-label','Include '+row.name);check.onchange=()=>{row.selected=check.checked;activeRow=row.id;draw();};check.onfocus=()=>activate(row.id);el.appendChild(check);
 const frame=document.createElement('div');frame.className='preview';if(row.preview){const img=document.createElement('img');img.src=row.preview;img.alt='Preview of '+row.name;frame.appendChild(img);}el.appendChild(frame);
 const label=document.createElement('div');label.className='name';label.textContent=row.name;const dims=dimensions(row,doc.resolution,read().dpi);label.title=row.name+' · '+dims.width+' × '+dims.height+' px';el.appendChild(label);
 el.ondragstart=e=>{drag=row.id;activate(row.id);if(e.dataTransfer)e.dataTransfer.setData('text/plain',String(row.id));};el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();if(!busy&&drag!==null){rows=move(rows,drag,rows.findIndex(r=>r.id===row.id)-rows.findIndex(r=>r.id===drag));draw();}drag=null;};$('boards').appendChild(el);
 }
 $('empty').style.display=rows.length?'none':'flex';$('boards').style.display=rows.length?'block':'none';$('orderTools').style.display=rows.length>1?'flex':'none';
 $('count').textContent=selected(rows).length+' page'+(selected(rows).length===1?'':'s');$('export').textContent=selected(rows).length?'Export '+selected(rows).length+' page'+(selected(rows).length===1?'':'s')+'…':'Export PDF…';$('export').disabled=busy||dirty||!selected(rows).length;updateMoveControls();
}
async function previews(){
 const version=revision;
 for(const row of rows.slice(0,50)){
  if(busy||version!==revision)return;
  try{await thumbnailTask.catch(()=>{});if(busy||version!==revision)return;thumbnailTask=thumbnail(doc,row);const url=await thumbnailTask;if(version!==revision)return;row.preview=url;draw();}
  catch(e){console.warn('Thumbnail '+row.id+': '+(e.message||String(e)));if(version===revision)status('Some previews are unavailable.',true);}
 }
}
async function usePhotoshopSelection(){
 if(busy||syncing)return;syncing=true;
 try{
 const current=await documents.snapshot();
 if(current&&(!app.documents.length||app.activeDocument.id!==current.id))return;
 const ids=current?selectedArtboardIds(app.activeDocument.activeLayers,current.boards.map(b=>b.id)):new Set();
 const previous=doc&&current&&doc.id===current.id?rows:[];
 doc=current;rows=current?selectionRows(current.boards,ids,previous):[];
 lastSelection=selectionStamp();dirty=false;revision++;activeRow=rows.some(r=>r.id===activeRow)?activeRow:rows[0]?.id||null;
 $('document').textContent=current?current.name:'No document open';draw();status('');
 if(rows.length)previews();
 }catch(e){status(e.message||String(e),true);}finally{syncing=false;}
}
async function exportNow(){
 if(busy||!selected(rows).length)return;busy=true;revision++;token={cancelled:false};
 for(const el of $('controls').querySelectorAll('input,select'))el.disabled=true;
 $('fromPhotoshop').disabled=true;$('advancedToggle').disabled=true;$('cancel').style.display='block';$('cancel').disabled=false;$('progress').style.display='block';draw();
 try{
 await thumbnailTask.catch(()=>{});
 if(dirty||documents.fingerprint(await documents.snapshot())!==documents.fingerprint(doc))throw Error('Artwork changed. Click Update selection before exporting.');
 const options=read();apply(options);store.save(options);
 const outputs=await exporter.prepare(doc,rows,options,token,(value,message)=>{$('progress').value=value*.9;status(message);});
 if(token.cancelled)throw Error('Export cancelled.');
 const target=await exporter.destination(options);if(!target){status('Save cancelled.');return;}
 await exporter.commit(outputs,options,target,token,(value,message)=>{$('progress').value=value;status(message);if(token.committing)$('cancel').disabled=true;});
 }catch(e){status(e.message||String(e),true);}finally{
 busy=false;for(const el of $('controls').querySelectorAll('input,select'))el.disabled=false;apply(read());$('fromPhotoshop').disabled=false;$('advancedToggle').disabled=false;$('cancel').style.display='none';$('progress').style.display='none';draw();
 }
}
function changed(){if(busy||!rows.length)return;dirty=true;revision++;$('export').disabled=true;status('Artwork changed. Update selection to refresh.');}
function init(){
 apply(store.load());$('fromPhotoshop').onclick=usePhotoshopSelection;
 $('moveUp').onclick=()=>{rows=move(rows,activeRow,-1);draw();};$('moveDown').onclick=()=>{rows=move(rows,activeRow,1);draw();};
 $('cancel').onclick=()=>{if(token&&!token.committing){token.cancelled=true;status('Cancelling…');}};$('export').onclick=exportNow;
 $('advancedToggle').onclick=()=>{const expanded=$('advancedToggle').getAttribute('aria-expanded')==='true';$('advancedToggle').setAttribute('aria-expanded',String(!expanded));$('advanced').style.display=expanded?'none':'block';$('advancedToggle').textContent=expanded?'Options':'Hide options';};
 $('preset').onchange=()=>{const p=PRESETS[$('preset').value];if(p){apply(settings({...read(),...p}));store.save(read());draw();}};
 for(const id of ['quality','dpi','transparent','background','mode','filename'])$(id).onchange=()=>{const s=read();apply(s);store.save(s);draw();};
 Promise.resolve(action.addNotificationListener(['make','delete','set','move','show','hide','open','close','historyStateChanged'],changed)).catch(e=>status('Change listener unavailable: '+(e.message||String(e)),true));
 setInterval(()=>{if(busy||syncing)return;try{if(selectionStamp()!==lastSelection)usePhotoshopSelection();}catch(e){console.warn(e.message||String(e));}},1000);
 usePhotoshopSelection();
}
entrypoints.setup({panels:{artboardPdf:{show(){}}}});
init();
