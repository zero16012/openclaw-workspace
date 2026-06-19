/**
 * 全局事件总线
 * 用于跨组件通信，不依赖节点层级关系
 */
export class EventBus {
    private static _instance: EventBus = null;
    private _events: Map<string, Array<{ callback: Function; target?: any }>> = new Map();
    
    static getInstance(): EventBus {
        if (!this._instance) {
            this._instance = new EventBus();
        }
        return this._instance;
    }
    
    /**
     * 监听事件
     * @param event 事件名称
     * @param callback 回调函数
     * @param target 回调函数所属对象（用于自动清理）
     */
    on(event: string, callback: Function, target?: any) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        
        this._events.get(event).push({ callback, target });
    }
    
    /**
     * 监听一次事件
     */
    once(event: string, callback: Function, target?: any) {
        const onceCallback = (...args: any[]) => {
            this.off(event, onceCallback);
            callback.apply(target, args);
        };
        
        this.on(event, onceCallback, target);
    }
    
    /**
     * 取消监听
     */
    off(event: string, callback?: Function) {
        if (!this._events.has(event)) return;
        
        if (!callback) {
            // 取消该事件的所有监听
            this._events.delete(event);
            return;
        }
        
        const listeners = this._events.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        if (listeners.length === 0) {
            this._events.delete(event);
        }
    }
    
    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]) {
        if (!this._events.has(event)) return;
        
        const listeners = this._events.get(event);
        
        // 复制数组防止回调中修改原数组
        listeners.slice().forEach(({ callback, target }) => {
            try {
                if (target) {
                    callback.call(target, ...args);
                } else {
                    callback(...args);
                }
            } catch (e) {
                console.error(`[EventBus] 事件 ${event} 回调执行错误:`, e);
            }
        });
    }
    
    /**
     * 清理指定目标的所有监听
     */
    offByTarget(target: any) {
        this._events.forEach((listeners, event) => {
            const filtered = listeners.filter(l => l.target !== target);
            
            if (filtered.length === 0) {
                this._events.delete(event);
            } else {
                this._events.set(event, filtered);
            }
        });
    }
    
    /**
     * 清理所有事件
     */
    clear() {
        this._events.clear();
    }
}

/**
 * 使用装饰器简化事件监听
 * 示例：
 * @eventListener('game-start')
 * onGameStart() { ... }
 */
export function eventListener(eventName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalOnLoad = target.onLoad;
        
        target.onLoad = function () {
            EventBus.getInstance().on(eventName, descriptor.value, this);
            
            if (originalOnLoad) {
                originalOnLoad.call(this);
            }
        };
        
        const originalOnDestroy = target.onDestroy;
        
        target.onDestroy = function () {
            EventBus.getInstance().offByTarget(this);
            
            if (originalOnDestroy) {
                originalOnDestroy.call(this);
            }
        };
        
        return descriptor;
    };
}
