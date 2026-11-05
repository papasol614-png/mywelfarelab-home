'use strict';
/* 2026 official-threshold pre-screeners, no personal data persistence or transmission. */
const MEDIAN=[0,2564238,4199292,5359036,6494738,7556719,8555952];
const fmt=n=>Number(n).toLocaleString('ko-KR')+'원';
const source={
 basic:[['보건복지부 2026 선정기준','https://www.mohw.go.kr/menu.es?mid=a10708010300']],
 disability:[['2026 장애인연금 선정기준 고시','https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000272272']],
 single:[['성평등가족부 한부모지원','https://www.mogef.go.kr/sp/fam/sp_fam_f007.do'],['경기도 한부모 양육비 지원','https://www.gg.go.kr/contents/contents.do?ciIdx=987102&menuId=266062']],
 youth:[['복지로 청년월세 모의계산','https://www.bokjiro.go.kr/ssis-tbu/twatbz/mkclAsis/SelfDiagnosisYouthHousView.do']],
 work:[['국세청 근로·자녀장려금','https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7783&mi=2449']],
 scholarship:[['교육부 2026 장학금','https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=105272&lev=0&m=0204'],['한국장학재단','https://www.kosaf.go.kr']]
};
const n=(name,label,help='',step=1)=>({name,label,help,type:'number',step,min:0,required:true});
const s=(name,label,options,help='')=>({name,label,options,help,type:'select'});
const options=(a,b)=>Array.from({length:b-a+1},(_,i)=>[String(i+a),(i+a)+'명']);
const spec={
 basic:{title:'기초생활수급자·차상위계층 사전 계산',intro:'2026년 월 소득인정액과 급여별 선정기준을 비교합니다.',description:['생계·의료·주거·교육급여 기준별 비교','차상위계층 소득기준 50% 참고','생계급여 기준액과 소득인정액의 단순 차액 표시'],fields:[s('persons','보장가구 인원',options(1,6)),s('amountMode','계산 방법',[['auto','월소득·재산을 입력해 간이 계산'],['manual','이미 알고 있는 월 소득인정액 사용']]),n('recognized','가구의 월 소득인정액 (원)','월급이 아닌 소득평가액 + 재산의 월 소득환산액입니다. 모르면 복지로 모의계산에서 먼저 확인하세요.')],caveat:'소득인정액을 정확히 알지 못하면 결과가 달라질 수 있습니다. 부채·보험해지환급금·자동차·장애인 특례·부양의무자·의료급여 별도 규정은 이 간편 계산에 자동 반영되지 않습니다.'},
 disability:{title:'장애인연금 자격 사전 계산',intro:'2026년 중증장애인연금 선정기준과 본인·배우자의 월 소득인정액을 비교합니다.',description:['18세 이상 및 중증장애 요건','단독 140만원 · 부부 224만원 기준 비교','지급액 변동 사유 및 공식 확인 경로'],fields:[n('age','현재 나이 (만 나이)','18세 이상을 대상으로 합니다.',1),s('severity','장애인연금법상 중증장애에 해당하나요?',[['yes','예'],['no','아니요'],['unknown','확인 필요']]),s('couple','배우자가 있나요?',[['no','없음 (단독)'],['yes','있음 (부부)']]),n('recognized','본인·배우자 월 소득인정액 (원)','급여 총액이 아닌 장애인연금 기준의 소득인정액입니다.')],caveat:'공적연금, 자동차, 재산, 근로소득 공제와 직역연금 특례 등에 따라 결과가 달라질 수 있습니다. 실제 장애인연금액은 기초급여·부가급여·연령에 따라 달라집니다.'},
 single:{title:'한부모가족 지원 자격 계산',intro:'2026년 한부모·청소년한부모의 소득인정액 선정기준을 비교합니다.',description:['보호자 연령에 따른 65%·72% 기준','가구원 수별 소득인정액 비교','자녀 연령 등 추가 확인사항'],fields:[s('persons','가구 인원',options(2,6)),n('parentAge','양육하는 부모 나이 (만 나이)','만 24세 이하이면 청소년한부모 기준을 함께 확인합니다.',1),n('childAge','가장 어린 자녀 나이 (만 나이)','양육비 지원은 자녀 연령 및 재학 여부에 따라 다릅니다.',1),s('amountMode','계산 방법',[['auto','월소득·재산을 입력해 간이 계산'],['manual','이미 알고 있는 월 소득인정액 사용']]),n('recognized','가구 월 소득인정액 (원)','월급 합계가 아닙니다. 소득·재산 환산액을 포함한 심사금액을 입력하세요.')],caveat:'한부모 증명서·아동양육비의 세부 조건이 다를 수 있습니다. 가족관계·자녀 학적·혼인 여부 및 지역 사업은 별도로 확인합니다.'},
 youth:{title:'청년월세지원 사전 계산',intro:'2026년 중앙정부 청년월세 사업의 연령·주거·소득·재산 요건을 비교합니다.',description:['19~34세, 부모 별도거주 및 무주택 여부','청년가구 60%·원가구 100% 소득기준','월 최대 20만원 범위 내 실제 월세 비교'],fields:[n('birthYear','출생연도 (예: 2001)','2026년 신청 기준: 1991~2007년생.',1),s('independent','부모와 별도 거주하나요?',[['yes','예'],['no','아니요']]),s('homeless','본인 명의 주택이 없나요?',[['yes','예'],['no','아니요']]),s('publicLease','공공임대주택에 거주하나요?',[['no','아니요'],['yes','예']]),s('exempt','원가구 심사 제외 대상인가요?',[['no','아니요 / 잘 모르겠음'],['yes','예 (30세 이상·혼인 등)']]),s('youngPersons','청년가구 인원',options(1,6)),n('youngIncome','청년가구 월 소득평가액 (원)','공식 기준에 따라 근로·사업소득 공제 적용 후 금액'),n('youngProperty','청년가구 재산평가액 (원)','공식 인정 부채만 차감한 재산 평가액'),s('originPersons','원가구 인원',options(1,6)),n('originIncome','원가구 월 소득평가액 (원)','원가구 심사 면제면 0을 입력해도 됩니다.'),n('originProperty','원가구 재산평가액 (원)','원가구 심사 면제면 0을 입력해도 됩니다.'),n('rent','매달 실제 납부하는 월세 (원)','관리비와 보증금 제외')],caveat:'2026년 신규 신청기간은 3월 30일~5월 29일로 이미 종료됐습니다. 공고별 예외·전대차·기존 수혜·2촌 이내 임대차 등 제외조건은 별도 확인해야 합니다.'},
 work:{title:'근로·자녀장려금 자격 계산',intro:'2026년 신청에 적용된 2025년 소득과 재산 기준으로 사전 점검합니다.',description:['단독·홑벌이·맞벌이 소득 기준 비교','가구원 재산 2억4천만원 미만 여부','자녀장려금 소득기준 및 재산 50% 감액 구간'],fields:[s('household','가구 유형',[['single','단독'],['one','홑벌이'],['both','맞벌이']]),n('income','2025년 부부합산 연간 총소득 (원)','월급×12와 다를 수 있습니다. 사업·이자·연금 등 총소득 요건 기준.'),n('property','2025년 6월 1일 기준 가구원 재산 합계 (원)','주택·전세금·자동차·예금 등을 합산하며 부채는 차감하지 않습니다.'),n('children','18세 미만 부양자녀 수 (명)','자녀장려금은 자녀별 부양 요건도 충족해야 합니다.',1),s('hasEarned','2025년에 근로·사업·종교인 소득이 있었나요?',[['yes','예'],['no','아니요']])],caveat:'2026년 세법개정안의 장래 확대 수치를 확정 법령처럼 적용하지 않았습니다. 지급액은 총급여액 등, 사업 업종별 조정률, 감액·체납 등에 따라 달라집니다.'},
 scholarship:{title:'국가장학금 I유형 지원액 계산',intro:'2026년 학자금 지원구간별 등록금 지원 상한액을 조회합니다.',description:['기초·차상위 또는 1~10구간별 연간 지원 상한','실제 등록금보다 많이 지급하지 않는 구조','학적·성적·학자금 신청 요건 별도 확인'],fields:[s('segment','2026년 한국장학재단 학자금 지원구간',[['basic','기초·차상위'],...Array.from({length:10},(_,i)=>[String(i+1),(i+1)+'구간'])]),n('tuition','연간 등록금 총액 (원)','학기별 비용을 합한 등록금이며, 실제 지급은 학기별 상한·중복지원 등에 따라 다릅니다.')],caveat:'2027년부터 지원구간 체계가 개편 예정이므로 2026년 구간 결과를 2027년 판정에 사용하지 마세요. 이 계산기는 I유형 기본 지원단가만 비교하며 다자녀·지역인재·성적·학적 조건은 별도입니다.'}
};

