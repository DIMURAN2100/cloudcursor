#!/usr/bin/env node
/**
 * 内容校验：在 CI 中跑 `node --experimental-strip-types scripts/check-content.ts`
 * （Node 22+ 原生支持 .ts）。
 *
 * 检查项：
 *   1. 每期简报至少解析出 1 条 highlight
 *   2. 每条 highlight 必须有 title/summary
 *   3. enrichment daily/*.json 合法，classifications 引用都存在
 *   4. taxonomy 中的 themeSlug 都存在
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBriefings, themes } from '../src/lib/briefings.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const errors: string[] = [];
const warnings: string[] = [];

const briefings = loadBriefings();

if (briefings.length === 0) {
  errors.push('没有加载到任何简报（briefings/ 目录为空或路径不对）');
}

for (const b of briefings) {
  if (b.highlights.length === 0) {
    errors.push(`${b.filename}: 0 条 highlights（模板可能已变）`);
    continue;
  }
  for (const h of b.highlights) {
    if (!h.title) errors.push(`${b.filename}#${h.index}: 缺 title`);
    if (!h.summary || h.summary.length < 10) {
      warnings.push(`${b.filename}#${h.index}: summary 过短（${h.summary.length} 字符）`);
    }
    if (!h.sources || h.sources.length === 0) {
      warnings.push(`${b.filename}#${h.index}: 没有原文链接`);
    }
    if (!themes.find((t) => t.slug === h.themeSlug)) {
      errors.push(`${b.filename}#${h.index}: 未知 themeSlug "${h.themeSlug}"`);
    }
  }
}

// enrichment
const enrichDir = path.resolve(ROOT, '../data/enrichment/daily');
if (fs.existsSync(enrichDir)) {
  const files = fs.readdirSync(enrichDir).filter((f: string) => f.endsWith('.json'));
  const slugs = new Set(briefings.map((b) => b.slug));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(enrichDir, file), 'utf8'));
      for (const key of Object.keys(data.classifications || {})) {
        const [slug, idxStr] = key.split('#');
        const idx = Number(idxStr);
        if (!slugs.has(slug)) {
          warnings.push(`${file}: 引用不存在的简报 "${slug}"`);
        } else {
          const b = briefings.find((x) => x.slug === slug);
          if (!b?.highlights.find((h) => h.index === idx)) {
            warnings.push(`${file}: 引用不存在的 highlight ${key}`);
          }
        }
      }
    } catch (e: any) {
      errors.push(`${file}: JSON 解析失败：${e.message}`);
    }
  }
}

console.log(`\n检查结果：${briefings.length} 期简报`);
console.log(`  errors:   ${errors.length}`);
console.log(`  warnings: ${warnings.length}`);
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.slice(0, 20).forEach((w) => console.log('  ⚠ ' + w));
}
if (errors.length) {
  console.log('\nErrors:');
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n✓ 内容校验通过');
