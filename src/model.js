const PRESETS = {'Maximum Quality':{quality:100,dpi:0},'Print Quality':{quality:95,dpi:300},Balanced:{quality:80,dpi:150},'Small File':{quality:55,dpi:72}};
const defaults = {preset:'Balanced',quality:80,dpi:150,transparent:false,background:'#ffffff',profile:'srgb',mode:'single',filename:'Artboards.pdf'};
function settings(value={}) {
 const s={...defaults,...value};
 s.quality=Math.max(1,Math.min(100,Math.round(Number(s.quality)||80)));
 s.dpi=[0,300,150,96,72].includes(Number(s.dpi))?Number(s.dpi):150;
 s.transparent=s.transparent===true;
 s.background=/^#[0-9a-f]{6}$/i.test(s.background)?s.background:'#ffffff';
 s.profile='srgb'; s.mode=s.mode==='separate'?'separate':'single';
 s.preset=Object.entries(PRESETS).find(([,v])=>v.quality===s.quality&&v.dpi===s.dpi)?.[0]||'Custom';
 return s;
}
function move(rows,id,offset){const i=rows.findIndex(r=>r.id===id);if(i<0)return rows;const j=Math.max(0,Math.min(rows.length-1,i+offset));const out=rows.slice();out.splice(j,0,out.splice(i,1)[0]);return out;}
function selected(rows){return rows.filter(r=>r.selected);}
function safeName(s){return (s||'Artboard').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/g,'').slice(0,100)||'Artboard';}
function dimensions(board,resolution,dpi){const scale=dpi?Math.min(1,dpi/resolution):1;return {width:Math.max(1,Math.round((board.right-board.left)*scale)),height:Math.max(1,Math.round((board.bottom-board.top)*scale)),pageWidth:(board.right-board.left)*72/resolution,pageHeight:(board.bottom-board.top)*72/resolution};}
module.exports={PRESETS,defaults,settings,move,selected,safeName,dimensions};

function selectedArtboardIds(activeLayers,boardIds){
 const ids=new Set(boardIds),result=new Set();
 for(const layer of activeLayers){let current=layer;const seen=new Set();while(current&&!seen.has(current.id)){seen.add(current.id);if(ids.has(current.id)){result.add(current.id);break;}current=current.parent;}}
 return result;
}
module.exports.selectedArtboardIds=selectedArtboardIds;
function selectionRows(boards,ids,previous=[]){
 const positions=new Map(previous.map((b,i)=>[b.id,i]));
 return boards.filter(b=>ids.has(b.id)).map(b=>({...b,selected:true})).sort((a,b)=>(positions.get(a.id)??Infinity)-(positions.get(b.id)??Infinity));
}
module.exports.selectionRows=selectionRows;