// 간이 소득인정액 계산 입력: 주거용재산 한도, 금융재산 생활준비금,
// 인정 부채, 차상위 및 의료급여 별도 특례는 개별 심사로 확정합니다.
const assetFields=[
 s('region','거주지역',[['seoul','서울'],['gyeonggi','경기'],['metro','광역시·세종·창원'],['other','그 외 지역']]),
 s('workerType','근로소득 공제',[['regular','일반 30%'],['disabled','등록장애인 등: 20만원 공제 후 30%'],['young','34세 이하 청년: 60만원 공제 후 30%'],['special','기타 특례 / 공제액 확인 필요']]),
 n('earned','월 근로·사업소득 (원)','가구의 월 근로·사업소득 합계. 특례 대상자가 여러 명이면 간이 추정치가 부정확할 수 있습니다.',1),
 n('otherIncome','월 연금·기타 소득 (원)','공적연금·사업외 소득 등 심사에 산입되는 금액을 입력하세요.',1),
 n('homeAsset','임대보증금·주거용재산 (원)','임대보증금은 심사 시 인정 비율·지역별 주거용재산 상한이 다를 수 있습니다.',1),
 n('generalAsset','기타 일반재산 (원)','토지·건물 등 일반재산 가액',1),
 n('financialAsset','예금·보험 해지환급금 등 금융재산 (원)','예금·적금·보험 해지환급금 합계. 개별 공제는 반영되지 않을 수 있습니다.',1),
 n('debts','인정 가능한 부채 (원)','담당 기관에서 인정되는 부채에 한합니다.',1),
 s('carType','자동차 처리 방식',[['none','자동차 없음 또는 재산에서 제외 확인'],['normal','일반재산 환산 대상 자동차'],['full','월 100% 환산 자동차'],['unknown','자동차 특례 미확인']]),
 n('carValue','자동차 재산가액 (원)','명의·차종·배기량·생업용·장애인사용 여부에 따라 계산 방식이 달라집니다.',1)
];
const REGIONAL_BASE={seoul:99000000,gyeonggi:80000000,metro:77000000,other:53000000};
function incomeEstimate(v){
 const earned=Number(v.earned||0),other=Number(v.otherIncome||0);
 let deductible=earned*.30;
 if(v.workerType==='disabled')deductible=Math.min(earned,200000)+Math.max(0,earned-200000)*.30;
 if(v.workerType==='young')deductible=Math.min(earned,600000)+Math.max(0,earned-600000)*.30;
 const income=Math.max(0,earned-deductible+other);
 const rawHome=Number(v.homeAsset||0),rawGeneral=Number(v.generalAsset||0);
 const rawFin=Number(v.financialAsset||0);
 const debt=Number(v.debts||0),car=Number(v.carValue||0);
 let allowance=REGIONAL_BASE[v.region]||53000000;
 // 기본재산액은 주거용 → 일반 → 금융 순으로 공제.
 let housing=Math.max(0,rawHome-allowance);allowance=Math.max(0,allowance-rawHome);
 let general=Math.max(0,rawGeneral-allowance);allowance=Math.max(0,allowance-rawGeneral);
 let finance=Math.max(0,rawFin-allowance);
 // 인정 부채를 같은 순서로 단순 차감하는 간이 계산. 법정 우선순위와 다를 수 있습니다.
 let leftDebt=debt;
 const subtractDebt=(amount)=>{const deduct=Math.min(amount,leftDebt);leftDebt-=deduct;return amount-deduct};
 housing=subtractDebt(housing);general=subtractDebt(general);finance=subtractDebt(finance);
 let ordinaryCar=0,fullCar=0;
 if(v.carType==='normal')ordinaryCar=car;
 if(v.carType==='full')fullCar=car;
 const property=housing*.0104+(general+ordinaryCar)*.0417+finance*.0626+fullCar;
 return {income:Math.round(income),property:Math.round(property),total:Math.round(income+property),unresolved:v.workerType==='special'||v.carType==='unknown',unusedDebt:leftDebt};
}

