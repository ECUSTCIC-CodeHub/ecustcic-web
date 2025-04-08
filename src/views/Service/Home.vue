<template>
  <div class="service">
    <img src="../../assets/img/Service/bg.png" width="100%" />
    <div class="container">
      <br />
      <div class="row">
        <div class="col-md-9">
          <div style="text-align: left;">
            <h1>
              最新活动
              <small style="font-size: 15px">
                <a href="#">查看全部</a>
              </small>
            </h1>
          </div>
          <hr />
          <div>
            <ul class="list-group">
              <li class="list-group-item">
                <div class="row">
                  <div class="col-md-8 title-border"><a class="link-color" href="#">2019学年第一次义诊顺利举行</a></div>
                  <div class="col-md-4">2019/10/8</div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="row">
                  <div class="col-md-8 title-border"><a class="link-color" href="#">2019学年第二次义诊顺利举行</a></div>
                  <div class="col-md-4">2019/11/8</div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="row">
                  <div class="col-md-8 title-border"><a class="link-color" href="#">2018学年第一次义诊顺利举行</a></div>
                  <div class="col-md-4">2018/10/8</div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="row">
                  <div class="col-md-8 title-border"><a class="link-color" href="#">2018学年第二次义诊顺利举行</a></div>
                  <div class="col-md-4">2018/11/8</div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="row">
                  <div class="col-md-8 title-border"><a class="link-color" href="#">2018学年第三次义诊顺利举行</a></div>
                  <div class="col-md-4">2019/6/8</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card" style="width: 18rem;">
            <br />
            <img
              src="../../assets/img/Home/serve.png"
              class="rounded-circle img-center"
              alt="..."
              width="100"
            />
            <br />
            <div class="card-body" style="background:#e7f7fe;">
              <h5 class="card-title">服务部</h5>
              <p class="card-text">服务部提供免费的电脑设备维修服务。</p>
              <a href="/service/repair" class="btn btn-primary btn-lg">前往报修>></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container container-fluid"></div>
  </div>
</template>

<style scoped>
.img-center {
  margin: 0 auto;
}
.title-border {
  border-right: 1px solid #dedede;
}
a.link-color{
  color: black;
}
</style>
<script>
export default {
  name: "service"
};
</script>