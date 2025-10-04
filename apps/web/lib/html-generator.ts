export function generateHtmlFromElements(elements: Element[]): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    img {
      max-width: 100%;
      height: auto;
      border: 0;
    }
    .button {
      display: inline-block;
      text-decoration: none;
    }
    .column-container {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10px;
    }
    .column {
      padding: 10px;
      box-sizing: border-box;
    }
    .column-1 { width: 100%; }
    .column-2 { width: 50%; }
    .column-3 { width: 33.333%; }
    .column-4 { width: 25%; }
    @media only screen and (max-width: 480px) {
      .mobile-responsive {
        width: 100% !important;
        height: auto !important;
      }
      .mobile-padding { padding: 10px !important; }
      .mobile-center { text-align: center !important; }
      .column { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0;">
<div class="container">
`;

  // Render single element
  const renderElement = (element: Element): string => {
    let elementHtml = "";

    switch (element.type) {
      case "Button": {
        const btn = element as ButtonElement;
        elementHtml += `  <div style="${styleObjectToString(btn.outerStyle)}">
    <a href="${btn.url || "#"}" class="button" style="${styleObjectToString(
      btn.style
    )}; display: inline-block; text-decoration: none;">${
      btn.content || "Button"
    }</a>
  </div>
`;
        break;
      }

      case "Text": {
        const txt = element as TextElement;
        elementHtml += `  <div style="${styleObjectToString(txt.outerStyle)}">
    <div style="${styleObjectToString(txt.style)}">${txt.textarea || ""}</div>
  </div>
`;
        break;
      }

      case "Image":
      case "Logo":
      case "LogoHeader": {
        const img = element as ImageElement;
        elementHtml += `  <div style="${styleObjectToString(img.outerStyle)}">
    <img src="${img.imageUrl || "/placeholder.svg"}" alt="${
      img.alt || "Image"
    }" style="${styleObjectToString(img.style)}" class="mobile-responsive" />
  </div>
`;
        break;
      }

      case "Divider": {
        const div = element as DividerElement;
        elementHtml += `  <hr style="${styleObjectToString(
          div.style
        )}; border: none; border-top: 1px solid #e2e8f0;" />
`;
        break;
      }

      case "SocialIcons": {
        const soc = element as SocialIconsElement;
        elementHtml += `  <div style="${styleObjectToString(
          soc.outerStyle
        )}" class="mobile-center">
`;
        if (soc.socialIcons && soc.socialIcons.length > 0) {
          soc.socialIcons.forEach((icon) => {
            elementHtml += `    <a href="${
              icon.url || "#"
            }" target="_blank" style="margin: 0 5px; display: inline-block;">
      <img src="${
        icon.icon || "/placeholder.svg"
      }" alt="Social Icon" width="${soc.style?.width || 40}" height="${
        soc.style?.height || 40
      }" />
    </a>
`;
          });
        }
        elementHtml += `  </div>
`;
        break;
      }

      default:
        elementHtml += `  <!-- Unknown element type: ${element.type} -->
`;
    }

    return elementHtml;
  };

  elements.forEach((element) => {
    if (element.type === "column") {
      const col = element as ColumnElement;

      html += `  <div class="column-container" style="margin-bottom: 20px;">
`;

      for (let i = 0; i < col.numOfCol; i++) {
        const columnClass = `column column-${col.numOfCol}`;
        html += `    <div class="${columnClass}">
`;

        const columnContent = col[i.toString()];
        if (columnContent) {
          html += renderElement(columnContent as Element);
        } else {
          html += `      <!-- Empty column ${i + 1} -->
`;
        }

        html += `    </div>
`;
      }

      html += `  </div>
`;
    } else {
      html += renderElement(element);
    }
  });

  html += `</div>
</body>
</html>`;

  return html;
}

// Utility
function styleObjectToString(styleObj?: StyleObject): string {
  if (!styleObj) return "";
  return Object.entries(styleObj)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      const styleValue = Array.isArray(value) ? value[0] : value;
      return `${kebabKey}: ${styleValue}`;
    })
    .join("; ");
}

export type StyleObject = {
  [key: string]: string | number | string[] | number[];
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
  type: ElementType;
  style?: StyleObject;
  outerStyle?: StyleObject;
}

export interface ButtonElement extends BaseElement {
  type: "Button";
  content?: string;
  url?: string;
}

export interface TextElement extends BaseElement {
  type: "Text";
  textarea?: string;
}

export interface ImageElement extends BaseElement {
  type: "Image" | "Logo" | "LogoHeader";
  imageUrl?: string;
  alt?: string;
  url?: string;
}

export interface DividerElement extends BaseElement {
  type: "Divider";
}

export interface SocialIconsElement extends BaseElement {
  type: "SocialIcons";
  socialIcons?: SocialIcon[];
}

export interface ColumnElement extends BaseElement {
  type: "column";
  numOfCol: number;
  [key: string]: any; // for holding column children (columnContent)
}

export type Element =
  | ButtonElement
  | TextElement
  | ImageElement
  | DividerElement
  | SocialIconsElement
  | ColumnElement;
