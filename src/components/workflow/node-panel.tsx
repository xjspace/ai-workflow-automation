'use client';

import { nodeConfig, NodeType } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const categories = [
  {
    name: '触发器',
    types: ['trigger', 'webhook', 'schedule'] as NodeType[],
  },
  {
    name: '操作',
    types: ['ai', 'http', 'transform'] as NodeType[],
  },
  {
    name: '逻辑',
    types: ['condition', 'loop'] as NodeType[],
  },
];

export function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700">节点库</h3>
        <p className="text-xs text-gray-400 mt-1">拖拽到画布添加</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {categories.map((category) => (
            <div key={category.name}>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category.name}
              </h4>
              <div className="space-y-2">
                {category.types.map((type) => {
                  const config = nodeConfig[type];
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => onDragStart(e, type)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg cursor-grab',
                        'border border-gray-200 bg-gray-50 hover:bg-gray-100',
                        'transition-colors duration-150',
                        'active:cursor-grabbing'
                      )}
                    >
                      <span
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.icon}
                      </span>
                      <span className="text-sm text-gray-700">{config.label}</span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-3" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
