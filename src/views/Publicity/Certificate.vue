<template>
  <div class="certificate-container">
    <!-- 顶部区域：标题和说明 -->
    <div class="top-banner">
      <div class="banner-overlay">
        <h1>荣誉证书生成</h1>
        <p>填写信息，生成专属荣誉证书</p>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- 左侧表单 -->
        <div class="col-md-6">
          <div class="certificate-card">
            <div class="card-header">
              <h2>证书信息填写</h2>
              <p class="text-muted">请填写以下信息，系统将为您生成荣誉证书</p>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="submitForm">
                <div class="form-group">
                  <label for="name">姓名/昵称 <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="formData.name" 
                    class="form-control" 
                    required
                    placeholder="请输入证书获得者姓名/昵称"
                  >
                </div>
                
                <div class="form-group">
                  <label for="descriptionTitle">荣誉称号 <span class="required">*</span></label>
                  <div class="input-group">
                    <select 
                      class="form-control" 
                      v-model="selectedTitle" 
                      @change="onTitleChange"
                    >
                      <option value="">-- 请选择或自定义 --</option>
                      <option value="优秀群友">优秀群友</option>
                      <option value="优秀群主">优秀群主</option>
                      <option value="优秀管理员">优秀管理员</option>
                      <option value="优秀志愿者">优秀志愿者</option>
                      <option value="custom">自定义...</option>
                    </select>
                  </div>
                  <input 
                    v-if="selectedTitle === 'custom'"
                    type="text" 
                    id="customTitle" 
                    v-model="formData.descriptionTitle" 
                    class="form-control mt-2" 
                    required
                    placeholder="请输入自定义荣誉称号"
                  >
                </div>
                
                <div class="form-group">
                  <label for="descriptionPrefix">描述前缀 <span class="required">*</span></label>
                  <textarea 
                    id="descriptionPrefix" 
                    v-model="formData.descriptionPrefix" 
                    class="form-control" 
                    required
                    rows="2"
                  ></textarea>
                  <small class="form-text text-muted">示例：在二零二四到二零二五学年表现优秀，在活跃群聊气氛方面发挥了先锋模范作用，被评为我群</small>
                </div>
                
                <div class="form-group">
                  <label for="descriptionSuffix">描述后缀 <span class="required">*</span></label>
                  <textarea 
                    id="descriptionSuffix" 
                    v-model="formData.descriptionSuffix" 
                    class="form-control" 
                    required
                    rows="2"
                  ></textarea>
                  <small class="form-text text-muted">示例：，特发此证，以资鼓励</small>
                </div>
                
                <div class="form-submit">
                  <button type="submit" class="btn btn-primary btn-submit" :disabled="isSubmitting">
                    {{ isSubmitting ? '生成中...' : '生成证书' }}
                  </button>
                </div>
              </form>
            </div>
            
            <div class="card-footer">
              <h4>使用说明：</h4>
              <p>仅供娱乐，华东理工大学CIC计算机信息交流协会不对生成证书内容负责！</p>
            </div>
          </div>
        </div>
        
        <!-- 右侧预览 -->
        <div class="col-md-6">
          <div class="certificate-preview-card" v-if="certificateUrl">
            <div class="card-header">
              <h2>证书预览</h2>
            </div>
            <div class="preview-container">
              <img :src="certificateUrl" alt="荣誉证书" class="certificate-image">
            </div>
            <div class="download-container">
              <button @click="downloadCertificate" class="btn btn-success btn-download">
                下载证书
              </button>
            </div>
          </div>
          <div class="certificate-placeholder" v-else>
            <div class="placeholder-content">
              <i class="fa fa-certificate placeholder-icon"></i>
              <h3>证书预览区</h3>
              <p>填写左侧表单并点击"生成证书"按钮后，证书将显示在此处</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "certificate",
  data() {
    return {
      formData: {
        name: "",
        descriptionTitle: "",
        descriptionPrefix: "在二零二四到二零二五学年表现优秀，在活跃群聊气氛方面发挥了先锋模范作用，被评为我群",
        descriptionSuffix: "，特发此证，以资鼓励"
      },
      selectedTitle: "",
      isSubmitting: false,
      certificateUrl: null,
      apiError: null
    };
  },
  methods: {
    onTitleChange() {
      // 如果选择了预设选项，则直接设置到formData中
      if (this.selectedTitle && this.selectedTitle !== 'custom') {
        this.formData.descriptionTitle = this.selectedTitle;
      } else if (this.selectedTitle === 'custom') {
        // 如果选择了自定义，则清空当前值，让用户输入
        this.formData.descriptionTitle = '';
      }
    },
    
    submitForm() {
      // 表单验证
      if (!this.formData.name || !this.formData.descriptionTitle || 
          !this.formData.descriptionPrefix || !this.formData.descriptionSuffix) {
        this.apiError = "请填写所有必填字段";
        return;
      }
      
      this.isSubmitting = true;
      this.apiError = null;
      
      // 清理之前的URL对象（如果存在）
      if (this.certificateUrl) {
        URL.revokeObjectURL(this.certificateUrl);
      }
      
      // 构建API请求数据
      const apiData = {
        title: "荣誉证书",
        subtitle: "CERTIFICATE OF HONOR",
        text: "",
        name: this.formData.name,
        descriptionPrefix: this.formData.descriptionPrefix,
        descriptionSuffix: this.formData.descriptionSuffix,
        descriptionTitle: this.formData.descriptionTitle,
        signatureName1: "2025年7月10日",
        signatureTitle1: "日期",
        signatureName2: "CIC计算机信息交流协会",
        signatureTitle2: "发证单位"
      };
      
      // 调用证书生成API，设置responseType为blob以接收二进制数据
      axios.post('http://ciczs.bestzyq.cn/', apiData, {
        headers: {
          'Content-Type': 'application/json',
          'OE-TEMPLATE-ID': 'ep-KmswvuJyDYRF'
        },
        responseType: 'blob' // 设置响应类型为blob，用于接收二进制图片数据
      })
      .then(response => {
        // 处理返回的PNG图片数据
        const blob = new Blob([response.data], { type: 'image/png' });
        
        // 创建一个本地URL，用于显示和下载图片
        this.certificateUrl = URL.createObjectURL(blob);
      })
      .catch(error => {
        console.error('证书生成失败:', error);
        this.apiError = '证书生成失败，请稍后重试';
        alert('证书生成失败，请稍后重试');
      })
      .finally(() => {
        this.isSubmitting = false;
      });
    },
    
    resetForm() {
      // 清理之前的URL对象（如果存在）
      if (this.certificateUrl) {
        URL.revokeObjectURL(this.certificateUrl);
      }
      
      this.formData = {
        name: "",
        descriptionTitle: "",
        descriptionPrefix: "在二零二四到二零二五学年表现优秀，在活跃群聊气氛方面发挥了先锋模范作用，被评为我群",
        descriptionSuffix: "，特发此证，以资鼓励"
      };
      this.selectedTitle = ""; // 重置下拉框选择
      this.certificateUrl = null;
      this.apiError = null;
    },
    
    downloadCertificate() {
      if (!this.certificateUrl) return;
      
      // 创建一个临时的a标签用于下载
      const downloadLink = document.createElement('a');
      downloadLink.href = this.certificateUrl;
      
      // 设置文件名
      const fileName = `${this.formData.name}-荣誉证书.png`;
      downloadLink.download = fileName;
      
      // 添加到文档中并触发点击
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // 清理DOM
      document.body.removeChild(downloadLink);
    }
  },
  
  beforeDestroy() {
    // 组件销毁前清理URL对象，避免内存泄漏
    if (this.certificateUrl) {
      URL.revokeObjectURL(this.certificateUrl);
    }
  }
};
</script>

