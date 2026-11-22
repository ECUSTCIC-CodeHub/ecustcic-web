<template>
  <div class="list-page">
    <div class="list-head">
      <div>
        <h3 class="list-title">图片存储</h3>
        <p class="list-desc mb-0">
          活动封面与正文图片都存在 Blob 中。被内容引用的文件标注为「使用中」，不允许删除。
          删除后 CDN 缓存可能仍能访问数小时，但存储中的文件已移除。
        </p>
      </div>
      <button class="btn btn-cic-outline" :disabled="loading" @click="load">
        <i class="fas fa-sync-alt mr-2"></i>{{ loading ? '加载中…' : '刷新' }}
      </button>
    </div>

    <div class="stats">
      <span class="stat">共 <strong>{{ blobs.length }}</strong> 个文件</span>
      <span class="stat">
        合计 <strong>{{ totalSizeText }}</strong>
        <template v-if="missingSize">（另有 {{ missingSize }} 个未统计）</template>
      </span>
      <span class="stat stat-ok"><strong>{{ contentsFetched ? usedCount : '—' }}</strong> 个使用中</span>
      <span class="stat stat-warn"><strong>{{ contentsFetched ? unusedCount : '—' }}</strong> 个未引用</span>
    </div>

    <div class="list-toolbar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model.trim="keyword" type="search" placeholder="搜索文件名" />
      </div>
      <label class="filter-check">
        <input v-model="onlyUnused" type="checkbox" :disabled="!contentsFetched" />
        只看未引用
      </label>
      <div v-if="selected.length" class="batch-actions">
        <span class="batch-count">已选 {{ selected.length }} 个</span>
        <button class="btn btn-sm btn-outline-danger" :disabled="batchDeleting" @click="removeSelected">
          {{ batchDeleting ? '删除中…' : '批量删除' }}
        </button>
        <button class="btn btn-sm btn-outline-secondary" :disabled="batchDeleting" @click="selected = []">
          取消选择
        </button>
      </div>
    </div>

    <div v-if="usageError" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      无法读取内容引用情况（{{ usageError }}），为避免误删，删除操作已禁用。请先点「刷新」重试。
    </div>

    <div v-if="truncated" class="alert alert-warning">
      <i class="fas fa-info-circle mr-2"></i>
      文件数量超过 {{ blobs.length }} 个，列表已截断。
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3 mb-0">正在加载…</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>{{ error }}
      <button class="btn btn-sm btn-outline-danger ml-3" @click="load">重试</button>
    </div>

    <div v-else-if="blobs.length === 0" class="empty cic-card">
      <i class="far fa-folder-open"></i>
      <h5>存储里还没有图片</h5>
      <p class="text-muted mb-0">在活动/快讯编辑器里上传封面后会出现在这里。</p>
    </div>

    <div v-else-if="filtered.length === 0" class="empty cic-card">
      <i class="fas fa-search"></i>
      <h5>没有匹配的文件</h5>
      <p class="text-muted mb-0">试试其它关键词，或取消「只看未引用」。</p>
    </div>

    <div v-else class="cic-card table-wrap">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th class="col-check">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate.prop="someSelected"
                :disabled="selectableKeys.length === 0"
                title="全选当前可删除的文件"
                @change="toggleAll"
              />
            </th>
            <th class="col-thumb">预览</th>
            <th class="col-file">文件</th>
            <th class="col-size">大小</th>
            <th class="col-usage">使用情况</th>
            <th class="col-actions text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.key" :class="{ 'row-selected': isSelected(item.key) }">
            <td class="col-check">
              <input
                v-model="selected"
                type="checkbox"
                :value="item.key"
                :disabled="!canDelete(item)"
                :title="canDelete(item) ? '' : deleteHint(item)"
              />
            </td>
            <td>
              <a :href="urlOf(item.key)" target="_blank" rel="noopener" class="thumb-link">
                <img :src="urlOf(item.key)" class="thumb" alt="" loading="lazy" />
              </a>
            </td>
            <td>
              <div class="file-name">{{ fileName(item.key) }}</div>
              <div class="file-key">{{ item.key }}</div>
            </td>
            <td class="nowrap">{{ sizeText(item.size) }}</td>
            <td>
              <div v-if="refsOf(item.key).length" class="refs">
                <span class="tag tag-live">使用中</span>
                <span v-for="ref in refsOf(item.key).slice(0, 2)" :key="ref.id" class="ref">
                  {{ ref.kind === 'news' ? '快讯' : '活动' }}「{{ ref.title }}」
                </span>
                <span v-if="refsOf(item.key).length > 2" class="ref-more">
                  等 {{ refsOf(item.key).length }} 处
                </span>
              </div>
              <span v-else-if="contentsFetched" class="tag tag-hidden">未被引用</span>
              <span v-else class="tag tag-link">引用未知</span>
            </td>
            <td class="text-right nowrap">
              <button
                class="btn btn-sm btn-outline-danger"
                :disabled="!canDelete(item) || deletingKey === item.key || batchDeleting"
                :title="deleteHint(item)"
                @click="remove(item)"
              >{{ deletingKey === item.key ? '删除中…' : '删除' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getAdminToken, clearAdminToken } from '@/api/adminAuth';
import { getActivities } from '@/api/edgeActivities';
import { listBlobs, deleteBlob } from '@/api/storage';

// 从正文/封面 URL 中提取 Blob key：/api/activity-image?key=covers%2Fxxx.jpg
const IMAGE_URL_RE = /\/api\/activity-image\?key=([^)"'\s<>]+)/g;

function extractKeys(text) {
  const keys = [];
  if (!text) return keys;
  IMAGE_URL_RE.lastIndex = 0;
  let match;
  while ((match = IMAGE_URL_RE.exec(text)) !== null) {
    const raw = match[1];
    if (!raw) continue;
    // 去掉可能追加的额外参数（如 &cb=123），再还原 %2F
    let key = raw.split('&')[0];
    try {
      key = decodeURIComponent(key);
    } catch (e) {
      // 非法编码就按原样处理
    }
    keys.push(key);
  }
  return keys;
}

function formatSize(size) {
  if (size === null || size === undefined) return '—';
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(0) + ' KB';
  return (size / 1024 / 1024).toFixed(1) + ' MB';
}

export default {
  name: 'StorageList',
  data() {
    return {
      blobs: [],
      usage: {},
      // 内容列表是否成功读取：未读取时不允许删除（可能误删）
      contentsFetched: false,
      usageError: '',
      loading: true,
      error: '',
      keyword: '',
      onlyUnused: false,
      deletingKey: '',
      // 批量操作：选中的 key 列表
      selected: [],
      batchDeleting: false,
      truncated: false
    };
  },
  computed: {
    filtered() {
      const kw = this.keyword.toLowerCase();
      let list = this.blobs;
      if (this.onlyUnused && this.contentsFetched) {
        list = list.filter(item => !this.isUsed(item.key));
      }
      if (!kw) return list;
      return list.filter(item => item.key.toLowerCase().indexOf(kw) >= 0);
    },
    usedCount() {
      return this.blobs.filter(item => this.isUsed(item.key)).length;
    },
    unusedCount() {
      return this.contentsFetched ? this.blobs.length - this.usedCount : 0;
    },
    totalSize() {
      return this.blobs.reduce((sum, item) => sum + (item.size || 0), 0);
    },
    totalSizeText() {
      return formatSize(this.totalSize);
    },
    missingSize() {
      return this.blobs.filter(item => item.size === null || item.size === undefined).length;
    },
    // 当前筛选结果里允许删除的 key（被引用的不可选）
    selectableKeys() {
      return this.filtered.filter(item => this.canDelete(item)).map(item => item.key);
    },
    allSelected() {
      const keys = this.selectableKeys;
      return keys.length > 0 && keys.every(key => this.selected.indexOf(key) >= 0);
    },
    someSelected() {
      return this.selected.length > 0 && !this.allSelected;
    }
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = '';
      this.usageError = '';
      try {
        const token = await getAdminToken();
        const [storage, contents] = await Promise.all([
          listBlobs(token, { withSize: true }),
          // 引用检测失败不影响列表展示，但会禁用删除
          getActivities({ includeHidden: true, token }).catch(err => {
            this.usageError = err.message || '未知错误';
            return null;
          })
        ]);

        this.blobs = (storage && storage.blobs) || [];
        this.truncated = !!(storage && storage.truncated);
        if (contents) {
          this.buildUsage(contents);
        } else {
          this.usage = {};
          this.contentsFetched = false;
        }
      } catch (e) {
        if (e.status === 401) {
          clearAdminToken();
          this.error = '鉴权失败：管理凭证已失效。请重新登录后再试。';
        } else {
          this.error = e.message || '加载失败';
        }
      }
      this.loading = false;
      // 刷新后剔除已不存在的选中项
      const keys = this.blobs.map(item => item.key);
      this.selected = this.selected.filter(key => keys.indexOf(key) >= 0);
    },
    buildUsage(items) {
      const usage = {};
      items.forEach(item => {
        const keys = extractKeys(item.cover).concat(extractKeys(item.content));
        Array.from(new Set(keys)).forEach(key => {
          if (!usage[key]) usage[key] = [];
          usage[key].push({
            id: item.id,
            title: item.title,
            kind: item.kind,
            hidden: !!item.hidden
          });
        });
      });
      this.usage = usage;
      this.contentsFetched = true;
    },
    isSelected(key) {
      return this.selected.indexOf(key) >= 0;
    },
    toggleAll(event) {
      const keys = this.selectableKeys;
      if (event.target.checked) {
        const merged = this.selected.concat(keys.filter(key => this.selected.indexOf(key) < 0));
        this.selected = merged;
      } else {
        this.selected = this.selected.filter(key => keys.indexOf(key) < 0);
      }
    },
    refsOf(key) {
      return this.usage[key] || [];
    },
    isUsed(key) {
      return this.refsOf(key).length > 0;
    },
    canDelete(item) {
      return this.contentsFetched && !this.isUsed(item.key);
    },
    deleteHint(item) {
      if (!this.contentsFetched) return '引用情况未知，暂不允许删除';
      const refs = this.refsOf(item.key);
      if (refs.length) {
        return '该文件被「' + refs.map(r => r.title).join('」「') + '」引用，不允许删除';
      }
      return '删除后不可恢复';
    },
    urlOf(key) {
      return '/api/activity-image?key=' + encodeURIComponent(key);
    },
    fileName(key) {
      return String(key || '').split('/').pop();
    },
    sizeText(size) {
      return formatSize(size);
    },
    async remove(item) {
      if (!this.canDelete(item)) return;
      if (!confirm(`确认删除「${this.fileName(item.key)}」吗？删除后不可恢复。`)) return;

      this.deletingKey = item.key;
      try {
        const token = await getAdminToken();
        await deleteBlob(token, item.key);
        this.blobs = this.blobs.filter(b => b.key !== item.key);
      } catch (e) {
        if (e.status === 401) clearAdminToken();
        alert('删除失败: ' + (e.message || '未知错误'));
      }
      this.deletingKey = '';
    },
    // 批量删除：串行执行，避免一次性打太多请求
    async removeSelected() {
      const targets = this.blobs.filter(item => this.isSelected(item.key) && this.canDelete(item));
      if (!targets.length) return;
      if (!confirm(`确认删除选中的 ${targets.length} 个文件吗？删除后不可恢复。`)) return;

      this.batchDeleting = true;
      const deleted = [];
      const failed = [];

      try {
        const token = await getAdminToken();
        for (let i = 0; i < targets.length; i++) {
          const item = targets[i];
          try {
            await deleteBlob(token, item.key);
            deleted.push(item.key);
          } catch (e) {
            failed.push(item.key);
            if (e.status === 401) {
              clearAdminToken();
              break;
            }
          }
        }
      } catch (e) {
        alert('删除失败: ' + (e.message || '未知错误'));
      }

      this.blobs = this.blobs.filter(item => deleted.indexOf(item.key) < 0);
      this.selected = this.selected.filter(key => deleted.indexOf(key) < 0);
      this.batchDeleting = false;

      if (failed.length) {
        alert(`已删除 ${deleted.length} 个，${failed.length} 个失败，请重试。`);
      }
    }
  }
};
</script>

<style scoped>
.list-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.list-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--ink, #1f2937);
}

