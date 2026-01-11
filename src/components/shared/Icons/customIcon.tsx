import React from 'react'
import { createLucideIcon } from "lucide-react";

export const FarmerFieldSchool = createLucideIcon("FarmerFieldSchool", [
  // Training board
  ["rect", { x: "4", y: "3", width: "16", height: "10", rx: "2", ry: "2", key: "board" }],
  ["line", { x1: "8", y1: "13", x2: "6", y2: "19", key: "leg1" }],
  ["line", { x1: "16", y1: "13", x2: "18", y2: "19", key: "leg2" }],

  // Field rows (horizontal lines)
  ["line", { x1: "2", y1: "21", x2: "22", y2: "21", key: "row1" }],
  ["line", { x1: "3", y1: "18", x2: "21", y2: "18", key: "row2" }],
  ["line", { x1: "4", y1: "15", x2: "20", y2: "15", key: "row3" }],

  // Plant in front
  ["line", { x1: "12", y1: "14", x2: "12", y2: "21", key: "stem" }],
  ["path", { d: "M10 17c-1.5 0-2.5-1-2-2 0.8-1.5 2-1 3 0", key: "leaf-left" }],
  ["path", { d: "M14 17c1.5 0 2.5-1 2-2-0.8-1.5-2-1-3 0", key: "leaf-right" }],

  // Optional farmer (circle head + line body)
  ["circle", { cx: "12", cy: "12", r: "1.5", key: "farmer-head" }],
  ["line", { x1: "12", y1: "13.5", x2: "12", y2: "14.5", key: "farmer-body" }],
]);



export const ProcurementIcon = createLucideIcon("ProcurementIcon", [
  // Document outline
  ["path", { d: "M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", key: "doc" }],
  
  // Document folded corner
  ["path", { d: "M14 2v6h6", key: "fold" }],
  
  // Rupee symbol (₹)
  ["path", { d: "M10 11h4", key: "r1" }],
  ["path", { d: "M10 8h4", key: "r2" }],
  ["path", { d: "M10 8c2 4 0 7 0 7h4", key: "r3" }],

  // Checkmark (for approval)
  ["path", { d: "M9 18l2 2l4 -4", key: "check" }],
]);


// Define a simple circle loader
export const Spinner = createLucideIcon("Spinner", [
  ["circle", { 
    cx: "12", cy: "12", r: "10", 
    stroke: "currentColor", 
    "stroke-width": "4", 
    fill: "none", 
    "stroke-dasharray": "31.4", 
    "stroke-dashoffset": "31.4", 
    "stroke-linecap": "round"
  }]
]);