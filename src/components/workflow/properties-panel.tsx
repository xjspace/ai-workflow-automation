'use client';

import { useWorkflowStore } from '@/store/workflow-store';
import { nodeConfig, AINodeData, HTTPNodeData, ConditionNodeData } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const aiModels = {
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  zhipu: ['glm-4', 'glm-4-flash'],
};

const aiOperations = [
  { value: 'generate', label: '文本生成' },
  { value: 'analyze', label: '文本分析' },
  { value: 'extract', label: '信息提取' },
  { value: 'summarize', label: '摘要总结' },
  { value: 'translate', label: '翻译' },
];

export function PropertiesPanel() {
  const { currentWorkflow, selectedNodeId, updateNode, getNodeById } = useWorkflowStore();

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : undefined;
  const config = selectedNode ? nodeConfig[selectedNode.type] : null;

  if (!currentWorkflow || !selectedNode || !config) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-sm">选择节点查看属性</p>
      </div>
    );
  }

  const handleUpdate = (updates: Record<string, any>) => {
    updateNode(selectedNodeId!, updates);
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: config.color }}
          >
            {config.icon}
          </span>
          <h3 className="font-semibold text-sm text-gray-700">{config.label}</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">配置节点参数</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* 通用属性 */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-xs">
              节点名称
            </Label>
            <Input
              id="label"
              value={selectedNode.data.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* AI 节点属性 */}
          {selectedNode.type === 'ai' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">AI 服务商</Label>
                <Select
                  value={(selectedNode.data as AINodeData).provider}
                  onValueChange={(value) => handleUpdate({ provider: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="zhipu">智谱 AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">模型</Label>
                <Select
                  value={(selectedNode.data as AINodeData).model}
                  onValueChange={(value) => handleUpdate({ model: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels[(selectedNode.data as AINodeData).provider]?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">操作类型</Label>
                <Select
                  value={(selectedNode.data as AINodeData).operation}
                  onValueChange={(value) => handleUpdate({ operation: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiOperations.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">提示词 (Prompt)</Label>
                <Textarea
                  value={(selectedNode.data as AINodeData).prompt}
                  onChange={(e) => handleUpdate({ prompt: e.target.value })}
                  placeholder="输入提示词..."
                  className="min-h-[100px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Temperature</Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={(selectedNode.data as AINodeData).temperature ?? 0.7}
                  onChange={(e) => handleUpdate({ temperature: parseFloat(e.target.value) })}
                  className="h-8 text-sm"
                />
              </div>
            </>
          )}

          {/* HTTP 节点属性 */}
          {selectedNode.type === 'http' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">请求方法</Label>
                <Select
                  value={(selectedNode.data as HTTPNodeData).method}
                  onValueChange={(value) => handleUpdate({ method: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={(selectedNode.data as HTTPNodeData).url}
                  onChange={(e) => handleUpdate({ url: e.target.value })}
                  placeholder="https://api.example.com/..."
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">请求体 (JSON)</Label>
                <Textarea
                  value={(selectedNode.data as HTTPNodeData).body || ''}
                  onChange={(e) => handleUpdate({ body: e.target.value })}
                  placeholder='{"key": "value"}'
                  className="min-h-[80px] text-sm font-mono"
                />
              </div>
            </>
          )}

          {/* 条件节点属性 */}
          {selectedNode.type === 'condition' && (
            <div className="space-y-2">
              <Label className="text-xs">条件表达式</Label>
              <Textarea
                value={(selectedNode.data as ConditionNodeData).expression}
                onChange={(e) => handleUpdate({ expression: e.target.value })}
                placeholder="data.value > 10"
                className="min-h-[60px] text-sm font-mono"
              />
              <p className="text-xs text-gray-400">
                使用 JavaScript 表达式，可访问前序节点输出
              </p>
            </div>
          )}

          {/* 触发器节点属性 */}
          {selectedNode.type === 'trigger' && (
            <div className="space-y-2">
              <Label className="text-xs">触发类型</Label>
              <Select
                value={(selectedNode.data as any).type || 'manual'}
                onValueChange={(value) => handleUpdate({ type: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">手动触发</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="schedule">定时触发</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          测试节点
        </Button>
      </div>
    </div>
  );
}
