'use strict';
/* 2026 official-threshold pre-screeners, no personal data persistence or transmission. */
const MEDIAN=[0,2564238,4199292,5359036,6494738,7556719,8555952];
// 2027년 기준 중위소득: 2026-07-28 제80차 중앙생활보장위원회 공식 확정
const MEDIAN_2027=[0,2736042,4480645,5718091,6929885,8063019,9129201];
const fmt=n=>Number(n).toLocaleString('ko-KR')+'원';
const source={
 basic:[['보건복지부 2026 선정기준','https://www.mohw.go.kr/menu.es?mid=a10708010300'],['2027년 확정 기준 보도자료','https://m.korea.kr/briefing/pressReleaseView.do?newsId=156772464'],['복지로 공식 모의계산','https://www.bokjiro.go.kr']],
 disability:[['2026 장애인연금 선정기준 고시','https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000272272']],
 single:[['성평등가족부 한부모지원','https://www.mogef.go.kr/sp/fam/sp_fam_f007.do'],['경기도 한부모 양육비 지원','https://www.gg.go.kr/contents/contents.do?ciIdx=987102&menuId=266062']],
 youth:[['복지로 청년월세 모의계산','https://www.bokjiro.go.kr/ssis-tbu/twatbz/mkclAsis/SelfDiagnosisYouthHousView.do']],
 work:[['국세청 근로·자녀장려금 안내','https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?bbsId=1028&mi=2201&nttSn=1355806'],['홈택스','https://www.hometax.go.kr']],
 scholarship:[['교육부 2026 장학금','https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=105272&lev=0&m=0204'],['한국장학재단','https://www.kosaf.go.kr']]
};
const n=(name,label,help='',step=1)=>({name,label,help,type:'number',step,min:0,required:true});
const s=(name,label,options,help='')=>({name,label,options,help,type:'select'});
const options=(a,b)=>Array.from({length:b-a+1},(_,i)=>[String(i+a),(i+a)+'명']);
const spec={
 basic:{title:'기초생활수급·차상위 자격 사전 계산기',intro:'가구원 수, 소득과 재산을 입력해 간이 소득인정액을 계산하고 2026년 또는 2027년 공식 선정기준과 비교합니다.',description:['월 소득평가액과 재산 소득환산액 간이 계산','생계·의료·주거·교육급여별 선정기준 비교','공제·장애인 특례 등 정밀 심사는 주민센터 확인 필요'],fields:[s('year','기준 연도',[['2026','2026년 (현재 적용)'],['2027','2027년 (공식 확정 · 내년 적용)']]),s('persons','보장가구 인원',options(1,6))],caveat:'이 계산은 2026년 국민기초생활보장 소득인정액 산식을 단순화한 참고용 추정입니다. 가구별 근로소득공제, 주거용 재산 인정한도, 금융재산 공제, 자동차 특례, 보장가구 특성, 의료급여 부양의무자 기준 및 실제 부채 인정 여부는 심사 결과와 다를 수 있습니다. 최종 수급 여부와 지급액은 담당 기관이 결정합니다.'},
 disability:{title:'장애인연금 자격 사전 계산',intro:'2026년 중증장애인연금 선정기준과 본인·배우자의 월 소득인정액을 비교합니다.',description:['18세 이상 및 중증장애 요건','단독 140만원 · 부부 224만원 기준 비교','지급액 변동 사유 및 공식 확인 경로'],fields:[n('age','현재 나이 (만 나이)','18세 이상을 대상으로 합니다.',1),s('severity','장애인연금법상 중증장애에 해당하나요?',[['yes','예'],['no','아니요'],['unknown','확인 필요']]),s('couple','배우자가 있나요?',[['no','없음 (단독)'],['yes','있음 (부부)']]),s('amountMode','계산 방법',[['auto','소득·재산 직접 입력'],['manual','이미 알고 있는 소득인정액 입력']]),n('recognized','본인·배우자 월 소득인정액 (원)','급여 총액이 아닌 장애인연금 기준의 소득인정액입니다.')],caveat:'공적연금, 자동차, 재산, 근로소득 공제와 직역연금 특례 등에 따라 결과가 달라질 수 있습니다. 실제 장애인연금액은 기초급여·부가급여·연령에 따라 달라집니다.'},
 single:{title:'한부모가족 지원 자격 계산',intro:'2026년 한부모·청소년한부모의 소득인정액 선정기준을 비교합니다.',description:['보호자 연령에 따른 65%·72% 기준','가구원 수별 소득인정액 비교','자녀 연령 등 추가 확인사항'],fields:[s('persons','가구 인원',options(2,6)),n('parentAge','양육하는 부모 나이 (만 나이)','만 24세 이하이면 청소년한부모 기준을 함께 확인합니다.',1),n('childAge','가장 어린 자녀 나이 (만 나이)','양육비 지원은 자녀 연령 및 재학 여부에 따라 다릅니다.',1),s('amountMode','계산 방법',[['auto','월소득·재산을 입력해 간이 계산'],['manual','이미 알고 있는 월 소득인정액 사용']]),n('recognized','가구 월 소득인정액 (원)','월급 합계가 아닙니다. 소득·재산 환산액을 포함한 심사금액을 입력하세요.')],caveat:'한부모 증명서·아동양육비의 세부 조건이 다를 수 있습니다. 가족관계·자녀 학적·혼인 여부 및 지역 사업은 별도로 확인합니다.'},
 youth:{title:'청년월세지원 사전 계산',intro:'2026년 중앙정부 청년월세 사업의 연령·주거·소득·재산 요건을 비교합니다.',description:['19~34세, 부모 별도거주 및 무주택 여부','청년가구 60%·원가구 100% 소득기준','월 최대 20만원 범위 내 실제 월세 비교'],fields:[n('birthYear','출생연도 (예: 2001)','2026년 신청 기준: 1991~2007년생.',1),s('independent','부모와 별도 거주하나요?',[['yes','예'],['no','아니요']]),s('homeless','본인 명의 주택이 없나요?',[['yes','예'],['no','아니요']]),s('publicLease','공공임대주택에 거주하나요?',[['no','아니요'],['yes','예']]),s('exempt','원가구 심사 제외 대상인가요?',[['no','아니요 / 잘 모르겠음'],['yes','예 (30세 이상·혼인 등)']]),s('youngPersons','청년가구 인원',options(1,6)),n('youngIncome','청년가구 월 소득평가액 (원)','공식 기준에 따라 근로·사업소득 공제 적용 후 금액'),n('youngProperty','청년가구 재산평가액 (원)','공식 인정 부채만 차감한 재산 평가액'),s('originPersons','원가구 인원',options(1,6)),n('originIncome','원가구 월 소득평가액 (원)','원가구 심사 면제면 0을 입력해도 됩니다.'),n('originProperty','원가구 재산평가액 (원)','원가구 심사 면제면 0을 입력해도 됩니다.'),n('rent','매달 실제 납부하는 월세 (원)','관리비와 보증금 제외')],caveat:'2026년 신규 신청기간은 3월 30일~5월 29일로 이미 종료됐습니다. 공고별 예외·전대차·기존 수혜·2촌 이내 임대차 등 제외조건은 별도 확인해야 합니다.'},
 work:{title:'근로·자녀장려금 자격 계산',intro:'2026년 신청에 적용된 2025년 소득과 재산 기준으로 사전 점검합니다.',description:['단독·홑벌이·맞벌이 소득 기준 비교','가구원 재산 2억4천만원 미만 여부','자녀장려금 소득기준 및 재산 50% 감액 구간'],fields:[s('household','가구 유형',[['single','단독'],['one','홑벌이'],['both','맞벌이']]),n('income','2025년 부부합산 연간 총소득 (원)','월급×12와 다를 수 있습니다. 사업·이자·연금 등 총소득 요건 기준.'),n('property','2025년 6월 1일 기준 가구원 재산 합계 (원)','주택·전세금·자동차·예금 등을 합산하며 부채는 차감하지 않습니다.'),n('children','18세 미만 부양자녀 수 (명)','자녀장려금은 자녀별 부양 요건도 충족해야 합니다.',1),s('hasEarned','2025년에 근로·사업·종교인 소득이 있었나요?',[['yes','예'],['no','아니요']])],caveat:'2026년 세법개정안의 장래 확대 수치를 확정 법령처럼 적용하지 않았습니다. 지급액은 총급여액 등, 사업 업종별 조정률, 감액·체납 등에 따라 달라집니다.'},
 scholarship:{title:'국가장학금 I유형 지원액 계산',intro:'2026년 학자금 지원구간별 등록금 지원 상한액을 조회합니다.',description:['기초·차상위 또는 1~10구간별 연간 지원 상한','실제 등록금보다 많이 지급하지 않는 구조','학적·성적·학자금 신청 요건 별도 확인'],fields:[s('segment','2026년 한국장학재단 학자금 지원구간',[['basic','기초·차상위'],...Array.from({length:10},(_,i)=>[String(i+1),(i+1)+'구간'])]),s('childOrder','장학금 유형',[['normal','국가장학금 I유형'],['multi12','다자녀 첫째·둘째'],['multi3','다자녀 셋째 이상']]),n('tuition','연간 등록금 총액 (원)','학기별 비용을 합한 등록금이며, 실제 지급은 학기별 상한·중복지원 등에 따라 다릅니다.')],caveat:'2027년부터 지원구간 체계가 개편 예정이므로 2026년 구간 결과를 2027년 판정에 사용하지 마세요. 이 계산기는 I유형 및 다자녀 구간별 지원상한을 비교하며 지역인재·성적·학적·중복지원 조건은 별도입니다.'}
};

