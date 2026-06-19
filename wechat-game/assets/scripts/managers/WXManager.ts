/**
 * 微信 API 管理器 - 单例
 * 封装所有微信小游戏 API，提供统一的调用接口
 */
export class WXManager {
    private static _instance: WXManager = null;
    private _isWX: boolean = false;
    
    static getInstance(): WXManager {
        if (!this._instance) {
            this._instance = new WXManager();
        }
        return this._instance;
    }
    
    /**
     * 初始化微信环境
     */
    init() {
        this._isWX = typeof window !== 'undefined' && !!window['wx'];
        
        if (!this._isWX) {
            console.warn('[WXManager] 不在微信环境，部分功能不可用');
            return;
        }
        
        const wx = window['wx'];
        
        // 显示分享按钮
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        
        // 监听被动分享（点击右上角分享）
        wx.onShareAppMessage(() => {
            return this._getShareData();
        });
        
        // 监听分享到朋友圈
        wx.onShareTimeline(() => {
            return this._getShareData();
        });
        
        // 显示转发按钮
        wx.showShareMenu({
            withShareTicket: true
        });
        
        console.log('[WXManager] 微信环境初始化完成');
    }
    
    /**
     * 是否在微信环境
     */
    isWX(): boolean {
        return this._isWX;
    }
    
    // ========== 登录与用户 ==========
    
    /**
     * 微信登录，获取 code
     */
    async login(): Promise<string> {
        if (!this._isWX) return '';
        
        return new Promise((resolve, reject) => {
            window['wx'].login({
                success: (res) => resolve(res.code),
                fail: reject
            });
        });
    }
    
    /**
     * 获取用户信息（需要用户点击触发）
     */
    async getUserProfile(): Promise<any> {
        if (!this._isWX) return null;
        
        return new Promise((resolve, reject) => {
            window['wx'].getUserProfile({
                desc: '用于展示游戏排行榜和头像',
                success: resolve,
                fail: reject
            });
        });
    }
    
    /**
     * 获取微信开放数据（用于排行榜）
     */
    getOpenDataContext(): any {
        if (!this._isWX) return null;
        return window['wx'].getOpenDataContext();
    }
    
    // ========== 分享 ==========
    
    /**
     * 主动分享
     */
    shareAppMessage(title?: string, imageUrl?: string): Promise<any> {
        if (!this._isWX) {
            console.log('[WXManager] 模拟分享:', title);
            return Promise.resolve({});
        }
        
        const shareData = this._getShareData(title, imageUrl);
        
        return new Promise((resolve) => {
            window['wx'].shareAppMessage({
                ...shareData,
                success: resolve,
                fail: resolve
            });
        });
    }
    
    /**
     * 获取分享数据
     */
    private _getShareData(title?: string, imageUrl?: string): any {
        const shareTitles = [
            '这游戏太上头了，根本停不下来！',
            '我得了 {score} 分，你能超过我吗？',
            '发现了一个超好玩的小游戏，推荐给你！',
            '手残党慎入，这游戏有点难...'
        ];
        
        return {
            title: title || shareTitles[Math.floor(Math.random() * shareTitles.length)],
            imageUrl: imageUrl || '', // 可以传 canvas.toTempFilePathSync()
            query: 'from=friend'
        };
    }
    
    // ========== 排行榜 ==========
    
    /**
     * 上传分数到微信云
     */
    setRankScore(score: number) {
        if (!this._isWX) return;
        
        window['wx'].setUserCloudStorage({
            KVDataList: [{
                key: 'score',
                value: JSON.stringify({
                    score: score,
                    updateTime: Date.now()
                })
            }]
        });
    }
    
    /**
     * 获取好友排行榜数据
     */
    getFriendRankData() {
        if (!this._isWX) return;
        
        const openDataContext = this.getOpenDataContext();
        if (openDataContext) {
            openDataContext.postMessage({
                action: 'getFriendRank',
                key: 'score'
            });
        }
    }
    
    // ========== 广告 ==========
    
    private _rewardedAd: any = null;
    private _interstitialAd: any = null;
    private _bannerAd: any = null;
    
    /**
     * 创建激励视频广告
     */
    createRewardedAd(adUnitId: string) {
        if (!this._isWX) return;
        
        if (!this._rewardedAd) {
            this._rewardedAd = window['wx'].createRewardedVideoAd({ adUnitId });
        }
    }
    
