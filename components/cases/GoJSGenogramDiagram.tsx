/**
 * @file GoJSGenogramDiagram.tsx
 * @description Este componente renderiza un diagrama de genograma familiar utilizando la biblioteca GoJS.
 * Está diseñado para visualizar las relaciones familiares (padres, cónyuges, hijos)
 * a partir de datos estructurados de un caso. El layout y la apariencia de los nodos
 * se configuran para representar un genograma estándar.
 */
import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';
import { Gender } from '../../types'; // Asegúrate que Gender esté en types.ts

/**
 * @interface GoJSNodeData
 * @description Define la estructura de datos para cada nodo (persona) en el genograma.
 * Extiende go.ObjectData para ser compatible con GoJS.
 */
export interface GoJSNodeData extends go.ObjectData {
  /** @property {string} key - Identificador único para la persona. Esencial para GoJS para identificar nodos. */
  key: string; 
  /** @property {string} name - Nombre completo de la persona a mostrar en el nodo. */
  name: string;
  /** @property {Gender} [gender] - Género de la persona, utilizado para determinar la forma y color del nodo. */
  gender?: Gender; 
  /** @property {Array<string>} [spouses] - Array de 'keys' (IDs) de los cónyuges de esta persona. Usado por GenogramLayout. */
  spouses?: Array<string>; 
  /** @property {Array<string>} [parents] - Array de 'keys' (IDs) de los padres de esta persona. Usado por GenogramLayout para estructurar la descendencia. */
  parents?: Array<string>; 
  /** @property {{ [key: string]: any }} [attributes] - Otros atributos personalizados que se quieran almacenar o mostrar. (No usado actualmente). */
  attributes?: { [key: string]: any }; 
}

/**
 * @interface GoJSLinkData
 * @description Define la estructura de datos para los enlaces (relaciones) entre nodos en el genograma.
 * Aunque GenogramLayout infiere muchas relaciones, esta interfaz permite definir enlaces explícitos.
 */
export interface GoJSLinkData extends go.ObjectData {
  /** @property {string} from - La 'key' del nodo origen del enlace. */
  from: string; 
  /** @property {string} to - La 'key' del nodo destino del enlace. */
  to: string;   
  /** @property {string} [category] - Categoría del enlace, permite usar diferentes plantillas de enlace (ej. "Marriage"). */
  category?: string; 
}

/**
 * @interface GoJSGenogramDiagramProps
 * @description Props para el componente GoJSGenogramDiagram.
 */
interface GoJSGenogramDiagramProps {
  /** @property {Array<GoJSNodeData>} nodeDataArray - Array de objetos que representan a las personas en el genograma. */
  nodeDataArray: Array<GoJSNodeData>;
  /** @property {Array<GoJSLinkData>} linkDataArray - Array de objetos que representan las relaciones explícitas. GenogramLayout puede inferir muchas, pero esto es útil para relaciones complejas o múltiples matrimonios. */
  linkDataArray: Array<GoJSLinkData>; 
}

/**
 * @component GoJSGenogramDiagram
 * @description Componente funcional de React que renderiza un diagrama de GoJS para representar un genograma.
 * Utiliza `GenogramLayout` para organizar automáticamente los nodos según las relaciones familiares.
 * @param {GoJSGenogramDiagramProps} props - Las propiedades del componente.
 */
