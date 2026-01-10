import { motion } from 'framer-motion';

export interface InfographicItem {
  label: string;
  desc: string;
}

export interface InfographicData {
  type: string;
  title: string;
  items: InfographicItem[];
}

// Parse infographic data from the code block content
export function parseInfographicData(code: string): InfographicData | null {
  const lines = code.trim().split('\n');
  if (lines.length === 0) return null;

  // First line should be: infographic <type>
  const firstLine = lines[0].trim();
  if (!firstLine.startsWith('infographic')) return null;

  const type = firstLine.replace('infographic', '').trim() || 'sequence-timeline-simple';

  let title = '';
  const items: InfographicItem[] = [];
  let currentItem: Partial<InfographicItem> | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and 'data' keyword
    if (!trimmed || trimmed === 'data') continue;

    // Parse title
    if (trimmed.startsWith('title ')) {
      title = trimmed.replace('title ', '').trim();
      continue;
    }

    // Skip 'items' keyword
    if (trimmed === 'items') continue;

    // Parse item label
    if (trimmed.startsWith('- label ')) {
      // Save previous item if exists
      if (currentItem && currentItem.label) {
        items.push({
          label: currentItem.label,
          desc: currentItem.desc || '',
        });
      }
      currentItem = {
        label: trimmed.replace('- label ', '').trim(),
      };
      continue;
    }

    // Parse item description
    if (trimmed.startsWith('desc ')) {
      if (currentItem) {
        currentItem.desc = trimmed.replace('desc ', '').trim();
      }
      continue;
    }
  }

  // Save last item
  if (currentItem && currentItem.label) {
    items.push({
      label: currentItem.label,
      desc: currentItem.desc || '',
    });
  }

  return { type, title, items };
}

// Color palette for timeline dots
const timelineColors = [
  'hsl(200, 90%, 60%)',  // blue
  'hsl(145, 70%, 50%)',  // green
  'hsl(280, 70%, 65%)',  // purple
  'hsl(340, 80%, 60%)',  // pink
  'hsl(35, 90%, 55%)',   // orange
  'hsl(180, 70%, 50%)',  // teal
];

interface InfographicRendererProps {
  data: InfographicData;
}

const InfographicRenderer = ({ data }: InfographicRendererProps) => {
  const { type, title, items } = data;

  // Render based on type
  if (type.includes('timeline') || type.includes('sequence')) {
    return <TimelineInfographic title={title} items={items} />;
  }

  // Default to timeline
  return <TimelineInfographic title={title} items={items} />;
};

// Timeline Infographic Component
const TimelineInfographic = ({ title, items }: { title: string; items: InfographicItem[] }) => {
  return (
    <div className="infographic-timeline">
      {title && (
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="infographic-title"
        >
          {title}
        </motion.h3>
      )}

      <div className="timeline-container">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="timeline-item"
          >
            {/* Step number */}
            <div className="timeline-step">
              <span className="step-label">STEP {index + 1}</span>
            </div>

            {/* Timeline dot and line */}
            <div className="timeline-dot-container">
              <div
                className="timeline-dot"
                style={{ backgroundColor: timelineColors[index % timelineColors.length] }}
              />
              {index < items.length - 1 && (
                <div
                  className="timeline-line"
                  style={{
                    background: `linear-gradient(to bottom, ${timelineColors[index % timelineColors.length]}, ${timelineColors[(index + 1) % timelineColors.length]})`
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="timeline-content">
              <h4 className="timeline-label">{item.label}</h4>
              {item.desc && <p className="timeline-desc">{item.desc}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InfographicRenderer;
