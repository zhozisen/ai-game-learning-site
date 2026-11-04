(()=>{
 'use strict';
 const params=new URLSearchParams(location.search),id=params.get('station')||'1';
 const s=StructuredCourses[id];
 if(id!=='2'&&!s){location.replace('?station=1');return;}
 const titles=['起点导读','Git时光机','认识Godot','驾驭AI','拆解真游戏','策划你的游戏','动手创造','发布与回顾'];
 StructuredContent.station={number:Number(id),title:titles[Number(id)],goal:s?.goal||'完成一个能开始、操作、结束并重新开始的小型2D项目。'};
 if(s){
  window.StructuredCourseConfig={keys:s.lessons.map(d=>d.id),correct:Object.fromEntries(s.lessons.map(d=>[d.id,d.assessments.map(e=>e.answer)]))};
  window.StructuredLessons=Object.fromEntries(s.lessons.map(d=>[d.id,d]));
  Object.assign(StructuredContent,{units:s.lessons.map(d=>d.name),resources:s.lessons.map(d=>d.resources),documents:s.documents,outcomes:s.lessons.map(d=>d.goal),extras:s.extras});
 }
 document.title=titles[Number(id)]+' · 结构化学习候选预览';
 document.querySelector('header>span').textContent='第 '+id+' 站 / '+titles[Number(id)]+' · 候选预览';
 document.querySelector('#sidebar>h2').textContent=titles[Number(id)];
 document.querySelector('#sidebar>.muted').textContent='每次一个单元，按目标学习、实践和检查。';
 document.querySelector('#sidebar>.eyebrow').textContent='LEARNING JOURNEY / 0'+id;
 const nav=document.createElement('nav');nav.className='station-nav';nav.setAttribute('aria-label','全站学习路径');
 titles.forEach((title,i)=>{const a=document.createElement('a');a.href='?station='+i;a.textContent='0'+i+' '+title;if(i===Number(id))a.setAttribute('aria-current','page');nav.append(a);});
 document.querySelector('header').after(nav);
 const home=document.createElement('a');home.href='index.html';home.target='_top';home.textContent='返回轨道地图 ↗';home.className='map-return';document.querySelector('#sidebar .aside-foot').prepend(home);
})();
