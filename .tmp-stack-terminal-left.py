from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

old='''.terminal-aid-grid{height:100%;display:grid;grid-template-columns:minmax(0,var(--aid-diary,46%)) minmax(0,1fr);gap:9px;align-items:stretch}
.terminal-aid-grid.single{grid-template-columns:minmax(0,1fr);max-width:720px}'''
new='''.terminal-aid-grid{height:100%;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,var(--aid-diary,46%)) minmax(0,1fr);gap:9px;align-items:stretch}
.terminal-aid-grid.single{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);max-width:720px}'''

if s.count(old)!=1:
    raise SystemExit(f'terminal grid CSS count={s.count(old)}')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

out=p.read_text(encoding='utf-8')
checks=[
    'grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,var(--aid-diary,46%)) minmax(0,1fr)',
    '.terminal-aid-grid.single{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);max-width:720px}',
    'host.style.setProperty("--aid-diary",(spec.diary||46)+"%")',
    'grid.appendChild(terminalAidDiary(c));',
    'if(spec.kind)grid.appendChild(terminalAidResource(spec));'
]
for q in checks:
    if q not in out:
        raise SystemExit('missing '+q)
if 'grid-template-columns:minmax(0,var(--aid-diary,46%)) minmax(0,1fr)' in out:
    raise SystemExit('old horizontal terminal grid still present')
print('terminal companion now stacks diary above chapter material')
