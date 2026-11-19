/* Portable backup envelope. Each game validates and merges its own durable progress. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./shared-preferences.js') : root.GamesChestPreferences);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GamesChestBackup = api;
})(globalThis, configuration => {
  const format = 'games-chest-backup', version = 1, maxBytes = 5 * 1024 * 1024;
  const fail = code => { throw Object.assign(new Error(code), { code }); };
  const exact = (v, keys) => v && typeof v === 'object' && !Array.isArray(v)
    && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
  function validate(v, schema) {
    if (!exact(v, ['format','version','game','configuration','progress']) || v.format !== format) fail('invalid');
    if (v.version !== version) fail('version');
    if (v.game !== schema.game) fail(typeof v.game === 'string' ? 'game' : 'invalid');
    if (!exact(v.configuration,['preferences','options'])) fail('invalid');
    const preferences = configuration.parse(JSON.stringify({format:configuration.format,version:configuration.version,
      game:v.game,...v.configuration}),schema);
    if (!schema.validProgress(v.progress)) fail('invalid');
    return { preferences, progress: structuredClone(v.progress), legacy:false };
  }
  function parse(text,schema) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > maxBytes) fail('invalid');
    let v;try {v=JSON.parse(text);}catch {fail('invalid');}
    if (v?.format !== undefined) return validate(v,schema);
    if (typeof schema.readLegacy !== 'function') fail('invalid');
    return schema.readLegacy(v);
  }
  function stringify(prefs,progress,schema) {
    const config=JSON.parse(configuration.stringify(prefs,schema));
    const v={format,version,game:schema.game,configuration:{preferences:config.preferences,options:config.options},progress};
    validate(v,schema);
    const text = JSON.stringify(v,null,2)+'\n';
    if (new TextEncoder().encode(text).length > maxBytes) fail('invalid');
    return text;
  }
  return {format,version,maxBytes,parse,stringify};
});