// 간이 소득인정액 계산 입력: 주거용재산 한도, 금융재산 생활준비금,
// 인정 부채, 차상위 및 의료급여 별도 특례는 개별 심사로 확정합니다.
const assetFields=[
 s('region','거주지역',[['','거주지역 선택'],['seoul','서울'],['gyeonggi','경기'],['metro','광역시·세종·창원'],['other','그 외 지역']]),
 s('workerType','근로소득 공제',[['','공제 유형 선택'],['regular','일반 30%'],['disabled','등록장애인 등: 20만원 공제 후 30%'],['young','34세 이하 청년: 60만원 공제 후 30%'],['special','기타 특례 / 공제액 확인 필요']]),
 n('earned','월 근로·사업소득 (원)','가구의 월 근로·사업소득 합계. 특례 대상자가 여러 명이면 간이 추정치가 부정확할 수 있습니다.',1),
 n('otherIncome','월 연금·기타 소득 (원)','공적연금·사업외 소득 등 심사에 산입되는 금액을 입력하세요.',1),
 n('rentalDeposit','거주 주택 임차보증금 (원)','주거용 임차보증금인 경우 95%를 재산가액으로 평가합니다. 실제 인정 여부는 확인이 필요합니다.',1),
 n('homeAsset','본인 소유 거주주택 재산가액 (원)','직접 거주하는 소유 주택의 조사 기준 가액. 임차보증금과 중복 입력하지 마세요.',1),
 n('generalAsset','기타 일반재산 (원)','토지·건물 등 일반재산 가액',1),
 n('financialAsset','예금·보험 해지환급금 등 금융재산 (원)','예금·적금·보험 해지환급금 합계. 생활준비금 500만원은 자동 공제합니다.',1),
 n('longSavingsDeduction','확인된 장기저축 추가공제액 (원)','장기상품 가입·공제 연차 요건에 따라 인정되는 금액만 입력. 모르면 0을 입력하되 결과는 추가 확인이 필요합니다.',1),
 n('debts','인정 가능한 부채 (원)','담당 기관에서 인정되는 부채에 한합니다.',1),
 s('carType','자동차 처리 방식',[['','자동차 분류 선택'],['none','자동차 없음 또는 재산에서 제외 확인'],['normal','일반재산 환산 대상 자동차'],['full','월 100% 환산 자동차'],['unknown','자동차 특례 미확인']]),
 n('carValue','자동차 재산가액 (원)','명의·차종·배기량·생업용·장애인사용 여부에 따라 계산 방식이 달라집니다.',1)
];

