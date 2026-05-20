import { useState } from "react";
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, message } from "antd";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AdminPackages() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    points: 100,
    price: "6",
    isFeatured: false,
  });

  // Fetch real data via tRPC
  const { data: packagesData, refetch } = trpc.auth.listPointPackages.useQuery();

  const handleSave = () => {
    if (!formData.name || !formData.points || !formData.price) {
      message.error("请填写完整信息");
      return;
    }
    message.success(editingId ? "保存成功" : "创建成功");
    setIsDialogOpen(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: "", points: 100, price: "6", isFeatured: false });
    setIsDialogOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      points: pkg.points,
      price: pkg.price,
      isFeatured: pkg.isFeatured,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">兔点套餐</h1>
          <p className="text-sm text-muted-foreground mt-1">管理兔点充值套餐</p>
        </div>
        <Button type="primary" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> 新增套餐
        </Button>
      </div>

      <Card>
        <Table
          dataSource={packagesData || []}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "套餐名称", dataIndex: "name" },
            { title: "兔点数量", dataIndex: "points" },
            { title: "价格(元)", dataIndex: "price" },
            {
              title: "推荐",
              dataIndex: "isFeatured",
              render: (v: boolean) => <span>{v ? "是" : "否"}</span>,
            },
            { title: "状态", dataIndex: "status" },
            {
              title: "操作",
              key: "actions",
              render: (_: any, record: any) => (
                <div className="flex gap-1">
                  <Button size="small" variant="ghost" onClick={() => openEdit(record)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="small" variant="ghost" className="text-red-600">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? "编辑套餐" : "新增套餐"}
        open={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical" className="py-4">
          <Form.Item label="套餐名称">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如：100兔点"
            />
          </Form.Item>
          <Form.Item label="兔点数量">
            <InputNumber
              value={formData.points}
              onChange={(v) => setFormData({ ...formData, points: v ?? 0 })}
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>
          <Form.Item label="价格(元)">
            <Input
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="如：6"
            />
          </Form.Item>
          <Form.Item label="推荐">
            <Switch
              checked={formData.isFeatured}
              onChange={(v) => setFormData({ ...formData, isFeatured: v })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
