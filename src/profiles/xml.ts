import { createMarkupProfile } from "./common.js";

export const xml = createMarkupProfile({
    name: "xml",
    displayName: "XML",
    fileExtensions: [".xml", ".xsd", ".xsl", ".xslt", ".svg"],
    mimeTypes: ["application/xml", "text/xml", "image/svg+xml"],
});
