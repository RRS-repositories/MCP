import { lookupContactTool } from "./lookup-contact.js";
import { getContactTool } from "./get-contact.js";
import { getCaseTool } from "./get-case.js";
import { listDocumentsTool } from "./list-documents.js";
import { readDocumentTool } from "./read-document.js";
import { searchTool } from "./search.js";
import { getTimelineTool } from "./get-timeline.js";
import { listLendersTool } from "./list-lenders.js";

export const allTools = [
  lookupContactTool,
  getContactTool,
  getCaseTool,
  listDocumentsTool,
  readDocumentTool,
  searchTool,
  getTimelineTool,
  listLendersTool,
] as const;
