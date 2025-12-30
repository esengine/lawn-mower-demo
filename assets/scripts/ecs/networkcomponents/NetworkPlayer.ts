import { Component, ECSComponent } from '@esengine/ecs-framework';
import {
    createSnapshotBuffer,
    createTransformInterpolator,
    type ISnapshotBuffer,
    type ITransformStateWithVelocity,
    type TransformInterpolator
} from '@esengine/network';

/**
 * 网络位置数据结构（平台无关）
 */
export interface NetworkVector2 {
    x: number;
    y: number;
}

/**
 * 网络玩家组件（服务端和客户端共享）
 */
@ECSComponent('NetworkPlayer')
export class NetworkPlayer extends Component {
    public clientId: string = '';
    public isLocalPlayer: boolean = false;
    public isHost: boolean = false;
    public playerName: string = '';
    public team: number = 0;
    public score: number = 0;
    public kills: number = 0;
    public deaths: number = 0;
    public joinTime: number = 0;
    public lastUpdateTime: number = 0;
    public ping: number = 0;
    public isReady: boolean = false;

    // 网络同步的位置和状态（使用SyncVar）
    // @SyncVar
    public networkPosition: NetworkVector2 = { x: 0, y: 0 };
    // @SyncVar
    public networkRotation: number = 0;
    // @SyncVar
    public networkVelocity: NetworkVector2 = { x: 0, y: 0 };
    public lastNetworkUpdate: number = 0;

    // =========================================================================
    // 远程玩家插值 | Remote Player Interpolation (使用框架的 SnapshotBuffer)
    // =========================================================================

    /** @zh 是否启用插值 @en Enable interpolation */
    public enableInterpolation: boolean = true;

    /** @zh 插值延迟（毫秒），渲染位置落后于最新数据的时间 @en Interpolation delay in ms */
    public interpolationDelay: number = 100;

    /** @zh 快照缓冲区 @en Snapshot buffer */
    private _snapshotBuffer: ISnapshotBuffer<ITransformStateWithVelocity> | null = null;

    /** @zh 变换插值器 @en Transform interpolator */
    private _interpolator: TransformInterpolator | null = null;

    /** @zh 旧版插值速度（保留兼容性） @en Legacy interpolation speed */
    public interpolationSpeed: number = 10;

    // =========================================================================
    // 客户端预测 + 服务器校正 | Client Prediction + Server Reconciliation
    // =========================================================================

    /** @zh 是否启用客户端预测 @en Enable client-side prediction */
    public enablePrediction: boolean = true;

    /** @zh 校正阈值（位置差异超过此值时进行校正） @en Reconciliation threshold */
    public reconciliationThreshold: number = 5.0;

    /** @zh 平滑校正速度 @en Smooth correction speed */
    public correctionSpeed: number = 15.0;

    /** @zh 待校正的位置差异 @en Pending position correction */
    public pendingCorrection: NetworkVector2 = { x: 0, y: 0 };

    public customData: Record<string, any> = {};

    public init(clientId: string, isLocalPlayer: boolean = false, playerName: string = '') {
        this.clientId = clientId;
        this.isLocalPlayer = isLocalPlayer;
        this.playerName = playerName || `Player_${clientId.slice(-4)}`;
        this.joinTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.lastNetworkUpdate = Date.now();

        // 远程玩家：初始化快照缓冲区和插值器
        if (!isLocalPlayer) {
            this._snapshotBuffer = createSnapshotBuffer<ITransformStateWithVelocity>(30, this.interpolationDelay);
            this._interpolator = createTransformInterpolator();
        }

        return this;
    }

    /**
     * @zh 获取快照缓冲区
     * @en Get snapshot buffer
     */
    public get snapshotBuffer(): ISnapshotBuffer<ITransformStateWithVelocity> | null {
        return this._snapshotBuffer;
    }

    /**
     * @zh 获取插值器
     * @en Get interpolator
     */
    public get interpolator(): TransformInterpolator | null {
        return this._interpolator;
    }

    public updateStats(kills: number = 0, deaths: number = 0, score: number = 0) {
        this.kills += kills;
        this.deaths += deaths;
        this.score += score;
        this.lastUpdateTime = Date.now();
    }

    public updatePing(ping: number) {
        this.ping = ping;
        this.lastUpdateTime = Date.now();
    }

    public setReady(ready: boolean) {
        this.isReady = ready;
        this.lastUpdateTime = Date.now();
    }

    /**
     * 更新网络位置信息
     */
    public updateNetworkTransform(position: NetworkVector2, rotation: number = 0, velocity?: NetworkVector2) {
        this.networkPosition.x = position.x;
        this.networkPosition.y = position.y;
        this.networkRotation = rotation;
        if (velocity) {
            this.networkVelocity.x = velocity.x;
            this.networkVelocity.y = velocity.y;
        }
        this.lastNetworkUpdate = Date.now();
        this.lastUpdateTime = Date.now();
    }

