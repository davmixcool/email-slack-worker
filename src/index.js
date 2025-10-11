/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    // Parse email headers
    const from = message.from;
    const to = message.to;
    const subject = message.headers.get("subject") || "No Subject";
    
    // Use PostalMime for robust email parsing
    let plainText = "Could not extract text";
    let htmlText = "";
    
    try {
      const rawEmail = await new Response(message.raw).arrayBuffer();
      const parser = new PostalMime();
      const email = await parser.parse(rawEmail);
      
      // Get plain text or HTML content
      plainText = email.text || "";
      htmlText = email.html || "";
      
      // If no plain text but has HTML, strip HTML tags
      if (!plainText && htmlText) {
        plainText = htmlText
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // If still empty, show a message
      if (!plainText) {
        plainText = "(Empty email body)";
      }
      
    } catch (error) {
      console.error("Error parsing email:", error);
      plainText = `Error parsing email: ${error.message}`;
    }
    
    // Format message for Slack
    const slackMessage = {
      text: `📧 New Email Received`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📧 New Email"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*From:*\n${from}`
            },
            {
              type: "mrkdwn",
              text: `*To:*\n${to}`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Subject:*\n${subject}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n\`\`\`${plainText.substring(0, 2000)}${plainText.length > 2000 ? '...' : ''}\`\`\``
          }
        }
      ]
    };
    
    // Send to Slack webhook
    try {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(slackMessage)
      });
      
      console.log("Email forwarded to Slack successfully");
    } catch (error) {
      console.error("Error sending to Slack:", error);
    }
  }
}