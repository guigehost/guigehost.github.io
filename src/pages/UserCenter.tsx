import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Calendar, History, Gift, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function UserCenter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingIn, setCheckingIn] = useState(false);

  const { data: checkinStatus, refetch: refetchCheckin } = trpc.auth.getCheckinStatus.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const { data: balanceData } = trpc.auth.getBalance.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const checkinMutation = trpc.auth.checkin.useMutation({
    onSuccess: (data) => {
      alert(`签到成功！获得 ${data.pointsEarned} 兔点`);
      setCheckingIn(false);
      refetchCheckin();
    },
    onError: (err) => {
      alert(err.message);
      setCheckingIn(false);
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const tuPoints = balanceData?.tuPoints ?? user?.tuPoints ?? 0;
  const checkedIn = checkinStatus?.checkedInToday ?? false;

  const handleCheckin = () => {
    setCheckingIn(true);
    checkinMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">个人中心</h1>
        <p className="text-muted-foreground">欢迎回来，{user?.name || user?.email}</p>
      </div>

      {/* Points Card */}
      <Card className="mb-6 overflow-hidden" style={{ border: "none" }}>
        <div
          className="p-6"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">我的兔点</p>
              <p className="text-4xl font-bold text-white">{tuPoints}</p>
            </div>
            <div className="flex gap-3">
              {!checkedIn ? (
                <Button
                  size="lg"
                  onClick={handleCheckin}
                  disabled={checkingIn}
                  style={{
                    borderRadius: 12,
                    background: "white",
                    color: "#667eea",
                    border: "none",
                    fontWeight: 600,
                    height: 48,
                  }}
                >
                  <Calendar size={18} className="mr-2" />
                  每日签到 +10
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled
                  style={{
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    height: 48,
                  }}
                >
                  今日已签到
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-8 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/60 text-xs">累计签到</p>
              <p className="text-white font-semibold">{checkinStatus?.totalCheckins ?? 0} 天</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">注册时间</p>
              <p className="text-white font-semibold">
                {user?.registeredAt
                  ? new Date(user.registeredAt).toLocaleDateString("zh-CN")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">邮箱状态</p>
              <p className="text-white font-semibold">{user?.emailVerified ? "已验证" : "未验证"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      <Card>
        <Tabs defaultValue="record" className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="record">
                <History size={16} className="mr-2" />
                兔点记录
              </TabsTrigger>
              <TabsTrigger value="recharge">
                <Gift size={16} className="mr-2" />
                充值兔点
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="record" className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无记录</p>
            </div>
          </TabsContent>

          <TabsContent value="recharge" className="p-6">
            <p className="text-center text-muted-foreground mb-6">充值功能开发中，敬请期待...</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { points: 100, price: "6" },
                { points: 500, price: "28" },
                { points: 1000, price: "50" },
              ].map((pkg) => (
                <div
                  key={pkg.points}
                  className="border rounded-2xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Coins size={24} className="mx-auto mb-2 text-primary" />
                  <p className="font-bold text-lg">{pkg.points} 兔点</p>
                  <p className="text-muted-foreground">¥{pkg.price}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
