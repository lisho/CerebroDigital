/**
 * @file GoJSTimelineDiagram.tsx
 * @description Este componente renderiza una línea de tiempo vertical de eventos utilizando GoJS.
 * Está diseñado para mostrar una secuencia cronológica de notas, tareas, citas u otros eventos
 * relevantes para un caso, ordenados por fecha.
 */
import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';

/**
 * @interface GoJSEventNodeData
 * @description Define la estructura de datos para cada nodo de evento en la línea de tiempo.
 * Extiende go.ObjectData para compatibilidad con GoJS.
 */
export interface GoJSEventNodeData extends go.ObjectData {
  /** @property {string} key - Identificador único para el evento. Esencial para GoJS. */
  key: string; 
  /** @property {string} date - Fecha del evento en formato ISO string (ej. "2023-10-26T10:00:00Z"). Usada para ordenar los eventos. */
  date: string; 
  /** @property {string} text - Texto descriptivo principal del evento. */
  text: string; 
  /** @property {'Note' | 'Task' | 'Appointment' | 'Other'} eventType - Tipo de evento, usado para diferenciar visualmente los nodos (color). */
  eventType: 'Note' | 'Task' | 'Appointment' | 'Other'; 
  /** @property {{ [key: string]: any }} [details] - Objeto para almacenar datos adicionales o el objeto original del cual se transformó este evento (ej. la nota completa, la tarea completa). */
  details?: { [key: string]: any };
}

/**
 * @interface GoJSTimelineDiagramProps
 * @description Props para el componente GoJSTimelineDiagram.
 */
interface GoJSTimelineDiagramProps {
  /** @property {Array<GoJSEventNodeData>} eventDataArray - Array de objetos que representan los eventos a mostrar en la línea de tiempo. */
  eventDataArray: Array<GoJSEventNodeData>; 
}

/**
 * @component GoJSTimelineDiagram
 * @description Componente funcional de React que renderiza un diagrama de GoJS como una línea de tiempo vertical.
 * Utiliza `GridLayout` para organizar los eventos en una sola columna y los ordena por fecha.
 * @param {GoJSTimelineDiagramProps} props - Las propiedades del componente.
 */
