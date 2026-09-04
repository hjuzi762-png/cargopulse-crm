(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CargoPulseLogic=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  const sanitizeText=value=>String(value??'').replace(/<[^>]*>/g,'').replace(/[<>]/g,'').trim();
  const validatePhone=value=>/^[0-9+() -]{7,20}$/.test(String(value??'').trim());
  const isPastDate=(date,today)=>Boolean(date&&today&&date<today);
  const isDuplicateCustomer=(customers,name)=>{
    const target=sanitizeText(name).toLocaleLowerCase();
    return Boolean(target)&&customers.some(c=>sanitizeText(c.name).toLocaleLowerCase()===target);
  };
  const normalizeCustomers=(value,fallback=[])=>{
    if(!Array.isArray(value)||!value.length)return clone(fallback);
    return value.filter(c=>c&&c.id&&sanitizeText(c.name)).map(c=>{const defaults=fallback.find(item=>item&&item.id===c.id)||{};return{...defaults,...c,name:sanitizeText(c.name),activities:Array.isArray(c.activities)?c.activities:[],nextDone:Boolean(c.nextDone)}});
  };
  const buildReportDates=(today,days=7)=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||days<1||days>31)return [];
    return Array.from({length:days},(_,i)=>{const d=new Date(`${today}T00:00:00`);d.setDate(d.getDate()-(days-1)+i);return d.toLocaleDateString('sv-SE')});
  };
  const analyzeFollowup=(content,nextAction='')=>{
    const text=sanitizeText(content);const action=sanitizeText(nextAction)||'建议补充明确的后续行动';
    const need=text.includes('报价')?'客户关注报价与费用方案':text.includes('时效')?'客户关注运输时效与稳定性':'客户需求已完成初步确认';
    const risk=text.includes('预算')||text.includes('暂缓')?'存在预算或推进周期风险':'暂未识别明显风险';
    return{need,risk,action,summary:`${need}；${risk}`};
  };
  const calculateQuality=(customers,today)=>{
    const list=Array.isArray(customers)?customers:[];const activities=list.flatMap(c=>Array.isArray(c.activities)?c.activities:[]);
    const total=activities.length;const covered=list.filter(c=>Array.isArray(c.activities)&&c.activities.length>0).length;
    const planned=activities.filter(a=>sanitizeText(a.next)).length;const due=list.filter(c=>c.nextDate<=today).length;
    const completed=list.filter(c=>c.nextDone&&c.nextDate<=today).length;
    const onTimeCompleted=list.filter(c=>c.nextDone&&c.nextDate<=today&&c.completedOn&&c.completedOn<=c.nextDate).length;
    return{total,covered,planned,due,completed,onTimeCompleted,coverage:list.length?Math.round(covered/list.length*100):0,action:total?Math.round(planned/total*100):0,ontime:due?Math.round(onTimeCompleted/due*100):100};
  };
  const getChannelCounts=activities=>{
    const list=Array.isArray(activities)?activities:[];
    return{phone:list.filter(a=>String(a.type).includes('电话')).length,meeting:list.filter(a=>String(a.type).includes('会议')).length,visit:list.filter(a=>String(a.type).includes('拜访')).length,other:list.filter(a=>!['电话','会议','拜访'].some(k=>String(a.type).includes(k))).length,total:list.length};
  };
  return{sanitizeText,validatePhone,isPastDate,isDuplicateCustomer,normalizeCustomers,buildReportDates,analyzeFollowup,calculateQuality,getChannelCounts};
});
