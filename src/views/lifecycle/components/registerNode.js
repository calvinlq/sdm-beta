import { Graph, Shape, Edge } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import BaseNode from "./baseNode.vue";

export const groups = {
  top: {
    position: "top",
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: "#5F95FF",
        strokeWidth: 1,
        fill: "#fff",
        style: {
          visibility: "hidden",
        },
      },
    },
  },
  right: {
    position: "right",
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: "#5F95FF",
        strokeWidth: 1,
        fill: "#fff",
        style: {
          visibility: "hidden",
        },
      },
    },
  },
  bottom: {
    position: "bottom",
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: "#5F95FF",
        strokeWidth: 1,
        fill: "#fff",
        style: {
          visibility: "hidden",
        },
      },
    },
  },
  left: {
    position: "left",
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: "#5F95FF",
        strokeWidth: 1,
        fill: "#fff",
        style: {
          visibility: "hidden",
        },
      },
    },
  },
  "ellipse-group": {
    position: "ellipse",
    args: {
      start: 45,
    },
    circle: {
      r: 4,
      magnet: true,
      stroke: "#5F95FF",
      strokeWidth: 1,
      fill: "#fff",
      style: {
        visibility: "hidden",
      },
    },
  },
};
const ports = {
  groups,
  items: [
    {
      group: "top",
    },
    {
      group: "left",
    },
    {
      group: "right",
    },
    {
      group: "bottom",
    },
  ],
};
register({
  shape: "lifecycle-base-node",
  width: 120,
  height: 36,
  component: BaseNode,
  // port默认不可见
  ports: ports,
});
