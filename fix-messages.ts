export function sanitizeMessages(messages: any[]) {
  return messages.filter((m, i, arr) => {
    if (i === 0) return true;
    return m.role !== arr[i-1].role;
  });
}
