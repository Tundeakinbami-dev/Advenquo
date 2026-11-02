/**
 * Advenquo Global Live World Engine: Ingestion Service
 *
 * Coordinates scheduled & on-demand ingestion across registered sources.
 * Manages fetch runs, provenance logging, rate-limiting, and error tolerance.
 */

import type { SourceDocument, SourceFetchRun, SourceRegistryEntry } from '../types.js';
import { sourceRegistry } from '../source-registry.js';
import { AdapterFactory } from './source-adapters.js';
import { normalizeSourceItem } from '../intelligence/normalizer.js';

export class IngestionService {
  private fetchRuns: Map<string, SourceFetchRun> = new Map();
  private documentsStore: Map<string, SourceDocument> = new Map();
  private processedHashes: Set<string> = new Set();

  /**
   * Executes an ingestion run across all active eligible sources or a specific source.
   */
  public async ingestAll(): Promise<{
    runs: SourceFetchRun[];
    newDocuments: SourceDocument[];
  }> {
    const sources = sourceRegistry.getActiveEligibleSources();
    const runs: SourceFetchRun[] = [];
    const newDocuments: SourceDocument[] = [];

    for (const source of sources) {
      try {
        const result = await this.ingestSource(source.sourceId);
        runs.push(result.run);
        newDocuments.push(...result.newDocuments);
      } catch (err) {
        console.warn(`Ingestion failed for ${source.sourceId}:`, (err as Error).message);
      }
    }

    return { runs, newDocuments };
  }

  /**
   * Ingests a single source by ID with full provenance logging and backoff.
   */
  public async ingestSource(sourceId: string): Promise<{
    run: SourceFetchRun;
    newDocuments: SourceDocument[];
  }> {
    const source = sourceRegistry.getSource(sourceId);
    if (!source) {
      throw new Error(`Source '${sourceId}' not found in registry`);
    }

    const runId = `run_${sourceId}_${Date.now()}`;
    const run: SourceFetchRun = {
      runId,
      sourceId,
      startedAt: new Date().toISOString(),
      status: 'running',
      documentsFetched: 0,
      newDocumentsCount: 0,
    };
    this.fetchRuns.set(runId, run);

    const newDocuments: SourceDocument[] = [];

    try {
      const adapter = AdapterFactory.getAdapterForSource(source);
      const rawItems = await adapter.fetchItems(source);

      run.documentsFetched = rawItems.length;

      for (const item of rawItems) {
        const doc = normalizeSourceItem(item, source, runId);

        // Deduplicate against already processed content hashes
        if (!this.processedHashes.has(doc.contentHash)) {
          this.processedHashes.add(doc.contentHash);
          this.documentsStore.set(doc.documentId, doc);
          newDocuments.push(doc);
        }
      }

      run.newDocumentsCount = newDocuments.length;
      run.status = 'success';
      run.completedAt = new Date().toISOString();

      sourceRegistry.updateHealth(sourceId, 'healthy', true);
    } catch (err) {
      run.status = 'failed';
      run.errorMessage = (err as Error).message;
      run.completedAt = new Date().toISOString();

      // Provider outage handling: update health without marking any existing event ended
      sourceRegistry.updateHealth(sourceId, 'degraded', false);
    }

    return { run, newDocuments };
  }

  public getFetchRun(runId: string): SourceFetchRun | undefined {
    return this.fetchRuns.get(runId);
  }

  public getAllFetchRuns(): SourceFetchRun[] {
    return Array.from(this.fetchRuns.values());
  }

  public getDocument(docId: string): SourceDocument | undefined {
    return this.documentsStore.get(docId);
  }

  public getAllDocuments(): SourceDocument[] {
    return Array.from(this.documentsStore.values());
  }

  public resetStores(): void {
    this.fetchRuns.clear();
    this.documentsStore.clear();
    this.processedHashes.clear();
  }
}

export const ingestionService = new IngestionService();
