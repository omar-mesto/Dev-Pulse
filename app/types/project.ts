export interface ProjectIdeaPayload {
  title: string
  abstract: string
  description: string
  team_size: number
  required_skills: string[]
}

export interface ProjectIdeaResponse {
  status: boolean
  message: string
  data: {
    project_idea: {
      id: number
      owner_id: number
      owner: {
        id: number
        name: string
        email: string
      }
      title: string
      abstract: string
      description: string
      team_size: number
      required_skills: string[]
      created_at: string
      updated_at: string
    }
  }
}