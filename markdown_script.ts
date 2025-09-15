import { generateMarkdownFile } from "./tools";

async function main() {
  const result = await generateMarkdownFile({
    fileName: "COMMITS.md",
    content: `# Changelog\n\n- Added AI commit message generator\n- Implemented Markdown file creation tool`
  });

  console.log(result);
}

main();
