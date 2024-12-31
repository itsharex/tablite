export type DatabaseConnectionState = 'active' | 'inactive'

export interface DatabaseConnection {
  id: string
  state: DatabaseConnectionState
  url: string
}