const GoJSGenogramDiagram: React.FC<GoJSGenogramDiagramProps> = ({ nodeDataArray, linkDataArray }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramInstance = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (!diagramRef.current) return;

    const $ = go.GraphObject.make;

    // Si ya existe un diagrama en la instancia actual, lo limpiamos antes de recrearlo
    // Esto es importante para evitar errores de GoJS si el componente se rerenderiza (ej. por HMR en desarrollo)
    if (diagramInstance.current) {
        diagramInstance.current.div = null;
    }

    diagramInstance.current = $(go.Diagram, diagramRef.current, {
      initialContentAlignment: go.Spot.Center, // Centra el contenido del diagrama inicialmente
      'undoManager.isEnabled': true, // Habilita la funcionalidad de deshacer/rehacer
      // Configuración del layout específico para genogramas
      layout: $(go.GenogramLayout, {
        direction: 90, // Dirección del layout: 0 es hacia la derecha, 90 es hacia abajo.
        generationDistance: 100, // Distancia entre generaciones.
        layerSpacing: 100, // Distancia entre capas (generalmente hermanos).
        nodeSpacing: 50, // Distancia entre nodos adyacentes en la misma capa.
      }),
      model: $(go.GraphLinksModel, {
        linkKeyProperty: 'key', // Propiedad usada para identificar unívocamente los enlaces (si se usan explícitamente).
        // Propiedades clave para que GenogramLayout entienda las relaciones desde los datos del nodo:
        // 'nodeSpouseKeyProperty' indica qué propiedad en los datos de nodo contiene un array de keys de los cónyuges.
        nodeSpouseKeyProperty: "spouses",
        // 'nodeParentKeyProperty' indica qué propiedad en los datos de nodo contiene un array de keys de los padres.
        nodeParentKeyProperty: "parents"
        // linkFromPortIdProperty: "fromPort", // Descomentar si usas puertos específicos para enlaces
        // linkToPortIdProperty: "toPort",
      })
    });

    /**
     * @function setupNodeTemplate
     * @description Define la apariencia visual de un nodo (persona) en el genograma.
     * @param {Gender | undefined} gender - El género de la persona, para variaciones visuales.
     * @param {string} color - El color de relleno principal de la forma del nodo.
     * @param {string} figure - El nombre de la figura de GoJS a usar (ej. "Square", "Circle").
     * @returns {go.Node} Una plantilla de nodo de GoJS.
     */
    const setupNodeTemplate = (gender: Gender | undefined, color: string, figure: string) => {
      return $(go.Node, "Vertical", // Organiza los elementos del nodo verticalmente
        { locationSpot: go.Spot.Center, selectionObjectName: "SHAPE" }, // Centra el nodo y define el objeto de selección
        $(go.Panel, // Panel que contiene la forma principal
          { name: "SHAPE" }, // Nombrar el panel permite referenciarlo, ej. para bindings
          $(go.Shape, figure, // La figura geométrica (cuadrado, círculo)
            { width: 50, height: 50, fill: color, strokeWidth: 2, stroke: "black" },
            // Cambia el color al seleccionar el nodo, oscureciendo el color base.
            new go.Binding("fill", "isSelected", (isSelected: boolean) => isSelected ? go.Brush.darken(color) : color).ofObject("SHAPE")
          )
        ),
        $(go.TextBlock, // Texto para mostrar el nombre de la persona
          { textAlign: "center", margin: 5, font: "12px sans-serif", stroke: "black" },
          new go.Binding("text", "name")) // Vincula la propiedad 'text' del TextBlock a la propiedad 'name' de los datos del nodo.
      );
    };
    
    // Mapa de plantillas de nodo (nodeTemplateMap):
    // Permite usar diferentes plantillas para diferentes nodos basados en una propiedad de sus datos.
    // Aquí, se usa la propiedad 'gender' (que es una categoría implícita que GoJS puede usar si se configura nodeCategoryProperty en el modelo)
    // o, más comúnmente con nodeTemplateMap, se asigna explícitamente la plantilla al añadir el nodo si su 'category' o 'gender' coincide.
    // Para GenogramLayout, el género es un concepto primario y estas plantillas se aplican según los datos.
    const nodeTemplateMap = new go.Map<string, go.Part>();
    // Se añade una plantilla para cada valor del enum Gender.
    nodeTemplateMap.add(Gender.Male, setupNodeTemplate(Gender.Male, "lightblue", "Square")); // Hombres: cuadrado azul claro
    nodeTemplateMap.add(Gender.Female, setupNodeTemplate(Gender.Female, "lightpink", "Circle")); // Mujeres: círculo rosa claro
    nodeTemplateMap.add(Gender.Unknown, setupNodeTemplate(Gender.Unknown, "lightgray", "Rectangle")); // Género desconocido: rectángulo gris
    // Plantilla por defecto si el género no está especificado o no coincide con las keys anteriores.
    nodeTemplateMap.add("", setupNodeTemplate(undefined, "lightgray", "Rectangle")); 
    diagramInstance.current.nodeTemplateMap = nodeTemplateMap;
    
    // Plantilla de enlace por defecto:
    // Usada para cualquier enlace que no tenga una categoría específica o para los que GenogramLayout crea (ej. padres-hijos).
    diagramInstance.current.linkTemplate = $(go.Link,
        { routing: go.Link.Orthogonal, corner: 5, selectable: false }, // Enlaces ortogonales, no seleccionables.
        $(go.Shape, { strokeWidth: 2, stroke: "gray" }) // Forma simple del enlace.
    );
    
    // Plantilla específica para enlaces de categoría "Marriage":
    // Si en `linkDataArray` un enlace tiene `category: "Marriage"`, se usará esta plantilla.
    // GenogramLayout también crea enlaces de matrimonio, pero esto permite personalizarlos si se definen explícitamente.
     diagramInstance.current.linkTemplateMap.add("Marriage",
        $(go.Link,
          { selectable: false, layerName: "Background" }, // No seleccionable, dibujado detrás de los nodos.
          $(go.Shape, { strokeWidth: 2.5, stroke: "darkgreen" }) // Línea más gruesa y verde.
      ));


    // Limpieza al desmontar el componente:
    // Es crucial eliminar la referencia de GoJS al DIV para evitar problemas de memoria y errores.
    return () => {
      if (diagramInstance.current) {
        diagramInstance.current.div = null; 
        diagramInstance.current = null;
      }
    };
  }, []); // El array vacío de dependencias asegura que este useEffect se ejecute solo una vez (al montar y desmontar).

  // Efecto para actualizar el modelo del diagrama cuando las props (nodeDataArray, linkDataArray) cambian.
  useEffect(() => {
    if (diagramInstance.current) {
      // Inicia una transacción para mejorar el rendimiento de actualizaciones múltiples.
      diagramInstance.current.model.startTransaction("update genogram data");
      diagramInstance.current.model.nodeDataArray = nodeDataArray;
      // GenogramLayout usualmente no necesita linkDataArray explícito si las relaciones están en los nodos (spouses, parents).
      // Pero es útil para definir enlaces que el layout no puede inferir (ej. múltiples matrimonios no secuenciales, adopciones complejas, etc.)
      // o para personalizar la categoría de un enlace específico.
      (diagramInstance.current.model as go.GraphLinksModel).linkDataArray = linkDataArray; 
      diagramInstance.current.model.commitTransaction("update genogram data");
    }
  }, [nodeDataArray, linkDataArray]); // Se re-ejecuta si nodeDataArray o linkDataArray cambian.

  return (
    <div 
      ref={diagramRef} 
      style={{ width: '100%', height: '500px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}
      aria-label="Genograma familiar" // Para accesibilidad
    />
  );
};

export default GoJSGenogramDiagram;

// Nota recordatoria sobre la definición de Gender en types.ts (ya verificada en pasos anteriores)
// export enum Gender {
//   Male = "Male",
//   Female = "Female",
//   Other = "Other",
//   Unknown = "Unknown"
// }
