import * as go from 'gojs';

// A custom layout that shows the two families related to a person's parents
export class GenogramLayout extends go.LayeredDigraphLayout {
  constructor(init?: Partial<GenogramLayout>) {
    super();
    this.initializeOption = go.LayeredDigraphInit.DepthFirstIn;
    this.spouseSpacing = 30;  // minimum space between spouses
    this.isRouting = false;
    // New properties with default values
    this.direction = 90; 
    this.generationDistance = 100; 
    this.layerSpacing = 100; 
    this.nodeSpacing = 50;
    if (init) Object.assign(this, init);
  }

  makeNetwork(coll: go.Diagram | go.Group | go.Iterable<go.Part>): go.LayeredDigraphNetwork {
    // generate LayoutEdges for each parent-child Link
    const net = this.createNetwork();
    if (coll instanceof go.Diagram) {
      this.add(net, coll.nodes, true);
      this.add(net, coll.links, true);
    } else if (coll instanceof go.Group) {
      this.add(net, coll.memberParts, false);
    } else if ((coll as go.Iterable<go.Part>).iterator) {
      this.add(net, (coll as go.Iterable<go.Part>).iterator, false);
    }
    return net;
  }

  // internal method for creating LayeredDigraphNetwork where husband/wife pairs are represented
  // by a single LayeredDigraphVertex corresponding to the label Node on the "Mate" Link
  add(net: go.LayeredDigraphNetwork, coll: go.Iterator<go.Part> | go.Iterable<go.Part>, nonmemberonly: boolean): void {
    const horiz = this.direction == 0.0 || this.direction == 180.0;
    const multiSpousePeople = new go.Set<go.Node>();
    // consider all Nodes in the given collection
    const it = coll.iterator;
    while (it.next()) {
      const node = it.value;
      if (!(node instanceof go.Node) || !node.data) continue;
      if (!node.isLayoutPositioned || !node.isVisible()) continue;
      if (nonmemberonly && node.containingGroup !== null) continue;
      // if it's an unmarried Node, or if it's a Link Label Node, create a LayoutVertex for it
      if (node.isLinkLabel) {
        // get "Mate" Link
        const link = node.labeledLink;
        if (link!.category === "Mate") {
          const spouseA = link!.fromNode;
          const spouseB = link!.toNode;
          // create vertex representing both husband and wife
          const vertex = net.addNode(node);
          // now define the vertex size to be big enough to hold both spouses
          if (horiz) {
            vertex.height = spouseA!.actualBounds.height + this.spouseSpacing + spouseB!.actualBounds.height;
            vertex.width = Math.max(spouseA!.actualBounds.width, spouseB!.actualBounds.width);
            vertex.focus = new go.Point(vertex.width / 2, spouseA!.actualBounds.height + this.spouseSpacing / 2);
          } else {
            vertex.width = spouseA!.actualBounds.width + this.spouseSpacing + spouseB!.actualBounds.width;
            vertex.height = Math.max(spouseA!.actualBounds.height, spouseB!.actualBounds.height);
            vertex.focus = new go.Point(spouseA!.actualBounds.width + this.spouseSpacing / 2, vertex.height / 2);
          }
        }
      } else {
        // don't add a vertex for any married person!
        // instead, code above adds label node for "Mate" link
        // assume a "Mate" Link has a label Node
        let mates = 0;
        node.linksConnected.each(l => {
          if (l.category === "Mate") mates++;
        });
        if (mates === 0) {
          net.addNode(node);
        } else if (mates > 1) {
          multiSpousePeople.add(node);
        }
      }
    }
    // now do all Links
    it.reset();
    while (it.next()) {
      const link = it.value;
      if (!(link instanceof go.Link)) continue;
      if (!link.isLayoutPositioned || !link.isVisible()) continue;
      if (nonmemberonly && link.containingGroup !== null) continue;
      // if it's a parent-child link, add a LayoutEdge for it
      if (link.category === "" && link.data) {
        const parent = net.findVertex(link.fromNode!);  // should be a label node
        const child = net.findVertex(link.toNode!);
        if (child !== null) {  // an unmarried child
          net.linkVertexes(parent!, child, link);
        } else {  // a married child
          link.toNode!.linksConnected.each(l => {
            if (l.category !== "Mate" || !l.data) return;  // if it has no label node, it's a parent-child link
            // found the Mate Link, now get its label Node
            const mlab = l.labelNodes.first();
            // parent-child link should connect with the label node,
            // so the LayoutEdge should connect with the LayoutVertex representing the label node
            const mlabvert = net.findVertex(mlab!);
            if (mlabvert !== null) {
              net.linkVertexes(parent!, mlabvert, link);
            }
          });
        }
      }
    }

    while (multiSpousePeople.count > 0) {
      // find all collections of people that are indirectly married to each other
      const node = multiSpousePeople.first();
      const cohort = new go.Set<go.Node>();
      this.extendCohort(cohort, node!);
      // then encourage them all to be the same generation by connecting them all with a common vertex
      const dummyvert = net.createVertex();
      net.addVertex(dummyvert);
      const mates = new go.Set<go.Link>();
      cohort.each(n => {
        n.linksConnected.each(l => {
          mates.add(l);
        })
      });
      mates.each(link => {
        // find the vertex for the "Mate" link (i.e. for the label node)
        const mlab = link.labelNodes.first()
        const v = net.findVertex(mlab!);
        if (v !== null) {
          net.linkVertexes(dummyvert, v, null);
        }
      });
      // done with these people, now see if there are any other multiple-married people
      multiSpousePeople.removeAll(cohort);
    }
  }

