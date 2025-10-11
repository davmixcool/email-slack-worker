# Email to Slack Forwarder

A Cloudflare Worker that forwards incoming emails to a Slack channel using webhooks. This worker automatically parses email content and posts it to Slack with formatted blocks for easy reading.

## Features

- 📧 Receives emails via Cloudflare Email Workers
- 🔄 Parses email content (plain text and HTML)
- 📤 Forwards formatted messages to Slack
- 🎨 Uses Slack Block Kit for rich formatting
- ⚡ Serverless and runs on Cloudflare's edge network

## Prerequisites

- A Cloudflare account with Email Workers enabled
- A Slack workspace with webhook permissions
- Node.js and npm installed locally

## Setup

### 1. Install Dependencies

```bash
npm install postal-mime
```

### 2. Configure Slack Webhook

1. Go to your Slack workspace settings
2. Navigate to "Incoming Webhooks" in the Apps section
3. Create a new webhook and copy the webhook URL
4. Choose the channel where emails should be posted

### 3. Set Environment Variables

Add your Slack webhook URL to your Cloudflare Worker:

```bash
npx wrangler secret put SLACK_WEBHOOK_URL
```

Then paste your Slack webhook URL when prompted.

Alternatively, add it to your `wrangler.toml`:

```toml
[vars]
SLACK_WEBHOOK_URL = "your-webhook-url-here"
```

**Note:** For production, always use `wrangler secret` to avoid exposing sensitive URLs.

### 4. Configure Email Routing

In your Cloudflare dashboard:

1. Go to Email Routing
2. Add a route to forward emails to your worker
3. Configure the email addresses you want to forward

## Development

Unfortunately, Email Workers can't be fully tested locally, but you can test the parsing logic:

```bash
npm run dev
```

## Deployment

Deploy your worker to Cloudflare:

```bash
npm run deploy
```

## How It Works

1. **Email Reception**: The worker receives incoming emails via Cloudflare's email handler
2. **Email Parsing**: Uses PostalMime to parse the raw email content
3. **Content Extraction**: Extracts plain text, with fallback to HTML parsing
4. **Slack Formatting**: Formats the email data into Slack Block Kit format
5. **Message Delivery**: Posts the formatted message to your configured Slack webhook

## Message Format

Emails are posted to Slack with the following information:

- **From**: Sender's email address
- **To**: Recipient's email address
- **Subject**: Email subject line
- **Message**: Email body (up to 2000 characters)

## Error Handling

The worker includes error handling for:

- Email parsing failures
- Empty email bodies
- Slack webhook delivery issues

Errors are logged to the console and can be viewed in the Cloudflare Workers dashboard.

## Limitations

- Message content is truncated to 2000 characters for Slack display
- Attachments are not currently forwarded
- HTML emails are converted to plain text

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Email Workers](https://developers.cloudflare.com/email-routing/email-workers/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [PostalMime Library](https://www.npmjs.com/package/postal-mime)

## License

MIT