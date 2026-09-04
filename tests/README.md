# CargoPulse CRM 测试资产

这组测试覆盖业务规则、边界输入和已发现缺陷的回归验证，不依赖第三方测试框架。

## 运行

在项目目录执行：

```powershell
node .\tests\run-tests.js
```

退出码为 0 表示全部通过；任一用例失败时退出码为 1，适合后续接入 CI。

## 目录

- `unit/logic.test.js`：输入校验、日期、AI 整理规则、KPI、渠道统计、存储恢复。
- `integration/ui-contract.test.js`：页面真实调用顺序、保存回滚、防重复提交、客户编辑、KPI 追溯、坏数据容错、行业字段和审计日期。
- `badcases/regressions.test.js`：针对真实缺陷设置的永久回归用例。
- `cases/boundary-cases.json`：人工验收与后续端到端自动化使用的边界数据池。

原则：每发现一个 Bug，先补一条能复现它的 bad case，再修代码，最后永久保留为回归测试。

当前结果：89 项通过，0 项失败。
