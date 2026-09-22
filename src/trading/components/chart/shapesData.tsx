import React from 'react';
import { DrawingPoint } from '../../stores/drawingStore';

// ─── Shape & Brush Tool Types ────────────────────────────────────────────────

export type ShapeCategory = 'brushes' | 'arrows' | 'shapes';

export interface ArrowSettings {
  arrowStartCap?: 'none' | 'arrow' | 'circle' | 'square';
  arrowEndCap?: 'none' | 'arrow' | 'circle' | 'square';
  arrowheadStart?: boolean;
  arrowheadEnd?: boolean;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  arrowSize?: number; // Size in px
  rotation?: number; // degrees, 0 to 360
  showLabel?: boolean;
  text?: string;
  color?: string;
  textColor?: string;
  textSize?: number;
}

export interface ShapeTool {
  id: string;
  nameAr: string;
  nameEn: string;
  tradingViewIdentifier: string;
  category: ShapeCategory;
  pointsCount: number; // 1, 2, 3, 4, or -1 for multi-point/freehand
  shortcut?: string;
  isFreehand?: boolean;
  isMultiPoint?: boolean;
  icon: React.FC<{ size?: number; className?: string }>;
}

export interface ShapeGroup {
  groupId: ShapeCategory;
  titleAr: string;
  titleEn: string;
  items: ShapeTool[];
}

// ─── Crisp SVG Icons Strictly Matching Reference Screenshot ─────────────────

// 1. Brush (فرشاة)
export const BrushIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path 
      d="M14.5 4.5C15.3 3.7 16.5 3.7 17.3 4.5C18.1 5.3 18.1 6.5 17.3 7.3L11 13.5L7.5 14L8 10.5L14.5 4.5Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M7.5 14C6.5 14.5 5 15.5 4 17C6.5 17 8 16 8.5 14.5" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// 2. Highlighter (لون مميز)
export const HighlighterIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path 
      d="M5 14.5L12 7.5L14.5 10L7.5 17L4 17.5L5 14.5Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinejoin="round" 
    />
    <path d="M12 7.5L13.5 6L16 8.5L14.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="3.5" y1="18.5" x2="8" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// 3. Arrow Marker (علامة سهم) - As highlighted in the reference screenshot
export const ArrowMarkerIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path 
      d="M6 14L14 6M14 6H8.5M14 6V11.5" 
      stroke="currentColor" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Contoured thick arrowhead border matching reference */}
    <path 
      d="M5 15L15 5M15 5H9M15 5V11" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity={0.5} 
    />
  </svg>
);

// 4. Arrow (سهم) - Diagonal line with two circle endpoints and arrowhead
export const ArrowIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="5" cy="15" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    <line x1="6.5" y1="13.5" x2="14.5" y2="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M11 5H15V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="15" cy="5" r="1.2" fill="currentColor" />
  </svg>
);

// 5. Arrow Up (سهم لأعلى) - Block upward arrow
export const ArrowUpIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path 
      d="M10 4L15 9H12V16H8V9H5L10 4Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinejoin="round" 
    />
  </svg>
);

// 6. Arrow Down (سهم لأسفل) - Block downward arrow
export const ArrowDownIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path 
      d="M10 16L5 11H8V4H12V11H15L10 16Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      strokeLinejoin="round" 
    />
  </svg>
);

// 7. Rectangle (مستطيل) - Square box with 4 corner vertices
export const RectangleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="4.5" y="4.5" width="11" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4.5" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
  </svg>
);

// 8. Rotated Rectangle (مستطيل مُدار) - Rotated box with corner nodes
export const RotatedRectangleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <g transform="rotate(25 10 10)">
      <rect x="4.5" y="5.5" width="11" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="5.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="5.5" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="14.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
    </g>
  </svg>
);

// 9. Path (مسار) - Multi-segment path with vertices and arrow
export const PathIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="4" cy="15" r="1.5" fill="currentColor" />
    <line x1="4" y1="15" x2="8" y2="10" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" />
    <line x1="8" y1="10" x2="12" y2="13" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <line x1="12" y1="13" x2="16" y2="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M13 5H17V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 10. Circle (دائرة) - Circle with center node and perimeter node
export const CircleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="10" cy="10" r="1.8" fill="currentColor" />
    <circle cx="16.5" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

