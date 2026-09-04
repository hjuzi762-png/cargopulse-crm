const seedCustomers = [
  {id:1,name:'瀚海供应链',short:'瀚海',contact:'陈佳宁',phone:'138 5688 1203',route:'海运整箱 · 上海—洛杉矶',monthlyVolume:'80—100 TEU',opportunityValue:680000,quoteExpiry:'2026-09-15',paymentTerm:'月结45天',status:'方案沟通',level:'重点',nextDate:'2026-09-04',nextAction:'发送华东—洛杉矶年度报价方案',activities:[{type:'线上会议',date:'09月02日 14:30',createdDate:'2026-09-02',content:'客户希望整合上海、宁波两地出口业务，重点关注美西航线舱位稳定性。',next:'整理年度框架报价与舱位保障方案'},{type:'电话沟通',date:'08月29日 10:15',createdDate:'2026-08-29',content:'确认第四季度预计出货量为每月 80—100 TEU。',next:'预约方案评审会议'}]},
  {id:2,name:'启航国际物流',short:'启航',contact:'周宇航',phone:'186 0211 8972',route:'空运 · 上海—法兰克福',monthlyVolume:'28—35 吨',opportunityValue:420000,quoteExpiry:'2026-09-10',paymentTerm:'月结45天',status:'商务谈判',level:'重点',nextDate:'2026-09-03',nextAction:'确认信用账期与服务费率',nextDone:true,completedOn:'2026-09-03',activities:[{type:'上门拜访',date:'09月01日 16:00',createdDate:'2026-09-01',content:'客户认可轨迹可视化方案，希望进一步确认账期和实施周期。',next:'与财务确认 45 天账期'}]},
  {id:3,name:'远达跨境运输',short:'远达',contact:'王思远',phone:'139 1765 4310',route:'跨境小包 · 华东—欧洲',monthlyVolume:'12万票',opportunityValue:360000,quoteExpiry:'2026-09-20',paymentTerm:'月结30天',status:'潜在客户',level:'普通',nextDate:'2026-09-06',nextAction:'首次需求访谈',activities:[{type:'微信沟通',date:'08月31日 11:20',createdDate:'2026-08-31',content:'客户正在评估跨境小包追踪系统，对多承运商轨迹整合感兴趣。',next:'发送访谈提纲'}]},
  {id:4,name:'东澜货运代理',short:'东澜',contact:'刘静',phone:'137 8890 5621',route:'海运拼箱 · 宁波—胡志明',monthlyVolume:'45 CBM',opportunityValue:180000,quoteExpiry:'2026-09-05',paymentTerm:'月结30天',status:'暂缓推进',level:'风险',nextDate:'2026-09-02',nextAction:'确认项目是否重启',activities:[{type:'电话沟通',date:'08月27日 09:40',createdDate:'2026-08-27',content:'客户因内部预算调整暂缓项目，预计九月重新评估。',next:'九月初再次联系'}]},
  {id:5,name:'中欧陆桥物流',short:'陆桥',contact:'赵可',phone:'159 0087 3026',route:'铁路 · 西安—杜伊斯堡',monthlyVolume:'36 柜',opportunityValue:510000,quoteExpiry:'2026-09-18',paymentTerm:'月结60天',status:'需求确认',level:'重点',nextDate:'2026-09-05',nextAction:'演示铁路节点追踪能力',activities:[{type:'邮件沟通',date:'09月01日 13:10',createdDate:'2026-09-01',content:'客户发来现有操作流程，核心诉求是异常节点预警。',next:'准备定制演示环境'}]},
  {id:6,name:'星港航运服务',short:'星港',contact:'沈悦',phone:'135 6401 2289',route:'海运整箱 · 上海—杰贝阿里',monthlyVolume:'50 TEU',opportunityValue:300000,quoteExpiry:'2026-09-22',paymentTerm:'月结45天',status:'潜在客户',level:'普通',nextDate:'2026-09-08',nextAction:'发送产品介绍与案例',activities:[]}
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const {
  sanitizeText: clean,
  validatePhone,
  isPastDate,
  isDuplicateCustomer,
  normalizeCustomers,
  analyzeFollowup,
  calculateQuality
} = CargoPulseLogic;

const TODAY = new Date().toLocaleDateString('sv-SE');
const endDate = new Date(`${TODAY}T00:00:00`);
endDate.setDate(endDate.getDate() + 4);
const PERIOD_END = endDate.toLocaleDateString('sv-SE');

let customers = loadCustomers();
let selectedId = customers[0]?.id;
let activeFilter = 'all';

function loadCustomers() {
  try {
    return normalizeCustomers(JSON.parse(localStorage.getItem('cargopulse-customers') || 'null'), seedCustomers);
  } catch {
    return normalizeCustomers(null, seedCustomers);
  }
}

function save() {
  try {
    localStorage.setItem('cargopulse-customers', JSON.stringify(customers));
    return true;
  } catch {
    toast('保存失败：浏览器存储空间不足，数据未提交');
    return false;
  }
}

function setSubmitting(button, busy, label) {
  button.disabled = busy;
  button.textContent = busy ? '保存中…' : label;
}

function formatDate(date) {
  const d = new Date(`${date}T00:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function switchView(view) {
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  $$('.view').forEach(item => item.classList.toggle('active', item.id === `${view}-view`));
  $('#page-title').textContent = view === 'customers' ? '客户管理' : '团队看板';
  $('.search').classList.toggle('hidden', view === 'dashboard');
  if (view === 'dashboard') renderDashboard();
}

function setFilter(filter) {
  activeFilter = filter;
  $$('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.filter === filter));
  renderList();
}

function showCustomer(id, filter = 'all') {
  selectedId = Number(id);
  switchView('customers');
  setFilter(filter);
  renderDetail();
  document.querySelector(`[data-id="${selectedId}"]`)?.scrollIntoView({block:'center', behavior:'smooth'});
}

function openCustomerDialog(mode, customer) {
  const form = $('#customer-form');
  form.reset();
  form.dataset.mode = mode;
  form.dataset.customerId = customer?.id || '';
  $('#customer-dialog-eyebrow').textContent = mode === 'edit' ? 'EDIT CUSTOMER' : 'NEW CUSTOMER';
  $('#customer-dialog-title').textContent = mode === 'edit' ? '编辑客户' : '新建客户';
  $('#save-customer').textContent = mode === 'edit' ? '保存修改' : '创建客户';

  const values = customer || {
    name: '',
    short: '',
    contact: '',
    phone: '',
    route: '',
    monthlyVolume: '',
    opportunityValue: '',
    quoteExpiry: TODAY,
    paymentTerm: '月结45天',
    status: '潜在客户',
    level: '重点',
    nextDate: TODAY,
    nextAction: '完成首次需求访谈'
  };
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value ?? '';
  });
  $('#customer-dialog').showModal();
}

const rowObserver = new MutationObserver(() => $$('.customer-row').forEach(row => {
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `打开客户 ${row.querySelector('.company strong')?.textContent || ''}`);
  row.onkeydown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      row.click();
    }
  };
}));
rowObserver.observe($('#customer-list'), {childList:true});

function renderList() {
  const q = $('#global-search').value.trim().toLowerCase();
  const filtered = customers.filter(customer => {
    const text = `${customer.name}${customer.contact}${customer.route}`.toLowerCase();
    const pass =
      activeFilter === 'all' ||
      (activeFilter === '重点' && customer.level === '重点') ||
      (activeFilter === '风险' && customer.level === '风险') ||
      (activeFilter === '待跟进' && !customer.nextDone && customer.nextDate <= PERIOD_END);
    return text.includes(q) && pass;
  });

  $('#customer-list').innerHTML = filtered.map(customer => `
    <article class="customer-row ${customer.id === selectedId ? 'selected' : ''}" data-id="${customer.id}">
      <div class="company"><div class="company-logo">${clean(customer.short)}</div><div><strong>${clean(customer.name)}</strong><small>${clean(customer.contact)} · ${clean(customer.phone).slice(-4)}</small></div></div>
      <div class="cell">${clean(customer.route)}</div>
      <div class="cell"><span class="tag ${customer.level === '风险' ? 'risk' : customer.level === '普通' ? 'neutral' : ''}">${clean(customer.status)}</span></div>
      <div class="cell">${customer.nextDone ? '<span class="completed-chip">✓ 已完成</span>' : `<strong>${formatDate(customer.nextDate)}</strong>`}<small>${clean(customer.nextAction)}</small></div>
    </article>
  `).join('');

  $('#empty-state').classList.toggle('hidden', filtered.length > 0);
  $$('.customer-row').forEach(row => row.onclick = () => {
    selectedId = Number(row.dataset.id);
    renderList();
    renderDetail();
  });

  const activityCount = customers.reduce((count, customer) => count + customer.activities.length, 0);
  $('#all-total').textContent = customers.length;
  $('#key-count').textContent = customers.filter(customer => customer.level === '重点').length;
  $('#week-count').textContent = activityCount;
  $('#pending-count').textContent = customers.filter(customer => !customer.nextDone && customer.nextDate <= PERIOD_END).length;
  $('#overdue-count').textContent = customers.filter(customer => !customer.nextDone && customer.nextDate < TODAY).length;
}

function renderDetail() {
  const customer = customers.find(item => item.id === selectedId);
  if (!customer) {
    $('#detail-panel').innerHTML = '';
    return;
  }

  const timeline = customer.activities.length
    ? customer.activities.map(activity => `
      <div class="activity">
        <div class="activity-head"><strong>${clean(activity.type)}${activity.intent ? ' · 意向' + clean(activity.intent) : ''}</strong><span>${clean(activity.date)}</span></div>
        <p>${clean(activity.content)}</p>
        ${activity.summary ? `<div class="next-action"><b>AI 摘要：</b>${clean(activity.summary)}</div>` : ''}
        <div class="next-action"><b>下一步：</b>${clean(activity.next)}</div>
      </div>
    `).join('')
    : '<div class="empty"><strong>还没有跟进记录</strong><p>新增第一条记录，开始沉淀客户信息。</p></div>';
  const actionState = customer.nextDone ? '<span class="completed-chip">✓ 已完成</span>' : `<strong>${formatDate(customer.nextDate)}</strong>`;

  $('#detail-panel').innerHTML = `
    <div class="detail-top">
      <div class="detail-company"><div class="company-logo">${clean(customer.short)}</div><div><h2>${clean(customer.name)}</h2><p>${clean(customer.route)}</p></div></div>
      <div class="detail-actions"><button class="ghost-button" id="edit-customer">编辑</button><span class="level">${clean(customer.level)}客户</span></div>
    </div>
    <div class="freight-card">
      <div><span>预计月货量</span><strong>${clean(customer.monthlyVolume || '待确认')}</strong></div>
      <div><span>商机金额</span><strong>¥ ${Number(customer.opportunityValue || 0).toLocaleString('zh-CN')}</strong></div>
      <div><span>报价有效期</span><strong>${clean(customer.quoteExpiry || '待确认')}</strong></div>
      <div><span>期望账期</span><strong>${clean(customer.paymentTerm || '待确认')}</strong></div>
    </div>
    <div class="contact-card">
      <div><span>联系人</span><strong>${clean(customer.contact)}</strong></div>
      <div><span>联系电话</span><strong>${clean(customer.phone)}</strong></div>
      <div><span>当前阶段</span><strong>${clean(customer.status)}</strong></div>
      <div><span>下次行动</span>${actionState}</div>
    </div>
    <div class="section-title"><h3>跟进时间线</h3><span>${customer.activities.length} 条记录</span></div>
    <div class="timeline">${timeline}</div>
    <button class="primary add-follow" id="open-follow">＋ 新增跟进</button>
    ${customer.nextDone ? '' : `<button class="complete-action" id="complete-action">✓ 标记“${clean(customer.nextAction)}”已完成</button>`}
  `;

  $('#edit-customer').onclick = () => openCustomerDialog('edit', customer);
  $('#open-follow').onclick = () => {
    const form = $('#follow-form');
    form.querySelector('[name=nextDate]').value = customer.nextDate;
    form.querySelector('[name=stage]').value = customer.status;
    $('#ai-result').classList.add('hidden');
    $('#follow-dialog').showModal();
  };
  $('#complete-action')?.addEventListener('click', () => {
    const backup = JSON.parse(JSON.stringify(customers));
    customer.nextDone = true;
    customer.completedOn = TODAY;
    if (!save()) {
      customers = backup;
      renderDetail();
      return;
    }
    renderList();
    renderDetail();
    renderDashboard();
    syncQuality();
    toast('行动已完成并保存，KPI 已更新');
  });
}

function renderDashboard() {
  const all = customers.flatMap(customer => customer.activities);
  const week = Array.from({length:7}, (_, index) => {
    const d = new Date(`${TODAY}T00:00:00`);
    d.setDate(d.getDate() - 6 + index);
    return d.toLocaleDateString('sv-SE');
  });
  const recent = all.filter(activity => week.includes(activity.createdDate || TODAY));
  const counts = week.map(date => recent.filter(activity => (activity.createdDate || TODAY) === date).length);
  const max = Math.max(1, ...counts);

  $('#bar-chart').innerHTML = week.map((date, index) => `<div class="bar-item"><div class="bar" title="${counts[index]} 次" style="height:${Math.max(8, counts[index] / max * 100)}%"></div><span>${date.slice(5).replace('-', '/')} · ${counts[index]}</span></div>`).join('');
  $('#trend-total').textContent = `${recent.length} 次`;
  $('#report-range').textContent = `${week[0].slice(5).replace('-', '.')} — ${week[6].slice(5).replace('-', '.')}`;

  const defs = [['电话','电话','#0573aa'], ['会议','会议','#23b8c5'], ['拜访','拜访','#e9a23b'], ['其他','其他','#7a89a0']];
  const activityType = activity => String(activity?.type || '');
  const raw = defs.map(([label, key, color]) => [
    label,
    key === '其他' ? recent.filter(activity => !['电话','会议','拜访'].some(item => activityType(activity).includes(item))).length : recent.filter(activity => activityType(activity).includes(key)).length,
    color
  ]);
  const total = Math.max(1, recent.length);
  let cursor = 0;
  const stops = [];
  raw.forEach(item => {
    const start = cursor;
    cursor += item[1] / total * 100;
    stops.push(`${item[2]} ${start}% ${cursor}%`);
  });
  $('.donut').style.background = `radial-gradient(circle,#fff 50%,transparent 51%),conic-gradient(${stops.join(',')})`;
  $('.donut strong').textContent = recent.length;
  $('#channel-legend').innerHTML = raw.map(item => `<li><i style="background:${item[2]}"></i>${item[0]} ${Math.round(item[1] / total * 100)}%</li>`).join('');

  const attention = customers.filter(customer => !customer.nextDone && (customer.level === '风险' || customer.nextDate <= TODAY));
  $('#attention-list').innerHTML = attention.length
    ? attention.map(customer => `<button class="attention-item" data-attention-id="${customer.id}"><div><strong>${clean(customer.name)}</strong><small> · ${clean(customer.nextAction)}</small></div><span>${customer.nextDate < TODAY ? '已逾期' : '今天'}</span></button>`).join('')
    : '<div class="empty"><strong>暂无需要关注的行动</strong></div>';
  $$('[data-attention-id]').forEach(item => item.onclick = () => showCustomer(item.dataset.attentionId, '待跟进'));
}

function syncQuality() {
  const quality = calculateQuality(customers, TODAY);
  [['coverage', quality.coverage], ['action', quality.action], ['ontime', quality.ontime]].forEach(([id, value]) => {
    $(`#${id}-value`).textContent = `${value}%`;
    $(`#${id}-progress`).value = value;
  });
  return quality;
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

$('.icon-button').onclick = () => toast('暂无新通知');

const tourSteps = [
  ['从问题出发','销售跟进信息常散落在微信、电话和个人笔记中。CargoPulse 首先把客户、当前阶段和下一步行动放在同一工作区。'],
  ['快速定位客户','搜索与状态筛选帮助销售快速找到重点、待跟进或风险客户；列表直接展示下一步行动，减少遗漏。'],
  ['沉淀客户记忆','客户详情使用时间线保留每次沟通、客户意向和后续承诺，人员交接时也能快速恢复上下文。'],
  ['AI 辅助而非替代','新增跟进中的 AI 会提取需求、风险和行动建议，但必须由销售确认后保存，避免错误信息直接写入客户档案。'],
  ['形成可信 KPI','团队看板不只统计次数，还关注客户覆盖、按时完成和行动计划，并保留从指标回到原始记录的设计空间。']
];
let tourIndex = 0;

function renderTour() {
  const step = tourSteps[tourIndex];
  $('#tour-count').textContent = `${String(tourIndex + 1).padStart(2, '0')} / ${String(tourSteps.length).padStart(2, '0')}`;
  $('#tour-title').textContent = step[0];
  $('#tour-copy').textContent = step[1];
  $('#tour-next').textContent = tourIndex === tourSteps.length - 1 ? '完成导览 ✓' : '下一步 →';
}

$('#start-tour').onclick = () => {
  tourIndex = 0;
  renderTour();
  $('#tour').classList.remove('hidden');
};
$('#tour-close').onclick = () => $('#tour').classList.add('hidden');
$('#tour-next').onclick = () => {
  if (tourIndex === tourSteps.length - 1) {
    $('#tour').classList.add('hidden');
    toast('导览完成，可以开始操作 Demo');
    return;
  }
  tourIndex++;
  renderTour();
};

$('#show-kpi-basis').onclick = () => {
  const k = syncQuality();
  $('#kpi-basis').innerHTML = `
    <button class="kpi-row actionable" data-kpi-filter="待跟进"><strong>按时完成率</strong><span>按计划日期完成 ${k.onTimeCompleted} / 到期 ${k.due}（已完成 ${k.completed}），点击查看待跟进行动</span><strong>${k.ontime}%</strong></button>
    <button class="kpi-row actionable" data-kpi-filter="all"><strong>客户覆盖率</strong><span>有跟进记录客户 ${k.covered} / ${customers.length}，点击查看全部客户并核对空时间线</span><strong>${k.coverage}%</strong></button>
    <button class="kpi-row actionable" data-kpi-filter="all"><strong>行动计划率</strong><span>含下一步行动记录 ${k.planned} / ${k.total}，点击回到客户明细检查跟进记录</span><strong>${k.action}%</strong></button>
  `;
  $$('[data-kpi-filter]').forEach(row => row.onclick = () => {
    $('#kpi-dialog').close();
    switchView('customers');
    setFilter(row.dataset.kpiFilter);
    renderDetail();
    toast('已跳转到指标对应客户列表');
  });
  $('#kpi-dialog').showModal();
};

$$('.nav-item').forEach(button => button.onclick = () => switchView(button.dataset.view));
$$('.tab').forEach(tab => tab.onclick = () => setFilter(tab.dataset.filter));
$('#global-search').oninput = renderList;
$('#add-customer').onclick = () => openCustomerDialog('create');

$('#reset-demo').onclick = () => {
  if (!confirm('恢复初始演示数据？你新增的客户和跟进记录将被清除且无法撤销。')) return;
  const backup = customers;
  customers = JSON.parse(JSON.stringify(seedCustomers));
  selectedId = customers[0].id;
  activeFilter = 'all';
  if (!save()) {
    customers = backup;
    selectedId = customers[0]?.id;
    return;
  }
  renderList();
  renderDetail();
  renderDashboard();
  syncQuality();
  toast('演示数据已恢复');
};

$('#ai-organize').onclick = () => {
  const form = $('#follow-form');
  const content = form.querySelector('[name=content]').value.trim();
  if (content.length < 10) {
    toast('请先输入较完整的沟通内容');
    return;
  }
  const analysis = analyzeFollowup(content, form.querySelector('[name=nextAction]').value);
  const result = $('#ai-result');
  result.innerHTML = `<div><strong>客户需求：</strong>${analysis.need}</div><div><strong>风险识别：</strong>${analysis.risk}</div><div><strong>行动建议：</strong>${analysis.action}</div><div><strong>提示：</strong>保存前请人工确认，AI 不会直接修改客户档案。</div>`;
  result.dataset.summary = analysis.summary;
  result.classList.remove('hidden');
};

$('#save-follow').onclick = event => {
  event.preventDefault();
  const form = $('#follow-form');
  const button = event.currentTarget;
  if (!form.reportValidity() || button.disabled) return;

  const data = new FormData(form);
  if (data.get('content').trim().length < 10) {
    toast('跟进内容至少填写 10 个字符');
    form.querySelector('[name=content]').focus();
    return;
  }
  if (isPastDate(data.get('nextDate'), TODAY) && !confirm('下一步行动日期早于今天，将立即形成逾期任务。仍要保存吗？')) return;

  const backup = JSON.parse(JSON.stringify(customers));
  const customer = customers.find(item => item.id === selectedId);
  const result = $('#ai-result');
  setSubmitting(button, true, '保存记录');
  customer.activities.unshift({
    type: data.get('type'),
    date: '刚刚',
    createdDate: TODAY,
    content: clean(data.get('content').trim()),
    intent: data.get('intent'),
    summary: result.classList.contains('hidden') ? '' : result.dataset.summary,
    next: clean(data.get('nextAction').trim())
  });
  customer.status = data.get('stage');
  customer.nextDate = data.get('nextDate');
  customer.nextAction = clean(data.get('nextAction').trim());
  customer.nextDone = false;
  delete customer.completedOn;

  if (!save()) {
    customers = backup;
    setSubmitting(button, false, '保存记录');
    return;
  }
  renderList();
  renderDetail();
  renderDashboard();
  syncQuality();
  setSubmitting(button, false, '保存记录');
  $('#follow-dialog').close();
  toast('跟进记录已保存，客户阶段与 KPI 已同步');
};

$('#save-customer').onclick = event => {
  event.preventDefault();
  const form = $('#customer-form');
  const button = event.currentTarget;
  const mode = form.dataset.mode || 'create';
  const editingId = Number(form.dataset.customerId);
  if (!form.reportValidity() || button.disabled) return;

  const raw = Object.fromEntries(new FormData(form));
  if (!validatePhone(raw.phone)) {
    toast('电话号码格式不正确');
    form.querySelector('[name=phone]').focus();
    return;
  }

  const data = {...raw};
  Object.keys(data).forEach(key => {
    data[key] = key === 'phone' ? String(data[key]).trim() : clean(data[key]).trim();
  });
  const duplicateScope = mode === 'edit' ? customers.filter(customer => customer.id !== editingId) : customers;
  if (isDuplicateCustomer(duplicateScope, data.name)) {
    toast('已存在同名客户，请先搜索确认');
    form.querySelector('[name=name]').focus();
    return;
  }
  if (isPastDate(data.nextDate, TODAY) && !confirm('行动日期早于今天，保存后将立即形成逾期任务。仍要保存吗？')) return;
  if (isPastDate(data.quoteExpiry, TODAY) && !confirm('报价有效期早于今天，保存后报价将立即失效。仍要保存吗？')) return;

  const backup = JSON.parse(JSON.stringify(customers));
  const backupSelectedId = selectedId;
  setSubmitting(button, true, mode === 'edit' ? '保存修改' : '创建客户');

  if (mode === 'edit') {
    const index = customers.findIndex(customer => customer.id === editingId);
    if (index < 0) {
      setSubmitting(button, false, '保存修改');
      toast('客户不存在，请刷新后重试');
      return;
    }
    const previous = customers[index];
    const actionChanged = previous.nextDate !== data.nextDate || previous.nextAction !== data.nextAction;
    customers[index] = {
      ...previous,
      ...data,
      opportunityValue: Number(data.opportunityValue),
      nextDone: actionChanged ? false : previous.nextDone
    };
    if (actionChanged) delete customers[index].completedOn;
    selectedId = editingId;
  } else {
    const item = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...data,
      opportunityValue: Number(data.opportunityValue),
      nextDone: false,
      activities: []
    };
    customers.unshift(item);
    selectedId = item.id;
  }

  if (!save()) {
    customers = backup;
    selectedId = backupSelectedId;
    setSubmitting(button, false, mode === 'edit' ? '保存修改' : '创建客户');
    return;
  }
  renderList();
  renderDetail();
  renderDashboard();
  syncQuality();
  setSubmitting(button, false, mode === 'edit' ? '保存修改' : '创建客户');
  $('#customer-dialog').close();
  toast(mode === 'edit' ? '客户信息已更新，相关指标已同步' : '新客户已创建并保存');
};

$('#follow-dialog').addEventListener('close', () => {
  $('#follow-form').reset();
  $('#ai-result').classList.add('hidden');
  $('#ai-result').removeAttribute('data-summary');
});
$('#customer-dialog').addEventListener('close', () => {
  $('#customer-form').dataset.mode = 'create';
  $('#customer-form').dataset.customerId = '';
});
['content', 'nextAction'].forEach(name => {
  $('#follow-form').querySelector(`[name=${name}]`).addEventListener('input', () => $('#ai-result').classList.add('hidden'));
});

renderList();
renderDetail();
renderDashboard();
syncQuality();
