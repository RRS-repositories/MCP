# crm-mcp

MCP (Model Context Protocol) server that bridges Claude Code to the Rowan Rose CRM. Acts as a thin translator between Claude's MCP tool calls and the existing `/api/crm/*` REST endpoints on the CRM backend.

## Architecture

```
Claude Code  ──HTTPS+Bearer──▶  mcp.rowanroseclaims.co.uk  ──HTTPS+x-api-key──▶  crm.rowanroseclaims.co.uk/api/crm/*
                                (this server, EC2)                              (existing CRM, EC2)
```

Three independent auth boundaries; this server holds no DB or S3 credentials.

## Tools (Phase 1, read-only)

| Tool | Purpose |
|---|---|
| `crm_lookup_contact` | Look up a contact by reference, email, or name |
| `crm_get_contact` | Full contact + all their cases |
| `crm_get_case` | Full case state (lender, status, dates, extended fields) |
| `crm_list_documents` | List S3 documents for a contact (filter by case/lender/category) |
| `crm_read_document` | Extract text from a PDF/DOCX |
| `crm_search` | Cross-search contacts and cases |
| `crm_get_timeline` | Communication/action timeline for a contact |
| `crm_list_lenders` | Known lender directory (canonical names + aliases) |

## Local development

```bash
cp .env.example .env
# fill in CRM_API_KEY (from CRM .env) and MCP_API_KEY (generate)
npm install
npm run build
npm start            # HTTP transport on :5050
npm run start:stdio  # stdio transport (for direct Claude Code stdio use)
```

Health check:
```bash
curl http://127.0.0.1:5050/healthz
```

## Production deploy

Runs under PM2 on a dedicated EC2 (separate from the CRM box).

```bash
git pull
npm ci
npm run build
pm2 reload ecosystem.config.cjs
pm2 save
```

Nginx terminates TLS for `mcp.rowanroseclaims.co.uk` and proxies to `127.0.0.1:5050`.

## Registering with Claude Code

```bash
claude mcp add --transport http crm \
  https://mcp.rowanroseclaims.co.uk/mcp \
  --header "Authorization: Bearer <MCP_API_KEY>" \
  --scope user
```

## Env vars

See `.env.example`. Never commit `.env`.

## Audit log

Every tool call writes a structured log line via `pino`. Logs land in `/home/ubuntu/crm-mcp/logs/`. Phase 3 will move these to a Postgres `mcp_audit_log` table.

## License

Internal — Rowan Rose / Fast Action Claims.
