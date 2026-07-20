import sanitizeHtml from "sanitize-html";

// For rich text produced by TipTap: normal formatting only.
export const sanitizeRichText = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      span: ["class"],
      div: ["class"],
      code: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });

// For the ADMIN-only html-embed widget: wider allowlist, still no scripts.
export const sanitizeEmbed = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe", "video", "source", "svg", "path", "style"]),
    allowedAttributes: {
      "*": ["class", "id", "style", "width", "height", "aria-*", "role", "title"],
      a: ["href", "target", "rel"],
      img: ["src", "srcset", "alt", "loading"],
      iframe: ["src", "allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy"],
      video: ["src", "poster", "controls", "muted", "loop", "autoplay", "playsinline"],
      source: ["src", "type"],
      svg: ["viewBox", "fill", "xmlns"],
      path: ["d", "fill", "stroke"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
  });
