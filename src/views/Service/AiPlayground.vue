<template>
  <div class="ai-playground">
    <div class="ai-head">
      <div class="container">
        <router-link :to="{ name: 'service' }" class="back-link">
          <i class="fas fa-arrow-left"></i> 返回工具箱
        </router-link>
        <span class="head-tag">CIC · SERVICE</span>
        <h1>AI 操练场</h1>
        <p>纯浏览器直连大模型对话试验台：接入自定义 API，配置只保存在你自己的设备上</p>
      </div>
    </div>

    <div class="container pg-body">
      <div class="pg-shell" :class="{ 'with-debug': showDebug, 'debug-maximized': debugMaximized }">
        <!-- 左：模型配置 -->
        <aside class="pg-side">
          <div class="side-card">
            <!-- 折叠态摘要（仅窄屏出现） -->
            <div v-if="!configVisible" class="config-summary" @click="showConfig = true">
              <div class="summary-icon"><i class="fas fa-robot"></i></div>
              <div class="summary-main">
                <div class="summary-name">{{ hasConfig ? config.model || '模型已就绪' : '尚未配置' }}</div>
                <div class="summary-model">
                  <span v-if="hasConfig" class="summary-ok"><i class="fas fa-circle-check"></i> 已配置</span>
                  <span v-else class="summary-missing"><i class="fas fa-triangle-exclamation"></i> 未配置</span>
                  <span class="summary-text">{{ config.baseUrl || '未填写接入地址' }}</span>
                </div>
              </div>
              <i class="fas fa-chevron-down summary-arrow"></i>
            </div>

            <template v-else>
              <div class="side-head">
                <span class="side-title"><i class="fas fa-sliders"></i> 模型配置</span>
                <button
                  v-if="!mediaWide"
                  type="button"
                  class="side-collapse"
                  @click="showConfig = false"
                >收起 <i class="fas fa-chevron-up"></i></button>
              </div>

              <div class="side-scroll">
                <div class="switch-row">
                  <label class="switch-label" for="pg-custom">
                    <i class="fas fa-code"></i> 自定义请求体模式
                  </label>
                  <div class="custom-control custom-switch">
                    <input id="pg-custom" v-model="config.useCustom" type="checkbox" class="custom-control-input" @change="saveNow" />
                    <label class="custom-control-label" for="pg-custom"></label>
                  </div>
                </div>

                <div v-if="config.useCustom" class="side-section">
                  <label class="field-label"><i class="fas fa-code"></i> 请求体 / Prompt 模板</label>
                  <textarea v-model="config.customTemplate" class="form-control field-input field-mono custom-tpl" rows="6" placeholder="{}" @change="saveNow"></textarea>
                  <small class="field-help">以 <code>{</code> 开头视为 JSON 请求体模板，引号内的 <code v-pre>{{question}}</code> 自动 JSON 转义；否则视为纯文本 Prompt。可用 <code>outputPath</code> 声明响应提取路径。</small>
                </div>

                <div class="side-section">
                  <div class="section-title">接入设置</div>
                  <div class="field">
                    <label class="field-label"><i class="fas fa-link"></i> Base URL</label>
                    <input v-model="config.baseUrl" type="text" class="form-control field-input field-mono" placeholder="https://ai.ecustcic.com/api/v1" @change="saveNow" />
                    <small class="field-help">填到版本根即可，自动拼接 /chat/completions 与 /models。</small>
                  </div>
                  <div class="field">
                    <label class="field-label"><i class="fas fa-key"></i> API Key</label>
                    <div class="key-input-wrap">
                      <input
                        v-model="config.apiKey"
                        :type="showKey ? 'text' : 'password'"
                        class="form-control field-input field-mono"
                        placeholder="sk-…"
                        autocomplete="new-password"
                        @change="saveNow"
                      />
                      <button type="button" class="key-toggle" :aria-label="showKey ? '隐藏密钥' : '显示密钥'" @click="showKey = !showKey">
                        <i :class="showKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="side-section">
                  <div class="section-title">模型</div>
                  <div class="model-input-row">
                    <div class="model-input-wrap">
                      <i class="fas fa-magnifying-glass model-input-icon"></i>
                      <input
                        v-model="config.model"
                        type="text"
                        class="form-control field-input field-mono"
                        placeholder="填写模型名，或输入关键字筛选"
                        @input="modelFilterActive = true"
                        @change="saveNow"
                      />
                      <button
                        v-if="config.model"
                        type="button"
                        class="model-clear-btn"
                        title="清空模型名"
                        aria-label="清空模型名"
                        @click="resetModel"
                      ><i class="fas fa-times"></i></button>
                    </div>
                    <button type="button" class="icon-btn" :disabled="modelsLoading" title="拉取模型列表" aria-label="拉取模型列表" @click="loadModels">
                      <span v-if="modelsLoading" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="fas fa-rotate"></i>
                    </button>
                  </div>
                  <p v-if="modelFilterActive && modelQuery && filteredModels.length" class="model-count">
                    匹配 {{ filteredModels.length }} / {{ models.length }} 个模型
                  </p>
                  <div v-if="filteredModels.length" class="model-list">
                    <button
                      v-for="m in filteredModels"
                      :key="m"
                      type="button"
                      class="model-item"
                      :class="{ active: m === config.model }"
                      :title="m"
                      @click="selectModel(m)"
                    >{{ m }}</button>
                  </div>
                  <p v-else-if="models.length" class="model-none">没有匹配的模型，可直接使用输入的名称</p>
                </div>

                <div class="side-section">
                  <image-urls-panel
                    :enabled="config.imagesEnabled && !generating"
                    :images="config.images"
                    @toggle="toggleImages"
                    @change="onImagesChange"
                  />
                </div>

                <div class="side-section">
                  <div class="section-title">采样参数</div>

                  <div
                    v-for="p in samplingParams"
                    :key="p.key"
                    class="param-field"
                    :class="{ off: !config[p.key + 'Enabled'] }"
                  >
                    <div class="param-head">
                      <label class="param-name" :for="'pg-' + p.key" :title="p.label">{{ p.label }}</label>
                      <span class="param-spacer"></span>
                      <input
                        v-if="p.type === 'number'"
                        :id="'pg-' + p.key"
                        v-model.number="config[p.key]"
                        type="number"
                        :min="p.min"
                        :max="p.max"
                        :step="p.step"
                        class="num-input"
                        :disabled="!config[p.key + 'Enabled']"
                        :placeholder="p.placeholder || ''"
                        :aria-label="p.label"
                        @change="clampParam(p)"
                      />
                      <span v-else class="param-value">{{ showParamValue(p) }}</span>
                      <button
                        type="button"
                        class="param-toggle"
                        :class="{ on: config[p.key + 'Enabled'] }"
                        role="switch"
                        :aria-checked="config[p.key + 'Enabled'] ? 'true' : 'false'"
                        :aria-label="p.label + (config[p.key + 'Enabled'] ? ' 已启用，点击停用' : ' 未启用，点击启用')"
                        :title="config[p.key + 'Enabled'] ? '停用该参数' : '启用该参数'"
                        @click="toggleParam(p.key)"
                      ><i class="fas fa-circle"></i></button>
                    </div>
                    <input
                      v-if="p.type === 'range'"
                      v-model.number="config[p.key]"
                      type="range"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step"
                      class="range"
                      :disabled="!config[p.key + 'Enabled']"
                      :aria-label="p.label"
                      @change="clampParam(p)"
                    />
                    <small class="field-help">{{ p.help }}</small>
                  </div>
                </div>

                <div class="switch-row">
                  <label class="switch-label" for="pg-stream">
                    <i class="fas fa-water"></i> 流式输出
                  </label>
                  <div class="custom-control custom-switch">
                    <input id="pg-stream" v-model="config.stream" type="checkbox" class="custom-control-input" @change="saveNow" />
                    <label class="custom-control-label" for="pg-stream"></label>
                  </div>
                </div>

                <div class="side-section">
                  <label class="field-label"><i class="fas fa-gear"></i> System 提示词</label>
                  <textarea v-model="config.systemPrompt" class="form-control field-input" rows="3" placeholder="设定角色与回复风格，例如：你是一个简洁的编程助手…" @change="saveNow"></textarea>
                </div>

                <div class="side-foot">
                  <span class="saved-at"><i class="fas fa-clock"></i> {{ savingAt ? '上次保存 ' + savingAt : '改动自动保存' }}</span>
                  <button type="button" class="link-btn danger" title="恢复默认配置" @click="resetConfig"><i class="fas fa-rotate-left"></i> 重置</button>
                </div>
              </div>
            </template>
          </div>
        </aside>

        <!-- 中：对话 -->
        <main class="pg-chat">
          <div class="chat-card">
            <div class="chat-head">
              <div class="chat-id">
                <div class="chat-head-icon"><i class="fas fa-comment-dots"></i></div>
                <div>
                  <div class="chat-title">AI 对话</div>
                  <div class="chat-sub">{{ hasConfig ? config.model : '尚未配置模型' }}</div>
                </div>
              </div>
              <div class="chat-actions">
                <button type="button" class="ghost-btn" :class="{ on: showDebug }" title="显示或隐藏调试信息" @click="showDebug = !showDebug">
                  <i class="fas fa-bug"></i> <span>{{ showDebug ? '隐藏调试' : '调试' }}</span>
                </button>
                <button v-if="hasConfig" type="button" class="ghost-btn" title="导出对话与配置" @click="exportChat"><i class="fas fa-download"></i></button>
                <button type="button" class="ghost-btn" title="导入对话文件" @click="importChat"><i class="fas fa-upload"></i></button>
                <button type="button" class="ghost-btn" title="清空对话" @click="clearChat"><i class="fas fa-broom"></i></button>
              </div>
            </div>

            <!-- URL 导入提示 -->
            <div v-if="urlConfig" class="url-import">
              <div class="url-import-main">
                <div class="url-import-title"><i class="fas fa-download"></i> 检测到 URL 携带的接入配置</div>
                <code v-if="urlConfig.baseUrl" class="url-import-line">API：{{ urlConfig.baseUrl }}</code>
                <code v-if="urlConfig.model" class="url-import-line">模型：{{ urlConfig.model }}</code>
              </div>
              <button type="button" class="btn btn-cic btn-sm" @click="applyImport"><i class="fas fa-check mr-1"></i>一键导入</button>
            </div>

            <!-- 消息区 -->
            <div ref="msgs" class="chat-msgs">
              <div v-if="!visibleHistory && !generating" class="chat-empty">
                <div class="empty-icon"><i class="fas fa-comments"></i></div>
                <h6>开始你的第一次操练</h6>
                <p>输入消息即可与配置好的模型对话。试试下面的示例：</p>
                <div class="empty-presets">
                  <button v-for="pre in presets" :key="pre" type="button" class="empty-preset" @click="applyPreset(pre)">{{ pre }}</button>
                </div>
              </div>

              <div v-for="msg in messages" :key="msg.id" class="msg-row" :class="'msg-' + msg.role">
                <template v-if="msg.role === 'user'">
                  <div class="msg-main">
                    <div class="bubble user-bubble">
                      <div v-if="msg.images && msg.images.length" class="bubble-images">
                        <template v-for="(url, i) in msg.images">
                          <a
                            v-if="isHttpUrl(url)"
                            :key="'link-' + i"
                            :href="url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="bubble-image"
                            :title="'查看原图 ' + (i + 1)"
                          ><img
                            :src="url"
                            :alt="'图片附件 ' + (i + 1)"
                            loading="lazy"
                            referrerpolicy="no-referrer"
                          /></a>
                          <img
                            v-else
                            :key="'img-' + i"
                            :src="url"
                            class="bubble-image"
                            :alt="'图片附件 ' + (i + 1)"
                            loading="lazy"
                            referrerpolicy="no-referrer"
                          />
                        </template>
                      </div>
                      <div class="msg-text" v-html="renderMarkdown(msg.content)"></div>
                    </div>
                    <div class="msg-tools">
                      <button type="button" title="重试" @click="retryFrom(msg)"><i class="fas fa-rotate-right"></i></button>
                      <button type="button" title="复制" @click="copyMsg(msg)"><i class="fas fa-copy"></i></button>
                      <button type="button" title="编辑" @click="editMsg(msg)"><i class="fas fa-pen"></i></button>
                      <button type="button" title="删除" @click="deleteMsg(msg)"><i class="fas fa-trash-can"></i></button>
                    </div>
                  </div>
                  <div class="avatar user-avatar"><i class="fas fa-user"></i></div>
                </template>
                <template v-else>
                  <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
                  <div class="msg-main">
                    <div class="think-block" v-if="showDebug && msg.reasoning && msg.reasoning.trim()">
                      <div class="think-head" @click="msg.showThink = !msg.showThink">
                        <i class="fas fa-brain"></i>
                        <span>思考过程</span>
                        <i :class="msg.showThink ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="chev"></i>
                      </div>
                      <pre v-show="msg.showThink" class="think-body">{{ msg.reasoning }}</pre>
                    </div>
                    <div class="msg-text" v-html="renderMarkdown(msg.content)"></div>
                    <div v-if="msg.usage" class="msg-usage">
                      tokens：{{ msg.usage.prompt_tokens || 0 }} + {{ msg.usage.completion_tokens || 0 }}
                    </div>
                    <div class="msg-tools">
                      <button type="button" title="重试" @click="retryFrom(msg)"><i class="fas fa-rotate-right"></i></button>
                      <button type="button" title="复制" @click="copyMsg(msg)"><i class="fas fa-copy"></i></button>
                      <button type="button" title="转为 User" @click="switchRole(msg)"><i class="fas fa-user"></i></button>
                      <button type="button" title="删除" @click="deleteMsg(msg)"><i class="fas fa-trash-can"></i></button>
                    </div>
                  </div>
                </template>
              </div>

              <!-- 生成中：流式消息 -->
              <div v-if="generating" class="msg-row msg-assistant">
                <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
                <div class="msg-main">
                  <div v-if="streamReasoning && showDebug" class="think-block">
                    <div class="think-head">
                      <i class="fas fa-brain"></i>
                      <span>思考中…</span>
                    </div>
                    <pre class="think-body">{{ streamReasoning }}</pre>
                  </div>
                  <div class="msg-text" v-html="renderMarkdown(streamText) || '<span class=\'stream-caret\'>▍</span>'"></div>
                </div>
              </div>
            </div>

            <!-- 输入区 -->
            <div class="chat-input-wrap">
              <p v-if="configError" class="error-text" role="alert"><i class="fas fa-circle-exclamation mr-1"></i>{{ configError }}</p>
              <div v-if="composerImages.length" class="input-images">
                <div v-for="(item, i) in composerImages" :key="'att-' + item.index" class="input-image">
                  <img
                    :src="item.url"
                    :alt="'待发送图片 ' + (i + 1)"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                  <button
                    type="button"
                    class="input-image-del"
                    :disabled="generating"
                    :title="'移除第' + (i + 1) + '张图片'"
                    :aria-label="'移除第' + (i + 1) + '张图片'"
                    @click="removeImage(item.index)"
                  ><i class="fas fa-times"></i></button>
                </div>
              </div>
              <div class="input-box">
                <textarea
                  ref="input"
                  v-model="input"
                  class="chat-input"
                  rows="1"
                  placeholder="请输入你的问题…"
                  :disabled="generating"
                  @keydown.enter.exact.prevent="onEnter"
                  @compositionstart="composing = true"
                  @compositionend="composing = false"
                  @input="autoGrow"
                  @paste="onPasteImage"
                ></textarea>
                <div class="input-bar">
                  <span class="input-hint">
                    <i class="fas fa-image" :class="{ on: composerImages.length }"></i>
                    Enter 发送 / Shift+Enter 换行 · 可直接粘贴图片
                  </span>
                  <span class="input-count" :class="{ over: overLimit }">{{ input.trim().length }}</span>
                  <button
                    v-if="!generating"
                    type="button"
                    class="send-btn"
                    :disabled="!input.trim() || !hasConfig"
                    title="发送"
                    aria-label="发送"
                    @click="send"
                  ><i class="fas fa-arrow-up"></i></button>
                  <button v-else type="button" class="send-btn stop" title="停止生成" aria-label="停止生成" @click="stop"><i class="fas fa-stop"></i></button>
                </div>
              </div>
              <div class="chat-input-foot">
                <span><i class="fas fa-shield-halved"></i> 配置与 Key 保存在浏览器 localStorage，不经过本站服务器</span>
              </div>
            </div>
          </div>

        </main>

        <!-- 右：调试 -->
        <aside v-if="showDebug" class="pg-debug">
          <div class="debug-card">
            <div class="debug-head">
              <div class="debug-head-icon"><i class="fas fa-code"></i></div>
              <div class="debug-id">
                <div class="debug-title">调试信息</div>
                <div class="debug-sub">请求与响应原始数据</div>
              </div>
            </div>
            <debug-panel
              class="debug-content"
              :preview-payload="previewPayload"
              :actual-payload="actualPayload"
              :events="sseEvents"
              :last-request-at="lastRequestAt"
              :stream-epoch="streamEpoch"
              @copy="copyText"
              @maximize="debugMaximized = $event"
            />
          </div>
        </aside>
      </div>

      <!-- 使用提示 -->
      <div class="tip-card">
        <button
          type="button"
          class="tip-toggle"
          :aria-expanded="showTips ? 'true' : 'false'"
          aria-controls="pg-tips"
          @click="showTips = !showTips"
        >
          <i class="fas fa-lightbulb"></i> 使用提示
          <i :class="showTips ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="tip-chev"></i>
        </button>
        <div v-show="showTips" id="pg-tips" class="tip-body">
          <ul>
            <li>本页面不登录即可使用，配置只写入你自己浏览器的 localStorage，不会上传服务器。</li>
            <li>支持 URL 直接带入：<code>/service/ai-playground?api=BASE_URL&amp;key=YOUR_KEY</code>（<code>api</code>/<code>endpoint</code>/<code>base</code> 皆可，另可选 <code>model</code>）。</li>
            <li>自定义请求体模式可接入任意 HTTP 后端，配合 <code>outputPath</code> 提取响应字段。</li>
            <li>开启调试可查看预览请求体（含上下文，即下一轮真实发送内容）、仅当前消息的请求体与 SSE 响应事件流。</li>
            <li>请求由浏览器直连目标 API，跨域（CORS）与密钥安全请自行评估；仅用于调试、操练。</li>
          </ul>
          <div v-if="presetUrl" class="tip-export">
            <button type="button" class="ghost-btn" @click="copyPresetUrl"><i class="fas fa-share"></i> 复制本配置链接</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  loadConfig,
  saveConfig,
  parseUrlConfig,
  defaultConfig,
  sendMessage,
  fetchModels,
  buildPreviewRequest,
  buildActualRequest,
  isCompatibleValue,
  sanitizeImages,
  validImageUrl,
  SAMPLING_PARAMS,
  SEED_RANGE
} from '@/api/aiPlayground';
import DebugPanel from '@/components/DebugPanel.vue';
import ImageUrlsPanel from '@/components/ImageUrlsPanel.vue';

