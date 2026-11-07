const fs=require('fs'),vm=require('vm'),assert=require('assert');
const dummy=()=>({innerHTML:'',hidden:false,addEventListener(){},querySelectorAll(){return []},querySelector(){return null},focus(){},scrollIntoView(){}});
const nodes={'#calculator-form':dummy(),'#calc-heading':dummy(),'#calc-explainer':dummy(),'#calculator-result':dummy()};
const document={querySelector:s=>nodes[s]||dummy(),querySelectorAll:()=>[]};
const context={document,location:{hash:''},history:{replaceState(){}},console,Number,String,Math,Array,Object,FormData,alert(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('calculator.js','utf8')+'\nthis.testCalc=calc;this.testSpec=spec;this.testIncomeEstimate=incomeEstimate;this.testPensionEstimate=pensionEstimate;this.testRender=render;this.testMoney=formatMoneyInput;',context);
const calc=context.testCalc, spec=context.testSpec;
assert.strictEqual(Object.keys(spec).length,6);
for(const k of Object.keys(spec))assert(calc(k,Object.fromEntries(spec[k].fields.map(f=>[f.name,f.type==='select'?f.options[0][0]:'0']))).rows.length>0,k);
const basic=calc('basic',{persons:'2',recognized:'1300000'});
assert(basic.rows.some(x=>x.includes('생계급여')));
assert(basic.rows.some(x=>x.includes('의료급여 전용 소득공제')));
assert(basic.rows.some(x=>x.includes('소득기준 비교')));
assert(basic.rows.some(x=>x.includes('생계급여')));
assert.strictEqual(spec.basic.fields.length,2);
assert.strictEqual(spec.basic.fields[0].name,'year');
assert.strictEqual(spec.basic.fields[1].name,'persons');
const nextYear=calc('basic',{year:'2027',persons:'2',recognized:'1200000'});
assert(nextYear.rows.some(x=>x.includes('1,433,806')));
assert(nextYear.rows.some(x=>x.includes('2,150,710')));
const disability=calc('disability',{age:'56',severity:'yes',couple:'no',recognized:'1000000'});
assert(disability.rows.some(x=>x.includes('주요 조건 충족 가능')));
const single=calc('single',{persons:'2',parentAge:'40',childAge:'7',recognized:'2000000'});
assert(single.rows.some(x=>x.includes('2,729,540')));
const parent30=calc('single',{persons:'2',familyStatus:'yes',parentAge:'30',childAge:'7',highSchool:'no',additionalCategory:'no',recognized:'1500000'});
assert.strictEqual(parent30.summary.amount,'330,000원');
const parent40=calc('single',{persons:'2',familyStatus:'yes',parentAge:'40',childAge:'4',highSchool:'no',additionalCategory:'yes',recognized:'1500000'});
assert.strictEqual(parent40.summary.amount,'330,000원');
const teenParent=calc('single',{persons:'2',familyStatus:'yes',parentAge:'23',childAge:'1',highSchool:'no',additionalCategory:'no',recognized:'1500000'});
assert.strictEqual(teenParent.summary.amount,'400,000원');
const olderStudent=calc('single',{persons:'2',familyStatus:'yes',parentAge:'40',childAge:'18',highSchool:'yes',additionalCategory:'no',recognized:'1500000'});
assert.strictEqual(olderStudent.summary.amount,'230,000원');
const unverifiedFamily=calc('single',{persons:'2',familyStatus:'unknown',parentAge:'40',childAge:'7',highSchool:'no',additionalCategory:'no',recognized:'1500000'});
assert.strictEqual(unverifiedFamily.summary.amount,'금액 산정 보류');

const youth=calc('youth',{birthYear:'2000',independent:'yes',homeless:'yes',publicLease:'no',exempt:'yes',youngPersons:'1',youngIncome:'1000000',youngProperty:'1000000',originPersons:'3',originIncome:'0',originProperty:'0',rent:'250000'});
assert(youth.rows.some(x=>x.includes('200,000')));
const work=calc('work',{household:'one',income:'22000000',property:'180000000',children:'1',hasEarned:'yes'});
assert(work.rows.some(x=>x.includes('50%')));
const scholarship=calc('scholarship',{segment:'1',childOrder:'normal',familyChildren:'no',tuition:'4200000'});
assert(scholarship.rows.some(x=>x.includes('4,200,000')));

const est=context.testIncomeEstimate({region:'gyeonggi',workerType:'disabled',earned:1100000,otherIncome:460000,homeAsset:80000000,generalAsset:0,financialAsset:9000000,debts:25000000,carType:'none',carValue:0});
assert(est.total>=460000 && est.total<1600000,JSON.stringify(est));
const pension=context.testPensionEstimate({pRegion:'metro',workerSelf:1100000,workerSpouse:0,pOtherIncome:460000,pGeneral:80000000,pFinancial:9000000,pDebt:25000000,pLuxury:0});
assert(pension.total===565000,JSON.stringify(pension));
const childScholarship=calc('scholarship',{segment:'9',childOrder:'multi3',tuition:'5000000'});
assert.strictEqual(childScholarship.summary.amount,'금액 산정 보류');
const thirdChildConfirmed=calc('scholarship',{segment:'9',childOrder:'multi3',familyChildren:'yes',tuition:'5000000'});
assert.strictEqual(thirdChildConfirmed.summary.amount,'2,000,000원');
assert(childScholarship.rows.some(x=>x.includes('산정 보류')));
assert(thirdChildConfirmed.rows.some(x=>x.includes('2,000,000')));
const grant=calc('work',{household:'one',income:'22000000',gross:'12000000',property:'180000000',children:'1',hasEarned:'yes'});
assert(grant.rows.some(x=>x.includes('공식 산정표 확인 필요')),grant.rows.join('\\n'));
assert(!grant.rows.some(x=>x.includes('1,425,000')));
assert(calc('basic',{year:'2027',persons:'2',recognized:'1200000'}).summary.status.includes('가능'));
assert(calc('scholarship',{segment:'9',childOrder:'normal',tuition:'3000000'}).summary.amount==='1,000,000원');

// Result-first view must not imply confirmed payment.
context.testRender('basic',{year:'2027',persons:'2',amountMode:'auto',region:'gyeonggi',workerType:'regular',earned:'1000000',otherIncome:'0',homeAsset:'0',generalAsset:'0',financialAsset:'0',debts:'0',carType:'none',carValue:'0'});
assert(nodes['#calculator-result'].innerHTML.includes('대상 가능성'));
assert(nodes['#calculator-result'].innerHTML.includes('2027년 기준 사전 점검'));
assert(nodes['#calculator-result'].innerHTML.includes('왜 이렇게 나왔나요?'));
assert(nodes['#calculator-result'].innerHTML.includes('계산 근거와 세부 기준 자세히 보기'));
assert(nodes['#calculator-result'].innerHTML.includes('실제 지급액')||nodes['#calculator-result'].innerHTML.includes('실제 지급액 아님'));
assert(nodes['#calculator-result'].innerHTML.includes('수급 확정 판정이 아닙니다'));
const money={value:'89600000',selectionStart:8,setSelectionRange(a,b){this.caret=a;}};
context.testMoney(money);
assert.strictEqual(money.value,'89,600,000');
assert.strictEqual(money.caret,money.value.length);

/* Official 2026 basic asset deduction scenario benchmarks:
   MOHW: basic deduction 99m/80m/77m/53m;
   housing cap 172m/151m/146m/112m;
   rental deposit 95%, monthly housing 1.04%, general 4.17%, finance 6.26%.
   These test formula parity, NOT actual Bokjiro individualized screen output.
*/
const estimateAsset=context.testIncomeEstimate;
const core={workerType:'regular',earned:0,otherIncome:0,rentalDeposit:0,homeAsset:0,generalAsset:0,financialAsset:0,longSavingsDeduction:0,debts:0,carType:'none',carValue:0};
function assetCase(overrides){return estimateAsset({...core,...overrides});}
assert.strictEqual(assetCase({region:'gyeonggi',rentalDeposit:80000000}).property,0);
assert.strictEqual(assetCase({region:'gyeonggi',rentalDeposit:100000000}).rentalDepositAssessed,95000000);
assert.strictEqual(assetCase({region:'gyeonggi',rentalDeposit:100000000}).property,156000);
assert.strictEqual(assetCase({region:'seoul',homeAsset:200000000}).property,1926800);
assert.strictEqual(assetCase({region:'gyeonggi',financialAsset:20000000}).property,0);
assert.strictEqual(assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:20000000}).property,939000);
assert.strictEqual(assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:20000000,debts:15000000}).property,0);
assert.strictEqual(assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:20000000,longSavingsDeduction:10000000,longSavingsYears:'2'}).property,313000);
const earnings=assetCase({region:'seoul',earned:1100000,workerType:'disabled'});
assert.strictEqual(earnings.income,630000);
assert.strictEqual(earnings.incomeDeduction,470000);
// 2026 official MOHW revision worked example: 30-year-old earning 1m/month => assessed income 280,000 KRW after 600k + 30% deduction.
const youngAdult=assetCase({region:'seoul',earned:1000000,workerType:'young'});
assert.strictEqual(youngAdult.income,280000);
assert.strictEqual(youngAdult.incomeDeduction,720000);
const approved2026={
 livelihood:[820556,1343773,1714892,2078316,2418150,2737905],
 medical:[1025695,1679717,2143614,2597895,3022688,3422381],
 housing:[1230834,2015660,2572337,3117474,3627225,4106857],
 education:[1282119,2099646,2679518,3247369,3778360,4277976]
};
const approved2027={
 livelihood:[875533,1433806,1829789,2217563,2580166,2921344],
 medical:[1094417,1792258,2287236,2771954,3225208,3651680],
 housing:[1313300,2150710,2744684,3326345,3870249,4382016],
 education:[1368021,2240323,2859046,3464943,4031510,4564601]
};
for (const [year,official] of [['2026',approved2026],['2027',approved2027]]) {
 for(let persons=1;persons<=6;persons++){
  const out=calc('basic',{year,persons:String(persons),recognized:'0'});
  for(const [name,k] of [['생계급여','livelihood'],['의료급여','medical'],['주거급여','housing'],['교육급여','education']]){
   const expected=official[k][persons-1].toLocaleString('ko-KR')+'원';
   assert(out.rows.some(x=>x.includes(name+' 선정기준')&&x.includes(expected)),year+' '+name+' '+persons+' '+expected);
  }
 }
}