const GoJSTimelineDiagram: React.FC<GoJSTimelineDiagramProps> = ({ eventDataArray }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramInstance = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (!diagramRef.current) return;

    const $ = go.GraphObject.make;

    // Limpiar instancia anterior si existe para evitar errores de GoJS en HMR o rerenders.
    if (diagramInstance.current) {
        diagramInstance.current.div = null;
    }

    diagramInstance.current = $(go.Diagram, diagramRef.current, {
      initialContentAlignment: go.Spot.Center, // Centra el contenido al inicio.
      'undoManager.isEnabled': true, // Permite deshacer/rehacer.
      // Configuración del Layout: GridLayout para una lista vertical.
      layout: $(go.GridLayout, {
        wrappingColumn: 1, // Asegura que todos los nodos estén en una sola columna.
        alignment: go.GridLayout.Position, // Usa la posición de los nodos si se especifica (aunque aquí el sorting es primario).
        sorting: go.GridLayout.Ascending, // Ordena los nodos de forma ascendente.
        // Comparador personalizado para ordenar los nodos basado en la propiedad 'date'.
        comparer: (partA: go.Part, partB: go.Part) => { 
          const dateA = new Date(partA.data.date).getTime();
          const dateB = new Date(partB.data.date).getTime();
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;
          return 0;
        }
      }),
      // Modelo de datos: GraphLinksModel es flexible, aunque para una línea de tiempo simple
      // sin enlaces explícitos entre eventos, un Model simple también podría funcionar.
      // GraphLinksModel se usa por consistencia o si se prevén enlaces futuros.
      model: $(go.GraphLinksModel, {
        // linkKeyProperty: 'key' // Necesario si se definieran enlaces explícitos.
      })
    });

    // Plantilla de Nodo para los eventos de la línea de tiempo:
    diagramInstance.current.nodeTemplate =
      $(go.Node, "Spot", // "Spot" permite un control más fino de la posición de los elementos dentro del nodo.
        { 
          selectionObjectName: "PANEL", // Define el objeto que muestra la selección.
          margin: new go.Margin(5, 10), // Margen alrededor de cada nodo.
          width: 300, // Ancho fijo para todos los elementos de la línea de tiempo.
        },
        // Binding de la localización, útil si se permite mover nodos o se guardan/restauran posiciones.
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), 
        $(go.Panel, "Auto", { name: "PANEL" }, // Panel principal que se ajusta al contenido.
          $(go.Shape, "RoundedRectangle", // Forma base del nodo.
            { 
              strokeWidth: 1.5, 
              stroke: "#555", // Color del borde.
              parameter1: 10, // Radio de las esquinas redondeadas.
            },
            // Binding del color de relleno basado en la propiedad 'eventType' de los datos del nodo.
            new go.Binding("fill", "eventType", (type: string) => {
              switch (type) {
                case 'Note': return "#FFFACD"; // Amarillo claro para Notas
                case 'Task': return "#ADD8E6"; // Azul claro para Tareas
                case 'Appointment': return "#90EE90"; // Verde claro para Citas
                default: return "#E0E0E0"; // Gris claro para Otros
              }
            })
          ),
          // Panel vertical para organizar los TextBlocks (fecha, tipo, descripción).
          $(go.Panel, "Vertical", { padding: 10 }, 
            $(go.TextBlock, // TextBlock para la fecha del evento.
              { 
                font: "bold 10pt sans-serif", 
                stroke: "#333",
                alignment: go.Spot.Left, // Alineación a la izquierda.
                margin: new go.Margin(0, 0, 4, 0) // Margen inferior.
              },
              // Formatea la fecha para visualización.
              new go.Binding("text", "date", (d: string) => new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }))
            ),
            $(go.TextBlock, // TextBlock para el tipo de evento.
              { 
                font: "italic 9pt sans-serif", 
                stroke: "#555",
                alignment: go.Spot.Left,
                margin: new go.Margin(0, 0, 6, 0)
              },
              // Mapea el valor de eventType a un texto más descriptivo.
              new go.Binding("text", "eventType", (type: string) => {
                const typeMap: Record<string, string> = {
                    'Note': 'Nota Registrada',
                    'Task': 'Tarea',
                    'Appointment': 'Cita/Evento',
                    'Other': 'Otro Evento'
                };
                return typeMap[type] || 'Evento';
              })
            ),
            $(go.TextBlock, // TextBlock para la descripción principal del evento.
              { 
                font: "9pt sans-serif", 
                stroke: "#333",
                wrap: go.TextBlock.WrapFit, // Permite que el texto se ajuste dentro del ancho disponible.
                alignment: go.Spot.Left,
                maxLines: 3, // Limita el número de líneas a mostrar.
                overflow: go.TextBlock.OverflowEllipsis, // Añade "..." si el texto excede maxLines.
              },
              new go.Binding("text", "text")
            )
          )
        )
      );
    
    // Limpieza al desmontar el componente.
    return () => {
      if (diagramInstance.current) {
        diagramInstance.current.div = null; 
        diagramInstance.current = null;
      }
    };
  }, []); // Array de dependencias vacío: este efecto se ejecuta solo al montar y desmontar.

   // Efecto para actualizar los datos en el modelo del diagrama cuando 'eventDataArray' cambia.
   useEffect(() => {
    if (diagramInstance.current && diagramInstance.current.model) {
      // Es buena práctica usar transacciones para operaciones que modifican el modelo,
      // aunque para una simple asignación de nodeDataArray puede no ser estrictamente necesario.
      diagramInstance.current.model.startTransaction("update timeline events");
      diagramInstance.current.model.nodeDataArray = eventDataArray;
      diagramInstance.current.model.commitTransaction("update timeline events");
    }
  }, [eventDataArray]); // Se re-ejecuta si eventDataArray cambia.


  return (
    <div 
      ref={diagramRef} 
      style={{ width: '100%', height: '500px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}
      aria-label="Línea de tiempo del caso" // Para accesibilidad
    />
  );
};

export default GoJSTimelineDiagram;
