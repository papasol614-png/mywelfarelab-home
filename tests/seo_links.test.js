const fs=require('fs'),path=require('path'),assert=require('assert');
const pages=['index.html','calculator.html','guides.html','help.html','about.html','privacy.html','methodology.html',
'guides/basic-livelihood-2026.html','guides/rental-deposit-assets.html','guides/housing-benefit-2026.html',
'guides/disability-pension-guide.html','guides/single-parent-benefits-2026.html','guides/earned-income-tax-credit.html',
'guides/national-scholarship-2026.html','guides/youth-rent-support-2026.html'];
const guides=pages.filter(p=>p.startsWith('guides/'));let errors=[];
for(const p of pages){
  const html=fs.readFileSync(p,'utf8');
  if(!/<html lang="ko">/.test(html))errors.push(p+': document language missing');
  if(!/<meta name="viewport"/.test(html))errors.push(p+': viewport missing');
  if(!/<title>[^<]+<\/title>/.test(html))errors.push(p+': title missing');
  if((html.match(/<h1\b/g)||[]).length!==1)errors.push(p+': expected exactly one h1');
  if(!/<meta name="description" content="[^"]{20,}"/.test(html))errors.push(p+': descriptive meta missing');
  if(!/<link rel="canonical"/.test(html))errors.push(p+': canonical missing');
  const targetPattern=/\b(?:href|src)="([^"]+)"/g;let m;
  while((m=targetPattern.exec(html))){
    const u=m[1].split(/[?#]/)[0];
    if(!u||u.startsWith('http:')||u.startsWith('https:')||u.startsWith('mailto:')||u.startsWith('tel:')||u.startsWith('data:')||u.startsWith('//'))continue;
    const target=path.normalize(path.join(path.dirname(p),u));
    if(!fs.existsSync(target))errors.push(p+': internal link missing: '+u+' -> '+target);
  }
}
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const xmlUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
for(const p of pages){const publicPath=p==='index.html'?'':p;
 if(!xmlUrls.includes('https://papasol614-png.github.io/mywelfarelab-home/'+publicPath))errors.push(p+': sitemap URL missing');
}
assert(guides.length>=8);
for(const p of guides){
 const s=fs.readFileSync(p,'utf8');
 const sections=(s.match(/<h2>/g)||[]).length;
 if(sections<5)errors.push(p+': insufficient independent explanatory sections');
 if(!s.includes('../calculator.html#'))errors.push(p+': no calculator CTA');
 if(!s.includes('공식 출처'))errors.push(p+': missing official source section');
 if(s.includes('100% 수급 확정'))errors.push(p+': misleading eligibility promise');
}
// Search robots, sitemap, canonical URL and quality checks.
const robots=fs.readFileSync('robots.txt','utf8');
if(!robots.includes('Sitemap: https://papasol614-png.github.io/mywelfarelab-home/sitemap.xml'))errors.push('robots.txt: sitemap missing');
if(/Disallow:\s*\//.test(robots))errors.push('robots.txt: disallows all crawlers');
for(const p of guides){
 const html=fs.readFileSync(p,'utf8');
 const canonical=(html.match(/<link rel="canonical" href="([^"]+)"/)||[])[1];
 const expected='https://papasol614-png.github.io/mywelfarelab-home/'+p;
 if(canonical!==expected)errors.push(p+': canonical mismatch');
 if(!html.includes('dateModified'))errors.push(p+': article structured-data modification date missing');
 if(!html.includes('내 복지 연구소'))errors.push(p+': source identity missing');
 if((html.match(/<a href="[^"]*\.html(?:#[^"]*)?"/g)||[]).length<3)errors.push(p+': too few internal contextual links');
}
for(const p of ['guides/basic-livelihood-2026.html','guides/rental-deposit-assets.html','guides/housing-benefit-2026.html']){
 const html=fs.readFileSync(p,'utf8');
 if(!/<table>/.test(html)||!/<caption>/.test(html))errors.push(p+': evidence comparison table missing');
 if(!/가상|간이/.test(html))errors.push(p+': example assumptions missing');
}
if(errors.length){console.error('SEO validation failed:\n'+errors.join('\n'));process.exit(1)}
console.log('SEO checks passed: '+pages.length+' pages; '+guides.length+' original guides; internal links, canonical metadata, sitemap and official sources.');
