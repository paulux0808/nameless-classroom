from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='''.sgrid{display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;
  background:#e8dcc0;padding:26px 20px;border-radius:3px;box-shadow:inset 0 0 0 1px #cbbb96}
.stile{background:#fff;border:2px solid #1d1913;display:grid}
.stile.v{grid-template-rows:1fr 1fr;width:84px;height:164px}
.stile.h{grid-template-columns:1fr 1fr;width:164px;height:84px}
.scell{display:grid;place-items:center;border:1px solid #1d1913}
.scell span{position:relative;display:grid;place-items:center;width:62px;height:62px}
.mk{position:absolute;top:-1px;left:50%;margin-left:-9px;width:18px;height:5px;background:#1d1913;border-radius:1px}
.scell svg{width:52px;height:52px;display:block}'''
new='''.sgrid{display:flex;gap:7px;justify-content:center;align-items:center;flex-wrap:nowrap;
  background:#e8dcc0;padding:10px 8px;border-radius:3px;box-shadow:inset 0 0 0 1px #cbbb96;overflow:hidden}
.stile{background:#fff;border:2px solid #1d1913;display:grid;flex:none}
.stile.v{grid-template-rows:1fr 1fr;width:54px;height:108px}
.stile.h{grid-template-columns:1fr 1fr;width:108px;height:54px}
.scell{display:grid;place-items:center;border:1px solid #1d1913}
.scell span{position:relative;display:grid;place-items:center;width:42px;height:42px}
.mk{position:absolute;top:-1px;left:50%;margin-left:-7px;width:14px;height:4px;background:#1d1913;border-radius:1px}
.scell svg{width:36px;height:36px;display:block}'''
if s.count(old)!=1:
    raise SystemExit('sheet css block count='+str(s.count(old)))
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
if 'flex-wrap:nowrap' not in s or '.stile.h{grid-template-columns:1fr 1fr;width:108px;height:54px}' not in s:
    raise SystemExit('sheet row validation failed')
print('sheet row patch validation ok')