const pensionAssetFields=[
 s('pRegion','재산 공제 지역',[['metro','대도시'],['city','중소도시'],['rural','농어촌']],'주소지 기준 지역 구분'),
 n('workerSelf','본인 월 상시근로소득 (원)','2026년 본인 95만원 기본공제 후 30% 추가공제',1),
 n('workerSpouse','배우자 월 상시근로소득 (원)','배우자에게도 별도로 95만원 기본공제가 적용됩니다.',1),
 n('pOtherIncome','본인·배우자의 기타 월 소득 (원)','공적연금·사업·재산소득 등 실제 반영될 소득 합계',1),
 n('pGeneral','주택·보증금 등 일반재산 (원)','시가표준액 등 실제 조사금액. 보증금 평가액은 별도로 확인',1),
 n('pFinancial','예금·보험 해지환급금 등 금융재산 (원)','가구 금융재산 공제 2천만원 적용',1),
 n('pDebt','인정 가능한 부채 (원)','법에서 인정하는 부채만 입력',1),
 n('pLuxury','고급자동차·회원권 가액 (원)','월 100% 환산 대상일 경우만 입력',1)
];
function pensionEstimate(v){
 const wage=(amount)=>Math.max(0,Number(amount||0)-950000)*.7;
 const income=Math.round(wage(v.workerSelf)+wage(v.workerSpouse)+Number(v.pOtherIncome||0));
 const bases={metro:135000000,city:85000000,rural:72500000};
 const general=Math.max(0,Number(v.pGeneral||0)-(bases[v.pRegion]||0));
 const financial=Math.max(0,Number(v.pFinancial||0)-20000000);
 const assets=Math.max(0,general+financial-Number(v.pDebt||0));
 const property=Math.round(assets*.04/12+Number(v.pLuxury||0));
 return {income,property,total:income+property};
}

