export type DataFormat = "JSON" | "CSV" | "XML";

export function transformData(
  input: string,
  fromFormat: DataFormat,
  toFormat: DataFormat
): string {
  if (!input.trim()) throw new Error("Input is empty");
  if (fromFormat === toFormat) return input;

  // Parse input to intermediate (array of objects)
  const data = parseInput(input, fromFormat);

  // Serialize to output format
  return serializeOutput(data, toFormat);
}

function parseInput(input: string, format: DataFormat): Record<string, unknown>[] {
  switch (format) {
    case "JSON": {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    case "CSV": {
      const lines = input.trim().split("\n");
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
      const headers = parseCsvLine(lines[0]);
      return lines.slice(1).filter(l => l.trim()).map(line => {
        const values = parseCsvLine(line);
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
        return obj;
      });
    }
    case "XML": {
      return parseXml(input);
    }
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseXml(xml: string): Record<string, unknown>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error("Invalid XML: " + errorNode.textContent);

  const root = doc.documentElement;
  const items: Record<string, unknown>[] = [];

  for (const child of Array.from(root.children)) {
    const obj: Record<string, unknown> = {};
    for (const field of Array.from(child.children)) {
      obj[field.tagName] = field.textContent ?? "";
    }
    items.push(obj);
  }

  if (items.length === 0) {
    const obj: Record<string, unknown> = {};
    for (const field of Array.from(root.children)) {
      obj[field.tagName] = field.textContent ?? "";
    }
    return [obj];
  }

  return items;
}

function serializeOutput(data: Record<string, unknown>[], format: DataFormat): string {
  switch (format) {
    case "JSON":
      return JSON.stringify(data.length === 1 ? data[0] : data, null, 2);
    case "CSV": {
      if (data.length === 0) return "";
      const headers = Object.keys(data[0]);
      const lines = [headers.join(",")];
      for (const row of data) {
        lines.push(headers.map(h => {
          const val = String(row[h] ?? "");
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(","));
      }
      return lines.join("\n");
    }
    case "XML": {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
      for (const row of data) {
        xml += "  <item>\n";
        for (const [key, val] of Object.entries(row)) {
          const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
          xml += `    <${safeKey}>${escapeXml(String(val ?? ""))}</${safeKey}>\n`;
        }
        xml += "  </item>\n";
      }
      xml += "</root>";
      return xml;
    }
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
