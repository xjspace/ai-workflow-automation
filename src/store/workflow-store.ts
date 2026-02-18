import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NodeType, WorkflowNode, WorkflowEdge, WorkflowDefinition, nodeConfig } from '@/types/workflow';

interface WorkflowState {
  // 当前工作流
  currentWorkflow: WorkflowDefinition | null;

  // 所有工作流列表
  workflows: WorkflowDefinition[];

  // 选中的节点 ID
  selectedNodeId: string | null;

  // Actions
  createWorkflow: (name: string, description?: string) => void;
  updateWorkflow: (updates: Partial<WorkflowDefinition>) => void;
  deleteWorkflow: (id: string) => void;
  loadWorkflow: (id: string) => void;

  // 节点操作
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // 边操作
  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;

  // 工具方法
  getNodeById: (id: string) => WorkflowNode | undefined;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      currentWorkflow: null,
      workflows: [],
      selectedNodeId: null,

      createWorkflow: (name, description) => {
        const newWorkflow: WorkflowDefinition = {
          id: generateId(),
          name,
          description,
          nodes: [],
          edges: [],
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          workflows: [...state.workflows, newWorkflow],
          currentWorkflow: newWorkflow,
        }));
      },

      updateWorkflow: (updates) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          const updatedWorkflow = {
            ...state.currentWorkflow,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return {
            currentWorkflow: updatedWorkflow,
            workflows: state.workflows.map((w) =>
              w.id === updatedWorkflow.id ? updatedWorkflow : w
            ),
          };
        });
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          currentWorkflow:
            state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        }));
      },

      loadWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id);
        if (workflow) {
          set({ currentWorkflow: workflow, selectedNodeId: null });
        }
      },

      addNode: (type, position) => {
        const newNode: WorkflowNode = {
          id: generateId(),
          type,
          position,
          data: {
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
            type: type === 'trigger' ? 'manual' : undefined,
            provider: type === 'ai' ? 'claude' : undefined,
            model: type === 'ai' ? 'claude-3-5-sonnet-20241022' : undefined,
            operation: type === 'ai' ? 'generate' : undefined,
            prompt: type === 'ai' ? '' : undefined,
            method: type === 'http' ? 'GET' : undefined,
            url: type === 'http' ? '' : undefined,
            expression: type === 'condition' ? '' : undefined,
          } as any,
        };
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: [...state.currentWorkflow.nodes, newNode],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateNode: (id, data) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: state.currentWorkflow.nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...data } } : node
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteNode: (id) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: state.currentWorkflow.nodes.filter((n) => n.id !== id),
              edges: state.currentWorkflow.edges.filter(
                (e) => e.source !== id && e.target !== id
              ),
              updatedAt: new Date().toISOString(),
            },
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      selectNode: (id) => {
        set({ selectedNodeId: id });
      },

      addEdge: (source, target) => {
        const newEdge: WorkflowEdge = {
          id: `edge-${source}-${target}`,
          source,
          target,
        };
        set((state) => {
          if (!state.currentWorkflow) return state;
          // 检查是否已存在
          const exists = state.currentWorkflow.edges.some(
            (e) => e.source === source && e.target === target
          );
          if (exists) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              edges: [...state.currentWorkflow.edges, newEdge],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteEdge: (id) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              edges: state.currentWorkflow.edges.filter((e) => e.id !== id),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      getNodeById: (id) => {
        return get().currentWorkflow?.nodes.find((n) => n.id === id);
      },
    }),
    {
      name: 'workflow-storage',
      partialize: (state) => ({
        workflows: state.workflows,
      }),
    }
  )
);
