const fs=require('fs');
const path=require('path');
module.exports=({test,assert})=>{
  const root=path.resolve(__dirname,'../..');
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const field=name=>html.includes('name="'+name+'"')||html.includes("name='"+name+"'");
  test('[页面契约] 先校验原始电话再清洗',()=>{
    const validate=app.indexOf('validatePhone(raw.phone)');
    const clean=app.indexOf('const data = {...raw}');
    assert(validate>=0&&clean>validate,'页面可能重新出现先清洗后校验的绕过');
  });
  test('[页面契约] 新建客户写入失败会回滚',()=>assert(app.includes('customers = backup')&&app.includes("'新客户已创建并保存'")));
  test('[页面契约] 跟进写入失败会回滚',()=>assert(app.includes('customers = backup')&&app.includes("toast('跟进记录已保存，客户阶段与 KPI 已同步')")));
  test('[页面契约] 成功提示只能出现在保存判断之后',()=>{
    assert(app.indexOf('if (!save())')<app.indexOf("toast(mode === 'edit' ? '客户信息已更新，相关指标已同步' : '新客户已创建并保存')"));
  });
  test('[页面契约] 防止客户重复提交',()=>assert(app.includes('button.disabled')&&app.includes("setSubmitting(button, true, mode === 'edit' ? '保存修改' : '创建客户')")));
  test('[页面契约] 防止跟进重复提交',()=>assert(app.includes('button.disabled')&&app.includes("setSubmitting(button, true, '保存记录')")));
  test('[页面契约] 支持编辑客户闭环',()=>assert(app.includes("openCustomerDialog('edit', customer)")&&app.includes("form.dataset.mode = mode")));
  test('[页面契约] 编辑下一步行动会重置完成态',()=>assert(app.includes('const actionChanged = previous.nextDate !== data.nextDate || previous.nextAction !== data.nextAction')&&app.includes('if (actionChanged) delete customers[index].completedOn')));
  test('[页面契约] KPI可追溯到客户列表',()=>assert(app.includes('data-kpi-filter')&&app.includes("toast('已跳转到指标对应客户列表')")));
  test('[页面契约] 风险行动可点击定位客户',()=>assert(app.includes('data-attention-id')&&app.includes('showCustomer(item.dataset.attentionId')));
  test('[页面契约] 看板渠道统计可容忍坏数据',()=>assert(app.includes("const activityType = activity => String(activity?.type || '')")&&app.includes('activityType(activity).includes(key)')));
  test('[行业字段] 月货量存在',()=>assert(field('monthlyVolume')));
  test('[行业字段] 商机金额存在且非负',()=>assert(field('opportunityValue')&&html.includes('min="0"')));
  test('[行业字段] 报价有效期存在',()=>assert(field('quoteExpiry')));
  test('[行业字段] 账期存在',()=>assert(field('paymentTerm')));
  test('[行业字段] 客户详情展示行业卡片',()=>assert(app.includes('class="freight-card"')));
  test('[审计] 行动完成使用真实当天日期',()=>assert(app.includes('customer.completedOn = TODAY')));
  test('[危险操作] 重置文案明确不可撤销',()=>assert(app.includes('清除且无法撤销')));
  test('[可访问性] 弹窗关闭按钮有可读名称',()=>assert((html.match(/aria-label="关闭"/g)||[]).length>=3));
};