const REGIONAL_BASE={seoul:99000000,gyeonggi:80000000,metro:77000000,other:53000000};
const RESIDENTIAL_CAP={seoul:172000000,gyeonggi:151000000,metro:146000000,other:112000000};
function incomeEstimate(v){
 const earned=Number(v.earned||0),other=Number(v.otherIncome||0);
 let deductible=earned*.30;
 if(v.workerType==='disabled')deductible=Math.min(earned,200000)+Math.max(0,earned-200000)*.30;
 if(v.workerType==='young')deductible=Math.min(earned,600000)+Math.max(0,earned-600000)*.30;
 const income=Math.max(0,earned-deductible+other);
 const rawDeposit=Number(v.rentalDeposit||0),depositAssessed=Math.round(rawDeposit*.95);
 const rawHome=Number(v.homeAsset||0)+depositAssessed;
 const cap=RESIDENTIAL_CAP[v.region]||RESIDENTIAL_CAP.other;
 const homeCap=Math.min(rawHome,cap);
 const overflow=Math.max(0,rawHome-cap);
 const rawGeneral=Number(v.generalAsset||0)+overflow;
 const rawFin=Number(v.financialAsset||0);
 // 장기금융저축 공제는 실제 요건과 누적 적용연도를 확인한 금액만 반영.
 const longDeduction=Math.max(0,Math.min(Number(v.longSavingsDeduction||0),15000000,rawFin));
 const financePrepared=Math.max(0,rawFin-5000000-longDeduction);
 const debt=Number(v.debts||0),car=Number(v.carValue||0);
 const base=REGIONAL_BASE[v.region]||REGIONAL_BASE.other;
 let allowance=base;
 let housing=Math.max(0,homeCap-allowance);allowance=Math.max(0,allowance-homeCap);
 let general=Math.max(0,rawGeneral-allowance);allowance=Math.max(0,allowance-rawGeneral);
 let finance=Math.max(0,financePrepared-allowance);
 // 부채는 한도 내 주거용 → 일반 → 금융재산 순으로 간이 차감.
 let leftDebt=debt;
 const subtractDebt=(amount)=>{const deduct=Math.min(amount,leftDebt);leftDebt-=deduct;return amount-deduct;};
 housing=subtractDebt(housing);general=subtractDebt(general);finance=subtractDebt(finance);
 const ordinaryCar=v.carType==='normal'?car:0,fullCar=v.carType==='full'?car:0;
 const property=housing*.0104+(general+ordinaryCar)*.0417+finance*.0626+fullCar;
 return {income:Math.round(income),property:Math.round(property),total:Math.round(income+property),
   baseAllowance:base,residentialCap:cap,rentalDepositAssessed:depositAssessed,
   financialPreparationDeduction:Math.min(rawFin,5000000),longSavingsDeduction:longDeduction,
   incomeDeduction:Math.round(deductible),homeNet:housing,generalNet:general,financeNet:finance,
   unresolved:v.workerType==='special'||v.carType==='unknown',unusedDebt:leftDebt};
}

const el=document.querySelector('#calculator-form'),head=document.querySelector('#calc-heading'),explain=document.querySelector('#calc-explainer'),result=document.querySelector('#calculator-result');
const esc=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let chosen='basic';
function buildField(f){
 const help=f.help?'<small>'+esc(f.help)+'</small>':'';
 let control;
 if(f.type==='select')control='<select required name="'+esc(f.name)+'">'+f.options.map(p=>'<option value="'+esc(p[0])+'">'+esc(p[1])+'</option>').join('')+'</select>';
 else if(f.label.includes('(원)'))control='<input required type="text" inputmode="numeric" data-money="true" name="'+esc(f.name)+'" pattern="[0-9,]+" placeholder="0" autocomplete="off">';
 else control='<input required type="number" inputmode="numeric" name="'+esc(f.name)+'" min="0" step="'+(f.step||1)+'" placeholder="0">';
 return '<label class="calc-field">'+esc(f.label)+control+help+'</label>';
}
function select(key){
 chosen=key;const x=spec[key];document.querySelectorAll('.calc-tab').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===key)));
 head.innerHTML='<h2>'+esc(x.title)+'</h2><p class="subtitle">'+esc(x.intro)+'</p>';
 el.innerHTML='<div class="calc-fields">'+x.fields.map(buildField).join('')+'</div>'+(key==='disability'?'<div class="asset-inputs"><h3>장애인연금 소득인정액 자동 추정</h3><p>기초생활보장과 다른 2026년 장애인연금 기준을 적용합니다.</p><div class="calc-fields">'+pensionAssetFields.map(f=>(f.name==='workerSelf'?'<h3 class="form-section-title">① 월 소득</h3>':f.name==='pGeneral'?'<h3 class="form-section-title">② 재산과 부채</h3>':'')+buildField(f)).join('')+'</div></div>':(key==='basic'||key==='single'?'<div class="asset-inputs"><h3>내 소득·재산으로 간이 소득인정액 계산하기</h3><p>입력값은 저장되지 않습니다. 실제 금액이 없는 항목에만 0을 입력하세요. 모르는 금액을 0으로 가정하지 마세요.</p><div class="calc-fields">'+assetFields.map(f=>(f.name==='earned'?'<h3 class="form-section-title">① 월 소득</h3>':f.name==='homeAsset'?'<h3 class="form-section-title">② 주거·일반·금융재산</h3>':f.name==='debts'?'<h3 class="form-section-title">③ 부채·자동차</h3>':'')+buildField(f)).join('')+'</div></div>':''))+'<button class="calc-action" type="submit">'+(key==='basic'?'내 소득인정액과 수급 기준 계산하기 →':'2026년 기준으로 결과 확인 →')+'</button>'; 
 if(key==='basic'||key==='single'||key==='disability'){if(key!=='basic')updateMode();}
 explain.innerHTML='<ul>'+x.description.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p class="calc-private">공식 자격 확정이나 정부 신청을 대신하지 않습니다.</p>';
 result.hidden=true;
 history.replaceState(null,'','#'+key);
}
function updateMode(){const mode=el.querySelector('[name=amountMode]')?.value||'manual';const auto=mode==='auto';const fields=el.querySelector('.asset-inputs');if(fields){fields.hidden=!auto;fields.querySelectorAll('input,select').forEach(node=>node.disabled=!auto);}const recognized=el.querySelector('[name=recognized]');if(recognized){recognized.closest('label').hidden=auto;recognized.disabled=auto;}}
el.addEventListener('change',e=>{if(e.target.name==='amountMode')updateMode()});

