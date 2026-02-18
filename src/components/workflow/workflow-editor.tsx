'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge as addReactFlowEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/workflow-store';
import { nodeConfig, NodeType } from '@/types/workflow';
import { CustomNode } from './custom-node';
import { NodePanel } from './node-panel';
import { PropertiesPanel } from './properties-panel';
import { useLocale } from '@/contexts/locale-context';

// 使用 any 类型避免复杂的泛型约束
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  trigger: CustomNode,
  ai: CustomNode,
  http: CustomNode,
  condition: CustomNode,
  loop: CustomNode,
  transform: CustomNode,
  webhook: CustomNode,
  schedule: CustomNode,
};

export function WorkflowEditor() {
  const { currentWorkflow, addNode, addEdge: addEdgeToStore, deleteEdge, selectNode, selectedNodeId, deleteNode } =
    useWorkflowStore();
  const { t } = useLocale();

  // 转换工作流节点到 ReactFlow 格式
  const initialNodes = useMemo(() => {
    if (!currentWorkflow) return [];
    return currentWorkflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data as unknown as Record<string, unknown>,
    }));
  }, [currentWorkflow]);

  const initialEdges = useMemo(() => {
    if (!currentWorkflow) return [];
    return currentWorkflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      animated: true,
      style: { stroke: '#6366f1' },
    }));
  }, [currentWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 连接处理
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target);
        setEdges((eds) => addReactFlowEdge({ ...connection, animated: true }, eds));
      }
    },
    [addEdgeToStore, setEdges]
  );

  // 节点点击
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // 边删除
  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      deleteEdge(edge.id);
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [deleteEdge, setEdges]
  );

  // 拖放处理
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      addNode(type, position);
    },
    [addNode]
  );

  // 键盘删除
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
          setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
          setEdges((eds) =>
            eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
          );
        }
      }
    },
    [selectedNodeId, deleteNode, setNodes, setEdges]
  );

  if (!currentWorkflow) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('prompt.selectWorkflow')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" onKeyDown={onKeyDown} tabIndex={0}>
      {/* 左侧节点面板 */}
      <NodePanel />

      {/* 中间画布 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => nodeConfig[node.type as NodeType]?.color || '#999'}
            maskColor="rgba(0,0,0,0.1)"
          />
          <Panel position="top-center">
            <div className="bg-white px-4 py-2 rounded-lg shadow-md">
              <h2 className="font-semibold text-gray-800">{currentWorkflow.name}</h2>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* 右侧属性面板 */}
      <PropertiesPanel />
    </div>
  );
}
