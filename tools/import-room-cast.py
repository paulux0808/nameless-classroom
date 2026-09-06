#!/usr/bin/env python3
"""Import the small, reviewed CH1/2 asset set without touching the old library."""
import concurrent.futures, hashlib, json, mimetypes, struct, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/models/stage2/rooms'
UA = 'NamelessAssetPipeline/2.0 (+https://github.com/paulux0808/nameless-classroom)'
MODELS = {
    'wooden_table_02': 'CH01 writing desk',
    'vintage_wooden_drawer_01': 'CH01 calculation archive drawers',
    'industrial_pipe_lamp': 'CH01 desk light',
    'painted_wooden_table': 'CH02 shared review table',
    'painted_wooden_stool': 'CH02 team seating',
    'hanging_industrial_lamp': 'CH02 overhead work lights',
    'WoodenTable_03': 'CH02 equipment workbench',
    'worn_metal_rack': 'CH02 spare-parts rack',
}

def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=45).read()

def pack(gltf, files):
    binary = bytearray()
    def append(data):
        binary.extend(b'\0' * (-len(binary) % 4))
        offset = len(binary)
        binary.extend(data)
        return offset
    offsets = [append(files[b['uri']]) for b in gltf['buffers']]
    for view in gltf.get('bufferViews', []):
        view['byteOffset'] = view.get('byteOffset', 0) + offsets[view['buffer']]
        view['buffer'] = 0
    for image in gltf.get('images', []):
        uri = image.pop('uri')
        data = files[uri]
        image['bufferView'] = len(gltf['bufferViews'])
        image['mimeType'] = mimetypes.guess_type(uri)[0]
        gltf['bufferViews'].append({'buffer': 0, 'byteOffset': append(data), 'byteLength': len(data)})
    gltf['buffers'] = [{'byteLength': len(binary)}]
    header = json.dumps(gltf, separators=(',', ':')).encode()
    header += b' ' * (-len(header) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    return (struct.pack('<III', 0x46546C67, 2, 28+len(header)+len(binary)) +
            struct.pack('<II', len(header), 0x4E4F534A) + header +
            struct.pack('<II', len(binary), 0x004E4942) + binary)

def import_model(asset_id):
    metadata = json.loads(fetch('https://api.polyhaven.com/info/'+asset_id))
    package = json.loads(fetch('https://api.polyhaven.com/files/'+asset_id))['gltf']['1k']['gltf']
    gltf = json.loads(fetch(package['url']))
    included = {}
    for name, file in package['include'].items():
        data = fetch(file['url'])
        if file.get('md5') and hashlib.md5(data).hexdigest() != file['md5']:
            raise ValueError('Checksum failed: '+name)
        included[name] = data
    data = pack(gltf, included)
    (OUT/(asset_id+'.glb')).write_bytes(data)
    print('Imported', asset_id, len(data), flush=True)
    return {'id': asset_id, 'file': asset_id+'.glb', 'source': 'https://polyhaven.com/a/'+asset_id,
            'author': ', '.join(metadata['authors']), 'license': 'CC0-1.0',
            'role': MODELS[asset_id], 'resolution': '1K', 'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest()}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(import_model, MODELS))
    (OUT/'manifest.json').write_text(json.dumps({'assets': records}, indent=2)+'\n')
