"""
快速导入优化配置
"""

# 是否在导入时生成缩略图（False表示延迟生成，提升导入速度）
GENERATE_THUMBNAIL_ON_IMPORT = False

# 导入时的默认缩略图（base64格式）
DEFAULT_THUMBNAIL = None  # 将使用前端默认占位图

# 缩略图生成策略
# 'immediate': 导入时立即生成
# 'lazy': 在项目列表刷新时按需生成
# 'background': 在后台异步生成
THUMBNAIL_GENERATION_STRATEGY = 'immediate'