    /**
     * 检查是否需要网络更新
     */
    public shouldSendNetworkUpdate(threshold: number = 1.0): boolean {
        const timeSinceLastUpdate = Date.now() - this.lastNetworkUpdate;
        return timeSinceLastUpdate > threshold;
    }

    public getSessionTime(): number {
        return Date.now() - this.joinTime;
    }

    public isActive(): boolean {
        return Date.now() - this.lastUpdateTime < 30000; // 30秒内有活动
    }

    public getNetworkLatency(): number {
        return this.ping;
    }

    /**
     * 获取插值后的位置（用于平滑移动）
     * 注意：这个方法在客户端需要特殊处理，因为需要具体的Vec2实现
     */
    public getInterpolatedPosition(currentPosition: NetworkVector2, deltaTime: number): NetworkVector2 {
        if (!this.enableInterpolation || this.isLocalPlayer) {
            return currentPosition;
        }

        const lerpFactor = Math.min(1.0, deltaTime * this.interpolationSpeed);
        return {
            x: currentPosition.x + (this.networkPosition.x - currentPosition.x) * lerpFactor,
            y: currentPosition.y + (this.networkPosition.y - currentPosition.y) * lerpFactor
        };
    }

    // =========================================================================
    // 服务器校正辅助方法 | Server Reconciliation Helper Methods
    // =========================================================================

    /**
     * @zh 应用平滑校正
     * @en Apply smooth correction
     */
    public applySmoothCorrection(deltaTime: number): NetworkVector2 {
        const correctionX = this.pendingCorrection.x;
        const correctionY = this.pendingCorrection.y;

        if (Math.abs(correctionX) < 0.01 && Math.abs(correctionY) < 0.01) {
            this.pendingCorrection.x = 0;
            this.pendingCorrection.y = 0;
            return { x: 0, y: 0 };
        }

        const factor = Math.min(1.0, deltaTime * this.correctionSpeed);
        const appliedX = correctionX * factor;
        const appliedY = correctionY * factor;

        this.pendingCorrection.x -= appliedX;
        this.pendingCorrection.y -= appliedY;

        return { x: appliedX, y: appliedY };
    }

    /**
     * @zh 设置待校正的位置差异
     * @en Set pending position correction
     */
    public setCorrection(dx: number, dy: number): void {
        this.pendingCorrection.x = dx;
        this.pendingCorrection.y = dy;
    }

    /**
     * @zh 检查是否需要大幅校正（瞬移）
     * @en Check if major correction (teleport) is needed
     */
    public needsHardCorrection(serverX: number, serverY: number, clientX: number, clientY: number): boolean {
        const dx = serverX - clientX;
        const dy = serverY - clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > this.reconciliationThreshold * 3; // 超过3倍阈值直接瞬移
    }

    // =========================================================================
    // 远程玩家插值方法 | Remote Player Interpolation Methods (使用框架实现)
    // =========================================================================

    /**
     * @zh 添加位置快照到缓冲区（使用框架的 SnapshotBuffer）
     * @en Add position snapshot to buffer (using framework's SnapshotBuffer)
     */
    public addPositionSnapshot(position: NetworkVector2, rotation: number, velocity: NetworkVector2): void {
        if (!this._snapshotBuffer) return;

        this._snapshotBuffer.push({
            timestamp: Date.now(),
            state: {
                x: position.x,
                y: position.y,
                rotation,
                velocityX: velocity.x,
                velocityY: velocity.y,
                angularVelocity: 0
            }
        });
    }

    /**
     * @zh 获取插值后的位置和旋转（使用框架的 SnapshotBuffer + TransformInterpolator）
     * @en Get interpolated position and rotation (using framework's SnapshotBuffer + TransformInterpolator)
     */
    public getBufferedInterpolation(): { position: NetworkVector2; rotation: number; velocity: NetworkVector2 } | null {
        if (!this._snapshotBuffer || !this._interpolator) {
            return null;
        }

        const renderTime = Date.now();
        const snapshots = this._snapshotBuffer.getInterpolationSnapshots(renderTime);

        if (!snapshots) {
            // 没有足够快照，使用最新的
            const latest = this._snapshotBuffer.getLatest();
            if (latest) {
                return {
                    position: { x: latest.state.x, y: latest.state.y },
                    rotation: latest.state.rotation,
                    velocity: { x: latest.state.velocityX, y: latest.state.velocityY }
                };
            }
            return null;
        }

        const [prev, next, t] = snapshots;
        const interpolated = this._interpolator.interpolate(prev.state, next.state, t);

        return {
            position: { x: interpolated.x, y: interpolated.y },
            rotation: interpolated.rotation,
            velocity: {
                x: prev.state.velocityX + (next.state.velocityX - prev.state.velocityX) * t,
                y: prev.state.velocityY + (next.state.velocityY - prev.state.velocityY) * t
            }
        };
    }

    /**
     * @zh 清空位置缓冲区
     * @en Clear position buffer
     */
    public clearPositionBuffer(): void {
        this._snapshotBuffer?.clear();
    }
}