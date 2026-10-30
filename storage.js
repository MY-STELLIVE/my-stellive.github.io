'use strict';
/* Metadata and Blob assets commit in the same transaction. Existing v1 data is
   migrated only after every image has been converted successfully. */
const Store = (() => {
  let db, revision = 0;
  const urls = new Map(), ids = new Map();
  const request = r => new Promise((ok, fail) => { r.onsuccess = () => ok(r.result); r.onerror = () => fail(r.error); });
  const complete = t => new Promise((ok, fail) => { t.oncomplete = ok; t.onabort = () => fail(t.error || Error('저장이 취소되었습니다.')); t.onerror = () => {}; });
  function slots(state) {
    const out = [];
    state.boards.forEach(b => b.images.forEach((_, i) => out.push([b.images, i])));
    Object.values(state.profiles).forEach(p => { if (p.image) out.push([p, 'image']); });
    return out;
  }
  function toBlob(uri) {
    const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]*={0,2})$/.exec(uri);
    if (!match) throw Error('지원하지 않는 이미지 데이터입니다.');
    const raw = atob(match[2]);
    return new Blob([Uint8Array.from(raw, x => x.charCodeAt(0))], {type: match[1]});
  }
  function remember(id, blob) {
    if (!urls.has(id)) { const url = URL.createObjectURL(blob); urls.set(id, url); ids.set(url, id); }
    return urls.get(id);
  }
  async function hydrate(raw) {
    const state = structuredClone(raw);
    const unique = [...new Set(slots(state).map(([o,k]) => o[k]).filter(x => x.startsWith('asset:')))];
    if (unique.length) {
      const t = db.transaction('assets'), done = complete(t);
      const records = await Promise.all(unique.map(key => request(t.objectStore('assets').get(key))));
      await done;
      records.forEach((blob, i) => { if (!(blob instanceof Blob)) throw Error('저장된 이미지를 찾지 못했습니다. 기존 데이터는 유지됩니다.'); remember(unique[i], blob); });
      slots(state).forEach(([o,k]) => { if (o[k].startsWith('asset:')) o[k] = urls.get(o[k]); });
    }
    delete state.storageRevision;
    return state;
  }
  async function save(state) {
    const raw = Core.migrate(state), pending = new Map(), seen = new Map();
    for (const [o,k] of slots(raw)) {
      const value = o[k];
      if (ids.has(value)) o[k] = ids.get(value);
      else if (value.startsWith('data:')) {
        if (!seen.has(value)) { const id = 'asset:' + Core.uuid(); seen.set(value,id); pending.set(id,toBlob(value)); }
        o[k] = seen.get(value);
      } else throw Error('이미지 참조를 확인하지 못했습니다. 저장을 중단했습니다.');
    }
    raw.version = '1.1.0';
    const used = new Set(slots(raw).map(([o,k]) => o[k]));
    const t = db.transaction(['state','assets'], 'readwrite'), done = complete(t);
    const states=t.objectStore('state'), assets=t.objectStore('assets');
    let conflict=false;
    const check=states.get('main');
    check.onsuccess=()=>{
      if ((check.result?.storageRevision || 0) !== revision) { conflict=true;t.abort();return; }
      raw.storageRevision=revision+1;
      for(const [id,blob] of pending) assets.put(blob,id);
      const keys=assets.openKeyCursor();
      keys.onsuccess=()=>{const c=keys.result;if(c){if(!used.has(c.key))assets.delete(c.key);c.continue();}};
      states.put(raw,'main');
    };
    try { await done; } catch(e) { if(conflict) throw Error('다른 탭에서 기록이 변경되었습니다. 작성 내용을 복사한 뒤 새로고침해 주세요.'); throw e; }
    revision=raw.storageRevision;
    pending.forEach((blob,id)=>remember(id,blob));
    const result=structuredClone(raw);
    slots(result).forEach(([o,k])=>o[k]=urls.get(o[k]));
    delete result.storageRevision;
    // Keep earlier object URLs valid for an open reference image; release on unload.
    return result;
  }
  async function open() {
    db=await new Promise((ok,fail)=>{
      const r=indexedDB.open('STELLINK',2);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('state'))r.result.createObjectStore('state');if(!r.result.objectStoreNames.contains('assets'))r.result.createObjectStore('assets');};
      r.onblocked=()=>window.dispatchEvent(new CustomEvent('stellink-storage-blocked'));
      r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error);
    });
    db.onversionchange=()=>{db.close();window.dispatchEvent(new CustomEvent('stellink-storage-blocked'));};
    const t=db.transaction('state'),done=complete(t),raw=await request(t.objectStore('state').get('main'));await done;
    revision=raw?.storageRevision||0;
    const state=raw||Core.initial();
    if(slots(state).some(([o,k])=>o[k].startsWith('data:')))return save(state);
    const hydrated=await hydrate(state);
    return state.version==='1.1.0'?Core.migrate(hydrated):save(Core.migrate(hydrated));
  }
  async function exportState(state) {
    const copy=structuredClone(state), wanted=[...new Set(slots(copy).map(([o,k])=>ids.get(o[k])).filter(Boolean))];
    const t=db.transaction('assets'),done=complete(t);
    const blobs=await Promise.all(wanted.map(id=>request(t.objectStore('assets').get(id))));await done;
    const encoded=new Map();
    for(let i=0;i<wanted.length;i++){
      if(!(blobs[i] instanceof Blob))throw Error('백업할 이미지를 찾지 못했습니다. 다시 열고 시도해 주세요.');
      const uri=await new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>fail(r.error);r.readAsDataURL(blobs[i]);});encoded.set(wanted[i],uri);
    }
    slots(copy).forEach(([o,k])=>{const id=ids.get(o[k]);if(id)o[k]=encoded.get(id);});
    return Core.validate(copy);
  }
  return {open,save,exportState};
})();
