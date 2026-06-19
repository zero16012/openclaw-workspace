/**
 * 通用对象池
 * 用于管理游戏中频繁创建和销毁的对象
 */
export class ObjectPool<T> {
    private _pool: T[] = [];
    private _createFunc: () => T;
    private _resetFunc: (obj: T) => void;
    private _maxSize: number;
    
    /**
     * @param createFunc 创建对象的工厂函数
     * @param resetFunc 重置对象的函数
     * @param maxSize 对象池最大容量
     */
    constructor(createFunc: () => T, resetFunc: (obj: T) => void, maxSize: number = 50) {
        this._createFunc = createFunc;
        this._resetFunc = resetFunc;
        this._maxSize = maxSize;
    }
    
    /**
     * 从对象池获取对象
     */
    get(): T {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        return this._createFunc();
    }
    
    /**
     * 回收对象到对象池
     */
    put(obj: T): boolean {
        if (this._pool.length >= this._maxSize) {
            return false; // 对象池已满
        }
        
        this._resetFunc(obj);
        this._pool.push(obj);
        return true;
    }
    
    /**
     * 预创建对象
     */
    preCreate(count: number) {
        for (let i = 0; i < count; i++) {
            if (this._pool.length >= this._maxSize) break;
            this._pool.push(this._createFunc());
        }
    }
    
    /**
     * 清空对象池
     */
    clear() {
        this._pool.length = 0;
    }
    
    /**
     * 获取对象池大小
     */
    size(): number {
        return this._pool.length;
    }
}

/**
 * Cocos Creator 节点对象池封装
 */
import { Node, instantiate, Prefab } from 'cc';

export class NodeObjectPool {
    private _pool: Node[] = [];
    private _prefab: Prefab;
    private _maxSize: number;
    
    constructor(prefab: Prefab, maxSize: number = 50) {
        this._prefab = prefab;
        this._maxSize = maxSize;
    }
    
    /**
     * 获取节点
     */
    get(): Node {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        return instantiate(this._prefab);
    }
    
    /**
     * 回收节点
     */
    put(node: Node): boolean {
        if (this._pool.length >= this._maxSize) {
            node.destroy();
            return false;
        }
        
        node.removeFromParent();
        this._pool.push(node);
        return true;
    }
    
    /**
     * 预创建节点
     */
    preCreate(count: number) {
        for (let i = 0; i < count; i++) {
            if (this._pool.length >= this._maxSize) break;
            this._pool.push(instantiate(this._prefab));
        }
    }
    
    /**
     * 清空对象池
     */
    clear() {
        this._pool.forEach(node => node.destroy());
        this._pool.length = 0;
    }
    
    size(): number {
        return this._pool.length;
    }
}
