from pathlib import Path
import base64, io, re
from PIL import Image

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Portrait JPGs were visually inspected. Crop only the actual artwork/photo area,
# removing the wooden/gold frame that is already baked into each source image.
CROPS={
    'newton':      ((320,394),(38,30,306,394)),
    'archimedes':  ((320,358),(34,18,309,354)),
    'abel':        ((320,362),(33,34,310,362)),
    'einstein':    ((320,366),(32,31,288,366)),
    'galilei':     ((320,379),(10,13,310,376)),
    'gauss':       ((320,379),(32,17,309,374)),
}

for name,(expected,box) in CROPS.items():
    pat=re.compile(r'(portrait_'+re.escape(name)+r'\s*:\s*"data:image/jpeg;base64,)([^"]+)(")')
    m=pat.search(s)
    if not m:
        raise SystemExit('missing portrait '+name)
    raw=base64.b64decode(m.group(2))
    im=Image.open(io.BytesIO(raw)).convert('RGB')
    if im.size!=expected:
        raise SystemExit(f'{name} unexpected size {im.size}, expected {expected}')
    cropped=im.crop(box)
    out=io.BytesIO()
    cropped.save(out,format='JPEG',quality=92,optimize=True,progressive=True)
    b64=base64.b64encode(out.getvalue()).decode('ascii')
    s=s[:m.start(2)]+b64+s[m.end(2):]
    print(name, expected, '->', cropped.size)

# Existing saves predate Einstein rotation state. Normalize it explicitly so
# Einstein behaves exactly like the other rotatable frames across reloads.
old='''function fresh(){return{started:false,ch:1,phase:"read",pieces:[],rot:{apple:0,compass:0,sqrt:0,sun:0,pi:0},\n                        stack:null,revealed:0,tookD1:false,done:false};}\nvar S=Object.assign(fresh(),store.get()||{});'''
new='''function fresh(){return{started:false,ch:1,phase:"read",pieces:[],rot:{apple:0,compass:0,sqrt:0,sun:0,pi:0,einstein:0},\n                        stack:null,revealed:0,tookD1:false,done:false};}\nvar S=Object.assign(fresh(),store.get()||{});\nS.rot=S.rot||{};\n["apple","compass","sqrt","sun","pi","einstein"].forEach(function(k){\n  if(!Number.isFinite(S.rot[k]))S.rot[k]=0;\n});'''
if old not in s:
    raise SystemExit('fresh rot state block not found')
s=s.replace(old,new,1)

# Frame colour is an independent runtime concern from the JPG crop above.
# Build every bar from an unlit brown material on every redraw, so initial load,
# rotation and restored saves cannot turn the 3D frame white.
old='''  var W=0.66,H=0.76,TK=0.105,TN=0.022;\n  var frameCol=0x8a6134;\n  function bar(w,h,x,y,thick){\n    var m=box(w,h,thick?0.042:0.03,frameCol,x,y,thick?0.024:0.018);\n    m.material.roughness=0.62;bars.add(m);}'''
new='''  var W=0.66,H=0.76,TK=0.105,TN=0.032;\n  var frameCol=0x8a6134;\n  function bar(w,h,x,y,thick){\n    var mat=new THREE.MeshBasicMaterial({color:frameCol});\n    var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,thick?0.042:0.03),mat);\n    m.position.set(x,y,thick?0.024:0.018);\n    m.renderOrder=8;\n    bars.add(m);}'''
if old not in s:
    raise SystemExit('frame bar block not found')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')

# Validation: no original portrait dimensions/frames remain, frame state is stable,
# and all six embedded portraits still decode successfully.
out=p.read_text(encoding='utf-8')
for q in [
    'einstein:0',
    'new THREE.MeshBasicMaterial({color:frameCol})',
    'var W=0.66,H=0.76,TK=0.105,TN=0.032;',
    '["apple","compass","sqrt","sun","pi","einstein"]'
]:
    if q not in out:
        raise SystemExit('missing '+q)
if 'thinCol=' in out:
    raise SystemExit('old split frame color remains')
for name,(expected,box) in CROPS.items():
    m=re.search(r'portrait_'+re.escape(name)+r'\s*:\s*"data:image/jpeg;base64,([^"]+)"',out)
    if not m: raise SystemExit('post-check missing '+name)
    im=Image.open(io.BytesIO(base64.b64decode(m.group(1))))
    target=(box[2]-box[0],box[3]-box[1])
    if im.size!=target:
        raise SystemExit(f'{name} crop check {im.size} != {target}')
print('portrait crop + runtime frame validation ok')
