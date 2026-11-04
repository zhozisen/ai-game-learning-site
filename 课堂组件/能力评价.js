(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CourseEvidence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const dimensions=[{id:'foundation',name:'开发基础',stations:[1,2]},{id:'ai',name:'AI 协作',stations:[3]},{id:'analysis',name:'游戏分析',stations:[4]},{id:'design',name:'游戏设计',stations:[5]},{id:'implementation',name:'作品实现',stations:[6,7]}];
const levels=[['concept','概念理解'],['reasoning','原理分析'],['application','方法应用'],['creation','独立创造'],['improvement','验证改进']];
const quizLevels={1:['reasoning','concept','concept'],2:['concept','reasoning','reasoning'],3:['reasoning','reasoning','concept'],4:['concept','reasoning','reasoning'],5:['concept','reasoning','reasoning'],6:['reasoning','concept','reasoning'],7:['reasoning','concept','reasoning']};
function evaluate(records={},godot={},extra={}){
 return dimensions.map(dim=>{const ls=levels.map(([id,name])=>{let total=0,passed=0;const evidence=[];
 if(id==='concept'||id==='reasoning')for(const station of dim.stations){const r=station===2?godot:(records[station]||{});quizLevels[station].forEach((kind,i)=>{if(kind===id){total++;if(r.correct?.[i]===true){passed++;evidence.push('第'+station+'站 · 理解题'+(i+1));}}});}
 else {total=dim.stations.length;if(id==='application'&&dim.id==='foundation'){total+=2;for(const [key,label]of [['offDone','信号断开预测'],['onDone','信号连接预测']])if(godot[key]===true){passed++;evidence.push('第2站 · 网页模拟：'+label);}}}
 const pending=dim.stations.filter(s=>extra.submissions?.[s+':'+id]?.submittedAt).length;
 return {id,name,total,passed,pending,score:total?20*passed/total:0,status:passed===total&&total?'已检查':passed?'部分已检查':pending?'待教师确认':'待评估',evidence};});
 return {...dim,levels:ls,score:Math.round(ls.reduce((sum,l)=>sum+l.score,0)),assessed:ls.some(l=>l.passed>0)};
 });
}
function cleanName(value){if(typeof value!=='string'||/[\x00-\x1f\x7f]/.test(value))throw Error('姓名不能包含换行或控制字符');const name=value.trim();if(!name||name.length>30)throw Error('请填写1至30字的姓名');return name;}
const categories=['网站问题','内容纠错','视频资源','测试题','操作环境','改进建议'];
function issueBody(f){const name=cleanName(f.name);if(!f.title?.trim()||!f.details?.trim())throw Error('请填写问题标题和具体情况');const category=categories.includes(f.category)?f.category:categories[0];return ['## 学生姓名',name,'','## 问题分类',category,'','## 学习位置',String(f.context||'首页').slice(0,250),'','## 复现步骤',String(f.steps||'未填写').slice(0,1500),'','## 实际情况与期望',String(f.details).slice(0,3000),'','## 网站版本','轨道课堂 2026.10 · 证据评价版','','> 学生已知晓：姓名和问题将公开。姓名为学生自填。'].join('\n');}
function issueUrl(f){const body=issueBody(f),name=cleanName(f.name),category=categories.includes(f.category)?f.category:categories[0];const u=new URL('https://github.com/zhozisen/ai-game-learning-feedback/issues/new');u.searchParams.set('title',('['+name+']['+category+'] '+f.title.trim()).slice(0,160));u.searchParams.set('template','website-feedback.md');u.searchParams.set('body',body);if(u.href.length>7500){const header='## 学生姓名\n'+name+'\n\n## 学习位置\n'+String(f.context||'首页').slice(0,250)+'\n\n内容较长，请粘贴完整描述：回到学习网站点击“复制问题描述”，粘贴替换此正文后再提交。';u.searchParams.set('body',header);}return u.href;}

function validateExtra(value){if(value===undefined||value===null)return {schema:1,submissions:{}};if(value.schema!==1||!value.submissions||typeof value.submissions!=='object'||Array.isArray(value.submissions))throw Error('能力记录格式不受支持');const submissions={};for(const [key,v]of Object.entries(value.submissions)){if(!/^[1-7]:(application|creation|improvement)$/.test(key)||!v||typeof v.text!=='string'||v.text.length>4000||typeof v.submittedAt!=='string'||v.submittedAt.length>50)throw Error('实践证据格式错误');submissions[key]={text:v.text,submittedAt:v.submittedAt};}return {schema:1,submissions};}
return {dimensions,levels,quizLevels,categories,evaluate,cleanName,issueBody,issueUrl,validateExtra};
});