<style scoped>
.certificate-container {
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
  padding-bottom: 50px;
}

/* 顶部区域 */
.top-banner {
  position: relative;
  height: 300px;
  background: linear-gradient(135deg, #3498db, #9b59b6);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  text-align: center;
  color: white;
  padding: 0 15px;
}

.banner-overlay h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.banner-overlay p {
  font-size: 1.2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

/* 证书申请卡片 */
.certificate-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
  height: 100%;
}

.card-header {
  background-color: #f8f9fa;
  padding: 25px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 10px;
}

.card-body {
  padding: 25px;
}

.card-footer {
  background-color: #f8f9fa;
  padding: 25px;
  border-top: 1px solid #eee;
}

.card-footer h4 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 15px;
}

.card-footer ul {
  padding-left: 20px;
}

.card-footer li {
  margin-bottom: 8px;
  color: #555;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.required {
  color: #e74c3c;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.form-submit {
  margin-top: 30px;
  text-align: center;
}

.btn-submit {
  background: linear-gradient(to right, #3498db, #9b59b6);
  border: none;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1.1rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 证书预览区域 */
.certificate-preview-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
  height: 100%;
  text-align: center;
}

.preview-container {
  padding: 20px;
  max-width: 100%;
  overflow: hidden;
}

.certificate-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.download-container {
  padding: 20px;
  margin-bottom: 20px;
}

.btn-download {
  background: linear-gradient(to right, #27ae60, #2ecc71);
  border: none;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1.1rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-download:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 证书占位符 */
.certificate-placeholder {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.placeholder-content h3 {
  margin-bottom: 15px;
  color: #7f8c8d;
}

.placeholder-content p {
  color: #95a5a6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-overlay h1 {
    font-size: 2rem;
  }
  
  .banner-overlay p {
    font-size: 1rem;
  }
  
  .card-header, .card-body, .card-footer {
    padding: 15px;
  }
  
  .row {
    flex-direction: column;
  }
  
  .certificate-placeholder, .certificate-preview-card {
    margin-top: 20px;
  }
}
</style>