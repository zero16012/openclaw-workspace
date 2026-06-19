import { _decorator, Component, instantiate, Node, Prefab, UITransform, view, Vec3, Widget } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

/**
 * UI 管理器 - 单例
 * 负责管理所有 UI 界面的打开、关闭、层级
 */
@ccclass('UIManager')
export class UIManager extends Component {
    private static _instance: UIManager = null;
    
    // UI 层级节点
    @property(Node)
    uiLayer: Node = null;      // 普通 UI 层
    
    @property(Node)
    popupLayer: Node = null;   // 弹窗层
    
    @property(Node)
    topLayer: Node = null;     // 最上层（Loading、Toast）
    
    // UI 预制体缓存
    private _prefabs: Map<string, Prefab> = new Map();
    
    // 已打开的 UI
    private _openedUI: Map<string, Node> = new Map();
    
    static getInstance(): UIManager {
        return this._instance;
    }
    
    onLoad() {
        if (UIManager._instance === null) {
            UIManager._instance = this;
            director.addPersistRootNode(this.node);
        } else {
            this.node.destroy();
        }
    }
    
    /**
     * 预加载 UI 预制体
     */
    preloadPrefab(name: string, prefab: Prefab) {
        this._prefabs.set(name, prefab);
    }
    
    /**
     * 打开 UI
     * @param name UI 名称
     * @param prefab UI 预制体（如果未预加载）
     * @param layer 层级类型
     * @param data 传递的数据
     */
    openUI(name: string, prefab?: Prefab, layer: UILayer = UILayer.UI, data?: any): Node {
        // 如果已经打开，直接返回
        if (this._openedUI.has(name)) {
            return this._openedUI.get(name);
        }
        
        // 获取预制体
        const uiPrefab = prefab || this._prefabs.get(name);
        if (!uiPrefab) {
            console.error(`[UIManager] UI 预制体不存在: ${name}`);
            return null;
        }
        
        // 实例化
        const uiNode = instantiate(uiPrefab);
        
        // 根据层级添加到对应父节点
        const parent = this._getLayerNode(layer);
        if (parent) {
            uiNode.parent = parent;
            
            // 适配屏幕
            this._adaptScreen(uiNode);
        }
        
        // 调用初始化
        const uiComponent = uiNode.getComponent(BaseUI);
        if (uiComponent) {
            uiComponent.init(data);
        }
        
        this._openedUI.set(name, uiNode);
        
        return uiNode;
    }
    
    /**
     * 关闭 UI
     */
    closeUI(name: string) {
        if (this._openedUI.has(name)) {
            const uiNode = this._openedUI.get(name);
            
            // 调用关闭回调
            const uiComponent = uiNode.getComponent(BaseUI);
            if (uiComponent) {
                uiComponent.onClose();
            }
            
            uiNode.destroy();
            this._openedUI.delete(name);
        }
    }
    
    /**
     * 关闭所有 UI
     */
    closeAllUI() {
        this._openedUI.forEach((node, name) => {
            node.destroy();
        });
        this._openedUI.clear();
    }
    
    /**
     * 获取已打开的 UI
     */
    getUI(name: string): Node {
        return this._openedUI.get(name);
    }
    
    /**
     * 判断 UI 是否打开
     */
    isUIOpen(name: string): boolean {
        return this._openedUI.has(name);
    }
    
    /**
     * 显示 Toast
     */
    showToast(message: string, duration: number = 2) {
        // 这里可以实现一个简单的 Toast 预制体
        console.log(`[Toast] ${message}`);
    }
    
    /**
     * 显示 Loading
     */
    showLoading(message: string = '加载中...') {
        // 实现 Loading UI
        console.log(`[Loading] ${message}`);
    }
    
    /**
     * 隐藏 Loading
     */
    hideLoading() {
        console.log('[Loading] 隐藏');
    }
    
    private _getLayerNode(layer: UILayer): Node {
        switch (layer) {
            case UILayer.UI:
                return this.uiLayer;
            case UILayer.POPUP:
                return this.popupLayer;
            case UILayer.TOP:
                return this.topLayer;
            default:
                return this.uiLayer;
        }
    }
    
    private _adaptScreen(node: Node) {
        // 适配不同屏幕尺寸
        const uiTransform = node.getComponent(UITransform);
        if (uiTransform) {
            const visibleSize = view.getVisibleSize();
            uiTransform.width = visibleSize.width;
            uiTransform.height = visibleSize.height;
        }
        
        // 添加 Widget 组件自动适配
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
    }
}

/**
 * UI 层级枚举
 */
export enum UILayer {
    UI = 'ui',
    POPUP = 'popup',
    TOP = 'top'
}

/**
 * UI 基类
 * 所有 UI 组件都应继承此类
 */
@ccclass('BaseUI')
export class BaseUI extends Component {
    protected _data: any = null;
    
    /**
     * 初始化（由 UIManager 调用）
     */
    init(data?: any) {
        this._data = data;
        this.onInit();
    }
    
    /**
     * 子类重写：初始化逻辑
     */
    protected onInit() {
        // 子类实现
    }
    
    /**
     * 关闭回调
     */
    onClose() {
        // 子类可以重写
    }
    
    /**
     * 关闭当前 UI
     */
    close() {
        const uiName = this.node.name;
        UIManager.getInstance().closeUI(uiName);
    }
}
