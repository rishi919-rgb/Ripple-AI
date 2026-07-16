import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { validateEntity } from '../validationUtils';
import { isRelationshipAllowed } from '../validationRules';
import type { RCDMEntity, RCDMRelationship } from '../types';

// For ES modules path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_DIR = path.resolve(__dirname, '../datasets');

function readJsonFile(filePath: string): any {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error: any) {
    console.error(`Error reading file at ${filePath}:`, error.message);
    throw error;
  }
}

function runRkbValidation() {
  console.log('==================================================');
  console.log('RKB v1 - Ripple Knowledge Base Validation Script');
  console.log('==================================================');

  // 1. Load all datasets
  console.log('Loading datasets from:', DATASETS_DIR);

  const datasets = readJsonFile(path.join(DATASETS_DIR, 'datasets/datasets.json'));
  const foods = readJsonFile(path.join(DATASETS_DIR, 'foods/foods.json'));
  const ingredients = readJsonFile(path.join(DATASETS_DIR, 'ingredients/ingredients.json'));
  const crops = readJsonFile(path.join(DATASETS_DIR, 'crops/crops.json'));
  const regions = readJsonFile(path.join(DATASETS_DIR, 'regions/regions.json'));
  const watersheds = readJsonFile(path.join(DATASETS_DIR, 'watersheds/watersheds.json'));
  const habitats = readJsonFile(path.join(DATASETS_DIR, 'habitats/habitats.json'));
  const species = readJsonFile(path.join(DATASETS_DIR, 'species/species.json'));
  const citations = readJsonFile(path.join(DATASETS_DIR, 'citations/citations.json'));
  const evidence = readJsonFile(path.join(DATASETS_DIR, 'evidence/evidence.json'));
  const relationships: RCDMRelationship[] = readJsonFile(path.join(DATASETS_DIR, 'relationships.json'));

  const allEntities: RCDMEntity[] = [
    ...datasets,
    ...foods,
    ...ingredients,
    ...crops,
    ...regions,
    ...watersheds,
    ...habitats,
    ...species,
    ...citations,
    ...evidence
  ];

  console.log(`Loaded ${allEntities.length} entities and ${relationships.length} relationships.`);

  let isValid = true;
  const errors: string[] = [];
  const warnings: string[] = [];

  const entityMap = new Map<string, RCDMEntity>();
  const idCounts = new Map<string, number>();

  // 2. Validate Duplicate IDs & Schema Adherence
  for (const entity of allEntities) {
    // Check ID presence
    if (!entity.id) {
      errors.push(`[SCHEMA] Entity has missing ID field of type: ${entity.type}`);
      isValid = false;
      continue;
    }

    // Check duplicate ID
    const count = idCounts.get(entity.id) || 0;
    idCounts.set(entity.id, count + 1);
    if (count > 0) {
      errors.push(`[DUPLICATE_ID] Duplicate ID detected: '${entity.id}'`);
      isValid = false;
    }

    entityMap.set(entity.id, entity);

    // Schema validation using RCDM validation utility
    const report = validateEntity(entity);
    if (!report.isValid) {
      isValid = false;
      report.errors.forEach(err => {
        errors.push(`[SCHEMA] Entity '${entity.id}' (${entity.type}) failed schema validation at field '${err.path}': ${err.message}`);
      });
    }
    if (report.warnings) {
      report.warnings.forEach(warn => {
        warnings.push(`[SCHEMA_WARNING] Entity '${entity.id}': ${warn}`);
      });
    }

    // Provenance validation
    if (!entity.provenance) {
      errors.push(`[PROVENANCE] Missing provenance object in entity '${entity.id}'`);
      isValid = false;
    } else {
      if (!entity.provenance.creator) {
        errors.push(`[PROVENANCE] Missing creator in provenance of entity '${entity.id}'`);
        isValid = false;
      }
      if (!entity.provenance.created) {
        errors.push(`[PROVENANCE] Missing created timestamp in provenance of entity '${entity.id}'`);
        isValid = false;
      }
      if (!entity.provenance.sourceSystem) {
        errors.push(`[PROVENANCE] Missing sourceSystem in provenance of entity '${entity.id}'`);
        isValid = false;
      }
    }
  }

  // 3. Validate Relationships
  const connectedIds = new Set<string>();

  for (const rel of relationships) {
    if (!rel.id) {
      errors.push(`[RELATIONSHIP] Relationship edge is missing ID field.`);
      isValid = false;
      continue;
    }

    const source = entityMap.get(rel.from);
    const target = entityMap.get(rel.to);

    if (!source) {
      errors.push(`[RELATIONSHIP] Relationship '${rel.id}' has non-existent source ID '${rel.from}'`);
      isValid = false;
    }

    if (!target) {
      errors.push(`[RELATIONSHIP] Relationship '${rel.id}' has non-existent target ID '${rel.to}'`);
      isValid = false;
    }

    if (source && target) {
      connectedIds.add(source.id);
      connectedIds.add(target.id);

      // Check relationship permission in validationRules
      const isAllowed = isRelationshipAllowed(source.type, rel.relationship, target.type);
      if (!isAllowed) {
        errors.push(`[RELATIONSHIP] Disallowed edge: Entity type '${source.type}' (${source.id}) cannot connect to '${target.type}' (${target.id}) via relationship '${rel.relationship}'`);
        isValid = false;
      }
    }
  }

  // 4. Validate Orphan Entities
  for (const entity of allEntities) {
    if (!connectedIds.has(entity.id)) {
      // Special case: Dataset and Citation might be connected differently, 
      // but in our graph, Dataset contains Foods, and Evidence references Citations, so they should be connected.
      warnings.push(`[ORPHAN] Entity '${entity.id}' (${entity.type}) is not connected by any relationships in the relationships file.`);
    }
  }

  // 5. Validate Citations Coverage
  // Every Evidence entity must reference at least one Citation
  for (const entity of allEntities) {
    if (entity.type === 'Evidence') {
      if (!entity.citations || entity.citations.length === 0) {
        errors.push(`[CITATION] Evidence '${entity.id}' has an empty citations list.`);
        isValid = false;
      } else {
        // Check if referenced citation exists
        entity.citations.forEach(citId => {
          const cit = entityMap.get(citId);
          if (!cit || cit.type !== 'Citation') {
            errors.push(`[CITATION] Evidence '${entity.id}' references non-existent Citation ID '${citId}'`);
            isValid = false;
          }
        });
      }
      
      // Verify there is a 'references' relationship edge to a Citation
      const hasRefEdge = relationships.some(rel => rel.from === entity.id && rel.relationship === 'references');
      if (!hasRefEdge) {
        warnings.push(`[CITATION] Evidence '${entity.id}' lacks a matching 'references' relationship edge to a Citation entity.`);
      }
    }
  }

  // 6. Summary Report Output
  console.log('==================================================');
  console.log('Validation Completion Report');
  console.log('==================================================');
  
  if (isValid) {
    console.log('🎉 Ripple Knowledge Base v1 validation SUCCESSFUL!');
  } else {
    console.error('💥 Ripple Knowledge Base v1 validation FAILED!');
  }

  console.log(`\nErrors Found: ${errors.length}`);
  errors.forEach(err => console.error(err));

  console.log(`\nWarnings Found: ${warnings.length}`);
  warnings.forEach(warn => console.warn(warn));

  console.log('\n==================================================');

  // Return counts for the report generator
  return {
    isValid,
    errors,
    warnings,
    counts: {
      datasets: datasets.length,
      foods: foods.length,
      ingredients: ingredients.length,
      crops: crops.length,
      regions: regions.length,
      watersheds: watersheds.length,
      habitats: habitats.length,
      species: species.length,
      citations: citations.length,
      evidence: evidence.length,
      relationships: relationships.length
    }
  };
}

// Allow importing or direct running
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-rkb.ts')) {
  const result = runRkbValidation();
  process.exit(result.isValid ? 0 : 1);
}

export { runRkbValidation };
