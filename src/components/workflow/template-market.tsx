'use client';

import { workflowTemplates } from '@/data/workflow-templates';
import { useWorkflowStore } from '@/store/workflow-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { nodeConfig } from '@/types/workflow';

interface TemplateMarketProps {
  onClose?: () => void;
}

export function TemplateMarket({ onClose }: TemplateMarketProps) {
  const { createWorkflow } = useWorkflowStore();

  const handleUseTemplate = (templateIndex: number) => {
    const template = workflowTemplates[templateIndex];
    if (!template) return;

    // 创建新工作流
    createWorkflow(
      template.name || '从模板创建',
      template.description
    );

    // TODO: 需要在 createWorkflow 后获取新工作流 ID，然后添加节点
    // 这里简化处理，直接关闭模板市场
    onClose?.();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">模板市场</h2>
          <p className="text-gray-500">选择一个模板快速开始</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflowTemplates.map((template, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">
                  {template.nodes?.[0]?.type === 'ai' ? '🤖' :
                   template.nodes?.[0]?.type === 'http' ? '🌐' :
                   template.nodes?.[0]?.type === 'schedule' ? '⏰' : '⚡'}
                </span>
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 节点预览 */}
                <div className="flex items-center gap-1 flex-wrap">
                  {template.nodes?.map((node, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${nodeConfig[node.type]?.color}20`,
                        color: nodeConfig[node.type]?.color,
                      }}
                    >
                      {nodeConfig[node.type]?.icon} {node.data.label}
                    </span>
                  ))}
                </div>

                {/* 统计 */}
                <div className="text-sm text-gray-500">
                  {template.nodes?.length} 个节点 · {template.edges?.length} 条连线
                </div>

                {/* 使用按钮 */}
                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(index)}
                >
                  使用此模板
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 自定义模板提示 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 提示</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 模板可以自由修改，不会影响原始模板</li>
          <li>• 你可以保存自己的工作流为模板</li>
          <li>• 高级模板需要专业版订阅</li>
        </ul>
      </div>
    </div>
  );
}
