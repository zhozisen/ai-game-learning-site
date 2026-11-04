(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.LessonReader=api;})(globalThis,()=>{
 function render(container,text){
  const doc=container.ownerDocument;container.replaceChildren();let code=null,table=null,list=null;
  const inline=(el,line)=>{const re=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>]+)/g;let start=0,m;while((m=re.exec(line))){el.append(doc.createTextNode(line.slice(start,m.index)));const a=doc.createElement('a');a.textContent=m[1]||m[3];a.href=m[2]||m[3];a.target='_blank';a.rel='noopener';el.append(a);start=re.lastIndex;}el.append(doc.createTextNode(line.slice(start)));};
  for(const line of text.split('\n')){
   if(line.trim().startsWith('```')){if(code)code=null;else{code=doc.createElement('pre');container.append(code);}continue;}
   if(code){code.textContent+=line+'\n';continue;}
   if(!line.trim()){table=null;list=null;continue;}
   if(/^\s*\|/.test(line)){
    const cells=line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
    if(cells.every(x=>/^:?-+:?$/.test(x)))continue;
    const first=!table;if(first){table=doc.createElement('table');const wrap=doc.createElement('div');wrap.className='reading-table';wrap.append(table);container.append(wrap);}
    const tr=doc.createElement('tr');cells.forEach(x=>{const td=doc.createElement(first?'th':'td');inline(td,x);tr.append(td);});table.append(tr);continue;
   }
   table=null;
   const item=/^\s*(?:[-*]|\d+[.、])\s+(.*)$/.exec(line);
   if(item){if(!list){list=doc.createElement(/^\s*\d/.test(line)?'ol':'ul');container.append(list);}const li=doc.createElement('li');inline(li,item[1]);list.append(li);continue;}
   list=null;
   const heading=/^(#{1,6})\s+(.*)$/.exec(line);const el=doc.createElement(heading?'h'+Math.min(heading[1].length+1,6):'p');
   inline(el,heading?heading[2]:line);container.append(el);
  }
 }
 return {render};
});
