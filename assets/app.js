'use strict';
const $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V=(r,k)=>r?.[k]??'';
const I=(name,cls='')=>'<svg class="icon '+E(cls)+'" aria-hidden="true"><use href="./assets/icons.svg#'+E(name)+'"></use></svg>';
const GROUP_ICONS={'01 / Основа':'book-open','02 / Звучание':'layers','03 / Enjoy Care':'droplets','04 / Консультация':'compass','05 / Практика':'notebook-pen','06 / Мастерство':'award','07 / Мастерская':'flask-conical'};
const repoDate='07.10.2026';
const state={aromas:[],course:null,lesson:null,group:'all',query:'',collection:'',gender:'',limit:24,answers:{},passed:new Set(),view:'academy'};
try{state.passed=new Set(JSON.parse(localStorage.getItem('scentguide-progress-v2')||'[]'));}catch(e){}
const collectionName=r=>V(r,'Коллекция')||'';
const nfmt=v=>Number(v).toLocaleString('ru-RU');
function noteText(r){return ['Верхние ноты','Средние ноты','Базовые ноты','Ноты без деления'].map(k=>V(r,k)).filter(Boolean).join(' · ');}
function escText(x){return E(x||'—')}
function goTop(){window.scrollTo({top:0,behavior:'smooth'})}
function switchView(view){
 if(!['academy','catalog','match'].includes(view))return;
 state.view=view;
 document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+view));
 document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
 $('mobileMenu').setAttribute('aria-expanded','false');document.querySelector('.main-nav').classList.remove('open');
 if(view==='academy')showAcademyHome();
 if(view==='catalog')renderCatalog();
 goTop();
}
function progress(){
 if(!state.course)return;
 const done=state.course.lessons.filter(l=>state.passed.has(l.id)).length;
 $('progress-text').textContent=done+' из '+state.course.lessons.length+' уроков завершено';
 const pct=Math.round(100*done/state.course.lessons.length);
 $('progress-percent').textContent=pct+'%';$('progress-bar').style.width=pct+'%';
}
function renderAcademy(){
 if(!state.course)return;
 progress();
 const groups=['all',...new Set(state.course.lessons.map(l=>l.group))];
 $('course-filters').innerHTML=groups.map(g=>'<button class="pill '+(state.group===g?'active':'')+'" type="button" data-filter="'+E(g)+'">'+(g==='all'?'Все уроки':E(g.split(' / ').slice(1).join(' / ')))+'</button>').join('');
 const list=state.course.lessons.map((lesson,i)=>({lesson,i})).filter(({lesson})=>state.group==='all'||lesson.group===state.group);
 $('course-list').innerHTML=list.map(({lesson:l,i})=>'<button class="course-card" data-lesson="'+i+'" type="button"><div class="cc-top"><span>'+E(l.group)+'</span><span class="done-mark">'+(state.passed.has(l.id)?I('circle-check')+' Пройдено':I('clock')+' '+E(l.reading+' мин'))+'</span></div><h3>'+E(l.title)+'</h3><p>'+E(l.lead)+'</p><div class="cc-bottom"><span>УРОК '+String(i+1).padStart(2,'0')+' / '+state.course.lessons.length+'</span><span class="cc-arrow">'+I('arrow-up-right')+'</span></div></button>').join('')||'<div class="empty">Уроки не найдены</div>';
}
function showAcademyHome(){
 state.lesson=null;$('academy-home').hidden=false;$('lesson-view').hidden=true;$('exam-view').hidden=true;
 renderAcademy();
}
function openLesson(idx){
 if(!state.course||idx<0||idx>=state.course.lessons.length)return;
 state.lesson=idx;state.view='academy';
 document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-academy'));
 document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.view==='academy'));
 $('academy-home').hidden=true;$('lesson-view').hidden=false;$('exam-view').hidden=true;
 renderLesson();goTop();
}
function renderLesson(){
 if(state.lesson===null)return;
 const l=state.course.lessons[state.lesson], idx=state.lesson;
 $('lesson-group').textContent=l.group;
 $('lesson-outline').innerHTML=state.course.lessons.map((x,i)=>'<button type="button" data-lesson="'+i+'" class="outline-item '+(idx===i?'active ':'')+(state.passed.has(x.id)?'done':'')+'"><span>'+(state.passed.has(x.id)?I('check'):String(i+1).padStart(2,'0'))+'</span>'+E(x.title)+'</button>').join('');
 const parts=l.parts.map((p,i)=>'<section class="lesson-part"><h2>'+String(i+1).padStart(2,'0')+'. '+E(p.heading)+'</h2><p>'+E(p.text)+'</p></section>').join('');
 const a=state.answers[l.id], complete=state.passed.has(l.id);
 const options=l.quiz.answers.map((option,i)=>{
 const cn=a!==undefined?(i===l.quiz.correct?'right':a===i?'wrong':''):'';
 return '<button type="button" class="option '+cn+'" data-answer="'+i+'"><span class="letter">'+String.fromCharCode(65+i)+'</span>'+E(option)+'</button>';
 }).join('');
 $('lesson-article').innerHTML='<div class="lesson-overline"><span>'+E(l.group)+'</span><span>·</span><span>УРОК '+String(idx+1).padStart(2,'0')+'</span></div>'
 +'<h1>'+E(l.title)+'</h1><p class="lesson-lead">'+E(l.lead)+'</p>'
 +'<div class="lesson-metadata"><span>'+I('clock')+' '+E(l.reading)+' минут</span><span>'+I('book-open')+' АВТОРСКИЙ УРОК</span><span>'+(complete?I('circle-check')+' ПРОЙДЕНО':I('bookmark')+' В ПРОЦЕССЕ')+'</span></div>'
 +parts
 +'<section class="lesson-practice"><span>'+I('flask-conical')+' ЗАКРЕПЛЯЕМ НА ПРАКТИКЕ</span><h3>Ваша практика</h3><p>'+E(l.practice)+'</p></section>'
 +'<section class="lesson-summary"><span class="overline">'+I('lightbulb')+' ГЛАВНЫЕ МЫСЛИ</span><div class="summary-items">'+l.parts.map(p=>'<div>'+I('circle-check')+' '+E(p.heading)+'</div>').join('')+'</div></section>'
 +'<section class="lesson-test" id="lesson-test"><span class="overline">'+I('list-checks')+' ПРОВЕРЬТЕ СЕБЯ</span><h3>'+E(l.quiz.question)+'</h3>'+options+(a!==undefined?'<div class="test-feedback '+(a===l.quiz.correct?'correct':'incorrect')+'"><b>'+(a===l.quiz.correct?'Верно! Урок отмечен как пройденный.':'Пока не совсем. Можно выбрать другой ответ.')+'</b><div>'+E(l.quiz.explanation)+'</div></div>':'')+'</section>'
 +'<div class="lesson-bottom"><button class="btn btn-outline" data-lesson="'+Math.max(0,idx-1)+'" '+(idx===0?'disabled':'')+'>'+I('arrow-left')+' Предыдущий урок</button><button class="btn btn-dark" data-lesson="'+Math.min(state.course.lessons.length-1,idx+1)+'" '+(idx===state.course.lessons.length-1?'disabled':'')+'>Следующий урок '+I('arrow-up-right')+'</button></div>';
}
function selectAnswer(num){
 if(state.lesson===null)return;
 const l=state.course.lessons[state.lesson];state.answers[l.id]=num;
 if(num===l.quiz.correct){
 state.passed.add(l.id);try{localStorage.setItem('scentguide-progress-v2',JSON.stringify([...state.passed]));}catch(e){}
 }
 renderLesson();progress();
 const el=$('lesson-test');el?.scrollIntoView({behavior:'smooth',block:'center'});
}
function filteredCatalog(){
 const q=state.query.trim().toLocaleLowerCase('ru-RU');
 return state.aromas.map((r,i)=>({r,i})).filter(({r})=>{
 if(state.collection&&collectionName(r)!==state.collection)return false;
 if(state.gender&&V(r,'Категория')!==state.gender)return false;
 if(!q)return true;
 return [V(r,'Код аромата'),V(r,'Номер'),V(r,'Характер'),V(r,'Артикул флакона'),V(r,'Артикул пробника'),noteText(r)].some(v=>String(v).toLocaleLowerCase('ru-RU').includes(q));
 });
}
function makeCard(item){
 const r=item.r,i=item.i,c=collectionName(r),historical=V(r,'Статус источника')!=='Каталог РФ';
 const price=V(r,'Цена флакона, ₽');
 return '<button type="button" data-aroma="'+i+'" class="aroma-card" aria-label="Открыть '+E(V(r,'Код аромата'))+'"><div class="aroma-visual"><span class="visual-num">'+E(V(r,'Номер'))+'</span><span class="mini-bottle"></span><span class="visual-col">'+E(c.toUpperCase())+'</span></div><div><span class="overline">'+E(V(r,'Категория'))+' · '+E(c)+'</span><h3>'+E(V(r,'Код аромата'))+'</h3><p>'+E(V(r,'Характер')||'Описание из анонса; пирамиду уточнить')+'</p><div class="meta"><span>'+(V(r,'Объем, мл')?E(V(r,'Объем, мл'))+' мл':'Формат уточнить')+'</span><span>'+(price?nfmt(price)+' ₽*':'Без цены')+'</span><span class="mini-status">'+(historical?'Архив':'Каталог')+'</span></div></div></button>';
}
function renderCatalog(){
 const items=filteredCatalog();
 $('catalog-count').textContent='НАЙДЕНО '+items.length+' ИЗ '+state.aromas.length+' АРОМАТОВ';
 $('catalog-grid').innerHTML=items.slice(0,state.limit).map(makeCard).join('')||'<div class="empty">Ароматы не найдены. Попробуйте изменить запрос.</div>';
 $('showMore').hidden=items.length<=state.limit;
}
function aromaModal(idx){
 const r=state.aromas[idx];if(!r)return;
 const code=V(r,'Код аромата'),vol=V(r,'Объем, мл'),price=V(r,'Цена флакона, ₽');
 const known=V(r,'Статус источника')==='Каталог РФ';
 const pyramid=[
 ['Верхние ноты',V(r,'Верхние ноты')],
 ['Сердце',V(r,'Средние ноты')],
 ['База',V(r,'Базовые ноты')],
 ['Дополнительные ноты',V(r,'Ноты без деления')]
 ].filter(pair=>pair[1]);
 $('aroma-details').innerHTML='<button type="button" class="modal-close" data-close-modal aria-label="Закрыть">'+I('x')+'</button><span class="overline">'+E(collectionName(r))+' / '+E(V(r,'Категория'))+'</span><h2>'+E(code)+'</h2><p class="meta-note">'+E(V(r,'Характер')||'Описание этого аромата пока уточняется.')+'</p>'
 +(pyramid.length?'<div class="note-table">'+pyramid.map(([key,val])=>'<div class="note-row"><b>'+E(key)+'</b><div>'+E(val)+'</div></div>').join('')+'</div>':'<div class="modal-info">Пирамида нот пока не заполнена. Уточните характеристики перед рекомендацией.</div>')
 +'<div class="modal-info"><b>Формат и данные заказа</b><p>Объём: '+(vol?E(vol)+' мл':'уточнить')+'<br>Артикул флакона: '+escText(V(r,'Артикул флакона'))+'<br>Пробник: '+escText(V(r,'Объем пробника, мл'))+' мл / арт. '+escText(V(r,'Артикул пробника'))+'<br>Цена флакона на '+repoDate+': '+(price?nfmt(price)+' ₽':'не указана')+'</p></div>'
 +'<p class="meta-note">'+(known?'Описание аромата заполнено.':'Лимитированная позиция: подробные характеристики требуют уточнения.')+' Перед покупкой проверьте актуальную цену и наличие.</p>'
 +'<div class="modal-footer"><button type="button" data-copy="'+idx+'">Скопировать подборку '+I('arrow-up-right')+'</button><button type="button" data-close-modal>Закрыть</button></div>';
 $('aroma-modal').classList.add('open');$('aroma-modal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('aroma-details').focus();
}
function closeModal(){$('aroma-modal').classList.remove('open');$('aroma-modal').setAttribute('aria-hidden','true');document.body.style.overflow='';}
async function copyAroma(idx){
 const r=state.aromas[idx];if(!r)return;
 const t=[V(r,'Код аромата'),V(r,'Характер'),'Верхние ноты: '+V(r,'Верхние ноты'),'Средние: '+V(r,'Средние ноты'),'База: '+V(r,'Базовые ноты'),'Артикул: '+V(r,'Артикул флакона'),'Наличие и цены уточняйте перед заказом.'].join('\n');
 try{await navigator.clipboard.writeText(t);const btn=document.querySelector('[data-copy]');if(btn)btn.innerHTML=I('circle-check')+' Скопировано';}
 catch(e){alert('Не удалось скопировать. Откройте карточку в защищённом браузере.');}
}
const matchTokens={
fresh:['цитрус','бергамот','грейпфрут','лимон','морск','водн','лайм','мята','свеж','зелён'],
floral:['жасмин','роз','цвет','пион','тубероз','магнол','фиал','ландыш','лаванд'],
sweet:['ванил','какао','кофе','миндал','тонка','карамел','мед','шоколад','пралине'],
wood:['древес','кедр','сандал','ветивер','пачули','мох','гуаяк','лес'],
fruit:['фрукт','яблок','манго','груш','смородин','персик','малин','личи','ягод','маракуй'],
spice:['прян','перец','кардамон','имбирь','шафран','кориц','восточ','гвоздик','амбр']
};
function recommend(event){
 event.preventDefault();if(!state.aromas.length)return;
 const style=$('match-style').value,gender=$('match-who').value,usage=$('match-use').value;
 const avoid=$('match-avoid').value.toLowerCase().split(/[,;]+/).map(x=>x.trim()).filter(x=>x.length>1);
 const candidates=state.aromas.map((r,i)=>{
 const character=String(V(r,'Характер')).toLowerCase(),notes=noteText(r).toLowerCase(),txt=character+' '+notes;
 if(V(r,'Статус источника')!=='Каталог РФ')return null;
 if(gender&&V(r,'Категория')!==gender&&V(r,'Категория')!=='Унисекс')return null;
 if(avoid.some(w=>txt.includes(w)))return null;
 let score=0,found=[];
 for(const token of matchTokens[style])if(txt.includes(token)){score+=notes.includes(token)?2:1;found.push(token);}
 if(usage==='everyday'&&collectionName(r)==='Day-to-Day')score+=2;
 if(usage==='evening'&&collectionName(r)==='Luxe')score+=2;
 if(score===0)return null;
 return {r,i,score,found};
 }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,4);
 const container=$('match-results');
 if(!candidates.length){container.innerHTML='<span class="overline">ПОДБОРКА</span><h2>Точных совпадений нет</h2><p>Попробуйте изменить нежелательные ноты или направление. Мы не рекомендуем позиции без подтверждённых данных.</p>';return;}
 container.innerHTML='<div class="match-results-head"><span class="overline">02 / ВАША ПОДБОРКА</span><h2>Попробуйте <em>эти ароматы</em></h2><p>Подборка сформирована по совпадениям заявленных нот и характеров. Нажмите на аромат, чтобы увидеть его пирамиду и артикул.</p></div>'
 +candidates.map((x,i)=>'<button type="button" class="match-result" data-aroma="'+x.i+'"><span>'+String(i+1).padStart(2,'0')+'</span><div><h3>'+E(V(x.r,'Код аромата'))+'</h3><p>'+E(V(x.r,'Характер'))+'. Совпадения: '+E([...new Set(x.found)].slice(0,4).join(', '))+'.</p></div><i>'+I('arrow-up-right')+'</i></button>').join('')
 +'<p class="meta-note" style="font-size:11px;color:#948276;margin-top:20px">Попробуйте 2–3 варианта на блоттерах перед выбором. Это не гарантия того, что аромат понравится.</p>';
}
const examIds=[0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,17,21,25];
function openExam(){
 if(!state.course)return;
 state.lesson=null;$('academy-home').hidden=true;$('lesson-view').hidden=true;$('exam-view').hidden=false;
 $('exam-result').innerHTML='';
 const qs=examIds.map(i=>state.course.lessons[i]);
 $('exam-form').innerHTML=qs.map((lesson,i)=>'<fieldset class="exam-question"><legend><span>'+String(i+1).padStart(2,'0')+' / 18</span>'+E(lesson.quiz.question)+'</legend>'+lesson.quiz.answers.map((answer,j)=>'<label class="exam-option"><input type="radio" name="q'+i+'" value="'+j+'"><span>'+E(answer)+'</span></label>').join('')+'</fieldset>').join('')+'<button class="btn btn-dark exam-submit" type="submit">Проверить знания '+I('arrow-up-right')+'</button>';
 goTop();
}
function submitExam(e){
 e.preventDefault();
 if(!state.course)return;
 const form=new FormData(e.target);
 const missing=examIds.map((v,i)=>i).filter(i=>form.get('q'+i)===null);
 if(missing.length){
   $('exam-result').innerHTML='<div class="exam-score exam-warning"><h2>Осталось ответить на '+missing.length+' вопросов</h2><p>Ответьте на все вопросы, чтобы завершить экзамен.</p></div>';
   return;
 }
 let correct=0;
 const mistakes=[];
 examIds.forEach((id,i)=>{
   const lesson=state.course.lessons[id],ans=Number(form.get('q'+i));
   if(ans===lesson.quiz.correct)correct++;
   else mistakes.push({lesson,ans,num:i+1});
 });
 const pct=Math.round(correct/examIds.length*100),passed=pct>=80;
 $('exam-result').innerHTML='<div class="exam-score"><span class="overline">РЕЗУЛЬТАТ ЭКЗАМЕНА</span><h2>'+correct+' / '+examIds.length+'</h2><p>'+(passed?'Отлично! Вы уверенно ориентируетесь в основных темах курса.':'Есть темы, которые стоит повторить. После разбора ошибок можно пройти экзамен снова.')+'</p><strong>'+pct+'% · '+(passed?'УРОВЕНЬ ОСВОЕН':'ПОВТОРИТЕ МАТЕРИАЛ')+'</strong></div>'
 +(mistakes.length?'<div class="exam-errors"><h3>Что повторить</h3>'+mistakes.map(m=>'<div><b>Вопрос '+m.num+': '+E(m.lesson.quiz.question)+'</b><p>Правильный ответ: '+E(m.lesson.quiz.answers[m.lesson.quiz.correct])+'. '+E(m.lesson.quiz.explanation)+'</p></div>').join('')+'</div>':'')
 +'<button class="btn btn-outline" id="retakeExam" type="button">'+I('refresh-cw')+' Пройти ещё раз</button>';
 $('exam-form').querySelectorAll('input').forEach(input=>input.disabled=true);
 $('exam-form').querySelector('button[type=submit]').disabled=true;
 $('exam-result').scrollIntoView({behavior:'smooth',block:'start'});
 $('retakeExam').addEventListener('click',openExam);
}
function clickHandler(e){
 const target=e.target.closest('button,[data-close-modal]');if(!target)return;
 if(target.hasAttribute('data-close-modal')){closeModal();return;}
 if(target.dataset.view){switchView(target.dataset.view);return;}
 if(target.dataset.filter){state.group=target.dataset.filter;renderAcademy();return;}
 if(target.dataset.lesson!==undefined){openLesson(Number(target.dataset.lesson));return;}
 if(target.dataset.answer!==undefined){selectAnswer(Number(target.dataset.answer));return;}
 if(target.dataset.aroma!==undefined){aromaModal(Number(target.dataset.aroma));return;}
 if(target.dataset.copy!==undefined){copyAroma(Number(target.dataset.copy));return;}
}
async function boot(){
 document.addEventListener('click',clickHandler);
 $('homeLogo').addEventListener('click',()=>switchView('academy'));
 $('mobileMenu').addEventListener('click',()=>{
  const menu=document.querySelector('.main-nav'),open=menu.classList.toggle('open');
  $('mobileMenu').setAttribute('aria-expanded',String(open));
 });
 $('startLearning').addEventListener('click',()=>{if(!state.course)return;const next=state.course.lessons.findIndex(l=>!state.passed.has(l.id));openLesson(next<0?0:next)});
 $('backAcademy').addEventListener('click',()=>{showAcademyHome();goTop()});
 $('startExam').addEventListener('click',openExam);
 $('backFromExam').addEventListener('click',()=>{showAcademyHome();goTop()});
 $('exam-form').addEventListener('submit',submitExam);
 $('catalog-query').addEventListener('input',e=>{state.query=e.target.value;state.limit=24;renderCatalog()});
 $('catalog-collection').addEventListener('change',e=>{state.collection=e.target.value;state.limit=24;renderCatalog()});
 $('catalog-gender').addEventListener('change',e=>{state.gender=e.target.value;state.limit=24;renderCatalog()});
 $('showMore').addEventListener('click',()=>{state.limit+=24;renderCatalog()});
 $('match-form').addEventListener('submit',recommend);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
 try{
 const responses=await Promise.all([fetch('./data/fragrances.json'),fetch('./data/academy.json')]);
 if(responses.some(r=>!r.ok))throw Error('HTTP '+responses.map(r=>r.status).join('/'));
 const [aromas,course]=await Promise.all(responses.map(r=>r.json()));
 if(!Array.isArray(aromas)||!Array.isArray(course.lessons))throw Error('Invalid data format');
 state.aromas=aromas;state.course=course;renderAcademy();renderCatalog();$('hero-lesson-count').textContent=course.lessons.length+' УРОКОВ С ТЕОРИЕЙ';$('hero-chapter-count').textContent=new Set(course.lessons.map(l=>l.group)).size+' РАЗДЕЛОВ';
 }catch(error){
  console.error('SCENT GUIDE loading error',error);
  $('course-list').innerHTML='<div class="empty">Не удалось загрузить программу. Обновите страницу или проверьте подключение.</div>';
  $('catalog-grid').innerHTML='<div class="empty">Каталог временно недоступен.</div>';
 }
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
