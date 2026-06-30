# LUMINA CMS

一个轻量级的可编辑企业官网 CMS：静态前端 + Flask 后端 API + 管理后台。

## 架构

- **前端**: 静态 HTML/CSS/JS，部署在 Cloudflare Pages
- **后端**: Flask 提供 `/api/content`，部署在主人的服务器
- **管理后台**: `/admin`，密码 `lumina-admin`（生产环境请修改）
- **连接**: Cloudflare Tunnel 把后端暴露到公网，Pages `_worker.js` 将 `/api/*` 转发到后端

## 目录

```
.
├── app.py                 # Flask 后端
├── content.json           # 内容数据
├── static/
│   ├── index.html         # 官网页面
│   ├── admin.html         # 管理后台
│   ├── js/cms.js         # 前端内容加载器
│   └── _worker.js        # Pages 边缘代理
├── requirements.txt
├── lumina-cms.service    # systemd 服务
├── wrangler.toml
├── deploy.sh
└── .github/workflows/deploy.yml
```

## 本地运行

```bash
cd lumina-cms
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

访问 http://127.0.0.1:5000/ 和 http://127.0.0.1:5000/admin

## 部署

### 服务器端（Flask 后端）

```bash
sudo cp lumina-cms.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lumina-cms
```

### Cloudflare Tunnel

1. 在服务器安装 cloudflared
2. 创建 tunnel: `cloudflared tunnel create lumina-api`
3. 配置 public hostname 指向 `http://127.0.0.1:8787`
4. 记录后端公网地址

### Cloudflare Pages

1. 在 Pages 控制台创建项目 `lumina-cms`
2. 设置环境变量 `API_URL` 为后端公网地址
3. 运行 `npx wrangler pages deploy static --project-name=lumina-cms`

或者配置 GitHub Secrets `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，推送后自动部署。
