const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const manifest=require('../manifest.json');
test('Photoshop manifest uses a host object and declares modal API v2',()=>{
 assert.equal(manifest.manifestVersion,5);
 assert.equal(Array.isArray(manifest.host),false);
 assert.equal(manifest.host.app,'PS');
 assert.equal(manifest.host.data.apiVersion,2);
 assert.ok(fs.existsSync(manifest.main));
 assert.ok(manifest.entrypoints.some(e=>e.type==='panel'&&e.id==='artboardPdf'));
});
