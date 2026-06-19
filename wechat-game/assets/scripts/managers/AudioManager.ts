import { _decorator, Component, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 音频管理器 - 单例
 * 负责背景音乐和音效的播放、音量控制
 */
@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager = null;
    
    // 音乐音量
    private _musicVolume: number = 1;
    // 音效音量
    private _effectVolume: number = 1;
    // 是否静音
    private _muted: boolean = false;
    
    // 音频缓存
    private _clips: Map<string, AudioClip> = new Map();
    
    // 背景音乐播放器
    @property(AudioSource)
    musicSource: AudioSource = null;
    
    // 音效播放器（多个，防止重叠）
    private _effectSources: AudioSource[] = [];
    private _currentEffectIndex: number = 0;
    private readonly _effectPoolSize: number = 5;
    
    static getInstance(): AudioManager {
        return this._instance;
    }
    
    onLoad() {
        if (AudioManager._instance === null) {
            AudioManager._instance = this;
            director.addPersistRootNode(this.node);
            this._init();
        } else {
            this.node.destroy();
        }
    }
    
    private _init() {
        // 创建音效播放器池
        for (let i = 0; i < this._effectPoolSize; i++) {
            const source = this.node.addComponent(AudioSource);
            source.playOnAwake = false;
            this._effectSources.push(source);
        }
        
        // 如果没有指定 musicSource，创建一个
        if (!this.musicSource) {
            this.musicSource = this.node.addComponent(AudioSource);
            this.musicSource.playOnAwake = false;
            this.musicSource.loop = true;
        }
        
        // 读取保存的音量设置
        this._musicVolume = parseFloat(localStorage.getItem('musicVolume') || '1');
        this._effectVolume = parseFloat(localStorage.getItem('effectVolume') || '1');
        this._muted = localStorage.getItem('muted') === 'true';
        
        this._updateVolume();
    }
    
    // ========== 背景音乐 ==========
    
    /**
     * 播放背景音乐
     */
    playMusic(clip: AudioClip, fadeIn: boolean = true) {
        if (!clip) return;
        
        if (this.musicSource.clip === clip && this.musicSource.playing) {
            return;
        }
        
        this.musicSource.clip = clip;
        
        if (fadeIn) {
            this.musicSource.volume = 0;
            this.musicSource.play();
            this._fadeInMusic();
        } else {
            this.musicSource.volume = this._getActualVolume(this._musicVolume);
            this.musicSource.play();
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopMusic(fadeOut: boolean = true) {
        if (!this.musicSource.playing) return;
        
        if (fadeOut) {
            this._fadeOutMusic();
        } else {
            this.musicSource.stop();
        }
    }
    
    /**
     * 暂停背景音乐
     */
    pauseMusic() {
        this.musicSource.pause();
    }
    
    /**
     * 恢复背景音乐
     */
    resumeMusic() {
        this.musicSource.play();
    }
    
    // ========== 音效 ==========
    
    /**
     * 播放音效
     */
    playEffect(clip: AudioClip): AudioSource {
        if (!clip || this._muted) return null;
        
        const source = this._getEffectSource();
        source.clip = clip;
        source.volume = this._getActualVolume(this._effectVolume);
        source.play();
        
        return source;
    }
    
    /**
     * 播放音效（通过名称）
     */
    playEffectByName(name: string) {
        const clip = this._clips.get(name);
        if (clip) {
            this.playEffect(clip);
        }
    }
    
    /**
     * 预加载音效
     */
    preloadEffect(name: string, clip: AudioClip) {
        this._clips.set(name, clip);
    }
    
    // ========== 音量控制 ==========
    
    /**
     * 设置音乐音量
     */
    setMusicVolume(volume: number) {
        this._musicVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('musicVolume', this._musicVolume.toString());
        this._updateVolume();
    }
    
    /**
     * 设置音效音量
     */
    setEffectVolume(volume: number) {
        this._effectVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('effectVolume', this._effectVolume.toString());
    }
    
    /**
     * 获取音乐音量
     */
    getMusicVolume(): number {
        return this._musicVolume;
    }
    
    /**
     * 获取音效音量
     */
    getEffectVolume(): number {
        return this._effectVolume;
    }
    
    /**
     * 静音切换
     */
    toggleMute(): boolean {
        this._muted = !this._muted;
        localStorage.setItem('muted', this._muted.toString());
        this._updateVolume();
        return this._muted;
    }
    
    /**
     * 是否静音
     */
    isMuted(): boolean {
        return this._muted;
    }
    
    // ========== 私有方法 ==========
    
    private _getEffectSource(): AudioSource {
        const source = this._effectSources[this._currentEffectIndex];
        this._currentEffectIndex = (this._currentEffectIndex + 1) % this._effectPoolSize;
        return source;
    }
    
    private _getActualVolume(volume: number): number {
        return this._muted ? 0 : volume;
    }
    
    private _updateVolume() {
        const actualVolume = this._getActualVolume(this._musicVolume);
        if (this.musicSource) {
            this.musicSource.volume = actualVolume;
        }
    }
    
    private _fadeInMusic() {
        const targetVolume = this._getActualVolume(this._musicVolume);
        let currentVolume = 0;
        const fadeStep = 0.05;
        const fadeInterval = setInterval(() => {
            currentVolume += fadeStep;
            if (currentVolume >= targetVolume) {
                currentVolume = targetVolume;
                clearInterval(fadeInterval);
            }
            if (this.musicSource) {
                this.musicSource.volume = currentVolume;
            }
        }, 100);
    }
    
    private _fadeOutMusic() {
        let currentVolume = this.musicSource.volume;
        const fadeStep = 0.05;
        const fadeInterval = setInterval(() => {
            currentVolume -= fadeStep;
            if (currentVolume <= 0) {
                currentVolume = 0;
                this.musicSource.stop();
                clearInterval(fadeInterval);
            }
            if (this.musicSource) {
                this.musicSource.volume = currentVolume;
            }
        }, 100);
    }
}
