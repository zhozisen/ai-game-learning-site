(function(r,f){const x=f();if(typeof module==='object'&&module.exports)module.exports=x;else r.OrbitWorks=x;})(globalThis,()=>{'use strict';
const REPO='https://github.com/zhozisen/ai-game-learning-feedback/issues/new';
function text(v,label,max=2000){if(typeof v!=='string'||!v.trim()||v.length>max)throw Error('请核对'+label);return v.trim()}
function https(raw,label){let u;try{u=new URL(raw)}catch{throw Error(label+'地址错误')}if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error(label+'应为无凭据的HTTPS网址');return u}
function playUrl(raw){if(raw==='examples/web-demo/index.html')return raw;const u=https(raw,'可玩网页');if(!/^[a-z0-9-]+\.github\.io$/.test(u.hostname))throw Error('只接受HTTPS GitHub Pages可玩网址，不能填仓库源码地址');return u.href}
function repo(raw){const u=https(raw,'源码');if(u.hostname!=='github.com'||u.pathname.split('/').filter(Boolean).length<2)throw Error('源码地址应为GitHub仓库');return u.href}
function draft(x){const d={};for(const[k,label,max]of [['title','作品名',80],['author','姓名',30],['description','简介',1500],['controls','操作说明',1000],['version','版本',80]])d[k]=text(x[k],label,max);d.playUrl=playUrl(x.playUrl);if(d.playUrl.startsWith('examples/'))throw Error('学生作品请提供自己的Pages网址');if(x.repoUrl)d.repoUrl=repo(x.repoUrl);if(x.cover)d.cover=https(x.cover,'封面').href;return d}
function htmlGameUrl(work,game){
 const u=new URL(repo(work.repoUrl));
 const slug=u.pathname.split('/').filter(Boolean);
 if(slug.length!==2||!(/^[0-9a-f]{40}$/).test(game.commit)||!(/^[a-z0-9_-]+[.]html$/i).test(game.path))throw Error('试玩文件必须定位到仓库中的固定 HTML 版本');
 return 'https://raw.githubusercontent.com/'+slug.join('/')+'/'+game.commit+'/'+game.path;
}
function catalog(items){
 if(!Array.isArray(items))throw Error('作品清单格式错误');
 const ids=new Set();
 return items.map(x=>{
  text(x.id,'作品ID',128);
  if(!/^[a-zA-Z0-9._-]+$/.test(x.id)||ids.has(x.id))throw Error('重复或无效作品ID');
  ids.add(x.id);
  if(x.kind==='student-reference'){
   for(const k of ['title','author','description','status'])text(x[k],k);
   repo(x.repoUrl);
   if(x.previewUrl){https(x.previewUrl,'作品预览');text(x.previewLabel,'预览名称',40)}
   if(x.playUrl){if(!playUrl(x.playUrl).startsWith('https:'))throw Error('学生作品请提供自己的Pages网址');text(x.controls,'操作说明')}
   if(x.htmlGames){
    if(!Array.isArray(x.htmlGames)||!x.htmlGames.length||x.playUrl)throw Error('请核对HTML试玩列表');
    const sources=new Set();
    for(const game of x.htmlGames){
     text(game.title,'游戏名',80);text(game.controls,'操作说明',1000);
     const source=htmlGameUrl(x,game);
     if(sources.has(source))throw Error('重复的HTML试玩文件');
     sources.add(source);
    }
   }
  }else{
   if(x.approved!==true||!Number.isFinite(Date.parse(x.reviewedAt)))throw Error('只展示已核验作品');
   for(const k of ['title','author','description','controls','version'])text(x[k],k);
   playUrl(x.playUrl);
   if(x.repoUrl)repo(x.repoUrl);
  }
  if(x.cover&&x.cover!=='assets/teacher-demo.svg')https(x.cover,'封面');
  return {...x};
 });
}
function submissionBody(x){const d=draft(x);return '## 作品申请\n学生自填姓名：'+d.author+'\n游戏：'+d.title+'\n版本：'+d.version+'\n可玩网址：'+d.playUrl+'\n操作：'+d.controls+'\n简介：'+d.description+'\n源码：'+(d.repoUrl||'未提供')+'\n\n我已核对网页实际能玩，等待教师核验。\n姓名和问题在公开仓库可见。\n\n```json\n'+JSON.stringify(d,null,2)+'\n```'}
function submissionUrl(input){
 const application=draft(input);
 const url=new URL(REPO);
 url.searchParams.set('title',`[作品申请][${application.author}] ${application.title}`);
 url.searchParams.set('labels','作品申请');
 url.searchParams.set('body',submissionBody(application));
 if(url.href.length>7000){
  url.searchParams.set('body','请粘贴从课堂复制的完整作品申请正文，再点击提交。');
 }
 return url.href;
}
function feedbackUrl(w){const u=new URL(REPO);u.searchParams.set('title','[作品反馈]['+w.id+'] '+w.title);u.searchParams.set('labels','作品反馈');u.searchParams.set('body','## 对应作品\nID：'+w.id+'\n版本：'+(w.version||'仓库当前版本')+'\n作品地址：'+(w.playUrl||w.previewUrl||w.repoUrl)+'\n\n## 实际现象\n\n## 复现步骤\n1. \n\n## 预期结果与建议\n\n请不要粘贴整份个人学习档案。');return u.href}
return{playUrl,draft,catalog,htmlGameUrl,submissionBody,submissionUrl,feedbackUrl};});
