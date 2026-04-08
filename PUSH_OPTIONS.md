# 🚀 顺手送 v2 - GitHub 推送方案

由于当前服务器 SSH 出站连接被 GitHub 拒绝，提供以下几种推送方案：

---

## 方案 1: 本地电脑推送 ⭐ 推荐

**最简单可靠的方式**

```bash
# 1. 在本地电脑克隆仓库
git clone https://github.com/anyreturn/shunshousong-v2.git
cd shunshousong-v2

# 2. 从服务器下载源代码
# 方式 A: 使用 scp
scp admin@YOUR_SERVER_IP:/tmp/source-code.tar.gz .
tar -xzf source-code.tar.gz

# 方式 B: 使用浏览器下载
# 访问 http://YOUR_SERVER_IP/tmp/source-code.tar.gz 下载

# 3. 提交并推送
git add -A
git commit -m "feat: 顺手送 v2 - 同城互助配送平台"
git push origin main
```

**优点**: 简单可靠，无需额外配置  
**缺点**: 需要本地电脑

---

## 方案 2: 使用 GitHub Personal Access Token 🔑

```bash
# 1. 创建 Token
# 访问 https://github.com/settings/tokens/new
# 勾选 repo 权限，生成后复制 Token

# 2. 使用 Token 推送
cd /home/admin/openclaw/workspace/shunshousong-v2
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/anyreturn/shunshousong-v2.git
git push -u origin main
```

**优点**: 直接在服务器推送  
**缺点**: 需要创建 Token

---

## 方案 3: 使用 Python API 脚本 🐍

```bash
# 1. 获取 Token (同上)

# 2. 运行推送脚本
cd /home/admin/openclaw/workspace/shunshousong-v2
python3 push_api.py YOUR_GITHUB_TOKEN
```

**优点**: 自动化  
**缺点**: 上传为 tar 包，需要手动解压

---

## 方案 4: 使用 GitHub Codespaces 💻

```bash
# 1. 访问 https://github.com/codespaces
# 2. 创建 shunshousong-v2 的 Codespace
# 3. 在 Codespace 中:

git clone https://github.com/anyreturn/shunshousong-v2.git
cd shunshousong-v2

# 4. 上传源代码 (使用 Codespaces 文件上传功能)
# 5. 推送
git add -A
git commit -m "feat: 顺手送 v2"
git push origin main
```

**优点**: 云端环境，无网络限制  
**缺点**: 需要 GitHub Codespaces 额度

---

## 方案 5: 使用 SSH 密钥 (如果已添加) 🔐

**新的 RSA 公钥** (需添加到 GitHub):
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC5bJv8ydZNJdayKPBRLiPypBE0unMPWq27rzJk86yOkL0zae4XgwxoqXDMO6qTPiVbPOLjoDMnmh86LwtuYVlgIIObtBcBlA8bgDrks7Xh3PuLDtZsLT458XqKQ676yUfZtPQqJJru79M4o09KtloqkYasPl+h7sca0gKT0Pz9BUsW3iA4SP6VesP5sJSY//ZKdqRUAic4BkDN3gurR59zWzcStowY8XoWRo2EIRurZoYOxW+CA2cSNEgWnKM9tnxE1omA6bpal6XGUkFW5VAfyYtVJ7THr+Peh61FBXNgiiUw8RFZ7Lol6lsml4OZbGhNf7x/ktl9g4UH+Kx/9esbXXqJcadvL94YvloYm+5hWv7vP6vph2D2GUFhSc7Q2fi5bnsmc9AXzd7aARfHMg1osp5hQH5PnWLQOJm9HX12txyR5x359v1dq4ojUHMvQCiiCV2Lmoa5gdKHpz8XEjz8lcMeGK6UrtY7VCo07ma1GM2tvcr41vi5RNFZzY+RXv4iianJ3ZS7n252iFo2zbBOOZ6OKm/rkMp4ubMRiKxsfb819yuzs4ddki3kYIXYtHNpdYyDpsasPxsEB5hfSW5D1bnAs3zTvMuyMW/eMjjAWR+/CQpEg9zNIB24BynS4+5Kg/PA8FKEhryOVCU+EtzEgL0lYRv23Bm0/W71CbTEsQ== admin@shunshousong-v2
```

**添加步骤**:
1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴上方公钥
4. 保存后执行:

```bash
cd /home/admin/openclaw/workspace/shunshousong-v2
git remote set-url origin git@github.com:anyreturn/shunshousong-v2.git
ssh -i ~/.ssh/id_rsa_github -T git@github.com  # 测试连接
git push -u origin main
```

**优点**: 一劳永逸  
**缺点**: 需要添加密钥，可能仍被防火墙拦截

---

## 方案 6: 使用 GitHub 网页上传 🌐

适合小文件：

1. 访问 https://github.com/anyreturn/shunshousong-v2
2. 点击 "Add file" → "Upload files"
3. 拖拽文件上传
4. 填写 commit 信息并提交

**优点**: 无需命令行  
**缺点**: 文件多时麻烦

---

## 📦 已准备的文件

| 文件 | 路径 | 大小 | 说明 |
|------|------|------|------|
| 源代码包 | `/tmp/source-code.tar.gz` | 273KB | 排除 node_modules |
| 完整包 | `/tmp/shunshousong-v2-full.tar.gz` | 212MB | 包含所有文件 |
| Bundle | `/tmp/repo.bundle` | 136KB | Git bundle 格式 |
| 部署脚本 | `deploy.sh` | - | 本地推送脚本 |
| API 脚本 | `push_api.py` | - | Python API 推送 |

---

## 🎯 推荐流程

**最快方式**: 方案 1 (本地电脑推送)

1. 本地克隆：`git clone https://github.com/anyreturn/shunshousong-v2.git`
2. 下载源码：`scp admin@SERVER_IP:/tmp/source-code.tar.gz .`
3. 解压推送：`tar -xzf source-code.tar.gz && git add -A && git push`

**无需本地电脑**: 方案 2 (Token 推送)

1. 创建 Token: https://github.com/settings/tokens
2. 执行推送：`git remote set-url origin https://USER:TOKEN@github.com/anyreturn/shunshousong-v2.git && git push`

---

## ❓ 常见问题

**Q: 为什么 SSH 被拦截？**  
A: 服务器安全策略限制了 SSH 出站连接到 GitHub。

**Q: Token 安全吗？**  
A: Token 只用于本次推送，建议使用细粒度权限，用完可删除。

**Q: 可以不用推送吗？**  
A: 可以下载 `/tmp/source-code.tar.gz` 后在任意电脑手动创建仓库。

---

选择最适合您的方案开始推送吧！🚀
