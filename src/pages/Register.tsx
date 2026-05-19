import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";

export default function Register() {
  const [step, setStep] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setStep(1);
      alert(data.message);
    },
    onError: (err) => {
      alert(err.message);
      setLoading(false);
    },
  });

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      alert("注册成功！已赠送100兔点");
      navigate("/");
      window.location.reload();
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const onFinishRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    setRegisteredEmail(fd.get("email") as string);
    registerMutation.mutate({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      nickname: fd.get("nickname") as string,
    });
  };

  const onFinishVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    verifyMutation.mutate({
      email: registeredEmail,
      code: fd.get("code") as string,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-50/50 to-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground mb-2">
            龟兔算法
          </Link>
          <p className="text-muted-foreground">注册即送 100 兔点</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">
              {step === 0 ? "用户注册" : "验证邮箱"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 ? (
              <form onSubmit={onFinishRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input id="nickname" name="nickname" required placeholder="输入昵称" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" name="email" type="email" required placeholder="输入邮箱" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" name="password" type="password" required placeholder="至少6位" minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">确认密码</Label>
                  <Input id="confirm" name="confirm" type="password" required placeholder="再次输入密码" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "发送中..." : "注册"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  已有账号？<Link to="/login" className="text-primary font-medium">立即登录</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={onFinishVerify} className="space-y-4">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  验证码已发送至：{registeredEmail}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    placeholder="输入6位验证码"
                    maxLength={6}
                    className="text-center tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
                  {verifyMutation.isPending ? "验证中..." : "验证邮箱"}
                </Button>
                <Button type="button" variant="link" className="w-full" onClick={() => setStep(0)}>
                  返回重新注册
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
