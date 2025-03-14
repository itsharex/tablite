export type DatabaseConnectionState = 'active' | 'inactive'

export interface DatabaseConnection {
  id: string
  state: DatabaseConnectionState
  url: string
}

export interface OpenaiMessage {
  role: 'user' | 'assistant'
  content: string
}
