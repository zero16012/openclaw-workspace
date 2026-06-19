import { _decorator, Component, Node, Label, Button, director, Vec3, input, Input, EventTouch } from 'cc';
import { GameManager, GameState } from '../managers/GameManager';
import { UIManager } from '../managers/UIManager';
import { AudioManager } from '../managers/AudioManager';
import { WXManager } from '../managers/WXManager';
import { EventBus } from '../utils/EventBus';
const { ccclass, property } = _decorator;

/**
 * 游戏主场景控制器
 * 这是一个示例，你可以根据实际游戏类型修改
 */
@ccclass('GameScene')
export class GameScene extends Component {
    
    // UI 节点
    @property(Label)
    scoreLabel: Label = null;
    
    @property(Label)
    bestScoreLabel: Label = null;
    
    @property(Node)
    startPanel: Node = null;
    
    @property(Node)
    gameOverPanel: Node = null;
    
    @property(Node)
    pausePanel: Node = null;
    
    // 游戏区域
    @property(Node)
    gameArea: Node = null;
    
    // 游戏状态
    private _isPaused: boolean = false;
    
    onLoad() {
        // 注册事件监听
        this._registerEvents();
        
        // 初始化 UI
        this._initUI();
        
        // 设置触摸/点击输入
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
    }
    
    onDestroy() {
        // 清理事件监听
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        
        EventBus.getInstance().offByTarget(this);
    }
    
    // ========== 初始化 ==========
    
    private _registerEvents() {
        const eventBus = EventBus.getInstance();
        
        eventBus.on('game-start', this._onGameStart, this);
        eventBus.on('game-over', this._onGameOver, this);
        eventBus.on('score-changed', this._onScoreChanged, this);
    }
    
    private _initUI() {
        // 显示最高分
        if (this.bestScoreLabel) {
            this.bestScoreLabel.string = `最高分: ${GameManager.getInstance().getBestScore()}`;
        }
        
        // 显示开始界面
        this._showStartPanel();
    }
    
    // ========== 游戏流程控制 ==========
    
    /**
     * 开始游戏
     */
    startGame() {
        GameManager.getInstance().startGame();
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (GameManager.getInstance().getGameState() !== GameState.PLAYING) return;
        
        this._isPaused = true;
        GameManager.getInstance().pauseGame();
        this._showPausePanel();
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        this._isPaused = false;
        GameManager.getInstance().resumeGame();
        this._hidePausePanel();
    }
    
    /**
     * 重新开始
     */
    restartGame() {
        // 隐藏结束面板
        this._hideGameOverPanel();
        
        // 重置游戏状态
        this._isPaused = false;
        
        // 重新开始
        GameManager.getInstance().startGame();
    }
    
    /**
     * 返回主菜单
     */
    backToMenu() {
        GameManager.getInstance().loadScene('MenuScene');
    }
    
    /**
     * 分享游戏
     */
    shareGame() {
        const score = GameManager.getInstance().getScore();
        WXManager.getInstance().shareAppMessage(
            `我在游戏中得了 ${score} 分，快来挑战我吧！`
        );
    }
    
    /**
     * 使用广告复活
     */
    async reviveWithAd() {
        const success = await WXManager.getInstance().showRewardedAd();
        
        if (success) {
            // 复活逻辑
            this._hideGameOverPanel();
            GameManager.getInstance().resumeGame();
            // TODO: 实现具体的复活逻辑
        }
    }
    
    // ========== 事件回调 ==========
    
    private _onGameStart() {
        this._hideStartPanel();
        this._hideGameOverPanel();
        
        // 重置分数显示
        if (this.scoreLabel) {
            this.scoreLabel.string = '0';
        }
        
        // TODO: 初始化游戏对象、开始游戏逻辑
        
        console.log('游戏开始');
    }
    
    private _onGameOver(data: { score: number; bestScore: number }) {
        this._showGameOverPanel(data.score, data.bestScore);
        
        // 振动反馈
        WXManager.getInstance().vibrateLong();
    }
    
    private _onScoreChanged(score: number) {
        if (this.scoreLabel) {
            this.scoreLabel.string = score.toString();
        }
    }
    
    // ========== 触摸/点击处理 ==========
    
    private _onTouchStart(event: EventTouch) {
        if (this._isPaused) return;
        if (GameManager.getInstance().getGameState() !== GameState.PLAYING) return;
        
        const touchPos = event.getUILocation();
        // TODO: 处理触摸开始逻辑
    }
    
    private _onTouchMove(event: EventTouch) {
        if (this._isPaused) return;
        if (GameManager.getInstance().getGameState() !== GameState.PLAYING) return;
        
        const touchPos = event.getUILocation();
        // TODO: 处理触摸移动逻辑
    }
    
    private _onTouchEnd(event: EventTouch) {
        if (this._isPaused) return;
        if (GameManager.getInstance().getGameState() !== GameState.PLAYING) return;
        
        const touchPos = event.getUILocation();
        // TODO: 处理触摸结束逻辑
    }
    
    // ========== UI 显示/隐藏 ==========
    
    private _showStartPanel() {
        if (this.startPanel) this.startPanel.active = true;
        if (this.gameOverPanel) this.gameOverPanel.active = false;
        if (this.pausePanel) this.pausePanel.active = false;
    }
    
    private _hideStartPanel() {
        if (this.startPanel) this.startPanel.active = false;
    }
    
    private _showGameOverPanel(score: number, bestScore: number) {
        if (this.gameOverPanel) {
            this.gameOverPanel.active = true;
            
            // 更新分数显示
            const scoreLabel = this.gameOverPanel.getChildByName('ScoreLabel')?.getComponent(Label);
            const bestLabel = this.gameOverPanel.getChildByName('BestLabel')?.getComponent(Label);
            
            if (scoreLabel) scoreLabel.string = `得分: ${score}`;
            if (bestLabel) bestLabel.string = `最高分: ${bestScore}`;
        }
    }
    
    private _hideGameOverPanel() {
        if (this.gameOverPanel) this.gameOverPanel.active = false;
    }
    
    private _showPausePanel() {
        if (this.pausePanel) this.pausePanel.active = true;
    }
    
    private _hidePausePanel() {
        if (this.pausePanel) this.pausePanel.active = false;
    }
    
    // ========== 按钮事件绑定 ==========
    
    onStartButtonClick() {
        this.startGame();
    }
    
    onPauseButtonClick() {
        this.pauseGame();
    }
    
    onResumeButtonClick() {
        this.resumeGame();
    }
    
    onRestartButtonClick() {
        this.restartGame();
    }
    
    onMenuButtonClick() {
        this.backToMenu();
    }
    
    onShareButtonClick() {
        this.shareGame();
    }
    
    onReviveButtonClick() {
        this.reviveWithAd();
    }
}
