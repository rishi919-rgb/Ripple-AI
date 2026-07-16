import foodsJson from './datasets/foods/foods.json';
import speciesJson from './datasets/species/species.json';
import watershedsJson from './datasets/watersheds/watersheds.json';
import relationshipsJson from './datasets/relationships.json';
import ingredientsJson from './datasets/ingredients/ingredients.json';
import cropsJson from './datasets/crops/crops.json';
import regionsJson from './datasets/regions/regions.json';
import habitatsJson from './datasets/habitats/habitats.json';
import citationsJson from './datasets/citations/citations.json';
import evidenceJson from './datasets/evidence/evidence.json';
import datasetsJson from './datasets/datasets/datasets.json';

import { validateEntity } from './validationUtils';

export function validateKnowledgeBase(): void {
  // 1. Gather all entity IDs
  const definedIds = new Set<string>();
  
  const allEntities = [
    ...(foodsJson as any[]),
    ...(speciesJson as any[]),
    ...(watershedsJson as any[]),
    ...(ingredientsJson as any[]),
    ...(cropsJson as any[]),
    ...(regionsJson as any[]),
    ...(habitatsJson as any[]),
    ...(citationsJson as any[]),
    ...(evidenceJson as any[]),
    ...(datasetsJson as any[])
  ];

  allEntities.forEach(e => {
    if (e && e.id) {
      definedIds.add(e.id);
    }
  });

  // 2. Validate Entities Schema
  const schemaErrors: string[] = [];
  const schemaWarnings: string[] = [];

  foodsJson.forEach(e => {
    const r = validateEntity(e);
    if (!r.isValid) {
      r.errors.forEach(err => schemaErrors.push(`Food schema error in '${e.id}' at '${err.path}': ${err.message}`));
    }
    if (r.warnings) {
      r.warnings.forEach(w => schemaWarnings.push(w));
    }
  });

  speciesJson.forEach(e => {
    const r = validateEntity(e);
    if (!r.isValid) {
      r.errors.forEach(err => schemaErrors.push(`Species schema error in '${e.id}' at '${err.path}': ${err.message}`));
    }
    if (r.warnings) {
      r.warnings.forEach(w => schemaWarnings.push(w));
    }
  });

  watershedsJson.forEach(e => {
    const r = validateEntity(e);
    if (!r.isValid) {
      r.errors.forEach(err => schemaErrors.push(`Watershed schema error in '${e.id}' at '${err.path}': ${err.message}`));
    }
    if (r.warnings) {
      r.warnings.forEach(w => schemaWarnings.push(w));
    }
  });

  // 3. Validate Relationships (Referential integrity check)
  const missingEntities = new Set<string>();
  
  (relationshipsJson as any[]).forEach(rel => {
    if (!definedIds.has(rel.from)) {
      missingEntities.add(rel.from);
    }
    if (!definedIds.has(rel.to)) {
      missingEntities.add(rel.to);
    }
  });

  if (missingEntities.size > 0) {
    const missingList = Array.from(missingEntities).join('\n');
    const msg = `Knowledge Base validation failed.\nMissing entity:\n${missingList}`;
    console.error(msg);
    throw new Error(msg);
  }

  if (schemaErrors.length > 0) {
    const msg = `Knowledge Base validation failed.\nSchema errors:\n${schemaErrors.join('\n')}`;
    console.error(msg);
    throw new Error(msg);
  }

  if (schemaWarnings.length > 0) {
    console.warn(`⚠️ Knowledge Base validation warnings:\n${schemaWarnings.join('\n')}`);
  }

  console.log('🎉 Ripple Knowledge Base startup validation successful!');
}
