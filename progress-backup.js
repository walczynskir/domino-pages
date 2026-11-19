/* Domino adapter: identified results plus residual legacy counters; no live game data. */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./results.js'):root.DominoResults);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.DominoProgressBackup=api;
})(globalThis,results=>{
 const counters=['matches','wins','points','opponentPoints','completedMatches'];
 const rewards=['copper','night-sky'], badges=['badgeFirst','badgeFive','badgeTen'];
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const exact=(v,keys)=>object(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
 const count=v=>Number.isSafeInteger(v)&&v>=0;
 const set=(v,ids)=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(id=>ids.includes(id));
 const fail=()=>{throw Object.assign(Error('invalid'),{code:'invalid'});};
 function tally(records){
  const t=Object.fromEntries(counters.map(k=>[k,0]));
  for(const r of Object.values(records)){
   t.matches++;t.completedMatches+=r.reason==='natural'?1:0;
   if(r.winner===0){t.wins++;t.points+=r.points;}else t.opponentPoints+=r.points;
  }
  return t;
 }
 function validRecord(r){return exact(r,['winner','reason','points','scores'])&&[0,1].includes(r.winner)
  &&['natural','replaced'].includes(r.reason)&&[1,2].includes(r.points)
  &&Array.isArray(r.scores)&&r.scores.length===2&&r.scores.every(n=>count(n)&&n<=150)
  &&r.points===(r.scores[1-r.winner]<75?2:1)&&(r.reason!=='replaced'||r.winner===1);}
 function validProgress(p){
  if(!exact(p,['results','legacy','unlockedThemes','achievements'])||!object(p.results)
   ||!Object.entries(p.results).every(([id,r])=>/^[a-zA-Z0-9_-]{1,128}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id)&&validRecord(r))
   ||!exact(p.legacy,counters)||!counters.every(k=>count(p.legacy[k]))

   ||!set(p.unlockedThemes,rewards)||!set(p.achievements,badges))return false;
  const t=tally(p.results),totals=Object.fromEntries(counters.map(k=>[k,p.legacy[k]+t[k]]));
  return counters.every(k=>count(totals[k]))&&totals.wins<=totals.completedMatches&&totals.completedMatches<=totals.matches;
 }
 function earned(p){
  const t=tally(p.results), totals=Object.fromEntries(counters.map(k=>[k,t[k]+p.legacy[k]]));
  return {...totals,results:structuredClone(p.results),
   unlockedThemes:rewards.filter((id,i)=>p.unlockedThemes.includes(id)||totals.completedMatches>=(i?10:3)),
   achievements:badges.filter((id,i)=>p.achievements.includes(id)||(i===0?totals.wins>=1:i===1?totals.wins>=5:totals.completedMatches>=10))};
 }
 function read(stats){
  const records=stats.results||{}, totals=tally(records);
  const p={results:structuredClone(records),legacy:Object.fromEntries(counters.map(k=>[k,Math.max(0,(stats[k]??(k==='completedMatches'?stats.matches:0)??0)-totals[k])])),
   unlockedThemes:stats.unlockedThemes||[],achievements:stats.achievements||[]};
  if(!validProgress(p))fail();
  const e=earned(p);p.unlockedThemes=e.unlockedThemes;p.achievements=e.achievements;return p;
 }
 function merge(local,incoming){
  const remote=incoming.progress;
  if(!validProgress(local)||!validProgress(remote))fail();
  const records={...remote.results,...local.results}, left=structuredClone(local.legacy),right=structuredClone(remote.legacy);
  // A pure pre-ID counter may already include the other device's identified games.
  if(!Object.keys(remote.results).length){const known=tally(local.results);for(const k of counters)right[k]=Math.max(0,right[k]-known[k]);}
  if(!Object.keys(local.results).length){const known=tally(remote.results);for(const k of counters)left[k]=Math.max(0,left[k]-known[k]);}
  const p={results:records,legacy:Object.fromEntries(counters.map(k=>[k,Math.max(left[k],right[k])])),
   unlockedThemes:[...new Set([...local.unlockedThemes,...remote.unlockedThemes])],achievements:[...new Set([...local.achievements,...remote.achievements])]};
  if(!validProgress(p))fail();return earned(p);
 }
 function schema(languages){return {game:'domino',languages,options:{
  progress:v=>typeof v==='boolean',history:v=>typeof v==='boolean',undoEnabled:v=>typeof v==='boolean',
  starter:v=>['alternate','winner'].includes(v),mustDraw:v=>typeof v==='boolean',requireDeclaration:v=>typeof v==='boolean',
  openingDoublesOnly:v=>typeof v==='boolean',declarationPenalty:v=>['none','five','three'].includes(v),
  aiDifficulty:v=>['easy','medium','hard','expert','grandmaster'].includes(v)},validProgress};}
 function exportPreferences(p){return {...p,theme:p.theme==='contrast'?p.previousTheme:p.theme,contrast:p.theme==='contrast'};}
 function importPreferences(p){const {contrast,...rest}=p;return {...rest,previousTheme:p.theme,theme:contrast?'contrast':p.theme};}
 function validState(s){
  if(!object(s)||s.version!==1||!Array.isArray(s.hands)||s.hands.length!==2||!s.hands.every(Array.isArray)
   ||!Array.isArray(s.pool)||!Array.isArray(s.scores)||s.scores.length!==2||!s.scores.every(n=>count(n)&&n<=150)
   ||!Array.isArray(s.events)||!object(s.settings)||![0,1].includes(s.turn)||!count(s.round))return false;
  const tiles=[...s.hands.flat(),...s.pool];
  if(s.board){
   if(!object(s.board)||!Array.isArray(s.board.arms)||s.board.arms.length!==4||!s.board.arms.every(Array.isArray))return false;
   tiles.push(s.board.root,...s.board.arms.flat());
  }
  const tile=t=>object(t)&&count(t.a)&&count(t.b)&&t.a<=6&&t.b<=6&&t.id===`${Math.min(t.a,t.b)}-${Math.max(t.a,t.b)}`;
  return tiles.length===28&&tiles.every(tile)&&new Set(tiles.map(t=>t.id)).size===28;
 }
 function readLegacy(v,current,languages){
  if(object(v)&&v.version!==1)throw Object.assign(Error('version'),{code:'version'});
  if(!object(v)||v.version!==1||!object(v.prefs)||!object(v.stats)||!object(v.state)||v.state.version!==1
   ||!Array.isArray(v.state.hands)||v.state.hands.length!==2||!Array.isArray(v.state.pool)||!Array.isArray(v.state.scores))fail();
  if(!validState(v.state))fail();
  if(v.undoHistory!==undefined&&v.undoHistory!==null&&(!object(v.undoHistory)
   ||!['past','future'].every(k=>Array.isArray(v.undoHistory[k])&&v.undoHistory[k].every(validState))))fail();
  const prefs={...current,...v.prefs};
  for(const [k,value]of Object.entries(v.prefs))if(!Object.hasOwn(current,k)||typeof value!==typeof current[k])fail();
  if(!languages.includes(prefs.language)||! /^[a-z][a-z0-9-]{0,63}$/.test(prefs.theme))fail();
  if(typeof prefs.large!=='boolean'||!Object.entries(schema(languages).options).every(([k,valid])=>valid(prefs[k])))fail();
  const s=structuredClone(v.stats);
  if(!counters.filter(k=>k!=='completedMatches').every(k=>count(s[k])))fail();
  if(s.completedMatches!==undefined&&!count(s.completedMatches))fail();
  // Reuse the live results migration; only the durable statistics are extracted.
  results.prepare(structuredClone(v.state),s);
  const progress=read(s),t=earned(progress);
  if(!counters.every(k=>t[k]===s[k]))fail();
  return {preferences:exportPreferences(prefs),progress,legacy:true};
 }
 function persist(storage,key,envelope,candidate){
  const stats=merge(read(envelope.stats),candidate);
  const next={...envelope,prefs:importPreferences(candidate.preferences),stats};
  storage.setItem(key,JSON.stringify(next));return next;
 }
 return {read,merge,tally,earned,validProgress,schema,exportPreferences,importPreferences,readLegacy,persist,counters};
});
