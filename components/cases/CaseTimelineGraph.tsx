import React from 'react';
import { TimelineEvent } from '../../types';

interface SvgTrack {
    id: string;
    name: string;
    color: string;
    persons: string[];
    xPos: number;
}

interface SvgNode {
    id: string;
    cx: number;
    cy: number;
    color: string;
    event: TimelineEvent;
    trackId: string;
}

interface SvgLink {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
}
interface CaseTimelineGraphProps {
    svgTracks: SvgTrack[];
    svgNodes: SvgNode[];
    svgLinks: SvgLink[];
    svgWidth: number;
    svgHeight: number;
    minDateEpoch: number;
    maxDateEpoch: number;
    SVG_PADDING_TOP_FOR_LABELS: number;
    SVG_PADDING_LEFT_FOR_AXIS: number;
    MIN_GRAPH_CONTENT_HEIGHT: number;
    NODE_RADIUS: number;
    handleTimelineEventClick: (event: TimelineEvent) => void;
    getTimelineEventColor: (event: TimelineEvent) => string; // Keep this if logic is complex, or pass color directly in SvgNode
    expandedTimelineEventId: string | null;
}

const CaseTimelineGraph: React.FC<CaseTimelineGraphProps> = ({
    svgTracks,
    svgNodes,
    svgLinks,
    svgWidth,
    svgHeight,
    minDateEpoch,
    maxDateEpoch,
    SVG_PADDING_TOP_FOR_LABELS,
    SVG_PADDING_LEFT_FOR_AXIS,
    MIN_GRAPH_CONTENT_HEIGHT,
    NODE_RADIUS,
    handleTimelineEventClick,
    getTimelineEventColor, // If node.color is already determined, this might not be needed here
    expandedTimelineEventId,
}) => {
    if (svgNodes.length === 0) {
        return <p className="text-theme-text-secondary text-sm text-center py-5">No hay eventos para mostrar en el gráfico.</p>;
    }
    
    const graphContentHeight = Math.max(MIN_GRAPH_CONTENT_HEIGHT, svgHeight - SVG_PADDING_TOP_FOR_LABELS - 50 /* SVG_PADDING_BOTTOM */);
    const numTicks = Math.max(2, Math.min(10, Math.floor(graphContentHeight / 50))); 
    const timeRange = maxDateEpoch - minDateEpoch;
    const tickIncrement = timeRange > 0 && numTicks > 0 ? timeRange / numTicks : 0;

    const ticks = Array.from({ length: numTicks + 1 }, (_, i) => {
        const tickDateEpoch = minDateEpoch + i * tickIncrement;
        const tickDate = new Date(tickDateEpoch);
        const yPos = SVG_PADDING_TOP_FOR_LABELS + (graphContentHeight * (i / numTicks));
        return { date: tickDate, y: yPos };
    });

    const expandedEventDescription = expandedTimelineEventId 
        ? svgNodes.find(n => n.event.id === expandedTimelineEventId)?.event?.description 
        : null;
    const expandedEventTitle = expandedTimelineEventId
        ? svgNodes.find(n => n.event.id === expandedTimelineEventId)?.event?.title
        : null;

    return (
        <div className="overflow-x-auto w-full bg-theme-bg-primary rounded-md">
        <svg width={svgWidth} height={svgHeight} aria-labelledby="timelineGraphTitle" role="img">
            <title id="timelineGraphTitle">Gráfico del historial del caso</title>
            <defs>
                <marker id="arrowhead-v" markerWidth="7" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#555" />
                </marker>
            </defs>
            
            {svgTracks.map(track => (
                <g key={`track-group-${track.id}`}>
                    <text x={track.xPos} y={SVG_PADDING_TOP_FOR_LABELS / 2} fontSize="10" fill="var(--color-text-secondary)" textAnchor="middle" dominantBaseline="middle">
                        {track.name}
                    </text>
                </g>
            ))}

            {svgLinks.map(link => (
                <line key={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke={link.stroke} strokeWidth="1.5" markerEnd={link.y1 === link.y2 && link.x1 !== link.x2 ? "" : "url(#arrowhead-v)"} />
            ))}

            {svgNodes.map(node => (
                <g key={node.id} transform={`translate(${node.cx}, ${node.cy})`} 
                    onClick={() => handleTimelineEventClick(node.event)}
                    className="cursor-pointer group"
                    role="button"
                    aria-label={`Evento: ${node.event.title} - ${new Date(node.event.date).toLocaleDateString()}`}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTimelineEventClick(node.event);}}
                >
                    <circle r={NODE_RADIUS} fill={node.color} stroke="var(--color-bg-card)" strokeWidth="1.5" />
                    <title>{`${node.event.title} (${node.event.type})\n${new Date(node.event.date).toLocaleString('es-ES')}${node.event.description ? '\n' + node.event.description.substring(0,100)+'...' : ''}`}</title>
                </g>
            ))}
            
            {ticks.map((tick, index) => (
                 <g key={`tick-${index}`} transform={`translate(${SVG_PADDING_LEFT_FOR_AXIS -10}, ${tick.y})`}>
                    <line x1="5" x2="-5" stroke="var(--color-text-secondary)" strokeWidth="0.5"></line>
                    <text x="-10" textAnchor="end" dominantBaseline="middle" fontSize="9" fill="var(--color-text-secondary)">
                        {tick.date.toLocaleDateString('es-ES', { month: 'short', day:'numeric' })}
                    </text>
                </g>
            ))}
        </svg>
        {expandedTimelineEventId && expandedEventDescription && (
             <div className="mt-2 p-3 bg-theme-bg-secondary rounded text-sm text-theme-text-primary">
                <strong>Detalle del Evento: {expandedEventTitle}</strong>
                <p className="whitespace-pre-wrap">{expandedEventDescription}</p>
             </div>
        )}
        </div>
    );
};
export default CaseTimelineGraph;