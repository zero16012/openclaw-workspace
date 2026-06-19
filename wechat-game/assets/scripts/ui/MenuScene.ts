import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { GameManager } from '../managers/GameManager';
import { AudioManager } from '../managers/AudioManager';
import { WXManager } from '../managers/WXManager';
const { ccclass, property } = _decorator;

/**
 * 主菜单场景
 */
@ccclass('MenuScene')
export class MenuScene extends Component {
    
    @property(Label)
    bestScoreLabel: Label = null;
    
    @property(Label)
    versionLabel: Label = null;
    
    @property(Node)
    rankButton: Node = null;
    
    @property(Node)
    soundButton: Node = null;
    
    onLoad() {
        this._initUI();
    }
    
    private _initUI() {
        // 显示最高分
        if (this.bestScoreLabel) {
            const bestScore = GameManager.getInstance().getBestScore();
            this.bestScoreLabel.string = `最高分: ${bestScore}`;
        }
        
        // 显示版本号
        if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0';
        }
        
        // 更新音效按钮状态
        this._updateSoundButton();
    }
    
    // ========== 按钮事件 ==========
    
    /**
     * 开始游戏
     */
    onStartGame() {
        // 播放音效
        // AudioManager.getInstance().playEffectByName('click');
        
        // 切换到游戏场景
        GameManager.getInstance().loadScene('GameScene');
    }
    
    /**
     * 显示排行榜
     */
    onShowRank() {
        // 获取好友排行榜
        WXManager.getInstance().getFriendRankData();
        
        // TODO: 显示排行榜 UI
        console.log('显示排行榜');
    }
    
    /**
     * 切换音效
     */
    onToggleSound() {
        const isMuted = AudioManager.getInstance().toggleMute();
        this._updateSoundButton();
        
        console.log('音效状态:', isMuted ? '静音' : '开启');
    }
    
    /**
     * 分享游戏
     */
    onShareGame() {
        WXManager.getInstance().shareAppMessage('快来和我一起玩这个游戏吧！');
    }
    
    /**
     * 打开设置
     */
    onOpenSettings() {
        // TODO: 显示设置面板
        console.log('打开设置');
    }
    
    // ========== 私有方法 ==========
    
    private _updateSoundButton() {
        if (!this.soundButton) return;
        
        const isMuted = AudioManager.getInstance().isMuted();
        const label = this.soundButton.getComponentInChildren(Label);
        
        if (label) {
            label.string = isMuted ? '🔇' : '🔊';
        }
    }
}
