/* Small stage sequences: a speaker, a physical beat, and a deliberate advance. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.N2Dialogue=api;})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  function create(o){
    var box=o.box,lines=[],index=0,after=null,readyAt=0,finished=true;
    var names={RICHARD:'리처드',ENRICO:'엔리코'};
    function add(tag,cls,text){var node=box.ownerDocument.createElement(tag);node.className=cls;node.textContent=o.safeText(text);box.appendChild(node);}
    function show(){
      if(index>=lines.length){
        if(finished)return;finished=true;box.classList.add('hidden');box.classList.remove('blocking');
        box.onclick=null;box.onkeydown=null;o.onCue({pose:'listen',look:'player'});
        if(o.onClose)o.onClose();var callback=after;after=null;if(callback)callback();return;
      }
      var raw=lines[index++],beat=typeof raw==='string'?{text:raw}:raw,who=beat.who||o.speaker;
      box.replaceChildren();box.dataset.speaker=who;box.dataset.pose=beat.pose||'listen';
      add('div','who',names[who]||who);
      if(beat.stage)add('div','stage-direction',beat.stage);
      add('p','line',beat.text||'');add('div','more','계속 ▸');
      readyAt=o.now()+Math.max(220,beat.pause||0);
      o.onCue(Object.assign({},beat,{who:who}));
    }
    function advance(event){if(finished||o.now()<readyAt||(event&&event.detail>1))return;show();}
    return {
      run:function(script,done){
        lines=script||[];index=0;after=done;finished=false;
        box.classList.remove('hidden');box.classList.add('blocking');box.setAttribute('role','button');box.setAttribute('aria-label',o.speaker+' 대화, 다음 대사');box.tabIndex=0;
        box.onclick=advance;box.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)advance(e);}};
        show();if(!finished)box.focus({preventScroll:true});
      }
    };
  }
  return {create:create};
});
