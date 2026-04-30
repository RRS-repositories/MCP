// Phase 1: read-only
import { lookupContactTool } from "./lookup-contact.js";
import { getContactTool } from "./get-contact.js";
import { getCaseTool } from "./get-case.js";
import { listDocumentsTool } from "./list-documents.js";
import { readDocumentTool } from "./read-document.js";
import { searchTool } from "./search.js";
import { getTimelineTool } from "./get-timeline.js";
import { listLendersTool } from "./list-lenders.js";

// Phase 2: write tools
import { updateCaseFieldsTool } from "./update-case-fields.js";
import { updateContactFieldsTool } from "./update-contact-fields.js";
import { addCaseNoteTool } from "./add-case-note.js";
import { setCaseStatusTool } from "./set-case-status.js";

// Phase 3: action tools
import { sendEmailTool } from "./send-email.js";
import { generateDocumentTool } from "./generate-document.js";
import { triggerWorkflowTool } from "./trigger-workflow.js";

// Phase 4: SQL
import { querySqlTool } from "./query-sql.js";

// Phase 5: source code
import { readSourceTool } from "./read-source.js";
import { grepSourceTool } from "./grep-source.js";

export const allTools = [
  // read
  lookupContactTool,
  getContactTool,
  getCaseTool,
  listDocumentsTool,
  readDocumentTool,
  searchTool,
  getTimelineTool,
  listLendersTool,
  // write
  updateCaseFieldsTool,
  updateContactFieldsTool,
  addCaseNoteTool,
  setCaseStatusTool,
  // action
  sendEmailTool,
  generateDocumentTool,
  triggerWorkflowTool,
  // sql
  querySqlTool,
  // source
  readSourceTool,
  grepSourceTool,
] as const;
