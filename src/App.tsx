import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import * as htmlToImage from 'html-to-image';
import { starterCategories, starterElements } from './data';
import type { CanvasBackground, CanvasElement, DragState, EditorSnapshot, MarqueeState, ResizeState } from './types';

const STORAGE_KEY = 'menu-studio-state-v1';
const MIN_ELEMENT_SIZE = 28;
const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
] as const;

const MENU_TEMPLATE_PRESETS = [
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Bố cục gọn, sang, nhiều khoảng thở',
    accent: '#b45309',
    palette: ['#fff8f1', '#fef3e7', '#f3ede3', '#e8f1ef', '#fef7ea', '#f9f5ef'],
    layout: { left: 76, top: 250, gap: 28, columnWidth: 470, rowHeight: 220, columns: 2, itemCount: 4, itemOffset: 100, itemGap: 28 },
    hero: {
      title: 'MENU THANH LỊCH',
      subtitle: 'Thiết kế thoáng, tập trung vào món và giá',
      tag: 'CANVA STYLE / ELEGANT',
      sticker: '✨',
      titleColor: '#2f2417',
      subtitleColor: '#6c5a4e',
    },
  },
  {
    id: 'festival',
    label: 'Festival',
    description: 'Màu tươi, năng lượng cao, nổi bật',
    accent: '#dc2626',
    palette: ['#fff1f2', '#ffe4e6', '#ffedd5', '#fef9c3', '#dcfce7', '#dbeafe'],
    layout: { left: 56, top: 228, gap: 18, columnWidth: 344, rowHeight: 188, columns: 3, itemCount: 3, itemOffset: 94, itemGap: 28 },
    hero: {
      title: 'MENU SÔI ĐỘNG',
      subtitle: 'Tươi, rực và dễ kéo chú ý ngay từ đầu',
      tag: 'BEST SELLER / FESTIVE',
      sticker: '💫',
      titleColor: '#7f1d1d',
      subtitleColor: '#8f4d3f',
    },
  },
  {
    id: 'paper',
    label: 'Paper',
    description: 'Mềm, sạch, có cảm giác thủ công',
    accent: '#0f766e',
    palette: ['#f7faf7', '#eef7f2', '#f4efe7', '#edf3f7', '#fff8f0', '#f9f6f0'],
    layout: { left: 72, top: 246, gap: 26, columnWidth: 452, rowHeight: 216, columns: 2, itemCount: 4, itemOffset: 98, itemGap: 28 },
    hero: {
      title: 'MENU GIẤY THỦ CÔNG',
      subtitle: 'Nhẹ nhàng, sáng và có nhiều khoảng thở',
      tag: 'HANDMADE / CLEAN',
      sticker: '🌸',
      titleColor: '#154c47',
      subtitleColor: '#5a6c66',
    },
  },
  {
    id: 'sweet',
    label: 'Sweet',
    description: 'Trẻ trung, mềm, hợp đồ ngọt và trà',
    accent: '#db2777',
    palette: ['#fff1f8', '#ffe4ef', '#fce7f3', '#eef2ff', '#fefce8', '#ecfeff'],
    layout: { left: 58, top: 232, gap: 20, columnWidth: 338, rowHeight: 190, columns: 3, itemCount: 3, itemOffset: 94, itemGap: 28 },
    hero: {
      title: 'MENU NGỌT NGÀO',
      subtitle: 'Mềm mại, vui mắt và giàu cảm giác mùa vụ',
      tag: 'DESSERT / TEA BAR',
      sticker: '🍓',
      titleColor: '#9d174d',
      subtitleColor: '#7b6280',
    },
  },
] as const;

const TEXT_ELEMENT_TYPES = ['section', 'item', 'text'] as const;

const backgroundPresets = [
  {
    id: 'warm-grid',
    label: 'Giấy kẻ ấm',
    preview: {
      backgroundColor: '#fffaf3',
      backgroundImage:
        'linear-gradient(rgba(81, 57, 31, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(81, 57, 31, 0.08) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    },
    canvas: {
      backgroundColor: '#fffaf3',
      backgroundImage:
        'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), linear-gradient(rgba(81, 57, 31, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(81, 57, 31, 0.08) 1px, transparent 1px)',
      backgroundSize: 'auto, 28px 28px, 28px 28px',
    },
  },
  {
    id: 'paper-dots',
    label: 'Giấy chấm',
    preview: {
      backgroundColor: '#fff8f0',
      backgroundImage:
        'radial-gradient(circle at 10px 10px, rgba(216, 118, 42, 0.12) 0, rgba(216, 118, 42, 0.12) 2px, transparent 2px)',
      backgroundSize: '24px 24px',
    },
    canvas: {
      backgroundColor: '#fff8f0',
      backgroundImage:
        'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), radial-gradient(circle at 10px 10px, rgba(216, 118, 42, 0.12) 0, rgba(216, 118, 42, 0.12) 2px, transparent 2px)',
      backgroundSize: 'auto, 24px 24px',
    },
  },
  {
    id: 'mint-soft',
    label: 'Xanh mint',
    preview: {
      backgroundColor: '#f0fdf4',
      backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(250, 250, 250, 0))',
      backgroundSize: 'auto',
    },
    canvas: {
      backgroundColor: '#f0fdf4',
      backgroundImage:
        'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(250, 250, 250, 0)), linear-gradient(rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.34))',
      backgroundSize: 'auto',
    },
  },
  {
    id: 'peach-soft',
    label: 'Đào mềm',
    preview: {
      backgroundColor: '#fff1e6',
      backgroundImage: 'linear-gradient(135deg, rgba(244, 140, 98, 0.14), rgba(255, 255, 255, 0))',
      backgroundSize: 'auto',
    },
    canvas: {
      backgroundColor: '#fff1e6',
      backgroundImage:
        'linear-gradient(135deg, rgba(244, 140, 98, 0.14), rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3))',
      backgroundSize: 'auto',
    },
  },
] as const;

