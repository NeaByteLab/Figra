export interface DeepNode {
  id: string
  value: unknown
  children: DeepNode[]
  parent?: DeepNode
  depth: number
}

export type DeepTraversal = 'preorder' | 'inorder' | 'postorder' | 'breadth'

export interface DeepSearchOptions {
  maxDepth?: number
  includeValue?: boolean
  filter?: (node: DeepNode) => boolean
}

export class DeepUtils {
  static createNode(value: unknown, parent?: DeepNode): DeepNode {
    return {
      id: Math.random().toString(36),
      value,
      children: [],
      parent,
      depth: parent ? parent.depth + 1 : 0
    }
  }

  static addChild(parent: DeepNode, child: DeepNode): void {
    child.parent = parent
    child.depth = parent.depth + 1
    parent.children.push(child)
  }

  static traverse(node: DeepNode, type: DeepTraversal, callback: (node: DeepNode) => void): void {
    switch (type) {
      case 'preorder':
        callback(node)
        node.children.forEach(child => this.traverse(child, type, callback))
        break
      case 'inorder':
        if (node.children.length > 0) {
          this.traverse(node.children[0], type, callback)
        }
        callback(node)
        node.children.slice(1).forEach(child => this.traverse(child, type, callback))
        break
      case 'postorder':
        node.children.forEach(child => this.traverse(child, type, callback))
        callback(node)
        break
      case 'breadth':
        this.breadthFirstTraversal(node, callback)
        break
    }
  }

  static search(root: DeepNode, options: DeepSearchOptions = {}): DeepNode[] {
    const results: DeepNode[] = []
    const { maxDepth = Infinity, filter } = options

    this.traverse(root, 'preorder', (node) => {
      if (node.depth <= maxDepth && (!filter || filter(node))) {
        results.push(node)
      }
    })

    return results
  }

  static findById(root: DeepNode, id: string): DeepNode | null {
    const results = this.search(root, {
      filter: (node) => node.id === id
    })
    return results[0] || null
  }

  static findByValue(root: DeepNode, value: unknown): DeepNode[] {
    return this.search(root, {
      filter: (node) => node.value === value
    })
  }

  static getDepth(root: DeepNode): number {
    let maxDepth = 0
    this.traverse(root, 'preorder', (node) => {
      maxDepth = Math.max(maxDepth, node.depth)
    })
    return maxDepth
  }

  static getNodeCount(root: DeepNode): number {
    let count = 0
    this.traverse(root, 'preorder', () => {
      count++
    })
    return count
  }

  static flatten(root: DeepNode): DeepNode[] {
    const result: DeepNode[] = []
    this.traverse(root, 'preorder', (node) => {
      result.push(node)
    })
    return result
  }

  private static breadthFirstTraversal(root: DeepNode, callback: (node: DeepNode) => void): void {
    const queue: DeepNode[] = [root]
    while (queue.length > 0) {
      const node = queue.shift()!
      callback(node)
      queue.push(...node.children)
    }
  }
}

export function createDeepTree(value: unknown): DeepNode {
  return DeepUtils.createNode(value)
}

export const DEEP_CONSTANTS = {
  MAX_DEPTH: 100,
  DEFAULT_TRAVERSAL: 'preorder' as DeepTraversal,
  ROOT_DEPTH: 0
} as const