// MOHW 2026 long-term savings: yearly 5m, total 15m; no retroactive allowance.
const savingsYear1=assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:25000000,longSavingsDeduction:15000000,longSavingsYears:'1'});
assert.strictEqual(savingsYear1.longSavingsDeduction,5000000);
assert.strictEqual(savingsYear1.unresolved,true);
const savingsYear3=assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:25000000,longSavingsDeduction:15000000,longSavingsYears:'3'});
assert.strictEqual(savingsYear3.longSavingsDeduction,15000000);
assert.strictEqual(savingsYear3.unresolved,false);
const thirdEarner=assetCase({region:'gyeonggi',extraWageEarners:'yes'});
assert.strictEqual(thirdEarner.unresolved,true);


/* Cross-check high-risk deduction and asset classification boundaries. */
const perPerson=assetCase({region:'gyeonggi',earned:1100000,workerType:'disabled',earned2:1000000,workerType2:'young'});
assert.strictEqual(perPerson.income,910000); // 630,000 + 280,000
assert.strictEqual(perPerson.incomeDeduction,1190000);
const rehab=assetCase({region:'gyeonggi',earned:1000000,workerType:'rehab'});
assert.strictEqual(rehab.income,400000);
assert.strictEqual(rehab.incomeDeduction,600000);
const carNormal=assetCase({region:'gyeonggi',carType:'normal',carValue:10000000});
assert.strictEqual(carNormal.property,0); // General-property classified car within basic asset exemption
const carFull=assetCase({region:'gyeonggi',carType:'full',carValue:10000000});
assert.strictEqual(carFull.property,10000000); // 100% type, no general asset deduction
const carMixed=assetCase({region:'gyeonggi',homeAsset:80000000,carType:'normal',carValue:10000000});
assert.strictEqual(carMixed.property,417000);
const unverifiedDebt=assetCase({region:'gyeonggi',homeAsset:100000000,debts:10000000,debtStatus:'unknown'});
assert.strictEqual(unverifiedDebt.unresolved,true);
const confirmedDebt=assetCase({region:'gyeonggi',homeAsset:100000000,debts:10000000,debtStatus:'verified'});
assert.strictEqual(confirmedDebt.unresolved,false);
assert.strictEqual(confirmedDebt.property,104000);
const unknownCars=assetCase({region:'gyeonggi',carType:'unknown',carValue:10000000});
assert.strictEqual(unknownCars.unresolved,true);


