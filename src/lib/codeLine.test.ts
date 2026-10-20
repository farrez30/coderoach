import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseCodeLine, validateCodeLine } from './codeLine';
import { PORTFOLIO } from './portfolio/projects';

const join = (line: string) => parseCodeLine(line).map((t) => t.text).join('');

describe('parseCodeLine', () => {
  test('keeps colour spans and decodes indentation', () => {
    assert.deepEqual(parseCodeLine('&nbsp;&nbsp;<span style="color:#C4C0C5">const</span> x = <span style="color:#2C70FE">"a"</span>'), [
      { text: '  ' },
      { text: 'const', color: '#C4C0C5' },
      { text: ' x = ' },
      { text: '"a"', color: '#2C70FE' },
    ]);
  });

  test('empty and missing lines give no tokens', () => {
    assert.deepEqual(parseCodeLine(''), []);
    assert.deepEqual(parseCodeLine(null), []);
    assert.deepEqual(parseCodeLine(undefined), []);
  });

  test('scripts and handlers stay as text without a colour', () => {
    for (const evil of [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<span style="color:#fff" onmouseover="alert(1)">x</span>',
      '<span style="color:red;background:url(javascript:alert(1))">x</span>',
      '<a href="javascript:alert(1)">x</a>',
    ]) {
      const tokens = parseCodeLine(evil);
      assert.equal(join(evil), evil);
      assert.ok(tokens.every((t) => t.color === undefined), evil);
    }
  });

  test('only hex colours pass through', () => {
    assert.deepEqual(parseCodeLine('<span style="color:#abc;">a</span>'), [{ text: 'a', color: '#abc' }]);
    assert.equal(parseCodeLine('<span style="color:expression(alert(1))">a</span>')[0].color, undefined);
    assert.equal(parseCodeLine('<span style="color:#12345">a</span>')[0].color, undefined);
  });

  test('escaped markup is shown, not interpreted', () => {
    assert.equal(join('&lt;script&gt; &amp;&amp; &quot;x&#39;'), '<script> && "x\'');
    assert.equal(join('&copy;'), '&copy;');
  });

  test('every bundled portfolio line renders without leftover markup', () => {
    for (const entry of PORTFOLIO) {
      for (const line of entry.featuredDetails?.codePanel.lines ?? []) {
        assert.doesNotMatch(join(line), /<|&nbsp;/, line);
        assert.equal(validateCodeLine(line), true);
      }
    }
  });
});

describe('validateCodeLine', () => {
  test('accepts colour spans, plain code and comparisons', () => {
    for (const ok of ['', 'return a < b && b > c', '<span style="color:#C4C0C5">await</span> run()', null, undefined]) {
      assert.equal(validateCodeLine(ok), true);
    }
  });

  test('rejects any other tag', () => {
    for (const bad of ['<script>alert(1)</script>', '<b>x</b>', '</span>', '<!-- x -->', '<span style="color:#fff" onclick="x">x</span>']) {
      assert.equal(typeof validateCodeLine(bad), 'string', bad);
    }
  });
});
