const suites=[require('./unit/logic.test'),require('./integration/ui-contract.test'),require('./badcases/regressions.test')];
let passed=0,failed=0;
const test=(name,fn)=>{try{fn();passed++;console.log('✓',name)}catch(error){failed++;console.error('✗',name,'-',error.message)}};
const assert=(condition,message='断言失败')=>{if(!condition)throw new Error(message)};
const equal=(actual,expected,message='值不相等')=>{const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a!==e)throw new Error(message+': expected '+e+', got '+a)};
suites.forEach(register=>register({test,assert,equal}));
console.log('\n结果：'+passed+' 通过，'+failed+' 失败，共 '+(passed+failed)+' 项');
if(failed)process.exitCode=1;