// 11. Ellipse (قطع ناقص) - Ellipse with 4 perimeter nodes
export const EllipseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <ellipse cx="10" cy="10" rx="7.5" ry="4.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="2.5" cy="10" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="10" r="1.5" fill="currentColor" />
    <circle cx="10" cy="5.5" r="1.5" fill="currentColor" />
    <circle cx="10" cy="14.5" r="1.5" fill="currentColor" />
  </svg>
);

// 12. Polyline (خط متعدد) - Open polyline with vertices
export const PolylineIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="4" cy="14" r="1.5" fill="currentColor" />
    <line x1="4" y1="14" x2="8" y2="7" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="7" r="1.5" fill="currentColor" />
    <line x1="8" y1="7" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" />
    <line x1="13" y1="13" x2="16" y2="6" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="16" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

// 13. Triangle (مثلث) - 3 vertices with connecting lines
export const TriangleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <polygon points="10,4.5 16.5,15.5 3.5,15.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="10" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="3.5" cy="15.5" r="1.5" fill="currentColor" />
  </svg>
);

// 14. Arc (قوس) - Curved arc with 3 control nodes
export const ArcIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 15Q10 5 16 15" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <circle cx="4" cy="15" r="1.5" fill="currentColor" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="16" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

// 15. Curve (منحنى) - Smooth curve with 3 control points
export const CurveIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 14Q9 6 16 9" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <circle cx="4" cy="14" r="1.5" fill="currentColor" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    <circle cx="16" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

// 16. Double Curve (منحنى مزدوج) - S-shape double curve with 4 points
export const DoubleCurveIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 15C6 7 14 13 16 5" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <circle cx="4" cy="15" r="1.5" fill="currentColor" />
    <circle cx="7" cy="10" r="1.3" fill="currentColor" />
    <circle cx="13" cy="10" r="1.3" fill="currentColor" />
    <circle cx="16" cy="5" r="1.5" fill="currentColor" />
  </svg>
);

// ─── Shapes & Brushes Tool Definition Groups ─────────────────────────────────