const defaultBackground: CanvasBackground = {
  presetId: 'warm-grid',
  imageUrl: null,
};

const PAPER_EXPORT_PRESETS = {
  A4: { width: 1240, height: 1754 },
  A3: { width: 1754, height: 2480 },
} as const;

type SectionPart = 'chip' | 'title' | 'subtitle';

const makeId = () => Math.random().toString(36).slice(2, 10);

function cloneElement(element: CanvasElement): CanvasElement {
  return { ...element, id: makeId() };
}

function snapshotElements(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((element) => ({ ...element }));
}

function isTextElement(element: CanvasElement): boolean {
  return TEXT_ELEMENT_TYPES.includes(element.type as (typeof TEXT_ELEMENT_TYPES)[number]);
}

function isLegacyShapeElement(element: { type: string }) {
  return element.type === 'square' || element.type === 'circle' || element.type === 'dynamic';
}

function sanitizeElements(elements: CanvasElement[]) {
  return elements.filter((element) => !isLegacyShapeElement(element));
}

function expandSelectionWithGroups(selectedIds: string[], elements: CanvasElement[]) {
  const expandedIds = new Set(selectedIds);

  selectedIds.forEach((id) => {
    const selectedElement = elements.find((element) => element.id === id);
    if (!selectedElement?.groupId) return;

    elements
      .filter((element) => element.groupId === selectedElement.groupId)
      .forEach((element) => expandedIds.add(element.id));
  });

  return [...expandedIds];
}

function getGroupMemberIds(groupId: string, elements: CanvasElement[]) {
  return elements.filter((element) => element.groupId === groupId).map((element) => element.id);
}

function getSectionPartLabel(part: SectionPart) {
  switch (part) {
    case 'chip':
      return 'Bộ Sưu Tập';
    case 'title':
      return 'Nhóm món mới';
    case 'subtitle':
      return 'Mô tả nhóm';
  }
}

function getSectionPartTextColor(element: CanvasElement, part: SectionPart) {
  if (part === 'chip') return element.chipTextColor ?? element.textColor ?? '#7c2d12';
  if (part === 'title') return element.titleTextColor ?? element.textColor ?? '#1f1b16';
  return element.subtitleTextColor ?? element.textColor ?? '#70665d';
}

function getSectionPartFontSize(element: CanvasElement, part: SectionPart) {
  if (part === 'chip') return element.chipFontSize ?? 12;
  if (part === 'title') return element.titleFontSize ?? 22;
  return element.subtitleFontSize ?? 14;
}

function getCanvasBounds(canvas: HTMLDivElement) {
  return {
    width: Math.max(canvas.scrollWidth, canvas.clientWidth),
    height: Math.max(canvas.scrollHeight, canvas.clientHeight),
  };
}

function buildMenuTemplate(presetId: (typeof MENU_TEMPLATE_PRESETS)[number]['id'] = 'editorial'): CanvasElement[] {
  const preset = MENU_TEMPLATE_PRESETS.find((entry) => entry.id === presetId) ?? MENU_TEMPLATE_PRESETS[0];
  const { left, top, gap, columnWidth, rowHeight, columns, itemCount, itemOffset = 94, itemGap = 26 } = preset.layout;
  const heroHeight = 116;
  const sectionStartY = top + heroHeight + 16;

  const decorativeLine: CanvasElement = {
    id: `${preset.id}-divider`,
    type: 'line',
    x: left,
    y: top + 92,
    width: 520,
    height: 4,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    stroke: preset.accent,
    strokeWidth: 4,
  };

  const heroTitle: CanvasElement = {
    id: `${preset.id}-hero-title`,
    type: 'text',
    x: left,
    y: top,
    width: 720,
    height: 64,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    text: preset.hero.title,
    fontSize: 38,
    accent: preset.accent,
    textColor: preset.hero.titleColor,
    fontFamily: 'Georgia, serif',
  };

  const heroSubtitle: CanvasElement = {
    id: `${preset.id}-hero-subtitle`,
    type: 'text',
    x: left,
    y: top + 56,
    width: 700,
    height: 40,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    text: `${preset.hero.subtitle} • ${preset.hero.tag}`,
    fontSize: 14,
    accent: preset.hero.subtitleColor,
    textColor: preset.hero.subtitleColor,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  };

  const heroSticker: CanvasElement = {
    id: `${preset.id}-hero-sticker`,
    type: 'sticker',
    x: left + 760,
    y: top - 2,
    width: 96,
    height: 96,
    rotation: -10,
    opacity: 1,
    zIndex: 3,
    emoji: preset.hero.sticker,
    fontSize: 52,
  };

  const sections = starterCategories.flatMap((category, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = left + col * (columnWidth + gap);
    const y = sectionStartY + row * (rowHeight + gap);
    const accent = preset.palette[index % preset.palette.length];
    const items = category.items.slice(0, itemCount);

    return [
      {
        id: `${category.id}-section`,
        type: 'section' as const,
        x,
        y,
        width: columnWidth,
        height: rowHeight,
        rotation: 0,
        opacity: 1,
        zIndex: 10 + index,
        title: category.title,
        subtitle: '',
        chipLabel: index % 2 === 0 ? 'BEST PICK' : 'MENU GỌN',
        chipFontSize: 12,
        chipTextColor: preset.accent,
        titleFontSize: preset.layout.columns === 2 ? 24 : 22,
        titleTextColor: '#201814',
        subtitleFontSize: 14,
        subtitleTextColor: '#70665d',
        accent,
      },
      ...items.map((item, itemIndex) => ({
        id: `${category.id}-item-${itemIndex}`,
        type: 'item' as const,
        x: x + 18,
        y: y + itemOffset + itemIndex * itemGap,
        width: columnWidth - 36,
        height: 24,
        rotation: 0,
        opacity: 1,
        zIndex: 30 + index * 10 + itemIndex,
        title: item.name,
        price: item.price,
      })),
    ];
  });

  return [heroTitle, heroSubtitle, decorativeLine, heroSticker, ...sections];
}

