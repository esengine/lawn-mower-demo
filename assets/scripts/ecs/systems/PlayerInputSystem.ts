import { EntitySystem, Matcher, Entity, ECSSystem } from '@esengine/ecs-framework';
import { Transform, Movement, PlayerInput, NetworkPlayer } from '../components';
import { input, Input, EventKeyboard, KeyCode, Vec2 } from 'cc';
import { ECSManager } from '../ECSManager';

/**
 * 玩家输入系统 - 处理键盘输入并控制玩家移动
 */
@ECSSystem('PlayerInputSystem')
export class PlayerInputSystem extends EntitySystem {
    
    // 输入状态
    private inputState = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    
    private ecsManager: ECSManager | null = null;
    private lastInputSequence: number = 0;
    
    constructor() {
        super(Matcher.all(Transform, Movement, PlayerInput));
        this.setupInputHandling();
    }
    
    public setECSManager(ecsManager: ECSManager): void {
        this.ecsManager = ecsManager;
    }
    
    /**
     * 设置输入处理
     */
    private setupInputHandling(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    
    // 上一帧的输入状态，用于检测变化
    private lastDx: number = 0;
    private lastDy: number = 0;

    /**
     * 处理所有匹配的实体
     */
    protected process(entities: Entity[]): void {
        for (const entity of entities) {
            const movement = entity.getComponent(Movement);
            const networkPlayer = entity.getComponent(NetworkPlayer);
            if (!movement) continue;

            // 如果是网络玩家且不是本地玩家，跳过输入处理
            if (networkPlayer && !networkPlayer.isLocalPlayer) {
                continue;
            }

            // 计算输入方向
            let dx = 0;
            let dy = 0;
            if (this.inputState.left) dx -= 1;
            if (this.inputState.right) dx += 1;
            if (this.inputState.up) dy += 1;
            if (this.inputState.down) dy -= 1;

            // 标准化方向向量
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
            }

            // 更新本地移动方向
            movement.inputDirection.set(dx, dy);

            // 如果是本地网络玩家，检测输入变化并发送到服务器
            if (networkPlayer && networkPlayer.isLocalPlayer && this.ecsManager) {
                // 输入变化时发送
                if (dx !== this.lastDx || dy !== this.lastDy) {
                    this.ecsManager.sendInput(dx, dy, false);
                    this.lastDx = dx;
                    this.lastDy = dy;
                }
            }
        }
    }
    
    /**
     * 按键按下处理
     */
    private onKeyDown(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.inputState.left = true;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.inputState.right = true;
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.inputState.up = true;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.inputState.down = true;
                break;
        }
    }
    
    /**
     * 按键松开处理
     */
    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.inputState.left = false;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.inputState.right = false;
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.inputState.up = false;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.inputState.down = false;
                break;
        }
    }
    
    /**
     * 系统销毁时清理事件监听
     */
    public onRemoved(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
} 