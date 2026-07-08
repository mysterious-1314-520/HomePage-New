const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'homepage.db');

let db;

function getDb() {
  if (!db) {
    require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
    seedIfEmpty();
    ensureGreetingMode();
    ensureTheme();
    ensureSkills();
    ensureNoticeFields();
    ensureProjectDetails();
    ensureLoginBg();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      is_current INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      tip_text TEXT DEFAULT '',
      display_style TEXT DEFAULT 'iconItem',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      app_name TEXT,
      app_icon TEXT,
      app_description TEXT,
      video_url TEXT,
      download_url TEXT,
      download_text TEXT DEFAULT '下载'
    );

    CREATE TABLE IF NOT EXISTS app_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_code TEXT,
      download_url TEXT,
      changelog TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT '',
      url TEXT,
      content TEXT,
      image_url TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS music_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_title TEXT,
      artist TEXT,
      lyric_snippet TEXT,
      audio_file TEXT
    );

    CREATE TABLE IF NOT EXISTS page_views (
      date TEXT PRIMARY KEY,
      pv INTEGER DEFAULT 0,
      uv INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS friend_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 80,
      category TEXT DEFAULT '',
      color TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM site_config').get();
  if (count.c > 0) return;

  const insertConfig = db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)');
  const configs = {
    avatar_url: 'favicon.ico',
    display_name: '计堡',
    greeting: '你好，我是 <span class="gradientText">计堡</span>，很高兴认识你！',
    location_label: 'Home🏠',
    page_title: '你好，我是计堡',
    meta_description: '你好，我是计堡',
    meta_keywords: '计堡,定时点击器Ultra',
    descriptions: JSON.stringify([
      { icon: 'static/img/mc.ico', text: '<span class="purpleText">方块人</span> 十年老玩家' },
      { text: 'Vibe Coding 大手子' }
    ]),
    footer_copyright: '© 2022-现在',
    footer_slogan: '我没有项目，所以这里只有备案号',
    footer_icp_number: '辽ICP备2026000346号',
    footer_icp_url: 'https://beian.miit.gov.cn/',
    footer_source_code_label: 'SourceCode',
    footer_source_code_url: 'https://github.com/xxynet/HomePage',
    greeting_mode: 'custom',
    theme: 'default'
  };
  for (const [k, v] of Object.entries(configs)) {
    insertConfig.run(k, v);
  }

  const insertTag = db.prepare('INSERT INTO tags (tag, sort_order) VALUES (?, ?)');
  ['Developer', 'Student', '卑微小up', '方块人'].forEach((t, i) => insertTag.run(t, i));

  const insertTimeline = db.prepare('INSERT INTO timeline (date, content, is_current, sort_order) VALUES (?, ?, ?, ?)');
  insertTimeline.run('未来', '塔菲不知道喵', 1, 0);
  insertTimeline.run('2026年1月7日23:02:24', '我闲着没事搭建了这个网站', 0, 1);
  insertTimeline.run('2022年07月17日', '这个<a href="https://littlecold.cn">域名</a>被注册了', 0, 2);

  const insertLink = db.prepare('INSERT INTO social_links (platform, url, tip_text, display_style, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  insertLink.run('GitHub', 'https://github.com/hanbao233xD', 'Github', 'iconItemLong', 1, 0);
  insertLink.run('Bilibili', 'https://space.bilibili.com/299635441', 'Bilibili', 'iconItemLong', 1, 1);
  insertLink.run('QQ', 'https://qm.qq.com/q/mRDtmxup10', 'QQ', 'iconItemLong', 1, 2);
  insertLink.run('Email', 'mailto:hanba0qwq@Outlook.com', '', 'iconItem', 1, 3);
  insertLink.run('Twitter', 'https://twitter.com/intent/user?user_id=1564057561996832770', '', 'iconItem', 0, 4);
  insertLink.run('赞助', 'javascript:PopUp(\'./static/img/sponsor.jpg\')', '赞助', 'iconItem', 0, 5);

  const insertProject = db.prepare('INSERT INTO projects (title, app_name, app_icon, app_description, video_url, download_url, download_text) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertProject.run('来试试我的新项目', '定时点击器Ultra', 'static/img/littleclicker.jpg', '你的抢购、任务助手。', 'https://www.bilibili.com/video/BV1QBQ1ByE7U/', 'littleclicker/apk/LittleClicker.apk', '下载');

  const insertVersion = db.prepare('INSERT INTO app_versions (version_code, download_url, changelog) VALUES (?, ?, ?)');
  insertVersion.run('12', 'https://littlecold.cn/littleclicker/apk/LittleClicker.apk', '亲爱的用户，定时点击器Ultra 2.0 已发布~\n\n1. 页面全新优化，显示效果更完整、更美观\n2. 动作列表新增上下移功能，可直接调整脚本执行顺序\n3. 修复横竖屏切换后点位位置异常的问题\n4. 定时功能新增"提前执行"设置，可按毫秒级提前触发脚本\n\n更新方式：根据软件内提示，跳转安装最新包体即可~');

  const insertNotice = db.prepare('INSERT INTO app_notices (title, url, content, is_active) VALUES (?, ?, ?, ?)');
  insertNotice.run('中转站推荐', 'https://api.littlecold.cn/', '【自营】连点器不赚钱，白手起家开中转站，GPT5.5低至0.2元/1m，DeepSeek，Claude等模型一折起，注册就送测试额度（点我跳转）', 1);

  const insertMusic = db.prepare('INSERT INTO music_config (song_title, artist, lyric_snippet, audio_file) VALUES (?, ?, ?, ?)');
  insertMusic.run('十年', '陈奕迅', '成千上万个门口，总有一个人要先走。', 'static/audio/陈奕迅-十年.mp3');

  const insertSkill = db.prepare('INSERT INTO skills (name, level, category, color, sort_order) VALUES (?, ?, ?, ?, ?)');
  [
    { name: 'JavaScript', level: 85, category: '前端', color: '#f7df1e' },
    { name: 'HTML/CSS', level: 90, category: '前端', color: '#e34f26' },
    { name: 'Python', level: 75, category: '后端', color: '#3776ab' },
    { name: 'Node.js', level: 80, category: '后端', color: '#339933' },
    { name: 'SQLite', level: 70, category: '数据库', color: '#003b57' },
    { name: 'Git', level: 85, category: '工具', color: '#f05032' }
  ].forEach((s, i) => insertSkill.run(s.name, s.level, s.category, s.color, i));

  console.log('[DB] Seed data inserted');
}

function ensureGreetingMode() {
  if (!db.prepare("SELECT 1 FROM site_config WHERE key='greeting_mode'").get()) {
    db.prepare("INSERT INTO site_config (key, value) VALUES ('greeting_mode', 'custom')").run();
  }
}

function ensureTheme() {
  if (!db.prepare("SELECT 1 FROM site_config WHERE key='theme'").get()) {
    db.prepare("INSERT INTO site_config (key, value) VALUES ('theme', 'default')").run();
  }
}

function ensureSkills() {
  if (db.prepare('SELECT COUNT(*) as c FROM skills').get().c > 0) return;
  const insert = db.prepare('INSERT INTO skills (name, level, category, color, sort_order) VALUES (?, ?, ?, ?, ?)');
  [
    { name: 'JavaScript', level: 85, category: '前端', color: '#f7df1e' },
    { name: 'HTML/CSS', level: 90, category: '前端', color: '#e34f26' },
    { name: 'Python', level: 75, category: '后端', color: '#3776ab' },
    { name: 'Node.js', level: 80, category: '后端', color: '#339933' },
    { name: 'SQLite', level: 70, category: '数据库', color: '#003b57' },
    { name: 'Git', level: 85, category: '工具', color: '#f05032' }
  ].forEach((s, i) => insert.run(s.name, s.level, s.category, s.color, i));
  console.log('[DB] Skills migration done');
}

function ensureNoticeFields() {
  try { db.exec("ALTER TABLE app_notices ADD COLUMN title TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE app_notices ADD COLUMN is_active INTEGER DEFAULT 1"); } catch(e) {}
  try { db.exec("ALTER TABLE app_notices ADD COLUMN image_url TEXT DEFAULT ''"); } catch(e) {}
}

function ensureProjectDetails() {
  try { db.exec("ALTER TABLE projects ADD COLUMN tech_stack TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE projects ADD COLUMN detail_description TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE projects ADD COLUMN github_url TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE projects ADD COLUMN demo_url TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE projects ADD COLUMN screenshots TEXT DEFAULT ''"); } catch(e) {}
}

function ensureLoginBg() {
  if (!db.prepare("SELECT 1 FROM site_config WHERE key='login_bg_url'").get()) {
    db.prepare("INSERT INTO site_config (key, value) VALUES ('login_bg_url', '')").run();
  }
}

module.exports = { getDb };
