import sqlite3
import shutil
from pathlib import Path

# 源数据库（包含数据）
source_db = Path('d:/jz/autoclip-windows/backend/data/autoclip.db')
# 目标数据库（配置指向的数据库）
target_db = Path('d:/jz/autoclip-windows/data/autoclip.db')

print(f"Source database: {source_db}")
print(f"Target database: {target_db}")
print(f"Source exists: {source_db.exists()}")
print(f"Target exists: {target_db.exists()}")

# 备份目标数据库
if target_db.exists():
    backup_db = target_db.with_suffix('.db.backup')
    print(f"Backing up target database to: {backup_db}")
    shutil.copy2(target_db, backup_db)

# 连接源数据库
source_conn = sqlite3.connect(str(source_db))
source_cursor = source_conn.cursor()

# 检查源数据库中的数据
source_cursor.execute("SELECT COUNT(*) FROM projects")
source_projects_count = source_cursor.fetchone()[0]
print(f"Source projects count: {source_projects_count}")

if source_projects_count > 0:
    source_cursor.execute("SELECT id, name, status FROM projects")
    source_projects = source_cursor.fetchall()
    print("Source projects:")
    for p in source_projects:
        print(f"  ID: {p[0]}, Name: {p[1]}, Status: {p[2]}")

# 连接目标数据库
target_conn = sqlite3.connect(str(target_db))
target_cursor = target_conn.cursor()

# 检查目标数据库中的数据
target_cursor.execute("SELECT COUNT(*) FROM projects")
target_projects_count = target_cursor.fetchone()[0]
print(f"Target projects count: {target_projects_count}")

# 如果目标数据库为空，复制数据
if target_projects_count == 0 and source_projects_count > 0:
    print("Copying data from source to target...")

    # 复制projects表数据
    source_cursor.execute("SELECT * FROM projects")
    projects_data = source_cursor.fetchall()
    source_cursor.execute("PRAGMA table_info(projects)")
    columns = [col[1] for col in source_cursor.fetchall()]
    placeholders = ','.join(['?'] * len(columns))
    insert_sql = f"INSERT INTO projects ({','.join(columns)}) VALUES ({placeholders})"

    for project in projects_data:
        try:
            target_cursor.execute(insert_sql, project)
        except Exception as e:
            print(f"Error inserting project: {e}")

    # 复制tasks表数据
    source_cursor.execute("SELECT COUNT(*) FROM tasks")
    tasks_count = source_cursor.fetchone()[0]
    if tasks_count > 0:
        source_cursor.execute("SELECT * FROM tasks")
        tasks_data = source_cursor.fetchall()
        source_cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in source_cursor.fetchall()]
        placeholders = ','.join(['?'] * len(columns))
        insert_sql = f"INSERT INTO tasks ({','.join(columns)}) VALUES ({placeholders})"

        for task in tasks_data:
            try:
                target_cursor.execute(insert_sql, task)
            except Exception as e:
                print(f"Error inserting task: {e}")

    # 复制clips表数据
    source_cursor.execute("SELECT COUNT(*) FROM clips")
    clips_count = source_cursor.fetchone()[0]
    if clips_count > 0:
        source_cursor.execute("SELECT * FROM clips")
        clips_data = source_cursor.fetchall()
        source_cursor.execute("PRAGMA table_info(clips)")
        columns = [col[1] for col in source_cursor.fetchall()]
        placeholders = ','.join(['?'] * len(columns))
        insert_sql = f"INSERT INTO clips ({','.join(columns)}) VALUES ({placeholders})"

        for clip in clips_data:
            try:
                target_cursor.execute(insert_sql, clip)
            except Exception as e:
                print(f"Error inserting clip: {e}")

    target_conn.commit()
    print("Data migration completed successfully!")

    # 验证迁移结果
    target_cursor.execute("SELECT COUNT(*) FROM projects")
    new_count = target_cursor.fetchone()[0]
    print(f"Target projects count after migration: {new_count}")

    target_cursor.execute("SELECT id, name, status FROM projects")
    target_projects = target_cursor.fetchall()
    print("Target projects after migration:")
    for p in target_projects:
        print(f"  ID: {p[0]}, Name: {p[1]}, Status: {p[2]}")

source_conn.close()
target_conn.close()

print("Migration completed!")