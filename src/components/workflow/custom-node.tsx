'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeConfig, NodeType, WorkflowNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflow-store';
import { cn } from '@/lib/utils';

type CustomNodeProps = {
  id: string;
  type: NodeType;
  data: WorkflowNodeData;
  selected?: boolean;
};

export const CustomNode = memo(({ id, type, data, selected }: CustomNodeProps) => {
  const config = nodeConfig[type];
  const { selectedNodeId } = useWorkflowStore();
  const isSelected = selected || selectedNodeId === id;

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[150px] transition-all duration-200',
        'bg-white shadow-md hover:shadow-lg',
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
      )}
    >
      {/* 输入连接点 */}
      {type !== 'trigger' && type !== 'webhook' && type !== 'schedule' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      {/* 节点内容 */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <div>
          <div className="font-medium text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-400">{config.label}</div>
        </div>
      </div>

      {/* 节点特定信息 */}
      {type === 'ai' && 'provider' in data && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {data.provider} / {data.model?.split('-')[0]}
          </div>
        </div>
      )}

      {type === 'http' && 'method' in data && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">{data.method}</div>
        </div>
      )}

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      {/* 条件节点的额外连接点 */}
      {type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3 h-3 bg-red-400 border-2 border-white"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="w-3 h-3 bg-green-400 border-2 border-white"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
