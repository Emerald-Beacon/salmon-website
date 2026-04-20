#!/usr/bin/env node
/**
 * Generates FAQPage JSON-LD schema for blog posts that don't have it.
 * Uses Claude Haiku to generate 5 relevant Q&A pairs per post.
 * Usage: ANTHROPIC_API_KEY=sk-... node scripts/add-faq-schema.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const DELAY_MS = 500; // rate limit buffer between API calls

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractContent(html) {
  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' | Salmon HVAC', '').trim() : '';

  // Strip scripts, styles, nav, footer, CTA section, schema blocks
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<!-- CTA[\s\S]*/, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Limit to ~3000 chars to keep prompt small
  return { title, body: body.slice(0, 3000) };
}

function buildFaqSchema(faqs) {
  return `
  <!-- FAQPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${faqs.map(faq => `      {
        "@type": "Question",
        "name": ${JSON.stringify(faq.q)},
        "acceptedAnswer": {
          "@type": "Answer",
          "text": ${JSON.stringify(faq.a)}
        }
      }`).join(',\n')}
    ]
  }
  </script>`;
}

async function generateFaqs(title, body) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an SEO expert writing FAQPage schema for an HVAC contractor's blog post.

Article title: "${title}"
Article content (excerpt): ${body}

Generate exactly 5 FAQ question-and-answer pairs that:
- A homeowner in Utah would actually search for
- Are directly answered by the article content
- Are specific (not generic "what is HVAC?" questions)
- Have answers of 2-4 sentences that are accurate and helpful
- Will perform well as Google featured snippets and AI search citations

Return ONLY valid JSON in this exact format, no other text:
[
  {"q": "Question here?", "a": "Answer here."},
  {"q": "Question here?", "a": "Answer here."},
  {"q": "Question here?", "a": "Answer here."},
  {"q": "Question here?", "a": "Answer here."},
  {"q": "Question here?", "a": "Answer here."}
]`
    }]
  });

  const text = msg.content[0].text.trim();
  // Extract JSON array even if there's any surrounding text
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array found in response: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  // Find all blog post index.html files (excluding the blog index itself)
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const posts = entries
    .filter(e => e.isDirectory())
    .map(e => path.join(BLOG_DIR, e.name, 'index.html'))
    .filter(p => fs.existsSync(p));

  // Filter to only posts missing FAQPage schema
  const needsFaq = posts.filter(p => !fs.readFileSync(p, 'utf8').includes('FAQPage'));

  console.log(`Found ${posts.length} total posts, ${needsFaq.length} need FAQ schema.\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < needsFaq.length; i++) {
    const filePath = needsFaq[i];
    const slug = path.basename(path.dirname(filePath));
    process.stdout.write(`[${i + 1}/${needsFaq.length}] ${slug} ... `);

    try {
      const html = fs.readFileSync(filePath, 'utf8');
      const { title, body } = extractContent(html);

      const faqs = await generateFaqs(title, body);
      if (!Array.isArray(faqs) || faqs.length === 0) throw new Error('Empty FAQ array returned');

      const schema = buildFaqSchema(faqs);

      // Inject before </head>
      const updated = html.replace('</head>', `${schema}\n</head>`);
      fs.writeFileSync(filePath, updated, 'utf8');

      console.log(`✓ (${faqs.length} FAQs)`);
      success++;
    } catch (err) {
      console.log(`✗ ERROR: ${err.message}`);
      failed++;
    }

    // Rate limit between calls
    if (i < needsFaq.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
}

main();
