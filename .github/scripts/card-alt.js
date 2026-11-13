'use strict';

const fs = require('node:fs');
const path = require('node:path');

const EDITIONS = ['README.md', 'README.ca.md', 'README.es.md', 'README.it.md'];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text) =>
  text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return ENTITIES[name.toLowerCase()] ?? match;
  });

const escapeAttribute = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const squash = (text) => text.replace(/\s+/g, ' ').trim();

const strip = (svg) => svg.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, '');

const lines = (svg) =>
  decode(strip(svg).replace(/<[^>]*>/g, '\n'))
    .split('\n')
    .map(squash)
    .filter(Boolean);

const texts = (svg) =>
  [...strip(svg).matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)].map((match) => ({
    attributes: match[1],
    value: squash(decode(match[2].replace(/<[^>]*>/g, ''))),
  }));

const after = (list, heading) => list[list.indexOf(heading) + 1];

const pairs = (list, heading, stop, count) => {
  const start = list.indexOf(heading);
  if (start === -1) return [];
  const out = [];
  for (let i = start + 1; i + 1 < list.length && out.length < count; i += 2) {
    if (stop.includes(list[i])) break;
    out.push(`${list[i]} ${list[i + 1]}`);
  }
  return out;
};

const plural = (count, one, many) => `${count} ${Number(String(count).replace(/,/g, '')) === 1 ? one : many}`;

const summarisers = {
  'github-stats': (svg) => {
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(svg);
    const desc = /<desc[^>]*>([\s\S]*?)<\/desc>/i.exec(svg);
    if (!desc) return null;
    const figure = {};
    for (const part of decode(desc[1]).split(/,\s*(?=[A-Z])/)) {
      const match = /^(.*?)\s*:\s*(\S+)$/.exec(squash(part));
      if (match) figure[match[1].replace(/\s*\(.*\)/, '').toLowerCase()] = match[2];
    }
    const rank = title && /Rank:\s*(\S+)/.exec(decode(title[1]));
    const stars = figure['total stars earned'];
    const commits = figure['total commits'];
    const prs = figure['total prs'];
    const issues = figure['total issues'];
    const repos = figure['contributed to'];
    if (![stars, commits, prs, issues, repos].every(Boolean)) return null;
    return [
      rank ? `rank ${rank[1]}` : null,
      plural(stars, 'star earned', 'stars earned'),
      `${commits} commits in the last year`,
      plural(prs, 'pull request', 'pull requests'),
      plural(issues, 'issue', 'issues'),
      `contributed to ${plural(repos, 'repository', 'repositories')} in the last year`,
    ]
      .filter(Boolean)
      .join(', ');
  },

  'github-languages': (svg) => {
    const list = texts(svg).map((text) => text.value);
    const rows = [];
    for (let i = 1; i + 1 < list.length; i += 2) rows.push(`${list[i]} ${list[i + 1]}`);
    return rows.length ? rows.slice(0, 5).join(', ') : null;
  },

  'github-streak': (svg) => {
    const found = [...strip(svg).matchAll(/<g\b[^>]*translate\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)[^>]*>\s*<text\b[^>]*>([\s\S]*?)<\/text>/gi)].map(
      (match) => ({ x: match[1], value: squash(decode(match[3].replace(/<[^>]*>/g, ''))) }),
    );
    const column = (label) => {
      const items = found.filter((item) => item.x === found.find((entry) => entry.value === label)?.x);
      const number = items.find((item) => /^[\d,]+$/.test(item.value));
      const range = items.find((item) => / - |Present/.test(item.value) && item !== number);
      return number ? { number: number.value, range: range?.value } : null;
    };
    const total = column('Total Contributions');
    const current = column('Current Streak');
    const longest = column('Longest Streak');
    if (!total || !current || !longest) return null;
    const span = (streak) => (streak.range ? ` (${streak.range})` : '');
    return [
      `${total.number} total contributions${total.range ? ` since ${total.range.replace(/ - .*$/, '')}` : ''}`,
      `current streak ${plural(current.number, 'day', 'days')}${span(current)}`,
      `longest streak ${plural(longest.number, 'day', 'days')}${span(longest)}`,
    ].join(', ');
  },

  'github-contributions': (svg) => {
    const list = texts(svg).map((text) => text.value);
    const total = list.find((text) => /Contributions on GitHub/i.test(text));
    if (!total) return null;
    const repos = list.find((text) => /Public Repos?/i.test(text));
    const joined = list.find((text) => /^Joined GitHub/i.test(text));
    return [
      total.replace(/^(\S+) Contributions/, '$1 contributions'),
      repos && repos.replace(/^(\d+) Public Repos?$/i, (_, n) => `${plural(n, 'public repository', 'public repositories')}`),
      joined && joined.replace(/^Joined/, 'joined'),
    ]
      .filter(Boolean)
      .join(', ');
  },

  trophies: (svg) => {
    const list = texts(svg)
      .filter((text) => !/Courier/i.test(text.attributes))
      .map((text) => text.value);
    const trophies = [];
    for (let i = 0; i + 2 < list.length; i += 3) {
      trophies.push(`${list[i]} ${list[i + 2].replace(/pt$/, '')}`);
    }
    return trophies.length ? trophies.join(', ') : null;
  },

  wakatime: (svg) => {
    const list = lines(svg);
    const period = /^WakaTime \(over (.*)\)$/.exec(list[0] ?? '');
    const hours = list.find((line) => /coding hours recorded/.test(line));
    if (!period || !hours) return null;
    const perDay = list.find((line) => /of coding per day/.test(line));
    const stop = ['Code editors', 'Operating systems', 'Projects activity', 'Language activity'];
    const languages = pairs(list, 'Language activity', stop, 3);
    const editors = pairs(list, 'Code editors', stop, 1);
    return [
      `${hours.replace(/^~/, 'about ')} over the ${period[1]}`,
      perDay && perDay.replace(/^~/, 'about '),
      languages.length ? `top languages ${languages.join(', ')}` : null,
      editors.length ? `top editor ${editors[0]}` : null,
    ]
      .filter(Boolean)
      .join(', ');
  },

  'wakatime-languages': (svg) => {
    const list = texts(svg).map((text) => text.value);
    const rows = list
      .slice(1)
      .map((text) => /^(.*) - ([\d,]+) hrs?\b/.exec(text))
      .filter(Boolean)
      .map((match) => `${match[1]} ${match[2]} hrs`);
    return rows.length ? rows.slice(0, 5).join(', ') : null;
  },
};

