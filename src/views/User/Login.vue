<template>
  <div class="container px-5 pt-3 pb-5" id="login">
    <Loading />
    <AnimWords text="Login" :animation="false" />
    <p class="lead text-muted text-center mb-4">
      使用华理皮肤站账号登录，与 Minecraft 社区账号通用
    </p>
    <div class="col-md-6 offset-md-3">
      <a class="btn btn-primary btn-lg btn-block skin-login-btn" href="/api/auth/login">
        <img class="plume-icon" src="@/assets/img/plume.svg" alt="" />
        使用皮肤站账号登录
      </a>
    </div>
    <div class="text-center text-muted small mt-4">
      登录即代表你同意本站的使用条款 ·
      <a href="https://mcskin.ecustvr.top/" target="_blank" rel="noopener">皮肤站主页</a>
    </div>
    <!-- <div class="row mb-3">
      <div class="col-md-2 offset-md-2">
        <label class="form-control" onselectstart="return false;" for="username">用户名</label>
      </div>
      <div class="col-md-4 offset-md-1">
        <input
          type="text"
          id="username"
          name="username"
          class="form-control"
          placeholder="邮箱"
          @click="disablePopover"
          @blur="check('username')"
          v-model="username"
          v-validate="'required|email'"
          title="登录失败"
          data-toggle="popover"
          datas-placement="right"
          data-content="该用户不存在"
        />
      </div>
      <div class="col-md-3">
        <div
          class="form-control alert-danger"
          role="alert"
          v-show="errors.has('username')"
        >请填写正确的用户名</div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-2 offset-md-2">
        <label class="form-control" onselectstart="return false;" for="password">密码</label>
      </div>
      <div class="col-md-4 offset-md-1">
        <div class="input-group">
          <input
            type="password"
            id="password"
            name="password"
            class="form-control"
            placeholder="请输入密码"
            @click="disablePopover"
            @blur="check('password')"
            v-model="password"
            v-validate="'required|min:6|max:20'"
            title="登录失败"
            data-toggle="popover"
            datas-placement="right"
            data-content="密码错误"
          />
          <div class="input-group-append bg-white">
            <button
              class="btn btn-outline-primary"
              type="button"
              tabindex="-1"
              @click="showPassword"
            >
              <i class="fa fa-eye-slash fa-fw" id="eye"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-control alert-danger" role="alert" v-show="errors.has('password')">请填写正确的密码</div>
      </div>
    </div>
    <div class="row mb-5">
      <div class="col-md-3 offset-md-2 text-left">
        其他登录方式：
        <button class="btn btn-link p-0" style="vertical-align: inherit;" @click="qqLogin">
          [Image]
        </button>
      </div>
      <div class="col-md-4 text-right">
        <router-link to="/user/register" class="btn btn-link p-0 mr-1">还没有账号?</router-link>
        <button class="btn btn-link p-0" @click="formValidate(resendVerifyEmail)">未收到激活邮件?</button>
      </div>
    </div>
    <div class="col-md-6 offset-md-3">
      <button class="btn btn-primary btn-lg btn-block" @click="formValidate(cbfn)">登录</button>
    </div> -->
  </div>
</template>

<style scoped>
.skin-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, var(--accent, #3498db) 0%, #21618c 100%);
  border: none;
}

.skin-login-btn:hover {
  background: linear-gradient(135deg, #2f80c0 0%, #1b5273 100%);
}

.plume-icon {
  width: 24px;
  height: 24px;
}
</style>

<script>
import Loading from "@/components/Loading.vue";
import AnimWords from "@/components/AnimWords.vue";

export default {
  components: {
    Loading,
    AnimWords
  }
};
</script>
