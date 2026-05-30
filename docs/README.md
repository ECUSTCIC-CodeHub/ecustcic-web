---
home: true
heroText: CIC 指南
tagline: 华理计算机信息交流协会资料库
actionText: 开始阅读 →
actionLink: /learning/ecust-CourseShare/
footer: 华理计算机信息交流协会 (CIC)
---

<div class="custom-features">

<a class="feature-card" href="/tech/learning/">
  <h2>📚 学习资源</h2>
  <p>课程攻略共享计划、图书数据库使用方法等学习资源汇总</p>
</a>

<a class="feature-card" href="/tech/faq/">
  <h2>🌐 网络信息服务FAQ</h2>
  <p>校园网、邮箱、VPN、正版化软件等常见问题解答</p>
</a>

<a class="feature-card" href="/tech/dev/">
  <h2>💻 开发教程</h2>
  <p>游戏开发路径指南，从入门到实践的完整学习路线</p>
</a>

<a class="feature-card" href="/tech/maintenance/">
  <h2>🔧 站点维护指南</h2>
  <p>本站维护快速入门，帮助新成员快速上手</p>
</a>

</div>

<style>
.custom-features {
  max-width: 960px;
  margin: -2rem auto 1.5rem auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: stretch;
  justify-content: space-between;
}
.feature-card {
  flex-grow: 1;
  flex-basis: 40%;
  max-width: 50%;
  padding: 1rem 1.5rem;
  margin-bottom: 0.8rem;
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  display: block;
}
.feature-card:hover {
  border-color: var(--accent-color, #3eaf7c);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
}
.feature-card h2 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  border-bottom: none;
  padding-bottom: 0;
}
.feature-card p {
  color: var(--text-color, #666);
  font-size: 0.9rem;
  margin: 0;
}
@media (max-width: 768px) {
  .feature-card {
    flex-basis: 100%;
    max-width: 100%;
  }
}
</style>
