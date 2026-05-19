import { useState } from "react";
import { Card, Tabs, Table, Input, Button, Modal, Form, InputNumber, message, Popconfirm, Tag } from "antd";
import { Search, Plus, Minus, Trash2, Eye } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const utils = trpc.useUtils();

  // Placeholder - in real implementation this would come from a users router
  // For now, we'll show a placeholder
  const users: any[] = [];
  const isLoading = false;

  const handleAdjust = (user: any) => {
    setSelectedUser(user);
    setAdjustAmount(0);
    setAdjustReason("");
    setAdjustModalOpen(true);
  };

  const confirmAdjust = () => {
    if (!selectedUser || adjustAmount === 0) return;
    message.success(`已为用户 ${selectedUser.email} ${adjustAmount > 0 ? "充值" : "扣除"} ${Math.abs(adjustAmount)} 兔点`);
    setAdjustModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理用户兔点、查看使用记录</p>
        </div>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="list"
          items={[
            {
              key: "list",
              label: "用户列表",
              children: (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Input
                      placeholder="搜索邮箱、昵称..."
                      prefix={<Search size={16} />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <Table
                    dataSource={users}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 20 }}
                    columns={[
                      { title: "ID", dataIndex: "id", width: 60 },
                      { title: "邮箱", dataIndex: "email" },
                      { title: "昵称", dataIndex: "name" },
                      {
                        title: "角色",
                        dataIndex: "role",
                        render: (role: string) => (
                          <Tag color={role === "admin" ? "red" : "default"}>{role}</Tag>
                        ),
                      },
                      {
                        title: "兔点",
                        dataIndex: "tuPoints",
                        render: (points: number) => <span className="font-medium">{points}</span>,
                      },
                      {
                        title: "邮箱验证",
                        dataIndex: "emailVerified",
                        render: (v: boolean) => (
                          <Tag color={v ? "green" : "orange"}>{v ? "已验证" : "未验证"}</Tag>
                        ),
                      },
                      {
                        title: "注册时间",
                        dataIndex: "registeredAt",
                        render: (d: string) => d ? new Date(d).toLocaleDateString("zh-CN") : "-",
                      },
                      {
                        title: "操作",
                        key: "actions",
                        render: (_: any, record: any) => (
                          <div className="flex gap-1">
                            <Button size="small" onClick={() => handleAdjust(record)}>
                              调整兔点
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "adjust",
              label: "兔点调整",
              children: (
                <div className="text-center py-12 text-muted-foreground">
                  <p>选择左侧用户列表中的用户，点击"调整兔点"进行操作</p>
                </div>
              ),
            },
            {
              key: "records",
              label: "兔点记录",
              children: (
                <div className="text-center py-12 text-muted-foreground">
                  <p>暂无记录</p>
                </div>
              ),
            },
            {
              key: "checkin",
              label: "签到记录",
              children: (
                <div className="text-center py-12 text-muted-foreground">
                  <p>暂无记录</p>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="调整用户兔点"
        open={adjustModalOpen}
        onCancel={() => setAdjustModalOpen(false)}
        onOk={confirmAdjust}
        okText="确认"
        cancelText="取消"
      >
        {selectedUser && (
          <div className="py-4">
            <p className="mb-4">
              用户：<strong>{selectedUser.email}</strong>，当前兔点：<strong>{selectedUser.tuPoints}</strong>
            </p>
            <Form layout="vertical">
              <Form.Item label="调整数量（正数=充值，负数=扣除）">
                <InputNumber
                  value={adjustAmount}
                  onChange={(v) => setAdjustAmount(v ?? 0)}
                  style={{ width: "100%" }}
                  placeholder="输入数量"
                />
              </Form.Item>
              <Form.Item label="原因">
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="输入调整原因"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