/* Official provider 2026 policy parity scenarios for the other five tools. */
const dp=context.testPensionEstimate({pRegion:'metro',workerSelf:1200000,workerSpouse:1000000,pOtherIncome:0,pGeneral:0,pFinancial:0,pDebt:0,pLuxury:0});
assert.strictEqual(dp.income,210000); // (1.2m-950k)*70% + (1m-950k)*70%
assert.strictEqual(dp.total,210000);
const disabilityNo=calc('disability',{age:'17',severity:'yes',couple:'no',recognized:'0'});
assert.strictEqual(disabilityNo.summary.amount,'금액 산정 보류');
const disabilityAbove=calc('disability',{age:'50',severity:'yes',couple:'no',recognized:'1500000'});
assert.strictEqual(disabilityAbove.summary.amount,'금액 산정 보류');
assert(disabilityAbove.summary.status.includes('기준 초과'));
const disabilityUnknown=calc('disability',{age:'50',severity:'unknown',couple:'no',recognized:'500000'});
assert.strictEqual(disabilityUnknown.summary.amount,'금액 산정 보류');
const disabilitySenior=calc('disability',{age:'68',severity:'yes',couple:'no',recognized:'300000'});
assert.strictEqual(disabilitySenior.summary.amount,'금액 산정 보류');

