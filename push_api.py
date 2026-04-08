#!/usr/bin/env python3
"""
使用 GitHub API 推送代码到仓库
需要 Personal Access Token

使用方法:
1. 获取 Token: https://github.com/settings/tokens
2. 运行：python3 push_to_github.py YOUR_TOKEN
"""

import sys
import os
import base64
from github import Github

def push_to_github(token, repo_name="anyreturn/shunshousong-v2"):
    """推送代码到 GitHub"""
    
    print(f"🔐 连接 GitHub...")
    g = Github(token)
    
    try:
        repo = g.get_repo(repo_name)
        print(f"✅ 仓库：{repo.html_url}")
    except Exception as e:
        print(f"❌ 无法访问仓库：{e}")
        return False
    
    # 获取源代码包路径
    source_tar = "/tmp/source-code.tar.gz"
    if not os.path.exists(source_tar):
        print(f"❌ 源代码包不存在：{source_tar}")
        return False
    
    print(f"📦 读取源代码包...")
    with open(source_tar, 'rb') as f:
        tar_data = f.read()
    
    # 上传 tar 包
    print(f"📤 上传源代码包...")
    try:
        repo.create_file(
            path="source-code.tar.gz",
            message="feat: 顺手送 v2 - 同城互助配送平台",
            content=tar_data,
        )
        print("✅ 上传成功！")
    except Exception as e:
        print(f"❌ 上传失败：{e}")
        return False
    
    print(f"\n🌐 查看仓库：{repo.html_url}")
    print("⚠️  注意：源代码已上传为 tar 包，请在 GitHub 上解压")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法：python3 push_to_github.py YOUR_GITHUB_TOKEN")
        print("\n获取 Token: https://github.com/settings/tokens")
        sys.exit(1)
    
    token = sys.argv[1]
    success = push_to_github(token)
    sys.exit(0 if success else 1)