  // collect all of the people indirectly married with a person
  extendCohort(coll: go.Set<go.Node>, node: go.Node): void {
    if (coll.has(node)) return;
    coll.add(node);
    node.linksConnected.each(l => {
      if (l.category === "Mate") {  // if it's a "Mate" link, continue with both spouses
        this.extendCohort(coll, l.fromNode!);
        this.extendCohort(coll, l.toNode!);
      }
    });
  }

  assignLayers(): void {
    super.assignLayers();
    const horiz = this.direction == 0.0 || this.direction == 180.0;
    // for every vertex, record the maximum vertex width or height for the vertex's layer
    const maxsizes = [];
    this.network!.vertexes.each(v => {
      const lay = v.layer;
      let max = maxsizes[lay];
      if (max === undefined) max = 0;
      const sz = (horiz ? v.width : v.height);
      if (sz > max) maxsizes[lay] = sz;
    });
    // now make sure every vertex has the maximum width or height according to which layer it is in,
    // and aligned on the left (if horizontal) or the top (if vertical)
    this.network!.vertexes.each(v => {
      const lay = v.layer;
      const max = maxsizes[lay];
      if (horiz) {
        v.focus = new go.Point(0, v.height / 2);
        v.width = max;
      } else {
        v.focus = new go.Point(v.width / 2, 0);
        v.height = max;
      }
    });
    // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
    // (other than the ones that are the widest or tallest in their respective layer).
  }

  initializeIndices(): void {
    super.initializeIndices();
    const vertical = this.direction === 90 || this.direction === 270;
    this.network!.edges.each(e => {
      if (e.fromVertex.node && e.fromVertex.node.isLinkLabel) {
        e.portFromPos = vertical ? e.fromVertex.focusX : e.fromVertex.focusY;
      }
      if (e.toVertex.node && e.toVertex.node.isLinkLabel) {
        e.portToPos = vertical ? e.toVertex.focusX : e.toVertex.focusY;
      }
    });

    // Order the children so that twins/triplets are more likely to be together.
    // get all vertexes for each layer
    var layers: Array<Array<go.LayeredDigraphVertex>> = [];  // Array of Arrays of LayeredDigraphVertexes
    this.network!.vertexes.each(v => {
      var lay = v.layer;
      if (layers[lay] === undefined) {
        layers[lay] = [v];
      } else {
        layers[lay].push(v);
      }
    });
    // now sort them in each layer how you like
    layers.forEach(a => {
      a.sort((v, w) => {
        const vbirth = this.findMultipleBirth(v);
        const wbirth = this.findMultipleBirth(w);
        if (vbirth < wbirth) return -1;
        if (vbirth > wbirth) return 1;
        return 0;
      });
      a.forEach((v, i) => v.index = i);
    });
  }