const MAX_CHARS = 8000;

/** 界面展示元数据；区间与取整规则来自 api 层的 SAMPLING_PARAMS，避免两处漂移 */
const SAMPLING_META = {
  temperature: { label: 'Temperature', type: 'range', step: 0.1, decimals: 1, help: '控制输出的随机性和创造性，越高越发散' },
  topP: { label: 'Top P', type: 'range', step: 0.01, decimals: 2, help: '核采样，控制词汇选择的多样性' },
  frequencyPenalty: { label: 'Frequency Penalty', type: 'range', step: 0.1, decimals: 1, help: '频率惩罚，减少重复词汇的出现' },
  presencePenalty: { label: 'Presence Penalty', type: 'range', step: 0.1, decimals: 1, help: '存在惩罚，鼓励讨论新话题' },
  maxTokens: { label: 'Max Tokens', type: 'number', step: 1, placeholder: '不填则不限制', help: '单次回复的最大长度' },
  seed: { label: 'Seed', type: 'number', step: 1, placeholder: '可选', help: '相同种子下回复更可复现，并非所有模型支持' }
};

function buildSamplingParams() {
  const ranges = SAMPLING_PARAMS.concat([{ key: 'seed', min: SEED_RANGE[0], max: SEED_RANGE[1], integer: true }]);
  return ranges.map(item => Object.assign(
    {},
    SAMPLING_META[item.key] || { label: item.key, type: 'number' },
    { key: item.key, min: item.min, max: item.max, integer: !!item.integer }
  ));
}
let msgSeq = Date.now();
function nextMsgId() {
  return 'm' + (++msgSeq);
}

