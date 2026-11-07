(function(root){'use strict';
// 展开状态与未提交的选项仅在本次页面中记忆，不改变学习档案与评分模型。
const sessions=new Map();
function reveal(target,focus=false){
 if(!target)return false;
 const d=target.closest('details.lesson-block');
 if(d){for(const sibling of d.parentElement.querySelectorAll(':scope>details.lesson-block'))sibling.open=sibling===d;d.open=true;d.dispatchEvent(new Event('toggle'));}
 if(focus)target.focus({preventScroll:false});
 return true;
}
function mount(box,{key,stage,preferred=null}){
 if(!box||!box.children.length)return;
 const saved=sessions.get(key)||{active:undefined,radios:{}};sessions.set(key,saved);
 const groups=[];let current=null;
 const start=(title,description,tag='')=>{current={title,description,tag,nodes:[]};groups.push(current);return current;};
 const append=node=>{if(!current)start(stage==='practice'?'记录自己的实际结果':'本步说明','沿用当前任务，保留实际输入。',stage==='practice'?'学生记录':'');current.nodes.push(node);};
 const separate=(node,title,description,tag='')=>{const g=start(title,description,tag);g.nodes.push(node);current=null;};
 for(const node of [...box.children]){
  if(node.tagName==='H3'){start(node.textContent,'');continue;}
  if(node.classList.contains('pain')){separate(node,'本节任务','','真实任务');continue;}
  if(node.classList.contains('prerequisites')){separate(node,'开始前确认','缺哪项基础，只回补对应任务。','前置');continue;}
  if(node.classList.contains('source-card')){const h=node.querySelector('h3'),title=node.dataset.resourceTitle||h?.textContent||'本节学习资料';separate(node,title,'',node.dataset.resourceRole||'学习资料');continue;}
  if(node.dataset.lessonTitle){separate(node,node.dataset.lessonTitle,'');continue;}
  if(node.classList.contains('example')){separate(node,node.querySelector('h3,b')?.textContent||'示范与观察','',stage==='check'?'自己的解释':stage==='practice'?'验收':'示范');continue;}
  if(node.classList.contains('result')){separate(node,node.querySelector('h3')?.textContent||'本轮检查结果','查看本次依据、回补入口或换情境重测。','检查结果');continue;}
  if(node.tagName==='DETAILS'){
   const s=node.querySelector(':scope>summary'),content=document.createElement('div');
   const title=s?.textContent||'补充内容';for(const child of [...node.childNodes])if(child!==s)content.append(child);
   if(!content.textContent.trim())content.textContent=title.includes('历史')?'当前还没有历史检查记录，提交后会在这里保留当时的依据。':'当前没有补充内容。';
   separate(content,title,title.includes('历史')?'保留原始轮次与当时依据，不用重写。':'',title.includes('历史')?'历史记录':'按需');continue;
  }
  append(node);
 }
 const fragment=document.createDocumentFragment(),blocks=[];
 for(const [index,g]of groups.entries()){
  const d=document.createElement('details');d.className='lesson-block';d.dataset.block='b'+index;d.name='lesson-'+key;
  const s=document.createElement('summary'),copy=document.createElement('span'),title=document.createElement('strong'),desc=document.createElement('small'),meta=document.createElement('span'),icon=document.createElement('span');
  copy.className='lesson-block-copy';title.textContent=g.title;copy.append(title);if(g.description){desc.textContent=g.description;copy.append(desc)}meta.className='lesson-block-meta';
  if(g.tag){const tag=document.createElement('span');tag.className='lesson-block-tag';tag.textContent=g.tag;meta.append(tag)}
  icon.className='lesson-block-icon';icon.textContent='+';icon.setAttribute('aria-hidden','true');meta.append(icon);s.append(copy,meta);
  const body=document.createElement('div');body.className='lesson-block-body';
  for(const node of g.nodes){const h=node.querySelector?.(':scope>h3');if(h?.textContent===g.title)h.classList.add('lesson-duplicate-title');}
  body.append(...g.nodes);d.append(s,body);blocks.push(d);fragment.append(d);
 }
 box.replaceChildren(fragment);
 const select=id=>{for(const d of blocks)d.open=d.dataset.block===id;saved.active=id;};
 let initial=saved.active===undefined?blocks[0]?.dataset.block:saved.active;
 if(preferred){const desired=box.querySelector(preferred)?.closest('details.lesson-block');if(desired)initial=desired.dataset.block;}
 select(initial);
 for(const d of blocks)d.addEventListener('toggle',()=>{if(!d.isConnected)return;if(d.open)select(d.dataset.block);else if(saved.active===d.dataset.block)saved.active=null;});
 for(const radio of box.querySelectorAll('input[type=radio]'))if(saved.radios[radio.name]!==undefined)radio.checked=radio.value===saved.radios[radio.name];
 box.addEventListener('change',event=>{const el=event.target;if(el.matches('input[type=radio]')&&!el.closest('.lesson-visual'))saved.radios[el.name]=el.value;});
 box.addEventListener('invalid',event=>reveal(event.target,true),true);
}
root.OrbitContentFold={mount,reveal};
})(globalThis);
