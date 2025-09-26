import { EdgeView, Graph, ToolsView } from "@antv/x6";
import { render as renderVue, h } from "vue";
import EdgeButton from "@/views/lifecycle/components/edgeButton.vue";

interface routerPoint {
  x: number;
  y: number;
}

function distance(p1: routerPoint, p2: routerPoint) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateTotalLength(points: routerPoint[]) {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += distance(points[i], points[i + 1]);
  }
  return totalLength;
}

function findMidpointOnPolyline(points: routerPoint[]) {
  if (points.length < 2) {
    throw new Error("至少需要2个点");
  }

  // 计算总长度
  const totalLength = calculateTotalLength(points);
  const halfLength = totalLength / 2;

  // 遍历线段寻找中点所在的线段
  let accumulatedLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // 计算当前线段的长度
    const segmentLength = distance(p1, p2);

    // 如果中点在这个线段上
    if (accumulatedLength + segmentLength >= halfLength) {
      // 计算在这个线段上的剩余距离
      const remainingLength = halfLength - accumulatedLength;

      // 计算中点在线段上的位置比例
      const ratio = segmentLength === 0 ? 0 : remainingLength / segmentLength;

      // 计算中点坐标
      const midX = p1.x + ratio * (p2.x - p1.x);
      const midY = p1.y + ratio * (p2.y - p1.y);

      return { x: midX, y: midY };
    }

    accumulatedLength += segmentLength;
  }

  // 如果中点正好在最后一个点上
  return points[points.length - 1];
}

class TooltipTool extends ToolsView.ToolItem<EdgeView, TooltipToolOptions> {
  private knob!: HTMLDivElement;

  render() {
    // console.log(
    //   "new toolTip",
    //   this.cellView.container,
    //   this.cellView.container.getBoundingClientRect(),
    //   this.container,
    // );
    if (!this.knob) {
      //getPolyline
      this.knob = ToolsView.createElement("div", false) as HTMLDivElement;
      this.renderDom();
      // const { top, left, right } =
      //   this.cellView.container.getBoundingClientRect();
      const points: routerPoint[] = this.cellView.routePoints.map((i) => {
        return {
          x: i.x,
          y: i.y,
        };
      });
      points.push({
        x: this.cellView.path.end?.x || 0,
        y: this.cellView.path.end?.y || 0,
      });
      points.unshift({
        x: this.cellView.path.start?.x || 0,
        y: this.cellView.path.start?.y || 0,
      });
      // console.log(
      // this.cellView.path,
      // this.cellView.getConnectionPathData(),
      // this.cellView.getConnectionLength(),
      // findMidpointOnPolyline(points),
      // points,
      // this.cellView.graph.transform.getTranslation(),
      // "this.cellView.getPointAtRatio(), this.cellView.getPolyline()",
      // );
      const { x, y } = findMidpointOnPolyline(points);
      const { tx, ty } = this.cellView.graph.transform.getTranslation();
      // const graphContainer = document.querySelector(".containerRightContent")!;
      // const { left: graphLeft, top: graphTop } =
      //   graphContainer.getBoundingClientRect();
      this.knob.style.position = "absolute";
      this.knob.style.padding = "10px"; // 流出缓冲区域，避面popover直接消失
      this.knob.style.visibility = "hidden";
      this.container.appendChild(this.knob);
      setTimeout(() => {
        this.knob.style.visibility = "visible";
        this.knob.style.top =
          y - Math.floor(this.knob.offsetHeight / 2) + ty + "px";
        this.knob.style.left =
          x - Math.floor(this.knob.offsetWidth / 2) + tx + "px";
        // this.knob.style.top =
        //   top - graphTop - Math.floor(this.knob.offsetHeight / 2) + "px";
        // this.knob.style.left =
        //   Math.floor((left + right) / 2) -
        //   graphLeft -
        //   this.knob.offsetWidth / 2 +
        //   "px";
      }, 0);

      // console.log(this.knob);
    }
    return this;
  }

  private renderDom() {
    renderVue(
      h(EdgeButton, {
        appendTo: this.knob,
        cellView: this.cellView,
      }),
      this.knob,
    );
  }

  delegateEvents() {
    // console.log("delegateEvents", this.cellView);
    setTimeout(() => {
      this.renderDom();
    }, 2000);
    // this.cellView.on("cell:mouseenter", this.onMosueEnter, this);
    // this.cellView.on("cell:mouseleave", this.onMouseLeave, this);
    // this.cellView.on("cell:mousemove", this.onMouseMove, this);
    return super.delegateEvents();
  }

  protected onRemove() {
    // console.log("onRemove");
    // this.cellView.off("cell:mouseenter", this.onMosueEnter, this);
    // this.cellView.off("cell:mouseleave", this.onMouseLeave, this);
    // this.cellView.off("cell:mousemove", this.onMouseMove, this);
  }
}

TooltipTool.config({
  tagName: "div",
  isSVGElement: false,
});

export interface TooltipToolOptions extends ToolsView.ToolItem.Options {
  tooltip?: string;
}

Graph.registerEdgeTool("lifecycleEdgeTool", TooltipTool, true);