export default {
  name: 'ai-playground',
  components: {
    DebugPanel,
    ImageUrlsPanel
  },
  data() {
    return {
      // 配置
      config: loadConfig(),
      urlConfig: null,
      showConfig: false,
      showKey: false,
      savingAt: '',
      savingTimer: null,
      models: [],
      modelsLoading: false,
      // 模型输入框是否处于筛选态（点击列表项后回到完整列表）
      modelFilterActive: false,
      // 对话
      messages: [],
      input: '',
      generating: false,
      // 输入法合成中，Enter 不发送
      composing: false,
      streamText: '',
      streamReasoning: '',
      abortCtrl: null,
      // 宽屏（>= lg 断点）下配置面板始终展开
      mediaWide: false,
      mediaQuery: null,
      mediaHandler: null,
      // 调试
      showDebug: false,
      // 调试面板放大态：需解除右栏 sticky 形成的层叠上下文
      debugMaximized: false,
      // 使用提示默认收起，避免挤占对话高度
      showTips: false,
      configError: '',
      // SSE 事件流（最近一次请求）
      sseEvents: [],
      // 最近一次请求时间
      lastRequestAt: '',
      // 请求序号，驱动调试面板重置展开状态
      streamEpoch: 0,
      samplingParams: buildSamplingParams(),
      presets: [
        '用一句话介绍一下你自己。',
        '帮我把这段话润色成更专业的表达：xxx',
        '写一个 Python 函数，判断字符串是否为回文。'
      ]
    };
  },
  computed: {
    hasConfig() {
      // 自定义模式下有 baseUrl + 模板即可；常规模式需 baseUrl + model
      if (!this.config) return false;
      if (this.config.useCustom) {
        return !!String(this.config.baseUrl || '').trim() && !!String(this.config.customTemplate || '').trim();
      }
      return !!String(this.config.baseUrl || '').trim() && !!String(this.config.model || '').trim();
    },
    overLimit() {
      return this.input.trim().length > MAX_CHARS;
    },
    visibleHistory() {
      return this.messages.length > 0;
    },
    // 输入区缩略图：只渲染合法且去重后的图片地址（与发送时的 sanitizeImages 一致），保留原始下标用于删除
    composerImages() {
      if (!this.config.imagesEnabled) return [];
      const seen = {};
      const list = [];
      (this.config.images || []).forEach((url, index) => {
        const value = String(url || '').trim();
        if (!validImageUrl(value) || seen[value]) return;
        seen[value] = true;
        list.push({ url: value, index });
      });
      return list;
    },
    modelQuery() {
      return String(this.config.model || '').trim();
    },
    filteredModels() {
      if (!this.models.length) return [];
      if (!this.modelFilterActive || !this.modelQuery) return this.models;
      const query = this.modelQuery.toLowerCase();
      return this.models.filter(name => name.toLowerCase().indexOf(query) !== -1);
    },
    // 宽屏始终展开，窄屏由 showConfig 控制
    configVisible() {
      return this.showConfig || this.mediaWide;
    },
    // 供外部分享的预填配置链接
    presetUrl() {
      const origin = window.location.origin;
      const base = origin + '/service/ai-playground';
      if (this.config.useCustom) return '';
      const params = [];
      if (this.config.baseUrl) params.push('api=' + encodeURIComponent(this.config.baseUrl));
      if (this.config.model) params.push('model=' + encodeURIComponent(this.config.model));
      if (!params.length) return '';
      return base + '?' + params.join('&');
    },
    // 预览请求体：完整上下文（历史消息 + system），不含正在输入的文本
    previewPayload() {
      if (!this.hasConfig) return null;
      try {
        return buildPreviewRequest(this.config, this.trimHistoryForRequest(this.buildMessages())).payload;
      } catch (e) {
        return null;
      }
    },
    // 实际请求体：发送时将只包含最新用户消息
    actualPayload() {
      if (!this.hasConfig || !this.lastQuestion) return null;
      try {
        return buildActualRequest(this.config, this.lastQuestion).payload;
      } catch (e) {
        return null;
      }
    },
    lastQuestion() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].role === 'user') return this.messages[i].content;
      }
      return '';
    }
  },
  created() {
    // 读取 URL 中可能携带的 api/key
    const query = this.$route.query || {};
    this.urlConfig = parseUrlConfig(query);
    if (this.urlConfig) this.showConfig = false;
    // 跟随 lg 断点切换配置面板展开状态
    if (typeof window.matchMedia === 'function') {
      this.mediaQuery = window.matchMedia('(min-width: 992px)');
      this.mediaWide = this.mediaQuery.matches;
      this.mediaHandler = e => {
        this.mediaWide = e.matches;
      };
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.mediaHandler);
      } else if (this.mediaQuery.addListener) {
        this.mediaQuery.addListener(this.mediaHandler);
      }
    }
  },
  destroyed() {
    if (this.savingTimer) {
      clearTimeout(this.savingTimer);
      this.savingTimer = null;
      this.persistConfig();
    }
    this._destroyed = true;
    if (this.abortCtrl) {
      this.streamEpoch += 1;
      this.abortCtrl.abort();
    }
    if (this.mediaQuery) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.mediaHandler);
      } else if (this.mediaQuery.removeListener) {
        this.mediaQuery.removeListener(this.mediaHandler);
      }
    }
  },
  methods: {
    // ---------- 配置 ----------
    saveNow() {
      if (this.savingTimer) clearTimeout(this.savingTimer);
      this.savingTimer = setTimeout(() => {
        this.savingTimer = null;
        this.persistConfig();
      }, 300);
    },
    toggleParam(key) {
      this.config[key + 'Enabled'] = !this.config[key + 'Enabled'];
      this.saveNow();
    },
    showParamValue(param) {
      const raw = this.config[param.key];
      if (raw === '' || raw === null || raw === undefined) return '—';
      const num = Number(raw);
      if (!Number.isFinite(num)) return '—';
      return num.toFixed(param.decimals);
    },
    clampParam(param) {
      const raw = this.config[param.key];
      if (raw === '' || raw === null || raw === undefined) {
        this.saveNow();
        return;
      }
      let value = Number(raw);
      if (!Number.isFinite(value)) {
        this.config[param.key] = param.min === undefined ? '' : param.min;
        this.saveNow();
        return;
      }
      if (param.integer) value = Math.round(value);
      if (param.min !== undefined && value < param.min) value = param.min;
      if (param.max !== undefined && value > param.max) value = param.max;
      this.config[param.key] = value;
      this.saveNow();
    },
    persistConfig() {
      if (this._destroyed) return;
      try {
        const ok = saveConfig(this.config);
        if (ok) {
          this.savingAt = new Date().toLocaleString();
        } else {
          this.configError = '配置保存失败，请检查浏览器存储设置';
        }
      } catch (e) {
        this.configError = e.message;
      }
    },
    resetConfig() {
      if (!window.confirm('确定恢复默认配置？当前配置将被清除。')) return;
      this.config = defaultConfig();
      this.persistConfig();
      this.models = [];
      this.modelFilterActive = false;
      this.configError = '';
    },
    applyImport() {
      if (!this.urlConfig) return;
      const source = this.urlConfig;
      // URL 参数优先，未提供的字段保留当前配置
      const next = Object.assign({}, defaultConfig(), this.config);
      ['name', 'baseUrl', 'apiKey', 'model', 'systemPrompt', 'useCustom', 'customTemplate'].forEach(key => {
        const val = source[key];
        if (val !== undefined && val !== null && val !== '') {
          if (typeof next[key] === 'boolean') next[key] = val;
          else if (typeof next[key] === 'number') next[key] = Number(val);
          else next[key] = String(val);
        }
      });
      // 导入带 key 时，只有 URL 也给了 baseUrl / model 才覆盖，避免只换 key 时清掉模型
      if (this.config.model && !source.model) next.model = this.config.model;
      this.config = next;
      this.persistConfig();
      this.modelFilterActive = false;
      this.showConfig = false;
      this.configError = '';
      this.clearUrlParams();
    },
    clearUrlParams() {
      this.urlConfig = null;
      const query = Object.assign({}, this.$route.query);
      delete query.api;
      delete query.endpoint;
      delete query.base;
      delete query.key;
      delete query.apikey;
      delete query.k;
      delete query.model;
      delete query.name;
      delete query.title;
      if (Object.keys(query).length !== Object.keys(this.$route.query).length) {
        this.$router.replace({ path: this.$route.path, query }).catch(() => {});
      }
    },
    async loadModels() {
      if (!this.config.baseUrl) {
        this.configError = '请先填写 API Base URL';
        return;
      }
      this.configError = '';
      this.modelsLoading = true;
      try {
        this.models = await fetchModels(this.config);
        if (!this.models.length) this.configError = '模型列表为空，请手动填写模型名';
      } catch (e) {
        this.models = [];
        this.configError = e.message || '模型列表加载失败';
      } finally {
        this.modelsLoading = false;
      }
    },
    selectModel(name) {
      this.config.model = name;
      this.modelFilterActive = false;
      this.saveNow();
    },
    resetModel() {
      this.config.model = '';
      this.modelFilterActive = false;
      this.saveNow();
    },
    isHttpUrl(url) {
      return /^https?:\/\//i.test(String(url || '').trim());
    },
    copyPresetUrl() {
      if (!this.presetUrl) return;
      this.doCopy(this.presetUrl).catch(() => {
        this.configError = '复制失败，请手动选择文本复制';
      });
    },
    // ---------- 多模态图片 ----------
    toggleImages() {
      if (this.generating) return;
      this.config.imagesEnabled = !this.config.imagesEnabled;
      this.saveNow();
      this.$nextTick(this.autoGrow);
    },
    onImagesChange(values) {
      this.config.images = values;
      this.saveNow();
    },
    removeImage(index) {
      if (this.generating) return;
      if (!(index >= 0 && index < this.config.images.length)) return;
      this.config.images.splice(index, 1);
      this.saveNow();
    },
    // 粘贴图片：自动开启图片开关，转 Base64 追加到图片列表
    onPasteImage(event) {
      if (this.generating) return;
      const clipboard = event.clipboardData;
      const items = clipboard && clipboard.items;
      if (!items) return;
      const files = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type && item.type.indexOf('image/') === 0) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (!files.length) return;
      // 剪贴板同时带文本时保留默认粘贴（文字照常插入），图片仍会被附加
      const text = String(clipboard.getData('text/plain') || '').trim();
      if (!text) event.preventDefault();
      if (!this.config.imagesEnabled) {
        this.config.imagesEnabled = true;
        this.saveNow();
        this.$nextTick(this.autoGrow);
      }
      files.forEach(file => this.importImageFile(file));
    },
    importImageFile(file) {
      if (!/^image\//.test(file.type)) {
        this.configError = '仅支持粘贴图片文件';
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        this.configError = '粘贴的图片过大（超过 4MB），请压缩后再试或改用图片 URL';
        return;
      }
      this.configError = '';
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (this.config.images.indexOf(dataUrl) === -1) {
          this.config.images.push(dataUrl);
          this.saveNow();
        }
      };
      reader.onerror = () => {
        this.configError = '读取图片失败，请重试';
      };
      reader.readAsDataURL(file);
    },
    copyText(text) {
      this.doCopy(text).catch(() => {
        this.configError = '复制失败，请手动选择文本复制';
      });
    },
    // ---------- 消息发送 ----------
    buildMessages() {
      const list = [];
      const sys = String(this.config.systemPrompt || '').trim();
      if (sys) list.push({ role: 'system', content: sys });
      this.messages.forEach(msg => {
        const content = String(msg.content || '').trim();
        if (!content) return;
        list.push({ role: msg.role, content });
      });
      return list;
    },
    trimHistoryForRequest(messages) {
      // 保守截断，避免历史过长：保留最近约 60 条
      const LIMIT = 60;
      if (messages.length <= LIMIT) return messages;
      const sys = messages[0] && messages[0].role === 'system' ? messages[0] : null;
      const rest = sys ? messages.slice(1) : messages;
      const kept = rest.slice(-LIMIT);
      return sys ? [sys].concat(kept) : kept;
    },
    onEnter() {
      if (this.composing) return;
      this.send();
    },
    async send() {
      const text = String(this.input || '').trim();
      if (this.generating) return;
      if (!text) {
        this.configError = '请输入消息内容';
        return;
      }
      if (text.length > MAX_CHARS) {
        this.configError = '单条消息不能超过 ' + MAX_CHARS + ' 字符';
        return;
      }
      if (!this.hasConfig) {
        this.showConfig = true;
        this.configError = '请先完善模型配置（Base URL、模型名等）';
        return;
      }
      this.configError = '';
      // 随消息快照本轮图片，用于气泡展示（请求体由 api 层注入最后一条 user 消息）
      const images = this.config.imagesEnabled ? sanitizeImages(this.config.images) : [];
      this.messages.push({ id: nextMsgId(), role: 'user', content: text, images, ts: Date.now() });
      this.input = '';
      this.autoGrow();
      await this.generate();
    },
    async generate() {
      if (this.generating) return;
      this.generating = true;
      this.streamText = '';
      this.streamReasoning = '';
      this.sseEvents = [];
      this.lastRequestAt = new Date().toLocaleString();
      this.streamEpoch += 1;
      const generation = this.streamEpoch;

      this.abortCtrl = new AbortController();
      const onDelta = text => { this.streamText += text; };
      const onReasoning = text => { this.streamReasoning += text; };
      const onEvent = ev => {
        this.sseEvents.push(ev);
      };

      try {
        const payloadMsgs = this.trimHistoryForRequest(this.buildMessages());
        const result = await sendMessage(
          this.config,
          payloadMsgs,
          { onDelta, onReasoning, onEvent, signal: this.abortCtrl.signal }
        );
        let content = result.content || '';
        if (result.interrupted) {
          this.configError = result.interrupted;
        }
        this.messages.push({
          id: nextMsgId(),
          role: 'assistant',
          content: content || '（模型返回空内容）',
          reasoning: result.reasoning || '',
          usage: result.usage || null,
          showThink: false,
          ts: Date.now()
        });
      } catch (e) {
        if (e && e.name === 'AbortError') {
          // 对话已清空或后续请求已开始，本次结果作废
          if (generation !== this.streamEpoch) return;
          // 用户主动停止：把已生成部分作为正常回复保留
          const part = this.streamText.trim();
          this.messages.push({
            id: nextMsgId(),
            role: 'assistant',
            content: part || '（已停止生成）',
            reasoning: this.streamReasoning,
            usage: null,
            showThink: false,
            ts: Date.now()
          });
        } else {
          this.configError = (e && e.message) || '请求失败，请检查配置';
        }
      } finally {
        this.generating = false;
        this.streamText = '';
        this.streamReasoning = '';
        this.abortCtrl = null;
        this.$nextTick(this.scrollBottom);
      }
    },
    stop() {
      if (this.abortCtrl) this.abortCtrl.abort();
    },
    clearChat() {
      if (!this.messages.length) return;
      if (this.generating) {
        // 提升请求代数，使中断回调不再回填内容
        this.streamEpoch += 1;
        this.stop();
      }
      this.messages = [];
      this.configError = '';
    },
    applyPreset(text) {
      this.input = text;
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus();
        this.autoGrow();
      });
    },
    // ---------- 消息操作 ----------
    findMsgIndex(msg) {
      return this.messages.findIndex(m => m.id === msg.id);
    },
    retryFrom(msg) {
      if (this.generating) return;
      const idx = this.findMsgIndex(msg);
      if (idx === -1) return;
      // 重试时丢弃该消息之后的所有消息；assistant 重试时由其内容重新生成一条 user 消息
      const isUser = msg.role === 'user';
      const content = msg.content;
      this.messages = this.messages.slice(0, idx + (isUser ? 1 : 0));
      if (!isUser) {
        this.messages.push({ id: nextMsgId(), role: 'user', content, images: msg.images || [], ts: Date.now() });
      }
      this.generate();
    },
    editMsg(msg) {
      if (this.generating) return;
      const idx = this.findMsgIndex(msg);
      if (idx === -1) return;
      this.messages = this.messages.slice(0, idx);
      this.input = msg.content;
      this.$nextTick(() => {
        if (this.$refs.input) {
          this.$refs.input.focus();
          this.autoGrow();
        }
      });
    },
    deleteMsg(msg) {
      if (this.generating) return;
      const idx = this.findMsgIndex(msg);
      if (idx === -1) return;
      this.messages.splice(idx, 1);
    },
    switchRole(msg) {
      if (this.generating) return;
      msg.role = 'user';
      this.$delete(msg, 'reasoning');
      this.$delete(msg, 'usage');
    },
    copyMsg(msg) {
      this.doCopy(msg.content).catch(() => {
        this.configError = '复制失败，请手动选择文本复制';
      });
    },
    doCopy(text) {
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        return ok ? Promise.resolve() : Promise.reject(new Error('复制失败'));
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(fallback);
      }
      return fallback();
    },
    exportChat() {
      const exportableConfig = Object.assign({}, this.config);
      delete exportableConfig.apiKey;
      delete exportableConfig.name;
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        config: exportableConfig,
        messages: this.messages.map(m => ({ role: m.role, content: m.content }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ai-playground-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    },
    importChat() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(String(reader.result || '{}'));
            if (Array.isArray(data.messages)) {
              this.messages = data.messages
                .filter(m => m && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
                .map(m => ({
                  id: nextMsgId(),
                  role: m.role === 'system' ? 'assistant' : m.role,
                  content: String(m.content || ''),
                  ts: Date.now()
                }));
            }
            if (data.config && typeof data.config === 'object') {
              const summary = [data.config.baseUrl, data.config.model]
                .filter(Boolean)
                .join(' · ');
              const merge =
                !summary ||
                window.confirm('导入文件包含接入配置：' + summary + '\n是否同时应用该配置（将覆盖当前配置）？');
              if (!merge) {
                this.configError = '已导入对话，配置保持不变';
                setTimeout(() => { this.configError = ''; }, 2500);
                return;
              }
              const defaults = defaultConfig();
              const next = Object.assign({}, defaults, this.config);
              Object.keys(defaults).forEach(key => {
                const incoming = data.config[key];
                if (isCompatibleValue(incoming, defaults[key], key) && incoming !== '') {
                  next[key] = incoming;
                }
              });
              this.config = next;
              this.persistConfig();
            }
            this.configError = '导入完成';
            setTimeout(() => { this.configError = ''; }, 2500);
          } catch (e) {
            this.configError = '导入失败：文件不是合法 JSON';
          }
        };
        reader.onerror = () => {
          this.configError = '导入失败：文件读取错误';
        };
        reader.readAsText(file);
        // 允许再次选择同名文件
        input.value = '';
      };
      input.click();
    },
    // ---------- 渲染辅助 ----------
    // 白名单渲染：先整体转义（含引号），替换结果只含 strong/em/code/pre/a 标签，
    // 链接地址仅允许 http(s)，阻断属性突破注入与 javascript: 伪协议。
    renderMarkdown(text) {
      const raw = String(text || '');
      let safe = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      safe = safe.replace(/`([^`\n]+)`/g, '<code class="md-inline">$1</code>');
      safe = safe.replace(/```(\w*)(?:\n|\s)([\s\S]*?)\s*```/g, (m, lang, code) => {
        return '<pre class="md-code"><code>' + code + '</code></pre>';
      });
      safe = safe.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
      safe = safe.replace(/!\[([^\]\n]*)\]\(([^)\s]+)\)/g, '$1');
      safe = safe.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (m, linkText, url) => {
        return this.safeLink(url)
          ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + linkText + '</a>'
          : linkText;
      });
      return safe.replace(/\n/g, '<br>');
    },
    safeLink(url) {
      const decoded = String(url || '').trim().replace(/\\/g, '/').toLowerCase();
      return decoded.indexOf('http://') === 0 || decoded.indexOf('https://') === 0;
    },
    autoGrow() {
      const el = this.$refs.input;
      if (!el) return;
      el.style.height = 'auto';
      const next = Math.min(el.scrollHeight, 200);
      el.style.height = next + 'px';
    },
    scrollBottom() {
      const box = this.$refs.msgs;
      if (box) box.scrollTop = box.scrollHeight;
    }
  },
  watch: {
    // 隐藏调试栏时退出放大态，避免残留的定位类
    showDebug(on) {
      if (!on) this.debugMaximized = false;
    },
    // 流式输出时始终滚到底部
    streamText() {
      this.$nextTick(this.scrollBottom);
    },
    streamReasoning() {
      this.$nextTick(this.scrollBottom);
    },
    messages: {
      handler() {
        this.$nextTick(this.scrollBottom);
      },
      deep: false
    }
  }
};
</script>

<style scoped>
.ai-playground {
  padding-bottom: 1rem;
}

/* ---------- 头部横幅（与 AI 检测助手同款式样） ---------- */
.ai-head .container {
  /* 标题与 /service/ai-detect 同宽，保持站点水平边距 */
  max-width: 1140px;
}

.ai-head {
  padding: 2.4rem 0 1.6rem;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #eef6fc 0%, #e5effa 100%);
  border-bottom: 1px solid var(--line);
  text-align: left;
}

.ai-head .back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
  color: var(--accent-dark);
  font-size: 0.85rem;
  text-decoration: none;
}

.ai-head .back-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.head-tag {
  display: block;
  color: #2470a0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  margin-bottom: 0.5rem;
}

.ai-head h1 {
  font-size: 2.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.ai-head p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.95rem;
  line-height: 1.65;
}

@media (min-width: 992px) {
  /* 桌面端导航栏是 absolute 悬浮在顶部（约 68px），留出间距避免遮住返回链接 */
  .ai-head {
    padding: 4.6rem 0 1.5rem;
  }

  .ai-head h1 {
    font-size: 1.9rem;
    margin-bottom: 0.35rem;
  }
}

.pg-body {
  /* 有意与标题区不同宽：标题沿用站点容器（1140px）保持左缘对齐，
     三栏工作台则铺满视口，只留一层随视口增长的边距，避免超宽屏浪费空间 */
  width: 100%;
  max-width: 100%;
  padding-left: clamp(15px, 2vw, 48px);
  padding-right: clamp(15px, 2vw, 48px);
  padding-bottom: 2rem;
  text-align: left;
}

/* ---------- 三栏应用外壳 ---------- */
.pg-shell {
  display: grid;
  /* 侧栏随视口连续变宽，中栏始终吃掉剩余空间，跨断点不会回缩 */
  grid-template-columns: clamp(260px, 21vw, 380px) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: clamp(1rem, 1.2vw, 1.5rem);
  align-items: stretch;
  height: calc(100vh - 300px);
  min-height: 440px;
}

.pg-shell.with-debug {
  grid-template-columns: clamp(260px, 21vw, 380px) minmax(0, 1fr) clamp(320px, 27vw, 520px);
}

.pg-side,
.pg-debug {
  min-width: 0;
}

.pg-chat {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pg-side {
  position: sticky;
  top: 84px;
}

.pg-debug {
  position: sticky;
  top: 84px;
}

/* 调试面板放大为 fixed 覆盖层时，解除 sticky 造成的层叠上下文，否则会被导航栏压住 */
.pg-shell.debug-maximized .pg-debug {
  position: static;
}

/* ---------- 通用卡片 ---------- */
.side-card,
.chat-card,
.debug-card,
.tip-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* ---------- 左侧配置栏 ---------- */
.side-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.85rem 0.9rem 0;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  flex-shrink: 0;
}

.side-title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink);
}

.side-title i {
  font-size: 0.8rem;
  color: var(--brand-dark);
}

.side-collapse {
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.72rem;
  padding: 0.1rem 0.2rem;
  cursor: pointer;
}

.side-collapse:hover {
  color: var(--brand-dark);
}

.side-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* 横向不滚动：由 overflow-x 兜底，padding/margin 只为留出聚焦光环空间 */
  overflow-x: hidden;
  padding-top: 0.25rem;
  padding-left: 0.25rem;
  margin-left: -0.25rem;
  padding-right: 0.4rem;
  padding-bottom: 0.7rem;
}

/* 细滚动条 */
.side-scroll::-webkit-scrollbar {
  width: 6px;
}

.side-scroll::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.14);
  border-radius: 999px;
}

.side-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.24);
}

.side-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.side-section {
  padding: 0.7rem 0;
  border-top: 1px solid var(--line);
}

.side-scroll > .switch-row:first-child + .side-section {
  border-top: 0;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink-muted);
  letter-spacing: 0.04em;
  margin-bottom: 0.45rem;
}

.field + .field {
  margin-top: 0.6rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.28rem;
}

.field-label i {
  font-size: 0.68rem;
  color: var(--ink-muted);
}

.field-input {
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-alt);
  font-size: 0.78rem;
  height: auto;
  padding: 0.4rem 0.55rem;
  color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.field-input:focus {
  background: var(--surface);
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}

.field-mono {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

.field-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.66rem;
  color: var(--ink-muted);
  line-height: 1.55;
}

.field-help code {
  background: var(--surface-alt);
  border-radius: 3px;
  padding: 0.02rem 0.2rem;
  font-size: 0.64rem;
}

.key-input-wrap {
  position: relative;
}

.key-input-wrap .field-input {
  padding-right: 2rem;
}

.key-toggle {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  padding: 0.1rem 0.3rem;
  font-size: 0.7rem;
  cursor: pointer;
}

.key-toggle:hover {
  color: var(--brand-dark);
}

/* 开关行 */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0;
  border-top: 1px solid var(--line);
}

.switch-row:first-child {
  border-top: 0;
}

.switch-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}

.switch-label i {
  font-size: 0.68rem;
  color: var(--ink-muted);
}

.custom-control.custom-switch {
  padding-left: 2.2rem;
  min-height: auto;
}

.custom-control-label::before {
  top: 0.2rem;
}

.custom-control-label::after {
  top: 0.2rem;
}

.custom-control-input:checked ~ .custom-control-label::before {
  background-color: var(--brand);
  border-color: var(--brand);
}

.custom-tpl {
  font-size: 0.7rem;
  line-height: 1.6;
  resize: vertical;
}

/* 模型输入 */
.model-input-row {
  display: flex;
  gap: 0.35rem;
}

.model-input-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.model-input-wrap .field-input {
  width: 100%;
  padding-left: 1.65rem;
  padding-right: 1.65rem;
}

.model-input-icon {
  position: absolute;
  left: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.64rem;
  color: var(--ink-muted);
  pointer-events: none;
}

.model-clear-btn {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.58rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.model-clear-btn:hover {
  background: var(--surface-alt);
  color: var(--ink);
}

.model-count {
  margin: 0.35rem 0 0;
  font-size: 0.64rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

.model-none {
  margin: 0.35rem 0 0;
  padding: 0.35rem 0.4rem;
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  font-size: 0.68rem;
  color: var(--ink-muted);
}

.icon-btn {
  flex-shrink: 0;
  width: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--ink-muted);
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover:not(:disabled) {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand-dark);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 0.4rem;
  max-height: 180px;
  overflow-y: auto;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
}

.model-item {
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 0.72rem;
  padding: 0.25rem 0.4rem;
  border-radius: 5px;
  color: var(--ink-soft);
  word-break: break-all;
  cursor: pointer;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

.model-item:hover {
  background: var(--accent-soft);
}

.model-item.active {
  background: var(--brand-soft);
  color: var(--brand-dark);
  font-weight: 600;
}

/* 采样参数 */
.param-field + .param-field {
  margin-top: 0.6rem;
}

.param-field.off .param-name,
.param-field.off .param-value,
.param-field.off .field-help {
  opacity: 0.5;
}

.param-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.param-name {
  margin: 0;
  min-width: 0;
  flex: 0 1 auto;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-spacer {
  flex: 1;
}

.param-value {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--brand-dark);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.param-toggle {
  position: relative;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #cbd5e1;
  font-size: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease, transform 0.15s ease;
}

/* 视觉仍是小圆点，命中区扩到 24px；靠右对齐避免撑出滚动条 */
.param-toggle::before {
  content: "";
  position: absolute;
  top: 50%;
  right: -4px;
  width: 24px;
  height: 24px;
  transform: translateY(-50%);
}

.param-toggle:hover {
  transform: scale(1.15);
}

.param-toggle.on {
  color: var(--brand);
}

.range:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.num-input {
  width: 11ch;
  /* 字号放大后仍能容纳 10 位数字：ch 随字号增长，min 兜底默认字号 */
  min-width: max(88px, calc(10ch + 0.7rem + 2px));
  flex-shrink: 0;
  appearance: textfield;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-alt);
  padding: 0.1rem 0.35rem;
  font-size: 0.72rem;
  text-align: right;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.num-input:focus {
  outline: none;
  border-color: var(--brand);
  background: var(--surface);
}

.num-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 隐藏原生加减按钮，避免遮挡 10 位数值的末位 */
.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}


.range {
  width: 100%;
  height: 4px;
  margin: 0.2rem 0 0.1rem;
  border-radius: 999px;
  background: var(--line);
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  cursor: pointer;
}

.range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--brand);
  border: 2px solid var(--surface);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  cursor: pointer;
}

.range::-moz-range-thumb {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--brand);
  border: 2px solid var(--surface);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  cursor: pointer;
}

/* 底部 */
.side-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.8rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--line);
  font-size: 0.66rem;
  color: var(--ink-muted);
}

.saved-at {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-btn {
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.66rem;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.link-btn.danger:hover {
  color: #dc2626;
}

/* 折叠态摘要 */
.config-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
  padding: 0.2rem 0;
}

.summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-soft);
  color: var(--brand-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.summary-main {
  flex: 1;
  min-width: 0;
}

.summary-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-model {
  margin-top: 0.1rem;
  font-size: 0.68rem;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.summary-ok {
  color: var(--brand-dark);
  flex-shrink: 0;
}

.summary-missing {
  color: #b45309;
  flex-shrink: 0;
}

.summary-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-arrow {
  color: var(--ink-muted);
  font-size: 0.7rem;
}

/* ---------- 中间对话区 ---------- */
.chat-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.7rem 0.95rem;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.chat-id {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.chat-head-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--brand-soft);
  color: var(--brand-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.chat-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.25;
}

.chat-sub {
  font-size: 0.68rem;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.chat-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.72rem;
  padding: 0.28rem 0.5rem;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ghost-btn:hover {
  background: var(--surface-alt);
  color: var(--brand-dark);
  border-color: var(--line);
}

.ghost-btn.on {
  background: var(--brand-soft);
  color: var(--brand-dark);
  border-color: transparent;
}

/* URL 导入 */
.url-import {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.6rem 0.9rem 0;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  border: 1px solid rgba(30, 207, 202, 0.25);
  flex-shrink: 0;
}

.url-import-main {
  flex: 1;
  min-width: 0;
}

.url-import-title {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--brand-dark);
}

.url-import-line {
  display: block;
  font-size: 0.66rem;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  padding: 0;
}

/* 消息区 */
.chat-msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 0.95rem;
  background: var(--surface);
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
}

.msg-user {
  flex-direction: row;
  justify-content: flex-end;
}

.msg-assistant {
  justify-content: flex-start;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.ai-avatar {
  background: var(--brand-soft);
  color: var(--brand-dark);
}

.user-avatar {
  background: var(--accent);
  color: #fff;
}

.msg-main {
  min-width: 0;
  max-width: calc(100% - 46px);
  display: flex;
  flex-direction: column;
}

.msg-user .msg-main {
  align-items: flex-end;
}

.msg-assistant .msg-main {
  align-items: flex-start;
  flex: 1;
}

.bubble {
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  font-size: 0.83rem;
  line-height: 1.72;
  word-break: break-word;
  max-width: 100%;
}

.user-bubble {
  background: var(--accent);
  color: #fff;
  border-top-right-radius: 4px;
}

.user-bubble ::v-deep a {
  color: #fff;
  text-decoration: underline;
}

/* 气泡内图片 */
.bubble-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
}

.bubble-image {
  display: block;
  width: 96px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.16);
  object-fit: cover;
}

.bubble-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.msg-assistant .msg-text {
  font-size: 0.83rem;
  line-height: 1.75;
  color: var(--ink);
  word-break: break-word;
  max-width: 100%;
}

.msg-text ::v-deep p {
  margin: 0 0 0.5rem;
}

.msg-text ::v-deep p:last-child {
  margin-bottom: 0;
}

.msg-text ::v-deep .md-code {
  margin: 0.5rem 0;
  padding: 0.6rem 0.75rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.72rem;
  line-height: 1.6;
  overflow-x: auto;
}

.msg-text ::v-deep .md-inline {
  background: var(--accent-soft);
  padding: 0.05rem 0.28rem;
  border-radius: 4px;
  font-size: 0.76rem;
  color: var(--accent-dark);
}

.msg-text ::v-deep a {
  color: var(--accent-dark);
  word-break: break-all;
}

/* 思考过程 */
.think-block {
  width: 100%;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--surface-alt);
}

.think-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent-dark);
  cursor: pointer;
  user-select: none;
}

.think-head:hover {
  background: var(--accent-soft);
}

.think-head .chev {
  margin-left: auto;
  font-size: 0.62rem;
  color: var(--ink-muted);
}

.think-body {
  margin: 0;
  padding: 0.4rem 0.65rem 0.6rem;
  max-height: 220px;
  overflow-y: auto;
  font-size: 0.7rem;
  line-height: 1.7;
  color: var(--ink-soft);
  white-space: pre-wrap;
  word-break: break-word;
  border-top: 1px solid var(--line);
}

.msg-text ::v-deep .stream-caret {
  display: inline-block;
  animation: blink 1s steps(2, start) infinite;
  color: var(--brand-dark);
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

.msg-usage {
  margin-top: 0.35rem;
  font-size: 0.64rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

/* 消息操作 */
.msg-tools {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  margin-top: 0.3rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.msg-row:hover .msg-tools,
.msg-tools:focus-within {
  opacity: 1;
}

.msg-tools button {
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  width: 22px;
  height: 22px;
  border-radius: 5px;
  font-size: 0.64rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.msg-tools button:hover {
  background: var(--surface-alt);
  color: var(--brand-dark);
}

/* 空态 */
.chat-empty {
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--ink-muted);
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--brand-soft);
  color: var(--brand-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  margin-bottom: 0.85rem;
}

.chat-empty h6 {
  color: var(--ink);
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.chat-empty p {
  font-size: 0.78rem;
  line-height: 1.7;
  margin: 0 0 1rem;
}

.empty-presets {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: min(420px, 92%);
}

.empty-preset {
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 9px;
  padding: 0.45rem 0.8rem;
  font-size: 0.76rem;
  color: var(--ink-soft);
  transition: all 0.15s ease;
  text-align: left;
  cursor: pointer;
}

.empty-preset:hover {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand-dark);
}

/* 输入区 */
.chat-input-wrap {
  border-top: 1px solid var(--line);
  padding: 0.65rem 0.95rem 0.5rem;
  flex-shrink: 0;
}

.input-box {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-alt);
  padding: 0.45rem 0.5rem 0.4rem 0.7rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

/* 输入区图片缩略图 */
.input-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  max-height: 132px;
  overflow-y: auto;
}

.input-image {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--surface-alt);
}

.input-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.input-image-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.62);
  color: #fff;
  font-size: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.input-image-del:hover:not(:disabled) {
  background: #ef4444;
}

.input-image-del:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.input-box:focus-within {
  border-color: var(--brand);
  background: var(--surface);
  box-shadow: 0 0 0 3px var(--brand-soft);
}

.chat-input {
  width: 100%;
  resize: none;
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 0.83rem;
  line-height: 1.6;
  max-height: 180px;
  outline: none;
  color: var(--ink);
}

.chat-input::placeholder {
  color: var(--ink-muted);
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.input-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.64rem;
  color: var(--ink-muted);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-hint i.on {
  color: var(--brand-dark);
}

.input-count {
  font-size: 0.64rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.input-count.over {
  color: #dc2626;
  font-weight: 700;
}

.send-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border: 0;
  border-radius: 8px;
  background: var(--brand);
  color: #fff;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.send-btn.stop {
  background: #ef4444;
}

.send-btn:not(:disabled):hover {
  background: var(--brand-dark);
}

.chat-input-foot {
  margin-top: 0.4rem;
  font-size: 0.64rem;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.chat-input-foot i {
  font-size: 0.6rem;
}

.error-text {
  margin: 0 0 0.5rem;
  padding: 0.4rem 0.65rem;
  border-radius: 7px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.72rem;
  border: 1px solid #fecaca;
}

/* ---------- 提示卡 ---------- */
.tip-card {
  margin-top: 0.9rem;
  padding: 0;
}

.tip-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0.65rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
}

.tip-toggle:hover {
  background: var(--surface-alt);
}

.tip-toggle > i:first-child {
  color: #d97706;
  font-size: 0.72rem;
}

.tip-chev {
  margin-left: auto;
  font-size: 0.62rem;
  color: var(--ink-muted);
}

.tip-body {
  padding: 0 0.95rem 0.8rem;
}

.tip-body ul {
  padding-left: 1.05rem;
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

.tip-body li + li {
  margin-top: 0.1rem;
}

.tip-body code {
  background: var(--surface-alt);
  border-radius: 3px;
  padding: 0.08rem 0.3rem;
  font-size: 0.7rem;
  word-break: break-all;
}

.tip-export {
  margin-top: 0.6rem;
  padding-top: 0.55rem;
  border-top: 1px dashed var(--line);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

/* ---------- 右侧调试栏 ---------- */
.debug-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.debug-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.debug-head-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.debug-id {
  min-width: 0;
}

.debug-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.25;
}

.debug-sub {
  font-size: 0.64rem;
  color: var(--ink-muted);
}

.debug-content {
  flex: 1;
  min-height: 0;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1199.98px) {
  .pg-shell,
  .pg-shell.with-debug {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  /* 调试栏换行到第二行时外壳改为自适应高度，避免第一行被固定行高挤压 */
  .pg-shell.with-debug {
    height: auto;
    min-height: 0;
    grid-template-rows: auto auto;
  }

  /* 调试栏换到第二行后，左栏不再悬浮，避免滚动时压在调试卡上 */
  .pg-shell.with-debug .pg-side {
    position: static;
  }

  .pg-debug {
    grid-column: 1 / -1;
    position: static;
  }

  .debug-card {
    height: 460px;
    min-height: 0;
  }
}

/* 平板：调试栏换行时固定对话卡与配置卡高度，让内容区内部滚动而非把输入框顶出视口 */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .pg-shell.with-debug .chat-card {
    flex: 0 0 auto;
    height: calc(100vh - 300px);
    min-height: 440px;
  }

  .pg-shell.with-debug .side-card {
    height: calc(100vh - 300px);
    min-height: 440px;
  }
}

@media (max-width: 991.98px) {
  .pg-shell,
  .pg-shell.with-debug {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
  }

  .pg-chat {
    height: auto;
  }

  .pg-side,
  .pg-debug {
    position: static;
  }

  .side-card {
    height: auto;
    min-height: 0;
    padding-bottom: 0.7rem;
  }

  .side-scroll {
    overflow: visible;
  }

  .chat-card {
    flex: 0 0 auto;
    height: 72vh;
    min-height: 460px;
  }

  .debug-card {
    height: 420px;
  }

  .chat-sub {
    max-width: 180px;
  }

  .msg-main {
    max-width: calc(100% - 42px);
  }
}
</style>
