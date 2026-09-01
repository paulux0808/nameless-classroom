from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1) Vatican terminal: keep answer logic unchanged; make the required computer reachable from farther away.
old='''var lastHover=null, lastDist=0, REACH=3.0, hoverFar=false;
function hover(x,y){'''
new='''var lastHover=null, lastDist=0, REACH=3.0, hoverFar=false;
function reachFor(o){
  return o&&o.userData&&o.userData.hot&&o.userData.hot.id==="computer"?4.2:REACH;
}
function hover(x,y){'''
if s.count(old)!=1:
    raise SystemExit(f'reach helper insertion count={s.count(old)}')
s=s.replace(old,new,1)
if s.count('hoverFar=lastDist>REACH;')!=1:
    raise SystemExit('hover range target missing')
s=s.replace('hoverFar=lastDist>REACH;','hoverFar=lastDist>reachFor(o);',1)
if s.count('if(lastDist>REACH){toast("더 가까이 가세요.");return;}')!=1:
    raise SystemExit('pick range target missing')
s=s.replace('if(lastDist>REACH){toast("더 가까이 가세요.");return;}',
            'if(lastDist>reachFor(o)){toast("더 가까이 가세요.");return;}',1)

# 2) Rowing: restore the weight clue only inside rowing's own rule, not as a universal weight row.
old_rule='''  rule:"에이트에서는 8명의 조수가 노를 젓고, 타수(coxswain)가 보트의 방향과 선수들의 호흡·리듬을 지시한다.",'''
new_rule='''  rule:"에이트에서는 8명의 조수가 노를 젓고, 타수(coxswain)가 보트의 방향과 선수들의 호흡·리듬을 지시한다. 대한조정협회 규칙에는 타수의 체중을 50kg 이상으로 하고, 미달하면 좌석 밑에 최대 10kg의 중량물을 둘 수 있다고 되어 있다.",'''
if s.count(old_rule)!=1:
    raise SystemExit(f'rowing rule target count={s.count(old_rule)}')
s=s.replace(old_rule,new_rule,1)

# 3) Chapter 4: show the entire letter first, then the sketch below it.
start=s.index('DIARY_HTML.diary4=')
end=s.index('DIARY_HTML.diary5=',start)
sec=s[start:end]
# Capture the existing sketch expression in the diary section.
m=re.search(r'''\n ('<div class="cosmo-sketch"[\s\S]*?'</svg></div>'\+)\n''',sec)
if not m:
    raise SystemExit('chapter4 sketch block not found')
sketch=m.group(1)
sec=sec[:m.start()]+'\n'+sec[m.end():]
last=''' '<p>바로 <span class="redacted"></span> 말이야!!!<br>어서 펜로즈 교수님을 찾아가야해. 서두르자!</p>';'''
if sec.count(last)!=1:
    raise SystemExit(f'chapter4 final paragraph count={sec.count(last)}')
# Existing sketch expression ends in + because text used to follow it. At the bottom it must end in ;.
sketch_last=sketch[:-1]+';'
sec=sec.replace(last,last[:-1]+'+\n'+sketch_last,1)
s=s[:start]+sec+s[end:]

p.write_text(s,encoding='utf-8')

out=p.read_text(encoding='utf-8')
checks=[
    'function reachFor(o){',
    'id==="computer"?4.2:REACH',
    'hoverFar=lastDist>reachFor(o);',
    'if(lastDist>reachFor(o)){toast("더 가까이 가세요.");return;}',
    '타수의 체중을 50kg 이상으로 하고, 미달하면 좌석 밑에 최대 10kg의 중량물을 둘 수 있다고 되어 있다.',
]
for q in checks:
    if q not in out:
        raise SystemExit('missing '+q)
if '<dt>체중 규정</dt>' in out:
    raise SystemExit('universal weight row returned')
sec2=out[out.index('DIARY_HTML.diary4='):out.index('DIARY_HTML.diary5=')]
if sec2.index('cosmo-sketch') < sec2.index('어서 펜로즈'):
    raise SystemExit('chapter4 sketch is still above final letter text')
if out.count('cosmo-sketch') < 2:  # CSS + diary markup
    raise SystemExit('sketch unexpectedly missing')
print('Vatican reach + chapter4 vertical order + rowing weight clue validation ok')