export const SHAPES_GROUPS: ShapeGroup[] = [
  {
    groupId: 'brushes',
    titleAr: 'BRUSHES',
    titleEn: 'BRUSHES',
    items: [
      {
        id: 'brush',
        nameAr: 'فرشاة',
        nameEn: 'Brush',
        tradingViewIdentifier: 'LineToolBrush',
        category: 'brushes',
        pointsCount: -1,
        isFreehand: true,
        icon: BrushIcon,
      },
      {
        id: 'highlighter',
        nameAr: 'لون مميز',
        nameEn: 'Highlighter',
        tradingViewIdentifier: 'LineToolHighlighter',
        category: 'brushes',
        pointsCount: -1,
        isFreehand: true,
        icon: HighlighterIcon,
      },
    ],
  },
  {
    groupId: 'arrows',
    titleAr: 'أسهم',
    titleEn: 'ARROWS',
    items: [
      {
        id: 'arrowMarker',
        nameAr: 'علامة سهم',
        nameEn: 'Arrow Marker',
        tradingViewIdentifier: 'LineToolArrowMarker',
        category: 'arrows',
        pointsCount: 1,
        icon: ArrowMarkerIcon,
      },
      {
        id: 'arrow',
        nameAr: 'سهم',
        nameEn: 'Arrow',
        tradingViewIdentifier: 'LineToolArrow',
        category: 'arrows',
        pointsCount: 2,
        icon: ArrowIcon,
      },
      {
        id: 'arrowUp',
        nameAr: 'سهم لأعلى',
        nameEn: 'Arrow Up',
        tradingViewIdentifier: 'LineToolArrowUp',
        category: 'arrows',
        pointsCount: 1,
        icon: ArrowUpIcon,
      },
      {
        id: 'arrowDown',
        nameAr: 'سهم لأسفل',
        nameEn: 'Arrow Down',
        tradingViewIdentifier: 'LineToolArrowDown',
        category: 'arrows',
        pointsCount: 1,
        icon: ArrowDownIcon,
      },
    ],
  },
  {
    groupId: 'shapes',
    titleAr: 'أشكال',
    titleEn: 'SHAPES',
    items: [
      {
        id: 'rectangle',
        nameAr: 'مستطيل',
        nameEn: 'Rectangle',
        tradingViewIdentifier: 'LineToolRectangle',
        category: 'shapes',
        pointsCount: 2,
        shortcut: 'Alt + Shift + R',
        icon: RectangleIcon,
      },
      {
        id: 'rotatedRectangle',
        nameAr: 'مستطيل مُدار',
        nameEn: 'Rotated Rectangle',
        tradingViewIdentifier: 'LineToolRotatedRectangle',
        category: 'shapes',
        pointsCount: 3,
        icon: RotatedRectangleIcon,
      },
      {
        id: 'path',
        nameAr: 'مسار',
        nameEn: 'Path',
        tradingViewIdentifier: 'LineToolPath',
        category: 'shapes',
        pointsCount: -1,
        isMultiPoint: true,
        icon: PathIcon,
      },
      {
        id: 'circle',
        nameAr: 'دائرة',
        nameEn: 'Circle',
        tradingViewIdentifier: 'LineToolCircle',
        category: 'shapes',
        pointsCount: 2,
        icon: CircleIcon,
      },
      {
        id: 'ellipse',
        nameAr: 'قطع ناقص',
        nameEn: 'Ellipse',
        tradingViewIdentifier: 'LineToolEllipse',
        category: 'shapes',
        pointsCount: 2,
        icon: EllipseIcon,
      },
      {
        id: 'polyline',
        nameAr: 'خط متعدد',
        nameEn: 'Polyline',
        tradingViewIdentifier: 'LineToolPolyline',
        category: 'shapes',
        pointsCount: -1,
        isMultiPoint: true,
        icon: PolylineIcon,
      },
      {
        id: 'triangle',
        nameAr: 'مثلث',
        nameEn: 'Triangle',
        tradingViewIdentifier: 'LineToolTriangle',
        category: 'shapes',
        pointsCount: 3,
        icon: TriangleIcon,
      },
      {
        id: 'arc',
        nameAr: 'قوس',
        nameEn: 'Arc',
        tradingViewIdentifier: 'LineToolArc',
        category: 'shapes',
        pointsCount: 3,
        icon: ArcIcon,
      },
      {
        id: 'curve',
        nameAr: 'منحنى',
        nameEn: 'Curve',
        tradingViewIdentifier: 'LineToolBezierQuadro',
        category: 'shapes',
        pointsCount: 3,
        icon: CurveIcon,
      },
      {
        id: 'doubleCurve',
        nameAr: 'منحنى مزدوج',
        nameEn: 'Double Curve',
        tradingViewIdentifier: 'LineToolBezierCubic',
        category: 'shapes',
        pointsCount: 4,
        icon: DoubleCurveIcon,
      },
    ],
  },
];

// Helper to look up tool by ID
export const getShapeToolById = (id: string): ShapeTool | undefined => {
  for (const group of SHAPES_GROUPS) {
    const found = group.items.find(i => i.id === id);
    if (found) return found;
  }
  return undefined;
};

// ─── Path Smoothing & Interpolation Algorithms ──────────────────────────────

/**
 * Converts an array of 2D screen points into a smooth SVG Cubic Bézier path string (d="M ... C ...").
 * Uses Catmull-Rom to Cubic Bézier conversion to eliminate jagged/polygonal corners on hand-drawn paths.
 */
export const smoothPath = (pts: { x: number; y: number }[]): string => {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const tension = 0.5; // Catmull-Rom tension
    const cp1x = p1.x + (p2.x - p0.x) * (tension / 3);
    const cp1y = p1.y + (p2.y - p0.y) * (tension / 3);
    const cp2x = p2.x - (p3.x - p1.x) * (tension / 3);
    const cp2y = p2.y - (p3.y - p1.y) * (tension / 3);

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
};

/**
 * Simplifies a high-density trajectory of points using basic distance filtering
 * to keep store payload compact without losing visual precision.
 */
export const simplifyPoints = (pts: DrawingPoint[], minDistancePx: number = 3): DrawingPoint[] => {
  if (pts.length <= 2) return pts;
  const result: DrawingPoint[] = [pts[0]];

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = pts[i];
    const dt = Math.abs(curr.time - prev.time);
    const dp = Math.abs(curr.price - prev.price);

    // Filter points that are almost identical
    if (dt > 0 || dp > 0.0001) {
      result.push(curr);
    }
  }

  result.push(pts[pts.length - 1]);
  return result;
};
