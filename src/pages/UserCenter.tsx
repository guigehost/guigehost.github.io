import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Calendar,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  User,
  History,
  CreditCard,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const actionLabels: Record<string, string> = {
  register_bonus: "注册赠送",
  checkin: "每日签到",
  purchase: "充值",
  consume: "工具消耗",
  admin_adjust: "管理员调整",
  other: "其他",
};

const actionColors: Record<string, string> = {
  register_bonus: "text-green-600 bg-green-500/10",
  checkin: "text-blue-600 bg-blue-500/10",
  purchase: "text-purple-600 bg-purple-500/10",
  consume: "text-orange-600 bg-orange-500/10",
  admin_adjust: "text-gray-600 bg-gray-500/10",
  other: "text-gray-600 bg-gray-500/10",
};

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: "待支付", color: "bg-yellow-100 text-yellow-700" },
  submitted: { text: "待确认", color: "bg-blue-100 text-blue-700" },
  paid: { text: "已支付", color: "bg-green-100 text-green-700" },
  cancelled: { text: "已取消", color: "bg-gray-100 text-gray-700" },
};

export default function UserCenter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle URL params for payment
  useEffect(() => {
    const orderNo = searchParams.get("orderNo");
    const tab = searchParams.get("tab");
    if (tab === "recharge" && orderNo && ordersData) {
      const order = ordersData.find((o: any) => o.orderNo === orderNo);
      if (order && (order.paymentStatus === "pending" || order.paymentStatus === "submitted")) {
        setCurrentOrder({
          orderNo: order.orderNo,
          package: { name: `${order.points}兔点`, points: order.points, price: order.price }
        });
      }
    }
  }, [searchParams, ordersData]);

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

  const { data: pointStats, refetch: refetchStats } = trpc.auth.getPointStats.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const { data: pointLogs, refetch: refetchLogs } = trpc.auth.getPointLogs.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const checkinMutation = trpc.auth.checkin.useMutation({
    onSuccess: (data: any) => {
      setMessage({ type: "success", text: `签到成功！获得 ${data.pointsEarned} 兔点` });
      setCheckingIn(false);
      refetchCheckin();
      refetchBalance();
      refetchStats();
      refetchLogs();
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message });
      setCheckingIn(false);
    },
  });

  const createOrderMutation = trpc.auth.createRechargeOrder.useMutation({
    onSuccess: (data: any) => {
      setCurrentOrder(data);
      setCreatingOrder(false);
      setMessage(null);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message });
      setCreatingOrder(false);
    },
  });

  const submitRechargeMutation = trpc.auth.submitRecharge.useMutation({
    onSuccess: (data: any) => {
      setMessage({ type: "success", text: data.message || "已提交转账证明，请等待管理员确认" });
      refetchOrders();
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message });
    },
  });

  const cancelRechargeMutation = trpc.auth.cancelRecharge.useMutation({
    onSuccess: (data: any) => {
      setMessage({ type: "success", text: data.message || "订单已取消" });
      refetchOrders();
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message });
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
  const packages = packagesData || [];

  const handleCheckin = () => {
    setCheckingIn(true);
    checkinMutation.mutate();
  };

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackage(packageId);
    setCreatingOrder(true);
    setMessage(null);
    createOrderMutation.mutate({ packageId });
  };

  const handleConfirmPayment = () => {
    if (currentOrder) {
      submitRechargeMutation.mutate({ orderNo: currentOrder.orderNo });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">会员中心</h1>
        <p className="text-muted-foreground">欢迎回来，{user?.name || user?.email}</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{message.text}</p>
          <button onClick={() => setMessage(null)} className="ml-auto"><XCircle size={18} /></button>
        </div>
      )}

      {/* Points Overview Card */}
      <Card className="mb-6 overflow-hidden" style={{ border: "none" }}>
        <div
          className="p-6"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">我的兔点</p>
              <p className="text-5xl font-bold text-white">{tuPoints}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
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
                  {checkingIn ? "签到中..." : "每日签到 +10"}
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
                  <CheckCircle size={18} className="mr-2" />
                  今日已签到
                </Button>
              )}
              <Button
                size="lg"
                onClick={() => navigate("/user?tab=recharge")}
                style={{
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  height: 48,
                }}
              >
                <Gift size={18} className="mr-2" />
                充值兔点
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累计获取</p>
                <p className="text-xl font-bold text-green-600">
                  {pointStats?.totalAcquired ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingDown size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累计消耗</p>
                <p className="text-xl font-bold text-orange-600">
                  {pointStats?.totalConsumed ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累计签到</p>
                <p className="text-xl font-bold text-blue-600">
                  {checkinStatus?.totalCheckins ?? 0} 天
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      <Card>
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="overview">
                <User size={16} className="mr-2" />
                账户概览
              </TabsTrigger>
              <TabsTrigger value="record">
                <History size={16} className="mr-2" />
                收支记录
              </TabsTrigger>
              <TabsTrigger value="orders">
                <CreditCard size={16} className="mr-2" />
                我的订单
              </TabsTrigger>
              <TabsTrigger value="recharge">
                <Gift size={16} className="mr-2" />
                充值兔点
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Account Overview Tab */}
          <TabsContent value="overview" className="p-6">
            {/* Acquisition Sources */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Plus size={18} className="mr-2 text-green-600" />
                兔点获取来源
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(pointStats?.acquisitionBySource || {}).map(([source, amount]) => (
                  <div key={source} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                    <p className="text-sm text-muted-foreground mb-1">
                      {actionLabels[source] || source}
                    </p>
                    <p className="text-xl font-bold text-green-600">+{amount as number}</p>
                  </div>
                ))}
                {Object.keys(pointStats?.acquisitionBySource || {}).length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    暂无获取记录
                  </p>
                )}
              </div>
            </div>

            {/* Consumption Records */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Minus size={18} className="mr-2 text-orange-600" />
                兔点消耗记录
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(pointStats?.consumptionByTool || {}).map(([tool, amount]) => (
                  <div key={tool} className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <p className="text-sm text-muted-foreground mb-1">
                      {tool === "other" ? "其他" : tool}
                    </p>
                    <p className="text-xl font-bold text-orange-600">-{amount as number}</p>
                  </div>
                ))}
                {Object.keys(pointStats?.consumptionByTool || {}).length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    暂无消耗记录
                  </p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">账户信息</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">注册时间</p>
                  <p className="font-semibold">
                    {user?.registeredAt
                      ? new Date(user.registeredAt).toLocaleDateString("zh-CN")
                      : "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">邮箱状态</p>
                  <p className="font-semibold">{user?.emailVerified ? "已验证" : "未验证"}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">用户邮箱</p>
                  <p className="font-semibold text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Point Logs Tab */}
          <TabsContent value="record" className="p-6">
            {pointLogs && pointLogs.length > 0 ? (
              <div className="space-y-3">
                {pointLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.changeAmount > 0
                            ? "bg-green-500/10"
                            : "bg-orange-500/10"
                        }`}
                      >
                        {log.changeAmount > 0 ? (
                          <Plus size={20} className="text-green-600" />
                        ) : (
                          <Minus size={20} className="text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {actionLabels[log.action] || log.action || "其他"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.description || (log.changeAmount > 0 ? "兔点增加" : "兔点消耗")}
                          {log.toolSlug && ` · ${log.toolSlug}`}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(log.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          log.changeAmount > 0 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {log.changeAmount > 0 ? "+" : ""}
                        {log.changeAmount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        余额: {log.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">暂无收支记录</p>
                <p className="text-sm mt-2 text-muted-foreground/70">
                  签到可以获得兔点哦
                </p>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="p-6">
            <h3 className="text-lg font-semibold mb-4">我的订单</h3>
            {ordersData && ordersData.length > 0 ? (
              <div className="space-y-3">
                {ordersData.map((order: any) => {
                  const status = statusLabels[order.paymentStatus] || { text: order.paymentStatus, color: "bg-gray-100 text-gray-700" };
                  const isPending = order.paymentStatus === "pending";
                  const isPaid = order.paymentStatus === "paid";
                  return (
                    <div key={order.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{order.points} 兔点</p>
                          <p className="text-sm text-muted-foreground">订单号: {order.orderNo}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <p className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("zh-CN")}
                        </p>
                        <p className="font-bold">¥{order.price}</p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {(isPending || order.paymentStatus === "submitted") && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                navigate(`/user?tab=recharge&orderNo=${order.orderNo}`);
                              }}
                            >
                              去支付
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm("确定要取消这个订单吗？")) {
                                  cancelRechargeMutation.mutate({ orderNo: order.orderNo });
                                  // Clear URL params
                                  setSearchParams({});
                                }
                              }}
                            >
                              取消订单
                            </Button>
                          </>
                        )}
                        {isPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const pkg = packages.find((p: any) => p.points === order.points);
                              if (pkg) {
                                handleSelectPackage(pkg.id);
                                navigate("/user?tab=recharge");
                              }
                            }}
                          >
                            再来一单
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">暂无订单记录</p>
                <Button
                  onClick={() => navigate("/user?tab=recharge")}
                  className="mt-4"
                >
                  去充值
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recharge Tab */}
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
                      <span className="font-bold text-primary">
                        {currentOrder.package.points} 兔点
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">支付金额</span>
                      <span className="font-bold text-xl">
                        ¥{currentOrder.package.price}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">付款说明：</p>
                      <p className="mb-1">1. 使用微信扫描下方收款码</p>
                      <p className="mb-1">
                        2. 转账时备注您的邮箱: {user?.email}
                      </p>
                      <p className="mb-1">3. 转账完成后点击"提交证明"按钮</p>
                      <p>4. 客服核实后会自动到账（预计1小时内）</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <img
                    src="https://guige.host/wechat-qr.jpg"
                    alt="微信收款码"
                    className="w-48 h-48 mx-auto rounded-xl border-2 border-border"
                  />
                  <p className="text-sm text-muted-foreground mt-2">微信收款码</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={submitRechargeMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {submitRechargeMutation.isPending
                      ? "提交中..."
                      : "我已转账，提交证明"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentOrder(null);
                      setSelectedPackage(null);
                      setMessage(null);
                      setSearchParams({});
                    }}
                  >
                    取消订单
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
                      <Coins
                        size={32}
                        className="mx-auto mb-3 text-primary"
                      />
                      <p className="font-bold text-xl mb-1">{pkg.points} 兔点</p>
                      <p className="text-2xl font-bold text-primary mb-2">
                        ¥{pkg.price}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈{" "}
                        {pkg.price / pkg.points > 0
                          ? (pkg.price / pkg.points * 10).toFixed(1)
                          : "0"}
                        分/兔点
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