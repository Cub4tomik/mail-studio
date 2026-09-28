(() => {
  const $ = (s) => document.querySelector(s);
  const list = $('#moduleList'), preview = $('#emailPreview'), drop = $('#dropZone');
  const palettes = {
    unistra: {name:'Bleu des modèles', primary:'#003366', accent:'#8dd3f6', pale:'#f0f5ff', highlight:'#e8f4fd', warm:'#fff8e1', neutral:'#f8f8f8'},
    orange: {name:'Science ouverte — orange', primary:'#f68212', accent:'#ffd29b', pale:'#fff4e5', highlight:'#ffecd1', warm:'#fff8e8', neutral:'#fffaf5'},
    grey: {name:'Gris Unistra', primary:'#4c4d4f', accent:'#c1c7cd', pale:'#f1f3f4', highlight:'#e6ebf0', warm:'#fff8e8', neutral:'#f8f9f9'},
    black: {name:'Noir & gris clair', primary:'#000000', accent:'#e6ebf0', pale:'#f5f6f7', highlight:'#edf0f2', warm:'#fff8e8', neutral:'#fafafa'},
    deepBlue: {name:'Bleu nuit & ciel', primary:'#173c36', accent:'#b6ddd0', pale:'#edf8f4', highlight:'#e2f4ed', warm:'#fff8e8', neutral:'#f6faf8'},
    plum: {name:'Prune en camaïeu', primary:'#603c68', accent:'#d5a7cf', pale:'#f8f1f8', highlight:'#f5eaf5', warm:'#fff7e8', neutral:'#faf7fa'},
    sky: {name:'Bleu ciel en camaïeu', primary:'#00647a', accent:'#73d1d8', pale:'#edf9fa', highlight:'#e2f7f7', warm:'#fff6dc', neutral:'#f5fafa'}
  };
  const defaultModuleIndexes = [0, 2, 3, 10, 25];
  const makeDefaultBlocks = () => defaultModuleIndexes.map((source, position) => ({...MODULES[source], source, kind:source===0?'header':'content', id: Date.now()+position+Math.random()}));
  const state = { blocks: makeDefaultBlocks(), dragIndex: null, palette: palettes.unistra };
  let libraryMode = 'blocks';
  MODULES.push({label:'ESPACEMENT',html:'<tr><td height="24" style="height:24px;line-height:24px;font-size:1px;">&nbsp;</td></tr>',source:MODULES.length,kind:'spacer'});
  const icons = ['▣','T','H','¶','—','↗','ⓘ','▧','!','☷','✎','♙','◉','▥','◷','▤','☷','“','▱','▧','◫','★','❞','◎','Ⅲ','▾','↕'];
  const logoChoices = [
    {label:'Université de Strasbourg — officiel',src:'https://scienceouverte.unistra.fr/_assets/1b47b1ad96d663f269d574647f8b07ff/Images/vignette-unistra.png'},
    {label:'Café science ouverte — officiel',src:'https://scienceouverte.unistra.fr/websites/_processed_/6/7/csm_Logo_cafes_SO_COURT_542485d502.jpg'},
    {label:'Open Access Month — officiel',src:'https://scienceouverte.unistra.fr/websites/science-ouverte/science_ouverte/visuels_24/cobolet_rs-3__1_.jpg'}
  ];
  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function renderLibrary(filter='') {
    const f=filter.toLowerCase();
    if(libraryMode==='templates'){
      const found=EMAIL_TEMPLATES.filter(t=>`${t.title} ${t.description}`.toLowerCase().includes(f));
      $('#moduleCount').textContent=found.length;
      list.innerHTML=found.map(t=>`<button class="template-item" data-template="${esc(t.id)}"><span class="template-icon">✦</span><span><b>${esc(t.title)}</b><small>${esc(t.description)}</small></span><em>Utiliser</em></button>`).join('');
      list.querySelectorAll('[data-template]').forEach(el=>el.addEventListener('click',()=>loadTemplate(el.dataset.template)));
      return;
    }
    const found=MODULES.map((m,i)=>({...m,i})).filter(m=>m.label.toLowerCase().includes(f));
    $('#moduleCount').textContent=found.length;
    list.innerHTML=found.map(m=>`<div class="module-item" draggable="true" data-index="${m.i}"><span class="module-icon">${icons[m.i]||'✦'}</span><span class="module-name">${esc(m.label)}</span></div>`).join('');
    list.querySelectorAll('.module-item').forEach(el=>{el.addEventListener('click',()=>addBlock(+el.dataset.index));el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.index);e.dataTransfer.effectAllowed='copy'});});
  }
  function addBlock(index, at=state.blocks.length){state.blocks.splice(at,0,{...MODULES[index], html:recolorHtml(MODULES[index].html,palettes.unistra,state.palette), source:index, kind:index===0?'header':'content', id:crypto.randomUUID?.()||Date.now()+Math.random()});render();flash('Bloc ajouté');}
  function loadTemplate(id){const template=EMAIL_TEMPLATES.find(item=>item.id===id);if(!template)return;if(!confirm(`Remplacer la composition actuelle par « ${template.title} » ?`))return;state.blocks=template.blocks.map((html,i)=>({label:`${template.title} · bloc ${i+1}`,html:recolorHtml(html,palettes.unistra,state.palette),source:-1,kind:i===0?'header':'content',id:Date.now()+i+Math.random()}));render();flash(`Modèle « ${template.title} » chargé ✓`);}
  function recolorHtml(html,from,to){const colors=['primary','accent','pale','highlight','warm','neutral'];let result=html;colors.forEach(key=>{if(from[key]&&to[key])result=result.replace(new RegExp(from[key].replace('#','\\#'),'gi'),to[key])});return result;}
  function renderPalette(){const container=$('#paletteList');container.innerHTML=Object.entries(palettes).map(([id,p])=>`<button class="palette-choice ${state.palette.name===p.name?'selected':''}" data-palette="${id}" title="${esc(p.name)}"><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i><span>${esc(p.name)}</span></button>`).join('');container.querySelectorAll('[data-palette]').forEach(btn=>btn.addEventListener('click',()=>applyPalette(palettes[btn.dataset.palette])));$('#primaryColor').value=state.palette.primary;$('#accentColor').value=state.palette.accent;}
  function applyPalette(next){state.blocks.forEach(block=>{block.html=recolorHtml(block.html,state.palette,next)});state.palette=next;renderPalette();render();flash(`Palette « ${next.name} » appliquée ✓`);}
  function render(){
    preview.innerHTML=state.blocks.map((b,i)=>`<div class="email-block" draggable="true" data-pos="${i}" data-id="${b.id}"><table class="email-content" role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>${b.html}</tbody></table><div class="block-tools"><button title="Configurer" data-action="config">⚙</button><button title="Dupliquer" data-action="copy">⧉</button><button title="Supprimer" data-action="remove">×</button></div></div>`).join('');
    $('#blockCount').textContent=state.blocks.length; $('#charCount').textContent=state.blocks.reduce((n,b)=>n+b.html.replace(/<[^>]*>/g,'').length,0).toLocaleString('fr-FR');
    preview.querySelectorAll('.email-block').forEach(el=>{
      el.querySelectorAll('p,h1,h2,h3,li,a').forEach(editable=>{if(!editable.querySelector('img')){editable.contentEditable='true';editable.spellcheck=true;editable.addEventListener('input',()=>syncBlock(el));}});
      el.addEventListener('dragstart',e=>{if(e.target.isContentEditable){e.preventDefault();return}state.dragIndex=+el.dataset.pos;el.classList.add('dragging');e.dataTransfer.effectAllowed='move'});
      el.addEventListener('dragend',()=>{state.dragIndex=null;el.classList.remove('dragging')});
      el.addEventListener('dragover',e=>{e.preventDefault();});
      el.addEventListener('drop',e=>{e.preventDefault();const to=+el.dataset.pos;if(state.dragIndex===null||to===state.dragIndex)return;const [x]=state.blocks.splice(state.dragIndex,1);state.blocks.splice(to,0,x);render()});
      el.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const i=+el.dataset.pos;if(btn.dataset.action==='remove')state.blocks.splice(i,1);else if(btn.dataset.action==='config')openConfig(i);else state.blocks.splice(i+1,0,{...state.blocks[i],id:Date.now()+Math.random()});render()}));
      el.addEventListener('click',e=>{if(e.target.closest('[contenteditable=true]'))e.stopPropagation()});
    });
  }
  function syncBlock(el){const i=+el.dataset.pos, clean=el.cloneNode(true);clean.querySelector('.block-tools')?.remove();clean.querySelectorAll('[contenteditable]').forEach(node=>{node.removeAttribute('contenteditable');node.removeAttribute('spellcheck')});const content=clean.querySelector('.email-content tbody');state.blocks[i].html=content?content.innerHTML:clean.innerHTML;}
  function openConfig(index){
    const block=state.blocks[index], doc=new DOMParser().parseFromString(`<table>${block.html}</table>`,'text/html');
    const images=[...doc.querySelectorAll('img')], links=[...doc.querySelectorAll('a')];
    $('#configTitle').textContent=block.label.charAt(0)+block.label.slice(1).toLowerCase();
    let html='';
    const isSpacer=block.kind==='spacer'||block.label==='ESPACEMENT';
    const rootCell=doc.querySelector('tr td');
    const currentAlign=rootCell?.getAttribute('align')||rootCell?.style.textAlign||'left';
    if(rootCell&&!isSpacer) html+=`<div class="config-section layout-section"><h4>Mise en page</h4><div class="field"><label for="block-align">Alignement du bloc</label><select id="block-align" name="block-align"><option value="left" ${currentAlign==='left'?'selected':''}>À gauche</option><option value="center" ${currentAlign==='center'?'selected':''}>Centré</option><option value="right" ${currentAlign==='right'?'selected':''}>À droite</option></select></div></div>`;
    if(isSpacer){const height=rootCell?.getAttribute('height')||((rootCell?.style.height||'').match(/\d+/)||[])[0]||24;html+=`<div class="config-section spacer-section"><h4>Espacement vertical</h4><div class="field"><label for="spacer-height">Hauteur (px)</label><input id="spacer-height" name="spacer-height" type="number" min="4" max="300" value="${esc(String(height))}"><small class="field-help">Choisissez la distance à laisser entre deux blocs.</small></div></div>`;}
    const isHeader=images.length && (block.kind==='header'||block.source===0||/en-tête|header|logo principal/i.test(block.label)||index===0);
    if(isHeader) html+=`<div class="config-section logo-section"><h4>Logo principal</h4><p class="config-help">Choisissez un logo prédéfini ou importez votre propre fichier.</p><input type="hidden" name="logo-src" value="${esc(images[0].getAttribute('src')||'')}"><div class="logo-choice-grid">${logoChoices.map((logo,i)=>`<button type="button" class="logo-choice" data-logo-index="${i}"><img src="${esc(logo.src)}" alt=""><span>${esc(logo.label)}</span></button>`).join('')}</div><label class="upload-logo"><span>＋ Importer un logo depuis votre ordinateur</span><input id="logoUpload" type="file" accept="image/*"></label></div>`;
    if(images.length) html+=`<div class="config-section"><h4>Images (${images.length})</h4>${images.map((img,i)=>{const width=img.getAttribute('width')||((img.style.width||'').match(/\d+/)||[])[0]||'';return `<div class="field"><label>Image ${i+1} — URL</label><input name="img-src-${i}" type="url" value="${esc(img.getAttribute('src')||'')}"><label>Texte alternatif</label><input name="img-alt-${i}" value="${esc(img.getAttribute('alt')||'')}"><label>Largeur affichée (px, facultatif)</label><input name="img-width-${i}" type="number" min="20" max="1200" value="${esc(width)}" placeholder="Automatique"></div>`}).join('')}</div>`;
    if(links.length) html+=`<div class="config-section"><h4>Liens et boutons (${links.length})</h4>${links.map((a,i)=>`<div class="field"><label>Lien ${i+1} — destination</label><input name="link-href-${i}" type="url" value="${esc(a.getAttribute('href')||'')}"><label>Texte visible (si applicable)</label><input name="link-text-${i}" value="${esc(a.textContent.trim())}"></div>`).join('')}</div>`;
    if(!html) html='<p class="config-intro">Ce bloc ne contient pas d’image ou de lien configurable. Double-cliquez dessus pour modifier son texte.</p>';
    $('#configFields').innerHTML=html; $('#configModal').classList.add('open'); $('#configForm').dataset.index=index;
    if(isHeader){const hidden=$('#configFields [name="logo-src"]');$('#configFields').querySelectorAll('[data-logo-index]').forEach(button=>button.addEventListener('click',()=>{hidden.value=logoChoices[+button.dataset.logoIndex].src;$('#configFields').querySelectorAll('.logo-choice').forEach(x=>x.classList.remove('selected'));button.classList.add('selected')}));$('#logoUpload').addEventListener('change',event=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{hidden.value=reader.result;flash('Logo importé — cliquez sur Enregistrer')};reader.readAsDataURL(file)});}
  }
  function saveConfig(e){
    e.preventDefault(); const index=+e.currentTarget.dataset.index, block=state.blocks[index], isSpacer=block.kind==='spacer'||block.label==='ESPACEMENT', doc=new DOMParser().parseFromString(`<table>${block.html}</table>`,'text/html'), form=new FormData(e.currentTarget);
    const align=form.get('block-align');
    const wrapper=doc.querySelector('table');
    const cell=wrapper?.querySelector('tr td');
    if(cell&&align){cell.setAttribute('align',align);cell.style.textAlign=align;}
    if(wrapper&&align){const actionTables=new Set([...wrapper.querySelectorAll('a')].filter(a=>a.getAttribute('style')?.includes('display: inline-block')).map(a=>a.closest('table')).filter(Boolean));actionTables.forEach(table=>{table.style.margin=align==='center'?'0 auto':align==='right'?'0 0 0 auto':'0'});}
    if(wrapper&&isSpacer&&cell){const height=Math.max(4,Math.min(300,Number.parseInt(form.get('spacer-height'),10)||24));cell.setAttribute('height',String(height));cell.style.height=`${height}px`;cell.style.lineHeight=`${height}px`;cell.innerHTML='&nbsp;';}
    [...doc.querySelectorAll('img')].forEach((img,i)=>{img.setAttribute('src',(i===0&&form.get('logo-src'))||form.get(`img-src-${i}`)||'');img.setAttribute('alt',form.get(`img-alt-${i}`)||'');const width=String(form.get(`img-width-${i}`)||'').trim();if(width){img.setAttribute('width',width);img.style.width=`${width}px`;img.style.maxWidth='100%';}});
    [...doc.querySelectorAll('a')].forEach((a,i)=>{a.setAttribute('href',form.get(`link-href-${i}`)||'');const text=form.get(`link-text-${i}`);if(text && a.children.length===0)a.textContent=text});
    const body=wrapper?.tBodies?.[0]; block.html=body?body.innerHTML:[...wrapper.children].map(x=>x.outerHTML).join(''); $('#configModal').classList.remove('open'); render(); flash('Bloc mis à jour ✓');
  }
  function fullHtml(){return `<!DOCTYPE html>\n<html lang="fr">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Votre email</title></head>\n<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">\n<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">\n${state.blocks.map(b=>b.html).join('\n')}\n</table></td></tr></table>\n</body></html>`}
  function flash(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
  $('#searchInput').addEventListener('input',e=>renderLibrary(e.target.value));
  $('#blocksTab').addEventListener('click',()=>{libraryMode='blocks';$('#blocksTab').classList.add('active');$('#templatesTab').classList.remove('active');$('#searchInput').placeholder='Rechercher un module…';renderLibrary($('#searchInput').value)});
  $('#templatesTab').addEventListener('click',()=>{libraryMode='templates';$('#templatesTab').classList.add('active');$('#blocksTab').classList.remove('active');$('#searchInput').placeholder='Rechercher un modèle…';renderLibrary($('#searchInput').value)});
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-over')});drop.addEventListener('dragleave',()=>drop.classList.remove('drag-over'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag-over');const i=+e.dataTransfer.getData('text/plain');if(!Number.isNaN(i))addBlock(i)});
  $('#copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(fullHtml());flash('HTML copié dans le presse-papiers ✓')}catch{const a=document.createElement('textarea');a.value=fullHtml();document.body.append(a);a.select();document.execCommand('copy');a.remove();flash('HTML copié ✓')}});
  $('#downloadBtn').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([fullHtml()],{type:'text/html'}));a.download='mon-email.html';a.click();URL.revokeObjectURL(a.href)});
  $('#saveProjectBtn').addEventListener('click',()=>{const project={format:'mail-studio-project',version:1,savedAt:new Date().toISOString(),palette:state.palette,blocks:state.blocks.map(({label,html,source,kind})=>({label,html,source,kind}))};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));a.download='mon-email.mailstudio.json';a.click();URL.revokeObjectURL(a.href);flash('Projet enregistré ✓')});
  $('#loadProjectBtn').addEventListener('click',()=>$('#projectFile').click());
  $('#projectFile').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const project=JSON.parse(reader.result);if(!project || !Array.isArray(project.blocks) || project.blocks.some(b=>typeof b.html!=='string'))throw new Error('format');state.blocks=project.blocks.map((b,i)=>({label:b.label||`Bloc ${i+1}`,html:b.html,source:Number.isInteger(b.source)?b.source:-1,kind:b.kind||'content',id:Date.now()+i+Math.random()}));if(project.palette?.primary&&project.palette?.accent)state.palette=project.palette;renderPalette();render();flash('Projet importé ✓')}catch{flash('Fichier Mail Studio invalide')}};reader.readAsText(file);e.target.value=''});
  $('#resetBtn').addEventListener('click',()=>{if(confirm('Réinitialiser avec la composition de base ?')){state.blocks=makeDefaultBlocks().map(block=>({...block,html:recolorHtml(block.html,palettes.unistra,state.palette)}));render();flash('Composition réinitialisée ✓')}});
  $('#previewBtn').addEventListener('click',()=>{$('#previewFrame').srcdoc=fullHtml();$('#modal').classList.add('open')});$('#closeModal').addEventListener('click',()=>$('#modal').classList.remove('open'));$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')e.target.classList.remove('open')});
  $('#configForm').addEventListener('submit',saveConfig); $('#closeConfig').addEventListener('click',()=>$('#configModal').classList.remove('open')); $('#cancelConfig').addEventListener('click',()=>$('#configModal').classList.remove('open')); $('#configModal').addEventListener('click',e=>{if(e.target.id==='configModal')e.target.classList.remove('open')});
  const formatToolbar=$('#formatToolbar');
  preview.addEventListener('mouseup',()=>{const selection=window.getSelection();if(selection && selection.toString().trim() && preview.contains(selection.anchorNode)){const range=selection.getRangeAt(0).getBoundingClientRect();formatToolbar.style.left=`${Math.min(window.innerWidth-190,Math.max(8,range.left+range.width/2-90))}px`;formatToolbar.style.top=`${Math.max(8,range.top-48)}px`;formatToolbar.classList.add('visible')}});
  document.addEventListener('mousedown',e=>{if(!e.target.closest('#formatToolbar'))formatToolbar.classList.remove('visible')});
  formatToolbar.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('mousedown',e=>{e.preventDefault();document.execCommand(button.dataset.command,false);const selection=window.getSelection();const block=selection.anchorNode?.parentElement?.closest('.email-block');if(block)syncBlock(block)}));
  $('#linkCommand').addEventListener('mousedown',e=>{e.preventDefault();const url=prompt('Adresse du lien :','https://');if(url){document.execCommand('createLink',false,url);const selection=window.getSelection();const block=selection.anchorNode?.parentElement?.closest('.email-block');if(block)syncBlock(block)}formatToolbar.classList.remove('visible')});
  $('#applyCustomPalette').addEventListener('click',()=>{const primary=$('#primaryColor').value,accent=$('#accentColor').value;applyPalette({...state.palette,name:'Palette personnalisée',primary,accent})});
  renderPalette(); renderLibrary(); render();
})();
