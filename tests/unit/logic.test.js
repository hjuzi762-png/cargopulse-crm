const logic=require('../../logic');
module.exports=({test,assert,equal})=>{
  const {sanitizeText,validatePhone,isPastDate,isDuplicateCustomer,normalizeCustomers,buildReportDates,analyzeFollowup,calculateQuality,getChannelCounts}=logic;
  [['普通文本','普通文本'],['  前后空格  ','前后空格'],['<b>客户</b>','客户'],['<script>alert(1)</script>','alert(1)'],['',''],[null,''],[undefined,''],[123,'123']]
    .forEach(([input,expected],i)=>test('文本清洗 #'+(i+1),()=>equal(sanitizeText(input),expected)));
  ['13800138000','138 0013 8000','+86 138-0013-8000','(021) 5555 8888','1234567','12345678901234567890']
    .forEach(value=>test('有效电话：'+value,()=>assert(validatePhone(value))));
  ['','123456','123456789012345678901','138A00138000','<13800138000>','☎13800138000']
    .forEach(value=>test('无效电话：'+(value||'空值'),()=>assert(!validatePhone(value))));
  test('昨天属于过去日期',()=>assert(isPastDate('2026-09-02','2026-09-03')));
  test('今天不属于过去日期',()=>assert(!isPastDate('2026-09-03','2026-09-03')));
  test('未来不属于过去日期',()=>assert(!isPastDate('2026-09-04','2026-09-03')));
  test('空日期不误判为过去',()=>assert(!isPastDate('','2026-09-03')));
  const existing=[{name:'瀚海供应链'},{name:'ACME Logistics'}];
  test('完全同名判重',()=>assert(isDuplicateCustomer(existing,'瀚海供应链')));
  test('忽略英文大小写判重',()=>assert(isDuplicateCustomer(existing,'acme logistics')));
  test('忽略首尾空格判重',()=>assert(isDuplicateCustomer(existing,'  瀚海供应链 ')));
  test('不同客户不误判',()=>assert(!isDuplicateCustomer(existing,'瀚海供应')));
  test('空客户名不判重',()=>assert(!isDuplicateCustomer(existing,'  ')));
  test('生成七天报告日期',()=>equal(buildReportDates('2026-09-03'),['2026-08-28','2026-08-29','2026-08-30','2026-08-31','2026-09-01','2026-09-02','2026-09-03']));
  test('跨年生成日期',()=>equal(buildReportDates('2027-01-02',4),['2026-12-30','2026-12-31','2027-01-01','2027-01-02']));
  test('闰年二月生成日期',()=>equal(buildReportDates('2028-03-01',3),['2028-02-28','2028-02-29','2028-03-01']));
  test('非法日期格式返回空',()=>equal(buildReportDates('09/03/2026'),[]));
  test('天数为零返回空',()=>equal(buildReportDates('2026-09-03',0),[]));
  test('天数超过31返回空',()=>equal(buildReportDates('2026-09-03',32),[]));
  test('报价需求识别',()=>assert(analyzeFollowup('客户需要新的报价方案').need.includes('报价')));
  test('时效需求识别',()=>assert(analyzeFollowup('客户关注运输时效').need.includes('时效')));
  test('预算风险识别',()=>assert(analyzeFollowup('客户预算不足').risk.includes('风险')));
  test('暂缓风险识别',()=>assert(analyzeFollowup('项目暂缓推进').risk.includes('风险')));
  test('普通内容无明显风险',()=>assert(analyzeFollowup('客户认可当前方案').risk.includes('暂未')));
  test('保留人工填写行动',()=>equal(analyzeFollowup('沟通完成','明天回访').action,'明天回访'));
  test('空行动给出建议',()=>assert(analyzeFollowup('沟通完成','').action.includes('建议')));
  test('空客户集KPI安全',()=>equal(calculateQuality([], '2026-09-03'),{total:0,covered:0,planned:0,due:0,completed:0,onTimeCompleted:0,coverage:0,action:0,ontime:100}));
  test('覆盖率与行动率计算',()=>{const q=calculateQuality([{nextDate:'2026-09-04',activities:[{next:'回访'},{next:''}]},{nextDate:'2026-09-05',activities:[]}],'2026-09-03');equal([q.coverage,q.action],[50,50])});
  test('到期未完成及时率为0',()=>equal(calculateQuality([{nextDate:'2026-09-03',nextDone:false,activities:[]}],'2026-09-03').ontime,0));
  test('按时完成及时率为100',()=>equal(calculateQuality([{nextDate:'2026-09-03',nextDone:true,completedOn:'2026-09-03',activities:[]}],'2026-09-03').ontime,100));
  test('未来任务不进入到期分母',()=>equal(calculateQuality([{nextDate:'2026-09-04',nextDone:false,activities:[]}],'2026-09-03').ontime,100));
  test('坏activities类型不会崩溃',()=>equal(calculateQuality([{nextDate:'2026-09-04',activities:null}],'2026-09-03').total,0));
  test('沟通渠道分类完整',()=>equal(getChannelCounts([{type:'电话沟通'},{type:'线上会议'},{type:'上门拜访'},{type:'微信沟通'}]),{phone:1,meeting:1,visit:1,other:1,total:4}));
  test('未知渠道归入其他',()=>equal(getChannelCounts([{type:'邮件'},{type:''},{}]).other,3));
  test('非数组渠道输入安全',()=>equal(getChannelCounts(null).total,0));
  test('无存储数据时深拷贝种子',()=>{const seed=[{id:1,name:'A',activities:[]}],value=normalizeCustomers(null,seed);value[0].name='B';equal(seed[0].name,'A')});
  test('过滤缺少id的脏客户',()=>equal(normalizeCustomers([{name:'A'},{id:2,name:'B'}]).length,1));
  test('过滤空名称客户',()=>equal(normalizeCustomers([{id:1,name:'  '},{id:2,name:'B'}]).length,1));
  test('修复缺失活动数组',()=>equal(normalizeCustomers([{id:1,name:'A',activities:'bad'}])[0].activities,[]));
  test('修复nextDone布尔值',()=>equal(normalizeCustomers([{id:1,name:'A',nextDone:0}])[0].nextDone,false));
  test('旧数据自动补齐新增行业字段',()=>equal(normalizeCustomers([{id:1,name:'A'}],[{id:1,name:'Seed',monthlyVolume:'80 TEU'}])[0].monthlyVolume,'80 TEU'));
  test('旧数据已有值优先于迁移默认值',()=>equal(normalizeCustomers([{id:1,name:'A',monthlyVolume:'90 TEU'}],[{id:1,name:'Seed',monthlyVolume:'80 TEU'}])[0].monthlyVolume,'90 TEU'));
};
