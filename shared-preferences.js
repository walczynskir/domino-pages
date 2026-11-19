/* Games Chest preferences-only format. Game adapters own persistence and rules. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GamesChestPreferences = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const format = 'games-chest-settings';
  const version = 1;
  const maxBytes = 16 * 1024;
  const fail = code => { throw Object.assign(new Error(code), { code }); };
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function keys(value, expected) {
    if (!object(value) || Object.keys(value).length !== expected.length
      || expected.some(key => !Object.hasOwn(value, key))) fail('invalid');
  }
  function validate(value, schema) {
    keys(value, ['format', 'version', 'game', 'preferences', 'options']);
    if (value.format !== format) fail('invalid');
    if (value.version !== version) fail('version');
    if (typeof value.game !== 'string') fail('invalid');
    if (value.game !== schema.game) fail('game');
    keys(value.preferences, ['language', 'theme', 'large', 'contrast']);
    const p = value.preferences;
    if (!schema.languages.includes(p.language) || typeof p.theme !== 'string'
      || !/^[a-z][a-z0-9-]{0,63}$/.test(p.theme)
      || typeof p.large !== 'boolean' || typeof p.contrast !== 'boolean') fail('invalid');
    keys(value.options, Object.keys(schema.options));
    for (const [key, accepts] of Object.entries(schema.options)) {
      if (!accepts(value.options[key])) fail('invalid');
    }
    return { ...p, ...value.options };
  }
  function parse(text, schema) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > maxBytes) fail('invalid');
    let value;
    try { value = JSON.parse(text); } catch { fail('invalid'); }
    return validate(value, schema);
  }
  function stringify(prefs, schema) {
    const value = { format, version, game: schema.game,
      preferences: Object.fromEntries(['language', 'theme', 'large', 'contrast'].map(k => [k, prefs[k]])),
      options: Object.fromEntries(Object.keys(schema.options).map(k => [k, prefs[k]])) };
    validate(value, schema);
    return JSON.stringify(value, null, 2) + '\n';
  }
  function resolveTheme(imported, currentTheme, available, unlocked) {
    const reason = !available(imported.theme) ? 'unavailable' : !unlocked(imported.theme) ? 'locked' : undefined;
    return { preferences: { ...imported, theme: reason ? currentTheme : imported.theme }, skipped: reason };
  }
  return { format, version, maxBytes, parse, stringify, resolveTheme };
});
