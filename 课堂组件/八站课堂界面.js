(function(){'use strict';const C=OrbitCatalog,M=OrbitV2,P=LearningProfile,PS=ProfileStorage,W=OrbitWorks,$=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let state,revision,locked=false,task=null,station=C.stations[0],track='required',variant=0,profile=null,works=[],profileRev=null,routeLayout=null,currentWorkspace='journey';
const labels={required:'必修',elective:'选修',extension:'拓展'},stages=['intro','demo','practice','check','summary'],stageNames=['真实任务','资料与示范','AI协作实践','解释与验证','知识总结'];
function notify(text){$('#saveStatus').textContent=text;$('#saveStatus').setAttribute('role','status')}
try{state=M.load(localStorage,C);revision=localStorage.getItem(M.KEY)===null?null:state.revision}catch(e){state=M.createState();revision=null;locked=true;setTimeout(()=>notify(e.message),0)}
try{profile=PS.loadProfile(localStorage);profileRev=profile?.revision??null}catch(e){setTimeout(()=>notify('个人档案不可读取，请先备份：'+e.message),0)}
function persist(next){state=next;try{if(locked)throw Error('当前记录冲突或损坏，请先导出草稿，再刷新核对');M.save(localStorage,next,revision);revision=next.revision;notify('已保存到当前浏览器 · 工程另行备份');refreshHome();return true}catch(e){locked=true;notify('保存失败，当前草稿仍在本页：'+e.message);return false}}
function patch(values,redraw=true){if(!task)return false;const saved=persist(M.update(C,state,task.id,values));if(redraw)renderLesson();return saved}
function goStage(nextStage){
 const values={stage:nextStage};
 if(rec().stage==='demo')values.demoRead=true;
 return patch(values);
}
function finishLesson(){
 const r=rec(),missing=[];
 if(!r.demoRead)missing.push({stage:'demo',text:'查看本节资料与示范'});
 if(!r.practice.note.trim()||r.practice.outcome!=='matches')missing.push({stage:'practice',text:'补充实践结果，并核对实际状态'});
 if(!r.notes?.explanation?.trim()||!evidence(task.id).passed)missing.push({stage:'check',text:'补充自己的解释，并通过当前检查'});
 const box=$('#completion-missing');
 if(missing.length){
  box.hidden=false;
  box.innerHTML='<p>完成本节前，请补齐以下内容：</p><ul>'+missing.map(item=>`<li><button data-missing-stage="${item.stage}">${esc(item.text)} →</button></li>`).join('')+'</ul>';
  box.querySelectorAll('[data-missing-stage]').forEach(button=>button.onclick=()=>goStage(button.dataset.missingStage));
  OrbitContentFold.reveal(box,true);
  notify('记录已保存，请补齐列出的内容后再完成本节。');
  return;
 }
 if(!patch({summaryRead:true},false))return;
 if(!evidence(task.id).complete){notify('当前记录尚不符合完成要求，请返回检查。');return}
 const list=C.tasks.filter(item=>item.stationId===station.id&&item.track===track);
 const next=list[list.findIndex(item=>item.id===task.id)+1];
 if(next)openTask(next.id);
 else closeDialog($('#course-dialog'));
 notify('本节已完成，学习进度已更新。');
}
function evidence(id){return M.evidence(C,state,id)}
function stationOverview(){const box=$('#station-overview');if(box.dataset.station!==station.id){box.open=false;box.dataset.station=station.id}$('#station-outcome').textContent='本站成果：'+(station.outcome||station.title);box.querySelector('.station-concepts').innerHTML=`<p class="muted small">这里概括本站全部内容；先学必修，其他按自己的项目需要选择。</p><ul>${(station.conceptGroups||[]).map(g=>{const first=C.tasks.find(t=>g.taskIds.includes(t.id)&&t.track==='required')||C.tasks.find(t=>g.taskIds.includes(t.id));return `<li><strong>${esc(g.title)}</strong><p>${esc(g.purpose)}</p>${first?`<button data-group-task="${esc(first.id)}">从「${esc(first.title)}」开始 · ${labels[first.track]} ↗</button>`:''}</li>`}).join('')}</ul>`;box.querySelectorAll('[data-group-task]').forEach(b=>b.onclick=()=>openTask(b.dataset.groupTask))}
function synthesisRelations(){return (task.synthesis?.branches||[]).map(b=>`<div class="synthesis-branch"><dt>${esc(b.point)}</dt><dd>核对：${esc(b.observe)}</dd></div>`).join('')}
function evidenceGuide(){return `<h4>核对要点</h4><ol class="evidence-map">${(task.synthesis?.branches||[]).map(b=>`<li><strong>${esc(b.point)}</strong><p>${esc(b.observe)}</p></li>`).join('')}</ol><p class="muted small">把实际观察简记在本轮依据中，可引用已有工程记录。</p>${OrbitLessonVisuals.has(task.id)?'<button type="button" id="revisit-visual">回看本节图示</button>':''}`}
function rec(){return state.records[task.id]||{stage:'intro',notes:{},practice:{outcome:'unstarted',note:''},checks:[],helpCount:0}}
function openDialog(id){closeProfileMenu(false);closeDrawer(false);const d=$(id);if(!d.open)d.showModal()}
function closeDialog(d){if(d.id==='tour-dialog')try{localStorage.setItem('orbit-onboarding-v2','seen')}catch{}d.querySelectorAll('iframe').forEach(f=>f.remove());d.close()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-close]');if(b)closeDialog(b.closest('dialog'))});
function chooseNext(){return M.recommend(C,state,profile).task}
function createJourneyMap(){const columns=3,width=1180,firstX=180,stepX=410,firstY=65,stepY=190;const points=C.stations.map((st,i)=>{const row=Math.floor(i/columns),column=row%2?columns-1-i%columns:i%columns;return{x:firstX+column*stepX,y:firstY+row*stepY}});const height=Math.max(firstY,points.at(-1)?.y||firstY);const segments=points.slice(1).map((q,i)=>{const p=points[i];return p.y===q.y?`M${p.x} ${p.y} H${q.x}`:`M${p.x} ${p.y} A${stepY/2} ${stepY/2} 0 0 ${Math.floor(i/columns)%2?0:1} ${q.x} ${q.y}`});routeLayout={points,segments};$('#journey-orbit').setAttribute('viewBox',`0 0 ${width} ${height}`);$('#route-canvas').style.setProperty('--route-aspect',`${width} / ${height}`);$('#journey-track').setAttribute('d',segments.join(' '));$('#route-count').textContent=C.stations.length+' 个入口 · 点击站点进入学习';$('#map-stations').innerHTML=C.stations.map((st,i)=>`<button class="station n${st.number}" data-station="${st.id}" style="left:${points[i].x/width*100}%;top:${points[i].y/height*100}%"><span class="dot" aria-hidden="true"><span class="num">${String(st.number).padStart(2,'0')}</span></span><span class="station-label"><strong>${esc(st.title)}</strong><small></small></span></button>`).join('')}
function refreshHome(){const next=chooseNext(),statuses=C.stations.map(st=>M.stationStatus(C,state,st.id));$('#currentLabel').textContent=next?'下一步 · '+C.stations.find(st=>st.id===next.stationId).title+' / '+next.title:'必修学习已记录 · 可继续完善作品';$('#start').textContent=next?'继续学习 ↗':'回看学习旅程 ↗';$('#student-name').textContent=profile?.name||'填写姓名';$('#student-avatar').textContent=Array.from(profile?.name||'我')[0].toUpperCase();$('#profile-trigger').setAttribute('aria-label','我的档案，'+(profile?.name||'填写姓名'));if(currentWorkspace==='growth')drawRadar($('#workspace-growth-body'));for(const [i,st]of C.stations.entries()){const b=$(`[data-station="${st.id}"]`),status=statuses[i],current=next?.stationId===st.id&&!status.complete;b.classList.toggle('completed',status.complete);b.classList.toggle('current',current);b.classList.toggle('connected',status.complete&&!!statuses[i+1]?.complete);b.querySelector('small').textContent=status.sharedTotal?'本站 '+status.ownDone+' / '+status.ownTotal+' · 共用发布 '+status.sharedDone+' / '+status.sharedTotal:(status.complete?'必修已完成 · 可复习':status.started?'已完成 '+status.ownDone+' / '+status.ownTotal+' 项必修':(current?'当前学习 · ':'')+status.ownTotal+' 项必修');b.setAttribute('aria-label',String(st.number).padStart(2,'0')+' '+st.title+'，'+(status.complete?'已完成':current?'当前学习':'待学习'));if(current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')}$('#route-progress-text').textContent='已完成 '+statuses.filter(st=>st.complete).length+' / '+C.stations.length+' 站';if(routeLayout)$('#journey-progress').innerHTML=routeLayout.segments.map((d,i)=>statuses[i].complete&&statuses[i+1].complete?`<path class="journey-completed" d="${d}"/>`:'').join('')}
function openStation(value,id){if($('#catalog-dialog').open)$('#catalog-dialog').close();showWorkspace('journey');const requested=M.resolveTask(C,id);if((id&&!requested)||(value!==null&&value!==undefined&&!C.stations.some(s=>s.id===value||String(s.number)===String(value))))notify('未找到原来的学习位置，已选择可用站点；请从左侧目录继续。');station=M.resolveStation(C,value,id);let t=M.resolveTask(C,id);if(!t)t=C.tasks.find(x=>x.id===state.positions[station.id])||C.tasks.find(x=>x.stationId===station.id&&x.track==='required');track=t?.track||'required';task=t;variant=t?((state.records[t.id]?.checks?.at(-1)?.variant??0)):0;openDialog('#course-dialog');renderCourse()}
function openTask(id){const t=M.resolveTask(C,id);if(t)openStation(t.stationId,t.id);else notify('这个历史位置没有当前任务，请从站点目录重新选择；旧记录仍保留。')}
function renderCourse(){$('#class-title').textContent=String(station.number).padStart(2,'0')+' / '+station.title;stationOverview();$('#track-guidance').textContent=C.tracks.find(k=>k.id===track)?.guidance||'';$('#tracks').innerHTML=C.tracks.map(k=>`<button data-track="${k.id}" class="${k.id===track?'active':''}" aria-pressed="${k.id===track}">${k.title}</button>`).join('');$('#tracks').querySelectorAll('button').forEach(b=>b.onclick=()=>{track=b.dataset.track;task=C.tasks.find(t=>t.stationId===station.id&&t.track===track);variant=0;renderCourse()});const list=C.tasks.filter(t=>t.stationId===station.id&&t.track===track);$('#unit-list').innerHTML=list.map(t=>`<button data-task="${t.id}" class="${t.id===task?.id?'active':''}"><span>${evidence(t.id).complete?'●':'○'}</span><span>${esc(t.title)}<small>${evidence(t.id).complete?'流程已记录':labels[t.track]}</small></span></button>`).join('')+(station.id==='production'&&track==='required'?'<h3>同一项目的发布与反馈</h3>'+C.sharedTasks.map(r=>{const t=C.tasks.find(t=>t.id===r.taskId);return `<button data-task="${t.id}"><span>↗</span><span>${esc(t.title)}<small>共用第8站记录，不重复验收</small></span></button>`}).join(''):'');$('#unit-list').insertAdjacentHTML('beforeend',`<details class="station-library"><summary>本站资料库 · 按需回查</summary><p class="muted small">完整参考原稿，不是本节必读清单。优先跟随右侧的指定阅读范围。</p>${(station.referenceDocs||[]).map(d=>`<a class="doc-link" href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)} ↗</a>`).join('')}</details>`);$('#unit-list').querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>openTask(b.dataset.task));$('#catalog-caption').textContent='本站目录 · '+list.length+' 项'+(station.id==='production'&&track==='required'?' ＋ 共用发布 '+C.sharedTasks.filter(r=>r.stationId===station.id).length+' 项':'');$('#catalog-toggle').textContent='知识目录 · '+labels[track];renderLesson()}
function resources(){return task.resources.map(r=>{const uniquePurpose=r.purpose&&r.purpose.trim()!==task.knowledge.trim();const body=`<p class="eyebrow">${esc(r.kind)} · 阅读 ${r.order||1}</p>${uniquePurpose?`<p><b>用途：</b>${esc(r.purpose)}</p>`:''}<p><b>阅读范围：</b>${esc(r.scope)}</p><a href="${esc(r.url)}" target="_blank" rel="noopener">${r.sourcePath?'打开本节精简资料':'打开原资料'} ↗</a> <button data-collect-resource="${esc(r.id)}">收藏</button>`;return r.role==='主学'?`<article class="source-card" data-resource-title="${esc(r.title)}" data-resource-role="${esc(r.role)}">${body}</article>`:`<details data-reading-order="${r.order||1}"><summary>${esc(r.role)} · ${esc(r.title)}</summary>${body}</details>`}).join('')}
function openLearningHelp(){patch({helpCount:(rec().helpCount||0)+1},false);$('#help-body').innerHTML=task.help.map((h,n)=>`<details ${n===0?'open':''}><summary>提示 ${n+1}</summary><p>${esc(h)}</p></details>`).join('')+`<p>当前任务：${esc(task.title)}</p>`;openDialog('#help-dialog')}
function renderLesson(preferred=null){$('#lesson').scrollTop=0;if(!task){$('#lesson').innerHTML='<p>导读只设置必修，请从必修开始。</p>';return}const r=rec(),stage=r.stage||'intro',i=stages.indexOf(stage),last=r.checks.at(-1),e=evidence(task.id);$('#lesson').innerHTML=`<p class="eyebrow">${labels[track]} / ${String(C.tasks.filter(t=>t.stationId===station.id&&t.track===track).findIndex(t=>t.id===task.id)+1).padStart(2,'0')}</p><h2 id="lesson-title">${esc(task.title)}</h2><nav class="flow-nav" aria-label="本单元学习流程">${stages.map((s,n)=>`<button data-stage="${s}" aria-current="${s===stage?'step':'false'}" class="${s===stage?'active':''}">${n+1} ${stageNames[n]}</button>`).join('')}</nav><div id="stage-content"></div><div class="flow-actions"><button id="flow-prev" ${i===0?'disabled':''}>上一步</button><button id="flow-next" class="primary">${['查看资料与示范 →','开始协作实践 →','解释并换条件验证 →','查看知识总结 →','完成本节'][i]}</button></div><p class="muted small">${e.complete?'本单元流程已记录。':''}站内判断与工程自查分开；工程仍需实际运行和必要的教师核对。</p>`;
const box=$('#stage-content');if(stage==='intro')box.innerHTML=`<div class="pain"><p>${esc(task.pain)}</p><p><b>本节任务：</b>${esc(task.practice)}</p><p><b>完成标准：</b>${esc(task.acceptance)}</p><p><b>关键知识：</b>${esc(task.knowledge)}</p></div><p class="prerequisites muted">开始前：${task.prerequisites.length?'先完成 '+task.prerequisites.map(id=>`<button data-prereq="${esc(id)}">${esc(C.tasks.find(t=>t.id===id)?.title||id)} ↗</button>`).join('；'):'无需前置，从这个任务开始。'}</p>`;
if(stage==='demo'){
 const readingPath=task.readingPath||task.knowledge;
 const visual=OrbitLessonVisuals.render(task.id,esc,{conclusion:task.synthesis?.conclusion||task.knowledge,readingPath});
 const textDemo=`<h3>本节阅读顺序</h3><p class="reading-path">${esc(readingPath)}</p><article class="example"><h3>最少必要示范</h3><p>${esc(task.example)}</p></article>`;
 box.innerHTML=(visual||textDemo)+resources();
}
if(stage==='practice')box.innerHTML=`<h3>动手完成</h3><section class="practice-instructions"><p>${esc(task.practice)}</p><details class="inline-criteria"><summary>查看本节完成标准</summary><p>${esc(task.acceptance)}</p></details></section><h3>记录实际结果</h3><label>工程版本、操作与实际结果<textarea id="practice-note" rows="5" placeholder="可引用已有工程日志或成果位置，补充实际观察；卡住时如实记录。">${esc(r.practice.note)}</textarea></label><label>当前实际状态<select id="practice-outcome"><option value="unstarted">尚未执行</option><option value="matches">实际结果符合本任务验收（学生自报）</option><option value="attempted">已尝试但尚未核对完整</option><option value="blocked">结果不符合或仍有卡点</option></select></label>`;
if(stage==='check'){const qs=M.questions(task,variant),isCurrent=last&&last.contentVersion===task.contentVersion&&last.checksVersion===task.checksVersion;box.innerHTML=`<section class="example"><h3>解释与核对</h3><p>本节重点：${esc(task.knowledge)}</p><label>关键关系与依据<textarea id="explanation-note" maxlength="12000" rows="4" placeholder="它怎样起作用？为什么这样做？对应哪些节点、文件、操作或运行结果？可用简短文字描述关系图，不要求长报告。">${esc(r.notes?.explanation||'')}</textarea></label><button id="explanation-help">解释不清，定向补学</button><p class="small muted">多轮仍卡住时，拆小任务或向教师求助。</p>${evidenceGuide()}</section><section data-lesson-title="换条件验证"><p>情境 ${variant+1} / 2 · 先判断，再按新条件核对实际结果。需要时随时打开帮助。</p><form id="check-form">${qs.map((q,n)=>`<fieldset><legend>${n+1}. ${esc(q.prompt)}</legend>${q.options.map((v,j)=>`<label class="option"><input type="radio" name="q${n}" value="${j}" required>${esc(v)}</label>`).join('')}</fieldset>`).join('')}<label>本轮依据或实际结果<textarea id="check-note" rows="3" placeholder="${esc((task.synthesis?.branches||[]).map(b=>b.observe).join('；'))}">${esc(r.notes?.['check'+variant]||'')}</textarea></label><button id="check-submit" class="primary" type="submit">提交本轮检查</button></form>${last?`<div class="result" id="check-result"><h3>${!isCurrent?'历史版本记录，当前检查尚需重做':e.passed?'本轮方案符合，工程自查已记录':'本轮需要回补'}</h3>${M.questions(task,last.variant).map((q,n)=>`<p>${isCurrent&&last.answers[n]===q.answer?'符合':'请核对'}：${esc(q.explanation)}</p>`).join('')}${!e.passed?`<p>回补这次目标：${esc(task.acceptance)}</p><button id="remediate-demo">回看本节示范与指定资料</button>`:''}<p>${last.helpCount?'记录过帮助；这不证明独立掌握。':'本页未请求提示，不证明未使用其他帮助。'}</p><button id="retry-check">换另一情境检查</button></div>`:''}</section>${r.checks.length?`<details><summary>查看历史检查 · ${r.checks.length}次</summary>${r.checks.map(a=>`<p>情境${a.variant+1} · ${a.passed?'符合本轮要求':'需要回补'} · ${esc(a.time)} · 检查版本${a.checksVersion} · 工程学生自查</p><p>${esc(a.note||'此历史轮次未留依据')}</p><p>当时的解释：${esc(a.explanation||'旧轮次未记录解释')}</p>`).join('')}</details>`:''}`}
if(stage==='summary')box.innerHTML=`<h3>知识总结</h3><p class="synthesis-conclusion">${esc(task.synthesis?.conclusion||task.knowledge)}</p><dl class="synthesis-relations">${synthesisRelations()}</dl><p class="synthesis-boundary"><b>适用边界：</b>${esc(task.synthesis?.boundary||'结合当前任务和实际工程判断。')}</p><h3>我的理解与后续</h3><p><b>已有解释：</b>${esc(r.notes?.explanation||(r.checks.length?'这份历史记录尚无解释，可返回解释与验证补充。':'尚无解释记录，可返回解释与验证补充。'))}</p><label>经验补记（选填）<textarea id="summary-note" rows="3" placeholder="可以引用同一份工程记录，只补想记住的新经验。">${esc(r.notes?.summary||'')}</textarea></label><p>${e.passed?'当前检查已有符合记录。':'当前检查尚需完成或回补。'} 实践：${esc(({unstarted:'尚未实践',matches:'学生自报符合验收',attempted:'已尝试，尚未完整核对',blocked:'存在卡点或结果不符'})[r.practice.outcome]||'待核对')}。</p><div id="completion-missing" role="alert" tabindex="-1" hidden></div><button id="summary-check">返回解释与验证</button>`;
OrbitContentFold.mount(box,{key:task.id+'::'+stage+'::'+(stage==='check'?variant:0),stage,preferred});
if(stage==='demo'){
 OrbitLessonVisuals.bind(box,task.id);
 const worksLink=box.querySelector('[data-visual-works]');
 if(worksLink)worksLink.onclick=()=>{
  closeDialog($('#course-dialog'));
  openWorks();
  const guide=$('#work-publish-guide');
  guide.open=true;
  guide.querySelector('summary').focus();
 };
}
const revisitVisual=$('#revisit-visual');
if(revisitVisual)revisitVisual.onclick=()=>{
 patch({stage:'demo'},false);
 renderLesson('.lesson-visual');
 $('.lesson-visual')?.closest('details')?.querySelector('summary')?.focus();
};
$('#lesson').querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>goStage(button.dataset.stage));
$('#lesson').querySelectorAll('[data-prereq]').forEach(button=>button.onclick=()=>openTask(button.dataset.prereq));
$('#flow-prev').onclick=()=>goStage(stages[i-1]);
$('#flow-next').onclick=()=>stage==='summary'?finishLesson():goStage(stages[i+1]);
if(stage==='check'){
 const draft=r.notes?.['checkAnswers'+variant];
 if(draft){
  try{
   const answers=JSON.parse(draft);
   if(Array.isArray(answers))$('#check-form').querySelectorAll('input[type=radio]').forEach(input=>{input.checked=String(answers[Number(input.name.slice(1))])===input.value});
  }catch{}
 }
 $('#check-form').onchange=event=>{
  if(!event.target.matches('input[type=radio]'))return;
  const data=new FormData($('#check-form'));
  const answers=M.questions(task,variant).map((_,index)=>data.has('q'+index)?Number(data.get('q'+index)):null);
  patch({notes:{...rec().notes,['checkAnswers'+variant]:JSON.stringify(answers)}},false);
 };
}
if($('#practice-note'))$('#practice-note').oninput=e=>patch({practice:{...rec().practice,note:e.target.value}},false);if($('#practice-outcome')){$('#practice-outcome').value=r.practice.outcome;$('#practice-outcome').onchange=e=>patch({practice:{...rec().practice,outcome:e.target.value}},false)}
if($('#explanation-note'))$('#explanation-note').oninput=e=>patch({notes:{...rec().notes,explanation:e.target.value}},false);if($('#explanation-help'))$('#explanation-help').onclick=()=>{openLearningHelp();const prompt='本节任务：'+task.title+'\n关键知识：'+task.knowledge+'\n我的解释：'+(rec().notes?.explanation||'尚不清楚')+'\n请结合本节资料和我提供的实际工程，先指出解释中一个具体缺口，给局部提示或小示例，并引用节点、文件或资料依据。让我重新解释，再给一个变化条件让我预测并运行核对。不要替我写最终解释；没有实际工程结果时不要宣称已经验证。';$('#help-body').insertAdjacentHTML('afterbegin',`<h3>定向补学提示词</h3><textarea id="explanation-prompt" readonly rows="8">${esc(prompt)}</textarea><p>复制到自己的 AI 工具，并补充相关工程片段。也可回看本节资料；多轮仍卡住时拆小任务或向教师求助。</p>`)};
if($('#check-note'))$('#check-note').oninput=e=>patch({notes:{...rec().notes,['check'+variant]:e.target.value}},false);if($('#check-form'))$('#check-form').onsubmit=e=>{e.preventDefault();if(!rec().notes?.explanation?.trim()){notify('先用自己的方式解释关键关系并指出依据，再提交验证。');OrbitContentFold.reveal($('#explanation-note'),true);return}if(!rec().notes?.['check'+variant]?.trim()){notify('先简短记录本轮依据或实际结果；未执行不要选已核对。');OrbitContentFold.reveal($('#check-note'),true);return}const f=new FormData(e.target);persist(M.submit(C,state,task.id,M.questions(task,variant).map((_,n)=>Number(f.get('q'+n))),variant));renderLesson('#check-result')};if($('#remediate-demo'))$('#remediate-demo').onclick=()=>patch({stage:'demo'});if($('#retry-check'))$('#retry-check').onclick=()=>{variant=1-variant;renderLesson('#check-form')};if($('#summary-note'))$('#summary-note').oninput=e=>patch({notes:{...rec().notes,summary:e.target.value}},false);if($('#summary-check'))$('#summary-check').onclick=()=>patch({stage:'check'});
$('#lesson').querySelectorAll('[data-collect-resource]').forEach(button=>{
 button.onclick=()=>{
  const resource=task.resources.find(item=>item.id===button.dataset.collectResource);
  const url=new URL(resource.url,document.baseURI).href;
  collect('resources',{title:resource.title,url,scope:resource.scope});
 };
});}
function profileSave(action,expectedRevision=profileRev){try{if(!profile){notify('请先填写姓名，记录归入自己的本地档案。');openProfile('settings');return false}const p=P.applyProfileAction(profile,action);PS.saveProfile(localStorage,p,{expectedRevision});profile=p;profileRev=p.revision;refreshHome();notify('个人档案已保存');return true}catch(e){notify('档案保存失败：'+e.message);return false}}
function openProfile(tab='overview'){try{profile=PS.loadProfile(localStorage);profileRev=profile?.revision??null}catch(e){notify('个人档案不可读取，原值未覆盖：'+e.message);return}const formRevision=profileRev;openDialog('#profile-dialog');const records=[['resources','我的资料'],['terms','英文词'],['works','我的作品'],['reviews','复习']];
const recordOpen=$('#profile-records')?.open||records.some(([id])=>id===tab);
const profileButton=([id,title])=>`<button data-profile="${id}"${tab===id?' class="active" aria-current="page"':''}>${title}</button>`;
$('#profile-nav').innerHTML=[['overview','继续学习'],['problems','我的问题'],['settings','个人设置']].map(profileButton).join('')+`<details id="profile-records"${recordOpen?' open':''}><summary>我的记录</summary><div>${records.map(profileButton).join('')}</div></details>`;
$('#profile-nav').querySelectorAll('button').forEach(b=>b.onclick=()=>openProfile(b.dataset.profile));const body=$('#profile-body');if(tab==='settings'){body.innerHTML=`<form id="profile-form"><label>姓名（用于显示与作品申请）<input name="name" maxlength="30" required value="${esc(profile?.name||'')}"></label><label>学习目标<input name="goal" value="${esc(profile?.goal||'')}"></label><label>已有基础<input name="background" value="${esc(profile?.background||'')}"></label><label>我的游戏<input name="project" value="${esc(profile?.project||'')}"></label><button type="submit" class="primary">保存个人设置</button></form><p>当前浏览器一份档案，姓名不是云账号。换电脑请导出备份；旧记录仅作为历史，不自动完成新课程。</p>`;$('#profile-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),vals=Object.fromEntries(f);try{let p;if(profile)p=P.applyProfileAction(profile,{type:'settings',values:vals});else{p=P.createProfile({id:crypto.randomUUID(),name:vals.name});Object.assign(p,vals)}PS.saveProfile(localStorage,p,{expectedRevision:formRevision});profile=p;profileRev=p.revision;refreshHome();openProfile('overview')}catch(err){notify(err.message)}};return}
if(tab==='growth'){closeDialog($('#profile-dialog'));showWorkspace('growth');$('#workspace-title').focus();return}if(tab==='overview'){const n=chooseNext(),recommend=M.recommend(C,state,profile);body.innerHTML=`<h3>${esc(profile?.name||'同学')}的学习档案</h3><p>目标：${esc(profile?.goal||'尚未填写')}</p><p>当前游戏：${esc(profile?.project||'尚未填写')}</p><p>主线已记录 ${C.tasks.filter(t=>t.track==='required'&&evidence(t.id).complete).length} / ${C.tasks.filter(t=>t.track==='required').length} 项。工程自查与站内检查分别记录。</p><button id="profile-continue" class="primary">${n?'继续：'+esc(n.title):'回看当前作品'}</button><p>${esc(recommend.reason)}${recommend.reviewId?' · 请换条件再检查一次':''}</p><button id="profile-radar">查看成长雷达</button><button id="profile-project">全流程项目记录</button><button id="profile-legacy">旧记录与成绩</button>${recommend.reviewId?'<button id="review-done">本轮复习已核对，3天后再看</button>':''}<h3>我还没懂什么</h3>${(profile?.problems||[]).filter(p=>p.status==='open').map(p=>`<p>${esc(p.text)}</p>`).join('')||'<p>暂无主动记录的卡点。</p>'}`;$('#profile-continue').onclick=()=>{closeDialog($('#profile-dialog'));if(n)openTask(n.id)};if($('#review-done'))$('#review-done').onclick=()=>{const r=profile.reviews.find(x=>x.id===recommend.reviewId);if(profileSave({type:'upsert',collection:'reviews',item:{...r,lastReviewedAt:new Date().toISOString(),dueAt:new Date(Date.now()+3*86400000).toISOString()}}))openProfile()};$('#profile-radar').onclick=()=>openProfile('growth');$('#profile-project').onclick=openProject;$('#profile-legacy').onclick=showLegacy;return}
const list=profile?.[tab]||[];body.innerHTML=`<button id="profile-add">添加记录</button>${list.map(x=>`<article class="source-card"><h3>${esc(x.title||x.english||x.text||'记录')}</h3><p>${esc(x.chinese||x.scope||x.tried||x.independentWork||'')}</p><p>${esc(x.solution||x.example||x.reason||'')}</p>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener">打开链接 ↗</a>`:''}${x.issueUrl?`<p><a href="${esc(x.issueUrl)}" target="_blank" rel="noopener">查看申请记录 ↗</a></p>`:''}<p class="muted">${esc(x.source||'学生记录')} ${esc(x.publishStatus||x.status||'')} ${esc(x.version||'')} ${esc(x.dueAt||'')}</p><button data-edit="${x.id}">编辑</button>${tab==='problems'?`<button data-resolve="${x.id}">${x.status==='open'?'标记已解决':'重新打开'}</button>`:''}${x.taskId?`<button data-return="${x.taskId}">返回学习任务</button>`:''}<button data-remove="${x.id}">删除</button></article>`).join('')||'<p>暂无记录。</p>'}`;$('#profile-add').onclick=()=>collect(tab);body.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>collect(tab,list.find(x=>x.id===b.dataset.edit)));body.querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>{const x=list.find(x=>x.id===b.dataset.resolve);if(profileSave({type:x.status==='open'?'resolve':'reopen',id:x.id,solution:x.solution||'学生确认已解决，原题结果仍保留'}))openProfile(tab)});body.querySelectorAll('[data-return]').forEach(b=>b.onclick=()=>{closeDialog($('#profile-dialog'));openTask(b.dataset.return)});body.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('删除这条个人记录？不会删除原始学习检查。')&&profileSave({type:'remove',collection:tab,id:b.dataset.remove}))openProfile(tab)})}
function collect(kind,initial={}){try{profile=PS.loadProfile(localStorage);profileRev=profile?.revision??null}catch(e){notify('档案无法读取，原值未覆盖：'+e.message);return}if(initial.id){const current=profile?.[kind]?.find(x=>x.id===initial.id);if(!current){notify('这条记录已被另一页面删除，请刷新列表，草稿未覆盖。');return}initial=current}const formRevision=profileRev;if(!profile){openProfile('settings');return}const fields={problems:[['text','问题'],['tried','已经尝试'],['solution','解决记录']],resources:[['title','资料标题'],['url','链接'],['scope','阅读范围'],['reason','用途与备注']],terms:[['english','英文词'],['chinese','中文含义'],['example','课程中的例子']],works:[['title','作品名'],['url','可玩链接'],['repoUrl','源码链接'],['issueUrl','已提交的GitHub申请网址（可选）'],['version','版本'],['independentWork','我实际做了什么']],reviews:[['title','复习目标'],['dueAt','计划复查时间（ISO日期时间）']]};if(!fields[kind])return;$('#entry-body').innerHTML=`<form id="entry-form">${fields[kind].map(([k,n])=>`<label>${n}<textarea name="${k}" ${k===fields[kind][0][0]?'required':''}>${esc(initial[k]||'')}</textarea></label>`).join('')}<button class="primary" type="submit">保存到我的档案</button></form>`;$('#entry-form').onsubmit=e=>{e.preventDefault();const item={...initial,...Object.fromEntries(new FormData(e.target)),id:initial.id||crypto.randomUUID(),taskId:initial.taskId||task?.id||'',unitId:initial.unitId||task?.unitId||''};if(kind==='reviews'&&item.dueAt){if(!Number.isFinite(Date.parse(item.dueAt))){notify('日期格式不正确，请填写例如2026-11-10 18:00');return}item.dueAt=new Date(item.dueAt).toISOString();}if(kind==='works'&&item.url){try{W.playUrl(item.url)}catch(err){notify(err.message);return}item.publishStatus=item.issueUrl?'已记录提交地址（学生自报，未核验上架）':initial.publishStatus||'本机记录，未核验上架'}if(profileSave({type:'upsert',collection:kind,item},formRevision)){closeDialog($('#entry-dialog'));openProfile(kind)}};openDialog('#entry-dialog')}
function drawRadar(body){const specs=[['开发基础',['git','godot']],['AI协作',['ai']],['游戏分析',['dissection']],['游戏设计',['lifecycle','architecture']],['作品实现',['production','publishing']]],dims=specs.map(([name,ids])=>{const ts=C.tasks.filter(t=>t.track==='required'&&ids.includes(t.stationId));return{name,total:ts.length,checked:ts.filter(t=>evidence(t.id).passed).length,gaps:ts.filter(t=>!evidence(t.id).passed)}});const pt=(i,r)=>[220+Math.sin(i*Math.PI*2/5)*r,165-Math.cos(i*Math.PI*2/5)*r].join(',');body.innerHTML='<h3>成长雷达 · 当前检查覆盖</h3><p>方案判断与工程学生自查共同列为记录，不等于教师认证。</p>'+`<svg viewBox="0 0 440 340" role="img" aria-label="五维检查覆盖雷达" class="radar">${[.25,.5,.75,1].map(r=>`<polygon points="${dims.map((_,i)=>pt(i,110*r)).join(' ')}" fill="none" stroke="#444"/>`).join('')}<polygon points="${dims.map((d,i)=>pt(i,d.total?110*d.checked/d.total:0)).join(' ')}" fill="#ffffff24" stroke="white"/>${dims.map((d,i)=>{const [x,y]=pt(i,145).split(',');return `<text x="${x}" y="${y}" text-anchor="middle" fill="#ddd" font-size="13">${d.name}</text>`}).join('')}</svg>`+dims.map(d=>`<details class="radar-dimension"><summary>${d.name}：${d.checked} / ${d.total} 项符合当前检查</summary><p class="muted small">工程仍需实际运行或教师核对。${d.gaps.length?'以下是当前可回补的任务：':'当前检查已覆盖，可结合实际作品复习。'}</p>${d.gaps.slice(0,3).map(t=>`<button class="radar-gap" data-radar-task="${esc(t.id)}">${esc(t.title)} ↗</button>`).join('')}${d.gaps.length>3?`<p class="small muted">其余 ${d.gaps.length-3} 项可沿对应站点目录继续。</p>`:''}</details>`).join('');body.querySelectorAll('[data-radar-task]').forEach(b=>b.onclick=()=>{if($('#profile-dialog').open)closeDialog($('#profile-dialog'));openTask(b.dataset.radarTask)})}
function showLegacy(){const snapshot=M.captureLegacy(localStorage);$('#legacy-body').innerHTML='<p>以下为原始历史，不替代新增课程检查；原存储键与值保留。</p>'+Object.entries(snapshot).map(([k,v])=>`<details><summary>${esc(k)}</summary><pre>${esc(v)}</pre></details>`).join('');if(!Object.keys(snapshot).length)$('#legacy-body').innerHTML+='<p>当前浏览器没有旧版学习记录。</p>';openDialog('#legacy-dialog')}
function openProject(){$('#project-body').innerHTML=`<p>复用已有原型、策划和架构，按完整生命周期推进。发布部分共用第8站记录。</p><form id="project-form"><label>当前阶段<select name="phase">${['构思立项','策划范围','原型验证','架构任务','开发整合','测试修复','网页发布','反馈迭代','复盘归档'].map(s=>`<option>${s}</option>`).join('')}</select></label><label>当前版本<input name="version" value="${esc(state.project.version||'')}"></label><label>已有成果与工程位置<textarea name="artifacts">${esc(state.project.artifacts||'')}</textarea></label><label>问题、决定与下一步<textarea name="next">${esc(state.project.next||'')}</textarea></label><button type="submit" class="primary">保存项目记录</button></form><button id="project-publish">进入共用发布任务</button><h3>已有版本与阶段证据</h3>${(state.project.history||[]).map(h=>`<details><summary>${esc(h.phase)} · ${esc(h.version)} · ${esc(h.time)}</summary><p>${esc(h.artifacts)}</p><p>${esc(h.next)}</p></details>`).join('')}`;$('#project-form select').value=state.project.phase||'构思立项';$('#project-form').onsubmit=e=>{e.preventDefault();try{persist(M.recordProject(state,Object.fromEntries(new FormData(e.target))));openProject()}catch(err){notify(err.message)}};$('#project-publish').onclick=()=>{closeDialog($('#project-dialog'));openTask('pub-web')};openDialog('#project-dialog')}
const approvedWorksUrl='https://raw.githubusercontent.com/zhozisen/ai-game-learning-feedback/main/approved-works.json';
let workListRequest=0;
async function openWorks(){
 showWorkspace('works');
 const request=++workListRequest,body=$('#works-body');
 body.replaceChildren();
 try{
  const response=await fetch(approvedWorksUrl,{cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(request!==workListRequest||currentWorkspace!=='works')return;
  if(response.status===404){works=[];return}
  if(!response.ok)throw Error('作品清单读取失败');
  const rows=await response.json();
  if(request!==workListRequest||currentWorkspace!=='works')return;
  works=W.catalog(rows);
  if(works.length)renderWorks();
 }catch{
  if(request===workListRequest&&currentWorkspace==='works')body.textContent='暂时无法读取已上架的作品，请稍后刷新。';
 }
}
function renderWorks(){
 const body=$('#works-body');
 body.innerHTML=`
 <div id="work-player"></div>
 <div class="work-grid">${works.map(w=>{
  const playable=w.playUrl||w.htmlGames;
  return `<article class="source-card work-card" data-work="${w.id}">
   ${w.cover?`<img src="${esc(w.cover)}" alt="${esc(w.title)} · ${esc(w.status||'封面')}" loading="lazy" referrerpolicy="no-referrer">`:''}
   <p class="eyebrow">${esc(w.status||(w.kind==='teacher-demo'?'教师示范':'网页可玩'))}</p>
   <h3>${esc(w.title)}</h3>
   <p class="muted small">${esc(w.author)}${w.version?' · '+esc(w.version):''}</p>
   <p>${esc(w.description)}</p>
   ${playable?`<button class="primary" data-play="${w.id}">开始游戏</button>`:w.cover?`<a class="primary" href="${esc(w.cover)}" target="_blank" rel="noopener noreferrer">看大图 ↗</a>`:w.previewUrl?`<a class="primary" href="${esc(w.previewUrl)}" target="_blank" rel="noopener noreferrer">${esc(w.previewLabel)} ↗</a>`:''}
   <details class="work-more"><summary aria-label="更多 · ${esc(w.title)}">更多</summary>
    ${!playable&&w.controls?`<p>${esc(w.controls)}</p>`:''}
    ${w.cover&&w.previewUrl?`<a href="${esc(w.previewUrl)}" target="_blank" rel="noopener noreferrer">${esc(w.previewLabel||'查看作品')} ↗</a>`:''}
    ${w.repoUrl?`<a href="${esc(w.repoUrl)}" target="_blank" rel="noopener noreferrer">${w.status==='访问待核对'?'核对原链接':'查看 GitHub 仓库'} ↗</a>`:''}
    ${w.kind==='teacher-demo'?'<a href="examples/README.html" target="_blank" rel="noopener">示范源码与交付说明 ↗</a>':''}
    ${playable?`<a href="${esc(W.feedbackUrl(w))}" target="_blank" rel="noopener">反馈作品 ↗</a>`:''}
   </details>
  </article>`;
 }).join('')||'<p>作品清单暂为空。</p>'}</div>`;
 body.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>openPlayer(works.find(w=>w.id===b.dataset.play),0,b));
}
async function openPlayer(work,index,opener){
 const game=work.htmlGames?.[index];
 const player=$('#work-player');
 const source=game?W.htmlGameUrl(work,game):null;
 const original=game?work.repoUrl+'/blob/'+game.commit+'/'+game.path:(work.playUrl||work.repoUrl);
 player.innerHTML=`<section class="game-player" aria-label="游戏试玩">
 <div class="player-actions"><h3 id="game-title" tabindex="-1">${esc(game?.title||work.title)}</h3><button id="game-close">关闭试玩</button></div>
 <p>${esc(game?.controls||work.controls)}</p>
 ${work.htmlGames?.length>1?`<div class="player-actions" aria-label="选择游戏">${work.htmlGames.map((g,n)=>`<button data-game="${n}" aria-pressed="${n===index}">${esc(g.title)}</button>`).join('')}</div>`:''}
 <div class="player-actions"><button id="game-full" hidden>全屏</button><a href="${esc(original)}" target="_blank" rel="noopener noreferrer">${game?'查看原始 HTML':'打开原游戏页'} ↗</a></div>
 <p id="game-status" role="status">正在加载游戏…</p><div id="game-slot"></div></section>`;
 const slot=$('#game-slot'), status=$('#game-status'), fullscreen=$('#game-full');
 $('#game-close').onclick=()=>{player.replaceChildren();opener.focus()};
 player.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.game);if(n!==index)openPlayer(work,n,opener)});
 $('#game-title').focus({preventScroll:true});
 player.scrollIntoView({block:'start'});
 if(work.playUrl?.startsWith('https:')&&new URL(work.playUrl).origin===location.origin){
  status.textContent='请在原游戏页试玩。';return;
 }
 const f=document.createElement('iframe');
 f.title=(game?.title||work.title)+'试玩';
 f.allow='fullscreen; autoplay';
 f.referrerPolicy='no-referrer';
 f.setAttribute('sandbox',game?'allow-scripts':'allow-scripts allow-same-origin allow-pointer-lock');
 const ready=()=>{if(f.isConnected){status.textContent='游戏页面已加载，点击画面开始操作。';fullscreen.hidden=false}};
 const failure=()=>{if(slot.isConnected){status.textContent='游戏暂未加载，请检查网络或打开原页面。';fullscreen.hidden=true}};
 fullscreen.onclick=()=>f.requestFullscreen?.().catch(()=>notify('浏览器未允许全屏。'));
 try{
  if(game){
   // Only load the pinned, reviewed self-contained HTML in an opaque-origin frame.
   const r=await fetch(source,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error('HTML读取失败');
   const html=await r.text();
   const start=/^\s*<!doctype html>\s*<html\b[^>]*>\s*<head\s*>/i;
   if(html.length>250000||!start.test(html))throw Error('HTML格式错误');
   const policy=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data:; form-action 'none'; base-uri 'none'">`;
   let documentHtml=html.replace(start,head=>head+policy);
   if(work.id==='cat-phase'&&game.path==='cat-adventure.html'){
    // The upstream launch overlay stays visible even when its canvas renders.
    // Dismiss it only after drawing succeeds and the original error label stays unchanged.
    const bootFix=`<script>requestAnimationFrame(()=>requestAnimationFrame(()=>{
     const tip=document.getElementById('bootTip');
     const canvas=document.getElementById('game');
     if(tip?.textContent==='正在启动…'&&canvas?.getContext('2d').getImageData(30,30,1,1).data[3])tip.closest('#boot').style.display='none';
    }));</script>`;
    documentHtml=documentHtml.replace(/<\/body>/i,bootFix+'</body>');
   }
   f.srcdoc=documentHtml;
  }else f.src=work.playUrl;
  if(!slot.isConnected||currentWorkspace!=='works')return;
  const timer=setTimeout(()=>{if(f.isConnected)failure()},12000);
  f.onload=()=>{clearTimeout(timer);ready()};
  f.onerror=()=>{clearTimeout(timer);failure()};
  slot.replaceChildren(f);
 }catch{failure()}
}
function backup(){let b;try{b=M.exportAll(localStorage,C)}catch(e){if(!locked){notify('备份失败：'+e.message);return}b={app:'orbit-structured-course',schema:3,catalogVersion:C.version,exportedAt:new Date().toISOString(),state,profileRaw:localStorage.getItem(M.PROFILE),legacyRaw:M.captureLegacy(localStorage),damagedOriginalRaw:localStorage.getItem(M.KEY)}}if(locked){b.state=state;b.unsavedDraft=true}b.formDrafts=Object.fromEntries(['#profile-dialog[open] #profile-form','#entry-dialog[open] #entry-form'].map(sel=>[sel,$(sel)?Object.fromEntries(new FormData($(sel))):null]).filter(([,v])=>v));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(b,null,2)],{type:'application/json'}));a.download='轨道课堂-完整学习备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function openStorage(){$('#storage-body').innerHTML='<p>备份包含本浏览器的新课程、旧记录与个人档案，不包含Godot工程。工程通过Git另存。</p><button id="backup-now" class="primary">导出完整备份</button><label>导入全站备份<input type="file" id="import-file" accept="application/json"></label><button id="legacy-now">查看旧记录</button><p id="import-status" role="status"></p>';$('#backup-now').onclick=backup;$('#legacy-now').onclick=showLegacy;$('#import-file').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>64*1024*1024)throw Error('备份超过64MB限制');const b=JSON.parse(await f.text());M.prepare(b,C);if(!confirm('恢复schema '+b.schema+'备份，将替换其中包含的学习记录、个人档案和作品申请草稿。旧schema不会清除新课程记录。确认继续？'))return;M.restore(localStorage,b,C);locked=false;state=M.load(localStorage,C);revision=localStorage.getItem(M.KEY)===null?null:state.revision;profile=PS.loadProfile(localStorage);profileRev=profile?.revision??null;refreshHome();$('#import-status').textContent='备份已恢复，请核对姓名和当前任务。'}catch(err){$('#import-status').textContent=err.message}};openDialog('#storage-dialog')}
const tour=[['从导读开始，做自己的小游戏','学习旅程显示导读与八站。按当前必修走，选修按自己的玩法选择，拓展看前置；每站必修完成后圆点点亮。'],['一次完成一个任务','领取真实任务与关键知识→查看必要资料或短示范→与AI完成小成果→自己解释、定向补学并换条件验证→知识总结。只解释本节关键关系，引用工程依据；多轮仍卡住可拆小或求助教师。'],['用雷达和档案找到下一步','成长雷达显示五维检查覆盖，不能代替真实工程能力。档案保留问题、词语、资料与作品；网页数据保存在当前浏览器，定期导出，工程另备份。'],['把作品交给同学试玩','游戏导出Web并发布GitHub Pages，再申请进入同学作品。站内点开的是游戏页面，源码是参考；教师核验后全班可见。']];let tourIndex=0;
function showTour(){openDialog('#tour-dialog');const [title,body]=tour[tourIndex];$('#tour-body').innerHTML=`<p class="eyebrow">新手引导 ${tourIndex+1} / ${tour.length}</p><h3>${title}</h3><p>${body}</p><button id="tour-next" class="primary">${tourIndex===tour.length-1?'从导读开始':'下一步'}</button>`;$('#tour-next').onclick=()=>{if(++tourIndex<tour.length)showTour();else{try{localStorage.setItem('orbit-onboarding-v2','seen')}catch{}closeDialog($('#tour-dialog'));tourIndex=0;openTask('intro-start');if(!profile)openProfile('settings')}}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#tour-dialog').open)try{localStorage.setItem('orbit-onboarding-v2','seen')}catch{}});$('#tour-dialog').addEventListener('cancel',()=>{try{localStorage.setItem('orbit-onboarding-v2','seen')}catch{}});$('#tour-dialog').addEventListener('close',()=>{try{localStorage.setItem('orbit-onboarding-v2','seen')}catch{}});

function closeProfileMenu(restore=false){const wasOpen=!$('#profile-menu').hidden;$('#profile-menu').hidden=true;$('#profile-trigger').setAttribute('aria-expanded','false');if(wasOpen&&restore)$('#profile-trigger').focus()}
function closeDrawer(restore=false){const wasOpen=$('#sidebar').classList.contains('is-open');$('#sidebar').classList.remove('is-open');$('#sidebar-shade').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');$('#workspace').inert=false;document.body.classList.remove('drawer-open');$('#sidebar').removeAttribute('role');$('#sidebar').removeAttribute('aria-modal');if(wasOpen&&restore)$('#menu-toggle').focus()}
function openDrawer(){closeProfileMenu(false);$('#sidebar').classList.add('is-open');$('#sidebar-shade').hidden=false;$('#menu-toggle').setAttribute('aria-expanded','true');$('#workspace').inert=true;document.body.classList.add('drawer-open');$('#sidebar').setAttribute('role','dialog');$('#sidebar').setAttribute('aria-modal','true');$('#sidebar-close').focus()}
function showWorkspace(view){if(!['journey','growth','works'].includes(view))return;if(currentWorkspace==='works'&&view!=='works')$('#work-player')?.replaceChildren();currentWorkspace=view;for(const [key,id,label,button]of [['journey','workspace-journey','学习旅程','journeyOpen'],['growth','workspace-growth','成长雷达','radarOpen'],['works','works-dialog','同学作品','worksOpen']]){$('#'+id).hidden=key!==view;const b=$('#'+button);if(key===view){b.setAttribute('aria-current','page');$('#workspace-title').textContent=label}else b.removeAttribute('aria-current')}if(view==='growth')drawRadar($('#workspace-growth-body'))}
function sideAction(action){const mobile=$('#sidebar').classList.contains('is-open'),inMenu=$('#profile-menu').contains(document.activeElement);closeProfileMenu(false);closeDrawer(false);if(mobile)$('#menu-toggle').focus();else if(inMenu)$('#profile-trigger').focus();action();if(!document.querySelector('dialog[open]'))$('#workspace-title').focus()}
$('#menu-toggle').onclick=openDrawer;$('#sidebar-close').onclick=()=>closeDrawer(true);$('#sidebar-shade').onclick=()=>{closeProfileMenu(false);closeDrawer(true)};$('#brand-home').onclick=e=>{e.preventDefault();sideAction(()=>showWorkspace('journey'))};
$('#profile-trigger').onclick=()=>{const expanded=$('#profile-menu').hidden;$('#profile-menu').hidden=!expanded;$('#profile-trigger').setAttribute('aria-expanded',String(expanded))};document.querySelectorAll('[data-profile-open]').forEach(b=>b.onclick=()=>sideAction(()=>b.dataset.profileOpen==='backup'?openStorage():openProfile(b.dataset.profileOpen)));
document.addEventListener('click',e=>{if(!e.target.closest('.profile-area'))closeProfileMenu(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(!$('#profile-menu').hidden){e.preventDefault();closeProfileMenu(true)}else if($('#sidebar').classList.contains('is-open')){e.preventDefault();closeDrawer(true)}}if(e.key==='Tab'&&$('#sidebar').classList.contains('is-open')&&!document.querySelector('dialog[open]')){const items=[...$('#sidebar').querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length&&!x.disabled),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});window.matchMedia('(max-width:800px)').addEventListener('change',e=>{if(!e.matches){closeProfileMenu(false);closeDrawer(false)}});


function placeCourseCatalog(){const cat=$('#catalog-dialog');if(cat.open)cat.close();const column=$('#course-catalog');if(innerWidth<=700)cat.append(column);else $('#course-dialog .class-grid').prepend(column)}
$('#catalog-toggle').onclick=()=>openDialog('#catalog-dialog');$('#catalog-dialog').addEventListener('close',()=>{if($('#catalog-toggle').getClientRects().length)$('#catalog-toggle').focus()});window.matchMedia('(max-width:700px)').addEventListener('change',placeCourseCatalog);placeCourseCatalog();

createJourneyMap();document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>openStation(b.dataset.station));$('#start').onclick=()=>{const n=chooseNext();openStation(n?.stationId||'orientation',n?.id)};$('#journeyOpen').onclick=()=>sideAction(()=>showWorkspace('journey'));$('#radarOpen').onclick=()=>sideAction(()=>showWorkspace('growth'));$('#guideOpen').onclick=()=>sideAction(showTour);$('#worksOpen').onclick=()=>sideAction(openWorks);
$('#copy-work-publish-prompt').onclick=async()=>{
 const prompt=$('#work-publish-prompt'),status=$('#work-publish-status');
 try{
  await navigator.clipboard.writeText(prompt.value);
  status.textContent='已复制，填好项目目录和仓库网址后发给 AI。';
 }catch{
  prompt.focus();
  prompt.select();
  status.textContent='已选中提示词，请使用设备的复制功能。';
 }
};
$('#works-back').onclick=()=>{showWorkspace('journey');$('#workspace-title').focus()};$('#reset').onclick=openStorage;$('#feedbackOpen').onclick=()=>{closeProfileMenu(false);closeDrawer(true);const url=new URL('https://github.com/zhozisen/ai-game-learning-feedback/issues/new');url.searchParams.set('title','[网站反馈]['+(profile?.name||'未填写姓名')+'] ');url.searchParams.set('body','姓名：'+(profile?.name||'未填写')+'\n学习位置：'+(task?.title||'首页')+'\n\n问题与复现步骤：\n');window.open(url.href,'_blank','noopener')};
window.addEventListener('storage',e=>{if(e.key===M.KEY){locked=true;notify('另一页面更新了学习记录。当前草稿未覆盖，请先导出再刷新。')}if(e.key===M.PROFILE){try{profile=PS.loadProfile(localStorage);profileRev=profile?.revision??null;refreshHome()}catch{notify('个人档案发生变化，请核对后刷新')}}});
window.OrbitApp={openTask,openStation,openProfile,openWorks,evidence,getState:()=>structuredClone(state),backup};refreshHome();const u=new URL(location.href);if(u.searchParams.has('station')||u.searchParams.has('task'))openStation(u.searchParams.get('station'),u.searchParams.get('task'));else if(u.searchParams.get('view')==='works')openWorks();else if(!localStorage.getItem('orbit-onboarding-v2'))setTimeout(()=>{if(!document.querySelector('dialog[open]'))showTour()},100);
})();
