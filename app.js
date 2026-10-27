/* =====================================================================
   厝客松 第七屆｜網站程式
   內容都從 content.js 讀進來，一般更新不需要改這個檔案。
   ===================================================================== */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) return;

  /* ---------- 小工具 ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S);
  }
  // 「¦」標記建議換行點：兩邊各自不拆開，空間不夠時從這裡換行；\n 是強制換行
  function phrase(t) {
    return String(t).split('\n').map(function (line) {
      return line.indexOf('¦') < 0 ? esc(line) : line.split('¦').map(function (c) { return '<span class="nw">' + esc(c) + '</span>'; }).join('<wbr>');
    }).join('<br>');
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isTBD(v) { return v == null || String(v).trim() === '' || String(v).trim() === '待填'; }
  var TBD = '<span class="tbd">待填</span>';
  function t(v) { return isTBD(v) ? TBD : esc(v); }
  function icon(id, cls) { return '<svg class="' + (cls || 'ico') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function toDate(s) { return new Date(s.length <= 10 ? s + 'T00:00:00+08:00' : s); }
  function endOfDay(s) { return new Date(s + 'T23:59:59+08:00'); }

  function secHead(id, title, lead, en, ico) {
    return '<header class="sec-head"><span class="sel"><h2 id="' + id + '">' + esc(title) + '</h2>' +
      '<i class="h h1"></i><i class="h h2"></i><i class="h h3"></i><i class="h h4"></i></span>' +
      '<span class="sec-head__en" aria-hidden="true">' + (ico ? icon(ico, '') : '') + '<span>' + esc(en || '') + '</span></span></header>' +
      (lead ? '<p class="lead sec-lead">' + esc(lead) + '</p>' : '');
  }
  // 星期幾（以台灣時間計算）
  function wk(s) {
    var p = String(s).slice(0, 10).split('-');
    return '日一二三四五六'.charAt(new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay());
  }
  // 分頁切換（歷屆回顧、Q&A 共用）
  function tabs(list) {
    var btns = $$('[role="tab"]', list);
    function sel(b, focus) {
      btns.forEach(function (x) {
        var on = x === b, panel = document.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        if (panel) panel.hidden = !on;
      });
      if (focus) b.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); sel(btns[(i + d + btns.length) % btns.length], true); }
      });
    });
    list.selectTab = function (id) { var b = btns.filter(function (x) { return x.getAttribute('aria-controls') === id; })[0]; if (b) sel(b); };
  }

  /* ---------- 簡單欄位 ---------- */
  $$('[data-t]').forEach(function (el) { el.innerHTML = t(get(el.getAttribute('data-t'))); });
  $$('[data-list]').forEach(function (el) {
    el.innerHTML = (get(el.getAttribute('data-list')) || []).map(function (x) {
      return '<li>' + icon('i-play', '') + esc(x) + '</li>';
    }).join('');
  });
  function wireLinks(root) {
    $$('[data-link]', root).forEach(function (a) {
      var v = S.links[a.getAttribute('data-link')];
      if (isTBD(v)) { a.setAttribute('aria-disabled', 'true'); a.removeAttribute('href'); a.title = '連結待填'; }
      else a.href = v;
    });
  }

  /* =================== 關於競賽 =================== */
  (function () {
    var A = S.about;
    $('#about-body').innerHTML =
      secHead('about-h', '關於競賽', '', 'ABOUT', 'p-spark') +
      '<p class="about__statement">' + esc(A.title) + '</p>' +
      '<div class="about__body about__body--top">' + A.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<dl class="facts">' + A.facts.map(function (f) {
        return '<div class="fact' + (f.oneLine ? ' fact--one' : '') + '"><dt><span class="fact__ico">' + icon('p-' + f.icon, '') + '</span><span>' + esc(f.label) + '</span></dt><dd>' + phrase(f.text) + (f.sub ? '<span class="fact__sub">' + phrase(f.sub) + '</span>' : '') + '</dd></div>';
      }).join('') + '</dl>' +
      '<div class="who">' +
        '<div class="who__text"><h3>' + esc(A.whoTitle) + '</h3><p>' + esc(A.who).replace(/\n/g, '<br class="br-d">') + '</p></div>' +
        '<dl class="who__lists">' +
          '<div><dt>四大部門</dt><dd>' + A.departments.map(function (d) { return '<span class="chip chip--fill">' + esc(d) + '</span>'; }).join('') + '</dd></div>' +
          '<div><dt>資產類型</dt><dd>' + A.assetTypes.map(function (d) { return '<span class="chip">' + esc(d) + '</span>'; }).join('') + '</dd></div>' +
        '</dl>' +
        '<img class="who__splat" src="assets/img/splat.webp" alt="" width="800" height="626" loading="lazy">' +
      '</div>' +
      '<div class="seek seek--plain"><h3>' + icon('p-arrow', '') + '我們想找到</h3><ol>' +
        A.lookingFor.map(function (x) {
          return '<li><span class="tile">' + icon('p-' + x.icon, '') + '</span><span>' + esc(x.text) + '</span></li>';
        }).join('') +
      '</ol></div>';
  })();

  /* =================== 競賽報名 =================== */
  (function () {
    var G = S.signup;
    $('#signup-body').innerHTML =
      secHead('signup-h', G.title, '', 'HOW TO JOIN', 'p-doc') +
      '<h3 class="ids__h">參賽身份</h3>' +
      '<div class="ids">' +
        G.identities.map(function (x) {
          return '<div class="id-card id-card--plain"><span class="id-card__ico">' + icon('p-' + x.icon, '') + '</span>' +
            '<div><h3>' + esc(x.name) + '</h3><p>' + phrase(x.rule) + '</p></div></div>';
        }).join('') +
      '</div>' +
      (G.intro ? '<p class="ids__note">' + icon('p-team', '') + '<span>' + esc(G.intro) + '</span></p>' : '') +
      '<div class="steps"><h3>報名流程</h3><div class="flow"><span class="flow__track" aria-hidden="true"><i class="flow__pulse"></i></span><ol class="flow__list">' + G.steps.map(function (s, i) {
          return '<li class="flow__step"><span class="flow__node" aria-hidden="true">' + icon('p-' + s.icon, '') + '</span>' +
            '<div class="flow__card"><p class="flow__no">' + (i < 9 ? '0' : '') + (i + 1) + '</p>' +
            '<h4 class="flow__title">' + esc(s.title) + '</h4><p class="flow__desc">' + esc(s.desc) + '</p>' +
            (s.date ? '<p class="flow__date">' + esc(s.date) + '</p>' : '') + '</div></li>';
        }).join('') + '</ol></div></div>' +
      '<div class="rules-list">' + G.rules.map(function (r) {
        return '<section class="rule"><h3>' + icon('p-' + r.icon, '') + '<span>' + esc(r.title) + '</span></h3><ul>' +
          r.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></section>';
      }).join('') + '</div>' +
      (G.rulesNote ? '<p class="rules-note">' + icon('p-clock', '') + '<span>' + esc(G.rulesNote) + '</span></p>' : '') +
      '<div class="deliv"><h3>' + icon('p-upload', '') + '<span>繳件規定</span></h3><ol class="deliv__list">' + G.deliverables.map(function (d, i) {
        var tbd = d.items.length === 1 && (isTBD(d.items[0]) || d.items[0] === '待公告');
        return '<li class="deliv__item' + (tbd ? ' is-tbd' : '') + '"><div class="deliv__top"><span class="deliv__no">0' + (i + 1) + '</span>' +
          '<h4>' + esc(d.stage) + '<small>｜' + esc(d.who) + '</small></h4></div>' +
          '<p class="deliv__date">' + esc(d.date) + '</p>' +
          (tbd ? '<p class="deliv__tbd">' + icon('p-clock', '') + '<span>繳件規定將於公告題目時一併公布</span></p>'
               : '<ul>' + d.items.map(function (x) {
                   var k = x.indexOf('：');
                   return '<li>' + (k > 0 && k <= 16 ? '<b class="deliv__label">' + esc(x.slice(0, k)).replace(/）$/, '<span class="halt">）</span>') + '</b>：' + esc(x.slice(k + 1)) : esc(x)) + '</li>';
                 }).join('') + '</ul>') + '</li>';
      }).join('') + '</ol></div>' +
      '<div class="cta-row">' +
        '<a class="btn btn--ink btn--lg" data-link="register" target="_blank" rel="noopener"><span>前往報名表單</span>' + icon('i-play', 'btn__arrow') + '</a>' +
        '<a class="btn btn--paper btn--lg" data-link="brochure" target="_blank" rel="noopener"><span>下載簡章</span>' + icon('i-play', 'btn__arrow') + '</a>' +
        '<a class="btn btn--line btn--lg" data-link="line" target="_blank" rel="noopener"><span>加入厝邊 LINE</span></a>' +
      '</div>';
  })();

  /* =================== 競賽主題 =================== */
  (function () {
    var T = S.theme, s = T.site;
    var plan =
      '<svg class="plan" viewBox="0 0 740 500" role="img" aria-label="基地第 1 層平面示意：左側寬 22 公尺、高 42 公尺，右側高 27 公尺，底邊 66 公尺，約 639 坪；南側臨' + esc(s.streets.south) + '，東側臨' + esc(s.streets.east) + '">' +
        '<rect class="street" x="0" y="430" width="740" height="56" rx="10"/><text class="street-name" x="344" y="465" text-anchor="middle">' + esc(s.streets.south) + '</text>' +
        '<rect class="street" x="682" y="22" width="56" height="464" rx="10"/><text class="street-name" x="710" y="254" text-anchor="middle" style="writing-mode:vertical-rl">' + esc(s.streets.east) + '</text>' +
        '<path class="shape" d="M80 40 H256 V160 H608 V376 H80 Z"/>' +
        '<line class="dimline" x1="80" y1="22" x2="256" y2="22"/><text class="dim" x="168" y="16" text-anchor="middle">22 m</text>' +
        '<line class="dimline" x1="60" y1="40" x2="60" y2="376"/><text class="dim" x="50" y="212" text-anchor="end">42 m</text>' +
        '<line class="dimline" x1="626" y1="160" x2="626" y2="376"/><text class="dim" x="636" y="272" text-anchor="start">27 m</text>' +
        '<line class="dimline" x1="80" y1="398" x2="608" y2="398"/><text class="dim" x="344" y="416" text-anchor="middle">66 m</text>' +
        '<text class="area" x="344" y="280" text-anchor="middle">' + esc(s.area) + '</text>' +
      '</svg>';
    $('#theme-body').innerHTML =
      secHead('theme-h', '競賽主題', '', 'CHALLENGE', 'p-building') +
      '<div class="theme-hero theme-hero--v2">' +
        '<div class="theme-hero__name">' +
          '<p class="theme-en"><span>' + esc(T.titleEn) + '</span></p>' +
          '<p class="theme-title">' + esc(T.title) + '</p>' +
          '<p class="theme-slogan">' + esc(T.slogan) + '</p>' +
        '</div>' +
        '<div class="theme-hero__poem">' + T.poem.filter(function (l) { return l; }).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
          '<p class="theme-hero__invite">' + esc(T.invite) + '</p></div>' +
        '<img class="theme-cursor" src="assets/img/cursor.webp" alt="" width="800" height="795" loading="lazy">' +
      '</div>' +
      '<p class="stage-hint">' + icon('i-play', 'stage-hint__ico') + '<span>點選卡片，切換查看各階段題目</span></p>' +
      '<div class="stage-tabs" role="tablist" aria-label="競賽題目階段">' + T.stages.map(function (g, i) {
        return '<button type="button" role="tab" id="tab-stage-' + g.key + '" aria-controls="stage-' + g.key + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
          '<span class="stage-tabs__no">0' + (i + 1) + '</span><b>' + esc(g.name) + '</b><small class="nw">' + esc(g.who) + '</small><em>' + esc(g.date) + '</em>' +
          '<span class="stage-tabs__go" aria-hidden="true">' + icon('i-play', '') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="stage" id="stage-first" role="tabpanel" aria-labelledby="tab-stage-first">' +
        '<div class="brief"><h3>初審題目｜' + esc(T.missionSub) + '</h3><p>' + esc(T.brief) + '</p><p class="brief__q">' + esc(T.question) + '</p></div>' +
        '<div class="mission"><div class="mission__head"><h3>' + esc(T.missionTitle) + '</h3></div>' +
          '<div class="mission__row">' +
            T.missions.map(function (m, i) {
              return (i ? '<span class="mis__plus" aria-hidden="true">' + icon('i-pixel-x', '') + '</span>' : '') +
                '<div class="mis"><img src="' + esc(m.img) + '" alt="" width="800" height="800" loading="lazy"><div><h4>' + esc(m.name) + '</h4><p>' + esc(m.desc) + '</p></div></div>';
            }).join('') +
          '</div></div>' +
        '<div class="site">' +
          '<div class="site__plan"><h3>' + esc(s.name) + '</h3><p class="addr">' + esc(s.address) + '</p>' + plan +
            '</div>' +
          '<div class="site__info">' +
            '<div class="rules rules--plain"><h4>規劃限制</h4>' + (s.note ? '<p class="rules__note">' + esc(s.note) + '</p>' : '') + '<ul>' + s.rules.map(function (r) { return '<li>' + icon('i-pixel-x', 'rx') + '<span>' + esc(r) + '</span></li>'; }).join('') + '</ul></div>' +
            '<div class="crit crit--plain"><h4>初審評分基準</h4><ol>' + s.firstRound.map(function (r, i) { var m = r.match(/^(.*?)（(.*)）$/); return '<li><span class="cn">0' + (i + 1) + '</span><span class="ct">' + esc(m ? m[1] : r) + (m ? '<em>' + esc(m[2]) + '</em>' : '') + '</span></li>'; }).join('') + '</ol></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      T.stages.slice(1).map(function (g, k) {
        return '<div class="stage" id="stage-' + g.key + '" role="tabpanel" aria-labelledby="tab-stage-' + g.key + '" hidden>' +
          '<div class="stage-soon"><p class="stage-soon__k">' + esc(g.name) + '題目</p><p class="stage-soon__v">' + (isTBD(g.brief) || g.brief === '待公告' ? '將於 ' + esc(g.date.replace(' 公告', '')) + ' 公告' : esc(g.brief)) + '</p>' +
          '<p class="stage-soon__d">' + (k === 0 ? '初審結果與媒合隊伍名單公布時一併公告。繳件規定請見「競賽報名」。' : '決賽名單公布時，一併公告決賽題目與流程。') + '</p></div>' +
          '<div class="score"><div class="score__top"><h3>' + esc(T.scoring[k].stage) + '評分標準</h3></div><div class="score-body" data-k="' + k + '"></div></div>' +
        '</div>';
      }).join('');

    $$('.score-body').forEach(function (box) {
      var i = +box.getAttribute('data-k'), g = T.scoring[i], first = T.scoring[0];
      box.innerHTML =
        '<div class="bar" role="list" aria-label="評分比例">' + g.items.map(function (x, k) { return '<button type="button" class="bar__seg" role="listitem" data-k="' + k + '" style="flex:' + x.pct + '" aria-label="' + esc(x.name) + ' ' + x.pct + '%"><span>' + x.pct + '%</span></button>'; }).join('') + '</div>' +
        '<div class="crit-list">' + g.items.map(function (x, k) {
          var changed = i > 0 && first.items[k] && first.items[k].name !== x.name;
          return '<div class="crit-item' + (changed ? ' is-new' : '') + '"><span class="crit-item__pct">' + x.pct + '%</span>' +
            '<div><h4>' + esc(x.name) + '</h4><p>' + esc(x.desc) + '</p></div></div>';
        }).join('') + '</div>';
    });
    tabs($('.stage-tabs'));
    // 比例軸線連動：碰到某一段，下方對應的評分項目亮起、其他變淡
    $$('.score').forEach(function (box) {
      var segs = $$('.bar__seg', box), items = $$('.crit-item', box);
      function on(k) {
        box.classList.toggle('is-focus', k != null);
        segs.forEach(function (s, i) { s.classList.toggle('is-on', i === k); });
        items.forEach(function (it, i) { it.classList.toggle('is-on', i === k); });
      }
      segs.forEach(function (s, i) {
        s.addEventListener('mouseenter', function () { on(i); });
        s.addEventListener('focus', function () { on(i); });
        s.addEventListener('click', function () { on(box.classList.contains('is-focus') && s.classList.contains('is-on') ? null : i); });
      });
      items.forEach(function (it, i) { it.addEventListener('mouseenter', function () { on(i); }); });
      box.addEventListener('mouseleave', function () { on(null); });
      $('.bar', box).addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) on(null); });
    });
  })();

  /* =================== 競賽時程 =================== */
  (function () {
    var now = new Date(), nextFound = false;
    var items = S.timeline.map(function (x) {
      var st = toDate(x.start), en = endOfDay(x.end || x.start), state = '';
      if (now > en) state = 'done';
      else if (now >= st) state = 'now';
      else if (!nextFound) { state = 'next'; nextFound = true; }
      return { x: x, state: state };
    });
    $('#time-body').innerHTML =
      secHead('time-h', '競賽時程', '', 'SCHEDULE', 'p-calendar') +
      '<ol class="tl">' + items.map(function (o) {
        var x = o.x;
        var badge = o.state === 'now' ? '<span class="tl__badge">進行中</span>' : o.state === 'next' ? '<span class="tl__badge">下一站</span>' : '';
        var md = function (d) { var p = String(d).slice(0, 10).split('-'); return p[1] + '.' + p[2]; };
        var piece = function (d) { return '<span class="nw"><b class="tl__md">' + md(d) + '</b><span class="tl__wk">（' + wk(d) + '）</span></span>'; };
        var when = piece(x.start) + (x.end && /－/.test(x.date) ? '<span class="tl__dash">－</span>' + piece(x.end) : '');
        return '<li class="tl__item' + (x.stage === '初審' ? ' tl--first' : ' tl--later') + (x.small ? ' is-small' : '') + (o.state ? ' is-' + o.state : '') + '">' +
          '<span class="tl__dot" aria-hidden="true"><i></i></span>' +
          '<div class="tl__when"><p class="tl__date">' + when + '</p></div>' +
          '<div class="tl__what"><span class="tl__stage' + (x.stage === '初審' ? ' tl__stage--first' : '') + '">' + esc(x.stage) + '</span>' +
          '<h3 class="tl__title">' + esc(x.title) + '</h3>' + (x.desc ? '<p class="tl__desc">' + esc(x.desc) + '</p>' : '') + badge + '</div></li>';
      }).join('') + '</ol>' +
      '<div class="days">' + S.finalDays.map(function (d) {
        return '<div class="day"><div class="day__top"><span class="day__d">' + esc(d.day) + '</span><span class="day__date">' + esc(d.date) + '</span></div>' +
          '<h3>' + esc(d.title) + '</h3><ul>' + d.tags.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</div>' +
      '<p class="tl-note">' + esc(S.timelineNote) + '</p>';
  })();

  // 點陣數字（5x7），用在總獎金這種大數字，像素感更明顯
  var BITMAP = { '0':['01110','10001','10011','10101','11001','10001','01110'], '1':['00100','01100','10100','00100','00100','00100','11111'],
    '2':['01110','10001','00001','00110','01000','10000','11111'], '3':['11110','00001','00001','01110','00001','00001','11110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'], '5':['11111','10000','11110','00001','00001','10001','01110'],
    '6':['00110','01000','10000','11110','10001','10001','01110'], '7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'], '9':['01110','10001','10001','01111','00001','00010','01100'] };
  function bitNum(v) {
    return esc(v).replace(/\s+/g, '').replace(/\d+/g, function (m) {
      var w = m.length * 6 - 1, r = '';
      m.split('').forEach(function (d, k) {
        (BITMAP[d] || []).forEach(function (row, y) {
          row.split('').forEach(function (c, x) { if (c === '1') r += '<rect x="' + (k * 6 + x) + '" y="' + y + '" width="1.02" height="1.02"/>'; });
        });
      });
      return '<svg class="bit-num" viewBox="0 0 ' + w + ' 7" style="width:' + (w / 7 * 0.78).toFixed(3) + 'em" role="img" aria-label="' + m + '" shape-rendering="crispEdges">' + r + '</svg>';
    });
  }
  // 數字用像素字，中文維持黑體
  function pxNum(v) { return esc(v).replace(/\s+/g, '').replace(/[\d][\d,.]*/g, function (m) { return '<span class="px-num">' + m + '</span>'; }); }
  /* =================== 競賽獎金 =================== */
  (function () {
    var P = S.prizes;
    $('#prize-body').innerHTML =
      secHead('prize-h', '競賽獎金', '', 'PRIZES', 'p-trophy') +
      '<div class="prize-banner"><div><p class="prize-banner__k">黑客松決賽總獎金</p><p class="prize-banner__v">' + bitNum(P.total) + '</p></div>' +
        '<p class="prize-banner__d">決賽前三名另享' + P.topThree.map(esc).join('、') + '</p>' +
        '<img src="assets/img/stars.webp" alt="" width="900" height="690" loading="lazy"></div>' +
      '<ol class="ranks">' + P.podium.map(function (p, i) {
        return '<li class="rank rank--' + (i + 1) + '"><span class="rank__no" aria-hidden="true">' + (i + 1) + '</span>' +
          '<p class="rank__name">' + esc(p.rank) + '</p><p class="rank__amt"><b>' + pxNum(p.amount) + '</b><small>' + esc(p.unit) + '</small></p></li>';
      }).join('') + '</ol>' +
      '<div class="perk-row">' +
        '<div class="perk"><h3>' + icon('p-heart', '') + esc(P.popular.title) + '</h3><p class="perk__pop-items">' + P.popular.items.map(esc).join('、') + '</p><p class="perk__big">' + pxNum(P.popular.amount) + '</p></div>' +
        '<div class="perk"><h3>' + icon('p-flag', '') + '入圍決賽</h3><p class="small">' + esc(P.finalists) + '</p></div>' +
        '<div class="perk"><h3>' + icon('p-team', '') + '所有隊伍</h3><p class="small">' + esc(P.everyone) + '</p></div>' +
      '</div>' +
      '<div class="travel"><div><h3>' + esc(P.travel.title) + '</h3><ol>' + P.travel.rules.map(function (r) { var m = r.match(/^([^：]{2,6})：([\s\S]*)$/); return '<li><span>' + (m ? '<b>' + esc(m[1]) + '</b>：' + esc(m[2]).replace(/\n/g, '<br class="br-d">') : esc(r).replace(/\n/g, '<br class="br-d">')) + '</span></li>'; }).join('') + '</ol></div>' +
        '<table class="tbl"><thead><tr><th scope="col">出發地</th><th scope="col">補助金額</th></tr></thead><tbody>' +
          P.travel.table.map(function (r) { return '<tr><td>' + esc(r.from) + '</td><td>' + esc(r.amount) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
  })();

  /* =================== 網路人氣獎 =================== */
  var V = S.vote;
  function voteState() {
    var now = new Date();
    if (now < new Date(V.start)) return { k: 'soon', label: '投票尚未開始', pill: '01.04 開放投票' };
    if (now > new Date(V.end)) return { k: 'end', label: '投票已結束', pill: '最終結果' };
    return { k: 'open', label: '投票進行中', pill: '每天可投 3 票' };
  }
  var votePreview = /[?&]preview=vote\b/.test(location.search);
  function teamsReady() { return V.teams.some(function (x) { return !isTBD(x.name); }); }
  function drawVote() {
    var st = voteState();
    // 01.04 前：只顯示 Coming soon，不露出隊伍卡片
    if (st.k === 'soon' && !votePreview) {
      $('#vote-body').innerHTML =
        secHead('vote-h', V.title, '', 'VOTE', 'p-heart') +
        '<div class="soon"><p class="soon__big" aria-hidden="true">COMING SOON</p>' +
          '<p class="soon__txt">' + esc(V.comingSoon) + '</p>' +
          '<ul class="soon__rules">' + V.rules.slice(0, 2).map(function (r) { return '<li>' + icon('i-play', '') + '<span>' + esc(r) + '</span></li>'; }).join('') + '</ul>' +
          (V.social ? '<p class="soon__social">' + esc(V.social.text) + '　<a data-link="facebook" target="_blank" rel="noopener">Facebook</a>｜<a data-link="instagram" target="_blank" rel="noopener">Instagram</a></p>' : '') +
          '<img class="soon__chrome" src="assets/img/megaphone.webp" alt="" width="800" height="737" loading="lazy">' +
        '</div>';
      return;
    }
    if (votePreview) st = { k: 'open', label: '投票進行中', pill: '每天可投 3 票' };
    var source = (votePreview && !teamsReady()) ? V.demoTeams : V.teams;
    var teams = source.slice();
    var hasVotes = teams.some(function (x) { return typeof x.votes === 'number'; });
    if (hasVotes) teams.sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); });
    var canVote = st.k === 'open' && !isTBD(V.voteUrl) && !isTBD(V.teamField);
    var fakeVote = votePreview && !canVote;
    function voteLink(x) {
      var u = V.voteUrl.split('#')[0];
      return u + (u.indexOf('?') > -1 ? '&' : '?') + encodeURIComponent(V.teamField) + '=' + encodeURIComponent(x.name);
    }
    $('#vote-body').innerHTML =
      secHead('vote-h', V.title, '', 'VOTE', 'p-heart') +
      (votePreview ? '<p class="preview-note">' + icon('i-glasses', '') + '<span>預覽模式：只有網址加上 ?preview=vote 才看得到，正式頁面 01.04 前顯示 Coming soon。' + (teamsReady() ? '' : '卡片為示意內容。') + '</span></p>' : '') +
      '<div class="vote-status"><div class="vote-status__state"><b>' + esc(st.label) + '</b><span class="vote-status__pill">' + esc(st.pill) + '</span></div>' +
        '<ul>' + V.rules.map(function (r) { return '<li>' + icon('i-play', '') + '<span>' + esc(r) + '</span></li>'; }).join('') + '</ul>' +
        '<p class="vote-status__upd">最後更新：' + t(V.updatedAt) + '</p></div>' +
      (V.social ? '<div class="vote-social"><div><p class="vote-social__t">' + icon('p-heart', '') + esc(V.social.title) + '</p><p class="vote-social__d">' + esc(V.social.text) + '</p></div>' +
        '<div class="vote-social__btns"><a class="btn btn--line btn--sm" data-link="facebook" target="_blank" rel="noopener">追蹤 Facebook</a><a class="btn btn--line btn--sm" data-link="instagram" target="_blank" rel="noopener">追蹤 Instagram</a></div></div>' : '') +
      '<div class="teams">' + teams.map(function (x, i) {
        var slogan = x.slogan || x.work, intro = x.intro || x.summary;
        var cover = x.cover ? '<img src="' + esc(x.cover) + '" alt="' + esc(x.name) + ' 作品介紹圖" loading="lazy">'
          : '<span class="team__ph">' + icon('p-team', '') + TBD + '</span>';
        var votes = typeof x.votes === 'number' ? '<p class="team__votes"><b>' + x.votes.toLocaleString('zh-TW') + '</b><small>票</small></p>' : '';
        return '<article class="team">' +
          '<button class="team__cover" type="button" data-team="' + esc(x.id) + '" aria-label="看 ' + esc(x.name) + ' 的作品">' + cover +
            '<span class="team__zoom">' + icon('i-glasses', '') + '看作品</span></button>' +
          '<div class="team__body"><div class="team__head">' + (hasVotes ? '<span class="team__no">#' + (i + 1) + '</span>' : '') + '<h3 class="team__name">' + t(x.name) + '</h3>' + votes + '</div>' +
          '<p class="team__slogan">' + t(slogan) + '</p>' +
          '<p class="team__intro">' + t(intro) + '</p>' +
          '<div class="team__btns"><button class="btn btn--paper btn--sm" type="button" data-team="' + esc(x.id) + '">看完整介紹</button>' +
          '<a class="btn btn--ink btn--sm"' + (canVote ? ' href="' + esc(voteLink(x)) + '" target="_blank" rel="noopener"' : fakeVote ? ' href="#vote" title="預覽：正式上線後會開啟 Google 投票表單"' : ' aria-disabled="true"') + '>投給這隊</a></div>' +
          '<div class="share" data-share="' + esc(x.id) + '" data-name="' + esc(x.name) + '"><span class="share__k">分享催票</span>' +
            '<a class="share__b" data-net="fb" target="_blank" rel="noopener">Facebook</a>' +
            '<button class="share__b" type="button" data-net="ig">Instagram</button></div>' +
          '</div></article>';
      }).join('') + '</div>';
    wireShare();
    wireLinks($('#vote-body'));
    if (window.cjkBreak) window.cjkBreak($('#vote-body'));
  }
  // 分享催票：連結會直接帶到這一隊的卡片
  function shareUrl(id) { return location.href.split('#')[0].split('?')[0] + '?team=' + encodeURIComponent(id) + '#vote'; }
  function wireShare() {
    $$('.share').forEach(function (box) {
      var id = box.getAttribute('data-share'), name = box.getAttribute('data-name'), url = shareUrl(id);
      var msg = '幫「' + name + '」投下一票！厝客松第七屆網路人氣獎，每天可投 3 票 👉 ';
      $('[data-net="fb"]', box).href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
      // IG 沒有網頁分享網址：手機叫出系統分享選單（可選 IG），電腦則複製連結讓同學貼到 IG 限動或貼文
      var ig = $('[data-net="ig"]', box);
      ig.addEventListener('click', function () {
        if (navigator.share && window.matchMedia('(pointer: coarse)').matches) { navigator.share({ title: '厝客松網路人氣獎', text: msg, url: url }).catch(function () {}); return; }
        var done = function () { ig.textContent = '已複製連結，貼到 IG 限動吧'; setTimeout(function () { ig.textContent = 'Instagram'; }, 2200); };
        if (navigator.clipboard) navigator.clipboard.writeText(msg + url).then(done, done); else { window.prompt('複製這段文字，貼到 IG', msg + url); }
      });
    });
    var m = location.search.match(/[?&]team=([^&#]+)/);
    if (m) {
      // 網址參數可能被亂改：解碼失敗或含特殊字元都不要讓整頁壞掉
      var key = ''; try { key = decodeURIComponent(m[1]); } catch (err) { key = ''; }
      var card = key ? $$('.share[data-share]').filter(function (el) { return el.getAttribute('data-share') === key; })[0] : null;
      if (card) { card = card.closest('.team'); card.classList.add('is-target'); if (window.top === window) setTimeout(function () { card.scrollIntoView({ block: 'center' }); }, 300); }
    }
  }
  drawVote();
  if (!isTBD(V.dataUrl)) {
    fetch(V.dataUrl).then(function (r) { return r.json(); }).then(function (d) {
      if (d.updatedAt) V.updatedAt = d.updatedAt;
      (d.teams || []).forEach(function (u) { V.teams.forEach(function (x) { if ((x.id === u.id || x.name === u.name) && typeof u.votes === 'number') x.votes = u.votes; }); });
      drawVote();
    }).catch(function () {});
  }
  var dlg = $('#dlg');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-team]'); if (!b) return;
    var x = V.teams.concat(V.demoTeams || []).filter(function (k) { return k.id === b.getAttribute('data-team'); })[0]; if (!x) return;
    var slogan = x.slogan || x.work, intro = x.intro || x.summary;
    var canVote = voteState().k === 'open' && !isTBD(V.voteUrl) && !isTBD(V.teamField);
    var fakeVote = votePreview && !canVote;
    var link = canVote ? V.voteUrl.split('#')[0] + (V.voteUrl.indexOf('?') > -1 ? '&' : '?') + encodeURIComponent(V.teamField) + '=' + encodeURIComponent(x.name) : '';
    $('#dlg-body').innerHTML = '<div class="work">' +
      '<div class="work__img">' + (x.cover ? '<img src="' + esc(x.cover) + '" alt="' + esc(x.name) + ' 作品介紹圖">' : '<div class="dlg__ph">' + TBD + '</div>') + '</div>' +
      '<div class="work__txt"><p class="work__k">網路人氣獎｜參賽作品</p><h3 id="dlg-title" class="work__name">' + t(x.name) + '</h3>' +
        '<p class="work__slogan">' + t(slogan) + '</p>' +
        (typeof x.votes === 'number' ? '<p class="work__votes"><b>' + x.votes.toLocaleString('zh-TW') + '</b> 票</p>' : '') +
        '<h4 class="work__h">提案介紹</h4><p class="work__intro">' + t(intro) + '</p>' +
        '<a class="btn btn--ink"' + (link ? ' href="' + esc(link) + '" target="_blank" rel="noopener"' : fakeVote ? ' href="#vote"' : ' aria-disabled="true"') + '>投給這隊</a>' +
      '</div></div>';
    if (window.cjkBreak) window.cjkBreak($('#dlg-body'));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  $('.dlg__close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* =================== 歷屆回顧 =================== */
  function ytId(u) {
    if (isTBD(u)) return '';
    var m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(u) ? u : '');
  }
  (function () {
    var list = S.history.slice().reverse();
    $('#history-body').innerHTML =
      secHead('history-h', '歷屆回顧', '', 'ARCHIVE', 'p-camera') +
      '<div class="yrs" role="tablist" aria-label="選擇屆數">' + list.map(function (h, idx) {
        return '<button type="button" role="tab" id="tab-hist-' + h.no + '" aria-controls="hist-' + h.no + '" aria-selected="' + (idx === 0) + '" tabindex="' + (idx === 0 ? 0 : -1) + '">' +
          '<b>' + esc(h.year) + '</b><small>厝客松 ' + h.no + '</small></button>';
      }).join('') + '</div>' +
      '<div class="hist">' + list.map(function (h, idx) {
        var id = 'hist-' + h.no, vid = ytId(h.youtube);
        var slides = (h.photos && h.photos.length ? h.photos : ['']).map(function (p, k) {
          return '<div class="slide' + (k === 0 ? ' is-on' : '') + '" role="group" aria-roledescription="投影片" aria-label="第 ' + (k + 1) + ' 張">' +
            (p ? '<img src="' + esc(p) + '" alt="厝客松 ' + h.no + ' 代表隊伍 ' + esc(h.team) + ' 作品圖 ' + (k + 1) + '" loading="lazy">'
               : '<div class="car__ph">' + icon('p-camera', '') + TBD + '</div>') + '</div>';
        }).join('');
        var n = (h.photos && h.photos.length) || 1;
        var yt = vid
          ? '<div class="yt" data-yt="' + vid + '"><button class="yt__btn" type="button" aria-label="播放第 ' + h.no + ' 屆影片"><img src="https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg" alt="" loading="lazy"><span class="yt__play">' + icon('i-play', '') + '</span></button></div>'
          : '';
        return '<div class="ed" id="' + id + '" role="tabpanel" aria-labelledby="tab-' + id + '"' + (idx === 0 ? '' : ' hidden') + '>' +
          '<div class="ed__head"><p class="ed__no">厝客松 ' + h.no + '｜' + esc(h.year) + '</p><h3 class="ed__title">' + esc(h.title) + '</h3></div>' +
          '<div class="ed__content">' +
            '<div class="car" aria-roledescription="輪播" aria-label="第 ' + h.no + ' 屆作品圖">' +
              '<div class="car__stage">' + slides + '</div>' +
              (n > 1 ? '<div class="car__ctl"><div class="car__dots">' + new Array(n + 1).join('x').split('').map(function (_, k) {
                return '<button type="button" aria-label="第 ' + (k + 1) + ' 張"' + (k === 0 ? ' aria-current="true"' : '') + '><i></i></button>';
              }).join('') + '</div><span class="car__cap">作品圖取自歷屆簡章</span><div class="car__arrows">' +
                '<button class="prev" type="button" aria-label="上一張">' + icon('i-play', '') + '</button>' +
                '<button class="next" type="button" aria-label="下一張">' + icon('i-play', '') + '</button></div></div>' : '') +
            '</div>' +
            '<div class="ed__side"><p class="ed__desc">' + esc(h.desc) + '</p>' +
              '<div class="ed__teambox"><small>代表隊伍</small><b>' + esc(h.team) + '</b><p>' + esc(h.highlight) + '</p></div>' + yt + '</div>' +
          '</div></div>';
      }).join('') + '</div>' +
      '<div class="hist-more"><a class="btn btn--line" data-link="youtube" target="_blank" rel="noopener"><span>到厝邊 YouTube 看更多</span>' + icon('i-play', 'btn__arrow') + '</a></div>';

    tabs($('.yrs'));
    // YouTube：點了才載入，頁面比較快
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.yt__btn'); if (!b) return;
      var box = b.closest('.yt'), id = box.getAttribute('data-yt');
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="厝客松歷屆影片" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });
  })();

  /* 輪播 */
  function initCarousel(car) {
    var slides = $$('.slide', car), dots = $$('.car__dots button', car), i = 0;
    if (slides.length < 2) return null;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      dots.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    $('.prev', car).addEventListener('click', function () { go(i - 1); });
    $('.next', car).addEventListener('click', function () { go(i + 1); });
    var stage = $('.car__stage', car), x0 = null, t0 = 0;
    stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; x0 = e.clientX; t0 = Date.now(); });
    stage.addEventListener('pointerup', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0, v = Math.abs(dx) / Math.max(1, Date.now() - t0);
      if (Math.abs(dx) > 40 || v > 0.11) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    car.tabIndex = -1;
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    });
    return go;
  }
  var carGo = {};
  $$('.car').forEach(function (c) { var ed = c.closest('.ed'); carGo[ed ? ed.id : ''] = initCarousel(c); });

  /* 網址 ?hist=3-2：直接打開第 3 屆、顯示第 2 張；?hist=all-2：全部顯示（檢查用） */
  (function () {
    var m = location.search.match(/[?&]hist=(\d+|all)(?:-(\d+))?/);
    if (!m) return;
    var eds = m[1] === 'all' ? $$('.ed') : [document.getElementById('hist-' + m[1])];
    if (m[1] === 'all') eds.forEach(function (ed) { ed.hidden = false; });
    else if (eds[0]) $('.yrs').selectTab(eds[0].id);
    eds.forEach(function (ed) { if (ed && m[2] && carGo[ed.id]) carGo[ed.id](+m[2] - 1); });
    if (eds[0] && m[1] !== 'all' && window.top === window) setTimeout(function () { eds[0].scrollIntoView({ block: 'start' }); }, 60);
  })();

  /* =================== Q&A =================== */
  (function () {
    var n = 0, icons = ['p-doc', 'p-team', 'p-building'];
    $('#faq-body').innerHTML =
      secHead('faq-h', 'Q&A說明', '', 'FAQ', 'p-question') +
      '<div class="faq-tabs" role="tablist" aria-label="問題分類">' + S.faq.map(function (g, gi) {
        return '<button type="button" role="tab" id="tab-faq-' + gi + '" aria-controls="faq-' + gi + '" aria-selected="' + (gi === 0) + '" tabindex="' + (gi === 0 ? 0 : -1) + '">' +
          icon(icons[gi % 3], '') + '<span>' + esc(g.group) + '</span><small>' + g.items.length + '</small></button>';
      }).join('') + '</div>' +
      S.faq.map(function (g, gi) {
        return '<div class="faq__list" id="faq-' + gi + '" role="tabpanel" aria-labelledby="tab-faq-' + gi + '"' + (gi ? ' hidden' : '') + '>' +
          g.items.map(function (x) {
            n++;
            return '<div class="qa"><button class="qa__q" type="button" aria-expanded="false" aria-controls="qa-' + n + '">' +
              '<span class="q">Q</span><span>' + esc(x.q) + '</span><span class="pm" aria-hidden="true">' + icon('i-pixel-x', '') + '</span></button>' +
              '<div class="qa__a" id="qa-' + n + '" role="region"><div><p>' + esc(x.a) + '</p></div></div></div>';
          }).join('') + '</div>';
      }).join('');
    tabs($('.faq-tabs'));
    $$('.qa__q').forEach(function (b) {
      b.addEventListener('click', function () {
        var qa = b.closest('.qa'), open = !qa.classList.contains('is-open');
        qa.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
      });
    });
  })();

  /* =================== 聯絡我們 =================== */
  (function () {
    var L = S.links, C = S.contact;
    var rows = [
      ['Email', 'mailto:' + L.email, L.email],
      ['LINE', L.line, '厝邊 LINE 官方帳號'],
      ['Facebook', L.facebook, '厝邊Tshupinn'],
      ['Instagram', L.instagram, '厝邊IG @tshupinn_career'],
      ['YouTube', L.youtube, '厝邊Tshupinn']
    ];
    $('#contact-body').innerHTML =
      secHead('contact-h', C.title, '', 'CONTACT', 'p-mail') +
      '<div class="contact"><div>' +
        '<p class="contact__lead">' + esc(C.lead) + '</p>' +
        '<div class="contact__btns"><a class="btn btn--ink btn--lg" data-link="line" target="_blank" rel="noopener"><span>加入厝邊 LINE</span>' + icon('i-play', 'btn__arrow') + '</a></div>' +
        '<div class="contact__list">' + rows.map(function (r) {
          var ok = !isTBD(r[2]) && !/待填/.test(r[1]);
          return '<a ' + (ok ? 'href="' + esc(r[1]) + '"' + (r[0] === 'Email' ? '' : ' target="_blank" rel="noopener"') : 'aria-disabled="true"') + '><small>' + esc(r[0]) + '</small><span>' + t(r[2]) + '</span>' + icon('i-play', '') + '</a>';
        }).join('') + '</div>' +
      '</div>' +
      '<figure class="qr">' + ['a', 'b', 'c', 'd'].map(function (k) { return '<svg class="qr__x qr__x--' + k + '" aria-hidden="true"><use href="#i-pixel-x"/></svg>'; }).join('') +
        '<img src="assets/logo/line-qr.png" alt="厝邊 LINE 官方帳號 QR Code" width="520" height="520" loading="lazy">' +
        '<figcaption><p>掃描加入厝邊 LINE 官方帳號</p></figcaption></figure></div>';
  })();

  wireLinks(document);

  /* =================== 中文斷行：只在詞和詞之間換行，最後一行不留單字 ===================
     用瀏覽器內建的斷詞（Intl.Segmenter），在詞與詞之間放可換行點；搭配 CSS 的 keep-all，
     就不會出現「截｜止」這種把詞切開的情況。 */
  window.cjkBreak = function (root) {
    if (!window.Intl || !Intl.Segmenter) return;
    var seg = new Intl.Segmenter('zh-Hant-TW', { granularity: 'word' });
    var CJK = /[㐀-鿿]/;
    var NOBREAK_BEFORE = /^[，。、；：？！」』）》〉…—－～％,.;:?!)\]]/;
    var NOBREAK_AFTER = /[「『（《〈(\[]$/;
    var win = window;
    // 專有名詞不拆開（斷詞工具常把它們切成兩段）
    var KEEP = ['任一', '厝客松', '黑客松', '厝邊', '國泰人壽', '國壽', '不動產', '參賽者', '承諾書', '人氣獎', '業師', '產學', '個案分析', '商業競賽', '雲端資料夾', '報名表單', '初審', '複審', '決賽', '簽到表', '車馬費', '身分證', '交通費', '藍牙音響'];
    function keepWords(parts) {
      // 找出專有名詞所在的字元位置，切點落在名詞中間就把前後兩段合併
      var text = parts.join(''), inside = {};
      KEEP.forEach(function (w) { var i = text.indexOf(w); while (i > -1) { for (var j = i + 1; j < i + w.length; j++) inside[j] = 1; i = text.indexOf(w, i + 1); } });
      var out = [], pos = 0;
      parts.forEach(function (p) {
        if (out.length && inside[pos]) out[out.length - 1] += p; else out.push(p);
        pos += p.length;
      });
      return out;
    }
    var sel = root ? 'p, h2, h3, h4, li, dd, td' : 'main p, main h2, main h3, main h4, main li, main dd, main td, main figcaption, main .ed__title, .foot__note';
    var all = function (s) { return root ? $$(s, root) : $$(s); };
    // 數字範圍（4～7、10.27－11.18、1,000－6,000）整段不換行
    var RANGE = /[\d][\d,./:]*\s?[～－—~]\s?[\d][\d,./:]*(?:\s?[\u4e00-\u9fff])?[。，、！）]?|\d+\u2060?:\u2060?\d+|[^\s「」，（]+\u2060?\.\u2060?(?:pdf|pptx)|[\w.+-]+⁠?@⁠?[\w-]+(?:\.[\w-]+)+|\d[\d,.]*\s?(?:月|日|年|頁|人|隊|票|萬|元|坪|字|號|屆|週|天|位|名|項|次|筆)/g;
    all(sel).forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), list = [], n;
      while ((n = walker.nextNode())) if (RANGE.test(n.nodeValue) && !n.parentNode.closest('.nw')) list.push(n);
      list.forEach(function (node) {
        RANGE.lastIndex = 0;
        var txt = node.nodeValue, frag = document.createDocumentFragment(), last = 0, m;
        while ((m = RANGE.exec(txt))) {
          if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
          var sp = document.createElement('span'); sp.className = 'nw'; sp.textContent = m[0]; frag.appendChild(sp);
          last = m.index + m[0].length;
        }
        if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
      RANGE.lastIndex = 0;
    });
    all(sel).forEach(function (el) {
      if (el.getAttribute('data-cjk')) return; el.setAttribute('data-cjk', '1');
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      // 只處理屬於這個段落本身的文字；巢狀清單裡的文字留給內層段落自己處理
      while ((n = walker.nextNode())) if (CJK.test(n.nodeValue) && !n.parentNode.closest('.nw, svg, script') && n.parentNode.closest('p, h2, h3, h4, li, dd, td, figcaption, .ed__title, .foot__note') === el) nodes.push(n);
      nodes.forEach(function (node, ni) {
        var parts = keepWords(Array.from(seg.segment(node.nodeValue)).map(function (s) { return s.segment; }));
        // 這段文字後面緊接著換行（<br>）或是整段最後一段，都要保護行尾不留單字
        var nx = node.nextSibling;
        var beforeBr = nx && nx.nodeName === 'BR' && win.getComputedStyle(nx).display !== 'none';
        var isLast = ni === nodes.length - 1 || beforeBr;
        // 最後一行至少留 4 個字左右：把尾巴的幾個詞黏在一起
        var tail = 0, glueFrom = parts.length;
        if (isLast) {
          for (var k = parts.length - 1; k >= 0; k--) { tail += parts[k].length; glueFrom = k; if (tail >= 4) break; }
        }
        var frag = document.createDocumentFragment(), buf = '', inTail = false;
        parts.forEach(function (p, k) {
          // 單一個中文字不單獨跑到下一行開頭（例如「坪｜數」「興安｜街」「廊｜帶」），讓它跟著前一個詞
          var single = function (x) { return x && x.length === 1 && CJK.test(x); };
          var ok = k > 0 && !NOBREAK_BEFORE.test(p) && !NOBREAK_AFTER.test(parts[k - 1]) && !/^\s/.test(p) && !/\s$/.test(parts[k - 1]) && !single(p);
          if (isLast && k > glueFrom) ok = false;
          if (ok) { frag.appendChild(document.createTextNode(buf)); frag.appendChild(document.createElement('wbr')); buf = ''; }
          // 尾巴起點本身不能斷行時，就從上一個斷點開始整段黏住
          if (isLast && k === glueFrom) inTail = true;
          buf += p;
        });
        if (inTail && buf.length > 1) {
          // 尾巴包成不換行，最後一行不會只剩一個字；遇到空白就從空白後面開始黏，空白本身照常可以換行
          var sp = buf.match(/^([\s\S]*[ \t\n])([^ \t\n]+)$/);
          if (sp) frag.appendChild(document.createTextNode(sp[1]));
          var span = document.createElement('span'); span.className = 'nw'; span.textContent = sp ? sp[2] : buf; frag.appendChild(span);
        } else frag.appendChild(document.createTextNode(buf));
        node.parentNode.replaceChild(frag, node);
      });
    });
  };
  window.cjkBreak();

  /* =================== 首頁大日期 =================== */
  (function () {
    var box = $('#key-dates'); if (!box) return;
    box.innerHTML = S.hero.keyDates.map(function (d) {
      var w = '（' + wk(d.date) + (d.end ? '－' + wk(d.end) : '') + '）';
      return '<div class="kd__item"><dt>' + esc(d.label) + '</dt><dd><b class="nw">' + esc(d.show) + '</b></dd>' + (d.note ? '<p class="kd__note">' + esc(d.note) + '</p>' : '') + '</div>';
    }).join('');
  })();

  /* =================== 倒數計時 =================== */
  (function () {
    var label = $('#count-label'), box = $('#count-digits'), cells = null, timer;
    function target() {
      var now = Date.now();
      for (var i = 0; i < S.countdown.length; i++) {
        var d = new Date(S.countdown[i].date).getTime();
        if (d > now) return { label: S.countdown[i].label, at: d };
      }
      return null;
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var tg = target();
      if (!tg) { label.textContent = ''; box.innerHTML = '<p class="count__done">感謝參與第七屆厝客松！</p>'; clearInterval(timer); return; }
      if (label.textContent !== tg.label) { label.textContent = tg.label; cells = null; }
      var s = Math.max(0, Math.floor((tg.at - Date.now()) / 1000));
      var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      if (!cells) {
        box.innerHTML = ['天', '時', '分', '秒'].map(function (u) { return '<div class="count__cell"><b></b><small>' + u + '</small></div>'; }).join('');
        cells = $$('b', box);
      }
      cells.forEach(function (c, k) { var x = k === 0 ? String(v[0]) : pad(v[k]); if (c.textContent !== x) c.textContent = x; });
    }
    tick(); timer = setInterval(tick, 1000);
  })();

  /* =================== 導覽列、手機選單、底部按鈕 =================== */
  (function () {
    var nav = $('.nav'), burger = $('.nav__burger'), sheet = $('#sheet');
    $('.sheet__links').innerHTML = $$('.nav__links a').map(function (a) {
      return '<a href="' + a.getAttribute('href') + '"><span>' + a.textContent + '</span>' + icon('i-play', '') + '</a>';
    }).join('');
    function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 8 || sheet.classList.contains('is-open')); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    function setOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
      if (open) { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('is-open'); }); document.body.style.overflow = 'hidden'; }
      else { sheet.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(function () { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 320); }
      onScroll();
    }
    burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setOpen(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1240 && burger.getAttribute('aria-expanded') === 'true') setOpen(false); });

    if (!('IntersectionObserver' in window)) { $$('.sec-head').forEach(function (h) { h.classList.add('in'); }); return; }
    // 目前所在區塊
    var links = $$('.nav__links a');
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main .sec').forEach(function (s) { secIO.observe(s); });
    // 標題外框進場
    var headIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); headIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    $$('.sec-head').forEach(function (h) { headIO.observe(h); });
    // 手機底部按鈕：滑過首屏後出現
    var dock = $('.dock');
    new IntersectionObserver(function (es) {
      var on = !es[0].isIntersecting;
      dock.classList.toggle('is-on', on); document.body.classList.toggle('has-dock', true);
    }).observe($('.hero__cta'));
  })();

  /* =================== 捲動視差：銀色物件比內容慢一點點移動，有飄過的感覺 =================== */
  (function () {
    if (reduce) return;
    var els = $$('.who__splat, .theme-cursor, .early img, .soon__chrome, .mis img').map(function (el, i) {
      return { el: el, k: [0.08, -0.06, 0.1, -0.08, 0.05][i % 5] };
    });
    if (!els.length) return;
    var vis = new Set(), raf = 0;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) vis.add(e.target); else vis.delete(e.target); }); tick(); }, { rootMargin: '120px 0px' });
    els.forEach(function (o) { io.observe(o.el); });
    function update() {
      raf = 0; var vh = window.innerHeight;
      els.forEach(function (o) {
        if (!vis.has(o.el)) return;
        var r = o.el.getBoundingClientRect(), c = r.top + r.height / 2 - vh / 2;
        o.el.style.translate = '0 ' + (c * o.k).toFixed(1) + 'px';
      });
    }
    function tick() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* =================== 主視覺：滑鼠視差 =================== */
  (function () {
    if (reduce || !fine) return;
    var hero = $('.hero'), els = $$('[data-depth]', hero), tiles = $$('.hero__tiles .t', hero);
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = true;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    new IntersectionObserver(function (es) { active = es[0].isIntersecting; }).observe(hero);
    function loop() {
      raf = 0; if (!active) return;
      x += (tx - x) * .08; y += (ty - y) * .08;
      els.forEach(function (el) {
        var d = +el.getAttribute('data-depth');
        el.style.transform = 'translate3d(' + (x * d * -40).toFixed(2) + 'px,' + (y * d * -30).toFixed(2) + 'px,0)';
      });
      tiles.forEach(function (el, k) {
        var d = (k % 3 + 1) * .25;
        el.style.transform = 'translate3d(' + (x * d * 18).toFixed(2) + 'px,' + (y * d * 12).toFixed(2) + 'px,0)';
      });
      if (Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001) raf = requestAnimationFrame(loop);
    }
  })();
})();
