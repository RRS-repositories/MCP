module.exports = {
  apps: [
    {
      name: "crm-mcp",
      script: "./dist/index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
      out_file: "/home/ubuntu/crm-mcp/logs/out.log",
      error_file: "/home/ubuntu/crm-mcp/logs/err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
