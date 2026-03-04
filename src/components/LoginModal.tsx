import { useState } from 'react';
import { Mail, Lock, User, Phone, MessageCircle, Instagram } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Logo } from './Logo';
import { toast } from 'sonner';
import { supabase } from '../supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });
  const [socialBindings, setSocialBindings] = useState({
    facebook: false,
    imessage: false,
    instagram: false
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error('Google 登入失敗：' + error.message);
    }
    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('請填寫所有必填欄位');
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setIsLoading(false);
    if (error) {
      toast.error('登入失敗：' + error.message);
      return;
    }
    if (data.user) {
      onLogin({
        id: data.user.id,
        name: data.user.user_metadata?.name || loginForm.email.split('@')[0],
        email: data.user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        provider: 'email',
        socialBindings,
      });
      toast.success('登入成功！');
      onClose();
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('請填寫所有必填欄位');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('密碼確認不一致');
      return;
    }
    if (!registerForm.agreeTerms) {
      toast.error('請同意服務條款');
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: { data: { name: registerForm.name, phone: registerForm.phone } },
    });
    setIsLoading(false);
    if (error) {
      toast.error('註冊失敗：' + error.message);
      return;
    }
    if (data.user) {
      onLogin({
        id: data.user.id,
        name: registerForm.name,
        email: registerForm.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.email}`,
        provider: 'email',
        socialBindings,
      });
      toast.success('註冊成功！歡迎加入 allshare！');
      onClose();
    }
  };

  const handleSocialBinding = (platform: keyof typeof socialBindings) => {
    setSocialBindings(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Logo />
          </div>
          <DialogTitle className="text-center">歡迎來到 allshare</DialogTitle>
          <DialogDescription className="text-center">
            登入或註冊來開始使用社區分享平台
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 border-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span>使用 Google 登入</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-2"
                disabled={true}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="text-muted-foreground">Facebook 登入（即將推出）</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-2"
                disabled={true}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs">🍎</span>
                  </div>
                  <span className="text-muted-foreground">Apple 登入（即將推出）</span>
                </div>
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">或</span>
              </div>
            </div>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="輸入您的密碼"
                    className="pl-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? '登入中...' : '登入'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="space-y-6">
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="您的姓名"
                    className="pl-10"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">電子郵件</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">手機號碼（選填）</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="0912-345-678"
                    className="pl-10"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="設定您的密碼"
                    className="pl-10"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">確認密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="再次輸入密碼"
                    className="pl-10"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>聯絡方式綁定（選填）</Label>
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="facebook-binding"
                      checked={socialBindings.facebook}
                      onCheckedChange={() => handleSocialBinding('facebook')}
                    />
                    <Label htmlFor="facebook-binding" className="flex items-center space-x-2 cursor-pointer">
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs">f</span>
                      </div>
                      <span>綁定 Facebook Messenger</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="imessage-binding"
                      checked={socialBindings.imessage}
                      onCheckedChange={() => handleSocialBinding('imessage')}
                    />
                    <Label htmlFor="imessage-binding" className="flex items-center space-x-2 cursor-pointer">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>綁定 iMessage</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instagram-binding"
                      checked={socialBindings.instagram}
                      onCheckedChange={() => handleSocialBinding('instagram')}
                    />
                    <Label htmlFor="instagram-binding" className="flex items-center space-x-2 cursor-pointer">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>綁定 Instagram</span>
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">綁定社交媒體可讓其他用戶更容易與您聯絡</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree-terms"
                  checked={registerForm.agreeTerms}
                  onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, agreeTerms: !!checked }))}
                />
                <Label htmlFor="agree-terms" className="text-sm cursor-pointer">
                  我同意 <span className="text-primary underline">服務條款</span> 和 <span className="text-primary underline">隱私政策</span>
                </Label>
              </div>
              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? '註冊中...' : '創建帳戶'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="text-center text-xs text-muted-foreground mt-4">
          使用 allshare 即表示您同意我們的服務條款和隱私政策
        </div>
      </DialogContent>
    </Dialog>
  );
}