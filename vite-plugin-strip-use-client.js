// vite-plugin-strip-use-client.js
export default function stripUseClient() {
  return {
    name: "strip-use-client",
    enforce: "pre", // chạy sớm nhất
    transform(code, id) {
      // chỉ xử lý file trong node_modules của MUI
      if (id.includes("/node_modules/@mui/")) {
        return {
          code: code.replace(/^["']use client["'];?\s*/gm, ""),
          map: null,
        };
      }
      return null;
    },
  };
}
