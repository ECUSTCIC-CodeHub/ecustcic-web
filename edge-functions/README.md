// EdgeOne Pages KV 存储使用说明
// ============================================================
//
// 本项目计划使用 EdgeOne Pages 的 KV Storage 复活活动后端，
// 用于首页"活动更新"模块和 /activity/:id 详情页。
//
// ## 控制台一次性配置（必须先完成，代码才能工作）
//
// 1. 登录 https://console.cloud.tencent.com/edgeone/pages
// 2. 进入「KV 存储」页面 → 点击「立即开通」（免费版含 1 GB 存储）
// 3. 创建命名空间，名称建议：ecustcic_activities
//    （命名空间名仅支持字母、数字、下划线，不支持连字符）
// 4. 将命名空间绑定到本项目（ecustcic-web），
//    变量名必须填：activities_kv（与 edge-functions 中代码引用一致）
// 5. 在项目的「环境变量」中添加：
//    ADMIN_TOKEN = <自定义一串随机字符串>
//    （用于 POST/DELETE 写入操作的鉴权）
//
// ## 本项目使用的接口
//
//   GET  /api/activity/all?limit=9      首页活动列表（按日期倒序）
//   GET  /api/activity/all              全部活动
//   GET  /api/activity/detail?id=xxx    活动详情（含 content 正文）
//   POST /api/activity/all              新增/更新（需 Authorization: Bearer <ADMIN_TOKEN>）
//   DELETE /api/activity/detail?id=xxx  删除（同样需鉴权）
//
// 所有接口返回 { ret: 0, data: ... } 或 { ret: 1, msg: '...' }，
// 与原后端 /api/activity/* 的响应结构保持兼容。
//
// ## 写入示例（ curl ）
//
//   curl -X POST https://www.ecustcic.com/api/activity/all \
//     -H "Content-Type: application/json" \
//     -H "Authorization: Bearer <ADMIN_TOKEN>" \
//     -d '{
//       "title": "2026年迎新义诊活动",
//       "date": "2026-09-15",
//       "author": "服务部",
//       "cover": "/img/activities/welcome2026.jpg",
//       "content": "# 活动详情\n..."
//     }'
//
// ## 注意事项
//
// - KV 为最终一致（≤ 60 秒全球同步），更新后极短时间内可能读到旧值
// - 写入频率：首页每 5-10 分钟轮询一次足够，避免高频读（KV 无需担心，
//   但 edge function 有 CPU 200ms 限制，本用例足够）
// - 本地开发：edgeone pages link 绑定项目后，edgeone pages dev 即可本地测试
//