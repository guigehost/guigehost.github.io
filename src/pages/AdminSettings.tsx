import { useState, useEffect } from "react";
import { Save, Globe, Type, Mail, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

const defaultSettings: Record<string, string> = {
  siteTitle: "龟兔算法",
  siteDescription: "发现效率工具，记录成长轨迹。一个非技术奶爸的数字花园。",
  siteKeywords: "效率工具, Mac工具, 育儿经验, 数字花园",
  siteAuthor: "光影876",
  contactEmail: "",
  icpBeian: "苏ICP备2025160633号-1",
  gonganBeian: "苏公网安备32070602010179号",
  heroTitle: "龟兔算法",
  heroSubtitle: "发现效率工具 · 记录成长轨迹",
};

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settingsData } = trpc.setting.list.useQuery();
  const [values, setValues] = useState<Record<string, string>>(defaultSettings);

  useEffect(() => {
    if (settingsData) {
      setValues((prev) => ({ ...prev, ...settingsData }));
    }
  }, [settingsData]);

  const setMutation = trpc.setting.bulkSet.useMutation({
    onSuccess: () => {
      utils.setting.list.invalidate();
      alert("设置已保存");
    },
  });

  const handleSave = () => {
    setMutation.mutate(values);
  };

  const update = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">网站设置</h1>
        <Button onClick={handleSave} disabled={setMutation.isPending}>
          <Save size={16} className="mr-2" />
          {setMutation.isPending ? "保存中..." : "保存设置"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              基础信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>网站标题</Label>
              <Input value={values.siteTitle} onChange={(e) => update("siteTitle", e.target.value)} />
            </div>
            <div>
              <Label>网站描述</Label>
              <Textarea
                value={values.siteDescription}
                onChange={(e) => update("siteDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>SEO 关键词</Label>
              <Input value={values.siteKeywords} onChange={(e) => update("siteKeywords", e.target.value)} />
            </div>
            <div>
              <Label>作者名称</Label>
              <Input value={values.siteAuthor} onChange={(e) => update("siteAuthor", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              备案信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ICP 备案号</Label>
              <Input value={values.icpBeian} onChange={(e) => update("icpBeian", e.target.value)} />
            </div>
            <div>
              <Label>公安备案号</Label>
              <Input value={values.gonganBeian} onChange={(e) => update("gonganBeian", e.target.value)} />
            </div>
            <div>
              <Label>联系邮箱</Label>
              <Input
                value={values.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Image size={16} className="text-primary" />
              首页 Hero 区域
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label>Hero 标题</Label>
              <Input value={values.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
            </div>
            <div>
              <Label>Hero 副标题</Label>
              <Input value={values.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
