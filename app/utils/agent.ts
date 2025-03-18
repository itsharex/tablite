import type { CoreMessage, LanguageModelV1 } from 'ai'

interface AgentNodeInterceptor {
  before?: () => void
  after?: () => void
}

export type AgentNode = ((instance: any) => Promise<any>) & AgentNodeInterceptor

export class Agent {
  public nodes: AgentNode[] = []
  public messages: CoreMessage[] = []

  constructor(
    public model: LanguageModelV1,
  ) {}

  next(node: AgentNode, options: AgentNodeInterceptor = {}) {
    this.nodes.push(Object.assign(node, options))
    return this
  }

  async execute(input: CoreMessage[]) {
    this.messages.push(...input)
    for (const node of this.nodes) {
      node.before?.()
      const output = await node(this)
      node.after?.()
      this.messages.push({ role: 'assistant', content: output })
    }
    return this
  }
}

export function createAgent(model: LanguageModelV1) {
  return new Agent(model)
}
