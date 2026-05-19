import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Calendar, History, Gift, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function UserCenter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const { data: checkinStatus, refetch: refetchCheckin } = trpc.auth.getCheckinStatus.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const { data: balanceData, refetch: refetchBalance } = trpc.auth.getBalance.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const { data: packagesData, refetch: refetchPackages } = trpc.auth.listPointPackages.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const { data: ordersData, refetch: refetchOrders } = trpc.auth.getRechargeOrders.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const checkinMutation = trpc.auth.checkin.useMutation({
    onSuccess: (data) => {
      alert(`签到成功！获得 ${data.pointsEarned} 兔点`);
      setCheckingIn(false);
      refetchCheckin();
      refetchBalance();
    },
    onError: (err) => {
      alert(err.message);
      setCheckingIn(false);
    },
  });

  const createOrderMutation = trpc.auth.createRechargeOrder.useMutation({
    onSuccess: (data) => {
      setCurrentOrder(data);
      setCreatingOrder(false);
    },
    onError: (err) => {
      alert(err.message);
      setCreatingOrder(false);
    },
  });

  const confirmOrderMutation = trpc.auth.confirmRecharge.useMutation({
    onSuccess: (data) => {
      alert(`充值成功！获得 ${currentOrder.package.points} 兔点`);
      setCurrentOrder(null);
      setSelectedPackage(null);
      refetchOrders();
      refetchBalance();
    },
    onError: (err) => {
      alert(err.message);
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

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackage(packageId);
    setCreatingOrder(true);
    createOrderMutation.mutate({ packageId });
  };

  const handleConfirmPayment = () => {
    if (currentOrder) {
      confirmOrderMutation.mutate({ orderNo: currentOrder.orderNo });
    }
  };

  const packages = packagesData || [];

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
            {ordersData && ordersData.length > 0 ? (
              <div className="space-y-3">
                {ordersData.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.paymentStatus === "paid" ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                        {order.paymentStatus === "paid" ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <Clock size={20} className="text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.points} 兔点</p>
                        <p className="text-sm text-muted-foreground">
                          {order.paymentStatus === "paid" ? "已充值" : "待支付"} · {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥{order.price}</p>
                      {order.paymentStatus === "paid" && (
                        <p className="text-sm text-green-600">已完成</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins size={48} className="mx-auto mb-4 opacity-30" />
                <p>暂无充值记录</p>
                <p className="text-sm mt-2">签到可以获得兔点哦</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recharge" className="p-6">
            {currentOrder ? (
              /* Order Detail / Payment Instructions */
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Gift size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">订单已创建</h3>
                  <p className="text-muted-foreground">订单号: {currentOrder.orderNo}</p>
                </div>

                <Card className="mb-6 bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">充值套餐</span>
                      <span className="font-bold">{currentOrder.package.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">获得兔点</span>
                      <span className="font-bold text-primary">{currentOrder.package.points} 兔点</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">支付金额</span>
                      <span className="font-bold text-xl">¥{currentOrder.package.price}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">付款说明：</p>
                      <p className="mb-1">1. 使用微信扫描下方收款码</p>
                      <p className="mb-1">2. 转账时备注您的邮箱: {user?.email}</p>
                      <p className="mb-1">3. 转账完成后点击"确认充值"按钮</p>
                      <p>4. 客服核实后会自动到账（预计1小时内）</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <img
                    src="https://guige.host/wechat_qr.jpg"
                    alt="微信收款码"
                    className="w-48 h-48 mx-auto rounded-xl border-2 border-border"
                  />
                  <p className="text-sm text-muted-foreground mt-2">微信收款码</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={confirmOrderMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {confirmOrderMutation.isPending ? "处理中..." : "我已转账，确认充值"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentOrder(null);
                      setSelectedPackage(null);
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              /* Package Selection */
              <>
                <p className="text-center text-muted-foreground mb-6">
                  选择充值套餐，付款后兔点自动到账
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packages.map((pkg: any, index: number) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`relative border-2 rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-primary/50 ${
                        pkg.isFeatured ? "border-primary shadow-md" : "border-border"
                      }`}
                    >
                      {pkg.isFeatured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                          推荐
                        </div>
                      )}
                      <Coins size={32} className="mx-auto mb-3 text-primary" />
                      <p className="font-bold text-xl mb-1">{pkg.points} 兔点</p>
                      <p className="text-2xl font-bold text-primary mb-2">¥{pkg.price}</p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {pkg.price / pkg.points > 0 ? (pkg.price / pkg.points * 10).toFixed(1) : "0"} 分/兔点
                      </p>
                      {creatingOrder && selectedPackage === pkg.id && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-2xl">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">充值说明</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 付款后预计1小时内到账</li>
                    <li>• 转账时务必备注邮箱以便核实</li>
                    <li>• 如有疑问请联系客服</li>
                  </ul>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
