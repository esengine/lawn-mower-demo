import { Node, tween, v3, UIOpacity } from 'cc';
import { UIAnimationFunction } from '@esengine/mvvm-ui-framework';

/**
 * UI动画工具类
 * 提供常用的UI动画效果
 */
export class UIAnimations {
    /**
     * 弹性缩放进入动画
     * 从0缩放到1.01，然后回到1
     */
    public static elasticScaleIn: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            // 设置初始状态
            view.setScale(v3(0, 0, 0));
            
            // 创建缓动动画
            tween(view)
                .to(0.1, { scale: v3(1.01, 1.01, 1.01) })
                .to(0.15, { scale: v3(1, 1, 1) })
                .call(() => {
                    resolve();
                })
                .start();
        });
    };

    /**
     * 缩放退出动画
     */
    public static scaleOut: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            tween(view)
                .to(0.2, { scale: v3(0, 0, 0) })
                .call(() => {
                    resolve();
                })
                .start();
        });
    };

    /**
     * 淡入动画
     */
    public static fadeIn: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            const uiOpacity = view.getComponent(UIOpacity);
            if (uiOpacity) {
                uiOpacity.opacity = 0;
                tween(uiOpacity)
                    .to(0.3, { opacity: 255 })
                    .call(() => {
                        resolve();
                    })
                    .start();
            } else {
                resolve();
            }
        });
    };

    /**
     * 淡出动画
     */
    public static fadeOut: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            const uiOpacity = view.getComponent(UIOpacity);
            if (uiOpacity) {
                tween(uiOpacity)
                    .to(0.3, { opacity: 0 })
                    .call(() => {
                        resolve();
                    })
                    .start();
            } else {
                resolve();
            }
        });
    };

    /**
     * 从上往下滑入
     */
    public static slideInFromTop: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            const originalY = view.position.y;
            view.setPosition(view.position.x, originalY + 500, view.position.z);
            
            tween(view)
                .to(0.3, { position: v3(view.position.x, originalY, view.position.z) })
                .call(() => {
                    resolve();
                })
                .start();
        });
    };

    /**
     * 向上滑出
     */
    public static slideOutToTop: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            const currentY = view.position.y;
            
            tween(view)
                .to(0.3, { position: v3(view.position.x, currentY + 500, view.position.z) })
                .call(() => {
                    resolve();
                })
                .start();
        });
    };

    /**
     * 组合动画：弹性缩放 + 淡入
     */
    public static elasticScaleAndFadeIn: UIAnimationFunction<Node> = async (view: Node): Promise<void> => {
        return new Promise<void>((resolve) => {
            // 设置初始状态
            view.setScale(v3(0, 0, 0));
            const uiOpacity = view.getComponent(UIOpacity);
            if (uiOpacity) {
                uiOpacity.opacity = 0;
            }

            // 同时执行缩放和淡入动画
            Promise.all([
                new Promise<void>((resolveScale) => {
                    tween(view)
                        .to(0.1, { scale: v3(1.01, 1.01, 1.01) })
                        .to(0.15, { scale: v3(1, 1, 1) })
                        .call(() => resolveScale())
                        .start();
                }),
                new Promise<void>((resolveFade) => {
                    if (uiOpacity) {
                        tween(uiOpacity)
                            .to(0.25, { opacity: 255 })
                            .call(() => resolveFade())
                            .start();
                    } else {
                        resolveFade();
                    }
                })
            ]).then(() => {
                resolve();
            });
        });
    };
}