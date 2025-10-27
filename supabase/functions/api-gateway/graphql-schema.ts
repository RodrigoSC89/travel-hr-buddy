/**
 * PATCH 251 - GraphQL Schema Definition
 * Complete GraphQL schema for API Gateway
 */

export const typeDefs = `
  # Core Types
  type User {
    id: ID!
    email: String!
    role: String
    created_at: String!
  }

  type Document {
    id: ID!
    title: String!
    content: String
    category: String
    user_id: ID!
    vessel_id: ID
    created_at: String!
    updated_at: String
  }

  type Checklist {
    id: ID!
    title: String!
    description: String
    category: String
    items: [ChecklistItem!]!
    completed: Boolean!
    user_id: ID!
    created_at: String!
  }

  type ChecklistItem {
    id: ID!
    checklist_id: ID!
    text: String!
    completed: Boolean!
    order_index: Int!
  }

  type Audit {
    id: ID!
    audit_type: String!
    vessel_id: ID
    status: String!
    findings: String
    recommendations: String
    score: Float
    auditor_id: ID!
    created_at: String!
  }

  type Vessel {
    id: ID!
    name: String!
    imo_number: String
    vessel_type: String
    flag: String
    status: String
    current_position: Position
  }

  type Position {
    latitude: Float!
    longitude: Float!
    accuracy: String
    timestamp: String!
  }

  type Weather {
    location: String!
    temperature: Float!
    humidity: Float!
    wind_speed: Float!
    conditions: String!
    pressure: Float
    visibility: Float
    forecast: [ForecastDay!]
    timestamp: String!
  }

  type ForecastDay {
    day: String!
    temp: Float!
    conditions: String!
  }

  type SatelliteData {
    vessel_id: ID!
    position: Position!
    speed: Float!
    heading: Float!
    satellite_signal: String!
    coverage: String!
    next_pass: String
    timestamp: String!
  }

  type AISData {
    area: String!
    vessels_detected: Int!
    vessels: [AISVessel!]!
    warnings: [String!]!
    traffic_density: String!
    timestamp: String!
  }

  type AISVessel {
    mmsi: String!
    name: String!
    type: String!
    position: VesselPosition!
    speed: Float!
    heading: Float!
    status: String!
  }

  type VesselPosition {
    lat: Float!
    lon: Float!
  }

  type LogisticsData {
    cargo_id: ID
    status: String!
    location: String!
    estimated_arrival: String
    customs_cleared: Boolean
  }

  type Forecast {
    id: ID!
    title: String!
    category: String!
    prediction: String!
    confidence: Float!
    recommendations: String
    created_at: String!
  }

  type Analytics {
    metric: String!
    value: Float!
    trend: String!
    period: String!
    timestamp: String!
  }

  type Template {
    id: ID!
    name: String!
    category: String!
    content: String!
    variables: [String!]!
    created_at: String!
  }

  type APIKey {
    id: ID!
    name: String!
    key_prefix: String!
    scope: [String!]!
    is_active: Boolean!
    request_count: Int!
    created_at: String!
    expires_at: String
  }

  type RateLimit {
    endpoint: String!
    max_requests: Int!
    window_ms: Int!
    current_count: Int!
    reset_at: String!
  }

  # Input Types
  input CreateDocumentInput {
    title: String!
    content: String
    category: String
    vessel_id: ID
  }

  input UpdateDocumentInput {
    title: String
    content: String
    category: String
  }

  input CreateChecklistInput {
    title: String!
    description: String
    category: String
    items: [String!]!
  }

  input CreateAuditInput {
    audit_type: String!
    vessel_id: ID
    findings: String
    recommendations: String
  }

  input CreateAPIKeyInput {
    name: String!
    scope: [String!]!
    expires_in_days: Int
  }

  input LogisticsOperationInput {
    operation: String!
    data: String!
  }

  # Queries
  type Query {
    # User & Auth
    me: User
    user(id: ID!): User
    
    # Documents
    documents(limit: Int, offset: Int): [Document!]!
    document(id: ID!): Document
    
    # Checklists
    checklists(category: String): [Checklist!]!
    checklist(id: ID!): Checklist
    
    # Audits
    audits(vessel_id: ID, status: String): [Audit!]!
    audit(id: ID!): Audit
    
    # Vessels
    vessels: [Vessel!]!
    vessel(id: ID!): Vessel
    
    # Weather & Environmental
    weather(location: String!): Weather
    
    # Satellite & AIS
    satelliteTracking(vessel_id: ID!): SatelliteData
    aisData(area: String!): AISData
    
    # Logistics
    logistics(input: LogisticsOperationInput!): LogisticsData
    
    # Forecasts & Analytics
    forecasts(category: String): [Forecast!]!
    analytics(metric: String!, period: String!): [Analytics!]!
    
    # Templates
    templates(category: String): [Template!]!
    template(id: ID!): Template
    
    # API Management
    apiKeys: [APIKey!]!
    rateLimits: [RateLimit!]!
  }

  # Mutations
  type Mutation {
    # Documents
    createDocument(input: CreateDocumentInput!): Document!
    updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
    deleteDocument(id: ID!): Boolean!
    
    # Checklists
    createChecklist(input: CreateChecklistInput!): Checklist!
    updateChecklistItem(id: ID!, completed: Boolean!): Boolean!
    deleteChecklist(id: ID!): Boolean!
    
    # Audits
    createAudit(input: CreateAuditInput!): Audit!
    updateAudit(id: ID!, status: String!): Audit!
    
    # API Keys
    createAPIKey(input: CreateAPIKeyInput!): APIKey!
    revokeAPIKey(id: ID!): Boolean!
    deleteAPIKey(id: ID!): Boolean!
    
    # Webhooks
    triggerWebhook(event: String!, payload: String!): Boolean!
  }

  # Subscriptions (for real-time updates)
  type Subscription {
    documentUpdated(id: ID!): Document
    vesselPositionUpdated(vessel_id: ID!): SatelliteData
    weatherUpdated(location: String!): Weather
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;
