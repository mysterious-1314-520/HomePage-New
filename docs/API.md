# API 文档

Base URL: `http://localhost:4000`

## 认证

管理类接口需要登录认证，登录后通过 Cookie 维持会话。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin-login` | POST | 管理员登录 |
| `/api/admin-check` | GET | 检查登录状态 |
| `/api/admin-change-password` | POST | 修改管理员密码 |

## 站点配置

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/config` | GET | 获取站点配置 |
| `/api/config` | PUT | 更新站点配置 |

## 标签

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tags` | GET | 获取标签列表 |
| `/api/tags` | PUT | 更新标签 |

## 时间线

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/timeline` | GET | 获取时间线 |
| `/api/timeline` | POST | 新增时间线项 |
| `/api/timeline/:id` | PUT | 更新时间线项 |
| `/api/timeline/:id` | DELETE | 删除时间线项 |

## 社交链接

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/social-links` | GET | 获取社交链接 |
| `/api/social-links` | POST | 新增社交链接 |
| `/api/social-links/reorder` | PUT | 调整顺序 |
| `/api/social-links/:id` | PUT | 更新社交链接 |
| `/api/social-links/:id` | DELETE | 删除社交链接 |

## 项目

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/projects` | GET | 获取项目列表 |
| `/api/projects` | POST | 新增项目 |
| `/api/projects/:id` | PUT | 更新项目 |
| `/api/projects/:id` | DELETE | 删除项目 |

## 版本管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/app-versions` | GET | 获取版本列表 |
| `/api/app-versions` | POST | 新增版本 |
| `/api/app-versions/:id` | PUT | 更新版本 |
| `/api/app-versions/:id` | DELETE | 删除版本 |

## 公告管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/app-notices` | GET | 获取公告列表 |
| `/api/app-notices` | POST | 新增公告 |
| `/api/app-notices/:id` | PUT | 更新公告 |
| `/api/app-notices/:id` | DELETE | 删除公告 |

## 音乐管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/music` | GET | 获取音乐列表 |
| `/api/music` | POST | 新增音乐 |
| `/api/music/:id` | PUT | 更新音乐 |
| `/api/music/:id` | DELETE | 删除音乐 |

## 友情链接

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/friend-links` | GET | 获取友链列表 |
| `/api/friend-links` | POST | 新增友链 |
| `/api/friend-links/:id` | PUT | 更新友链 |
| `/api/friend-links/:id` | DELETE | 删除友链 |

## 技能

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/skills` | GET | 获取技能列表 |
| `/api/skills` | POST | 新增技能 |
| `/api/skills/:id` | PUT | 更新技能 |
| `/api/skills/:id` | DELETE | 删除技能 |

## 文件上传

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传文件 (multipart/form-data) |

## 统计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/track-visit` | POST | 记录访问 |
| `/api/stats` | GET | 获取访问统计 (PV/UV + 7天趋势) |

## 聚合接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/homepage-data` | GET | 获取主页全部数据 |

## 响应格式

所有接口统一返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

错误时：

```json
{
  "code": 400,
  "msg": "错误描述",
  "data": null
}
```
