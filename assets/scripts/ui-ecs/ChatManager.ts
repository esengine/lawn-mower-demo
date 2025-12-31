import { Component, _decorator, Button, find } from 'cc';
import { uiManager, UIOperations } from '@esengine/mvvm-ui-framework';
import { ChatViewModel } from './viewmodels/ChatViewModel';
import { CocosUILoader } from './loaders/CocosUILoader';
import { CocosUIRenderer } from './renderers/CocosUIRenderer';

const { ccclass, property } = _decorator;

@ccclass('ChatManager')
export class ChatManager extends Component {

    @property({ type: Button, tooltip: '打开聊天按钮' })
    public openChatButton: Button | null = null;

    private _chatViewModel: ChatViewModel | null = null;

    protected start(): void {
        this._initializeChatUI();
        this._bindEvents();
    }

    protected onDestroy(): void {
        this._unbindEvents();
        if (this._chatViewModel) {
            this._chatViewModel.destroy();
            this._chatViewModel = null;
        }
    }

    private _initializeChatUI(): void {
        // 查找Canvas作为UI根节点
        const canvas = find('Canvas-UI');
        if (!canvas) {
            console.error('未找到Canvas节点，无法设置UI根节点');
            return;
        }

        // 设置UI加载器
        uiManager.setLoader(new CocosUILoader());

        // 设置UI渲染器
        const renderer = new CocosUIRenderer();
        renderer.setUIRoot(canvas);
        uiManager.setRenderer(renderer);

        console.log('已设置UI根节点和渲染器:', canvas.name);

        // 创建ViewModel（UI配置已通过装饰器自动注册）
        this._chatViewModel = new ChatViewModel();
    }

    private _bindEvents(): void {
        if (this.openChatButton?.node) {
            this.openChatButton.node.on(Button.EventType.CLICK, this._openChat, this);
        }
    }

    private _unbindEvents(): void {
        if (this.openChatButton?.node?.isValid) {
            this.openChatButton.node.off(Button.EventType.CLICK, this._openChat, this);
        }
    }

    private async _openChat(): Promise<void> {
        if (!this._chatViewModel) {
            console.error('ChatViewModel未初始化');
            return;
        }

        try {
            const uiInstance = await UIOperations.showUI(this._chatViewModel);
            console.log('聊天界面已打开', uiInstance);
        } catch (error) {
            console.error('打开聊天界面失败:', error);
        }
    }

    public async closeChat(): Promise<void> {
        if (!this._chatViewModel) {
            console.error('ChatViewModel未初始化');
            return;
        }
        
        UIOperations.closeUI(this._chatViewModel);
    }

    public isChatOpen(): boolean {
        if (!this._chatViewModel) {
            return false;
        }
        
        return UIOperations.isUIShown(this._chatViewModel);
    }

    public getChatViewModel(): ChatViewModel | null {
        return this._chatViewModel;
    }
}