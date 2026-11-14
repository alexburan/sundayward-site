// The website's colour follows the church year, like the app (a Western-calendar port of
// apps/mobile/src/lib/season-core.ts in alexburan/sundayward-app). Runs only in the visitor's browser; sends nothing.
(function () {
  var COLOURS = {
    advent: ['#4B2C8F', '#ECE7F6'], christmas: ['#B8892B', '#F6EEDC'], ordinary: ['#2E7A4C', '#E3F1E8'],
    lent: ['#6A2C5E', '#F2E6EF'], easter: ['#C49A1E', '#F8F0D9'], pentecost: ['#C2352A', '#F9E5E3'],
  };
  var NAMES = { advent: 'Advent', christmas: 'Christmas', ordinary: 'Ordinary Time', lent: 'Lent', easter: 'Easter', pentecost: 'Pentecost' };
  var TARGETS = { christmas: 'Christmas', lent: 'Lent', easter: 'Easter', pentecost: 'Pentecost', advent: 'Advent' };
  var WEEKS = { advent: 4, lent: 6, easter: 7, christmas: 2 };

  var D = function (s) { return new Date(s + 'T12:00:00Z'); };
  var F = function (t) { return t.toISOString().slice(0, 10); };
  var add = function (s, n) { return F(new Date(D(s).getTime() + n * 864e5)); };
  var between = function (a, b) { return Math.round((D(b) - D(a)) / 864e5); };
  var ymd = function (y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); };

  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return ymd(y, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
  }
  function keys(y) {
    var e = easter(y), xmas = ymd(y, 12, 25), wd = D(xmas).getUTCDay();
    return { lent: add(e, -46), easter: e, pentecost: add(e, 49), advent: add(xmas, -(wd === 0 ? 7 : wd) - 21), christmas: xmas };
  }
  function season(day) {
    var y = +day.slice(0, 4), k = keys(y);
    if (day <= ymd(y, 1, 5)) return ['christmas', ymd(y - 1, 12, 25)];
    if (day >= k.christmas) return ['christmas', k.christmas];
    if (day >= k.advent) return ['advent', k.advent];
    if (day >= k.lent && day < k.easter) return ['lent', add(k.lent, 4)];
    if (day >= k.easter && day < k.pentecost) return ['easter', k.easter];
    if (day === k.pentecost) return ['pentecost', k.pentecost];
    return ['ordinary', null];
  }
  function countdown(day, id) {
    var y = +day.slice(0, 4), k = keys(y), n = keys(y + 1);
    if (id === 'advent') return ['christmas', k.christmas];
    if (id === 'lent') return ['easter', k.easter];
    if (id === 'easter') return ['pentecost', k.pentecost];
    var c = [['lent', k.lent], ['easter', k.easter], ['pentecost', k.pentecost], ['advent', k.advent], ['christmas', k.christmas], ['lent', n.lent], ['easter', n.easter]]
      .filter(function (x) { return x[1] >= day; }).sort(function (a, b) { return a[1] < b[1] ? -1 : 1; });
    return c[0];
  }

  var now = new Date();
  var today = ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var s = season(today), id = s[0], col = COLOURS[id];
  // Christmas and Easter gold do not reach 4.5:1 with white, so their words are dark (as in the app).
  var dark = id === 'christmas' || id === 'easter';
  var ink = { christmas: '#906B22', easter: '#907116' }[id] || col[0];
  var root = document.documentElement.style;
  root.setProperty('--season', col[0]);
  root.setProperty('--season-ink', ink);
  root.setProperty('--on-season', dark ? '#17141F' : '#FFFFFF');
  if (!matchMedia('(prefers-color-scheme: dark)').matches) root.setProperty('--season-tint', col[1]);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', col[0]);

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('[data-countdown]');
    if (!el) return;
    var c = countdown(today, id), days = between(today, c[1]);
    el.querySelector('b').textContent = days;
    el.querySelector('span').innerHTML = days === 0 ? TARGETS[c[0]] + '<br>is today' : (days === 1 ? 'day' : 'days') + ' to<br>' + TARGETS[c[0]];
    var name = document.querySelector('[data-season-name]');
    if (name) name.textContent = NAMES[id];
    var bar = document.querySelector('[data-weeks]');
    if (bar && WEEKS[id] && s[1]) {
      var wk = Math.max(0, Math.floor(between(s[1], today) / 7) + 1);
      for (var i = 1; i <= WEEKS[id]; i++) { var seg = document.createElement('i'); if (i <= wk) seg.className = 'on'; bar.appendChild(seg); }
      if (name) name.textContent = NAMES[id] + (wk > 0 ? ' · week ' + Math.min(wk, WEEKS[id]) + ' of ' + WEEKS[id] : '');
    }
  });
})();
