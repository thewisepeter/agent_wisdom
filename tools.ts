import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import * as fs from 'fs/promises';

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

const commitMessageInput = z.object({
  rootDir: z.string().min(1).describe("The root directory to generate a commit message for"),
});

type CommitMessageInput = z.infer<typeof commitMessageInput>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export async function generateCommitMessage({ rootDir }: CommitMessageInput) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  if (diffs.length === 0) {
    return "No changes detected to generate a commit message.";
  }

  const diffContent = diffs.map(d => `File: ${d.file}\n${d.diff}`).join('\n\n');

  const result = await generateText({
    model: google("models/gemini-2.5-flash"),
    prompt: `Generate a concise and descriptive commit message based on the following code changes:\n\n${diffContent}\n\nCommit message:`,
    temperature: 0.7,
  });

  return result.text;
}

export const getFileChangesInDirectoryTool = tool({
    description: "Gets the code changes made in given directory",
    inputSchema: fileChange,
    execute: getFileChangesInDirectory,
  });

export const commitMessageGenerationTool = tool({
  description: "Generates a commit message based on the current code changes in the specified directory.",
  inputSchema: commitMessageInput,
  execute: generateCommitMessage,
});

const markdownFile = z.object({
  fileName: z.string().min(1).describe("The name of the markdown file to create (e.g., 'README.md')"),
  content: z.string().min(1).describe("The content of the markdown file"),
});

type MarkdownFile = z.infer<typeof markdownFile>;

export async function generateMarkdownFile({ fileName, content }: MarkdownFile) {
  try {
    await fs.writeFile(fileName, content);
    return `Markdown file '${fileName}' created successfully.`;
  } catch (error) {
    return `Error creating markdown file '${fileName}': ${error}`;
  }
}

export const generateMarkdownFileTool = tool({
  description: "Generates a markdown file with the specified name and content.",
  inputSchema: markdownFile,
  execute: generateMarkdownFile,
});