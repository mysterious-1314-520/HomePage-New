const { getDb } = require('../database');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ADMIN_SECRET = 'homepage-admin-secret-key-2024';
const DEFAULT_PASSWORD = 'admin123';

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd + ADMIN_SECRET).digest('hex');
}

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

function checkAuth(req) {
  const token = req.headers['x-admin-token'] || '';
  if (!token) return false;
  const db = getDb();
  const row = db.prepare("SELECT value FROM site_config WHERE key='admin_token_hash'").get();
  if (!row) return false;
  return crypto.createHash('sha256').update(token + ADMIN_SECRET).digest('hex') === row.value;
}

function ensureDefaultPassword() {
  const db = getDb();
  const exist = db.prepare("SELECT value FROM site_config WHERE key='admin_password'").get();
  if (!exist) {
    db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES ('admin_password', ?)").run(hashPassword(DEFAULT_PASSWORD));
  }
}

async function apiRoutes(fastify, options) {
  ensureDefaultPassword();

  // 登录
  fastify.post('/api/admin-login', async (req, reply) => {
    const db = getDb();
    const row = db.prepare("SELECT value FROM site_config WHERE key='admin_password'").get();
    const hash = hashPassword(req.body.password || '');
    if (!row || hash !== row.value) {
      return { code: 401, msg: '密码错误' };
    }
    const token = makeToken();
    const tokenHash = crypto.createHash('sha256').update(token + ADMIN_SECRET).digest('hex');
    db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES ('admin_token_hash', ?)").run(tokenHash);
    return { code: 200, data: { token } };
  });

  // 检查登录状态
  fastify.get('/api/admin-check', async (req, reply) => {
    if (checkAuth(req)) return { code: 200, data: { ok: true } };
    return { code: 401, msg: '未登录' };
  });

  // 修改密码
  fastify.post('/api/admin-change-password', async (req, reply) => {
    if (!checkAuth(req)) return reply.code(401).send({ code: 401, msg: '未登录' });
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) return { code: 400, msg: '新密码至少4位' };
    const db = getDb();
    const row = db.prepare("SELECT value FROM site_config WHERE key='admin_password'").get();
    if (hashPassword(oldPassword) !== row.value) return { code: 401, msg: '原密码错误' };
    db.prepare("UPDATE site_config SET value=? WHERE key='admin_password'").run(hashPassword(newPassword));
    return { code: 200, msg: '密码已修改' };
  });

  // Auth middleware for write operations
  fastify.addHook('preHandler', async (req, reply) => {
    const skipPaths = ['/api/admin-login', '/api/admin-check', '/api/track-visit'];
    if (skipPaths.includes(req.url)) return;
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return;
    if (!checkAuth(req)) return reply.code(401).send({ code: 401, msg: '未登录' });
  });

  fastify.addHook('onSend', async (req, reply, payload) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  });

  // 图片上传
  fastify.post('/api/upload', async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ code: 400, msg: '未选择文件' });

    const ext = path.extname(data.filename).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'];
    if (!allowed.includes(ext)) return reply.code(400).send({ code: 400, msg: '不支持的文件类型' });

    const uploadDir = path.join(__dirname, '..', '..', 'static', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
    const filePath = path.join(uploadDir, name);
    const ws = fs.createWriteStream(filePath);
    await data.file.pipe(ws);

    return new Promise((resolve) => {
      ws.on('finish', () => {
        resolve({ code: 200, data: { url: 'static/uploads/' + name } });
      });
      ws.on('error', () => {
        resolve({ code: 500, msg: '上传失败' });
      });
    });
  });

  // 站点配置
  fastify.get('/api/config', async (req, reply) => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM site_config').all();
    const config = {};
    rows.forEach(r => { config[r.key] = r.value; });
    return { code: 200, data: config };
  });

  fastify.put('/api/config', async (req, reply) => {
    const db = getDb();
    const stmt = db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)');
    const tx = db.transaction((data) => {
      for (const [k, v] of Object.entries(data)) {
        stmt.run(k, String(v));
      }
    });
    tx(req.body);
    return { code: 200, msg: '保存成功' };
  });

  // 标签
  fastify.get('/api/tags', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM tags ORDER BY sort_order').all() };
  });

  fastify.put('/api/tags', async (req, reply) => {
    const db = getDb();
    const tx = db.transaction((tags) => {
      db.prepare('DELETE FROM tags').run();
      const insert = db.prepare('INSERT INTO tags (tag, sort_order) VALUES (?, ?)');
      tags.forEach((t, i) => insert.run(t.tag || t, i));
    });
    tx(req.body.tags);
    return { code: 200, msg: '保存成功' };
  });

  // 时间线
  fastify.get('/api/timeline', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM timeline ORDER BY sort_order').all() };
  });

  fastify.put('/api/timeline/:id', async (req, reply) => {
    const db = getDb();
    const { date, content, is_current, sort_order } = req.body;
    db.prepare('UPDATE timeline SET date=?, content=?, is_current=?, sort_order=? WHERE id=?').run(date, content, is_current ? 1 : 0, sort_order, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/timeline', async (req, reply) => {
    const db = getDb();
    const { date, content, is_current, sort_order } = req.body;
    const r = db.prepare('INSERT INTO timeline (date, content, is_current, sort_order) VALUES (?, ?, ?, ?)').run(date, content, is_current ? 1 : 0, sort_order);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/timeline/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM timeline WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 社交链接
  fastify.get('/api/social-links', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM social_links ORDER BY sort_order').all() };
  });

  fastify.put('/api/social-links/reorder', async (req, reply) => {
    const db = getDb();
    const tx = db.transaction((ids) => {
      const stmt = db.prepare('UPDATE social_links SET sort_order=? WHERE id=?');
      ids.forEach((id, i) => stmt.run(i, id));
    });
    tx(req.body.ids);
    return { code: 200, msg: '排序成功' };
  });

  fastify.put('/api/social-links/:id', async (req, reply) => {
    const db = getDb();
    const { platform, url, tip_text, display_style, is_active, sort_order } = req.body;
    db.prepare('UPDATE social_links SET platform=?, url=?, tip_text=?, display_style=?, is_active=?, sort_order=? WHERE id=?').run(platform, url, tip_text, display_style, is_active ? 1 : 0, sort_order, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/social-links', async (req, reply) => {
    const db = getDb();
    const { platform, url, tip_text, display_style, is_active, sort_order } = req.body;
    const r = db.prepare('INSERT INTO social_links (platform, url, tip_text, display_style, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(platform, url, tip_text, display_style, is_active ? 1 : 0, sort_order);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/social-links/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM social_links WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 项目
  fastify.get('/api/projects', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM projects ORDER BY id').all() };
  });

  fastify.put('/api/projects/:id', async (req, reply) => {
    const db = getDb();
    const { title, app_name, app_icon, app_description, video_url, download_url, download_text, tech_stack, detail_description, github_url, demo_url, screenshots } = req.body;
    db.prepare('UPDATE projects SET title=?, app_name=?, app_icon=?, app_description=?, video_url=?, download_url=?, download_text=?, tech_stack=?, detail_description=?, github_url=?, demo_url=?, screenshots=? WHERE id=?').run(title, app_name, app_icon, app_description, video_url, download_url, download_text, tech_stack || '', detail_description || '', github_url || '', demo_url || '', screenshots || '', req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/projects', async (req, reply) => {
    const db = getDb();
    const { title, app_name, app_icon, app_description, video_url, download_url, download_text, tech_stack, detail_description, github_url, demo_url, screenshots } = req.body;
    const r = db.prepare('INSERT INTO projects (title, app_name, app_icon, app_description, video_url, download_url, download_text, tech_stack, detail_description, github_url, demo_url, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, app_name, app_icon, app_description, video_url, download_url, download_text, tech_stack || '', detail_description || '', github_url || '', demo_url || '', screenshots || '');
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/projects/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 版本
  fastify.get('/api/app-versions', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM app_versions ORDER BY created_at DESC').all() };
  });

  fastify.put('/api/app-versions/:id', async (req, reply) => {
    const db = getDb();
    const { version_code, download_url, changelog } = req.body;
    db.prepare('UPDATE app_versions SET version_code=?, download_url=?, changelog=? WHERE id=?').run(version_code, download_url, changelog, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/app-versions', async (req, reply) => {
    const db = getDb();
    const { version_code, download_url, changelog } = req.body;
    const r = db.prepare('INSERT INTO app_versions (version_code, download_url, changelog) VALUES (?, ?, ?)').run(version_code, download_url, changelog);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/app-versions/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM app_versions WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 公告
  fastify.get('/api/app-notices', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM app_notices ORDER BY id').all() };
  });

  fastify.put('/api/app-notices/:id', async (req, reply) => {
    const db = getDb();
    const { title, url, content, image_url, is_active } = req.body;
    db.prepare('UPDATE app_notices SET title=?, url=?, content=?, image_url=?, is_active=? WHERE id=?').run(title||'', url, content, image_url||'', is_active?1:0, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/app-notices', async (req, reply) => {
    const db = getDb();
    const { title, url, content, image_url, is_active } = req.body;
    const r = db.prepare('INSERT INTO app_notices (title, url, content, image_url, is_active) VALUES (?, ?, ?, ?, ?)').run(title||'', url, content, image_url||'', is_active?1:0);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/app-notices/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM app_notices WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 音乐
  fastify.get('/api/music', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM music_config ORDER BY id').all() };
  });

  fastify.put('/api/music/:id', async (req, reply) => {
    const db = getDb();
    const { song_title, artist, lyric_snippet, audio_file } = req.body;
    db.prepare('UPDATE music_config SET song_title=?, artist=?, lyric_snippet=?, audio_file=? WHERE id=?').run(song_title, artist, lyric_snippet, audio_file, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/music', async (req, reply) => {
    const db = getDb();
    const { song_title, artist, lyric_snippet, audio_file } = req.body;
    const r = db.prepare('INSERT INTO music_config (song_title, artist, lyric_snippet, audio_file) VALUES (?, ?, ?, ?)').run(song_title, artist, lyric_snippet, audio_file);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/music/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM music_config WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 友情链接
  fastify.get('/api/friend-links', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM friend_links ORDER BY sort_order').all() };
  });

  fastify.put('/api/friend-links/:id', async (req, reply) => {
    const db = getDb();
    const { name, url, description, sort_order } = req.body;
    db.prepare('UPDATE friend_links SET name=?, url=?, description=?, sort_order=? WHERE id=?').run(name, url, description, sort_order, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/friend-links', async (req, reply) => {
    const db = getDb();
    const { name, url, description, sort_order } = req.body;
    const r = db.prepare('INSERT INTO friend_links (name, url, description, sort_order) VALUES (?, ?, ?, ?)').run(name, url, description, sort_order);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/friend-links/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM friend_links WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 技能
  fastify.get('/api/skills', async (req, reply) => {
    const db = getDb();
    return { code: 200, data: db.prepare('SELECT * FROM skills ORDER BY sort_order').all() };
  });

  fastify.put('/api/skills/:id', async (req, reply) => {
    const db = getDb();
    const { name, level, category, color, sort_order } = req.body;
    db.prepare('UPDATE skills SET name=?, level=?, category=?, color=?, sort_order=? WHERE id=?').run(name, level, category, color, sort_order, req.params.id);
    return { code: 200, msg: '保存成功' };
  });

  fastify.post('/api/skills', async (req, reply) => {
    const db = getDb();
    const { name, level, category, color, sort_order } = req.body;
    const r = db.prepare('INSERT INTO skills (name, level, category, color, sort_order) VALUES (?, ?, ?, ?, ?)').run(name, level, category, color, sort_order);
    return { code: 200, data: { id: r.lastInsertRowid } };
  });

  fastify.delete('/api/skills/:id', async (req, reply) => {
    const db = getDb();
    db.prepare('DELETE FROM skills WHERE id=?').run(req.params.id);
    return { code: 200, msg: '删除成功' };
  });

  // 访问统计
  fastify.post('/api/track-visit', async (req, reply) => {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const row = db.prepare('SELECT * FROM page_views WHERE date=?').get(today);
    const isNew = !(req.headers['x-visit-id'] || '');

    if (row) {
      db.prepare('UPDATE page_views SET pv=pv+1' + (isNew ? ', uv=uv+1' : '') + ' WHERE date=?').run(today);
    } else {
      db.prepare('INSERT INTO page_views (date, pv, uv) VALUES (?, 1, ?)').run(today, isNew ? 1 : 0);
    }
    return { code: 200 };
  });

  fastify.get('/api/stats', async (req, reply) => {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const todayRow = db.prepare('SELECT * FROM page_views WHERE date=?').get(today) || { pv: 0, uv: 0 };
    const total = db.prepare('SELECT COALESCE(SUM(pv),0) as pv, COALESCE(SUM(uv),0) as uv FROM page_views').get();
    const last7 = db.prepare("SELECT * FROM page_views WHERE date >= date('now','-6 days') ORDER BY date").all();
    return { code: 200, data: { today: todayRow, total, last7 } };
  });

  // 组合接口：一次性获取主页全部数据
  fastify.get('/api/homepage-data', async (req, reply) => {
    const db = getDb();
    const configRows = db.prepare('SELECT key, value FROM site_config').all();
    const config = {};
    configRows.forEach(r => { config[r.key] = r.value; });

    return {
      code: 200,
      data: {
        config,
        tags: db.prepare('SELECT * FROM tags ORDER BY sort_order').all(),
        timeline: db.prepare('SELECT * FROM timeline ORDER BY sort_order').all(),
        socialLinks: db.prepare('SELECT * FROM social_links ORDER BY sort_order').all(),
        projects: db.prepare('SELECT * FROM projects ORDER BY id').all(),
        appVersions: db.prepare('SELECT * FROM app_versions ORDER BY created_at DESC').all(),
        appNotices: db.prepare('SELECT * FROM app_notices ORDER BY id').all(),
        music: db.prepare('SELECT * FROM music_config ORDER BY id').all(),
        friendLinks: db.prepare('SELECT * FROM friend_links ORDER BY sort_order').all(),
        skills: db.prepare('SELECT * FROM skills ORDER BY sort_order').all()
      }
    };
  });
}

module.exports = apiRoutes;
