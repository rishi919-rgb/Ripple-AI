import commonSchemaJson from './common.schema.json';

export const COMMON_SCHEMA = commonSchemaJson;

const baseSchemaRef = {
  allOf: [
    {
      $ref: 'https://ripple.ai/schemas/v1/common.schema.json#/definitions/rcdmBase'
    }
  ]
};

export const FOOD_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/food.schema.json',
  title: 'RCDM Food Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name'],
  properties: {
    type: { const: 'Food' },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    brandOrSource: { type: 'string' },
    category: { type: 'string' }
  }
};

export const INGREDIENT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/ingredient.schema.json',
  title: 'RCDM Ingredient Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'category'],
  properties: {
    type: { const: 'Ingredient' },
    name: { type: 'string', minLength: 1 },
    category: { type: 'string', minLength: 1 },
    aliases: {
      type: 'array',
      items: { type: 'string' }
    },
    isKeyComponent: { type: 'boolean' }
  }
};

export const CROP_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/crop.schema.json',
  title: 'RCDM Crop Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'scientificName'],
  properties: {
    type: { const: 'Crop' },
    name: { type: 'string', minLength: 1 },
    scientificName: { type: 'string', minLength: 1 },
    variety: { type: 'string' },
    growingSeason: { type: 'string' }
  }
};

export const REGION_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/region.schema.json',
  title: 'RCDM Region Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'country'],
  properties: {
    type: { const: 'Region' },
    name: { type: 'string', minLength: 1 },
    country: { type: 'string', minLength: 1 },
    stateOrProvince: { type: 'string' },
    coordinates: {
      $ref: 'https://ripple.ai/schemas/v1/common.schema.json#/definitions/coordinates'
    }
  }
};

export const WATERSHED_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/watershed.schema.json',
  title: 'RCDM Watershed Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'riverSystem'],
  properties: {
    type: { const: 'Watershed' },
    name: { type: 'string', minLength: 1 },
    riverSystem: { type: 'string', minLength: 1 },
    basinAreaSqKm: { type: 'number', minimum: 0 },
    dischargeRate: { type: 'number', minimum: 0 }
  }
};

export const HABITAT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/habitat.schema.json',
  title: 'RCDM Habitat Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'classification'],
  properties: {
    type: { const: 'Habitat' },
    name: { type: 'string', minLength: 1 },
    classification: { type: 'string', minLength: 1 },
    ecologicalHealthScore: { type: 'number', minimum: 0.0, maximum: 1.0 }
  }
};

export const SPECIES_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/species.schema.json',
  title: 'RCDM Species Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'scientificName', 'conservationStatus'],
  properties: {
    type: { const: 'Species' },
    name: { type: 'string', minLength: 1 },
    scientificName: { type: 'string', minLength: 1 },
    conservationStatus: {
      type: 'string',
      enum: ['Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient']
    },
    trophicLevel: { type: 'string' }
  }
};

export const EVIDENCE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/evidence.schema.json',
  title: 'RCDM Evidence Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['value', 'metric', 'observedDate'],
  properties: {
    type: { const: 'Evidence' },
    value: { type: ['string', 'number', 'boolean', 'object', 'array'] },
    metric: { type: 'string', minLength: 1 },
    observedDate: { type: 'string', format: 'date-time' },
    methodology: { type: 'string' }
  }
};

export const CITATION_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/citation.schema.json',
  title: 'RCDM Citation Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['title', 'authors', 'publicationYear'],
  properties: {
    type: { const: 'Citation' },
    title: { type: 'string', minLength: 1 },
    authors: {
      type: 'array',
      minItems: 1,
      items: { type: 'string', minLength: 1 }
    },
    journalOrPublisher: { type: 'string' },
    publicationYear: { type: 'integer', minimum: 0 },
    doi: { type: 'string' },
    url: { type: 'string' }
  }
};

export const DATASET_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/dataset.schema.json',
  title: 'RCDM Dataset Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['name', 'owner', 'recordCount'],
  properties: {
    type: { const: 'Dataset' },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    license: { type: 'string' },
    owner: { type: 'string', minLength: 1 },
    recordCount: { type: 'integer', minimum: 0 }
  }
};

export const CONFIDENCE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/confidence.schema.json',
  title: 'RCDM Confidence Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['score', 'level'],
  properties: {
    type: { const: 'Confidence' },
    score: { type: 'number', minimum: 0.0, maximum: 1.0 },
    level: {
      type: 'string',
      enum: ['Low', 'Medium', 'High']
    },
    methodology: { type: 'string' },
    evaluator: { type: 'string' }
  }
};

export const SIMULATION_METADATA_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/simulationMetadata.schema.json',
  title: 'RCDM SimulationMetadata Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['modelName', 'modelVersion', 'parameters', 'executionTimestamp', 'runId'],
  properties: {
    type: { const: 'SimulationMetadata' },
    modelName: { type: 'string', minLength: 1 },
    modelVersion: { type: 'string', minLength: 1 },
    parameters: { type: 'object' },
    executionTimestamp: { type: 'string', format: 'date-time' },
    runId: { type: 'string', minLength: 1 }
  }
};

export const REASONING_METADATA_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://ripple.ai/schemas/v1/reasoningMetadata.schema.json',
  title: 'RCDM ReasoningMetadata Entity Schema',
  type: 'object',
  allOf: baseSchemaRef.allOf,
  required: ['reasoningType', 'steps'],
  properties: {
    type: { const: 'ReasoningMetadata' },
    reasoningType: {
      type: 'string',
      enum: ['LLM', 'Rule-based', 'Symbolic', 'Hybrid']
    },
    steps: {
      type: 'array',
      items: {
        $ref: 'https://ripple.ai/schemas/v1/common.schema.json#/definitions/reasoningStep'
      }
    },
    modelUsed: { type: 'string' },
    promptTemplate: { type: 'string' }
  }
};

export const SCHEMAS: Record<string, any> = {
  common: COMMON_SCHEMA,
  Food: FOOD_SCHEMA,
  Ingredient: INGREDIENT_SCHEMA,
  Crop: CROP_SCHEMA,
  Region: REGION_SCHEMA,
  Watershed: WATERSHED_SCHEMA,
  Habitat: HABITAT_SCHEMA,
  Species: SPECIES_SCHEMA,
  Evidence: EVIDENCE_SCHEMA,
  Citation: CITATION_SCHEMA,
  Dataset: DATASET_SCHEMA,
  Confidence: CONFIDENCE_SCHEMA,
  SimulationMetadata: SIMULATION_METADATA_SCHEMA,
  ReasoningMetadata: REASONING_METADATA_SCHEMA
};
