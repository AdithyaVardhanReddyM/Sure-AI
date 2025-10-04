// types.ts
import React from "react";

export type StyleObject = React.CSSProperties & {
  [key: string]: any;
};

export interface SocialIcon {
  icon: string;
  url?: string;
}

export type ElementType =
  | "Button"
  | "Text"
  | "Image"
  | "Logo"
  | "LogoHeader"
  | "Divider"
  | "SocialIcons"
  | "column";

export interface BaseElement {
  id: string;
  type: ElementType;
  style?: StyleObject;
  outerStyle?: StyleObject;
  numOfCol?: number;
  socialIcons?: SocialIcon[];
  url?: string;
  content?: string;
  textarea?: string;
  imageUrl?: string;
  alt?: string;
  [key: string]: any; // allow dynamic keys for column children
}
