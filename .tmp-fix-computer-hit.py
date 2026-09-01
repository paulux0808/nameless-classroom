from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

old='''  var screen=plane(0.86,0.52,screenMat,0,1.24,-3.015);\n  scene.add(hot(screen,"computer","컴퓨터"));\n  screenGlow=new THREE.PointLight(0x63c3b2,0.55,3.4);screenGlow.position.set(0,1.3,-2.7);scene.add(screenGlow);'''
new='''  var screen=plane(0.86,0.52,screenMat,0,1.24,-3.015);\n  scene.add(screen);\n  /* 필수 진행 오브젝트: 화면 자체보다 넓은 투명 판정 영역을 둔다. */\n  var computerHit=plane(1.58,1.02,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,1.24,-3.005);\n  scene.add(hot(computerHit,"computer","컴퓨터"));\n  screenGlow=new THREE.PointLight(0x63c3b2,0.55,3.4);screenGlow.position.set(0,1.3,-2.7);scene.add(screenGlow);'''
if s.count(old)!=1:
    raise SystemExit(f'computer screen block count={s.count(old)}')
s=s.replace(old,new,1)

old='''function reachFor(o){\n  return o&&o.userData&&o.userData.hot&&o.userData.hot.id==="computer"?4.2:REACH;\n}'''
new='''function reachFor(o){\n  /* 컴퓨터는 각 장 진행에 필수이므로 조준만 되면 조사 가능하게 한다. */\n  return o&&o.userData&&o.userData.hot&&o.userData.hot.id==="computer"?Infinity:REACH;\n}'''
if s.count(old)!=1:
    raise SystemExit(f'reachFor block count={s.count(old)}')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
out=p.read_text(encoding='utf-8')
for q in [
    'var computerHit=plane(1.58,1.02',
    'scene.add(hot(computerHit,"computer","컴퓨터"));',
    'id==="computer"?Infinity:REACH',
    'if(id==="computer"){showComputer();return;}'
]:
    if q not in out:
        raise SystemExit('missing '+q)
print('computer interaction patch validation ok')
