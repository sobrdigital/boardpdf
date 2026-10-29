const {app}=require('photoshop');
// Layer IDs change when a document is duplicated. Resolve the source ID to an
// index path, then follow that path in the private duplicate, even for equal names.
function layerPath(layers,id,prefix=[]){for(let i=0;i<layers.length;i++){const layer=layers[i];const path=prefix.concat(i);if(layer.id===id)return path;if(layer.layers){const found=layerPath(layer.layers,id,path);if(found)return found;}}return null;}
async function createSession(sourceID,context){
 const source=Array.from(app.documents).find(d=>d.id===sourceID);
 if(!source)throw Error('Source document was closed.');
 let copy;
 try{copy=await source.duplicate('Artboard PDF temporary',false);
 if(context.hostControl?.registerAutoCloseDocument)await context.hostControl.registerAutoCloseDocument(copy.id);
 const changed=[];
 return {
  id:copy.id,
  async prepare(id){
   while(changed.length){const [layer,visible]=changed.pop();layer.visible=visible;}
   const path=layerPath(source.layers,id);if(!path)throw Error('Artboard no longer exists.');
   let layers=copy.layers;
   for(const index of path){
    for(let i=0;i<layers.length;i++){const layer=layers[i];const visible=i===index;if(layer.visible!==visible){changed.push([layer,layer.visible]);layer.visible=visible;}}
    layers=layers[index].layers;
   }
  },
  async close(){if(Array.from(app.documents).some(d=>d.id===copy.id)){await copy.closeWithoutSaving();}}
 };
 }catch(error){if(copy)try{await copy.closeWithoutSaving();}catch(_){}throw error;}
}
module.exports={createSession,layerPath};