  // get the birth order for a person; assume zero if there is no data.multiple property value
  findMultipleBirth(v: go.LayeredDigraphVertex): number {
    const node = v.node;
    if (node && node.data) {
      if (node.category === "MateLabel") {
        const link = node.labeledLink;
        if (link) {
          const fn = link.fromNode;
          if (fn && fn.data && fn.data.multiple !== undefined) return fn.data.multiple;
          const tn = link.toNode;
          if (tn && tn.data && tn.data.multiple !== undefined) return tn.data.multiple;
        }
      } else {
        if (node.data.multiple !== undefined) return node.data.multiple;
      }
    }
    return 0;
  }

  commitNodes(): void {
    super.commitNodes();
    // position regular nodes
    this.network!.vertexes.each(v => {
      if (v.node !== null && !v.node.isLinkLabel) {
        v.node.position = new go.Point(v.x, v.y);
      }
    });

    const horiz = this.direction == 0.0 || this.direction == 180.0;
    // position the spouses of each "Mate" vertex
    this.network!.vertexes.each(v => {
      if (v.node === null) return;
      if (!v.node.isLinkLabel) return;
      const labnode = v.node;
      const lablink = labnode.labeledLink;
      // In case the spouses are not actually moved, we need to have the "Mate" link
      // position the label node, because LayoutVertex.commit() was called above on these vertexes.
      // Alternatively we could override LayoutVetex.commit to be a no-op for label node vertexes.
      lablink!.invalidateRoute();
      let spouseA = lablink!.fromNode;
      let spouseB = lablink!.toNode;
      if (spouseA!.opacity > 0 && spouseB!.opacity > 0) {
        // prefer fathers on the left, mothers on the right
        if (spouseA!.data.sex === "F") {  // sex is female
          const temp = spouseA;
          spouseA = spouseB;
          spouseB = temp;
        }
        // see if the parents are on the desired sides, to avoid a link crossing
        const aParentsNode = this.findParentsMateLinkLabelNode(spouseA!);
        const bParentsNode = this.findParentsMateLinkLabelNode(spouseB!);
        if (aParentsNode !== null && bParentsNode !== null &&
          (horiz
            ? aParentsNode.position.x > bParentsNode.position.x
            : aParentsNode.position.y > bParentsNode.position.y)) {
          // swap the spouses
          const temp = spouseA;
          spouseA = spouseB;
          spouseB = temp;
        }
        spouseA!.moveTo(v.x, v.y);
        if (horiz) {
          spouseB!.moveTo(v.x, v.y + spouseA!.actualBounds.height + this.spouseSpacing);
        } else {
          spouseB!.moveTo(v.x + spouseA!.actualBounds.width + this.spouseSpacing, v.y);
        }
      } else if (spouseA!.opacity === 0) {
        const pos = horiz
          ? new go.Point(v.x, v.centerY - spouseB!.actualBounds.height / 2)
          : new go.Point(v.centerX - spouseB!.actualBounds.width / 2, v.y);
        spouseB!.move(pos);
        if (horiz) pos.y++; else pos.x++;
        spouseA!.move(pos);
      } else if (spouseB!.opacity === 0) {
        const pos = horiz
          ? new go.Point(v.x, v.centerY - spouseA!.actualBounds.height / 2)
          : new go.Point(v.centerX - spouseA!.actualBounds.width / 2, v.y);
        spouseA!.move(pos);
        if (horiz) pos.y++; else pos.x++;
        spouseB!.move(pos);
      }
    });
  }

  findParentsMateLinkLabelNode(node: go.Node): go.Node | null {
    const it = node.findNodesInto();
    while (it.next()) {
      const n = it.value;
      if (n.isLinkLabel) return n;
    }
    return null;
  }
}  // end GenogramLayout class