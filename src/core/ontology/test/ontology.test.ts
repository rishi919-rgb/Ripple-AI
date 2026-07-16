import { validateEntity, validateRelationship, validateGraph } from '../validationUtils';
import type { RCDMEntity, RCDMRelationship } from '../types';

function runTests() {
  console.log('==================================================');
  console.log('Running RCDM Ontology v1 Validation Tests...');
  console.log('==================================================');

  let passed = true;

  const mockProvenance = {
    creator: 'Test Suite',
    created: '2026-07-15T12:00:00Z',
    sourceSystem: 'UnitTestSystem'
  };

  const mockConfidence = {
    score: 0.95,
    level: 'High' as const
  };

  // ==========================================
  // Test 1: Valid Entity (Food)
  // ==========================================
  const validFood: RCDMEntity = {
    id: 'food-123',
    type: 'Food',
    version: '1.0.0',
    name: 'Eco Beans & Rice',
    category: 'Prepared Meal',
    confidence: mockConfidence,
    provenance: mockProvenance,
    citations: [],
    lastVerified: '2026-07-15T12:00:00Z',
    metadata: {}
  };

  const reportFood = validateEntity(validFood);
  if (reportFood.isValid) {
    console.log('✅ Test 1 Passed: Valid Food entity validated successfully.');
  } else {
    console.error('❌ Test 1 Failed: Valid Food entity flagged as invalid:', reportFood.errors);
    passed = false;
  }

  // ==========================================
  // Test 2: Invalid Entity (Crop with missing scientificName)
  // ==========================================
  const invalidCrop: any = {
    id: 'crop-123',
    type: 'Crop',
    version: '1.0.0',
    name: 'Soybeans',
    confidence: mockConfidence,
    provenance: mockProvenance,
    citations: [],
    lastVerified: '2026-07-15T12:00:00Z',
    metadata: {}
  };

  const reportCrop = validateEntity(invalidCrop);
  if (!reportCrop.isValid && reportCrop.errors.some(e => e.path === 'scientificName')) {
    console.log('✅ Test 2 Passed: Invalid Crop (missing scientificName) correctly rejected.');
  } else {
    console.error('❌ Test 2 Failed: Crop validation did not flag missing scientificName as expected:', reportCrop);
    passed = false;
  }

  // ==========================================
  // Test 3: Invalid Confidence score
  // ==========================================
  const invalidConfidenceFood: any = {
    ...validFood,
    id: 'food-invalid-conf',
    confidence: {
      score: 1.5, // Invalid score (> 1.0)
      level: 'High'
    }
  };

  const reportConf = validateEntity(invalidConfidenceFood);
  if (!reportConf.isValid && reportConf.errors.some(e => e.path === 'confidence.score')) {
    console.log('✅ Test 3 Passed: Invalid confidence score (1.5) correctly rejected.');
  } else {
    console.error('❌ Test 3 Failed: Confidence score validation failed to reject invalid score:', reportConf);
    passed = false;
  }

  // ==========================================
  // Test 4: Valid Relationship (Food -> contains -> Ingredient)
  // ==========================================
  const validIngredient: RCDMEntity = {
    id: 'ing-456',
    type: 'Ingredient',
    version: '1.0.0',
    name: 'Black Beans',
    category: 'Legumes',
    confidence: mockConfidence,
    provenance: mockProvenance,
    citations: [],
    lastVerified: '2026-07-15T12:00:00Z',
    metadata: {}
  };

  const validEdge: RCDMRelationship = {
    id: 'edge-1',
    from: validFood.id,
    to: validIngredient.id,
    relationship: 'contains',
    version: '1.0.0'
  };

  const reportEdge = validateRelationship(validFood, validEdge, validIngredient);
  if (reportEdge.isValid) {
    console.log('✅ Test 4 Passed: Valid Food --contains--> Ingredient relationship allowed.');
  } else {
    console.error('❌ Test 4 Failed: Valid relationship rejected:', reportEdge.errors);
    passed = false;
  }

  // ==========================================
  // Test 5: Invalid Relationship (Species -> contains -> Watershed)
  // ==========================================
  const species: RCDMEntity = {
    id: 'species-1',
    type: 'Species',
    version: '1.0.0',
    name: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    conservationStatus: 'Endangered',
    confidence: mockConfidence,
    provenance: mockProvenance,
    citations: [],
    lastVerified: '2026-07-15T12:00:00Z',
    metadata: {}
  };

  const watershed: RCDMEntity = {
    id: 'watershed-1',
    type: 'Watershed',
    version: '1.0.0',
    name: 'Mississippi River Basin',
    riverSystem: 'Mississippi',
    confidence: mockConfidence,
    provenance: mockProvenance,
    citations: [],
    lastVerified: '2026-07-15T12:00:00Z',
    metadata: {}
  };

  const invalidEdge: RCDMRelationship = {
    id: 'edge-2',
    from: species.id,
    to: watershed.id,
    relationship: 'contains', // Species cannot contain a Watershed
    version: '1.0.0'
  };

  const reportInvalidEdge = validateRelationship(species, invalidEdge, watershed);
  if (!reportInvalidEdge.isValid) {
    console.log('✅ Test 5 Passed: Disallowed Species --contains--> Watershed relationship correctly rejected.');
  } else {
    console.error('❌ Test 5 Failed: Invalid relationship allowed incorrectly.');
    passed = false;
  }

  // ==========================================
  // Test 6: Valid Graph Validation
  // ==========================================
  const graphReport = validateGraph([validFood, validIngredient], [validEdge]);
  if (graphReport.isValid) {
    console.log('✅ Test 6 Passed: Complete valid graph validated successfully.');
  } else {
    console.error('❌ Test 6 Failed: Valid graph flagged as invalid:', graphReport);
    passed = false;
  }

  // ==========================================
  // Test 7: Invalid Graph (Orphan Edge)
  // ==========================================
  const orphanEdge: RCDMRelationship = {
    id: 'edge-orphan',
    from: 'non-existent-node',
    to: validIngredient.id,
    relationship: 'contains',
    version: '1.0.0'
  };

  const invalidGraphReport = validateGraph([validFood, validIngredient], [orphanEdge]);
  if (!invalidGraphReport.isValid && invalidGraphReport.structuralErrors.some(e => e.errorCode === 'ORPHAN_EDGE_SOURCE')) {
    console.log('✅ Test 7 Passed: Graph with orphan edge source correctly flagged.');
  } else {
    console.error('❌ Test 7 Failed: Graph validation failed to flag orphan edge source:', invalidGraphReport);
    passed = false;
  }

  console.log('==================================================');
  if (passed) {
    console.log('🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('💥 TEST SUITE FAILED!');
    process.exit(1);
  }
}

// Run immediately if executed
runTests();
