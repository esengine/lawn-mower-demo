# Lawn Mower Demo

基于 ESEngine 的多人割草机游戏演示，展示 ECS 架构和网络同步的最佳实践。

## 前置要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (推荐使用 pnpm，原生支持 workspace)

### 安装 pnpm

如果你还没有安装 pnpm，可以通过以下方式安装：

```bash
# 使用 npm 安装（推荐）
npm install -g pnpm

# 或使用 corepack（Node.js 16.9+ 自带）
corepack enable
corepack prepare pnpm@latest --activate

# 验证安装
pnpm --version
```

> **为什么用 pnpm？** pnpm 对 monorepo workspace 支持最好，安装速度快，磁盘占用小。

## 项目结构

```
lawn-mower-demo/
├── packages/
│   ├── shared/                 # @example/lawn-mower-shared
│   │   └── src/
│   │       ├── components/     # 共享组件（带 @sync 装饰器）
│   │       ├── protocol.ts     # 消息协议定义
│   │       └── constants.ts    # 游戏常量
│   │
│   └── server/                 # @example/lawn-mower-server
│       └── src/
│           ├── rooms/          # 房间实现
│           └── main.ts         # 服务器入口
│
├── assets/                     # Cocos Creator 客户端
│   └── scripts/
│       ├── ecs/               # ECS 组件和系统
│       └── network/           # 网络服务
│
├── pnpm-workspace.yaml        # pnpm workspace 配置
└── package.json               # Cocos Creator 项目配置
```

## 快速开始

### 1. 安装依赖

```bash
cd lawn-mower-demo
pnpm install
```

### 2. 构建 shared 包

```bash
pnpm --filter @example/lawn-mower-shared build
```

### 3. 启动服务器

```bash
# 开发模式
pnpm --filter @example/lawn-mower-server dev

# 或构建后运行
pnpm --filter @example/lawn-mower-server build
pnpm --filter @example/lawn-mower-server start
```

### 4. 启动客户端

在 Cocos Creator 中打开项目并运行。

## 架构特点

### 共享代码 (packages/shared)

- **组件定义**: 使用 `@ECSComponent` 和 `@sync` 装饰器
- **协议**: 客户端/服务端消息类型定义
- **常量**: 游戏配置常量

```typescript
@ECSComponent('PlayerComponent')
export class PlayerComponent extends Component {
    @sync('string') playerId: string = '';
    @sync('float32') x: number = 0;
    @sync('float32') y: number = 0;
    // ...
}
```

### 服务端 (packages/server)

- 继承 `ECSRoom` 实现自动状态同步
- 使用 `@onMessage` 装饰器处理消息
- 二进制增量同步，最小化带宽

```typescript
export class GameRoom extends ECSRoom {
    @onMessage(MsgTypes.JoinGame)
    handleJoinGame(data: JoinGameMsg, player: Player) {
        const entity = this.createPlayerEntity(player.id);
        entity.addComponent(new PlayerComponent());
        this.broadcastSpawn(entity, 'Player');
    }
}
```

### 客户端 (assets/scripts)

- 使用 `@esengine/rpc` 连接服务器
- 自动解码二进制状态更新
- 基于 ECS 的游戏逻辑

## 依赖说明

| 包 | 版本 | 说明 |
|----|------|------|
| @esengine/ecs-framework | ^2.5.0 | ECS 核心框架 |
| @esengine/server | ^2.0.0 | 游戏服务器框架 |
| @esengine/rpc | ^1.1.1 | RPC 通信 |

## 开发说明

本项目是独立的 git submodule，拥有自己的 pnpm workspace：

- `packages/shared` 和 `packages/server` 是 workspace 内部包
- `@esengine/*` 从 npm 获取发布版本
- 根目录 (lawn-mower-demo) 也是 workspace 成员，用于 Cocos Creator 客户端

## License

MIT