const el=document.querySelector('#calculator-form'),head=document.querySelector('#calc-heading'),explain=document.querySelector('#calc-explainer'),result=document.querySelector('#calculator-result');
const esc=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let chosen='basic';
function buildField(f){
 const help=f.help?'<small>'+esc(f.help)+'</small>':'';
 let control;
 if(f.type==='select')control='<select required name="'+esc(f.name)+'">'+f.options.map(p=>'<option value="'+esc(p[0])+'">'+esc(p[1])+'</option>').join('')+'</select>';
 else control='<input required type="number" inputmode="numeric" name="'+esc(f.name)+'" min="0" step="'+(f.step||1)+'" placeholder="0">';
 return '<label class="calc-field">'+esc(f.label)+control+help+'</label>';
}
function select(key){
 chosen=key;const x=spec[key];document.querySelectorAll('.calc-tab').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===key)));
 head.innerHTML='<h2>'+esc(x.title)+'</h2><p class="subtitle">'+esc(x.intro)+'</p>';
 el.innerHTML='<div class="calc-fields">'+x.fields.map(buildField).join('')+'</div>'+(key==='basic'||key==='single'?'<div class="asset-inputs"><h3>내 소득·재산으로 간이 소득인정액 계산하기</h3><p>입력값은 저장하지 않습니다. 금액이 없다면 0을 입력하세요.</p><div class="calc-fields">'+assetFields.map(buildField).join('')+'</div></div>':'')+'<button class="calc-action" type="submit">2026년 기준으로 결과 확인 →</button>'; 
 if(key==='basic'||key==='single'){el.querySelectorAll('.asset-inputs input').forEach(input=>input.value='0');updateMode();}
 explain.innerHTML='<ul>'+x.description.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p class="calc-private">공식 자격 확정이나 정부 신청을 대신하지 않습니다.</p>';
 result.hidden=true;
 history.replaceState(null,'','#'+key);
}
function updateMode(){const mode=el.querySelector('[name=amountMode]')?.value||'manual';const auto=mode==='auto';const fields=el.querySelector('.asset-inputs');if(fields){fields.hidden=!auto;fields.querySelectorAll('input,select').forEach(node=>node.disabled=!auto);}const recognized=el.querySelector('[name=recognized]');if(recognized){recognized.closest('label').hidden=auto;recognized.disabled=auto;if(!auto&&recognized.value==='')recognized.value='0';}}
el.addEventListener('change',e=>{if(e.target.name==='amountMode')updateMode()});
const row=(name,value,status='')=>'<tr><td>'+esc(name)+'</td><td class="'+status+'">'+esc(value)+'</td></tr>';
const table=rows=>'<table class="calc-table"><thead><tr><th>확인 항목</th><th>결과</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
const yes=(b)=>b?'기준 이내 — 추가 심사 필요':'기준 초과 또는 요건 불충족';
function calc(key,v){
 const warn=[],rows=[],note=[];
 if((key==='basic'||key==='single')&&v.amountMode==='auto'){
  const estimate=incomeEstimate(v);v={...v,recognized:String(estimate.total)};
  rows.push(row('간이 소득평가액',fmt(estimate.income)));
  rows.push(row('간이 재산 월 소득환산액',fmt(estimate.property)));
  rows.push(row('간이 월 소득인정액 합계',fmt(estimate.total)));
  note.push('이 금액은 간이 추정치입니다. 주거용재산 한도·임대보증금 평가·금융 생활준비금·공제 항목·부채 차감 순서 및 자동차 특례 등의 정확한 심사가 필요합니다. 실제 소득인정액과 다를 수 있습니다.');
  if(estimate.unresolved)note.push('선택한 소득공제 또는 자동차의 특례 기준이 미확인 상태입니다. 계산값을 수급 가능성 판정에 사용하지 마세요.');
 }

 if(key==='basic'){
   const h=+v.persons,a=+v.recognized,m=MEDIAN[h];
   for(const [name,p] of [['생계급여',.32],['의료급여',.4],['주거급여',.48],['교육급여',.5]]){
      const limit=Math.round(m*p);rows.push(row(name+' (월 '+fmt(limit)+')',yes(a<=limit),a<=limit?'tag-ok':'tag-no'));
   }
   const living=Math.max(0,Math.round(m*.32)-a);
   rows.push(row('생계급여 기준액과의 단순 차액',fmt(living)+' /월 (실제 지급액 아님)'));
   rows.push(row('차상위 소득기준 50% 참고',yes(a<=Math.round(m*.5)),a<=Math.round(m*.5)?'tag-ok':'tag-no'));
   note.push('단순 차액은 생계급여 지급액이 아닙니다. 각종 공제·급여별 특례·가구 심사가 달라질 수 있습니다.');
 }else if(key==='disability'){
   const threshold=v.couple==='yes'?2240000:1400000; const ok=+v.age>=18&&v.severity==='yes'&&+v.recognized<=threshold;
   rows.push(row('2026년 선정기준',fmt(threshold)+' /월'));
   rows.push(row('연령 18세 이상',yes(+v.age>=18),+v.age>=18?'tag-ok':'tag-no'));
   rows.push(row('중증장애 등록 요건',v.severity==='unknown'?'확인 필요':yes(v.severity==='yes'),v.severity==='yes'?'tag-ok':'tag-check'));
   rows.push(row('소득인정액',yes(+v.recognized<=threshold),+v.recognized<=threshold?'tag-ok':'tag-no'));
   rows.push(row('종합 사전 점검',ok?'주요 조건 충족 가능':'추가 확인 또는 기준 불충족',ok?'tag-ok':'tag-check'));
   note.push('2026년 월 기초급여 최고 349,700원이며 실제 수급액·부가급여는 별도 심사 결과에 따릅니다.');
 }else if(key==='single'){
   const median=MEDIAN[+v.persons],youth=+v.parentAge<=24,cert= Math.round(median*(youth?.72:.65)),benefit=Math.round(median*.65);
   rows.push(row('한부모 증명서 소득기준',fmt(cert)+' /월'));
   rows.push(row('양육비 등 복지급여 소득기준',fmt(benefit)+' /월'));
   rows.push(row('증명서 소득기준 비교',yes(+v.recognized<=cert),+v.recognized<=cert?'tag-ok':'tag-no'));
   rows.push(row('복지급여 소득기준 비교',yes(+v.recognized<=benefit),+v.recognized<=benefit?'tag-ok':'tag-no'));
   rows.push(row('자녀 연령 참고',+v.childAge<18?'기본 연령요건 가능':'재학·급여 종류별 추가 확인'));
   note.push('일반 한부모 아동양육비의 2026년 기본 지원액은 자녀 1명당 월 23만원이나, 실제 지급은 급여 종류 및 자녀 요건에 따릅니다.');
 }else if(key==='youth'){
   const ageok=+v.birthYear>=1991&&+v.birthYear<=2007, home=v.homeless==='yes'&&v.independent==='yes'&&v.publicLease==='no';
   const incomeOk=+v.youngIncome<=Math.round(MEDIAN[+v.youngPersons]*.6);
   const propOk=+v.youngProperty<=122000000;const origOk=v.exempt==='yes'||(+v.originIncome<=MEDIAN[+v.originPersons]&&+v.originProperty<=470000000);
   rows.push(row('2026년 출생연도 1991~2007년',yes(ageok),ageok?'tag-ok':'tag-no'));
   rows.push(row('별도 거주·무주택·공공임대 제외',yes(home),home?'tag-ok':'tag-no'));
   rows.push(row('청년가구 60% 소득기준',yes(incomeOk),incomeOk?'tag-ok':'tag-no'));
   rows.push(row('청년가구 재산 1.22억원 이내',yes(propOk),propOk?'tag-ok':'tag-no'));
   rows.push(row('원가구 소득·재산',v.exempt==='yes'?'심사 면제 해당 여부 공식 확인':yes(origOk),origOk?'tag-ok':'tag-no'));
   rows.push(row('실제 월세 기준 지원상한',fmt(Math.min(+v.rent,200000))+' /월'));
   note.push('2026년 신규 신청기간은 종료됐습니다. 위 결과는 2026년 공고에 대한 가상 사전 점검이며 현재 신청 가능하다는 뜻이 아닙니다.');
 }else if(key==='work'){
   const limits={single:22000000,one:32000000,both:44000000},max={single:1650000,one:2850000,both:3300000};
   const income=+v.income,asset=+v.property,eligible=v.hasEarned==='yes'&&income<limits[v.household]&&asset<240000000;
   rows.push(row('근로장려금 2026 소득기준',fmt(limits[v.household])+' 미만'));
   rows.push(row('근로장려금 소득·재산 요건',yes(eligible),eligible?'tag-ok':'tag-no'));
   rows.push(row('근로장려금 최고액 (실제액 아님)',fmt(max[v.household])));
   const child=v.household!=='single'&&+v.children>0&&income<70000000&&asset<240000000&&v.hasEarned==='yes';
   rows.push(row('자녀장려금 주요 조건',+v.children===0?'부양자녀 없음':yes(child),child?'tag-ok':'tag-check'));
   rows.push(row('자녀장려금 자녀별 최고액',child?fmt(1000000)+' × '+v.children+'명 (상한 참고)':'해당 조건 추가 확인'));
   rows.push(row('재산 1.7억~2.4억',asset>=170000000&&asset<240000000?'장려금 산정액 50% 적용':'해당 없음'));
   note.push('총소득 기준으로 자격만 확인했습니다. 실제 장려금은 총급여액 등 산정표에 따라 달라집니다. 세법개정안 확대 기준은 적용하지 않았습니다.');
 }else if(key==='scholarship'){
   const seg=v.segment;const amount=seg==='basic'?Infinity:[0,6000000,6000000,6000000,4400000,4400000,4400000,3600000,3600000,1000000,0][+seg];
   rows.push(row('2026년 지원구간',seg==='basic'?'기초·차상위':seg+'구간'));
   rows.push(row('국가장학금 I유형 연간 상한',amount===Infinity?'등록금 전액':fmt(amount)));
   rows.push(row('입력 등록금 기준 예상 상한',fmt(Math.min(amount,+v.tuition))+' (상한 참고)'));
   note.push('실제 국가장학금 지급액은 학기별 신청·성적·중복지원·학교 및 개인 자격 심사에 따라 달라집니다.');
 }
 return {rows,note};
}
function render(key,v){
 const x=spec[key],r=calc(key,v),links=(source[key]||[]).map(([name,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(name)+' ↗</a>').join('');
 result.innerHTML='<div class="result-hero"><strong>'+esc(x.title)+' 결과</strong><span>2026년 공식 기준으로 입력한 값을 비교했습니다. 이 결과는 확정 판정이 아닙니다.</span></div>'+table(r.rows)+r.note.map(t=>'<p class="result-note">⚠ '+esc(t)+'</p>').join('')+'<h3>반드시 알아두세요</h3><p>'+esc(x.caveat)+'</p><div class="source-links">'+links+'</div><button type="button" class="calc-action" id="calcAgain">다른 조건으로 다시 확인하기</button>';
 result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});
}
el.addEventListener('submit',e=>{e.preventDefault();const raw=new FormData(el);const values=Object.fromEntries(raw.entries());for(const f of [...spec[chosen].fields,...((chosen==='basic'||chosen==='single')&&values.amountMode==='auto'?assetFields:[])]){if(f.type==='number'&&!(f.name==='recognized'&&values.amountMode==='auto')){const value=Number(values[f.name]);if(!Number.isFinite(value)||value<0){alert('숫자를 0 이상으로 입력하세요.');return;}}}render(chosen,values);});
document.querySelectorAll('.calc-tab').forEach(b=>b.addEventListener('click',()=>select(b.dataset.id)));
result.addEventListener('click',e=>{if(e.target.id==='calcAgain'){result.hidden=true;el.querySelector('input,select')?.focus();document.querySelector('#calc-heading').scrollIntoView({behavior:'smooth',block:'start'});}});
select(spec[location.hash.substring(1)]?location.hash.substring(1):'basic');
