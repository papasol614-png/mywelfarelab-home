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
const youth=calc('youth',{birthYear:'2000',independent:'yes',homeless:'yes',publicLease:'no',exempt:'yes',youngPersons:'1',youngIncome:'1000000',youngProperty:'1000000',originPersons:'3',originIncome:'0',originProperty:'0',rent:'250000'});
assert(youth.rows.some(x=>x.includes('200,000')));
const work=calc('work',{household:'one',income:'22000000',property:'180000000',children:'1',hasEarned:'yes'});
assert(work.rows.some(x=>x.includes('50%')));
const scholarship=calc('scholarship',{segment:'1',tuition:'4200000'});
assert(scholarship.rows.some(x=>x.includes('4,200,000')));

const est=context.testIncomeEstimate({region:'gyeonggi',workerType:'disabled',earned:1100000,otherIncome:460000,homeAsset:80000000,generalAsset:0,financialAsset:9000000,debts:25000000,carType:'none',carValue:0});
assert(est.total>=460000 && est.total<1600000,JSON.stringify(est));
const pension=context.testPensionEstimate({pRegion:'metro',workerSelf:1100000,workerSpouse:0,pOtherIncome:460000,pGeneral:80000000,pFinancial:9000000,pDebt:25000000,pLuxury:0});
assert(pension.total===565000,JSON.stringify(pension));
const childScholarship=calc('scholarship',{segment:'9',childOrder:'multi3',tuition:'5000000'});
assert(childScholarship.rows.some(x=>x.includes('2,000,000')));
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
assert.strictEqual(assetCase({region:'gyeonggi',homeAsset:80000000,financialAsset:20000000,longSavingsDeduction:10000000}).property,313000);
const earnings=assetCase({region:'seoul',earned:1100000,workerType:'disabled'});
assert.strictEqual(earnings.income,630000);
assert.strictEqual(earnings.incomeDeduction,470000);
// 2026 official MOHW revision worked example: 30-year-old earning 1m/month => assessed income 280,000 KRW after 600k + 30% deduction.
const youngAdult=assetCase({region:'seoul',earned:1000000,workerType:'young'});
assert.strictEqual(youngAdult.income,280000);
assert.strictEqual(youngAdult.incomeDeduction,720000);


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

console.log('Six calculators and 2026 asset/income deduction, vehicle and debt uncertainty regressions validated.');
