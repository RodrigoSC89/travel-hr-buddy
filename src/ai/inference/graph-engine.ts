/**
 * PATCH 612 - Graph-Based Inference Engine
 * Relational graph engine for system entities (modules, agents, dependencies)
 * Calculates influence and propagates decisions through the graph
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

// Graph node types
export type NodeType = 'module' | 'agent' | 'service' | 'sensor';
export type EdgeType = 'depends_on' | 'communicates_with' | 'controls' | 'monitors';

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  metadata: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  influence: number; // 0-1 scale
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight: number; // 0-1 scale
  metadata?: Record<string, any>;
}

export interface InferencePath {
  path: string[];
  confidence: number;
  reasoning: string[];
  bottlenecks: string[];
}

export interface BottleneckInfo {
  nodeId: string;
  nodeName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  inDegree: number;
  outDegree: number;
  dependents: string[];
  reason: string;
}

class GraphInferenceEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();
  private isInitialized = false;

  /**
   * Initialize the graph engine from system registry
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[GraphEngine] Already initialized');
      return;
    }

    logger.info('[GraphEngine] Initializing graph-based inference engine...');

    try {
      // Load nodes from modules registry
      await this.loadNodesFromRegistry();

      // Generate edges based on dependencies
      await this.generateEdges();

      // Calculate initial influence scores
      this.calculateInfluence();

      this.isInitialized = true;
      logger.info(
        `[GraphEngine] Initialized with ${this.nodes.size} nodes and ${this.edges.size} edges`
      );
    } catch (error) {
      logger.error('[GraphEngine] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Load nodes from modules registry
   */
  private async loadNodesFromRegistry(): Promise<void> {
    try {
      // Fetch modules from database
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*');

      if (modulesError) throw modulesError;

      // Add module nodes
      if (modules) {
        for (const module of modules) {
          this.addNode({
            id: `module-${module.id}`,
            type: 'module',
            name: module.name || `Module ${module.id}`,
            status: module.status || 'active',
            influence: 0.5,
            metadata: module,
          });
        }
      }

      // Add AI agent nodes
      const agentNodes: GraphNode[] = [
        {
          id: 'agent-decision-core',
          type: 'agent',
          name: 'Decision Core',
          status: 'active',
          influence: 0.8,
          metadata: { role: 'decision-making' },
        },
        {
          id: 'agent-inference',
          type: 'agent',
          name: 'Inference Engine',
          status: 'active',
          influence: 0.7,
          metadata: { role: 'inference' },
        },
        {
          id: 'agent-watchdog',
          type: 'agent',
          name: 'System Watchdog',
          status: 'active',
          influence: 0.9,
          metadata: { role: 'monitoring' },
        },
      ];

      for (const agent of agentNodes) {
        this.addNode(agent);
      }

      // Add sensor nodes
      for (let i = 0; i < 5; i++) {
        this.addNode({
          id: `sensor-${i}`,
          type: 'sensor',
          name: `Sensor ${i + 1}`,
          status: Math.random() > 0.8 ? 'error' : 'active',
          influence: 0.3,
          metadata: { location: `zone-${i}` },
        });
      }

      logger.info(`[GraphEngine] Loaded ${this.nodes.size} nodes from registry`);
    } catch (error) {
      logger.error('[GraphEngine] Failed to load nodes from registry', error);
      throw error;
    }
  }

  /**
   * Generate edges based on dependencies
   */
  private async generateEdges(): Promise<void> {
    // Create dependencies between nodes
    const nodeIds = Array.from(this.nodes.keys());

    // Agents depend on sensors
    for (let i = 0; i < 5; i++) {
      this.addEdge({
        id: `edge-sensor-${i}-agent`,
        from: `sensor-${i}`,
        to: 'agent-decision-core',
        type: 'monitors',
        weight: 0.6,
      });
    }

    // Modules depend on agents
    const moduleIds = nodeIds.filter((id) => id.startsWith('module-'));
    for (const moduleId of moduleIds.slice(0, 3)) {
      this.addEdge({
        id: `edge-agent-${moduleId}`,
        from: 'agent-decision-core',
        to: moduleId,
        type: 'controls',
        weight: 0.8,
      });
    }

    // Inference engine monitors decision core
    this.addEdge({
      id: 'edge-inference-decision',
      from: 'agent-inference',
      to: 'agent-decision-core',
      type: 'monitors',
      weight: 0.9,
    });

    // Watchdog monitors everything
    for (const nodeId of nodeIds.slice(0, 5)) {
      this.addEdge({
        id: `edge-watchdog-${nodeId}`,
        from: 'agent-watchdog',
        to: nodeId,
        type: 'monitors',
        weight: 0.7,
      });
    }

    logger.info(`[GraphEngine] Generated ${this.edges.size} edges`);
  }

  /**
   * Add a node to the graph
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjacencyList.has(node.id)) {
      this.reverseAdjacencyList.set(node.id, new Set());
    }
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    
    // Update adjacency lists
    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, new Set());
    }
    this.adjacencyList.get(edge.from)!.add(edge.to);

    if (!this.reverseAdjacencyList.has(edge.to)) {
      this.reverseAdjacencyList.set(edge.to, new Set());
    }
    this.reverseAdjacencyList.get(edge.to)!.add(edge.from);
  }

  /**
   * Calculate influence scores using PageRank-like algorithm
   */
  calculateInfluence(): void {
    const dampingFactor = 0.85;
    const iterations = 20;
    const nodeCount = this.nodes.size;

    // Initialize all nodes with equal influence
    for (const node of this.nodes.values()) {
      node.influence = 1.0 / nodeCount;
    }

    // Iterate to converge
    for (let iter = 0; iter < iterations; iter++) {
      const newInfluence = new Map<string, number>();

      for (const [nodeId, node] of this.nodes.entries()) {
        let influence = (1 - dampingFactor) / nodeCount;

        // Get incoming edges
        const incoming = this.reverseAdjacencyList.get(nodeId) || new Set();
        for (const sourceId of incoming) {
          const sourceNode = this.nodes.get(sourceId);
          const outgoing = this.adjacencyList.get(sourceId) || new Set();
          
          if (sourceNode && outgoing.size > 0) {
            // Find the edge weight
            const edge = Array.from(this.edges.values()).find(
              (e) => e.from === sourceId && e.to === nodeId
            );
            const weight = edge ? edge.weight : 1.0;
            
            influence += (dampingFactor * sourceNode.influence * weight) / outgoing.size;
          }
        }

        newInfluence.set(nodeId, influence);
      }

      // Update influence scores
      for (const [nodeId, influence] of newInfluence.entries()) {
        const node = this.nodes.get(nodeId);
        if (node) {
          node.influence = influence;
        }
      }
    }

    logger.info('[GraphEngine] Calculated influence scores');
  }

  /**
   * Propagate a decision through the graph
   */
  propagateDecision(sourceNodeId: string, decision: any): InferencePath[] {
    const paths: InferencePath[] = [];
    const visited = new Set<string>();
    const path: string[] = [sourceNodeId];
    const reasoning: string[] = [];

    this.dfsPropagate(sourceNodeId, decision, visited, path, reasoning, paths);

    logger.info(`[GraphEngine] Propagated decision through ${paths.length} paths`);

    // Log inference paths
    this.logInferencePaths(sourceNodeId, decision, paths);

    return paths;
  }

  /**
   * DFS traversal for decision propagation
   */
  private dfsPropagate(
    nodeId: string,
    decision: any,
    visited: Set<string>,
    path: string[],
    reasoning: string[],
    paths: InferencePath[]
  ): void {
    visited.add(nodeId);
    const node = this.nodes.get(nodeId);

    if (!node) return;

    // Get outgoing edges
    const outgoing = this.adjacencyList.get(nodeId) || new Set();

    if (outgoing.size === 0) {
      // Leaf node - complete path
      const bottlenecks = this.detectBottlenecksInPath(path);
      paths.push({
        path: [...path],
        confidence: this.calculatePathConfidence(path),
        reasoning: [...reasoning, `Reached ${node.name}`],
        bottlenecks,
      });
      return;
    }

    for (const targetId of outgoing) {
      if (!visited.has(targetId)) {
        const edge = Array.from(this.edges.values()).find(
          (e) => e.from === nodeId && e.to === targetId
        );

        if (edge) {
          path.push(targetId);
          reasoning.push(`${node.name} ${edge.type} ${this.nodes.get(targetId)?.name}`);
          
          this.dfsPropagate(targetId, decision, visited, path, reasoning, paths);
          
          path.pop();
          reasoning.pop();
        }
      }
    }
  }

  /**
   * Calculate path confidence based on edge weights and node influence
   */
  private calculatePathConfidence(path: string[]): number {
    if (path.length === 0) return 0;

    let totalConfidence = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = Array.from(this.edges.values()).find(
        (e) => e.from === path[i] && e.to === path[i + 1]
      );
      
      const fromNode = this.nodes.get(path[i]);
      const toNode = this.nodes.get(path[i + 1]);
      
      if (edge && fromNode && toNode) {
        totalConfidence += edge.weight * fromNode.influence * toNode.influence;
      }
    }

    return totalConfidence / (path.length - 1);
  }

  /**
   * Detect bottlenecks in a path
   */
  private detectBottlenecksInPath(path: string[]): string[] {
    const bottlenecks: string[] = [];

    for (const nodeId of path) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      const inDegree = (this.reverseAdjacencyList.get(nodeId) || new Set()).size;
      const outDegree = (this.adjacencyList.get(nodeId) || new Set()).size;

      // High in-degree and low out-degree = potential bottleneck
      if (inDegree > 3 && outDegree < 2) {
        bottlenecks.push(nodeId);
      }

      // Error status = bottleneck
      if (node.status === 'error') {
        bottlenecks.push(nodeId);
      }
    }

    return bottlenecks;
  }

  /**
   * Detect operational bottlenecks in the entire graph
   */
  detectBottlenecks(): BottleneckInfo[] {
    const bottlenecks: BottleneckInfo[] = [];

    for (const [nodeId, node] of this.nodes.entries()) {
      const inDegree = (this.reverseAdjacencyList.get(nodeId) || new Set()).size;
      const outDegree = (this.adjacencyList.get(nodeId) || new Set()).size;
      const dependents = Array.from(this.adjacencyList.get(nodeId) || new Set());

      // Determine severity
      let severity: BottleneckInfo['severity'] = 'low';
      let reason = '';

      if (node.status === 'error') {
        severity = 'critical';
        reason = 'Node in error state';
      } else if (inDegree > 5 && outDegree < 2) {
        severity = 'high';
        reason = 'High dependency convergence with limited output';
      } else if (inDegree > 3 && outDegree === 0) {
        severity = 'medium';
        reason = 'Multiple dependencies with no outputs';
      } else if (dependents.length > 5) {
        severity = 'medium';
        reason = 'Many downstream dependencies';
      }

      if (severity !== 'low' || node.status === 'error') {
        bottlenecks.push({
          nodeId,
          nodeName: node.name,
          severity,
          inDegree,
          outDegree,
          dependents,
          reason,
        });
      }
    }

    logger.info(`[GraphEngine] Detected ${bottlenecks.length} bottlenecks`);
    return bottlenecks;
  }

  /**
   * Log inference paths to database
   */
  private async logInferencePaths(
    sourceNodeId: string,
    decision: any,
    paths: InferencePath[]
  ): Promise<void> {
    try {
      const { error } = await supabase.from('inference_logs').insert({
        source_node: sourceNodeId,
        decision_data: decision,
        paths: paths.map((p) => ({
          path: p.path,
          confidence: p.confidence,
          reasoning: p.reasoning,
          bottlenecks: p.bottlenecks,
        })),
        timestamp: new Date().toISOString(),
      });

      if (error) {
        logger.error('[GraphEngine] Failed to log inference paths', error);
      }
    } catch (error) {
      logger.error('[GraphEngine] Error logging inference paths', error);
    }
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodesByType: this.getNodesByType(),
      edgesByType: this.getEdgesByType(),
      avgInfluence: this.getAverageInfluence(),
      topInfluencers: this.getTopInfluencers(5),
    };
  }

  private getNodesByType() {
    const byType: Record<string, number> = {};
    for (const node of this.nodes.values()) {
      byType[node.type] = (byType[node.type] || 0) + 1;
    }
    return byType;
  }

  private getEdgesByType() {
    const byType: Record<string, number> = {};
    for (const edge of this.edges.values()) {
      byType[edge.type] = (byType[edge.type] || 0) + 1;
    }
    return byType;
  }

  private getAverageInfluence(): number {
    const total = Array.from(this.nodes.values()).reduce(
      (sum, node) => sum + node.influence,
      0
    );
    return total / this.nodes.size;
  }

  private getTopInfluencers(count: number): Array<{ id: string; name: string; influence: number }> {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.influence - a.influence)
      .slice(0, count)
      .map((node) => ({
        id: node.id,
        name: node.name,
        influence: node.influence,
      }));
  }

  /**
   * Export graph data
   */
  exportGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}

// Export singleton instance
export const graphInferenceEngine = new GraphInferenceEngine();
