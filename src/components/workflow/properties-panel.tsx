'use client';

import { useWorkflowStore } from '@/store/workflow-store';
import { nodeConfig, AINodeData, HTTPNodeData, ConditionNodeData, TriggerNodeData } from '@/types/workflow';
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
import { useLocale } from '@/contexts/locale-context';

const aiModels = {
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  zhipu: ['glm-4', 'glm-4-flash'],
};

export function PropertiesPanel() {
  const { currentWorkflow, selectedNodeId, updateNode, getNodeById } = useWorkflowStore();
  const { t, locale } = useLocale();

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : undefined;
  const config = selectedNode ? nodeConfig[selectedNode.type] : null;

  // AI operation labels
  const aiOperations = [
    { value: 'generate', label: t('ai.operations.generate') },
    { value: 'analyze', label: t('ai.operations.analyze') },
    { value: 'extract', label: t('ai.operations.extract') },
    { value: 'summarize', label: t('ai.operations.summarize') },
    { value: 'translate', label: t('ai.operations.translate') },
  ];

  // Trigger type labels
  const triggerTypes = [
    { value: 'manual', label: t('trigger.manual') },
    { value: 'webhook', label: t('trigger.webhook') },
    { value: 'schedule', label: t('trigger.schedule') },
  ];

  // Node type labels
  const nodeLabels: Record<string, Record<string, string>> = {
    trigger: { en: 'Trigger', zh: '触发器' },
    webhook: { en: 'Webhook', zh: 'Webhook' },
    schedule: { en: 'Schedule', zh: '定时触发' },
    ai: { en: 'AI', zh: 'AI' },
    http: { en: 'HTTP Request', zh: 'HTTP 请求' },
    transform: { en: 'Transform', zh: '数据转换' },
    condition: { en: 'Condition', zh: '条件判断' },
    loop: { en: 'Loop', zh: '循环' },
  };

  // Provider labels
  const providerLabels: Record<string, Record<string, string>> = {
    claude: { en: 'Claude (Anthropic)', zh: 'Claude (Anthropic)' },
    openai: { en: 'OpenAI', zh: 'OpenAI' },
    deepseek: { en: 'DeepSeek', zh: 'DeepSeek' },
    zhipu: { en: 'Zhipu AI', zh: '智谱 AI' },
  };

  if (!currentWorkflow || !selectedNode || !config) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('editor.selectNode')}</p>
      </div>
    );
  }

  const handleUpdate = (updates: Record<string, unknown>) => {
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
          <h3 className="font-semibold text-sm text-gray-700">
            {nodeLabels[selectedNode.type]?.[locale] || config.label}
          </h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">{t('editor.configureNode')}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Common Properties */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-xs">
              {t('editor.nodeName')}
            </Label>
            <Input
              id="label"
              value={selectedNode.data.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* AI Node Properties */}
          {selectedNode.type === 'ai' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">{t('ai.provider')}</Label>
                <Select
                  value={(selectedNode.data as AINodeData).provider}
                  onValueChange={(value) => handleUpdate({ provider: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(aiModels).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {providerLabels[provider]?.[locale] || provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t('ai.model')}</Label>
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
                <Label className="text-xs">{t('ai.operation')}</Label>
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
                <Label className="text-xs">{t('ai.prompt')}</Label>
                <Textarea
                  value={(selectedNode.data as AINodeData).prompt}
                  onChange={(e) => handleUpdate({ prompt: e.target.value })}
                  placeholder={locale === 'zh' ? '输入提示词...' : 'Enter prompt...'}
                  className="min-h-[100px] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t('ai.temperature')}</Label>
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

          {/* HTTP Node Properties */}
          {selectedNode.type === 'http' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">{t('http.method')}</Label>
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
                <Label className="text-xs">{t('http.url')}</Label>
                <Input
                  value={(selectedNode.data as HTTPNodeData).url}
                  onChange={(e) => handleUpdate({ url: e.target.value })}
                  placeholder="https://api.example.com/..."
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{t('http.body')}</Label>
                <Textarea
                  value={(selectedNode.data as HTTPNodeData).body || ''}
                  onChange={(e) => handleUpdate({ body: e.target.value })}
                  placeholder='{"key": "value"}'
                  className="min-h-[80px] text-sm font-mono"
                />
              </div>
            </>
          )}

          {/* Condition Node Properties */}
          {selectedNode.type === 'condition' && (
            <div className="space-y-2">
              <Label className="text-xs">{t('condition.expression')}</Label>
              <Textarea
                value={(selectedNode.data as ConditionNodeData).expression}
                onChange={(e) => handleUpdate({ expression: e.target.value })}
                placeholder="data.value > 10"
                className="min-h-[60px] text-sm font-mono"
              />
              <p className="text-xs text-gray-400">
                {t('condition.hint')}
              </p>
            </div>
          )}

          {/* Trigger Node Properties */}
          {selectedNode.type === 'trigger' && (
            <div className="space-y-2">
              <Label className="text-xs">{t('trigger.type')}</Label>
              <Select
                value={(selectedNode.data as TriggerNodeData).type || 'manual'}
                onValueChange={(value) => handleUpdate({ type: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          {t('editor.testNode')}
        </Button>
      </div>
    </div>
  );
}
