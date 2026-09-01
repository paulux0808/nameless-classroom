from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

repls=[
('1:{kind:"sci",title:"과학자·수학자 자료",diary:43},','1:{kind:null,title:"",diary:100},'),
('2:{kind:"frames",title:"기호 종이 · 과학자 자료",diary:40},','2:{kind:"frames",title:"기호 종이",diary:40},'),
('''  if(spec.kind==="sci"){
    SCI.forEach(function(s){terminalAidDetails(list,s.name+' <span style="color:var(--dim);font-weight:400">'+s.en+'</span>',
      '<dl><dt>생몰</dt><dd>'+s.born+' ~ '+s.died+'</dd><dt>핵심</dt><dd>'+s.key+'</dd></dl><p style="margin:8px 0 0">'+s.body+'</p>');});
    b.appendChild(list);
  }else if(spec.kind==="frames"){
    var sheet=el("div","symbol-sheet",symbolSheetHTML());b.appendChild(sheet);
    SCI.forEach(function(s){terminalAidDetails(list,s.name+' <span style="color:var(--dim);font-weight:400">'+s.en+'</span>',
      '<dl><dt>생몰</dt><dd>'+s.born+' ~ '+s.died+'</dd><dt>핵심</dt><dd>'+s.key+'</dd></dl>');});
    b.appendChild(list);
''','''  if(spec.kind==="frames"){
    var sheet=el("div","symbol-sheet",symbolSheetHTML());b.appendChild(sheet);
''')
]

for old,new in repls:
    if old not in s:
        raise SystemExit('missing target: '+old[:80])
    s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')

out=p.read_text(encoding='utf-8')
checks=[
 '1:{kind:null,title:"",diary:100}',
 '2:{kind:"frames",title:"기호 종이",diary:40}',
 'if(spec.kind==="frames")',
 'symbolSheetHTML()'
]
for q in checks:
    if q not in out: raise SystemExit('missing '+q)
if 'kind:"sci"' in out: raise SystemExit('sci companion still configured')
if '기호 종이 · 과학자 자료' in out: raise SystemExit('old duplicate title remains')
print('wall reference duplication removed')
