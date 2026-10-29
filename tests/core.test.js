const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PRESETS,settings,move,selected,safeName,dimensions}=require('../src/model');
const pdf=require('../src/pdfService');
const {PDFDocument,PDFName,PDFRawStream}=require('pdf-lib');
test('stable IDs, subset and arbitrary ordering, duplicate and Unicode names',()=>{
 const rows=[{id:1,name:'相册',selected:true},{id:2,name:'相册',selected:false},{id:3,name:'Third',selected:true}];
 const ordered=move(rows,3,-2);assert.deepEqual(selected(ordered).map(r=>r.id),[3,1]);assert.deepEqual(rows.map(r=>r.id),[1,2,3]);assert.deepEqual(move(rows,999,1),rows);assert.equal(safeName('相册/a'),'相册_a');assert.equal(move(rows,1,-1)[0].id,1);
});
test('presets and invalid persisted settings',()=>{for(const [name,preset] of Object.entries(PRESETS))assert.equal(settings(preset).preset,name);assert.equal(settings({quality:999}).quality,100);assert.equal(settings({quality:-4}).quality,1);assert.equal(settings({quality:77}).preset,'Custom');assert.equal(settings({dpi:10}).dpi,150);assert.equal(settings({background:'bad'}).background,'#ffffff');});
test('physical size, orientation, downsampling without upsampling',()=>{const b={left:-100,top:0,right:500,bottom:300};assert.deepEqual(dimensions(b,300,150),{width:300,height:150,pageWidth:144,pageHeight:72});assert.equal(dimensions(b,72,300).width,600);});
for(const transparent of [false,true])test('real PDF assembly '+(transparent?'with soft alpha mask':'with JPEG') ,async()=>{
 const doc=await pdf.create();for(const [width,height] of [[2,3],[4,2],[1,1]])await pdf.add(doc,{width,height,pageWidth:width*72,pageHeight:height*72,data:new Uint8Array(width*height*4).fill(128)},{transparent,quality:80});
 const bytes=await pdf.save(doc);assert.ok(bytes.length>500);const reopened=await PDFDocument.load(bytes);assert.equal(reopened.getPageCount(),3);assert.deepEqual(reopened.getPages().map(p=>[p.getWidth(),p.getHeight()]),[[144,216],[288,144],[72,72]]);
 if(transparent){const x=reopened.getPage(0).node.Resources().lookup(PDFName.of('XObject'));const stream=reopened.context.lookup(x.values()[0]);assert.ok(stream.dict.has(PDFName.of('SMask')));}
});
test('Photoshop selection maps artboards and nested children to stable artboard IDs',()=>{
 const {selectedArtboardIds}=require('../src/model');const board={id:100,parent:null};const child={id:101,parent:{id:102,parent:board}};
 assert.deepEqual([...selectedArtboardIds([child,board,{id:200,parent:null}],[100,300])],[100]);
 assert.equal(selectedArtboardIds([],[100]).size,0);
});
test('only Photoshop-selected artboards enter the thumbnail queue, preserving page order',()=>{
 const {selectionRows}=require('../src/model');const boards=[{id:1,name:'One'},{id:2,name:'Two'},{id:3,name:'Three'}];
 assert.deepEqual(selectionRows(boards,new Set([1,3]),[{id:3},{id:1}]).map(b=>b.id),[3,1]);
 assert.deepEqual(selectionRows(boards,new Set()),[]);
 assert.deepEqual(selectionRows(boards,new Set([2])).map(b=>b.id),[2]);
});
