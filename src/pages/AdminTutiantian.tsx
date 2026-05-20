import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminTutiantian() {
  // Orders state
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDesc, setAdjustDesc] = useState("");

  // Balance state
  const [balancePage, setBalancePage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);

  // Logs state
  const [logPage, setLogPage] = useState(1);
  const [logUserId, setLogUserId] = useState<string>("");
  const [logAction, setLogAction] = useState<string>("all");

  // Queries
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = trpc.tutiantian.listOrders.useQuery({
    page: orderPage,
    pageSize: 10,
    status: orderStatus,
  });

  const { data: balancesData, isLoading: balancesLoading, refetch: refetchBalances } = trpc.tutiantian.listUserBalances.useQuery({
    page: balancePage,
    pageSize: 10,
  });

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = trpc.tutiantian.listUsageLogs.useQuery({
    page: logPage,
    pageSize: 10,
    userId: logUserId ? Number(logUserId) : undefined,
    action: logAction,
  });

  // Mutations
  const confirmOrder = trpc.tutiantian.confirmOrder.useMutation({
    onSuccess: () => {
      toast.success("订单已确认");
      refetchOrders();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const cancelOrder = trpc.tutiantian.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success("订单已取消");
      refetchOrders();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const adjustBalance = trpc.tutiantian.adjustBalance.useMutation({
    onSuccess: () => {
      toast.success("余额调整成功");
      setBalanceDialogOpen(false);
      setAdjustAmount("");
      setAdjustDesc("");
      refetchBalances();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const handleAdjustBalance = () => {
    if (!selectedUser || !adjustAmount || !adjustDesc) {
      toast.error("请填写完整信息");
      return;
    }
    const amount = Number(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error("请输入有效的金额");
      return;
    }
    adjustBalance.mutate({
      userId: selectedUser.userId,
      amount,
      description: adjustDesc,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">已支付</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">待支付</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">已取消</Badge>;
      case "refunded":
        return <Badge className="bg-red-500">已退款</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "register_bonus":
        return <Badge className="bg-green-500">注册奖励</Badge>;
      case "purchase":
        return <Badge className="bg-blue-500">购买</Badge>;
      case "generate":
        return <Badge className="bg-orange-500">使用</Badge>;
      case "refund":
        return <Badge className="bg-red-500">退款</Badge>;
      case "admin_adjustment":
        return <Badge className="bg-purple-500">手动调整</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">兔填填管理</h1>
        <p className="text-muted-foreground">管理兔填填订单、用户余额和使用记录</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">订单管理</TabsTrigger>
          <TabsTrigger value="balances">用户余额</TabsTrigger>
          <TabsTrigger value="logs">使用记录</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>订单列表</CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="订单状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="pending">待支付</SelectItem>
                    <SelectItem value="paid">已支付</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订单号</TableHead>
                        <TableHead>用户</TableHead>
                        <TableHead>套餐</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData?.orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.orderNo}</TableCell>
                          <TableCell>
                            {order.user?.name || order.user?.username || `用户${order.userId}`}
                          </TableCell>
                          <TableCell>{order.package?.name || `套餐${order.packageId}`}</TableCell>
                          <TableCell>¥{order.price}</TableCell>
                          <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                          <TableCell className="text-sm">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString("zh-CN") : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.paymentStatus === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => confirmOrder.mutate({ orderNo: order.orderNo })}
                                    disabled={confirmOrder.isLoading}
                                  >
                                    确认
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => cancelOrder.mutate({ orderNo: order.orderNo })}
                                    disabled={cancelOrder.isLoading}
                                  >
                                    取消
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(order.user);
                                  setBalanceDialogOpen(true);
                                }}
                              >
                                调整余额
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {ordersData?.orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            暂无订单
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {ordersData && ordersData.total > 10 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                        disabled={orderPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {orderPage} / {Math.ceil(ordersData.total / 10)} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderPage((p) => p + 1)}
                        disabled={orderPage >= Math.ceil(ordersData.total / 10)}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>用户余额</CardTitle>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户ID</TableHead>
                        <TableHead>用户名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>可用余额</TableHead>
                        <TableHead>已购余额</TableHead>
                        <TableHead>总使用量</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balancesData?.balances.map((balance: any) => (
                        <TableRow key={balance.id}>
                          <TableCell>{balance.userId}</TableCell>
                          <TableCell>{balance.user?.name || balance.user?.username || "-"}</TableCell>
                          <TableCell>{balance.user?.email || "-"}</TableCell>
                          <TableCell className="font-bold">{balance.balance}</TableCell>
                          <TableCell>{balance.purchasedBalance}</TableCell>
                          <TableCell>{balance.totalUsage}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(balance.user);
                                setBalanceDialogOpen(true);
                              }}
                            >
                              调整余额
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {balancesData?.balances.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {balancesData && balancesData.total > 10 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBalancePage((p) => Math.max(1, p - 1))}
                        disabled={balancePage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {balancePage} / {Math.ceil(balancesData.total / 10)} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBalancePage((p) => p + 1)}
                        disabled={balancePage >= Math.ceil(balancesData.total / 10)}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>使用记录</CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <Input
                  placeholder="用户ID"
                  className="w-32"
                  value={logUserId}
                  onChange={(e) => setLogUserId(e.target.value)}
                />
                <Select value={logAction} onValueChange={setLogAction}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="register_bonus">注册奖励</SelectItem>
                    <SelectItem value="purchase">购买</SelectItem>
                    <SelectItem value="generate">使用</SelectItem>
                    <SelectItem value="refund">退款</SelectItem>
                    <SelectItem value="admin_adjustment">手动调整</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setLogPage(1)}>筛选</Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>时间</TableHead>
                        <TableHead>用户</TableHead>
                        <TableHead>操作类型</TableHead>
                        <TableHead>变化</TableHead>
                        <TableHead>余额变化</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>关联订单</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData?.logs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("zh-CN") : "-"}
                          </TableCell>
                          <TableCell>{log.user?.name || log.user?.username || `用户${log.userId}`}</TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell className={log.changeAmount > 0 ? "text-green-500" : "text-red-500"}>
                            {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.balanceBefore} → {log.balanceAfter}
                          </TableCell>
                          <TableCell className="text-sm max-w-32 truncate">{log.description || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{log.relatedOrder || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {logsData?.logs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            暂无记录
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {logsData && logsData.total > 10 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                        disabled={logPage === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {logPage} / {Math.ceil(logsData.total / 10)} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogPage((p) => p + 1)}
                        disabled={logPage >= Math.ceil(logsData.total / 10)}
                      >
                        下一页
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整用户余额</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>用户</Label>
                <Input value={selectedUser.name || selectedUser.username || `用户${selectedUser.id}`} disabled />
              </div>
              <div className="space-y-2">
                <Label>调整金额</Label>
                <Input
                  type="number"
                  placeholder="正数增加，负数减少"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">输入正数增加余额，输入负数减少余额</p>
              </div>
              <div className="space-y-2">
                <Label>原因说明</Label>
                <Textarea
                  placeholder="请输入调整原因..."
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAdjustBalance} disabled={adjustBalance.isLoading}>
              {adjustBalance.isLoading ? "处理中..." : "确认调整"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
