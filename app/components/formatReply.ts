export default function formatReply(raw: unknown): string {
  if (!raw && raw !== "") return ""
  let s = String(raw ?? "")

  // Unescape common escaped newlines and tabs
  s = s.replace(/\\n/g, "\n").replace(/\\t/g, "\t")

  // If the text already has Markdown code fences, return as-is
  if (/```/.test(s)) return s

  // Detect JSON and pretty-print it inside a code fence
  const trimmed = s.trim()
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const obj = JSON.parse(trimmed)
      return '```json\n' + JSON.stringify(obj, null, 2) + '\n```'
    } catch (e) {
      // not valid JSON, fallthrough
    }
  }

  // Convert consecutive single-line code-looking blocks (lines starting with 4 spaces) into code fences
  const lines = s.split(/\r?\n/)
  const hasIndentedCode = lines.some((l) => /^\s{4}/.test(l))
  if (hasIndentedCode) {
    // wrap as a code block preserving indentation
    return '```\n' + lines.map((l) => l.replace(/^\s{4}/, "")).join("\n") + '\n```'
  }

  // Replace bare URLs with Markdown links
  s = s.replace(/(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/g, '<$1>')

  // Trim and return
  return s.trim()
}
