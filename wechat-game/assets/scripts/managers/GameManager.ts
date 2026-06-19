import { _decorator, Component, director, NodePool, instantiate, Prefab, Node } from 'cc';
import { WXManager } from './WXManager';
const { ccclass, property } = _decorator;

/**
 * 游戏主管理器 - 单例
 * 负责游戏状态管理、场景切换、全局事件
 */
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager = null;
    
    // 游戏状态
    private _gameState: GameState = GameState.NONE;
    private _score: number = 0;
    private _bestScore: number = 0;
    
    // 对象池缓存
    private _pools: Map<string, NodePool> = new Map();
    
    static getInstance(): GameManager {
        return this._instance;
    }
    
    onLoad() {
        if (GameManager._instance === null) {
            GameManager._instance = this;
            director.addPersistRootNode(this.node);
            this._init();
        } else {
            this.node.destroy();
        }
    }
    
    private _init() {
        // 初始化微信环境
        WXManager.getInstance().init();
        
        // 读取本地最高分
        this._bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        
        console.log('GameManager initialized');
    }
    
    // ========== 场景切换 ==========
    
    loadScene(sceneName: string) {
        director.loadScene(sceneName);
    }
    
    // ========== 游戏状态 ==========
    
    startGame() {
        this._gameState = GameState.PLAYING;
        this._score = 0;
        this.emit('game-start');
    }
    
    pauseGame() {
        if (this._gameState === GameState.PLAYING) {
            this._gameState = GameState.PAUSED;
            director.pause();
            this.emit('game-pause');
        }
    }
    
    resumeGame() {
        if (this._gameState === GameState.PAUSED) {
            this._gameState = GameState.PLAYING;
            director.resume();
            this.emit('game-resume');
        }
    }
    
    endGame() {
        this._gameState = GameState.GAMEOVER;
        
        // 更新最高分
        if (this._score > this._bestScore) {
            this._bestScore = this._score;
            localStorage.setItem('bestScore', this._bestScore.toString());
            
            // 上传排行榜
            WXManager.getInstance().setRankScore(this._score);
        }
        
        this.emit('game-over', { score: this._score, bestScore: this._bestScore });
    }
    
    // ========== 分数 ==========
    
    addScore(points: number) {
        this._score += points;
        this.emit('score-changed', this._score);
    }
    
    getScore(): number {
        return this._score;
    }
    
    getBestScore(): number {
        return this._bestScore;
    }
    
    getGameState(): GameState {
        return this._gameState;
    }
    
    // ========== 对象池 ==========
    
    /**
     * 创建或获取对象池
     */
    getPool(prefab: Prefab, poolName?: string): NodePool {
        const name = poolName || prefab.name;
        
        if (!this._pools.has(name)) {
            const pool = new NodePool();
            this._pools.set(name, pool);
        }
        
        return this._pools.get(name);
    }
    
    /**
     * 从对象池获取节点
     */
    getFromPool(prefab: Prefab, poolName?: string): Node {
        const pool = this.getPool(prefab, poolName);
        
        if (pool.size() > 0) {
            return pool.get();
        }
        
        return instantiate(prefab);
    }
    
    /**
     * 回收节点到对象池
     */
    putToPool(node: Node, poolName: string) {
        if (this._pools.has(poolName)) {
            this._pools.get(poolName).put(node);
        } else {
            node.destroy();
        }
    }
    
    // ========== 全局事件系统 ==========
    
    private _events: Map<string, Function[]> = new Map();
    
    on(event: string, callback: Function) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        this._events.get(event).push(callback);
    }
    
    off(event: string, callback: Function) {
        if (this._events.has(event)) {
            const callbacks = this._events.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event: string, data?: any) {
        if (this._events.has(event)) {
            this._events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Event ${event} callback error:`, e);
                }
            });
        }
    }
}

export enum GameState {
    NONE = 'none',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAMEOVER = 'gameover'
}
