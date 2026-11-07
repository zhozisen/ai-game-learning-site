(function(root){
'use strict';
// One diagram answers one question. Each entry follows the corresponding task's own example.
const visuals={
 'intro-start':{kind:'flow',title:'怎样把点子缩成一局小游戏？',steps:[
  ['玩家做什么','左右移动，接住掉落的光点'],['怎样算完成','接到就得分，漏掉三次就结束'],['首版只保留什么','一个场景、一条规则、能重新开始']]},
 'git-save':{kind:'flow',title:'哪些改动会进入这次提交？',steps:[
  ['检查改动','用 git diff 核对工作区'],['暂存选定内容','用 git add 选入这次要提交的改动'],['写提交记录','用 git commit 把暂存内容写入本地历史']]},
 'git-sync':{kind:'compare',title:'提交后，为什么 GitHub 还是旧的？',paths:[
  ['只做本地提交','修改 README','生成本地提交','未推送','GitHub 仍是旧版'],
  ['提交后推送','修改 README','生成本地提交','推送到目标分支','GitHub 对应分支出现新版']]},
 'git-pr':{kind:'flow',title:'一处改动怎样进入主分支？',steps:[
  ['在自己的分支改','提交与本次任务相关的文件'],['发起 PR','说明目的、范围与验证结果'],['同学审阅差异','核对具体改动，再决定合并'],['合并后核对','同步主分支，确认结果在正确版本']]},
 'godot-scenes':{kind:'tree',title:'一个可复用的金币场景由什么组成？',tree:[
  ['金币 Area2D','作为场景根节点，负责区域检测'],[['Sprite2D','负责显示金币图片'],['CollisionShape2D','提供检测形状']]],note:'把金币场景放进关卡两次，就得到两个实例。两个实例可以处于不同位置。'},
 'godot-signal':{kind:'experiment',title:'金币消失了，哪一环会决定分数？',steps:[
  ['金币','发出收集信号'],['计分规则','判断回合状态'],['界面 Label','显示最新分数']],
  answers:['显示 1 分','保持 0 分'],action:'触发一次收集',cases:[
   ['正常连接',0,3,'计分函数收到信号并加 1，界面显示 1 分。'],
   ['断开信号',1,1,'金币发出信号，计分函数没有收到。'],
   ['回合结束',1,2,'计分函数收到信号，但回合已结束，本次不加分。']]},
 'godot-physics':{kind:'experiment',title:'看起来碰到了，为什么拾取没触发？',steps:[
  ['两个形状重叠','角色处于金币检测区内'],['遮罩核对','检测区要关注角色所在层'],['拾取事件','检测成功后才触发']],
  answers:['触发拾取','没有触发'],action:'模拟角色进入',cases:[
   ['遮罩包含角色层',0,3,'形状有效，检测区的遮罩包含角色所在层，触发拾取事件。'],
   ['遮罩漏掉角色层',1,2,'虽然图形重叠，检测区的遮罩没有包含角色所在层。']]},
 'ai-goal':{kind:'compare',title:'AI 收到哪条需求后，可以检查结果？',paths:[
  ['泛泛交代','我要改暂停','让暂停好用一点','没有可以复验的行为'],
  ['可验证的任务','我要改暂停','只加暂停按钮，保留原局和分数','按暂停再恢复，继续原局且分数不变']]},
 'dis-start':{kind:'flow',title:'运行游戏时，怎样找到第一个场景？',steps:[
  ['project.godot','先查 run/main_scene'],['主场景','打开配置实际指向的文件'],['关卡与角色','沿主场景的实例引用查找 Level、Player 等对象']]},
 'life-map':{kind:'flow',title:'一个游戏从点子走到交付，需要哪些成果？',steps:[
  ['构思与验证','说清核心玩法，用原型验证关键操作'],['规划与开发','定首版范围，完成可玩的版本'],['测试与发布','复验主要玩法，让同学能打开'],['维护与收尾','记录反馈，决定继续修复还是归档']]},
 'life-prototype':{kind:'compare',title:'两种原型做法，哪一种更早发现风险？',paths:[
  ['先做完整画面','想验证接物能不能控制得准','先做角色美术和场景','画面做完才发现目标接不到'],
  ['先测关键操作','想验证接物能不能控制得准','用方块先试移动速度和目标密度','先调到可操作，再补画面']]},
 'arch-modules':{kind:'relation',title:'修改加分规则，要改哪个模块？',steps:[
  ['玩家操作','报告收集动作','接收输入并报告发生的动作。'],
  ['回合规则','计算并保存分数','在这里决定何时加分、加多少分。'],
  ['界面','显示分数','显示传来的分数，计分由回合规则负责。']]},
 'arch-contract':{kind:'compare',title:'“分数”在两边说的是同一个值吗？',paths:[
  ['约定含糊','当前分数为 5','发送方传本次增加量 2','接收方按总分显示 2'],
  ['约定明确','当前分数为 5','双方约定传新总分 7','接收方显示 7']]},
 'prod-playtest':{kind:'flow',title:'怎样知道同学卡住的问题真的修好了？',steps:[
  ['看同学独立试玩','记下版本、操作与实际现象'],['复现一个重要问题','例如第一次找不到开始按钮'],['改一处再试','调整提示，请同学沿原操作路径复验']]},
 'pub-web':{kind:'compare',title:'为什么上传一份 HTML 还玩不了？',paths:[
  ['只上传 HTML','通过 HTTP 打开入口','引擎和资源文件缺失','无法进入游戏'],
  ['上传完整目录','通过 HTTP 打开入口','JS、WASM、PCK 等配套文件加载','继续核对输入、声音与重开']]},
 'pub-pages':{kind:'flow',title:'从仓库里的导出目录，怎样走到可试玩的网址？',steps:[
  ['选对发布源','放入完整 Web 目录，入口为 index.html'],['核对 Pages 部署','等部署成功，取得可玩地址'],['在陌生浏览器试玩','核对实际运行与对应提交']]}
};
// Compact declarations for short flows and paired scenarios.
const flow=(title,...steps)=>({kind:'flow',title,steps});
const compare=(title,...paths)=>({kind:'compare',title,paths});
Object.assign(visuals,{
 'intro-record':compare('换电脑前，哪两份东西要分别保存？',
  ['学习进度','换电脑前做备份','导出学习档案 JSON','在新浏览器导入记录'],
  ['游戏工程','换电脑前做备份','提交并备份 Godot 工程','在新电脑取得工程并运行']),
 'git-restore':flow('恢复旧文件时，怎样保住今天的改动？',
  ['保护现有草稿','先另存未提交的有效工作'],['找对旧版本','核对提交和目标文件'],['只恢复目标','复查差异并运行工程']),
 'git-fork':flow('修一条开源项目的错链，PR 发到哪里？',
  ['核对上游','先看贡献约定，再 Fork'],['在自己的 Fork 建分支','修错链并验证'],['向上游发 PR','核对目标仓库和目标分支']),
 'git-conflicts':compare('冲突标记消失了，为什么还要复验？',
  ['只消除标记','两人分别改了计分和显示','选择一边覆盖','另一项改动可能丢失'],
  ['整合两项改动','两人分别改了计分和显示','按两边意图整合','同时复验计分与显示']),
 'git-bisect':flow('怎样从一长串提交里找到故障起点？',
  ['固定好坏两端','好版本能正常重开，坏版本重复计分'],['在中间版本复验','用同一套复现操作判断好坏'],['缩小范围','更新好或坏的边界，继续缩小范围']),
 'git-lfs':compare('仓库里看到图片名，素材就一定齐了吗？',
  ['只有指针','在新副本核对同一张图','只拿到 LFS 指针','图片仍无法打开'],
  ['取得文件','在新副本核对同一张图','获取 LFS 保存的文件内容','打开图片并在工程里验证']),
 'godot-editor':compare('运行当前场景和运行项目，有什么差别？',
  ['运行当前场景','工程中有菜单与关卡','打开关卡场景后运行当前场景','直接进入关卡'],
  ['运行项目','工程中有菜单与关卡','菜单已设为主场景，运行项目','先进入菜单']),
 'godot-script':compare('一段逻辑该执行一次，还是每帧执行？',
  ['场景初始化','节点已进入场景','在 _ready 设置初始值','开始时执行一次'],
  ['持续运动','节点已进入场景','在 _physics_process 读取输入和更新运动','后续每个物理步都处理']),
 'godot-input':compare('同样按住一个键，移动与确认怎样响应？',
  ['持续移动','按住同一个键','持续读取动作状态','按住期间持续移动'],
  ['一次确认','按住同一个键','读取刚按下的动作','这次按下只确认一次']),
 'godot-debug':flow('出现一串报错，怎样定位原因？',
  ['固定复现','记下从启动到报错的操作'],['查第一条相关错误','核对文件、行号与实际节点路径'],['只改一处再运行','沿原操作复验，注明尚未验证的地方']),
 'godot-spawn':flow('方块何时生成，又何时清理？',
  ['Timer 到时','按生成节奏发出事件'],['从模板生成实例','每次得到独立方块'],['越界后清理','结束回合时另外停止 Timer']),
 'godot-save':compare('重开后，哪些值应该保留？',
  ['本局分数','刚结束一局','只保存在当前回合状态','新局从 0 开始'],
  ['最高分与音量','刚结束一局','写入本地保存文件','重开后读取，首次无文件用默认值']),
 'ai-split':flow('血量功能怎样拆成每步都能验证的小任务？',
  ['先显示血量','确认初始数值可见'],['再接伤害事件','一次命中只扣一次，显示同步'],['最后做死亡与重开','血量归零时结束，新局恢复初始值']),
 'ai-verify':compare('只测暂停成功，会漏掉什么？',
  ['验证这次新增功能','开始一局','点暂停再恢复','核对能否继续原局'],
  ['回归受影响的旧功能','开始一局','反复暂停，再结束并重开','核对分数、输入和声音有无残留']),
 'ai-pipeline':flow('自动检查失败时，哪一步应该停止？',
  ['固定输入版本','保留可追溯基线'],['核对配置并运行测试','失败就停止，保存日志'],['人工试玩','确认实际可玩后再发布']),
 'ai-subagents':{kind:'tree',title:'一个改动，怎样分给两个 AI 又避免撞文件？',tree:[
  ['主助手','划清任务边界，整合结果并复验'],[['检查助手','只读核对验收遗漏'],['实现助手','只修改约定范围内的文件']]],note:'两边各交一份可核对结果，最后由主助手检查差异与实际行为。'},
 'dis-motion':flow('按下跳跃后，角色为什么会离地？',
  ['识别跳跃动作','在脚本中查对应输入'],['更新纵向速度','在物理逻辑中设置跳跃速度'],['执行运动','核对角色是否移动，再检查动画']),
 'dis-events':flow('在课程拆解工程里，从哪几处查收集计数？',
  ['收集脚本','从 coin.gd 查是谁发出 coin_collected'],['单人场景','沿场景里的信号连接找到接收者'],['暂停菜单','核对计数和 Label 有没有同步变化']),
 'dis-spawn':flow('一颗子弹从哪里来，又到哪里去？',
  ['核对冷却','允许本次射击才进入生成'],['由 Bullet 场景实例化','每颗子弹是独立实例'],['沿实例追踪结束条件','查命中或离场后如何清理']),
 'dis-state':compare('暂停与结束，分别怎样继续？',
  ['暂停','回合原本在进行','暂停受影响的操作','恢复时接着当前回合'],
  ['结束','回合原本在进行','按结束规则停止输入或计时','重开时初始化新回合']),
 'dis-pacing':flow('为什么要分段加入关卡挑战？',
  ['引入','先让玩家练移动'],['练习','加入跳跃并给独立练习机会'],['组合','把动作组合，观察失败集中在哪一段']),
 'life-pitch':flow('点击反应游戏的一轮玩法怎样闭合？',
  ['看到目标','辨认应该点什么'],['点击正确目标','执行核心动作'],['立即反馈','显示得分，再出现下一个目标']),
 'life-testing':compare('功能出错和玩家没看懂，要用什么证据？',
  ['规则问题','在同一版本记录现象','重开后重复计分','写复现步骤，核对计分和重开状态'],
  ['体验问题','在同一版本记录现象','玩家不知道目标','观察首次操作与原话，再验证提示效果']),
 'life-story':compare('一把钥匙怎样同时影响对话和门？',
  ['未拿钥匙','玩家走到门口','条件未通过，门锁着','对话提示去找钥匙'],
  ['已拿钥匙','玩家走到门口','条件通过，允许开门','对话提示可以进入']),
 'life-generation':compare('随机生成后，怎样判断关卡还能玩？',
  ['直接随机','固定种子复现','障碍可能封死路线','玩家找不到可行路径'],
  ['先设可解约束','固定种子复现','生成时保留最小通道','实际走一遍，核对仍然可达']),
 'arch-data':{kind:'relation',title:'改关卡时限，谁提供值、谁执行规则？',steps:[
  ['关卡配置','提供时限与目标数','在配置中给每关提供不同的时限与目标。'],
  ['回合规则','读取并校验配置','处理缺字段或无效时限，再运行通用的计时规则。'],
  ['界面','显示回合状态','展示规则传来的倒计时，显示格式不改变时限。']]},
 'arch-team':{kind:'relation',title:'两人分别开发规则和界面，在哪对齐？',steps:[
  ['规则开发者','计算分数','规则模块负责修改分数。'],
  ['交接约定','score_changed 传新总分','还要约定何时给初始值，避免刚打开界面时显示旧分数。'],
  ['界面开发者','更新显示','读取约定的数据，先独立验证再整合。']]},
 'arch-runtime-ai':compare('远程回复慢了，游戏怎样继续？',
  ['按时返回','玩家提出问题','等待期间显示状态','核对回复后继续流程'],
  ['超时或错误','玩家提出问题','到达等待上限或收到错误','触发替代行为，玩家仍能继续']),
 'prod-architecture':flow('计分关系图怎样拆成三次可验收的改动？',
  ['先实现计分接口','给定输入能得出预期分数'],['再接收集事件','一次收集只调用一次规则'],['最后更新界面','显示实际结果并验证重开']),
 'prod-assets':flow('怎样减少批量换素材带来的返工？',
  ['先定规格和许可','记录尺寸、视角、用途与来源'],['只试一个样本','导入后核对缩放、碰撞和动画'],['验证通过再批量接入','用同一份记录管理来源和修改']),
 'prod-localize':compare('翻译得分提示时，哪部分要保留？',
  ['原文','保留动态分数的位置','显示“得分 {score}”','运行后替换成实际分数'],
  ['第二语言','保留动态分数的位置','显示“Score {score}”','检查含义、数值和界面宽度']),
 'pub-device':flow('怎样确认别人从网址进来能玩完整一局？',
  ['在目标浏览器打开','核对加载和开始按钮'],['执行核心操作','检查焦点、输入与声音'],['结束、重开并退出','分别核对嵌入页和独立页，记下版本']),
 'pub-register':flow('AI 代交后，作品什么时候才出现在网站上？',
  ['准备可玩的网页','AI 核对网址和文件，先预览申请'],['提交 GitHub 申请','用自己的账号提交，拿到申请链接'],['老师试玩后批准','加「通过上架」标签，检查通过后生成作品卡']),
 'pub-feedback':flow('怎样把一条试玩反馈变成可验证的修复？',
  ['固定旧版本和复现步骤','例如 v1.0 结束后连点重开'],['复现并修复','确认哪次操作触发重复计分'],['在新版本跑原步骤','记录 v1.1 的结果与未解决问题']),
 'pub-ci':compare('构建失败与上线故障分别怎么处理？',
  ['构建失败','检查发布候选','构建缺少必要文件','停止发布，补齐后重新构建'],
  ['上线故障','检查发布候选','上线后实测发现不可用','恢复上一个完整可用产物，再复验网址'])
});
// Keep only concrete details that are not already conveyed by the diagram.
const demoNotes={
 'intro-start':'第一版先用方块当角色，等一整局能玩再换正式素材。',
 'intro-record':'先用隔离浏览器窗口练习导入，核对恢复的是哪份学习记录。',
 'git-save':'试着只改 README 的一行操作说明，暂存时把未完成素材留在这次提交之外。',
 'git-restore':'在工程副本里制造一次错误，先保存当前草稿，再尝试恢复。',
 'git-sync':'推送后，在第二个副本拉取目标分支，核对两边是否看到同一个提交。',
 'git-pr':'两人分角色练习。一人改说明，另一人核对改动里的文字和链接。',
 'git-bisect':'每个候选版本都用相同的操作，连续重开两次再拾取一次。',
 'godot-editor':'自己做一个带 Label 的 2D 场景，再分别用两种运行入口核对画面。',
 'godot-scenes':'先改一个实例的位置，再改源场景的默认显示，观察两个实例分别继承了什么。',
 'godot-script':'用 speed = 100 做基线，只改速度再运行，核对角色每次移动的差别。',
 'godot-debug':'在副本中故意写错一个节点路径，再用输出定位。',
 'godot-physics':'示例中的角色用 CharacterBody2D 移动，金币用 Area2D 检测。',
 'godot-spawn':'练习时可以每秒生成一个方块，用 queue_free 清理越界实例。',
 'ai-goal':'再补一句本次范围：计分和素材都沿用当前版本。',
 'ai-verify':'连续暂停并恢复两次，再结束和重开一局。',
 'dis-start':'在课程固定工程里核对单人入口 game_singleplayer.tscn，并打开它查看实际实例。',
 'dis-motion':'试一次提前松开跳跃键，沿原脚本核对为什么上升阶段会缩短。',
 'dis-spawn':'从 Gun 对 Bullet 场景的引用进入源码，再找实例化的位置。',
 'dis-state':'课程主例可用于观察暂停，但缺少完整的玩家失败与重开。验证结束行为时另看补充案例。',
 'life-pitch':'示例面向短时休息的玩家，目标出现节奏逐渐加快。',
 'arch-modules':'工程很小时，可以先把少量对象组合起来，确保职责说得清楚。',
 'arch-data':'测试负时限。应明确拒绝，或按预先约定的默认值处理。',
 'prod-playtest':'观察时先让同学自己找开始入口，记下他实际点了哪里。',
 'pub-web':'用教师示范包走一遍 HTTP 启动。部署验收时应从网站入口运行。',
 'pub-device':'以接光点为例，先测试方向键，再漏接至结束并点重来。'
};
function has(id){return Object.hasOwn(visuals,id)}
function rail(steps,kind,esc){
 const item=([name,caption],i)=>{
  const copy='<strong>'+esc(name)+'</strong><small>'+esc(caption)+'</small>';
  return '<li>'+(kind==='relation'
   ? '<button type="button" data-visual-node="'+i+'" aria-pressed="'+(i===0)+'">'+copy+'</button>'
   : '<div class="visual-node" data-visual-hop="'+i+'">'+copy+'</div>')+'</li>';
 };
 return '<ol class="visual-rail">'+steps.map(item).join('')+'</ol>';
}
function render(id,esc,{conclusion,readingPath}={}){
 if(!has(id))return '';
 const v=visuals[id], kind=v.kind;
 let body;
 if(kind==='tree'){
  const [[name,caption],branches]=v.tree;
  body='<div class="visual-tree"><p><strong>'+esc(name)+'</strong> · '+esc(caption)+'</p><ul>'+branches.map(([a,b])=>'<li><strong>'+esc(a)+'</strong> · '+esc(b)+'</li>').join('')+'</ul></div><p>'+esc(v.note)+'</p>';
 }else if(kind==='compare'){
  const [first,second]=v.paths;
  const divergence=first.slice(1).findIndex((value,i)=>value!==second[i+1]);
  body='<div class="visual-compare">'+v.paths.map(([name,...path])=>'<section><h4>'+esc(name)+'</h4><ol>'+path.map((value,i)=>'<li'+(i===divergence?' class="visual-divergence"':'')+'>'+esc(value)+(i===divergence?' <small>分岔点</small>':'')+'</li>').join('')+'</ol></section>').join('')+'</div>';
 }else{
  body=rail(v.steps,kind,esc);
  if(kind==='relation')body+='<p class="visual-readout" data-visual-result role="status">'+esc(v.steps[0][2])+'</p>';
  if(kind==='experiment'){
   const options=(items,group)=>items.map((name,i)=>'<label><input type="radio" name="'+group+'" value="'+i+'"'+(group==='visual-condition'&&i===0?' checked':'')+'> '+esc(name)+'</label>').join('');
   body='<fieldset class="visual-options"><legend>实验条件</legend>'+options(v.cases.map(([label])=>label),'visual-condition')+'</fieldset>'+body+
    '<fieldset class="visual-options"><legend>先预测结果</legend>'+options(v.answers,'visual-prediction')+'</fieldset>'+
    '<button type="button" class="primary" data-visual-run disabled>'+esc(v.action)+'</button><p class="visual-readout" data-visual-result role="status">选一个预测，再验证。</p>';
  }
 }
 const takeaway=kind!=='experiment'&&conclusion?'<p class="visual-takeaway">'+esc(conclusion)+'</p>':'';
 const note=demoNotes[id]?'<p class="visual-note"><b>操作提示</b> '+esc(demoNotes[id])+'</p>':'';
 const next=readingPath?'<p class="reading-path"><b>学习顺序</b> '+esc(readingPath)+'</p>':'';
 const entry=id==='pub-register'?'<button type="button" data-visual-works>打开同学作品，查看发布提示词 ↗</button>':'';
 return '<article class="lesson-visual" data-lesson-title="'+esc(v.title)+'" data-visual-kind="'+kind+'">'+takeaway+body+note+next+entry+'</article>';
}
function bind(box,id){
 const el=box.querySelector('.lesson-visual');
 if(!el)return;
 const v=visuals[id], result=el.querySelector('[data-visual-result]');
 if(v.kind==='relation'){
  const nodes=[...el.querySelectorAll('[data-visual-node]')];
  nodes.forEach((node,i)=>node.onclick=()=>{
   nodes.forEach(n=>n.setAttribute('aria-pressed',String(n===node)));
   result.textContent=v.steps[i][2];
  });
 }
 if(v.kind==='experiment'){
  const run=el.querySelector('[data-visual-run]'), hops=[...el.querySelectorAll('[data-visual-hop]')];
  const selected=name=>el.querySelector('input[name="'+name+'"]:checked');
  el.onchange=event=>{
   if(event.target.name==='visual-condition')el.querySelectorAll('input[name="visual-prediction"]').forEach(answer=>answer.checked=false);
   run.disabled=!selected('visual-prediction');
   hops.forEach(node=>delete node.dataset.reached);
   result.textContent=run.disabled?'选一个预测，再验证。':'已选择预测，可以验证。';
  };
  run.disabled=!selected('visual-prediction');
  run.onclick=()=>{
   const prediction=selected('visual-prediction');
   if(!prediction)return;
   const [,correct,reached,why]=v.cases[Number(selected('visual-condition').value)];
   hops.forEach((node,i)=>node.dataset.reached=String(i<reached));
   result.textContent=(Number(prediction.value)===correct?'预测符合。':'再核对一次。')+why;
  };
 }
}
root.OrbitLessonVisuals={has,render,bind};
})(globalThis);