.list-desc {
  font-size: 0.88rem;
  color: var(--ink-muted, #6b7280);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.2rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

.stat strong {
  color: var(--ink, #1f2937);
  font-size: 0.95rem;
}

.stat-ok strong {
  color: #2563eb;
}

.stat-warn strong {
  color: #059669;
}

.list-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
}

.search-box i {
  color: #9ca3af;
  font-size: 0.85rem;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  background: transparent;
  font-size: 0.9rem;
}

.filter-check {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
  margin-bottom: 0;
}

.table-wrap {
  padding: 0.4rem 1rem;
  overflow-x: auto;
}

.table th {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-muted, #6b7280);
  border-top: none;
  white-space: nowrap;
}

.col-check {
  width: 40px;
  padding-right: 0;
}

.row-selected {
  background: #f8fafc;
}

.batch-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.batch-count {
  font-size: 0.82rem;
  color: var(--ink-muted, #6b7280);
}

.col-thumb {
  width: 72px;
}

.col-size {
  width: 90px;
}

.col-usage {
  width: 34%;
}

.col-actions {
  width: 90px;
}

.thumb-link {
  display: block;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f5f9;
  border: 1px solid var(--line, #e5e7eb);
}

.file-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink, #1f2937);
  word-break: break-all;
}

.file-key {
  font-size: 0.75rem;
  color: #9ca3af;
  word-break: break-all;
}

.refs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.ref,
.ref-more {
  font-size: 0.78rem;
  color: var(--ink-muted, #6b7280);
}

.tag {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.tag-live {
  color: #1d4ed8;
  background: #dbeafe;
}

.tag-hidden {
  color: #047857;
  background: #d1fae5;
}

.tag-link {
  color: #92400e;
  background: #fef3c7;
}

.empty {
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty i {
  font-size: 1.8rem;
  color: #cbd5e1;
  margin-bottom: 0.8rem;
}

.empty h5 {
  font-weight: 700;
  margin-bottom: 0.4rem;
}
</style>
