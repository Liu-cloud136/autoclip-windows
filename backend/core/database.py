"""
数据库配置
包含数据库连接、会话管理和依赖注入
支持 SQLite 和 PostgreSQL
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool, QueuePool
from typing import Generator
from models.base import Base

# 数据库配置
# 优先使用环境变量，否则使用配置函数获取正确的路径
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    try:
        from .config import get_database_url
        DATABASE_URL = get_database_url()
    except ImportError:
        # 如果导入失败，使用默认的相对路径（但会在backend目录下）
        DATABASE_URL = "sqlite:///./data/autoclip.db"
        import warnings
        warnings.warn(
            "使用默认数据库路径，可能导致数据存储在backend目录下。"
            "建议检查配置。",
            RuntimeWarning
        )

# 创建数据库引擎
if "sqlite" in DATABASE_URL:
    # SQLite配置 - 优化连接池
    # SQLite使用StaticPool是最合适的，因为SQLite不支持真正的连接池
    # StaticPool维护单个连接，适合SQLite的单线程写入特性
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,  # 允许跨线程访问
            "timeout": 30,                # 增加超时时间到30秒
            "isolation_level": None       # 自动提交模式
        },
        poolclass=StaticPool,             # SQLite使用静态池
        pool_pre_ping=True,              # 连接健康检查，避免使用失效的连接
        echo=False
    )
elif "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL:
    # PostgreSQL配置 - 生产环境优化
    # 使用QueuePool进行连接池管理，适合高并发场景
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,           # 增加连接池基础大小
        max_overflow=30,        # 增加最大溢出连接数（总共最多50个连接）
        pool_pre_ping=True,     # 连接前检测，避免使用失效的连接
        pool_recycle=3600,      # 连接回收时间（1小时），避免长时间连接失效
        echo=False
    )
else:
    # 其他数据库（MySQL等）的默认配置
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,      # 5分钟回收连接
        echo=False
    )

# 创建会话工厂
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """
    数据库会话依赖注入
    用于FastAPI的依赖注入系统
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """创建所有数据库表"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """删除所有数据库表"""
    Base.metadata.drop_all(bind=engine)

def reset_database():
    """重置数据库"""
    drop_tables()
    create_tables()

from sqlalchemy import text

def test_connection() -> bool:
    """测试数据库连接"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1")).fetchone()
        return True
    except Exception as e:
        print(f"数据库连接测试失败: {e}")
        return False

# 数据库初始化
def init_database():
    """初始化数据库"""
    print("正在初始化数据库...")
    
    # 测试连接
    if not test_connection():
        print("❌ 数据库连接失败")
        return False
    
    # 创建表
    try:
        create_tables()
        print("✅ 数据库表创建成功")
        return True
    except Exception as e:
        print(f"❌ 数据库表创建失败: {e}")
        return False

if __name__ == "__main__":
    # 直接运行此文件时初始化数据库
    init_database()