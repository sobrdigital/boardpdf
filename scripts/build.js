const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
(async () => {
 fs.mkdirSync('dist', {recursive:true});
 await esbuild.build({entryPoints:['src/main.js'],outfile:'dist/main.js',bundle:true,platform:'browser',format:'cjs',target:'es2020',external:['photoshop','uxp'],metafile:true,plugins:[{name:'uxp-jpeg-bytes',setup(b){b.onLoad({filter:/jpeg-js[\\/]lib[\\/]encoder\.js$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace('return Buffer.from(byteout);','return new Uint8Array(byteout);'),loader:'js'}));}}]}).then(r=>fs.writeFileSync('build-meta.json',JSON.stringify(r.metafile,null,2)));
 for (const f of ['manifest.json','index.html','styles.css','LICENSE']) fs.copyFileSync(f,path.join('dist',f));
 fs.mkdirSync('dist/licenses',{recursive:true});
 for(const name of ['pdf-lib','jpeg-js','pako','@pdf-lib/standard-fonts','@pdf-lib/upng']) {
 const root=path.dirname(require.resolve(name+'/package.json'));
 for(const f of fs.readdirSync(root).filter(f=>/^license/i.test(f))) fs.copyFileSync(path.join(root,f),'dist/licenses/'+name.replace('/','-')+'-'+f);
 }
 console.log('Load dist/manifest.json in UXP Developer Tool.');
})().catch(e=>{console.error(e);process.exitCode=1;});
