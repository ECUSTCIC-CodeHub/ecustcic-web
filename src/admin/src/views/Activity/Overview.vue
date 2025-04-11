<template>
  <div class="overview">
    <div class="page-subheader mb-30">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-7">
            <div class="list">
              <div class="list-item pl-0">
                <div class="list-thumb ml-0 mr-3 pr-3 b-r text-muted">
                  <i class="fa fa-home"></i>
                </div>
                <div class="list-body">
                  <div class="list-title fs-2x">
                    <h3>
                      Welcome
                      <strong>{{ name }}</strong>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-5 d-flex justify-content-end h-md-down">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb no-padding bg-trans mb-0">
                <li class="breadcrumb-item">
                  <a href="/">
                    <i class="fa fa-home mr-2 fs14"></i>
                  </a>
                </li>
                <li class="breadcrumb-item">Admin</li>
                <li class="breadcrumb-item">Activity</li>
                <li class="breadcrumb-item active">Overview</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <div class="page-content d-flex flex">
      <div class="container-fluid">
        <div class="row">
          <template v-for="(item, index) in this.activities">
            <div class="col-md-4 mb-30 text-center" :key="index">
              <div class="newsItem hover">
                <a class="tdn" :href="`/admin/activity/${item.id}`">
                  <img class="newsImg" :src="item.cover" />
                </a>
                <div class="newsText">
                  <a class="tdn" :href="`/admin/activity/${item.id}`">{{item.title}}</a>
                  <br />
                </div>
                <div class="left">{{item.date}}</div>
                <div class="right">{{item.author}}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <footer class="content-footer bg-light b-t">
      <div class="d-flex flex align-items-center pl-15 pr-15">
        <div class="d-flex flex p-3 ml-auto">
          <div>
            <a href="javascript:void(0)" class="d-inline-flex pl-0 pr-2 b-r">Contact</a>
            <a href="javascript:void(0)" class="d-inline-flex pl-2 pr-2 b-r">Storage</a>
            <a href="javascript:void(0)" class="d-inline-flex pl-2 pr-2">Privacy</a>
          </div>
        </div>
        <div class="d-flex flex p-3 mr-auto justify-content-end">
          <div class="text-muted">© Copyright 1998-{{ new Date().getFullYear() }}. ECUST-CIC</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hover:hover {
  -webkit-transform: translateY(-4px);
  -ms-transform: translateY(-4px);
  transform: translateY(-4px);
  -webkit-box-shadow: 0 0 4px #999;
  box-shadow: 0 0 4px #999;
  -webkit-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}
.newsItem {
  width: 300px;
  min-height: 250px;
  margin: 0 auto;
  border-radius: 0.5rem;
  box-shadow: 0px 13px 28.42px 0.58px rgba(0, 0, 0, 0.05);
  position: relative;
}
.newsImg {
  width: 300px;
  height: 180px;
  border-radius: 0.5rem;
}
.newsText {
  font-size: 1em;
  padding: 0.3rem 0.7rem 0.3rem;
}
.left {
  left: 0.5rem;
  bottom: 0.3rem;
  position: absolute;
  color: #6c757d;
}
.right {
  right: 0.5rem;
  bottom: 0.3rem;
  position: absolute;
  color: #6c757d;
}
</style>

<script>
import $ from "jquery";
export default {
  name: "overview",
  data() {
    return {
      activities: [
        {
          img: "/static/activity/6d0f1d56108894aa0b565272b6892b95.jpg",
          title: "本学期第一次义诊顺利举行！",
          date: "2019/10/31",
          author: "服务部",
          id: "1"
        },
        {
          img: "/static/activity/6d0f1d56108894aa0b565272b6892b95.jpg",
          title: "害，没头发了呀",
          date: "2019/10/31",
          author: "严永煜",
          id: "2"
        },
        {
          img: "/static/activity/6d0f1d56108894aa0b565272b6892b95.jpg",
          title: "我想谈恋爱",
          date: "2019/11/11",
          author: "程序员",
          id: "3"
        },
        {
          img: "/static/activity/6d0f1d56108894aa0b565272b6892b95.jpg",
          title: "女生节牛逼！",
          date: "2019/10/31",
          author: "CIC全员",
          id: "4"
        }
      ]
    };
  },
  computed: {
    name: function() {
      return this.$store.state.name;
    }
  },
  methods: {
    getActivities: function() {
      this.$ajax
        .get("/api/activity/all", { params: { page: 1, limit: 9 } })
        .then(res => {
          this.activities = res.data.data.activities;
        });
    }
  },
  mounted() {
    $("#activity > ul > li:nth-child(2)").addClass("mm-active");
    this.getActivities();
  },
  destroyed() {
    $("#activity > ul > li:nth-child(2)").removeClass("mm-active");
  }
};
</script>