assert(!disabilityNo.summary.status.includes('충족 가능'));
const verified2026Single=calc('single',{persons:'2',familyStatus:'yes',parentAge:'45',childAge:'7',highSchool:'no',additionalCategory:'no',recognized:'2700000'});
assert(verified2026Single.summary.status.includes('해당 가능'));
const rentCap=calc('youth',{birthYear:'2000',independent:'yes',homeless:'yes',publicLease:'no',exempt:'yes',youngPersons:'1',youngIncome:'0',youngProperty:'0',originPersons:'2',originIncome:'0',originProperty:'0',rent:'250000'});
assert.strictEqual(rentCap.summary.amount,'200,000원');
assert(rentCap.summary.status.includes('종료된 2026년 공고'));
assert(rentCap.summary.unit.includes('현재 신청 가능액 아님'));
const workLimit=calc('work',{household:'one',income:'32000000',property:'100000000',children:'1',hasEarned:'yes'});
assert(workLimit.summary.status.includes('불충족'));
const grantHalf=calc('work',{household:'one',income:'20000000',property:'170000000',children:'1',hasEarned:'yes'});
assert(grantHalf.rows.some(x=>x.includes('50%')));
const scholarshipNormal=calc('scholarship',{segment:'1',childOrder:'normal',familyChildren:'no',tuition:'8000000'});
assert.strictEqual(scholarshipNormal.summary.amount,'6,000,000원');
const scholarshipMulti12=calc('scholarship',{segment:'1',childOrder:'multi12',familyChildren:'yes',tuition:'8000000'});
assert.strictEqual(scholarshipMulti12.summary.amount,'6,100,000원');
const scholarshipMulti3=calc('scholarship',{segment:'8',childOrder:'multi3',familyChildren:'yes',tuition:'5000000'});
assert.strictEqual(scholarshipMulti3.summary.amount,'5,000,000원');

console.log('Six calculators, 2026-2027 official thresholds, 2026 deductions, scholarship, pension, one-parent, rent and tax criteria validated.');
