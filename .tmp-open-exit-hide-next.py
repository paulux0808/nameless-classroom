from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

old='''function showExitDoor(){
  if(S.done){showStageClear();return;}
  if(!S.exitReady){toast("아직 나갈 수 없다.");return;}
  openModal("뒷문","코드를 입력하시면 나갈 수 있습니다.",function(b){'''
new='''function showExitDoor(){
  if(S.done){showStageClear();return;}
  openModal("뒷문","코드를 입력하시면 나갈 수 있습니다.",function(b){'''
if s.count(old)!=1:
    raise SystemExit(f'exit guard count={s.count(old)}')
s=s.replace(old,new,1)

repls={
    'var next=el("button","btn btn-p","다음 스테이지 · 아인슈타인");':'var next=el("button","btn btn-p","다음 스테이지");',
    'b.appendChild(el("p","mini","아인슈타인 스테이지는 현재 준비중입니다."));':'b.appendChild(el("p","mini","다음 스테이지는 현재 준비중입니다."));'
}
for old,new in repls.items():
    if s.count(old)!=1:
        raise SystemExit(f'missing/duplicate index text: {old} count={s.count(old)}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Keep the internal filename, but do not reveal the next subject on the placeholder page.
e=Path('einstein.html')
t=e.read_text(encoding='utf-8')
t=t.replace('<title>아인슈타인 스테이지 — 준비중</title>','<title>다음 스테이지 — 준비중</title>')
t=t.replace('<div class="stage">STAGE 02</div>\n  <h1 class="name">ALBERT EINSTEIN</h1>','<div class="stage">STAGE 02</div>\n  <h1 class="name">NEXT MEMORY</h1>')
t=t.replace('완전히 새로운 교실을 준비하고 있습니다.<br>아인슈타인 스테이지는 다음 업데이트에서 시작됩니다.','완전히 새로운 교실을 준비하고 있습니다.<br>다음 스테이지는 다음 업데이트에서 시작됩니다.')
e.write_text(t,encoding='utf-8')

out=p.read_text(encoding='utf-8')
if 'if(!S.exitReady){toast("아직 나갈 수 없다.");return;}' in out:
    raise SystemExit('exitReady guard still present')
if '다음 스테이지 · 아인슈타인' in out or '아인슈타인 스테이지는 현재 준비중입니다.' in out:
    raise SystemExit('next-stage identity still exposed in index')
if 'ALBERT EINSTEIN' in e.read_text(encoding='utf-8') or '아인슈타인 스테이지' in e.read_text(encoding='utf-8'):
    raise SystemExit('next-stage identity still exposed in placeholder')
print('rear door always accepts code; next-stage identity hidden')
