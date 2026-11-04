(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.GodotUnitQuiz=api;})(globalThis,()=>{
const questions=[
  {
    "id": "g4-t4-q1",
    "unit": "editor",
    "topic": "Godot 4 编辑器",
    "sourceQuestion": "在 Godot 4 中，哪个停靠面板用于管理项目的资源？",
    "question": "在 Godot 4 中，哪个停靠面板用于管理项目的资源？",
    "options": [
      "场景停靠面板（Scene Dock）",
      "导入停靠面板（Import Dock）",
      "文件系统停靠面板（FileSystem Dock）",
      "节点停靠面板（Node Dock）"
    ],
    "answer": 2,
    "explanation": "文件系统面板列出工程文件与资源；场景树列出当前场景节点，检查器编辑选中对象属性。回看“学”的编辑器面板说明。",
    "source": "https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html",
    "revision": "补解析，原题保留"
  },
  {
    "id": "g4-t1-q4",
    "unit": "scenes",
    "topic": "Godot 4 代码解释",
    "sourceQuestion": "在 Godot 4 中，如何从脚本实例化场景？",
    "question": "已加载的Godot 4 PackedScene资源保存在packed变量里，哪种写法创建它的节点实例？",
    "options": [
      "packed.instance()",
      "packed.instantiate()",
      "packed.add_child()",
      "new packed()"
    ],
    "answer": 1,
    "explanation": "Godot 4已加载的PackedScene通过instantiate()创建节点实例，再用add_child()加入场景树；instance()是旧写法。原题未提供正确的Godot 4选项，已修订。",
    "source": "https://docs.godotengine.org/en/stable/classes/class_packedscene.html",
    "revision": "纠正Godot3 instance旧API，明确PackedScene前提"
  },
  {
    "id": "g4-t0-q0",
    "unit": "scripts",
    "topic": "Godot 4 代码语法",
    "sourceQuestion": "在 Godot 4 的 GDScript 中，声明变量的正确语法是什么？",
    "question": "在 Godot 4 的 GDScript 中，声明变量的正确语法是什么？",
    "options": [
      "var variable_name = value",
      "variable_name = value",
      "int variable_name = value",
      "declare variable_name = value"
    ],
    "answer": 0,
    "explanation": "GDScript用var声明变量，可加类型标注。C式int name或其他语言的declare不能直接照搬；声明与后续赋值不同。",
    "source": "https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html",
    "revision": "补解析，原题保留"
  },
  {
    "id": "g4-t0-q1",
    "unit": "scripts",
    "topic": "Godot 4 代码语法",
    "sourceQuestion": "在 Godot 4 的 GDScript 中，如何定义函数？",
    "question": "在 Godot 4 的 GDScript 中，如何定义函数？",
    "options": [
      "function my_function() {}",
      "def my_function():",
      "func my_function():",
      "create my_function():"
    ],
    "answer": 2,
    "explanation": "GDScript用func定义函数，参数后跟冒号，函数体用缩进。function、def是其他语言写法。",
    "source": "https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html",
    "revision": "补解析，原题保留"
  },
  {
    "id": "g4-t3-q6",
    "unit": "signals",
    "topic": "Godot 4 函数",
    "sourceQuestion": "在 Godot 4 中，计时器节点超时会调用哪个函数？",
    "question": "Godot 4的Timer计时结束会发出哪个信号？接收函数需另外连接。",
    "options": [
      "timeout",
      "_timeout()固定回调",
      "_on_timeout()固定回调",
      "ready"
    ],
    "answer": 0,
    "explanation": "Timer到时发出timeout信号；接收函数名称由连接决定，_on_timer_timeout只是常见命名，不能当成固定回调。原题把信号与函数混淆，已重写。",
    "source": "https://docs.godotengine.org/en/stable/classes/class_timer.html",
    "revision": "把错误的固定函数提问改为准确的timeout信号概念"
  },
  {
    "id": "g4-t4-q5",
    "unit": "debug",
    "topic": "Godot 4 编辑器",
    "sourceQuestion": "在 Godot 4 中，“输出（Output）”面板的用途是什么？",
    "question": "在 Godot 4 中，“输出（Output）”面板的用途是什么？",
    "options": [
      "显示脚本中的 print 语句输出",
      "显示渲染输出",
      "列出项目资源",
      "配置游戏设置"
    ],
    "answer": 0,
    "explanation": "输出面板能看到print输出的值与信息；错误位置和调用栈还需结合调试器。看到输出不等于全部逻辑正确。",
    "source": "https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html",
    "revision": "补解析，原题保留"
  }
];
const specs=[
 ['editor','面板职责','把文件、节点、属性区分开','想修改Label的显示文字，先选中Label后到哪里修改？',['输出面板','文件系统面板','检查器','项目列表'],2,'检查器显示选中对象的属性；文件系统用来找资源，不能代替节点属性编辑。','first_look_at_the_editor.html'],
 ['scenes','源场景与实例','区分文件复用与实例局部修改','把同一item场景拖入主场景两次后，想只移动右边的一个，怎样操作？',['移动源场景的根节点并保存','选中右边那个实例，修改它在主场景中的位置','删除源场景再建一个','同时移动两个实例'],1,'主场景中两个实例可以有各自的位置；源场景提供复用结构，不必为一个位置修改源文件。','instancing.html'],
 ['scripts','变量保存值','读懂赋值与条件','score初始为2，执行“如果score小于2则加1”，最后score是多少？',['2','3','1','无法判断'],0,'2小于2不成立，所以不进入加分分支，score仍为2。先判断条件，再看缩进中的语句是否执行。','scripting_first_script.html'],
 ['scripts','函数执行时机','区分定义与调用','脚本里定义了一个加分函数，但没有任何地方调用它，也没有连接事件。会自动加分吗？',['每帧自动加分','保存脚本就加分','不会，仅定义函数不代表执行','只有关闭工程才加分'],2,'函数定义描述要做的动作，必须由调用或相应事件触发才执行；不要把有代码当成已运行。','scripting_first_script.html'],
 ['signals','事件处理链','区分发出者与接收者','Button被点击后，哪一项描述了本节计分示例的协作关系？',['Button发出pressed信号，已连接的处理函数更新分数与Label','Label自动监听所有按钮','所有节点每帧加分','信号只保存图片'],0,'按钮是事件发出者，连接指定接收函数，由函数更新数据和显示；事件、连接与处理职责不同。','signals.html'],
 ['debug','错误证据','区分无报错与逻辑正确','游戏没有红色报错，但每次点击增加2分，需求是增加1分，应该怎样判断？',['仍需记录复现步骤、观察变量和调用，检查逻辑是否符合需求','没有报错就一定通过','直接清空工程','只更换字体'],0,'没有运行错误不等于逻辑正确。先复现并观察每次操作和状态变化，再定位重复调用或计算问题，修复后复验。','debugger_panel.html']
];
const current=specs.map(([unit,objective,difficulty,question,options,answer,explanation,page],i)=>({id:'objective-'+unit+'-'+i,unit,objective,difficulty,question,sourceQuestion:question,options,answer,explanation,origin:'本站按学习目标设计',source:'https://docs.godotengine.org/zh-cn/stable/'+(unit==='editor'?'getting_started/introduction/':unit==='debug'?'tutorials/scripting/debug/':'getting_started/step_by_step/')+page,revision:'按本节目标重新设计；旧题仅保留存档兼容'}));
const forUnit=unit=>current.filter(q=>q.unit===unit);
const compatible=unit=>[...current,...questions].filter(q=>q.unit===unit);
function clean(unit,raw={}){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('题库作答格式错误');const out={};for(const [id,value]of Object.entries(raw)){const q=compatible(unit).find(q=>q.id===id);if(!q||!Number.isInteger(value)||value<0||value>=q.options.length)throw Error('题库题目或选项不匹配');out[id]=value;}return out;}
function grade(unit,raw){const answers=clean(unit,raw);return Object.fromEntries(compatible(unit).filter(q=>Object.hasOwn(answers,q.id)).map(q=>[q.id,{selected:answers[q.id],correct:answers[q.id]===q.answer}]));}
return{questions:current,legacyQuestions:questions,forUnit,clean,grade};});
