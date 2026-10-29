const {app,action}=require('photoshop');
const number=v=>Number(v&&v._value!==undefined?v._value:v);
async function snapshot(){
 if(!app.documents.length) return null;
 const doc=app.activeDocument; const boards=[];
 async function walk(layers){for(const layer of layers){
 const [d]=await action.batchPlay([{_obj:'get',_target:[{_ref:'layer',_id:layer.id},{_ref:'document',_id:doc.id}],_options:{dialogOptions:'dontDisplay'}}],{});
 if(d._obj==='error')throw Error(d.message||'Unable to read layers');
 if(d.artboardEnabled&&d.artboard){const b=d.artboard.artboardRect;boards.push({id:layer.id,name:layer.name,left:number(b.left),top:number(b.top),right:number(b.right),bottom:number(b.bottom),selected:true});}
 else if(layer.layers)await walk(layer.layers);
 }}
 await walk(doc.layers);
 return {id:doc.id,name:doc.title,resolution:Number(doc.resolution),history:doc.activeHistoryState?.id,boards};
}
function fingerprint(s){return JSON.stringify(s&&[s.id,s.history,s.resolution,s.boards.map(b=>[b.id,b.name,b.left,b.top,b.right,b.bottom])]);}
module.exports={snapshot,fingerprint};
