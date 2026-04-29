#!/usr/bin/env python3
import sys
import os
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.chdir(backend_dir)

print(f"Current working directory: {os.getcwd()}")

# 先加载环境变量
from dotenv import load_dotenv
env_path = backend_dir.parent / ".env"
print(f"Loading env from: {env_path}")
load_dotenv(dotenv_path=env_path)

db_url = os.getenv("DATABASE_URL")
print(f"\nDATABASE_URL from env: {db_url}")

from config import get_config

config = get_config()

print(f"\nConfig Database URL: {config.database.url}")
print(f"Data directory: {config.paths.data_dir}")
print(f"Project root: {config.paths.project_root}")

if config.paths.data_dir.exists():
    print(f"\nData directory exists: {config.paths.data_dir}")
    for item in config.paths.data_dir.iterdir():
        print(f"  - {item}")
else:
    print(f"\nData directory does NOT exist: {config.paths.data_dir}")
    print("Creating data directory...")
    config.paths.data_dir.mkdir(parents=True, exist_ok=True)
    print(f"Created: {config.paths.data_dir}")

from core.database import engine, test_connection, create_tables

print(f"\nEngine URL: {engine.url}")

if test_connection():
    print("Database connection successful")
    create_tables()
    print("Tables created successfully")
else:
    print("Database connection failed")

if "sqlite" in str(engine.url):
    # 解析 SQLite 路径
    url_str = str(engine.url)
    if url_str.startswith("sqlite:///"):
        db_path_str = url_str[10:]  # 去掉 sqlite:///
    else:
        db_path_str = url_str
    
    # 处理 Windows 路径
    if db_path_str.startswith("/") and ":" in db_path_str:
        # 类似 /d:/path/to/db 的格式
        db_path_str = db_path_str[1:]  # 去掉开头的 /
    
    db_path = Path(db_path_str)
    
    print(f"\nDatabase file path: {db_path}")
    print(f"Database file absolute path: {db_path.absolute()}")
    
    if db_path.exists():
        print(f"Database file exists, size: {db_path.stat().st_size} bytes")
    else:
        print(f"Database file does NOT exist at: {db_path}")
        print(f"Parent directory exists: {db_path.parent.exists()}")
        if not db_path.parent.exists():
            print(f"Creating parent directory: {db_path.parent}")
            db_path.parent.mkdir(parents=True, exist_ok=True)
