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
//    OAUTH_STATE_SECRET = <随机长字符串，必填>
//    （会话与管理令牌的签名密钥；未配置时 /api/auth/* 直接返回 500）
//    SITE_URL = https://www.ecustcic.com （必填，用于拼 redirect_uri 与 CORS 白名单）
//    MACHINE_TOKEN = <自定义一串随机字符串，可选>
//    （仅供运维脚本/CI 使用的机器凭证，不再下发给浏览器；
//      旧的 ADMIN_TOKEN 变量已废弃，历史上外泄过，必须轮换）
//    （后台的管理令牌由 GET /api/auth/token 用登录会话签发，2 小时过期）
//
// ## 本项目使用的接口
//
//   GET  /api/activity/all                    内容列表（默认只返回未隐藏条目，按日期倒序）
//        ?kind=activity|news                  按类型过滤（缺省 activity 兼容老数据）
//        ?limit=9                             限制条数
//        ?includeHidden=1                     含隐藏条目（需 Authorization: Bearer <管理令牌>）
//   GET  /api/activity/detail?id=xxx          单条详情（隐藏条目同样需要 token）
//   POST /api/activity/all                    新增/更新（需 Authorization: Bearer <管理令牌>）
//   DELETE /api/activity/detail?id=xxx        删除（同样需鉴权）
//
// 数据字段：
//   id / kind / title / date / author
//   cover    封面 URL，可空（首页列表不使用封面，详情页与活动回顾卡片使用）
//   summary  列表摘要，可空（后台列表会从 content 截取）
//   content  Markdown 正文
//   link     非空即外链型条目，前台卡片直接跳转该地址（如「MC服务器上线」）
//   hidden   是否在前台隐藏（草稿/下架）
//
// 所有接口返回 { ret: 0, data: ... } 或 { ret: 1, msg: '...' }，
// 与原后端 /api/activity/* 的响应结构保持兼容。
//
// ## 写入示例（ curl ）
//
//   curl -X POST https://www.ecustcic.com/api/activity/all \
//     -H "Content-Type: application/json" \
//     -H "Authorization: Bearer <MACHINE_TOKEN 或 /api/auth/token 签发的管理令牌>" \
//     -d '{
//       "kind": "activity",
//       "title": "2026年迎新义诊活动",
//       "date": "2026-09-15",
//       "author": "服务部",
//       "cover": "",
//       "summary": "面向新生的免费义诊",
//       "content": "# 活动详情\n...",
//       "link": "",
//       "hidden": false
//     }'
//
// ## 注意事项
//
// - KV 为最终一致（≤ 60 秒全球同步），更新后极短时间内可能读到旧值
// - 写入频率：首页每 5-10 分钟轮询一次足够，避免高频读（KV 无需担心，
//   但 edge function 有 CPU 200ms 限制，本用例足够）
// - 本地开发：edgeone pages link 绑定项目后，edgeone pages dev 即可本地测试
//