export interface MindMapBranch {
  title: string;
  subBranches: string[];
}

export interface MindMap {
  centralIdea: string;
  branches: MindMapBranch[];
}

export interface GenerateMindMapRequest {
  userInput: string;
}

export interface GenerateMindMapResponse {
  success: boolean;
  mindMap?: MindMap;
  error?: string;
}

export type VisualizationStyle = 'grid' | 'tree' | 'radial' | 'timeline' | 'kanban';