    /**
     * 显示激励视频广告
     * @returns Promise<boolean> 是否完整观看
     */
    async showRewardedAd(): Promise<boolean> {
        if (!this._isWX || !this._rewardedAd) {
            console.log('[WXManager] 模拟广告播放完成');
            return true;
        }
        
        return new Promise((resolve) => {
            const onClose = (res) => {
                resolve(res && res.isEnded);
                this._rewardedAd.offClose(onClose);
            };
            
            const onError = (err) => {
                console.error('[WXManager] 广告错误:', err);
                resolve(false);
                this._rewardedAd.offError(onError);
            };
            
            this._rewardedAd.onClose(onClose);
            this._rewardedAd.onError(onError);
            this._rewardedAd.show().catch(() => {
                this._rewardedAd.load().then(() => this._rewardedAd.show());
            });
        });
    }
    
    /**
     * 创建插屏广告
     */
    createInterstitialAd(adUnitId: string) {
        if (!this._isWX) return;
        
        this._interstitialAd = window['wx'].createInterstitialAd({ adUnitId });
    }
    
    /**
     * 显示插屏广告
     */
    showInterstitialAd() {
        if (!this._isWX || !this._interstitialAd) return;
        
        this._interstitialAd.show().catch((err) => {
            console.error('[WXManager] 插屏广告显示失败:', err);
        });
    }
    
    /**
     * 创建 Banner 广告
     */
    createBannerAd(adUnitId: string, style?: any) {
        if (!this._isWX) return null;
        
        const systemInfo = this.getSystemInfo();
        const screenWidth = systemInfo.screenWidth || 375;
        const screenHeight = systemInfo.screenHeight || 667;
        
        const bannerAd = window['wx'].createBannerAd({
            adUnitId,
            style: {
                left: 0,
                top: screenHeight - 100,
                width: screenWidth,
                ...style
            }
        });
        
        this._bannerAd = bannerAd;
        return bannerAd;
    }
    
    /**
     * 显示 Banner 广告
     */
    showBannerAd() {
        if (this._bannerAd) {
            this._bannerAd.show();
        }
    }
    
    /**
     * 隐藏 Banner 广告
     */
    hideBannerAd() {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    }
    
    // ========== 设备与系统 ==========
    
    /**
     * 获取系统信息
     */
    getSystemInfo(): any {
        if (!this._isWX) {
            return {
                screenWidth: 750,
                screenHeight: 1334,
                windowWidth: 750,
                windowHeight: 1334,
                platform: 'devtools'
            };
        }
        
        return window['wx'].getSystemInfoSync();
    }
    
    /**
     * 短振动反馈
     */
    vibrateShort() {
        if (this._isWX && window['wx'].vibrateShort) {
            window['wx'].vibrateShort({ type: 'light' });
        }
    }
    
    /**
     * 长振动反馈
     */
    vibrateLong() {
        if (this._isWX && window['wx'].vibrateLong) {
            window['wx'].vibrateLong();
        }
    }
    
    // ========== 数据存储 ==========
    
    /**
     * 保存数据到本地
     */
    setStorage(key: string, value: any) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('[WXManager] 存储失败:', e);
        }
    }
    
    /**
     * 读取本地数据
     */
    getStorage(key: string, defaultValue?: any): any {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
    
    /**
     * 移除本地数据
     */
    removeStorage(key: string) {
        localStorage.removeItem(key);
    }
    
    // ========== 游戏圈/客服 ==========
    
    /**
     * 打开客服会话
     */
    openCustomerService() {
        if (!this._isWX) return;
        
        window['wx'].openCustomerServiceConversation({
            sessionFrom: 'wechat-game',
            showMessageCard: true,
            sendMessageTitle: '遇到问题？联系我们',
            sendMessagePath: 'pages/index/index',
            sendMessageImg: ''
        });
    }
    
    /**
     * 创建游戏圈按钮
     */
    createGameClubButton(style?: any) {
        if (!this._isWX) return null;
        
        return window['wx'].createGameClubButton({
            icon: 'green',
            style: {
                left: 10,
                top: 10,
                width: 40,
                height: 40,
                ...style
            }
        });
    }
}
