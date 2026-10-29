const {settings}=require('./model');
function load(){try{return settings(JSON.parse(localStorage.getItem('artboard-pdf-settings')||'{}'));}catch(_){return settings();}}
function save(value){try{localStorage.setItem('artboard-pdf-settings',JSON.stringify(settings(value)));}catch(_){/* Storage availability does not block export. */}}
module.exports={load,save};
