const logic=require('../../logic');
module.exports=({test,assert,equal})=>{
  test('[回归] 完成得晚不能冒充按时完成',()=>{const q=logic.calculateQuality([{nextDate:'2026-09-01',nextDone:true,completedOn:'2026-09-03',activities:[]}],'2026-09-03');equal(q.completed,1);equal(q.onTimeCompleted,0);equal(q.ontime,0)});
  test('[回归] 一早一晚两个完成任务及时率应为50%',()=>{const q=logic.calculateQuality([{nextDate:'2026-09-01',nextDone:true,completedOn:'2026-09-01',activities:[]},{nextDate:'2026-09-01',nextDone:true,completedOn:'2026-09-02',activities:[]}],'2026-09-03');equal(q.ontime,50)});
  test('[回归] 电话不能混入字母绕过校验',()=>assert(!logic.validatePhone('138abc38000')));
  test('[回归] 国际号码仍然可录入',()=>assert(logic.validatePhone('+1 (415) 555-2671')));
  test('[回归] 大小写不同的英文公司仍算重复',()=>assert(logic.isDuplicateCustomer([{name:'WallTech'}],'walltech')));
  test('[回归] 带HTML标签的同名客户仍算重复',()=>assert(logic.isDuplicateCustomer([{name:'WallTech'}],'<b>WallTech</b>')));
  test('[回归] 报告日期不能写死在八月',()=>equal(logic.buildReportDates('2026-12-15',7).at(-1),'2026-12-15'));
  test('[回归] 月初报告可正确跨月',()=>equal(logic.buildReportDates('2026-10-02',3)[0],'2026-09-30'));
  test('[回归] 损坏存储值回退种子',()=>equal(logic.normalizeCustomers('not-an-array',[{id:9,name:'Seed'}])[0].id,9));
  test('[回归] 存储中null客户不会让页面崩溃',()=>equal(logic.normalizeCustomers([null,{id:1,name:'A'}]).length,1));
  test('[回归] 缺completedOn不能算按时',()=>equal(logic.calculateQuality([{nextDate:'2026-09-01',nextDone:true,activities:[]}],'2026-09-03').ontime,0));
  test('[回归] 空格行动不计入行动计划率',()=>equal(logic.calculateQuality([{nextDate:'2026-09-04',activities:[{next:'   '}]}],'2026-09-03').action,0));
};
