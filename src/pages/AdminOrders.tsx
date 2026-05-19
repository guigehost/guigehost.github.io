import { useState } from "react";
import { Card, Table, Select, Button, Tag, message } from "antd";
import { Search } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Placeholder data
  const orders: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "green";
      case "pending": return "orange";
      case "refunded": return "red";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "已完成";
      case "pending": return "待支付";
      case "refunded": return "已退款";
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">兔点订单</h1>
          <p className="text-sm text-muted-foreground mt-1">管理用户兔点充值订单</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { label: "全部", value: "all" },
              { label: "待支付", value: "pending" },
              { label: "已完成", value: "completed" },
              { label: "已退款", value: "refunded" },
            ]}
          />
        </div>

        <Table
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          columns={[
            { title: "订单号", dataIndex: "orderNo", width: 200 },
            { title: "用户ID", dataIndex: "userId", width: 80 },
            { title: "套餐", dataIndex: "packageName" },
            { title: "兔点", dataIndex: "points", width: 80 },
            { title: "金额(元)", dataIndex: "price", width: 80 },
            {
              title: "状态",
              dataIndex: "paymentStatus",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{getStatusLabel(v)}</Tag>
              ),
            },
            { title: "支付方式", dataIndex: "paymentMethod" },
            {
              title: "时间",
              dataIndex: "createdAt",
              render: (d: string) => d ? new Date(d).toLocaleString("zh-CN") : "-",
            },
            {
              title: "操作",
              key: "actions",
              render: (_: any, record: any) =>
                record.paymentStatus === "pending" && (
                  <Button size="small" type="primary">
                    确认收款
                  </Button>
                ),
            },
          ]}
        />

        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无订单
          </div>
        )}
      </Card>
    </div>
  );
}