// Format currency fields while retaining the caret near the user's edit position.
function formatMoneyInput(input){
 const before=input.selectionStart??input.value.length;
 const digitsBefore=input.value.slice(0,before).replace(/[^0-9]/g,'').length;
 const digits=input.value.replace(/[^0-9]/g,'');
 const formatted=digits.replace(/\B(?=(\d{3})+(?!\d))/g,',');
 input.value=formatted;
 let caret=0,seen=0;
 while(caret<formatted.length&&seen<digitsBefore){if(/[0-9]/.test(formatted[caret]))seen++;caret++;}
 input.setSelectionRange(caret,caret);
}
el.addEventListener('input',event=>{const input=event.target;if(input.matches?.('input[data-money="true"]'))formatMoneyInput(input);});

const row=(name,value,status='')=>'<tr><td>'+esc(name)+'</td><td class="'+status+'">'+esc(value)+'</td></tr>';
const table=rows=>'<table class="calc-table"><thead><tr><th>확인 항목</th><th>결과</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
const yes=(b)=>b?'기준 이내 — 추가 심사 필요':'기준 초과 또는 요건 불충족';
function calc(key,v){
 const warn=[],rows=[],note=[];let summary={tone:'review',status:'추가 확인 필요',amount:'금액 확인 필요',unit:'',detail:'현재 입력 정보만으로 실제 지급액을 확정할 수 없습니다.',reasons:[]};
 if(key==='disability'&&v.amountMode==='auto'){
  const e=pensionEstimate(v);v={...v,recognized:String(e.total)};
  rows.push(row('장애인연금 월 소득평가액 추정',fmt(e.income)));
  rows.push(row('장애인연금 재산 월 환산액 추정',fmt(e.property)));
  rows.push(row('장애인연금 월 소득인정액 추정',fmt(e.total)));
  note.push('장애인연금법 기준의 간이 추정입니다. 금융기관 조사, 자동차 특례, 부채 인정 여부, 사적이전소득 및 배우자 재산 등은 실제 조사와 차이가 날 수 있습니다.');
 }
 if((key==='basic'||key==='single')&&(key==='basic'||v.amountMode==='auto')){
  const estimate=incomeEstimate(v);v={...v,recognized:String(estimate.total)};
  rows.push(row('근로소득 공제액',fmt(estimate.incomeDeduction)));
  rows.push(row('지역별 기본재산액 공제',fmt(estimate.baseAllowance)));
  rows.push(row('주거용재산 인정 한도',fmt(estimate.residentialCap)));
  rows.push(row('임차보증금 재산평가액(95%)',fmt(estimate.rentalDepositAssessed)));
  rows.push(row('금융재산 생활준비금 공제',fmt(estimate.financialPreparationDeduction)));
  rows.push(row('확인된 장기저축 공제 적용액',fmt(estimate.longSavingsDeduction)));
  rows.push(row('간이 소득평가액',fmt(estimate.income)));
  rows.push(row('간이 재산 월 소득환산액',fmt(estimate.property)));
  rows.push(row('간이 월 소득인정액 합계',fmt(estimate.total)));
  note.push('이 금액은 간이 추정치이며 금융재산 생활준비금 500만원 공제를 반영했습니다. 가구 특례·부채 인정 여부·장기저축 공제요건 및 자동차 특례 등의 정확한 심사가 필요합니다. 실제 소득인정액과 다를 수 있습니다.');
  if(key==='basic'&&v.year==='2027')note.push('2027년 선정기준은 공식 확정 자료이지만, 재산·소득 공제 규정은 현재 확인된 2026년 산식을 사용합니다. 2027년 제도별 세부 공제 규정이 달라질 경우 재계산이 필요합니다.');
  if(estimate.unresolved)note.push('선택한 소득공제 또는 자동차의 특례 기준이 미확인 상태입니다. 계산값을 수급 가능성 판정에 사용하지 마세요.');
 }

 if(key==='basic'){
   const h=Number(v.persons),year=v.year==='2027'?'2027':'2026',m=(year==='2027'?MEDIAN_2027:MEDIAN)[h],a=Number(v.recognized);
   if(!Number.isFinite(a)||!Number.isInteger(h)||h<1||h>=MEDIAN.length)throw Error('입력값을 확인하세요.');
   rows.push(row('기준 연도',year+'년'));
   rows.push(row('가구원 수',h+'명'));
   for(const [name,ratio] of [['생계급여',.32],['의료급여',.40],['주거급여',.48],['교육급여',.50]]){
     const limit=Math.round(m*ratio),matches=a<=limit;
     rows.push(row(name+' 선정기준 ('+(ratio*100)+'%)',fmt(limit)+' /월'));
     if(name==='의료급여') rows.push(row(name+' 소득기준 비교','의료급여 전용 소득공제·부양의무자 기준 확인 필요','tag-check'));
     else rows.push(row(name+' 소득기준 비교',matches?'간이 추정액이 기준 이내':'간이 추정액이 기준 초과',matches?'tag-ok':'tag-no'));
   }
   rows.push(row('차상위계층 소득기준 (50%)',fmt(Math.round(m*.5))+' /월'));
   rows.push(row('차상위계층 소득기준 비교',a<=Math.round(m*.5)?'간이 추정액이 기준 이내':'간이 추정액이 기준 초과'));
   note.push('의료급여는 29~64세 근로·사업소득 공제 등 별도 규칙이 있으므로 이 간이 계산의 판정값을 의료급여 자격으로 사용하면 안 됩니다. 의료급여 부양의무자 등도 별도 심사합니다.');
   note.push('소득인정액은 간이 계산값입니다. 재산 인정·공제·부채·자동차 특례·가구 특성에 따른 조정 전후로 실제 결과가 달라질 수 있습니다. 기준 이내라도 수급이 확정되는 것은 아닙니다.');
   const matched=[['생계급여',.32],['주거급여',.48],['교육급여',.5]].filter(([,p])=>a<=Math.round(m*p)).map(([name])=>name);
   const livingGap=Math.max(0,Math.round(m*.32)-a);
   summary={tone:matched.length?'review':'not',status:matched.length?'선정 소득기준 해당 가능':'입력한 조건에서는 소득기준 초과',amount:matched.length&&livingGap>0?fmt(livingGap):'지급액 확인 필요',unit:livingGap>0?'생계급여 기준액과의 차액 · 월 (실제 지급액 아님)':'정확한 지급액은 기관 심사 후 확인',detail:matched.length?year+'년 간이 소득기준 해당 가능: '+matched.join(' · ')+' (의료급여 별도 확인)':year+'년 생계·주거·교육급여의 간이 소득기준을 초과합니다. 의료급여는 별도 확인이 필요합니다.',reasons:['간이 월 소득인정액: '+fmt(a),'가구원 수: '+h+'명','재산·부채·공제의 실제 인정액은 조사에 따라 변동']};
 }else if(key==='disability'){
   const threshold=v.couple==='yes'?2240000:1400000; const ok=+v.age>=18&&v.severity==='yes'&&+v.recognized<=threshold;
   rows.push(row('2026년 선정기준',fmt(threshold)+' /월'));
   rows.push(row('연령 18세 이상',yes(+v.age>=18),+v.age>=18?'tag-ok':'tag-no'));
   rows.push(row('중증장애 등록 요건',v.severity==='unknown'?'확인 필요':yes(v.severity==='yes'),v.severity==='yes'?'tag-ok':'tag-check'));
   rows.push(row('소득인정액',yes(+v.recognized<=threshold),+v.recognized<=threshold?'tag-ok':'tag-no'));
   rows.push(row('종합 사전 점검',ok?'주요 조건 충족 가능':'추가 확인 또는 기준 불충족',ok?'tag-ok':'tag-check'));
   note.push('2026년 월 기초급여 최고 349,700원이며 실제 수급액·부가급여는 별도 심사 결과에 따릅니다.');
   summary={tone:ok?'review':'not',status:ok?'주요 조건 충족 가능':'연령·장애 정도·소득 중 확인 필요',amount:(+v.age>=18&&+v.age<65&&v.severity==='yes')?'최대 349,700원':'금액 확인 필요',unit:'2026년 기초급여 월 상한 · 개인별 실제액 아님',detail:'65세 이상은 기초급여 대신 기초연금 등 별도 제도를 확인해야 합니다.',reasons:['월 선정기준: '+fmt(threshold),'연령·중증장애 등록·직역연금 특례 별도 확인']};
 }else if(key==='single'){
   const median=MEDIAN[+v.persons],youth=+v.parentAge<=24,cert= Math.round(median*(youth?.72:.65)),benefit=Math.round(median*.65);
   rows.push(row('한부모 증명서 소득기준',fmt(cert)+' /월'));
   rows.push(row('양육비 등 복지급여 소득기준',fmt(benefit)+' /월'));
   rows.push(row('증명서 소득기준 비교',yes(+v.recognized<=cert),+v.recognized<=cert?'tag-ok':'tag-no'));
   rows.push(row('복지급여 소득기준 비교',yes(+v.recognized<=benefit),+v.recognized<=benefit?'tag-ok':'tag-no'));
   rows.push(row('자녀 연령 참고',+v.childAge<18?'기본 연령요건 가능':'재학·급여 종류별 추가 확인'));
   note.push('일반 한부모 아동양육비의 2026년 기본 지원액은 자녀 1명당 월 23만원이나, 실제 지급은 급여 종류 및 자녀 요건에 따릅니다.');
   const within=+v.recognized<=benefit,young=+v.parentAge<=24;
   const monthly=young?(+v.childAge<=1?400000:370000):230000;
   summary={tone:within?'review':'not',status:within?'소득기준 해당 가능':'현재 입력상 소득기준 초과',amount:within&&+v.childAge<18?fmt(monthly):'금액 확인 필요',unit:'자녀 1명당 월 기본지원액 기준 · 확정액 아님',detail:'실제 지원은 자녀 수·연령·재학·중복 지원과 가족관계 심사가 필요합니다.',reasons:['가구 소득기준: '+fmt(benefit),'입력 소득인정액: '+fmt(+v.recognized)]};
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
   const prelim=ageok&&home&&incomeOk&&propOk&&origOk;
   summary={tone:prelim?'review':'not',status:prelim?'주요 요건 해당 가능':'일부 주요 요건 불충족',amount:prelim?fmt(Math.min(+v.rent,200000)):'금액 확인 필요',unit:'월세 지원상한 · 실제 지급액 아님',detail:'신청 기간과 공고별 제외 조건을 반드시 확인해야 합니다.',reasons:['부모 별거·무주택·소득·재산 요건 검토','기존 수혜·중복지원 및 신청 시기 별도 확인']};
 }else if(key==='work'){
   const limits={single:22000000,one:32000000,both:44000000},max={single:1650000,one:2850000,both:3300000};
   const income=+v.income,asset=+v.property,eligible=v.hasEarned==='yes'&&income<limits[v.household]&&asset<240000000;
   rows.push(row('근로장려금 2026 소득기준',fmt(limits[v.household])+' 미만'));
   rows.push(row('근로장려금 소득·재산 요건',yes(eligible),eligible?'tag-ok':'tag-no'));
   rows.push(row('근로장려금 최고액 (실제액 아님)',fmt(max[v.household])));
   rows.push(row('실제 지급액', '국세청 공식 산정표 확인 필요'));
   note.push('기존 단순 보간 예상액은 공식 산정표와 다를 수 있어 공개 결과에서 제외했습니다. 실제 금액은 국세청 홈택스에서 확인하세요.');
   const child=v.household!=='single'&&+v.children>0&&income<70000000&&asset<240000000&&v.hasEarned==='yes';
   rows.push(row('자녀장려금 주요 조건',+v.children===0?'부양자녀 없음':yes(child),child?'tag-ok':'tag-check'));
   rows.push(row('자녀장려금 자녀별 최고액',child?fmt(1000000)+' × '+v.children+'명 (상한 참고)':'해당 조건 추가 확인'));
   rows.push(row('재산 1.7억~2.4억',asset>=170000000&&asset<240000000?'장려금 산정액 50% 적용':'해당 없음'));
   note.push('총소득 기준으로 자격만 확인했습니다. 실제 장려금은 총급여액 등 산정표에 따라 달라집니다. 세법개정안 확대 기준은 적용하지 않았습니다.');
   summary={tone:eligible?'review':'not',status:eligible?'근로장려금 기본 소득·재산 요건 해당 가능':'근로장려금 기본 요건 불충족',amount:eligible?'최대 '+fmt(max[v.household]):'금액 확인 필요',unit:'가구 유형별 법정 최고액 · 실제 예상액 아님',detail:'총급여액 등 공식 산정표 및 추가 요건에 따라 지급액이 달라집니다.',reasons:['총소득: '+fmt(income),'가구 재산: '+fmt(asset),'자녀장려금은 별도 부양자녀 조건 확인']};
 }else if(key==='scholarship'){
   const seg=v.segment;let amount=seg==='basic'?Infinity:[0,6000000,6000000,6000000,4400000,4400000,4400000,3600000,3600000,1000000,0][+seg];
   if(v.childOrder==='multi12')amount=seg==='basic'?Infinity:[0,6100000,6100000,6100000,5050000,5050000,5050000,4650000,4650000,1350000,0][+seg];
   if(v.childOrder==='multi3')amount=seg==='basic'||(Number(seg)>=1&&Number(seg)<=8)?Infinity:(seg==='9'?2000000:0);
   rows.push(row('2026년 지원구간',seg==='basic'?'기초·차상위':seg+'구간'));
   rows.push(row(v.childOrder==='normal'?'국가장학금 I유형 연간 상한':'다자녀 국가장학금 연간 상한',amount===Infinity?'등록금 전액':fmt(amount)));
   rows.push(row('입력 등록금 기준 예상 상한',fmt(Math.min(amount,+v.tuition))+' (상한 참고)'));
   note.push('실제 국가장학금 지급액은 학기별 신청·성적·중복지원·학교 및 개인 자격 심사에 따라 달라집니다.');
   const capped=Math.min(amount,+v.tuition);
   summary={tone:amount===0?'not':'review',status:amount===0?'해당 지원구간 기본 상한 없음':'지원구간별 상한 확인',amount:fmt(capped),unit:'연간 등록금 기준 지원상한 · 실지급액 아님',detail:'한국장학재단의 학자금 지원구간·학적·성적·중복지원 심사를 거쳐 결정됩니다.',reasons:['입력 등록금: '+fmt(+v.tuition),'등록금 범위 내에서만 지원','다자녀 여부에 따라 상한 차이']};
 }
 return {rows,note,summary};
}
function render(key,v){
 const x=spec[key],r=calc(key,v),info=r.summary,year=(key==='basic'&&v.year==='2027')?'2027':'2026';
 const reasons=info.reasons.map(x=>'<li>'+esc(x)+'</li>').join('');
 const links=(source[key]||[]).map(([name,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+' ↗</a>').join('');
 const sectionCards= key==='basic' ? '<div class="outcome-grid">'+['생계급여','의료급여','주거급여','교육급여'].map(name=>{const found=r.rows.find((v,i)=>v.includes(name+' 소득기준 비교'));const medical=name==='의료급여';const hit=found&&found.includes('기준 이내');return '<div class="outcome-mini"><b>'+name+'</b><strong class="'+(medical?'text-review':hit?'text-review':'text-not')+'">'+(medical?'전용 공제·부양의무자 확인 필요':hit?'소득기준 해당 가능':'소득기준 초과')+'</strong><small>추가 심사 필요</small></div>'}).join('')+'</div>' : '';
 result.innerHTML='<div class="outcome-top"><p class="outcome-kicker">내 복지 결과 · '+year+'년 기준 사전 점검</p><h2>'+esc(x.title)+'</h2><div class="outcome-grid outcome-main"><div class="outcome-panel outcome-'+esc(info.tone)+'"><span>대상 가능성</span><strong>'+esc(info.status)+'</strong><small>'+esc(info.detail)+'</small></div><div class="outcome-panel"><span>확인 가능한 금액</span><strong>'+esc(info.amount)+'</strong><small>'+esc(info.unit)+'</small></div></div>'+sectionCards+'</div><section class="outcome-next"><h3>왜 이렇게 나왔나요?</h3><ul>'+reasons+'</ul><p class="result-note">수급 확정 판정이 아닙니다. 제도별 공제·특례·신청시기와 담당기관 심사를 확인해야 합니다.</p></section><section class="outcome-actions"><h3>다음 단계</h3><div class="source-links">'+links+'</div><a class="result-cafe" href="https://cafe.naver.com/mywelfarelab" target="_blank" rel="noopener noreferrer">카페에서 신청·서류 질문하기 ↗</a></section><details class="outcome-details"><summary>계산 근거와 세부 기준 자세히 보기</summary>'+table(r.rows)+r.note.map(t=>'<p class="result-note">⚠ '+esc(t)+'</p>').join('')+'<h3>적용 범위와 주의사항</h3><p>'+esc(x.caveat)+'</p></details><button type="button" class="calc-action" id="calcAgain">입력값 수정해서 다시 계산 →</button>';
 result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});
}
el.addEventListener('submit',e=>{e.preventDefault();const raw=new FormData(el);const values=Object.fromEntries(raw.entries());for(const [name,value] of Object.entries(values)){if(el.elements.namedItem(name)?.matches?.('input[data-money="true"]'))values[name]=String(value).replace(/,/g,'');}for(const f of [...spec[chosen].fields,...((chosen==='basic'||(chosen==='single'&&values.amountMode==='auto'))?assetFields:[]),...(chosen==='disability'&&values.amountMode==='auto'?pensionAssetFields:[])]){if((f.type==='number'||f.type==='select')&&(!values[f.name]&&f.type==='select')){alert('선택하지 않은 항목이 있습니다.');return;}if(f.type==='number'&&!(f.name==='recognized'&&values.amountMode==='auto')){const value=Number(values[f.name]);if(!Number.isFinite(value)||value<0){alert('숫자를 0 이상으로 입력하세요.');return;}}}render(chosen,values);});
document.querySelectorAll('.calc-tab').forEach(b=>b.addEventListener('click',()=>select(b.dataset.id)));
result.addEventListener('click',e=>{if(e.target.id==='calcAgain'){result.hidden=true;el.querySelector('input,select')?.focus();document.querySelector('#calc-heading').scrollIntoView({behavior:'smooth',block:'start'});}});
select(spec[location.hash.substring(1)]?location.hash.substring(1):'basic');
