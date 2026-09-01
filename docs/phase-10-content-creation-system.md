# Culture Kingdom — Phase 10: Content Creation System

**Rule:** the content pipeline is culture-agnostic. Everything culture-specific lives in the Culture Pack.

---

## 1. Content Pipeline

```
Author (CMS) → Draft → Peer/Language review → Expert review → Approved → Published (immutable version) → CDN/Read API
                                                    ↑ rollback: pin previous version
```

- Culture Packs are authored in CMS, validated against manifest schema, then published as a versioned bundle.
- Bulk import/export (JSON) for large libraries.
- Every factual content item carries: source, owner, reviewer, review status, version, publication status.

---

## 2. Review Workflow

Linear state machine (no branching merges in v1):

```
draft → review → expert_review → approved → published → archived
```

- Publication requires explicit approval; publication requires at least one source citation for factual items.
- Rollback = pin previous version.
- Audit trail: `content_approvals` records every transition.

---

## 3. AI-Assisted Drafting

- AI may draft content, but drafts enter the normal review workflow; AI never publishes.
- Drafts carry `ai_assisted: true` metadata for audit.

---

## 4. Engine Interface (contract for Phase 2)

```
CMS.ImportPack(manifestPath) → packID
CMS.SubmitReview(contentType, contentID) → newStatus
CMS.Publish(contentType, contentID) → publishedVersion
CMS.Rollback(contentType, contentID, version) → pinnedVersion
```

The CMS reads persona and boundary config from the Culture Pack; it never contains culture logic.
