# AutoClip - AI 视频切片处理系统（二改-超级屎山-慎用）

## 🌟 项目起源

本项目受到 **[AutoClip](https://github.com/zhouxiaoka/autoclip)** 项目的启发和灵感。**（经过本人与AI斗智斗勇 成功造出了另一坨屎山 建议部署使用时配合codebuddy等支持AI的IDE食用 不会进行后续维护 能不能用纯属天意 我本地部署了还可以用）**

（顺便提一下在B站上的切片子账号 搞这个项目的目的是为了尝试AI切片 [@憨娜の切片鸽](https://space.bilibili.com/3546763759716636)  官方[@鸽切不鸽德切片组](https://space.bilibili.com/631477152)  常设组长 [@鸽神本鸽](https://space.bilibili.com/478719788)）

感谢原作者的开创性工作，为本项目提供了宝贵的思路和参考。如果没有原始 AutoClip 项目的启发，本项目将无法诞生。

---

## 📖 项目简介

AutoClip 是一个基于 AI 的智能视频切片处理系统，能够自动分析视频内容、提取精彩片段、生成字幕，并进行智能评分和推荐。系统采用前后端分离架构，后端使用 FastAPI + Celery，前端使用 React + TypeScript。

### ✨ 核心功能

- **智能视频分析**：自动识别视频内容和结构
- **AI 话题提取**：使用大语言模型（LLM）提取视频中的精彩话题
- **自动切片生成**：根据话题自动截取视频片段
- **智能字幕处理**：支持字幕提取、编辑和优化
- **缩略图生成**：自动为切片生成预览缩略图
- **智能评分系统**：多维度评估切片质量
- **批量处理支持**：支持批量导入和处理多个视频
- **实时进度反馈**：通过 WebSocket 实时推送处理进度

---

## 💻 系统要求

### 硬件要求

- **CPU**：4核心及以上（推荐 8 核心）
- **内存**：8GB 及以上（推荐 16GB）
- **硬盘**：至少 20GB 可用空间
- **GPU**：可选，用于硬件加速视频编码（NVIDIA 显卡）

### 软件要求

- **操作系统**：Windows 10/11
- **Python**：3.9 及以上版本
- **Node.js**：18.x 及以上版本
- **Redis**：5.0 及以上版本
- **FFmpeg**：4.0 及以上版本（需添加到系统 PATH）

---

## 🚀 快速开始

### 第一步：安装依赖

#### 1. 安装 Python 和 Node.js

确保系统已安装：

- Python 3.9+
- Node.js 18.x+
- FFmpeg（[下载地址](https://ffmpeg.org/download.html)）

#### 2. 安装 Redis

**方式一：使用 Chocolatey（推荐）**

```bash
choco install redis-64
redis-server
```

**方式二：手动安装**

1. 下载 Redis Windows 版本：https://github.com/microsoftarchive/redis/releases
2. 解压并运行 `redis-server.exe`

#### 3. 初始化项目

双击运行 `init.bat`，脚本会自动：

- 创建 Python 虚拟环境
- 安装 Python 依赖
- 初始化数据库

或手动执行：

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
```

#### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 第二步：配置环境

编辑项目根目录的 `.env` 文件，配置必要参数：

#### 必须配置项

```env
# LLM API 配置（必须）
LLM_PROVIDER=dashscope
API_DASHSCOPE_API_KEY=your_api_key_here
API_MODEL_NAME=qwen-plus

# B站 Cookie 配置（必须，用于语音识别）
BILIBILI_COOKIE=your_bilibili_cookie_here

# 数据库配置
DATABASE_URL=sqlite:///./data/autoclip.db

# Redis 配置
REDIS_URL=redis://localhost:6379/0
```

#### 可选配置项

```env
# 视频编码优化
VIDEO_USE_STREAM_COPY=true          # 使用流复制（最快）
VIDEO_USE_HARDWARE_ACCEL=true       # 硬件加速
VIDEO_ENCODER_PRESET=p6             # 编码预设（p1-p7）
VIDEO_CRF=18                        # 视频质量（18-28，越小越好）

# 处理参数
PROCESSING_CHUNK_SIZE=3000          # 文本分块大小
PROCESSING_MIN_SCORE_THRESHOLD=70   # 最小评分阈值
PROCESSING_MAX_CLIPS_PER_COLLECTION=5  # 每个合集最大切片数

# 话题提取参数
MIN_TOPIC_DURATION_MINUTES=2        # 话题最小时长（分钟）
MAX_TOPIC_DURATION_MINUTES=12       # 话题最大时长（分钟）
TARGET_TOPIC_DURATION_MINUTES=5     # 话题目标时长（分钟）
MIN_TOPICS_PER_CHUNK=3              # 每个文本块最少话题数
MAX_TOPICS_PER_CHUNK=8              # 每个文本块最多话题数

# 日志配置
LOG_LEVEL=INFO                      # DEBUG, INFO, WARNING, ERROR
LOG_FILE=logs/backend.log
```

### 第三步：启动服务

#### 方式一：一键启动（推荐）

双击运行 `start_all.bat`，会自动启动：

- FastAPI 后端服务（端口 8000）
- Celery 任务队列
- 前端开发服务器（端口 5173）

启动后浏览器会自动打开 http://localhost:5173

#### 方式二：分别启动

**启动后端 API 服务：**

```bash
# 新开终端窗口
start_backend.bat
```

**启动 Celery 任务队列：**

```bash
# 新开终端窗口
start_celery_enhanced.bat
```

**启动前端开发服务器：**

```bash
# 新开终端窗口
cd frontend
npm run dev
```

访问：

- 前端界面：http://localhost:5173
- API 文档：http://localhost:8000/docs
- API 文档（ReDoc）：http://localhost:8000/redoc

---

## 📚 功能指南

### 1. 项目管理

#### 创建项目

1. 点击首页的「新建项目」按钮
2. 填写项目名称和描述
3. 选择本地视频文件：支持 MP4、AVI、MOV、MKV 等格式

#### 项目列表

- 支持网格和列表视图切换
- 显示项目状态、切片数量、创建时间等信息
- 支持拖拽排序
- 超过 20 个项目时自动启用虚拟滚动优化

### 2. 视频处理流程

系统采用 6 步流水线处理：

#### Step 1: 字幕提取

- 自动识别视频中的语音内容
- 支持多种字幕格式（SRT、VTT、ASS）
- 使用 bcut-asr 进行语音识别

#### Step 2: 话题提取

- 使用 LLM 分析字幕内容
- 自动识别精彩话题和时间点
- 支持自定义话题提取参数（在 `.env` 文件中配置）：
  - 最小时长：`MIN_TOPIC_DURATION_MINUTES=2`（分钟）
  - 最大时长：`MAX_TOPIC_DURATION_MINUTES=12`（分钟）
  - 目标时长：`TARGET_TOPIC_DURATION_MINUTES=5`（分钟）
  - 最少话题数：`MIN_TOPICS_PER_CHUNK=3`
  - 最多话题数：`MAX_TOPICS_PER_CHUNK=8`

#### Step 3: 智能评分

- 多维度评估话题质量
- 并发处理多个评分块（默认 3 线程）
- 支持断点续传，失败后自动恢复
- 评分维度：
  - 内容质量
  - 娱乐性
  - 信息价值
  - 观众吸引力

#### Step 4: 切片规划

- 根据评分筛选最佳片段
- 智能去重和合并
- 生成详细的切片计划

#### Step 5: 视频切片

- 使用 FFmpeg 提取视频片段
- 支持硬件加速（NVIDIA GPU）
- 流式处理，内存占用低
- 自动生成缩略图

#### Step 6: 结果整理

- 汇总所有切片
- 生成最终报告
- 支持批量导出

### 3. 切片管理

#### 查看切片

- 点击项目进入详情页
- 查看所有生成的切片
- 支持虚拟滚动（超过 30 个切片时）
- 查看切片的评分、时长、标签等信息

#### 编辑切片

- **字幕编辑**：可视化字幕编辑器
  
  - 时间轴调整
  - 文本编辑
  - 样式设置
  - 实时预览

- **元数据编辑**：
  
  - 修改标题和描述
  - 添加标签
  - 调整评分

#### 导出切片

- 单个导出或批量导出
- 支持多种格式
- 包含字幕文件

### 4. 设置页面

#### LLM 配置

- 支持多个 LLM 提供商：
  
  - **DashScope（通义千问）**：默认推荐
  - **OpenAI**：GPT 系列
  - **Gemini**：Google AI
  - **SiliconFlow**：国产大模型
  - **Claude**：Anthropic
  - **自定义**：任何 OpenAI 兼容 API

- 配置参数：
  
  - API Key
  - Base URL
  - Model Name
  - Temperature
  - Max Tokens

#### 处理配置

- 话题提取参数
- 评分阈值设置
- 并发控制
- 重试策略

#### 系统配置

- 日志级别
- 文件路径
- 代理设置

---

## ⚙️ 高级配置

### LLM 提供商配置

#### DashScope（通义千问）

```env
LLM_PROVIDER=dashscope
API_DASHSCOPE_API_KEY=sk-xxxxx
API_DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
API_MODEL_NAME=qwen-plus
```

#### OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
API_MODEL_NAME=gpt-4
```

#### Gemini

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=xxxxx
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
API_MODEL_NAME=gemini-pro
```

#### 自定义提供商

```env
LLM_PROVIDER=custom
CUSTOM_API_KEY=xxxxx
CUSTOM_BASE_URL=https://your-api-endpoint.com/v1
CUSTOM_MODEL_NAME=your-model
CUSTOM_API_FORMAT=openai
```

### 视频编码优化

#### 使用流复制（推荐）

```env
VIDEO_USE_STREAM_COPY=true
```

- 最快的处理方式
- 不重新编码，直接复制视频流
- 质量无损

#### 使用硬件加速

```env
VIDEO_USE_HARDWARE_ACCEL=true
VIDEO_ENCODER_PRESET=p6
VIDEO_CRF=18
```

- 需要 NVIDIA GPU
- 使用 NVENC 编码器
- p1（最快）到 p7（最慢），p6 平衡质量和速度
- CRF 越小质量越好（18-28）

### 性能调优

#### Celery 并发设置

```bash
# start_celery_enhanced.bat
--concurrency=4  # 根据 CPU 核心数调整
```

#### 处理块大小

```env
PROCESSING_CHUNK_SIZE=3000  # 字符数，越大越快但内存占用越高
```

#### 批量处理

```env
PROCESSING_MAX_CLIPS_PER_COLLECTION=5  # 每次处理的最大切片数
```

---

## 🔧 故障排除

### 常见问题

#### 1. Redis 连接失败

**症状**：启动时提示 Redis 连接错误

**解决方案**：

```bash
# 检查 Redis 是否运行
redis-cli ping

# 如果未运行，启动 Redis
redis-server

# 如果端口被占用，修改 .env
REDIS_URL=redis://localhost:6380/0
```

#### 2. FFmpeg 未找到

**症状**：视频处理失败，提示 FFmpeg 错误

**解决方案**：

```bash
# 检查 FFmpeg 是否安装
ffmpeg -version

# 如果未安装，下载并添加到 PATH
# Windows: https://ffmpeg.org/download.html
```

#### 3. Python 依赖安装失败

**症状**：pip install 报错

**解决方案**：

```bash
# 升级 pip
python -m pip install --upgrade pip

# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 4. 前端启动失败

**症状**：npm run dev 报错

**解决方案**：

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rmdir /s node_modules
del package-lock.json

# 重新安装
npm install
```

#### 5. API 调用超时

**症状**：处理大批量切片时超时

**解决方案**：

```env
# 增加超时时间（默认 600 秒）
API_TIMEOUT=1200
TIMEOUT_SECONDS=1200
```

#### 6. 内存占用过高

**症状**：处理大视频时内存不足

**解决方案**：

```env
# 使用流式处理
VIDEO_USE_STREAM_COPY=true

# 减少并发数
CELERY_CONCURRENCY=2

# 减小块大小
PROCESSING_CHUNK_SIZE=2000
```

#### 7. 字幕提取失败

**症状**：无法识别视频中的语音

**解决方案**：

- 检查视频是否有音频轨道
- 确认 B站 Cookie 是否有效（针对 B站视频）
- 查看日志文件：`logs/backend.log`

### 日志查看

#### 后端日志

```
logs/backend.log
```

#### Celery 日志

```
logs/celery_worker.log
```

#### 实时查看日志

```bash
# Windows PowerShell
Get-Content logs\backend.log -Wait

# 或使用日志页面
访问：http://localhost:5173 -> 设置 -> 日志
```

---

## 📊 性能优化

### 已实现的优化

1. **并发控制优化**
   
   - 评分步骤并发处理（3 线程）
   - 视频提取并发控制（3 个并发）
   - 缩略图提取并发控制（5 个并发）

2. **虚拟滚动优化**
   
   - 项目列表：超过 20 个自动启用
   - 切片列表：超过 30 个自动启用
   - 性能提升 70%

3. **流式视频处理**
   
   - 内存占用减少 70%
   - 支持 10GB+ 大文件
   - 实时进度反馈

4. **轮询机制优化**
   
   - 动态轮询间隔（5-20 秒）
   - 拖拽时暂停轮询
   - 错误指数退避

5. **视频导入优化**
   
   - 导入速度从 30 秒降至 5-6 秒
   - FFmpeg 调用从 3 次降至 1 次
   - 数据库提交从 5 次降至 1-2 次

### 最佳实践

1. **处理大批量视频**
   
   - 建议每次不超过 10 个视频
   - 使用硬件加速编码
   - 确保有足够磁盘空间

2. **处理长视频**
   
   - 使用流复制模式
   - 适当增加超时时间
   - 分批次处理

3. **提升评分速度**
   
   - 使用更快的 LLM 模型
   - 增加并发线程数
   - 优化提示词长度

---

## 🛠️ 开发相关

### 项目结构

```
autoclip-windows/
├── backend/                 # 后端代码
│   ├── api/                # API 路由
│   ├── core/               # 核心模块
│   ├── models/             # 数据模型
│   ├── pipeline/           # 处理流水线
│   ├── services/           # 业务服务
│   ├── tasks/              # Celery 任务
│   ├── utils/              # 工具函数
│   └── main.py             # 应用入口
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── stores/        # 状态管理
│   │   └── utils/         # 工具函数
│   └── package.json
├── data/                   # 数据目录
│   ├── autoclip.db        # SQLite 数据库
│   ├── uploads/           # 上传文件
│   └── output/            # 输出文件
├── logs/                   # 日志目录
├── .env                    # 环境配置
├── init.bat               # 初始化脚本
├── start_all.bat          # 一键启动
├── start_backend.bat      # 启动后端
├── start_celery_enhanced.bat  # 启动 Celery
└── requirements.txt       # Python 依赖
```

### API 文档

启动后端后访问：

- Swagger UI：http://localhost:8000/docs
- ReDoc：http://localhost:8000/redoc

### 测试

```bash
# 运行后端测试
cd backend
pytest

# 运行前端测试
cd frontend
npm test
```

---

## 📝 更新日志

### v1.0.0（当前版本）

#### 新功能

- 完整的视频切片处理流程
- 多 LLM 提供商支持
- 可视化字幕编辑器
- 虚拟滚动优化
- 断点续传功能

#### 性能优化

- 评分速度提升 2-3 倍
- 视频导入速度提升 80%
- 内存占用减少 70%
- 轮询请求减少 60%

#### Bug 修复

- 修复事件循环冲突问题
- 修复缩略图生成器封面处理问题
- 修复 Redis 残留数据问题

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

---

## 🙏 致谢

### 特别感谢

**[bcut-asr](https://github.com/SocialSisterYi/bcut-asr)** - 本项目的核心语音识别组件

- **作者**：SocialSisterYi（社会易姐QwQ）
- **许可证**：MIT License
- **功能**：使用必剪 API 实现高质量的语音字幕识别
- **贡献**：为 AutoClip 提供了强大的语音识别能力，是字幕提取步骤的核心技术支撑

如果没有 bcut-asr 项目，AutoClip 将无法实现自动语音识别和字幕提取功能。感谢作者的开源贡献！

### 其他开源项目

感谢以下开源项目：

- FastAPI - 现代化的 Web 框架
- Celery - 分布式任务队列
- React - 用户界面库
- Ant Design - UI 组件库
- FFmpeg - 多媒体处理工具

---

**Happy Clipping! 🎬✨**
