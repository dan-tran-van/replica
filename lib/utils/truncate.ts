export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

const MAX_USER_MESSAGE_CHARS = 48_000;

export function truncateUserMessage(message: string): {
  content: string;
  wasTruncated: boolean;
} {
  if (message.length <= MAX_USER_MESSAGE_CHARS) {
    return { content: message, wasTruncated: false };
  }
  return {
    content: `${message.slice(0, MAX_USER_MESSAGE_CHARS)}\n\n[Context truncated due to length limits.]`,
    wasTruncated: true,
  };
}