function loadInitialSnapshot(): EditorSnapshot {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as CanvasElement[] | EditorSnapshot;
      if (Array.isArray(parsed)) {
        return {
          elements: sanitizeElements(parsed),
          background: defaultBackground,
        };
      }

      return {
        elements: sanitizeElements(parsed.elements),
        background: parsed.background ?? defaultBackground,
      };
    } catch {
      // fall through to starter template
    }
  }
  return {
    elements: [...starterElements, ...buildMenuTemplate()],
    background: defaultBackground,
  };
}

export default function App() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const sectionBackgroundInputRef = useRef<HTMLInputElement | null>(null);
  const lastCanvasPointRef = useRef({ x: 140, y: 140 });
  const initialSnapshot = useMemo(() => loadInitialSnapshot(), []);
  const [templatePresetId, setTemplatePresetId] = useState<(typeof MENU_TEMPLATE_PRESETS)[number]['id']>('editorial');
  const [elements, setElements] = useState<CanvasElement[]>(initialSnapshot.elements);
  const [background, setBackground] = useState<CanvasBackground>(initialSnapshot.background);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSnapshot.elements[0] ? [initialSnapshot.elements[0].id] : []);
  const [selectedSectionPart, setSelectedSectionPart] = useState<SectionPart>('title');
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [marqueeState, setMarqueeState] = useState<MarqueeState | null>(null);
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [isLayerPopupOpen, setIsLayerPopupOpen] = useState(false);

  const exportCanvasAsPaper = async (paperSize: keyof typeof PAPER_EXPORT_PRESETS) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sourceBounds = getCanvasBounds(canvas);
    const targetBounds = PAPER_EXPORT_PRESETS[paperSize];
    const padding = 96;
    const contentWidth = targetBounds.width - padding * 2;
    const contentHeight = targetBounds.height - padding * 2;
    const scale = Math.min(contentWidth / sourceBounds.width, contentHeight / sourceBounds.height);

    const exportWrapper = document.createElement('div');
    exportWrapper.style.position = 'fixed';
    exportWrapper.style.left = '0';
    exportWrapper.style.top = '0';
    exportWrapper.style.width = `${targetBounds.width}px`;
    exportWrapper.style.height = `${targetBounds.height}px`;
    exportWrapper.style.padding = `${padding}px`;
    exportWrapper.style.boxSizing = 'border-box';
    exportWrapper.style.background = '#ffffff';
    exportWrapper.style.overflow = 'hidden';
    exportWrapper.style.pointerEvents = 'none';
    exportWrapper.style.zIndex = '-1';

    const clone = canvas.cloneNode(true) as HTMLDivElement;
    clone.style.position = 'relative';
    clone.style.width = `${sourceBounds.width}px`;
    clone.style.height = `${sourceBounds.height}px`;
    clone.style.transformOrigin = 'top left';
    clone.style.transform = `scale(${scale})`;
    clone.style.overflow = 'visible';

    exportWrapper.appendChild(clone);
    document.body.appendChild(exportWrapper);

    try {
      const dataUrl = await htmlToImage.toPng(exportWrapper, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `menu-${paperSize.toLowerCase()}.png`;
      link.click();
    } finally {
      exportWrapper.remove();
    }
  };

  const selectedElements = useMemo(
    () => elements.filter((element) => selectedIds.includes(element.id)),
    [elements, selectedIds],
  );

  const selectedElement = selectedElements[0] ?? null;
  const groupedSelection = selectedElements;
  const groupedSelectionGroupId = groupedSelection[0]?.groupId ?? null;
  const isUniformGroupedSelection =
    groupedSelection.length > 1 && Boolean(groupedSelectionGroupId) && groupedSelection.every((element) => element.groupId === groupedSelectionGroupId);
  const canGroupSelected = groupedSelection.length > 1 && !isUniformGroupedSelection;
  const canUngroupSelected = selectedElements.some((element) => element.groupId);

  const setSingleSelection = (elementId: string | null) => {
    setSelectedIds(elementId ? [elementId] : []);
  };

  const selectElementById = (elementId: string, additive = false, sectionPart?: SectionPart) => {
    const selectedTarget = elements.find((element) => element.id === elementId);
    const targetIds = selectedTarget?.groupId ? getGroupMemberIds(selectedTarget.groupId, elements) : [elementId];

    if (additive) {
      setSelectedIds((current) => {
        const currentSet = new Set(current);
        const allSelected = targetIds.every((id) => currentSet.has(id));

        if (allSelected) {
          targetIds.forEach((id) => currentSet.delete(id));
        } else {
          targetIds.forEach((id) => currentSet.add(id));
        }

        return [...currentSet];
      });
    } else {
      setSelectedIds(targetIds);
    }

    if (sectionPart) {
      setSelectedSectionPart(sectionPart);
    }
  };

  const selectAllElements = () => {
    setSelectedIds(elements.map((element) => element.id));
  };

  const rectFromPoints = (startX: number, startY: number, currentX: number, currentY: number) => {
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const right = Math.max(startX, currentX);
    const bottom = Math.max(startY, currentY);
    return { left, top, right, bottom };
  };

  const elementIntersectsRect = (element: CanvasElement, rect: { left: number; top: number; right: number; bottom: number }) => {
    const elementLeft = element.x;
    const elementTop = element.y;
    const elementRight = element.x + element.width;
    const elementBottom = element.y + element.height;
    return !(
      elementRight < rect.left ||
      elementLeft > rect.right ||
      elementBottom < rect.top ||
      elementTop > rect.bottom
    );
  };

  useEffect(() => {
    if (selectedElements.length !== 1 || selectedElement?.type !== 'section') {
      setSelectedSectionPart('title');
    }
  }, [selectedElement, selectedElements.length]);

  const captureSnapshot = () => ({
    elements: snapshotElements(elements),
    background: { ...background },
  });

  const commitHistory = () => {
    setHistory((current) => [...current, captureSnapshot()]);
  };

  const restoreSnapshot = (snapshot: EditorSnapshot) => {
    setElements(sanitizeElements(snapshotElements(snapshot.elements)));
    setBackground({ ...snapshot.background });
    setSelectedIds((currentSelectedIds) =>
      currentSelectedIds.filter((id) => snapshot.elements.some((element) => element.id === id)),
    );
  };

  const undoLastChange = () => {
    setHistory((current) => {
      if (!current.length) {
        return current;
      }

      const nextHistory = current.slice(0, -1);
      const previousSnapshot = current[current.length - 1];
      restoreSnapshot(previousSnapshot);
      return nextHistory;
    });
  };

  const canvasStyle = useMemo<CSSProperties>(() => {
    const preset = backgroundPresets.find((item) => item.id === background.presetId) ?? backgroundPresets[0];
    const imageLayer = background.imageUrl
      ? `linear-gradient(rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.34)), url(${background.imageUrl})`
      : preset.canvas.backgroundImage;

    return {
      backgroundColor: preset.canvas.backgroundColor,
      backgroundImage: imageLayer,
      backgroundSize: background.imageUrl ? 'cover' : preset.canvas.backgroundSize,
      backgroundPosition: background.imageUrl ? 'center' : '0 0',
      backgroundRepeat: background.imageUrl ? 'no-repeat' : 'repeat',
    };
  }, [background]);

  useEffect(() => {
    const snapshot: EditorSnapshot = { elements, background };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [background, elements]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!canvasRef.current) {
        return;
      }

      if (dragState) {
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        setElements((current) =>
          current.map((element) => {
            const initialPosition = dragState.initialPositions[element.id];
            if (!initialPosition) return element;
            return {
              ...element,
              x: Math.max(0, initialPosition.x + deltaX),
              y: Math.max(0, initialPosition.y + deltaY),
            };
          }),
        );
      }

      if (resizeState) {
        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;
        setElements((current) =>
          current.map((element) =>
            element.id === resizeState.id
              ? {
                  ...element,
                  width: Math.max(MIN_ELEMENT_SIZE, resizeState.startWidth + deltaX),
                  height: Math.max(MIN_ELEMENT_SIZE, resizeState.startHeight + deltaY),
                }
              : element,
          ),
        );
      }

      if (marqueeState) {
        setMarqueeState((current) =>
          current
            ? {
                ...current,
                currentX: event.clientX,
                currentY: event.clientY,
              }
            : current,
        );
      }
    };

    const handlePointerUp = () => {
      if (marqueeState) {
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        if (canvasBounds) {
          const marqueeRect = rectFromPoints(marqueeState.startX, marqueeState.startY, marqueeState.currentX, marqueeState.currentY);
          const canvasRelativeRect = {
            left: marqueeRect.left - canvasBounds.left,
            top: marqueeRect.top - canvasBounds.top,
            right: marqueeRect.right - canvasBounds.left,
            bottom: marqueeRect.bottom - canvasBounds.top,
          };
          const matchingIds = elements
            .filter((element) => elementIntersectsRect(element, canvasRelativeRect))
            .map((element) => element.id);
          setSelectedIds(matchingIds);
        }
      }

      setDragState(null);
      setResizeState(null);
      setMarqueeState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, elements, marqueeState, resizeState]);

  const addElement = (type: CanvasElement['type']) => {
    commitHistory();
    const base: CanvasElement = {
      id: makeId(),
      type,
      x: lastCanvasPointRef.current.x,
      y: lastCanvasPointRef.current.y,
      width: type === 'section' ? 300 : 180,
      height: type === 'section' ? 180 : 60,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      title: type === 'section' ? 'Nhóm món mới' : 'Món mới',
      subtitle: type === 'section' ? '' : undefined,
      chipLabel: type === 'section' ? 'Bộ Sưu Tập' : undefined,
      chipFontSize: type === 'section' ? 12 : undefined,
      chipTextColor: type === 'section' ? '#7c2d12' : undefined,
      titleFontSize: type === 'section' ? 22 : undefined,
      titleTextColor: type === 'section' ? '#1f1b16' : undefined,
      subtitleFontSize: type === 'section' ? 14 : undefined,
      subtitleTextColor: type === 'section' ? '#70665d' : undefined,
      price: type === 'item' ? '0k' : undefined,
      text: type === 'text' ? 'Nhập nội dung' : undefined,
      emoji: type === 'sticker' ? '🧁' : undefined,
      fontSize: type === 'text' ? 24 : type === 'sticker' ? 42 : undefined,
      accent: '#fff7ed',
    };

    setElements((current) => [...current, base]);
    setSingleSelection(base.id);
  };

  const duplicateSelected = () => {
    if (!selectedElements.length) return;
    commitHistory();
    const idsToDuplicate = expandSelectionWithGroups(selectedIds, elements);
    const elementsToDuplicate = elements.filter((element) => idsToDuplicate.includes(element.id));
    const groupRemap = new Map<string, string>();
    const copies = elementsToDuplicate.map((element, index) => {
      const copy = cloneElement(element);
      copy.x += 24 * (index + 1);
      copy.y += 24 * (index + 1);
      copy.zIndex = elements.length + index + 1;

      if (element.groupId) {
        const nextGroupId = groupRemap.get(element.groupId) ?? makeId();
        groupRemap.set(element.groupId, nextGroupId);
        copy.groupId = nextGroupId;
      } else {
        copy.groupId = null;
      }

      return copy;
    });
    setElements((current) => [...current, ...copies]);
    setSelectedIds(copies.map((element) => element.id));
  };

  const deleteSelected = () => {
    if (!selectedElements.length) return;
    commitHistory();
    const idsToDelete = expandSelectionWithGroups(selectedIds, elements);
    setElements((current) => current.filter((element) => !idsToDelete.includes(element.id)));
    setSelectedIds([]);
  };

  const groupSelected = () => {
    const groupableElements = selectedElements;
    if (groupableElements.length < 2) return;
    if (groupableElements.every((element) => element.groupId === groupableElements[0].groupId && element.groupId)) return;

    commitHistory();
    const groupId = makeId();
    setElements((current) =>
      current.map((element) =>
        groupableElements.some((selectedElement) => selectedElement.id === element.id)
          ? { ...element, groupId }
          : element,
      ),
    );
    setSelectedIds(groupableElements.map((element) => element.id));
  };

  const ungroupSelected = () => {
    if (!selectedElements.some((element) => element.groupId)) return;

    commitHistory();
    const idsToUngroup = new Set(expandSelectionWithGroups(selectedIds, elements));
    setElements((current) =>
      current.map((element) => (idsToUngroup.has(element.id) ? { ...element, groupId: null } : element)),
    );
  };

  const setSelectedField = <Key extends keyof CanvasElement>(key: Key, value: CanvasElement[Key]) => {
    if (!selectedElement) return;
    commitHistory();
    setElements((current) =>
      current.map((element) => (element.id === selectedElement.id ? { ...element, [key]: value } : element)),
    );
  };

  const setSelectedSectionPartField = <Key extends keyof CanvasElement>(
    part: SectionPart,
    key: Key,
    value: CanvasElement[Key],
  ) => {
    if (!selectedElement || selectedElement.type !== 'section') return;
    commitHistory();
    setElements((current) =>
      current.map((element) => {
        if (element.id !== selectedElement.id) return element;

        if (part === 'chip') {
          return {
            ...element,
            [key]: value,
          };
        }

        if (part === 'title') {
          return {
            ...element,
            [key]: value,
          };
        }

        return {
          ...element,
          [key]: value,
        };
      }),
    );
  };

  const moveSelected = (direction: 'front' | 'back') => {
    if (!selectedElements.length) return;
    commitHistory();
    setElements((current) => {
      const idsToMove = expandSelectionWithGroups(selectedIds, current);
      const moved = current.filter((element) => idsToMove.includes(element.id));
      const remaining = current.filter((element) => !idsToMove.includes(element.id));
      return direction === 'front' ? [...remaining, ...moved] : [...moved, ...remaining];
    });
  };

  const applyTextStyleToAll = (sourceElement: CanvasElement) => {
    if (!isTextElement(sourceElement)) return;
    commitHistory();
    setElements((current) =>
      current.map((element) =>
        isTextElement(element)
          ? {
              ...element,
              fontFamily: sourceElement.fontFamily ?? element.fontFamily,
              fontSize: sourceElement.fontSize ?? element.fontSize,
              textColor: sourceElement.textColor ?? sourceElement.accent ?? element.textColor,
            }
          : element,
      ),
    );
  };

  const updateBackground = (presetId: string) => {
    commitHistory();
    setBackground((current) => ({
      ...current,
      presetId,
      imageUrl: current.imageUrl,
    }));
  };

  const handleBackgroundUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    commitHistory();
    const url = URL.createObjectURL(file);
    setBackground((current) => ({
      ...current,
      imageUrl: url,
    }));
  };

  const clearBackgroundImage = () => {
    commitHistory();
    setBackground((current) => ({
      ...current,
      imageUrl: null,
    }));
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
    }
  };

  const handleImageUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    commitHistory();
    const url = URL.createObjectURL(file);
    const imageElement: CanvasElement = {
      id: makeId(),
      type: 'image',
      x: 860,
      y: 520,
      width: 250,
      height: 250,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      src: url,
      title: file.name,
    };
    setElements((current) => [...current, imageElement]);
    setSingleSelection(imageElement.id);
  };

  const addLineElement = () => {
    commitHistory();
    const lineElement: CanvasElement = {
      id: makeId(),
      type: 'line',
      x: lastCanvasPointRef.current.x,
      y: lastCanvasPointRef.current.y,
      width: 180,
      height: 4,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      stroke: '#d97706',
      strokeWidth: 4,
    };

    setElements((current) => [...current, lineElement]);
    setSingleSelection(lineElement.id);
  };

  const handleSectionBackgroundUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !selectedElement || selectedElement.type !== 'section') return;
    commitHistory();
    const url = URL.createObjectURL(file);
    setSelectedField('backgroundImage', url);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditingText = Boolean(
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable),
      );

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && !isEditingText) {
        event.preventDefault();
        selectAllElements();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isEditingText) {
        event.preventDefault();
        undoLastChange();
      }

      if (event.key === 'Delete' && !isEditingText && selectedElement) {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, selectedElement, undoLastChange]);

  const renderElement = (element: CanvasElement, index: number) => {
    const isSelected = selectedIds.includes(element.id);
    const commonStyle: CSSProperties = {
      transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
      width: element.width,
      height: element.height,
      opacity: element.opacity,
      zIndex: index + 1,
    };

    if (element.type === 'section') {
      commonStyle.backgroundImage = element.backgroundImage
        ? `linear-gradient(rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.62)), url(${element.backgroundImage})`
        : undefined;
      commonStyle.backgroundColor = element.accent ? `${element.accent}14` : '#ffffff';
      commonStyle.backgroundSize = element.backgroundImage ? 'cover' : undefined;
      commonStyle.backgroundPosition = element.backgroundImage ? 'center' : undefined;
      commonStyle.backgroundRepeat = element.backgroundImage ? 'no-repeat' : undefined;
    }

    return (
      <button
        key={element.id}
        type="button"
        className={`canvas-element canvas-element--${element.type} ${isSelected ? 'is-selected' : ''}`}
        style={commonStyle}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.ctrlKey || event.metaKey) {
            selectElementById(element.id, true, element.type === 'section' ? 'title' : undefined);
            return;
          }

          const isAlreadySelected = selectedIds.includes(element.id);
          const idsToDrag = expandSelectionWithGroups(isAlreadySelected ? selectedIds : [element.id], elements);
          commitHistory();
          if (idsToDrag.length === 1) {
            setSingleSelection(element.id);
          } else {
            setSelectedIds(idsToDrag);
          }
          if (element.type === 'section') {
            setSelectedSectionPart('title');
          }
          const bounds = canvasRef.current?.getBoundingClientRect();
          if (!bounds) return;
          const initialPositions = idsToDrag.reduce<Record<string, { x: number; y: number }>>((positions, id) => {
            const currentElement = elements.find((candidate) => candidate.id === id);
            if (currentElement) {
              positions[id] = { x: currentElement.x, y: currentElement.y };
            }
            return positions;
          }, {});
          setDragState({
            ids: idsToDrag,
            startX: event.clientX,
            startY: event.clientY,
            initialPositions,
          });
        }}
      >
        {element.type === 'section' ? (
          <>
            <span
              className={`section-chip ${isSelected && selectedSectionPart === 'chip' ? 'is-target-selected' : ''}`}
              style={{
                background: element.accent ?? '#fff',
                color: getSectionPartTextColor(element, 'chip'),
                fontSize: getSectionPartFontSize(element, 'chip'),
                fontFamily: element.fontFamily,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                selectElementById(element.id, event.ctrlKey || event.metaKey, 'chip');
              }}
            >
              {element.chipLabel ?? 'Bộ Sưu Tập'}
            </span>
            <h3
              className={isSelected && selectedSectionPart === 'title' ? 'is-target-selected' : ''}
              style={{
                color: getSectionPartTextColor(element, 'title'),
                fontFamily: element.fontFamily,
                fontSize: `${getSectionPartFontSize(element, 'title')}px`,
                cursor: 'text',
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                selectElementById(element.id, event.ctrlKey || event.metaKey, 'title');
              }}
            >
              {element.title}
            </h3>
            {element.subtitle ? (
              <p
                className={isSelected && selectedSectionPart === 'subtitle' ? 'is-target-selected' : ''}
                style={{
                  color: getSectionPartTextColor(element, 'subtitle'),
                  fontFamily: element.fontFamily,
                  fontSize: `${getSectionPartFontSize(element, 'subtitle')}px`,
                  cursor: 'text',
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  selectElementById(element.id, event.ctrlKey || event.metaKey, 'subtitle');
                }}
              >
                {element.subtitle}
              </p>
            ) : null}
          </>
        ) : null}

        {element.type === 'item' ? (
          <div className="menu-item" style={{ color: element.textColor ?? '#2d241b', fontFamily: element.fontFamily }}>
            <span style={{ fontSize: element.fontSize ? `${element.fontSize}px` : undefined }}>{element.title}</span>
            <strong style={{ color: element.textColor ?? '#9a4f00' }}>{element.price ?? '---'}</strong>
          </div>
        ) : null}

        {element.type === 'sticker' ? <div className="sticker">{element.emoji ?? '✨'}</div> : null}

        {element.type === 'text' ? (
          <div
            className="text-block"
            style={{
              color: element.textColor ?? element.accent ?? '#222',
              fontSize: element.fontSize ?? 24,
              fontFamily: element.fontFamily,
            }}
          >
            {element.text}
          </div>
        ) : null}

        {element.type === 'image' ? (
          <img className="image-fill" src={element.src} alt={element.title ?? 'uploaded'} draggable={false} />
        ) : null}

        {element.type === 'line' ? (
          <div
            className="shape-line"
            style={{
              background: element.stroke ?? element.fill ?? '#d97706',
              height: element.strokeWidth ?? 4,
            }}
          />
        ) : null}

        {isSelected ? (
          <span
            className="resize-handle resize-handle--se"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              commitHistory();
              setResizeState({
                id: element.id,
                startX: event.clientX,
                startY: event.clientY,
                startWidth: element.width,
                startHeight: element.height,
              });
            }}
          />
        ) : null}
      </button>
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>Menu Studio</strong>
            <span>Kéo thả, đổi nền, chỉnh từng phần tử</span>
          </div>
        </div>

        <section className="panel">
          <h2>1. Chọn nền</h2>
          <p>Chọn mẫu có sẵn hoặc tải ảnh nền riêng.</p>
          <div className="background-grid">
            {backgroundPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`background-tile ${background.presetId === preset.id ? 'is-selected' : ''}`}
                onClick={() => updateBackground(preset.id)}
              >
                <span className="background-preview" style={preset.preview} />
                <strong>{preset.label}</strong>
              </button>
            ))}
          </div>
          <div className="stack">
            <button onClick={() => backgroundInputRef.current?.click()}>Upload ảnh nền</button>
            <button onClick={clearBackgroundImage} disabled={!background.imageUrl}>
              Bỏ ảnh nền
            </button>
          </div>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => handleBackgroundUpload(event.target.files)}
          />
        </section>

        <section className="panel">
          <h2>3. Xuất ảnh</h2>
          <p>Tải nội dung canvas ra file PNG theo khổ giấy A4 hoặc A3.</p>
          <div className="stack">
            <button type="button" onClick={() => exportCanvasAsPaper('A4')}>
              Xuất A4
            </button>
            <button type="button" onClick={() => exportCanvasAsPaper('A3')}>
              Xuất A3
            </button>
          </div>
        </section>

      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div className="toolbar-hero">
            <div>
              <h1>Thiết kế menu món ăn</h1>
              <p>Kéo thả, thay nền, chỉnh kích thước và sắp xếp lớp như một bản layout nhỏ.</p>
            </div>
          </div>
          <div className="toolbar-ribbon">
            <section className="toolbar-group">
              <strong>Thiết kế</strong>
              <div className="toolbar-chip-grid toolbar-chip-grid--single-line">
                <button onClick={() => addElement('section')}>Nhóm</button>
                <button onClick={() => addElement('item')}>Món</button>
                <button onClick={() => addElement('text')}>Nội dung</button>
                <button onClick={() => addElement('sticker')}>Sticker</button>
                <button onClick={() => addLineElement()}>Đường kẻ</button>
                <button onClick={() => fileInputRef.current?.click()}>Tải ảnh lên</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => handleImageUpload(event.target.files)}
              />
            </section>

            <section className="toolbar-group">
              <strong>Mẫu</strong>
              <select value={templatePresetId} onChange={(event) => setTemplatePresetId(event.target.value as (typeof MENU_TEMPLATE_PRESETS)[number]['id'])}>
                {MENU_TEMPLATE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <button
                className="toolbar-primary"
                onClick={() => {
                  commitHistory();
                  setElements([...starterElements, ...buildMenuTemplate(templatePresetId)]);
                  setSingleSelection(starterElements[0]?.id ?? null);
                }}
              >
                Nạp mẫu
              </button>
            </section>

            <section className="toolbar-group toolbar-group--layers">
              <strong>Lớp</strong>
              <button type="button" onClick={() => setIsLayerPopupOpen(true)}>
                Mở bảng lớp
              </button>
            </section>
          </div>
          <div className="toolbar-actions toolbar-actions--header">
            <button onClick={undoLastChange} disabled={!history.length}>
              Back lại
            </button>
            <button onClick={() => moveSelected('back')} disabled={!selectedElement}>
              Đưa xuống
            </button>
            <button onClick={() => moveSelected('front')} disabled={!selectedElement}>
              Đưa lên
            </button>
            <button onClick={groupSelected} disabled={!canGroupSelected}>
              Group
            </button>
            <button onClick={ungroupSelected} disabled={!canUngroupSelected}>
              Ungroup
            </button>
            <button onClick={duplicateSelected} disabled={!selectedElement}>
              Nhân bản
            </button>
            <button onClick={deleteSelected} disabled={!selectedElement} className="danger">
              Xóa
            </button>
          </div>
        </header>

        {isLayerPopupOpen ? (
          <div className="layer-popup-backdrop" onClick={() => setIsLayerPopupOpen(false)}>
            <div className="layer-popup" onClick={(event) => event.stopPropagation()}>
              <div className="layer-popup-header">
                <div>
                  <strong>Danh sách lớp</strong>
                  <span>Chọn phần tử để focus nhanh</span>
                </div>
                <button type="button" onClick={() => setIsLayerPopupOpen(false)}>
                  Đóng
                </button>
              </div>
              <div className="layer-list layer-list--popup">
                {[...elements]
                  .slice()
                  .reverse()
                  .map((element) => (
                    <button
                      key={element.id}
                      type="button"
                      className={`layer-row ${selectedIds.includes(element.id) ? 'is-selected' : ''}`}
                      onClick={() => {
                        selectElementById(element.id, false, element.type === 'section' ? 'title' : undefined);
                        setIsLayerPopupOpen(false);
                      }}
                    >
                      <span>{element.type}</span>
                      <strong>{element.title ?? element.text ?? element.emoji ?? 'Element'}</strong>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="canvas-frame">
          <div
            className="canvas"
            ref={canvasRef}
            style={canvasStyle}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const bounds = canvasRef.current?.getBoundingClientRect();
              if (bounds) {
                lastCanvasPointRef.current = {
                  x: Math.max(0, event.clientX - bounds.left),
                  y: Math.max(0, event.clientY - bounds.top),
                };
              }
              setSelectedIds([]);
              setMarqueeState({
                startX: event.clientX,
                startY: event.clientY,
                currentX: event.clientX,
                currentY: event.clientY,
              });
            }}
            onPointerMove={(event) => {
              const bounds = canvasRef.current?.getBoundingClientRect();
              if (!bounds) return;
              lastCanvasPointRef.current = {
                x: Math.max(0, event.clientX - bounds.left),
                y: Math.max(0, event.clientY - bounds.top),
              };
            }}
          >
            {marqueeState ? (
              <div
                className="marquee"
                style={{
                  left: `${Math.min(marqueeState.startX, marqueeState.currentX) - (canvasRef.current?.getBoundingClientRect().left ?? 0)}px`,
                  top: `${Math.min(marqueeState.startY, marqueeState.currentY) - (canvasRef.current?.getBoundingClientRect().top ?? 0)}px`,
                  width: `${Math.abs(marqueeState.currentX - marqueeState.startX)}px`,
                  height: `${Math.abs(marqueeState.currentY - marqueeState.startY)}px`,
                }}
              />
            ) : null}
            {elements.map(renderElement)}
          </div>
        </div>
      </main>

      <aside className="inspector">
        <section className="panel">
          <h2>2. Thuộc tính</h2>
          <p>Chọn một phần tử để sửa vị trí, kích thước và nội dung.</p>
          {selectedElement ? (
            <div className="form-grid">
              <label>
                Kiểu
                <input value={selectedElement.type} disabled />
              </label>
              <label>
                X
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(event) => setSelectedField('x', Number(event.target.value))}
                />
              </label>
              <label>
                Y
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(event) => setSelectedField('y', Number(event.target.value))}
                />
              </label>
              <label>
                Rộng
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(event) => setSelectedField('width', Number(event.target.value))}
                />
              </label>
              <label>
                Cao
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(event) => setSelectedField('height', Number(event.target.value))}
                />
              </label>
              <label>
                Độ xoay
                <input
                  type="number"
                  value={Math.round(selectedElement.rotation)}
                  onChange={(event) => setSelectedField('rotation', Number(event.target.value))}
                />
              </label>
              <label>
                Opacity
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(event) => setSelectedField('opacity', Number(event.target.value))}
                />
              </label>
              {selectedElement.type === 'section' ? (
                <>
                  <label className="wide">
                    Nhãn nhóm
                    <input
                      value={selectedElement.chipLabel ?? ''}
                      onChange={(event) => setSelectedField('chipLabel', event.target.value)}
                    />
                  </label>
                  <label className="wide">
                    Tiêu đề
                    <input
                      value={selectedElement.title ?? ''}
                      onChange={(event) => setSelectedField('title', event.target.value)}
                    />
                  </label>
                  <label className="wide">
                    Mô tả nhóm món
                    <textarea
                      rows={3}
                      value={selectedElement.subtitle ?? ''}
                      onChange={(event) => setSelectedField('subtitle', event.target.value)}
                      placeholder="Để trống nếu không cần hiển thị"
                    />
                  </label>
                </>
              ) : null}
              {selectedElement.type === 'item' ? (
                <>
                  <label className="wide">
                    Tên món
                    <input
                      value={selectedElement.title ?? ''}
                      onChange={(event) => setSelectedField('title', event.target.value)}
                    />
                  </label>
                  <label className="wide">
                    Giá
                    <input
                      value={selectedElement.price ?? ''}
                      onChange={(event) => setSelectedField('price', event.target.value)}
                    />
                  </label>
                </>
              ) : null}
              {isTextElement(selectedElement) && selectedElement.type !== 'section' ? (
                <>
                  <label>
                    Font chữ
                    <select
                      value={selectedElement.fontFamily ?? FONT_FAMILIES[0].value}
                      onChange={(event) => setSelectedField('fontFamily', event.target.value)}
                    >
                      {FONT_FAMILIES.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="wide">
                    Cỡ chữ
                    <input
                      type="number"
                      value={selectedElement.fontSize ?? 24}
                      onChange={(event) => setSelectedField('fontSize', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Màu chữ
                    <input
                      type="color"
                      value={selectedElement.textColor ?? selectedElement.accent ?? '#222222'}
                      onChange={(event) => setSelectedField('textColor', event.target.value)}
                    />
                  </label>
                </>
              ) : null}
              {selectedElement.type === 'text' ? (
                <label className="wide">
                  Nội dung
                  <textarea
                    rows={4}
                    value={selectedElement.text ?? ''}
                    onChange={(event) => setSelectedField('text', event.target.value)}
                  />
                </label>
              ) : null}
              {selectedElement.type === 'section' ? (
                <>
                  <div className="wide section-part-switcher">
                    {(['chip', 'title', 'subtitle'] as SectionPart[]).map((part) => (
                      <button
                        key={part}
                        type="button"
                        className={selectedSectionPart === part ? 'is-selected' : ''}
                        onClick={() => setSelectedSectionPart(part)}
                      >
                        {getSectionPartLabel(part)}
                      </button>
                    ))}
                  </div>
                  <label className="wide">
                    Nội dung hiển thị
                    {selectedSectionPart === 'chip' ? (
                      <input
                        value={selectedElement.chipLabel ?? ''}
                        onChange={(event) => setSelectedSectionPartField('chip', 'chipLabel', event.target.value)}
                      />
                    ) : null}
                    {selectedSectionPart === 'title' ? (
                      <input
                        value={selectedElement.title ?? ''}
                        onChange={(event) => setSelectedSectionPartField('title', 'title', event.target.value)}
                      />
                    ) : null}
                    {selectedSectionPart === 'subtitle' ? (
                      <textarea
                        rows={3}
                        value={selectedElement.subtitle ?? ''}
                        onChange={(event) => setSelectedSectionPartField('subtitle', 'subtitle', event.target.value)}
                      />
                    ) : null}
                  </label>
                  <label>
                    Cỡ chữ
                    <input
                      type="number"
                      value={getSectionPartFontSize(selectedElement, selectedSectionPart)}
                      onChange={(event) =>
                        setSelectedSectionPartField(selectedSectionPart, `${selectedSectionPart}FontSize` as keyof CanvasElement, Number(event.target.value))
                      }
                    />
                  </label>
                  <label>
                    Màu chữ
                    <input
                      type="color"
                      value={getSectionPartTextColor(selectedElement, selectedSectionPart)}
                      onChange={(event) =>
                        setSelectedSectionPartField(selectedSectionPart, `${selectedSectionPart}TextColor` as keyof CanvasElement, event.target.value)
                      }
                    />
                  </label>
                  <label className="wide">
                    Màu nhấn nhóm
                    <input
                      type="color"
                      value={selectedElement.accent ?? '#202020'}
                      onChange={(event) => setSelectedField('accent', event.target.value)}
                    />
                  </label>
                </>
              ) : null}
              {selectedElement.type === 'sticker' ? (
                <>
                  <label className="wide">
                    Emoji / Sticker
                    <input
                      value={selectedElement.emoji ?? ''}
                      onChange={(event) => setSelectedField('emoji', event.target.value)}
                    />
                  </label>
                  <label>
                    Cỡ
                    <input
                      type="number"
                      value={selectedElement.fontSize ?? 42}
                      onChange={(event) => setSelectedField('fontSize', Number(event.target.value))}
                    />
                  </label>
                </>
              ) : null}
              {selectedElement.type === 'image' ? (
                <label className="wide">
                  Nguồn ảnh
                  <input value={selectedElement.src ?? ''} onChange={(event) => setSelectedField('src', event.target.value)} />
                </label>
              ) : null}
              {selectedElement.type === 'section' ? (
                <>
                  <button className="wide" type="button" onClick={() => sectionBackgroundInputRef.current?.click()}>
                    Chọn ảnh nền nhóm
                  </button>
                  <input
                    ref={sectionBackgroundInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => handleSectionBackgroundUpload(event.target.files)}
                  />
                  <button
                    className="wide"
                    type="button"
                    onClick={() => setSelectedField('backgroundImage', null)}
                    disabled={!selectedElement.backgroundImage}
                  >
                    Bỏ ảnh nền nhóm
                  </button>
                </>
              ) : null}
              {isTextElement(selectedElement) ? (
                <button className="wide" type="button" onClick={() => applyTextStyleToAll(selectedElement)}>
                  Áp dụng cho tất cả
                </button>
              ) : null}
            </div>
          ) : (
            <p className="empty-state">Chọn một phần tử để chỉnh thuộc tính, rồi dùng nút đưa lên/xuống để đổi lớp.</p>
          )}
        </section>
      </aside>
    </div>
  );
}