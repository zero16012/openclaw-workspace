# 微信小游戏框架

基于 Cocos Creator 3.x 的微信小游戏基础框架。

## 项目结构

```
assets/
├── scripts/
│   ├── managers/          # 核心管理器（单例）
│   │   ├── GameManager.ts     # 游戏主逻辑、状态管理、对象池
│   │   ├── WXManager.ts       # 微信 API 封装（登录、分享、广告、排行榜）
│   │   ├── UIManager.ts       # UI 界面管理、层级控制
│   │   └── AudioManager.ts    # 背景音乐和音效管理
│   ├── gameplay/          # 游戏玩法逻辑
│   │   └── GameScene.ts       # 游戏主场景控制器
│   ├── ui/               # UI 组件
│   │   └── MenuScene.ts       # 主菜单场景
│   └── utils/            # 工具类
│       ├── ObjectPool.ts      # 通用对象池
│       └── EventBus.ts        # 全局事件总线
├── prefabs/              # 预制体
├── scenes/               # 场景文件
├── resources/            # 动态加载资源
└── textures/             # 图片纹理
```

## 核心功能

### 1. GameManager - 游戏管理器
- 单例模式，跨场景持久化
- 游戏状态管理（开始/暂停/结束）
- 分数系统（当前分/最高分）
- 内置对象池（NodePool 封装）
- 全局事件系统

### 2. WXManager - 微信 API 封装
- 微信环境检测（非微信环境可正常运行）
- 用户登录、获取用户信息
- 分享功能（主动分享 + 被动分享）
- 排行榜数据上传/获取
- 广告系统（激励视频、插屏、Banner）
- 振动反馈
- 本地数据存储

### 3. UIManager - UI 管理器
- UI 层级管理（UI / Popup / Top）
- UI 打开/关闭/缓存
- 屏幕适配
- 基类 BaseUI 提供统一接口

### 4. AudioManager - 音频管理器
- 背景音乐（播放/暂停/淡入淡出）
- 音效播放（对象池防止重叠）
- 音量独立控制
- 静音切换
- 本地保存音量设置

### 5. 工具类
- **ObjectPool**: 通用对象池 + Cocos 节点专用对象池
- **EventBus**: 全局事件总线，支持装饰器语法

## 使用方式

### 1. 创建 Cocos Creator 项目
```bash
# 使用 Cocos Dashboard 创建 3D 项目
# 选择 "Empty" 模板
```

### 2. 复制框架文件
将 `assets/scripts` 下的所有文件复制到你的项目中。

### 3. 创建场景

#### 初始化场景（BootScene）
1. 创建空节点，挂载 `GameManager`、`WXManager`、`UIManager`、`AudioManager`
2. 设置这些节点为 `Persist Root Node`
3. 在 `GameManager` 中配置 UIManager 的层级节点引用

#### 菜单场景（MenuScene）
1. 创建 UI 布局（开始按钮、排行榜、设置等）
2. 挂载 `MenuScene` 脚本
3. 绑定按钮点击事件

#### 游戏场景（GameScene）
1. 创建游戏区域和 UI
2. 挂载 `GameScene` 脚本
3. 配置各个面板和标签引用

### 4. 构建发布
```
Cocos Creator → 项目 → 构建发布
├── 发布平台：微信小游戏
├── 初始场景：BootScene
└── 构建路径：build/wechatgame
```

### 5. 微信开发者工具
1. 打开微信开发者工具
2. 导入项目，选择 `build/wechatgame` 文件夹
3. 填写你的 AppID
4. 真机调试测试

## 快速开始示例

### 开始游戏
```typescript
// 在按钮点击事件中
GameManager.getInstance().startGame();
```

### 添加分数
```typescript
GameManager.getInstance().addScore(10);
```

### 播放音效
```typescript
AudioManager.getInstance().playEffect(clip);
```

### 分享
```typescript
WXManager.getInstance().shareAppMessage('我的得分：100');
```

### 显示广告
```typescript
// 初始化（一般在游戏启动时）
WXManager.getInstance().createRewardedAd('你的广告位ID');

// 显示广告
const success = await WXManager.getInstance().showRewardedAd();
if (success) {
    // 用户看完广告，发放奖励
}
```

## 注意事项

1. **微信环境检测**：所有微信 API 都封装了环境检测，在浏览器/模拟器中不会报错
2. **对象池使用**：频繁创建销毁的对象（子弹、敌人等）务必使用对象池
3. **资源管理**：大图使用图集，动态加载的资源放 `resources` 文件夹
4. **性能优化**：低端机测试，控制 DrawCall，注意内存管理

## 后续扩展

- [ ] 添加更多 UI 预制体（设置面板、排行榜、商店等）
- [ ] 实现具体的游戏玩法逻辑
- [ ] 添加动画系统（Tween 或 Animation）
- [ ] 接入后端（用户数据、排行榜、存档）
- [ ] 添加更多微信功能（客服、订阅消息、游戏圈）
