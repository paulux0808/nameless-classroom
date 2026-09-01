from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='''  var W=0.66,H=0.76,TK=0.105,TN=0.022;\n  var einsteinCol=0x8a6134, thinCol=0x70451f;\n  function bar(w,h,x,y,thick){\n    var m=box(w,h,thick?0.042:0.03,thick?einsteinCol:thinCol,x,y,thick?0.024:0.018);\n    m.material.roughness=0.62;bars.add(m);}'''
new='''  var W=0.66,H=0.76,TK=0.105,TN=0.022;\n  var frameCol=0x8a6134;\n  function bar(w,h,x,y,thick){\n    var m=box(w,h,thick?0.042:0.03,frameCol,x,y,thick?0.024:0.018);\n    m.material.roughness=0.62;bars.add(m);}'''
if s.count(old)!=1:
    raise SystemExit('frame color block count='+str(s.count(old)))
s=s.replace(old,new,1)
# old post-build color traversal is redundant and can conflict with future redraw logic
old2='''  /* 액자 두께 규칙은 유지하고, 색은 아인슈타인 액자의 진한 갈색 톤으로 통일 */\n  Object.keys(frameObjs).forEach(function(fid){\n    var bars=frameObjs[fid]&&frameObjs[fid].userData.bars;\n    if(!bars)return;\n    bars.traverse(function(o){\n      if(!o.isMesh||!o.material||!o.material.color)return;\n      o.material.color.setHex(0x986b43);\n      if('roughness' in o.material)o.material.roughness=0.58;\n    });\n  });\n\n'''
if old2 in s:
    s=s.replace(old2,'',1)
p.write_text(s,encoding='utf-8')
out=p.read_text(encoding='utf-8')
if 'var frameCol=0x8a6134;' not in out: raise SystemExit('missing unified frame color')
if 'thinCol=' in out: raise SystemExit('thin frame color still present')
print('frame color patch validation ok')
