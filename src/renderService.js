const {imaging,core}=require('photoshop');
const {dimensions}=require('./model');
const MAX_PIXELS=24000000;
async function render(doc,board,options){
 const size=dimensions(board,doc.resolution,options.dpi);
 const area=(board.right-board.left)*(board.bottom-board.top);
 if(area>MAX_PIXELS||size.width*size.height>MAX_PIXELS)throw Error('Artboard exceeds the 24 megapixel safety limit. Reduce its source dimensions before exporting.');
 let image;
 try {
 const result=await imaging.getPixels({documentID:doc.id,sourceBounds:{left:board.left,top:board.top,right:board.right,bottom:board.bottom},colorSpace:'RGB',colorProfile:'sRGB IEC61966-2.1',componentSize:8,applyAlpha:false});
 image=result.imageData;
 const data=await image.getData({chunky:true});
 const bounds=result.sourceBounds;const level=2**(result.level||0);
 const out=new Uint8Array(size.width*size.height*4);
 const bg=options.background.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16));
 for(let y=0;y<size.height;y++)for(let x=0;x<size.width;x++){
 const sx=Math.floor((board.left+(x+.5)*(board.right-board.left)/size.width)/level-bounds.left);
 const sy=Math.floor((board.top+(y+.5)*(board.bottom-board.top)/size.height)/level-bounds.top);
 const inside=sx>=0&&sy>=0&&sx<image.width&&sy<image.height;
 const i=(sy*image.width+sx)*image.components;const o=(y*size.width+x)*4;
 const a=inside?(image.hasAlpha?data[i+3]/255:1):0;
 for(let c=0;c<3;c++)out[o+c]=options.transparent?(inside?data[i+c]:0):Math.round((inside?data[i+c]:0)*a+bg[c]*(1-a));
 out[o+3]=options.transparent?Math.round(a*255):255;
 }
 return {...size,data:out};
 } finally {if(image)image.dispose();}
}
async function thumbnail(doc,board){return core.executeAsModal(async()=>{let image;try{const r=await imaging.getPixels({documentID:doc.id,sourceBounds:{left:board.left,top:board.top,right:board.right,bottom:board.bottom},targetSize:{width:64},colorSpace:'RGB',colorProfile:'sRGB IEC61966-2.1',componentSize:8,applyAlpha:true});image=r.imageData;return 'data:image/jpeg;base64,'+await imaging.encodeImageData({imageData:image,base64:true});}finally{if(image)image.dispose();}},{commandName:'Read artboard thumbnail'});}
module.exports={render,thumbnail,MAX_PIXELS};
