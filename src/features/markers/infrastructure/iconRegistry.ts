import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconType } from "react-icons";
import {
  FaBuilding,
  FaCamera,
  FaCircle,
  FaFlag,
  FaHeart,
  FaHouse,
  FaLocationDot,
  FaMoon,
  FaPaperPlane,
  FaRegSnowflake,
  FaShop,
  FaSquare,
  FaStar,
  FaSun,
  FaTree,
  FaXmark,
} from "react-icons/fa6";
import { IoMdFlower } from "react-icons/io";
import { SlTarget } from "react-icons/sl";
import type { MarkerIconDefinition } from "@/features/markers/domain/types";
import { MARKER_FEATURED_ICON_COUNT } from "@/features/markers/infrastructure/constants";

function createSvgIcon(id: string, label: string, component: IconType) {
  return {
    id,
    label,
    source: "predefined",
    kind: "svg",
    component,
    svgMarkup: renderToStaticMarkup(
      createElement(component, {
        size: 24,
        color: "currentColor",
        "aria-hidden": true,
      }),
    ),
  } satisfies MarkerIconDefinition;
}

function createImageIcon(id: string, label: string, sourcePath: string) {
  return {
    id,
    label,
    source: "predefined",
    kind: "image",
    dataUrl: sourcePath,
    tintWithMarkerColor: true,
  } satisfies MarkerIconDefinition;
}

export const predefinedMarkerIcons: MarkerIconDefinition[] = [
  createImageIcon("app-marker", "LocalMaps", "/assets/marker.svg"),
  createSvgIcon("pin", "Pin", FaLocationDot),
  createSvgIcon("heart", "Heart", FaHeart),
  createSvgIcon("home", "Home", FaHouse),
  createSvgIcon("star", "Star", FaStar),
  createSvgIcon("circle", "Circle", FaCircle),
  createSvgIcon("square", "Square", FaSquare),
  createSvgIcon("x", "X", FaXmark),
  createSvgIcon("target", "Target", SlTarget),
  createSvgIcon("sun", "Sun", FaSun),
  createSvgIcon("moon", "Moon", FaMoon),
  createSvgIcon("building", "Building", FaBuilding),
  createSvgIcon("send", "Send", FaPaperPlane),
  createSvgIcon("snowflake", "Snowflake", FaRegSnowflake),
  createSvgIcon("shop", "Shop", FaShop),
  createSvgIcon("camera", "Camera", FaCamera),
  createSvgIcon("flower", "Flower", IoMdFlower),
  createSvgIcon("tree", "Tree", FaTree),
  createSvgIcon("flag", "Flag", FaFlag),
  {
    id: "van",
    label: "Van",
    source: "predefined",
    kind: "svg",
    svgMarkup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 12.5V11a1 1 0 0 1 1-1h1V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3h1.2a2 2 0 0 1 1.6.8l2 2.67a1 1 0 0 1 .2.6V15a1 1 0 0 1-1 1h-1.05a2.5 2.5 0 0 1-4.9 0h-4.1a2.5 2.5 0 0 1-4.9 0H2a1 1 0 0 1-1-1v-2.5zM6.5 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM5 7v3h8V7H5z"/></svg>',
  } satisfies MarkerIconDefinition,
];

export const featuredMarkerIcons = predefinedMarkerIcons.slice(
  0,
  MARKER_FEATURED_ICON_COUNT,
);

export function getAllMarkerIcons(customIcons: MarkerIconDefinition[]) {
  return [...predefinedMarkerIcons, ...customIcons];
}

export function findMarkerIcon(
  iconId: string,
  customIcons: MarkerIconDefinition[],
) {
  return (
    getAllMarkerIcons(customIcons).find((icon) => icon.id === iconId) ?? null
  );
}
