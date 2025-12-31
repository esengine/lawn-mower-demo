/**
 * @zh 登录视图组件
 * @en Login View Component
 */

import { _decorator, Component, EditBox, Label, Button, Node, director } from 'cc';
import { authService } from '../../auth';

const { ccclass, property } = _decorator;

@ccclass('LoginView')
export class LoginView extends Component {

    @property(EditBox)
    usernameInput: EditBox = null!;

    @property(EditBox)
    passwordInput: EditBox = null!;

    @property(Label)
    errorLabel: Label = null!;

    @property(Button)
    loginButton: Button = null!;

    @property(Button)
    registerButton: Button = null!;

    @property(Button)
    guestButton: Button = null!;

    @property({ tooltip: 'API 服务器地址' })
    apiUrl: string = 'http://localhost:8080/api';

    @property({ tooltip: '登录成功后跳转的场景名' })
    gameSceneName: string = 'scene';

    private _onLoginSuccess: ((username: string) => void) | null = null;

    onLoad() {
        authService.setBaseUrl(this.apiUrl);

        this.loginButton?.node.on('click', this.onLoginClick, this);
        this.registerButton?.node.on('click', this.onRegisterClick, this);
        this.guestButton?.node.on('click', this.onGuestClick, this);

        this.clearError();
    }

    /**
     * @zh 设置登录成功回调
     * @en Set login success callback
     */
    onLoginSuccess(callback: (username: string) => void): void {
        this._onLoginSuccess = callback;
    }

    private async onLoginClick(): Promise<void> {
        const username = this.usernameInput?.string?.trim();
        const password = this.passwordInput?.string;

        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return;
        }

        this.setButtonsEnabled(false);
        this.clearError();

        const result = await authService.login(username, password);

        if (result.success) {
            this._onLoginSuccess?.(username);
            this.gotoGameScene();
        } else {
            this.showError(result.error || '登录失败');
            this.setButtonsEnabled(true);
        }
    }

    private async onRegisterClick(): Promise<void> {
        const username = this.usernameInput?.string?.trim();
        const password = this.passwordInput?.string;

        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            this.showError('用户名需要3-20个字符');
            return;
        }

        if (password.length < 6) {
            this.showError('密码至少需要6个字符');
            return;
        }

        this.setButtonsEnabled(false);
        this.clearError();

        const result = await authService.register(username, password);

        if (result.success) {
            this.showError('注册成功，请登录');
        } else {
            this.showError(result.error || '注册失败');
        }

        this.setButtonsEnabled(true);
    }

    private async onGuestClick(): Promise<void> {
        this.setButtonsEnabled(false);
        this.clearError();

        const result = await authService.guestLogin();

        if (result.success && result.username) {
            this._onLoginSuccess?.(result.username);
            this.gotoGameScene();
        } else {
            this.showError(result.error || '游客登录失败');
            this.setButtonsEnabled(true);
        }
    }

    private showError(message: string): void {
        if (this.errorLabel) {
            this.errorLabel.string = message;
            this.errorLabel.node.active = true;
        }
    }

    private clearError(): void {
        if (this.errorLabel) {
            this.errorLabel.string = '';
            this.errorLabel.node.active = false;
        }
    }

    private setButtonsEnabled(enabled: boolean): void {
        if (this.loginButton) this.loginButton.interactable = enabled;
        if (this.registerButton) this.registerButton.interactable = enabled;
        if (this.guestButton) this.guestButton.interactable = enabled;
    }

    private gotoGameScene(): void {
        director.loadScene(this.gameSceneName);
    }
}