const summarise = (svgPath) => {
  const name = path.basename(svgPath, '.svg');
  const summariser = summarisers[name] ?? (name.startsWith('wakatime-') ? summarisers.wakatime : undefined);
  if (!summariser) throw new Error(`${svgPath}: no summary is defined for this card`);
  const summary = summariser(fs.readFileSync(svgPath, 'utf8'));
  if (!summary) throw new Error(`${svgPath}: found no figures to summarise`);
  return squash(summary);
};

const setAlt = (edition, svgPath, summary) => {
  const source = fs.readFileSync(edition, 'utf8');
  const target = new RegExp(`<img\\b[^>]*\\bsrc="${svgPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
  let count = 0;
  const output = source.replace(target, (tag) => {
    count += 1;
    if (!/\balt="[^"]*"/.test(tag)) throw new Error(`${edition}: the image of ${svgPath} has no alt`);
    return tag.replace(/\balt="([^"]*)"/, (_, alt) => {
      const name = decode(alt).split(': ')[0];
      return `alt="${escapeAttribute(`${name}: ${summary}`)}"`;
    });
  });
  if (count !== 1) throw new Error(`${edition}: expected one image of ${svgPath}, found ${count}`);
  if (output !== source) fs.writeFileSync(edition, output);
};

const main = (svgPaths) => {
  if (!svgPaths.length) throw new Error('usage: node card-alt.js <card.svg>...');
  for (const svgPath of svgPaths) {
    const summary = summarise(svgPath);
    for (const edition of EDITIONS) setAlt(edition, svgPath, summary);
    console.log(`${svgPath}: ${summary}`);
  }
};

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
