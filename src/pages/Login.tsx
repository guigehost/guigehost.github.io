import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const utils = trpc.useUtils;

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (user) => {
      await utils().invalidate();
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      alert(err.message);
      setLoading(false);
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    loginMutation.mutate({
      username: fd.get("username") as string,
      password: fd.get("password") as string,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-50/50 to-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
            龟兔算法
          </Link>
          <p className="text-muted-foreground mt-2">欢迎回来！</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center">登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">邮箱或用户名</Label>
                <Input
                  id="username"
                  name="username"
                  required
                  placeholder="输入邮箱或用户名"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="输入密码"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登录中..." : "登录"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              还没有账号？{" "}
              <Link to="/register" className="text-primary font-medium">
                立即注册（送100兔点）
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
