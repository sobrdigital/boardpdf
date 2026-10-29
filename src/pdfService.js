const {PDFDocument,pushGraphicsState,popGraphicsState,concatTransformationMatrix,drawObject}=require('pdf-lib');
const encode=require('jpeg-js/lib/encoder');
async function create(){return PDFDocument.create();}
async function add(pdf,pixels,options){
 let image;
 if(options.transparent){
 const count=pixels.width*pixels.height;const rgb=new Uint8Array(count*3),alpha=new Uint8Array(count);
 for(let i=0;i<count;i++){rgb.set(pixels.data.subarray(i*4,i*4+3),i*3);alpha[i]=pixels.data[i*4+3];}
 const common={Type:'XObject',Subtype:'Image',Width:pixels.width,Height:pixels.height,BitsPerComponent:8};
 const mask=pdf.context.register(pdf.context.flateStream(alpha,{...common,ColorSpace:'DeviceGray'}));
 const ref=pdf.context.register(pdf.context.flateStream(rgb,{...common,ColorSpace:'DeviceRGB',SMask:mask}));
 image={ref};
 } else image=await pdf.embedJpg(Uint8Array.from(encode(pixels,options.quality).data));
 const page=pdf.addPage([pixels.pageWidth,pixels.pageHeight]);
 if(options.transparent){const key=page.node.newXObject('Artboard',image.ref);page.pushOperators(pushGraphicsState(),concatTransformationMatrix(pixels.pageWidth,0,0,pixels.pageHeight,0,0),drawObject(key),popGraphicsState());}
 else page.drawImage(image,{x:0,y:0,width:pixels.pageWidth,height:pixels.pageHeight});
}
async function save(pdf){pdf.setProducer('Artboard PDF Exporter / pdf-lib');return pdf.save();}
module.exports={create,add,save};
