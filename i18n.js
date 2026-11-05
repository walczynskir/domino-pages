(function(root){
  'use strict';
  const data=typeof module!=='undefined'?require('./locales.js'):root.DominoLocales;
  const {languages,names,catalog}=data;
  const normal=value=>String(value).replace(/\s+/gu,' ').trim();
  const aliases=new Map();
  for(const [key,row]of Object.entries(catalog)){aliases.set(normal(key),key);if(row[0]!==key)aliases.set(normal(row[0]),key);}
  const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const keys=Object.keys(catalog).sort((a,b)=>b.length-a.length);
  const fragments=new RegExp('(?<![\\p{L}\\p{N}_])(?:'+keys.map(escape).join('|')+')(?![\\p{L}\\p{N}_])','gu');
  function text(source,language='en'){
    if(source==null)return '';
    source=String(source);const column=languages.indexOf(language);if(column<0)return source;
    const key=aliases.get(normal(source));if(key)return catalog[key][column];
    if(language==='pl'||language==='en')return source;
    return source.replace(fragments,match=>catalog[match][column]);
  }
  const originalText=new WeakMap(),originalAttributes=new WeakMap();
  function apply(scope,language){
    if(typeof document==='undefined'||!languages.includes(language))return;
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
    const skip=el=>el?.closest('script,style,textarea,#language,#credits-language,[translate="no"]');
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
      if(!node.nodeValue.trim()||skip(node.parentElement))continue;
      const current=node.nodeValue,old=originalText.get(node),source=old&&old.translated===current?old.source:current;
      const translated=(source.match(/^\s*/u)?.[0]||'')+text(normal(source),language)+(source.match(/\s*$/u)?.[0]||'');
      originalText.set(node,{source,translated});if(current!==translated)node.nodeValue=translated;
    }
    const elements=[...(scope.nodeType===1?[scope]:[]),...scope.querySelectorAll('[aria-label],[title],[placeholder]')];
    for(const el of elements){
      if(skip(el))continue;let saved=originalAttributes.get(el);if(!saved){saved={};originalAttributes.set(el,saved);}
      for(const attr of ['aria-label','title','placeholder']){
        if(!el.hasAttribute(attr))continue;const current=el.getAttribute(attr),old=saved[attr],source=old&&old.translated===current?old.source:current,translated=text(source,language);
        saved[attr]={source,translated};if(current!==translated)el.setAttribute(attr,translated);
      }
    }
  }
  function addLanguages(select){
    const selected=select.value;
    select.replaceChildren(...['de','en','es','fr','it','pl','uk','ar','hi','zh-Hans'].map(lang=>{const option=document.createElement('option');option.value=lang;option.lang=lang;option.textContent=names[lang];option.translate=false;return option;}));
    select.value=languages.includes(selected)?selected:'pl';
  }
  const api={languages,names,catalog,text,apply,addLanguages};root.DominoI18n=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
